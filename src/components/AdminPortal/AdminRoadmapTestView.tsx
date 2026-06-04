import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { postRoadmapAssess, pollRoadmapResult } from '@/api/RoadMap/roadmapAssessApi';
import type { RoadmapAssessment } from '@/types/roadmap.type';

const RoadmapTabSection = lazy(() => import('@/components/Profile/RoadmapTabSection'));

type Phase = 'idle' | 'posting' | 'polling' | 'done' | 'error';

const PHASE_LABEL: Record<Phase, string> = {
    idle: '',
    posting: '서버에 분석 요청 중...',
    polling: 'Job 결과 대기 중...',
    done: '',
    error: '',
};

export function AdminRoadmapTestView() {
    const [analysisIdsInput, setAnalysisIdsInput] = useState('');
    const [merge, setMerge] = useState(true);
    const [phase, setPhase] = useState<Phase>('idle');
    const [jobId, setJobId] = useState<number | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [result, setResult] = useState<RoadmapAssessment | null>(null);
    const pollCleanupRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        return () => {
            pollCleanupRef.current?.();
        };
    }, []);

    const handleStart = async () => {
        pollCleanupRef.current?.();
        const analysisIds = analysisIdsInput.split(',').map((s) => s.trim()).filter(Boolean);
        if (analysisIds.length === 0) {
            setErrorMsg('분석 ID를 1개 이상 입력하세요(콤마 구분).');
            setPhase('error');
            return;
        }
        setPhase('posting');
        setErrorMsg(null);
        setResult(null);
        setJobId(null);

        try {
            const { jobId: id } = await postRoadmapAssess(analysisIds, merge);
            setJobId(id);

            setPhase('polling');
            const cleanup = pollRoadmapResult(
                id,
                (data) => {
                    setResult(data);
                    setPhase('done');
                },
                (msg) => {
                    setErrorMsg(msg);
                    setPhase('error');
                },
            );
            pollCleanupRef.current = cleanup;
        } catch (e) {
            setErrorMsg(e instanceof Error ? e.message : '알 수 없는 오류');
            setPhase('error');
        }
    };

    const isRunning = phase === 'posting' || phase === 'polling';

    return (
        <div className="flex flex-col gap-6">
            {/* 컨트롤 영역 */}
            <div className="flex flex-col gap-3 rounded-xl border border-white/8 bg-[#16171a] p-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-zinc-400">완료된 분석 ID (콤마 구분)</label>
                    <input
                        type="text"
                        value={analysisIdsInput}
                        onChange={(e) => setAnalysisIdsInput(e.target.value)}
                        disabled={isRunning}
                        placeholder="예: 2f1ac9fd-..., 957e7ab9-..."
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white/20 disabled:opacity-50"
                    />
                    <label className="flex items-center gap-2 text-xs text-zinc-400">
                        <input type="checkbox" checked={merge} onChange={(e) => setMerge(e.target.checked)} disabled={isRunning} className="accent-white" />
                        merge (여러 분석을 하나로 합쳐 평가)
                    </label>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => void handleStart()}
                        disabled={isRunning}
                        className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.07] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isRunning ? (
                            <i className="fa-solid fa-spinner animate-spin" />
                        ) : (
                            <i className="fa-solid fa-play" />
                        )}
                        로드맵 테스트 실행
                    </button>
                    {(phase === 'done' || phase === 'error') && (
                        <button
                            type="button"
                            onClick={() => { setPhase('idle'); setResult(null); setErrorMsg(null); setJobId(null); }}
                            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-400 transition-colors hover:text-white"
                        >
                            초기화
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                    {jobId && (
                        <span>
                            <span className="text-zinc-400">Job ID: </span>
                            <code className="text-zinc-300">{jobId}</code>
                        </span>
                    )}
                </div>

                {isRunning && (
                    <p className="flex items-center gap-2 text-xs text-zinc-400">
                        <i className="fa-solid fa-circle-notch animate-spin" />
                        {PHASE_LABEL[phase]}
                    </p>
                )}

                {phase === 'error' && errorMsg && (
                    <p className="flex items-center gap-2 text-xs text-red-400">
                        <i className="fa-solid fa-triangle-exclamation" />
                        {errorMsg}
                    </p>
                )}
            </div>

            {/* 결과 영역 */}
            {phase === 'done' && result && (
                <Suspense fallback={
                    <div className="flex items-center justify-center gap-2 py-10 text-sm text-zinc-500">
                        <i className="fa-solid fa-spinner animate-spin" />
                        로드맵 렌더링 중...
                    </div>
                }>
                    <RoadmapTabSection data={result} />
                </Suspense>
            )}
        </div>
    );
}
