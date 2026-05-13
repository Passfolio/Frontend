import { useCallback, useEffect, useRef, useState } from 'react';
import { uploadFileToS3 } from '@/utils/Article/uploadToS3';
import type { UploadFileResponseType } from '@/types/file.type';

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

type CompletedItemType = {
    id: string;
    fileName: string;
    cdnUrl: string;
};

type FileUploadViewProps = {
    onUploaded: () => void | Promise<void>;
};

export function FileUploadView({ onUploaded }: FileUploadViewProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const abortControllersRef = useRef<Set<AbortController>>(new Set());
    const [uploadingItemList, setUploadingItemList] = useState<UploadingItemType[]>([]);
    const [completedItemList, setCompletedItemList] = useState<CompletedItemType[]>([]);

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
                    const result: UploadFileResponseType = await uploadFileToS3(file, {
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
                    // 진행 중 리스트에서 제거 + 완료 리스트에 (최신 먼저) 추가
                    setUploadingItemList((prev) => prev.filter((item) => item.id !== tempId));
                    setCompletedItemList((prev) => [
                        { id: tempId, fileName: file.name, cdnUrl: result.cdnUrl },
                        ...prev,
                    ]);
                    await onUploaded();
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
        [onUploaded],
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

    const handleClearCompleted = useCallback(() => {
        setCompletedItemList([]);
    }, []);

    return (
        <div className="flex flex-col gap-4">
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
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-6 text-sm font-medium text-zinc-200 transition-colors hover:border-white/25 hover:bg-white/[0.08]"
            >
                File 업로드 (PDF · 이미지)
            </button>
            <p className="text-xs text-zinc-600">
                업로드 후 My Files 탭에서 전체 목록을 확인할 수 있습니다.
            </p>

            {uploadingItemList.length > 0 && (
                <ul className="list-none space-y-1 p-0 text-xs">
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

            {completedItemList.length > 0 && (
                <div
                    className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4"
                    role="status"
                    aria-live="polite"
                >
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-emerald-300">
                            Upload Complete! ({completedItemList.length})
                        </p>
                        <button
                            type="button"
                            onClick={handleClearCompleted}
                            className="rounded border border-white/[0.10] bg-white/[0.04] px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-widest text-zinc-400 transition-colors hover:border-white/20 hover:bg-white/[0.08]"
                        >
                            전체 지우기
                        </button>
                    </div>
                    <ul className="mt-3 list-none space-y-1.5 p-0 text-xs">
                        {completedItemList.map((item) => (
                            <li
                                key={item.id}
                                className="flex flex-col gap-0.5 rounded-md border border-white/[0.06] bg-black/20 px-3 py-2"
                            >
                                <span
                                    className="overflow-hidden text-ellipsis whitespace-nowrap text-zinc-200"
                                    title={item.fileName}
                                >
                                    {item.fileName}
                                </span>
                                <a
                                    href={item.cdnUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    referrerPolicy="no-referrer"
                                    className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[0.7rem] text-sky-300/80 hover:text-sky-200"
                                    title={item.cdnUrl}
                                >
                                    {item.cdnUrl}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
