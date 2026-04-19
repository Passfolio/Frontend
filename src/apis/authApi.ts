import { axiosInstance } from '@/utils/Auth/axiosInstance';
import { clearTokenExpiresInfo, refreshTokenOnce } from '@/utils/Auth/tokenRefreshManager';

export const fetchMe = async () => {
    const { data } = await axiosInstance.get('/api/v1/users/me'); // TODO: Env로 뺄 것
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
        await axiosInstance.post('/api/v1/auth/logout').catch(() => {}); // TODO: Env로 뺄 것
        clearTokenExpiresInfo();
        return true;
    } catch (error) {
        console.error('로그아웃 실패', error);
        return false;
    }
};

export const revokeSession = async () => {
    try {
        await axiosInstance.post('/api/v1/auth/revoke-session');
        clearTokenExpiresInfo();
        return true;
    } catch (error) {
        console.error('세션 종료 실패', error);
        return false;
    }
};

export const deleteAccount = async () => {
    try {
        await axiosInstance.delete('/api/v1/auth/delete');
        clearTokenExpiresInfo();
        return true;
    } catch (error) {
        console.error('계정 삭제 실패', error);
        return false;
    }
};