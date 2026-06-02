import type { RoadmapAssessment } from '@/types/roadmap.type';
import { MOCK_ASSESSMENT } from './__mock__roadmapApi';

const BASE = import.meta.env.VITE_ROADMAP_API_URL ?? '';

export async function getAssessment(serviceKey: string): Promise<RoadmapAssessment> {
  if (!BASE) return Promise.resolve(MOCK_ASSESSMENT);
  const res = await fetch(`${BASE}?service=${encodeURIComponent(serviceKey)}`);
  if (!res.ok) throw new Error(`assessment fetch failed: ${res.status}`);
  return res.json() as Promise<RoadmapAssessment>;
}
