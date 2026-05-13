import { useCallback, useEffect, useRef, useState } from 'react';
import { listMyFileCdnUrls } from '@/api/File/fileApi';
import { uploadFileToS3 } from '@/utils/Article/uploadToS3';
import { isImageUrl, isPdfUrl } from '@/utils/Article/fileType';

// Admin Profile 전용 파일 업로드 테스트 도구.
// PDF/이미지 업로드 → 완료 후 GET /api/v1/files/me 응답을 그대로 표시한다.
// 디자인 wireframe: My File URLs(순수 URL 텍스트) + 렌더링 영역(URL 순서대로 image/PDF) + 파일 input.

const ACCEPTED_MIME_TYPES = 'image/*,application/pdf';

const isAcceptedFile = (file: File): boolean =>
    file.type.startsWith('image/') || file.type === 'application/pdf';

type UploadingItemType = {
    id: string;
    fileName: string;
    progress: number;
    status: 'uploading' | 'error';
    controller: AbortController;
};

const extractFileName = (url: string): string => {
    const lastSegment = url.split('?')[0].split('/').pop() ?? url;
    // 백엔드 키 패턴 `${uuid}__${original}` 에서 원본명 우선 추출
    const sepIndex = lastSegment.indexOf('__');
    return sepIndex >= 0 ? lastSegment.slice(sepIndex + 2) : lastSegment;
};

export function AdminFileUploadTestSection() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const abortControllersRef = useRef<Set<AbortController>>(new Set());

    const [cdnUrlList, setCdnUrlList] = useState<string[]>([]);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [fetchErrorMessage, setFetchErrorMessage] = useState<string | null>(null);
    const [uploadingItemList, setUploadingItemList] = useState<UploadingItemType[]>([]);

    const refreshMyFiles = useCallback(async () => {
        setIsFetching(true);
        setFetchErrorMessage(null);
        try {
            const data = await listMyFileCdnUrls();
            setCdnUrlList(Array.isArray(data.cdnUrls) ? data.cdnUrls : []);
        } catch {
            setFetchErrorMessage('파일 목록을 불러오지 못했습니다.');
        } finally {
            setIsFetching(false);
        }
    }, []);

    useEffect(() => {
        void refreshMyFiles();
    }, [refreshMyFiles]);

    // 언마운트 시 진행 중 업로드 모두 abort → multipart abort 연쇄
    useEffect(() => {
        return () => {
            abortControllersRef.current.forEach((c) => c.abort());
            abortControllersRef.current.clear();
        };
    }, []);

    const startUploadForFile = useCallback(
        (file: File) => {
            const tempId = crypto.randomUUID();
            const controller = new AbortController();
            abortControllersRef.current.add(controller);

            setUploadingItemList((prev) => [
                ...prev,
                {
                    id: tempId,
                    fileName: file.name,
                    progress: 0,
                    status: 'uploading',
                    controller,
                },
            ]);

            void (async () => {
                try {
                    await uploadFileToS3(file, {
                        signal: controller.signal,
                        onProgress: (percent) => {
                            setUploadingItemList((prev) =>
                                prev.map((item) =>
                                    item.id === tempId ? { ...item, progress: percent } : item,
                                ),
                            );
                        },
                    });
                    if (controller.signal.aborted) return;
                    setUploadingItemList((prev) => prev.filter((item) => item.id !== tempId));
                    await refreshMyFiles();
                } catch (error) {
                    if (controller.signal.aborted) return;
                    setUploadingItemList((prev) =>
                        prev.map((item) =>
                            item.id === tempId ? { ...item, status: 'error' } : item,
                        ),
                    );
                    console.warn('[Passfolio][Admin][upload] file upload failed', error);
                } finally {
                    abortControllersRef.current.delete(controller);
                }
            })();
        },
        [refreshMyFiles],
    );

    const handleFileInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const accepted = Array.from(e.target.files ?? []).filter(isAcceptedFile);
            accepted.forEach(startUploadForFile);
            e.target.value = '';
        },
        [startUploadForFile],
    );

    const handleFileButtonClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleClearError = useCallback((tempId: string) => {
        setUploadingItemList((prev) => prev.filter((item) => item.id !== tempId));
    }, []);

    return (
        <section
            aria-labelledby="admin-file-upload-test-heading"
            className="rounded-2xl border border-white/[0.08] bg-[#141518]/90 p-6"
        >
            <header className="mb-4">
                <h2
                    id="admin-file-upload-test-heading"
                    className="text-lg font-semibold text-white"
                >
                    File Upload Test
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                    PDF·이미지를 업로드하면 본인이 업로드한 파일들의 CDN URL을 최신 순으로 보여줍니다.
                </p>
            </header>

            <div className="flex flex-col gap-6">
                <div>
                    <p className="font-mono text-xs font-semibold uppercase tracking-widest text-zinc-400">
                        My File URLs
                    </p>
                    {isFetching && cdnUrlList.length === 0 ? (
                        <p className="mt-2 font-mono text-xs text-zinc-600">불러오는 중…</p>
                    ) : fetchErrorMessage ? (
                        <p role="alert" className="mt-2 font-mono text-xs text-red-400">
                            {fetchErrorMessage}
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
                    <p className="font-mono text-xs font-semibold uppercase tracking-widest text-zinc-400">
                        Rendering
                    </p>
                    {cdnUrlList.length === 0 ? (
                        <p className="mt-2 font-mono text-xs text-zinc-600">
                            렌더링할 파일이 없습니다.
                        </p>
                    ) : (
                        <div className="mt-3 flex flex-col gap-3">
                            {cdnUrlList.map((url) => (
                                <FilePreview key={url} url={url} />
                            ))}
                        </div>
                    )}
                </div>

                <hr className="border-white/[0.08]" />

                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={ACCEPTED_MIME_TYPES}
                        multiple
                        onChange={handleFileInputChange}
                        className="hidden"
                        aria-hidden
                        tabIndex={-1}
                    />
                    <button
                        type="button"
                        onClick={handleFileButtonClick}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-200 transition-colors hover:border-white/25 hover:bg-white/[0.08]"
                    >
                        File 업로드 (PDF · 이미지)
                    </button>

                    {uploadingItemList.length > 0 && (
                        <ul className="mt-3 list-none space-y-1 p-0 text-xs">
                            {uploadingItemList.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex items-center justify-between gap-2 rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2"
                                >
                                    <span
                                        className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-zinc-300"
                                        title={item.fileName}
                                    >
                                        {item.fileName}
                                    </span>
                                    {item.status === 'uploading' ? (
                                        <span className="shrink-0 tabular-nums text-amber-300/80">
                                            {item.progress}%
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => handleClearError(item.id)}
                                            className="shrink-0 rounded border border-red-500/30 bg-red-500/[0.08] px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-widest text-red-300 transition-colors hover:bg-red-500/[0.16]"
                                        >
                                            실패 · 닫기
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </section>
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
