import { axiosInstance } from '@/api/Http/axiosInstance';
import { API_ENDPOINTS } from '@/api/Http/apiEndpoints';
import { getAiJobStatus } from '@/api/AiJob/aiJobApi';
import type { RoadmapAssessment } from '@/types/roadmap.type';

export type RoadmapAssessJobResponse = {
    jobId: number;
};

/**
 * 로드맵 평가 시작 (BE relay). 완료된 분석 ID들을 BE에 넘기면 BE가 presigned URL로
 * 변환해 FastAPI에 전달한다. 결과는 잡 폴링(getAiJobStatus의 resultJson)으로 수신.
 */
export const postRoadmapAssess = async (
    analysisIds: string[],
    merge: boolean,
): Promise<RoadmapAssessJobResponse> => {
    const { data } = await axiosInstance.post<RoadmapAssessJobResponse>(
        API_ENDPOINTS.aiJobs.roadmapAssess,
        { analysisIds, merge },
    );
    return data;
};

const POLL_INTERVAL_MS = 4000;

/** FastAPI 결과는 merge=false면 배열, merge=true면 단건. FE는 단건을 렌더하므로 배열이면 첫 항목. */
function parseAssessment(resultJson: string): RoadmapAssessment {
    const parsed = JSON.parse(resultJson) as RoadmapAssessment | RoadmapAssessment[];
    return Array.isArray(parsed) ? parsed[0] : parsed;
}

/**
 * 로드맵 잡 결과를 폴링한다(BE GET /ai/jobs/{jobId}). DONE이면 resultJson 파싱→onResult,
 * ERROR면 onError. 반환된 함수를 호출하면 폴링을 중단한다.
 */
export function pollRoadmapResult(
    jobId: number,
    onResult: (result: RoadmapAssessment) => void,
    onError: (msg: string) => void,
): () => void {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
        if (cancelled) return;
        try {
            const res = await getAiJobStatus(jobId);
            if (cancelled) return;
            if (res.status === 'DONE') {
                if (!res.resultJson) {
                    onError('완료됐지만 결과가 비어 있습니다.');
                    return;
                }
                try {
                    onResult(parseAssessment(res.resultJson));
                } catch {
                    onError('결과 파싱 오류');
                }
                return;
            }
            if (res.status === 'ERROR') {
                onError(res.errorMessage ?? '로드맵 평가 중 오류가 발생했습니다.');
                return;
            }
            timer = setTimeout(() => void tick(), POLL_INTERVAL_MS); // PENDING → 계속 폴링
        } catch {
            timer = setTimeout(() => void tick(), POLL_INTERVAL_MS); // 일시 오류 무시, 재시도
        }
    };

    timer = setTimeout(() => void tick(), POLL_INTERVAL_MS);
    return () => {
        cancelled = true;
        if (timer) clearTimeout(timer);
    };
}
