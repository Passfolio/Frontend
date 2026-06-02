import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAssessment } from '@/api/RoadMap/roadmapApi';
import { RoadmapTimeline } from '@/components/RoadMap/RoadmapTimeline';
import type {
  RoadmapAssessment,
  MarketTier,
} from '@/types/roadmap.type';

/* ─── 상수 ─────────────────────────────────────────────── */

const URGENCY: Record<string, { color: string; label: string }> = {
  urgent:         { color: '#f87171', label: '긴급' },
  important:      { color: '#fb923c', label: '중요' },
  'nice-to-have': { color: '#60a5fa', label: '추천' },
};

const MARKET_COLOR: Record<MarketTier, string> = {
  '필수':   '#f87171',
  '주류':   '#60a5fa',
  '급부상': '#fb923c',
  '성장':   '#4ade80',
  '중간':   '#a1a1aa',
};

/* ─── 서브 컴포넌트 ─────────────────────────────────────── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3.5 text-base font-bold text-white">{children}</h2>;
}

function InfoCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-white/[0.08] bg-[#16171a] p-4 ${className}`}>
      {children}
    </div>
  );
}

function CardLabel({ children, color = 'text-zinc-500' }: { children: React.ReactNode; color?: string }) {
  return (
    <p className={`mb-1.5 text-[10px] font-bold uppercase tracking-widest ${color}`}>
      {children}
    </p>
  );
}

function CoverageBar({ pct }: { pct: number }) {
  const barColor = pct >= 70 ? '#4ade80' : pct >= 40 ? '#fb923c' : '#f87171';
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
      <span className="min-w-[36px] text-right text-sm font-bold text-white">
        {pct.toFixed(1)}%
      </span>
    </div>
  );
}

/* ─── 메인 페이지 ───────────────────────────────────────── */

