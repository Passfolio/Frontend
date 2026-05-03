import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LanderFooter } from '@/components/Lander/LanderFooter';
import { ArticleEditorForm } from '@/components/Article/ArticleEditorForm';
import { getArticleById, updateArticle } from '@/api/Article/articleApi';
import type { ArticleType, ArticleUpdateRequestType } from '@/types/article.type';
import '@/pages/Lander/landerPage.css';

export function ArticleEditPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [article, setArticle] = useState<ArticleType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isNotFound, setIsNotFound] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

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
            setLoadError(null);
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
                    setLoadError('아티클을 불러오는 중 오류가 발생했습니다.');
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

    const handleSubmit = async (body: ArticleUpdateRequestType) => {
        if (!article) return;
        setSubmitting(true);
        setSubmitError(null);
        try {
            const updated = await updateArticle(article.id, body);
            navigate(`/articles/${updated.id}`, { replace: true });
        } catch {
            setSubmitError('수정 중 오류가 발생했습니다. 다시 시도해 주세요.');
            setSubmitting(false);
        }
    };

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

                {!isLoading && loadError && (
                    <div
                        className="flex min-h-[240px] items-center justify-center rounded-2xl border border-white/[0.09]"
                        style={{
                            background: 'rgba(18,18,22,0.92)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.09), 0 4px 24px -6px rgba(0,0,0,0.5)',
                        }}
                    >
                        <p className="text-sm text-red-400">{loadError}</p>
                    </div>
                )}

                {!isLoading && !isNotFound && !loadError && article && (
                    <>
                        <header className="mb-8 md:mb-10">
                            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                                Article
                            </p>
                            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                                글 수정
                            </h1>
                        </header>

                        {submitError && (
                            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                                <p className="text-sm text-red-400">{submitError}</p>
                            </div>
                        )}

                        <ArticleEditorForm
                            mode="edit"
                            initial={article}
                            onSubmit={handleSubmit}
                            submitting={submitting}
                        />

                        <div className="mt-8 border-t border-white/[0.08] pt-6">
                            <button
                                type="button"
                                onClick={() => navigate(`/articles/${article.id}`)}
                                className="text-sm text-zinc-500 transition-colors hover:text-white"
                            >
                                ← 상세로 돌아가기
                            </button>
                        </div>
                    </>
                )}
            </main>

            <LanderFooter />
        </div>
    );
}
