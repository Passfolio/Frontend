import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LanderFooter } from '@/components/Lander/LanderFooter';
import { useAnalysisProgress } from '@/hooks/useAnalysisProgress';
import { retryPortfolioHandoff } from '@/api/ProjectAnalysis/projectAnalysisApi';
import type { AnalysisStatusType } from '@/types/userProjectAnalysis.type';
import '@/pages/Lander/landerPage.css';

type StatusMetaType = { label: string; badgeClassName: string; dotClassName: string };

const STATUS_META: Record<AnalysisStatusType, StatusMetaType> = {
    YET: { label: '대기', badgeClassName: 'border-white/12 bg-white/[0.06] text-zinc-300', dotClassName: 'bg-zinc-400' },
    IN_PROGRESS: { label: '진행중', badgeClassName: 'border-sky-400/25 bg-sky-400/10 text-sky-200', dotClassName: 'bg-sky-400 animate-pulse' },
    DONE: { label: '완료', badgeClassName: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200', dotClassName: 'bg-emerald-400' },
    FAILED: { label: '실패', badgeClassName: 'border-red-400/25 bg-red-400/10 text-red-200', dotClassName: 'bg-red-400' },
};

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

const StatusBadge = ({ status }: { status: AnalysisStatusType }) => {
    const meta = STATUS_META[status];
    return (
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.badgeClassName}`}>
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

export const AnalysisProgressPage = () => {
    const { batchId } = useParams<{ batchId: string }>();
    const { status, isLoading, errorMessage, portfolioJob, refresh } = useAnalysisProgress(batchId);
    const [nowMs, setNowMs] = useState<number>(() => Date.now());
    const [isRetrying, setIsRetrying] = useState<boolean>(false);
    const [retryError, setRetryError] = useState<string | null>(null);

    const isRunning = status != null && !status.allTerminal;

    // 자동 핸드오프가 실패한 배치의 포폴 생성 수동 재시도 → 성공 시 새 portfolioJobId를 재조회로 반영.
    const handleRetryPortfolio = useCallback(async () => {
        if (!batchId || isRetrying) return;
        setIsRetrying(true);
        setRetryError(null);
        try {
            await retryPortfolioHandoff(batchId);
            await refresh();
        } catch {
            setRetryError('포트폴리오 생성 재시도에 실패했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsRetrying(false);
        }
    }, [batchId, isRetrying, refresh]);

    // 진행 중에는 1초 틱으로 경과 시간을 부드럽게 갱신.
    useEffect(() => {
        if (!isRunning) return;
        const tickId = setInterval(() => setNowMs(Date.now()), 1000);
        return () => clearInterval(tickId);
    }, [isRunning]);

    const counts = status?.counts ?? { yet: 0, inProgress: 0, done: 0, failed: 0 };
    const total = status?.total ?? 0;
    const terminalCount = counts.done + counts.failed;
    const progressPercent = total > 0 ? Math.round((terminalCount / total) * 100) : 0;

    const rowList = useMemo(() => status?.analyses ?? [], [status]);

    return (
        <div className="flex min-h-screen flex-col bg-[#0d0d0f] text-white">
            <main className="relative z-[1] mx-auto w-full max-w-[860px] flex-1 px-4 pb-20 pt-24 md:px-6 md:pt-28">
                <header className="mb-8">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                        프로젝트 분석
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                        분석 진행 상황
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">
                        분석이 완료되면 자동으로 상태가 갱신됩니다. 이 페이지를 벗어나도 분석은 계속 진행됩니다.
                    </p>
                </header>

                {isLoading && (
                    <p className="rounded-2xl border border-white/[0.08] bg-[#141518]/90 px-5 py-10 text-center text-sm text-zinc-500">
                        분석 상태를 불러오는 중…
                    </p>
                )}

                {!isLoading && errorMessage && !status && (
                    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-5 py-6 text-sm text-amber-200/90">
                        {errorMessage}
                        <div className="mt-4">
                            <Link to="/profile" className="text-zinc-300 underline-offset-2 hover:underline">
                                프로필로 돌아가기
                            </Link>
                        </div>
                    </div>
                )}

                {status && (
                    <section aria-labelledby="analysis-progress-heading">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h2 id="analysis-progress-heading" className="text-base font-semibold text-white">
                                대기 / 진행 중인 저장소
                            </h2>
                            <span className="text-xs text-zinc-500">
                                {status.allTerminal ? '완료' : '실시간 갱신 중'}
                            </span>
                        </div>

                        {errorMessage && (
                            <p className="mt-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
                                {errorMessage}
                            </p>
                        )}

                        {/* 카운터 */}
                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <MetricCounter label="대기" value={counts.yet} accentClassName="text-zinc-300" />
                            <MetricCounter label="진행중" value={counts.inProgress} accentClassName="text-sky-300" />
                            <MetricCounter label="완료" value={counts.done} accentClassName="text-emerald-300" />
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

                        {/* repo별 상태 */}
                        <ul className="mt-5 flex list-none flex-col gap-2 p-0">
                            {rowList.map((row) => {
                                const rowStatus = row.status;
                                const endMs = new Date(row.lastModifiedAt ?? row.createdAt).getTime();
                                const isTerminal = rowStatus === 'DONE' || rowStatus === 'FAILED';
                                return (
                                    <li
                                        key={row.analysisId}
                                        className="flex flex-col gap-2 rounded-xl border border-white/[0.08] bg-[#101114]/70 px-4 py-3 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <a
                                                href={row.repoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="truncate text-sm text-zinc-200 transition-colors hover:text-white"
                                            >
                                                {shortenRepoUrl(row.repoUrl)}
                                            </a>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 pl-0 md:shrink-0 md:justify-end">
                                            {rowStatus === 'DONE' && row.serviceName && (
                                                <span className="truncate text-xs text-zinc-400">{row.serviceName}</span>
                                            )}
                                            {rowStatus === 'DONE' && (
                                                <Link
                                                    to={`/analysis/report/${row.analysisId}`}
                                                    className="text-xs font-medium text-emerald-300 underline-offset-2 hover:underline"
                                                >
                                                    리포트 보기
                                                </Link>
                                            )}
                                            {rowStatus === 'FAILED' && row.failureReason && (
                                                <span className="max-w-[16rem] truncate text-xs text-red-300/90" title={row.failureReason}>
                                                    {row.failureReason}
                                                </span>
                                            )}
                                            {row.createdAt && (
                                                <span className="text-xs tabular-nums text-zinc-500">
                                                    {formatElapsed(row.createdAt, isTerminal ? endMs : nowMs)}
                                                </span>
                                            )}
                                            <StatusBadge status={rowStatus} />
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                        {status.allTerminal && (
                            <p className="mt-5 rounded-xl border border-white/[0.08] bg-[#101114]/70 px-4 py-3 text-sm text-zinc-300">
                                분석 완료 · 총 {total}개 · 완료 {counts.done} · 실패 {counts.failed}
                            </p>
                        )}

                        {/* NONSTOP 포트폴리오 생성(portfolioJobId가 있을 때만) */}
                        {status.portfolioJobId != null && (
                            <div className="mt-5 rounded-xl border border-white/[0.08] bg-[#101114]/70 px-4 py-4">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-semibold text-white">포트폴리오 생성</span>
                                    <span className="text-xs text-zinc-500">
                                        {portfolioJob?.status === 'DONE' ? '완료' : portfolioJob?.status === 'ERROR' ? '실패' : '생성 중…'}
                                    </span>
                                </div>
                                {(!portfolioJob || portfolioJob.status === 'PENDING') && (
                                    <p className="mt-2 text-sm text-zinc-400">분석 결과로 포트폴리오를 생성하고 있습니다. 완료되면 여기에 표시됩니다.</p>
                                )}
                                {portfolioJob?.status === 'DONE' && portfolioJob.pdfUrl && (
                                    <a
                                        href={portfolioJob.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/15 px-4 py-2 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-400/25"
                                    >
                                        포트폴리오 PDF 보기
                                    </a>
                                )}
                                {portfolioJob?.status === 'ERROR' && (
                                    <p className="mt-2 text-sm text-red-300/90">
                                        포트폴리오 생성에 실패했습니다.{portfolioJob.errorMessage ? ` (${portfolioJob.errorMessage})` : ''}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* NONSTOP 포폴 핸드오프 in-flight(FastAPI 호출 중) — 곧 portfolioJobId가 잡힘 */}
                        {status.portfolioJobId == null && status.portfolioPending && (
                            <div className="mt-5 rounded-xl border border-white/[0.08] bg-[#101114]/70 px-4 py-4">
                                <p className="text-sm font-semibold text-white">포트폴리오 생성 준비 중…</p>
                                <p className="mt-1 text-sm text-zinc-400">분석 결과로 포트폴리오 생성을 시작하고 있습니다.</p>
                            </div>
                        )}

                        {/* NONSTOP 포폴 자동 핸드오프 실패 → 수동 재시도(portfolioJobId 없고 retryable일 때만) */}
                        {status.portfolioJobId == null && status.portfolioRetryable && (
                            <div className="mt-5 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-4">
                                <p className="text-sm font-semibold text-amber-100">포트폴리오 생성 시작에 실패했습니다</p>
                                <p className="mt-1 text-sm text-amber-200/80">
                                    분석은 완료됐지만 포트폴리오 생성 요청이 시작되지 못했습니다. 아래 버튼으로 다시 시도해주세요.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleRetryPortfolio}
                                    disabled={isRetrying}
                                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-400/15 px-4 py-2 text-sm font-medium text-amber-100 transition-colors hover:bg-amber-400/25 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isRetrying ? '재시도 중…' : '포트폴리오 생성 다시 시도'}
                                </button>
                                {retryError && <p className="mt-2 text-sm text-red-300/90">{retryError}</p>}
                            </div>
                        )}
                    </section>
                )}

                <div className="mt-12">
                    <Link to="/profile" className="text-sm text-zinc-500 transition-colors hover:text-white">
                        ← 프로필로 돌아가기
                    </Link>
                </div>
            </main>

            <LanderFooter />
        </div>
    );
};
