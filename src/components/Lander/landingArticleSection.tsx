import type { LandingInsightArticleType } from '@/api/Lander/fetchLandingInsightList';
import { LANDING_ARTICLE_SECTION } from '@/constants/landingPage';
import { getRevealDelayClassName } from './landingSectionUtils';

type LandingArticleSectionProps = {
  insightList: LandingInsightArticleType[];
};

export const LandingArticleSection = ({ insightList }: LandingArticleSectionProps) => {
  return (
    <section className="article-section" id="article" aria-labelledby="landing-article-title">
      <div className="landing-shell">
        <div className="section-header reveal-up">
          <h2 id="landing-article-title">{LANDING_ARTICLE_SECTION.title}</h2>
          <a
            href={LANDING_ARTICLE_SECTION.cta.href}
            className="btn-neu btn-neu-sm"
            aria-label={LANDING_ARTICLE_SECTION.cta.label}
          >
            {LANDING_ARTICLE_SECTION.cta.label} <i className="fa-solid fa-arrow-right" aria-hidden />
          </a>
        </div>

        <div className="article-grid">
          {insightList.map((article, index) => (
            <div key={article.id} className={`reveal-up ${getRevealDelayClassName(index)}`}>
              <a href={article.href} className="article-card">
                <div className="article-img-box">
                  <img src={article.imageUrl} alt={article.imageAlt} loading="lazy" decoding="async" />
                </div>
                <span className="article-tag">{article.tag}</span>
                <h3>{article.title}</h3>
                <p>{article.excerpt}</p>
                <span className="article-date">{article.dateLabel}</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
