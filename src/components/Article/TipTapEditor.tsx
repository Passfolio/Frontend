import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    EditorContent,
    ReactNodeViewRenderer,
    useEditor,
    type Editor,
    type JSONContent,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { uploadFileToS3 } from '@/utils/Article/uploadToS3';
import { TipTapToolbar } from '@/components/Article/TipTapToolbar';
import { ImageNodeView } from '@/components/Article/ImageNodeView';

type TipTapEditorProps = {
    initialJson: JSONContent | null;
    onChange: (json: JSONContent) => void;
    onUploadingCountChange: (count: number) => void;
    disabled?: boolean;
};

const isImageFile = (file: File): boolean => file.type.startsWith('image/');

// editor.state.doc 안에서 src가 일치하는 image 노드의 첫 위치를 반환.
// blob URL은 createObjectURL로 매번 새로 생성되므로 본문 내 충돌이 발생하지 않는다.
const findImageNodePosBySrc = (editor: Editor, src: string): number | null => {
    let foundPos: number | null = null;
    editor.state.doc.descendants((node, pos) => {
        if (foundPos !== null) return false;
        if (node.type.name === 'image' && node.attrs?.src === src) {
            foundPos = pos;
            return false;
        }
        return true;
    });
    return foundPos;
};

export function TipTapEditor({
    initialJson,
    onChange,
    onUploadingCountChange,
    disabled,
}: TipTapEditorProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const abortControllersRef = useRef<Set<AbortController>>(new Set());
    const [uploadingCount, setUploadingCount] = useState<number>(0);

    useEffect(() => {
        onUploadingCountChange(uploadingCount);
    }, [uploadingCount, onUploadingCountChange]);

    const extensions = useMemo(
        () => [
            StarterKit,
            // blob: placeholder 인 동안 spinner overlay 를 보여주기 위해 React NodeView 로 wrap.
            // 직렬화는 기존 image 노드 그대로이므로 contents JSON 호환성에는 영향 없다.
            Image.extend({
                addNodeView() {
                    return ReactNodeViewRenderer(ImageNodeView);
                },
            }).configure({
                inline: false,
                allowBase64: false,
                HTMLAttributes: {
                    class: 'max-w-full rounded-lg',
                    referrerpolicy: 'no-referrer',
                },
            }),
        ],
        [],
    );

    // useEditor의 editorProps는 한 번만 평가되므로 핸들러에서 최신 함수를 호출하기 위한 ref.
    const startUploadForFileRef = useRef<(file: File) => void>(() => {});

    const editor = useEditor({
        extensions,
        content: initialJson ?? { type: 'doc', content: [{ type: 'paragraph' }] },
        editable: !disabled,
        onUpdate: ({ editor: e }) => {
            onChange(e.getJSON());
        },
        editorProps: {
            attributes: {
                class:
                    'tiptap-editor min-h-[280px] w-full rounded-xl border border-white/[0.12] bg-white/[0.05] px-3 py-3 text-sm leading-relaxed text-white outline-none transition focus:border-white/25 [&_h1]:mb-2 [&_h1]:mt-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-white [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_p]:mb-3 [&_p]:break-words [&_a]:text-sky-300 [&_a]:underline [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-0.5 [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em] [&_pre]:my-2 [&_pre]:rounded-lg [&_pre]:bg-black/40 [&_pre]:p-3 [&_pre]:text-[0.85em] [&_img]:my-3',
            },
            handlePaste(_view, event) {
                const files = Array.from(event.clipboardData?.files ?? []).filter(isImageFile);
                if (files.length === 0) return false;
                files.forEach((f) => startUploadForFileRef.current(f));
                return true; // ProseMirror의 추가 처리 차단
            },
            handleDrop(_view, event) {
                const dt = (event as DragEvent).dataTransfer;
                const files = Array.from(dt?.files ?? []).filter(isImageFile);
                if (files.length === 0) return false;
                event.preventDefault();
                files.forEach((f) => startUploadForFileRef.current(f));
                return true;
            },
        },
    });

    useEffect(() => {
        if (!editor) return;
        editor.setEditable(!disabled);
    }, [editor, disabled]);

    const startUploadForFile = useCallback(
        (file: File) => {
            if (!editor) return;
            const blobUrl = URL.createObjectURL(file);

            editor.chain().focus().setImage({ src: blobUrl }).run();

            const controller = new AbortController();
            abortControllersRef.current.add(controller);
            setUploadingCount((n) => n + 1);

            void (async () => {
                let revoked = false;
                const revokeOnce = () => {
                    if (revoked) return;
                    revoked = true;
                    URL.revokeObjectURL(blobUrl);
                };
                try {
                    const result = await uploadFileToS3(file, { signal: controller.signal });
                    if (controller.signal.aborted) return;
                    if (editor.isDestroyed) return;
                    const pos = findImageNodePosBySrc(editor, blobUrl);
                    if (pos === null) return;
                    const currentNode = editor.state.doc.nodeAt(pos);
                    const tr = editor.state.tr.setNodeMarkup(pos, undefined, {
                        ...(currentNode?.attrs ?? {}),
                        src: result.cdnUrl,
                        alt: result.filename ?? '',
                    });
                    editor.view.dispatch(tr);
                } catch (error) {
                    if (controller.signal.aborted) return;
                    if (editor.isDestroyed) return;
                    const pos = findImageNodePosBySrc(editor, blobUrl);
                    if (pos !== null) {
                        const node = editor.state.doc.nodeAt(pos);
                        const nodeSize = node?.nodeSize ?? 1;
                        const tr = editor.state.tr.delete(pos, pos + nodeSize);
                        editor.view.dispatch(tr);
                    }
                    console.warn('[Passfolio][Article][upload] image upload failed', error);
                } finally {
                    revokeOnce();
                    abortControllersRef.current.delete(controller);
                    setUploadingCount((n) => Math.max(0, n - 1));
                }
            })();
        },
        [editor],
    );

    // ref에 항상 최신 함수 주입 — paste/drop 핸들러가 stale closure 회피
    useEffect(() => {
        startUploadForFileRef.current = startUploadForFile;
    }, [startUploadForFile]);

    const handleFileInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files ?? []).filter(isImageFile);
            files.forEach(startUploadForFile);
            e.target.value = '';
        },
        [startUploadForFile],
    );

    const handleImageButtonClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    // 언마운트 시 진행 중 업로드 모두 abort → multipart abort 연쇄
    useEffect(() => {
        return () => {
            abortControllersRef.current.forEach((c) => c.abort());
            abortControllersRef.current.clear();
        };
    }, []);

    return (
        <div className="flex flex-col gap-2">
            <TipTapToolbar
                editor={editor}
                onImageButtonClick={handleImageButtonClick}
                disabled={disabled}
            />
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
                aria-hidden
                tabIndex={-1}
            />
            <EditorContent editor={editor} />
            {uploadingCount > 0 && (
                <p className="text-[0.72rem] text-amber-300/80" role="status">
                    이미지 업로드 중… ({uploadingCount}건). 완료 후 제출할 수 있습니다.
                </p>
            )}
        </div>
    );
}
