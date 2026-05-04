import { useState } from 'react';
import { Link } from 'react-router-dom';
import { postSystemAuthEmailSend, postSystemAuthEmailVerify, postSystemAuthSignup } from '@/api/Auth/systemAuthApi';
import { ADMIN_DEFAULT_PROFILE_IMAGE_URL, ADMIN_PORTAL_LOGIN_PATH } from '@/constants/adminPortal';
import { extractErrorMessage } from '@/utils/errorMessage';

type SignupStepType = 'email' | 'code' | 'credentials';

export const AdminSignupPage = () => {
    const [step, setStep] = useState<SignupStepType>('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [nickname, setNickname] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const normalizedEmail = email.trim().toLowerCase();

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await postSystemAuthEmailSend(normalizedEmail);
            setStep('code');
        } catch (err: unknown) {
            setError(extractErrorMessage(err, '인증 메일 발송에 실패했습니다.'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await postSystemAuthEmailVerify(normalizedEmail, code.trim());
            setStep('credentials');
        } catch (err: unknown) {
            setError(extractErrorMessage(err, '인증 코드가 올바르지 않습니다.'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (password.length < 8 || password.length > 72) {
            setError('비밀번호는 8자 이상 72자 이하여야 합니다.');
            return;
        }
        if (password !== passwordConfirm) {
            setError('비밀번호 확인이 일치하지 않습니다.');
            return;
        }
        setSubmitting(true);
        try {
            await postSystemAuthSignup({
                email: normalizedEmail,
                password,
                nickname: nickname.trim() || undefined,
                role: 'ADMIN',
            });
            setSuccessMessage('가입이 완료되었습니다. 로그인 페이지에서 로그인해 주세요.');
        } catch (err: unknown) {
            setError(extractErrorMessage(err, '회원가입에 실패했습니다.'));
        } finally {
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
                    <h1 className="mt-4 text-xl font-semibold tracking-tight text-white">관리자 회원가입</h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        {step === 'email' && '이메일 인증 후 관리자(ADMIN) 계정이 생성됩니다.'}
                        {step === 'code' && '메일로 받은 6자리 코드를 입력해 주세요.'}
                        {step === 'credentials' && '비밀번호를 설정하면 가입이 완료됩니다.'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {successMessage && (
                    <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                        <p className="text-sm text-emerald-400">{successMessage}</p>
                        <Link
                            to={ADMIN_PORTAL_LOGIN_PATH}
                            className="mt-3 inline-block text-sm font-medium text-white underline-offset-2 hover:underline"
                        >
                            로그인 페이지로 이동
                        </Link>
                    </div>
                )}

                {!successMessage && step === 'email' && (
                    <form onSubmit={handleSendCode} className="space-y-4">
                        <div>
                            <label htmlFor="admin-signup-email" className="mb-1.5 block text-xs font-medium text-zinc-400">
                                이메일
                            </label>
                            <input
                                id="admin-signup-email"
                                type="email"
                                value={email}
                                onChange={(ev) => setEmail(ev.target.value)}
                                required
                                className="w-full rounded-xl border border-white/10 bg-[#0d0d0f] px-4 py-2.5 text-sm text-white outline-none focus:border-white/20"
                                placeholder="허용된 도메인의 이메일"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-[#0d0d0f] transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                            {submitting ? '발송 중…' : '인증 코드 받기'}
                        </button>
                    </form>
                )}

                {!successMessage && step === 'code' && (
                    <form onSubmit={handleVerifyCode} className="space-y-4">
                        <p className="text-sm text-zinc-400">
                            <span className="text-zinc-300">{normalizedEmail}</span> 로 발송했습니다.
                        </p>
                        <div>
                            <label htmlFor="admin-signup-code" className="mb-1.5 block text-xs font-medium text-zinc-400">
                                인증 코드 (6자리)
                            </label>
                            <input
                                id="admin-signup-code"
                                inputMode="numeric"
                                pattern="[0-9]{6}"
                                maxLength={6}
                                value={code}
                                onChange={(ev) => setCode(ev.target.value.replace(/\D/g, ''))}
                                required
                                className="w-full rounded-xl border border-white/10 bg-[#0d0d0f] px-4 py-2.5 text-sm tracking-widest text-white outline-none focus:border-white/20"
                                placeholder="000000"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting || code.length !== 6}
                            className="w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-[#0d0d0f] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting ? '확인 중…' : '코드 확인'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setStep('email');
                                setCode('');
                                setError(null);
                            }}
                            className="w-full text-sm text-zinc-500 hover:text-zinc-300"
                        >
                            이메일 다시 입력
                        </button>
                    </form>
                )}

                {!successMessage && step === 'credentials' && (
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                            <label htmlFor="admin-signup-nickname" className="mb-1.5 block text-xs font-medium text-zinc-400">
                                닉네임 (선택, 미입력 시 이메일 @ 앞부분)
                            </label>
                            <input
                                id="admin-signup-nickname"
                                type="text"
                                value={nickname}
                                onChange={(ev) => setNickname(ev.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-[#0d0d0f] px-4 py-2.5 text-sm text-white outline-none focus:border-white/20"
                            />
                        </div>
                        <div>
                            <label htmlFor="admin-signup-password" className="mb-1.5 block text-xs font-medium text-zinc-400">
                                비밀번호 (8~72자)
                            </label>
                            <input
                                id="admin-signup-password"
                                type="password"
                                autoComplete="new-password"
                                value={password}
                                onChange={(ev) => setPassword(ev.target.value)}
                                required
                                minLength={8}
                                maxLength={72}
                                className="w-full rounded-xl border border-white/10 bg-[#0d0d0f] px-4 py-2.5 text-sm text-white outline-none focus:border-white/20"
                            />
                        </div>
                        <div>
                            <label htmlFor="admin-signup-password2" className="mb-1.5 block text-xs font-medium text-zinc-400">
                                비밀번호 확인
                            </label>
                            <input
                                id="admin-signup-password2"
                                type="password"
                                autoComplete="new-password"
                                value={passwordConfirm}
                                onChange={(ev) => setPasswordConfirm(ev.target.value)}
                                required
                                className="w-full rounded-xl border border-white/10 bg-[#0d0d0f] px-4 py-2.5 text-sm text-white outline-none focus:border-white/20"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-[#0d0d0f] transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                            {submitting ? '가입 처리 중…' : '가입 완료'}
                        </button>
                    </form>
                )}

                <p className="mt-6 text-center text-sm text-zinc-500">
                    이미 계정이 있으신가요?{' '}
                    <Link to={ADMIN_PORTAL_LOGIN_PATH} className="text-zinc-300 underline-offset-2 hover:text-white hover:underline">
                        로그인
                    </Link>
                </p>
            </div>
        </div>
    );
};
