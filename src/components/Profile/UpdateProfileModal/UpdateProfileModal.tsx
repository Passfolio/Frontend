import { useId } from 'react';
import type { UpdateProfileModalProps } from './updateProfileTypes';
import { useUpdateProfileForm } from './useUpdateProfileForm';
import { useEducationDraftSearch } from './useEducationDraftSearch';
import { UpdateProfileEducationSection } from './UpdateProfileEducationSection';
import { UpdateProfileCareerSection } from './UpdateProfileCareerSection';

export const UpdateProfileModal = ({ open, onClose, userId, onProfileUpdated }: UpdateProfileModalProps) => {
  const titleId = useId();
  const form = useUpdateProfileForm({ open, userId, onProfileUpdated, onClose });
  const { runUnivSearch, runDeptSearch } = useEducationDraftSearch({ updateDraft: form.updateDraft });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="닫기"
        onClick={onClose}
      />
      <div
        className="relative z-[201] flex max-h-[min(92dvh,880px)] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-white/[0.12] shadow-[0_16px_64px_-8px_rgba(0,0,0,0.55)]"
        style={{ background: 'linear-gradient(165deg, rgba(28,28,32,0.98) 0%, rgba(12,12,14,0.99) 100%)' }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold tracking-tight text-white">
            프로필 업데이트
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-300"
          >
            닫기
          </button>
        </header>

        <div className="pf-scroll-y min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-4">
          {form.loading && <p className="text-sm text-zinc-500">불러오는 중…</p>}
          {form.loadError && (
            <p className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/90">
              {form.loadError}
            </p>
          )}

          {!form.loading && (
            <>
              <section className="mb-6">
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                  경력 연차
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={form.experience}
                  onChange={(e) => form.setExperience(Math.min(50, Math.max(0, Number(e.target.value) || 0)))}
                  className="w-full rounded-xl border border-white/[0.12] bg-white/[0.05] px-3 py-2.5 text-sm text-white outline-none ring-0 transition focus:border-white/25"
                />
                <p className="mt-1 text-[0.72rem] text-zinc-600">0–50 정수</p>
              </section>

              <UpdateProfileEducationSection
                drafts={form.drafts}
                filledDepartmentIds={form.filledDepartmentIds}
                updateDraft={form.updateDraft}
                removeDraft={form.removeDraft}
                addDraft={form.addDraft}
                runUnivSearch={runUnivSearch}
                runDeptSearch={runDeptSearch}
              />

              <UpdateProfileCareerSection
                careerIds={form.careerIds}
                careerIdSet={form.careerIdSet}
                careerAtLimit={form.careerAtLimit}
                careerSearch={form.careerSearch}
                setCareerSearch={form.setCareerSearch}
                filteredCareerEntries={form.filteredCareerEntries}
                toggleCareer={form.toggleCareer}
              />

              {form.saveError && (
                <p className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-100/90">
                  {form.saveError}
                </p>
              )}
            </>
          )}
        </div>

        <footer className="flex shrink-0 gap-2 border-t border-white/[0.08] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/[0.14] py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.05]"
          >
            취소
          </button>
          <button
            type="button"
            disabled={form.loading || form.saving}
            onClick={form.handleSave}
            className="flex-1 rounded-xl border border-white/[0.2] py-2.5 text-sm font-semibold text-white transition enabled:hover:border-white/35 enabled:hover:bg-white/[0.08] disabled:opacity-50"
            style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 100%)' }}
          >
            {form.saving ? '저장 중…' : '저장'}
          </button>
        </footer>
      </div>
    </div>
  );
};
