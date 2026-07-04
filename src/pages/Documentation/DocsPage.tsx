import { useEffect } from 'react';
import { LanderFooter } from '@/components/Lander/LanderFooter';
import { ContentCard } from '@/components/Article/ArticleCard';
import { DOCUMENTATION_LIST } from '@/data/documentation';
import { warmDeck } from './deck/deckWarmup';
import '@/pages/Lander/landerPage.css';

const DECK_DOC_ID = 'passfolio-deck';

export function DocsPage() {
    // 유휴 시간에 덱 JS 청크(reveal.js + 슬라이드)를 미리 당겨 라우트 진입 지연 제거.
    // 이미지·폰트까지 당기는 warmDeck은 카드에 인텐트(호버/터치)가 있을 때만.
    useEffect(() => {
        // Safari 등 requestIdleCallback 미지원 브라우저는 setTimeout 폴백
        if (typeof window.requestIdleCallback === 'function') {
            const id = window.requestIdleCallback(() => void import('./DeckPage'));
            return () => window.cancelIdleCallback(id);
        }
        const id = window.setTimeout(() => void import('./DeckPage'), 1500);
        return () => window.clearTimeout(id);
    }, []);

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
                    {DOCUMENTATION_LIST.map((doc) =>
                        doc.id === DECK_DOC_ID ? (
                            // grid: 셀 높이를 카드에 그대로 전달 (다른 카드와 동일 높이 유지)
                            <div key={doc.id} className="grid" onPointerEnter={warmDeck} onPointerDown={warmDeck}>
                                <ContentCard
                                    to={doc.href}
                                    title={doc.title}
                                    thumbnail={doc.thumbnail}
                                    createdAt={doc.createdAt}
                                />
                            </div>
                        ) : (
                            <ContentCard
                                key={doc.id}
                                to={doc.href}
                                title={doc.title}
                                thumbnail={doc.thumbnail}
                                createdAt={doc.createdAt}
                            />
                        ),
                    )}
                </div>
            </main>

            <LanderFooter />
        </div>
    );
}
