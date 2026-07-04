import { DECK_ASSETS } from '../deckAssets';
import './portfolioWorkflowSlide.css';

const workflowSrc = DECK_ASSETS.portfolioWorkflowSrc;

export function PortfolioWorkflowSlide() {
    return (
        <div className="pf-slide sl-portfolio-workflow">
            <div className="corner left">
                <span className="num">04</span><span className="sep">•</span><span>Technology</span>
            </div>
            <div className="corner right"><span className="pg">14</span></div>

            <div className="head">
                <div className="eyebrow"><span className="bar" />Portfolio Generation Workflow</div>
                <h1 className="headline">분석 결과를 <span className="accent">합격 포트폴리오로 생성하는 파이프라인</span></h1>
            </div>

            <div className="diagram">
                <img src={workflowSrc} alt="Passfolio portfolio generation workflow diagram" />
            </div>

            <div className="flow">
                <div className="step"><div className="n">01</div><div className="bd">
                    <div className="tl"><span className="kr">입력 수신</span><span className="en">Ingest</span></div>
                    <div className="ds">Spring Boot <b>Web Hook</b> 수신 → FastAPI가 S3에서 PDF 다운로드, 분석 대상 입력(자소서·포트폴리오) 구성</div>
                </div></div>
                <div className="step"><div className="n">02</div><div className="bd">
                    <div className="tl"><span className="kr">문서 파싱</span><span className="en">Parse</span></div>
                    <div className="ds"><b>Docling</b> 자소서 파싱, <b>Upstage OCR</b> 포트폴리오 파싱, <b>Gemini Vision</b>으로 이미지·다이어그램 캐션 생성</div>
                </div></div>
                <div className="step"><div className="n">03</div><div className="bd">
                    <div className="tl"><span className="kr">청킹·메타 추출</span><span className="en">Extract</span></div>
                    <div className="ds">자소서 <b>문항 단위</b>·포트폴리오 <b>프로젝트/섹션 단위</b> 분리, 기술스택·역할·성과·키워드 메타데이터 추출</div>
                </div></div>
                <div className="step"><div className="n">04</div><div className="bd">
                    <div className="tl"><span className="kr">로드맵 생성</span><span className="en">Roadmap</span></div>
                    <div className="ds">분석 JSON Fetch → <b>직무/역할 판별</b>, Roadmap <b>Ontology 매핑</b>, Covered/Partial/Uncovered 분류, 시장 데이터 우선순위 반영</div>
                </div></div>
                <div className="step"><div className="n">05</div><div className="bd">
                    <div className="tl"><span className="kr">하이브리드 검색</span><span className="en">Retrieve</span></div>
                    <div className="ds">BM25(Kiwi 형태소) + Gemini Embedding·PgVector 유사도 검색을 RRF Fusion(k=60)으로 융합해 Top-K 레퍼런스 선별</div>
                </div></div>
                <div className="step"><div className="n">06</div><div className="bd">
                    <div className="tl"><span className="kr">생성</span><span className="en">Generate</span></div>
                    <div className="ds">검색 컨텍스트·레퍼런스 기반으로 자소서 ↔ 포트폴리오 <b>상호 생성·개선</b> (STAR 구조, 1인칭·수치 성과 강조)</div>
                </div></div>
                <div className="step"><div className="n">07</div><div className="bd">
                    <div className="tl"><span className="kr">평가</span><span className="en">Evaluate</span></div>
                    <div className="ds">항목별 <b>가중 평가</b>(과정·기여도·성과·품질·직무연관)로 개선 <b>전/후 점수</b>와 항목별 <b>Delta</b> 계산</div>
                </div></div>
                <div className="step"><div className="n">08</div><div className="bd">
                    <div className="tl"><span className="kr">정제·마무리</span><span className="en">Finalize</span></div>
                    <div className="ds"><b>Output Generator</b>가 결과 <b>PDF·JSON</b> 생성 → <b>S3 업로드</b> + Spring Boot <b>Web Hook</b> 통보</div>
                </div></div>
            </div>
        </div>
    );
}
