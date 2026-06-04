import { RoadmapTimeline } from '@/components/RoadMap/RoadmapTimeline';
import { useRoadmapGeneration } from '@/hooks/useRoadmapGeneration';
import type {
  MarketTier,
  AssessmentReliability,
} from '@/types/roadmap.type';

/* ─── 상수 ─────────────────────────────────────────────── */

const RELIABILITY_COLOR: Record<AssessmentReliability['grade'], string> = {
  high:   '#4ade80',
  medium: '#fb923c',
  low:    '#f87171',
};

const RELIABILITY_LABEL: Record<AssessmentReliability['grade'], string> = {
  high:   '높음',
  medium: '보통',
  low:    '낮음',
};

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

/** github URL → 짧은 owner/repo 표기 (https://github.com/ prefix + .git suffix 제거). */
function shortenRepo(repoUrl: string): string {
  return repoUrl
    .replace(/^https:\/\/github\.com\//, '')
    .replace(/\.git$/, '');
}

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
  const {
    phase,
    history,
    historyLoading,
    selectedIds,
    toggleSelect,
    data,
    error,
    activeRole,
    setActiveRole,
    generate,
    reset,
  } = useRoadmapGeneration();

  /* ── 'generating' 위상 ─── */
  if (phase === 'generating') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#0d0d0f]">
        <i className="fa-solid fa-spinner animate-spin text-2xl text-zinc-500" />
        <p className="text-sm text-zinc-500">로드맵을 생성하는 중입니다... (최대 수 분 소요)</p>
      </div>
    );
  }

  /* ── 'select' 위상 ─── */
  if (phase !== 'done') {
    if (historyLoading) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#0d0d0f]">
          <i className="fa-solid fa-spinner animate-spin text-2xl text-zinc-500" />
          <p className="text-sm text-zinc-500">분석 이력을 불러오는 중...</p>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#0d0d0f]">
        <div className="mx-auto max-w-[680px] px-6 py-12">
          <h1 className="mb-1.5 text-2xl font-bold text-white">학습 로드맵 생성</h1>
          <p className="mb-7 text-sm text-zinc-500">
            완료된 프로젝트 분석을 선택하면, 해당 분석을 토대로 맞춤형 학습 로드맵을 생성합니다.
          </p>

          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3">
              <i className="fa-solid fa-triangle-exclamation text-sm text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {history.length === 0 ? (
            <div className="rounded-xl border border-white/[0.08] bg-[#16171a] px-5 py-8 text-center">
              <p className="text-sm leading-relaxed text-zinc-400">
                완료된 프로젝트 분석이 없습니다. 먼저 프로젝트 분석을 완료한 뒤 다시 시도해 주세요.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex flex-col gap-2">
                {history.map((it) => {
                  const checked = selectedIds.has(it.analysisId);
                  const short = shortenRepo(it.repoUrl);
                  return (
                    <button
                      key={it.analysisId}
                      type="button"
                      onClick={() => toggleSelect(it.analysisId)}
                      className={`flex items-center gap-3.5 rounded-xl border px-4 py-3 text-left transition-all ${
                        checked
                          ? 'border-white/20 bg-white/[0.06]'
                          : 'border-white/[0.08] bg-[#16171a] hover:border-white/15'
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                          checked
                            ? 'border-orange-400 bg-orange-400 text-[#0d0d0f]'
                            : 'border-white/20 bg-transparent'
                        }`}
                      >
                        {checked && <i className="fa-solid fa-check text-[10px]" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-white">
                          {it.serviceName || short}
                        </span>
                        <span className="block truncate text-xs text-zinc-500">{short}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => void generate()}
                disabled={selectedIds.size === 0}
                className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-40"
              >
                선택한 {selectedIds.size}개 분석으로 로드맵 생성
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ── 'done' 위상 ─── */
  const roleData = data && activeRole ? data.per_role[activeRole] : null;
  const isPrimary = data?.primary_roles.includes(activeRole);
  const allRoles = data ? [...data.primary_roles, ...data.secondary_roles] : [];

  if (!data || !roleData) return null;

  return (
    <div className="min-h-screen bg-[#0d0d0f]">
      <div className="mx-auto max-w-[1100px] px-6 py-10 pb-20">

        {/* ── 뒤로가기 ──────────────────────────────────── */}
        <button
          type="button"
          onClick={reset}
          className="mb-6 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-300"
        >
          ← 다른 분석으로 다시 만들기
        </button>

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
            <span>{roleData.coverage_level} · {roleData.topic_coverage} 토픽 커버</span>
          </div>

          {/* final_level */}
          {data.final_level && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-lg border border-white/10 bg-white/4 px-3 py-1 text-xs text-zinc-300">
                최종 레벨 <span className="ml-1 font-bold text-white">{data.final_level.final_level}</span>
              </span>
              <span className="rounded-lg border border-white/10 bg-white/4 px-3 py-1 text-xs text-zinc-300">
                구현 깊이 <span className="ml-1 font-bold text-white">{data.final_level.skill_level}</span>
              </span>
              <span className="rounded-lg border border-white/10 bg-white/4 px-3 py-1 text-xs text-zinc-300">
                로드맵 폭 <span className="ml-1 font-bold text-white">{data.final_level.coverage_level}</span>
              </span>
            </div>
          )}

          {/* assessment_reliability */}
          {data.assessment_reliability && (
            <div className="mt-2 flex items-center gap-2">
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{
                  background: `${RELIABILITY_COLOR[data.assessment_reliability.grade]}1a`,
                  color: RELIABILITY_COLOR[data.assessment_reliability.grade],
                }}
              >
                신뢰도 {RELIABILITY_LABEL[data.assessment_reliability.grade]}
              </span>
              <span className="text-xs text-zinc-500">
                기여도 {data.assessment_reliability.contribute_pct}% · {data.assessment_reliability.note}
              </span>
            </div>
          )}
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
