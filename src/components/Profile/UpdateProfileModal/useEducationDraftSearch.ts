import axios from 'axios';
import { searchUniversities, searchDepartments } from '@/api/Spec/specApi';
import { SEARCH_DEBOUNCE_MS } from '@/constants/ui';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import type { EduDraftType } from './updateProfileTypes';

type UseEducationDraftSearchProps = {
  updateDraft: (key: string, patch: Partial<EduDraftType>) => void;
};

export const useEducationDraftSearch = ({ updateDraft }: UseEducationDraftSearchProps) => {
  const runUnivSearch = useDebouncedCallback(async (draftKey: string, q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      updateDraft(draftKey, { univResults: [], univOpen: false, univError: null });
      return;
    }
    try {
      const res = await searchUniversities(trimmed);
      updateDraft(draftKey, { univResults: res.candidates, univOpen: true, univError: null });
    } catch (e) {
      const msg = axios.isAxiosError(e) && e.response?.status === 404
        ? '유사한 대학교를 찾지 못했습니다.'
        : '대학교 검색에 실패했습니다.';
      updateDraft(draftKey, { univResults: [], univOpen: false, univError: msg });
    }
  }, SEARCH_DEBOUNCE_MS);

  const runDeptSearch = useDebouncedCallback(async (draftKey: string, univId: string, q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      updateDraft(draftKey, { deptItems: null, deptOpen: false, deptError: null });
      return;
    }
    try {
      const res = await searchDepartments(univId, trimmed);
      updateDraft(draftKey, {
        deptItems: res.items,
        deptMatched: res.matchedDepartment,
        deptOpen: true,
        deptError: null,
      });
    } catch (e) {
      const msg = axios.isAxiosError(e) && e.response?.status === 404
        ? '유사한 학과를 찾지 못했습니다.'
        : '학과 검색에 실패했습니다.';
      updateDraft(draftKey, { deptItems: null, deptOpen: false, deptError: msg });
    }
  }, SEARCH_DEBOUNCE_MS);

  return { runUnivSearch, runDeptSearch };
};
