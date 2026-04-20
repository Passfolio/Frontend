import { useState, useRef, useCallback, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { MOBILE_MEDIA_QUERY } from '@/constants/ui';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/Auth/AuthContext';
import { logout, revokeSession, deleteAccount } from '@/api/Auth/authApi';
import { useNavbarScroll } from '@/hooks/Layout/useNavbarScroll';
import { useNavUnderline } from '@/hooks/Layout/useNavUnderline';
import { NavigationBar } from './NavigationBar';
import { MobileMenuDrawer } from './MobileMenuDrawer';
import { ProfileDropdownMenu } from './ProfileDropdownMenu';
import { DeleteAccountConfirmModal } from './DeleteAccountConfirmModal';
import {
    LANDING_LOGO_SRC,
    LANDING_NAV_LINK_LIST,
    LANDING_DEFAULT_PROFILE_IMAGE_URL
} from '@/constants/landingPage';
import menuIconSrc from '@/assets/ui/menu.png';

export const Header = () => {
    const { isNavScrolled } = useNavbarScroll();
    const { underline, handleLinkMouseEnter, handleLinksMouseLeave } = useNavUnderline();
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();

    const isAuthenticated = Boolean(user?.id || localStorage.getItem('userId'));
    const isNarrowViewport = useMediaQuery(MOBILE_MEDIA_QUERY);
    const useCompactHeaderLayout = isNarrowViewport;
    const mobileMenuBreakpoint: 'md' | 'lg' = 'md';
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const profileButtonRef = useRef<HTMLButtonElement>(null);
    const mobileProfileButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!isNarrowViewport) setIsMenuOpen(false);
    }, [isNarrowViewport]);

    const openMenu = () => setIsMenuOpen(true);

    const handleScrollToTop = () => {
        if (window.location.pathname === '/') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            navigate('/');
        }
    };

    const performLogout = useCallback(async () => {
        setIsDropdownOpen(false);
        await logout();
        logoutUser();
        navigate('/');
    }, [logoutUser, navigate]);

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();
        await performLogout();
    };

    const handleRevokeSession = useCallback(async () => {
        setIsDropdownOpen(false);
        await revokeSession();
        logoutUser();
        navigate('/');
    }, [logoutUser, navigate]);

    const handleConfirmDelete = useCallback(async () => {
        setIsDeleteModalOpen(false);
        const ok = await deleteAccount();
        if (ok) {
            logoutUser();
            navigate('/');
        }
    }, [logoutUser, navigate]);

    return (
        <>
            <NavigationBar
                handleLinkMouseEnter={handleLinkMouseEnter}
                handleLinksMouseLeave={handleLinksMouseLeave}
                handleScrollToTop={handleScrollToTop}
                isNavScrolled={isNavScrolled}
                underline={underline}
                logoSrc={LANDING_LOGO_SRC}
                navLinkList={LANDING_NAV_LINK_LIST}
                defaultProfileImageUrl={LANDING_DEFAULT_PROFILE_IMAGE_URL}
                user={user}
                enableMobileMenu={useCompactHeaderLayout}
                showProfileControls={isAuthenticated}
                mobileMenuBreakpoint={mobileMenuBreakpoint}
                onMenuOpen={openMenu}
                menuIconSrc={menuIconSrc}
                profileButtonRef={profileButtonRef}
                mobileProfileButtonRef={mobileProfileButtonRef}
                onProfileAvatarClick={() => setIsDropdownOpen((prev) => !prev)}
                isDropdownOpen={isDropdownOpen}
            />

            {useCompactHeaderLayout && (
                <MobileMenuDrawer
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    logoSrc={LANDING_LOGO_SRC}
                    menuIconSrc={menuIconSrc}
                    navLinkList={LANDING_NAV_LINK_LIST}
                    user={user}
                    onLogout={handleLogout}
                    showProfileSection={isAuthenticated}
                    mobileMenuBreakpoint={mobileMenuBreakpoint}
                />
            )}

            {user && (
                <ProfileDropdownMenu
                    user={user}
                    anchorRef={profileButtonRef}
                    mobileAnchorRef={mobileProfileButtonRef}
                    isOpen={isDropdownOpen}
                    onClose={() => setIsDropdownOpen(false)}
                    defaultProfileImageUrl={LANDING_DEFAULT_PROFILE_IMAGE_URL}
                    onLogout={performLogout}
                    onRevokeSession={handleRevokeSession}
                    onDeleteAccount={() => {
                        setIsDropdownOpen(false);
                        setIsDeleteModalOpen(true);
                    }}
                />
            )}

            <DeleteAccountConfirmModal
                isOpen={isDeleteModalOpen}
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
            />
        </>
    );
}
