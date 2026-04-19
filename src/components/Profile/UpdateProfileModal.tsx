import axios from 'axios';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { EducationHistoryItem } from '@/apis/specApi';
import {
  getMyCareer,
  getMyEducationHistory,
  patchDevSpec,
  searchDepartments,
  searchUniversities,
  type DepartmentDetailItem,
  type DevSpecUpdateResponse,
  type UniversityCandidateItem,
} from '@/apis/specApi';
import { careerCatalog, careerNamesToIds, normalizeCareerKeyword } from '@/data/careerCatalog';
import {
  educationFingerprint,
  loadStoredDevSpecIds,
  saveStoredDevSpecIds,
} from '@/utils/devSpecLocalCache';

const MAX_EDUCATION = 5;
const MAX_CAREER_PICKS = 200;
const SEARCH_DEBOUNCE_MS = 380;

type EduDraft = {
  key: string;
  univ: UniversityCandidateItem | null;
  univQuery: string;
  univResults: UniversityCandidateItem[];
  univOpen: boolean;
  univError: string | null;
  deptQuery: string;
  deptItems: DepartmentDetailItem[] | null;
  deptMatched: string | null;
  deptOpen: boolean;
  deptError: string | null;
  selectedDepartmentId: number | null;
  preview: EducationHistoryItem | null;
};

function freshDraft(): EduDraft {
  return {
    key: crypto.randomUUID(),
    univ: null,
    univQuery: '',
    univResults: [],
    univOpen: false,
    univError: null,
    deptQuery: '',
    deptItems: null,
    deptMatched: null,
    deptOpen: false,
    deptError: null,
    selectedDepartmentId: null,
    preview: null,
  };
}

function previewFromSelection(
  univ: UniversityCandidateItem,
  row: DepartmentDetailItem,
): EducationHistoryItem {
  return {
    name: univ.name,
    type: univ.type,
    region: univ.region,
    department: row.department,
    degree: row.degree,
    duration: row.duration,
  };
}

function useDebouncedCallback<T extends unknown[]>(fn: (...args: T) => void, delay: number) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback((...args: T) => {
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => fnRef.current(...args), delay);
  }, [delay]);
}

type UpdateProfileModalProps = {
  open: boolean;
  onClose: () => void;
  userId: string;
  /** 저장 성공 후 최신 스펙 반영 (PATCH 응답 본문 — 학력·직무 즉시 동기화) */
  onProfileUpdated?: (result: DevSpecUpdateResponse) => void;
};

type CareerTagKey = 'ROLE' | 'MAJOR' | 'SKILL';

const TAG_LABEL: Record<CareerTagKey, string> = {
  ROLE: '직무',
  MAJOR: '전문분야',
  SKILL: '기술 스택',
};

