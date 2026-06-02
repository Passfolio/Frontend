// 프로젝트 분석(ADMIN 테스트 배치/폴링) 관련 응답 타입.
// BE: ProjectAnalysisDto (LocalDateTime은 ISO-8601 문자열로 직렬화 — write-dates-as-timestamps=false)

export type AnalysisStatusType = 'YET' | 'IN_PROGRESS' | 'DONE' | 'FAILED';

// ADMIN 테스트 디스패치 응답
export type AdminDispatchedItemType = {
    analysisId: string;
    repoUrl: string;
    owner: string;
    dispatchSeq: number;
    status: string; // IN_PROGRESS / FAILED(디스패치 실패)
};

export type AdminTestBatchResponseType = {
    batchId: string;
    analyses: AdminDispatchedItemType[];
};

// 호출 계정 기준 디스패치 한도(슬라이더 상한)
export type AdminTestLimitResponseType = {
    maxRepoCount: number;
};

// 배치 상태 폴링 응답
export type BatchStatusCountsType = {
    yet: number;
    inProgress: number;
    done: number;
    failed: number;
};

export type AdminBatchAnalysisItemType = {
    analysisId: string;
    repoUrl: string;
    status: AnalysisStatusType;
    serviceName: string | null;
    cdnUrl: string | null;
    failureReason: string | null;
    createdAt: string;
    lastModifiedAt: string;
};

export type AdminBatchStatusResponseType = {
    batchId: string;
    total: number;
    allTerminal: boolean;
    counts: BatchStatusCountsType;
    analyses: AdminBatchAnalysisItemType[];
};
