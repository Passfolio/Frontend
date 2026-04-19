import { LANDING_FEATURE_CARD_LIST, LANDING_SERVICE_SECTION } from '@/constants/landingPage';
import { getRevealDelayClassName } from './landingSectionUtils';

export function LandingHowSection() {
  return (
    <section className="how-section" id="documentation" aria-labelledby="landing-how-title">
      <div className="how-title reveal-left-how">
        <h2 id="landing-how-title">{LANDING_SERVICE_SECTION.howTitle}</h2>
      </div>

      <div className="cards-grid">
        {LANDING_FEATURE_CARD_LIST.map((card, index) => (
          <div key={card.title} className={`reveal-up ${getRevealDelayClassName(index)}`}>
            <div className="feature-card-shell">
              <div className="feature-card neu-card">
                <div className="neu-icon-down">
                  <i className={card.iconClassName} aria-hidden />
                </div>
                <h3>{card.title}</h3>
                <p>
                  {card.descriptionPartList.map((part) =>
                    part.isEmphasis ? (
                      <span key={part.text} className="hover-emphasis">
                        {part.text}
                      </span>
                    ) : (
                      <span key={part.text}>{part.text}</span>
                    ),
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
