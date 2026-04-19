import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchGitHubRepos, type GitHubRepoItem, type GitHubRepoType } from '@/apis/githubApi';
import { useAuth } from '@/context/Auth/AuthContext';

/** htmlUrl 누락(구 Redis 캐시 등) 시에도 클릭 가능하도록 URL 조합 */
const resolveGitHubRepoWebUrl = (
    repo: GitHubRepoItem,
    columnType: GitHubRepoType,
    githubLogin: string | undefined,
): string | null => {
    const fromApi = repo.htmlUrl?.trim();
    if (fromApi) return fromApi;
    const full = repo.fullName?.trim();
    if (full) return `https://github.com/${full}`;
    if ((columnType === 'public' || columnType === 'private') && githubLogin?.trim()) {
        return `https://github.com/${githubLogin.trim()}/${encodeURIComponent(repo.name)}`;
    }
    if (columnType === 'organization' && repo.name.includes('/')) {
        return `https://github.com/${repo.name}`;
    }
    return null;
};

export type RepositoryColumnConfig = {
    chipLabel: string;
    type: GitHubRepoType;
};

const REPOSITORY_COLUMN_LIST: RepositoryColumnConfig[] = [
    { chipLabel: 'Public Repo', type: 'public' },
    { chipLabel: 'Private Repo', type: 'private' },
    { chipLabel: 'Organization Repo', type: 'organization' },
];

/** Glass pill chip — 각 repo 타입 레이블 */
const CHIP_BASE =
    'inline-flex max-w-full min-w-0 items-center justify-center whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-medium leading-none tracking-wide text-zinc-100/90 backdrop-blur-2xl';

const CHIP_VARIANT: Record<GitHubRepoType, { border: string; bg: string; shadow: string }> = {
    public: {
        border: 'border-emerald-300/[0.18]',
        bg: 'linear-gradient(145deg, rgba(52,211,153,0.10) 0%, rgba(52,211,153,0.04) 100%)',
        shadow: 'inset 0 1px 0 rgba(52,211,153,0.20), inset 0 -1px 0 rgba(0,0,0,0.15)',
    },
    private: {
        border: 'border-rose-300/[0.18]',
        bg: 'linear-gradient(145deg, rgba(251,113,133,0.10) 0%, rgba(251,113,133,0.04) 100%)',
        shadow: 'inset 0 1px 0 rgba(251,113,133,0.20), inset 0 -1px 0 rgba(0,0,0,0.15)',
    },
    organization: {
        border: 'border-violet-300/[0.18]',
        bg: 'linear-gradient(145deg, rgba(167,139,250,0.10) 0%, rgba(167,139,250,0.04) 100%)',
        shadow: 'inset 0 1px 0 rgba(167,139,250,0.20), inset 0 -1px 0 rgba(0,0,0,0.15)',
    },
};

const LANGUAGE_DOT_CLASS_MAP: Record<string, string> = {
    java: 'bg-orange-500',
    kotlin: 'bg-purple-500',
    python: 'bg-blue-500',
    javascript: 'bg-yellow-400',
    typescript: 'bg-sky-500',
    go: 'bg-cyan-400',
    rust: 'bg-amber-700',
    c: 'bg-zinc-400',
    'c++': 'bg-pink-500',
    'c#': 'bg-green-500',
    shell: 'bg-emerald-500',
    html: 'bg-red-500',
    css: 'bg-indigo-400',
};

const getLanguageDotClass = (language: string | null) =>
    LANGUAGE_DOT_CLASS_MAP[(language ?? '').toLowerCase()] ?? 'bg-zinc-600';

