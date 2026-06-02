import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postStartAnalysis } from '@/api/ProjectAnalysis/projectAnalysisApi';
import type { AnalysisModeType } from '@/types/userProjectAnalysis.type';

type AnalysisStartModalProps = {
    isOpen: boolean;
    repoUrls: string[]; // 분석 대상(AVAILABLE, ≤3)
    onClose: () => void;
};

const MODE_OPTIONS: { value: AnalysisModeType; label: string; description: string }[] = [
    { value: 'NONSTOP', label: '논스톱', description: '분석 후 포트폴리오까지 자동 생성합니다.' },
    { value: 'STEP', label: '단계별', description: '분석만 수행하고 결과를 확인합니다.' },
];

const shortenRepoUrl = (repoUrl: string): string =>
    repoUrl.replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');

// 입력 전화번호를 E.164(+82…)로 정규화. 빈 문자열이면 null(미입력).
const normalizePhone = (raw: string): string | null => {
    const trimmed = raw.trim();
    if (trimmed === '') return null;
    if (trimmed.startsWith('+')) {
        const digits = trimmed.slice(1).replace(/\D/g, '');
        return digits === '' ? null : `+${digits}`;
    }
    const digits = trimmed.replace(/\D/g, '');
    if (digits === '') return null;
    // 국내 번호(0으로 시작) → +82로 변환. 그 외는 그대로 +붙임.
    return digits.startsWith('0') ? `+82${digits.slice(1)}` : `+${digits}`;
};

const isValidE164 = (e164: string): boolean => /^\+[1-9]\d{7,14}$/.test(e164);

export const AnalysisStartModal = ({ isOpen, repoUrls, onClose }: AnalysisStartModalProps) => {
    const navigate = useNavigate();
    const [mode, setMode] = useState<AnalysisModeType>('NONSTOP');
    const [smsOptIn, setSmsOptIn] = useState<boolean>(false);
    const [phone, setPhone] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const normalizedPhone = useMemo(() => normalizePhone(phone), [phone]);
    const phoneInvalid = smsOptIn && (normalizedPhone === null || !isValidE164(normalizedPhone));

    const handleSubmit = useCallback(async () => {
        if (repoUrls.length === 0 || isSubmitting) return;
        if (smsOptIn && phoneInvalid) {
            setErrorMessage('휴대폰 번호 형식을 확인해주세요. (예: 010-1234-5678)');
            return;
        }
        setIsSubmitting(true);
        setErrorMessage(null);
        try {
            const res = await postStartAnalysis(
                repoUrls,
                mode,
                smsOptIn && normalizedPhone ? normalizedPhone : undefined,
            );
            navigate(`/analysis/${res.batchId}`);
        } catch {
            setErrorMessage('분석 시작에 실패했습니다. 잠시 후 다시 시도해주세요.');
            setIsSubmitting(false);
        }
    }, [repoUrls, isSubmitting, smsOptIn, phoneInvalid, mode, normalizedPhone, navigate]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[3000] flex items-end justify-center px-0 sm:items-center sm:px-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="analysis-start-title"
                className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl sm:max-w-[440px] sm:rounded-2xl"
                style={{
                    background: 'linear-gradient(160deg, rgba(28,28,32,0.97) 0%, rgba(15,16,18,0.99) 100%)',
                    backdropFilter: 'blur(40px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 pb-6 pt-5">
                    <h2 id="analysis-start-title" className="text-base font-semibold text-white">
                        프로젝트 분석 시작
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        선택한 저장소 {repoUrls.length}개를 분석합니다.
                    </p>

                    {/* 분석 대상 목록 */}
                    <ul className="mt-4 flex list-none flex-col gap-1.5 p-0">
                        {repoUrls.map((url) => (
                            <li
                                key={url}
                                className="truncate rounded-lg border border-white/[0.08] bg-[#101114]/70 px-3 py-2 text-sm text-zinc-200"
                                title={shortenRepoUrl(url)}
                            >
                                {shortenRepoUrl(url)}
                            </li>
                        ))}
                    </ul>

                    {/* 모드 선택 */}
                    <fieldset className="mt-5">
                        <legend className="text-sm font-medium text-zinc-300">분석 모드</legend>
                        <div className="mt-2 flex flex-col gap-2">
                            {MODE_OPTIONS.map((option) => {
                                const isActive = option.value === mode;
                                return (
                                    <label
                                        key={option.value}
                                        className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${
                                            isActive
                                                ? 'border-white/25 bg-white/[0.08]'
                                                : 'border-white/[0.08] bg-[#101114]/70 hover:border-white/14'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="analysis-mode"
                                            value={option.value}
                                            checked={isActive}
                                            onChange={() => setMode(option.value)}
                                            className="mt-0.5 h-4 w-4 shrink-0 accent-white"
                                        />
                                        <span className="min-w-0">
                                            <span className="block text-sm font-medium text-white">{option.label}</span>
                                            <span className="mt-0.5 block text-xs text-zinc-500">{option.description}</span>
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </fieldset>

                    {/* SMS 수신 */}
                    <div className="mt-5">
                        <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-300">
                            <input
                                type="checkbox"
                                checked={smsOptIn}
                                onChange={(e) => {
                                    setSmsOptIn(e.target.checked);
                                    setErrorMessage(null);
                                }}
                                className="h-4 w-4 accent-white"
                            />
                            <span>분석 완료 시 SMS로 알림 받기</span>
                        </label>
                        {smsOptIn && (
                            <div className="mt-2">
                                <label htmlFor="analysis-phone" className="sr-only">
                                    휴대폰 번호
                                </label>
                                <input
                                    id="analysis-phone"
                                    type="tel"
                                    inputMode="tel"
                                    autoComplete="tel"
                                    placeholder="010-1234-5678"
                                    value={phone}
                                    onChange={(e) => {
                                        setPhone(e.target.value);
                                        setErrorMessage(null);
                                    }}
                                    aria-invalid={phoneInvalid}
                                    className={`w-full rounded-xl border bg-[#101114]/70 px-4 py-2.5 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-white/30 ${
                                        phoneInvalid ? 'border-red-400/40' : 'border-white/[0.10]'
                                    }`}
                                />
                                <p className="mt-1 text-xs text-zinc-600">
                                    번호는 저장되지 않으며 이번 알림에만 사용됩니다.
                                    {normalizedPhone && !phoneInvalid ? ` (${normalizedPhone})` : ''}
                                </p>
                            </div>
                        )}
                    </div>

                    {errorMessage && <p className="mt-4 text-sm text-red-400">{errorMessage}</p>}

                    <div className="mt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 rounded-xl border border-white/[0.08] py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting || repoUrls.length === 0}
                            className="flex-1 rounded-xl border border-emerald-400/30 bg-emerald-400/15 py-2.5 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {isSubmitting ? '시작 중…' : '분석 시작'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
