import { axiosInstance } from '@/api/Http/axiosInstance';
import { API_ENDPOINTS } from '@/api/Http/apiEndpoints';
import type { TokenRefreshResponseType } from '@/types/http.type';

export const postSystemAuthEmailSend = async (email: string) => {
    await axiosInstance.post(API_ENDPOINTS.systemAuth.emailSend, {
        email,
        purpose: 'SIGNUP',
    });
};

export const postSystemAuthEmailVerify = async (email: string, code: string) => {
    await axiosInstance.post(API_ENDPOINTS.systemAuth.emailVerify, {
        email,
        code,
        purpose: 'SIGNUP',
    });
};

export type SystemAuthSignupBodyType = {
    email: string;
    password: string;
    nickname?: string;
    role: 'ADMIN';
};

export const postSystemAuthSignup = async (body: SystemAuthSignupBodyType) => {
    await axiosInstance.post(API_ENDPOINTS.systemAuth.signup, body);
};

export const postSystemAuthLogin = async (
    username: string,
    password: string,
    rememberMe: boolean,
): Promise<TokenRefreshResponseType> => {
    const { data } = await axiosInstance.post<TokenRefreshResponseType>(API_ENDPOINTS.systemAuth.login, {
        username,
        password,
        rememberMe,
    });
    return data;
};
