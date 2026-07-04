import './performanceSlide.css';

const FEATS: { name: string; matched: boolean }[] = [
    { name: '갤러리 관리', matched: true },
    { name: '게시글 관리 API', matched: true },
    { name: '리포스트(스크랩) 관리 API', matched: true },
    { name: '사용자 관리', matched: false },
    { name: '스티커 관리', matched: false },
    { name: 'JWT 인증·토큰 갱신', matched: true },
    { name: '알림 관리', matched: true },
    { name: '티켓 관리', matched: true },
    { name: '멀티파트 업로드 관리', matched: true },
];

function FeatCheck() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#8ea2ff" strokeWidth="2.4">
            <circle cx="12" cy="12" r="9" />
            <path d="M8 12l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function PerformanceSlide() {
    return (
        <div className="pf-slide sl-performance">
            <div className="corner left">
                <span className="num">05</span><span className="sep">•</span><span>Performance</span>
            </div>
            <div className="corner right"><span className="pg">16</span></div>

            <div className="head">
                <div className="eyebrow"><span className="bar" />Project Analysis · Contribution</div>
                <h1 className="headline">나의 기여가 <span className="accent">핵심 기능과 성과로 이어지다</span></h1>
            </div>

            <div className="grid">
                <div className="contrib">
                    <div className="donut-wrap">
                        <div className="donut">
                            <svg viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
                                <circle cx="50" cy="50" r="42" fill="none" stroke="url(#pf-performance-donut-g)" strokeWidth="9" strokeLinecap="round"
                                    strokeDasharray="232.6 263.9" />
                                <defs><linearGradient id="pf-performance-donut-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ffffff" /><stop offset="100%" stopColor="#8ea2ff" /></linearGradient></defs>
                            </svg>
                            <div className="ctr"><span className="lab">내 기여도</span><span className="pct">88.1<small>%</small></span></div>
                        </div>
                        <div className="role">
                            <div className="role-name">백엔드 개발</div>
                            <div className="role-tag">Lead Backend Architect</div>
                        </div>
                    </div>
                    <p className="role-desc">
                        단순 기능 구현을 넘어 <b>대규모 트래픽 하의 동시성 제어·데이터 정합성·시스템 성능 최적화</b>를 주도했습니다.
                        <b>Redis Lua + RabbitMQ Write-Back</b>으로 동시성 병목을 해결하고, <b>Redisson 분산 락</b>과
                        <b>Bucket4j 분산 레이트 리미터</b>로 보안·회복탄력성을 확보했으며, 딥페이징·S3 멀티파트로 인프라 비용을 최적화했습니다.
                    </p>
                    <div className="scope">
                        <div className="blk-label">주요 기여 영역 <span className="cnt">11</span></div>
                        <div className="chips2">
                            <span className="c">갤러리 목록 조회 성능 최적화</span>
                            <span className="c">갤러리 이미지 등록 및 삭제 시 캐시 무효화 전략</span>
                            <span className="c">게시글 관리 API</span>
                            <span className="c">리포스트(스크랩) 관리 API</span>
                            <span className="c">게시글 좋아요 토글 하에서의 정합성·성능 동시 달성</span>
                            <span className="c">딥페이징 최적화 및 핫 스코어 기반 피드 조회</span>
                            <span className="c">JWT 기반 인증 및 토큰 갱신/블랙리스트 관리</span>
                            <span className="c">SSE 기반 실시간 알림 구독 및 발송</span>
                            <span className="c">티켓 목록 조회 성능 최적화</span>
                            <span className="c">티켓 생성 및 삭제 시 캐시 무효화 전략</span>
                            <span className="c">멀티파트 업로드 관리</span>
                        </div>
                    </div>
                    <div className="feats">
                        <div className="blk-label">핵심 기능 · Core Features <span className="cnt">9</span></div>
                        <div className="feat-grid">
                            {FEATS.map((feat) => (
                                <span className="feat" key={feat.name}>
                                    <FeatCheck />{feat.name}{feat.matched && <span className="fmatched">Matched</span>}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="map-col">
                    <div className="blk-label map-label">핵심 성과 및 문제 해결 · Core Performances <span className="cnt">10</span></div>
                    <div className="map">
                        <div className="acard"><div className="ahead"><span className="tag">갤러리 관리</span><span className="matched">Matched</span></div><div className="t">갤러리 목록 조회 성능 최적화</div><div className="d">대용량 데이터셋에서 RDBMS의 OFFSET 기반 페이징이 유발하는 성능 저하를 방지하기 위해, <span className="code">PaginationIdCacheService</span>를 도입하여 조회 대상 ID 목록을 캐싱하고, 실제 엔티티는 커버링 인덱스 기반의 IN 절 쿼리로 조회하여 디스크 랜덤 I/O를 최소화했습니다. 또한, <span className="code">PaginationCountCacheService</span>를 통해 불필요한 전체 카운트 쿼리 실행을 억제하고 캐싱함으로써 대규모 트래픽 하에서도 일관된 응답 지연 시간을 보장하도록 설계했습니다. (<span className="code">GalleryQueryRepository</span>)</div></div>
                        <div className="acard"><div className="ahead"><span className="tag">갤러리 관리</span><span className="matched">Matched</span></div><div className="t">갤러리 이미지 등록 및 삭제 시 캐시 무효화 전략</div><div className="d">조회 성능 극대화를 위한 캐싱 전략을 유지하면서도 데이터의 실시간 정합성을 보장하기 위해, 갤러리 이미지의 신규 등록 및 삭제 이벤트 발생 시점에 관련 캐시 영역을 정교하게 무효화(Evict) 처리함으로써 캐시 스탬피드 현상과 데이터 불일치 리스크를 방지했습니다. (<span className="code">GalleryService</span>)</div></div>
                        <div className="acard"><div className="ahead"><span className="tag">게시글 관리 API</span><span className="matched">Matched</span></div><div className="t">게시글 좋아요 토글 하에서의 정합성·성능 동시 달성</div><div className="d">동시성 요청이 집중되는 좋아요 토글 기능에서 RDBMS 비관적 락의 락 점유 지연 병목을 회피하기 위해, Redis Lua 스크립트를 활용한 원자적(Atomic) 카운트 연산으로 동시성 제어와 실시간 성능을 동시에 확보했습니다. 데이터베이스 쓰기 부하는 RabbitMQ를 통한 비동기 메시징(Write-Back)으로 스로틀링하여 완화하였으며, Redis 휘발성으로 인한 데이터 유실 리스크는 스케줄러 기반의 주기적 동기화 및 실패 이력 백필 메커니즘을 구축하여 데이터 정합성을 보장했습니다. (<span className="code">LikeRedisService</span>, <span className="code">LikeMessagePublisher</span>)</div></div>
                        <div className="acard"><div className="ahead"><span className="tag">게시글 관리 API</span><span className="matched">Matched</span></div><div className="t">딥페이징 최적화 및 핫 스코어 기반 피드 조회</div><div className="d">대량의 피드 조회 시 발생하는 성능 저하를 방지하기 위해 <span className="code">PaginationIdCacheService</span> 기반의 ID 캐싱 및 커버링 인덱스 쿼리를 적용하여 랜덤 I/O를 최적화했습니다. 또한, 실시간 연산 부하가 높은 핫 스코어(인기 피드) 산출 알고리즘을 실시간 쿼리 대신 <span className="code">HotScoreScheduler</span>를 통한 주기적 배치 연산 방식으로 전환하여 데이터베이스의 CPU 부하를 획기적으로 경감했습니다. (<span className="code">PostQueryRepository</span>, <span className="code">HotScoreScheduler</span>)</div></div>
                        <div className="acard"><div className="ahead"><span className="tag">JWT 기반 인증 및 토큰 갱신/블랙리스트 관리</span><span className="matched">Matched</span></div><div className="t">분산 환경에서의 안전한 토큰 갱신 및 보안 강화</div><div className="d">분산 환경에서 다중 요청으로 인해 발생할 수 있는 Refresh Token 중복 갱신(Race Condition) 문제를 해결하기 위해 Redisson 분산 락을 적용하여 동기화를 보장했습니다. 또한, 이미 사용된 토큰의 재사용을 탐지하는 블랙리스트 메커니즘과 네트워크 지연을 고려한 Grace Period 설정을 통해 토큰 탈취 시나리오에 대한 보안성을 극대화했습니다. (<span className="code">TokenService</span>, <span className="code">JwtAuthenticationFilter</span>)</div></div>
                        <div className="acard"><div className="ahead"><span className="tag">JWT 기반 인증 및 토큰 갱신/블랙리스트 관리</span><span className="matched">Matched</span></div><div className="t">분산 환경에서의 정교한 API 레이트 리밋 구현</div><div className="d">분산 노드 환경에서 일관된 처리율 제한을 적용하기 위해 Bucket4j와 Lettuce(Redis)를 결합한 분산 레이트 리미터를 구현했습니다. IP, 사용자 ID, 이메일 등 다각도의 식별 키를 기준으로 트래픽을 제어하며, Redis 장애 시 서비스 가용성을 보장하기 위한 Fail-Open/Fail-Closed 전환 아키텍처를 설계하여 시스템 신뢰성을 높였습니다. (<span className="code">RateLimitAspect</span>, <span className="code">Bucket4jConfig</span>)</div></div>
                        <div className="acard"><div className="ahead"><span className="tag">알림 관리</span><span className="matched">Matched</span></div><div className="t">SSE 기반 실시간 알림 구독 및 발송</div><div className="d">실시간 알림 구독 세션을 스레드 안전한 <span className="code">ConcurrentHashMap</span> 기반의 <span className="code">SseEmitterRegistry</span>로 관리하여 메모리 누수를 방지하고 가용성을 확보했습니다. 또한, 트랜잭션 내에서 알림 발송 시 발생할 수 있는 커넥션 점유 지연 및 롤백 시의 알림 오발송 문제를 해결하기 위해 <span className="code">@Async</span> 비동기 처리와 <span className="code">@TransactionalEventListener(AFTER_COMMIT)</span>를 결합하여 데이터 정합성과 시스템 성능을 동시에 달성했습니다. (<span className="code">NotificationEventHandler</span>, <span className="code">NotificationService</span>)</div></div>
                        <div className="acard"><div className="ahead"><span className="tag">티켓 관리</span><span className="matched">Matched</span></div><div className="t">티켓 목록 조회 성능 최적화</div><div className="d">티켓 목록 조회 시 발생하는 대규모 데이터 쿼리 부하를 분산하기 위해, 갤러리 도메인과 동일한 <span className="code">PaginationIdCacheService</span> 및 <span className="code">PaginationCountCacheService</span> 아키텍처를 재사용하여 쿼리 실행 횟수를 최소화하고 대량의 티켓 데이터셋에서도 일관된 p95 응답 속도를 유지하도록 설계했습니다. (<span className="code">TicketQueryRepository</span>)</div></div>
                        <div className="acard"><div className="ahead"><span className="tag">티켓 관리</span><span className="matched">Matched</span></div><div className="t">티켓 생성 및 삭제 시 캐시 무효화 전략</div><div className="d">티켓 생성 및 삭제 등 상태 변경 API 호출 시점에 해당 아카이브의 티켓 캐시 데이터를 즉시 무효화(Evict)하는 Write-Through/Cache-Aside 혼합 전략을 적용하여, 사용자에게 지연 없는 최신 상태의 티켓 목록을 제공하면서도 캐시 정합성을 완벽히 유지했습니다. (<span className="code">TicketService</span>)</div></div>
                        <div className="acard"><div className="ahead"><span className="tag">멀티파트 업로드 관리</span><span className="matched">Matched</span></div><div className="t">대용량 파일 업로드 최적화 및 스토리지 관리</div><div className="d">대용량 미디어 파일 업로드 시 발생하는 서버 메모리 버퍼링 및 네트워크 대역폭 병목을 해결하기 위해, S3 멀티파트 업로드와 Presigned URL을 결합하여 클라이언트가 S3 스토리지로 직접 분할 업로드하도록 아키텍처를 개선했습니다. 또한, 업로드 중단으로 인해 발생하는 S3 임시 멀티파트 조각(Orphaned Parts)들을 주기적으로 감지하고 삭제하는 Spring Batch 기반의 <span className="code">FileCleanupBatchConfig</span>를 구축하여 스토리지 비용을 최적화했습니다. (<span className="code">FileService</span>, <span className="code">FileCleanupBatchConfig</span>)</div></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
