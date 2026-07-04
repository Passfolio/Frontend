// 덱 안에서 '@/assets/deck/*'를 import하는 유일한 모듈 — 슬라이드는 반드시
// 이 매니페스트를 거쳐 에셋을 참조한다. 프리로더(DECK_IMAGE_URLS)가
// 전 슬라이드의 에셋을 빠짐없이 커버함을 구조적으로 보장하기 위함.
import analysisWorkflowSrc from '@/assets/deck/analysis-workflow-v3.webp';
import architectureSrc from '@/assets/deck/architecture.webp';
import crumpledWoodSrc from '@/assets/deck/crumpled-wood.webp';
import logoSrc from '@/assets/deck/passfolio-logo-cropped.svg';
import portfolioWorkflowSrc from '@/assets/deck/portfolio-workflow-v2.webp';
import thinkerSrc from '@/assets/deck/thinker.webp';

export const DECK_ASSETS = {
    analysisWorkflowSrc,
    architectureSrc,
    crumpledWoodSrc,
    logoSrc,
    portfolioWorkflowSrc,
    thinkerSrc,
} as const;

export const DECK_IMAGE_URLS: readonly string[] = Object.values(DECK_ASSETS);
