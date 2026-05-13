import { isImageUrl, isPdfUrl } from '@/utils/Article/fileType';

const RENDERING_PREVIEW_LIMIT = 3;

const extractFileName = (url: string): string => {
    const lastSegment = url.split('?')[0].split('/').pop() ?? url;
    // 백엔드 키 패턴 `${uuid}__${original}` 에서 원본명 우선 추출
    const sepIndex = lastSegment.indexOf('__');
    return sepIndex >= 0 ? lastSegment.slice(sepIndex + 2) : lastSegment;
};

type MyFilesViewProps = {
    cdnUrlList: string[];
    isFetching: boolean;
    errorMessage: string | null;
};

export function MyFilesView({ cdnUrlList, isFetching, errorMessage }: MyFilesViewProps) {
    const previewList = cdnUrlList.slice(0, RENDERING_PREVIEW_LIMIT);
    const hiddenCount = Math.max(0, cdnUrlList.length - previewList.length);

    return (
        <div className="flex flex-col gap-6">
            <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    My File URLs
                </p>
                {isFetching && cdnUrlList.length === 0 ? (
                    <p className="mt-2 font-mono text-xs text-zinc-600">불러오는 중…</p>
                ) : errorMessage ? (
                    <p role="alert" className="mt-2 font-mono text-xs text-red-400">
                        {errorMessage}
                    </p>
                ) : cdnUrlList.length === 0 ? (
                    <p className="mt-2 font-mono text-xs text-zinc-600">
                        업로드한 파일이 없습니다.
                    </p>
                ) : (
                    <ul className="mt-2 list-none space-y-1 p-0 font-mono text-xs text-zinc-300">
                        {cdnUrlList.map((url) => (
                            <li
                                key={url}
                                className="overflow-hidden text-ellipsis whitespace-nowrap"
                                title={url}
                            >
                                - {url}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <hr className="border-white/[0.08]" />

            <div>
                <div className="flex items-baseline justify-between gap-3">
                    <p className="font-mono text-xs font-semibold uppercase tracking-widest text-zinc-400">
                        Rendering (Top {RENDERING_PREVIEW_LIMIT})
                    </p>
                    {hiddenCount > 0 && (
                        <p className="font-mono text-[0.65rem] text-zinc-600">
                            +{hiddenCount}건은 위 URL 목록에서 확인
                        </p>
                    )}
                </div>
                {previewList.length === 0 ? (
                    <p className="mt-2 font-mono text-xs text-zinc-600">
                        렌더링할 파일이 없습니다.
                    </p>
                ) : (
                    <div className="mt-3 flex flex-col gap-3">
                        {previewList.map((url) => (
                            <FilePreview key={url} url={url} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

type FilePreviewProps = {
    url: string;
};

function FilePreview({ url }: FilePreviewProps) {
    if (isImageUrl(url)) {
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                className="block overflow-hidden rounded-xl border border-white/[0.12] bg-white/[0.04]"
            >
                <img
                    src={url}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="max-h-[320px] w-full object-contain"
                />
            </a>
        );
    }

    if (isPdfUrl(url)) {
        const fileName = extractFileName(url);
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                download
                className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-sm text-white transition-colors hover:border-white/25 hover:bg-white/[0.08]"
            >
                <span className="truncate" title={fileName}>
                    {fileName}
                </span>
                <span className="shrink-0 rounded border border-white/[0.10] bg-white/[0.06] px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-widest text-zinc-400">
                    PDF
                </span>
            </a>
        );
    }

    const fileName = extractFileName(url);
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            className="flex items-center gap-3 rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-sm text-zinc-300 transition-colors hover:border-white/25 hover:bg-white/[0.08]"
        >
            <span className="truncate" title={fileName}>
                {fileName}
            </span>
        </a>
    );
}
