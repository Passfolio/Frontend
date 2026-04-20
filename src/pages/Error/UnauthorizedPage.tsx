import { useNavigate } from 'react-router-dom';
import { ErrorLayout } from './ErrorLayout';

export function UnauthorizedPage() {
    const navigate = useNavigate();

    return (
        <ErrorLayout
            code="401"
            label="Unauthorized"
            title="인증이 필요합니다"
            description="로그인이 필요한 요청입니다. 인증 후 다시 시도해 주세요."
            primaryAction={{ label: '로그인 하러 가기', onClick: () => navigate('/') }}
            secondaryAction={{ label: '뒤로 가기', onClick: () => navigate(-1) }}
        />
    );
}
