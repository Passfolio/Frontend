import { useNavigate } from 'react-router-dom';
import { ErrorLayout } from './ErrorLayout';

export function ForbiddenPage() {
    const navigate = useNavigate();

    return (
        <ErrorLayout
            code="403"
            label="Access Denied"
            title="접근 권한이 없습니다"
            description="인증은 되었지만 이 리소스에 대한 권한이 없습니다. 관리자에게 권한을 요청해 주세요."
            primaryAction={{ label: '홈으로', onClick: () => navigate('/') }}
            secondaryAction={{ label: '뒤로 가기', onClick: () => navigate(-1) }}
        />
    );
}
