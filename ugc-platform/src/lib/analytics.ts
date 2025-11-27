import type { DateRange, TimeSeriesDataPoint } from '@/types/analytics';

/**
 * Get date range boundaries based on date range type
 */
export function getDateRange(dateRange: DateRange): { start: Date; end: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999); // End of today

  const start = new Date();

  switch (dateRange) {
    case '7d':
      start.setDate(start.getDate() - 7);
      break;
    case '30d':
      start.setDate(start.getDate() - 30);
      break;
    case '90d':
      start.setDate(start.getDate() - 90);
      break;
    case 'all':
      // Set to a very early date (e.g., 2020-01-01)
      start.setFullYear(2020, 0, 1);
      break;
  }

  start.setHours(0, 0, 0, 0); // Start of day

  return { start, end };
}

/**
 * Get previous period date range for comparison
 */
export function getPreviousDateRange(dateRange: DateRange): { start: Date; end: Date } {
  const { end: currentEnd } = getDateRange(dateRange);
  const { start: currentStart } = getDateRange(dateRange);

  const periodLength = currentEnd.getTime() - currentStart.getTime();
  const previousEnd = new Date(currentStart);
  previousEnd.setTime(previousEnd.getTime() - 1); // One millisecond before current period
  const previousStart = new Date(previousEnd);
  previousStart.setTime(previousStart.getTime() - periodLength);

  return { start: previousStart, end: previousEnd };
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });
}

/**
 * Format date for ISO string (database queries)
 */
export function formatDateISO(date: Date): string {
  return date.toISOString();
}

/**
 * Group data points by date (daily buckets)
 */
export function groupByDate<T extends { created_at: string }>(
  data: T[],
  dateRange: DateRange
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  const { start, end } = getDateRange(dateRange);

  // Initialize all dates in range with empty arrays
  const currentDate = new Date(start);
  while (currentDate <= end) {
    const dateKey = formatDateKey(currentDate);
    grouped.set(dateKey, []);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Group data by date
  data.forEach((item) => {
    const itemDate = new Date(item.created_at);
    if (itemDate >= start && itemDate <= end) {
      const dateKey = formatDateKey(itemDate);
      const existing = grouped.get(dateKey) || [];
      existing.push(item);
      grouped.set(dateKey, existing);
    }
  });

  return grouped;
}

/**
 * Format date as key (YYYY-MM-DD)
 */
function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Create time series data points from grouped data
 */
export function createTimeSeries<T extends { created_at: string }>(
  data: T[],
  dateRange: DateRange,
  valueExtractor: (items: T[]) => number,
  labelFormatter?: (date: Date) => string
): TimeSeriesDataPoint[] {
  const grouped = groupByDate(data, dateRange);
  const { start, end } = getDateRange(dateRange);

  const series: TimeSeriesDataPoint[] = [];
  const currentDate = new Date(start);

  while (currentDate <= end) {
    const dateKey = formatDateKey(currentDate);
    const items = grouped.get(dateKey) || [];
    const value = valueExtractor(items);
    const label = labelFormatter 
      ? labelFormatter(new Date(currentDate))
      : formatDate(new Date(currentDate));

    series.push({
      date: dateKey,
      value,
      label,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return series;
}

/**
 * Calculate trend (percentage change) between two values
 */
export function calculateTrend(current: number, previous: number): {
  value: number;
  percentage: number;
  isPositive: boolean;
} {
  if (previous === 0) {
    return {
      value: current,
      percentage: current > 0 ? 100 : 0,
      isPositive: current > 0,
    };
  }

  const change = current - previous;
  const percentage = (change / previous) * 100;

  return {
    value: change,
    percentage: Math.abs(percentage),
    isPositive: change >= 0,
  };
}

/**
 * Calculate cumulative time series (running total)
 */
export function createCumulativeTimeSeries(
  series: TimeSeriesDataPoint[]
): TimeSeriesDataPoint[] {
  let cumulative = 0;
  return series.map((point) => {
    cumulative += point.value;
    return {
      ...point,
      value: cumulative,
    };
  });
}

/**
 * Aggregate by platform
 */
export function aggregateByPlatform<T extends { platform: string | null; earned_amount: number; view_count: number }>(
  data: T[]
): Array<{ platform: string; count: number; earnings: number; views: number; percentage: number }> {
  const totals = data.reduce(
    (acc, item) => {
      const platform = item.platform || 'other';
      if (!acc[platform]) {
        acc[platform] = { count: 0, earnings: 0, views: 0 };
      }
      acc[platform].count += 1;
      acc[platform].earnings += Number(item.earned_amount) || 0;
      acc[platform].views += Number(item.view_count) || 0;
      return acc;
    },
    {} as Record<string, { count: number; earnings: number; views: number }>
  );

  const totalCount = data.length;
  return Object.entries(totals).map(([platform, stats]) => ({
    platform: platform as 'youtube' | 'tiktok' | 'instagram' | 'other',
    count: stats.count,
    earnings: stats.earnings,
    views: stats.views,
    percentage: totalCount > 0 ? (stats.count / totalCount) * 100 : 0,
  }));
}

/**
 * Aggregate by status
 */
export function aggregateByStatus<T extends { status: string }>(
  data: T[]
): Array<{ status: string; count: number; percentage: number }> {
  const totals = data.reduce(
    (acc, item) => {
      const status = item.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalCount = data.length;
  return Object.entries(totals).map(([status, count]) => ({
    status: status as 'pending' | 'approved' | 'rejected',
    count,
    percentage: totalCount > 0 ? (count / totalCount) * 100 : 0,
  }));
}

