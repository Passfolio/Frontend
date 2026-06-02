import { axiosInstance } from '@/api/Http/axiosInstance';
import { API_ENDPOINTS } from '@/api/Http/apiEndpoints';
import type {
    PrecheckItemType,
    PrecheckStartResponseType,
    AnalysisStartResponseType,
    AnalysisBatchStatusType,
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

// 분석 시작(AVAILABLE repo, ≤3). mode 기본 NONSTOP. phone(선택)=완료 SMS 수신 번호(DB 미저장·transient).
export const postStartAnalysis = async (
    repoUrlList: string[],
    mode?: string,
    phone?: string,
): Promise<AnalysisStartResponseType> => {
    const { data } = await axiosInstance.post<AnalysisStartResponseType>(
        API_ENDPOINTS.projectAnalysis.start,
        { repoUrls: repoUrlList, mode, phone },
    );
    return data;
};

// 본인 배치의 repo별 상태(진행중 페이지 초기 로드 + 안전 폴링). 타인 batch는 BE에서 차단.
export const getUserBatchStatus = async (batchId: string): Promise<AnalysisBatchStatusType> => {
    const { data } = await axiosInstance.get<AnalysisBatchStatusType>(
        API_ENDPOINTS.projectAnalysis.batchStatus(batchId),
    );
    return data;
};
