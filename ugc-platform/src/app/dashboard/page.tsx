"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import StatsWidget from "@/components/StatsWidget";
import { BarChart3, DollarSign, Eye, ListVideo, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

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
    const [activeTab, setActiveTab] = useState<"submissions" | "bounties">("submissions");
    const [isLoading, setIsLoading] = useState(true);

    // STATE: Real data from API
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [bounties, setBounties] = useState<Bounty[]>([]);

    // Fetch data when user is loaded
    useEffect(() => {
        if (user && isLoaded) {
            fetchDashboardData();
        }
    }, [user, isLoaded]);

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className={`text-3xl font-bold ${
                    theme === "light" ? "text-gray-900" : "text-[#F5F8FC]"
                }`}>Dashboard</h1>

                {/* Tab Switcher */}
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
            </div>

            {/* Conditional Stats Row */}
            {isLoading ? (
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
                    {activeTab === "submissions" ? (
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
                    ) : (
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
                    )}
                </div>
            )}

            {/* Content Table */}
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
        </div>
    );
}
