import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from 'reveal.js';
import 'reveal.js/reveal.css';
import './deck/deck.css';
import { DECK_SLIDES, type SlideProps } from './deck/slides';

// StrictMode(mount→unmount→mount)에서 reveal 인스턴스의 비동기 initialize/destroy가
// 서로 겹치면 나중 인스턴스의 레이아웃을 이전 인스턴스의 destroy가 걷어낸다.
// 모듈 레벨 프라미스 체인으로 생성→init→파기 순서를 직렬화한다.
let revealLifecycle: Promise<void> = Promise.resolve();

const DECK_FONT_LINK_ID = 'pf-deck-fonts';
const DECK_FONT_HREF =
    'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Noto+Sans+KR:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap';

/** 슬라이드 전용 폰트(Poppins/Noto Sans KR/JetBrains Mono)를 덱 라우트에서만 로드 */
function useDeckFonts() {
    useEffect(() => {
        if (document.getElementById(DECK_FONT_LINK_ID)) return;
        const link = document.createElement('link');
        link.id = DECK_FONT_LINK_ID;
        link.rel = 'stylesheet';
        link.href = DECK_FONT_HREF;
        document.head.appendChild(link);
        // unmount 시 제거하지 않는다 — 재방문 대비 캐시 유지, 미사용 시 무해
    }, []);
}

export default function DeckPage() {
    const deckRootRef = useRef<HTMLDivElement>(null);
    // -1: 아직 어떤 슬라이드도 active가 아님 → 전 슬라이드 is-loading 상태로 첫 페인트
    const [activeIndex, setActiveIndex] = useState(-1);
    // 오버뷰 모드에선 전 슬라이드 썸네일이 보여야 하므로 일괄 활성화
    const [isOverview, setIsOverview] = useState(false);
    // reveal.js가 print-pdf 쿼리를 직접 감지하므로 동일 조건으로 print 뷰를 판별
    const isPrintView = useMemo(
        () => new URLSearchParams(window.location.search).has('print-pdf'),
        [],
    );

    useDeckFonts();

    useEffect(() => {
        const rootEl = deckRootRef.current!;
        let deck: InstanceType<typeof Reveal> | null = null;
        let cancelled = false;
        const onSlideChanged = (event: Event) => {
            setActiveIndex((event as unknown as { indexh: number }).indexh);
        };
        const onOverviewShown = () => setIsOverview(true);
        const onOverviewHidden = () => setIsOverview(false);

        revealLifecycle = revealLifecycle.then(async () => {
            if (cancelled) return;
            deck = new Reveal(rootEl, {
                width: 1920,
                height: 1080,
                margin: 0,
                hash: true,
                transition: 'fade',
                transitionSpeed: 'fast',
                controls: true,
                progress: true,
                overview: true,
                keyboard: true,
                touch: true,
                // 뷰포트 폭 435px 미만에서 자동 Scroll View 전환 방지 —
                // 모바일에서도 데스크탑과 동일한 scale-to-fit 고정 덱 유지
                scrollActivationWidth: 0,
            });
            await deck.initialize();
            if (cancelled) return; // 파기는 cleanup이 체인 뒤에서 수행
            setActiveIndex(deck.getIndices().h);
            deck.on('slidechanged', onSlideChanged);
            deck.on('overviewshown', onOverviewShown);
            deck.on('overviewhidden', onOverviewHidden);
        });

        return () => {
            cancelled = true;
            revealLifecycle = revealLifecycle.then(() => {
                if (!deck) return;
                deck.off('slidechanged', onSlideChanged);
                deck.off('overviewshown', onOverviewShown);
                deck.off('overviewhidden', onOverviewHidden);
                try {
                    deck.destroy();
                } catch {
                    /* reveal 내부 타이머 정리 중 예외는 무시 */
                }
                deck = null;
            });
        };
    }, []);

    return (
        <div className={`pf-deck${isPrintView ? ' pf-print' : ''}`}>
            {!isPrintView && (
                <Link to="/docs" className="pf-deck-exit" aria-label="발표 종료">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </Link>
            )}
            <div className="reveal" ref={deckRootRef}>
                <div className="slides">
                    {DECK_SLIDES.map((Slide, i) => (
                        <section key={i}>
                            <Slide isActive={isPrintView || isOverview || i === activeIndex} />
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}

export type { SlideProps };
