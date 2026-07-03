import architectureSrc from '@/assets/deck/architecture.webp';
import './technologySlide.css';

export function TechnologySlide() {
    return (
        <div className="pf-slide sl-technology">
            <div className="corner left">
                <span className="num">04</span><span className="sep">•</span><span>Technology</span>
            </div>
            <div className="corner right"><span className="pg">10</span></div>

            <div className="head">
                <div className="eyebrow"><span className="bar" />Infra Architecture</div>
                <h1 className="headline">Passfolio AWS Infrastructure Diagram</h1>
            </div>

            <div className="diagram">
                <img src={architectureSrc} alt="Passfolio infrastructure architecture diagram" loading="lazy" />
            </div>

            <div className="summary">
                <div className="sys">
                    <div className="sys-h"><span className="nm">FE</span><span className="rl">React + Vite</span><span className="tt">Cloudflare</span></div>
                    <ul>
                        <li>GitHub 로그인 → 저장소 분석 · 포트폴리오/자소서 생성 · 학습 로드맵 UI를 제공하는 진입 SPA</li>
                        <li><b>Cloudflare</b>(DNS·WAF·CDN) + <b>Pages</b> 정적 호스팅, git 연동 자동 빌드/배포</li>
                        <li>분석 시작 후 <b>SSE(EventSource)</b>로 저장소별 진행률·상태 실시간 표시</li>
                        <li><b>React Flow</b> 로드맵 · <b>Tiptap</b> 에디터 · PDF는 <b>S3 멀티파트</b> 업로드</li>
                    </ul>
                </div>
                <div className="sys">
                    <div className="sys-h"><span className="nm">BE</span><span className="rl">Spring Boot · 오케스트레이션 허브</span><span className="tt">EC2 public</span></div>
                    <ul>
                        <li>모든 비동기 작업의 디스패치/집계 허브. <b>GitHub OAuth2 + JWT</b>, 토큰은 <b>AES(Redis)+KMS</b> 이중 봉투암호화</li>
                        <li>분석 요청 → <b>SQS</b> 디스패치(precheck·analysis), Lambda <b>웹훅</b>으로 결과 수신·배치 집계</li>
                        <li><b>NONSTOP</b>: 배치 전건 성공 시 <b>FastAPI</b>로 포트폴리오/로드맵 자동 핷드오프(private 내부호출)</li>
                        <li><b>Redis</b>(Redisson 분산락·레이트리밋)·Caffeine L1 캐시, <b>SSE</b> 진행 알림, <b>Solapi</b> SMS·메일</li>
                    </ul>
                </div>
                <div className="sys">
                    <div className="sys-h"><span className="nm">ProjectAnalysis AI</span><span className="rl">DevSkill · 저장소 분석 워커</span><span className="tt">AWS Lambda</span></div>
                    <ul>
                        <li>GitHub 프로젝트를 분석해 기여도·기술스택·핵심 성과 리포트(JSON) 생성. SQS 트리거 컨테이너 Lambda, KMS 토큰 복호 후 full clone</li>
                        <li><b>p0–p9 파이프라인</b>: clone → 기여자 식별 → 파일 선별 → <b>Gemini</b> 분석 → 자가검증 → 최종 JSON</li>
                        <li><b>DynamoDB</b> LLM 레이트리밋, 결과는 <b>S3(CDN)</b> + Spring 웹훅 + <b>Discord</b> 알림. S3 멀멱 멱등·429/503 SQS 재시도</li>
                    </ul>
                </div>
                <div className="sys">
                    <div className="sys-h"><span className="nm">Portfolio-AI</span><span className="rl">FastAPI · 문서 생성·로드맵 평가 (협업 타팀)</span><span className="tt">EC2 private</span></div>
                    <ul>
                        <li>분석 결과·업로드 문서로 <b>포트폴리오/자소서 PDF·학습 로드맵</b> 생성. BE <b>내부호출 전용</b>(X-INTERNAL-API-KEY), 비동기 job + <b>SSE</b> 스트리밍</li>
                        <li><b>RAG</b>: Upstage/docling 파싱 → <b>BM25(kiwipiepy)+pgvector RRF</b> 검색 → <b>Gemini</b> 개선·평가. 로드맵은 분석 JSON 다건으로 역할별 스킬레벨·커버리지 산출</li>
                        <li>산출 PDF는 <b>S3</b> 업로드, 완료 시 BE 웹훅(/ai/jobs/complete · /ai/roadmap/complete)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
