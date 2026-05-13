import { Link } from 'react-router-dom';
import { LANDING_ARTICLE_SECTION } from '@/constants/landingPage';
import { getRevealDelayClassName } from './landingSectionUtils';

// 랜딩 Insights 카드의 화면용 모델. ArticlePageItemType을 LanderPage에서 매핑해 전달한다.
export type LandingInsightCardType = {
  id: number;
  title: string;
  imageUrl: string | null;
  imageAlt: string;
  dateLabel: string;
  href: string;
  tag?: string;
  excerpt?: string;
};

type LandingArticleSectionProps = {
  insightList: LandingInsightCardType[];
};

export const LandingArticleSection = ({ insightList }: LandingArticleSectionProps) => {
  return (
    <section className="article-section" id="article" aria-labelledby="landing-article-title">
      <div className="landing-shell">
        <div className="section-header reveal-up">
          <h2 id="landing-article-title">{LANDING_ARTICLE_SECTION.title}</h2>
          <Link
            to={LANDING_ARTICLE_SECTION.cta.href}
            className="btn-neu btn-neu-sm"
            aria-label={LANDING_ARTICLE_SECTION.cta.label}
          >
            {LANDING_ARTICLE_SECTION.cta.label} <i className="fa-solid fa-arrow-right" aria-hidden />
          </Link>
        </div>

        <div className="article-grid">
          {insightList.map((article, index) => (
            <div key={article.id} className={`reveal-up ${getRevealDelayClassName(index)}`}>
              <Link to={article.href} className="article-card">
                <div className="article-img-box">
                  {article.imageUrl ? (
                    <img
                      src={article.imageUrl}
                      alt={article.imageAlt}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center bg-white/[0.04] text-[0.7rem] font-medium uppercase tracking-[0.18em] text-zinc-600"
                      aria-hidden
                    >
                      No Image
                    </div>
                  )}
                </div>
                {article.tag && <span className="article-tag">{article.tag}</span>}
                <h3>{article.title}</h3>
                {article.excerpt && <p>{article.excerpt}</p>}
                <span className="article-date">{article.dateLabel}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
