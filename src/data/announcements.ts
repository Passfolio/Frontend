/** 공지사항 (추후 CMS/API 연동 시 교체) */
export type AnnouncementItem = {
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

export const ANNOUNCEMENT_LIST: AnnouncementItem[] = [
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
