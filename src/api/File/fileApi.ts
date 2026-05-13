import axios, { type AxiosProgressEvent, type AxiosRequestConfig } from 'axios';
import { axiosInstance } from '@/api/Http/axiosInstance';
import { API_ENDPOINTS } from '@/api/Http/apiEndpoints';
import type {
    MultipartInitiateRequestType,
    MultipartInitiateResponseType,
    MultipartCompleteRequestType,
    MultipartAbortRequestType,
    MyFileCdnUrlsResponseType,
    UploadFileResponseType,
} from '@/types/file.type';

// S3 PUT 전용 인스턴스 — axiosInstance의 baseURL/withCredentials/Authorization 컨텍스트가
// S3 도메인으로 새어나가지 않도록 격리한다. (uploading-s3-multipart 스킬 핵심 원칙 #3)
const s3Axios = axios.create();

// 1. 멀티파트 업로드 초기화
//    BE가 S3 객체 키, uploadId, 파트별 presignedUrl + contentLength를 한 번에 반환.
export const initiateMultipartUpload = async (
    req: MultipartInitiateRequestType,
    config?: AxiosRequestConfig,
): Promise<MultipartInitiateResponseType> => {
    const { data } = await axiosInstance.post<MultipartInitiateResponseType>(
        API_ENDPOINTS.files.multipart.initiate,
        req,
        config,
    );
    return data;
};

// 2. S3 Presigned URL로 파트 PUT (BE 거치지 않고 S3 직접)
//    - Content-Type은 initiate에서 보낸 mimeType과 동일해야 S3 서명 통과
//    - ETag는 응답 헤더에 따옴표 포함 문자열로 옴 → 따옴표 제거해 BE에 제출 (스킬 컨벤션)
export const uploadPartToS3 = async (
    presignedUrl: string,
    chunk: Blob,
    contentType: string,
    signal?: AbortSignal,
    onProgress?: (event: AxiosProgressEvent) => void,
): Promise<string> => {
    const response = await s3Axios.put(presignedUrl, chunk, {
        headers: { 'Content-Type': contentType },
        signal,
        onUploadProgress: (progressEvent) => {
            if (onProgress) onProgress(progressEvent);
        },
    });
    const etag = (response.headers['etag'] || response.headers['ETag'] || '') as string;
    return etag.replace(/"/g, '');
};

// 3. 멀티파트 업로드 완료 — BE가 S3 CompleteMultipartUpload 후 DB 레코드 생성
//    응답: UploadFileResponse — fileId/cdnUrl/mediaType 포함
export const completeMultipartUpload = async (
    req: MultipartCompleteRequestType,
    config?: AxiosRequestConfig,
): Promise<UploadFileResponseType> => {
    const { data } = await axiosInstance.post<UploadFileResponseType>(
        API_ENDPOINTS.files.multipart.complete,
        req,
        config,
    );
    return data;
};

// 4. 멀티파트 업로드 취소 — 사용자 cancel 또는 업로드 중 컴포넌트 언마운트 시 호출
//    실패해도 사용자 흐름은 진행되어야 한다 (S3 라이프사이클 정책이 백업 정리)
export const abortMultipartUpload = async (
    req: MultipartAbortRequestType,
): Promise<void> => {
    await axiosInstance.post(API_ENDPOINTS.files.multipart.abort, req);
};

// 5. 현재 인증된 사용자의 업로드 CDN URL 목록 (최신 업로드 순)
export const listMyFileCdnUrls = async (): Promise<MyFileCdnUrlsResponseType> => {
    const { data } = await axiosInstance.get<MyFileCdnUrlsResponseType>(
        API_ENDPOINTS.files.me,
    );
    return data;
};
