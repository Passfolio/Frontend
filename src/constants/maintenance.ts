/**
 * 서비스 점검 모드 — true면 서버 API 의존 라우트(App.tsx의 MaintenanceRoute 블록)가
 * /maintenance로 일괄 리다이렉트된다. 정적 페이지(랜딩·공지·Docs·약관 등)는 대상 아님.
 *
 * 제어: .env(로컬) 및 배포 환경 빌드 변수의 VITE_SERVICE_MAINTENANCE ('true' | 'false')
 * 기본값: false (변수 미설정 시)
 *
 * 주의: Vite는 `import.meta.env.VITE_*` 정적 리터럴만 빌드 타임에 치환하므로
 * 동적 키 접근(import.meta.env[key])으로 바꾸지 말 것.
 */
export const IS_SERVICE_MAINTENANCE = import.meta.env.VITE_SERVICE_MAINTENANCE === 'true';

/**
 * 점검 모드면 서버를 경유하는 링크(href)를 /maintenance로 우회시킨다.
 * 라우트 단위 차단은 App.tsx의 MaintenanceRoute 블록이 담당하고,
 * 이 헬퍼는 라우터 밖 링크(OAuth 리다이렉트 CTA 등)에 사용한다.
 */
export function guardHrefForMaintenance(href: string): string {
    return IS_SERVICE_MAINTENANCE ? '/maintenance' : href;
}
