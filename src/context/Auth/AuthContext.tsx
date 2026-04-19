import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';

export type UserType = {
    id: string;
    nickname: string;
    profileImageUrl: string;
    githubLogin: string;
    role: string; // TODO: 나중에 Role 필드 뺄 것.
};

interface AuthContextType {
    user: UserType | null;
    loginUser: (userData: UserType) => void;
    logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getInitialUser = (): UserType | null => {
    const storedId = localStorage.getItem('userId');
    const storedNickname = localStorage.getItem('nickname');
    const storedGithubLogin = localStorage.getItem('githubLogin');
    const storedProfileUrl = localStorage.getItem('profileImageUrl');
    const storedRole = localStorage.getItem('role');

    if (storedId && storedNickname && storedGithubLogin && storedProfileUrl && storedRole) {
        return {
            id: storedId,
            nickname: storedNickname,
            githubLogin: storedGithubLogin,
            profileImageUrl: storedProfileUrl,
            role: storedRole
        };
    }
    return null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserType | null>(getInitialUser);

    // 다른 탭에서의 로그인/로그아웃 동기화
    useEffect(() => {
        const handleStorageChange = () => {
            setUser(getInitialUser());
        };
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
        localStorage.setItem('userId', userData.id);
        localStorage.setItem('nickname', userData.nickname);
        localStorage.setItem('githubLogin', userData.githubLogin);
        localStorage.setItem('profileImageUrl', userData.profileImageUrl);
        localStorage.setItem('role', userData.role);

        setUser(userData);
        window.dispatchEvent(new CustomEvent('auth-change', { detail: userData }));
    }, []);

    const logoutUser = useCallback(() => {
        localStorage.clear();
        setUser(null);
        window.dispatchEvent(new CustomEvent('auth-change', { detail: null }));
    }, []);

    const contextValue = useMemo(() => ({
        user,
        loginUser,
        logoutUser
    }), [user, loginUser, logoutUser]);

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