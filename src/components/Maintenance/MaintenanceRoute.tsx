import { Navigate, Outlet } from 'react-router-dom';
import { IS_SERVICE_MAINTENANCE } from '@/constants/maintenance';

/**
 * 서비스 점검 가드 — 점검 모드(VITE_SERVICE_MAINTENANCE=true)일 때
 * 하위 라우트 접근을 /maintenance로 리다이렉트한다.
 *
 * 점검 대상 라우트는 App.tsx의 <Route element={<MaintenanceRoute />}> 블록
 * 한 곳에서만 관리한다 (페이지별 개별 적용 금지 — 유지보수 일원화).
 */
export const MaintenanceRoute = () => {
    if (IS_SERVICE_MAINTENANCE) {
        return <Navigate to="/maintenance" replace />;
    }
    return <Outlet />;
};
