import type { SlideProps } from './index';
import './techStack1Slide.css';

export function TechStack1Slide({ isActive }: SlideProps) {
    return (
        <div className={`pf-slide sl-tech-stack-1${isActive ? '' : ' is-loading'}`}>
            <div className="corner left">
                <span className="num">04</span><span className="sep">•</span><span>Technology</span>
            </div>
            <div className="corner right"><span className="pg">11</span></div>

            <div className="head">
                <div className="eyebrow"><span className="bar" />Tech Stack</div>
                <h1 className="headline">서비스를 구성하는 <span className="accent">클라이언트 · 백엔드 스택</span></h1>
            </div>

            <div className="cols">
                {/* Backend */}
                <div className="sys">
                    <div className="sys-head">
                        <span className="sys-name">Backend</span>
                        <span className="sys-role">Spring Boot</span>
                        <span className="sys-lang">Java 21</span>
                    </div>
                    <div className="rows">
                        <div className="srow"><div className="k">Framework</div><div className="chips">
                            <span className="chip lead">Spring Boot 3.5</span><span className="chip">Data JPA</span><span className="chip">QueryDSL</span>
                        </div></div>
                        <div className="srow"><div className="k">DB · Cache</div><div className="chips">
                            <span className="chip lead">PostgreSQL</span><span className="chip">Flyway</span><span className="chip lead">Redis</span><span className="chip">Redisson</span><span className="chip">Caffeine</span><span className="chip">Bucket4j</span>
                        </div></div>
                        <div className="srow"><div className="k">Auth · Security</div><div className="chips">
                            <span className="chip">Spring Security</span><span className="chip lead">OAuth2 · GitHub</span><span className="chip">JWT</span><span className="chip">AWS KMS</span>
                        </div></div>
                        <div className="srow"><div className="k">Infra · Async</div><div className="chips">
                            <span className="chip">EC2</span><span className="chip">S3</span><span className="chip">SQS</span><span className="chip">Step Functions</span><span className="chip">SSM</span>
                        </div></div>
                        <div className="srow"><div className="k">Observability</div><div className="chips">
                            <span className="chip">Actuator</span><span className="chip">Micrometer</span><span className="chip">Prometheus</span>
                        </div></div>
                        <div className="srow"><div className="k">CI / CD</div><div className="chips">
                            <span className="chip">GitHub Actions</span><span className="chip">SSM Deploy</span>
                        </div></div>
                    </div>
                </div>

                {/* Frontend */}
                <div className="sys">
                    <div className="sys-head">
                        <span className="sys-name">Frontend</span>
                        <span className="sys-role">React · Vite</span>
                        <span className="sys-lang">TypeScript 5.9</span>
                    </div>
                    <div className="rows">
                        <div className="srow"><div className="k">Framework</div><div className="chips">
                            <span className="chip lead">React 19</span><span className="chip lead">Vite 7</span>
                        </div></div>
                        <div className="srow"><div className="k">Styling · UI</div><div className="chips">
                            <span className="chip lead">TailwindCSS 4</span><span className="chip">Tiptap</span><span className="chip">React Flow</span><span className="chip">sharp</span>
                        </div></div>
                        <div className="srow"><div className="k">Routing · Data</div><div className="chips">
                            <span className="chip">react-router 7</span><span className="chip">axios</span><span className="chip">SSE · EventSource</span>
                        </div></div>
                        <div className="srow"><div className="k">Infra · Edge</div><div className="chips">
                            <span className="chip lead">Cloudflare</span><span className="chip">DNS · WAF</span><span className="chip">CDN · Edge</span>
                        </div></div>
                        <div className="srow"><div className="k">CI / CD</div><div className="chips">
                            <span className="chip">Cloudflare Pages</span>
                        </div></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
