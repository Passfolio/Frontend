import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LanderFooter } from '@/components/Lander/LanderFooter';
import { useAnalysisBatchPolling } from '@/hooks/AdminPortal/useAnalysisBatchPolling';
import { dispatchAdminTestBatch, getAdminTestLimit } from '@/api/AdminPortal/adminAnalysisApi';
import {
    ANALYSIS_TEST_REPO_POOL_SIZE,
    ANALYSIS_TEST_REPO_DEFAULT_COUNT,
    pickRepoUrlList,
} from '@/constants/analysisTestRepos';
import { ADMIN_PORTAL_PROFILE_PATH } from '@/constants/adminPortal';
import type {
    AnalysisStatusType,
    AdminDispatchedItemType,
    AdminBatchAnalysisItemType,
    BatchStatusCountsType,
} from '@/types/projectAnalysis.type';
import '@/pages/Lander/landerPage.css';

type StatusMetaType = {
    label: string;
    badgeClassName: string;
    dotClassName: string;
};

const STATUS_META: Record<AnalysisStatusType, StatusMetaType> = {
    YET: {
        label: '대기',
        badgeClassName: 'border-white/12 bg-white/[0.06] text-zinc-300',
        dotClassName: 'bg-zinc-400',
    },
    IN_PROGRESS: {
        label: '진행중',
        badgeClassName: 'border-sky-400/25 bg-sky-400/10 text-sky-200',
        dotClassName: 'bg-sky-400',
    },
    DONE: {
        label: '성공',
        badgeClassName: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200',
        dotClassName: 'bg-emerald-400',
    },
    FAILED: {
        label: '실패',
        badgeClassName: 'border-red-400/25 bg-red-400/10 text-red-200',
        dotClassName: 'bg-red-400',
    },
};

const toAnalysisStatus = (raw: string): AnalysisStatusType =>
    raw === 'YET' || raw === 'IN_PROGRESS' || raw === 'DONE' || raw === 'FAILED' ? raw : 'IN_PROGRESS';

const shortenRepoUrl = (repoUrl: string): string =>
    repoUrl.replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');

