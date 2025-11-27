"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import type { TimeSeriesDataPoint } from '@/types/analytics';

interface LineChartProps {
  data: TimeSeriesDataPoint[];
  dataKey: string;
  name: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
}

export default function LineChart({
  data,
  dataKey,
  name,
  color,
  height = 300,
  showGrid = true,
  showLegend = false,
}: LineChartProps) {
  const { theme } = useTheme();
  
  const isDark = theme === 'dark';
  const chartColor = color || (isDark ? '#60A5FA' : '#1F2937');
  const textColor = isDark ? '#B8C5D6' : '#6B7A8F';
  const gridColor = isDark ? '#1A2332' : '#E5E7EB';
  const bgColor = isDark ? '#141B23' : '#FFFFFF';

  // Format data for recharts
  const chartData = data.map((point) => ({
    date: point.label || point.date,
    [dataKey]: point.value,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
        <XAxis
          dataKey="date"
          stroke={textColor}
          tick={{ fill: textColor, fontSize: 12 }}
          tickLine={{ stroke: textColor }}
        />
        <YAxis
          stroke={textColor}
          tick={{ fill: textColor, fontSize: 12 }}
          tickLine={{ stroke: textColor }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: bgColor,
            border: `1px solid ${isDark ? '#1A2332' : '#C8D1E0'}`,
            borderRadius: '8px',
            color: isDark ? '#F5F8FC' : '#2E3A47',
          }}
          labelStyle={{ color: textColor }}
        />
        {showLegend && <Legend wrapperStyle={{ color: textColor }} />}
        <Line
          type="monotone"
          dataKey={dataKey}
          name={name}
          stroke={chartColor}
          strokeWidth={2}
          dot={{ fill: chartColor, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

