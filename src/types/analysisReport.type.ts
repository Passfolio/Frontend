// 프로젝트 분석 결과 리포트.
// 단건 조회(BE) → resultCdnUrl → 공개 CDN JSON(window.REPORT 스키마, DevSkill p9_finalize 산출물).

// BE 단건 리포트 응답(GET /api/v1/project-analysis/{analysisId}/report)
// report는 DONE 시 BE가 CDN에서 서버사이드 fetch한 결과 JSON(브라우저 CORS 우회), 그 외 null.
export type AnalysisReportResponseType = {
    analysisId: string;
    batchId: string | null;
    repoUrl: string;
    status: 'YET' | 'IN_PROGRESS' | 'DONE' | 'FAILED';
    serviceName: string | null;
    failureReason: string | null;
    report: AnalysisReportType | null;
};

// CDN 결과 JSON 스키마 (report-data.js의 window.REPORT)
export type TechItemType = {
    name: string;
    category: string;
};

export type CoreFeatType = {
    feat_title: string;
    description: string;
};

export type CorePerfType = {
    perf_title: string;
    about_feat_title: string;
    description: string;
};

export type FeedbackType = {
    feedback_title: string;
    about_perf_title: string;
    feedback: string;
};

export type ContributeBreakdownType = {
    name: string;
    percent: number;
    added: number;
};

export type AnalysisPeriodType = {
    start: string;
    end: string;
    days: number;
};

export type AnalysisReportType = {
    service_name: string;
    service_description: string;
    dev_type: string[];
    frameworks: TechItemType[];
    skills: TechItemType[];
    analysis: {
        core_feat: CoreFeatType[];
        core_perf: CorePerfType[];
        feedback: FeedbackType[];
        contribute: { contribute_titles: string[] };
    };
    user_role: string;
    contribute_share_percent: number | null;
    contribute_breakdown: ContributeBreakdownType[];
    github_username_resolved: string;
    analysis_period: AnalysisPeriodType;
};
