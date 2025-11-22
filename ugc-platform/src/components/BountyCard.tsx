import { ArrowRight, DollarSign, Instagram, Youtube, Twitter, Clock } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

// Updated interface to include 'filled' percentage
interface BountyProps {
    id: string;
    title: string;
    brand: string;
    payout: string;
    platforms: ("instagram" | "tiktok" | "youtube" | "twitter")[];
    budget: string;
    deadline: string;
    filled: number; // <--- Added this (0 to 100)
    isOwner?: boolean;
    isCompleted?: boolean;
    onClaim?: (e: React.MouseEvent) => void;
}

export default function BountyCard({ data }: { data: BountyProps }) {
    const { theme } = useTheme();
    // Check if campaign is sold out
    const isFull = data.filled >= 100;
    const isOwner = data.isOwner || false;
    const isCompleted = data.isCompleted || isFull;

    return (
        <div
            className={`group block rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 ${
                theme === "light"
                    ? `bg-white border-gray-200 shadow-sm hover:shadow-md ${
                        isCompleted ? 'opacity-60 grayscale-[0.5]' : 'hover:border-[#1F2937]'
                      }`
                    : `border-[#010A12] bg-[#1F2937] shadow-[0_12px_30px_rgba(15,23,42,0.6)] hover:shadow-[0_16px_40px_rgba(15,23,42,0.8)] ${
                        isCompleted ? 'opacity-60 grayscale-[0.5]' : 'hover:border-[#10B981]/30'
                      }`
            }`}
        >
            <Link
                href={isCompleted ? "#" : `/bounty/${data.id}`}
                className="block"
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-3 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            theme === "light"
                                ? "bg-gray-200 text-gray-700"
                                : "bg-[#010A12] text-[#FFFFFF]"
                        }`}>
                            {data.brand.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            {/* Title - Bold and prominent */}
                            <h3 className={`text-lg font-semibold line-clamp-1 transition-colors ${
                                theme === "light"
                                    ? "text-gray-900 group-hover:text-[#1F2937]"
                                    : "text-[#FFFFFF] group-hover:text-[#10B981]"
                            }`}>
                                {data.title}
                            </h3>
                            {/* User Info: Avatar + Name + Time */}
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs font-medium ${
                                    theme === "light" ? "text-gray-600" : "text-[#CFCFCF]"
                                }`}>{data.brand}</span>
                                <span className={theme === "light" ? "text-gray-400" : "text-[#010A12]"}>•</span>
                                <span className={`text-xs flex items-center gap-1 ${
                                    theme === "light" ? "text-gray-600" : "text-[#CFCFCF]"
                                }`}>
                                    <Clock className="h-3 w-3" />
                                    {data.deadline}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Price Badge - Pill style */}
                    <div className={`flex-shrink-0 ml-3 px-3 py-1 rounded-full text-xs font-bold ${
                        isCompleted 
                            ? 'bg-red-900/30 text-red-400' 
                            : theme === "light"
                            ? 'bg-[#1F2937] text-white'
                            : 'bg-[rgba(16,185,129,0.12)] text-[#FFFFFF] border border-[#10B981]'
                    }`}>
                        {isCompleted ? "SOLD OUT" : `$${data.payout} / 1k`}
                    </div>
                </div>

                {/* Platforms */}
                <div className={`flex items-center gap-2 mb-4 ${
                    theme === "light" ? "text-gray-500" : "text-[#CFCFCF]"
                }`}>
                    {data.platforms.includes("instagram") && <Instagram className="h-4 w-4" />}
                    {data.platforms.includes("youtube") && <Youtube className="h-4 w-4" />}
                    {data.platforms.includes("tiktok") && (
                        // Custom TikTok icon since Lucide sometimes misses it, or map it to another icon
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 1 0 7.73 6.61V6.29a4.79 4.79 0 0 0 .9.08v-2.91a4.85 4.85 0 0 0 .6.02z" />
                        </svg>
                    )}
                     {data.platforms.includes("twitter") && <Twitter className="h-4 w-4" />}
                    <span className="text-xs ml-1">+ Requirements</span>
                </div>

                {/* Budget Progress Bar - Improved styling */}
                <div className="mb-5">
                    <div className="flex justify-between text-xs mb-1.5">
                        <span className={`font-medium ${
                            theme === "light" ? "text-gray-600" : "text-[#CFCFCF]"
                        }`}>Budget Used</span>
                        <span className={`font-bold ${
                            isCompleted 
                                ? 'text-red-400' 
                                : theme === "light" 
                                ? 'text-gray-900' 
                                : 'text-[#FFFFFF]'
                        }`}>
                            {isCompleted ? '100%' : `${data.filled}%`}
                        </span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${
                        theme === "light" ? "bg-gray-200" : "bg-[#010A12]"
                    }`}>
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                                isCompleted ? 'bg-red-500' : 'bg-[#1F2937]'
                            }`} 
                            style={{ width: `${data.filled}%` }}
                        ></div>
                    </div>
                </div>

                {/* Footer */}
                <div className={`flex items-center justify-between border-t pt-4 mt-auto ${
                    theme === "light" ? "border-gray-200" : "border-[#010A12]"
                }`}>
                    <div className={`flex gap-4 text-xs font-medium ${
                        theme === "light" ? "text-gray-600" : "text-[#CFCFCF]"
                    }`}>
                        <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" /> Budget: {data.budget}
                        </span>
                    </div>
                    {!isCompleted && (
                        <ArrowRight className={`h-4 w-4 group-hover:translate-x-1 transition-all ${
                            theme === "light"
                                ? "text-gray-400 group-hover:text-[#1F2937]"
                                : "text-[#010A12] group-hover:text-[#10B981]"
                        }`} />
                    )}
                </div>
            </Link>

            {/* Claim Button / Owner State */}
            {!isCompleted && (
                <div className={`mt-4 pt-4 border-t ${
                    theme === "light" ? "border-gray-200" : "border-[#010A12]"
                }`}>
                    {isOwner ? (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            className={`w-full py-2.5 px-4 rounded-lg transition-colors text-sm font-medium ${
                                theme === "light"
                                    ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                                    : "bg-[#010A12] text-[#FFFFFF] hover:bg-[#020A1A]"
                            }`}
                        >
                            Manage Bounty
                        </button>
                    ) : data.onClaim ? (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                data.onClaim?.(e);
                            }}
                            className="w-full py-2.5 px-4 bg-[#1F2937] text-[#FFFFFF] rounded-full hover:bg-[#2A3441] transition-colors text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1F2937]/50"
                        >
                            Submit for this Bounty
                        </button>
                    ) : (
                        <Link
                            href={`/bounty/${data.id}`}
                            className="block w-full py-2.5 px-4 bg-[#1F2937] text-[#FFFFFF] rounded-full hover:bg-[#2A3441] transition-colors text-sm font-semibold text-center focus:outline-none focus:ring-2 focus:ring-[#1F2937]/50"
                        >
                            View Details
                        </Link>
                    )}
                </div>
            )}

            {isCompleted && (
                <div className={`mt-4 pt-4 border-t ${
                    theme === "light" ? "border-gray-200" : "border-[#010A12]"
                }`}>
                    <div className={`text-center py-2.5 px-4 rounded-lg border ${
                        theme === "light"
                            ? "bg-gray-100 border-gray-300"
                            : "bg-[rgba(16,185,129,0.12)] border-[#10B981]"
                    }`}>
                        <span className={`text-sm font-medium ${
                            theme === "light" ? "text-gray-700" : "text-[#FFFFFF]"
                        }`}>Bounty Completed</span>
                    </div>
                </div>
            )}
        </div>
    );
}
