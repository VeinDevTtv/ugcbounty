import { ArrowRight, DollarSign, Instagram, Youtube, Twitter } from "lucide-react";
import Link from "next/link";
import { Badge } from "./ui/Badge";

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
            className={`group block rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:shadow-md 
            ${isCompleted ? 'opacity-60 grayscale-[0.5]' : 'hover:border-indigo-300'}`}
        >
            <Link
                href={isCompleted ? "#" : `/bounty/${data.id}`}
                className="block"
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-3">
                        <div className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-500">
                            {data.brand.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-semibold text-zinc-900 line-clamp-1 group-hover:text-indigo-600">
                                {data.title}
                            </h3>
                            <p className="text-xs text-zinc-500">{data.brand}</p>
                        </div>
                    </div>
                    {/* Change Badge color if Sold Out */}
                    <Badge variant={isCompleted ? "error" : "success"}>
                        {isCompleted ? "SOLD OUT" : `$${data.payout} / 1k views`}
                    </Badge>
                </div>

                {/* Platforms */}
                <div className="flex items-center gap-2 mb-4 text-zinc-500">
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

                {/* 📊 NEW: BUDGET PROGRESS BAR */}
                <div className="mb-5">
                    <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-zinc-500 font-medium">Budget Used</span>
                        <span className={`font-bold ${isCompleted ? 'text-red-500' : 'text-zinc-700'}`}>
                            {isCompleted ? '100%' : `${data.filled}%`}
                        </span>
                    </div>
                    <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-red-500' : 'bg-indigo-600'}`} 
                            style={{ width: `${data.filled}%` }}
                        ></div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-zinc-100 pt-4 mt-auto">
                    <div className="flex gap-4 text-xs text-zinc-500 font-medium">
                        <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" /> Budget: {data.budget}
                        </span>
                        <span>Ends {data.deadline}</span>
                    </div>
                    {!isCompleted && (
                        <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    )}
                </div>
            </Link>

            {/* Claim Button / Owner State */}
            {!isCompleted && (
                <div className="mt-4 pt-4 border-t border-zinc-100">
                    {isOwner ? (
                        <div className="text-center py-2 px-4 bg-zinc-50 rounded-lg border border-zinc-200">
                            <span className="text-sm font-medium text-zinc-600">Your Bounty</span>
                        </div>
                    ) : data.onClaim ? (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                data.onClaim?.(e);
                            }}
                            className="w-full py-2 px-4 border border-black bg-transparent text-black rounded-lg hover:bg-black hover:text-white transition-colors text-sm font-medium"
                        >
                            Submit for this Bounty
                        </button>
                    ) : (
                        <Link
                            href={`/bounty/${data.id}`}
                            className="block w-full py-2 px-4 border border-black bg-transparent text-black rounded-lg hover:bg-black hover:text-white transition-colors text-sm font-medium text-center"
                        >
                            View Details
                        </Link>
                    )}
                </div>
            )}

            {isCompleted && (
                <div className="mt-4 pt-4 border-t border-zinc-100">
                    <div className="text-center py-2 px-4 bg-green-50 rounded-lg border border-green-500">
                        <span className="text-sm font-medium text-green-700">Bounty Completed</span>
                    </div>
                </div>
            )}
        </div>
    );
}
