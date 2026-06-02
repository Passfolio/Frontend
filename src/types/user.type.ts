// ADMIN 회원 관리(유입 집계·목록) 응답 타입.

// 날짜별 가입자 수(사용자 유입 그래프)
export type DailySignupType = {
    date: string; // yyyy-MM-dd
    count: number;
};

// 회원 목록 항목(우선 id·nickname)
export type UserSummaryType = {
    userId: number;
    nickname: string;
};

// 공용 페이지 응답 래퍼(BE PageDto.PageListResponse 대응)
export type PageInfoType = {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
};

export type PageListResponseType<T> = {
    title: string;
    page: PageInfoType;
    content: T[];
};
