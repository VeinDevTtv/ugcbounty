import { ArrowRight, DollarSign, Instagram, Youtube, Twitter, Clock } from "lucide-react";
import Link from "next/link";

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
  const isFull = data.filled >= 100;
  const isOwner = data.isOwner || false;
  const isCompleted = data.isCompleted || isFull;

  return (
    <div
      className={`group block rounded-xl border border-[#D8E1EB] bg-[#F7FAFC] p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1
        ${isCompleted ? "opacity-60 grayscale-[0.3]" : "hover:border-[#1B263B]"}
      `}
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
              <div className="h-10 w-10 rounded-full bg-white border border-[#D9E2EC] flex items-center justify-center overflow-hidden flex-shrink-0">
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
                      parent.className = 'h-10 w-10 rounded-full bg-[#D9E2EC] flex items-center justify-center text-xs font-semibold text-[#1B263B] flex-shrink-0';
                      parent.textContent = data.brand.substring(0, 2).toUpperCase();
                    }
                  }}
                />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-[#D9E2EC] flex items-center justify-center text-xs font-semibold text-[#1B263B] flex-shrink-0">
                {data.brand.substring(0, 2).toUpperCase()}
              </div>
            )}

            {/* Title + brand */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-[#0D1B2A] line-clamp-1 group-hover:text-[#415A77] transition-colors">
                {data.title}
              </h3>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-[#52677C] font-medium">{data.brand}</span>
                <span className="text-[#C1CCD9]">•</span>
                <span className="text-xs text-[#52677C] flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {data.deadline}
                </span>
              </div>
            </div>
          </div>

          {/* Price badge */}
          <div
            className={`flex-shrink-0 ml-3 px-3 py-1 rounded-full text-xs font-bold
              ${
                isCompleted
                  ? "bg-red-100 text-red-500 border border-red-300"
                  : "bg-[#E8EEF5] text-[#1B263B] border border-[#C7D3E0]"
              }
            `}
          >
            {isCompleted ? "SOLD OUT" : `$${data.payout} / 1k`}
          </div>
        </div>

        {/* Platforms */}
        <div className="flex items-center gap-2 mb-4 text-[#52677C]">
          {data.platforms.includes("instagram") && <Instagram className="h-4 w-4" />}
          {data.platforms.includes("youtube") && <Youtube className="h-4 w-4" />}
          {data.platforms.includes("tiktok") && (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 1 0 7.73 6.61V6.29a4.79 4.79 0 0 0 .9.08v-2.91a4.85 4.85 0 0 0 .6.02z" />
            </svg>
          )}
          {data.platforms.includes("twitter") && <Twitter className="h-4 w-4" />}
          <span className="text-xs ml-1">+ Requirements</span>
        </div>

        {/* Progress Bar */}
        <div className="mb-5">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-[#52677C] font-medium">Budget Used</span>
            <span className={`font-semibold ${isCompleted ? "text-red-500" : "text-[#1B263B]"}`}>
              {isCompleted ? "100%" : `${data.filled}%`}
            </span>
          </div>

          <div className="w-full h-2 bg-[#E1E8F0] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted ? "bg-red-500" : "bg-[#415A77]"
              }`}
              style={{ width: `${data.filled}%` }}
            ></div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#D9E2EC] pt-4 mt-auto">
          <span className="flex items-center gap-1 text-xs text-[#52677C] font-medium">
            <DollarSign className="h-3 w-3" /> Budget: {data.budget}
          </span>

          {!isCompleted && (
            <ArrowRight className="h-4 w-4 text-[#415A77] group-hover:text-[#1B263B] transition-all" />
          )}
        </div>
      </Link>

      {/* Action Buttons */}
      {!isCompleted && (
        <div className="mt-4 pt-4 border-t border-[#D9E2EC]">
          {isOwner ? (
            <button
              className="w-full py-2.5 bg-[#C7D3E0] text-[#1B263B] rounded-lg hover:bg-[#B6C3D2] transition-colors text-sm font-medium"
            >
              Manage Bounty
            </button>
          ) : data.onClaim ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                data.onClaim?.(e);
              }}
              className="w-full py-2.5 bg-[#A5B8D9] text-[#0D1B2A] rounded-lg hover:bg-[#8EA6C6] transition-colors text-sm font-medium"
            >
              Submit for this Bounty
            </button>
          ) : (
            <Link
              href={`/bounty/${data.id}`}
              className="block w-full py-2.5 bg-[#A5B8D9] text-[#0D1B2A] rounded-lg hover:bg-[#8EA6C6] transition-colors text-sm font-medium text-center"
            >
              View Details
            </Link>
          )}
        </div>
      )}

      {isCompleted && (
        <div className="mt-4 pt-4 border-t border-[#D9E2EC]">
          <div className="text-center py-2.5 bg-[#E8EEF5] rounded-lg border border-[#C7D3E0]">
            <span className="text-sm font-medium text-[#415A77]">Bounty Completed</span>
          </div>
        </div>
      )}
    </div>
  );
}
