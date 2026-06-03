import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postStartAnalysis } from '@/api/ProjectAnalysis/projectAnalysisApi';
import { uploadFileToS3 } from '@/utils/Article/uploadToS3';
import type { AnalysisModeType } from '@/types/userProjectAnalysis.type';
import type { DocumentTypeValue, ActionTypeValue } from '@/types/file.type';

type AnalysisStartModalProps = {
    isOpen: boolean;
    repoUrls: string[]; // 분석 대상(AVAILABLE, ≤3)
    onClose: () => void;
};

const MODE_OPTIONS: { value: AnalysisModeType; label: string; description: string }[] = [
    { value: 'NONSTOP', label: '논스톱', description: '분석 후 포트폴리오까지 자동 생성합니다.' },
    { value: 'STEP', label: '단계별', description: '분석만 수행하고 결과를 확인합니다.' },
];

// NONSTOP 포트폴리오 목적 — 결과물이 포트폴리오인 2가지(자소서·포폴 동시 업로드 불가).
type PortfolioPurpose = 'EDIT' | 'GENERATE';
const PURPOSE_OPTIONS: {
    value: PortfolioPurpose;
    label: string;
    description: string;
    documentType: DocumentTypeValue;
    actionType: ActionTypeValue;
    fileLabel: string;
}[] = [
    {
        value: 'EDIT',
        label: '기존 포트폴리오 개선',
        description: '업로드한 포트폴리오 PDF를 분석 결과로 보강·개선합니다.',
        documentType: 'PORTFOLIO',
        actionType: 'EDIT',
        fileLabel: '포트폴리오 PDF',
    },
    {
        value: 'GENERATE',
        label: '자기소개서로 포트폴리오 생성',
        description: '업로드한 자기소개서 PDF와 분석 결과로 포트폴리오를 생성합니다.',
        documentType: 'COVER_LETTER',
        actionType: 'GENERATE',
        fileLabel: '자기소개서 PDF',
    },
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
    return digits.startsWith('0') ? `+82${digits.slice(1)}` : `+${digits}`;
};

const isValidE164 = (e164: string): boolean => /^\+[1-9]\d{7,14}$/.test(e164);

