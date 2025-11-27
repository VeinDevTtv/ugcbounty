"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BountyCard from "./BountyCard";
import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "@clerk/nextjs";
import { Sparkles, TrendingUp, ArrowRight } from "lucide-react";
import type { BountyRecommendation } from "@/types/recommendations";

interface RecommendedBountiesProps {
  maxItems?: number;
  showTitle?: boolean;
}

export default function RecommendedBounties({ 
  maxItems = 6,
  showTitle = true 
}: RecommendedBountiesProps) {
  const { theme } = useTheme();
  const { user, isLoaded } = useUser();
  const [recommendations, setRecommendations] = useState<BountyRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    
    // Only fetch recommendations for authenticated users
    if (!user) {
      setIsLoading(false);
      return;
    }

    fetchRecommendations();
  }, [user, isLoaded]);

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("/api/bounties/recommendations");
      
      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }
      
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Failed to load recommendations");
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show for unauthenticated users
  if (!isLoaded || !user) {
    return null;
  }

  // Don't show if no recommendations
  if (!isLoading && recommendations.length === 0 && !error) {
    return null;
  }

  const displayRecommendations = recommendations.slice(0, maxItems);

  return (
    <div className={`mb-8 ${theme === "light" ? "bg-white" : "bg-[#141B23]"} rounded-2xl p-6 border ${
      theme === "light" ? "border-[#C8D1E0]" : "border-[#1A2332]"
    }`}>
      {showTitle && (
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className={`h-5 w-5 ${
            theme === "light" ? "text-[#1B3C73]" : "text-[#60A5FA]"
          }`} />
          <h2 className={`text-xl font-bold ${
            theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
          }`}>
            Recommended for You
          </h2>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
            theme === "light" ? "border-[#1B3C73]" : "border-[#60A5FA]"
          }`}></div>
        </div>
      ) : error ? (
        <div className={`text-center py-8 ${
          theme === "light" ? "text-[#52677C]" : "text-gray-400"
        }`}>
          <p>{error}</p>
          <button
            onClick={fetchRecommendations}
            className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              theme === "light"
                ? "bg-[#1B3C73] text-white hover:bg-[#102B52]"
                : "bg-[#60A5FA] text-white hover:bg-[#3B82F6]"
            }`}
          >
            Try Again
          </button>
        </div>
      ) : displayRecommendations.length === 0 ? (
        <div className={`text-center py-8 ${
          theme === "light" ? "text-[#52677C]" : "text-gray-400"
        }`}>
          <p>No recommendations available yet. Start submitting content to get personalized recommendations!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayRecommendations.map((rec) => {
              const bounty = rec.bounty;
              
              // Map to BountyCard format
              const bountyCardData = {
                id: bounty.id,
                title: bounty.name,
                brand: bounty.company_name || "Unknown",
                payout: bounty.rate_per_1k_views.toFixed(2),
                platforms: [] as ("instagram" | "tiktok" | "youtube" | "twitter")[],
                budget: `$${bounty.total_bounty.toLocaleString()}`,
                deadline: "Ongoing",
                filled: Math.round(bounty.progress_percentage),
                logoUrl: bounty.logo_url,
                isOwner: false,
                isCompleted: bounty.is_completed,
              };

              return (
                <div key={bounty.id} className="relative">
                  {/* Match Score Badge */}
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                      rec.matchScore >= 80
                        ? "bg-green-500 text-white"
                        : rec.matchScore >= 60
                        ? "bg-blue-500 text-white"
                        : "bg-yellow-500 text-white"
                    }`}>
                      <TrendingUp className="h-3 w-3" />
                      {Math.round(rec.matchScore)}% Match
                    </div>
                  </div>

                  <BountyCard data={bountyCardData} />

                  {/* Match Reasons */}
                  {rec.matchReasons.specificReasons.length > 0 && (
                    <div className={`mt-3 p-3 rounded-lg text-sm ${
                      theme === "light"
                        ? "bg-[#F7FAFC] border border-[#E1E8F0]"
                        : "bg-[#0A0F17] border border-[#1A2332]"
                    }`}>
                      <p className={`font-medium mb-2 ${
                        theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
                      }`}>
                        Why this matches:
                      </p>
                      <ul className={`space-y-1 ${
                        theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
                      }`}>
                        {rec.matchReasons.specificReasons.slice(0, 2).map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#60A5FA] mt-1">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {recommendations.length > maxItems && (
            <div className="mt-6 text-center">
              <Link
                href="/feed"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  theme === "light"
                    ? "text-[#1B3C73] hover:bg-[#DDE5F2]"
                    : "text-[#60A5FA] hover:bg-[#1A2332]"
                }`}
              >
                View All Recommendations
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

