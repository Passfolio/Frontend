import { useState } from 'react';
import type { RoadmapNode, NodeStatus, MarketTier, LLMRoadmapStep } from '@/types/roadmap.type';

/* ─── 색상 ───────────────────────────────────────────────── */

const TIER_STYLE: Record<MarketTier, { bg: string; color: string }> = {
  '필수':   { bg: 'rgba(239,68,68,0.15)',   color: '#f87171' },
  '주류':   { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa' },
  '급부상': { bg: 'rgba(249,115,22,0.15)',  color: '#fb923c' },
  '성장':   { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80' },
  '중간':   { bg: 'rgba(113,113,122,0.15)', color: '#a1a1aa' },
};

const STATUS_DOT: Record<NodeStatus, string> = {
  covered:   '#4ade80',
  partial:   '#fb923c',
  uncovered: '#3f3f46',
};

const STATUS_LABEL: Record<NodeStatus, string> = {
  covered: '✓',
  partial: '…',
  uncovered: '',
};

const SPINE = 'rgba(59,130,246,0.5)';
const CONN  = 'rgba(96,165,250,0.35)';

/* ─── 타입 ───────────────────────────────────────────────── */

type TopicGroup = { topic: RoadmapNode; subtopics: RoadmapNode[] };

/* ─── 헬퍼 ───────────────────────────────────────────────── */

function buildGroups(nodes: RoadmapNode[]): TopicGroup[] {
  return nodes
    .filter((n) => n.type === 'topic')
    .sort((a, b) => a.order - b.order)
    .map((topic) => ({
      topic,
      subtopics: nodes
        .filter((n) => n.type === 'subtopic' && n.parent === topic.label)
        .sort((a, b) => a.order - b.order),
    }));
}

/* ─── 서브컴포넌트 ───────────────────────────────────────── */

function StatusBadge({ status, size = 18 }: { status: NodeStatus; size?: number }) {
  const dot = STATUS_DOT[status];
  const label = STATUS_LABEL[status];
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
      style={{ width: size, height: size, background: `${dot}22`, color: dot }}
    >
      {label || <span style={{ width: 5, height: 5, borderRadius: '50%', background: dot, display: 'block' }} />}
    </span>
  );
}

function DiagramRow({
  group,
  isSelected,
  isFirst,
  isLast,
  onClick,
}: {
  group: TopicGroup;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onClick: () => void;
}) {
  const { topic, subtopics } = group;
  const mt   = TIER_STYLE[topic.market_tier] ?? TIER_STYLE['중간'];
  const n    = subtopics.length;

  return (
    <div className="relative flex items-start" style={{ paddingBottom: isLast ? 0 : 32 }}>

      {/* ── 세로 스파인 ── */}
      <div
        className="absolute"
        style={{
          left: 105,
          top: isFirst ? 20 : 0,
          bottom: isLast ? 'auto' : 0,
          height: isLast ? 20 : undefined,
          width: 2,
          background: SPINE,
        }}
      />

      {/* ── 토픽 노드 ── */}
      <div className="relative z-10 flex items-start" style={{ width: 222 }}>
        {/* 스파인 점 */}
        <div
          className="absolute right-0 z-10 rounded-full"
          style={{
            top: 20,
            width: 12,
            height: 12,
            background: SPINE,
            transform: 'translate(50%, -50%)',
            boxShadow: `0 0 0 3px rgba(59,130,246,0.18)`,
          }}
        />

        <button
          type="button"
          onClick={onClick}
          className={`w-full rounded-xl border p-3.5 text-left transition-all duration-150 ${
            isSelected
              ? 'border-white/30 bg-white/[0.07] shadow-[0_0_0_2px_rgba(255,255,255,0.08)]'
              : topic.highlighted
              ? 'border-orange-400/45 bg-[#16171a] hover:border-orange-400/65'
              : topic.tier === 'core'
              ? 'border-white/15 bg-[#16171a] hover:border-white/25'
              : 'border-white/8 bg-[#16171a] hover:border-white/20'
          }`}
        >
          <div className="mb-2 flex items-center gap-2">
            <StatusBadge status={topic.status} />
            <span className="flex-1 truncate text-[13px] font-semibold text-white">{topic.label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="rounded-full px-1.5 py-px text-[9px] font-bold" style={{ background: mt.bg, color: mt.color }}>
              {topic.market_tier}
            </span>
            {topic.tier === 'core' && (
              <span className="rounded border border-white/10 px-1 py-px text-[8px] font-bold tracking-widest text-white/25">
                CORE
              </span>
            )}
          </div>
        </button>
      </div>

      {/* ── 서브토픽 ── */}
      {n > 0 && (
        <div className="relative ml-10 flex flex-col" style={{ gap: 8, paddingTop: 2 }}>
          {/* 수직 커넥터 — top/bottom 앵커로 실제 높이에 맞게 자동 조절 */}
          {n > 1 && (
            <div
              className="absolute"
              style={{
                left: 0,
                top: 17,    /* 첫 번째 서브토픽 중심 */
                bottom: 15, /* 마지막 서브토픽 중심 */
                width: 1,
                borderLeft: `1.5px dashed ${CONN}`,
              }}
            />
          )}

          {subtopics.map((sub) => {
            const smt  = TIER_STYLE[sub.market_tier] ?? TIER_STYLE['중간'];
            return (
              <div key={sub.label} className="flex items-center">
                {/* 수평 커넥터 */}
                <div style={{ width: 24, height: 1, borderTop: `1.5px dashed ${CONN}`, flexShrink: 0 }} />

                {/* 서브토픽 칩 */}
                <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-[#16171a] px-3 py-1.5" style={{ minWidth: 180 }}>
                  <StatusBadge status={sub.status} size={15} />
                  <span className="flex-1 truncate text-[12px] text-zinc-300">{sub.label}</span>
                  <span className="shrink-0 rounded-full px-1.5 py-px text-[9px] font-bold" style={{ background: smt.bg, color: smt.color }}>
                    {sub.market_tier}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DetailPanel({
  group,
  llmPath,
  onClose,
}: {
  group: TopicGroup;
  llmPath: LLMRoadmapStep[];
  onClose: () => void;
}) {
  const { topic, subtopics } = group;
  const dot = STATUS_DOT[topic.status];
  const STATUS_KR: Record<NodeStatus, string> = { covered: '완료', partial: '진행중', uncovered: '미학습' };
  const llm = llmPath.find((s) => s.topic === topic.label);

  return (
    <div className="flex w-[340px] shrink-0 flex-col gap-4 rounded-xl border border-white/8 bg-[#16171a] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">step {topic.order}</span>
          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: `${dot}22`, color: dot }}>
            {STATUS_KR[topic.status]}
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex size-6 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white/6 hover:text-zinc-300"
        >
          ×
        </button>
      </div>

      <h3 className="text-base font-bold text-white">{topic.label}</h3>

      {subtopics.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">하위 항목</p>
          <div className="flex flex-col gap-1.5">
            {subtopics.map((s) => {
              const smt  = TIER_STYLE[s.market_tier] ?? TIER_STYLE['중간'];
              return (
                <div key={s.label} className="flex items-center gap-2">
                  <StatusBadge status={s.status} size={15} />
                  <span className="flex-1 text-xs text-zinc-300">{s.label}</span>
                  <span className="shrink-0 rounded-full px-1.5 py-px text-[9px] font-bold" style={{ background: smt.bg, color: smt.color }}>
                    {s.market_tier}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {llm?.why && (
        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">배워야 하는 이유</p>
          <p className="text-sm leading-relaxed text-zinc-300">{llm.why}</p>
        </div>
      )}

      {llm?.how && (
        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">학습 방법</p>
          <p className="text-sm leading-relaxed text-zinc-300">{llm.how}</p>
        </div>
      )}

      {!llm && <p className="text-xs text-zinc-600">LLM 가이드 없음</p>}
    </div>
  );
}

/* ─── 메인 컴포넌트 ─────────────────────────────────────── */

type Props = {
  nodes: RoadmapNode[];
  llmPath: LLMRoadmapStep[];
};

export function RoadmapTimeline({ nodes, llmPath }: Props) {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const groups  = buildGroups(nodes);
  const selected = groups.find((g) => g.topic.label === selectedLabel) ?? null;

  function toggle(label: string) {
    setSelectedLabel((prev) => (prev === label ? null : label));
  }

  return (
    <div className="relative">
      {/* 다이어그램 */}
      <div className="flex justify-center">
        <div className="min-w-0">
          {groups.map((g, i) => (
            <DiagramRow
              key={g.topic.label}
              group={g}
              isSelected={selectedLabel === g.topic.label}
              isFirst={i === 0}
              isLast={i === groups.length - 1}
              onClick={() => toggle(g.topic.label)}
            />
          ))}
        </div>
      </div>

      {/* 디테일 패널 — absolute, 다이어그램 기준 우측 상단 */}
      {selected && (
        <>
          {/* 백드롭 */}
          <div
            className="absolute inset-0 z-90"
            onClick={() => setSelectedLabel(null)}
          />
          {/* 패널 */}
          <div className="absolute right-0 top-0 z-100 animate-in fade-in slide-in-from-right-4 duration-200">
            <DetailPanel
              group={selected}
              llmPath={llmPath}
              onClose={() => setSelectedLabel(null)}
            />
          </div>
        </>
      )}
    </div>
  );
}
