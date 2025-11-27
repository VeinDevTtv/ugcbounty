import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { auth } from '@clerk/nextjs/server';
import type { DateRange, BusinessAnalytics, AnalyticsResponse } from '@/types/analytics';
import {
  getDateRange,
  getPreviousDateRange,
  createTimeSeries,
  calculateTrend,
} from '@/lib/analytics';
import type { Database } from '@/types/database.types';

type BountyRow = Database['public']['Tables']['bounties']['Row'];
type SubmissionRow = Database['public']['Tables']['submissions']['Row'];

interface BountyWithSubmissions extends BountyRow {
  submissions?: SubmissionRow[];
}

/**
 * GET /api/analytics/business
 * Get comprehensive analytics for business
 * Query params: dateRange (7d, 30d, 90d, all)
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get date range from query params
    const searchParams = request.nextUrl.searchParams;
    const dateRangeParam = searchParams.get('dateRange') || '30d';
    const dateRange = (['7d', '30d', '90d', 'all'].includes(dateRangeParam) 
      ? dateRangeParam 
      : '30d') as DateRange;

    const { start, end } = getDateRange(dateRange);
    const { start: prevStart, end: prevEnd } = getPreviousDateRange(dateRange);

    // Fetch all bounties created by this user
    const { data: allBounties, error: bountiesError } = await supabaseServer
      .from('bounties')
      .select(`
        *,
        submissions (
          id,
          view_count,
          status,
          earned_amount,
          created_at
        )
      `)
      .eq('creator_id', userId)
      .order('created_at', { ascending: true });

    if (bountiesError) {
      console.error('Error fetching bounties:', bountiesError);
      return NextResponse.json(
        { error: 'Failed to fetch bounties' },
        { status: 500 }
      );
    }

    const bounties = (allBounties || []) as BountyWithSubmissions[];

    // Filter bounties by date range (based on bounty creation date)
    const filteredBounties = bounties.filter((bounty) => {
      const bountyDate = new Date(bounty.created_at);
      return bountyDate >= start && bountyDate <= end;
    });

    // Filter for previous period comparison
    const previousBounties = bounties.filter((bounty) => {
      const bountyDate = new Date(bounty.created_at);
      return bountyDate >= prevStart && bountyDate <= prevEnd;
    });

    // Collect all submissions from filtered bounties
    const allSubmissions: SubmissionRow[] = [];
    filteredBounties.forEach((bounty) => {
      if (bounty.submissions) {
        allSubmissions.push(...bounty.submissions);
      }
    });

    // Filter submissions by date range
    const filteredSubmissions = allSubmissions.filter((sub) => {
      const subDate = new Date(sub.created_at);
      return subDate >= start && subDate <= end;
    });

    // Previous period submissions
    const previousAllSubmissions: SubmissionRow[] = [];
    previousBounties.forEach((bounty) => {
      if (bounty.submissions) {
        previousAllSubmissions.push(...bounty.submissions);
      }
    });

    const previousSubmissions = previousAllSubmissions.filter((sub) => {
      const subDate = new Date(sub.created_at);
      return subDate >= prevStart && subDate <= prevEnd;
    });

    // Calculate spend over time (based on bounty creation and claimed amounts)
    const spendOverTime = createTimeSeries(
      filteredBounties,
      dateRange,
      (items) => {
        // For each bounty, calculate how much has been spent
        return items.reduce((sum, bounty) => {
          const approvedSubmissions = bounty.submissions?.filter(
            (sub) => sub.status === 'approved'
          ) || [];
          
          const totalViews = approvedSubmissions.reduce(
            (s, sub) => s + (Number(sub.view_count) || 0),
            0
          );
          
          const usedBounty = (totalViews / 1000) * Number(bounty.rate_per_1k_views);
          const cappedSpend = Math.min(usedBounty, Number(bounty.total_bounty));
          
          return sum + cappedSpend;
        }, 0);
      }
    );

    // Submission volume over time
    const submissionVolumeOverTime = createTimeSeries(
      filteredSubmissions,
      dateRange,
      (items) => items.length
    );

    // Views over time
    const viewsOverTime = createTimeSeries(
      filteredSubmissions,
      dateRange,
      (items) => items.reduce((sum, sub) => sum + (Number(sub.view_count) || 0), 0)
    );

    // Calculate campaign performance
    const campaignPerformance = filteredBounties.map((bounty) => {
      const approvedSubmissions = bounty.submissions?.filter(
        (sub) => sub.status === 'approved'
      ) || [];
      
      const totalViews = approvedSubmissions.reduce(
        (sum, sub) => sum + (Number(sub.view_count) || 0),
        0
      );
      
      const totalSpend = (totalViews / 1000) * Number(bounty.rate_per_1k_views);
      const cappedSpend = Math.min(totalSpend, Number(bounty.total_bounty));
      
      const roi = cappedSpend > 0 ? totalViews / cappedSpend : 0;
      const budgetUtilization = Number(bounty.total_bounty) > 0
        ? (cappedSpend / Number(bounty.total_bounty)) * 100
        : 0;
      
      const totalSubmissions = bounty.submissions?.length || 0;
      const completedSubmissions = approvedSubmissions.length;
      const completionRate = totalSubmissions > 0
        ? (completedSubmissions / totalSubmissions) * 100
        : 0;

      return {
        id: bounty.id,
        name: bounty.name,
        totalSpend: cappedSpend,
        totalViews,
        submissions: totalSubmissions,
        roi,
        budgetUtilization,
        completionRate,
      };
    });

    // Calculate summary metrics
    const totalSpend = campaignPerformance.reduce(
      (sum, campaign) => sum + campaign.totalSpend,
      0
    );
    const totalViews = filteredSubmissions.reduce(
      (sum, sub) => sum + (Number(sub.view_count) || 0),
      0
    );
    const totalSubmissions = filteredSubmissions.length;
    const averageViewsPerSubmission =
      totalSubmissions > 0 ? totalViews / totalSubmissions : 0;
    
    const totalROI = campaignPerformance.reduce(
      (sum, campaign) => sum + campaign.roi,
      0
    );
    const averageROI = campaignPerformance.length > 0
      ? totalROI / campaignPerformance.length
      : 0;

    const activeCampaigns = filteredBounties.length;
    const completedCampaigns = campaignPerformance.filter(
      (campaign) => campaign.budgetUtilization >= 100
    ).length;
    const completionRate = activeCampaigns > 0
      ? (completedCampaigns / activeCampaigns) * 100
      : 0;

    // Calculate trends (compare to previous period)
    const previousSpend = previousBounties.reduce((sum, bounty) => {
      const approvedSubmissions = bounty.submissions?.filter(
        (sub) => sub.status === 'approved'
      ) || [];
      
      const totalViews = approvedSubmissions.reduce(
        (s, sub) => s + (Number(sub.view_count) || 0),
        0
      );
      
      const usedBounty = (totalViews / 1000) * Number(bounty.rate_per_1k_views);
      const cappedSpend = Math.min(usedBounty, Number(bounty.total_bounty));
      
      return sum + cappedSpend;
    }, 0);

    const previousViews = previousSubmissions.reduce(
      (sum, sub) => sum + (Number(sub.view_count) || 0),
      0
    );
    const previousSubmissionsCount = previousSubmissions.length;

    const spendTrend = calculateTrend(totalSpend, previousSpend);
    const viewsTrend = calculateTrend(totalViews, previousViews);
    const submissionsTrend = calculateTrend(totalSubmissions, previousSubmissionsCount);

    // Build analytics response
    const analytics: BusinessAnalytics = {
      spendOverTime,
      submissionVolumeOverTime,
      viewsOverTime,
      campaignPerformance: campaignPerformance.sort((a, b) => b.totalViews - a.totalViews),
      totalSpend,
      totalViews,
      totalSubmissions,
      averageViewsPerSubmission,
      averageROI,
      activeCampaigns,
      completedCampaigns,
      completionRate,
      spendTrend,
      viewsTrend,
      submissionsTrend,
    };

    const response: AnalyticsResponse<BusinessAnalytics> = {
      data: analytics,
      dateRange,
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/analytics/business:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

