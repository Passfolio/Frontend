import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchGitHubRepos } from '@/api/GitHub/githubApi';
import type { GitHubRepoItemType, GitHubRepoType } from '@/api/GitHub/githubApi';
import { useRepoPrecheck } from '@/hooks/useRepoPrecheck';
import { AnalysisStartModal } from '@/components/Profile/AnalysisStartModal';
import { AnalysisHistoryList } from '@/components/Profile/AnalysisHistoryList';
import type { PrecheckStatusType } from '@/types/userProjectAnalysis.type';

const SECTION_TABS = [
    { key: 'analyze', label: '저장소 분석' },
    { key: 'history', label: '분석 이력' },
] as const;
type SectionTabType = (typeof SECTION_TABS)[number]['key'];

const REPO_TYPE_LIST = ['public', 'private', 'organization'] as const;
type RepoTabType = (typeof REPO_TYPE_LIST)[number];
const REPO_TYPE_LABEL: Record<RepoTabType, string> = {
    public: '공개',
    private: '비공개',
    organization: '조직',
};

const FILTER_LIST = ['all', 'available'] as const;
type FilterType = (typeof FILTER_LIST)[number];
const FILTER_LABEL: Record<FilterType, string> = { all: '전체', available: '분석 가능' };

const MAX_PRECHECK = 5;
const MAX_ANALYZE = 3;

