import { useNavigate } from 'react-router-dom';
import { ErrorLayout } from './ErrorLayout';

export function TooManyRequestsPage() {
    const navigate = useNavigate();

    return (
        <ErrorLayout
            code="429"
            label="Too Many Requests"
            title="요청이 너무 많습니다"
            description="짧은 시간에 요청이 과도하게 발생했습니다. 잠시 후 다시 시도해 주세요."
            primaryAction={{ label: '다시 시도', onClick: () => window.location.reload() }}
            secondaryAction={{ label: '홈으로', onClick: () => navigate('/') }}
        />
    );
}
