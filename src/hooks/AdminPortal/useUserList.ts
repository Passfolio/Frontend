import { useEffect, useState } from 'react';
import { getUserList } from '@/api/AdminPortal/adminUserApi';
import type { PageListResponseType, UserSummaryType } from '@/types/user.type';

const PAGE_SIZE = 10;

export type UseUserListReturnType = {
    page: number;
    setPage: (page: number) => void;
    pageData: PageListResponseType<UserSummaryType> | null;
    isLoading: boolean;
    errorMessage: string | null;
    pageSize: number;
};

// 회원 목록(페이지네이션). page 변경 시 재조회.
export function useUserList(): UseUserListReturnType {
    const [page, setPage] = useState<number>(0);
    const [pageData, setPageData] = useState<PageListResponseType<UserSummaryType> | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        let isCancelled = false;
        setIsLoading(true);
        setErrorMessage(null);
        getUserList(page, PAGE_SIZE)
            .then((data) => {
                if (!isCancelled) setPageData(data);
            })
            .catch(() => {
                if (!isCancelled) setErrorMessage('회원 목록을 불러오지 못했습니다. (엔드포인트 배포 여부를 확인하세요)');
            })
            .finally(() => {
                if (!isCancelled) setIsLoading(false);
            });
        return () => {
            isCancelled = true;
        };
    }, [page]);

    return { page, setPage, pageData, isLoading, errorMessage, pageSize: PAGE_SIZE };
}
