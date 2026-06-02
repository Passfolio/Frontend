import { useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LanderFooter } from '@/components/Lander/LanderFooter';
import { SignupTrendView } from '@/components/AdminPortal/SignupTrendView';
import { UserListView } from '@/components/AdminPortal/UserListView';
import { ADMIN_PORTAL_PROFILE_PATH } from '@/constants/adminPortal';
import '@/pages/Lander/landerPage.css';

const USERS_VIEW_LIST = ['signups', 'list'] as const;
type UsersViewType = (typeof USERS_VIEW_LIST)[number];

const VIEW_LABEL: Record<UsersViewType, string> = {
    signups: '사용자 유입',
    list: '회원 목록',
};

const DEFAULT_VIEW: UsersViewType = 'signups';

const isUsersView = (value: string | null): value is UsersViewType =>
    value !== null && (USERS_VIEW_LIST as readonly string[]).includes(value);

export const AdminUsersPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const activeView: UsersViewType = useMemo(() => {
        const raw = searchParams.get('view');
        return isUsersView(raw) ? raw : DEFAULT_VIEW;
    }, [searchParams]);

    const setActiveView = useCallback(
        (view: UsersViewType) => {
            setSearchParams({ view }, { replace: true });
        },
        [setSearchParams],
    );

    return (
        <div className="flex min-h-screen flex-col bg-[#0d0d0f] text-white">
            <main className="relative z-[1] mx-auto w-full max-w-[960px] flex-1 px-4 pb-20 pt-24 md:px-6 md:pt-28">
                <header className="mb-8">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                        Admin · 회원 관리
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                        회원 관리
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">
                        사용자 유입 추이와 회원 목록을 확인합니다.
                    </p>
                </header>

                <div
                    className="mb-6 flex flex-wrap gap-2"
                    role="tablist"
                    aria-label="회원 관리 보기 전환"
                >
                    {USERS_VIEW_LIST.map((view) => {
                        const isActive = view === activeView;
                        return (
                            <button
                                key={view}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => setActiveView(view)}
                                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'border-white/30 bg-white/[0.10] text-white'
                                        : 'border-white/[0.10] bg-transparent text-zinc-400 hover:border-white/20 hover:bg-white/[0.04] hover:text-white'
                                }`}
                            >
                                {VIEW_LABEL[view]}
                            </button>
                        );
                    })}
                </div>

                <section
                    aria-labelledby="admin-users-active-view"
                    className="rounded-2xl border border-white/[0.08] bg-[#141518]/90 p-5 sm:p-6"
                >
                    <h2 id="admin-users-active-view" className="sr-only">
                        {VIEW_LABEL[activeView]}
                    </h2>
                    {activeView === 'signups' && <SignupTrendView />}
                    {activeView === 'list' && <UserListView />}
                </section>

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
