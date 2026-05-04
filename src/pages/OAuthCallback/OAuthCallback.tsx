import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socialMe } from '@/api/Auth/authApi';
import { useAuth } from '@/context/Auth/AuthContext';
import { ADMIN_PORTAL_PROFILE_PATH } from '@/constants/adminPortal';
import { mapMeToUserType } from '@/utils/Auth/mapMeToUserType';
import { extractErrorMessage } from '@/utils/errorMessage';

export const OAuthCallback = () => {
    const navigate = useNavigate();
    const { loginUser } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        let errorNavigateTimer: ReturnType<typeof setTimeout> | null = null;

        (async () => {
            try {
                const response = await socialMe();
                if (cancelled) return;

                if (response?.user) {
                    const userData = mapMeToUserType(response.user);

                    loginUser(userData);
                    navigate(userData.role === 'ADMIN' ? ADMIN_PORTAL_PROFILE_PATH : '/profile');
                } else {
                    throw new Error('사용자 정보를 가져올 수 없습니다.');
                }
            } catch (error: unknown) {
                if (cancelled) return;
                console.error('OAuth 콜백 처리 실패:', error);
                setError(extractErrorMessage(error, '로그인 처리 중 오류가 발생했습니다.'));

                errorNavigateTimer = setTimeout(() => {
                    if (!cancelled) navigate('/');
                }, 2000);
            }
        })();

        return () => {
            cancelled = true;
            if (errorNavigateTimer != null) clearTimeout(errorNavigateTimer);
        };
    }, [navigate, loginUser]);

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0d0d0f]">
                <div className="bg-[#16171a] p-8 rounded-lg shadow-lg w-96 text-center border border-white/10">
                    <p className="text-red-500 mb-4">{error}</p>
                    <p className="text-zinc-400 text-sm">홈 화면으로 이동합니다...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#0d0d0f]">
            <div className="bg-[#16171a] p-8 rounded-lg shadow-lg w-96 text-center border border-white/10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-zinc-300">GitHub 로그인 처리 중...</p>
            </div>
        </div>
    );
}