import { DECK_IMAGE_URLS } from './deckAssets';
import { ensureDeckFontStylesheet } from './deckFonts';

let warmed = false;

/**
 * DocsPage에서 덱 진입 인텐트(호버/터치) 시 사전 워밍 — JS 청크 + 폰트 stylesheet +
 * 이미지 fetch. 디코드는 진입 게이트(useDeckPreload)가 수행하므로 여기선 fetch만.
 */
export function warmDeck(): void {
    if (warmed) return;
    warmed = true;
    void import('../DeckPage');
    void ensureDeckFontStylesheet();
    for (const url of DECK_IMAGE_URLS) {
        new Image().src = url;
    }
}
