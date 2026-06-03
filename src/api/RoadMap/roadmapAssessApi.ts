import { axiosInstance } from '@/api/Http/axiosInstance';
import { API_ENDPOINTS } from '@/api/Http/apiEndpoints';
import type { RoadmapAssessment } from '@/types/roadmap.type';

export type RoadmapAssessJobResponse = {
    job_id: string;
};

export const postRoadmapAssess = async (analysisData: unknown): Promise<RoadmapAssessJobResponse> => {
    const { data } = await axiosInstance.post<RoadmapAssessJobResponse>(
        API_ENDPOINTS.roadmap.assess,
        analysisData,
    );
    return data;
};

export function streamRoadmapJob(
    jobId: string,
    onResult: (result: RoadmapAssessment) => void,
    onError: (msg: string) => void,
): () => void {
    const base = import.meta.env.VITE_API_BASE_URL || '';
    const url = `${base}${API_ENDPOINTS.roadmap.stream(jobId)}`;
    let es: EventSource;
    try {
        es = new EventSource(url, { withCredentials: true });
    } catch {
        onError('SSE 연결을 시작할 수 없습니다.');
        return () => {};
    }

    const handleData = (raw: string) => {
        try {
            const parsed = JSON.parse(raw) as RoadmapAssessment;
            onResult(parsed);
            es.close();
        } catch {
            onError('결과 파싱 오류');
            es.close();
        }
    };

    es.addEventListener('message', (ev) => handleData((ev as MessageEvent).data));
    es.addEventListener('result', (ev) => handleData((ev as MessageEvent).data));
    es.addEventListener('done', (ev) => handleData((ev as MessageEvent).data));

    es.onerror = () => {
        onError('SSE 연결 오류가 발생했습니다.');
        es.close();
    };

    return () => es.close();
}
