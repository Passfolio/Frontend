import landingJdAnalysisImageSrc from '@/assets/image/jd-analysis-optimized.png';
import landingPortfolioImageSrc from '@/assets/image/portfolio-optimized.png';

function trimEnv(value: string | undefined): string {
  return value?.trim() ?? '';
}

function getOptionalLandingHref(value: string | undefined, fallbackHref = '#'): string {
  return trimEnv(value) || fallbackHref;
}

/** Spring Security OAuth2 GitHub authorize endpoint (same origin as API) */
const GITHUB_OAUTH_AUTHORIZE_PATH = '/oauth2/authorization/github';

/**
 * 랜딩 "Connect GitHub" 링크. 기본은 `VITE_API_BASE_URL` + OAuth 경로.
 * `VITE_LANDING_GITHUB_CTA_HREF`가 있으면 그대로 우선(별도 게이트웨이 등).
 */
function getLandingGitHubCtaHref(): string {
  const explicit = trimEnv(import.meta.env.VITE_LANDING_GITHUB_CTA_HREF);
  if (explicit) return explicit;
  const apiBase = trimEnv(import.meta.env.VITE_API_BASE_URL);
  if (!apiBase) return '#';
  const base = apiBase.replace(/\/+$/, '');
  return `${base}${GITHUB_OAUTH_AUTHORIZE_PATH}`;
}

function withRepresentativeLabel(name: string): string {
  if (!name) return '';
  return name.includes('대표') ? name : `대표 ${name}`;
}

function withBusinessRegistrationLabel(value: string): string {
  if (!value) return '';
  return value.includes('등록') ? value : `사업자 등록번호 ${value}`;
}

function withJobReportLabel(value: string): string {
  if (!value) return '';
  return value.includes('신고') || value.includes('직업정보') ? value : `직업정보제공사업 신고번호 ${value}`;
}

function withAddressLabel(value: string): string {
  if (!value) return '';
  return value.startsWith('주소') ? value : `주소지 ${value}`;
}

export const LANDING_LOGO_SRC = '/logo/Passfolio_Main_logo.png';
export const LANDING_DEFAULT_PROFILE_IMAGE_URL = 'https://avatars.githubusercontent.com/u/9919?v=4';

export const LANDING_BENTO_MAIN_IMAGE_URL =
  trimEnv(import.meta.env.VITE_LANDING_BENTO_MAIN_IMAGE_URL) ||
  landingPortfolioImageSrc;

export const LANDING_BENTO_JD_IMAGE_URL =
  trimEnv(import.meta.env.VITE_LANDING_BENTO_JD_IMAGE_URL) ||
  landingJdAnalysisImageSrc;

export const LANDING_BENTO_REPORT_IMAGE_URL =
  trimEnv(import.meta.env.VITE_LANDING_BENTO_REPORT_IMAGE_URL) ||
  'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=600&auto=format&fit=crop';

export type LandingNavLinkType = {
  href: string;
  label: string;
};

export const LANDING_NAV_LINK_LIST: LandingNavLinkType[] = [
  { href: '#documentation', label: 'Documentation' },
  { href: '#service', label: 'Service' },
  { href: '#article', label: 'Article' },
];

export type LandingCtaType = {
  href: string;
  label: string;
};

export const LANDING_HERO_SECTION = {
  badge: 'AI-Powered Builder',
  titlePrefix: 'Elevate Your',
  titleGradient: 'Developer Portfolio',
  description: 'GitHub 연동을 통한 프로젝트 및 기여도 분석, 맞춤형 공고 기반 포트폴리오 생성까지.',
  descriptionSubtext: '당신의 개발자 역량을 증명하는 가장 체계적인 솔루션.',
  primaryCta: {
    href: getOptionalLandingHref(import.meta.env.VITE_LANDING_PRIMARY_CTA_HREF),
    label: 'Start Free Trial',
  },
  secondaryCta: {
    href: getLandingGitHubCtaHref(),
    label: 'Connect GitHub',
  },
} as const satisfies {
  badge: string;
  titlePrefix: string;
  titleGradient: string;
  description: string;
  descriptionSubtext: string;
  primaryCta: LandingCtaType;
  secondaryCta: LandingCtaType;
};

