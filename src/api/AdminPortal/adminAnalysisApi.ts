import { axiosInstance } from '@/api/Http/axiosInstance';
import { API_ENDPOINTS } from '@/api/Http/apiEndpoints';
import type {
    AdminTestBatchResponseType,
    AdminTestLimitResponseType,
    AdminBatchStatusResponseType,
} from '@/types/projectAnalysis.type';

// ADMIN 전용: 공개 repo 목록을 테스트 배치로 디스패치(토큰 없이, mode=STEP).
// 인증은 axiosInstance(withCredentials) 쿠키 JWT로 처리, 역할 검증은 BE assertAdmin.
// githubUsername 지정 시(단건 정밀 테스트) 그 핸들을 정확 해석(dominant 미사용) — 미지정이면 repo owner + dominant.
export const dispatchAdminTestBatch = async (
    repoUrlList: string[],
    mode?: string,
    githubUsername?: string,
): Promise<AdminTestBatchResponseType> => {
    const { data } = await axiosInstance.post<AdminTestBatchResponseType>(
        API_ENDPOINTS.adminProjectAnalysis.testBatch,
        { repoUrls: repoUrlList, mode, githubUsername },
    );
    return data;
};

// ADMIN 전용: 호출 계정의 디스패치 한도(슬라이더 상한). privileged=300, 그 외=11.
export const getAdminTestLimit = async (): Promise<AdminTestLimitResponseType> => {
    const { data } = await axiosInstance.get<AdminTestLimitResponseType>(
        API_ENDPOINTS.adminProjectAnalysis.testBatchLimit,
    );
    return data;
};

// ADMIN 전용: 배치 상태 폴링(5초 주기). batchId로 묶인 분석들의 상태 레벨 집계 반환.
export const getAdminBatchStatus = async (
    batchId: string,
): Promise<AdminBatchStatusResponseType> => {
    const { data } = await axiosInstance.get<AdminBatchStatusResponseType>(
        API_ENDPOINTS.adminProjectAnalysis.batchStatus(batchId),
    );
    return data;
};
