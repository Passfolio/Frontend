import { useEffect, useState } from 'react';
import { getDailySignups } from '@/api/AdminPortal/adminUserApi';
import type { DailySignupType } from '@/types/user.type';

export type UseDailySignupsReturnType = {
    signupList: DailySignupType[];
    isLoading: boolean;
    errorMessage: string | null;
};

// 날짜별 가입자 수를 1회 조회. (엔드포인트 미배포 시 errorMessage로 안내)
export function useDailySignups(): UseDailySignupsReturnType {
    const [signupList, setSignupList] = useState<DailySignupType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        let isCancelled = false;
        setIsLoading(true);
        setErrorMessage(null);
        getDailySignups()
            .then((data) => {
                if (!isCancelled) setSignupList(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                if (!isCancelled) setErrorMessage('가입 추이를 불러오지 못했습니다. (엔드포인트 배포 여부를 확인하세요)');
            })
            .finally(() => {
                if (!isCancelled) setIsLoading(false);
            });
        return () => {
            isCancelled = true;
        };
    }, []);

    return { signupList, isLoading, errorMessage };
}
