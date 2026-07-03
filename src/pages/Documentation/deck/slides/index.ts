import type { ComponentType } from 'react';
import { CoverSlide } from './CoverSlide';
import { ContentsSlide } from './ContentsSlide';
import { OverviewSlide } from './OverviewSlide';
import { PurposeASlide } from './PurposeASlide';
import { PurposeBSlide } from './PurposeBSlide';
import { PurposeCSlide } from './PurposeCSlide';
import { PurposeDSlide } from './PurposeDSlide';
import { PurposeESlide } from './PurposeESlide';
import { ServiceIntroSlide } from './ServiceIntroSlide';
import { TechnologySlide } from './TechnologySlide';
import { TechStack1Slide } from './TechStack1Slide';
import { TechStack2Slide } from './TechStack2Slide';
import { AnalysisWorkflowSlide } from './AnalysisWorkflowSlide';
import { PortfolioWorkflowSlide } from './PortfolioWorkflowSlide';
import { Feedback1Slide } from './Feedback1Slide';
import { PerformanceSlide } from './PerformanceSlide';
import { QnASlide } from './QnASlide';

export type SlideProps = {
    /** 이 슬라이드가 현재 표시 중인지 (진입 애니메이션 트리거) */
    isActive: boolean;
};

/** 원본 Passfolio Deck.html의 SLIDES 배열 순서 그대로 */
export const DECK_SLIDES: ComponentType<SlideProps>[] = [
    CoverSlide,
    ContentsSlide,
    OverviewSlide,
    PurposeASlide,
    PurposeBSlide,
    PurposeCSlide,
    PurposeDSlide,
    PurposeESlide,
    ServiceIntroSlide,
    TechnologySlide,
    TechStack1Slide,
    TechStack2Slide,
    AnalysisWorkflowSlide,
    PortfolioWorkflowSlide,
    Feedback1Slide,
    PerformanceSlide,
    QnASlide,
];
