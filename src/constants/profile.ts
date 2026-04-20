export const MENU_LIST = [
    '프로필',
    '나의 보유 역량',
    '프로젝트 분석',
    '맞춤 채용 분석',
    '포트폴리오',
    '면접 시뮬레이션',
] as const;

export type ProfileMenuItemType = (typeof MENU_LIST)[number];

/** `/profile?section=` 쿼리와 사이드바 메뉴 라벨 매핑 */
export const MENU_SECTION_SLUG: Record<ProfileMenuItemType, string> = {
    프로필: 'profile',
    '나의 보유 역량': 'competencies',
    '프로젝트 분석': 'project-analysis',
    '맞춤 채용 분석': 'job-analysis',
    포트폴리오: 'portfolio',
    '면접 시뮬레이션': 'interview',
};

export const SECTION_SLUG_TO_MENU = Object.fromEntries(
    (Object.entries(MENU_SECTION_SLUG) as [ProfileMenuItemType, string][]).map(([label, slug]) => [slug, label]),
) as Record<string, ProfileMenuItemType>;

export const PROFILE_CHIP_SURFACE_CLASS = 'rounded-md border border-white/10 bg-white/5';