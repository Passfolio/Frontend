import { useRef } from 'react';
import { Link } from 'react-router-dom';
import type { UserType } from '@/context/Auth/AuthContext';
import { useClickOutside } from '@/hooks/useClickOutside';

type ProfileDropdownMenuProps = {
    user: UserType;
    anchorRef: React.RefObject<HTMLButtonElement | null>;
    mobileAnchorRef?: React.RefObject<HTMLButtonElement | null>;
    isOpen: boolean;
    onClose: () => void;
    defaultProfileImageUrl: string;
    onLogout: () => void;
    onRevokeSession: () => void;
    onDeleteAccount: () => void;
};

export const ProfileDropdownMenu = ({
    user,
    anchorRef,
    mobileAnchorRef,
    isOpen,
    onClose,
    defaultProfileImageUrl,
    onLogout,
    onRevokeSession,
    onDeleteAccount,
}: ProfileDropdownMenuProps) => {
    const menuRef = useRef<HTMLDivElement>(null);
    useClickOutside(menuRef, onClose, isOpen);

    if (!isOpen) return null;

    // 실제로 화면에 보이는 버튼의 rect를 사용 (모바일 우선)
    const mobileRect = mobileAnchorRef?.current?.getBoundingClientRect();
    const desktopRect = anchorRef.current?.getBoundingClientRect();
    const anchorRect =
        mobileRect && mobileRect.width > 0 ? mobileRect : desktopRect;

    const top = anchorRect ? anchorRect.bottom + 10 : 70;
    const right = anchorRect ? window.innerWidth - anchorRect.right : 16;

    return (
        <div
            ref={menuRef}
            role="menu"
            aria-label="프로필 메뉴"
            style={{
                position: 'fixed',
                top,
                right,
                zIndex: 2000,
                minWidth: 240,
                background: 'linear-gradient(160deg, rgba(28,28,32,0.95) 0%, rgba(15,16,18,0.98) 100%)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14,
                boxShadow: '0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
        >
            {/* 유저 정보 */}
            <div className="flex items-center gap-3 px-4 py-3.5">
                <img
                    src={user.profileImageUrl || defaultProfileImageUrl}
                    alt="Profile avatar"
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                    style={{ border: '1px solid rgba(255,255,255,0.12)' }}
                />
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{user.nickname}</p>
                    {user.githubLogin && (
                        <p className="truncate text-xs text-zinc-500">@{user.githubLogin}</p>
                    )}
                </div>
            </div>

            <Divider />

            {/* 내 프로필 */}
            <div className="px-1.5 py-1">
                <Link
                    to="/profile"
                    role="menuitem"
                    onClick={onClose}
                    className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/[0.07] hover:text-white"
                >
                    내 프로필
                </Link>
            </div>

            <Divider />

            {/* 로그아웃 섹션 */}
            <div className="px-1.5 py-1">
                <MenuButton onClick={onLogout}>로그아웃</MenuButton>
                <MenuButton onClick={onRevokeSession}>
                    <span className="flex flex-col items-start">
                        <span>세션 종료 및 로그아웃</span>
                        <span className="text-[10px] text-zinc-600">GitHub 재연결 필요</span>
                    </span>
                </MenuButton>
            </div>

            <Divider />

            {/* 계정 삭제 */}
            <div className="px-1.5 py-1">
                <button
                    type="button"
                    role="menuitem"
                    onClick={onDeleteAccount}
                    className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/[0.10] hover:text-red-300"
                >
                    계정 삭제
                </button>
            </div>

            <Divider />

            {/* 고객센터 / 의견 보내기 */}
            <div className="px-1.5 py-1">
                <ExternalLink href="mailto:support@passfolio.kr" onClick={onClose}>
                    고객센터
                </ExternalLink>
                <ExternalLink href="mailto:feedback@passfolio.kr" onClick={onClose}>
                    의견 보내기
                </ExternalLink>
            </div>

            {/* 하단 패딩 */}
            <div className="pb-1" />
        </div>
    );
};

function Divider() {
    return <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 0' }} />;
}

function MenuButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            role="menuitem"
            onClick={onClick}
            className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/[0.07] hover:text-white"
        >
            {children}
        </button>
    );
}

function ExternalLink({
    href,
    onClick,
    children,
}: {
    href: string;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <a
            href={href}
            role="menuitem"
            onClick={onClick}
            className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/[0.07] hover:text-zinc-200"
        >
            {children}
        </a>
    );
}
