import { useState, useEffect } from 'react';
import { listArticles } from '@/api/Article/articleApi';
import type { ArticleListResponseType } from '@/types/article.type';

export function useArticleList(
    page: number,
    size: number,
    sort = 'createdAt',
    direction = 'DESC',
) {
    const [data, setData] = useState<ArticleListResponseType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let cancelled = false;

        const fetch = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await listArticles({ page, size, sort, direction });
                if (!cancelled) {
                    setData(result);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.'));
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        fetch();

        return () => {
            cancelled = true;
        };
    }, [page, size, sort, direction]);

    return { data, isLoading, error };
}
