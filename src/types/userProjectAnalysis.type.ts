// 사용자용 프로젝트 분석 — 사전 점검(Precheck) + 분석 시작 응답 타입.
// BE: RepoAvailabilityDto / ProjectAnalysisDto.

export type PrecheckStatusType = 'CHECKING' | 'AVAILABLE' | 'DISABLED';

// 사전 점검 항목(GET /precheck, POST /precheck 응답 items)
export type PrecheckItemType = {
    precheckId: string;
    repoUrl: string;
    status: PrecheckStatusType;
    worktreeMb: number | null;
    gitHistoryMb: number | null;
    reason: string | null;
    lastModifiedAt: string | null;
};

export type PrecheckStartResponseType = {
    items: PrecheckItemType[];
};

// SSE 페이로드(event: PROJECT_ANALYSIS_PRECHECK_STATUS)
export type PrecheckSsePayloadType = {
    repoUrl: string;
    status: PrecheckStatusType;
    worktreeMb: number | null;
    gitHistoryMb: number | null;
    reason: string | null;
};

// 분석 시작(POST /start) 응답
export type AnalysisDispatchedItemType = {
    analysisId: string;
    repoUrl: string;
    status: string;
};

export type AnalysisStartResponseType = {
    batchId: string;
    analyses: AnalysisDispatchedItemType[];
};
