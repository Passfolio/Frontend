import { axiosInstance } from '@/api/Http/axiosInstance';
import { API_ENDPOINTS } from '@/api/Http/apiEndpoints';

export type UniversityCandidateItemType = {
  id: string;
  name: string;
  type: string;
  region: string;
  similarity: number;
};

export type UniversitySearchResponseType = {
  keyword: string;
  candidates: UniversityCandidateItemType[];
};

export type DepartmentDetailItemType = {
  id: number;
  department: string;
  degree: string;
  duration: string;
};

export type DepartmentSearchResponseType = {
  universityId: string;
  matchedDepartment: string;
  similarity: number;
  items: DepartmentDetailItemType[];
};

export const searchUniversities = async (q: string, threshold?: number) => {
  const { data } = await axiosInstance.get<UniversitySearchResponseType>(
    API_ENDPOINTS.spec.searchUniversities,
    { params: { q, ...(threshold != null ? { threshold } : {}) } },
  );
  return data;
};

export const searchDepartments = async (univUuid: string, q: string, threshold?: number) => {
  const { data } = await axiosInstance.get<DepartmentSearchResponseType>(
    API_ENDPOINTS.spec.searchDepartments,
    { params: { univ_uuid: univUuid, q, ...(threshold != null ? { threshold } : {}) } },
  );
  return data;
};

export type EducationHistoryItemType = {
  universityDepartmentId?: number;
  name: string;
  type: string;
  region: string;
  department: string;
  degree: string;
  duration: string;
};

export type CareerInfoType = {
  careerKeywords: string[];
  careerMajors: string[];
  careerSkills: string[];
};

export type DevSpecUpdateResponseType = {
  experience: number;
  educationHistory: EducationHistoryItemType[];
  careers: CareerInfoType[];
};

export type CareerReadResponseType = {
  experience: number;
  careerKeywords: string[];
  careerMajors: string[];
  careerSkills: string[];
};

export type DevSpecPatchRequestType = {
  experience: number;
  universityDepartmentIds: number[];
  careerIds: string[];
};

export const getMyDevSpec = async (opts?: { cacheBust?: boolean }) => {
  const { data } = await axiosInstance.get<DevSpecUpdateResponseType>(API_ENDPOINTS.spec.devSpec, {
    params: opts?.cacheBust ? { _: Date.now() } : undefined,
  });
  return data;
};

export const getMyEducationHistory = async (opts?: { cacheBust?: boolean }) => {
  const { data } = await axiosInstance.get<EducationHistoryItemType[]>(
    API_ENDPOINTS.spec.educationHistory,
    { params: opts?.cacheBust ? { _: Date.now() } : undefined },
  );
  return data;
};

export const getMyCareer = async (opts?: { cacheBust?: boolean }) => {
  const { data } = await axiosInstance.get<CareerReadResponseType>(API_ENDPOINTS.spec.career, {
    params: opts?.cacheBust ? { _: Date.now() } : undefined,
  });
  return data;
};

export const patchDevSpec = async (body: DevSpecPatchRequestType) => {
  const { data } = await axiosInstance.patch<DevSpecUpdateResponseType>(API_ENDPOINTS.spec.devSpec, body);
  return data;
};
