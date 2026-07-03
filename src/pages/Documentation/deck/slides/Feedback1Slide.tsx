import type { SlideProps } from './index';
import './feedback1Slide.css';

export function Feedback1Slide({ isActive }: SlideProps) {
    return (
        <div className={`pf-slide sl-feedback-1${isActive ? '' : ' is-loading'}`}>
            <div className="corner left">
                <span className="num">05</span><span className="sep">•</span><span>Feedback</span>
            </div>
            <div className="corner right"><span className="pg">15</span></div>

            <div className="head">
                <h1 className="headline">개선 단계별 <span className="accent">포트폴리오 결과 비교</span></h1>
            </div>

            <div className="cols">
                <div className="col">
                    <div className="col-head"><span className="col-step">01</span><span className="col-title">개선 전 포트폴리오</span></div>
                    <div className="panel doc dense">
                        <div className="body">
                            <p className="lede">Deokive 프로젝트에서 대규모 조회 성능 병목을 해결하기 위해 <b>Redis 기반 ID/카운트 캐싱 아키텍처</b>를 설계하고, 커버링 인덱스를 결합해 딥페이징 환경의 디스크 I/O를 개선한 백엔드 개발자입니다.</p>
                            <p>SSE 실시간 알림의 <b>커넥션 누수</b>를 하트비트로 해결하고, 분산 환경 데이터 정합성을 위해 DB 제약조건을 활용하는 등 <b>인프라 비용 최적화와 시스템 안정성 확보</b>에 역량을 증명했습니다.</p>
                        </div>
                        <div className="blk">
                            <div className="sc-row"><span className="from">Total</span><span className="big">60.2</span><span className="delta flat">기준점 · baseline</span></div>
                            <div className="cats"><b>A.</b>과정 60 &nbsp; <b>B.</b>역할 75 &nbsp; <b>C.</b>성과 50 &nbsp; <b>D.</b>품질 20 &nbsp; <b>E.</b>직무 85</div>
                        </div>
                        <div className="blk supp">
                            <div className="blk-k">평가 요약</div>
                            기술·기능은 많지만 문제 상황·기술 선택 근거·성과가 분리되어 <span className="st">백엔드 설계 역량</span>이 직관적으로 드러나지 않음.
                        </div>
                    </div>
                </div>

                <div className="col">
                    <div className="col-head"><span className="col-step">02</span><span className="col-title">개선 후 포트폴리오 <span style={{ color: 'var(--text-tertiary)', fontWeight: 500, fontSize: '18px' }}>· 코드 미적용</span></span></div>
                    <div className="panel doc dense">
                        <div className="body">
                            <p className="lede">소셜 기록 플랫폼 ‘Deokive’에서 백엔드 시스템 설계 및 최적화를 담당했습니다.</p>
                            <p>대규모 조회 성능 병목 현상을 해결하기 위해 Redis 기반의 ID/카운트 캐싱 아키텍처를 설계하고, 커버링 인덱스를 도입하여 딥페이징 환경에서의 디스크 I/O 효율을 극대화했습니다. 특히 게시글 피드 조회 시 다양한 정렬 조건과 카테고리 분류가 요구되는 상황에서 쿼리 성능을 최적화하는 데 집중했습니다.</p>
                            <p>시스템 안정성 확보를 위해 SSE 프로토콜을 활용한 실시간 알림 시스템을 구현하는 과정에서 커넥션 누수 문제가 발생했습니다. 이를 하트비트 메커니즘을 도입하여 해결함으로써 안정적인 실시간 통신 환경을 구축했습니다. 또한 분산 환경에서 데이터 정합성을 유지하기 위해 DB 제약조건과 함께 Redisson 분산 락을 활용하여 동시성 이슈를 제어했습니다.</p>
                            <p>외부 SNS URL의 메타데이터 추출 기능을 구현할 때는 RabbitMQ를 통한 비동기 처리 구조를 설계하여 메인 트랜잭션의 부하를 분산했습니다. 결과적으로 대규모 트래픽 환경에서도 시스템 가용성을 유지하며 사용자 경험을 저해하는 지연 요소를 효과적으로 제거했습니다. 이러한 과정을 통해 기술적 의사결정 시 인프라 비용과 운영 효율성을 동시에 고려하는 설계 역량을 확보했습니다.</p>
                        </div>
                        <div className="blk">
                            <div className="blk-k">주요 변경사항</div>
                            <div className="chg">
                                <div>문제 상황(딥페이징 병목·커넥션 누수)과 기술적 조치를 인과관계로 재배치</div>
                                <div>추상적 기여도·라인 수를 삭제하고 설계 역량·트러블슈팅 경험 위주로 서술</div>
                                <div>성과를 ‘시스템 안정성·효율 개선’이라는 직무 기여 관점으로 재정리</div>
                            </div>
                        </div>
                        <div className="blk">
                            <div className="sc-row"><span className="from">60.2 →</span><span className="big">61.35</span><span className="delta pos">+1.15</span></div>
                            <div className="cats"><b>A.</b>과정 60→62 &nbsp; <b>B.</b>역할 75→75 &nbsp; <b>C.</b>성과 50→52 &nbsp; <b>D.</b>품질 20→20 &nbsp; <b>E.</b>직무 85→85</div>
                        </div>
                        <div className="blk supp">
                            <div className="blk-k">보완 요청 · 정량적 수치</div>
                            문제 해결 전후의 성능 개선 수치(ms 단축·쿼리 효율 개선률)가 부족 — 응답시간·처리량 지표를 추가. <span className="ex">예: 250ms→45ms, 최대 12,000 rps</span>
                        </div>
                    </div>
                </div>

                <div className="col final">
                    <div className="col-head"><span className="col-step">03</span><span className="col-title">코드 분석 + 개선 후 포트폴리오</span></div>
                    <div className="panel doc dense">
                        <div className="body">
                            <p className="lede">대규모 트래픽 환경에서 소셜 기록 플랫폼 ‘Deokive’의 백엔드 시스템을 설계했습니다. 핵심 과제는 데이터 읽기 비중이 높은 SNS 특성상 발생하는 DB 병목과 분산 환경에서의 정합성 유지였습니다.</p>
                            <span className="h">[딥페이징 및 조회 성능 최적화]</span>
                            <p>대규모 이미지 및 게시글 피드 조회 시 발생하는 OFFSET 페이징의 디스크 I/O 병목을 해결하고자 Redis 기반의 ID/카운트 캐싱 아키텍처를 도입했습니다. <span className="code">PaginationIdCacheService</span>를 활용해 정렬 조건에 맞는 ID 목록을 미리 캐싱하여 불필요한 풀 스캔을 방지하고 랜덤 I/O를 순차 I/O 수준으로 최적화했습니다. 또한, 게시글 상세 조회 시 댓글 수와 조회수 등 빈번한 핫 필드 조회를 최적화하기 위해 댓글 수 캐싱과 조회수 Write-Back 전략을 적용해 DB 부하를 분산했습니다.</p>
                            <span className="h">[고성능 동시성 처리 및 데이터 정합성]</span>
                            <p>좋아요와 같은 동시성 요청이 집중되는 기능에 Redis Lua 스크립트로 원자적 연산을 수행하고 RabbitMQ를 통한 비동기 쓰기 스로틀링을 도입하여 실시간 응답성을 극대화했습니다. 또한, 스티커 중복 등록 문제 해결을 위해 DB Unique 제약조건을 활용하여 애플리케이션 레벨의 락 비용을 제거하는 등 인프라 자원을 효율적으로 관리하며 데이터 무결성을 보장했습니다.</p>
                            <span className="h">[비동기 아키텍처 및 시스템 안정성]</span>
                            <p>외부 OG 메타데이터 추출 시 발생하는 네트워크 블로킹을 RabbitMQ 기반 비동기 이벤트 구조로 전환하고, SSE 알림 시스템에는 하트비트 메커니즘을 적용해 커넥션 누수 문제를 해결했습니다. 나아가 <span className="code">Spring Batch</span>의 Fault-Tolerant 설정을 통해 배치 작업의 회복탄력성을 확보하며 시스템 운영 효율을 높였습니다.</p>
                        </div>
                        <div className="blk">
                            <div className="blk-k">주요 변경사항</div>
                            <div className="chg">
                                <div>기술 나열식을 ‘문제 정의–기술 해결–성과’ 서사 구조로 변경</div>
                                <div><span className="ca">코드분석</span> Redis ID/카운트 캐싱 딥페이징 최적화 원리 추가</div>
                                <div><span className="ca">코드분석</span> Lua·RabbitMQ 좋아요 동시성 제어 로직 추가</div>
                                <div><span className="ca">코드분석</span> Write-Back 전략·배치 회복탄력성 사례 추가</div>
                                <div><span className="ca">코드분석</span> JPA @PrePersist 데이터 정규화·무결성 보장 포함</div>
                            </div>
                        </div>
                        <div className="blk">
                            <div className="sc-row"><span className="from">60.2 →</span><span className="big">77.8</span><span className="delta pos">+17.5</span></div>
                            <div className="cats"><b>A.</b>과정 60→85 &nbsp; <b>B.</b>역할 75→90 &nbsp; <b>C.</b>성과 50→70 &nbsp; <b>D.</b>품질 20→20 &nbsp; <b>E.</b>직무 85→95</div>
                        </div>
                        <div className="blk supp">
                            <div className="blk-k">보완 요청 · 정량적 성과</div>
                            기술 도입의 성능 향상 수치(응답시간 단축률·TPS 증가율)가 미명시 — 성능 테스트(k6·JMeter) 수치로 개선폭 작성. <span className="ex">예: 250ms→45ms, 최대 12,000 rps</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