export const AnalysisStartModal = ({ isOpen, repoUrls, onClose }: AnalysisStartModalProps) => {
    const navigate = useNavigate();
    const [mode, setMode] = useState<AnalysisModeType>('NONSTOP');
    const [purpose, setPurpose] = useState<PortfolioPurpose>('EDIT');
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [smsOptIn, setSmsOptIn] = useState<boolean>(false);
    const [phone, setPhone] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const purposeMeta = useMemo(() => PURPOSE_OPTIONS.find((p) => p.value === purpose)!, [purpose]);
    const normalizedPhone = useMemo(() => normalizePhone(phone), [phone]);
    const phoneInvalid = smsOptIn && (normalizedPhone === null || !isValidE164(normalizedPhone));

    const busy = isSubmitting || isUploading;

    const handleSubmit = useCallback(async () => {
        if (repoUrls.length === 0 || busy) return;
        if (smsOptIn && phoneInvalid) {
            setErrorMessage('휴대폰 번호 형식을 확인해주세요. (예: 010-1234-5678)');
            return;
        }
        // NONSTOP은 포트폴리오용 PDF 업로드 필수.
        if (mode === 'NONSTOP' && !file) {
            setErrorMessage(`${purposeMeta.fileLabel}를 업로드해주세요.`);
            return;
        }
        setErrorMessage(null);

        let fileId: number | undefined;
        let portfolioPurpose: string | undefined;
        try {
            if (mode === 'NONSTOP' && file) {
                setIsUploading(true);
                setUploadProgress(0);
                abortRef.current = new AbortController();
                const result = await uploadFileToS3(file, {
                    signal: abortRef.current.signal,
                    onProgress: setUploadProgress,
                    documentType: purposeMeta.documentType,
                    actionType: purposeMeta.actionType,
                });
                // 원시 CDN URL이 아니라 fileId를 전달 — 소유권 검증·URL 생성은 서버(IDOR/SSRF 차단).
                fileId = result.fileId;
                portfolioPurpose = purpose;
                setIsUploading(false);
            }
        } catch {
            setIsUploading(false);
            setErrorMessage('파일 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await postStartAnalysis(
                repoUrls,
                mode,
                smsOptIn && normalizedPhone ? normalizedPhone : undefined,
                fileId,
                portfolioPurpose,
            );
            navigate(`/analysis/${res.batchId}`);
        } catch {
            setErrorMessage('분석 시작에 실패했습니다. 잠시 후 다시 시도해주세요.');
            setIsSubmitting(false);
        }
    }, [repoUrls, busy, smsOptIn, phoneInvalid, mode, file, purpose, purposeMeta, normalizedPhone, navigate]);

    const handleClose = useCallback(() => {
        abortRef.current?.abort();
        onClose();
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[3000] flex items-end justify-center px-0 sm:items-center sm:px-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
            onClick={handleClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="analysis-start-title"
                className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl sm:max-w-[460px] sm:rounded-2xl"
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
                    <p className="mt-1 text-sm text-zinc-500">선택한 저장소 {repoUrls.length}개를 분석합니다.</p>

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
                                            isActive ? 'border-white/25 bg-white/[0.08]' : 'border-white/[0.08] bg-[#101114]/70 hover:border-white/14'
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

                    {/* NONSTOP: 포트폴리오 목적 + 파일 업로드 (자소서·포폴 동시 불가) */}
                    {mode === 'NONSTOP' && (
                        <div className="mt-5 rounded-xl border border-white/[0.08] bg-[#101114]/50 p-4">
                            <p className="text-sm font-medium text-zinc-300">포트폴리오 생성 방식</p>
                            <div className="mt-2 flex flex-col gap-2">
                                {PURPOSE_OPTIONS.map((option) => {
                                    const isActive = option.value === purpose;
                                    return (
                                        <label
                                            key={option.value}
                                            className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                                                isActive ? 'border-emerald-400/30 bg-emerald-400/[0.08]' : 'border-white/[0.08] hover:border-white/14'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="portfolio-purpose"
                                                value={option.value}
                                                checked={isActive}
                                                onChange={() => {
                                                    setPurpose(option.value);
                                                    setFile(null); // 목적 바뀌면 파일 종류가 달라지므로 리셋
                                                    setErrorMessage(null);
                                                }}
                                                className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-400"
                                            />
                                            <span className="min-w-0">
                                                <span className="block text-sm font-medium text-white">{option.label}</span>
                                                <span className="mt-0.5 block text-xs text-zinc-500">{option.description}</span>
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>

                            {/* 파일 업로드 (목적에 맞는 1개) */}
                            <div className="mt-3">
                                <label className="block text-xs font-medium text-zinc-400">
                                    {purposeMeta.fileLabel} 업로드 <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => {
                                        setFile(e.target.files?.[0] ?? null);
                                        setErrorMessage(null);
                                    }}
                                    className="mt-1.5 block w-full text-xs text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-white/[0.10] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-white/[0.16]"
                                />
                                {file && <p className="mt-1.5 truncate text-xs text-zinc-500">{file.name}</p>}
                                {isUploading && (
                                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                                        <div
                                            className="h-full rounded-full bg-emerald-400/70 transition-[width] duration-200"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                )}
                                <p className="mt-1.5 text-xs text-zinc-600">PDF만 업로드 가능합니다. (자소서와 포트폴리오를 동시에 올릴 수 없습니다.)</p>
                            </div>
                        </div>
                    )}

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
                                <label htmlFor="analysis-phone" className="sr-only">휴대폰 번호</label>
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
                            onClick={handleClose}
                            disabled={busy}
                            className="flex-1 rounded-xl border border-white/[0.08] py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={busy || repoUrls.length === 0}
                            className="flex-1 rounded-xl border border-emerald-400/30 bg-emerald-400/15 py-2.5 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {isUploading ? '업로드 중…' : isSubmitting ? '시작 중…' : '분석 시작'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
