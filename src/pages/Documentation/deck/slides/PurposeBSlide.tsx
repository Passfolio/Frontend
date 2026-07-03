import type { SlideProps } from './index';
import './purposeBSlide.css';

export function PurposeBSlide({ isActive }: SlideProps) {
    return (
        <div className={`pf-slide sl-purpose-b${isActive ? '' : ' is-loading'}`}>
            <div className="corner left">
                <span className="num">02</span>
                <span className="sep">·</span>
                <span>Purpose</span>
            </div>
            <div className="corner right">
                <span className="pg">05</span>
            </div>

            <div className="grid">
                <div className="left">
                    <div className="eyebrow">
                        <span className="bar" />
                        Market Survey
                    </div>
                    <h1 className="headline">
                        취업의 문턱은
                        <br />
                        <span className="accent">눈에 띄게 높아졌다</span>
                    </h1>
                    <p className="sub">
                        Z세대 10명 중 9명이 <b>"과거보다 취업 조건이 까다로워졌다"</b>고 답했습니다.
                        높아진 취업 문턱은 도전을 포기하게 만들고, 노동시장을 이탈하는{' '}
                        <b>'쉬었음' 청년 증가</b>로 이어지고 있습니다.
                    </p>
                    <div className="meta">
                        <div className="meta-row">
                            <span className="k">Respondents</span>
                            <span className="v">
                                Z세대 <b>342명</b> · 20대 89% · 30대 11%
                            </span>
                        </div>
                        <div className="meta-row">
                            <span className="k">Conducted</span>
                            <span className="v">
                                <b>매경이코노미</b> × 채용플랫폼 <b>캐치</b>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-q">
                        <span className="quote">Q.</span> 과거에 비해 취업 준비에 요구되는 조건은 어떻게
                        변했나요?
                    </div>

                    <div className="donut-row">
                        <div className="donut">
                            <svg viewBox="0 0 300 300">
                                <circle
                                    className="track"
                                    cx="150"
                                    cy="150"
                                    r="120"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.05)"
                                    strokeWidth="34"
                                />
                                <circle className="arc a1" cx="150" cy="150" r="120" fill="none" stroke="#ffffff" strokeWidth="34" strokeLinecap="butt" />
                                <circle className="arc a2" cx="150" cy="150" r="120" fill="none" stroke="rgba(255,255,255,0.46)" strokeWidth="34" />
                                <circle className="arc a3" cx="150" cy="150" r="120" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="34" />
                            </svg>
                            <div className="center">
                                <div className="pct" style={{ fontSize: 66, letterSpacing: 0 }}>
                                    92%
                                </div>
                                <div className="lab">까다로워졌다</div>
                            </div>
                        </div>

                        <div className="legend">
                            <div className="leg s1">
                                <span className="sw" />
                                <span className="name">훨씬 높아졌다</span>
                                <span className="num">60%</span>
                            </div>
                            <div className="leg s2">
                                <span className="sw" />
                                <span className="name">다소 높아졌다</span>
                                <span className="num">32%</span>
                            </div>
                            <div className="leg s3">
                                <span className="sw" />
                                <span className="name">변화 없음 · 기타</span>
                                <span className="num">8%</span>
                            </div>
                        </div>
                    </div>

                    <div className="support">
                        <div className="support-label">같은 기간, 채용 시장도 얼어붙었습니다</div>
                        <div className="support-grid">
                            <div className="sstat">
                                <span className="big">−45%</span>
                                <span className="desc">
                                    <b>대기업 정규직</b> 신입 채용 급감
                                </span>
                            </div>
                            <div className="sstat">
                                <span className="big">−73%</span>
                                <span className="desc">
                                    <b>IT · 통신 직군</b> 가장 큰 감소폭
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="source">자료 · 매경이코노미 × 캐치 설문(342명) · 진학사 캐치 HR 인사이트 서베이</div>
                </div>
            </div>
        </div>
    );
}
