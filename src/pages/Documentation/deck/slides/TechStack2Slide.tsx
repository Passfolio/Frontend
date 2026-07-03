import type { SlideProps } from './index';
import './techStack2Slide.css';

export function TechStack2Slide({ isActive }: SlideProps) {
    return (
        <div className={`pf-slide sl-tech-stack-2${isActive ? '' : ' is-loading'}`}>
            <div className="corner left">
                <span className="num">04</span><span className="sep">•</span><span>Technology</span>
            </div>
            <div className="corner right"><span className="pg">12</span></div>

            <div className="head">
                <div className="eyebrow"><span className="bar" />Tech Stack</div>
                <h1 className="headline">분석과 생성을 담당하는 <span className="accent">AI 파이프라인 스택</span></h1>
            </div>

            <div className="cols">
                {/* Project Analysis AI (DevSkill) */}
                <div className="sys">
                    <div className="sys-head">
                        <span className="sys-name">Project Analysis AI</span>
                        <span className="sys-role">Lambda Worker</span>
                        <span className="sys-lang">Python 3.12</span>
                    </div>
                    <div className="rows">
                        <div className="srow"><div className="k">AI · LLM</div><div className="chips">
                            <span className="chip lead">Google Gemini</span>
                        </div></div>
                        <div className="srow"><div className="k">Pipeline</div><div className="chips">
                            <span className="chip">Git CLI</span>
                        </div></div>
                        <div className="srow"><div className="k">Libraries</div><div className="chips">
                            <span className="chip">cryptography</span><span className="chip">tenacity</span><span className="chip">rapidfuzz</span><span className="chip">structlog</span><span className="chip">boto3</span>
                        </div></div>
                        <div className="srow"><div className="k">DB · State</div><div className="chips">
                            <span className="chip lead">DynamoDB</span>
                        </div></div>
                        <div className="srow"><div className="k">Infra · Cloud</div><div className="chips">
                            <span className="chip lead">AWS Lambda</span><span className="chip">ECR</span><span className="chip">SQS</span><span className="chip">S3</span><span className="chip">KMS</span><span className="chip">CloudWatch</span>
                        </div></div>
                        <div className="srow"><div className="k">IaC · CI/CD</div><div className="chips">
                            <span className="chip">Terraform</span><span className="chip">Docker</span>
                        </div></div>
                    </div>
                </div>

                {/* Portfolio AI (FastAPI) */}
                <div className="sys">
                    <div className="sys-head">
                        <span className="sys-name">Portfolio AI</span>
                        <span className="sys-role">FastAPI</span>
                        <span className="sys-lang">Python · FastAPI 0.136</span>
                    </div>
                    <div className="rows">
                        <div className="srow"><div className="k">Framework</div><div className="chips">
                            <span className="chip lead">FastAPI</span><span className="chip">Uvicorn · ASGI</span><span className="chip">Pydantic 2</span>
                        </div></div>
                        <div className="srow"><div className="k">AI · LLM</div><div className="chips">
                            <span className="chip lead">Google Gemini</span>
                        </div></div>
                        <div className="srow"><div className="k">NLP · Search</div><div className="chips">
                            <span className="chip">kiwipiepy</span><span className="chip lead">BM25</span><span className="chip">numpy</span>
                        </div></div>
                        <div className="srow"><div className="k">Document</div><div className="chips">
                            <span className="chip">Docling</span><span className="chip">fpdf2</span>
                        </div></div>
                        <div className="srow"><div className="k">DB · Streaming</div><div className="chips">
                            <span className="chip lead">PostgreSQL</span><span className="chip">pg8000</span><span className="chip">httpx</span><span className="chip">sse-starlette</span>
                        </div></div>
                        <div className="srow"><div className="k">Infra · CI/CD</div><div className="chips">
                            <span className="chip">EC2</span><span className="chip">S3</span><span className="chip">GitHub Actions</span><span className="chip">Docker</span>
                        </div></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
