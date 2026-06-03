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
    portfolioJobId?: number | null; // NONSTOP 포폴 AiJob id(있으면 진행중 페이지가 polling해 PDF 렌더)
    portfolioRetryable?: boolean; // NONSTOP 전원성공이나 포폴 핸드오프 미완(자동 실패) → 재시도 노출(새로고침에도 유지)
    portfolioPending?: boolean; // 핸드오프 in-flight(FastAPI 호출 중) — 폴링 지속·재시도 미노출(retryable과 상호배타)
};
