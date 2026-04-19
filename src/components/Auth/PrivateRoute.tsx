import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/Auth/AuthContext';

const PrivateRoute = () => {
    const { user } = useAuth();
    const isAuthenticated = user?.id || localStorage.getItem('userId');

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
