import type { SlideProps } from './index';
import './purposeESlide.css';

export function PurposeESlide({ isActive }: SlideProps) {
    return (
        <div className={`pf-slide sl-purpose-e${isActive ? '' : ' is-loading'}`}>
            <div className="corner left">
                <span className="num">02</span><span className="sep">·</span><span>Purpose</span>
            </div>
            <div className="corner right">
                <span className="pg">08</span>
            </div>

            <div className="head">
                <div className="eyebrow">
                    <span className="bar" />
                    Competitive Gap
                </div>
                <h1 className="headline">
                    기존 서비스로는 채워지지 않는 <span className="accent">공백</span>
                </h1>
                <p className="sub">
                    구직자들은 이미 AI를 쓰지만, <b>‘개발자 포트폴리오 내용’</b>에 특화된 서비스는 없습니다.
                </p>
            </div>

            <div className="cards">
                <div className="card">
                    <div className="card-top">
                        <div className="cname">CareerNote</div>
                        <span className="asis">As-is</span>
                    </div>
                    <div className="capproach">포트폴리오 <b style={{ color: 'var(--text-primary)', fontWeight: 600 }}>교정</b> 위주의 첨삭 서비스</div>
                    <div className="clist">
                        <div className="citem"><span className="dash">•</span><span className="ctext">프로젝트 내용 분석 부재</span></div>
                        <div className="citem"><span className="dash">•</span><span className="ctext">개선 피드백 기능 없음</span></div>
                        <div className="citem"><span className="dash">•</span><span className="ctext">실제 적용 결과 품질이 아쉬움</span></div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-top">
                        <div className="cname">Git 기반 포폴 생성기</div>
                        <span className="asis">As-is</span>
                    </div>
                    <div className="capproach">git 메타데이터 기반의 <b style={{ color: 'var(--text-primary)', fontWeight: 600 }}>디자인·템플릿</b> 중심</div>
                    <div className="clist">
                        <div className="citem"><span className="dash">•</span><span className="ctext">포트폴리오 내용 구체화 불가</span></div>
                        <div className="citem"><span className="dash">•</span><span className="ctext">기여도 · 성과 근거 미제공</span></div>
                        <div className="citem"><span className="dash">•</span><span className="ctext">템플릿 외 차별화 어려움</span></div>
                    </div>
                </div>
            </div>

            <div className="conclusion">
                <span className="arrow">→</span>
                <span className="txt">개발자 포트폴리오에 특화된, <b>‘내용 중심’ 서비스의 공백</b></span>
            </div>
        </div>
    );
}