export const RepositoryColumn = ({ chipLabel, type }: RepositoryColumnConfig) => {
    const { user } = useAuth();
    const [repos, setRepos] = useState<GitHubRepoItem[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [initialized, setInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const isLoadingRef = useRef(false);
    const isLoadingMoreRef = useRef(false);

    const loadRepos = useCallback(
        async (cursor?: string | null) => {
            const append = Boolean(cursor);
            if (append && isLoadingMoreRef.current) return;
            if (!append && isLoadingRef.current) return;
            try {
                if (append) { isLoadingMoreRef.current = true; setIsLoadingMore(true); }
                else { isLoadingRef.current = true; setIsLoading(true); }
                const response = await fetchGitHubRepos(type, cursor);
                setRepos((prev) => (append ? [...prev, ...response.repos] : response.repos));
                setNextCursor(response.nextCursor);
                setErrorMessage(null);
            } catch {
                setErrorMessage('Repository를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
            } finally {
                setInitialized(true);
                isLoadingRef.current = false;
                isLoadingMoreRef.current = false;
                setIsLoading(false);
                setIsLoadingMore(false);
            }
        },
        [type],
    );

    useEffect(() => { void loadRepos(); }, [loadRepos]);

    useEffect(() => {
        const root = scrollContainerRef.current;
        const target = sentinelRef.current;
        if (!root || !target || !nextCursor || isLoading || isLoadingMore) return;
        const observer = new IntersectionObserver(
            (entries) => { if (entries[0]?.isIntersecting) void loadRepos(nextCursor); },
            { root, threshold: 0.2 },
        );
        observer.observe(target);
        return () => observer.disconnect();
    }, [isLoading, isLoadingMore, loadRepos, nextCursor]);

    const emptyMessage = useMemo(() => {
        if (!initialized || repos.length > 0) return null;
        return '표시할 Repository가 없습니다.';
    }, [initialized, repos.length]);

    const chip = CHIP_VARIANT[type];

    return (
        <section
            aria-label={chipLabel}
            className="relative flex h-[420px] min-h-0 flex-col overflow-hidden rounded-2xl border border-white/[0.09] p-4 lg:h-[600px]"
            style={{
                background: 'rgba(18,18,22,0.85)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.09), 0 4px 24px -6px rgba(0,0,0,0.6)',
            }}
        >
            {/* Specular top */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Chip label */}
            <div className="mb-4 min-w-0">
                <h3
                    className={`${CHIP_BASE} ${chip.border}`}
                    style={{ background: chip.bg, boxShadow: chip.shadow }}
                    title={chipLabel}
                >
                    <span className="min-w-0 truncate">{chipLabel}</span>
                </h3>
            </div>

            {/* Scrollable repo list */}
            <div
                ref={scrollContainerRef}
                className="pf-scroll-y min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
            >
                <div className="flex flex-col gap-2.5">
                    {repos.map((repo, index) => {
                        const key = `${type}-${repo.name}-${index}`;
                        const webUrl = resolveGitHubRepoWebUrl(repo, type, user?.githubLogin);

                        const cardContent = (
                            <>
                                <div className="mb-1.5 flex min-w-0 items-center gap-2 text-[0.8rem] font-semibold text-white">
                                    <span className="shrink-0 text-zinc-500 text-xs">◧</span>
                                    <span className="min-w-0 truncate" title={repo.name}>
                                        {repo.name}
                                    </span>
                                </div>
                                <p className="mb-2.5 line-clamp-2 min-w-0 break-words text-[0.72rem] leading-relaxed text-zinc-400">
                                    {repo.description ?? '설명이 없습니다.'}
                                </p>
                                <div className="flex items-center gap-1.5 text-[0.72rem] font-medium text-zinc-300">
                                    <span className={`h-2 w-2 rounded-full ${getLanguageDotClass(repo.language)}`} />
                                    {repo.language ?? 'Unknown'}
                                </div>
                            </>
                        );

                        const cardClass =
                            'group relative block cursor-pointer overflow-hidden rounded-xl border border-white/[0.08] px-3.5 py-3 text-inherit no-underline transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.16]';
                        const cardStyle = {
                            background: 'rgba(28,28,34,0.9)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 2px 8px -2px rgba(0,0,0,0.4)',
                        };

                        if (webUrl) {
                            return (
                                <a
                                    key={key}
                                    href={webUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cardClass}
                                    style={cardStyle}
                                >
                                    {/* Specular on hover */}
                                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                    {cardContent}
                                </a>
                            );
                        }
                        return (
                            <article
                                key={key}
                                className={cardClass}
                                style={cardStyle}
                            >
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                {cardContent}
                            </article>
                        );
                    })}
                </div>

                {isLoading && (
                    <p className="mt-4 text-[0.75rem] text-zinc-600">불러오는 중...</p>
                )}
                {!isLoading && errorMessage && (
                    <div className="mt-4 flex items-center gap-3">
                        <p className="text-[0.75rem] text-rose-400/80">{errorMessage}</p>
                        <button
                            type="button"
                            onClick={() => void loadRepos()}
                            className="rounded-lg border border-white/[0.10] px-2.5 py-1 text-[0.72rem] text-white/70 backdrop-blur-xl transition-all hover:border-white/20 hover:text-white"
                            style={{ background: 'rgba(255,255,255,0.04)' }}
                        >
                            다시 시도
                        </button>
                    </div>
                )}
                {!isLoading && !errorMessage && emptyMessage && (
                    <p className="mt-4 text-[0.75rem] text-zinc-600">{emptyMessage}</p>
                )}
                {isLoadingMore && (
                    <p className="mt-3 text-[0.70rem] text-zinc-700">더 불러오는 중...</p>
                )}
                <div ref={sentinelRef} className="h-1 w-full" />
            </div>
        </section>
    );
};

export const RepositorySection = () => {
    return (
        <div className="hidden lg:grid min-h-0 grid-cols-1 gap-4 lg:flex-1 lg:min-h-0 lg:grid-cols-3 lg:items-stretch">
            {REPOSITORY_COLUMN_LIST.map((column) => (
                <RepositoryColumn key={column.type} chipLabel={column.chipLabel} type={column.type} />
            ))}
        </div>
    );
};
