import { Link } from 'react-router-dom';
import { ArticlePageItemType } from '@/types/article.type';

type ArticleCardProps = {
    article: ArticlePageItemType;
};

export type ContentCardProps = {
    to: string;
    title: string;
    thumbnail: string | null;
    createdAt?: string;
};

function formatDisplayDate(isoDate: string) {
    const d = new Date(isoDate);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
}

/** Article 외 정적 콘텐츠(Documentation 등)에서도 쓰는 범용 카드 — 디자인은 ArticleCard와 동일 */
export function ContentCard({ to, title, thumbnail, createdAt }: ContentCardProps) {
    return (
        <Link
            to={to}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.09] transition-colors hover:border-white/[0.18]"
            style={{
                background: 'rgba(18,18,22,0.92)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.09), 0 4px 24px -6px rgba(0,0,0,0.5)',
            }}
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

            {thumbnail ? (
                <div className="aspect-video w-full overflow-hidden">
                    <img
                        src={thumbnail}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            ) : (
                <div className="aspect-video w-full bg-white/[0.04] flex items-center justify-center">
                    <span className="text-[0.75rem] font-medium uppercase tracking-widest text-zinc-600">
                        No Image
                    </span>
                </div>
            )}

            <div className="flex flex-1 flex-col gap-2 px-5 py-4">
                <h2 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-white">
                    {title}
                </h2>
                {createdAt && (
                    <time
                        className="mt-auto text-[0.75rem] tabular-nums text-zinc-500"
                        dateTime={createdAt}
                    >
                        {formatDisplayDate(createdAt)}
                    </time>
                )}
            </div>
        </Link>
    );
}

export function ArticleCard({ article }: ArticleCardProps) {
    return (
        <ContentCard
            to={`/articles/${article.id}`}
            title={article.title}
            thumbnail={article.thumbnail}
            createdAt={article.createdAt}
        />
    );
}
