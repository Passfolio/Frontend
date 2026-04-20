import axios from 'axios';
import { ensureFreshToken, refreshTokenOnce } from '@/api/Auth/tokenRefreshManager';
import { isAuthRefreshUrl } from '@/api/Http/apiEndpoints';

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
});

axiosInstance.interceptors.request.use(
    async (config) => {
        const requestUrl = String(config.url || '');
        if (!isAuthRefreshUrl(requestUrl)) {
            try {
                await ensureFreshToken();
            } catch {
                // 리프레시 실패는 응답 인터셉터나 컴포넌트 단에서 처리
            }
        }
        return config;
    },
    (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error?.config;
        if (!originalRequest) return Promise.reject(error);

        const status = error?.response?.status;
        const requestUrl = String(originalRequest.url || '');
        const alreadyRetried = Boolean(originalRequest._retry);

        if (!isAuthRefreshUrl(requestUrl) && !alreadyRetried && (status === 401 || status === 403)) {
            originalRequest._retry = true;
            try {
                await refreshTokenOnce();
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    },
);
