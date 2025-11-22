import { ArrowRight, DollarSign, Instagram, Youtube, Twitter, Clock } from "lucide-react";
import Link from "next/link";

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
    // Check if campaign is sold out
    const isFull = data.filled >= 100;
    const isOwner = data.isOwner || false;
    const isCompleted = data.isCompleted || isFull;

    return (
        <div
            className={`group block rounded-xl border border-[#E4D5C2] bg-[#FFF8EC] p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1
            ${isCompleted ? 'opacity-60 grayscale-[0.5]' : 'hover:border-[#0F9D58]'}`}
        >
            <Link
                href={isCompleted ? "#" : `/bounty/${data.id}`}
                className="block"
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-3 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className="h-10 w-10 rounded-full bg-[#E2F4E8] flex items-center justify-center text-xs font-bold text-[#0F9D58] flex-shrink-0">
                            {data.brand.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            {/* Title - Bold and prominent */}
                            <h3 className="text-lg font-semibold text-[#2F3A2E] line-clamp-1 group-hover:text-[#0F9D58] transition-colors">
                                {data.title}
                            </h3>
                            {/* User Info: Avatar + Name + Time */}
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-[#6B6A5E] font-medium">{data.brand}</span>
                                <span className="text-[#E4D5C2]">•</span>
                                <span className="text-xs text-[#6B6A5E] flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {data.deadline}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Price Badge - Pill style */}
                    <div className={`flex-shrink-0 ml-3 ${isCompleted ? 'bg-red-50 text-red-700' : 'bg-[#E2F4E8] text-[#0F9D58]'} px-3 py-1 rounded-full text-xs font-bold`}>
                        {isCompleted ? "SOLD OUT" : `$${data.payout} / 1k`}
                    </div>
                </div>

                {/* Platforms */}
                <div className="flex items-center gap-2 mb-4 text-[#6B6A5E]">
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
                        <span className="text-[#6B6A5E] font-medium">Budget Used</span>
                        <span className={`font-bold ${isCompleted ? 'text-red-500' : 'text-[#2F3A2E]'}`}>
                            {isCompleted ? '100%' : `${data.filled}%`}
                        </span>
                    </div>
                    <div className="w-full h-2 bg-[#E4D5C2] rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-red-500' : 'bg-[#0F9D58]'}`} 
                            style={{ width: `${data.filled}%` }}
                        ></div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-[#E4D5C2] pt-4 mt-auto">
                    <div className="flex gap-4 text-xs text-[#6B6A5E] font-medium">
                        <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" /> Budget: {data.budget}
                        </span>
                    </div>
                    {!isCompleted && (
                        <ArrowRight className="h-4 w-4 text-[#E4D5C2] group-hover:text-[#0F9D58] group-hover:translate-x-1 transition-all" />
                    )}
                </div>
            </Link>

            {/* Claim Button / Owner State */}
            {!isCompleted && (
                <div className="mt-4 pt-4 border-t border-[#E4D5C2]">
                    {isOwner ? (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            className="w-full py-2.5 px-4 bg-[#E4D5C2] text-[#2F3A2E] rounded-lg hover:bg-[#D4C5B2] transition-colors text-sm font-medium"
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
                            className="w-full py-2.5 px-4 bg-[#0F9D58] text-white rounded-lg hover:bg-[#0C7A44] transition-colors text-sm font-medium"
                        >
                            Submit for this Bounty
                        </button>
                    ) : (
                        <Link
                            href={`/bounty/${data.id}`}
                            className="block w-full py-2.5 px-4 bg-[#0F9D58] text-white rounded-lg hover:bg-[#0C7A44] transition-colors text-sm font-medium text-center"
                        >
                            View Details
                        </Link>
                    )}
                </div>
            )}

            {isCompleted && (
                <div className="mt-4 pt-4 border-t border-[#E4D5C2]">
                    <div className="text-center py-2.5 px-4 bg-[#E2F4E8] rounded-lg border border-[#0F9D58]/20">
                        <span className="text-sm font-medium text-[#0F9D58]">Bounty Completed</span>
                    </div>
                </div>
            )}
        </div>
    );
}
