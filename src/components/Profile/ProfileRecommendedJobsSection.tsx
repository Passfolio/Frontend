import {
    PROFILE_RECOMMENDED_JOB_HEADING,
    PROFILE_RECOMMENDED_JOB_LIST,
} from '@/constants/profileRecommendedJobs';

type ProfileRecommendedJobsSectionProps = {
    className?: string;
};

export const ProfileRecommendedJobsSection = ({
    className,
}: ProfileRecommendedJobsSectionProps) => {
    return (
        <section
            aria-labelledby="profile-recommended-jobs-heading"
            className={[
                'relative box-border flex w-full min-w-0 max-w-[190px] flex-col overflow-hidden rounded-2xl border border-white/[0.09] p-4',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            style={{
                background: 'rgba(18,18,22,0.92)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.09), 0 4px 24px -6px rgba(0,0,0,0.5)',
            }}
        >
            {/* Specular top */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <h2
                id="profile-recommended-jobs-heading"
                className="mb-3 shrink-0 text-[0.68rem] font-semibold uppercase tracking-[0.10em] text-zinc-600"
            >
                {PROFILE_RECOMMENDED_JOB_HEADING}
            </h2>

            <div className="min-h-0 w-full min-w-0 flex-1 overflow-x-hidden overflow-y-auto [scrollbar-width:thin]">
                <ul className="m-0 flex w-full list-none flex-col gap-1.5 p-0 pb-3">
                    {PROFILE_RECOMMENDED_JOB_LIST.map((jobItem) => (
                        <li key={jobItem.id} className="min-w-0">
                            <button
                                type="button"
                                className="group box-border w-full min-w-0 overflow-hidden rounded-xl border border-white/[0.08] px-2.5 py-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.15] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/30"
                                style={{
                                    background: 'rgba(28,28,34,0.88)',
                                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 2px 8px -2px rgba(0,0,0,0.4)',
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                                        'inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 16px -4px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)';
                                    (e.currentTarget as HTMLButtonElement).style.background =
                                        'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)';
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                                        'inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 8px -2px rgba(0,0,0,0.4)';
                                    (e.currentTarget as HTMLButtonElement).style.background =
                                        'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)';
                                }}
                            >
                                <div className="mb-0.5 flex items-start justify-between gap-2">
                                    <span className="text-[0.72rem] font-semibold leading-tight text-white/90 transition-colors group-hover:text-white">
                                        {jobItem.companyName}
                                    </span>
                                    {/* Emerald glass badge */}
                                    <span
                                        className="shrink-0 rounded-full px-1.5 py-0.5 text-[0.60rem] font-semibold tabular-nums text-emerald-300"
                                        style={{
                                            background: 'rgba(52,211,153,0.10)',
                                            border: '1px solid rgba(52,211,153,0.18)',
                                            boxShadow: 'inset 0 1px 0 rgba(52,211,153,0.15)',
                                        }}
                                    >
                                        {jobItem.matchPercent}%
                                    </span>
                                </div>
                                <p className="mb-0.5 line-clamp-2 text-[0.67rem] leading-snug text-zinc-500 transition-colors group-hover:text-zinc-400">
                                    {jobItem.jobTitle}
                                </p>
                                <p className="line-clamp-1 text-[0.62rem] text-zinc-600 transition-colors group-hover:text-zinc-500">
                                    {jobItem.stackSummary}
                                </p>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};
