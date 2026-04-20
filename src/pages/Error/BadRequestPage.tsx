import { useNavigate } from 'react-router-dom';
import { ErrorLayout } from './ErrorLayout';

export function BadRequestPage() {
    const navigate = useNavigate();

    return (
        <ErrorLayout
            code="400"
            label="Bad Request"
            title="잘못된 요청입니다"
            description="요청 형식이 올바르지 않거나 필요한 값이 누락되었습니다. 입력값을 확인한 뒤 다시 시도해 주세요."
            primaryAction={{ label: '뒤로 가기', onClick: () => navigate(-1) }}
            secondaryAction={{ label: '홈으로', onClick: () => navigate('/') }}
        />
    );
}
