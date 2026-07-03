import { LanderFooter } from '@/components/Lander/LanderFooter';
import { ContentCard } from '@/components/Article/ArticleCard';
import { DOCUMENTATION_LIST } from '@/data/documentation';
import '@/pages/Lander/landerPage.css';

export function DocsPage() {
    return (
        <div className="flex min-h-screen flex-col bg-[#0d0d0f] text-white">
            <main className="relative z-[1] mx-auto w-full max-w-[1080px] flex-1 px-4 pb-20 pt-24 md:px-6 md:pt-28">
                <header className="mb-8 md:mb-10">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                        Docs
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                        Documentation
                    </h1>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                        Passfolio의 프로젝트 문서와 발표 자료를 제공합니다.
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {DOCUMENTATION_LIST.map((doc) => (
                        <ContentCard
                            key={doc.id}
                            to={doc.href}
                            title={doc.title}
                            thumbnail={doc.thumbnail}
                            createdAt={doc.createdAt}
                        />
                    ))}
                </div>
            </main>

            <LanderFooter />
        </div>
    );
}
