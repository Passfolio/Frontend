import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/Auth/AuthContext';
import { ADMIN_PORTAL_PROFILE_PATH } from '@/constants/adminPortal';
import { ProfilePage } from '@/pages/Profile/ProfilePage';

/** 일반 회원 전용 `/profile` — ADMIN은 관리자 홈으로 보냄 */
export const UserProfileRoute = () => {
    const { user } = useAuth();

    if (user?.role === 'ADMIN') {
        return <Navigate to={ADMIN_PORTAL_PROFILE_PATH} replace />;
    }

    return <ProfilePage />;
};
