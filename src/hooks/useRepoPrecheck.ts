import { useCallback, useEffect, useRef, useState } from 'react';
import {
    getRepoPrecheckStatus,
    postRepoPrecheck,
    postStartAnalysis,
} from '@/api/ProjectAnalysis/projectAnalysisApi';
import { API_ENDPOINTS } from '@/api/Http/apiEndpoints';
import type {
    PrecheckItemType,
    PrecheckStatusType,
    PrecheckSsePayloadType,
    PrecheckStartResponseType,
    AnalysisStartResponseType,
} from '@/types/userProjectAnalysis.type';

// 점검 디스패처(기본: 사용자 /precheck). admin 테스트 페이지는 admin 엔드포인트 디스패처를 주입.
type PrecheckDispatcherType = (repoUrlList: string[]) => Promise<PrecheckStartResponseType>;

const SSE_EVENT = 'PROJECT_ANALYSIS_PRECHECK_STATUS';
const SAFETY_POLL_MS = 4000;

export type RepoPrecheckStateType = {
    status: PrecheckStatusType;
    worktreeMb: number | null;
    gitHistoryMb: number | null;
    reason: string | null;
};

export type UseRepoPrecheckReturnType = {
    statusMap: Record<string, RepoPrecheckStateType>; // repoUrl → 상태
    isLoading: boolean;
    errorMessage: string | null;
    startPrecheck: (repoUrlList: string[]) => Promise<void>;
    startAnalysis: (repoUrlList: string[], mode?: string) => Promise<AnalysisStartResponseType>;
};

const toState = (item: {
    status: PrecheckStatusType;
    worktreeMb: number | null;
    gitHistoryMb: number | null;
    reason: string | null;
}): RepoPrecheckStateType => ({
    status: item.status,
    worktreeMb: item.worktreeMb,
    gitHistoryMb: item.gitHistoryMb,
    reason: item.reason,
});

/**
 * repo 사전 점검 상태 관리.
 * - 마운트 시 GET으로 현재 상태 시드.
 * - SSE(PROJECT_ANALYSIS_PRECHECK_STATUS)로 라이브 갱신(설계 기본).
 * - CHECKING이 하나라도 있으면 안전 폴링(4초)으로 보강 — SSE 끊김 대비, 전원 종료 시 자동 중지.
 */
export function useRepoPrecheck(dispatcher: PrecheckDispatcherType = postRepoPrecheck): UseRepoPrecheckReturnType {
    const [statusMap, setStatusMap] = useState<Record<string, RepoPrecheckStateType>>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const statusMapRef = useRef<Record<string, RepoPrecheckStateType>>(statusMap);
    statusMapRef.current = statusMap;
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const applyItems = useCallback((items: PrecheckItemType[]) => {
        setStatusMap((prev) => {
            const next = { ...prev };
            for (const item of items) next[item.repoUrl] = toState(item);
            return next;
        });
    }, []);

    const refresh = useCallback(async () => {
        try {
            applyItems(await getRepoPrecheckStatus());
            setErrorMessage(null);
        } catch {
            setErrorMessage('점검 상태를 불러오지 못했습니다.');
        }
    }, [applyItems]);

    const clearPoll = useCallback(() => {
        if (pollRef.current !== null) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    }, []);

    const ensureSafetyPoll = useCallback(() => {
        if (pollRef.current !== null) return;
        pollRef.current = setInterval(() => {
            const anyChecking = Object.values(statusMapRef.current).some((s) => s.status === 'CHECKING');
            if (!anyChecking) {
                clearPoll();
                return;
            }
            void refresh();
        }, SAFETY_POLL_MS);
    }, [clearPoll, refresh]);

    // 초기 상태 로드
    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        getRepoPrecheckStatus()
            .then((items) => {
                if (!cancelled) applyItems(items);
            })
            .catch(() => {
                if (!cancelled) setErrorMessage('점검 상태를 불러오지 못했습니다.');
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [applyItems]);

    // SSE 라이브 업데이트(쿠키 인증 → withCredentials). 끊김은 안전 폴링이 보강.
    useEffect(() => {
        const base = import.meta.env.VITE_API_BASE_URL || '';
        const url = `${base}${API_ENDPOINTS.projectAnalysis.subscribe}`;
        let es: EventSource | null = null;
        try {
            es = new EventSource(url, { withCredentials: true });
            es.addEventListener(SSE_EVENT, (ev) => {
                try {
                    const payload = JSON.parse((ev as MessageEvent).data) as PrecheckSsePayloadType;
                    setStatusMap((prev) => ({ ...prev, [payload.repoUrl]: toState(payload) }));
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
    }, []);

    // 언마운트 시 폴링 정리
    useEffect(() => clearPoll, [clearPoll]);

    const startPrecheck = useCallback(
        async (repoUrlList: string[]) => {
            setErrorMessage(null);
            try {
                const res = await dispatcher(repoUrlList);
                applyItems(res.items); // 즉시 CHECKING 반영
                ensureSafetyPoll();
            } catch (e) {
                setErrorMessage('사전 점검 요청에 실패했습니다.');
                throw e;
            }
        },
        [applyItems, ensureSafetyPoll, dispatcher],
    );

    const startAnalysis = useCallback(
        (repoUrlList: string[], mode?: string) => postStartAnalysis(repoUrlList, mode),
        [],
    );

    return { statusMap, isLoading, errorMessage, startPrecheck, startAnalysis };
}
