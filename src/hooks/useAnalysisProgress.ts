import { useCallback, useEffect, useRef, useState } from 'react';
import { getUserBatchStatus } from '@/api/ProjectAnalysis/projectAnalysisApi';
import { getAiJobStatus, type AiJobStatus } from '@/api/AiJob/aiJobApi';
import { API_ENDPOINTS } from '@/api/Http/apiEndpoints';
import type {
    AnalysisBatchStatusType,
    AnalysisStatusType,
} from '@/types/userProjectAnalysis.type';

export type PortfolioJobStateType = {
    status: AiJobStatus; // PENDING | DONE | ERROR
    pdfUrl: string | null;
    errorMessage: string | null;
};

// 개별 repo 완료 SSE(PROJECT_ANALYSIS_STATUS) — 종료(DONE/FAILED) 시에만 푸시.
const SSE_ANALYSIS_EVENT = 'PROJECT_ANALYSIS_STATUS';
// 배치 전체 종료 SSE(PROJECT_ANALYSIS_BATCH_STATUS) — 타임스탬프 보강 위해 GET 재조회 트리거.
const SSE_BATCH_EVENT = 'PROJECT_ANALYSIS_BATCH_STATUS';
const SAFETY_POLL_MS = 4000;

type AnalysisSsePayloadType = {
    analysisId: string;
    batchId: string;
    status: string; // DONE / FAILED
    repoUrl: string;
    cdnUrl: string | null;
    serviceName: string | null;
};

export type UseAnalysisProgressReturnType = {
    status: AnalysisBatchStatusType | null;
    isLoading: boolean;
    errorMessage: string | null;
    portfolioJob: PortfolioJobStateType | null; // NONSTOP 포폴 생성 작업(없으면 null)
    refresh: () => Promise<void>; // 배치 상태 재조회(예: 포폴 핸드오프 재시도 후 portfolioJobId 반영)
};

const toAnalysisStatus = (raw: string): AnalysisStatusType =>
    raw === 'YET' || raw === 'IN_PROGRESS' || raw === 'DONE' || raw === 'FAILED' ? raw : 'IN_PROGRESS';

/**
 * 본인 배치 진행 상태 관리.
 * - 마운트 시 GET(getUserBatchStatus)으로 시드.
 * - SSE(PROJECT_ANALYSIS_STATUS)로 개별 repo 종료를 라이브 반영, 배치 종료 이벤트는 GET 재조회.
 * - allTerminal 전까지 안전 폴링(4초)으로 보강(SSE 끊김 대비), 전원 종료 시 자동 중지.
 */
