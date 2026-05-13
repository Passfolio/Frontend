import { useCallback, useEffect, useState } from 'react';
import { listMyFileCdnUrls } from '@/api/File/fileApi';

export type UseMyFileCdnUrlsReturnType = {
    cdnUrlList: string[];
    isFetching: boolean;
    errorMessage: string | null;
    refresh: () => Promise<void>;
};

// AdminTestPage 에서 view 전환 시 fetch 가 중복되지 않도록 page 레벨에서 호출하고
// children(view 컴포넌트)에 결과/refresh 콜백을 props 로 전달하는 형태로 사용한다.
export function useMyFileCdnUrls(): UseMyFileCdnUrlsReturnType {
    const [cdnUrlList, setCdnUrlList] = useState<string[]>([]);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setIsFetching(true);
        setErrorMessage(null);
        try {
            const data = await listMyFileCdnUrls();
            setCdnUrlList(Array.isArray(data.cdnUrls) ? data.cdnUrls : []);
        } catch {
            setErrorMessage('파일 목록을 불러오지 못했습니다.');
        } finally {
            setIsFetching(false);
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    return { cdnUrlList, isFetching, errorMessage, refresh };
}
