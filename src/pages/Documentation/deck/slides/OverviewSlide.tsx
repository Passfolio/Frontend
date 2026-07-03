import thinkerSrc from '@/assets/deck/thinker.webp';
import type { SlideProps } from './index';
import './overviewSlide.css';

export function OverviewSlide({ isActive }: SlideProps) {
    return (
        <div className={`pf-slide sl-overview${isActive ? '' : ' is-loading'}`}>
            <div className="corner left">
                <span>01 • OVERVIEW</span>
            </div>
            <div className="corner right">
                <span className="pg">03</span>
            </div>

            <img className="thinker" src={thinkerSrc} alt="" loading="lazy" />

            <div className="content">
                <div className="eyebrow">MARKET PAIN</div>

                <h1 className="headline">
                    포트폴리오라는 벽 앞에 멈춰 선<br />
                    <span className="accent">개발자들의 취업 시장</span>
                </h1>

                <p className="sub">
                    직접 개발자 취업을 준비하면서 실력보다 <b>'포트폴리오를 잘 작성하는 일'</b>에
                    발목 잡히는 현실이 아쉬웠습니다. 실력 있는 개발자가 자신의 기술을
                    객관적으로 증명하도록 돕고자 <span className="brand">Passfolio</span>가 탄생했습니다.
                </p>

                <div className="survey">
                    <div className="survey-label">자체 설문 결과</div>
                    <div className="stats">
                        <div className="stat">
                            <div className="n">57.5%</div>
                            <div className="l">성과의 논리적 정리</div>
                        </div>
                        <div className="stat">
                            <div className="n">52.5%</div>
                            <div className="l">기술 기여도 명시</div>
                        </div>
                        <div className="stat">
                            <div className="n">20%</div>
                            <div className="l">포트폴리오 완성</div>
                        </div>
                    </div>
                    <div className="survey-cap">‘가장 어려운 항목’ 응답 비율 · 완성률 — 명지대 재학생 내 IT 구직자 40명 대상 자체 설문</div>
                </div>
            </div>
        </div>
    );
}
