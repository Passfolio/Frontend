import { Routes, Route } from "react-router-dom";
import { LanderPage } from '@/pages/Lander/landerPage';
import { AnnouncementsPage } from '@/pages/Announcements/AnnouncementsPage';
import { FaqPage } from '@/pages/Faq/FaqPage';
import { TermsOfServicePage } from '@/pages/Terms/TermsOfServicePage';
import { PrivacyPolicyPage } from '@/pages/Privacy/PrivacyPolicyPage';
import { ProfilePage } from '@/pages/Profile/profilePage';
import OAuthCallback from '@/pages/OAuthCallback/OAuthCallback';
import { NotFoundPage } from '@/pages/Error/NotFoundPage';
import { ForbiddenPage } from '@/pages/Error/ForbiddenPage';
import { ServerErrorPage } from '@/pages/Error/ServerErrorPage';
import PrivateRoute from '@/components/Auth/PrivateRoute';
import { ErrorBoundary } from '@/components/Error/ErrorBoundary';
import { AuthProvider } from '@/context/Auth/AuthContext';
import { Header } from "@/components/Layout/Header/Header";

export default function App() {
    return (
        <AuthProvider>
            <ErrorBoundary>
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
                    <Route path="/403" element={<ForbiddenPage />} />
                    <Route path="/500" element={<ServerErrorPage />} />

                    {/* --- 비공개 라우트 --- */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/profile" element={<ProfilePage />} />
                    </Route>

                    {/* --- 404 --- */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </ErrorBoundary>
        </AuthProvider>
    );
}
