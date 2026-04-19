import { LANDING_SERVICE_SECTION } from '@/constants/landingPage';

type LandingServiceSectionProps = {
  cvStageRef: React.RefObject<HTMLDivElement | null>;
  networkCanvasRef: React.RefObject<HTMLCanvasElement | null>;
};

export function LandingServiceSection({
  cvStageRef,
  networkCanvasRef,
}: LandingServiceSectionProps) {
  return (
    <section className="sliding-section" id="service" aria-labelledby="landing-service-title">
      <div className="sliding-container">
        <div className="network-bg-wrapper" aria-hidden>
          <canvas ref={networkCanvasRef} id="networkCanvas" />
        </div>
        <div className="sticky-content reveal-left">
          <h2 id="landing-service-title">
            <span className="text-gradient">{LANDING_SERVICE_SECTION.titleGradient}</span>
            <br />
            {LANDING_SERVICE_SECTION.title}
          </h2>
          <div className="cv-type-stage" ref={cvStageRef} data-cv-typing>
            <p>
              {LANDING_SERVICE_SECTION.descriptionLineList.map((line, index) => (
                <span key={line}>
                  {line}
                  {index < LANDING_SERVICE_SECTION.descriptionLineList.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
          </div>

          <a
            href={LANDING_SERVICE_SECTION.cta.href}
            className="btn-neu"
            aria-label={LANDING_SERVICE_SECTION.cta.label}
          >
            {LANDING_SERVICE_SECTION.cta.label}
          </a>
        </div>
      </div>
    </section>
  );
}
