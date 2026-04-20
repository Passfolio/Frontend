import type { EducationHistoryItemType } from '@/api/Spec/specApi';

/**
 * 조회 API가 university_department PK를 내려주지 않으므로, 직전에 저장한 PATCH 요청의 id 목록을
 * 동일 학력 스냅샷일 때만 복원하는 데 사용합니다.
 */
export type StoredDevSpecIdsType = {
  universityDepartmentIds: number[];
  careerIds: string[];
  educationFingerprint: string;
};

const storageKey = (userId: string | number) => `passfolio:devSpecIds:${userId}`;

export function educationFingerprint(history: EducationHistoryItemType[]): string {
  return history
    .map((e) => [e.name, e.type, e.region, e.department, e.degree, e.duration].join('\u001f'))
    .join('\u001e');
}

export function loadStoredDevSpecIds(userId: string | number): StoredDevSpecIdsType | null {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as StoredDevSpecIdsType;
  } catch {
    return null;
  }
}

export function saveStoredDevSpecIds(userId: string | number, payload: StoredDevSpecIdsType): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(payload));
}
