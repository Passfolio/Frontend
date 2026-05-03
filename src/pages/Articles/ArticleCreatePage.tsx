import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanderFooter } from '@/components/Lander/LanderFooter';
import { ArticleEditorForm } from '@/components/Article/ArticleEditorForm';
import { createArticle } from '@/api/Article/articleApi';
import type { ArticleCreateRequestType } from '@/types/article.type';
import '@/pages/Lander/landerPage.css';

export function ArticleCreatePage() {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleSubmit = async (body: ArticleCreateRequestType) => {
        setSubmitting(true);
        setSubmitError(null);
        try {
            const article = await createArticle(body);
            navigate(`/articles/${article.id}`, { replace: true });
        } catch {
            setSubmitError('게시 중 오류가 발생했습니다. 다시 시도해 주세요.');
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
                <header className="mb-8 md:mb-10">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                        Article
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                        새 글 작성
                    </h1>
                </header>

                {submitError && (
                    <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                        <p className="text-sm text-red-400">{submitError}</p>
                    </div>
                )}

                <ArticleEditorForm
                    mode="create"
                    onSubmit={handleSubmit}
                    submitting={submitting}
                />

                <div className="mt-8 border-t border-white/[0.08] pt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/articles')}
                        className="text-sm text-zinc-500 transition-colors hover:text-white"
                    >
                        ← 목록으로 돌아가기
                    </button>
                </div>
            </main>

            <LanderFooter />
        </div>
    );
}
