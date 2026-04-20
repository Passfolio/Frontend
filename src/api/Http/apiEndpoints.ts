export const API_ENDPOINTS = {
    auth: {
        me: '/api/v1/users/me',
        logout: '/api/v1/auth/logout',
        refresh: '/api/v1/auth/refresh',
        revokeSession: '/api/v1/auth/revoke-session',
        delete: '/api/v1/auth/delete',
    },
    spec: {
        devSpec: '/api/v1/spec/dev-spec',
        educationHistory: '/api/v1/spec/dev-spec/education-history',
        career: '/api/v1/spec/dev-spec/career',
        searchUniversities: '/api/v1/spec/search/universities',
        searchDepartments: '/api/v1/spec/search/departments',
    },
    github: {
        repos: '/api/v1/github/repos',
    },
} as const;

export const isAuthRefreshUrl = (url: string): boolean =>
    url.includes(API_ENDPOINTS.auth.refresh);
