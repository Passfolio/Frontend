// 사용자용 프로젝트 분석 — 사전 점검(Precheck) + 분석 시작 응답 타입.
// BE: RepoAvailabilityDto / ProjectAnalysisDto.

import type {
    AnalysisStatusType,
    AdminBatchAnalysisItemType,
    AdminBatchStatusResponseType,
} from '@/types/projectAnalysis.type';

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

// 분석 모드 — NONSTOP=완료 후 포트폴리오 생성, STEP=분석만.
export type AnalysisModeType = 'NONSTOP' | 'STEP';

// 진행중 페이지 — 본인 배치 상태(GET /batch/{batchId}). BE는 admin과 동일 shape 반환이라 타입 재사용.
export type { AnalysisStatusType };
export type AnalysisProgressItemType = AdminBatchAnalysisItemType;
export type AnalysisBatchStatusType = AdminBatchStatusResponseType;
