import logoSrc from '@/assets/deck/passfolio-logo-cropped.svg';
import type { SlideProps } from './index';
import './serviceIntroSlide.css';

export function ServiceIntroSlide({ isActive }: SlideProps) {
    return (
        <div className={`pf-slide sl-service-intro${isActive ? '' : ' is-loading'}`}>
            <div className="corner left">
                <span className="num">03</span><span className="sep">•</span><span>SERVICE INTRODUCTION</span>
            </div>
            <div className="corner right">
                <span className="pg">09</span>
            </div>

            <div className="brand-col">
                <div className="intro">
                    <div className="lockup">
                        <img src={logoSrc} alt="" loading="lazy" />
                        <span className="wm">Passfolio</span>
                    </div>
                </div>
                <div className="etym">
                    <div className="term t1">
                        <span className="en">Pass</span>
                        <span className="ko">합격</span>
                    </div>
                    <span className="plus">+</span>
                    <div className="term t2">
                        <span className="en">Portfolio</span>
                        <span className="ko">포트폴리오</span>
                    </div>
                </div>

                <div className="synth">
                    <div className="row">
                        <span className="result">합격하는 포트폴리오</span>
                    </div>
                    <p className="stmt">이름 그대로, 합격으로 이어지는 포트폴리오의 방향성을 제시합니다.</p>
                </div>
            </div>

            <div className="content">
                <div className="intro">
                    <div className="eyebrow">
                        <span className="bar" />
                        Service
                    </div>
                    <h1 className="headline">
                        프로젝트 경험을,<br /><span className="accent">증명 가능한 포트폴리오로</span>
                    </h1>
                    <p className="sub">
                        Passfolio는 개발자 취업 준비생의 <b>GitHub 프로젝트를 분석</b>하고,<br />
                        이를 토대로 기존 포트폴리오를 <b>개선</b> 및 새로운 포트폴리오의 <b>방향성을 설계</b>해주는 서비스입니다.
                    </p>
                </div>

                <div className="feat-strip">
                    <div className="fitem"><span className="fn">01</span><span className="ft">포트폴리오 개선 · 설계</span><span className="fd">기존 개선 + 새 방향 설계</span></div>
                    <div className="fitem"><span className="fn">02</span><span className="ft">프로젝트 분석</span><span className="fd">GitHub 코드 기여 · 성과 추출</span></div>
                    <div className="fitem"><span className="fn">03</span><span className="ft">성장 로드맵</span><span className="fd">채용 시장 기준 학습 경로</span></div>
                    <div className="fitem ext"><span className="fn">+</span><span className="ft">자기소개서</span><span className="fd">포트폴리오와 상호 변환</span><span className="tag">확장</span></div>
                </div>
            </div>
        </div>
    );
}
