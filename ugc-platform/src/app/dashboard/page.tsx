"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import StatsWidget from "@/components/StatsWidget";
import RecommendedBounties from "@/components/RecommendedBounties";
import { BarChart3, DollarSign, Eye, ListVideo, Briefcase, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import type { DateRange, CreatorAnalytics, BusinessAnalytics, AnalyticsResponse } from "@/types/analytics";
import LineChart from "@/components/analytics/LineChart";
import AreaChart from "@/components/analytics/AreaChart";
import BarChart from "@/components/analytics/BarChart";
import PieChart from "@/components/analytics/PieChart";
import MetricCard from "@/components/analytics/MetricCard";

// API Response Types
interface SubmissionFromAPI {
    id: string;
    bounty_id: string;
    user_id: string;
    video_url: string;
    view_count: number;
    earned_amount: number;
    status: "pending" | "approved" | "rejected";
    created_at: string;
    bounties: {
        id: string;
        name: string;
        rate_per_1k_views: number;
    } | null;
}

interface BountyFromAPI {
    id: string;
    name: string;
    description: string;
    total_bounty: number;
    rate_per_1k_views: number;
    calculated_claimed_bounty: number;
    progress_percentage: number;
    total_submission_views: number;
    is_completed: boolean;
    creator_id: string | null;
    created_at: string;
    submissions?: Array<{
        id: string;
        view_count: number;
        status: string;
    }>;
}

// Dashboard Display Types
interface Submission {
    id: string;
    campaignName: string;
    status: "Approved" | "Pending" | "Rejected";
    views: number;
    earnings: number;
}

interface Bounty {
    id: string;
    title: string;
    budgetSpent: number;
    budgetTotal: number;
    submissionCount: number;
}

export default function Dashboard() {
    const { user, isLoaded } = useUser();
    const { theme } = useTheme();
    const [userRole, setUserRole] = useState<'creator' | 'business' | null>(null);
    // Set default tab based on role: creators see submissions, businesses see bounties
    const [activeTab, setActiveTab] = useState<"submissions" | "bounties">("submissions");
    const [viewMode, setViewMode] = useState<"overview" | "analytics">("overview");
    const [dateRange, setDateRange] = useState<DateRange>("30d");
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

    // STATE: Real data from API
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [bounties, setBounties] = useState<Bounty[]>([]);
    
    // STATE: Analytics data
    const [creatorAnalytics, setCreatorAnalytics] = useState<CreatorAnalytics | null>(null);
    const [businessAnalytics, setBusinessAnalytics] = useState<BusinessAnalytics | null>(null);

    // Fetch user role and set default tab
    useEffect(() => {
        const fetchUserRole = async () => {
            if (!user || !isLoaded) {
                return;
            }

            try {
                const response = await fetch('/api/sync-user-profile');
                if (response.ok) {
                    const result = await response.json();
                    const role = result?.data?.role || null;
                    setUserRole(role);
                    // Set default tab based on role
                    if (role === 'business') {
                        setActiveTab('bounties');
                    } else {
                        setActiveTab('submissions');
                    }
                }
            } catch (error) {
                console.error('Error fetching user role:', error);
            }
        };

        fetchUserRole();
    }, [user, isLoaded]);

    // Fetch data when user is loaded
    useEffect(() => {
        if (user && isLoaded) {
            fetchDashboardData();
        }
    }, [user, isLoaded]);

    // Fetch analytics data when view mode is analytics or date range changes
    useEffect(() => {
        if (user && isLoaded && viewMode === "analytics") {
            fetchAnalyticsData();
        }
    }, [user, isLoaded, viewMode, dateRange]);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);

            // Fetch submissions
            const submissionsResponse = await fetch("/api/submissions");
            if (submissionsResponse.ok) {
                const submissionsData: SubmissionFromAPI[] = await submissionsResponse.json();
                const mappedSubmissions: Submission[] = submissionsData.map((sub) => ({
                    id: sub.id,
                    campaignName: sub.bounties?.name || "Unknown Bounty",
                    status: sub.status === "approved" ? "Approved" : sub.status === "rejected" ? "Rejected" : "Pending",
                    views: Number(sub.view_count) || 0,
                    earnings: Number(sub.earned_amount) || 0,
                }));
                setSubmissions(mappedSubmissions);
            }

            // Fetch all bounties and filter by creator_id
            const bountiesResponse = await fetch("/api/bounties");
            if (bountiesResponse.ok) {
                const allBounties: BountyFromAPI[] = await bountiesResponse.json();
                const userBounties = allBounties.filter((bounty) => bounty.creator_id === user?.id);
                
                const mappedBounties: Bounty[] = userBounties.map((bounty) => {
                    // Count submissions for this bounty
                    const submissionCount = bounty.submissions?.length || 0;
                    
                    return {
                        id: bounty.id,
                        title: bounty.name,
                        budgetSpent: Number(bounty.calculated_claimed_bounty) || 0,
                        budgetTotal: Number(bounty.total_bounty) || 0,
                        submissionCount,
                    };
                });
                setBounties(mappedBounties);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAnalyticsData = async () => {
        try {
            setIsLoadingAnalytics(true);
            
            if (userRole === 'creator' || userRole === null) {
                // Fetch creator analytics
                const response = await fetch(`/api/analytics/creator?dateRange=${dateRange}`);
                if (response.ok) {
                    const data: AnalyticsResponse<CreatorAnalytics> = await response.json();
                    setCreatorAnalytics(data.data);
                }
            } else if (userRole === 'business') {
                // Fetch business analytics
                const response = await fetch(`/api/analytics/business?dateRange=${dateRange}`);
                if (response.ok) {
                    const data: AnalyticsResponse<BusinessAnalytics> = await response.json();
                    setBusinessAnalytics(data.data);
                }
            }
        } catch (error) {
            console.error("Error fetching analytics data:", error);
        } finally {
            setIsLoadingAnalytics(false);
        }
    };

    // Calculate stats
    const submissionStats = {
        totalEarnings: submissions.reduce((sum, sub) => sum + sub.earnings, 0),
        totalViews: submissions.reduce((sum, sub) => sum + sub.views, 0),
        activeSubmissions: submissions.filter((sub) => sub.status === "Approved" || sub.status === "Pending").length,
    };

    const bountyStats = {
        totalSpend: bounties.reduce((sum, bounty) => sum + bounty.budgetSpent, 0),
        activeCampaigns: bounties.length,
        pendingApprovals: 0, // This would need to be calculated from submissions if we had that data
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className={`text-3xl font-bold ${
                    theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                }`}>Dashboard</h1>

                    {/* View Mode Toggle */}
                    <div className={`p-1 rounded-lg inline-flex ${
                        theme === "light" ? "bg-gray-200" : "bg-[#010A12]"
                    }`}>
                        <button
                            onClick={() => setViewMode("overview")}
                            className={cn(
                                "px-4 py-2 rounded-md text-sm font-medium transition-all",
                                viewMode === "overview" 
                                    ? theme === "light"
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "bg-[#141B23] text-[#F5F8FC] shadow-sm"
                                    : theme === "light"
                                    ? "text-gray-600 hover:text-gray-900"
                                    : "text-[#B8C5D6] hover:text-[#F5F8FC]"
                            )}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setViewMode("analytics")}
                            className={cn(
                                "px-4 py-2 rounded-md text-sm font-medium transition-all",
                                viewMode === "analytics"
                                    ? theme === "light"
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "bg-[#141B23] text-[#F5F8FC] shadow-sm"
                                    : theme === "light"
                                    ? "text-gray-600 hover:text-gray-900"
                                    : "text-[#B8C5D6] hover:text-[#F5F8FC]"
                            )}
                        >
                            <BarChart3 className="inline h-4 w-4 mr-1" />
                            Analytics
                        </button>
                    </div>
                </div>

                {/* Date Range Selector (only show in analytics mode) */}
                {viewMode === "analytics" && (
                    <div className="flex items-center gap-2">
                        <span className={`text-sm ${
                            theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
                        }`}>Time Period:</span>
                        <div className={`p-1 rounded-lg inline-flex ${
                            theme === "light" ? "bg-gray-200" : "bg-[#010A12]"
                        }`}>
                            {(['7d', '30d', '90d', 'all'] as DateRange[]).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setDateRange(range)}
                                    className={cn(
                                        "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                        dateRange === range
                                            ? theme === "light"
                                                ? "bg-white text-gray-900 shadow-sm"
                                                : "bg-[#141B23] text-[#F5F8FC] shadow-sm"
                                            : theme === "light"
                                            ? "text-gray-600 hover:text-gray-900"
                                            : "text-[#B8C5D6] hover:text-[#F5F8FC]"
                                    )}
                                >
                                    {range === 'all' ? 'All Time' : range.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tab Switcher - Show only in overview mode */}
                {viewMode === "overview" && (
                    <div className="flex justify-end">
                        {(userRole === 'creator' || userRole === null) && (
                            <div className={`p-1 rounded-lg inline-flex ${
                                theme === "light" ? "bg-gray-200" : "bg-[#010A12]"
                            }`}>
                                <button
                                    onClick={() => setActiveTab("submissions")}
                                    className={cn(
                                        "px-4 py-2 rounded-md text-sm font-medium transition-all",
                                        activeTab === "submissions" 
                                            ? theme === "light"
                                                ? "bg-white text-gray-900 shadow-sm"
                                                : "bg-[#141B23] text-[#F5F8FC] shadow-sm"
                                            : theme === "light"
                                            ? "text-gray-600 hover:text-gray-900"
                                            : "text-[#B8C5D6] hover:text-[#F5F8FC]"
                                    )}
                                >
                                    My Submissions
                        </button>
                    </div>
                )}
                {userRole === 'business' && (
                    <div className={`p-1 rounded-lg inline-flex ${
                        theme === "light" ? "bg-gray-200" : "bg-[#010A12]"
                    }`}>
                        <button
                            onClick={() => setActiveTab("bounties")}
                            className={cn(
                                "px-4 py-2 rounded-md text-sm font-medium transition-all",
                                activeTab === "bounties"
                                    ? theme === "light"
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "bg-[#141B23] text-[#F5F8FC] shadow-sm"
                                    : theme === "light"
                                    ? "text-gray-600 hover:text-gray-900"
                                    : "text-[#B8C5D6] hover:text-[#F5F8FC]"
                            )}
                        >
                            My Bounties (Brand)
                        </button>
                    </div>
                )}
            </div>
                )}
            </div>

            {/* Analytics View */}
            {viewMode === "analytics" && (
                <div className="space-y-6">
                    {isLoadingAnalytics ? (
                        <div className="grid grid-cols-1 gap-4">
                            <div className={`h-64 rounded-2xl animate-pulse ${
                                theme === "light" ? "bg-gray-200" : "bg-[#141B23]"
                            }`} />
                        </div>
                    ) : (
                        <>
                            {/* Creator Analytics */}
                            {(userRole === 'creator' || userRole === null) && creatorAnalytics && (
                                <>
                                    {/* Summary Metrics */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <MetricCard
                                            label="Total Earnings"
                                            value={`$${creatorAnalytics.totalEarnings.toFixed(2)}`}
                                            icon={DollarSign}
                                            trend={creatorAnalytics.earningsTrend}
                                        />
                                        <MetricCard
                                            label="Total Views"
                                            value={creatorAnalytics.totalViews.toLocaleString()}
                                            icon={Eye}
                                            trend={creatorAnalytics.viewsTrend}
                                        />
                                        <MetricCard
                                            label="Total Submissions"
                                            value={creatorAnalytics.totalSubmissions}
                                            icon={ListVideo}
                                            trend={creatorAnalytics.submissionsTrend}
                                        />
                                        <MetricCard
                                            label="Approval Rate"
                                            value={`${creatorAnalytics.approvalRate.toFixed(1)}%`}
                                            icon={BarChart3}
                                        />
                                    </div>

                                    {/* Charts Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Earnings Over Time */}
                                        <div className={`rounded-2xl border p-6 ${
                                            theme === "light"
                                                ? "border-gray-200 bg-white shadow-sm"
                                                : "border-[#1A2332] bg-[#141B23] shadow-[0_12px_30px_rgba(0,0,0,0.4)]"
                                        }`}>
                                            <h3 className={`text-lg font-semibold mb-4 ${
                                                theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                                            }`}>Earnings Over Time</h3>
                                            <AreaChart
                                                data={creatorAnalytics.earningsOverTime}
                                                dataKey="value"
                                                name="Earnings"
                                                color={theme === "dark" ? "#60A5FA" : "#1F2937"}
                                            />
                                        </div>

                                        {/* Views Over Time */}
                                        <div className={`rounded-2xl border p-6 ${
                                            theme === "light"
                                                ? "border-gray-200 bg-white shadow-sm"
                                                : "border-[#1A2332] bg-[#141B23] shadow-[0_12px_30px_rgba(0,0,0,0.4)]"
                                        }`}>
                                            <h3 className={`text-lg font-semibold mb-4 ${
                                                theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                                            }`}>Views Over Time</h3>
                                            <AreaChart
                                                data={creatorAnalytics.viewsOverTime}
                                                dataKey="value"
                                                name="Views"
                                                color={theme === "dark" ? "#34D399" : "#059669"}
                                            />
                                        </div>

                                        {/* Platform Breakdown */}
                                        <div className={`rounded-2xl border p-6 ${
                                            theme === "light"
                                                ? "border-gray-200 bg-white shadow-sm"
                                                : "border-[#1A2332] bg-[#141B23] shadow-[0_12px_30px_rgba(0,0,0,0.4)]"
                                        }`}>
                                            <h3 className={`text-lg font-semibold mb-4 ${
                                                theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                                            }`}>Earnings by Platform</h3>
                                            <PieChart
                                                data={creatorAnalytics.platformBreakdown.map(p => ({
                                                    name: p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
                                                    value: p.earnings,
                                                }))}
                                                dataKey="value"
                                                nameKey="name"
                                            />
                                        </div>

                                        {/* Status Breakdown */}
                                        <div className={`rounded-2xl border p-6 ${
                                            theme === "light"
                                                ? "border-gray-200 bg-white shadow-sm"
                                                : "border-[#1A2332] bg-[#141B23] shadow-[0_12px_30px_rgba(0,0,0,0.4)]"
                                        }`}>
                                            <h3 className={`text-lg font-semibold mb-4 ${
                                                theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                                            }`}>Submission Status</h3>
                                            <BarChart
                                                data={creatorAnalytics.statusBreakdown.map(s => ({
                                                    name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
                                                    value: s.count,
                                                }))}
                                                dataKey="value"
                                                name="Submissions"
                                            />
                                        </div>
                                    </div>

                                    {/* Top Bounties Table */}
                                    {creatorAnalytics.topBounties.length > 0 && (
                                        <div className={`rounded-2xl border overflow-hidden ${
                                            theme === "light"
                                                ? "border-gray-200 bg-white shadow-sm"
                                                : "border-[#1A2332] bg-[#141B23] shadow-[0_12px_30px_rgba(0,0,0,0.4)]"
                                        }`}>
                                            <div className={`px-6 py-4 border-b ${
                                                theme === "light" ? "bg-gray-50 border-gray-200" : "bg-[#0A0F17] border-[#1A2332]"
                                            }`}>
                                                <h3 className={`text-lg font-semibold ${
                                                    theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                                                }`}>Top Performing Bounties</h3>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-sm">
                                                    <thead className={`border-b ${
                                                        theme === "light" ? "bg-gray-50 border-gray-200" : "bg-[#0A0F17] border-[#1A2332]"
                                                    }`}>
                                                        <tr>
                                                            <th className={`px-6 py-4 font-medium ${
                                                                theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
                                                            }`}>Bounty</th>
                                                            <th className={`px-6 py-4 font-medium text-right ${
                                                                theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
                                                            }`}>Earnings</th>
                                                            <th className={`px-6 py-4 font-medium text-right ${
                                                                theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
                                                            }`}>Views</th>
                                                            <th className={`px-6 py-4 font-medium text-center ${
                                                                theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
                                                            }`}>Submissions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className={theme === "light" ? "divide-y divide-gray-200" : "divide-y divide-gray-800"}>
                                                        {creatorAnalytics.topBounties.map((bounty) => (
                                                            <tr key={bounty.id} className={theme === "light" ? "hover:bg-gray-50" : "hover:bg-[#0A0F17]/50"}>
                                                                <td className={`px-6 py-4 font-medium ${
                                                                    theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                                                                }`}>{bounty.name}</td>
                                                                <td className={`px-6 py-4 text-right font-medium ${
                                                                    theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                                                                }`}>${bounty.earnings.toFixed(2)}</td>
                                                                <td className={`px-6 py-4 text-right ${
                                                                    theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                                                                }`}>{bounty.views.toLocaleString()}</td>
                                                                <td className={`px-6 py-4 text-center ${
                                                                    theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                                                                }`}>{bounty.submissions}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Business Analytics */}
                            {userRole === 'business' && businessAnalytics && (
                                <>
                                    {/* Summary Metrics */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <MetricCard
                                            label="Total Spend"
                                            value={`$${businessAnalytics.totalSpend.toFixed(2)}`}
                                            icon={DollarSign}
                                            trend={businessAnalytics.spendTrend}
                                        />
                                        <MetricCard
                                            label="Total Views"
                                            value={businessAnalytics.totalViews.toLocaleString()}
                                            icon={Eye}
                                            trend={businessAnalytics.viewsTrend}
                                        />
                                        <MetricCard
                                            label="Active Campaigns"
                                            value={businessAnalytics.activeCampaigns}
                                            icon={Briefcase}
                                        />
                                        <MetricCard
                                            label="Average ROI"
                                            value={businessAnalytics.averageROI.toFixed(2)}
                                            icon={BarChart3}
                                        />
                                    </div>

                                    {/* Charts Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Spend Over Time */}
                                        <div className={`rounded-2xl border p-6 ${
                                            theme === "light"
                                                ? "border-gray-200 bg-white shadow-sm"
                                                : "border-[#1A2332] bg-[#141B23] shadow-[0_12px_30px_rgba(0,0,0,0.4)]"
                                        }`}>
                                            <h3 className={`text-lg font-semibold mb-4 ${
                                                theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                                            }`}>Spend Over Time</h3>
                                            <LineChart
                                                data={businessAnalytics.spendOverTime}
                                                dataKey="value"
                                                name="Spend"
                                                color={theme === "dark" ? "#60A5FA" : "#1F2937"}
                                            />
                                        </div>

                                        {/* Submission Volume */}
                                        <div className={`rounded-2xl border p-6 ${
                                            theme === "light"
                                                ? "border-gray-200 bg-white shadow-sm"
                                                : "border-[#1A2332] bg-[#141B23] shadow-[0_12px_30px_rgba(0,0,0,0.4)]"
                                        }`}>
                                            <h3 className={`text-lg font-semibold mb-4 ${
                                                theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                                            }`}>Submission Volume</h3>
                                            <AreaChart
                                                data={businessAnalytics.submissionVolumeOverTime}
                                                dataKey="value"
                                                name="Submissions"
                                                color={theme === "dark" ? "#34D399" : "#059669"}
                                            />
                                        </div>

                                        {/* Views Over Time */}
                                        <div className={`rounded-2xl border p-6 ${
                                            theme === "light"
                                                ? "border-gray-200 bg-white shadow-sm"
                                                : "border-[#1A2332] bg-[#141B23] shadow-[0_12px_30px_rgba(0,0,0,0.4)]"
                                        }`}>
                                            <h3 className={`text-lg font-semibold mb-4 ${
                                                theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                                            }`}>Views Over Time</h3>
                                            <AreaChart
                                                data={businessAnalytics.viewsOverTime}
                                                dataKey="value"
                                                name="Views"
                                                color={theme === "dark" ? "#FBBF24" : "#D97706"}
                                            />
                                        </div>

                                        {/* Budget Utilization */}
                                        <div className={`rounded-2xl border p-6 ${
                                            theme === "light"
                                                ? "border-gray-200 bg-white shadow-sm"
                                                : "border-[#1A2332] bg-[#141B23] shadow-[0_12px_30px_rgba(0,0,0,0.4)]"
                                        }`}>
                                            <h3 className={`text-lg font-semibold mb-4 ${
                                                theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                                            }`}>Budget Utilization</h3>
                                            <BarChart
                                                data={businessAnalytics.campaignPerformance.slice(0, 10).map(c => ({
                                                    name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
                                                    value: c.budgetUtilization,
                                                }))}
                                                dataKey="value"
                                                name="Utilization %"
                                            />
                                        </div>
                                    </div>

                                    {/* Top Campaigns Table */}
                                    {businessAnalytics.campaignPerformance.length > 0 && (
                                        <div className={`rounded-2xl border overflow-hidden ${
                                            theme === "light"
                                                ? "border-gray-200 bg-white shadow-sm"
                                                : "border-[#1A2332] bg-[#141B23] shadow-[0_12px_30px_rgba(0,0,0,0.4)]"
                                        }`}>
                                            <div className={`px-6 py-4 border-b ${
                                                theme === "light" ? "bg-gray-50 border-gray-200" : "bg-[#0A0F17] border-[#1A2332]"
                                            }`}>
                                                <h3 className={`text-lg font-semibold ${
                                                    theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                                                }`}>Top Performing Campaigns</h3>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-sm">
                                                    <thead className={`border-b ${
                                                        theme === "light" ? "bg-gray-50 border-gray-200" : "bg-[#0A0F17] border-[#1A2332]"
                                                    }`}>
                                                        <tr>
                                                            <th className={`px-6 py-4 font-medium ${
                                                                theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
                                                            }`}>Campaign</th>
                                                            <th className={`px-6 py-4 font-medium text-right ${
                                                                theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
                                                            }`}>Spend</th>
                                                            <th className={`px-6 py-4 font-medium text-right ${
                                                                theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
                                                            }`}>Views</th>
                                                            <th className={`px-6 py-4 font-medium text-right ${
                                                                theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
                                                            }`}>ROI</th>
                                                            <th className={`px-6 py-4 font-medium text-center ${
                                                                theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
                                                            }`}>Utilization</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className={theme === "light" ? "divide-y divide-gray-200" : "divide-y divide-gray-800"}>
                                                        {businessAnalytics.campaignPerformance.slice(0, 10).map((campaign) => (
                                                            <tr key={campaign.id} className={theme === "light" ? "hover:bg-gray-50" : "hover:bg-[#0A0F17]/50"}>
                                                                <td className={`px-6 py-4 font-medium ${
                                                                    theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                                                                }`}>{campaign.name}</td>
                                                                <td className={`px-6 py-4 text-right ${
                                                                    theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                                                                }`}>${campaign.totalSpend.toFixed(2)}</td>
                                                                <td className={`px-6 py-4 text-right ${
                                                                    theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                                                                }`}>{campaign.totalViews.toLocaleString()}</td>
                                                                <td className={`px-6 py-4 text-right font-medium ${
                                                                    theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                                                                }`}>{campaign.roi.toFixed(2)}</td>
                                                                <td className={`px-6 py-4 text-center ${
                                                                    theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                                                                }`}>{campaign.budgetUtilization.toFixed(1)}%</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Overview Mode - Conditional Stats Row */}
            {viewMode === "overview" && (isLoading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className={`h-24 rounded-2xl animate-pulse ${
                        theme === "light" ? "bg-gray-200" : "bg-[#141B23]"
                    }`} />
                    <div className={`h-24 rounded-2xl animate-pulse ${
                        theme === "light" ? "bg-gray-200" : "bg-[#141B23]"
                    }`} />
                    <div className={`h-24 rounded-2xl animate-pulse ${
                        theme === "light" ? "bg-gray-200" : "bg-[#141B23]"
                    }`} />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {(activeTab === "submissions" && (userRole === 'creator' || userRole === null)) ? (
                        <>
                            <StatsWidget 
                                label="Total Earnings" 
                                value={`$${submissionStats.totalEarnings.toFixed(2)}`} 
                                icon={DollarSign}
                                bgColorLight="#1B3C73"
                                bgColorDark="#141B23"
                            />
                            <StatsWidget 
                                label="Total Views" 
                                value={submissionStats.totalViews.toLocaleString()} 
                                icon={Eye}
                                bgColorLight="#1B3C73"
                                bgColorDark="#141B23"
                            />
                            <StatsWidget 
                                label="Active Submissions" 
                                value={submissionStats.activeSubmissions.toString()} 
                                icon={ListVideo}
                                bgColorLight="#1B3C73"
                                bgColorDark="#141B23"
                            />
                        </>
                    ) : (activeTab === "bounties" && userRole === 'business') ? (
                        <>
                            <StatsWidget 
                                label="Total Spend" 
                                value={`$${bountyStats.totalSpend.toFixed(2)}`} 
                                icon={DollarSign}
                                bgColorLight="#1B3C73"
                                bgColorDark="#141B23"
                            />
                            <StatsWidget 
                                label="Active Campaigns" 
                                value={bountyStats.activeCampaigns.toString()} 
                                icon={Briefcase}
                                bgColorLight="#1B3C73"
                                bgColorDark="#141B23"
                            />
                            <StatsWidget 
                                label="Pending Approvals" 
                                value={bountyStats.pendingApprovals.toString()} 
                                icon={ListVideo} 
                                trend="All caught up"
                                bgColorLight="#1B3C73"
                                bgColorDark="#141B23"
                            />
                        </>
                    ) : null}
                </div>
            )}

            {/* Recommended Bounties for Creators */}
            {viewMode === "overview" && (activeTab === "submissions" && (userRole === 'creator' || userRole === null)) && (
                <RecommendedBounties maxItems={3} showTitle={true} />
            )}

            {/* Overview Mode - Content Table */}
            {viewMode === "overview" && (
            <div className={`rounded-2xl border overflow-hidden min-h-[300px] ${
                theme === "light"
                    ? "border-gray-200 bg-white shadow-sm"
                    : "border-[#1A2332] bg-[#141B23] shadow-[0_12px_30px_rgba(0,0,0,0.4)]"
            }`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className={`border-b ${
                            theme === "light" ? "bg-gray-50 border-gray-200" : "bg-[#0A0F17] border-[#1A2332]"
                        }`}>
                            <tr>
                                {activeTab === "submissions" ? (
                                    <>
                                        <th className={`px-6 py-4 font-medium ${
                                            theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
                                        }`}>Bounty Campaign</th>
                                        <th className={`px-6 py-4 font-medium ${
                                            theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
                                        }`}>Status</th>
                                        <th className={`px-6 py-4 font-medium text-right ${
                                            theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
                                        }`}>Views</th>
                                        <th className={`px-6 py-4 font-medium text-right ${
                                            theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
                                        }`}>Earnings</th>
                                    </>
                                ) : (
                                    <>
                                        <th className={`px-6 py-4 font-medium ${
                                            theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
                                        }`}>Campaign Name</th>
                                        <th className={`px-6 py-4 font-medium ${
                                            theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
                                        }`}>Budget Used</th>
                                        <th className={`px-6 py-4 font-medium text-center ${
                                            theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
                                        }`}>Submissions</th>
                                        <th className={`px-6 py-4 font-medium text-right ${
                                            theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
                                        }`}>Actions</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className={theme === "light" ? "divide-y divide-gray-200" : "divide-y divide-gray-800"}>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className={`px-6 py-12 text-center ${
                                                    theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
                                    }`}>
                                        <div className="flex items-center justify-center gap-2">
                                            <div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${
                                                theme === "light" ? "border-[#1F2937]" : "border-[#60A5FA]"
                                            }`}></div>
                                            <span>Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                            <>
                            {/* LOGIC: If tab is Submissions */}
                            {activeTab === "submissions" && (
                                submissions.length > 0 ? (
                                    submissions.map((sub) => (
                                        <tr key={sub.id} className={theme === "light" ? "hover:bg-gray-50" : "hover:bg-[#0A0F17]/50"}>
                                            <td className={`px-6 py-4 font-medium ${
                                                theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                                            }`}>{sub.campaignName}</td>
                                            <td className="px-6 py-4"><Badge variant={sub.status === 'Approved' ? 'success' : 'warning'}>{sub.status}</Badge></td>
                                            <td className={`px-6 py-4 text-right ${
                                                theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                                            }`}>{sub.views.toLocaleString()}</td>
                                            <td className={`px-6 py-4 text-right font-medium ${
                                                theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                                            }`}>${sub.earnings.toFixed(2)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className={`px-6 py-12 text-center ${
                                            theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
                                        }`}>
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <ListVideo className={`h-8 w-8 ${
                                                    theme === "light" ? "text-gray-400" : "text-[#B8C5D6]"
                                                }`} />
                                                <p>No submissions yet.</p>
                                                <Link href="/">
                                                    <Button size="sm" variant="outline" className="mt-2">Browse Bounties</Button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            )}

                            {/* LOGIC: If tab is Bounties */}
                            {activeTab === "bounties" && (
                                bounties.length > 0 ? (
                                    bounties.map((bounty) => (
                                        <tr key={bounty.id} className={theme === "light" ? "hover:bg-gray-50" : "hover:bg-[#0A0F17]/50"}>
                                            <td className={`px-6 py-4 font-medium ${
                                                theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                                            }`}>{bounty.title}</td>
                                            <td className="px-6 py-4">
                                                <div className={`w-full max-w-[100px] h-2 rounded-full overflow-hidden ${
                                                    theme === "light" ? "bg-gray-200" : "bg-[#0A0F17]"
                                                }`}>
                                                    <div className={`h-full ${
                                                        theme === "light" ? "bg-[#1F2937]" : "bg-[#60A5FA]"
                                                    }`} style={{ width: `${(bounty.budgetSpent / bounty.budgetTotal) * 100}%` }}></div>
                                                </div>
                                                <span className={`text-xs mt-1 block ${
                                                    theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
                                                }`}>${bounty.budgetSpent} / ${bounty.budgetTotal}</span>
                                            </td>
                                            <td className={`px-6 py-4 text-center ${
                                                theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                                            }`}>{bounty.submissionCount}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={`/bounty/${bounty.id}`}>
                                                    <Button size="sm" variant="outline">Manage</Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className={`px-6 py-12 text-center ${
                                            theme === "light" ? "text-gray-600" : "text-[#B8C5D6]"
                                        }`}>
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Briefcase className={`h-8 w-8 ${
                                                    theme === "light" ? "text-gray-400" : "text-[#B8C5D6]"
                                                }`} />
                                                <p>You haven't created any campaigns.</p>
                                                <Button 
                                                    size="sm" 
                                                    variant="primary" 
                                                    className="mt-2"
                                                    onClick={() => {
                                                        // Trigger create bounty modal - this will be handled by Header
                                                        // For now, just show alert
                                                        alert("Click 'Create Bounty' in the header to create a new campaign");
                                                    }}
                                                >
                                                    Create Campaign
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            )}
                            </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            )}
        </div>
    );
}
