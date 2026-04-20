import axios from 'axios';

export const extractErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error) return error.message || fallback;
    if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message;
        if (msg && typeof msg === 'string') return msg;
    }
    return fallback;
};
