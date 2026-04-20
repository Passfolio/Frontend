import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { PROFILE_CHIP_SURFACE_CLASS } from '@/constants/profile';
import { AllChipsOverlay } from '@/components/Profile/AllChipsOverlay';
import { EducationHistoryOverlay } from '@/components/Profile/EducationHistoryOverlay';
import type { EducationHistoryItemType } from '@/api/Spec/specApi';

export type MyCompetenciesSectionProps = {
  educationHistory: EducationHistoryItemType[];
  /** 직무 키워드 요약 한 줄 */
  jobLine: string;
  careerYearsLabel: string;
  roles: string[];
  majors: string[];
  skills: string[];
  className?: string;
};

type RowKey = 'roles' | 'majors' | 'skills';

const JOB_ROWS: { key: RowKey; label: string; blurb: string }[] = [
  { key: 'roles', label: '직무', blurb: '희망 직무·역할 키워드' },
  { key: 'majors', label: '전문분야', blurb: '전공·도메인·전문 영역' },
  { key: 'skills', label: '기술 스택', blurb: '사용 언어·프레임워크·도구' },
];

const PREVIEW_MAX = 12;

const chipClass = `${PROFILE_CHIP_SURFACE_CLASS} shrink-0 rounded-full px-3 py-1 text-xs font-medium text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]`;

type ExpandKey = RowKey | null;

/** Apple-style neutral liquid glass surface (no chromatic accents) */
const glassOuter = [
  'relative overflow-hidden rounded-[1.75rem]',
  'border border-white/[0.11]',
  'backdrop-blur-2xl backdrop-saturate-150',
  'px-5 pt-7 pb-8 sm:px-8 sm:pt-8 sm:pb-10',
].join(' ');

const glassOuterStyle: CSSProperties = {
  background: 'linear-gradient(165deg, rgba(38,38,42,0.52) 0%, rgba(14,14,16,0.78) 100%)',
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -1px 0 rgba(0,0,0,0.22), 0 12px 40px -12px rgba(0,0,0,0.55)',
};

const glassPanel = [
  'relative overflow-hidden rounded-2xl border border-white/[0.10]',
  'bg-white/[0.04] backdrop-blur-xl',
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]',
].join(' ');

const glassPanelStyle: CSSProperties = {
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10), 0 8px 28px -10px rgba(0,0,0,0.45)',
};

const glassSheenTop = 'pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent';

