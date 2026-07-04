import { Navigate, useNavigate } from 'react-router-dom';
import { ErrorLayout } from '@/pages/Error/ErrorLayout';
import { IS_SERVICE_MAINTENANCE } from '@/constants/maintenance';
import { SERVICE_EMAIL } from '@/constants/service';

/** 서비스 점검 안내 페이지 — 점검 모드에서 API 의존 라우트가 이곳으로 리다이렉트된다 */
export function MaintenancePage() {
    const navigate = useNavigate();

    // 점검 모드가 아닐 때의 직접 접근(북마크 등)은 홈으로 — 점검 종료 후 잔류 방지
    if (!IS_SERVICE_MAINTENANCE) {
        return <Navigate to="/" replace />;
    }

    return (
        <ErrorLayout
            code="503"
            label="Service Maintenance"
            title="서비스 점검 중입니다"
            description={`현재 서비스가 일시 중단 상태입니다.\n자세한 일정과 배경은 공지사항에서 확인하실 수 있습니다.\n문의: ${SERVICE_EMAIL}`}
            primaryAction={{ label: '공지사항 보기', onClick: () => navigate('/announcements') }}
            secondaryAction={{ label: '홈으로', onClick: () => navigate('/') }}
        />
    );
}
