import logoSrc from '@/assets/deck/passfolio-logo-cropped.svg';
import type { SlideProps } from './index';
import './contentsSlide.css';

const CONTENTS_ROWS = [
    { no: '01', name: 'Overview', tag: '개요' },
    { no: '02', name: 'Purpose', tag: '목적' },
    { no: '03', name: 'Service Introduction', tag: '서비스 소개' },
    { no: '04', name: 'Technology', tag: '기술' },
    { no: '05', name: 'Performance', tag: '성과' },
    { no: '06', name: 'Q&A', tag: '질문' },
];

export function ContentsSlide({ isActive }: SlideProps) {
    return (
        <div className={`pf-slide sl-contents${isActive ? '' : ' is-loading'}`}>
            <div className="corner left">
                <img className="logo-tiny" src={logoSrc} alt="Passfolio" />
                <span>Passfolio</span>
            </div>
            <div className="corner right">
                <span className="pg">02</span>
            </div>

            <div className="wrap">
                <div className="intro">
                    <div className="eyebrow">
                        <span className="bar" />
                        Index
                    </div>
                    <h1 className="title">CONTENTS</h1>
                    <div className="lead">What we'll cover</div>
                </div>

                <div className="list">
                    {CONTENTS_ROWS.map((row) => (
                        <div className="row" key={row.no}>
                            <div className="chip">
                                <span>{row.no}</span>
                            </div>
                            <div className="rname">{row.name}</div>
                            <div className="rtag">{row.tag}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
