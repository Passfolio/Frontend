import { MAX_EDUCATION } from '@/constants/ui';
import type { EduDraftType } from './updateProfileTypes';
import { UpdateProfileEducationDraftCard } from './UpdateProfileEducationDraftCard';

type Props = {
  drafts: EduDraftType[];
  filledDepartmentIds: number[];
  updateDraft: (key: string, patch: Partial<EduDraftType>) => void;
  removeDraft: (key: string) => void;
  addDraft: () => void;
  runUnivSearch: (draftKey: string, q: string) => void;
  runDeptSearch: (draftKey: string, univId: string, q: string) => void;
};

export const UpdateProfileEducationSection = ({
  drafts,
  filledDepartmentIds,
  updateDraft,
  removeDraft,
  addDraft,
  runUnivSearch,
  runDeptSearch,
}: Props) => (
  <section className="mb-6">
    <div className="mb-2 flex items-center justify-between gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">학력</span>
      <span className="text-[0.72rem] text-zinc-600">
        {filledDepartmentIds.length}/{MAX_EDUCATION} · 학과 선택 완료 시에만 저장됩니다
      </span>
    </div>

    <div className="flex flex-col gap-4">
      {drafts.map((d) => (
        <div
          key={d.key}
          className="rounded-xl border border-white/[0.09] bg-white/[0.03] p-3"
        >
          <UpdateProfileEducationDraftCard
            d={d}
            updateDraft={updateDraft}
            removeDraft={removeDraft}
            runUnivSearch={runUnivSearch}
            runDeptSearch={runDeptSearch}
          />
        </div>
      ))}
    </div>

    <button
      type="button"
      disabled={drafts.length >= MAX_EDUCATION}
      onClick={addDraft}
      className="mt-3 w-full rounded-xl border border-dashed border-white/15 py-2 text-xs font-medium text-zinc-400 transition hover:border-white/25 hover:text-zinc-200 disabled:opacity-40"
    >
      + 학력 추가
    </button>
  </section>
);
