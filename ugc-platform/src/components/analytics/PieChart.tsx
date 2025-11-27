"use client";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

interface PieChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface PieChartProps {
  data: PieChartData[];
  dataKey: string;
  nameKey: string;
  height?: number;
  showLegend?: boolean;
  colors?: string[];
}

const DEFAULT_COLORS = [
  '#60A5FA', // blue
  '#34D399', // green
  '#FBBF24', // yellow
  '#F87171', // red
  '#A78BFA', // purple
  '#FB7185', // pink
];

export default function PieChart({
  data,
  dataKey,
  nameKey,
  height = 300,
  showLegend = true,
  colors = DEFAULT_COLORS,
}: PieChartProps) {
  const { theme } = useTheme();
  
  const isDark = theme === 'dark';
  const textColor = isDark ? '#B8C5D6' : '#6B7A8F';
  const bgColor = isDark ? '#141B23' : '#FFFFFF';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey={dataKey}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: bgColor,
            border: `1px solid ${isDark ? '#1A2332' : '#C8D1E0'}`,
            borderRadius: '8px',
            color: isDark ? '#F5F8FC' : '#2E3A47',
          }}
          labelStyle={{ color: textColor }}
        />
        {showLegend && (
          <Legend
            wrapperStyle={{ color: textColor }}
            formatter={(value) => value}
          />
        )}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}

