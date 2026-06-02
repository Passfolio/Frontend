import { axiosInstance } from '@/api/Http/axiosInstance';
import { API_ENDPOINTS } from '@/api/Http/apiEndpoints';
import type {
    PrecheckItemType,
    PrecheckStartResponseType,
    AnalysisStartResponseType,
} from '@/types/userProjectAnalysis.type';

// 선택 repo(≤5) 사전 점검 시작. 결과는 SSE/폴링으로 갱신.
export const postRepoPrecheck = async (repoUrlList: string[]): Promise<PrecheckStartResponseType> => {
    const { data } = await axiosInstance.post<PrecheckStartResponseType>(
        API_ENDPOINTS.projectAnalysis.precheck,
        { repoUrls: repoUrlList },
    );
    return data;
};

// 현재 사용자의 repo별 점검 상태 목록.
export const getRepoPrecheckStatus = async (): Promise<PrecheckItemType[]> => {
    const { data } = await axiosInstance.get<PrecheckItemType[]>(
        API_ENDPOINTS.projectAnalysis.precheck,
    );
    return Array.isArray(data) ? data : [];
};

// 분석 시작(AVAILABLE repo, ≤3). mode 기본 NONSTOP.
export const postStartAnalysis = async (
    repoUrlList: string[],
    mode?: string,
): Promise<AnalysisStartResponseType> => {
    const { data } = await axiosInstance.post<AnalysisStartResponseType>(
        API_ENDPOINTS.projectAnalysis.start,
        { repoUrls: repoUrlList, mode },
    );
    return data;
};
