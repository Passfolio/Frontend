import { Link } from 'react-router-dom';
import {
  getLandingFooterInfoSegments,
  LANDING_FOOTER_NAV_LINK_LIST,
  LANDING_LOGO_SRC,
  LANDING_FOOTER_COPYRIGHT_TEXT,
} from '@/constants/landingPage';

function renderFooterSegmentRow(segmentList: string[]) {
  return segmentList.map((segment, index) => (
    <span key={`${segment}-${index}`} className="footer-segment">
      {index > 0 ? (
        <span className="divider" aria-hidden>
          |
        </span>
      ) : null}
      {segment}
    </span>
  ));
}

export const LanderFooter = () => {
  const { firstLineList, secondLineList } = getLandingFooterInfoSegments();
  const hasFooterInfo = firstLineList.length > 0 || secondLineList.length > 0;

  return (
    <footer>
      <div className="landing-shell footer-container">
        <div className="footer-links">
          {LANDING_FOOTER_NAV_LINK_LIST.map((link) =>
            link.href.startsWith('/') ? (
              <Link
                key={link.label}
                to={link.href}
                className={link.isPrivacy ? 'privacy' : undefined}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className={link.isPrivacy ? 'privacy' : undefined}
              >
                {link.label}
              </a>
            ),
          )}
        </div>
        <div className="footer-logo">
          <img
            src={LANDING_LOGO_SRC}
            alt="Passfolio Logo"
            width={160}
            className="object-contain opacity-80 grayscale"
            loading="lazy"
            decoding="async"
          />
          <p className="copyright">{LANDING_FOOTER_COPYRIGHT_TEXT}</p>
        </div>
        {hasFooterInfo ? (
          <div className="footer-info">
            {firstLineList.length > 0 ? renderFooterSegmentRow(firstLineList) : null}
            {firstLineList.length > 0 && secondLineList.length > 0 ? (
              <br className="mobile-break" />
            ) : null}
            {secondLineList.length > 0 ? renderFooterSegmentRow(secondLineList) : null}
          </div>
        ) : null}
      </div>
    </footer>
  );
};
