import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socialMe } from '@/apis/authApi';
import { useAuth } from '@/context/Auth/AuthContext';

export default function OAuthCallback() {
    const navigate = useNavigate();
    const { loginUser } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const response = await socialMe();

                if (response?.user) {
                    const userData = {
                        id: String(response.user.id),
                        nickname: response.user.nickname || '',
                        profileImageUrl: response.user.profileImageUrl || '',
                        githubLogin: response.user.githubLogin || '',
                        role: response.user.role || 'USER'
                    };

                    loginUser(userData);
                    navigate('/profile'); // 로그인 완료 후 프로필로 리다이렉트
                } else {
                    throw new Error('사용자 정보를 가져올 수 없습니다.');
                }
            } catch (error: any) {
                console.error('OAuth 콜백 처리 실패:', error);
                setError(error.message || '로그인 처리 중 오류가 발생했습니다.');

                setTimeout(() => {
                    navigate('/');
                }, 2000);
            }
        })();
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