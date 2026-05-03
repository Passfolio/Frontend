import { useCallback, useMemo, useState } from 'react';
import type {
    ArticleCreateRequestType,
    ArticleType,
    ArticleUpdateRequestType,
} from '@/types/article.type';
import type { MediaItemType, UploadFileResponseType } from '@/types/file.type';
import { MediaUploaderList } from '@/components/Article/MediaUploaderList';
import { isImageUrl, isPdfUrl, isVideoUrl } from '@/utils/Article/fileType';

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

// 기존 cdnUrl을 MediaItemType으로 직렬화 — file=null로 둬서 useS3Upload가 no-op가 되도록 한다.
// fileId/fileSize는 신규 업로드가 아니므로 0/0 placeholder. MediaUploaderItem은 cdnUrl/filename/mediaType만 읽으므로 안전.
const toExistingMediaItem = (cdnUrl: string): MediaItemType => {
    const filename = cdnUrl.split('/').pop()?.split('?')[0] ?? '';
    const mediaType = isImageUrl(cdnUrl)
        ? 'image/*'
        : isVideoUrl(cdnUrl)
            ? 'video/*'
            : isPdfUrl(cdnUrl)
                ? 'application/pdf'
                : 'application/octet-stream';
    const serverData: UploadFileResponseType = {
        fileId: 0,
        filename,
        cdnUrl,
        fileSize: 0,
        mediaType,
        status: 'COMPLETED',
    };
    return {
        id: crypto.randomUUID(),
        file: null,
        status: 'COMPLETED',
        serverData,
    };
};

// 두 fileUrls 배열이 동일한 순서/내용인지 비교.
const areFileUrlsEqual = (a: string[], b: string[]): boolean => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
        if (a[i] !== b[i]) return false;
    }
    return true;
};

export function ArticleEditorForm(props: ArticleEditorFormProps) {
    const { mode, onSubmit, submitting } = props;
    const initial = props.mode === 'edit' ? props.initial : undefined;

    const [title, setTitle] = useState<string>(initial?.title ?? '');
    const [contents, setContents] = useState<string>(initial?.contents ?? '');
    const [mediaItems, setMediaItems] = useState<MediaItemType[]>(() =>
        (initial?.fileUrls ?? []).map(toExistingMediaItem),
    );

    const handleItemsChange = useCallback((items: MediaItemType[]) => {
        setMediaItems(items);
    }, []);

    // 모든 미디어 항목이 COMPLETED여야 제출 가능 — design REQ3.
    const isAllMediaCompleted = useMemo(
        () => mediaItems.every((item) => item.status === 'COMPLETED'),
        [mediaItems],
    );
    const trimmedTitle = title.trim();
    const trimmedContents = contents.trim();
    const isFormValid =
        trimmedTitle.length > 0 &&
        trimmedContents.length > 0 &&
        isAllMediaCompleted &&
        !submitting;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isFormValid) return;

        // 완료된 항목의 cdnUrl만 추출. 빈 문자열/누락은 방어적으로 제거.
        const fileUrls = mediaItems
            .map((item) => item.serverData?.cdnUrl ?? '')
            .filter((url) => url.length > 0);

        if (mode === 'create') {
            const body: CreateSubmitBody = {
                title: trimmedTitle,
                contents: trimmedContents,
                ...(fileUrls.length > 0 ? { fileUrls } : {}),
            };
            await onSubmit(body);
            return;
        }

        // edit — design Decisions §5: 변경된 필드만 전송. fileUrls는 빈 배열도 의미가 있으므로(전부 비움)
        // 길이가 아니라 "초기값과 다른지"로 판단한다. undefined로 두면 BE가 변경 없음으로 처리.
        const body: UpdateSubmitBody = {};
        if (initial && trimmedTitle !== initial.title) {
            body.title = trimmedTitle;
        }
        if (initial && trimmedContents !== initial.contents) {
            body.contents = trimmedContents;
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
                <label
                    htmlFor="article-contents"
                    className="text-xs font-medium uppercase tracking-wider text-zinc-500"
                >
                    본문
                </label>
                <textarea
                    id="article-contents"
                    value={contents}
                    onChange={(e) => setContents(e.target.value)}
                    placeholder="본문을 입력하세요"
                    rows={10}
                    disabled={submitting}
                    className="w-full resize-y rounded-xl border border-white/[0.12] bg-white/[0.05] px-3 py-2.5 text-sm leading-relaxed text-white outline-none ring-0 transition placeholder:text-zinc-600 focus:border-white/25 disabled:opacity-60"
                />
            </section>

            <section className="flex flex-col gap-2">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    첨부 (이미지/영상/PDF)
                </p>
                <MediaUploaderList mediaItems={mediaItems} onItemsChange={handleItemsChange} />
                {!isAllMediaCompleted && mediaItems.length > 0 && (
                    <p className="text-[0.72rem] text-amber-300/80">
                        업로드 중인 파일이 있습니다. 완료 후 제출할 수 있습니다.
                    </p>
                )}
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
