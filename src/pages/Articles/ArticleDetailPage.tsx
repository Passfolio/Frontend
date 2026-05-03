import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LanderFooter } from '@/components/Lander/LanderFooter';
import { ArticleContentRenderer } from '@/components/Article/ArticleContentRenderer';
import { ArticleAdminToolbar } from '@/components/Article/ArticleAdminToolbar';
import { getArticleById } from '@/api/Article/articleApi';
import type { ArticleType } from '@/types/article.type';
import '@/pages/Lander/landerPage.css';

export function ArticleDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [article, setArticle] = useState<ArticleType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isNotFound, setIsNotFound] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const articleId = Number(id);

    useEffect(() => {
        if (!id || isNaN(articleId)) {
            setIsNotFound(true);
            setIsLoading(false);
            return;
        }

        let cancelled = false;

        const fetchArticle = async () => {
            setIsLoading(true);
            setError(null);
            setIsNotFound(false);
            try {
                const data = await getArticleById(articleId);
                if (!cancelled) {
                    setArticle(data);
                }
            } catch (err: unknown) {
                if (cancelled) return;
                const status = (err as { response?: { status?: number } })?.response?.status;
                if (status === 404) {
                    setIsNotFound(true);
                } else {
                    setError('아티클을 불러오는 중 오류가 발생했습니다.');
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        fetchArticle();

        return () => {
            cancelled = true;
        };
    }, [articleId, id]);

    return (
        <div
            className="flex min-h-screen flex-col bg-[#0d0d0f] text-white"
            style={{
                backgroundImage: [
                    'linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px)',
                    'linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px)',
                ].join(', '),
                backgroundSize: '40px 40px',
                backgroundPosition: 'center top',
            }}
        >
            <div
                className="pointer-events-none fixed inset-0 z-0"
                style={{
                    background: [
                        'radial-gradient(ellipse 60% 40% at 20% 10%, rgba(255,255,255,0.04) 0%, transparent 70%)',
                        'radial-gradient(ellipse 40% 30% at 80% 85%, rgba(255,255,255,0.025) 0%, transparent 70%)',
                    ].join(', '),
                }}
            />

            <main className="relative z-[1] mx-auto w-full max-w-[720px] flex-1 px-4 pb-20 pt-24 md:px-6 md:pt-28">
                {isLoading && (
                    <div className="flex min-h-[240px] items-center justify-center">
                        <p className="text-sm text-zinc-500">불러오는 중...</p>
                    </div>
                )}

                {!isLoading && isNotFound && (
                    <div className="flex min-h-[240px] flex-col items-center justify-center gap-4">
                        <p className="text-sm text-zinc-400">아티클을 찾을 수 없습니다.</p>
                        <button
                            type="button"
                            onClick={() => navigate('/articles')}
                            className="rounded-lg border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/[0.10]"
                        >
                            목록으로 돌아가기
                        </button>
                    </div>
                )}

                {!isLoading && error && (
                    <div
                        className="flex min-h-[240px] items-center justify-center rounded-2xl border border-white/[0.09]"
                        style={{
                            background: 'rgba(18,18,22,0.92)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.09), 0 4px 24px -6px rgba(0,0,0,0.5)',
                        }}
                    >
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {!isLoading && !isNotFound && !error && article && (
                    <>
                        <header className="mb-8 flex flex-col gap-4 md:mb-10">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div className="flex-1">
                                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                                        Article
                                    </p>
                                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                                        {article.title}
                                    </h1>
                                </div>
                                <ArticleAdminToolbar mode="detail" articleId={article.id} />
                            </div>

                            <div className="flex items-center gap-3 border-b border-white/[0.08] pb-6">
                                <p className="text-xs text-zinc-500">
                                    {article.writerNickname ?? '알 수 없음'}
                                </p>
                                <span className="text-zinc-700">·</span>
                                <p className="text-xs text-zinc-500">
                                    {new Date(article.createdAt).toLocaleDateString('ko-KR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                        </header>

                        <ArticleContentRenderer
                            contents={article.contents}
                            fileUrls={article.fileUrls}
                        />

                        <div className="mt-12 border-t border-white/[0.08] pt-6">
                            <button
                                type="button"
                                onClick={() => navigate('/articles')}
                                className="text-sm text-zinc-500 transition-colors hover:text-white"
                            >
                                ← 목록으로 돌아가기
                            </button>
                        </div>
                    </>
                )}
            </main>

            <LanderFooter />
        </div>
    );
}
