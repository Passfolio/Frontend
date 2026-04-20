import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  getMyCareer,
  getMyEducationHistory,
  patchDevSpec,
} from '@/api/Spec/specApi';
import { careerCatalog, careerNamesToIds, normalizeCareerKeyword } from '@/data/careerCatalog';
import {
  educationFingerprint,
  loadStoredDevSpecIds,
  saveStoredDevSpecIds,
} from '@/utils/devSpecLocalCache';
import { MAX_EDUCATION, MAX_CAREER_PICKS } from '@/constants/ui';
import type { EduDraftType, CareerTagKeyType, UpdateProfileModalProps } from './updateProfileTypes';
import { freshDraft } from './updateProfileHelpers';

type UseUpdateProfileFormReturnType = {
  loading: boolean;
  loadError: string | null;
  saving: boolean;
  saveError: string | null;
  experience: number;
  setExperience: (v: number) => void;
  careerIds: string[];
  careerSearch: Record<CareerTagKeyType, string>;
  setCareerSearch: React.Dispatch<React.SetStateAction<Record<CareerTagKeyType, string>>>;
  drafts: EduDraftType[];
  setDrafts: React.Dispatch<React.SetStateAction<EduDraftType[]>>;
  careerIdSet: Set<string>;
  filteredCareerEntries: { ROLE: typeof careerCatalog.byTag.ROLE; MAJOR: typeof careerCatalog.byTag.MAJOR; SKILL: typeof careerCatalog.byTag.SKILL };
  careerAtLimit: boolean;
  filledDepartmentIds: number[];
  toggleCareer: (id: string) => void;
  updateDraft: (key: string, patch: Partial<EduDraftType>) => void;
  addDraft: () => void;
  removeDraft: (key: string) => void;
  handleSave: () => Promise<void>;
};

export const useUpdateProfileForm = ({
  open,
  userId,
  onProfileUpdated,
  onClose,
}: Pick<UpdateProfileModalProps, 'open' | 'userId' | 'onProfileUpdated' | 'onClose'>): UseUpdateProfileFormReturnType => {
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [experience, setExperience] = useState(0);
  const [careerIds, setCareerIds] = useState<string[]>([]);
  const [careerSearch, setCareerSearch] = useState<Record<CareerTagKeyType, string>>({ ROLE: '', MAJOR: '', SKILL: '' });
  const [drafts, setDrafts] = useState<EduDraftType[]>([freshDraft()]);

  const careerIdSet = useMemo(() => new Set(careerIds), [careerIds]);

  const filteredCareerEntries = useMemo(() => {
    const filterList = (tag: CareerTagKeyType) => {
      const q = normalizeCareerKeyword(careerSearch[tag]).toLowerCase();
      const list = careerCatalog.byTag[tag];
      if (!q) return list;
      return list.filter((e) => normalizeCareerKeyword(e.name).toLowerCase().includes(q));
    };
    return { ROLE: filterList('ROLE'), MAJOR: filterList('MAJOR'), SKILL: filterList('SKILL') } as const;
  }, [careerSearch]);

  const careerAtLimit = careerIds.length >= MAX_CAREER_PICKS;

  const filledDepartmentIds = useMemo(() => {
    const ids: number[] = [];
    for (const d of drafts) {
      if (d.selectedDepartmentId != null && d.selectedDepartmentId > 0 && d.preview) {
        ids.push(d.selectedDepartmentId);
      }
    }
    return ids;
  }, [drafts]);

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
        setCareerIds([
          ...new Set([
            ...careerNamesToIds(career.careerKeywords, 'ROLE'),
            ...careerNamesToIds(career.careerMajors, 'MAJOR'),
            ...careerNamesToIds(career.careerSkills, 'SKILL'),
          ]),
        ]);

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
          const needReselect = draftsFromHistory.some((d) => d.selectedDepartmentId !== null && d.selectedDepartmentId <= 0 && d.preview);
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
    return () => { cancelled = true; };
  }, [open, userId]);

  useEffect(() => {
    if (!open) {
      setCareerSearch({ ROLE: '', MAJOR: '', SKILL: '' });
    }
  }, [open]);

  const toggleCareer = (id: string) => {
    setCareerIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_CAREER_PICKS) return prev;
      return [...prev, id];
    });
  };

  const updateDraft = (key: string, patch: Partial<EduDraftType>) => {
    setDrafts((rows) => rows.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  };

  const addDraft = () => {
    setDrafts((rows) => (rows.length >= MAX_EDUCATION ? rows : [...rows, freshDraft()]));
  };

  const removeDraft = (key: string) => {
    setDrafts((rows) => (rows.length <= 1 ? [freshDraft()] : rows.filter((d) => d.key !== key)));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const body = { experience, universityDepartmentIds: filledDepartmentIds, careerIds };
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

  return {
    loading, loadError, saving, saveError,
    experience, setExperience,
    careerIds, careerSearch, setCareerSearch,
    drafts, setDrafts,
    careerIdSet, filteredCareerEntries, careerAtLimit, filledDepartmentIds,
    toggleCareer, updateDraft, addDraft, removeDraft, handleSave,
  };
};
