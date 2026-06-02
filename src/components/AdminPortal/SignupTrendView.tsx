import { useMemo, useState } from 'react';
import { useDailySignups } from '@/hooks/AdminPortal/useDailySignups';
import { UserSignupLineChart } from '@/components/AdminPortal/UserSignupLineChart';
import { buildDailySeries, buildCumulativeSeries } from '@/utils/signupSeries';

const TREND_MODE_LIST = ['daily', 'cumulative'] as const;
type TrendModeType = (typeof TREND_MODE_LIST)[number];
const TREND_MODE_LABEL: Record<TrendModeType, string> = {
    daily: '일별',
    cumulative: '누적',
};

// 사용자 유입 그래프 탭 — 일별/누적 토글 + SVG 라인차트.
export const SignupTrendView = () => {
    const { signupList, isLoading, errorMessage } = useDailySignups();
    const [mode, setMode] = useState<TrendModeType>('daily');

    const dailySeries = useMemo(() => buildDailySeries(signupList), [signupList]);
    const series = useMemo(
        () => (mode === 'cumulative' ? buildCumulativeSeries(dailySeries) : dailySeries),
        [mode, dailySeries],
    );
    const totalUsers = useMemo(
        () => signupList.reduce((sum, item) => sum + item.count, 0),
        [signupList],
    );

    return (
        <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div
                    className="inline-flex rounded-full border border-white/[0.10] p-0.5"
                    role="group"
                    aria-label="유입 집계 방식"
                >
                    {TREND_MODE_LIST.map((trendMode) => {
                        const isActive = trendMode === mode;
                        return (
                            <button
                                key={trendMode}
                                type="button"
                                aria-pressed={isActive}
                                onClick={() => setMode(trendMode)}
                                className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${
                                    isActive ? 'bg-white/[0.12] text-white' : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                {TREND_MODE_LABEL[trendMode]}
                            </button>
                        );
                    })}
                </div>
                <p className="text-sm text-zinc-500">
                    총 가입자 <span className="font-semibold tabular-nums text-white">{totalUsers}</span>명
                </p>
            </div>

            {isLoading && (
                <div className="flex min-h-[240px] items-center justify-center">
                    <p className="text-sm text-zinc-500">불러오는 중…</p>
                </div>
            )}
            {!isLoading && errorMessage && (
                <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10">
                    <p className="text-sm text-amber-200/90">{errorMessage}</p>
                </div>
            )}
            {!isLoading && !errorMessage && <UserSignupLineChart pointList={series} valueUnit="명" />}
        </div>
    );
};