export function RoadMapPage() {
  const [params] = useSearchParams();
  const serviceKey = params.get('service') ?? '';

  const [data, setData] = useState<RoadmapAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState('');

  useEffect(() => {
    if (!serviceKey) return;
    setLoading(true);
    setError(null);
    getAssessment(serviceKey)
      .then((res) => {
        setData(res);
        setActiveRole(res.primary_roles[0] ?? '');
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [serviceKey]);

  const roleData = data && activeRole ? data.per_role[activeRole] : null;
  const isPrimary = data?.primary_roles.includes(activeRole);
  const allRoles = data ? [...data.primary_roles, ...data.secondary_roles] : [];

  /* ── 빈 / 로딩 / 에러 ─── */
  if (!serviceKey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d0f]">
        <p className="text-sm text-zinc-500">
          URL에 <code className="text-zinc-300">?service=</code> 파라미터가 필요합니다.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#0d0d0f]">
        <i className="fa-solid fa-spinner animate-spin text-2xl text-zinc-500" />
        <p className="text-sm text-zinc-500">분석 결과를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#0d0d0f]">
        <i className="fa-solid fa-triangle-exclamation text-2xl text-red-400" />
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!data || !roleData) return null;

  return (
    <div className="min-h-screen bg-[#0d0d0f]">
      <div className="mx-auto max-w-[1100px] px-6 py-10 pb-20">

        {/* ── 서비스 헤더 ──────────────────────────────── */}
        <div className="mb-8">
          <div className="mb-1.5 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{data.service_name}</h1>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.05] px-2.5 py-0.5 text-xs font-medium text-zinc-400">
              {data.dev_type}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
            <span className="font-semibold text-white">{data.llm_assessment.overall_level}</span>
            <span className="h-3.5 w-px bg-white/10" />
            <span>{roleData.level} · {roleData.topic_coverage} 토픽 커버</span>
          </div>
        </div>

        {/* ── 역할 탭 ──────────────────────────────────── */}
        {allRoles.length > 1 && (
          <div className="mb-6 flex gap-1.5">
            {allRoles.map((role) => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-all ${
                  activeRole === role
                    ? 'border-white/20 bg-white/10 text-white'
                    : 'border-white/[0.07] bg-transparent text-zinc-500 hover:border-white/15 hover:text-zinc-300'
                }`}
              >
                {role}
                {data.primary_roles.includes(role) && (
                  <span className="ml-1.5 text-[9px] font-bold text-orange-400">primary</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* ── 통계 카드 ─────────────────────────────────── */}
        <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <InfoCard>
            <CardLabel>커버리지</CardLabel>
            <CoverageBar pct={roleData.coverage_pct} />
          </InfoCard>

          <InfoCard>
            <CardLabel>커버된 노드</CardLabel>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white">{roleData.covered_count}</span>
              <span className="text-xs text-emerald-400">covered</span>
            </div>
          </InfoCard>

          <InfoCard>
            <CardLabel>미커버 노드</CardLabel>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white">{roleData.uncovered_count}</span>
              <span className="text-xs text-red-400">to learn</span>
            </div>
          </InfoCard>

          <InfoCard>
            <CardLabel>Frontier</CardLabel>
            <p className="text-sm font-semibold leading-snug text-white">
              {roleData.sequence.frontier_topic}
            </p>
          </InfoCard>
        </div>

        {/* ── 순서 판정 배너 ────────────────────────────── */}
        <div className="mb-7 rounded-xl border border-orange-400/15 bg-orange-400/[0.06] px-4 py-3">
          <p className="text-sm leading-relaxed text-zinc-300">
            <span className="font-semibold text-orange-400">순서 분석 · </span>
            {roleData.sequence.verdict}
          </p>
        </div>

        {/* ── 학습 로드맵 다이어그램 ───────────────────── */}
        <section className="mb-10">
          <SectionTitle>학습 로드맵</SectionTitle>
          <p className="mb-4 text-xs text-zinc-500">노드를 클릭하면 학습 가이드(이유 · 방법)가 옆에 표시됩니다.</p>
          <RoadmapTimeline nodes={roleData.nodes} llmPath={data.llm_assessment.roadmap_path} />
        </section>

        {/* ── LLM 심층 평가 (primary 전용) ────────────── */}
        {isPrimary && (
          <section className="mb-10">
            <SectionTitle>AI 심층 평가</SectionTitle>

            {/* 종합 판단 */}
            <InfoCard className="mb-3">
              <CardLabel>종합 판단</CardLabel>
              <p className="text-sm leading-relaxed text-zinc-300">
                {data.llm_assessment.level_rationale}
              </p>
            </InfoCard>

            {/* 강점 / 보완 */}
            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {data.llm_assessment.strong_areas.map((a) => (
                <InfoCard key={a.area}>
                  <CardLabel color="text-emerald-400">강점</CardLabel>
                  <p className="mb-1.5 text-sm font-semibold text-white">{a.area}</p>
                  <p className="text-xs leading-relaxed text-zinc-400">{a.reason}</p>
                </InfoCard>
              ))}
              {data.llm_assessment.gap_areas.map((g) => (
                <InfoCard key={g.area}>
                  <CardLabel color={g.priority === 'High' ? 'text-red-400' : 'text-orange-400'}>
                    보완 필요 · {g.priority}
                  </CardLabel>
                  <p className="mb-1.5 text-sm font-semibold text-white">{g.area}</p>
                  <p className="text-xs leading-relaxed text-zinc-400">{g.reason}</p>
                </InfoCard>
              ))}
            </div>

            {/* 요약 */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
              <CardLabel>요약</CardLabel>
              <p className="text-sm leading-relaxed text-zinc-300">
                {data.llm_assessment.summary}
              </p>
            </div>
          </section>
        )}

        {/* ── 시장 분석 (primary 전용) ─────────────────── */}
        {isPrimary && (
          <section>
            <SectionTitle>시장 분석</SectionTitle>

            {/* 포지션 & 전략 */}
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoCard>
                <CardLabel color="text-blue-400">시장 포지션</CardLabel>
                <p className="text-sm leading-relaxed text-zinc-300">
                  {data.market_brief.user_market_position}
                </p>
              </InfoCard>
              <InfoCard>
                <CardLabel color="text-orange-400">전략 방향</CardLabel>
                <p className="text-sm leading-relaxed text-zinc-300">
                  {data.market_brief.strategic_direction}
                </p>
              </InfoCard>
            </div>

            {/* 우선 습득 기술 */}
            <div>
              <p className="mb-2.5 text-xs font-semibold text-zinc-400">우선 습득 기술</p>
              <div className="flex flex-col gap-2">
                {data.market_brief.priority_skills.map((ps) => {
                  const urg = URGENCY[ps.urgency] ?? URGENCY['nice-to-have'];
                  return (
                    <div
                      key={ps.skill}
                      className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-[#16171a] px-4 py-3"
                    >
                      <span
                        className="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{ background: `${urg.color}1a`, color: urg.color }}
                      >
                        {urg.label}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="mb-0.5 text-sm font-semibold text-white">{ps.skill}</p>
                        <p className="text-xs leading-relaxed text-zinc-400">{ps.reason}</p>
                      </div>
                      <span
                        className="shrink-0 self-start text-xs font-medium"
                        style={{ color: MARKET_COLOR['필수'] }}
                      >
                        수요 {ps.market_demand}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
