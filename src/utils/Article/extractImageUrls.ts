import type { JSONContent } from '@tiptap/react';

// TipTap JSON 트리에서 image 노드의 src를 등장 순서(깊이 우선 좌→우)로 수집한다.
// blob:/data:는 업로드 미완료 placeholder이므로 제외 — 제출 가드(uploadingCount===0)와 이중 안전망.
// 백엔드는 fileUrls의 첫 image URL을 thumbnail로 자동 추출하므로 순서가 의미를 갖는다.

const isHttpUrl = (src: unknown): src is string =>
    typeof src === 'string' && (src.startsWith('http://') || src.startsWith('https://'));

const collect = (node: JSONContent | undefined, out: string[]): void => {
    if (!node) return;
    if (node.type === 'image') {
        const src = node.attrs?.src;
        if (isHttpUrl(src)) out.push(src);
    }
    const children = node.content;
    if (!children || children.length === 0) return;
    for (const child of children) collect(child, out);
};

export const extractImageUrls = (doc: JSONContent | null | undefined): string[] => {
    if (!doc) return [];
    const collected: string[] = [];
    collect(doc, collected);
    // 등장 순서를 유지하면서 중복 제거
    return Array.from(new Set(collected));
};
