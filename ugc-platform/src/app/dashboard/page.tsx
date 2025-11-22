"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import StatsWidget from "@/components/StatsWidget";
import { BarChart3, DollarSign, Eye, ListVideo, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

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
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"submissions" | "bounties">("submissions");
    const [isLoading, setIsLoading] = useState(true);

    // STATE: Real data from API
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [bounties, setBounties] = useState<Bounty[]>([]);

    // Redirect if not logged in
    useEffect(() => {
        if (isLoaded && !user) {
            router.push("/");
        }
    }, [isLoaded, user, router]);

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
                <h1 className="text-3xl font-bold text-[#F9FAFB]">Dashboard</h1>

                {/* Tab Switcher */}
                <div className="bg-[#1F2933] p-1 rounded-lg inline-flex">
                    <button
                        onClick={() => setActiveTab("submissions")}
                        className={cn(
                            "px-4 py-2 rounded-md text-sm font-medium transition-all",
                            activeTab === "submissions" ? "bg-[#111827] text-[#F9FAFB] shadow-sm" : "text-[#9CA3AF] hover:text-[#F9FAFB]"
                        )}
                    >
                        My Submissions
                    </button>
                    <button
                        onClick={() => setActiveTab("bounties")}
                        className={cn(
                            "px-4 py-2 rounded-md text-sm font-medium transition-all",
                            activeTab === "bounties" ? "bg-[#111827] text-[#F9FAFB] shadow-sm" : "text-[#9CA3AF] hover:text-[#F9FAFB]"
                        )}
                    >
                        My Bounties (Brand)
                    </button>
                </div>
            </div>

            {/* Conditional Stats Row */}
            {isLoading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="h-24 bg-[#111827] rounded-2xl animate-pulse" />
                    <div className="h-24 bg-[#111827] rounded-2xl animate-pulse" />
                    <div className="h-24 bg-[#111827] rounded-2xl animate-pulse" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {activeTab === "submissions" ? (
                        <>
                            <StatsWidget 
                                label="Total Earnings" 
                                value={`$${submissionStats.totalEarnings.toFixed(2)}`} 
                                icon={DollarSign} 
                            />
                            <StatsWidget 
                                label="Total Views" 
                                value={submissionStats.totalViews.toLocaleString()} 
                                icon={Eye} 
                            />
                            <StatsWidget 
                                label="Active Submissions" 
                                value={submissionStats.activeSubmissions.toString()} 
                                icon={ListVideo} 
                            />
                        </>
                    ) : (
                        <>
                            <StatsWidget 
                                label="Total Spend" 
                                value={`$${bountyStats.totalSpend.toFixed(2)}`} 
                                icon={DollarSign} 
                            />
                            <StatsWidget 
                                label="Active Campaigns" 
                                value={bountyStats.activeCampaigns.toString()} 
                                icon={Briefcase} 
                            />
                            <StatsWidget 
                                label="Pending Approvals" 
                                value={bountyStats.pendingApprovals.toString()} 
                                icon={ListVideo} 
                                trend="All caught up" 
                            />
                        </>
                    )}
                </div>
            )}

            {/* Content Table */}
            <div className="rounded-2xl border border-[#1F2933] bg-[#111827] overflow-hidden min-h-[300px] shadow-[0_12px_30px_rgba(15,23,42,0.6)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#1F2933] border-b border-[#1F2933]">
                            <tr>
                                {activeTab === "submissions" ? (
                                    <>
                                        <th className="px-6 py-4 font-medium text-[#9CA3AF]">Bounty Campaign</th>
                                        <th className="px-6 py-4 font-medium text-[#9CA3AF]">Status</th>
                                        <th className="px-6 py-4 font-medium text-[#9CA3AF] text-right">Views</th>
                                        <th className="px-6 py-4 font-medium text-[#9CA3AF] text-right">Earnings</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-6 py-4 font-medium text-[#9CA3AF]">Campaign Name</th>
                                        <th className="px-6 py-4 font-medium text-[#9CA3AF]">Budget Used</th>
                                        <th className="px-6 py-4 font-medium text-[#9CA3AF] text-center">Submissions</th>
                                        <th className="px-6 py-4 font-medium text-[#9CA3AF] text-right">Actions</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-[#9CA3AF]">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#22C55E]"></div>
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
                                        <tr key={sub.id} className="hover:bg-[#1F2933]/50">
                                            <td className="px-6 py-4 font-medium text-[#F9FAFB]">{sub.campaignName}</td>
                                            <td className="px-6 py-4"><Badge variant={sub.status === 'Approved' ? 'success' : 'warning'}>{sub.status}</Badge></td>
                                            <td className="px-6 py-4 text-right text-[#F9FAFB]">{sub.views.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right font-medium text-[#F9FAFB]">${sub.earnings.toFixed(2)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-[#9CA3AF]">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <ListVideo className="h-8 w-8 text-[#9CA3AF]" />
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
                                        <tr key={bounty.id} className="hover:bg-[#1F2933]/50">
                                            <td className="px-6 py-4 font-medium text-[#F9FAFB]">{bounty.title}</td>
                                            <td className="px-6 py-4">
                                                <div className="w-full max-w-[100px] h-2 bg-[#1F2933] rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#22C55E]" style={{ width: `${(bounty.budgetSpent / bounty.budgetTotal) * 100}%` }}></div>
                                                </div>
                                                <span className="text-xs text-[#9CA3AF] mt-1 block">${bounty.budgetSpent} / ${bounty.budgetTotal}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-[#F9FAFB]">{bounty.submissionCount}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={`/bounty/${bounty.id}`}>
                                                    <Button size="sm" variant="outline">Manage</Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-[#9CA3AF]">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Briefcase className="h-8 w-8 text-[#9CA3AF]" />
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
