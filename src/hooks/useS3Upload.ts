import { useCallback, useEffect, useRef, useState } from 'react';
import type { AxiosProgressEvent } from 'axios';
import {
    abortMultipartUpload,
    completeMultipartUpload,
    initiateMultipartUpload,
    uploadPartToS3,
} from '@/api/File/fileApi';
import type {
    MediaRoleType,
    MediaUploadStatusType,
    UploadFileResponseType,
    UploadedPartType,
} from '@/types/file.type';

// uploading-s3-multipart 스킬 reference 구현체의 TypeScript 포팅.
// 한 파일당 1훅. 마운트 시 자동 시작, file === null이면 업로드 스킵(수정 페이지의 기존 파일 가드).
// 파트 업로드는 BE가 결정한 contentLength로 슬라이스 후 Promise.all 병렬 PUT.
// 취소는 AbortController(in-flight 중단) + 서버 abort(S3 멀티파트 세션 정리) 동시 호출.

export type UseS3UploadReturnType = {
    progress: number;
    status: MediaUploadStatusType;
    result: UploadFileResponseType | null;
    cancelUpload: () => Promise<void>;
};

export const useS3Upload = (
    file: File | null,
    // mediaRole/sequence는 스킬 reference 시그니처를 보존(향후 BE 스키마 확장 대비)하되,
    // 본 레포 T02 타입(MultipartInitiateRequestType / MultipartCompleteRequestType)에는
    // 해당 필드가 없으므로 BE 페이로드에 포함시키지 않는다. 역할/순서는 article의 fileUrls[]
    // 배열 순서로 표현된다(design Decisions §3, T05 entry §Decisions 3 동일 결정).
    _mediaRole: MediaRoleType = 'CONTENT',
    _sequence: number = 0,
): UseS3UploadReturnType => {
    const [progress, setProgress] = useState<number>(0);
    const [status, setStatus] = useState<MediaUploadStatusType>('PENDING');
    const [result, setResult] = useState<UploadFileResponseType | null>(null);

    // ref들: state 비동기성 race 방지 + abort 신호 전파
    const abortControllerRef = useRef<AbortController | null>(null);
    const uploadInfoRef = useRef<{ key: string; uploadId: string } | null>(null);
    const isAbortedRef = useRef<boolean>(false);

    const startUpload = useCallback(async () => {
        if (!file) return; // 수정 페이지의 기존 파일(file=null) 가드
        setStatus('UPLOADING');
        setProgress(0);
        isAbortedRef.current = false;
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            // 1) 초기화 — BE가 key/uploadId/partPresignedUrls(+contentLength) 결정
            const initResponse = await initiateMultipartUpload(
                {
                    originalFileName: file.name,
                    mimeType: file.type,
                    fileSize: file.size,
                },
                { signal: controller.signal },
            );

            if (isAbortedRef.current) return;

            uploadInfoRef.current = {
                key: initResponse.key,
                uploadId: initResponse.uploadId,
            };
            const { partPresignedUrls } = initResponse;

            // 2) 파트별 업로드(병렬). FE에 CHUNK_SIZE 상수 두지 말 것 — BE contentLength 사용.
            let currentOffset = 0;
            const uploadPromises: Array<Promise<UploadedPartType>> = [];
            const progressMap: Record<number, number> = {}; // partNumber → loaded bytes

            for (const part of partPresignedUrls) {
                if (isAbortedRef.current) break;

                const end = currentOffset + part.contentLength;
                const chunk = file.slice(currentOffset, end);
                currentOffset = end;

                const promise = uploadPartToS3(
                    part.presignedUrl,
                    chunk,
                    file.type, // initiate에 보낸 mimeType과 동일해야 S3 서명 통과
                    controller.signal,
                    (pEvent: AxiosProgressEvent) => {
                        if (!isAbortedRef.current && pEvent.loaded != null) {
                            progressMap[part.partNumber] = pEvent.loaded;
                            const totalLoaded = Object.values(progressMap).reduce(
                                (a, b) => a + b,
                                0,
                            );
                            const totalPercent = Math.round(
                                (totalLoaded / file.size) * 100,
                            );
                            setProgress(totalPercent);
                        }
                    },
                ).then<UploadedPartType>((etag) => ({
                    partNumber: part.partNumber,
                    etag,
                }));

                uploadPromises.push(promise);
            }

            if (isAbortedRef.current) return;

            // ⚠ Promise.all: 1파트 실패 = 전체 ERROR (재시도 미구현 — 스킬 함정 참조)
            const parts = await Promise.all(uploadPromises);

            if (isAbortedRef.current) return;

            // 3) 완료 — fileId/cdnUrl/mediaType 수신
            const completeResponse = await completeMultipartUpload(
                {
                    key: initResponse.key,
                    uploadId: initResponse.uploadId,
                    parts,
                    originalFileName: file.name,
                    fileSize: file.size,
                    mimeType: file.type,
                },
                { signal: controller.signal },
            );

            if (!isAbortedRef.current) {
                setResult(completeResponse);
                setStatus('COMPLETED');
                setProgress(100);
            }
        } catch (error) {
            const errName = (error as { name?: string } | null)?.name;
            if (
                errName === 'AbortError' ||
                errName === 'CanceledError' ||
                isAbortedRef.current
            ) {
                setStatus('ABORTED');
            } else {
                if (!isAbortedRef.current) setStatus('ERROR');
            }
        }
    }, [file]);

    const cancelUpload = useCallback(async (): Promise<void> => {
        if (status === 'COMPLETED') return; // 완료된 파일은 별도 삭제 API 필요(취소 불가)

        isAbortedRef.current = true;
        setStatus('ABORTED');

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        if (uploadInfoRef.current) {
            try {
                await abortMultipartUpload({
                    key: uploadInfoRef.current.key,
                    uploadId: uploadInfoRef.current.uploadId,
                });
            } catch {
                // BE 라이프사이클 정책이 백업 정리 — 사용자 흐름은 진행
            }
        }
    }, [status]);

    // 마운트 시 자동 시작. 언마운트 시 자동 abort 안 함 — 사용자 의도(cancel 버튼)에 맡김.
    useEffect(() => {
        startUpload();
    }, [startUpload]);

    return { progress, status, result, cancelUpload };
};
