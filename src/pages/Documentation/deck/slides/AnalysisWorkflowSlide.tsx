import { DECK_ASSETS } from '../deckAssets';
import './analysisWorkflowSlide.css';

const workflowSrc = DECK_ASSETS.analysisWorkflowSrc;

export function AnalysisWorkflowSlide() {
    return (
        <div className="pf-slide sl-analysis-workflow">
            <div className="corner left">
                <span className="num">04</span><span className="sep">•</span><span>Technology</span>
            </div>
            <div className="corner right"><span className="pg">13</span></div>

            <div className="head">
                <div className="eyebrow"><span className="bar" />Project Analysis Workflow</div>
                <h1 className="headline">GitHub 저장소를 <span className="accent">분석 리포트로 바꾸는 파이프라인</span></h1>
            </div>

            <div className="diagram">
                <img src={workflowSrc} alt="Passfolio project analysis workflow diagram" />
            </div>

            <div className="flow">
                <div className="step">
                    <div className="n">01</div>
                    <div className="bd">
                        <div className="tl"><span className="kr">파일 선별</span><span className="en">Select</span></div>
                        <div className="ds"><b>GitHub Clone</b> 후 Commit Log·기여자·핵심 코드·설정 파일을 분석 대상으로 선별</div>
                    </div>
                </div>
                <div className="step">
                    <div className="n">02</div>
                    <div className="bd">
                        <div className="tl"><span className="kr">코드 압축</span><span className="en">Compress</span></div>
                        <div className="ds">파일 간 <b>Dependency Graph</b> 구축, imports·주석 제거와 whitespace 최적화로 코드를 압축</div>
                    </div>
                </div>
                <div className="step">
                    <div className="n">03</div>
                    <div className="bd">
                        <div className="tl"><span className="kr">전체 컨텍스트 생성</span><span className="en">Contextualize</span></div>
                        <div className="ds">Class·Method 시그니처만 추출, Dependency Graph와 시그니처 기반으로 코드를 서술형으로 변환해 프로젝트 전체 컨텍스트 구성</div>
                    </div>
                </div>
                <div className="step">
                    <div className="n">04</div>
                    <div className="bd">
                        <div className="tl"><span className="kr">그룹핑·패키징</span><span className="en">Group</span></div>
                        <div className="ds">압축 파일·Graph로 의미론적 Group 생성, 토큰 계산 후 소규모 Group들은 병합해 패키징</div>
                    </div>
                </div>
                <div className="step">
                    <div className="n">05</div>
                    <div className="bd">
                        <div className="tl"><span className="kr">병렬 분석</span><span className="en">Analyze</span></div>
                        <div className="ds">Group·Graph·전체 컨텍스트·Ontology를 <b>병렬 LLM</b>에 투입 → 핵심 기능/성과·피드백·기여자 성과 도출</div>
                    </div>
                </div>
                <div className="step">
                    <div className="n">06</div>
                    <div className="bd">
                        <div className="tl"><span className="kr">정제·마무리</span><span className="en">Finalize</span></div>
                        <div className="ds"><b>Advancer</b>가 결과 병합·품질 검증·정제 → 기여도 계산·최종 병합 → <b>S3 업로드 + Spring Boot Web Hook</b></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
