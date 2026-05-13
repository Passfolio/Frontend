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
// 한 파일당 1훅. file === null이면 업로드 스킵(수정 페이지의 기존 파일 가드).
// StrictMode 이중 effect 대비: 세션 가드(uploadSessionRef) + 언마운트 시 Abort + S3 multipart abort.

export type UseS3UploadReturnType = {
    progress: number;
    status: MediaUploadStatusType;
    result: UploadFileResponseType | null;
    cancelUpload: () => Promise<void>;
};

export const useS3Upload = (
    file: File | null,
    _mediaRole: MediaRoleType = 'CONTENT',
    _sequence: number = 0,
): UseS3UploadReturnType => {
    const [progress, setProgress] = useState<number>(0);
    const [status, setStatus] = useState<MediaUploadStatusType>('PENDING');
    const [result, setResult] = useState<UploadFileResponseType | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);
    const uploadInfoRef = useRef<{ key: string; uploadId: string } | null>(null);
    const isAbortedRef = useRef<boolean>(false);
    /** effect 세션 식별 — cleanup 시 증가해 이전 세션의 비동기 setState를 무효화 */
    const uploadSessionRef = useRef(0);

    const cancelUpload = useCallback(async (): Promise<void> => {
        if (status === 'COMPLETED') return;

        isAbortedRef.current = true;
        setStatus('ABORTED');

        abortControllerRef.current?.abort();
        const info = uploadInfoRef.current;
        uploadInfoRef.current = null;
        if (info) {
            try {
                await abortMultipartUpload({
                    key: info.key,
                    uploadId: info.uploadId,
                });
            } catch {
                // BE 라이프사이클 정책이 백업 정리
            }
        }
    }, [status]);

    useEffect(() => {
        if (!file) {
            uploadSessionRef.current += 1;
            setProgress(0);
            setResult(null);
            setStatus('PENDING');
            return undefined;
        }

        const sessionAtStart = ++uploadSessionRef.current;
        const isStale = () => uploadSessionRef.current !== sessionAtStart;

        isAbortedRef.current = false;
        const controller = new AbortController();
        abortControllerRef.current = controller;
        uploadInfoRef.current = null;

        setStatus('UPLOADING');
        setProgress(0);

        void (async () => {
            try {
                const initResponse = await initiateMultipartUpload(
                    {
                        originalFileName: file.name,
                        mimeType: file.type,
                        fileSize: file.size,
                    },
                    { signal: controller.signal },
                );

                if (isStale() || isAbortedRef.current) return;

                uploadInfoRef.current = {
                    key: initResponse.key,
                    uploadId: initResponse.uploadId,
                };
                const { partPresignedUrls } = initResponse;

                let currentOffset = 0;
                const uploadPromises: Array<Promise<UploadedPartType>> = [];
                const progressMap: Record<number, number> = {};

                for (const part of partPresignedUrls) {
                    if (isStale() || isAbortedRef.current) break;

                    const end = currentOffset + part.contentLength;
                    const chunk = file.slice(currentOffset, end);
                    currentOffset = end;

                    const promise = uploadPartToS3(
                        part.presignedUrl,
                        chunk,
                        file.type,
                        controller.signal,
                        (pEvent: AxiosProgressEvent) => {
                            if (isStale() || isAbortedRef.current || pEvent.loaded == null) return;
                            progressMap[part.partNumber] = pEvent.loaded;
                            const totalLoaded = Object.values(progressMap).reduce((a, b) => a + b, 0);
                            const totalPercent = Math.round((totalLoaded / file.size) * 100);
                            setProgress(totalPercent);
                        },
                    ).then<UploadedPartType>((etag) => ({
                        partNumber: part.partNumber,
                        etag,
                    }));

                    uploadPromises.push(promise);
                }

                if (isStale() || isAbortedRef.current) return;

                const parts = await Promise.all(uploadPromises);

                if (isStale() || isAbortedRef.current) return;

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

                if (isStale() || isAbortedRef.current) return;

                console.info('[Passfolio][Article][fileUrls]', 'multipartComplete:uploadResult', {
                    cdnUrl: completeResponse.cdnUrl,
                    fileId: completeResponse.fileId,
                    filename: completeResponse.filename,
                });

                setResult(completeResponse);
                setStatus('COMPLETED');
                setProgress(100);
            } catch (error) {
                if (isStale()) return;

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
        })();

        return () => {
            uploadSessionRef.current += 1;
            isAbortedRef.current = true;
            abortControllerRef.current?.abort();
            const info = uploadInfoRef.current;
            uploadInfoRef.current = null;
            if (info) {
                void abortMultipartUpload({
                    key: info.key,
                    uploadId: info.uploadId,
                }).catch(() => {});
            }
        };
    }, [file]);

    return { progress, status, result, cancelUpload };
};
