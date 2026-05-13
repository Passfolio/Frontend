/**
 * URL로만 접근하는 관리자 포털(공개 네비게이션에 노출하지 않음).
 *
 * 운영 path는 `.env` 의 `VITE_ADMIN_PORTAL_*_PATH` 로 외부화한다.
 * - `.env` 미설정 시 dev 환경 fallback(`/system/admin/...`) 으로 동작하지만
 *   이 fallback 값은 빌드 결과물에서 추출 가능하므로 실제 운영에서는 반드시
 *   `.env` 로 비공개 path 를 지정해 GitHub/소스 검색 노출을 피할 것.
 *
 * 필요한 env 키:
 *   VITE_ADMIN_PORTAL_LOGIN_PATH
 *   VITE_ADMIN_PORTAL_SIGNUP_PATH
 *   VITE_ADMIN_PORTAL_PROFILE_PATH
 */

const trimEnv = (value: string | undefined): string =>
    typeof value === 'string' ? value.trim() : '';

const DEV_FALLBACK_PATHS = {
    login: '/system/admin/login',
    signup: '/system/admin/signup',
    profile: '/system/admin/profile',
} as const;

// Vite는 `import.meta.env.VITE_FOO` 형태의 정적 참조만 빌드 타임에 치환·tree-shake 하므로
// 키별로 정적으로 읽는다. (dynamic `import.meta.env[key]` 사용 시 다른 envar 가 번들에 함께
// 포함될 수 있어 보안상 회피)
const resolveAdminPath = (envValue: string | undefined, envKey: string, devFallback: string): string => {
    const fromEnv = trimEnv(envValue);
    if (fromEnv) return fromEnv;
    if (import.meta.env.DEV) {
        // 운영 비밀 path 노출 방지를 위해 dev 환경에서만 환기 메시지 출력
        console.warn(
            `[Passfolio][admin-portal] ${envKey} is not set in .env — using dev fallback "${devFallback}". ` +
                'Configure .env with a private path for production builds.',
        );
    }
    return devFallback;
};

export const ADMIN_PORTAL_LOGIN_PATH = resolveAdminPath(
    import.meta.env.VITE_ADMIN_PORTAL_LOGIN_PATH,
    'VITE_ADMIN_PORTAL_LOGIN_PATH',
    DEV_FALLBACK_PATHS.login,
);
export const ADMIN_PORTAL_SIGNUP_PATH = resolveAdminPath(
    import.meta.env.VITE_ADMIN_PORTAL_SIGNUP_PATH,
    'VITE_ADMIN_PORTAL_SIGNUP_PATH',
    DEV_FALLBACK_PATHS.signup,
);
export const ADMIN_PORTAL_PROFILE_PATH = resolveAdminPath(
    import.meta.env.VITE_ADMIN_PORTAL_PROFILE_PATH,
    'VITE_ADMIN_PORTAL_PROFILE_PATH',
    DEV_FALLBACK_PATHS.profile,
);

/** 시스템(이메일) 가입 계정 기본 프로필 — GitHub 기본 아바타와 동일 계열 */
export const ADMIN_DEFAULT_PROFILE_IMAGE_URL = 'https://avatars.githubusercontent.com/u/0?v=4';