export const UpdateProfileModal = ({ open, onClose, userId, onProfileUpdated }: UpdateProfileModalProps) => {
  const titleId = useId();
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [experience, setExperience] = useState(0);
  const [careerIds, setCareerIds] = useState<string[]>([]);
  const [careerSearch, setCareerSearch] = useState<Record<CareerTagKey, string>>({
    ROLE: '',
    MAJOR: '',
    SKILL: '',
  });
  const [drafts, setDrafts] = useState<EduDraft[]>([freshDraft()]);

  const careerIdSet = useMemo(() => new Set(careerIds), [careerIds]);

  const filteredCareerEntries = useMemo(() => {
    const filterList = (tag: CareerTagKey) => {
      const q = normalizeCareerKeyword(careerSearch[tag]).toLowerCase();
      const list = careerCatalog.byTag[tag];
      if (!q) return list;
      return list.filter((e) => normalizeCareerKeyword(e.name).toLowerCase().includes(q));
    };
    return {
      ROLE: filterList('ROLE'),
      MAJOR: filterList('MAJOR'),
      SKILL: filterList('SKILL'),
    } as const;
  }, [careerSearch]);

  const careerAtLimit = careerIds.length >= MAX_CAREER_PICKS;

  const toggleCareer = (id: string) => {
    setCareerIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_CAREER_PICKS) return prev;
      return [...prev, id];
    });
  };

  const runUnivSearch = useDebouncedCallback(async (draftKey: string, q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setDrafts((rows) =>
        rows.map((d) =>
          d.key === draftKey ? { ...d, univResults: [], univOpen: false, univError: null } : d,
        ),
      );
      return;
    }
    try {
      const res = await searchUniversities(trimmed);
      setDrafts((rows) =>
        rows.map((d) =>
          d.key === draftKey
            ? { ...d, univResults: res.candidates, univOpen: true, univError: null }
            : d,
        ),
      );
    } catch (e) {
      const msg = axios.isAxiosError(e) && e.response?.status === 404
        ? '유사한 대학교를 찾지 못했습니다.'
        : '대학교 검색에 실패했습니다.';
      setDrafts((rows) =>
        rows.map((d) => (d.key === draftKey ? { ...d, univResults: [], univOpen: false, univError: msg } : d)),
      );
    }
  }, SEARCH_DEBOUNCE_MS);

  const runDeptSearch = useDebouncedCallback(async (draftKey: string, univId: string, q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setDrafts((rows) =>
        rows.map((d) =>
          d.key === draftKey ? { ...d, deptItems: null, deptOpen: false, deptError: null } : d,
        ),
      );
      return;
    }
    try {
      const res = await searchDepartments(univId, trimmed);
      setDrafts((rows) =>
        rows.map((d) =>
          d.key === draftKey
            ? {
                ...d,
                deptItems: res.items,
                deptMatched: res.matchedDepartment,
                deptOpen: true,
                deptError: null,
              }
            : d,
        ),
      );
    } catch (e) {
      const msg = axios.isAxiosError(e) && e.response?.status === 404
        ? '유사한 학과를 찾지 못했습니다.'
        : '학과 검색에 실패했습니다.';
      setDrafts((rows) =>
        rows.map((d) => (d.key === draftKey ? { ...d, deptItems: null, deptOpen: false, deptError: msg } : d)),
      );
    }
  }, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [educationHistory, career] = await Promise.all([
          getMyEducationHistory(),
          getMyCareer(),
        ]);
        if (cancelled) return;

        setExperience(career.experience);
        setCareerIds(
          [
            ...new Set([
              ...careerNamesToIds(career.careerKeywords, 'ROLE'),
              ...careerNamesToIds(career.careerMajors, 'MAJOR'),
              ...careerNamesToIds(career.careerSkills, 'SKILL'),
            ]),
          ],
        );

        const fp = educationFingerprint(educationHistory);
        const cached = loadStoredDevSpecIds(userId);
        const fingerprintMatch = Boolean(
          cached &&
            cached.educationFingerprint === fp &&
            cached.universityDepartmentIds.length === educationHistory.length,
        );

        if (educationHistory.length > 0) {
          const draftsFromHistory = educationHistory.map((h, i) => {
            let resolvedId: number | null = null;
            if (h.universityDepartmentId != null && h.universityDepartmentId > 0) {
              resolvedId = h.universityDepartmentId;
            } else if (fingerprintMatch && cached?.universityDepartmentIds[i] != null) {
              const cid = cached.universityDepartmentIds[i];
              if (cid != null && cid > 0) resolvedId = cid;
            }
            if (resolvedId != null) {
              return { ...freshDraft(), selectedDepartmentId: resolvedId, preview: h };
            }
            return { ...freshDraft(), selectedDepartmentId: -1, preview: h };
          });
          const needReselect = draftsFromHistory.some((d) => d.selectedDepartmentId <= 0 && d.preview);
          setDrafts([
            ...draftsFromHistory,
            ...(educationHistory.length < MAX_EDUCATION ? [freshDraft()] : []),
          ]);
          if (needReselect) {
            setLoadError(
              '저장된 학력의 학과 ID가 서버에서 내려오지 않습니다. 학력을 다시 검색·선택해야 저장할 수 있습니다.',
            );
          }
        } else {
          setDrafts([freshDraft()]);
        }
      } catch {
        if (!cancelled) setLoadError('프로필 정보를 불러오지 못했습니다. 로그인 상태를 확인해 주세요.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, userId]);

  useEffect(() => {
    if (!open) {
      setCareerSearch({ ROLE: '', MAJOR: '', SKILL: '' });
    }
  }, [open]);

  const filledDepartmentIds = useMemo(() => {
    const ids: number[] = [];
    for (const d of drafts) {
      if (d.selectedDepartmentId != null && d.selectedDepartmentId > 0 && d.preview) {
        ids.push(d.selectedDepartmentId);
      }
    }
    return ids;
  }, [drafts]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const body = {
        experience,
        universityDepartmentIds: filledDepartmentIds,
        careerIds,
      };
      const res = await patchDevSpec(body);
      saveStoredDevSpecIds(userId, {
        universityDepartmentIds: filledDepartmentIds,
        careerIds,
        educationFingerprint: educationFingerprint(res.educationHistory),
      });
      onProfileUpdated?.(res);
      onClose();
    } catch (e) {
      const msg = axios.isAxiosError(e) && e.response?.data?.message
        ? String(e.response.data.message)
        : '저장에 실패했습니다.';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const updateDraft = (key: string, patch: Partial<EduDraft>) => {
    setDrafts((rows) => rows.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  };

  const addDraft = () => {
    setDrafts((rows) => (rows.length >= MAX_EDUCATION ? rows : [...rows, freshDraft()]));
  };

  const removeDraft = (key: string) => {
    setDrafts((rows) => (rows.length <= 1 ? [freshDraft()] : rows.filter((d) => d.key !== key)));
  };

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
        style={{
          background: 'linear-gradient(165deg, rgba(28,28,32,0.98) 0%, rgba(12,12,14,0.99) 100%)',
        }}
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
          {loading && <p className="text-sm text-zinc-500">불러오는 중…</p>}
          {loadError && (
            <p className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/90">
              {loadError}
            </p>
          )}

          {!loading && (
            <>
              <section className="mb-6">
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                  경력 연차
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={experience}
                  onChange={(e) => setExperience(Math.min(50, Math.max(0, Number(e.target.value) || 0)))}
                  className="w-full rounded-xl border border-white/[0.12] bg-white/[0.05] px-3 py-2.5 text-sm text-white outline-none ring-0 transition focus:border-white/25"
                />
                <p className="mt-1 text-[0.72rem] text-zinc-600">0–50 정수</p>
              </section>

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
                      {d.preview && d.selectedDepartmentId && d.selectedDepartmentId > 0 ? (
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
                                onClick={() =>
                                  updateDraft(d.key, {
                                    ...freshDraft(),
                                    key: d.key,
                                  })
                                }
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
                      ) : d.preview && d.selectedDepartmentId === -1 ? (
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
                            onClick={() =>
                              updateDraft(d.key, {
                                ...freshDraft(),
                                key: d.key,
                              })
                            }
                          >
                            다시 검색하기
                          </button>
                        </div>
                      ) : (
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
                      )}
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

                {(['ROLE', 'MAJOR', 'SKILL'] as const satisfies readonly CareerTagKey[]).map((tag) => {
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

              {saveError && (
                <p className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-100/90">
                  {saveError}
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
            disabled={loading || saving}
            onClick={handleSave}
            className="flex-1 rounded-xl border border-white/[0.2] py-2.5 text-sm font-semibold text-white transition enabled:hover:border-white/35 enabled:hover:bg-white/[0.08] disabled:opacity-50"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 100%)',
            }}
          >
            {saving ? '저장 중…' : '저장'}
          </button>
        </footer>
      </div>
    </div>
  );
};
