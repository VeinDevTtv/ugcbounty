"use client";

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    percentage: number;
    isPositive: boolean;
  };
  bgColorLight?: string;
  bgColorDark?: string;
}

export default function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  bgColorLight,
  bgColorDark,
}: MetricCardProps) {
  const { theme } = useTheme();
  const hasCustomColors = bgColorLight || bgColorDark;
  const defaultBgClass = theme === 'light' ? 'bg-white' : 'bg-[#141B23]';
  
  const isDark = theme === 'dark';
  const textColor = isDark ? '#B8C5D6' : '#6B7A8F';
  const valueColor = isDark ? '#F5F8FC' : '#2E3A47';

  const formattedValue = typeof value === 'number' 
    ? value.toLocaleString('en-US', { maximumFractionDigits: 2 })
    : value;

  return (
    <div
      className={cn(
        'rounded-2xl border p-6 dark:border-[#1A2332] dark:shadow-[0_12px_30px_rgba(0,0,0,0.4)] border-[#C8D1E0]',
        hasCustomColors ? '' : defaultBgClass
      )}
      style={hasCustomColors ? {
        backgroundColor: theme === 'light' ? bgColorLight : bgColorDark
      } : undefined}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium" style={{ color: textColor }}>
          {label}
        </p>
        {Icon && <Icon className="h-5 w-5" style={{ color: textColor }} />}
      </div>
      <div className="flex items-end gap-2">
        <h3 className="text-2xl font-bold" style={{ color: valueColor }}>
          {formattedValue}
        </h3>
        {trend && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium mb-1',
            trend.isPositive ? 'text-green-500' : 'text-red-500'
          )}>
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{trend.percentage.toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

