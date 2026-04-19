import { useNavigate } from 'react-router-dom';
import { ErrorLayout } from './ErrorLayout';

export function ForbiddenPage() {
    const navigate = useNavigate();

    return (
        <ErrorLayout
            code="403"
            label="Access Denied"
            title="접근 권한이 없습니다"
            description="이 페이지에 접근하려면 로그인이 필요합니다. GitHub 계정으로 로그인 후 이용해 주세요."
            primaryAction={{ label: '로그인 하러 가기', onClick: () => navigate('/') }}
            secondaryAction={{ label: '뒤로 가기', onClick: () => navigate(-1) }}
        />
    );
}
