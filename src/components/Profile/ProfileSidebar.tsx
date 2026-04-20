import { useCallback, useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { ProfileJobLinksSection } from './ProfileJobLinksSection';
import { MENU_LIST, type ProfileMenuItemType } from '@/constants/profile';
import type { UserType } from '@/context/Auth/AuthContext';

type ProfileSidebarProps = {
    user: UserType | null;
    /** 직무(ROLE) 키워드 요약 */
    jobLine: string;
    /** 첫 번째 학력의 학교명만 */
    educationSchool: string;
    careerYearsLabel: string;
    activeMenu: ProfileMenuItemType;
    setActiveMenu: (menu: ProfileMenuItemType) => void;
    onUpdateProfile: () => void;
};

export const ProfileSidebar = ({
    user,
    jobLine,
    educationSchool,
    careerYearsLabel,
    activeMenu, setActiveMenu,
    onUpdateProfile,
}: ProfileSidebarProps) => {
    const activeMenuIndex = useMemo(() => MENU_LIST.findIndex((m) => m === activeMenu), [activeMenu]);
    const menuListRef = useRef<HTMLUListElement | null>(null);
    const [menuUnderline, setMenuUnderline] = useState({ width: 0, left: 0, top: 0, opacity: 0 });

    const updateMenuUnderline = useCallback((menuButtonElement: HTMLButtonElement) => {
        const menuListElement = menuListRef.current;
        if (!menuListElement) return;
        const menuListRect = menuListElement.getBoundingClientRect();
        const labelElement = menuButtonElement.querySelector<HTMLElement>('[data-menu-label]');
        const buttonRect = menuButtonElement.getBoundingClientRect();
        const labelRect = labelElement?.getBoundingClientRect();
        setMenuUnderline({
            width: labelRect?.width ?? buttonRect.width,
            left: (labelRect?.left ?? buttonRect.left) - menuListRect.left,
            top: buttonRect.bottom - menuListRect.top - 7,
            opacity: 1,
        });
    }, []);

    const alignUnderlineToActiveMenu = useCallback(() => {
        const menuListElement = menuListRef.current;
        if (!menuListElement) return;
        const activeButtonElement = menuListElement.querySelector<HTMLButtonElement>('button[data-active-menu="true"]');
        if (!activeButtonElement) return;
        updateMenuUnderline(activeButtonElement);
    }, [updateMenuUnderline]);

    const handleMenuMouseEnter = (event: MouseEvent<HTMLButtonElement>) => updateMenuUnderline(event.currentTarget);
    const handleMenuMouseLeave = () => alignUnderlineToActiveMenu();

    useLayoutEffect(() => {
        alignUnderlineToActiveMenu();
    }, [activeMenu, alignUnderlineToActiveMenu]);

    return (
        <aside className="hidden lg:flex min-h-0 w-[190px] max-w-[190px] shrink-0 flex-col lg:w-[190px] lg:max-w-none lg:self-stretch">

            <div className="mb-6 flex shrink-0 flex-col gap-3">

                <div className="relative w-fit">
                    <div
                        className="h-36 w-36 overflow-hidden rounded-full border border-white/20 bg-black"
                        style={{
                            boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 0 32px rgba(255,255,255,0.10), 0 8px 24px rgba(0,0,0,0.6)',
                        }}
                    >
                        <img
                            src={user?.profileImageUrl || 'https://avatars.githubusercontent.com/u/9919?v=4'}
                            alt="프로필 아바타"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 overflow-hidden rounded-t-full">
                        <div className="h-full w-full rounded-t-full bg-gradient-to-b from-white/[0.10] to-transparent" />
                    </div>
                </div>

                <div className="flex flex-col gap-1 mt-1">
                    <h1 className="text-4xl font-bold leading-none tracking-tight text-white">
                        {user?.nickname || 'Nickname'}
                    </h1>
                    <p className="text-[0.92rem] text-zinc-500 tracking-tight">{user?.githubLogin || 'Username'}</p>
                </div>

                <p className="text-[0.85rem] font-medium text-zinc-400 tracking-tight">{jobLine}</p>

                <div className="mt-1 w-fit">
                    <div className="inline-flex w-fit flex-wrap gap-1.5">
                        <span className="rounded-full border border-white/[0.15] px-3 py-1 text-[0.72rem] font-medium text-zinc-300 backdrop-blur-xl">
                            {educationSchool}
                        </span>
                        <span className="rounded-full border border-white/[0.15] px-3 py-1 text-[0.72rem] font-medium text-zinc-300 backdrop-blur-xl">
                            {careerYearsLabel}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onUpdateProfile}
                        className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-white/[0.16] px-6 py-2.5 text-[0.82rem] font-semibold tracking-tight text-white/90 backdrop-blur-xl transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-1px_0_rgba(0,0,0,0.15),0_4px_16px_-4px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 hover:border-white/25 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_0_rgba(0,0,0,0.18),0_4px_16px_-4px_rgba(0,0,0,0.5),0_0_24px_rgba(255,255,255,0.14)] active:translate-y-0 active:scale-[0.99]"
                        style={{
                            background: 'linear-gradient(145deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 100%)',
                        }}
                    >
                        Update Profile
                    </button>
                </div>
            </div>

            <div
                className="relative w-[190px] shrink-0 overflow-hidden rounded-2xl border border-white/[0.09] p-4"
                style={{
                    background: 'rgba(18,18,22,0.92)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.09), 0 4px 24px -6px rgba(0,0,0,0.5)',
                }}
            >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <ul
                    ref={menuListRef}
                    className="relative flex flex-col text-[0.8rem] font-medium text-zinc-500"
                    onMouseLeave={handleMenuMouseLeave}
                >
                    {MENU_LIST.map((menuItem, index) => {
                        const isActive = activeMenu === menuItem;
                        return (
                            <li key={menuItem}>
                                <button
                                    type="button"
                                    onClick={() => setActiveMenu(menuItem)}
                                    onMouseEnter={handleMenuMouseEnter}
                                    data-active-menu={isActive}
                                    className={`w-full rounded-lg px-2 py-2.5 text-left transition-all duration-150 ${
                                        isActive
                                            ? 'text-white'
                                            : 'hover:bg-white/[0.04] hover:text-zinc-300'
                                    }`}
                                >
                                    <span data-menu-label>{menuItem}</span>
                                    {activeMenuIndex === index && <span className="sr-only">선택됨</span>}
                                </button>
                            </li>
                        );
                    })}

                    <span
                        className="pointer-events-none absolute h-[1.5px] rounded-full bg-white transition-all duration-200"
                        style={{
                            width: menuUnderline.opacity ? `${menuUnderline.width}px` : 0,
                            left: `${menuUnderline.left}px`,
                            top: `${menuUnderline.top}px`,
                            opacity: menuUnderline.opacity,
                            boxShadow: '0 0 8px rgba(255,255,255,0.6), 0 0 20px rgba(255,255,255,0.25)',
                        }}
                    />
                </ul>
            </div>

            <div className="mt-3 flex min-h-0 min-w-0 flex-1 flex-col">
                <ProfileJobLinksSection className="h-full" />
            </div>
        </aside>
    );
};
