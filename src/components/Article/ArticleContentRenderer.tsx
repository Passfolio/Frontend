import { useMemo } from 'react';
import { generateHTML, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { isImageUrl, isVideoUrl, isPdfUrl } from '@/utils/Article/fileType';
import { ArticleType } from '@/types/article.type';

type ArticleContentRendererProps = {
    contents: ArticleType['contents'];
    fileUrls: ArticleType['fileUrls'];
};

const TIPTAP_RENDER_EXTENSIONS = [
    StarterKit,
    Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
            class: 'max-w-full rounded-lg',
            referrerpolicy: 'no-referrer',
        },
    }),
];

const tryParseTipTapDoc = (raw: string): JSONContent | null => {
    const trimmed = raw.trim();
    if (!trimmed.startsWith('{')) return null;
    try {
        const parsed = JSON.parse(trimmed) as unknown;
        if (
            parsed &&
            typeof parsed === 'object' &&
            (parsed as JSONContent).type === 'doc' &&
            Array.isArray((parsed as JSONContent).content)
        ) {
            return parsed as JSONContent;
        }
    } catch {
        // not JSON
    }
    return null;
};

export function ArticleContentRenderer({ contents, fileUrls }: ArticleContentRendererProps) {
    const tiptapDoc = useMemo(() => (contents ? tryParseTipTapDoc(contents) : null), [contents]);

    const renderedHtml = useMemo(() => {
        if (!tiptapDoc) return null;
        try {
            return generateHTML(tiptapDoc, TIPTAP_RENDER_EXTENSIONS);
        } catch {
            return null;
        }
    }, [tiptapDoc]);

    if (renderedHtml !== null) {
        return (
            <div
                className="tiptap-rendered text-sm leading-relaxed text-zinc-200 [&_h1]:mb-2 [&_h1]:mt-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-white [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_p]:mb-3 [&_p]:break-words [&_p:empty]:mb-3 [&_p:empty]:h-[1.625em] [&_a]:text-sky-300 [&_a]:underline [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-0.5 [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em] [&_pre]:my-2 [&_pre]:rounded-lg [&_pre]:bg-black/40 [&_pre]:p-3 [&_pre]:text-[0.85em] [&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-lg"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
        );
    }

    // legacy: plain text + 별도 fileUrls
    return <LegacyContentRenderer contents={contents} fileUrls={fileUrls} />;
}

function LegacyContentRenderer({ contents, fileUrls }: ArticleContentRendererProps) {
    const attachmentUrlList = (fileUrls ?? [])
        .map((u) => (typeof u === 'string' ? u.trim() : ''))
        .filter((u) => u.length > 0);

    return (
        <div className="flex flex-col gap-6">
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-200">
                {contents}
            </p>

            {attachmentUrlList.length > 0 && (
                <div className="flex flex-col gap-4">
                    {attachmentUrlList.map((url, index) => (
                        <MediaEmbed key={`${url}-${index}`} url={url} />
                    ))}
                </div>
            )}
        </div>
    );
}

type MediaEmbedProps = {
    url: string;
};

function MediaEmbed({ url }: MediaEmbedProps) {
    if (isImageUrl(url)) {
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
            >
                <img
                    src={url}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="max-w-full rounded-lg object-contain"
                />
            </a>
        );
    }

    if (isVideoUrl(url)) {
        return (
            <video src={url} controls className="max-w-full rounded-lg" />
        );
    }

    if (isPdfUrl(url)) {
        const fileName = url.split('/').pop()?.split('?')[0] ?? '파일 다운로드';
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                download
                className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/[0.10]"
            >
                {fileName}
            </a>
        );
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/[0.10]"
        >
            {url.split('/').pop()?.split('?')[0] ?? url}
        </a>
    );
}
