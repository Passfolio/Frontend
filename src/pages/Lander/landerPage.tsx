import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/Auth/AuthContext';
import {
    fetchLandingInsightList,
    STATIC_LANDING_INSIGHT_LIST,
    type LandingInsightArticleType,
} from '@/api/Lander/fetchLandingInsightList';
import { LandingArticleSection } from '@/components/Lander/landingArticleSection';
import { LandingHeroSection } from '@/components/Lander/landingHeroSection';
import { LandingHowSection } from '@/components/Lander/landingHowSection';
import { LandingResultSection } from '@/components/Lander/landingResultSection';
import { LandingServiceSection } from '@/components/Lander/landingServiceSection';
import { LanderFooter } from '@/components/Lander/landerFooter';
import { useCvTypingOverlay } from '@/hooks/Lander/useCvTypingOverlay';
import { useNetworkCanvas } from '@/hooks/Lander/useNetworkCanvas';
import { useRevealOnScroll } from '@/hooks/Layout/useRevealOnScroll';
import './landerPage.css';

export function LanderPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // 로그인 유저 자동 리다이렉트: 홈(/)으로 들어와도 로그인되어 있으면 프로필로 이동
    useEffect(() => {
        const isAuthenticated = user?.id || localStorage.getItem('userId');
        if (isAuthenticated) {
            navigate('/profile', { replace: true });
        }
    }, [user, navigate]);

    const [insightList, setInsightList] = useState<LandingInsightArticleType[]>(
        STATIC_LANDING_INSIGHT_LIST,
    );

    const pageRootRef = useRevealOnScroll<HTMLDivElement>(
        insightList.map((article) => article.id).join(','),
    );
    const networkCanvasRef = useNetworkCanvas();
    const cvStageRef = useCvTypingOverlay();

    useEffect(() => {
        let cancelled = false;
        void fetchLandingInsightList().then((list) => {
            if (!cancelled) setInsightList(list);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div ref={pageRootRef} className="lander-page">
            <LandingHeroSection />
            <LandingServiceSection cvStageRef={cvStageRef} networkCanvasRef={networkCanvasRef} />
            <LandingHowSection />
            <LandingResultSection />
            <LandingArticleSection insightList={insightList} />
            <LanderFooter />
        </div>
    );
}