import logoSrc from '@/assets/deck/passfolio-logo-cropped.svg';
import type { SlideProps } from './index';
import './purposeCSlide.css';

export function PurposeCSlide({ isActive }: SlideProps) {
    return (
        <div className={`pf-slide sl-purpose-c${isActive ? '' : ' is-loading'}`}>
            <div className="corner left">
                <span className="num">02</span><span className="sep">·</span><span>Purpose</span>
            </div>
            <div className="corner right">
                <span className="pg">06</span>
            </div>

            <div className="head">
                <div className="eyebrow">
                    <span className="bar" />
                    Why Portfolio
                </div>
                <h1 className="headline">
                    그래서, 더 중요해진 <span className="accent">‘포트폴리오’</span>
                </h1>
                <p className="sub">
                    AI로 채용 방식이 바뀌면서, 기업은 단순 코딩 능력이 아닌 <b>‘증명된 실력’</b>을 봅니다.
                    기술 인터뷰 · 포트폴리오 평가 · AI 활용 능력 테스트를 강화하며 평가의 기준이 달라지고 있습니다.
                </p>
            </div>

            <div className="pillars">
                <div className="pillar">
                    <span className="idx">01</span>
                    <div className="ptitle">기술 인터뷰</div>
                    <div className="pdesc">실무형 문제 해결 능력을<br />직접 검증</div>
                    <div className="rule" />
                    <div className="pfoot">Live Coding · System Design</div>
                </div>

                <div className="pillar featured">
                    <span className="idx">02</span>
                    <span className="badge">
                        <img src={logoSrc} alt="" loading="lazy" />
                        <span className="bt">Passfolio</span>
                    </span>
                    <div className="ptitle">포트폴리오 평가</div>
                    <div className="pdesc">프로젝트 기여와 성과를<br />객관적 근거로 증명</div>
                    <div className="rule" />
                    <div className="pfoot">Contribution · Impact Proof</div>
                </div>

                <div className="pillar">
                    <span className="idx">03</span>
                    <div className="ptitle">AI 활용 검증</div>
                    <div className="pdesc">컨텍스트/하네스 엔지니어링 역량 테스트</div>
                    <div className="rule" />
                    <div className="pfoot">Prompt · AI Collaboration</div>
                </div>
            </div>

            <div className="takeaway">
                <span className="mk">INSIGHT</span>
                <span className="ln" />
                <span className="txt">채용 평가의 무게중심이 <b>‘스펙’에서 ‘포트폴리오 · 실증’</b>으로 이동하고 있습니다.</span>
                <span className="src">소프트웨어정책연구소 (SPRi)</span>
            </div>
        </div>
    );
}
