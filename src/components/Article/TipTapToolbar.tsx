import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditorState, type Editor } from '@tiptap/react';

type TipTapToolbarProps = {
    editor: Editor | null;
    onImageButtonClick: () => void;
    disabled?: boolean;
};

type ToolbarButtonProps = {
    label: string;
    title: string;
    isActive?: boolean;
    onClick: () => void;
    disabled?: boolean;
};

function ToolbarButton({ label, title, isActive, onClick, disabled }: ToolbarButtonProps) {
    const isPressed = Boolean(isActive);
    const baseClass =
        'inline-flex h-8 min-w-[32px] items-center justify-center rounded-md border px-2 text-xs font-medium transition disabled:opacity-40';
    const stateClass = isPressed
        ? 'border-white/30 bg-white/[0.14] text-white'
        : 'border-white/[0.10] bg-white/[0.04] text-zinc-300 enabled:hover:border-white/20 enabled:hover:bg-white/[0.08]';
    return (
        <button
            type="button"
            title={title}
            aria-label={title}
            aria-pressed={isPressed}
            disabled={disabled}
            onClick={onClick}
            className={`${baseClass} ${stateClass}`}
        >
            {label}
        </button>
    );
}

const DEFAULT_ACTIVE_STATE = {
    isBold: false,
    isItalic: false,
    isCode: false,
    isH1: false,
    isH2: false,
    isH3: false,
    isBulletList: false,
    isOrderedList: false,
    isLink: false,
};

type LinkPromptModalProps = {
    initialUrl: string;
    onClose: () => void;
    onSubmit: (url: string) => void;
};

// 다크 글래스 톤의 링크 입력 모달 — 주변 toolbar/에디터와 동일한 색·라운드 사용.
function LinkPromptModal({ initialUrl, onClose, onSubmit }: LinkPromptModalProps) {
    const [value, setValue] = useState<string>(initialUrl);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const submit = () => onSubmit(value);

    // ArticleEditorForm이 이미 <form>이므로 중첩 방지를 위해 모달은 <form> 없이 div + Enter 키 처리로 동일 UX 제공.
    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            submit();
        }
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tiptap-link-modal-title"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="w-full max-w-md rounded-2xl border border-white/[0.12] bg-zinc-950/95 p-5 shadow-2xl"
                style={{
                    background:
                        'linear-gradient(165deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.85) 100%)',
                }}
            >
                <h2
                    id="tiptap-link-modal-title"
                    className="mb-1 text-sm font-semibold text-white"
                >
                    링크 URL
                </h2>
                <p className="mb-4 text-xs text-zinc-500">비우면 링크가 해제됩니다.</p>

                <input
                    ref={inputRef}
                    type="url"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder="https://example.com"
                    className="w-full rounded-xl border border-white/[0.12] bg-white/[0.05] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/25"
                />

                <div className="mt-4 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-2 text-xs font-medium text-zinc-300 transition hover:border-white/25 hover:bg-white/[0.08]"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={submit}
                        className="rounded-xl border border-white/[0.20] px-4 py-2 text-xs font-semibold text-white transition hover:border-white/35 hover:bg-white/[0.08]"
                        style={{
                            background:
                                'linear-gradient(145deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 100%)',
                        }}
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}

export function TipTapToolbar({ editor, onImageButtonClick, disabled }: TipTapToolbarProps) {
    const activeState = useEditorState({
        editor,
        selector: ({ editor: e }) => {
            if (!e) return DEFAULT_ACTIVE_STATE;
            return {
                isBold: e.isActive('bold'),
                isItalic: e.isActive('italic'),
                isCode: e.isActive('code'),
                isH1: e.isActive('heading', { level: 1 }),
                isH2: e.isActive('heading', { level: 2 }),
                isH3: e.isActive('heading', { level: 3 }),
                isBulletList: e.isActive('bulletList'),
                isOrderedList: e.isActive('orderedList'),
                isLink: e.isActive('link'),
            };
        },
    }) ?? DEFAULT_ACTIVE_STATE;

    const [linkModalState, setLinkModalState] = useState<{ open: boolean; initialUrl: string }>(
        { open: false, initialUrl: '' },
    );

    const openLinkModal = useCallback(() => {
        if (!editor) return;
        const previous = (editor.getAttributes('link').href as string | undefined) ?? '';
        setLinkModalState({ open: true, initialUrl: previous });
    }, [editor]);

    const closeLinkModal = useCallback(() => {
        setLinkModalState((prev) => ({ ...prev, open: false }));
    }, []);

    const submitLinkModal = useCallback(
        (next: string) => {
            if (!editor) {
                closeLinkModal();
                return;
            }
            const trimmed = next.trim();
            if (trimmed.length === 0) {
                editor.chain().focus().extendMarkRange('link').unsetLink().run();
            } else {
                editor
                    .chain()
                    .focus()
                    .extendMarkRange('link')
                    .setLink({ href: trimmed, target: '_blank', rel: 'noopener noreferrer' })
                    .run();
            }
            closeLinkModal();
        },
        [editor, closeLinkModal],
    );

    if (!editor) {
        return (
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/[0.10] bg-white/[0.03] p-2 opacity-50" />
        );
    }

    const isDisabled = Boolean(disabled);

    return (
        <>
            <div
                className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/[0.10] bg-white/[0.03] p-2"
                data-testid="tiptap-toolbar"
            >
                <ToolbarButton
                    label="B"
                    title="굵게"
                    isActive={activeState.isBold}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={isDisabled}
                />
                <ToolbarButton
                    label="I"
                    title="기울임"
                    isActive={activeState.isItalic}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={isDisabled}
                />
                <ToolbarButton
                    label="</>"
                    title="인라인 코드"
                    isActive={activeState.isCode}
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    disabled={isDisabled}
                />

                <span className="mx-1 h-5 w-px bg-white/[0.10]" aria-hidden />

                <ToolbarButton
                    label="H1"
                    title="제목 1"
                    isActive={activeState.isH1}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    disabled={isDisabled}
                />
                <ToolbarButton
                    label="H2"
                    title="제목 2"
                    isActive={activeState.isH2}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    disabled={isDisabled}
                />
                <ToolbarButton
                    label="H3"
                    title="제목 3"
                    isActive={activeState.isH3}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    disabled={isDisabled}
                />

                <span className="mx-1 h-5 w-px bg-white/[0.10]" aria-hidden />

                <ToolbarButton
                    label="•"
                    title="글머리 기호"
                    isActive={activeState.isBulletList}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    disabled={isDisabled}
                />
                <ToolbarButton
                    label="1."
                    title="번호 매기기"
                    isActive={activeState.isOrderedList}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    disabled={isDisabled}
                />

                <span className="mx-1 h-5 w-px bg-white/[0.10]" aria-hidden />

                <ToolbarButton
                    label="🔗"
                    title="링크"
                    isActive={activeState.isLink}
                    onClick={openLinkModal}
                    disabled={isDisabled}
                />
                <ToolbarButton
                    label="🖼"
                    title="이미지 삽입"
                    onClick={onImageButtonClick}
                    disabled={isDisabled}
                />
            </div>

            {linkModalState.open && (
                <LinkPromptModal
                    initialUrl={linkModalState.initialUrl}
                    onClose={closeLinkModal}
                    onSubmit={submitLinkModal}
                />
            )}
        </>
    );
}
