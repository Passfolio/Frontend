import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LanderPage } from '@/pages/Lander/LanderPage';
import { AnnouncementsPage } from '@/pages/Announcements/AnnouncementsPage';
import { FaqPage } from '@/pages/Faq/FaqPage';
import { TermsOfServicePage } from '@/pages/Terms/TermsOfServicePage';
import { PrivacyPolicyPage } from '@/pages/Privacy/PrivacyPolicyPage';
import { UserProfileRoute } from '@/pages/Profile/userProfileRoute';
import { OAuthCallback } from '@/pages/OAuthCallback/OAuthCallback';
import { BadRequestPage } from '@/pages/Error/BadRequestPage';
import { UnauthorizedPage } from '@/pages/Error/UnauthorizedPage';
import { NotFoundPage } from '@/pages/Error/NotFoundPage';
import { ForbiddenPage } from '@/pages/Error/ForbiddenPage';
import { TooManyRequestsPage } from '@/pages/Error/TooManyRequestsPage';
import { ServerErrorPage } from '@/pages/Error/ServerErrorPage';
import { PrivateRoute } from '@/components/Auth/PrivateRoute';
import { AdminRoute } from '@/components/Auth/AdminRoute';
import { ErrorBoundary } from '@/components/Error/ErrorBoundary';
import { AuthProvider } from '@/context/Auth/AuthContext';
import { Header } from "@/components/Layout/Header/Header";
import { UploadPage } from '@/pages/Upload/UploadPage';
import { ArticleListPage } from '@/pages/Articles/ArticleListPage';
import { ArticleDetailPage } from '@/pages/Articles/ArticleDetailPage';
import { ArticleCreatePage } from '@/pages/Articles/ArticleCreatePage';
import { ArticleEditPage } from '@/pages/Articles/ArticleEditPage';
import { AdminLoginPage } from '@/pages/AdminPortal/AdminLoginPage';
import { AdminSignupPage } from '@/pages/AdminPortal/AdminSignupPage';
import { AdminProfilePage } from '@/pages/AdminPortal/AdminProfilePage';
import { AdminTestPage } from '@/pages/AdminPortal/AdminTestPage';
import { AdminAnalysisMetricsPage } from '@/pages/AdminPortal/AdminAnalysisMetricsPage';
import { AdminUsersPage } from '@/pages/AdminPortal/AdminUsersPage';
import { AdminPrecheckTestPage } from '@/pages/AdminPortal/AdminPrecheckTestPage';
import { AnalysisProgressPage } from '@/pages/Analysis/AnalysisProgressPage';
// 리포트 페이지는 전용 CSS·플립카드 등 무게가 있어 라우트 단위 코드 스플릿(lazy).
const AnalysisReportPage = lazy(() => import('@/pages/Analysis/AnalysisReportPage'));
import {
    ADMIN_PORTAL_LOGIN_PATH,
    ADMIN_PORTAL_PROFILE_PATH,
    ADMIN_PORTAL_SIGNUP_PATH,
    ADMIN_PORTAL_TEST_PATH,
    ADMIN_PORTAL_ANALYSIS_METRICS_PATH,
    ADMIN_PORTAL_USERS_PATH,
    ADMIN_PORTAL_PRECHECK_TEST_PATH,
} from '@/constants/adminPortal';

function ScrollToTopOnPathChange() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, [pathname]);

    return null;
}

export const App = () => {
    return (
        <AuthProvider>
            <ErrorBoundary>
                <ScrollToTopOnPathChange />
                <Header />
                <Routes>
                    {/* --- 공개 라우트 --- */}
                    <Route path="/" element={<LanderPage />} />
                    <Route path="/announcements" element={<AnnouncementsPage />} />
                    <Route path="/articles" element={<ArticleListPage />} />
                    <Route path="/articles/:id" element={<ArticleDetailPage />} />
                    <Route path="/faq" element={<FaqPage />} />
                    <Route path="/terms" element={<TermsOfServicePage />} />
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/oauth/callback" element={<OAuthCallback />} />

                    {/* Hidden: 관리자 포털(네비에 링크 없음, URL 직접 입력) */}
                    <Route path={ADMIN_PORTAL_LOGIN_PATH} element={<AdminLoginPage />} />
                    <Route path={ADMIN_PORTAL_SIGNUP_PATH} element={<AdminSignupPage />} />

                    {/* --- 에러 페이지 --- */}
                    <Route path="/400" element={<BadRequestPage />} />
                    <Route path="/401" element={<UnauthorizedPage />} />
                    <Route path="/404" element={<NotFoundPage />} />
                    <Route path="/403" element={<ForbiddenPage />} />
                    <Route path="/429" element={<TooManyRequestsPage />} />
                    <Route path="/500" element={<ServerErrorPage />} />

                    {/* --- 비공개 라우트 --- */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/profile" element={<UserProfileRoute />} />
                        <Route path="/analysis/:batchId" element={<AnalysisProgressPage />} />
                        <Route
                            path="/analysis/report/:analysisId"
                            element={
                                <Suspense fallback={null}>
                                    <AnalysisReportPage />
                                </Suspense>
                            }
                        />
                        <Route element={<AdminRoute />}>
                            <Route path={ADMIN_PORTAL_PROFILE_PATH} element={<AdminProfilePage />} />
                            <Route path={ADMIN_PORTAL_TEST_PATH} element={<AdminTestPage />} />
                            <Route path={ADMIN_PORTAL_ANALYSIS_METRICS_PATH} element={<AdminAnalysisMetricsPage />} />
                            <Route path={ADMIN_PORTAL_USERS_PATH} element={<AdminUsersPage />} />
                            <Route path={ADMIN_PORTAL_PRECHECK_TEST_PATH} element={<AdminPrecheckTestPage />} />
                            <Route path="/articles/create" element={<ArticleCreatePage />} />
                            <Route path="/articles/:id/edit" element={<ArticleEditPage />} />
                        </Route>
                    </Route>

                    {/* --- 404 --- */}
                    <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
            </ErrorBoundary>
        </AuthProvider>
    );
}