const formatElapsed = (fromIso: string, toMs: number): string => {
    const fromMs = new Date(fromIso).getTime();
    if (Number.isNaN(fromMs)) return '-';
    const totalSeconds = Math.max(0, Math.floor((toMs - fromMs) / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
};

const deriveCountsFromDispatched = (dispatchedList: AdminDispatchedItemType[]): BatchStatusCountsType => {
    let inProgress = 0;
    let failed = 0;
    for (const item of dispatchedList) {
        if (item.status === 'FAILED') failed += 1;
        else inProgress += 1;
    }
    return { yet: 0, inProgress, done: 0, failed };
};

const StatusBadge = ({ status }: { status: AnalysisStatusType }) => {
    const meta = STATUS_META[status];
    return (
        <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.badgeClassName}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClassName}`} aria-hidden="true" />
            {meta.label}
        </span>
    );
};

const MetricCounter = ({ label, value, accentClassName }: { label: string; value: number; accentClassName?: string }) => (
    <div className="rounded-xl border border-white/[0.08] bg-[#101114]/80 px-3 py-3 text-center sm:px-4">
        <p className="text-[0.65rem] font-medium uppercase tracking-wide text-zinc-500">{label}</p>
        <p className={`mt-1 text-xl font-semibold tabular-nums sm:text-2xl ${accentClassName ?? 'text-white'}`}>{value}</p>
    </div>
);

export const AdminAnalysisMetricsPage = () => {
    const [repoCount, setRepoCount] = useState<number>(ANALYSIS_TEST_REPO_DEFAULT_COUNT);
    const [maxRepoCount, setMaxRepoCount] = useState<number>(ANALYSIS_TEST_REPO_DEFAULT_COUNT);
    const [isEvenSpread, setIsEvenSpread] = useState<boolean>(true);
    const [dispatchedList, setDispatchedList] = useState<AdminDispatchedItemType[]>([]);
    const [isDispatching, setIsDispatching] = useState<boolean>(false);
    const [dispatchErrorMessage, setDispatchErrorMessage] = useState<string | null>(null);
    const [nowMs, setNowMs] = useState<number>(() => Date.now());

    const { status, isPolling, errorMessage, startPolling } = useAnalysisBatchPolling();

    // 호출 계정의 디스패치 한도를 받아 슬라이더 상한에 반영(privileged=300, 그 외=11).
    // 엔드포인트 미배포/오류 시 보수적으로 기본 한도(11) 유지.
    useEffect(() => {
        let isCancelled = false;
        getAdminTestLimit()
            .then((res) => {
                if (isCancelled) return;
                setMaxRepoCount(res.maxRepoCount);
                setRepoCount((prev) => Math.min(prev, res.maxRepoCount));
            })
            .catch(() => {
                // 한도 조회 실패 → 기본값 유지(슬라이더 11)
            });
        return () => {
            isCancelled = true;
        };
    }, []);

    // 진행 중에는 1초 틱으로 경과시간을 부드럽게 갱신(폴링은 5초 주기라 표시만 보강).
    useEffect(() => {
        if (!isPolling) return;
        const tickId = setInterval(() => setNowMs(Date.now()), 1000);
        return () => clearInterval(tickId);
    }, [isPolling]);

    const handleStartTest = async () => {
        setIsDispatching(true);
        setDispatchErrorMessage(null);
        try {
            const repoUrlList = pickRepoUrlList(repoCount, isEvenSpread);
            const result = await dispatchAdminTestBatch(repoUrlList);
            setDispatchedList(result.analyses);
            setNowMs(Date.now());
            startPolling(result.batchId);
        } catch {
            setDispatchErrorMessage('테스트 디스패치에 실패했습니다. 로그인·ADMIN 권한 상태를 확인하세요.');
        } finally {
            setIsDispatching(false);
        }
    };

    const statusByAnalysisId = useMemo(() => {
        const map = new Map<string, AdminBatchAnalysisItemType>();
        status?.analyses.forEach((item) => map.set(item.analysisId, item));
        return map;
    }, [status]);

    const total = status?.total ?? dispatchedList.length;
    const counts = status?.counts ?? deriveCountsFromDispatched(dispatchedList);
    const terminalCount = counts.done + counts.failed;
    const progressPercent = total > 0 ? Math.round((terminalCount / total) * 100) : 0;
    const isControlDisabled = isDispatching || isPolling;
    const isStarted = dispatchedList.length > 0;

    const rowList = useMemo(
        () =>
            [...dispatchedList]
                .sort((a, b) => a.dispatchSeq - b.dispatchSeq)
                .map((item) => {
                    const live = statusByAnalysisId.get(item.analysisId) ?? null;
                    return {
                        analysisId: item.analysisId,
                        dispatchSeq: item.dispatchSeq,
                        repoUrl: item.repoUrl,
                        rowStatus: toAnalysisStatus(live?.status ?? item.status),
                        serviceName: live?.serviceName ?? null,
                        cdnUrl: live?.cdnUrl ?? null,
                        failureReason: live?.failureReason ?? null,
                        createdAt: live?.createdAt ?? null,
                        lastModifiedAt: live?.lastModifiedAt ?? null,
                    };
                }),
        [dispatchedList, statusByAnalysisId],
    );

    return (
        <div className="flex min-h-screen flex-col bg-[#0d0d0f] text-white">
            <main className="relative z-[1] mx-auto w-full max-w-[960px] flex-1 px-4 pb-20 pt-24 md:px-6 md:pt-28">
                <header className="mb-8">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                        Admin · 프로젝트 분석 테스트
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                        프로젝트 분석 지표
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">
                        공개 repo를 N개 동시 디스패치하고, 배치 진행 상태를 5초 주기로 폴링해 표시합니다.
                    </p>
                </header>

                {/* 컨트롤 카드 */}
                <section
                    aria-labelledby="analysis-test-control-heading"
                    className="rounded-2xl border border-white/[0.08] bg-[#141518]/90 p-5 sm:p-6"
                >
                    <h2 id="analysis-test-control-heading" className="text-base font-semibold text-white">
                        테스트 디스패치
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        선택한 repo만큼 실제 분석이 디스패치됩니다(비용 발생). 기본 {ANALYSIS_TEST_REPO_DEFAULT_COUNT}개 권장.
                    </p>

                    <div className="mt-5 flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="repo-count" className="flex items-center justify-between text-sm text-zinc-300">
                                <span>Repo 개수</span>
                                <span className="font-semibold tabular-nums text-white">{repoCount}개</span>
                            </label>
                            <input
                                id="repo-count"
                                type="range"
                                min={1}
                                max={maxRepoCount}
                                value={repoCount}
                                disabled={isControlDisabled}
                                onChange={(event) => setRepoCount(Number(event.target.value))}
                                className="w-full accent-white disabled:opacity-40"
                            />
                            <p className="text-xs text-zinc-600">
                                1 ~ {maxRepoCount}개 (큐레이션 풀 {ANALYSIS_TEST_REPO_POOL_SIZE}개
                                {maxRepoCount > ANALYSIS_TEST_REPO_POOL_SIZE ? ', 초과 시 반복 사용' : ''})
                            </p>
                        </div>

                        <label className="flex items-center gap-3 text-sm text-zinc-300">
                            <input
                                type="checkbox"
                                checked={isEvenSpread}
                                disabled={isControlDisabled}
                                onChange={(event) => setIsEvenSpread(event.target.checked)}
                                className="h-4 w-4 accent-white disabled:opacity-40"
                            />
                            <span>프레임워크 골고루 섞기</span>
                        </label>

                        <div>
                            <button
                                type="button"
                                onClick={handleStartTest}
                                disabled={isControlDisabled}
                                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/[0.10] px-5 py-2 text-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-white/[0.16] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {isDispatching ? '디스패치 중…' : isPolling ? '진행 중…' : '테스트 시작'}
                            </button>
                        </div>

                        {dispatchErrorMessage && (
                            <p className="text-sm text-red-400">{dispatchErrorMessage}</p>
                        )}
                    </div>
                </section>

                {/* 라이브 메트릭 */}
                {isStarted && (
                    <section aria-labelledby="analysis-metrics-heading" className="mt-8">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h2 id="analysis-metrics-heading" className="text-base font-semibold text-white">
                                진행 메트릭
                            </h2>
                            <span className="text-xs text-zinc-500">
                                {isPolling ? '5초 주기 폴링 중' : status?.allTerminal ? '완료' : '대기'}
                            </span>
                        </div>

                        {errorMessage && (
                            <p className="mt-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
                                {errorMessage}
                            </p>
                        )}

                        {/* 카운터 */}
                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                            <MetricCounter label="전체" value={total} />
                            <MetricCounter label="대기" value={counts.yet} accentClassName="text-zinc-300" />
                            <MetricCounter label="진행중" value={counts.inProgress} accentClassName="text-sky-300" />
                            <MetricCounter label="성공" value={counts.done} accentClassName="text-emerald-300" />
                            <MetricCounter label="실패" value={counts.failed} accentClassName="text-red-300" />
                        </div>

                        {/* 진행률 바 */}
                        <div className="mt-4">
                            <div className="flex items-center justify-between text-xs text-zinc-500">
                                <span>진행률</span>
                                <span className="tabular-nums">
                                    {terminalCount}/{total} ({progressPercent}%)
                                </span>
                            </div>
                            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                                <div
                                    className="h-full rounded-full bg-emerald-400/70 transition-[width] duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>

                        {/* repo별 상태 리스트 */}
                        <ul className="mt-5 flex list-none flex-col gap-2 p-0">
                            {rowList.map((row) => (
                                <li
                                    key={row.analysisId}
                                    className="flex flex-col gap-2 rounded-xl border border-white/[0.08] bg-[#101114]/70 px-4 py-3 md:flex-row md:items-center md:justify-between"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="shrink-0 text-xs tabular-nums text-zinc-600">
                                            #{row.dispatchSeq + 1}
                                        </span>
                                        <a
                                            href={row.repoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="truncate text-sm text-zinc-200 transition-colors hover:text-white"
                                        >
                                            {shortenRepoUrl(row.repoUrl)}
                                        </a>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 md:shrink-0 md:justify-end">
                                        {row.rowStatus === 'DONE' && row.serviceName && (
                                            <span className="truncate text-xs text-zinc-400">{row.serviceName}</span>
                                        )}
                                        {row.rowStatus === 'DONE' && row.cdnUrl && (
                                            <a
                                                href={row.cdnUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-emerald-300 underline-offset-2 hover:underline"
                                            >
                                                결과 보기
                                            </a>
                                        )}
                                        {row.rowStatus === 'FAILED' && row.failureReason && (
                                            <span className="max-w-[16rem] truncate text-xs text-red-300/90" title={row.failureReason}>
                                                {row.failureReason}
                                            </span>
                                        )}
                                        {row.createdAt && (
                                            <span className="text-xs tabular-nums text-zinc-500">
                                                {formatElapsed(
                                                    row.createdAt,
                                                    row.rowStatus === 'DONE' || row.rowStatus === 'FAILED'
                                                        ? new Date(row.lastModifiedAt ?? row.createdAt).getTime()
                                                        : nowMs,
                                                )}
                                            </span>
                                        )}
                                        <StatusBadge status={row.rowStatus} />
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {/* 완료 요약 */}
                        {status?.allTerminal && (
                            <p className="mt-5 rounded-xl border border-white/[0.08] bg-[#101114]/70 px-4 py-3 text-sm text-zinc-300">
                                완료 · 총 {total}개 · 성공 {counts.done} · 실패 {counts.failed}
                            </p>
                        )}
                    </section>
                )}

                <div className="mt-12">
                    <Link
                        to={ADMIN_PORTAL_PROFILE_PATH}
                        className="text-sm text-zinc-500 transition-colors hover:text-white"
                    >
                        ← 관리자 홈으로
                    </Link>
                </div>
            </main>

            <LanderFooter />
        </div>
    );
};
