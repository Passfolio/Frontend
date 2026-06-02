export const API_ENDPOINTS = {
    auth: {
        me: '/api/v1/users/me',
        logout: '/api/v1/auth/logout',
        refresh: '/api/v1/auth/refresh',
        revokeSession: '/api/v1/auth/revoke-session',
        delete: '/api/v1/auth/delete',
    },
    systemAuth: {
        signup: '/api/v1/system/auth/signup',
        login: '/api/v1/system/auth/login',
        emailSend: '/api/v1/system/auth/email/send',
        emailVerify: '/api/v1/system/auth/email/verify',
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
    articles: {
        list: '/api/v1/articles',
        detail: (id: number) => `/api/v1/articles/${id}`,
        create: '/api/v1/articles',
        update: (id: number) => `/api/v1/articles/${id}`,
        delete: (id: number) => `/api/v1/articles/${id}`,
    },
    files: {
        multipart: {
            initiate: '/api/v1/files/multipart/initiate',
            complete: '/api/v1/files/multipart/complete',
            abort: '/api/v1/files/multipart/abort',
        },
        me: '/api/v1/files/me',
    },
    aiJobs: {
        portfolioFromPdf: '/api/v1/ai/jobs/portfolio/from-pdf',
        coverLetterFromPdf: '/api/v1/ai/jobs/cover-letter/from-pdf',
        coverLetterFromPortfolio: '/api/v1/ai/jobs/cover-letter/from-portfolio',
        coverLetterToPortfolio: '/api/v1/ai/jobs/cover-letter/to-portfolio',
        status: (jobId: number) => `/api/v1/ai/jobs/${jobId}`,
    },
    projectAnalysis: {
        precheck: '/api/v1/project-analysis/precheck', // POST(시작) / GET(상태 목록)
        start: '/api/v1/project-analysis/start',
        subscribe: '/api/v1/project-analysis/subscribe', // SSE
        batchStatus: (batchId: string) => `/api/v1/project-analysis/batch/${batchId}`, // 본인 배치 상태(진행중 페이지)
    },
    adminProjectAnalysis: {
        testBatch: '/api/v1/admin/project-analysis/test-batch',
        precheckTest: '/api/v1/admin/project-analysis/precheck-test',
        testBatchLimit: '/api/v1/admin/project-analysis/test-batch/limit',
        batchStatus: (batchId: string) => `/api/v1/admin/project-analysis/batch/${batchId}`,
    },
    adminUsers: {
        signupsDaily: '/api/v1/admin/users/signups-daily',
        list: '/api/v1/admin/users',
    },
} as const;

export const isAuthRefreshUrl = (url: string): boolean =>
    url.includes(API_ENDPOINTS.auth.refresh);
