import { useSearchParams } from 'react-router-dom';
import { LanderFooter } from '@/components/Lander/LanderFooter';
import { ArticleListGrid } from '@/components/Article/ArticleListGrid';
import { ArticlePagination } from '@/components/Article/ArticlePagination';
import { ArticleAdminToolbar } from '@/components/Article/ArticleAdminToolbar';
import { useArticleList } from '@/hooks/useArticleList';
import '@/pages/Lander/landerPage.css';

const PAGE_SIZE = 9;

export function ArticleListPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    // URL ?page=1 (1-based) → BE page=0 (0-based)
    const pageParam = parseInt(searchParams.get('page') ?? '1', 10);
    const currentPage = Math.max(0, isNaN(pageParam) ? 0 : pageParam - 1);

    const { data, isLoading, error } = useArticleList(currentPage, PAGE_SIZE);

    const handlePageChange = (nextPage: number) => {
        setSearchParams({ page: String(nextPage + 1) });
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

            <main className="relative z-[1] mx-auto w-full max-w-[1080px] flex-1 px-4 pb-20 pt-24 md:px-6 md:pt-28">
                <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:mb-10">
                    <div>
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                            Article
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                            아티클
                        </h1>
                        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                            서비스 소식과 유용한 정보를 전달합니다.
                        </p>
                    </div>
                    <ArticleAdminToolbar mode="list" />
                </header>

                {isLoading && (
                    <div className="flex min-h-[240px] items-center justify-center">
                        <p className="text-sm text-zinc-500">불러오는 중...</p>
                    </div>
                )}

                {!isLoading && error && (
                    <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-white/[0.09]"
                        style={{
                            background: 'rgba(18,18,22,0.92)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.09), 0 4px 24px -6px rgba(0,0,0,0.5)',
                        }}
                    >
                        <p className="text-sm text-red-400">{error.message}</p>
                    </div>
                )}

                {!isLoading && !error && data && (
                    <>
                        <ArticleListGrid articles={data.content} />

                        {data.page.totalPages > 1 && (
                            <div className="mt-10">
                                <ArticlePagination
                                    page={currentPage}
                                    totalPages={data.page.totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </>
                )}
            </main>

            <LanderFooter />
        </div>
    );
}
