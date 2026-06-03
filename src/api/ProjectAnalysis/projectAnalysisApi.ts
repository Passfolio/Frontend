import { axiosInstance } from '@/api/Http/axiosInstance';
import { API_ENDPOINTS } from '@/api/Http/apiEndpoints';
import type {
    PrecheckItemType,
    PrecheckStartResponseType,
    AnalysisStartResponseType,
    AnalysisBatchStatusType,
    AnalysisHistoryItemType,
} from '@/types/userProjectAnalysis.type';
import type { AnalysisReportResponseType } from '@/types/analysisReport.type';

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

// 분석 시작(AVAILABLE repo, ≤3). mode 기본 NONSTOP. phone(선택)=완료 SMS(transient).
// NONSTOP 포트폴리오: fileId(업로드 PDF 파일 ID — 소유권 검증·CDN URL 생성은 서버) + portfolioPurpose(EDIT|GENERATE).
export const postStartAnalysis = async (
    repoUrlList: string[],
    mode?: string,
    phone?: string,
    fileId?: number,
    portfolioPurpose?: string,
): Promise<AnalysisStartResponseType> => {
    const { data } = await axiosInstance.post<AnalysisStartResponseType>(
        API_ENDPOINTS.projectAnalysis.start,
        { repoUrls: repoUrlList, mode, phone, fileId, portfolioPurpose },
    );
    return data;
};

// NONSTOP 포폴 핸드오프 수동 재시도(자동 핸드오프가 FastAPI 장애로 실패한 본인 배치 복구).
// 성공 후 getUserBatchStatus로 새 portfolioJobId를 읽는다.
export const retryPortfolioHandoff = async (batchId: string): Promise<void> => {
    await axiosInstance.post(API_ENDPOINTS.projectAnalysis.retryPortfolio(batchId));
};

// 본인 배치의 repo별 상태(진행중 페이지 초기 로드 + 안전 폴링). 타인 batch는 BE에서 차단.
export const getUserBatchStatus = async (batchId: string): Promise<AnalysisBatchStatusType> => {
    const { data } = await axiosInstance.get<AnalysisBatchStatusType>(
        API_ENDPOINTS.projectAnalysis.batchStatus(batchId),
    );
    return data;
};

// 본인 분석 이력(최근순). 프로필 '분석 이력' 탭.
export const getAnalysisHistory = async (): Promise<AnalysisHistoryItemType[]> => {
    const { data } = await axiosInstance.get<AnalysisHistoryItemType[]>(
        API_ENDPOINTS.projectAnalysis.history,
    );
    return Array.isArray(data) ? data : [];
};

// 본인 단건 리포트(리포트 페이지). BE가 CDN 결과 JSON을 서버사이드 fetch해 report에 인라인 반환.
// 타인 분석은 BE에서 차단. status≠DONE이거나 fetch 실패 시 report=null.
export const getUserAnalysisReport = async (analysisId: string): Promise<AnalysisReportResponseType> => {
    const { data } = await axiosInstance.get<AnalysisReportResponseType>(
        API_ENDPOINTS.projectAnalysis.report(analysisId),
    );
    return data;
};
