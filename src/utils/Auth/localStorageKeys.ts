export const AUTH_STORAGE_KEYS = {
    USER_ID: 'userId',
    NICKNAME: 'nickname',
    GITHUB_LOGIN: 'githubLogin',
    PROFILE_IMAGE_URL: 'profileImageUrl',
    ROLE: 'role',
    ACCESS_TOKEN_EXPIRES_AT: 'accessTokenExpiresAt',
    REFRESH_TOKEN_EXPIRES_AT: 'refreshTokenExpiresAt',
} as const;

export const getStoredUserId = (): string | null =>
    localStorage.getItem(AUTH_STORAGE_KEYS.USER_ID);
