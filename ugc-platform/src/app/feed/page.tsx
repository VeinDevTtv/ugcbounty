"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import BountyCard from "@/components/BountyCard";
import ClaimBountyDialog from "@/components/ClaimBountyDialog";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "@/contexts/ThemeContext";
import { Trophy, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BountyWithCreator {
  id: string;
  name: string;
  description: string;
  total_bounty: number;
  rate_per_1k_views: number;
  claimed_bounty: number;
  creator_id: string | null;
  logo_url?: string | null;
  company_name?: string | null;
  calculated_claimed_bounty: number;
  progress_percentage: number;
  total_submission_views: number;
  is_completed: boolean;
  created_at: string;
}

interface Bounty {
  id: string;
  name: string;
  description: string;
  totalBounty: number;
  ratePer1kViews: number;
  claimedBounty: number;
  logoUrl?: string | null;
  companyName?: string | null;
  progressPercentage: number;
  totalSubmissionViews: number;
  isCompleted: boolean;
  createdAt: string;
}

export default function FeedPage() {
  const { user } = useUser();
  const { theme } = useTheme();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bountiesWithCreatorId, setBountiesWithCreatorId] = useState<BountyWithCreator[]>([]);
  const [selectedBounty, setSelectedBounty] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch bounties from database on mount
  useEffect(() => {
    fetchBounties();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const fetchBounties = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/bounties");
      if (response.ok) {
        const data = await response.json();
        // Store raw data with creator_id
        setBountiesWithCreatorId(data);
        
        // Map database fields to frontend format
        const mappedBounties: Bounty[] = data.map(
          (bounty: BountyWithCreator) => ({
            id: bounty.id,
            name: bounty.name,
            description: bounty.description,
            totalBounty: Number(bounty.total_bounty),
            ratePer1kViews: Number(bounty.rate_per_1k_views),
            claimedBounty: Number(bounty.calculated_claimed_bounty), // Use calculated bounty instead of static claimed_bounty
            logoUrl: bounty.logo_url,
            companyName: bounty.company_name,
            progressPercentage: Number(bounty.progress_percentage),
            totalSubmissionViews: Number(bounty.total_submission_views),
            isCompleted: bounty.is_completed,
            createdAt: bounty.created_at,
          })
        );
        setBounties(mappedBounties);
      } else {
        console.error("Failed to fetch bounties");
      }
    } catch (error) {
      console.error("Error fetching bounties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimBounty = (bountyId: string) => {
    setSelectedBounty(bountyId);
  };

  return (
    <div className={`min-h-screen transition-colors ${
      theme === "light" ? "bg-[#E8ECF3]" : "bg-[#0A0F17]"
    }`}>
      {/* Left Sidebar */}
      <aside className="hidden lg:block fixed left-6 top-24 w-64 z-30">
        <div className={`sticky top-24 border rounded-lg p-6 ${
          theme === "light"
            ? "bg-white border-[#C8D1E0]"
            : "bg-[#141B23] border-[#1A2332]"
        }`}>
          <h2 className={`text-lg font-bold mb-4 ${
            theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
          }`}>
            Your Progress
          </h2>
          <div className="relative" ref={dropdownRef}>
            <Button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full justify-between gap-2 ${
                theme === "light"
                  ? "bg-[#1B3C73] text-white hover:bg-[#102B52]"
                  : "bg-[#60A5FA] text-white hover:bg-[#3B82F6]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Achievements
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`} />
            </Button>
            {isDropdownOpen && (
              <div className={`absolute top-full left-0 right-0 mt-2 z-50 border rounded-lg shadow-lg ${
                theme === "light"
                  ? "bg-white border-[#C8D1E0]"
                  : "bg-[#141B23] border-[#1A2332]"
              }`}>
                <Link
                  href="/badges"
                  onClick={() => setIsDropdownOpen(false)}
                  className={`block px-4 py-3 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    theme === "light"
                      ? "text-[#2E3A47] hover:bg-[#E8ECF3]"
                      : "text-[#F5F8FC] hover:bg-[#1A2332]"
                  }`}
                >
                  View All
                </Link>
                <Link
                  href="/badges#levels"
                  onClick={() => setIsDropdownOpen(false)}
                  className={`block px-4 py-3 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg border-t ${
                    theme === "light"
                      ? "text-[#2E3A47] hover:bg-[#E8ECF3] border-[#C8D1E0]"
                      : "text-[#F5F8FC] hover:bg-[#1A2332] border-[#1A2332]"
                  }`}
                >
                  Levels
                </Link>
                <Link
                  href="/badges#badges"
                  onClick={() => setIsDropdownOpen(false)}
                  className={`block px-4 py-3 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg border-t ${
                    theme === "light"
                      ? "text-[#2E3A47] hover:bg-[#E8ECF3] border-[#C8D1E0]"
                      : "text-[#F5F8FC] hover:bg-[#1A2332] border-[#1A2332]"
                  }`}
                >
                  Badges
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="px-4 md:px-6 lg:pl-80 lg:pr-6 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
              theme === "light" ? "border-[#1B3C73]" : "border-[#60A5FA]"
            }`}></div>
          </div>
        ) : bounties.length === 0 ? (
          <div className="text-center py-20">
            <p className={`text-lg ${
              theme === "light" ? "text-[#52677C]" : "text-gray-400"
            }`}>
              No bounties available yet. Create one to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bounties.map((bounty) => {
              const rawBounty = bountiesWithCreatorId.find(b => b.id === bounty.id);
              const isOwner: boolean = Boolean(user && rawBounty?.creator_id === user.id);
              
              // Map to BountyCard's expected format
              const bountyCardData = {
                id: bounty.id,
                title: bounty.name,
                brand: bounty.companyName || "Unknown",
                payout: bounty.ratePer1kViews.toFixed(2),
                platforms: [] as ("instagram" | "tiktok" | "youtube" | "twitter")[], // Will be populated from submissions if needed
                budget: `$${bounty.totalBounty.toLocaleString()}`,
                deadline: "Ongoing", // Can be calculated from created_at if needed
                filled: Math.round(bounty.progressPercentage),
                logoUrl: bounty.logoUrl,
              };
              
              return (
                <div key={bounty.id} className="hover:z-10">
                  <BountyCard
                    data={{
                      ...bountyCardData,
                      isOwner,
                      isCompleted: bounty.isCompleted,
                      onClaim: (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleClaimBounty(bounty.id);
                      },
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Claim Bounty Dialog */}
      {selectedBounty && (
        <ClaimBountyDialog
          open={!!selectedBounty}
          onOpenChange={(open) => !open && setSelectedBounty(null)}
          bounty={{
            id: selectedBounty,
            title: bounties.find((b) => b.id === selectedBounty)?.name || "Unknown Bounty",
            brand: bounties.find((b) => b.id === selectedBounty)?.companyName || "Unknown",
            payout: bounties.find((b) => b.id === selectedBounty)?.ratePer1kViews.toFixed(2) || "0.00",
            deadline: "Ongoing",
            description: bounties.find((b) => b.id === selectedBounty)?.description,
          }}
          isCompleted={bounties.find((b) => b.id === selectedBounty)?.isCompleted || false}
        />
      )}
    </div>
  );
}

