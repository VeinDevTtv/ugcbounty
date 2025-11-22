import { ArrowRight, DollarSign, Instagram, Youtube, Twitter, Clock } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

interface BountyProps {
  id: string;
  title: string;
  brand: string;
  payout: string;
  platforms: ("instagram" | "tiktok" | "youtube" | "twitter")[];
  budget: string;
  deadline: string;
  filled: number;
  logoUrl?: string | null;
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
                    ? `bg-white border-[#C8D1E0] shadow-sm hover:shadow-md ${
                        isCompleted ? 'opacity-60 grayscale-[0.5]' : 'hover:border-[#1B3C73]'
                      }`
                    : `border-[#1A2332] bg-[#141B23] shadow-[0_12px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)] ${
                        isCompleted ? 'opacity-60 grayscale-[0.5]' : 'hover:border-[#60A5FA]/30'
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
                        {data.logoUrl ? (
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ${
                                theme === "light"
                                    ? "bg-white border border-[#D9E2EC]"
                                    : "bg-[#0A0F17] border border-[#1A2332]"
                            }`}>
                                <img
                                    src={data.logoUrl}
                                    alt={data.brand}
                                    className="w-full h-full object-contain p-1"
                                    onError={(e) => {
                                        // Fallback to initials if image fails to load
                                        const target = e.currentTarget;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent) {
                                            parent.className = `h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                                theme === "light"
                                                    ? "bg-[#DDE5F2] text-[#2E3A47]"
                                                    : "bg-[#0A0F17] text-[#F5F8FC]"
                                            }`;
                                            parent.textContent = data.brand.substring(0, 2).toUpperCase();
                                        }
                                    }}
                                />
                            </div>
                        ) : (
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                theme === "light"
                                    ? "bg-[#DDE5F2] text-[#2E3A47]"
                                    : "bg-[#0A0F17] text-[#F5F8FC]"
                            }`}>
                                {data.brand.substring(0, 2).toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            {/* Title - Bold and prominent */}
                            <h3 className={`text-lg font-semibold line-clamp-1 transition-colors ${
                                theme === "light"
                                    ? "text-[#2E3A47] group-hover:text-[#1B3C73]"
                                    : "text-[#F5F8FC] group-hover:text-[#60A5FA]"
                            }`}>
                                {data.title}
                            </h3>
                            {/* User Info: Avatar + Name + Time */}
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs font-medium ${
                                    theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
                                }`}>{data.brand}</span>
                                <span className={theme === "light" ? "text-[#C1CCD9]" : "text-[#1A2332]"}>•</span>
                                <span className={`text-xs flex items-center gap-1 ${
                                    theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
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
                            ? 'dark:bg-red-900/30 dark:text-red-400 bg-red-100 text-red-500 border border-red-300' 
                            : theme === "light"
                            ? 'bg-[#1B3C73] text-white'
                            : 'bg-[rgba(96,165,250,0.12)] text-[#F5F8FC] border border-[#60A5FA]'
                    }`}>
                        {isCompleted ? "SOLD OUT" : `$${data.payout} / 1k`}
                    </div>
                </div>

                {/* Platforms */}
                <div className={`flex items-center gap-2 mb-4 ${
                                    theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
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
                                    theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
                        }`}>Budget Used</span>
                        <span className={`font-bold ${
                            isCompleted 
                                ? 'text-red-400' 
                                : theme === "light" 
                                ? 'text-[#2E3A47]' 
                                : 'text-[#F5F8FC]'
                        }`}>
                            {isCompleted ? '100%' : `${data.filled}%`}
                        </span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${
                        theme === "light" ? "bg-[#E1E8F0]" : "bg-[#0A0F17]"
                    }`}>
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                                isCompleted ? 'bg-red-500' : theme === "light" ? 'bg-[#1B3C73]' : 'bg-[#60A5FA]'
                            }`} 
                            style={{ width: `${data.filled}%` }}
                        ></div>
                    </div>
                </div>

                {/* Footer */}
                <div className={`flex items-center justify-between border-t pt-4 mt-auto ${
                    theme === "light" ? "border-[#C8D1E0]" : "border-[#1A2332]"
                }`}>
                    <div className={`flex gap-4 text-xs font-medium ${
                                    theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
                    }`}>
                        <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" /> Budget: {data.budget}
                        </span>
                    </div>
                    {!isCompleted && (
                        <ArrowRight className={`h-4 w-4 group-hover:translate-x-1 transition-all ${
                            theme === "light"
                                ? "text-[#52677C] group-hover:text-[#1B3C73]"
                                : "text-[#64748B] group-hover:text-[#60A5FA]"
                        }`} />
                    )}
                </div>
            </Link>

            {/* Claim Button / Owner State */}
            {!isCompleted && (
                <div className={`mt-4 pt-4 border-t ${
                    theme === "light" ? "border-[#C8D1E0]" : "border-[#1A2332]"
                }`}>
                    {isOwner ? (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            className={`w-full py-2.5 px-4 rounded-lg transition-colors text-sm font-medium ${
                                theme === "light"
                                    ? "bg-[#DDE5F2] text-[#2E3A47] hover:bg-[#C7D3E0]"
                                    : "bg-[#1A2332] text-[#F5F8FC] hover:bg-[#252F3F]"
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
                            className={`w-full py-2.5 px-4 rounded-full transition-colors text-sm font-semibold focus:outline-none focus:ring-2 ${
                                theme === "light"
                                    ? "bg-[#1B3C73] text-white hover:bg-[#102B52] focus:ring-[#1B3C73]/50"
                                    : "bg-[#60A5FA] text-[#FFFFFF] hover:bg-[#3B82F6] focus:ring-[#60A5FA]/50"
                            }`}
                        >
                            SUBMIT CONTENT
                        </button>
                    ) : (
                        <Link
                            href={`/bounty/${data.id}`}
                            className={`block w-full py-2.5 px-4 rounded-full transition-colors text-sm font-semibold text-center focus:outline-none focus:ring-2 ${
                                theme === "light"
                                    ? "bg-[#1B3C73] text-white hover:bg-[#102B52] focus:ring-[#1B3C73]/50"
                                    : "bg-[#60A5FA] text-[#FFFFFF] hover:bg-[#3B82F6] focus:ring-[#60A5FA]/50"
                            }`}
                        >
                            View Details
                        </Link>
                    )}
                </div>
            )}

            {isCompleted && (
                <div className={`mt-4 pt-4 border-t ${
                    theme === "light" ? "border-[#C8D1E0]" : "border-[#1A2332]"
                }`}>
                    <div className={`text-center py-2.5 px-4 rounded-lg border ${
                        theme === "light"
                            ? "bg-[#F7FAFC] border-[#C8D1E0]"
                            : "bg-[rgba(96,165,250,0.12)] border-[#60A5FA]"
                    }`}>
                        <span className={`text-sm font-medium ${
                            theme === "light" ? "text-[#2E3A47]" : "text-[#FFFFFF]"
                        }`}>Bounty Completed</span>
                    </div>
                </div>
            )}
        </div>
    );
}
