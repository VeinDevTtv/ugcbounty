export type DateRange = '7d' | '30d' | '90d' | 'all';

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface PlatformBreakdown {
  platform: 'youtube' | 'tiktok' | 'instagram' | 'other';
  count: number;
  earnings: number;
  views: number;
  percentage: number;
}

export interface StatusBreakdown {
  status: 'pending' | 'approved' | 'rejected';
  count: number;
  percentage: number;
}

export interface TopBounty {
  id: string;
  name: string;
  earnings: number;
  views: number;
  submissions: number;
}

export interface CreatorAnalytics {
  // Time series data
  earningsOverTime: TimeSeriesDataPoint[];
  viewsOverTime: TimeSeriesDataPoint[];
  submissionsOverTime: TimeSeriesDataPoint[];
  
  // Breakdowns
  platformBreakdown: PlatformBreakdown[];
  statusBreakdown: StatusBreakdown[];
  
  // Summary metrics
  totalEarnings: number;
  totalViews: number;
  totalSubmissions: number;
  approvedSubmissions: number;
  averageEarningsPerSubmission: number;
  approvalRate: number;
  
  // Top performers
  topBounties: TopBounty[];
  
  // Trends (compared to previous period)
  earningsTrend: {
    value: number;
    percentage: number;
    isPositive: boolean;
  };
  viewsTrend: {
    value: number;
    percentage: number;
    isPositive: boolean;
  };
  submissionsTrend: {
    value: number;
    percentage: number;
    isPositive: boolean;
  };
}

export interface CampaignPerformance {
  id: string;
  name: string;
  totalSpend: number;
  totalViews: number;
  submissions: number;
  roi: number; // Return on investment (views per dollar)
  budgetUtilization: number; // Percentage
  completionRate: number; // Percentage
}

export interface BusinessAnalytics {
  // Time series data
  spendOverTime: TimeSeriesDataPoint[];
  submissionVolumeOverTime: TimeSeriesDataPoint[];
  viewsOverTime: TimeSeriesDataPoint[];
  
  // Campaign performance
  campaignPerformance: CampaignPerformance[];
  
  // Summary metrics
  totalSpend: number;
  totalViews: number;
  totalSubmissions: number;
  averageViewsPerSubmission: number;
  averageROI: number;
  activeCampaigns: number;
  completedCampaigns: number;
  completionRate: number;
  
  // Trends (compared to previous period)
  spendTrend: {
    value: number;
    percentage: number;
    isPositive: boolean;
  };
  viewsTrend: {
    value: number;
    percentage: number;
    isPositive: boolean;
  };
  submissionsTrend: {
    value: number;
    percentage: number;
    isPositive: boolean;
  };
}

export interface AnalyticsResponse<T> {
  data: T;
  dateRange: DateRange;
  periodStart: string;
  periodEnd: string;
}

