import { useCallback, useEffect, useRef, useState } from 'react';
import { uploadFileToS3 } from '@/utils/Article/uploadToS3';

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

type FileUploadViewProps = {
    onUploaded: () => void | Promise<void>;
};

export function FileUploadView({ onUploaded }: FileUploadViewProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const abortControllersRef = useRef<Set<AbortController>>(new Set());
    const [uploadingItemList, setUploadingItemList] = useState<UploadingItemType[]>([]);

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

    return (
        <div className="flex flex-col gap-3">
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
                업로드 후 Files 탭에서 결과를 확인할 수 있습니다.
            </p>

            {uploadingItemList.length > 0 && (
                <ul className="mt-1 list-none space-y-1 p-0 text-xs">
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
    );
}
