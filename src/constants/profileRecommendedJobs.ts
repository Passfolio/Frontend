/** 프로필 추천 채용 공고 UI용 정적 데이터. 백엔드 API 연동 시 교체. */
export type ProfileRecommendedJobItemType = {
  id: string;
  companyName: string;
  jobTitle: string;
  matchPercent: number;
  stackSummary: string;
};

export const PROFILE_RECOMMENDED_JOB_HEADING = '추천 채용 공고 Top 5';

export const PROFILE_RECOMMENDED_JOB_LIST: ProfileRecommendedJobItemType[] = [
  {
    id: 'mock-1',
    companyName: '클라우드웨이브',
    jobTitle: '백엔드 플랫폼 엔지니어',
    matchPercent: 94,
    stackSummary: 'Java · Spring · Kafka',
  },
  {
    id: 'mock-2',
    companyName: '핀페이랩',
    jobTitle: '서버 개발자',
    matchPercent: 91,
    stackSummary: 'Kotlin · Spring · MySQL',
  },
  {
    id: 'mock-3',
    companyName: '머신포스트',
    jobTitle: 'Backend Engineer',
    matchPercent: 88,
    stackSummary: 'Kotlin · Ktor · Redis',
  },
  {
    id: 'mock-4',
    companyName: '스택원',
    jobTitle: 'Java 애플리케이션 개발',
    matchPercent: 85,
    stackSummary: 'Java · Spring · AWS',
  },
  {
    id: 'mock-5',
    companyName: '코드넥스트',
    jobTitle: '플랫폼 백엔드 개발자',
    matchPercent: 82,
    stackSummary: 'TypeScript · NestJS · PostgreSQL',
  },
];
