import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from 'reveal.js';
import 'reveal.js/reveal.css';
import './deck/deck.css';
import { DECK_SLIDES, type SlideProps } from './deck/slides';
import { DeckLoadingOverlay } from './deck/DeckLoadingOverlay';
import { ensureDeckFontStylesheet } from './deck/deckFonts';
import { useDeckPreload } from './deck/useDeckPreload';

// StrictMode(mount→unmount→mount)에서 reveal 인스턴스의 비동기 initialize/destroy가
// 서로 겹치면 나중 인스턴스의 레이아웃을 이전 인스턴스의 destroy가 걷어낸다.
// 모듈 레벨 프라미스 체인으로 생성→init→파기 순서를 직렬화한다.
let revealLifecycle: Promise<void> = Promise.resolve();

export default function DeckPage() {
    const deckRootRef = useRef<HTMLDivElement>(null);
    const deckInstanceRef = useRef<InstanceType<typeof Reveal> | null>(null);
    // -1: 아직 어떤 슬라이드도 active가 아님 → 전 슬라이드 is-loading 상태로 첫 페인트
    const [activeIndex, setActiveIndex] = useState(-1);
    // 오버뷰 모드에선 전 슬라이드 썸네일이 보여야 하므로 일괄 활성화
    const [isOverview, setIsOverview] = useState(false);
    // reveal.js가 print-pdf 쿼리를 직접 감지하므로 동일 조건으로 print 뷰를 판별
    const isPrintView = useMemo(
        () => new URLSearchParams(window.location.search).has('print-pdf'),
        [],
    );

    // 프리로더도 폰트를 주입하지만, 게이트가 꺼지는 print 모드를 위해 무조건 1회 보장
    useEffect(() => {
        void ensureDeckFontStylesheet();
    }, []);

    // ---- 진입 게이트: 전 슬라이드 이미지·폰트가 로드될 때까지 오버레이로 막고,
    //      그 뒤에서 reveal을 먼저 init해 착지 슬라이드의 레이어를 미리 래스터화한다.
    const gateEnabled = !isPrintView;
    const { ready, loaded, total } = useDeckPreload(gateEnabled);
    const [revealInitialized, setRevealInitialized] = useState(false);
    const [gateOpen, setGateOpen] = useState(!gateEnabled);
    const [overlayGone, setOverlayGone] = useState(!gateEnabled);
    const gateOpenRef = useRef(!gateEnabled);
    // 해시(#/n) 딥링크 포함, 게이트 오픈 시 엔트런스를 재생할 착지 슬라이드
    const landedIndexRef = useRef<number | null>(null);

    useEffect(() => {
        const rootEl = deckRootRef.current!;
        let deck: InstanceType<typeof Reveal> | null = null;
        let cancelled = false;
        const onSlideChanged = (event: Event) => {
            const indexh = (event as unknown as { indexh: number }).indexh;
            // 게이트 오픈 전 내비게이션은 착지 인덱스만 갱신 — 엔트런스가 몰래 소모되지 않게
            if (!gateOpenRef.current) {
                landedIndexRef.current = indexh;
                return;
            }
            setActiveIndex(indexh);
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
                // 게이트 오픈 전 키보드 내비/오버뷰 진입 차단 (오픈 시 configure로 복원)
                keyboard: !gateEnabled,
                touch: true,
                // 뷰포트 폭 435px 미만에서 자동 Scroll View 전환 방지 —
                // 모바일에서도 데스크탑과 동일한 scale-to-fit 고정 덱 유지
                scrollActivationWidth: 0,
            });
            await deck.initialize();
            if (cancelled) return; // 파기는 cleanup이 체인 뒤에서 수행
            deckInstanceRef.current = deck;
            landedIndexRef.current = deck.getIndices().h;
            setRevealInitialized(true);
            deck.on('slidechanged', onSlideChanged);
            deck.on('overviewshown', onOverviewShown);
            deck.on('overviewhidden', onOverviewHidden);
        });

        return () => {
            cancelled = true;
            revealLifecycle = revealLifecycle.then(() => {
                if (!deck) return;
                deckInstanceRef.current = null;
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 게이트 오픈: 프리로드 + reveal init 완료 → 한 프레임 뒤(is-loading 상태가 페인트된 후)
    // 오버레이 페이드와 함께 착지 슬라이드의 엔트런스를 재생한다.
    useEffect(() => {
        if (!ready || !revealInitialized || gateOpen) return;
        const raf = requestAnimationFrame(() => {
            gateOpenRef.current = true;
            setGateOpen(true);
            setActiveIndex(landedIndexRef.current ?? 0);
            deckInstanceRef.current?.configure({ keyboard: true });
        });
        return () => cancelAnimationFrame(raf);
    }, [ready, revealInitialized, gateOpen]);

    // 오버레이는 페이드(0.35s)가 끝난 뒤 언마운트
    useEffect(() => {
        if (!gateOpen || overlayGone) return;
        const timer = setTimeout(() => setOverlayGone(true), 400);
        return () => clearTimeout(timer);
    }, [gateOpen, overlayGone]);

    // 근접 슬라이드(현재 ±1)에만 pf-near를 붙여 엔트런스 요소의 컴포지터 레이어를
    // 사전 승격한다. reveal이 section 클래스(present/past/future)를 직접 관리하므로
    // React className이 아닌 classList로만 조작한다.
    useEffect(() => {
        const rootEl = deckRootRef.current;
        if (!rootEl || isPrintView) return;
        const center = activeIndex >= 0 ? activeIndex : (landedIndexRef.current ?? 0);
        const sections = rootEl.querySelectorAll<HTMLElement>('.slides > section');
        sections.forEach((el, i) => {
            el.classList.toggle('pf-near', Math.abs(i - center) <= 1);
        });
    }, [activeIndex, revealInitialized, isPrintView]);

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
            {gateEnabled && !overlayGone && (
                <DeckLoadingOverlay loaded={loaded} total={total} dismissed={gateOpen} />
            )}
        </div>
    );
}

export type { SlideProps };
