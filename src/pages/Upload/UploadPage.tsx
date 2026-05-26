import { useCallback, useEffect, useRef, useState } from 'react';
import { uploadFileToS3 } from '@/utils/Article/uploadToS3';
import type { UploadFileResponseType } from '@/types/file.type';
import {
  postPortfolioFromPdf,
  postCoverLetterFromPdf,
  postCoverLetterFromPortfolio,
  postCoverLetterToPortfolio,
  getAiJobStatus,
  type AiJobStatus,
} from '@/api/AiJob/aiJobApi';
import { getMyCareer } from '@/api/Spec/specApi';
import { useAuth } from '@/context/Auth/AuthContext';
import '@/pages/Lander/landerPage.css';

function experienceToCareer(experience: number): string {
  if (experience === 0) return '신입';
  if (experience < 1) return '1년 미만';
  if (experience < 3) return '1~3년';
  if (experience < 5) return '3~5년';
  return '5년 이상';
}

type DocumentType = 'COVER_LETTER' | 'PORTFOLIO';

type SlotMeta = {
  label: string;
  description: string;
  icon: string;
  documentType: DocumentType;
  editLabel: string;
  generateLabel: string;
};

const SLOTS: SlotMeta[] = [
  {
    label: '자기소개서',
    description: '자기소개서를 업로드하여 수정하거나, 이를 기반으로 포트폴리오를 생성하세요.',
    icon: 'fa-solid fa-file-lines',
    documentType: 'COVER_LETTER',
    editLabel: '자기소개서 수정하기',
    generateLabel: '포트폴리오 생성하기',
  },
  {
    label: '포트폴리오',
    description: '포트폴리오를 업로드하여 수정하거나, 이를 기반으로 자기소개서를 생성하세요.',
    icon: 'fa-solid fa-briefcase',
    documentType: 'PORTFOLIO',
    editLabel: '포트폴리오 수정하기',
    generateLabel: '자기소개서 생성하기',
  },
];

const POLL_INTERVAL_MS = 4000;

type UploadStatus = 'idle' | 'uploading' | 'done' | 'error';

type JobState = {
  jobId: number;
  status: AiJobStatus;
  outputUrl: string | null;
  errorMessage: string | null;
};

type SlotState = {
  file: File | null;
  isDragging: boolean;
  progress: number;
  uploadStatus: UploadStatus;
  uploadResult: UploadFileResponseType | null;
  selectedAction: 'EDIT' | 'GENERATE' | null;
  jobPosition: string;
  career: string;
  isSubmitting: boolean;
  job: JobState | null;
};

const makeIdle = (): SlotState => ({
  file: null,
  isDragging: false,
  progress: 0,
  uploadStatus: 'idle',
  uploadResult: null,
  selectedAction: null,
  jobPosition: '',
  career: '',
  isSubmitting: false,
  job: null,
});

