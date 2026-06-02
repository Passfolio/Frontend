import { useCallback, useEffect, useRef, useState } from 'react';
import { getAdminBatchStatus } from '@/api/AdminPortal/adminAnalysisApi';
import type { AdminBatchStatusResponseType } from '@/types/projectAnalysis.type';

const POLL_INTERVAL_MS = 5000;

export type UseAnalysisBatchPollingReturnType = {
    status: AdminBatchStatusResponseType | null;
    isPolling: boolean;
    errorMessage: string | null;
    startPolling: (batchId: string) => void;
    stopPolling: () => void;
};

/**
 * 배치 상태를 5초 주기로 폴링한다. allTerminal(전원 종료) 응답을 받으면 자동으로 멈춘다.
 * unmount / 새 배치 시작 시 이전 타이머를 정리하고, 늦게 도착한 응답(race)은 무시한다.
 */
export function useAnalysisBatchPolling(): UseAnalysisBatchPollingReturnType {
    const [status, setStatus] = useState<AdminBatchStatusResponseType | null>(null);
    const [isPolling, setIsPolling] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const batchIdRef = useRef<string | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const clearTimer = useCallback(() => {
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const stopPolling = useCallback(() => {
        clearTimer();
        setIsPolling(false);
    }, [clearTimer]);

    const fetchOnce = useCallback(async () => {
        const batchId = batchIdRef.current;
        if (!batchId) return;
        try {
            const data = await getAdminBatchStatus(batchId);
            if (batchIdRef.current !== batchId) return; // 다른 배치로 전환됨 → 폐기
            setStatus(data);
            setErrorMessage(null);
            if (data.allTerminal) {
                clearTimer();
                setIsPolling(false);
            }
        } catch {
            if (batchIdRef.current !== batchId) return;
            setErrorMessage('배치 상태를 불러오지 못했습니다. (엔드포인트 배포 여부를 확인하세요)');
        }
    }, [clearTimer]);

    const startPolling = useCallback(
        (batchId: string) => {
            clearTimer();
            batchIdRef.current = batchId;
            setStatus(null);
            setErrorMessage(null);
            setIsPolling(true);
            void fetchOnce();
            intervalRef.current = setInterval(() => {
                void fetchOnce();
            }, POLL_INTERVAL_MS);
        },
        [clearTimer, fetchOnce],
    );

    useEffect(() => clearTimer, [clearTimer]); // unmount 시 타이머 정리

    return { status, isPolling, errorMessage, startPolling, stopPolling };
}
