"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import StatsWidget from "@/components/StatsWidget";
import { BarChart3, DollarSign, Eye, ListVideo, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

// Define simple types for our future data
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
    const [activeTab, setActiveTab] = useState<"submissions" | "bounties">("submissions");

    // STATE: These are now empty arrays, waiting for real data from Supabase
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [bounties, setBounties] = useState<Bounty[]>([]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>

                {/* Tab Switcher */}
                <div className="bg-zinc-100 p-1 rounded-lg inline-flex">
                    <button
                        onClick={() => setActiveTab("submissions")}
                        className={cn(
                            "px-4 py-2 rounded-md text-sm font-medium transition-all",
                            activeTab === "submissions" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                        )}
                    >
                        My Submissions
                    </button>
                    <button
                        onClick={() => setActiveTab("bounties")}
                        className={cn(
                            "px-4 py-2 rounded-md text-sm font-medium transition-all",
                            activeTab === "bounties" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                        )}
                    >
                        My Bounties (Brand)
                    </button>
                </div>
            </div>

            {/* Conditional Stats Row - Now initialized to Zero */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {activeTab === "submissions" ? (
                    <>
                        <StatsWidget label="Total Earnings" value="$0.00" icon={DollarSign} trend="-- this month" />
                        <StatsWidget label="Total Views" value="0" icon={Eye} trend="-- this month" />
                        <StatsWidget label="Active Submissions" value={submissions.length.toString()} icon={ListVideo} />
                    </>
                ) : (
                    <>
                        <StatsWidget label="Total Spend" value="$0.00" icon={DollarSign} />
                        <StatsWidget label="Active Campaigns" value={bounties.length.toString()} icon={Briefcase} />
                        <StatsWidget label="Pending Approvals" value="0" icon={ListVideo} trend="All caught up" />
                    </>
                )}
            </div>

            {/* Content Table */}
            <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden min-h-[300px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 border-b border-zinc-200">
                            <tr>
                                {activeTab === "submissions" ? (
                                    <>
                                        <th className="px-6 py-4 font-medium text-zinc-500">Bounty Campaign</th>
                                        <th className="px-6 py-4 font-medium text-zinc-500">Status</th>
                                        <th className="px-6 py-4 font-medium text-zinc-500 text-right">Views</th>
                                        <th className="px-6 py-4 font-medium text-zinc-500 text-right">Earnings</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-6 py-4 font-medium text-zinc-500">Campaign Name</th>
                                        <th className="px-6 py-4 font-medium text-zinc-500">Budget Used</th>
                                        <th className="px-6 py-4 font-medium text-zinc-500 text-center">Submissions</th>
                                        <th className="px-6 py-4 font-medium text-zinc-500 text-right">Actions</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {/* LOGIC: If tab is Submissions */}
                            {activeTab === "submissions" && (
                                submissions.length > 0 ? (
                                    submissions.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-zinc-50/50">
                                            <td className="px-6 py-4 font-medium text-zinc-900">{sub.campaignName}</td>
                                            <td className="px-6 py-4"><Badge variant={sub.status === 'Approved' ? 'success' : 'warning'}>{sub.status}</Badge></td>
                                            <td className="px-6 py-4 text-right">{sub.views.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right font-medium">${sub.earnings.toFixed(2)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <ListVideo className="h-8 w-8 text-zinc-300" />
                                                <p>No submissions yet.</p>
                                                <Button size="sm" variant="outline" className="mt-2">Browse Bounties</Button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            )}

                            {/* LOGIC: If tab is Bounties */}
                            {activeTab === "bounties" && (
                                bounties.length > 0 ? (
                                    bounties.map((bounty) => (
                                        <tr key={bounty.id} className="hover:bg-zinc-50/50">
                                            <td className="px-6 py-4 font-medium text-zinc-900">{bounty.title}</td>
                                            <td className="px-6 py-4">
                                                <div className="w-full max-w-[100px] h-2 bg-zinc-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-600" style={{ width: `${(bounty.budgetSpent / bounty.budgetTotal) * 100}%` }}></div>
                                                </div>
                                                <span className="text-xs text-zinc-500 mt-1 block">${bounty.budgetSpent} / ${bounty.budgetTotal}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">{bounty.submissionCount}</td>
                                            <td className="px-6 py-4 text-right"><Button size="sm" variant="outline">Manage</Button></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Briefcase className="h-8 w-8 text-zinc-300" />
                                                <p>You haven't created any campaigns.</p>
                                                <Button size="sm" variant="default" className="mt-2">Create Campaign</Button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
