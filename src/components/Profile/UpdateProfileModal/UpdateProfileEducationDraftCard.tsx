import type { EduDraftType } from './updateProfileTypes';
import { freshDraft, previewFromSelection } from './updateProfileHelpers';

type Props = {
  d: EduDraftType;
  updateDraft: (key: string, patch: Partial<EduDraftType>) => void;
  removeDraft: (key: string) => void;
  runUnivSearch: (draftKey: string, q: string) => void;
  runDeptSearch: (draftKey: string, univId: string, q: string) => void;
};

export const UpdateProfileEducationDraftCard = ({
  d,
  updateDraft,
  removeDraft,
  runUnivSearch,
  runDeptSearch,
}: Props) => {
  if (d.preview && d.selectedDepartmentId && d.selectedDepartmentId > 0) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-white">{d.preview.name}</p>
            <p className="text-xs text-zinc-400">
              {d.preview.department} · {d.preview.degree} · {d.preview.duration}
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              className="rounded-md px-2 py-1 text-[0.72rem] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
              onClick={() => updateDraft(d.key, { ...freshDraft(), key: d.key })}
            >
              수정
            </button>
            <button
              type="button"
              className="rounded-md px-2 py-1 text-[0.72rem] text-red-400/90 hover:bg-red-500/10"
              onClick={() => removeDraft(d.key)}
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (d.preview && d.selectedDepartmentId === -1) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-zinc-300">
          {d.preview.name} · {d.preview.department}
        </p>
        <p className="text-[0.72rem] text-amber-200/80">
          아래에서 대학·학과를 다시 검색해 선택해 주세요. 이 항목은 ID가 없어 저장 시 제외됩니다.
        </p>
        <button
          type="button"
          className="w-fit rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/90 hover:bg-white/[0.06]"
          onClick={() => updateDraft(d.key, { ...freshDraft(), key: d.key })}
        >
          다시 검색하기
        </button>
      </div>
    );
  }

  return (
    <>
      <p className="mb-2 text-[0.72rem] text-zinc-500">1) 대학교 검색 후 선택</p>
      <div className="relative mb-3">
        <input
          value={d.univQuery}
          onChange={(e) => {
            const v = e.target.value;
            updateDraft(d.key, { univQuery: v, univError: null });
            runUnivSearch(d.key, v);
          }}
          onFocus={() => updateDraft(d.key, { univOpen: d.univResults.length > 0 })}
          placeholder="예: 명지대"
          className="w-full rounded-lg border border-white/[0.12] bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white/20"
        />
        {d.univError && <p className="mt-1 text-[0.72rem] text-red-400/90">{d.univError}</p>}
        {d.univOpen && d.univResults.length > 0 && (
          <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-white/10 bg-[#141416] py-1 shadow-xl">
            {d.univResults.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-white/[0.06]"
                  onClick={() =>
                    updateDraft(d.key, {
                      univ: u,
                      univQuery: u.name,
                      univOpen: false,
                      univResults: [],
                      deptQuery: '',
                      deptItems: null,
                      deptOpen: false,
                      deptError: null,
                      selectedDepartmentId: null,
                      preview: null,
                    })
                  }
                >
                  <span className="text-white">{u.name}</span>
                  <span className="text-[0.72rem] text-zinc-500">
                    {u.type} · {u.region}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {d.univ && (
        <>
          <p className="mb-2 text-[0.72rem] text-zinc-500">2) 학과 검색 후 세부 행 선택</p>
          <div className="relative">
            <input
              value={d.deptQuery}
              onChange={(e) => {
                const v = e.target.value;
                updateDraft(d.key, { deptQuery: v, deptError: null });
                runDeptSearch(d.key, d.univ!.id, v);
              }}
              onFocus={() => updateDraft(d.key, { deptOpen: (d.deptItems?.length ?? 0) > 0 })}
              placeholder="예: 컴퓨터공학"
              className="w-full rounded-lg border border-white/[0.12] bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white/20"
            />
            {d.deptError && (
              <p className="mt-1 text-[0.72rem] text-red-400/90">{d.deptError}</p>
            )}
            {d.deptOpen && d.deptItems && d.deptItems.length > 0 && (
              <ul className="absolute z-10 mt-1 max-h-52 w-full overflow-auto rounded-lg border border-white/10 bg-[#141416] py-1 shadow-xl">
                <li className="px-3 py-1.5 text-[0.65rem] uppercase tracking-wide text-zinc-500">
                  매칭 학과: {d.deptMatched}
                </li>
                {d.deptItems.map((row) => (
                  <li key={row.id}>
                    <button
                      type="button"
                      className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-white/[0.06]"
                      onClick={() =>
                        updateDraft(d.key, {
                          selectedDepartmentId: row.id,
                          preview: previewFromSelection(d.univ!, row),
                          deptOpen: false,
                        })
                      }
                    >
                      <span className="text-white">
                        {row.department} ({row.degree})
                      </span>
                      <span className="text-[0.72rem] text-zinc-500">{row.duration}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </>
  );
};
