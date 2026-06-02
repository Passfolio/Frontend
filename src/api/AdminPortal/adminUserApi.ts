import { axiosInstance } from '@/api/Http/axiosInstance';
import { API_ENDPOINTS } from '@/api/Http/apiEndpoints';
import type {
    DailySignupType,
    UserSummaryType,
    PageListResponseType,
} from '@/types/user.type';
import type { PrecheckStartResponseType } from '@/types/userProjectAnalysis.type';

// ADMIN 전용: 공개 repo(≤5) 사전 점검 테스트(토큰 불필요). useRepoPrecheck dispatcher로 주입.
export const postAdminPrecheck = async (repoUrlList: string[]): Promise<PrecheckStartResponseType> => {
    const { data } = await axiosInstance.post<PrecheckStartResponseType>(
        API_ENDPOINTS.adminProjectAnalysis.precheckTest,
        { repoUrls: repoUrlList },
    );
    return data;
};

// ADMIN 전용: 날짜별 가입자 수(사용자 유입 그래프). createdAt 기준 일별 집계(오름차순).
export const getDailySignups = async (): Promise<DailySignupType[]> => {
    const { data } = await axiosInstance.get<DailySignupType[]>(
        API_ENDPOINTS.adminUsers.signupsDaily,
    );
    return data;
};

// ADMIN 전용: 회원 목록(페이지네이션). 우선 userId·nickname.
export const getUserList = async (
    page: number,
    size: number,
): Promise<PageListResponseType<UserSummaryType>> => {
    const { data } = await axiosInstance.get<PageListResponseType<UserSummaryType>>(
        API_ENDPOINTS.adminUsers.list,
        { params: { page, size } },
    );
    return data;
};
