export type MarketTier = '필수' | '주류' | '급부상' | '성장' | '중간';
export type NodeStatus = 'covered' | 'partial' | 'uncovered';
export type RoadmapTier = 'core' | 'support';

export interface RoadmapNode {
  label: string;
  type: 'topic' | 'subtopic';
  parent: string;
  order: number;
  tier: RoadmapTier;
  status: NodeStatus;
  market_tier: MarketTier;
  highlighted: boolean;
}

export interface RoadmapStep {
  step: number;
  topic: string;
  tier: RoadmapTier;
  status: NodeStatus;
  subtopics_to_learn: string[];
  market_tier: MarketTier;
  highlighted: boolean;
}

export interface LLMRoadmapStep {
  step: number;
  topic: string;
  tier: RoadmapTier;
  subtopics_to_learn: string[];
  why: string;
  how: string;
}

export interface SequenceInfo {
  frontier_topic: string;
  contiguous_until: string | null;
  in_order_ratio: number;
  skipped_core_prereqs: string[];
  skipped_support_prereqs: string[];
  verdict: string;
}

export interface PerRoleData {
  coverage_level: string;
  coverage_pct: number;
  topic_coverage: string;
  sequence: SequenceInfo;
  roadmap_path: RoadmapStep[];
  nodes: RoadmapNode[];
  covered_count: number;
  partial_count: number;
  uncovered_count: number;
}

export interface AssessmentReliability {
  grade: 'high' | 'medium' | 'low';
  contribute_pct: number;
  note: string;
}

export interface FinalLevel {
  final_level: string;
  skill_level: string;
  coverage_level: string;
  note: string;
}

export interface StrongArea {
  area: string;
  reason: string;
}

export interface GapArea {
  area: string;
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
}

export interface LLMAssessment {
  overall_level: string;
  level_rationale: string;
  strong_areas: StrongArea[];
  gap_areas: GapArea[];
  roadmap_path: LLMRoadmapStep[];
  summary: string;
}

export interface TrendingStack {
  stack: string;
  trend: string;
  kr_demand_pct: number;
  reason: string;
}

export interface DecliningStack {
  stack: string;
  reason: string;
}

export interface PrioritySkill {
  skill: string;
  urgency: 'urgent' | 'important' | 'nice-to-have';
  market_demand: string;
  reason: string;
}

export interface MarketBrief {
  market_overview: string;
  trending_stacks: TrendingStack[];
  declining_stacks: DecliningStack[];
  company_patterns: { startup: string; enterprise: string };
  salary_context: string;
  user_market_position: string;
  strategic_direction: string;
  priority_skills: PrioritySkill[];
}

export interface RoadmapAssessment {
  service_name: string;
  dev_type: string;
  primary_roles: string[];
  secondary_roles: string[];
  assessment_reliability?: AssessmentReliability;
  final_level?: FinalLevel;
  per_role: Record<string, PerRoleData>;
  llm_assessment: LLMAssessment;
  market_brief: MarketBrief;
}

export interface RoadmapFlowNodeData extends Record<string, unknown> {
  step: number;
  topic: string;
  tier: RoadmapTier;
  market_tier: MarketTier;
  highlighted: boolean;
  subtopics: string[];
  isSelected: boolean;
  status: NodeStatus;
}

export interface MergedStep {
  step: number;
  topic: string;
  tier: RoadmapTier;
  market_tier: MarketTier;
  highlighted: boolean;
  subtopics: string[];
  why: string;
  how: string;
  status: NodeStatus;
}
