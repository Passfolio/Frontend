import axios from 'axios';
import { ensureFreshToken, refreshTokenOnce } from './tokenRefreshManager';

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true, // HTTP-Only 쿠키 사용을 위해 필수
});

// 요청 인터셉터: API 요청 전 토큰 유효성 검사 및 갱신
axiosInstance.interceptors.request.use(
    async (config) => {
        const requestUrl = String(config.url || '');
        const isRefreshRequest = requestUrl.includes('/api/v1/auth/refresh'); // TODO: Env로 빼기

        if (!isRefreshRequest) {
            try {
                await ensureFreshToken();
            } catch (error) {
                // 무시: 리프레시 실패는 응답 인터셉터나 컴포넌트 단에서 처리
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 인터셉터: 401/403 에러 시 1회 재시도 로직
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error?.config;
        if (!originalRequest) return Promise.reject(error);

        const status = error?.response?.status;
        const requestUrl = String(originalRequest.url || '');
        const isRefreshRequest = requestUrl.includes('/api/v1/auth/refresh'); // TODO: Env로 빼기
        const alreadyRetried = Boolean(originalRequest._retry);

        if (!isRefreshRequest && !alreadyRetried && (status === 401 || status === 403)) {
            originalRequest._retry = true;
            try {
                await refreshTokenOnce();
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);