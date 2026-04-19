import { useNavigate } from 'react-router-dom';
import { ErrorLayout } from './ErrorLayout';

export function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <ErrorLayout
            code="404"
            label="Page Not Found"
            title="페이지를 찾을 수 없습니다"
            description="요청하신 페이지가 존재하지 않거나 이동되었습니다. URL을 다시 확인해 주세요."
            primaryAction={{ label: '홈으로', onClick: () => navigate('/') }}
            secondaryAction={{ label: '뒤로 가기', onClick: () => navigate(-1) }}
        />
    );
}
