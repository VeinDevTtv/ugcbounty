import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { auth } from '@clerk/nextjs/server';
import type { DateRange, CreatorAnalytics, AnalyticsResponse } from '@/types/analytics';
import {
  getDateRange,
  getPreviousDateRange,
  createTimeSeries,
  createCumulativeTimeSeries,
  calculateTrend,
  aggregateByPlatform,
  aggregateByStatus,
} from '@/lib/analytics';
import type { Database } from '@/types/database.types';

type SubmissionRow = Database['public']['Tables']['submissions']['Row'];
type BountyRow = Database['public']['Tables']['bounties']['Row'];

interface SubmissionWithBounty extends SubmissionRow {
  bounties: Pick<BountyRow, 'id' | 'name' | 'rate_per_1k_views'> | null;
}

/**
 * GET /api/analytics/creator
 * Get comprehensive analytics for creator
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

    // Fetch all submissions for user
    const { data: allSubmissions, error: submissionsError } = await supabaseServer
      .from('submissions')
      .select(`
        *,
        bounties (
          id,
          name,
          rate_per_1k_views
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError);
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      );
    }

    const submissions = (allSubmissions || []) as SubmissionWithBounty[];

    // Filter submissions by date range
    const filteredSubmissions = submissions.filter((sub) => {
      const subDate = new Date(sub.created_at);
      return subDate >= start && subDate <= end;
    });

    // Filter for previous period comparison
    const previousSubmissions = submissions.filter((sub) => {
      const subDate = new Date(sub.created_at);
      return subDate >= prevStart && subDate <= prevEnd;
    });

    // Calculate time series data
    const earningsOverTime = createTimeSeries(
      filteredSubmissions,
      dateRange,
      (items) => items.reduce((sum, item) => sum + (Number(item.earned_amount) || 0), 0)
    );

    const viewsOverTime = createTimeSeries(
      filteredSubmissions,
      dateRange,
      (items) => items.reduce((sum, item) => sum + (Number(item.view_count) || 0), 0)
    );

    const submissionsOverTime = createTimeSeries(
      filteredSubmissions,
      dateRange,
      (items) => items.length
    );

    // Calculate cumulative totals
    const cumulativeEarnings = createCumulativeTimeSeries(earningsOverTime);
    const cumulativeViews = createCumulativeTimeSeries(viewsOverTime);

    // Calculate summary metrics
    const totalEarnings = filteredSubmissions.reduce(
      (sum, sub) => sum + (Number(sub.earned_amount) || 0),
      0
    );
    const totalViews = filteredSubmissions.reduce(
      (sum, sub) => sum + (Number(sub.view_count) || 0),
      0
    );
    const totalSubmissions = filteredSubmissions.length;
    const approvedSubmissions = filteredSubmissions.filter(
      (sub) => sub.status === 'approved'
    ).length;

    const averageEarningsPerSubmission =
      totalSubmissions > 0 ? totalEarnings / totalSubmissions : 0;
    const approvalRate =
      totalSubmissions > 0 ? (approvedSubmissions / totalSubmissions) * 100 : 0;

    // Calculate trends (compare to previous period)
    const previousEarnings = previousSubmissions.reduce(
      (sum, sub) => sum + (Number(sub.earned_amount) || 0),
      0
    );
    const previousViews = previousSubmissions.reduce(
      (sum, sub) => sum + (Number(sub.view_count) || 0),
      0
    );
    const previousSubmissionsCount = previousSubmissions.length;

    const earningsTrend = calculateTrend(totalEarnings, previousEarnings);
    const viewsTrend = calculateTrend(totalViews, previousViews);
    const submissionsTrend = calculateTrend(totalSubmissions, previousSubmissionsCount);

    // Platform breakdown
    const platformBreakdown = aggregateByPlatform(filteredSubmissions);

    // Status breakdown
    const statusBreakdown = aggregateByStatus(filteredSubmissions);

    // Top bounties by earnings
    const bountyEarnings = new Map<string, {
      id: string;
      name: string;
      earnings: number;
      views: number;
      submissions: number;
    }>();

    filteredSubmissions.forEach((sub) => {
      if (sub.bounties) {
        const bountyId = sub.bounties.id;
        const existing = bountyEarnings.get(bountyId) || {
          id: bountyId,
          name: sub.bounties.name,
          earnings: 0,
          views: 0,
          submissions: 0,
        };

        existing.earnings += Number(sub.earned_amount) || 0;
        existing.views += Number(sub.view_count) || 0;
        existing.submissions += 1;

        bountyEarnings.set(bountyId, existing);
      }
    });

    const topBounties = Array.from(bountyEarnings.values())
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5)
      .map((bounty) => ({
        id: bounty.id,
        name: bounty.name,
        earnings: bounty.earnings,
        views: bounty.views,
        submissions: bounty.submissions,
      }));

    // Build analytics response
    const analytics: CreatorAnalytics = {
      earningsOverTime: cumulativeEarnings,
      viewsOverTime: cumulativeViews,
      submissionsOverTime,
      platformBreakdown,
      statusBreakdown,
      totalEarnings,
      totalViews,
      totalSubmissions,
      approvedSubmissions,
      averageEarningsPerSubmission,
      approvalRate,
      topBounties,
      earningsTrend,
      viewsTrend,
      submissionsTrend,
    };

    const response: AnalyticsResponse<CreatorAnalytics> = {
      data: analytics,
      dateRange,
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/analytics/creator:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

