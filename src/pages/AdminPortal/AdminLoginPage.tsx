import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { postSystemAuthLogin } from '@/api/Auth/systemAuthApi';
import { fetchMe, logout } from '@/api/Auth/authApi';
import { clearTokenExpiresInfo, saveTokenExpiresInfo } from '@/api/Auth/tokenRefreshManager';
import { useAuth } from '@/context/Auth/AuthContext';
import {
    ADMIN_DEFAULT_PROFILE_IMAGE_URL,
    ADMIN_PORTAL_PROFILE_PATH,
    ADMIN_PORTAL_SIGNUP_PATH,
} from '@/constants/adminPortal';
import { mapMeToUserType } from '@/utils/Auth/mapMeToUserType';
import { extractErrorMessage } from '@/utils/errorMessage';

export const AdminLoginPage = () => {
    const navigate = useNavigate();
    const { loginUser, logoutUser } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            const tokenExpiresInfo = await postSystemAuthLogin(email.trim(), password, rememberMe);
            saveTokenExpiresInfo(tokenExpiresInfo);
            const me = await fetchMe();
            const userData = mapMeToUserType(me);
            if (userData.role !== 'ADMIN') {
                clearTokenExpiresInfo();
                await logout().catch(() => {});
                logoutUser();
                setError('관리자 계정이 아닙니다. 시스템 관리자만 이 경로에서 로그인할 수 있습니다.');
                setSubmitting(false);
                return;
            }
            loginUser(userData);
            navigate(ADMIN_PORTAL_PROFILE_PATH, { replace: true });
        } catch (err: unknown) {
            setError(extractErrorMessage(err, '로그인에 실패했습니다.'));
            setSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0d0d0f] px-4 py-16">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#16171a] p-8 shadow-lg">
                <div className="mb-8 text-center">
                    <img
                        src={ADMIN_DEFAULT_PROFILE_IMAGE_URL}
                        alt=""
                        width={48}
                        height={48}
                        className="mx-auto rounded-full border border-white/12 object-cover"
                    />
                    <h1 className="mt-4 text-xl font-semibold tracking-tight text-white">관리자 로그인</h1>
                    <p className="mt-1 text-sm text-zinc-500">시스템 계정(이메일)으로 로그인합니다.</p>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="admin-login-email" className="mb-1.5 block text-xs font-medium text-zinc-400">
                            이메일 (username)
                        </label>
                        <input
                            id="admin-login-email"
                            type="email"
                            autoComplete="username"
                            value={email}
                            onChange={(ev) => setEmail(ev.target.value)}
                            required
                            className="w-full rounded-xl border border-white/10 bg-[#0d0d0f] px-4 py-2.5 text-sm text-white outline-none ring-0 transition-colors placeholder:text-zinc-600 focus:border-white/20"
                            placeholder="admin@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="admin-login-password" className="mb-1.5 block text-xs font-medium text-zinc-400">
                            비밀번호
                        </label>
                        <input
                            id="admin-login-password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(ev) => setPassword(ev.target.value)}
                            required
                            className="w-full rounded-xl border border-white/10 bg-[#0d0d0f] px-4 py-2.5 text-sm text-white outline-none focus:border-white/20"
                        />
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(ev) => setRememberMe(ev.target.checked)}
                            className="rounded border-white/20 bg-[#0d0d0f] text-white focus:ring-white/30"
                        />
                        로그인 상태 유지
                    </label>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-[#0d0d0f] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting ? '처리 중…' : '로그인'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-zinc-500">
                    계정이 없으신가요?{' '}
                    <Link to={ADMIN_PORTAL_SIGNUP_PATH} className="text-zinc-300 underline-offset-2 hover:text-white hover:underline">
                        관리자 회원가입
                    </Link>
                </p>
            </div>
        </div>
    );
};
