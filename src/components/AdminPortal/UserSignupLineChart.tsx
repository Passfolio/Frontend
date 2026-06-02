import { useEffect, useMemo, useRef, useState } from 'react';

export type ChartPointType = {
    label: string; // x축 라벨(yyyy-MM-dd)
    value: number; // y축 값(users 수)
};

type UserSignupLineChartProps = {
    pointList: ChartPointType[];
    valueUnit?: string; // 툴팁 값 단위(예: "명")
};

// viewBox 좌표계(반응형: width 100% + preserveAspectRatio). 모바일에선 텍스트가 작아지므로
// 정밀 값은 호버/탭 툴팁(HTML)으로 보강한다.
const VB_WIDTH = 800;
const VB_HEIGHT = 320;
const PAD = { top: 24, right: 24, bottom: 40, left: 48 };
const PLOT_W = VB_WIDTH - PAD.left - PAD.right;
const PLOT_H = VB_HEIGHT - PAD.top - PAD.bottom;
const HIDE_BULLETS_OVER = 50; // 점 개수가 많으면 개별 불릿 숨김(amCharts hideBulletsCount 참고)
const Y_TICKS = 4;
const X_TICKS = 6;

// 다크 테마 액센트(성장=emerald). 라인 + 면적 그라데이션 채움.
const ACCENT = '#34d399';

const niceStep = (value: number): number => {
    if (value <= 1) return 1;
    const pow = Math.pow(10, Math.floor(Math.log10(value)));
    for (const factor of [1, 2, 5, 10]) {
        if (value <= factor * pow) return factor * pow;
    }
    return 10 * pow;
};

