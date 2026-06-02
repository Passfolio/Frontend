import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAnalysisHistory } from '@/api/ProjectAnalysis/projectAnalysisApi';
import type { AnalysisHistoryItemType, AnalysisStatusType } from '@/types/userProjectAnalysis.type';

type BadgeMetaType = { label: string; badgeClassName: string; dotClassName: string };
const STATUS_META: Record<AnalysisStatusType, BadgeMetaType> = {
    YET: { label: '대기', badgeClassName: 'border-white/12 bg-white/[0.06] text-zinc-300', dotClassName: 'bg-zinc-400' },
    IN_PROGRESS: { label: '진행중', badgeClassName: 'border-sky-400/25 bg-sky-400/10 text-sky-200', dotClassName: 'bg-sky-400 animate-pulse' },
    DONE: { label: '완료', badgeClassName: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200', dotClassName: 'bg-emerald-400' },
    FAILED: { label: '실패', badgeClassName: 'border-red-400/25 bg-red-400/10 text-red-200', dotClassName: 'bg-red-400' },
};

const shortenRepoUrl = (repoUrl: string): string =>
    repoUrl.replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');

const formatDate = (iso: string): string => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// 프로필 '분석 이력' 탭 — 본인 분석 최근순. 완료=리포트 보기, 진행중/대기=진행 상황, 실패=사유.
export const AnalysisHistoryList = () => {
    const [items, setItems] = useState<AnalysisHistoryItemType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        getAnalysisHistory()
            .then((res) => {
                if (!cancelled) setItems(res);
            })
            .catch(() => {
                if (!cancelled) setErrorMessage('분석 이력을 불러오지 못했습니다.');
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    if (isLoading) {
        return <p className="px-4 py-8 text-center text-sm text-zinc-500">불러오는 중…</p>;
    }
    if (errorMessage) {
        return <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">{errorMessage}</p>;
    }
    if (items.length === 0) {
        return <p className="px-4 py-10 text-center text-sm text-zinc-500">아직 분석 이력이 없습니다.</p>;
    }

    return (
        <ul className="flex list-none flex-col gap-2 p-0">
            {items.map((item) => {
                const meta = STATUS_META[item.status];
                return (
                    <li
                        key={item.analysisId}
                        className="flex flex-col gap-2 rounded-xl border border-white/[0.08] bg-[#101114]/70 px-4 py-3 md:flex-row md:items-center md:justify-between"
                    >
                        <div className="flex min-w-0 flex-col gap-1">
                            <span className="truncate text-sm text-zinc-200">
                                {item.status === 'DONE' && item.serviceName ? item.serviceName : shortenRepoUrl(item.repoUrl)}
                            </span>
                            <span className="truncate text-xs text-zinc-600">
                                {shortenRepoUrl(item.repoUrl)} · {formatDate(item.createdAt)}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pl-0 md:shrink-0 md:justify-end">
                            {item.status === 'FAILED' && item.failureReason && (
                                <span className="max-w-[16rem] truncate text-xs text-red-300/90" title={item.failureReason}>
                                    {item.failureReason}
                                </span>
                            )}
                            <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.badgeClassName}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClassName}`} aria-hidden="true" />
                                {meta.label}
                            </span>
                            {item.status === 'DONE' ? (
                                <Link
                                    to={`/analysis/report/${item.analysisId}`}
                                    className="text-xs font-medium text-emerald-300 underline-offset-2 hover:underline"
                                >
                                    리포트 보기
                                </Link>
                            ) : (item.status === 'IN_PROGRESS' || item.status === 'YET') && item.batchId ? (
                                <Link
                                    to={`/analysis/${item.batchId}`}
                                    className="text-xs font-medium text-sky-300 underline-offset-2 hover:underline"
                                >
                                    진행 상황
                                </Link>
                            ) : null}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};
