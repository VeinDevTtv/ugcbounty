"use client";

import { useState } from "react";
import BountyCard from "@/components/BountyCard";
import { Button } from "@/components/ui/Button";
import { Filter, Search, Check } from "lucide-react";

// Updated Data with "Filled" percentages
const BOUNTIES = [
  { 
    id: "1", 
    title: "Duolingo Language Chaos Challenge", 
    brand: "Duolingo", 
    payout: "15", 
    platforms: ["tiktok", "instagram"] as any, 
    budget: "$50,000", 
    deadline: "2d left",
    filled: 45
  },
  { 
    id: "2", 
    title: "Aesthetic 2025 Desk Setup", 
    brand: "Notion", 
    payout: "25", 
    platforms: ["youtube"] as any, 
    budget: "$20,000", 
    deadline: "5d left",
    filled: 72
  },
  { 
    id: "3", 
    title: "Coding Superpowers Challenge", 
    brand: "Cursor", 
    payout: "40", 
    platforms: ["twitter"] as any, 
    budget: "$10,000", 
    deadline: "12h left",
    filled: 100
  },
  { 
    id: "4", 
    title: "Hydrate Like a Villain", 
    brand: "Liquid Death", 
    payout: "18", 
    platforms: ["instagram", "tiktok"] as any, 
    budget: "$35,000", 
    deadline: "1w left",
    filled: 100
  },
  { 
    id: "5", 
    title: "Latte Art at Home", 
    brand: "Starbucks", 
    payout: "30", 
    platforms: ["instagram", "tiktok"] as any, 
    budget: "$75,000", 
    deadline: "4d left",
    filled: 58
  },
  { 
    id: "6", 
    title: "Glow Up Morning Routine", 
    brand: "Fenty Beauty", 
    payout: "45", 
    platforms: ["tiktok", "instagram"] as any, 
    budget: "$120,000", 
    deadline: "6d left",
    filled: 80
  },
  { 
    id: "7", 
    title: "Show Your Spotify Wrapped Reaction", 
    brand: "Spotify", 
    payout: "25", 
    platforms: ["tiktok", "youtube"] as any, 
    budget: "$90,000", 
    deadline: "8d left",
    filled: 20
  },
  { 
    id: "8", 
    title: "Before & After Writing Transformation", 
    brand: "Grammarly", 
    payout: "18", 
    platforms: ["instagram", "youtube"] as any, 
    budget: "$40,000", 
    deadline: "10d left",
    filled: 67
  },
  { 
    id: "9", 
    title: "My Weekend Airbnb Stay", 
    brand: "Airbnb", 
    payout: "55", 
    platforms: ["tiktok", "instagram"] as any, 
    budget: "$150,000", 
    deadline: "1w left",
    filled: 49
  },
  { 
    id: "10", 
    title: "Train Like an Athlete", 
    brand: "Nike", 
    payout: "50", 
    platforms: ["youtube", "tiktok"] as any, 
    budget: "$200,000", 
    deadline: "3w left",
    filled: 28
  }
];

// Helper: "$50,000" -> 50000
const parseBudget = (str: string) => Number(str.replace(/\$|,/g, ""));

type SortMode = "none" | "low-high" | "high-low" | "popular";

export default function FeedPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortedBounties, setSortedBounties] = useState(BOUNTIES);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("none");

  // ------- SORT HANDLERS -------
  const applySort = (mode: SortMode) => {
    setSortMode(mode);
    setIsFilterOpen(false);

    if (mode === "low-high") {
      setSortedBounties(prev =>
        [...prev].sort((a, b) => parseBudget(a.budget) - parseBudget(b.budget))
      );
    } else if (mode === "high-low") {
      setSortedBounties(prev =>
        [...prev].sort((a, b) => parseBudget(b.budget) - parseBudget(a.budget))
      );
    } else if (mode === "popular") {
      setSortedBounties(prev =>
        [...prev].sort((a, b) => b.filled - a.filled)
      );
    } else {
      // none → reset to original order
      setSortedBounties(BOUNTIES);
    }
  };

  // ------- SEARCH FILTER -------
  const filteredBounties = sortedBounties.filter((bounty) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      bounty.brand.toLowerCase().includes(q) ||
      bounty.title.toLowerCase().includes(q)
    );
  });

  // helper to style selected sort item
  const isActive = (mode: SortMode) =>
    sortMode === mode ? "bg-zinc-100 text-zinc-900" : "hover:bg-zinc-50";

  return (
    <div className="space-y-8">
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
                  {sortMode === "none" ? "Filters" : "Sort: " + (
                    sortMode === "low-high"
                      ? "Lowest → Highest"
                      : sortMode === "high-low"
                      ? "Highest → Lowest"
                      : "Most Popular"
                  )}
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
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredBounties.map((bounty) => (
          <BountyCard key={bounty.id} data={bounty} />
        ))}
      </section>
    </div>
  );
}
