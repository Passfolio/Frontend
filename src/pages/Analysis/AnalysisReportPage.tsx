import {
    memo,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { Link, useParams } from 'react-router-dom';
import { getUserAnalysisReport } from '@/api/ProjectAnalysis/projectAnalysisApi';
import type {
    AnalysisReportType,
    CorePerfType,
    FeedbackType,
    TechItemType,
} from '@/types/analysisReport.type';
import './analysisReport.css';

/* ---------- icons (module-level, 재생성 없음) ---------- */
const ICONS: Record<string, ReactNode> = {
    arrow: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>,
    check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M8.5 12.2l2.4 2.4 4.6-4.8" /></svg>,
    rotate: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36M21 4v4h-4" /></svg>,
    msg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.8-.8L3 21l1.9-4.2A8.4 8.4 0 1 1 21 11.5Z" /></svg>,
    close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>,
    cal: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></svg>,
    code: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m9 8-4 4 4 4M15 8l4 4-4 4" /></svg>,
    users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.2a3.2 3.2 0 0 1 0 5.6M17.5 14.4A5.5 5.5 0 0 1 21 20" /></svg>,
};

/** 돌아가기 → 프로필의 프로젝트 분석 탭, 분석 이력 위치 */
const PROFILE_ANALYSIS_HISTORY_PATH = '/profile?section=project-analysis&tab=history';

const CAT_ORDER = ['Language', 'Framework', 'Database', 'Infrastructure', 'Build·Tooling', 'Library'] as const;
const fmtDate = (s: string): string => s.replace(/-/g, '.');
const fmtNum = (n: number): string => n.toLocaleString('en-US');

/* 백틱(`...`)을 인라인 코드로 렌더 */
const CodeText = memo(function CodeText({ text }: { text: string }) {
    const parts = useMemo(() => text.split(/`([^`]+)`/g), [text]);
    return (
        <>
            {parts.map((p, i) =>
                i % 2 === 1 ? (
                    <code className="ar-ic" key={i}>{p}</code>
                ) : (
                    <span key={i}>{p}</span>
                ),
            )}
        </>
    );
});

/* 뷰포트 진입 시 1회 트리거(도넛 애니메이션용) */
function useReveal<T extends HTMLElement>() {
    const ref = useRef<T | null>(null);
    const [revealed, setRevealed] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (el.getBoundingClientRect().top < (window.innerHeight || 800)) {
            setRevealed(true);
            return;
        }
        const ob = new IntersectionObserver(
            (entries) => entries.forEach((e) => {
                if (e.isIntersecting) {
                    setRevealed(true);
                    ob.disconnect();
                }
            }),
            { threshold: 0.15 },
        );
        ob.observe(el);
        const fallback = setTimeout(() => setRevealed(true), 2500);
        return () => {
            ob.disconnect();
            clearTimeout(fallback);
        };
    }, []);
    return { ref, revealed };
}

const ViewDetailBtn = memo(function ViewDetailBtn({ onClick }: { onClick: () => void }) {
    return (
        <button type="button" className="ar-vd-btn" onClick={onClick}>
            View Detail {ICONS.arrow}
        </button>
    );
});

/* ---------- 개요 ---------- */
const Overview = memo(function Overview({
    report,
    techAll,
    onDetail,
}: {
    report: AnalysisReportType;
    techAll: TechItemType[];
    onDetail: () => void;
}) {
    return (
        <div className="ar-card">
            <div className="ar-card-head">
                <div className="ar-card-titwrap"><span className="ar-card-title">프로젝트 개요</span></div>
                <ViewDetailBtn onClick={onDetail} />
            </div>
            <div className="ar-label">설명</div>
            <p className="ar-desc">{report.service_description}</p>
            <div className="ar-hr" />
            <div className="ar-label">기술 스택</div>
            <div className="ar-chips">
                {techAll.map((t) => <span className="ar-chip" key={t.name}>{t.name}</span>)}
            </div>
        </div>
    );
});

/* ---------- 핵심 기능 ---------- */
const Features = memo(function Features({
    report,
    onDetail,
}: {
    report: AnalysisReportType;
    onDetail: () => void;
}) {
    const feats = report.analysis.core_feat;
    return (
        <div className="ar-card">
            <div className="ar-card-head">
                <div className="ar-card-titwrap">
                    <span className="ar-card-title">핵심 기능</span>
                    <span className="ar-count">{feats.length}</span>
                </div>
                <ViewDetailBtn onClick={onDetail} />
            </div>
            <div className="ar-feat">
                {feats.map((f) => (
                    <div className="ar-feat-item" key={f.feat_title}>
                        <span className="ar-feat-ico">{ICONS.check}</span>
                        <span className="ar-feat-tt">{f.feat_title}</span>
                    </div>
                ))}
            </div>
        </div>
    );
});

/* ---------- 나의 기여와 역할(도넛 + 역할 + 기여자 목록 단일 블록) ---------- */
const ContributionRole = memo(function ContributionRole({ report }: { report: AnalysisReportType }) {
    const { ref, revealed } = useReveal<HTMLDivElement>();
    const barRef = useRef<SVGCircleElement | null>(null);
    const [num, setNum] = useState(0);

    const me = report.github_username_resolved;
    const mineShare = report.contribute_share_percent;
    const members = report.contribute_breakdown;

    useEffect(() => {
        if (!revealed) return;
        const c = barRef.current;
        if (!c) return;
        const r = c.r.baseVal.value;
        const circumference = 2 * Math.PI * r;
        c.style.transition = 'none';
        c.style.strokeDasharray = String(circumference);
        c.style.strokeDashoffset = String(circumference);
        void c.getBoundingClientRect();
        const fill = setTimeout(() => {
            c.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.16, 1, 0.3, 1)';
            c.style.strokeDashoffset = String(circumference - (mineShare / 100) * circumference);
        }, 60);
        const dur = 1500;
        const stepMs = 20;
        const inc = mineShare / (dur / stepMs);
        let cur = 0;
        setNum(0);
        const iv = setInterval(() => {
            cur += inc;
            if (cur >= mineShare) {
                cur = mineShare;
                clearInterval(iv);
            }
            setNum(cur);
        }, stepMs);
        return () => {
            clearTimeout(fill);
            clearInterval(iv);
        };
    }, [revealed, mineShare]);

    return (
        <div className="ar-card" ref={ref}>
            <div className="ar-card-head"><div className="ar-card-titwrap"><span className="ar-card-title">나의 기여와 역할</span></div></div>
            <div className="ar-cr-top">
                <div className="ar-donut-wrap">
                    <svg className="ar-donut" width="201" height="201" viewBox="0 0 240 240">
                        <defs>
                            <linearGradient id="arDonutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#93a9f5" />
                                <stop offset="100%" stopColor="#ffffff" />
                            </linearGradient>
                        </defs>
                        <circle className="track" cx="120" cy="120" r="105" />
                        <circle ref={barRef} className="bar" cx="120" cy="120" r="105" />
                    </svg>
                    <div className="ar-donut-center">
                        <div className="ar-donut-lb">내 기여도</div>
                        <div className="ar-percent-wrap">
                            <strong className="ar-donut-num">{num.toFixed(1)}</strong>
                            <span className="ar-donut-pct">%</span>
                        </div>
                    </div>
                </div>
                <div className="ar-cr-role">
                    <div className="ar-role-tt">{report.dev_type.join(' · ')} 개발</div>
                    <p className="ar-role-dd">{report.user_role}</p>
                    <div className="ar-role-lb">주요 기여 영역</div>
                    <div className="ar-role-tags">
                        {report.analysis.contribute.contribute_titles.map((t) => (
                            <span className="ar-role-tag" key={t}>{t}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="ar-hr" />

            <div className="ar-members-head">기여자 {members.length}명</div>
            <div className="ar-members">
                {members.map((m) => {
                    const mine = m.name === me;
                    return (
                        <div className={'ar-leg-row ' + (mine ? 'mine' : 'other')} key={m.name}>
                            <span className={'ar-leg-dot ' + (mine ? 'mine' : 'other')} />
                            <span className="ar-leg-name">
                                <span className="nm">{m.name}</span>
                                {mine && <span className="ar-me-tag">나</span>}
                            </span>
                            <span className="ar-leg-val">{m.percent}%</span>
                            <span className="ar-leg-sub">+{fmtNum(m.added)} 라인 추가</span>
                        </div>
                    );
                })}
            </div>
            <div className="ar-contrib-cap">
                총 <b>{members.length}명</b>의 기여 중 <b>{mineShare}%</b>를 직접 담당했습니다.
            </div>
        </div>
    );
});

/* ---------- 하단 통계 ---------- */
const Stats = memo(function Stats({ report }: { report: AnalysisReportType }) {
    const meAdded = useMemo(() => {
        const me = report.contribute_breakdown.find((c) => c.name === report.github_username_resolved);
        return (me ?? report.contribute_breakdown[0])?.added ?? 0;
    }, [report]);
    return (
        <div className="ar-stats">
            <div className="ar-stat">
                <div className="ar-stat-top">{ICONS.cal} 분석 기간</div>
                <div className="ar-stat-num">{report.analysis_period.days}일</div>
                <div className="ar-stat-sub">{fmtDate(report.analysis_period.start)} - {fmtDate(report.analysis_period.end)}</div>
            </div>
            <div className="ar-stat">
                <div className="ar-stat-top">{ICONS.code} 코드 기여도</div>
                <div className="ar-stat-num">{fmtNum(meAdded)}</div>
                <div className="ar-stat-sub">추가한 코드 라인 수</div>
            </div>
            <div className="ar-stat">
                <div className="ar-stat-top">{ICONS.users} 핵심 성과</div>
                <div className="ar-stat-num">{report.analysis.core_perf.length}건</div>
                <div className="ar-stat-sub">성능·안정성 개선 성과</div>
            </div>
        </div>
    );
});

/* ---------- 성과 플립 카드 ---------- */
const PerfItem = memo(function PerfItem({ perf, fb }: { perf: CorePerfType; fb: FeedbackType | undefined }) {
    const [flipped, setFlipped] = useState(false);
    const frontRef = useRef<HTMLDivElement | null>(null);
    const backRef = useRef<HTMLDivElement | null>(null);
    const [height, setHeight] = useState<number | null>(null);

    useLayoutEffect(() => {
        const measure = () => {
            if (frontRef.current && backRef.current) {
                setHeight(Math.max(frontRef.current.offsetHeight, backRef.current.offsetHeight));
            }
        };
        measure();
        if (document.fonts?.ready) void document.fonts.ready.then(measure);
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    return (
        <div className={'ar-perf-card' + (flipped ? ' flipped' : '')}>
            <div className="ar-flip-inner" style={{ height: height ? `${height}px` : 'auto' }}>
                <div className="ar-face front" ref={frontRef}>
                    <div className="ar-pf-top">
                        <span className="ar-pf-feat">{perf.about_feat_title}</span>
                        <button type="button" className="ar-flip-btn" onClick={() => setFlipped(true)} aria-label="피드백 보기" title="피드백 보기">
                            {ICONS.rotate}
                        </button>
                    </div>
                    <div className="ar-pf-title">{perf.perf_title}</div>
                    <p className="ar-pf-desc"><CodeText text={perf.description} /></p>
                </div>
                <div className="ar-face back" ref={backRef}>
                    <div className="ar-pf-top">
                        <span className="ar-fb-tt">{ICONS.msg} 개선 피드백</span>
                        <button type="button" className="ar-flip-btn active" onClick={() => setFlipped(false)} aria-label="성과로 돌아가기" title="성과로 돌아가기">
                            {ICONS.rotate}
                        </button>
                    </div>
                    <div className="ar-pf-title accent">{fb ? fb.feedback_title : '피드백'}</div>
                    <p className="ar-pf-desc">{fb ? <CodeText text={fb.feedback} /> : '등록된 피드백이 없습니다.'}</p>
                </div>
            </div>
        </div>
    );
});

const Performance = memo(function Performance({
    perfs,
    fbMap,
}: {
    perfs: CorePerfType[];
    fbMap: Map<string, FeedbackType>;
}) {
    return (
        <div className="ar-card">
            <div className="ar-card-head">
                <div className="ar-card-titwrap">
                    <span className="ar-card-title">문제 해결 및 성과</span>
                    <span className="ar-count">{perfs.length}</span>
                </div>
            </div>
            <div className="ar-perf-hint">{ICONS.rotate} 각 성과 카드의 회전 버튼을 누르면 개선 피드백으로 전환됩니다.</div>
            <div className="ar-perf-grid">
                {perfs.map((p) => <PerfItem perf={p} fb={fbMap.get(p.perf_title)} key={p.perf_title} />)}
            </div>
        </div>
    );
});

/* ---------- 모달(개요/기능 상세) ---------- */
const ReportModal = memo(function ReportModal({
    kind,
    report,
    techAll,
    onClose,
}: {
    kind: 'overview' | 'features';
    report: AnalysisReportType;
    techAll: TechItemType[];
    onClose: () => void;
}) {
    const [closing, setClosing] = useState(false);
    const close = useCallback(() => {
        setClosing(true);
        setTimeout(onClose, 200);
    }, [onClose]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [close]);

    const grouped = useMemo(
        () => CAT_ORDER.map((cat) => ({ cat, items: techAll.filter((t) => t.category === cat) })).filter((g) => g.items.length),
        [techAll],
    );

    return (
        <div className={'ar-overlay' + (closing ? ' closing' : '')} onClick={close}>
            <div className="ar-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                <div className="ar-m-head">
                    <div className="ar-m-title">{kind === 'overview' ? '프로젝트 개요' : '핵심 기능 상세'}</div>
                    <button type="button" className="ar-m-close" onClick={close} aria-label="닫기">{ICONS.close}</button>
                </div>
                <div className="ar-m-sub">
                    {kind === 'overview'
                        ? `${report.service_name} · 서비스 구조와 분석 정보`
                        : `플랫폼을 구성하는 ${report.analysis.core_feat.length}개 핵심 기능`}
                </div>

                {kind === 'overview' ? (
                    <>
                        <div className="ar-m-sec">
                            <div className="ar-m-lb">서비스 소개</div>
                            <p className="ar-m-body">{report.service_description}</p>
                        </div>
                        <div className="ar-m-sec">
                            <div className="ar-m-lb">기술 스택</div>
                            <div className="ar-m-tech">
                                {grouped.map((g) => (
                                    <div className="ar-m-tech-row" key={g.cat}>
                                        <div className="ar-m-tech-cat">{g.cat}</div>
                                        <div className="ar-m-tech-chips">
                                            {g.items.map((t) => <span className="ar-chip" key={t.name}>{t.name}</span>)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="ar-m-sec">
                            <div className="ar-m-lb">분석 정보</div>
                            <div className="ar-m-stats">
                                <div className="ar-m-stat"><div className="ar-m-stat-num">{report.analysis_period.days}일</div><div className="ar-m-stat-lb">분석 기간</div></div>
                                <div className="ar-m-stat"><div className="ar-m-stat-num">{report.contribute_share_percent}%</div><div className="ar-m-stat-lb">코드 기여도</div></div>
                                <div className="ar-m-stat"><div className="ar-m-stat-num">{fmtNum(report.contribute_breakdown[0]?.added ?? 0)}</div><div className="ar-m-stat-lb">추가 라인</div></div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="ar-m-feat">
                        {report.analysis.core_feat.map((f) => (
                            <div className="ar-m-feat-item" key={f.feat_title}>
                                <span className="ar-m-feat-ico">{ICONS.check}</span>
                                <div>
                                    <div className="ar-m-feat-tt">{f.feat_title}</div>
                                    <div className="ar-m-feat-dd">{f.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});

/* ---------- 상태(로딩/에러/비완료) ---------- */
const StateView = ({ title, sub }: { title: string; sub?: string }) => (
    <div className="analysis-report">
        <div className="ar-state">
            <div className="ar-state-title">{title}</div>
            {sub && <div className="ar-state-sub">{sub}</div>}
            <Link to="/profile" className="ar-state-link">← 프로필로 돌아가기</Link>
        </div>
    </div>
);

/* ---------- 페이지 ---------- */
export const AnalysisReportPage = () => {
    const { analysisId } = useParams<{ analysisId: string }>();
    const [report, setReport] = useState<AnalysisReportType | null>(null);
    const [batchId, setBatchId] = useState<string | null>(null);
    const [phase, setPhase] = useState<'loading' | 'ready' | 'pending' | 'failed' | 'error'>('loading');
    const [modal, setModal] = useState<'overview' | 'features' | null>(null);

    useEffect(() => {
        if (!analysisId) {
            setPhase('error');
            return;
        }
        let cancelled = false;
        setPhase('loading');
        (async () => {
            try {
                const res = await getUserAnalysisReport(analysisId);
                if (cancelled) return;
                setBatchId(res.batchId);
                if (res.status === 'FAILED') {
                    setPhase('failed');
                    return;
                }
                if (res.status !== 'DONE') {
                    setPhase('pending');
                    return;
                }
                if (!res.report) {
                    setPhase('error');
                    return;
                }
                setReport(res.report);
                setPhase('ready');
            } catch {
                if (!cancelled) setPhase('error');
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [analysisId]);

    const techAll = useMemo<TechItemType[]>(
        () => (report ? [...report.frameworks, ...report.skills] : []),
        [report],
    );
    const fbMap = useMemo(() => {
        const map = new Map<string, FeedbackType>();
        report?.analysis.feedback.forEach((f) => map.set(f.about_perf_title, f));
        return map;
    }, [report]);

    if (phase === 'loading') return <StateView title="리포트를 불러오는 중…" />;
    if (phase === 'pending')
        return (
            <div className="analysis-report">
                <div className="ar-state">
                    <div className="ar-state-title">아직 분석이 완료되지 않았습니다.</div>
                    <div className="ar-state-sub">분석이 완료되면 이 페이지에서 결과 리포트를 확인할 수 있습니다.</div>
                    <Link to={batchId ? `/analysis/${batchId}` : '/profile'} className="ar-state-link">← 진행 상황 보기</Link>
                </div>
            </div>
        );
    if (phase === 'failed') return <StateView title="분석에 실패한 저장소입니다." sub="다시 시도하거나 다른 저장소를 분석해주세요." />;
    if (phase === 'error' || !report) return <StateView title="리포트를 불러오지 못했습니다." sub="잠시 후 다시 시도해주세요." />;

    return (
        <div className="analysis-report">
            <div className="ar-wrap">
                <Link to={PROFILE_ANALYSIS_HISTORY_PATH} className="ar-back">{ICONS.arrow} 돌아가기</Link>
                <div className="ar-topbar">
                    <div>
                        <h1 className="ar-title">프로젝트 분석 보고서</h1>
                        <div className="ar-subrow">
                            <span className="ar-subtitle">{report.service_name}</span>
                            {report.dev_type.map((d) => <span className="ar-pill" key={d}>{d}</span>)}
                            <span className="ar-pill done">분석 완료</span>
                        </div>
                    </div>
                    <div className="ar-period">
                        {fmtDate(report.analysis_period.start)} - {fmtDate(report.analysis_period.end)}
                    </div>
                </div>

                <div className="ar-grid">
                    <Overview report={report} techAll={techAll} onDetail={() => setModal('overview')} />
                    <Features report={report} onDetail={() => setModal('features')} />
                </div>

                <div style={{ marginBottom: 20 }}>
                    <ContributionRole report={report} />
                </div>

                <Stats report={report} />

                <div style={{ marginTop: 20 }}>
                    <Performance perfs={report.analysis.core_perf} fbMap={fbMap} />
                </div>
            </div>

            {modal && (
                <ReportModal kind={modal} report={report} techAll={techAll} onClose={() => setModal(null)} />
            )}
        </div>
    );
};

export default AnalysisReportPage;
