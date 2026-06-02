import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LanderFooter } from '@/components/Lander/LanderFooter';
import { useRepoPrecheck } from '@/hooks/useRepoPrecheck';
import { postAdminPrecheck } from '@/api/AdminPortal/adminUserApi';
import { ANALYSIS_TEST_REPO_LIST } from '@/constants/analysisTestRepos';
import { ADMIN_PORTAL_PROFILE_PATH } from '@/constants/adminPortal';
import type { PrecheckStatusType } from '@/types/userProjectAnalysis.type';
import '@/pages/Lander/landerPage.css';

const MAX_PRECHECK = 5;

const FILTER_LIST = ['all', 'available'] as const;
type FilterType = (typeof FILTER_LIST)[number];
const FILTER_LABEL: Record<FilterType, string> = { all: '전체', available: '분석 가능' };

type BadgeMetaType = { label: string; badgeClassName: string; dotClassName: string };
const STATUS_META: Record<PrecheckStatusType, BadgeMetaType> = {
    CHECKING: { label: '점검중', badgeClassName: 'border-sky-400/25 bg-sky-400/10 text-sky-200', dotClassName: 'bg-sky-400 animate-pulse' },
    AVAILABLE: { label: '분석 가능', badgeClassName: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200', dotClassName: 'bg-emerald-400' },
    DISABLED: { label: '분석 불가', badgeClassName: 'border-red-400/25 bg-red-400/10 text-red-200', dotClassName: 'bg-red-400' },
};
const NONE_META: BadgeMetaType = { label: '미점검', badgeClassName: 'border-white/12 bg-white/[0.06] text-zinc-400', dotClassName: 'bg-zinc-500' };

const shortRepo = (url: string): string => url.replace(/^https?:\/\/github\.com\//, '');

// ADMIN 전용 precheck 테스트 — 큐레이션 공개 repo로 토큰 없이 사전 점검(GitHub 미연동 admin이 검증).
export const AdminPrecheckTestPage = () => {
    const [selectedUrlSet, setSelectedUrlSet] = useState<Set<string>>(new Set());
    const [filter, setFilter] = useState<FilterType>('all');
    const [isDispatching, setIsDispatching] = useState<boolean>(false);

    const { statusMap, startPrecheck, errorMessage } = useRepoPrecheck(postAdminPrecheck);

    const toggleSelect = (url: string) => {
        setSelectedUrlSet((prev) => {
            const next = new Set(prev);
            if (next.has(url)) next.delete(url);
            else if (next.size < MAX_PRECHECK) next.add(url);
            return next;
        });
    };

    const visibleList = useMemo(() => {
        if (filter === 'all') return ANALYSIS_TEST_REPO_LIST;
        return ANALYSIS_TEST_REPO_LIST.filter((r) => statusMap[r.repoUrl]?.status === 'AVAILABLE');
    }, [filter, statusMap]);

    const availableCount = useMemo(
        () => Object.values(statusMap).filter((s) => s.status === 'AVAILABLE').length,
        [statusMap],
    );
    const selectedList = useMemo(() => [...selectedUrlSet], [selectedUrlSet]);

    const handlePrecheck = async () => {
        if (selectedList.length === 0 || isDispatching) return;
        setIsDispatching(true);
        try {
            await startPrecheck(selectedList);
        } finally {
            setIsDispatching(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-[#0d0d0f] text-white">
            <main className="relative z-[1] mx-auto w-full max-w-[960px] flex-1 px-4 pb-20 pt-24 md:px-6 md:pt-28">
                <header className="mb-8">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                        Admin · Test
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                        Project Precheck Test
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">
                        큐레이션 공개 저장소로 사전 점검(clone·크기측정)을 토큰 없이 테스트합니다. 결과는 실시간(SSE) 갱신.
                    </p>
                </header>

                <section
                    aria-labelledby="precheck-test-heading"
                    className="rounded-2xl border border-white/[0.08] bg-[#141518]/90 p-5 sm:p-6"
                >
                    <h2 id="precheck-test-heading" className="sr-only">사전 점검 테스트</h2>

                    <ol className="flex flex-col gap-1 rounded-xl border border-white/[0.08] bg-[#101114]/70 px-4 py-3 text-xs text-zinc-400 sm:flex-row sm:flex-wrap sm:gap-x-4">
                        <li>① 저장소 <b className="text-zinc-200">최대 5개</b> 선택</li>
                        <li>② <b className="text-zinc-200">점검</b> 클릭 → <b className="text-emerald-300">분석 가능</b>/<b className="text-red-300">불가</b> 실시간 표시</li>
                    </ol>

                    {/* 필터 */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <div className="inline-flex rounded-full border border-white/[0.10] p-0.5" role="group" aria-label="필터">
                            {FILTER_LIST.map((f) => {
                                const isActive = f === filter;
                                return (
                                    <button
                                        key={f}
                                        type="button"
                                        aria-pressed={isActive}
                                        onClick={() => setFilter(f)}
                                        className={`rounded-full px-3.5 py-1 text-sm font-medium transition-colors ${
                                            isActive ? 'bg-white/[0.12] text-white' : 'text-zinc-400 hover:text-white'
                                        }`}
                                    >
                                        {FILTER_LABEL[f]}
                                        {f === 'available' && availableCount > 0 ? ` ${availableCount}` : ''}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-sm text-zinc-500">
                            선택 <span className="font-semibold tabular-nums text-white">{selectedList.length}</span>/{MAX_PRECHECK}
                        </p>
                    </div>

                    {/* repo 리스트 */}
                    <ul className="mt-4 flex max-h-[420px] list-none flex-col gap-2 overflow-y-auto p-0">
                        {visibleList.length === 0 && (
                            <li className="px-4 py-8 text-center text-sm text-zinc-500">분석 가능한 저장소가 없습니다.</li>
                        )}
                        {visibleList.map((repo) => {
                            const state = statusMap[repo.repoUrl];
                            const meta = state ? STATUS_META[state.status] : NONE_META;
                            const isSelected = selectedUrlSet.has(repo.repoUrl);
                            const isSelectDisabled = !isSelected && selectedUrlSet.size >= MAX_PRECHECK;
                            return (
                                <li key={repo.repoUrl}>
                                    <label
                                        className={`flex cursor-pointer flex-col gap-2 rounded-xl border px-4 py-3 transition-colors md:flex-row md:items-center md:justify-between ${
                                            isSelected ? 'border-white/20 bg-white/[0.06]' : 'border-white/[0.08] bg-[#101114]/70 hover:border-white/14'
                                        } ${isSelectDisabled ? 'opacity-50' : ''}`}
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                disabled={isSelectDisabled}
                                                onChange={() => toggleSelect(repo.repoUrl)}
                                                className="h-4 w-4 shrink-0 accent-white"
                                            />
                                            <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[0.65rem] font-medium text-zinc-400">
                                                {repo.framework}
                                            </span>
                                            <span className="truncate text-sm text-zinc-200">{shortRepo(repo.repoUrl)}</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 pl-7 md:shrink-0 md:justify-end md:pl-0">
                                            {state?.status === 'AVAILABLE' && state.gitHistoryMb != null && (
                                                <span className="text-xs tabular-nums text-zinc-500">git {state.gitHistoryMb}MB</span>
                                            )}
                                            {state?.status === 'DISABLED' && state.reason && (
                                                <span className="max-w-[14rem] truncate text-xs text-red-300/90" title={state.reason}>
                                                    {state.reason}
                                                </span>
                                            )}
                                            <span
                                                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.badgeClassName}`}
                                            >
                                                <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClassName}`} aria-hidden="true" />
                                                {meta.label}
                                            </span>
                                        </div>
                                    </label>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="mt-5 flex flex-col gap-3 border-t border-white/[0.08] pt-5 sm:flex-row sm:items-center sm:justify-end">
                        <button
                            type="button"
                            onClick={handlePrecheck}
                            disabled={selectedList.length === 0 || isDispatching}
                            className="rounded-full border border-white/20 bg-white/[0.10] px-5 py-2 text-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-white/[0.16] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {isDispatching ? '처리 중…' : '점검'}
                        </button>
                    </div>

                    {errorMessage && <p className="mt-3 text-sm text-amber-300">{errorMessage}</p>}
                </section>

                <div className="mt-12">
                    <Link to={ADMIN_PORTAL_PROFILE_PATH} className="text-sm text-zinc-500 transition-colors hover:text-white">
                        ← 관리자 홈으로
                    </Link>
                </div>
            </main>

            <LanderFooter />
        </div>
    );
};
