import { useEffect, useSyncExternalStore } from 'react';
import { DECK_IMAGE_URLS } from './deckAssets';
import { DECK_FONT_SETS, ensureDeckFontStylesheet } from './deckFonts';

/** 죽은 에셋 하나가 진입을 영원히 막지 않도록 하는 백스톱 */
const PRELOAD_TIMEOUT_MS = 8000;

export type DeckPreloadState = {
    ready: boolean;
    loaded: number;
    total: number;
};

const TOTAL = DECK_IMAGE_URLS.length + DECK_FONT_SETS.length;

// 모듈 레벨 싱글턴 — StrictMode 이중 이펙트에서 프리로드 1회 보장,
// 재방문 시 게이트 즉시 통과(ready 유지).
let loadedCount = 0;
let done = false;
let started: Promise<void> | null = null;
let snapshot: DeckPreloadState = { ready: false, loaded: 0, total: TOTAL };
const subscribers = new Set<() => void>();

function notify() {
    snapshot = { ready: done, loaded: loadedCount, total: TOTAL };
    subscribers.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
}

function getSnapshot(): DeckPreloadState {
    return snapshot;
}

/** fetch뿐 아니라 디코드 캐시까지 워밍 — 슬라이드 도착 시 decode 태스크가 남지 않게 한다 */
function preloadImage(url: string): Promise<void> {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        img.decode().then(
            () => resolve(),
            () => {
                // decode() 미지원/실패 시 load 이벤트로 폴백 (에러도 resolve — 타임아웃이 백스톱)
                if (img.complete) {
                    resolve();
                    return;
                }
                img.onload = () => resolve();
                img.onerror = () => resolve();
            },
        );
    });
}

function startPreload(): Promise<void> {
    if (started) return started;
    started = (async () => {
        const bump = () => {
            loadedCount += 1;
            notify();
        };
        const tasks: Promise<unknown>[] = [
            ...DECK_IMAGE_URLS.map((url) => preloadImage(url).finally(bump)),
            ...DECK_FONT_SETS.map(([spec, sample]) =>
                ensureDeckFontStylesheet()
                    .then(() => document.fonts.load(spec, sample))
                    .then(
                        () => undefined,
                        () => undefined,
                    )
                    .finally(bump),
            ),
        ];
        const outcome = await Promise.race([
            Promise.allSettled(tasks).then(() => 'settled' as const),
            new Promise<'timeout'>((resolve) => {
                setTimeout(() => resolve('timeout'), PRELOAD_TIMEOUT_MS);
            }),
        ]);
        if (outcome === 'timeout') {
            console.warn(`[deck] preload timeout — ${TOTAL - loadedCount}/${TOTAL} tasks unfinished`);
        }
        done = true;
        notify();
    })();
    return started;
}

/**
 * 덱 진입 게이트용 프리로더 — 전 슬라이드 이미지(디코드 포함) + 폰트 세트를
 * 모두 로드한 뒤 ready를 올린다. enabled=false(print 모드)면 즉시 ready.
 */
export function useDeckPreload(enabled: boolean): DeckPreloadState {
    useEffect(() => {
        if (enabled) void startPreload();
    }, [enabled]);
    const state = useSyncExternalStore(subscribe, getSnapshot);
    return enabled ? state : { ready: true, loaded: state.loaded, total: state.total };
}
