import { useEffect, useState } from 'react';
import { LANDING_HERO_SECTION } from '@/constants/landingPage';

export const LandingHeroSection = () => {
  const [isHeroReady, setIsHeroReady] = useState(false);

  useEffect(() => {
    const animationFrameId = window.requestAnimationFrame(() => {
      setIsHeroReady(true);
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="hero" aria-labelledby="landing-hero-title">
      <div className="hero-glow" aria-hidden />
      <div className="hero-grid" aria-hidden />

      <div className={`hero-content reveal ${isHeroReady ? 'active' : ''}`}>
        <div className={`hero-badge reveal delay-100 ${isHeroReady ? 'active' : ''}`}>
          {LANDING_HERO_SECTION.badge}
        </div>
        <h1 id="landing-hero-title" className={`reveal delay-200 ${isHeroReady ? 'active' : ''}`}>
          {LANDING_HERO_SECTION.titlePrefix}
          <br />
          <span className="text-gradient">{LANDING_HERO_SECTION.titleGradient}</span>
        </h1>
        <p className={`reveal delay-300 ${isHeroReady ? 'active' : ''}`}>
          {LANDING_HERO_SECTION.description}
          <span className="subtitle-block">{LANDING_HERO_SECTION.descriptionSubtext}</span>
        </p>
        <div className={`btn-group reveal delay-300 ${isHeroReady ? 'active' : ''}`}>
          <a
            href={LANDING_HERO_SECTION.primaryCta.href}
            className="btn btn-primary"
            aria-label={LANDING_HERO_SECTION.primaryCta.label}
          >
            {LANDING_HERO_SECTION.primaryCta.label}{' '}
            <i className="fa-solid fa-arrow-right" aria-hidden />
          </a>
          <a
            href={LANDING_HERO_SECTION.secondaryCta.href}
            className="btn btn-glass"
            aria-label={LANDING_HERO_SECTION.secondaryCta.label}
          >
            <i className="fa-brands fa-github" aria-hidden /> {LANDING_HERO_SECTION.secondaryCta.label}
          </a>
        </div>
      </div>
    </section>
  );
};
