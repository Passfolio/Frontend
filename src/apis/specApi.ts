import { axiosInstance } from '@/utils/Auth/axiosInstance';

// ——— University search (GET /api/v1/spec/search/**, permitAll) ———

export type UniversityCandidateItem = {
  id: string;
  name: string;
  type: string;
  region: string;
  similarity: number;
};

export type UniversitySearchResponse = {
  keyword: string;
  candidates: UniversityCandidateItem[];
};

export type DepartmentDetailItem = {
  id: number;
  department: string;
  degree: string;
  duration: string;
};

export type DepartmentSearchResponse = {
  universityId: string;
  matchedDepartment: string;
  similarity: number;
  items: DepartmentDetailItem[];
};

export const searchUniversities = async (q: string, threshold?: number) => {
  const { data } = await axiosInstance.get<UniversitySearchResponse>('/api/v1/spec/search/universities', {
    params: { q, ...(threshold != null ? { threshold } : {}) },
  });
  return data;
};

export const searchDepartments = async (univUuid: string, q: string, threshold?: number) => {
  const { data } = await axiosInstance.get<DepartmentSearchResponse>('/api/v1/spec/search/departments', {
    params: { univ_uuid: univUuid, q, ...(threshold != null ? { threshold } : {}) },
  });
  return data;
};

// ——— Dev spec (auth) ———

export type EducationHistoryItem = {
  /** `university_department` PK — PATCH `universityDepartmentIds`와 동일 */
  universityDepartmentId?: number;
  name: string;
  type: string;
  region: string;
  department: string;
  degree: string;
  duration: string;
};

export type CareerInfo = {
  careerKeywords: string[];
  careerMajors: string[];
  careerSkills: string[];
};

export type DevSpecUpdateResponse = {
  experience: number;
  educationHistory: EducationHistoryItem[];
  careers: CareerInfo[];
};

export type CareerReadResponse = {
  experience: number;
  careerKeywords: string[];
  careerMajors: string[];
  careerSkills: string[];
};

export type DevSpecPatchRequest = {
  experience: number;
  universityDepartmentIds: number[];
  careerIds: string[];
};

export const getMyDevSpec = async (opts?: { cacheBust?: boolean }) => {
  const { data } = await axiosInstance.get<DevSpecUpdateResponse>('/api/v1/spec/dev-spec', {
    params: opts?.cacheBust ? { _: Date.now() } : undefined,
  });
  return data;
};

export const getMyEducationHistory = async (opts?: { cacheBust?: boolean }) => {
  const { data } = await axiosInstance.get<EducationHistoryItem[]>(
    '/api/v1/spec/dev-spec/education-history',
    { params: opts?.cacheBust ? { _: Date.now() } : undefined },
  );
  return data;
};

export const getMyCareer = async (opts?: { cacheBust?: boolean }) => {
  const { data } = await axiosInstance.get<CareerReadResponse>('/api/v1/spec/dev-spec/career', {
    params: opts?.cacheBust ? { _: Date.now() } : undefined,
  });
  return data;
};

export const patchDevSpec = async (body: DevSpecPatchRequest) => {
  const { data } = await axiosInstance.patch<DevSpecUpdateResponse>('/api/v1/spec/dev-spec', body);
  return data;
};