type BadgeMetaType = { label: string; badgeClassName: string; dotClassName: string };
const STATUS_META: Record<PrecheckStatusType, BadgeMetaType> = {
    CHECKING: { label: '점검중', badgeClassName: 'border-sky-400/25 bg-sky-400/10 text-sky-200', dotClassName: 'bg-sky-400 animate-pulse' },
    AVAILABLE: { label: '분석 가능', badgeClassName: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200', dotClassName: 'bg-emerald-400' },
    DISABLED: { label: '분석 불가', badgeClassName: 'border-red-400/25 bg-red-400/10 text-red-200', dotClassName: 'bg-red-400' },
};
const NONE_META: BadgeMetaType = { label: '미점검', badgeClassName: 'border-white/12 bg-white/[0.06] text-zinc-400', dotClassName: 'bg-zinc-500' };

const repoUrlOf = (repo: GitHubRepoItemType): string | null =>
    repo.htmlUrl ?? (repo.fullName ? `https://github.com/${repo.fullName}` : null);

const StatusBadge = ({ status }: { status?: PrecheckStatusType }) => {
    const meta = status ? STATUS_META[status] : NONE_META;
    return (
        <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.badgeClassName}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClassName}`} aria-hidden="true" />
            {meta.label}
        </span>
    );
};

// 사용자용 프로젝트 분석 — repo 사전 점검(분석 가능성) + 분석 시작.
export const ProjectAnalysisSection = () => {
    const [repoType, setRepoType] = useState<RepoTabType>('public');
    const [repoList, setRepoList] = useState<GitHubRepoItemType[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [isFetchingRepos, setIsFetchingRepos] = useState<boolean>(false);
    const [repoError, setRepoError] = useState<string | null>(null);

    const [selectedRepoMap, setSelectedRepoMap] = useState<Map<string, GitHubRepoItemType>>(new Map());
    const [filter, setFilter] = useState<FilterType>('all');
    const [isDispatching, setIsDispatching] = useState<boolean>(false);
    const [isStartModalOpen, setIsStartModalOpen] = useState<boolean>(false);
    const [sectionTab, setSectionTab] = useState<SectionTabType>('analyze');

    const { statusMap, startPrecheck, errorMessage } = useRepoPrecheck();

    useEffect(() => {
        let cancelled = false;
        setRepoList([]);
        setNextCursor(null);
        setRepoError(null);
        setIsFetchingRepos(true);
        fetchGitHubRepos(repoType as GitHubRepoType)
            .then((res) => {
                if (cancelled) return;
                setRepoList(res.repos);
                setNextCursor(res.nextCursor);
            })
            .catch(() => {
                if (!cancelled) setRepoError('저장소를 불러오지 못했습니다.');
            })
            .finally(() => {
                if (!cancelled) setIsFetchingRepos(false);
            });
        return () => {
            cancelled = true;
        };
    }, [repoType]);

    const loadMore = useCallback(async () => {
        if (!nextCursor || isFetchingRepos) return;
        setIsFetchingRepos(true);
        try {
            const res = await fetchGitHubRepos(repoType as GitHubRepoType, nextCursor);
            setRepoList((prev) => [...prev, ...res.repos]);
            setNextCursor(res.nextCursor);
        } catch {
            setRepoError('저장소를 더 불러오지 못했습니다.');
        } finally {
            setIsFetchingRepos(false);
        }
    }, [nextCursor, isFetchingRepos, repoType]);

    const toggleSelect = useCallback((url: string, repo: GitHubRepoItemType) => {
        setSelectedRepoMap((prev) => {
            const next = new Map(prev);
            if (next.has(url)) next.delete(url);
            else if (next.size < MAX_PRECHECK) next.set(url, repo);
            return next;
        });
    }, []);

    const removeSelect = useCallback((url: string) => {
        setSelectedRepoMap((prev) => {
            if (!prev.has(url)) return prev;
            const next = new Map(prev);
            next.delete(url);
            return next;
        });
    }, []);

    const visibleRepoList = useMemo(() => {
        if (filter === 'all') return repoList;
        return repoList.filter((repo) => {
            const url = repoUrlOf(repo);
            return url !== null && statusMap[url]?.status === 'AVAILABLE';
        });
    }, [repoList, filter, statusMap]);

    const selectedUrlList = useMemo(() => [...selectedRepoMap.keys()], [selectedRepoMap]);
    const selectedRepoList = useMemo(() => [...selectedRepoMap.entries()], [selectedRepoMap]);
    const selectedAvailableList = useMemo(
        () => selectedUrlList.filter((url) => statusMap[url]?.status === 'AVAILABLE'),
        [selectedUrlList, statusMap],
    );
    const availableCount = useMemo(
        () => Object.values(statusMap).filter((s) => s.status === 'AVAILABLE').length,
        [statusMap],
    );

    const analyzeTargets = useMemo(
        () => selectedAvailableList.slice(0, MAX_ANALYZE),
        [selectedAvailableList],
    );

    const handlePrecheck = async () => {
        if (selectedUrlList.length === 0 || isDispatching) return;
        setIsDispatching(true);
        try {
            await startPrecheck(selectedUrlList);
        } finally {
            setIsDispatching(false);
        }
    };

    const handleAnalyze = () => {
        if (analyzeTargets.length === 0 || isDispatching) return;
        setIsStartModalOpen(true);
    };

    const canAnalyze = selectedAvailableList.length > 0 && !isDispatching;

    return (
        <section
            aria-labelledby="project-analysis-heading"
            className="rounded-2xl border border-white/[0.08] bg-[#141518]/90 p-5 sm:p-6"
        >
            <h2 id="project-analysis-heading" className="text-lg font-semibold text-white">
                프로젝트 분석
            </h2>
            {/* 섹션 탭 */}
            <div className="mt-4 inline-flex rounded-full border border-white/[0.10] p-0.5" role="tablist" aria-label="프로젝트 분석 탭">
                {SECTION_TABS.map((t) => {
                    const isActive = t.key === sectionTab;
                    return (
                        <button
                            key={t.key}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => setSectionTab(t.key)}
                            className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${
                                isActive ? 'bg-white/[0.12] text-white' : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            {t.label}
                        </button>
                    );
                })}
            </div>

            {sectionTab === 'history' && (
                <div className="mt-5">
                    <AnalysisHistoryList />
                </div>
            )}

            {sectionTab === 'analyze' && (
            <>
            <p className="mt-4 text-sm text-zinc-500">
                분석 전, 저장소가 분석 가능한 크기인지 먼저 점검합니다.
            </p>

            {/* 사용법 안내 */}
            <ol className="mt-4 flex flex-col gap-1 rounded-xl border border-white/[0.08] bg-[#101114]/70 px-4 py-3 text-xs text-zinc-400 sm:flex-row sm:flex-wrap sm:gap-x-4">
                <li>① 점검할 저장소를 <b className="text-zinc-200">최대 5개</b> 선택</li>
                <li>② <b className="text-zinc-200">점검</b> 클릭 → 결과 실시간 표시</li>
                <li>③ <b className="text-emerald-300">분석 가능</b>한 저장소를 <b className="text-zinc-200">분석 시작</b>(최대 3개)</li>
            </ol>

            {/* repo 타입 탭 + 필터 */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex rounded-full border border-white/[0.10] p-0.5" role="tablist" aria-label="저장소 유형">
                    {REPO_TYPE_LIST.map((type) => {
                        const isActive = type === repoType;
                        return (
                            <button
                                key={type}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => setRepoType(type)}
                                className={`rounded-full px-3.5 py-1 text-sm font-medium transition-colors ${
                                    isActive ? 'bg-white/[0.12] text-white' : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                {REPO_TYPE_LABEL[type]}
                            </button>
                        );
                    })}
                </div>
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
            </div>

            {/* repo 리스트 */}
            <div className="mt-4">
                {repoError && (
                    <p className="rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-300">{repoError}</p>
                )}
                {!repoError && (
                    <ul className="flex max-h-[420px] list-none flex-col gap-2 overflow-y-auto p-0">
                        {visibleRepoList.length === 0 && !isFetchingRepos && (
                            <li className="px-4 py-8 text-center text-sm text-zinc-500">
                                {filter === 'available' ? '분석 가능한 저장소가 없습니다.' : '저장소가 없습니다.'}
                            </li>
                        )}
                        {visibleRepoList.map((repo) => {
                            const url = repoUrlOf(repo);
                            if (!url) return null;
                            const state = statusMap[url];
                            const isSelected = selectedRepoMap.has(url);
                            const isSelectDisabled = !isSelected && selectedRepoMap.size >= MAX_PRECHECK;
                            return (
                                <li key={url}>
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
                                                onChange={() => toggleSelect(url, repo)}
                                                className="h-4 w-4 shrink-0 accent-white"
                                            />
                                            <span className="truncate text-sm text-zinc-200">{repo.fullName ?? repo.name}</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 pl-7 md:shrink-0 md:justify-end md:pl-0">
                                            {state?.status === 'AVAILABLE' && state.gitHistoryMb != null && (
                                                <span className="text-xs tabular-nums text-zinc-500">
                                                    git {state.gitHistoryMb}MB
                                                </span>
                                            )}
                                            {state?.status === 'DISABLED' && state.reason && (
                                                <span className="max-w-[14rem] truncate text-xs text-red-300/90" title={state.reason}>
                                                    {state.reason}
                                                </span>
                                            )}
                                            <StatusBadge status={state?.status} />
                                        </div>
                                    </label>
                                </li>
                            );
                        })}
                        {isFetchingRepos && (
                            <li className="px-4 py-4 text-center text-sm text-zinc-500">불러오는 중…</li>
                        )}
                    </ul>
                )}
                {nextCursor && !isFetchingRepos && filter === 'all' && (
                    <button
                        type="button"
                        onClick={loadMore}
                        className="mt-2 w-full rounded-xl border border-white/[0.10] py-2 text-sm text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
                    >
                        더 보기
                    </button>
                )}
            </div>

            {/* 선택한 저장소 요약 */}
            {selectedRepoList.length > 0 && (
                <div className="mt-4 rounded-xl border border-white/[0.08] bg-[#101114]/70 p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-zinc-200">선택한 저장소</h3>
                        <span className="text-xs tabular-nums text-zinc-500">
                            {selectedRepoList.length}/{MAX_PRECHECK}
                        </span>
                    </div>
                    <ul className="mt-3 flex list-none flex-col gap-2 p-0">
                        {selectedRepoList.map(([url, repo]) => {
                            const state = statusMap[url];
                            return (
                                <li
                                    key={url}
                                    className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2"
                                >
                                    <span className="min-w-0 truncate text-sm text-zinc-200">
                                        {repo.fullName ?? repo.name}
                                    </span>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <StatusBadge status={state?.status} />
                                        <button
                                            type="button"
                                            onClick={() => removeSelect(url)}
                                            aria-label={`${repo.fullName ?? repo.name} 선택 해제`}
                                            className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-white/[0.08] hover:text-white"
                                        >
                                            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                                            </svg>
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* 액션 */}
            <div className="mt-5 flex flex-col gap-3 border-t border-white/[0.08] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-zinc-500">
                    선택 <span className="font-semibold tabular-nums text-white">{selectedUrlList.length}</span>/{MAX_PRECHECK}
                    {selectedAvailableList.length > 0 && (
                        <span className="ml-2 text-emerald-300">· 분석 가능 {selectedAvailableList.length}</span>
                    )}
                </p>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={handlePrecheck}
                        disabled={selectedUrlList.length === 0 || isDispatching}
                        className="rounded-full border border-white/20 bg-white/[0.10] px-5 py-2 text-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-white/[0.16] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {isDispatching ? '처리 중…' : '점검'}
                    </button>
                    <button
                        type="button"
                        onClick={handleAnalyze}
                        disabled={!canAnalyze}
                        className="rounded-full border border-emerald-400/30 bg-emerald-400/15 px-5 py-2 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        분석 시작{selectedAvailableList.length > 0 ? ` (${Math.min(selectedAvailableList.length, MAX_ANALYZE)})` : ''}
                    </button>
                </div>
            </div>

            {errorMessage && <p className="mt-3 text-sm text-amber-300">{errorMessage}</p>}

            <AnalysisStartModal
                isOpen={isStartModalOpen}
                repoUrls={analyzeTargets}
                onClose={() => setIsStartModalOpen(false)}
            />
            </>
            )}
        </section>
    );
};
