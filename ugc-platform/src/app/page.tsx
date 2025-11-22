"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BountyCard from "@/components/BountyCard";
import ClaimBountyDialog from "@/components/ClaimBountyDialog";
import { useUser } from "@clerk/nextjs";

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

export default function Home() {
  const { user } = useUser();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bountiesWithCreatorId, setBountiesWithCreatorId] = useState<BountyWithCreator[]>([]);
  const [selectedBounty, setSelectedBounty] = useState<string | null>(null);

  // Fetch bounties from database on mount
  useEffect(() => {
    fetchBounties();
  }, []);

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
    <div className="min-h-screen bg-[#140E0B]">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : bounties.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">
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
      </main>

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