export const LANDING_SERVICE_SECTION = {
  titleGradient: '오직 개발자를 위한',
  title: '포트폴리오',
  howTitle: 'How?',
  descriptionLineList: [
    '단순한 템플릿 텍스트 채우기가 아닙니다.',
    '프로젝트 코드와 기여도를 분석하고,',
    '기업의 요구 역량(JD)에 맞게 경험을 재구성하여',
    '당신의 기술적 의사결정과 문제 해결 과정을 포트폴리오에 정교하게 녹여냅니다.',
  ],
  cta: {
    href: getOptionalLandingHref(import.meta.env.VITE_LANDING_DOCUMENTATION_CTA_HREF),
    label: 'View Documentation',
  },
} as const satisfies {
  titleGradient: string;
  title: string;
  howTitle: string;
  descriptionLineList: string[];
  cta: LandingCtaType;
};

export type LandingFeatureDescriptionPartType = {
  isEmphasis?: boolean;
  text: string;
};

export type LandingFeatureCardType = {
  descriptionPartList: LandingFeatureDescriptionPartType[];
  iconClassName: string;
  title: string;
};

export const LANDING_FEATURE_CARD_LIST: LandingFeatureCardType[] = [
  {
    iconClassName: 'fa-solid fa-code-branch',
    title: '프로젝트 & 기여도 분석',
    descriptionPartList: [
      { isEmphasis: true, text: 'GitHub 계정 연동' },
      { text: '을 통해 사용자의 ' },
      { isEmphasis: true, text: '프로젝트를 다각도로 분석' },
      { text: '하고, 사용자가 직접 ' },
      { isEmphasis: true, text: '작성한 코드와 기여 범위' },
      { text: '를 식별합니다. 이를 통해 각 프로젝트에서 실제로 수행한 역할과 기여를 명확하게 정리하고, ' },
      { isEmphasis: true, text: '기술 선택과 문제 해결 과정이 자연스럽게 드러나도록 구성' },
      { text: '하여 ' },
      { isEmphasis: true, text: '겉으로 보이는 나열이 아닌, 근거 있는 포트폴리오로 완성' },
      { text: '합니다.' },
    ],
  },
  {
    iconClassName: 'fa-solid fa-bullseye',
    title: '기업 공고(JD) 맞춤형 최적화',
    descriptionPartList: [
      { isEmphasis: true, text: '채용 공고를 분석하여' },
      { text: ' 핵심 요구 역량을 추출합니다. 프로젝트 분석 결과와 매칭하여, 각 경험을 ' },
      { isEmphasis: true, text: '기업이 요구하는 역량 기준으로 재구성' },
      { text: '합니다. 이를 통해 ' },
      { isEmphasis: true, text: '지원자의 강점이 명확하게 드러나는 포트폴리오' },
      { text: '를 생성합니다.' },
    ],
  },
  {
    iconClassName: 'fa-solid fa-microchip',
    title: 'LLM 기반 포트폴리오 고도화',
    descriptionPartList: [
      { isEmphasis: true, text: '프로젝트 분석 데이터와 JD 정보를 기반으로 포트폴리오 본문을 생성' },
      { text: '합니다. 생성된 결과는 자동으로 검증되어 모호한 표현, 정량적 근거 부족, 기술적 설명 미흡 등의 문제를 식별하고 ' },
      { isEmphasis: true, text: '개선 방향을 제시' },
      { text: '합니다.' },
    ],
  },
  {
    iconClassName: 'fa-solid fa-comments',
    title: '면접 시뮬레이션',
    descriptionPartList: [
      { isEmphasis: true, text: '포트폴리오와 채용 공고를 기반으로' },
      { text: ' 예상 면접 질문을 생성합니다. 기술적 선택 이유와 문제 해결 과정에 대한 질문을 중심으로 ' },
      { isEmphasis: true, text: '실제 면접 상황을 대비할 수 있도록 지원' },
      { text: '합니다.' },
    ],
  },
];

export const LANDING_RESULT_SECTION = {
  badge: 'Expected Result',
  titleGradient: '결과로 증명하는',
  title: '압도적인 퀄리티',
  description:
    '단순 나열식 이력서가 아닙니다. 기업이 요구하는 형태에 맞춰 당신의 기술적 깊이와 성과를 시각화합니다.',
} as const;

