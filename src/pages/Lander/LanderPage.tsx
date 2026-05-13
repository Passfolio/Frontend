import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/Auth/AuthContext';
import { listArticles } from '@/api/Article/articleApi';
import {
    LandingArticleSection,
    type LandingInsightCardType,
} from '@/components/Lander/landingArticleSection';
import { LandingHeroSection } from '@/components/Lander/landingHeroSection';
import { LandingHowSection } from '@/components/Lander/landingHowSection';
import { LandingResultSection } from '@/components/Lander/landingResultSection';
import { LandingServiceSection } from '@/components/Lander/landingServiceSection';
import { LanderFooter } from '@/components/Lander/LanderFooter';
import { useCvTypingOverlay } from '@/hooks/Lander/useCvTypingOverlay';
import { useNetworkCanvas } from '@/hooks/Lander/useNetworkCanvas';
import { useRevealOnScroll } from '@/hooks/Layout/useRevealOnScroll';
import './landerPage.css';

const LANDING_INSIGHT_COUNT = 3;

const formatInsightDateLabel = (iso: string): string => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

export const LanderPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // 일반(USER) 로그인 시에만 홈(/) → 프로필 자동 이동 — ADMIN은 랜딩 유지
    useEffect(() => {
        const isAuthenticated = Boolean(user?.id || localStorage.getItem('userId'));
        if (isAuthenticated && user?.role === 'USER') {
            navigate('/profile', { replace: true });
        }
    }, [user, navigate]);

    const [insightList, setInsightList] = useState<LandingInsightCardType[]>([]);

    const pageRootRef = useRevealOnScroll<HTMLDivElement>(
        insightList.map((article) => article.id).join(','),
    );
    const networkCanvasRef = useNetworkCanvas();
    const cvStageRef = useCvTypingOverlay();

    useEffect(() => {
        let cancelled = false;
        listArticles({ page: 0, size: LANDING_INSIGHT_COUNT })
            .then((data) => {
                if (cancelled) return;
                const mapped: LandingInsightCardType[] = data.content.map((article) => ({
                    id: article.id,
                    title: article.title,
                    imageUrl: article.thumbnail,
                    imageAlt: article.title,
                    dateLabel: formatInsightDateLabel(article.createdAt),
                    href: `/articles/${article.id}`,
                }));
                setInsightList(mapped);
            })
            .catch(() => {
                // 실패 시 빈 섹션 유지 — 랜딩이 끊기지 않도록 조용히 무시
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
            {insightList.length > 0 && <LandingArticleSection insightList={insightList} />}
            <LanderFooter />
        </div>
    );
};
