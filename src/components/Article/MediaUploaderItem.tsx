import { useEffect, useMemo, useState } from 'react';
import { useS3Upload } from '@/hooks/useS3Upload';
import { isImageUrl, isPdfUrl, isVideoUrl } from '@/utils/Article/fileType';
import type {
    MediaItemType,
    MediaUploadStatusType,
    UploadFileResponseType,
} from '@/types/file.type';

// 한 파일 카드. useS3Upload로 업로드를 구동하고, 상태/결과를 부모에 통지한다.
// 기존 파일(file === null)은 업로드 스킵 — serverData.cdnUrl을 그대로 표시.
// 미리보기 objectURL은 file이 있을 때만 생성하고, 언마운트/file 변경 시 반드시 revoke.

type MediaUploaderItemProps = {
    item: MediaItemType;
    index: number;
    onStatusChange: (
        tempId: string,
        status: MediaUploadStatusType,
        result: UploadFileResponseType | null,
    ) => void;
    onRemove: (tempId: string) => void;
};

export function MediaUploaderItem({
    item,
    index,
    onStatusChange,
    onRemove,
}: MediaUploaderItemProps) {
    const { file, serverData } = item;

    // 신규 파일만 업로드 — 기존 파일은 useS3Upload에 null 전달, 훅이 startUpload를 no-op 처리.
    // mediaRole은 인덱스 0 = PREVIEW(첫 항목 = 썸네일), 그 외 = CONTENT (design Decisions §6 + REQ7).
    const mediaRole = index === 0 ? 'PREVIEW' : 'CONTENT';
    const { progress, status, result, cancelUpload } = useS3Upload(file, mediaRole, index);

    // 부모 통지: file이 있을 때(=훅이 실제로 동작할 때)만 훅 상태를 위로 흘려보낸다.
    // file === null(기존 파일)은 부모가 이미 COMPLETED 상태로 주입했으므로 재통지 불필요.
    useEffect(() => {
        if (!file) return;
        onStatusChange(item.id, status, result);
    }, [file, item.id, status, result, onStatusChange]);

    // 미리보기 URL: 신규 파일은 objectURL, 기존 파일은 serverData.cdnUrl.
    const [objectUrl, setObjectUrl] = useState<string | null>(null);
    useEffect(() => {
        if (!file) {
            setObjectUrl(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setObjectUrl(url);
        return () => {
            URL.revokeObjectURL(url);
        };
    }, [file]);

    const previewUrl = file ? objectUrl : serverData?.cdnUrl ?? null;
    const previewName = file ? file.name : serverData?.filename ?? '';
    const previewMime = file ? file.type : serverData?.mediaType ?? '';

    const previewKind = useMemo<'image' | 'video' | 'pdf' | 'other'>(() => {
        if (file) {
            if (file.type.startsWith('image/')) return 'image';
            if (file.type.startsWith('video/')) return 'video';
            if (file.type === 'application/pdf') return 'pdf';
            return 'other';
        }
        if (previewUrl) {
            if (isImageUrl(previewUrl)) return 'image';
            if (isVideoUrl(previewUrl)) return 'video';
            if (isPdfUrl(previewUrl)) return 'pdf';
        }
        return 'other';
    }, [file, previewUrl]);

    const displayStatus: MediaUploadStatusType = file ? status : 'COMPLETED';
    const displayProgress = Math.min(progress, 100);
    const isUploading = displayStatus === 'UPLOADING' || displayStatus === 'PENDING';
    const isError = displayStatus === 'ERROR' || displayStatus === 'ABORTED';

    const handleCancel = async () => {
        await cancelUpload();
    };

    const handleRemove = async () => {
        if (file && isUploading) {
            await cancelUpload();
        }
        onRemove(item.id);
    };

    return (
        <div
            className="group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.09] bg-white/[0.03]"
            data-testid="media-uploader-item"
        >
            <div className="relative aspect-video w-full overflow-hidden bg-white/[0.04]">
                {previewUrl && previewKind === 'image' && (
                    <img
                        src={previewUrl}
                        alt={previewName}
                        className="h-full w-full object-cover"
                    />
                )}
                {previewUrl && previewKind === 'video' && (
                    <video
                        src={previewUrl}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                    />
                )}
                {previewKind === 'pdf' && (
                    <div className="flex h-full w-full items-center justify-center">
                        <span className="text-[0.7rem] font-medium uppercase tracking-widest text-zinc-500">
                            PDF
                        </span>
                    </div>
                )}
                {previewKind === 'other' && (
                    <div className="flex h-full w-full items-center justify-center">
                        <span className="text-[0.7rem] font-medium uppercase tracking-widest text-zinc-600">
                            File
                        </span>
                    </div>
                )}

                {isUploading && (
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60"
                        data-testid="upload-progress"
                    >
                        <div
                            className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white"
                            aria-hidden
                        />
                        <span className="text-xs font-medium tabular-nums text-white">
                            {displayProgress}%
                        </span>
                    </div>
                )}

                {isError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-950/60">
                        <span className="text-xs font-medium uppercase tracking-widest text-red-200">
                            {displayStatus === 'ABORTED' ? '취소됨' : '실패'}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between gap-2 px-3 py-2">
                <div className="flex min-w-0 flex-1 flex-col">
                    <span
                        className="truncate text-xs font-medium text-white"
                        title={previewName}
                    >
                        {previewName || ' '}
                    </span>
                    {previewMime && (
                        <span className="truncate text-[0.65rem] uppercase tracking-widest text-zinc-500">
                            {previewMime}
                        </span>
                    )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                    {file && isUploading && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="rounded-md border border-white/[0.10] bg-white/[0.04] px-2 py-1 text-[0.65rem] uppercase tracking-widest text-zinc-300 transition-colors hover:bg-white/[0.10]"
                        >
                            취소
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="rounded-md border border-white/[0.10] bg-white/[0.04] px-2 py-1 text-[0.65rem] uppercase tracking-widest text-zinc-300 transition-colors hover:bg-white/[0.10]"
                    >
                        제거
                    </button>
                </div>
            </div>
        </div>
    );
}
