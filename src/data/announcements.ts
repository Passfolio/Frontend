import { SERVICE_EMAIL } from '@/constants/service';

/** 공지사항 (추후 CMS/API 연동 시 교체) */
export type AnnouncementItemType = {
  id: string;
  /** 표시용 날짜 YYYY-MM-DD */
  date: string;
  title: string;
  /** 짧은 요약 (목록) */
  summary: string;
  /** 본문 단락 */
  paragraphs: string[];
  /** 상단 고정 */
  pinned?: boolean;
};

export const ANNOUNCEMENT_LIST: AnnouncementItemType[] = [
  {
    id: '2026-07-04-service-pause',
    date: '2026-07-04',
    title: 'Passfolio 서비스 일시 중단 및 정식 출시 예고 안내',
    summary: '서버 운영 비용 이슈로 서비스를 일시 중단하며, 2026년 12월 정식 출시를 목표로 재정비합니다.',
    pinned: true,
    // 문단 내 줄바꿈(\n)은 AnnouncementsPage의 whitespace-pre-line으로 렌더링된다
    paragraphs: [
      '안녕하십니까, Passfolio 운영자 김태현입니다.\n본 서비스는 명지대학교(자연) 캡스톤 디자인의 프로젝트입니다.\n2026.06.07 이후 전체 일정을 끝마쳤고, 서버 운영 비용의 이슈로 잠시 중단할 예정입니다.',
      '당분간 운영진은 백엔드와 AI LLM, DevOps 등 개발 공부를 통해 내실을 다질 예정입니다.\n보다 더 비용 효율적이고 최적화된 설계, UX 및 협업적 친화 개발을 위해 성장해서 돌아올 생각입니다.',
      `정식 출시는 2026년 12월부터 진행하고자 합니다.\n보다 더 나은 UX를 위해 고민하고, 현재보다 더 실용적인 방향으로 기능 업그레이드 및 확장해서 돌아오겠습니다.\n문의사항 있으시면, ${SERVICE_EMAIL}으로 문의해주시길 바랍니다.`,
      '감사합니다.',
    ],
  },
  {
    id: '2026-04-01-service',
    date: '2026-04-01',
    title: 'Passfolio 베타 서비스 오픈 안내',
    summary: 'GitHub 연동 기반 포트폴리오 빌더 베타를 시작합니다.',
    pinned: true,
    paragraphs: [
      '안녕하세요. Passfolio 팀입니다.',
      '개발자 맞춤 포트폴리오 생성·분석 기능을 단계적으로 오픈합니다. 베타 기간 동안 피드백을 보내 주시면 서비스 개선에 반영하겠습니다.',
      '문의는 푸터의 고객센터·의견 보내기를 이용해 주세요.',
    ],
  },
  {
    id: '2026-03-20-privacy',
    date: '2026-03-20',
    title: '개인정보 처리방침 개정 예고',
    summary: '서비스 출시에 맞춘 약관·개인정보 처리방침 정비를 진행합니다.',
    paragraphs: [
      '정식 오픈 전 개인정보 처리방침 및 이용약관을 개정할 예정입니다. 개정 시 공지사항과 이메일(가입 시)로 안내드리겠습니다.',
    ],
  },
];
