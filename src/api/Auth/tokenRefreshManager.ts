import axios from 'axios';
import type { TokenRefreshResponseType } from '@/types/http.type';
import { AUTH_STORAGE_KEYS } from '@/utils/Auth/localStorageKeys';
import { API_ENDPOINTS } from '@/api/Http/apiEndpoints';
import { REFRESH_BUFFER_MS, MIN_VALIDITY_MS, ACTIVITY_THROTTLE_MS } from '@/constants/ui';

let refreshTimerId: number | null = null;
let refreshPromise: Promise<TokenRefreshResponseType> | null = null;
let lastActivityCheckAt = 0;
let isInitialized = false;

const getApiBaseUrl = () => import.meta.env.VITE_API_BASE_URL || window.location.origin;

export const saveTokenExpiresInfo = (tokenExpiresInfo: TokenRefreshResponseType) => {
    if (!tokenExpiresInfo) return;
    if (tokenExpiresInfo.accessTokenExpiresAt) {
        localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_AT, tokenExpiresInfo.accessTokenExpiresAt);
    }
    if (tokenExpiresInfo.refreshTokenExpiresAt) {
        localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN_EXPIRES_AT, tokenExpiresInfo.refreshTokenExpiresAt);
    }
    scheduleRefreshByExpiry();
};

export const clearTokenExpiresInfo = () => {
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_AT);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN_EXPIRES_AT);
    if (refreshTimerId) {
        clearTimeout(refreshTimerId);
        refreshTimerId = null;
    }
};

const getAccessTokenExpiryMs = (): number | null => {
    const expiresAtStr = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_AT);
    if (!expiresAtStr) return null;
    const parsed = new Date(expiresAtStr);
    return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
};

async function callRefreshApi(): Promise<TokenRefreshResponseType> {
    console.log('✅ Refresh Token Called');
    const { data } = await axios.post<TokenRefreshResponseType>(
        `${getApiBaseUrl()}${API_ENDPOINTS.auth.refresh}`,
        null,
        { withCredentials: true },
    );
    return data;
}

export async function refreshTokenOnce(): Promise<TokenRefreshResponseType> {
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

export async function ensureFreshToken(minValidityMs = MIN_VALIDITY_MS): Promise<TokenRefreshResponseType | null> {
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
        if (now - lastActivityCheckAt < ACTIVITY_THROTTLE_MS) return;
        lastActivityCheckAt = now;

        void ensureFreshToken().catch(() => {});
    };

    window.addEventListener('focus', checkOnActivity);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            checkOnActivity();
        }
    });
}
