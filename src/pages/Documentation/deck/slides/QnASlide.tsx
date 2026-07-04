import { DECK_ASSETS } from '../deckAssets';
import type { SlideProps } from './index';
import './qnaSlide.css';

const logoSrc = DECK_ASSETS.logoSrc;

export function QnASlide({ isActive }: SlideProps) {
    return (
        <div className={`pf-slide sl-qna${isActive ? '' : ' is-loading'}`}>
            <div className="glow" />

            <div className="corner left">
                <img className="logo" src={logoSrc} alt="Passfolio" />
                <span>Passfolio</span>
            </div>
            <div className="corner right"><span>Thank You</span></div>

            <div className="center">
                <div className="qa">Q&A</div>
                <div className="sub"><span className="dash" /><span>Any Questions?</span><span className="dash" /></div>
            </div>
        </div>
    );
}
