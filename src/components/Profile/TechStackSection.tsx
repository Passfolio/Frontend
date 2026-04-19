import { useState } from 'react';
import { PROFILE_CHIP_SURFACE_CLASS } from '@/constants/profile';
import { AllChipsOverlay } from '@/components/Profile/AllChipsOverlay';

export type TechStackSectionProps = {
  /** career_tables.json 직무 (ROLE) */
  roles: string[];
  /** 전문분야 (MAJOR) */
  majors: string[];
  /** 기술 스택 (SKILL) */
  skills: string[];
  className?: string;
};

type TechStackRows = Pick<TechStackSectionProps, 'roles' | 'majors' | 'skills'>;

const SECTIONS: { key: keyof TechStackRows; label: string }[] = [
  { key: 'roles', label: '직무' },
  { key: 'majors', label: '전문분야' },
  { key: 'skills', label: '기술 스택' },
];

/** 프로필 카드에 한 줄로 펼쳐 보일 칩 개수 (나머지는 더보기, 같은 row) */
const PREVIEW_CHIP_COUNT = 5;

const chipClass = `${PROFILE_CHIP_SURFACE_CLASS} shrink-0 rounded-full px-3 py-1 text-xs font-medium text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]`;

type ExpandKey = keyof TechStackRows | null;

export const TechStackSection = ({ roles, majors, skills, className }: TechStackSectionProps) => {
  const map: TechStackRows = { roles, majors, skills };
  const [expandKey, setExpandKey] = useState<ExpandKey>(null);

  const totalCount = roles.length + majors.length + skills.length;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/[0.09] px-5 pt-6 pb-8 sm:px-7 sm:pt-7 sm:pb-9 ${className ?? ''}`}
      style={{
        background: 'rgba(18,18,22,0.92)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.09), 0 4px 24px -6px rgba(0,0,0,0.5)',
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      <div className="mb-7 flex flex-wrap items-end justify-between gap-2 lg:mb-8">
        <h2 className="text-base font-semibold tracking-wide text-white/90 lg:text-xl">Tech Stack</h2>
        {totalCount > 0 && (
          <span className="text-[0.72rem] font-medium tabular-nums text-zinc-500">선택 {totalCount}개</span>
        )}
      </div>

      <div className="space-y-5 pl-2.5 sm:pl-3">
        {SECTIONS.map(({ key, label }) => {
          const chips = map[key];
          const rest = chips.length - PREVIEW_CHIP_COUNT;
          const preview = rest > 0 ? chips.slice(0, PREVIEW_CHIP_COUNT) : chips;

          return (
            <div
              key={key}
              className="flex flex-col gap-2 border-l border-white/[0.08] pl-3 sm:pl-4 lg:flex-row lg:items-start lg:gap-2.5 lg:border-l-0 lg:pl-0"
            >
              <div className="w-auto shrink-0 text-[11px] font-semibold uppercase tracking-widest text-zinc-500 lg:w-[4.75rem] lg:text-left">
                <span className="block">{label}</span>
                {chips.length > 0 && (
                  <span className="mt-0.5 block text-[0.65rem] font-medium tabular-nums normal-case tracking-normal text-zinc-600">
                    {chips.length}개
                  </span>
                )}
              </div>
              <div className="flex min-h-[1.75rem] min-w-0 flex-1 flex-nowrap items-center gap-1.5 overflow-x-auto overscroll-x-contain border-white/10 pb-0.5 [scrollbar-width:thin] lg:border-l lg:pl-3 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15">
                {chips.length === 0 ? (
                  <span className="text-xs text-zinc-600">선택된 항목 없음</span>
                ) : (
                  <>
                    {preview.map((chip) => (
                      <span key={chip} className={chipClass}>
                        {chip}
                      </span>
                    ))}
                    {rest > 0 && (
                      <button
                        type="button"
                        onClick={() => setExpandKey(key)}
                        title={`${rest}개 더 보기`}
                        aria-label={`${rest}개 더 보기`}
                        className={`${PROFILE_CHIP_SURFACE_CLASS} shrink-0 whitespace-nowrap rounded-full border-dashed px-3 py-1 text-xs font-medium text-zinc-400 transition hover:border-white/25 hover:bg-white/[0.08] hover:text-zinc-200`}
                      >
                        더보기
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {expandKey != null && (
        <AllChipsOverlay
          open
          sectionLabel={SECTIONS.find((s) => s.key === expandKey)?.label ?? ''}
          chips={map[expandKey]}
          onClose={() => setExpandKey(null)}
          chipClassName={chipClass}
          titleId="techstack-all-title"
        />
      )}
    </div>
  );
};
