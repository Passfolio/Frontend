import { DECK_ASSETS } from '../deckAssets';
import type { SlideProps } from './index';
import './coverSlide.css';

const logoSrc = DECK_ASSETS.logoSrc;

export function CoverSlide({ isActive }: SlideProps) {
    return (
        <div className={`pf-slide sl-cover${isActive ? ' sheen-go' : ' is-loading'}`}>
            <div className="hero-glow" />
            <div className="floor-fade" />

            <div className="corner left">
                <span>Introduction</span>
            </div>
            <div className="corner right">
                <span>
                    Team <span className="team-accent">20세기's</span>
                </span>
            </div>

            <div className="hero">
                <div className="lockup">
                    <img className="logo-mark" src={logoSrc} alt="Passfolio logo" />
                    <h1 className="wordmark">Passfolio</h1>
                </div>
                <div className="subtitle">Capstone Design Final Presentation</div>
                <div className="credits">
                    <span className="crl">PPT</span>
                    <span className="crn">김태현</span>
                    <span className="crd">·</span>
                    <span className="crl">Presenter</span>
                    <span className="crn">박준우</span>
                </div>
            </div>

            <div className="members">
                <div className="members-head">
                    <span className="label">Members</span>
                    <span className="line" />
                </div>
                <div className="members-row">
                    <div className="member">
                        <div className="member-name">
                            <span className="name">이상빈</span>
                            <span className="role-tag">LEADER</span>
                        </div>
                        <div className="chips">
                            <span className="chip">포트폴리오 AI</span>
                            <span className="chip">문서화</span>
                        </div>
                    </div>
                    <div className="member">
                        <div className="member-name">
                            <span className="name">김태현</span>
                        </div>
                        <div className="chips">
                            <span className="chip">풀스택</span>
                            <span className="chip">프로젝트 분석 AI</span>
                            <span className="chip">인프라</span>
                        </div>
                    </div>
                    <div className="member">
                        <div className="member-name">
                            <span className="name">박준우</span>
                        </div>
                        <div className="chips">
                            <span className="chip">프론트엔드</span>
                            <span className="chip">포트폴리오 AI</span>
                        </div>
                    </div>
                    <div className="member">
                        <div className="member-name">
                            <span className="name">송성호</span>
                        </div>
                        <div className="chips">
                            <span className="chip">백엔드</span>
                            <span className="chip">포트폴리오 AI</span>
                            <span className="chip">인프라</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
