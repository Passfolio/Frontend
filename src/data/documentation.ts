import deckThumbnailSrc from '@/assets/deck/deck-thumbnail.webp';

/**
 * Documentation 페이지 정적 데이터 (서버리스).
 * 추후 문서가 늘어나면 이 배열에 항목을 추가한다.
 */
export type DocumentationItemType = {
    id: string;
    title: string;
    thumbnail: string;
    createdAt: string; // ISO
    href: string;
};

export const DOCUMENTATION_LIST: DocumentationItemType[] = [
    {
        id: 'passfolio-deck',
        title: 'Passfolio 서비스 소개 — Capstone Final Presentation',
        thumbnail: deckThumbnailSrc,
        createdAt: '2026-07-04',
        href: '/docs/passfolio-deck',
    },
];
