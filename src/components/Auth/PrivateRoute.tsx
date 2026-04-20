import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/Auth/AuthContext';
import { getStoredUserId } from '@/utils/Auth/localStorageKeys';

export const PrivateRoute = () => {
    const { user } = useAuth();
    const isAuthenticated = user?.id || getStoredUserId();

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
