import { axiosInstance } from '@/api/Http/axiosInstance';
import { clearTokenExpiresInfo, refreshTokenOnce } from '@/api/Auth/tokenRefreshManager';
import { API_ENDPOINTS } from '@/api/Http/apiEndpoints';

export const fetchMe = async () => {
    const { data } = await axiosInstance.get(API_ENDPOINTS.auth.me);
    return data;
};

export const socialMe = async () => {
    const [user, tokenExpiresInfo] = await Promise.all([
        fetchMe(),
        refreshTokenOnce(),
    ]);
    return { user, tokenExpiresInfo };
};

export const logout = async () => {
    try {
        await axiosInstance.post(API_ENDPOINTS.auth.logout).catch(() => {});
        clearTokenExpiresInfo();
        return true;
    } catch (error) {
        console.error('로그아웃 실패', error);
        return false;
    }
};

export const revokeSession = async () => {
    try {
        await axiosInstance.post(API_ENDPOINTS.auth.revokeSession);
        clearTokenExpiresInfo();
        return true;
    } catch (error) {
        console.error('세션 종료 실패', error);
        return false;
    }
};

export const deleteAccount = async () => {
    try {
        await axiosInstance.delete(API_ENDPOINTS.auth.delete);
        clearTokenExpiresInfo();
        return true;
    } catch (error) {
        console.error('계정 삭제 실패', error);
        return false;
    }
};
