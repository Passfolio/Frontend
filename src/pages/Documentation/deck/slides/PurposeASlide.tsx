import type { SlideProps } from './index';
import './purposeASlide.css';

/* ---- chart geometry (원본 Purpose A의 JS 생성 로직을 순수 계산으로 포팅) ---- */
const W = 1700;
const H = 400;
const PAD_L = 64;
const PAD_R = 70;
const PAD_T = 44;
const PAD_B = 56;
const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
// monthly S.A. annual-shape approximation; only endpoints are labelled (confident anchors)
const VALS = [36.0, 41.0, 44.5, 39.5, 38.5, 43.0, 47.7];
const V_MIN = 30;
const V_MAX = 52;

const x = (i: number) => PAD_L + (i * (W - PAD_L - PAD_R)) / (YEARS.length - 1);
const y = (v: number) => PAD_T + ((V_MAX - v) * (H - PAD_T - PAD_B)) / (V_MAX - V_MIN);

const PTS: [number, number][] = VALS.map((v, i) => [x(i), y(v)]);

/** smooth path (Catmull-Rom -> cubic bezier) */
function smooth(p: [number, number][]) {
    let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
    for (let i = 0; i < p.length - 1; i++) {
        const p0 = p[i - 1] || p[i];
        const p1 = p[i];
        const p2 = p[i + 1];
        const p3 = p[i + 2] || p2;
        const c1x = p1[0] + (p2[0] - p0[0]) / 6;
        const c1y = p1[1] + (p2[1] - p0[1]) / 6;
        const c2x = p2[0] - (p3[0] - p1[0]) / 6;
        const c2y = p2[1] - (p3[1] - p1[1]) / 6;
        d += `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d;
}

const LINE_PATH = smooth(PTS);
const AREA_PATH = `${LINE_PATH}L${PTS[PTS.length - 1][0].toFixed(1)},${H - PAD_B}L${PTS[0][0].toFixed(1)},${H - PAD_B}Z`;

/* pandemic band (2020 - mid 2022) */
const BAND_X1 = x(1) - 16;
const BAND_X2 = x(3) + 6;

/* trend arrow (dotted, 2019 -> 2025 direction) + head aligned to direction */
const A_TAIL: [number, number] = [x(1), y(37.5)];
const A_HEAD: [number, number] = [x(5) + 26, y(46.5)];
const ANG = Math.atan2(A_HEAD[1] - A_TAIL[1], A_HEAD[0] - A_TAIL[0]);
const AH = 15;
const AW = 7;
const HEAD_P2 = [
    A_HEAD[0] - AH * Math.cos(ANG) + AW * Math.sin(ANG),
    A_HEAD[1] - AH * Math.sin(ANG) - AW * Math.cos(ANG),
];
const HEAD_P3 = [
    A_HEAD[0] - AH * Math.cos(ANG) - AW * Math.sin(ANG),
    A_HEAD[1] - AH * Math.sin(ANG) + AW * Math.cos(ANG),
];
const ARROW_HEAD_PATH = `M${A_HEAD[0].toFixed(1)},${A_HEAD[1].toFixed(1)} L${HEAD_P2[0].toFixed(1)},${HEAD_P2[1].toFixed(1)} L${HEAD_P3[0].toFixed(1)},${HEAD_P3[1].toFixed(1)} Z`;

const GRID_VALUES = [30, 40, 50];

export function PurposeASlide({ isActive }: SlideProps) {
    return (
        <div className={`pf-slide sl-purpose-a${isActive ? '' : ' is-loading'}`}>
            <div className="corner left">
                <span className="num">02</span>
                <span className="sep">·</span>
                <span>Purpose</span>
            </div>
            <div className="corner right">
                <span className="pg">04</span>
            </div>

            <div className="head">
                <div className="eyebrow">
                    <span className="bar" />
                    Desk Research
                </div>
                <h1 className="headline">
                    노동시장을 떠나는 청년들, <span className="accent">'쉬었음'의 가파른 증가</span>
                </h1>
                <p className="sub">
                    '쉬었음' 청년은 <b>2019년 36.0만 명에서 2025년 47.7만 명</b>으로 크게 늘었습니다.{' '}
                    <b>AI 기반 기술 변화</b>와 <b>기업의 경력직 선호</b> 등 노동시장의 구조적 변화가 청년
                    고용에 부정적으로 작용하며, 노동시장을 이탈하는 청년이 빠르게 증가하고 있습니다.
                </p>
            </div>

            <div className="card">
                <div className="card-head">
                    <div className="card-title">
                        '쉬었음' 청년층 인구 추이<span className="u">단위 · 만 명 (2019 → 2025)</span>
                    </div>
                    <div className="delta">
                        <span className="big">+11.7만</span>
                        <span className="lab">6년간 약 32% 증가</span>
                    </div>
                </div>
                <div className="chart-wrap">
                    <svg className="chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="pf-pa-area" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
                                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="pf-pa-stroke" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#9a9ba1" />
                                <stop offset="100%" stopColor="#ffffff" />
                            </linearGradient>
                        </defs>

                        {/* gridlines (subtle) */}
                        {GRID_VALUES.map((gv) => (
                            <g key={gv}>
                                <line
                                    x1={PAD_L}
                                    y1={y(gv)}
                                    x2={W - PAD_R}
                                    y2={y(gv)}
                                    stroke="rgba(255,255,255,0.06)"
                                    strokeWidth={1}
                                />
                                <text x={PAD_L - 14} y={y(gv) + 5} textAnchor="end" className="axis-label">
                                    {gv}
                                </text>
                            </g>
                        ))}

                        {/* pandemic band (2020 - mid 2022) */}
                        <rect
                            x={BAND_X1}
                            y={PAD_T}
                            width={BAND_X2 - BAND_X1}
                            height={H - PAD_T - PAD_B}
                            fill="rgba(255,255,255,0.035)"
                            rx={6}
                        />
                        <text x={(BAND_X1 + BAND_X2) / 2} y={PAD_T + 22} textAnchor="middle" className="band-label">
                            팬데믹
                        </text>

                        {/* area */}
                        <path className="chart-area" d={AREA_PATH} fill="url(#pf-pa-area)" />

                        {/* trend arrow (dotted) */}
                        <path
                            className="chart-arrow"
                            d={`M${A_TAIL[0]},${A_TAIL[1]} L${A_HEAD[0]},${A_HEAD[1]}`}
                            stroke="rgba(255,255,255,0.34)"
                            strokeWidth={2}
                            strokeDasharray="4 7"
                            strokeLinecap="round"
                            fill="none"
                        />
                        <path className="chart-arrow" d={ARROW_HEAD_PATH} fill="rgba(255,255,255,0.5)" />

                        {/* main line — pathLength=1로 정규화해 CSS만으로 draw-on */}
                        <path
                            className="chart-line"
                            d={LINE_PATH}
                            pathLength={1}
                            fill="none"
                            stroke="url(#pf-pa-stroke)"
                            strokeWidth={3.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* year labels (x axis) */}
                        {YEARS.map((yr, i) => (
                            <text key={yr} x={x(i)} y={H - PAD_B + 30} textAnchor="middle" className="pt-year">
                                {`'${String(yr).slice(2)}`}
                            </text>
                        ))}

                        {/* points (all subtle, endpoints emphasized) */}
                        {PTS.map((p, i) => {
                            const endpoint = i === 0 || i === PTS.length - 1;
                            return (
                                <circle
                                    key={i}
                                    cx={p[0]}
                                    cy={p[1]}
                                    r={endpoint ? 8 : 4.5}
                                    fill={endpoint ? '#ffffff' : '#15161a'}
                                    stroke="#ffffff"
                                    strokeWidth={endpoint ? 0 : 2}
                                    className="dot"
                                    opacity={endpoint ? 1 : 0.85}
                                />
                            );
                        })}

                        {/* endpoint value labels */}
                        <text x={PTS[0][0]} y={PTS[0][1] + 40} textAnchor="middle" className="pt-label" fontSize={30} fill="#ffffff">
                            36.0
                        </text>
                        <text x={PTS[6][0] - 16} y={PTS[6][1] - 24} textAnchor="end" className="pt-label" fontSize={34} fill="#ffffff">
                            47.7
                        </text>
                    </svg>
                </div>
                <div className="source">자료 · 한국은행 BOK 이슈노트 제2026-3호 (2026.1.20) · 경제활동인구조사</div>
            </div>
        </div>
    );
}
