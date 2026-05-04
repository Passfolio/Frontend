import { isImageUrl, isVideoUrl, isPdfUrl } from '@/utils/Article/fileType';
import { ArticleType } from '@/types/article.type';

type ArticleContentRendererProps = {
    contents: ArticleType['contents'];
    fileUrls: ArticleType['fileUrls'];
};

export function ArticleContentRenderer({ contents, fileUrls }: ArticleContentRendererProps) {
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
