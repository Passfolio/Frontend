// BE FileDto 1:1 미러 + FE 전용 상태 머신 타입

export type MediaRoleType = 'PREVIEW' | 'CONTENT';

export type MediaUploadStatusType = 'PENDING' | 'UPLOADING' | 'COMPLETED' | 'ERROR' | 'ABORTED';

// BE FileDto.PartPresignedUrl 미러
export type PartPresignedUrlType = {
    partNumber: number;
    presignedUrl: string;
    contentLength: number;
};

// BE FileDto.MultipartUploadInitiateRequest 미러
export type MultipartInitiateRequestType = {
    originalFileName: string;
    mimeType?: string;
    fileSize: number;
};

// BE FileDto.MultipartUploadInitiateResponse 미러
export type MultipartInitiateResponseType = {
    key: string;
    uploadId: string;
    contentType: string;
    partCount: number;
    partPresignedUrls: PartPresignedUrlType[];
};

// BE FileDto.Part 미러 (CompleteMultipartUploadRequest 내 파트 식별 정보)
export type UploadedPartType = {
    partNumber: number;
    etag: string;
};

// BE FileDto.CompleteMultipartUploadRequest 미러
export type MultipartCompleteRequestType = {
    key: string;
    uploadId: string;
    parts: UploadedPartType[];
    originalFileName: string;
    fileSize: number;
    mimeType?: string;
};

// BE FileDto.MultipartUploadAbortRequest 미러
export type MultipartAbortRequestType = {
    key: string;
    uploadId: string;
};

// BE FileDto.UploadFileResponse 미러
export type UploadFileResponseType = {
    fileId: number;
    filename: string;
    cdnUrl: string;
    fileSize: number;
    mediaType: string;
    status: string;
};

// FE 전용 — 업로드 상태 머신 항목
export type MediaItemType = {
    id: string;
    file: File | null;
    status: MediaUploadStatusType;
    serverData: UploadFileResponseType | null;
};
