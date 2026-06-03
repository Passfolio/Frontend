import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { postRoadmapAssess, streamRoadmapJob } from '@/api/RoadMap/roadmapAssessApi';
import type { RoadmapAssessment } from '@/types/roadmap.type';

const RoadmapTabSection = lazy(() => import('@/components/Profile/RoadmapTabSection'));

const CDN_JSON_URL = 'https://cdn.passfolio.dev/analyses/hooby/deokive-be-youcu-1/final.json';

type Phase = 'idle' | 'fetching' | 'posting' | 'streaming' | 'done' | 'error';

const PHASE_LABEL: Record<Phase, string> = {
    idle: '',
    fetching: 'CDN JSON 로드 중...',
    posting: '서버에 분석 요청 중...',
    streaming: 'Job 결과 수신 중...',
    done: '',
    error: '',
};

export function AdminRoadmapTestView() {
    const [phase, setPhase] = useState<Phase>('idle');
    const [jobId, setJobId] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [result, setResult] = useState<RoadmapAssessment | null>(null);
    const esCleanupRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        return () => {
            esCleanupRef.current?.();
        };
    }, []);

    const handleStart = async () => {
        esCleanupRef.current?.();
        setPhase('fetching');
        setErrorMsg(null);
        setResult(null);
        setJobId(null);

        try {
            const cdnRes = await fetch(CDN_JSON_URL);
            if (!cdnRes.ok) throw new Error(`CDN 로드 실패: ${cdnRes.status}`);
            const cdnJson: unknown = await cdnRes.json();

            setPhase('posting');
            const { job_id } = await postRoadmapAssess(cdnJson);
            setJobId(job_id);

            setPhase('streaming');
            const cleanup = streamRoadmapJob(
                job_id,
                (data) => {
                    setResult(data);
                    setPhase('done');
                },
                (msg) => {
                    setErrorMsg(msg);
                    setPhase('error');
                },
            );
            esCleanupRef.current = cleanup;
        } catch (e) {
            setErrorMsg(e instanceof Error ? e.message : '알 수 없는 오류');
            setPhase('error');
        }
    };

    const isRunning = phase === 'fetching' || phase === 'posting' || phase === 'streaming';

    return (
        <div className="flex flex-col gap-6">
            {/* 컨트롤 영역 */}
            <div className="flex flex-col gap-3 rounded-xl border border-white/8 bg-[#16171a] p-4">
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
                    <span>
                        <span className="text-zinc-400">소스: </span>
                        <code className="text-zinc-300">{CDN_JSON_URL}</code>
                    </span>
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
