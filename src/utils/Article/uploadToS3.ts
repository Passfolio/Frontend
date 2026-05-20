import type { AxiosProgressEvent } from 'axios';
import {
    abortMultipartUpload,
    completeMultipartUpload,
    initiateMultipartUpload,
    uploadPartToS3,
} from '@/api/File/fileApi';
import type {
    ActionTypeValue,
    DocumentTypeValue,
    UploadFileResponseType,
    UploadedPartType,
} from '@/types/file.type';

// TipTap 에디터 핸들러처럼 React 훅 컨텍스트 밖에서 호출되는 일반 비동기 흐름용.
// useS3Upload(훅) 로직을 재구현하지 않고 fileApi 4종을 직접 호출한다.
// abort/error 시 multipart 세션은 반드시 abort 호출로 정리한다.

export type UploadFileToS3Options = {
    signal: AbortSignal;
    onProgress?: (percent: number) => void;
    documentType?: DocumentTypeValue;
    actionType?: ActionTypeValue;
};

const isAbortLikeError = (error: unknown): boolean => {
    const name = (error as { name?: string } | null)?.name ?? '';
    return name === 'AbortError' || name === 'CanceledError';
};

export const uploadFileToS3 = async (
    file: File,
    opts: UploadFileToS3Options,
): Promise<UploadFileResponseType> => {
    const { signal, onProgress, documentType, actionType } = opts;

    let multipartContext: { key: string; uploadId: string } | null = null;
    const cleanupAbortedSession = () => {
        const ctx = multipartContext;
        multipartContext = null;
        if (!ctx) return;
        // 실패해도 사용자 흐름은 진행 — S3 라이프사이클 정책이 백업 정리
        void abortMultipartUpload({ key: ctx.key, uploadId: ctx.uploadId }).catch(() => {});
    };

    try {
        const initResponse = await initiateMultipartUpload(
            {
                originalFileName: file.name,
                mimeType: file.type,
                fileSize: file.size,
            },
            { signal },
        );

        multipartContext = { key: initResponse.key, uploadId: initResponse.uploadId };

        const { partPresignedUrls } = initResponse;
        const progressMap: Record<number, number> = {};
        let currentOffset = 0;

        const uploadPromises: Array<Promise<UploadedPartType>> = partPresignedUrls.map((part) => {
            const end = currentOffset + part.contentLength;
            const chunk = file.slice(currentOffset, end);
            currentOffset = end;

            return uploadPartToS3(
                part.presignedUrl,
                chunk,
                file.type,
                signal,
                (pEvent: AxiosProgressEvent) => {
                    if (pEvent.loaded == null) return;
                    progressMap[part.partNumber] = pEvent.loaded;
                    if (!onProgress) return;
                    const totalLoaded = Object.values(progressMap).reduce((a, b) => a + b, 0);
                    onProgress(Math.min(100, Math.round((totalLoaded / file.size) * 100)));
                },
            ).then<UploadedPartType>((etag) => ({
                partNumber: part.partNumber,
                etag,
            }));
        });

        const parts = await Promise.all(uploadPromises);

        const completeResponse = await completeMultipartUpload(
            {
                key: initResponse.key,
                uploadId: initResponse.uploadId,
                parts,
                originalFileName: file.name,
                fileSize: file.size,
                mimeType: file.type,
                documentType,
                actionType,
            },
            { signal },
        );

        // 정상 완료 — 세션 abort 불필요
        multipartContext = null;
        onProgress?.(100);
        return completeResponse;
    } catch (error) {
        cleanupAbortedSession();
        if (isAbortLikeError(error) || signal.aborted) {
            const abortError = new Error('upload aborted');
            abortError.name = 'AbortError';
            throw abortError;
        }
        throw error;
    }
};
