import { MAX_CAREER_PICKS } from '@/constants/ui';
import { careerCatalog } from '@/data/careerCatalog';
import type { CareerTagKeyType } from './updateProfileTypes';
import { TAG_LABEL } from './updateProfileTypes';

type Props = {
  careerIds: string[];
  careerIdSet: Set<string>;
  careerAtLimit: boolean;
  careerSearch: Record<CareerTagKeyType, string>;
  setCareerSearch: React.Dispatch<React.SetStateAction<Record<CareerTagKeyType, string>>>;
  filteredCareerEntries: { ROLE: typeof careerCatalog.byTag.ROLE; MAJOR: typeof careerCatalog.byTag.MAJOR; SKILL: typeof careerCatalog.byTag.SKILL };
  toggleCareer: (id: string) => void;
};

export const UpdateProfileCareerSection = ({
  careerIds,
  careerIdSet,
  careerAtLimit,
  careerSearch,
  setCareerSearch,
  filteredCareerEntries,
  toggleCareer,
}: Props) => (
  <section className="mb-2">
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        직무 · 전문분야 · 기술 스택
      </p>
      <p className="text-[0.72rem] tabular-nums text-zinc-500">
        선택{' '}
        <span className={careerAtLimit ? 'text-amber-200/90' : 'text-zinc-300'}>{careerIds.length}</span>
        {' '}/ {MAX_CAREER_PICKS}
        {careerAtLimit && (
          <span className="ml-1.5 text-[0.65rem] text-amber-200/70">(상한 도달)</span>
        )}
      </p>
    </div>

    {(['ROLE', 'MAJOR', 'SKILL'] as const satisfies readonly CareerTagKeyType[]).map((tag) => {
      const entries = filteredCareerEntries[tag];
      return (
        <div key={tag} className="mb-4">
          <p className="mb-1.5 text-[0.72rem] font-medium text-zinc-400">{TAG_LABEL[tag]}</p>
          <label className="sr-only" htmlFor={`career-search-${tag}`}>
            {TAG_LABEL[tag]} 검색
          </label>
          <input
            id={`career-search-${tag}`}
            type="search"
            value={careerSearch[tag]}
            onChange={(e) => setCareerSearch((s) => ({ ...s, [tag]: e.target.value }))}
            placeholder="이름으로 검색…"
            autoComplete="off"
            className="mb-2 w-full rounded-lg border border-white/[0.12] bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white/22"
          />
          <div className="pf-scroll-y max-h-[min(42vh,280px)] min-h-[7rem] overflow-y-auto overscroll-y-contain rounded-lg border border-white/[0.06] bg-black/20 p-2">
            {entries.length === 0 ? (
              <p className="py-6 text-center text-xs text-zinc-600">검색 결과 없음</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {entries.map((c) => {
                  const on = careerIdSet.has(c.id);
                  const disableAdd = !on && careerAtLimit;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      disabled={disableAdd}
                      title={disableAdd ? `최대 ${MAX_CAREER_PICKS}개까지 선택할 수 있습니다` : undefined}
                      onClick={() => toggleCareer(c.id)}
                      className={`rounded-md border px-2.5 py-1 text-[0.72rem] transition ${
                        on
                          ? 'border-white/35 bg-white/[0.14] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                          : disableAdd
                            ? 'cursor-not-allowed border-white/[0.06] bg-white/[0.02] text-zinc-600'
                            : 'border-white/[0.10] bg-white/[0.04] text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    })}
  </section>
);