export const UploadPage = () => {
  const { user } = useAuth();
  const isLoggedIn = user !== null;
  const [slots, setSlots] = useState<SlotState[]>(SLOTS.map(makeIdle));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const abortRefs = useRef<(AbortController | null)[]>([null, null]);
  const pollTimers = useRef<(ReturnType<typeof setTimeout> | null)[]>([null, null]);

  useEffect(() => {
    return () => {
      abortRefs.current.forEach((c) => c?.abort());
      pollTimers.current.forEach((t) => { if (t) clearTimeout(t); });
    };
  }, []);

  useEffect(() => {
    getMyCareer()
      .then((career) => {
        const jobPosition = career.careerKeywords[0] ?? '';
        const careerLabel = experienceToCareer(career.experience);
        setSlots((prev) => prev.map((s) => ({ ...s, jobPosition, career: careerLabel })));
      })
      .catch(() => {});
  }, []);

  const patch = useCallback((index: number, next: Partial<SlotState>) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, ...next } : s)));
  }, []);

  const pollJobStatus = useCallback((index: number, jobId: number) => {
    const timer = setTimeout(async () => {
      try {
        const res = await getAiJobStatus(jobId);
        patch(index, {
          job: { jobId: res.jobId, status: res.status, outputUrl: res.outputPdfS3Url, errorMessage: res.errorMessage },
        });
        if (res.status === 'PENDING') pollJobStatus(index, jobId);
      } catch {
        pollJobStatus(index, jobId);
      }
    }, POLL_INTERVAL_MS);
    pollTimers.current[index] = timer;
  }, [patch]);

  const handleUploadAndSubmit = useCallback(async (index: number) => {
    const slot = slots[index];
    if (!slot.file || !slot.selectedAction) return;

    const controller = new AbortController();
    abortRefs.current[index] = controller;
    patch(index, { uploadStatus: 'uploading', progress: 0 });

    try {
      const result = await uploadFileToS3(slot.file, {
        signal: controller.signal,
        onProgress: (percent) => patch(index, { progress: percent }),
      });
      patch(index, { uploadStatus: 'done', progress: 100, uploadResult: result, isSubmitting: true });

      const fileId = result.fileId;
      const meta = SLOTS[index];
      let res;
      if (slot.selectedAction === 'EDIT') {
        res = meta.documentType === 'PORTFOLIO'
          ? await postPortfolioFromPdf(fileId)
          : await postCoverLetterFromPdf(fileId);
      } else {
        res = meta.documentType === 'PORTFOLIO'
          ? await postCoverLetterFromPortfolio(fileId, slot.jobPosition, slot.career)
          : await postCoverLetterToPortfolio(fileId, slot.jobPosition, slot.career);
      }
      patch(index, {
        isSubmitting: false,
        job: { jobId: res.jobId, status: 'PENDING', outputUrl: null, errorMessage: null },
      });
      pollJobStatus(index, res.jobId);
    } catch (err) {
      const isAbort = (err as { name?: string })?.name === 'AbortError';
      patch(index, { uploadStatus: isAbort ? 'idle' : 'error', progress: 0, isSubmitting: false });
    }
  }, [slots, patch, pollJobStatus]);

  const handleUploadAll = useCallback(() => {
    slots.forEach((slot, index) => {
      if (slot.file && slot.selectedAction && slot.uploadStatus === 'idle') {
        void handleUploadAndSubmit(index);
      }
    });
  }, [slots, handleUploadAndSubmit]);

  const handleFileSelect = useCallback((index: number, file: File | undefined) => {
    if (!file || file.type !== 'application/pdf') return;
    patch(index, { file, progress: 0, uploadStatus: 'idle', uploadResult: null, job: null, selectedAction: null });
  }, [patch]);

  const handleInputChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(index, e.target.files?.[0]);
    e.target.value = '';
  }, [handleFileSelect]);

  const handleDrop = useCallback((index: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    patch(index, { isDragging: false });
    handleFileSelect(index, e.dataTransfer.files[0]);
  }, [handleFileSelect, patch]);

  const handleDragOver = useCallback((index: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    patch(index, { isDragging: true });
  }, [patch]);

  const handleDragLeave = useCallback((index: number) => patch(index, { isDragging: false }), [patch]);

  const handleRemove = useCallback((index: number) => {
    abortRefs.current[index]?.abort();
    abortRefs.current[index] = null;
    if (pollTimers.current[index]) clearTimeout(pollTimers.current[index]!);
    patch(index, makeIdle());
  }, [patch]);

  const showUploadButton = slots.some((s) => s.file && s.uploadStatus === 'idle');
  const anyUploading = slots.some((s) => s.uploadStatus === 'uploading');
  const canProceed = slots.some((s) => {
    if (!s.file || !s.selectedAction || s.uploadStatus !== 'idle') return false;
    if (s.selectedAction === 'GENERATE') return s.jobPosition.trim() !== '' && s.career !== '';
    return true;
  });

  return (
    <div className="lander-page" style={{ minHeight: '100vh' }}>
      <div className="hero-glow" aria-hidden />

      <div className="landing-shell relative z-1 flex flex-col items-center py-32">
        <div className="mb-3 rounded-full border border-white/10 bg-white/4 px-4 py-1.5 text-xs font-medium tracking-widest text-zinc-400 uppercase">
          Free Trial
        </div>

        <h1
          className="mb-4 text-center font-bold text-white"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.04em', lineHeight: 1.1 }}
        >
          문서를 업로드하고
          <br />
          <span className="text-gradient">포트폴리오를 완성하세요</span>
        </h1>

        <p className="mb-16 max-w-xl text-center text-base" style={{ color: 'var(--text-secondary)' }}>
          자기소개서와 포트폴리오 PDF를 각각 업로드하고 원하는 작업을 선택하세요.
        </p>

        <div className="grid w-full max-w-3xl gap-6 sm:grid-cols-2">
          {SLOTS.map((meta, index) => {
            const slot = slots[index];
            const isUploading = slot.uploadStatus === 'uploading';
            const isDone = slot.uploadStatus === 'done';
            const isError = slot.uploadStatus === 'error';
            const isInteractable = !isUploading && !isDone;
            const showGenerateExtra = !isUploading && !isDone && !isError && slot.file !== null && slot.selectedAction === 'GENERATE';

            return (
              <div key={meta.documentType} className="flex h-full flex-col gap-3">
                {/* 드롭존 */}
                <div
                  role={isInteractable && !slot.file ? 'button' : undefined}
                  tabIndex={isInteractable && !slot.file ? 0 : -1}
                  aria-label={`${meta.label} PDF 업로드`}
                  onClick={() => { if (isInteractable && !slot.file) inputRefs.current[index]?.click(); }}
                  onKeyDown={(e) => {
                    if (isInteractable && !slot.file && (e.key === 'Enter' || e.key === ' '))
                      inputRefs.current[index]?.click();
                  }}
                  onDrop={(e) => { if (isInteractable) handleDrop(index, e); }}
                  onDragOver={(e) => { if (isInteractable) handleDragOver(index, e); }}
                  onDragLeave={() => { if (isInteractable) handleDragLeave(index); }}
                  className={`relative flex flex-1 flex-col rounded-2xl border p-6 transition-all duration-300 ${!slot.file || isUploading || isDone || isError ? 'items-center justify-center gap-4 text-center' : 'gap-4'}`}
                  style={{
                    background: isDone ? 'rgba(16,185,129,0.04)' : isError ? 'rgba(239,68,68,0.04)' : slot.file ? 'rgba(255,255,255,0.04)' : slot.isDragging ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)',
                    borderColor: isDone ? 'rgba(16,185,129,0.3)' : isError ? 'rgba(239,68,68,0.3)' : slot.file ? 'rgba(255,255,255,0.2)' : slot.isDragging ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)',
                    cursor: isInteractable && !slot.file ? 'pointer' : 'default',
                  }}
                >
                  <input ref={(el) => { inputRefs.current[index] = el; }} type="file" accept="application/pdf" className="hidden" aria-hidden tabIndex={-1} onChange={(e) => handleInputChange(index, e)} />

                  {/* 업로드 중 */}
                  {isUploading && (
                    <>
                      <div className="flex size-14 items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <i className="fa-solid fa-spinner animate-spin text-xl text-white/60" aria-hidden />
                      </div>
                      <div className="flex w-full flex-col gap-2">
                        <p className="text-sm font-medium text-white">업로드 중...</p>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-white/60 transition-all duration-200" style={{ width: `${slot.progress}%` }} />
                        </div>
                        <p className="text-xs tabular-nums" style={{ color: 'var(--text-tertiary)' }}>{slot.progress}%</p>
                      </div>
                    </>
                  )}

                  {/* 업로드 완료 */}
                  {isDone && (
                    <>
                      <div className="flex size-14 items-center justify-center rounded-full" style={{ background: 'rgba(16,185,129,0.1)' }}>
                        {slot.isSubmitting
                          ? <i className="fa-solid fa-spinner animate-spin text-xl text-emerald-400" aria-hidden />
                          : <i className="fa-solid fa-check text-xl text-emerald-400" aria-hidden />
                        }
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold text-emerald-400">
                          {slot.isSubmitting ? 'AI 분석 요청 중...' : '업로드 완료'}
                        </p>
                        <p className="max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap text-xs" style={{ color: 'var(--text-secondary)' }} title={slot.file?.name}>{slot.file?.name}</p>
                      </div>
                    </>
                  )}

                  {/* 업로드 실패 */}
                  {isError && (
                    <>
                      <div className="flex size-14 items-center justify-center rounded-full" style={{ background: 'rgba(239,68,68,0.1)' }}>
                        <i className="fa-solid fa-triangle-exclamation text-xl text-red-400" aria-hidden />
                      </div>
                      <p className="text-sm font-medium text-red-400">업로드 실패</p>
                    </>
                  )}

                  {/* 빈 드롭존 */}
                  {!isUploading && !isDone && !isError && !slot.file && (
                    <>
                      <div className="flex size-14 items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <i className={`${meta.icon} text-xl`} style={{ color: 'var(--text-secondary)' }} aria-hidden />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <p className="text-base font-semibold text-white">{meta.label}</p>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{meta.description}</p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>PDF 파일만 지원 · 드래그 앤 드롭 가능</p>
                      </div>
                    </>
                  )}

                  {/* 파일 등록됨 — 작업 선택 포함 */}
                  {!isUploading && !isDone && !isError && slot.file && (
                    <>
                      {/* 파일 정보 + 다시 선택 */}
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <i className="fa-solid fa-file-pdf text-base text-white/70" aria-hidden />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <p className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-white" title={slot.file.name}>{slot.file.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{(slot.file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleRemove(index); inputRefs.current[index]?.click(); }}
                          className="shrink-0 rounded-lg border border-white/8 px-2.5 py-1.5 text-xs transition-colors hover:border-white/20 hover:bg-white/6"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          다시 선택
                        </button>
                      </div>

                      {/* 작업 선택 */}
                      <div className="flex flex-col gap-2 border-t border-white/8 pt-4">
                        <p className="mb-1 text-xs font-semibold text-white">작업 선택</p>
                        {(['EDIT', 'GENERATE'] as const).map((action) => {
                          const label = action === 'EDIT' ? meta.editLabel : meta.generateLabel;
                          const isChecked = slot.selectedAction === action;
                          return (
                            <label key={action} className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-all" style={{
                              borderColor: isChecked ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                              background: isChecked ? 'rgba(255,255,255,0.06)' : 'transparent',
                            }}>
                              <input
                                type="radio"
                                name={`action-${index}`}
                                checked={isChecked}
                                onChange={() => patch(index, { selectedAction: action })}
                                className="accent-white"
                              />
                              <span className="text-sm" style={{ color: isChecked ? '#ffffff' : 'var(--text-secondary)' }}>{label}</span>
                            </label>
                          );
                        })}
                      </div>

                      {/* GENERATE 선택 시 직무 / 경력 입력 */}
                      {showGenerateExtra && (
                        <div className="flex flex-col gap-3 border-t border-white/8 pt-3">
                          {isLoggedIn ? (
                            <p className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                              <i className="fa-brands fa-github" aria-hidden />
                              GitHub 프로필에서 자동 입력됩니다. 수정 가능합니다.
                            </p>
                          ) : (
                            <p className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                              <i className="fa-solid fa-circle-info" aria-hidden />
                              직무와 경력을 직접 입력해주세요.
                              <a href="/login" className="ml-auto shrink-0 underline underline-offset-2 hover:text-white">로그인하면 자동 입력</a>
                            </p>
                          )}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>지원 직무</label>
                            <input
                              type="text"
                              placeholder="예: 백엔드 개발자"
                              value={slot.jobPosition}
                              onChange={(e) => patch(index, { jobPosition: e.target.value })}
                              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white/20"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>경력</label>
                            <select
                              value={slot.career}
                              onChange={(e) => patch(index, { career: e.target.value })}
                              className="rounded-lg border border-white/10 bg-[#16171a] px-3 py-2 text-sm text-white outline-none focus:border-white/20"
                            >
                              <option value="">선택해주세요</option>
                              <option value="신입">신입</option>
                              <option value="1년 미만">1년 미만</option>
                              <option value="1~3년">1~3년</option>
                              <option value="3~5년">3~5년</option>
                              <option value="5년 이상">5년 이상</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* 재시도 */}
                {isError && (
                  <button type="button" onClick={() => void handleUploadAndSubmit(index)} className="rounded-xl border border-red-500/20 bg-red-500/5 py-2.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/10">
                    <i className="fa-solid fa-rotate-right mr-1.5" aria-hidden />재시도
                  </button>
                )}

                {/* AI 잡 상태 */}
                {slot.job && (
                  <div className="rounded-xl border p-4" style={{
                    borderColor: slot.job.status === 'DONE' ? 'rgba(16,185,129,0.3)' : slot.job.status === 'ERROR' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)',
                    background: slot.job.status === 'DONE' ? 'rgba(16,185,129,0.05)' : slot.job.status === 'ERROR' ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.02)',
                  }}>
                    {slot.job.status === 'PENDING' && (
                      <div className="flex items-center gap-3">
                        <i className="fa-solid fa-spinner animate-spin text-white/60" aria-hidden />
                        <p className="text-sm text-white/70">AI가 분석 중입니다...</p>
                      </div>
                    )}
                    {slot.job.status === 'DONE' && (
                      <div className="flex flex-col gap-2">
                        <p className="text-sm font-semibold text-emerald-400"><i className="fa-solid fa-circle-check mr-2" aria-hidden />완료</p>
                        {slot.job.outputUrl && (
                          <a href={slot.job.outputUrl} target="_blank" rel="noopener noreferrer" className="btn btn-glass py-2.5 text-sm">
                            <i className="fa-solid fa-download" aria-hidden />결과 PDF 다운로드
                          </a>
                        )}
                      </div>
                    )}
                    {slot.job.status === 'ERROR' && (
                      <p className="text-sm text-red-400">
                        <i className="fa-solid fa-triangle-exclamation mr-2" aria-hidden />
                        {slot.job.errorMessage ?? '처리 중 오류가 발생했습니다.'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 통합 업로드 및 실행 버튼 */}
        {showUploadButton && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleUploadAll}
              disabled={!canProceed || anyUploading}
              className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              {anyUploading
                ? <><i className="fa-solid fa-spinner animate-spin" aria-hidden />업로드 중...</>
                : <><i className="fa-solid fa-wand-magic-sparkles" aria-hidden />업로드 및 실행</>
              }
            </button>
            {!canProceed && !anyUploading && (
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>작업을 선택하고 필요한 정보를 입력해주세요.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
