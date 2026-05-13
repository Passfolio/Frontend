import { useCallback, useMemo, useRef, useState } from 'react';
import type { JSONContent } from '@tiptap/react';
import type {
    ArticleCreateRequestType,
    ArticleType,
    ArticleUpdateRequestType,
} from '@/types/article.type';
import { TipTapEditor } from '@/components/Article/TipTapEditor';
import { extractImageUrls } from '@/utils/Article/extractImageUrls';

type CreateSubmitBody = ArticleCreateRequestType;
type UpdateSubmitBody = ArticleUpdateRequestType;

type ArticleEditorFormProps =
    | {
          mode: 'create';
          initial?: undefined;
          onSubmit: (body: CreateSubmitBody) => void | Promise<void>;
          submitting: boolean;
      }
    | {
          mode: 'edit';
          initial: ArticleType;
          onSubmit: (body: UpdateSubmitBody) => void | Promise<void>;
          submitting: boolean;
      };

const EMPTY_DOC: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] };

// 기존 게시물 contents가 plain text(legacy) 또는 JSON(신규)인 경우를 모두 처리.
// JSON.parse 후 doc 스키마(type === 'doc' && content 배열)를 반드시 검증.
const parseInitialContents = (raw: string | null | undefined): JSONContent => {
    if (!raw || raw.trim().length === 0) return EMPTY_DOC;
    const trimmed = raw.trim();
    if (trimmed.startsWith('{')) {
        try {
            const parsed = JSON.parse(trimmed) as unknown;
            if (
                parsed &&
                typeof parsed === 'object' &&
                (parsed as JSONContent).type === 'doc' &&
                Array.isArray((parsed as JSONContent).content)
            ) {
                return parsed as JSONContent;
            }
        } catch {
            // fallthrough to plain text
        }
    }
    // legacy plain text — 단일 paragraph로 감싸 TipTap에 주입
    return {
        type: 'doc',
        content: [
            {
                type: 'paragraph',
                content: [{ type: 'text', text: raw }],
            },
        ],
    };
};

// 두 fileUrls 배열이 동일한 순서/내용인지 비교
const areFileUrlsEqual = (a: string[], b: string[]): boolean => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
        if (a[i] !== b[i]) return false;
    }
    return true;
};

// 빈 doc 판정: paragraph 하나에 텍스트도 image도 없는 경우
const isDocEmpty = (doc: JSONContent): boolean => {
    let hasContent = false;
    const visit = (node: JSONContent | undefined): void => {
        if (!node || hasContent) return;
        if (node.type === 'image') {
            hasContent = true;
            return;
        }
        if (node.type === 'text' && typeof node.text === 'string' && node.text.trim().length > 0) {
            hasContent = true;
            return;
        }
        node.content?.forEach(visit);
    };
    visit(doc);
    return !hasContent;
};

export function ArticleEditorForm(props: ArticleEditorFormProps) {
    const { mode, onSubmit, submitting } = props;
    const initial = props.mode === 'edit' ? props.initial : undefined;

    const [title, setTitle] = useState<string>(initial?.title ?? '');
    const initialJson = useMemo(() => parseInitialContents(initial?.contents), [initial?.contents]);
    const [editorJson, setEditorJson] = useState<JSONContent>(initialJson);
    const [uploadingCount, setUploadingCount] = useState<number>(0);

    // editor onChange는 매번 새 함수로 들어와도 stable해야 — useCallback
    const handleEditorChange = useCallback((json: JSONContent) => {
        setEditorJson(json);
    }, []);
    const handleUploadingCountChange = useCallback((count: number) => {
        setUploadingCount(count);
    }, []);

    const trimmedTitle = title.trim();
    const docEmpty = isDocEmpty(editorJson);
    const isFormValid =
        trimmedTitle.length > 0 &&
        !docEmpty &&
        uploadingCount === 0 &&
        !submitting;

    // edit 모드일 때 초기 contents 직렬화 — 비교용 캐시
    const initialContentsSerializedRef = useRef<string>(
        initial ? JSON.stringify(initialJson) : '',
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isFormValid) return;

        const contentsSerialized = JSON.stringify(editorJson);
        const fileUrls = extractImageUrls(editorJson);

        console.info('[Passfolio][Article][fileUrls]', 'editorSubmit:builtFileUrls', {
            mode,
            count: fileUrls.length,
            fileUrls,
        });

        if (mode === 'create') {
            const body: CreateSubmitBody = {
                title: trimmedTitle,
                contents: contentsSerialized,
                ...(fileUrls.length > 0 ? { fileUrls } : {}),
            };
            await onSubmit(body);
            return;
        }

        // edit — 변경된 필드만 PATCH
        const body: UpdateSubmitBody = {};
        if (initial && trimmedTitle !== initial.title) {
            body.title = trimmedTitle;
        }
        if (contentsSerialized !== initialContentsSerializedRef.current) {
            body.contents = contentsSerialized;
        }
        if (initial && !areFileUrlsEqual(fileUrls, initial.fileUrls)) {
            body.fileUrls = fileUrls;
        }
        await onSubmit(body);
    };

    const submitLabel = mode === 'create' ? '게시' : '수정';
    const submittingLabel = mode === 'create' ? '게시 중…' : '수정 중…';

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
            <section className="flex flex-col gap-2">
                <label
                    htmlFor="article-title"
                    className="text-xs font-medium uppercase tracking-wider text-zinc-500"
                >
                    제목
                </label>
                <input
                    id="article-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={200}
                    placeholder="제목을 입력하세요"
                    disabled={submitting}
                    className="w-full rounded-xl border border-white/[0.12] bg-white/[0.05] px-3 py-2.5 text-sm text-white outline-none ring-0 transition placeholder:text-zinc-600 focus:border-white/25 disabled:opacity-60"
                />
            </section>

            <section className="flex flex-col gap-2">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    본문
                </p>
                <TipTapEditor
                    initialJson={initialJson}
                    onChange={handleEditorChange}
                    onUploadingCountChange={handleUploadingCountChange}
                    disabled={submitting}
                />
            </section>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={!isFormValid}
                    className="rounded-xl border border-white/[0.2] px-6 py-2.5 text-sm font-semibold text-white transition enabled:hover:border-white/35 enabled:hover:bg-white/[0.08] disabled:opacity-50"
                    style={{
                        background:
                            'linear-gradient(145deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 100%)',
                    }}
                >
                    {submitting ? submittingLabel : submitLabel}
                </button>
            </div>
        </form>
    );
}
