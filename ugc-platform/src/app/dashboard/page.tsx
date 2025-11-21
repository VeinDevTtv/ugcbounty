"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import StatsWidget from "@/components/StatsWidget";
import { BarChart3, DollarSign, Eye, ListVideo, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState<"submissions" | "bounties">("submissions");

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

            {/* Conditional Stats Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {activeTab === "submissions" ? (
                    <>
                        <StatsWidget label="Total Earnings" value="$1,240.50" icon={DollarSign} trend="+12% this month" />
                        <StatsWidget label="Total Views" value="452.1k" icon={Eye} trend="+5% this month" />
                        <StatsWidget label="Active Submissions" value="3" icon={ListVideo} />
                    </>
                ) : (
                    <>
                        <StatsWidget label="Total Spend" value="$8,500.00" icon={DollarSign} />
                        <StatsWidget label="Active Campaigns" value="2" icon={Briefcase} />
                        <StatsWidget label="Pending Approvals" value="15" icon={ListVideo} trend="Needs attention" />
                    </>
                )}
            </div>

            {/* Content Table */}
            <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
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
                            {activeTab === "submissions" ? (
                                // Creator Rows
                                <>
                                    <tr className="hover:bg-zinc-50/50">
                                        <td className="px-6 py-4 font-medium text-zinc-900">Summer Energy Drink</td>
                                        <td className="px-6 py-4"><Badge variant="success">Approved</Badge></td>
                                        <td className="px-6 py-4 text-right">125.4k</td>
                                        <td className="px-6 py-4 text-right font-medium">$250.80</td>
                                    </tr>
                                    <tr className="hover:bg-zinc-50/50">
                                        <td className="px-6 py-4 font-medium text-zinc-900">Tech Gadget Unbox</td>
                                        <td className="px-6 py-4"><Badge variant="warning">Pending</Badge></td>
                                        <td className="px-6 py-4 text-right">--</td>
                                        <td className="px-6 py-4 text-right font-medium">--</td>
                                    </tr>
                                </>
                            ) : (
                                // Brand Rows
                                <>
                                    <tr className="hover:bg-zinc-50/50">
                                        <td className="px-6 py-4 font-medium text-zinc-900">Winter Collection Launch</td>
                                        <td className="px-6 py-4">
                                            <div className="w-full max-w-[100px] h-2 bg-zinc-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-600 w-[70%]"></div>
                                            </div>
                                            <span className="text-xs text-zinc-500 mt-1 block">$3,500 / $5,000</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">42</td>
                                        <td className="px-6 py-4 text-right"><Button size="sm" variant="outline">Manage</Button></td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Empty State visualizer if list was empty (Optional) */}
                {/* <div className="p-12 text-center text-zinc-500">No data found</div> */}
            </div>
        </div>
    );
}
