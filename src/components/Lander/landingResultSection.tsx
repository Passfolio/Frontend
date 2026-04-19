import {
  LANDING_RESULT_CARD_LIST,
  LANDING_RESULT_SECTION,
  type LandingBentoCardType,
} from '@/constants/landingPage';
import { getRevealDelayClassName } from './landingSectionUtils';

export function LandingResultSection() {
  return (
    <section className="result-section" id="result" aria-labelledby="landing-result-title">
      <div className="landing-shell">
        <div className="section-header reveal-up">
          <div>
            <div className="hero-badge">{LANDING_RESULT_SECTION.badge}</div>
            <h2 id="landing-result-title">
              <span className="text-gradient">{LANDING_RESULT_SECTION.titleGradient}</span>
              <br />
              {LANDING_RESULT_SECTION.title}
            </h2>
            <p className="mt-4 max-w-[600px]">{LANDING_RESULT_SECTION.description}</p>
          </div>
        </div>

        <div className="bento-grid">
          {LANDING_RESULT_CARD_LIST.map((card, index) => (
            <LandingResultCard
              key={card.title}
              card={card}
              delayClassName={getRevealDelayClassName(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

type LandingResultCardProps = {
  card: LandingBentoCardType;
  delayClassName: string;
};

function LandingResultCard({ card, delayClassName }: LandingResultCardProps) {
  return (
    <div className={`reveal-up ${delayClassName} ${card.variant}`}>
      <div className="bento-card">
        <div className="bento-content">
          <h3>{card.title}</h3>
          <p>{card.description}</p>
        </div>
        <div className={`bento-img-wrapper ${card.imageWrapperClassName ?? ''}`.trim()}>
          <img
            src={card.imageUrl}
            alt={card.imageAlt}
            className={`bento-img ${card.imageClassName ?? ''}`.trim()}
            loading={card.variant === 'bento-main' ? 'eager' : 'lazy'}
            fetchPriority={card.variant === 'bento-main' ? 'high' : 'auto'}
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}
