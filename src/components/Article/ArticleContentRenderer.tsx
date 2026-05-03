import { isImageUrl, isVideoUrl, isPdfUrl } from '@/utils/Article/fileType';
import { ArticleType } from '@/types/article.type';

type ArticleContentRendererProps = {
    contents: ArticleType['contents'];
    fileUrls: ArticleType['fileUrls'];
};

export function ArticleContentRenderer({ contents, fileUrls }: ArticleContentRendererProps) {
    return (
        <div className="flex flex-col gap-6">
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-200">
                {contents}
            </p>

            {fileUrls.length > 0 && (
                <div className="flex flex-col gap-4">
                    {fileUrls.map((url, index) => (
                        <MediaEmbed key={index} url={url} />
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
            <a href={url} target="_blank" rel="noopener noreferrer">
                <img
                    src={url}
                    alt=""
                    className="max-w-full rounded-lg object-contain"
                />
            </a>
        );
    }

    if (isVideoUrl(url)) {
        return (
            <video
                src={url}
                controls
                className="max-w-full rounded-lg"
            />
        );
    }

    if (isPdfUrl(url)) {
        const fileName = url.split('/').pop()?.split('?')[0] ?? '파일 다운로드';
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
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
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/[0.10]"
        >
            {url.split('/').pop()?.split('?')[0] ?? url}
        </a>
    );
}
