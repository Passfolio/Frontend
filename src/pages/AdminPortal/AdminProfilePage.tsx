import { Link } from 'react-router-dom';
import { LanderFooter } from '@/components/Lander/LanderFooter';
import { useAuth } from '@/context/Auth/AuthContext';
import { ADMIN_DEFAULT_PROFILE_IMAGE_URL } from '@/constants/adminPortal';
import '@/pages/Lander/landerPage.css';

type AdminCapabilityCardProps = {
    title: string;
    description: string;
    to?: string;
    isComingSoon?: boolean;
};

const AdminCapabilityCard = ({ title, description, to, isComingSoon }: AdminCapabilityCardProps) => {
    const inner = (
        <>
            <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold text-white">{title}</h2>
                {isComingSoon && (
                    <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-400">
                        출시 예정
                    </span>
                )}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">{description}</p>
        </>
    );

    const className =
        'block rounded-2xl border border-white/[0.08] bg-[#141518]/90 p-5 transition-colors hover:border-white/[0.14] hover:bg-[#18191d]';

    if (to && !isComingSoon) {
        return (
            <Link to={to} className={className}>
                {inner}
            </Link>
        );
    }

    return (
        <div className={`${className} cursor-default opacity-90`}>
            {inner}
        </div>
    );
};

export const AdminProfilePage = () => {
    const { user } = useAuth();
    const displayName = user?.nickname || '관리자';
    const avatarSrc = user?.profileImageUrl || ADMIN_DEFAULT_PROFILE_IMAGE_URL;

    return (
        <div
            className="flex min-h-screen flex-col bg-[#0d0d0f] text-white"
            style={{
                backgroundImage: [
                    'linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px)',
                    'linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px)',
                ].join(', '),
                backgroundSize: '40px 40px',
                backgroundPosition: 'center top',
            }}
        >
            <div
                className="pointer-events-none fixed inset-0 z-0"
                style={{
                    background: [
                        'radial-gradient(ellipse 60% 40% at 20% 10%, rgba(255,255,255,0.04) 0%, transparent 70%)',
                        'radial-gradient(ellipse 40% 30% at 80% 85%, rgba(255,255,255,0.025) 0%, transparent 70%)',
                    ].join(', '),
                }}
            />

            <main className="relative z-[1] mx-auto w-full max-w-[960px] flex-1 px-4 pb-20 pt-24 md:px-6 md:pt-28">
                <header className="mb-10 flex flex-col gap-6 border-b border-white/[0.08] pb-10 md:flex-row md:items-center md:gap-8">
                    <img
                        src={avatarSrc}
                        alt=""
                        width={96}
                        height={96}
                        className="h-24 w-24 shrink-0 rounded-full border border-white/12 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">Administrator</p>
                        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">{displayName}</h1>
                        <p className="mt-2 text-sm text-zinc-500">
                            시스템 관리자 전용 홈입니다. 일반 회원 프로필(GitHub 연동)과는 별도의 화면입니다.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200/90">
                                ROLE_ADMIN
                            </span>
                        </div>
                    </div>
                </header>

                <section aria-labelledby="admin-capabilities-heading">
                    <h2 id="admin-capabilities-heading" className="text-lg font-semibold text-white">
                        관리 기능
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">백엔드 권한과 연동된 작업만 활성화되어 있습니다.</p>

                    <ul className="mt-8 grid list-none gap-4 p-0 sm:grid-cols-2">
                        <li>
                            <AdminCapabilityCard
                                title="Article 작성"
                                description="관리자 권한으로 인사이트 글을 작성·게시합니다."
                                to="/articles/new"
                            />
                        </li>
                        <li>
                            <AdminCapabilityCard
                                title="회원 및 권한 관리"
                                description="조직 내 계정·역할을 검토하고 정책에 맞게 조정합니다."
                                isComingSoon
                            />
                        </li>
                        <li>
                            <AdminCapabilityCard
                                title="운영 지표"
                                description="서비스 이용·콘텐츠 지표를 한눈에 확인합니다."
                                isComingSoon
                            />
                        </li>
                        <li>
                            <AdminCapabilityCard
                                title="시스템 설정"
                                description="알림, 유지보수 모드 등 운영 설정을 관리합니다."
                                isComingSoon
                            />
                        </li>
                    </ul>
                </section>

                <div className="mt-12">
                    <Link
                        to="/articles"
                        className="text-sm text-zinc-500 transition-colors hover:text-white"
                    >
                        ← 공개 Article 목록으로
                    </Link>
                </div>
            </main>

            <LanderFooter />
        </div>
    );
};
