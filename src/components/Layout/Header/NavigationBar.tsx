import type { UserType } from '@/context/Auth/AuthContext';
import type { NavUnderlineStateType } from '@/hooks/Layout/useNavUnderline';
import type { LandingNavLinkType } from '@/constants/landingPage';

type NavigationBarProps = {
    handleLinkMouseEnter: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    handleLinksMouseLeave: () => void;
    handleScrollToTop: () => void;
    isNavScrolled: boolean;
    underline: NavUnderlineStateType;
    logoSrc: string;
    navLinkList: LandingNavLinkType[];
    defaultProfileImageUrl: string;
    user: UserType | null;
    /** true이면 모바일 전용 레이아웃(햄버거+중앙로고+아바타) 활성화. false이면 원래 데스크탑 스타일 유지. */
    enableMobileMenu: boolean;
    onMenuOpen: () => void;
    menuIconSrc: string;
    profileButtonRef?: React.RefObject<HTMLButtonElement | null>;
    mobileProfileButtonRef?: React.RefObject<HTMLButtonElement | null>;
    onProfileAvatarClick?: () => void;
    isDropdownOpen?: boolean;
};

export function NavigationBar({
    handleLinkMouseEnter,
    handleLinksMouseLeave,
    handleScrollToTop,
    isNavScrolled,
    underline,
    logoSrc,
    navLinkList,
    defaultProfileImageUrl,
    user,
    enableMobileMenu,
    onMenuOpen,
    menuIconSrc,
    profileButtonRef,
    mobileProfileButtonRef,
    onProfileAvatarClick,
    isDropdownOpen,
}: NavigationBarProps) {
    return (
        <nav id="navbar" className={isNavScrolled ? 'scrolled' : ''}>
            <div className={`nav-container${enableMobileMenu ? ' relative !px-4 md:!px-10' : ''}`}>

                {/* 프로필 페이지 모바일: 햄버거 버튼 */}
                {enableMobileMenu && (
                    <button
                        type="button"
                        onClick={onMenuOpen}
                        aria-label="메뉴 열기"
                        className="z-[2] flex items-center border-none bg-transparent p-1 lg:hidden"
                    >
                        <img src={menuIconSrc} alt="" className="h-6 w-6" />
                    </button>
                )}

                {/* 로고: 프로필 모바일=중앙 절대 배치 / 그 외=좌측 정적 배치 */}
                <button
                    type="button"
                    className={
                        enableMobileMenu
                            ? 'logo-group absolute left-1/2 -translate-x-1/2 lg:relative lg:left-auto lg:translate-x-0'
                            : 'logo-group'
                    }
                    onClick={handleScrollToTop}
                >
                    <img
                        src={logoSrc}
                        alt="Passfolio Logo"
                        height={50}
                        width={180}
                        className={enableMobileMenu ? 'w-28 rounded object-contain lg:w-[180px]' : 'rounded object-contain'}
                        fetchPriority="high"
                        decoding="async"
                    />
                </button>

                {/* 네비 링크 + 프로필 아바타: 프로필 모바일에서는 lg 이상만 표시, 그 외는 항상 표시 */}
                <div className={`nav-right${enableMobileMenu ? ' hidden lg:flex' : ''}`}>
                    <div className="nav-links" onMouseLeave={handleLinksMouseLeave}>
                        {navLinkList.map((link) => (
                            <a key={link.href} href={link.href} onMouseEnter={handleLinkMouseEnter}>
                                {link.label}
                            </a>
                        ))}

                        <div
                            className="nav-underline"
                            style={{
                                width: underline.opacity ? `${underline.width}px` : 0,
                                left: `${underline.left}px`,
                                opacity: underline.opacity,
                            }}
                        />
                    </div>

                    {user && (
                        <button
                            ref={profileButtonRef}
                            type="button"
                            aria-haspopup="menu"
                            aria-expanded={isDropdownOpen}
                            aria-label="프로필 메뉴 열기"
                            onClick={onProfileAvatarClick}
                            className="nav-profile-link border-none bg-transparent p-0"
                        >
                            <img
                                src={user.profileImageUrl || defaultProfileImageUrl}
                                alt="Profile avatar"
                                className="nav-profile-image"
                                loading="lazy"
                                decoding="async"
                            />
                        </button>
                    )}
                </div>

                {/* 프로필 페이지 모바일: 프로필 이미지 아바타 버튼 */}
                {enableMobileMenu && (
                    <button
                        ref={mobileProfileButtonRef}
                        type="button"
                        aria-haspopup="menu"
                        aria-expanded={isDropdownOpen}
                        aria-label="프로필 메뉴 열기"
                        onClick={onProfileAvatarClick}
                        className="z-[2] inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/25 bg-transparent p-0 transition-colors hover:border-white/40 lg:hidden"
                    >
                        <img
                            src={user?.profileImageUrl || defaultProfileImageUrl}
                            alt="Profile avatar"
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                        />
                    </button>
                )}
            </div>
        </nav>
    );
}
