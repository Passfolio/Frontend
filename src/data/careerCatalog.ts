import raw from '@/Assets/dataset/career_tables.json';
import { nameUuidFromUtf8String } from '@/utils/nameUuid';

export type CareerTagEnum = 'ROLE' | 'MAJOR' | 'SKILL';

export type CareerCatalogEntry = {
  id: string;
  name: string;
  code: number;
  tag: CareerTagEnum;
};

const TAG_MAP: Record<string, CareerTagEnum> = {
  직무: 'ROLE',
  전문분야: 'MAJOR',
  기술스택: 'SKILL',
};

export function normalizeCareerKeyword(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

function buildCatalog(): {
  byTag: Record<CareerTagEnum, CareerCatalogEntry[]>;
  byId: Map<string, CareerCatalogEntry>;
} {
  const byTag: Record<CareerTagEnum, CareerCatalogEntry[]> = {
    ROLE: [],
    MAJOR: [],
    SKILL: [],
  };
  const byId = new Map<string, CareerCatalogEntry>();
  const seen = new Set<string>();

  const root = raw as Record<string, Array<{ code: number; name: string; count: number }>>;
  for (const [jsonKey, rows] of Object.entries(root)) {
    const tag = TAG_MAP[jsonKey];
    if (!tag || !Array.isArray(rows)) continue;
    for (const row of rows) {
      const keyword = normalizeCareerKeyword(row.name);
      if (!keyword) continue;
      const id = nameUuidFromUtf8String(`${tag}:${keyword}`);
      if (seen.has(id)) continue;
      seen.add(id);
      const entry: CareerCatalogEntry = {
        id,
        name: row.name.trim(),
        code: row.code,
        tag,
      };
      byTag[tag].push(entry);
      byId.set(id, entry);
    }
  }
  return { byTag, byId };
}

export const careerCatalog = buildCatalog();

/** GET /dev-spec/career 로 받은 표시용 문자열을 카탈로그 id로 환산 (서버와 동일 정규화 가정). */
export function careerNamesToIds(names: string[] | undefined, tag: CareerTagEnum): string[] {
  const list = careerCatalog.byTag[tag];
  const normToId = new Map(list.map((e) => [normalizeCareerKeyword(e.name), e.id] as const));
  const out: string[] = [];
  for (const n of names ?? []) {
    const id = normToId.get(normalizeCareerKeyword(n));
    if (id) out.push(id);
  }
  return out;
}
