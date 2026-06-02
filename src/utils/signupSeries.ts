import type { DailySignupType } from '@/types/user.type';
import type { ChartPointType } from '@/components/AdminPortal/UserSignupLineChart';

const MAX_DAYS = 1000; // 과도한 갭 채움 방지 안전장치(매우 긴 구간 런어웨이 차단)

const pad2 = (value: number): string => String(value).padStart(2, '0');
const formatYmd = (date: Date): string =>
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

/**
 * 날짜별 가입자 수를 연속 일 시계열로 변환(가입 없는 날은 0으로 채움).
 * BE는 가입자 있는 날만 반환하므로, x축이 고르게 흐르도록 갭을 메운다.
 */
export const buildDailySeries = (rawList: DailySignupType[]): ChartPointType[] => {
    if (rawList.length === 0) return [];
    const sortedList = [...rawList].sort((a, b) => a.date.localeCompare(b.date));
    const countByDate = new Map(sortedList.map((item) => [item.date, item.count]));

    const series: ChartPointType[] = [];
    const cursor = new Date(`${sortedList[0].date}T00:00:00`);
    const end = new Date(`${sortedList[sortedList.length - 1].date}T00:00:00`);
    let guard = 0;
    while (cursor <= end && guard < MAX_DAYS) {
        const key = formatYmd(cursor);
        series.push({ label: key, value: countByDate.get(key) ?? 0 });
        cursor.setDate(cursor.getDate() + 1);
        guard += 1;
    }
    return series;
};

/** 일별 시계열을 누적 합 시계열로 변환(우상향 성장곡선). */
export const buildCumulativeSeries = (dailySeries: ChartPointType[]): ChartPointType[] => {
    let sum = 0;
    return dailySeries.map((point) => {
        sum += point.value;
        return { label: point.label, value: sum };
    });
};