export const UserSignupLineChart = ({ pointList, valueUnit = '' }: UserSignupLineChartProps) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const lineRef = useRef<SVGPathElement>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const pointCount = pointList.length;

    const { yTickValueList, linePath, areaPath, scaleX, scaleY } = useMemo(() => {
        const maxValue = pointList.reduce((max, p) => Math.max(max, p.value), 0);
        const step = niceStep(Math.max(1, maxValue) / Y_TICKS);
        const computedYMax = step * Y_TICKS;
        const tickList = Array.from({ length: Y_TICKS + 1 }, (_, i) => step * i);

        const sx = (index: number): number =>
            pointCount <= 1 ? PAD.left + PLOT_W / 2 : PAD.left + (index / (pointCount - 1)) * PLOT_W;
        const sy = (value: number): number => PAD.top + PLOT_H - (value / computedYMax) * PLOT_H;

        const line = pointList
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(i).toFixed(2)} ${sy(p.value).toFixed(2)}`)
            .join(' ');

        const baseline = PAD.top + PLOT_H;
        const area =
            pointCount >= 2
                ? `${line} L ${sx(pointCount - 1).toFixed(2)} ${baseline} L ${sx(0).toFixed(2)} ${baseline} Z`
                : '';

        return {
            yTickValueList: tickList,
            linePath: line,
            areaPath: area,
            scaleX: sx,
            scaleY: sy,
        };
    }, [pointList, pointCount]);

    // x축 라벨 인덱스(겹침 방지로 일부만)
    const xTickIndexList = useMemo(() => {
        if (pointCount <= 1) return [0].slice(0, pointCount);
        const span = Math.min(X_TICKS, pointCount) - 1;
        const stepSize = (pointCount - 1) / span;
        const indexSet = new Set<number>();
        for (let i = 0; i <= span; i += 1) indexSet.add(Math.round(i * stepSize));
        return Array.from(indexSet).sort((a, b) => a - b);
    }, [pointCount]);

    // 라인 그려지는 애니메이션(prefers-reduced-motion 존중)
    useEffect(() => {
        const path = lineRef.current;
        if (!path || pointCount < 2) return;
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;
        const length = path.getTotalLength();
        path.style.transition = 'none';
        path.style.strokeDasharray = `${length}`;
        path.style.strokeDashoffset = `${length}`;
        const raf = requestAnimationFrame(() => {
            path.style.transition = 'stroke-dashoffset 1.1s ease';
            path.style.strokeDashoffset = '0';
        });
        return () => cancelAnimationFrame(raf);
    }, [linePath, pointCount]);

    const handlePointer = (event: React.PointerEvent<SVGSVGElement>) => {
        const svg = svgRef.current;
        if (!svg || pointCount === 0) return;
        const rect = svg.getBoundingClientRect();
        if (rect.width === 0) return;
        const vbX = ((event.clientX - rect.left) / rect.width) * VB_WIDTH;
        const ratio = (vbX - PAD.left) / PLOT_W;
        const index = Math.round(ratio * (pointCount - 1));
        setActiveIndex(Math.max(0, Math.min(pointCount - 1, index)));
    };

    if (pointCount === 0) {
        return (
            <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-white/[0.08] bg-[#101114]/70">
                <p className="text-sm text-zinc-500">표시할 가입 데이터가 없습니다.</p>
            </div>
        );
    }

    const activePoint = activeIndex !== null ? pointList[activeIndex] : null;
    const activeLeftPercent = activeIndex !== null ? (scaleX(activeIndex) / VB_WIDTH) * 100 : 0;
    const activeTopPercent = activePoint ? (scaleY(activePoint.value) / VB_HEIGHT) * 100 : 0;
    const showBullets = pointCount <= HIDE_BULLETS_OVER;

    return (
        <div className="relative w-full">
            <svg
                ref={svgRef}
                viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
                preserveAspectRatio="xMidYMid meet"
                className="w-full touch-none select-none"
                role="img"
                aria-label="날짜별 사용자 유입 라인 차트"
                onPointerMove={handlePointer}
                onPointerDown={handlePointer}
                onPointerLeave={() => setActiveIndex(null)}
            >
                <defs>
                    <linearGradient id="signup-area-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={ACCENT} stopOpacity="0.35" />
                        <stop offset="55%" stopColor={ACCENT} stopOpacity="0.10" />
                        <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* y축 그리드 + 라벨 */}
                {yTickValueList.map((tickValue) => {
                    const y = scaleY(tickValue);
                    return (
                        <g key={`y-${tickValue}`}>
                            <line
                                x1={PAD.left}
                                y1={y}
                                x2={VB_WIDTH - PAD.right}
                                y2={y}
                                stroke="rgba(255,255,255,0.08)"
                                strokeDasharray="3 4"
                            />
                            <text
                                x={PAD.left - 10}
                                y={y}
                                textAnchor="end"
                                dominantBaseline="middle"
                                fill="#71717a"
                                fontSize="13"
                            >
                                {tickValue}
                            </text>
                        </g>
                    );
                })}

                {/* x축 라벨(MM-DD로 축약, 전체 날짜는 툴팁) */}
                {xTickIndexList.map((index) => (
                    <text
                        key={`x-${index}`}
                        x={scaleX(index)}
                        y={VB_HEIGHT - PAD.bottom + 22}
                        textAnchor="middle"
                        fill="#71717a"
                        fontSize="13"
                    >
                        {pointList[index].label.slice(5)}
                    </text>
                ))}

                {/* 면적 채움 */}
                {areaPath && <path d={areaPath} fill="url(#signup-area-gradient)" />}

                {/* 라인 */}
                {pointCount >= 2 && (
                    <path
                        ref={lineRef}
                        d={linePath}
                        fill="none"
                        stroke={ACCENT}
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    />
                )}

                {/* 포인트(점 수가 적을 때만) */}
                {showBullets &&
                    pointList.map((p, i) => (
                        <circle
                            key={`pt-${i}`}
                            cx={scaleX(i)}
                            cy={scaleY(p.value)}
                            r={pointCount === 1 ? 4 : 2.5}
                            fill="#0d0d0f"
                            stroke={ACCENT}
                            strokeWidth="1.5"
                        />
                    ))}

                {/* 호버 크로스헤어 + 강조 점 */}
                {activePoint && (
                    <g pointerEvents="none">
                        <line
                            x1={scaleX(activeIndex!)}
                            y1={PAD.top}
                            x2={scaleX(activeIndex!)}
                            y2={PAD.top + PLOT_H}
                            stroke="rgba(255,255,255,0.25)"
                            strokeDasharray="3 3"
                        />
                        <circle
                            cx={scaleX(activeIndex!)}
                            cy={scaleY(activePoint.value)}
                            r="4.5"
                            fill={ACCENT}
                            stroke="#0d0d0f"
                            strokeWidth="2"
                        />
                    </g>
                )}
            </svg>

            {/* 툴팁(HTML — 정밀 값) */}
            {activePoint && (
                <div
                    className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[120%] whitespace-nowrap rounded-lg border border-white/12 bg-[#1a1b20] px-3 py-1.5 text-xs shadow-lg"
                    style={{
                        left: `${Math.min(92, Math.max(8, activeLeftPercent))}%`,
                        top: `${activeTopPercent}%`,
                    }}
                >
                    <span className="block text-zinc-400">{activePoint.label}</span>
                    <span className="block font-semibold text-white">
                        {activePoint.value}
                        {valueUnit}
                    </span>
                </div>
            )}
        </div>
    );
};
