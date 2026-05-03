import { ArticlePageItemType } from '@/types/article.type';
import { ArticleCard } from '@/components/Article/ArticleCard';

type ArticleListGridProps = {
    articles: ArticlePageItemType[];
};

export function ArticleListGrid({ articles }: ArticleListGridProps) {
    if (articles.length === 0) {
        return (
            <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-white/[0.09]"
                style={{
                    background: 'rgba(18,18,22,0.92)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.09), 0 4px 24px -6px rgba(0,0,0,0.5)',
                }}
            >
                <p className="text-sm text-zinc-500">아직 게시된 아티클이 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
            ))}
        </div>
    );
}
