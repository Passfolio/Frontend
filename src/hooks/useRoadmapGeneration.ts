import { useCallback, useEffect, useRef, useState } from 'react';
import { getAnalysisHistory } from '@/api/ProjectAnalysis/projectAnalysisApi';
import { postRoadmapAssess, pollRoadmapResult } from '@/api/RoadMap/roadmapAssessApi';
import type { AnalysisHistoryItemType } from '@/types/userProjectAnalysis.type';
import type { RoadmapAssessment } from '@/types/roadmap.type';

export type RoadmapPhase = 'select' | 'generating' | 'done';

export type UseRoadmapGenerationOptions = {
  /** false면 분석 이력(getAnalysisHistory) 조회를 건너뛴다 (부모가 이미 데이터를 제공할 때). */
  enabled?: boolean;
};

export type UseRoadmapGeneration = {
  phase: RoadmapPhase;
  history: AnalysisHistoryItemType[];
  historyLoading: boolean;
  selectedIds: Set<string>;
  toggleSelect: (id: string) => void;
  data: RoadmapAssessment | null;
  error: string | null;
  activeRole: string;
  setActiveRole: (role: string) => void;
  generate: () => Promise<void>;
  reset: () => void;
};

/**
 * 분석 선택 → 로드맵 생성 → 결과 폴링 위상 머신을 캡슐화한 훅.
 * 마운트 시 완료(DONE) 분석 이력을 불러와 전체 기본 선택하고, generate()로
 * BE 릴레이(postRoadmapAssess)를 호출한 뒤 결과(pollRoadmapResult)를 폴링한다.
 */
export function useRoadmapGeneration(
  { enabled = true }: UseRoadmapGenerationOptions = {},
): UseRoadmapGeneration {
  /* 분석 선택 → 생성 → 렌더 위상 머신 */
  const [phase, setPhase] = useState<RoadmapPhase>('select');

  /* 선택 화면 상태 */
  const [history, setHistory] = useState<AnalysisHistoryItemType[]>([]);
  const [historyLoading, setHistoryLoading] = useState(enabled);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  /* 결과 / 에러 상태 */
  const [data, setData] = useState<RoadmapAssessment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState('');

  /* 폴링 중단 함수 보관 — 언마운트/재생성 시 호출 */
  const stopPollRef = useRef<(() => void) | null>(null);

  /* 마운트 시: 완료(DONE) 분석 이력 로드 + 전체 기본 선택 (enabled일 때만) */
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    setHistoryLoading(true);
    getAnalysisHistory()
      .then((items) => {
        if (!alive) return;
        const done = items.filter((it) => it.status === 'DONE');
        setHistory(done);
        setSelectedIds(new Set(done.map((it) => it.analysisId)));
      })
      .catch((e: Error) => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setHistoryLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [enabled]);

  /* 언마운트 시 폴링 정리 */
  useEffect(() => {
    return () => {
      stopPollRef.current?.();
    };
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const generate = useCallback(async () => {
    if (selectedIds.size === 0) return;
    /* 진행 중인 이전 폴링이 있으면 먼저 중단 */
    stopPollRef.current?.();
    stopPollRef.current = null;

    setError(null);
    setData(null);
    setPhase('generating');

    try {
      const { jobId } = await postRoadmapAssess([...selectedIds], true);
      stopPollRef.current = pollRoadmapResult(
        jobId,
        (res) => {
          setData(res);
          setActiveRole(res.primary_roles[0] ?? '');
          setPhase('done');
        },
        (msg) => {
          setError(msg);
          setPhase('select');
        },
      );
    } catch (e) {
      setError((e as Error).message);
      setPhase('select');
    }
  }, [selectedIds]);

  const reset = useCallback(() => {
    stopPollRef.current?.();
    stopPollRef.current = null;
    setData(null);
    setError(null);
    setPhase('select');
  }, []);

  return {
    phase,
    history,
    historyLoading,
    selectedIds,
    toggleSelect,
    data,
    error,
    activeRole,
    setActiveRole,
    generate,
    reset,
  };
}
