"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import BountyCard from "@/components/BountyCard";
import ClaimBountyDialog from "@/components/ClaimBountyDialog";
import { Button } from "@/components/ui/Button";
import { Filter, Search, Check } from "lucide-react";

type SortMode = "none" | "low-high" | "high-low" | "popular";

// Shape coming back from /api/bounties (adjust to your real API)
type ApiBounty = {
  id: string;
  title: string;
  brand: string;
  payout_amount: number;        // e.g. 15
  platforms: string[];
  budget_amount: number;        // e.g. 50000
  deadline: string;             // e.g. "2d left" or ISO string
  filled_percentage: number;    // e.g. 45
  creator_id: string;
  is_completed: boolean;
};

// Shape used by the frontend & BountyCard
type Bounty = {
  id: string;
  title: string;
  brand: string;
  payout: string;               // "15"
  platforms: string[];
  budget: string;               // "$50,000"
  deadline: string;
  filled: number;               // 0–100
  creatorId: string;
  isCompleted: boolean;
};

// Helper: map API → frontend format
const mapApiBounty = (api: ApiBounty): Bounty => ({
  id: api.id,
  title: api.title,
  brand: api.brand,
  payout: api.payout_amount.toString(),
  platforms: api.platforms,
  budget: `$${api.budget_amount.toLocaleString()}`,
  deadline: api.deadline,
  filled: api.filled_percentage,
  creatorId: api.creator_id,
  isCompleted: api.is_completed,
});

// Helper: "$50,000" or 50000 -> 50000
const parseBudget = (value: string | number) =>
  typeof value === "number" ? value : Number(value.replace(/\$|,/g, ""));

export default function FeedPage() {
  const { user } = useUser();
  const currentUserId = user?.id ?? null;

  const [searchQuery, setSearchQuery] = useState("");
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [sortedBounties, setSortedBounties] = useState<Bounty[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("none");

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null);

  // ------- FETCH BOUNTIES ON MOUNT -------
  useEffect(() => {
    let isMounted = true;

    const fetchBounties = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const res = await fetch("/api/bounties");
        if (!res.ok) throw new Error("Failed to fetch bounties");

        const data: ApiBounty[] = await res.json();
        if (!isMounted) return;

        const mapped = data.map(mapApiBounty);
        setBounties(mapped);
        setSortedBounties(mapped);
      } catch (error) {
        console.error(error);
        if (isMounted) setIsError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchBounties();

    return () => {
      isMounted = false;
    };
  }, []);

  // ------- SORT HANDLERS -------
  const applySort = (mode: SortMode) => {
    setSortMode(mode);
    setIsFilterOpen(false);

    if (mode === "low-high") {
      setSortedBounties((prev) =>
        [...prev].sort(
          (a, b) => parseBudget(a.budget) - parseBudget(b.budget)
        )
      );
    } else if (mode === "high-low") {
      setSortedBounties((prev) =>
        [...prev].sort(
          (a, b) => parseBudget(b.budget) - parseBudget(a.budget)
        )
      );
    } else if (mode === "popular") {
      setSortedBounties((prev) => [...prev].sort((a, b) => b.filled - a.filled));
    } else {
      // none → reset to original order
      setSortedBounties(bounties);
    }
  };

  // helper to style selected sort item
  const isActive = (mode: SortMode) =>
    sortMode === mode ? "bg-zinc-100 text-zinc-900" : "hover:bg-zinc-50";

  const handleOpenClaimDialog = (bounty: Bounty) => {
    setSelectedBounty(bounty);
    setIsDialogOpen(true);
  };

  // ------- LOADING / ERROR / EMPTY STATES -------
  if (isLoading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <p className="text-sm text-red-500">
          Something went wrong while loading bounties. Please try again.
        </p>
      </main>
    );
  }

  if (!bounties.length) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center space-y-2">
        <h1 className="text-2xl font-semibold">Browse Bounties</h1>
        <p className="text-sm text-zinc-500">
          No bounties are available right now. Check back later!
        </p>
      </main>
    );
  }

  // ------- SEARCH FILTER -------
  const filteredBounties = sortedBounties.filter((bounty) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      bounty.brand.toLowerCase().includes(q) ||
      bounty.title.toLowerCase().includes(q)
    );
  });

  return (
    <main className="space-y-8">
      {/* Header + Controls */}
      <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        {/* Left: Title */}
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Browse Bounties</h1>
          <p className="text-zinc-500 mt-1">Find campaigns that match your vibe.</p>
        </div>

        {/* Right: Search, Filter (with dropdown) */}
        <div className="flex flex-col gap-3 w-full md:w-auto">
          {/* SEARCH + FILTER BUTTON */}
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-lg border border-zinc-200 pl-9 pr-4 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Filter button + dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                className="gap-2"
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {sortMode === "none"
                    ? "Filters"
                    : "Sort: " +
                      (sortMode === "low-high"
                        ? "Lowest → Highest"
                        : sortMode === "high-low"
                        ? "Highest → Lowest"
                        : "Most Popular")}
                </span>
              </Button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-lg border border-zinc-200 bg-white shadow-lg z-20 text-sm">
                  <div className="px-3 py-2 border-b text-xs font-semibold text-zinc-500 uppercase">
                    Sort by budget / popularity
                  </div>

                  <button
                    type="button"
                    onClick={() => applySort("low-high")}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-zinc-700 ${isActive(
                      "low-high"
                    )}`}
                  >
                    <span>Lowest → Highest Budget</span>
                    {sortMode === "low-high" && (
                      <Check className="h-4 w-4 text-indigo-500" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => applySort("high-low")}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-zinc-700 ${isActive(
                      "high-low"
                    )}`}
                  >
                    <span>Highest → Lowest Budget</span>
                    {sortMode === "high-low" && (
                      <Check className="h-4 w-4 text-indigo-500" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => applySort("popular")}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-zinc-700 ${isActive(
                      "popular"
                    )}`}
                  >
                    <span>Most Popular 🔥</span>
                    {sortMode === "popular" && (
                      <Check className="h-4 w-4 text-indigo-500" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => applySort("none")}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-zinc-700 border-t ${isActive(
                      "none"
                    )}`}
                  >
                    <span>Clear sort</span>
                    {sortMode === "none" && (
                      <Check className="h-4 w-4 text-indigo-500" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredBounties.length === 0 ? (
          <div className="col-span-full flex min-h-[200px] items-center justify-center">
            <p className="text-sm text-zinc-500">
              No bounties match your search. Try adjusting your filters.
            </p>
          </div>
        ) : (
          filteredBounties.map((bounty) => {
            const isOwner =
              currentUserId != null && bounty.creatorId === currentUserId;

            return (
              <BountyCard
                key={bounty.id}
                data={bounty}
                isOwner={isOwner}
                onClaim={() => handleOpenClaimDialog(bounty)}
              />
            );
          })
        )}
      </section>

      {/* Claim dialog */}
      {selectedBounty && (
        <ClaimBountyDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          bounty={selectedBounty}
          isCompleted={selectedBounty.isCompleted}
        />
      )}
    </main>
  );
}
