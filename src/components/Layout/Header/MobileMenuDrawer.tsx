import { Link } from 'react-router-dom';
import type { UserType } from '@/context/Auth/AuthContext';
import type { LandingNavLinkType } from '@/constants/landingPage';
import { MENU_LIST, MENU_SECTION_SLUG } from '@/constants/profile';

type MobileMenuDrawerProps = {
    isOpen: boolean;
    onClose: () => void;
    logoSrc: string;
    menuIconSrc: string;
    navLinkList: LandingNavLinkType[];
    user: UserType | null;
    onLogout: (e: React.MouseEvent) => void;
};

export const MobileMenuDrawer = ({
    isOpen,
    onClose,
    logoSrc,
    menuIconSrc,
    navLinkList,
    user,
    onLogout,
}: MobileMenuDrawerProps) => {
    return (
        <>
            {/* 배경 오버레이 */}
            <div
                className={`fixed inset-0 z-[1001] transition-opacity duration-300 lg:hidden ${
                    isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
                style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
                onClick={onClose}
            />

            {/* ── Liquid Glass 드로어 패널 ── */}
            <aside
                className={`fixed left-0 top-0 z-[1002] flex h-full w-72 flex-col transition-transform duration-300 ease-in-out lg:hidden ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                style={{
                    background:
                        'linear-gradient(160deg, rgba(28,28,32,0.92) 0%, rgba(15,16,18,0.96) 100%)',
                    backdropFilter: 'blur(40px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                    borderRight: '1px solid rgba(255,255,255,0.07)',
                    boxShadow:
                        '4px 0 40px rgba(0,0,0,0.7), inset -1px 0 0 rgba(255,255,255,0.04)',
                }}
            >
                {/* 우측 엣지 specular — 빛이 유리 측면을 투과하는 효과 */}
                <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-white/[0.12] via-white/[0.04] to-transparent" />

                {/* 상단: 로고 + 닫기 버튼 */}
                <div
                    className="flex items-center justify-between px-5 py-4"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                >
                    <img src={logoSrc} alt="Passfolio" className="h-7 object-contain opacity-90" />
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="메뉴 닫기"
                        className="flex items-center justify-center rounded-full border border-white/[0.12] p-1.5 transition-colors duration-150 hover:border-white/20 hover:bg-white/[0.08]"
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
                        }}
                    >
                        <img src={menuIconSrc} alt="" className="h-5 w-5 opacity-70" />
                    </button>
                </div>

                {/* 네비 링크 (Documentation, Service, Article) */}
                {/* nav 태그 사용 금지 — landerPage.css 전역 nav 스타일(fixed top-0) 충돌 방지 */}
                <div
                    className="flex flex-col px-4 py-3"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                    {navLinkList.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            onClick={onClose}
                            className="rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-white"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                {/* 프로필 섹션 메뉴 */}
                <div className="flex flex-col px-4 py-3">
                    <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-600">
                        프로필
                    </p>
                    {MENU_LIST.map((menuItem) => (
                        <Link
                            key={menuItem}
                            to={`/profile?section=${MENU_SECTION_SLUG[menuItem]}`}
                            onClick={onClose}
                            className="rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-white"
                        >
                            {menuItem}
                        </Link>
                    ))}
                </div>

                {/* 로그아웃 */}
                {user && (
                    <div
                        className="mt-auto px-4 py-4"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <a
                            href="#"
                            onClick={(e) => {
                                onLogout(e);
                                onClose();
                            }}
                            className="rounded-xl px-3 py-2.5 text-sm text-zinc-500 transition-all duration-150 hover:bg-white/[0.05] hover:text-zinc-300"
                        >
                            Logout
                        </a>
                    </div>
                )}
            </aside>
        </>
    );
};
