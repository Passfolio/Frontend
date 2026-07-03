import crumpledWoodSrc from '@/assets/deck/crumpled-wood.webp';
import type { SlideProps } from './index';
import './purposeDSlide.css';

const BAR_ITEMS = [
    { label: '내용 · 성과를 논리적으로 정리하기', val: '57.5%', pct: 100, lead: true },
    { label: '사용 기술 스택 · 기여도 명확히 나열하기', val: '52.5%', pct: 91, lead: true },
    { label: '성과를 정량적(수치화)으로 표현하기', val: '40%', pct: 70, lead: false },
    { label: '포트폴리오 디자인 / 레이아웃 구성', val: '30%', pct: 52, lead: false },
    { label: '업데이트 · 유지보수', val: '22.5%', pct: 39, lead: false },
];

export function PurposeDSlide({ isActive }: SlideProps) {
    return (
        <div className={`pf-slide sl-purpose-d${isActive ? '' : ' is-loading'}`}>
            <div className="corner left">
                <span className="num">02</span>
                <span className="sep">·</span>
                <span>Purpose</span>
            </div>
            <div className="corner right">
                <span className="pg">07</span>
            </div>

            <div className="head">
                <div className="eyebrow">
                    <span className="bar" />
                    The Real Gap
                </div>
                <h1 className="headline">
                    정작, 포트폴리오 만들기는 <span className="accent">막막하다</span>
                </h1>
                <p className="sub">
                    중요성은 커졌지만, 취업 준비 개발자들은 <b>'어떻게 만들어야 할지'</b>에서 가장 크게
                    막힙니다.
                </p>
            </div>

            <div className="grid">
                <div className="left">
                    <div className="panel-label">
                        포트폴리오 작성 시 <b>가장 어려운 점</b> (복수 응답)
                    </div>
                    <div className="bars">
                        {BAR_ITEMS.map((item) => (
                            <div className={`bitem${item.lead ? ' lead' : ''}`} key={item.label}>
                                <div className="blabel">{item.label}</div>
                                <div className="bval">{item.val}</div>
                                <div className="track">
                                    <div className="fill" style={{ width: `${item.pct}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="photo-wrap">
                    <div className="photo" style={{ backgroundImage: `url(${crumpledWoodSrc})` }} />
                </div>
            </div>

            <div className="takeaway">
                <span className="mk">INSIGHT</span>
                <span className="ln" />
                <span className="txt">
                    어려움의 본질은 <b>'디자인'이 아니라 '내용 구조화'</b>입니다.
                </span>
                <span className="src">자체 설문 · 명지대 IT 구직자 40명, 복수 응답</span>
            </div>
        </div>
    );
}
