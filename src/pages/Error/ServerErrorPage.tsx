import { useNavigate } from 'react-router-dom';
import { ErrorLayout } from './ErrorLayout';

export function ServerErrorPage() {
    const navigate = useNavigate();

    return (
        <ErrorLayout
            code="500"
            label="Internal Server Error"
            title="서버에 문제가 발생했습니다"
            description="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. 문제가 지속되면 고객센터로 문의해 주세요."
            primaryAction={{ label: '다시 시도', onClick: () => window.location.reload() }}
            secondaryAction={{ label: '홈으로', onClick: () => navigate('/') }}
        />
    );
}
