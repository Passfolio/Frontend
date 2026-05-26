import { axiosInstance } from '@/api/Http/axiosInstance';
import { API_ENDPOINTS } from '@/api/Http/apiEndpoints';

export type AiJobStatus = 'PENDING' | 'DONE' | 'ERROR';

export type AiJobResponseType = {
    jobId: number;
};

export type AiJobStatusResponseType = {
    jobId: number;
    status: AiJobStatus;
    outputPdfS3Url: string | null;
    errorMessage: string | null;
};

// ① 포트폴리오 수정
export const postPortfolioFromPdf = async (fileId: number): Promise<AiJobResponseType> => {
    const { data } = await axiosInstance.post<AiJobResponseType>(
        API_ENDPOINTS.aiJobs.portfolioFromPdf,
        { fileId },
    );
    return data;
};

// ② 자기소개서 수정
export const postCoverLetterFromPdf = async (fileId: number): Promise<AiJobResponseType> => {
    const { data } = await axiosInstance.post<AiJobResponseType>(
        API_ENDPOINTS.aiJobs.coverLetterFromPdf,
        { fileId },
    );
    return data;
};

// ③ 포트폴리오 → 자기소개서 생성
export const postCoverLetterFromPortfolio = async (
    fileId: number,
    jobPosition: string,
    career: string,
): Promise<AiJobResponseType> => {
    const { data } = await axiosInstance.post<AiJobResponseType>(
        API_ENDPOINTS.aiJobs.coverLetterFromPortfolio,
        { fileId, jobPosition, career },
    );
    return data;
};

// ④ 자기소개서 → 포트폴리오 생성
export const postCoverLetterToPortfolio = async (
    fileId: number,
    jobPosition: string,
    career: string,
): Promise<AiJobResponseType> => {
    const { data } = await axiosInstance.post<AiJobResponseType>(
        API_ENDPOINTS.aiJobs.coverLetterToPortfolio,
        { fileId, jobPosition, career },
    );
    return data;
};

// 잡 상태 조회 (폴링용)
export const getAiJobStatus = async (jobId: number): Promise<AiJobStatusResponseType> => {
    const { data } = await axiosInstance.get<AiJobStatusResponseType>(
        API_ENDPOINTS.aiJobs.status(jobId),
    );
    return data;
};
