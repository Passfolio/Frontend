import type { EduDraftType, EducationHistoryItemType, UniversityCandidateItemType, DepartmentDetailItemType } from './updateProfileTypes';

export const freshDraft = (): EduDraftType => ({
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
});

export const previewFromSelection = (
  univ: UniversityCandidateItemType,
  row: DepartmentDetailItemType,
): EducationHistoryItemType => ({
  name: univ.name,
  type: univ.type,
  region: univ.region,
  department: row.department,
  degree: row.degree,
  duration: row.duration,
});
