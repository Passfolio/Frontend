import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';

// blob: URL 으로 임시 삽입된 placeholder 이미지에는 업로드 진행을 알리는 spinner overlay 를 띄운다.
// http(s) URL 로 교체된 이후에는 일반 이미지처럼 렌더링.

const isPlaceholderSrc = (src: unknown): boolean =>
    typeof src === 'string' && src.startsWith('blob:');

export function ImageNodeView({ node, selected }: NodeViewProps) {
    const src = node.attrs.src as string | undefined;
    const alt = (node.attrs.alt as string | undefined) ?? '';
    const isUploading = isPlaceholderSrc(src);

    return (
        <NodeViewWrapper
            as="div"
            className={`relative my-3 inline-block max-w-full ${selected ? 'ring-2 ring-white/40' : ''}`}
            data-uploading={isUploading ? 'true' : undefined}
        >
            {src ? (
                <img
                    src={src}
                    alt={alt}
                    referrerPolicy="no-referrer"
                    className={`max-w-full rounded-lg ${isUploading ? 'opacity-60' : ''}`}
                    draggable={false}
                />
            ) : null}

            {isUploading && (
                <div
                    className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-black/40"
                    role="status"
                    aria-label="이미지 업로드 중"
                >
                    <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3 py-1.5">
                        <span
                            className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                            aria-hidden
                        />
                        <span className="text-xs font-medium text-white">업로드 중…</span>
                    </div>
                </div>
            )}
        </NodeViewWrapper>
    );
}