export const MyCompetenciesSection = ({
  educationHistory,
  jobLine,
  careerYearsLabel,
  roles,
  majors,
  skills,
  className,
}: MyCompetenciesSectionProps) => {
  const map = useMemo(() => ({ roles, majors, skills }), [roles, majors, skills]);
  const [expandKey, setExpandKey] = useState<ExpandKey>(null);
  const [educationOverlayOpen, setEducationOverlayOpen] = useState(false);

  const total = roles.length + majors.length + skills.length;

  const educationEmpty = educationHistory.length === 0;
  const educationMoreCount = Math.max(0, educationHistory.length - 1);

  const educationPreview = useMemo(
    () => (educationHistory.length <= 1 ? educationHistory : educationHistory.slice(0, 1)),
    [educationHistory],
  );

  useEffect(() => {
    if (educationHistory.length <= 1) setEducationOverlayOpen(false);
  }, [educationHistory.length]);

  return (
    <div className={[glassOuter, className ?? ''].filter(Boolean).join(' ')} style={glassOuterStyle}>
      <div className={glassSheenTop} />

      {/* Neutral frosted orbs — white/silver only */}
      <div
        className="pointer-events-none absolute -right-28 -top-32 h-80 w-80 rounded-full opacity-[0.28] blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.14) 0%, transparent 68%)' }}
      />
      <div
        className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full opacity-[0.18] blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)' }}
      />

      <header className="relative mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">Competency</p>
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">나의 보유 역량</h2>
          <p className="max-w-xl text-sm leading-relaxed text-zinc-400">
            학력과 직무·역량을 한 화면에서 확인하세요. 프로필 업데이트에서 수정하면 여기에 반영됩니다.
          </p>
        </div>

        <div
          className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/[0.10] px-4 py-3 backdrop-blur-xl"
          style={{
            background: 'linear-gradient(155deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 55%, rgba(0,0,0,0.06) 100%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.12)',
          }}
        >
          <div className="text-right">
            <p className="text-[0.65rem] font-medium uppercase tracking-wider text-zinc-500">역량 항목</p>
            <p className="text-2xl font-semibold tabular-nums text-white">{total}</p>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <dl className="grid grid-cols-3 gap-x-3 gap-y-1 text-[0.7rem] text-zinc-500">
            <dt className="col-span-1">직무</dt>
            <dd className="col-span-2 text-right tabular-nums text-zinc-300">{roles.length}</dd>
            <dt className="col-span-1">전문</dt>
            <dd className="col-span-2 text-right tabular-nums text-zinc-300">{majors.length}</dd>
            <dt className="col-span-1">기술</dt>
            <dd className="col-span-2 text-right tabular-nums text-zinc-300">{skills.length}</dd>
          </dl>
        </div>
      </header>

      <div className="relative space-y-5">
        {/* 1) 학력 정보 */}
        <section className={[glassPanel, 'p-4 sm:p-5'].join(' ')} style={glassPanelStyle}>
          <div className={glassSheenTop} />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/[0.07] to-transparent"
            aria-hidden
          />
          <div className="relative">
            <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-zinc-500">학력 정보</h3>
            {educationEmpty ? (
              <p className="mt-3 rounded-xl border border-dashed border-white/[0.12] bg-black/15 px-4 py-3 text-sm text-zinc-500">
                등록된 학력이 없습니다. <span className="text-zinc-400">Update Profile</span>에서 학력을 추가해 보세요.
              </p>
            ) : (
              <>
                <ul className="mt-3 space-y-3">
                  {educationPreview.map((edu, idx) => (
                    <li
                      key={edu.universityDepartmentId ?? `${idx}-${edu.name}-${edu.duration}`}
                      className={idx > 0 ? 'border-t border-white/[0.07] pt-3' : ''}
                    >
                      <p className="text-base font-semibold tracking-tight text-white">{edu.name}</p>
                      <dl className="mt-1.5 space-y-1 text-sm text-zinc-400">
                        {edu.department ? (
                          <div className="flex gap-2">
                            <dt className="shrink-0 text-zinc-500">학과</dt>
                            <dd className="min-w-0">{edu.department}</dd>
                          </div>
                        ) : null}
                        {edu.degree ? (
                          <div className="flex gap-2">
                            <dt className="shrink-0 text-zinc-500">학위</dt>
                            <dd className="min-w-0">{edu.degree}</dd>
                          </div>
                        ) : null}
                        {edu.duration ? (
                          <div className="flex gap-2">
                            <dt className="shrink-0 text-zinc-500">기간</dt>
                            <dd className="min-w-0">{edu.duration}</dd>
                          </div>
                        ) : null}
                      </dl>
                    </li>
                  ))}
                </ul>
                {educationMoreCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => setEducationOverlayOpen(true)}
                    aria-haspopup="dialog"
                    aria-label={`학력 ${educationMoreCount}건 더 보기`}
                    className={`${PROFILE_CHIP_SURFACE_CLASS} mt-3 inline-flex shrink-0 items-center rounded-full border-dashed px-3 py-1 text-xs font-medium text-zinc-400 transition hover:border-white/25 hover:bg-white/[0.08] hover:text-zinc-200`}
                  >
                    +{educationMoreCount} 더보기
                  </button>
                ) : null}
              </>
            )}
          </div>
        </section>

        {/* 2) 직무 정보 — 요약 + 칩 그룹 */}
        <section className={[glassPanel, 'p-4 sm:p-5'].join(' ')} style={glassPanelStyle}>
          <div className={glassSheenTop} />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/[0.06] to-transparent"
            aria-hidden
          />
          <div className="relative space-y-5">
            <div>
              <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-zinc-500">직무 정보</h3>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex rounded-full border border-white/[0.14] px-3 py-1 text-[0.72rem] font-medium text-zinc-200"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 100%)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14)',
                  }}
                >
                  {careerYearsLabel}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">{jobLine}</p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" aria-hidden />

            <div className="space-y-5">
              {JOB_ROWS.map(({ key, label, blurb }) => {
                const chips = map[key];
                const rest = chips.length - PREVIEW_MAX;
                const preview = rest > 0 ? chips.slice(0, PREVIEW_MAX) : chips;

                return (
                  <div key={key} className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div>
                        <h4 className="text-base font-semibold text-white">{label}</h4>
                        <p className="text-[0.8rem] text-zinc-500">{blurb}</p>
                      </div>
                      {chips.length > 0 && (
                        <span className="text-[0.72rem] font-medium tabular-nums text-zinc-500">{chips.length}개</span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {chips.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-white/[0.12] bg-black/15 px-4 py-3 text-sm text-zinc-500">
                          아직 선택된 항목이 없습니다. <span className="text-zinc-400">Update Profile</span>에서 추가해 보세요.
                        </p>
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
                              className={`${PROFILE_CHIP_SURFACE_CLASS} inline-flex shrink-0 items-center rounded-full border-dashed px-3 py-1 text-xs font-medium text-zinc-400 transition hover:border-white/25 hover:bg-white/[0.08] hover:text-zinc-200`}
                            >
                              +{rest} 더보기
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {expandKey != null && (
        <AllChipsOverlay
          open
          sectionLabel={JOB_ROWS.find((r) => r.key === expandKey)?.label ?? ''}
          chips={map[expandKey]}
          onClose={() => setExpandKey(null)}
          chipClassName={chipClass}
          titleId="competencies-all-title"
        />
      )}

      <EducationHistoryOverlay
        open={educationOverlayOpen}
        items={educationHistory}
        onClose={() => setEducationOverlayOpen(false)}
        titleId="competencies-education-overlay-title"
      />
    </div>
  );
};
