import type { UserType } from '@/context/Auth/AuthContext';

type MobileProfileHeaderProps = {
    user: UserType | null;
    jobLine: string;
    educationSchool: string;
    careerYearsLabel: string;
    onUpdateProfile: () => void;
};

export const MobileProfileHeader = ({
    user,
    jobLine,
    educationSchool,
    careerYearsLabel,
    onUpdateProfile,
}: MobileProfileHeaderProps) => {
    return (
        <div
            className="relative overflow-hidden rounded-3xl border border-white/[0.10] p-5 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_rgba(0,0,0,0.12)] backdrop-blur-2xl"
            style={{
                background:
                    'linear-gradient(160deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 40%, rgba(0,0,0,0.08) 100%)',
            }}
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-5">
                    <div
                        className="relative shrink-0"
                        style={{ filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.18))' }}
                    >
                        <div className="h-28 w-28 overflow-hidden rounded-full border border-white/25 bg-black ring-1 ring-white/10 ring-offset-2 ring-offset-transparent">
                            <img
                                src={user?.profileImageUrl || 'https://avatars.githubusercontent.com/u/9919?v=4'}
                                alt="프로필 아바타"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/10 to-transparent" />
                    </div>

                    <div className="flex flex-col gap-1 min-w-0">
                        <h1 className="text-3xl font-bold leading-tight tracking-tight truncate">
                            {user?.nickname || 'Nickname'}
                        </h1>
                        <p className="text-base text-zinc-400 truncate">{user?.githubLogin || 'Username'}</p>
                        <p className="text-sm font-medium text-zinc-300/80 line-clamp-2">{jobLine}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                        <span
                            className="max-w-full truncate rounded-full border border-white/[0.18] px-3 py-1 text-xs font-medium text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(0,0,0,0.15)] backdrop-blur-xl sm:max-w-none"
                            style={{
                                background:
                                    'linear-gradient(160deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.05) 100%)',
                            }}
                            title={educationSchool}
                        >
                            {educationSchool}
                        </span>
                        <span
                            className="shrink-0 rounded-full border border-white/[0.18] px-3 py-1 text-xs font-medium text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(0,0,0,0.15)] backdrop-blur-xl"
                            style={{
                                background:
                                    'linear-gradient(160deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.05) 100%)',
                            }}
                        >
                            {careerYearsLabel}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onUpdateProfile}
                        className="shrink-0 rounded-full border border-white/[0.18] px-4 py-2 text-xs font-semibold text-white/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_0_rgba(0,0,0,0.18),0_4px_16px_-4px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-200 hover:border-white/30 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.32),0_0_20px_rgba(255,255,255,0.08)] active:scale-[0.97]"
                        style={{
                            background:
                                'linear-gradient(145deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%)',
                        }}
                    >
                        Update Profile
                    </button>
                </div>
            </div>
        </div>
    );
};
