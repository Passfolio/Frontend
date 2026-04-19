import axios from 'axios';

export type LandingInsightArticleType = {
  id: string;
  imageUrl: string;
  imageAlt: string;
  tag: string;
  title: string;
  excerpt: string;
  dateLabel: string;
  href: string;
};

export const STATIC_LANDING_INSIGHT_LIST: LandingInsightArticleType[] = [
  {
    id: '1',
    imageUrl:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop',
    imageAlt: '팀 미팅 이미지',
    tag: 'Portfolio Strategy',
    title: '합격률을 80% 높이는 개발자 포트폴리오의 구조적 특징',
    excerpt: '수천 개의 합격 데이터를 기반으로 도출한 핵심 구성 요소를 분석합니다.',
    dateLabel: 'Mar 15, 2026',
    href: '#',
  },
  {
    id: '2',
    imageUrl:
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop',
    imageAlt: '인공지능 그래픽 이미지',
    tag: 'AI Technology',
    title: 'LLM 기반 자기소개서, 채용 시스템 검증을 통과하는 원리',
    excerpt: '탐지 시스템의 메커니즘을 이해하고 진정성 있는 텍스트를 구성하는 방법론.',
    dateLabel: 'Mar 10, 2026',
    href: '#',
  },
  {
    id: '3',
    imageUrl:
      'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=800&auto=format&fit=crop',
    imageAlt: '깃허브 코드 이미지',
    tag: 'GitHub Optimization',
    title: '단순 리포지토리를 넘어선 프로젝트 문서화 가이드',
    excerpt: '오픈소스 생태계 기준에 부합하는 README 작성 및 기여 이력 관리 기술.',
    dateLabel: 'Mar 05, 2026',
    href: '#',
  },
];

function isInsightPayloadList(data: unknown): data is LandingInsightArticleType[] {
  if (!Array.isArray(data) || data.length === 0) return false;
  return data.every(
    (row) =>
      row &&
      typeof row === 'object' &&
      typeof (row as LandingInsightArticleType).id === 'string' &&
      typeof (row as LandingInsightArticleType).imageUrl === 'string' &&
      typeof (row as LandingInsightArticleType).title === 'string',
  );
}

export async function fetchLandingInsightList(): Promise<LandingInsightArticleType[]> {
  const url = import.meta.env.VITE_LANDING_INSIGHTS_JSON?.trim();
  if (!url) return STATIC_LANDING_INSIGHT_LIST;

  try {
    const { data } = await axios.get<unknown>(url, {
      timeout: 8000,
      headers: { Accept: 'application/json' },
    });
    if (isInsightPayloadList(data)) return data;
  } catch {
    /* fall through to static */
  }
  return STATIC_LANDING_INSIGHT_LIST;
}
