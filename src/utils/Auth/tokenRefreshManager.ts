import axios from 'axios';

const STORAGE_KEYS = {
    ACCESS_TOKEN_EXPIRES_AT: 'accessTokenExpiresAt',
    REFRESH_TOKEN_EXPIRES_AT: 'refreshTokenExpiresAt',
};

const REFRESH_BUFFER_MS = 60 * 1000; // 만료 1분 전
const MIN_VALIDITY_MS = 15 * 1000; // 최소 유효시간
const ACTIVITY_THROTTLE_MS = 3000; // 탭 전환 연타 방지 쓰로틀링

let refreshTimerId: number | null = null;
let refreshPromise: Promise<any> | null = null;
let lastActivityCheckAt = 0;
let isInitialized = false;

const getApiBaseUrl = () => import.meta.env.VITE_API_BASE_URL || window.location.origin;

export function saveTokenExpiresInfo(tokenExpiresInfo: { accessTokenExpiresAt?: string, refreshTokenExpiresAt?: string }) {
    if (!tokenExpiresInfo) return;
    if (tokenExpiresInfo.accessTokenExpiresAt) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_AT, tokenExpiresInfo.accessTokenExpiresAt);
    }
    if (tokenExpiresInfo.refreshTokenExpiresAt) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN_EXPIRES_AT, tokenExpiresInfo.refreshTokenExpiresAt);
    }
    scheduleRefreshByExpiry();
}

export function clearTokenExpiresInfo() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_AT);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN_EXPIRES_AT);
    if (refreshTimerId) {
        clearTimeout(refreshTimerId);
        refreshTimerId = null;
    }
}

const getAccessTokenExpiryMs = () => {
    const expiresAtStr = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_AT);
    if (!expiresAtStr) return null;
    const parsed = new Date(expiresAtStr);
    return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
};

async function callRefreshApi() {
    console.log("✅ Refresh Token Called");
    const { data } = await axios.post(
        `${getApiBaseUrl()}/api/v1/auth/refresh`,
        null,
        { withCredentials: true }
    );
    return data;
}

export async function refreshTokenOnce() {
    // ✅ Race Condition 방어: 이미 갱신 중이면 기존 Promise 반환
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        try {
            const data = await callRefreshApi();
            saveTokenExpiresInfo(data);
            return data;
        } catch (error) {
            clearTokenExpiresInfo();
            localStorage.clear();
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new CustomEvent('auth-change', { detail: null }));
            throw error;
        }
    })().finally(() => {
        refreshPromise = null;
    });

    return refreshPromise;
}

export async function ensureFreshToken(minValidityMs = MIN_VALIDITY_MS) {
    const expiresAtMs = getAccessTokenExpiryMs();
    if (!expiresAtMs) return null;

    const remainingMs = expiresAtMs - Date.now();
    if (remainingMs > minValidityMs) return null;

    return refreshTokenOnce();
}

export function scheduleRefreshByExpiry() {
    if (refreshTimerId) clearTimeout(refreshTimerId);

    const expiresAtMs = getAccessTokenExpiryMs();
    if (!expiresAtMs) return;

    const delay = Math.max(0, expiresAtMs - Date.now() - REFRESH_BUFFER_MS);
    refreshTimerId = window.setTimeout(async () => {
        try {
            await refreshTokenOnce();
        } catch (error) {
            console.error('선제 토큰 갱신 실패:', error);
        }
    }, delay);
}

export function initializeRefreshManager() {
    if (isInitialized) return;
    isInitialized = true;

    scheduleRefreshByExpiry();

    const checkOnActivity = () => {
        const now = Date.now();
        // 과도한 체크 방지 (3초 쓰로틀링)
        if (now - lastActivityCheckAt < ACTIVITY_THROTTLE_MS) return;
        lastActivityCheckAt = now;

        void ensureFreshToken().catch(() => {
            // 활동 감지 트리거에 의한 에러는 조용히 무시 (화면 에러 방지)
        });
    };

    window.addEventListener("focus", checkOnActivity);
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            checkOnActivity();
        }
    });
}