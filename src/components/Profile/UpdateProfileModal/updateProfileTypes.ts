import type { EducationHistoryItemType, UniversityCandidateItemType, DepartmentDetailItemType, DevSpecUpdateResponseType } from '@/api/Spec/specApi';

export type { EducationHistoryItemType, UniversityCandidateItemType, DepartmentDetailItemType };

export type EduDraftType = {
  key: string;
  univ: UniversityCandidateItemType | null;
  univQuery: string;
  univResults: UniversityCandidateItemType[];
  univOpen: boolean;
  univError: string | null;
  deptQuery: string;
  deptItems: DepartmentDetailItemType[] | null;
  deptMatched: string | null;
  deptOpen: false | true;
  deptError: string | null;
  selectedDepartmentId: number | null;
  preview: EducationHistoryItemType | null;
};

export type CareerTagKeyType = 'ROLE' | 'MAJOR' | 'SKILL';

export const TAG_LABEL: Record<CareerTagKeyType, string> = {
  ROLE: '직무',
  MAJOR: '전문분야',
  SKILL: '기술 스택',
};

export type UpdateProfileModalProps = {
  open: boolean;
  onClose: () => void;
  userId: string;
  onProfileUpdated?: (result: DevSpecUpdateResponseType) => void;
};
