import { useCallback } from 'react';
import type { MediaItemType, MediaUploadStatusType, UploadFileResponseType } from '@/types/file.type';
import { MediaUploaderInput } from '@/components/Article/MediaUploaderInput';
import { MediaUploaderItem } from '@/components/Article/MediaUploaderItem';

type MediaUploaderListProps = {
    mediaItems: MediaItemType[];
    onItemsChange: (items: MediaItemType[]) => void;
};

export function MediaUploaderList({ mediaItems, onItemsChange }: MediaUploaderListProps) {
    const handleFilesSelected = useCallback(
        (files: File[]) => {
            const newItems: MediaItemType[] = files.map((file) => ({
                id: crypto.randomUUID(),
                file,
                status: 'PENDING',
                serverData: null,
            }));
            onItemsChange([...mediaItems, ...newItems]);
        },
        [mediaItems, onItemsChange],
    );

    const handleStatusChange = useCallback(
        (tempId: string, status: MediaUploadStatusType, result: UploadFileResponseType | null) => {
            onItemsChange(
                mediaItems.map((item) =>
                    item.id === tempId ? { ...item, status, serverData: result } : item,
                ),
            );
        },
        [mediaItems, onItemsChange],
    );

    const handleRemove = useCallback(
        (tempId: string) => {
            onItemsChange(mediaItems.filter((item) => item.id !== tempId));
        },
        [mediaItems, onItemsChange],
    );

    return (
        <div className="flex flex-col gap-4">
            <MediaUploaderInput onFilesSelected={handleFilesSelected} />
            {mediaItems.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {mediaItems.map((item, index) => (
                        <div key={item.id} className="flex flex-col gap-1">
                            {index === 0 && (
                                <span className="text-[0.65rem] font-medium uppercase tracking-widest text-amber-400">
                                    대표(썸네일)
                                </span>
                            )}
                            <MediaUploaderItem
                                item={item}
                                index={index}
                                onStatusChange={handleStatusChange}
                                onRemove={handleRemove}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
