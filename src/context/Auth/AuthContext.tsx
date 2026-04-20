import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import type { UserType, AuthContextType } from '@/types/auth.type';
import { AUTH_STORAGE_KEYS } from '@/utils/Auth/localStorageKeys';

export type { UserType };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getInitialUser = (): UserType | null => {
    const storedId = localStorage.getItem(AUTH_STORAGE_KEYS.USER_ID);
    const storedNickname = localStorage.getItem(AUTH_STORAGE_KEYS.NICKNAME);
    const storedGithubLogin = localStorage.getItem(AUTH_STORAGE_KEYS.GITHUB_LOGIN);
    const storedProfileUrl = localStorage.getItem(AUTH_STORAGE_KEYS.PROFILE_IMAGE_URL);
    const storedRole = localStorage.getItem(AUTH_STORAGE_KEYS.ROLE);

    if (storedId && storedNickname && storedGithubLogin && storedProfileUrl && storedRole) {
        return {
            id: storedId,
            nickname: storedNickname,
            githubLogin: storedGithubLogin,
            profileImageUrl: storedProfileUrl,
            role: storedRole,
        };
    }
    return null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserType | null>(getInitialUser);

    useEffect(() => {
        const handleStorageChange = () => setUser(getInitialUser());
        window.addEventListener('storage', handleStorageChange);

        const handleAuthChange = (e: Event) => {
            const customEvent = e as CustomEvent;
            setUser(customEvent.detail);
        };
        window.addEventListener('auth-change', handleAuthChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('auth-change', handleAuthChange);
        };
    }, []);

    const loginUser = useCallback((userData: UserType) => {
        localStorage.setItem(AUTH_STORAGE_KEYS.USER_ID, userData.id);
        localStorage.setItem(AUTH_STORAGE_KEYS.NICKNAME, userData.nickname);
        localStorage.setItem(AUTH_STORAGE_KEYS.GITHUB_LOGIN, userData.githubLogin);
        localStorage.setItem(AUTH_STORAGE_KEYS.PROFILE_IMAGE_URL, userData.profileImageUrl);
        localStorage.setItem(AUTH_STORAGE_KEYS.ROLE, userData.role);
        setUser(userData);
        window.dispatchEvent(new CustomEvent('auth-change', { detail: userData }));
    }, []);

    const logoutUser = useCallback(() => {
        localStorage.clear();
        setUser(null);
        window.dispatchEvent(new CustomEvent('auth-change', { detail: null }));
    }, []);

    const contextValue = useMemo(() => ({ user, loginUser, logoutUser }), [user, loginUser, logoutUser]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
