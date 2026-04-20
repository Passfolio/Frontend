/** 자주 묻는 질문 (추후 CMS/API 연동 시 교체) */
export type FaqItemType = {
  id: string;
  question: string;
  /** 본문 단락 */
  paragraphs: string[];
};

export const FAQ_LIST: FaqItemType[] = [
  {
    id: 'what-is-passfolio',
    question: 'Passfolio는 어떤 서비스인가요?',
    paragraphs: [
      'GitHub 연동을 통해 프로젝트·기여도를 분석하고, 채용 공고(JD)에 맞춰 경험을 재구성해 개발자 맞춤 포트폴리오를 만드는 서비스입니다.',
    ],
  },
  {
    id: 'github-required',
    question: 'GitHub 계정이 꼭 필요한가요?',
    paragraphs: [
      '핵심 기능은 GitHub OAuth 연동을 기반으로 합니다. 저장소·커밋·기여 정보를 분석하려면 연동이 필요합니다.',
    ],
  },
  {
    id: 'oauth-data',
    question: 'GitHub에서 어떤 정보를 가져오나요?',
    paragraphs: [
      '서비스 제공에 필요한 범위의 공개 프로필·저장소·기여 정보 등을 활용합니다. 세부 항목은 개인정보 처리방침에서 확인하실 수 있습니다.',
    ],
  },
  {
    id: 'account-delete',
    question: '회원 탈퇴는 어떻게 하나요?',
    paragraphs: [
      '로그인 후 프로필·설정 메뉴에서 계정 삭제를 요청할 수 있습니다. 처리 기준과 보관 정책은 이용약관·개인정보 처리방침을 따릅니다.',
    ],
  },
  {
    id: 'beta-contact',
    question: '버그 제보·문의는 어디로 보내면 되나요?',
    paragraphs: [
      '푸터에 안내된 연락처(이메일 등)로 보내 주시거나, 서비스 내 의견 보내기 채널이 제공되면 해당 경로를 이용해 주세요.',
    ],
  },
];
