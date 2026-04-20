import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LanderPage } from '@/pages/Lander/LanderPage';
import { AnnouncementsPage } from '@/pages/Announcements/AnnouncementsPage';
import { FaqPage } from '@/pages/Faq/FaqPage';
import { TermsOfServicePage } from '@/pages/Terms/TermsOfServicePage';
import { PrivacyPolicyPage } from '@/pages/Privacy/PrivacyPolicyPage';
import { ProfilePage } from '@/pages/Profile/ProfilePage';
import { OAuthCallback } from '@/pages/OAuthCallback/OAuthCallback';
import { BadRequestPage } from '@/pages/Error/BadRequestPage';
import { UnauthorizedPage } from '@/pages/Error/UnauthorizedPage';
import { NotFoundPage } from '@/pages/Error/NotFoundPage';
import { ForbiddenPage } from '@/pages/Error/ForbiddenPage';
import { TooManyRequestsPage } from '@/pages/Error/TooManyRequestsPage';
import { ServerErrorPage } from '@/pages/Error/ServerErrorPage';
import { PrivateRoute } from '@/components/Auth/PrivateRoute';
import { ErrorBoundary } from '@/components/Error/ErrorBoundary';
import { AuthProvider } from '@/context/Auth/AuthContext';
import { Header } from "@/components/Layout/Header/Header";

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
                    <Route path="/faq" element={<FaqPage />} />
                    <Route path="/terms" element={<TermsOfServicePage />} />
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/oauth/callback" element={<OAuthCallback />} />

                    {/* --- 에러 페이지 --- */}
                    <Route path="/400" element={<BadRequestPage />} />
                    <Route path="/401" element={<UnauthorizedPage />} />
                    <Route path="/404" element={<NotFoundPage />} />
                    <Route path="/403" element={<ForbiddenPage />} />
                    <Route path="/429" element={<TooManyRequestsPage />} />
                    <Route path="/500" element={<ServerErrorPage />} />

                    {/* --- 비공개 라우트 --- */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/profile" element={<ProfilePage />} />
                    </Route>

                    {/* --- 404 --- */}
                    <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
            </ErrorBoundary>
        </AuthProvider>
    );
}
