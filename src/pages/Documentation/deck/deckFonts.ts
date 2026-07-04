const DECK_FONT_LINK_ID = 'pf-deck-fonts';

// Poppins 300: serviceIntroSlide의 .plus/.eq가 font-weight 300을 사용 (원본 덱 의도)
const DECK_FONT_HREF =
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Noto+Sans+KR:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap';

let stylesheetPromise: Promise<void> | null = null;

/** 덱 폰트 stylesheet 주입 (idempotent). 실패 시에도 resolve — 프리로드 게이트를 잠그지 않는다. */
export function ensureDeckFontStylesheet(): Promise<void> {
    if (stylesheetPromise) return stylesheetPromise;
    stylesheetPromise = new Promise((resolve) => {
        if (document.getElementById(DECK_FONT_LINK_ID)) {
            resolve();
            return;
        }
        const link = document.createElement('link');
        link.id = DECK_FONT_LINK_ID;
        link.rel = 'stylesheet';
        link.href = DECK_FONT_HREF;
        link.onload = () => resolve();
        link.onerror = () => resolve();
        document.head.appendChild(link);
        // unmount 시 제거하지 않는다 — 재방문 대비 캐시 유지, 미사용 시 무해
    });
    return stylesheetPromise;
}

// Noto Sans KR은 unicode-range 서브셋 분할이라 한글 샘플이 있어야 실제 서브셋이 다운로드된다
const KR_SAMPLE = '패스폴리오 발표 자료';
const LATIN_SAMPLE = 'Passfolio 0123456789';

/** document.fonts.load()에 넘길 (폰트 스펙, 샘플 텍스트) 목록 — DECK_FONT_HREF 선언과 1:1 */
export const DECK_FONT_SETS: ReadonlyArray<readonly [spec: string, sample: string]> = [
    ...([300, 400, 500, 600, 700, 800] as const).map(
        (w) => [`${w} 1rem Poppins`, LATIN_SAMPLE] as const,
    ),
    ...([400, 500, 600, 700, 800] as const).map(
        (w) => [`${w} 1rem "Noto Sans KR"`, KR_SAMPLE] as const,
    ),
    ...([500, 600] as const).map((w) => [`${w} 1rem "JetBrains Mono"`, LATIN_SAMPLE] as const),
];
