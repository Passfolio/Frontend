import { useRef, DragEvent } from 'react';

type MediaUploaderInputProps = {
    onFilesSelected: (files: File[]) => void;
};

export function MediaUploaderInput({ onFilesSelected }: MediaUploaderInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length > 0) {
            onFilesSelected(files);
        }
        // 같은 파일을 다시 선택할 수 있도록 input 값 초기화
        e.target.value = '';
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files).filter((f) =>
            /^(image\/|video\/|application\/pdf$)/.test(f.type),
        );
        if (files.length > 0) {
            onFilesSelected(files);
        }
    };

    const handleButtonClick = () => {
        inputRef.current?.click();
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.18] bg-white/[0.03] px-6 py-6 text-center transition-colors hover:border-white/[0.30] hover:bg-white/[0.05]"
        >
            <input
                ref={inputRef}
                type="file"
                multiple
                accept="image/*,video/*,application/pdf"
                className="sr-only"
                onChange={handleChange}
            />
            <button
                type="button"
                onClick={handleButtonClick}
                className="rounded-lg border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/[0.10]"
            >
                파일 선택
            </button>
            <p className="text-xs text-zinc-500">이미지, 동영상, PDF — 드래그하거나 클릭해서 추가</p>
        </div>
    );
}