export type LandingBentoCardType = {
  description: string;
  imageAlt: string;
  imageClassName?: string;
  imageUrl: string;
  imageWrapperClassName?: string;
  title: string;
  variant: 'bento-main' | 'bento-sub';
};

export const LANDING_RESULT_CARD_LIST: LandingBentoCardType[] = [
  {
    variant: 'bento-main',
    title: '프리미엄 템플릿 자동 렌더링',
    description: '가독성을 극대화한 UI 구조로 성과를 돋보이게 구성합니다.',
    imageUrl: LANDING_BENTO_MAIN_IMAGE_URL,
    imageAlt: '포트폴리오 프리뷰 이미지',
  },
  {
    variant: 'bento-sub',
    title: 'JD 적합도 분석',
    description:
      '지원 공고의 요구사항과 보유 기술의 매칭률을 시각적 지표로 도출하고, 매칭률 높은 기업 리스트를 제공합니다.',
    imageUrl: LANDING_BENTO_JD_IMAGE_URL,
    imageAlt: '맞춤 채용 공고 분석 이미지',
    imageClassName: 'bento-img-bottom',
    imageWrapperClassName: 'min-h-[180px]',
  },
  {
    variant: 'bento-sub',
    title: '프로젝트 및 기여도 분석 리포트',
    description:
      '프로젝트를 다각도로 분석하고, 실제 코드 기여와 역할을 정량적으로 식별합니다. 이를 통해 기술 선택, 구현 범위, 문제 해결 과정이 드러나는 분석 리포트를 생성합니다.',
    imageUrl: LANDING_BENTO_REPORT_IMAGE_URL,
    imageAlt: '코드 구조 그래픽 이미지',
    imageWrapperClassName: 'min-h-[180px]',
  },
];

export const LANDING_ARTICLE_SECTION = {
  title: 'Insights',
  cta: {
    href: getOptionalLandingHref(import.meta.env.VITE_LANDING_ARTICLE_LIST_HREF),
    label: 'View All',
  },
} as const satisfies {
  title: string;
  cta: LandingCtaType;
};

export const LANDING_FOOTER_COPYRIGHT_TEXT = 'Copyright © 2026 Passfolio. All rights reserved.';

export type LandingFooterNavLinkType = {
  href: string;
  label: string;
  isPrivacy?: boolean;
};

export const LANDING_FOOTER_NAV_LINK_LIST: LandingFooterNavLinkType[] = [
  { href: '/announcements', label: '공지사항' },
  { href: '/faq', label: 'FAQ' },
  { href: '/terms', label: '이용약관' },
  { href: '/privacy', label: '개인정보 처리방침', isPrivacy: true },
];

export type LandingFooterInfoSegmentsType = {
  firstLineList: string[];
  secondLineList: string[];
};

/** Business row + address / 문의 row (demo_home_v3.html). */
export function getLandingFooterInfoSegments(): LandingFooterInfoSegmentsType {
  const representativeName = trimEnv(import.meta.env.VITE_FOOTER_REPRESENTATIVE_NAME);
  const businessRegistrationNumber = trimEnv(
    import.meta.env.VITE_FOOTER_BUSINESS_REGISTRATION_NUMBER,
  );
  const jobInfoReportNumber = trimEnv(
    import.meta.env.VITE_FOOTER_JOB_INFO_SERVICE_REPORT_NUMBER,
  );
  const address = trimEnv(import.meta.env.VITE_FOOTER_ADDRESS);
  const phone = trimEnv(import.meta.env.VITE_FOOTER_CONTACT_PHONE);
  const email = trimEnv(import.meta.env.VITE_FOOTER_CONTACT_EMAIL);

  const firstLineList = [
    withRepresentativeLabel(representativeName),
    withBusinessRegistrationLabel(businessRegistrationNumber),
    withJobReportLabel(jobInfoReportNumber),
  ].filter(Boolean);

  const contactBody = [phone, email].filter(Boolean).join(' / ');
  const contactLine = contactBody ? `문의\u00A0${contactBody}` : '';
  const secondLineList = [withAddressLabel(address), contactLine].filter(Boolean);

  return { firstLineList, secondLineList };
}