export function useAnalysisProgress(batchId: string | undefined): UseAnalysisProgressReturnType {
    const [status, setStatus] = useState<AnalysisBatchStatusType | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [portfolioJob, setPortfolioJob] = useState<PortfolioJobStateType | null>(null);

    const statusRef = useRef<AnalysisBatchStatusType | null>(null);
    statusRef.current = status;
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const clearPoll = useCallback(() => {
        if (pollRef.current !== null) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    }, []);

    const refresh = useCallback(async () => {
        if (!batchId) return;
        try {
            const data = await getUserBatchStatus(batchId);
            setStatus(data);
            setErrorMessage(null);
            if (data.allTerminal) clearPoll();
        } catch {
            setErrorMessage('분석 상태를 불러오지 못했습니다.');
        }
    }, [batchId, clearPoll]);

    const ensureSafetyPoll = useCallback(() => {
        if (pollRef.current !== null) return;
        pollRef.current = setInterval(() => {
            if (statusRef.current?.allTerminal) {
                clearPoll();
                return;
            }
            void refresh();
        }, SAFETY_POLL_MS);
    }, [clearPoll, refresh]);

    // 초기 로드
    useEffect(() => {
        if (!batchId) {
            setIsLoading(false);
            setErrorMessage('잘못된 분석 주소입니다.');
            return;
        }
        let cancelled = false;
        setIsLoading(true);
        getUserBatchStatus(batchId)
            .then((data) => {
                if (cancelled) return;
                setStatus(data);
                if (!data.allTerminal) ensureSafetyPoll();
            })
            .catch(() => {
                if (!cancelled) setErrorMessage('분석 상태를 불러오지 못했습니다.');
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });
        return () => {
            cancelled = true;
            clearPoll();
        };
    }, [batchId, ensureSafetyPoll, clearPoll]);

    // SSE 라이브 갱신(쿠키 인증 → withCredentials).
    useEffect(() => {
        if (!batchId) return;
        const base = import.meta.env.VITE_API_BASE_URL || '';
        const url = `${base}${API_ENDPOINTS.projectAnalysis.subscribe}`;
        let es: EventSource | null = null;
        try {
            es = new EventSource(url, { withCredentials: true });
            es.addEventListener(SSE_ANALYSIS_EVENT, (ev) => {
                try {
                    const payload = JSON.parse((ev as MessageEvent).data) as AnalysisSsePayloadType;
                    if (payload.batchId !== batchId) return; // 다른 배치 이벤트 무시
                    setStatus((prev) => {
                        if (!prev) return prev;
                        const nextStatus = toAnalysisStatus(payload.status);
                        const analyses = prev.analyses.map((item) =>
                            item.analysisId === payload.analysisId
                                ? {
                                      ...item,
                                      status: nextStatus,
                                      cdnUrl: payload.cdnUrl ?? item.cdnUrl,
                                      serviceName: payload.serviceName ?? item.serviceName,
                                  }
                                : item,
                        );
                        let yet = 0;
                        let inProgress = 0;
                        let done = 0;
                        let failed = 0;
                        for (const a of analyses) {
                            if (a.status === 'YET') yet += 1;
                            else if (a.status === 'IN_PROGRESS') inProgress += 1;
                            else if (a.status === 'DONE') done += 1;
                            else if (a.status === 'FAILED') failed += 1;
                        }
                        const allTerminal = done + failed === analyses.length && analyses.length > 0;
                        return {
                            ...prev,
                            analyses,
                            counts: { yet, inProgress, done, failed },
                            allTerminal,
                        };
                    });
                } catch {
                    /* malformed event 무시 */
                }
            });
            es.addEventListener(SSE_BATCH_EVENT, (ev) => {
                try {
                    const payload = JSON.parse((ev as MessageEvent).data) as { batchId?: string };
                    if (payload.batchId && payload.batchId !== batchId) return;
                    void refresh(); // 최종 타임스탬프/상태 정합화
                } catch {
                    /* malformed event 무시 */
                }
            });
        } catch {
            es = null;
        }
        return () => {
            if (es) es.close();
        };
    }, [batchId, refresh]);

    // 언마운트 시 폴링 정리
    useEffect(() => clearPoll, [clearPoll]);

    // NONSTOP 포폴 작업 폴링(batch status에 portfolioJobId가 잡히면) — DONE/ERROR까지 4초 주기.
    const portfolioJobId = status?.portfolioJobId ?? null;
    useEffect(() => {
        if (!portfolioJobId) {
            setPortfolioJob(null);
            return;
        }
        let cancelled = false;
        let timer: ReturnType<typeof setTimeout> | null = null;
        const poll = async () => {
            try {
                const j = await getAiJobStatus(portfolioJobId);
                if (cancelled) return;
                setPortfolioJob({ status: j.status, pdfUrl: j.outputPdfS3Url, errorMessage: j.errorMessage });
                if (j.status === 'DONE' || j.status === 'ERROR') return; // 종료 → 폴링 중지
            } catch {
                /* 일시 오류 무시, 다음 폴링에서 재시도 */
            }
            if (!cancelled) timer = setTimeout(poll, SAFETY_POLL_MS);
        };
        void poll();
        return () => {
            cancelled = true;
            if (timer) clearTimeout(timer);
        };
    }, [portfolioJobId]);

    return { status, isLoading, errorMessage, portfolioJob, refresh };
}
