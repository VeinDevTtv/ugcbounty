import { useState } from "react";
import BountyCard from "@/components/BountyCard";
import { Button } from "@/components/ui/Button";
import { Filter, Search } from "lucide-react";
import { Filter, Search, Check } from "lucide-react";

// Updated Data with "Filled" percentages
const BOUNTIES = [
@@ -112,27 +112,35 @@ const BOUNTIES = [
// Helper: "$50,000" -> 50000
const parseBudget = (str: string) => Number(str.replace(/\$|,/g, ""));

type SortMode = "none" | "low-high" | "high-low" | "popular";

export default function FeedPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortedBounties, setSortedBounties] = useState(BOUNTIES);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("none");

  // ------- SORT HANDLERS -------
  const sortLowToHigh = () => {
    setSortedBounties(prev =>
      [...prev].sort((a, b) => parseBudget(a.budget) - parseBudget(b.budget))
    );
  };

  const sortHighToLow = () => {
    setSortedBounties(prev =>
      [...prev].sort((a, b) => parseBudget(b.budget) - parseBudget(a.budget))
    );
  };
  const applySort = (mode: SortMode) => {
    setSortMode(mode);
    setIsFilterOpen(false);

  const sortMostPopular = () => {
    setSortedBounties(prev =>
      [...prev].sort((a, b) => b.filled - a.filled)
    );
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
@@ -145,6 +153,10 @@ export default function FeedPage() {
    );
  });

  // helper to style selected sort item
  const isActive = (mode: SortMode) =>
    sortMode === mode ? "bg-zinc-100 text-zinc-900" : "hover:bg-zinc-50";

  return (
    <div className="space-y-8">
      {/* Header + Controls */}
@@ -155,9 +167,9 @@ export default function FeedPage() {
          <p className="text-zinc-500 mt-1">Find campaigns that match your vibe.</p>
        </div>

        {/* Right: Search, Filter, Sort */}
        {/* Right: Search, Filter (with dropdown) */}
        <div className="flex flex-col gap-3 w-full md:w-auto">
          {/* SEARCH + FILTERS (top row) */}
          {/* SEARCH + FILTER BUTTON */}
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
@@ -170,25 +182,86 @@ export default function FeedPage() {
              />
            </div>

            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
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

          {/* SORTING BUTTONS (second row, under filter) */}
          <div className="flex flex-wrap gap-2 justify-start md:justify-end">
            <Button onClick={sortLowToHigh} variant="outline" className="text-sm">
              Lowest → Highest Budget
            </Button>
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-lg border border-zinc-200 bg-white shadow-lg z-20 text-sm">
                  <div className="px-3 py-2 border-b text-xs font-semibold text-zinc-500 uppercase">
                    Sort by budget / popularity
                  </div>

            <Button onClick={sortHighToLow} variant="outline" className="text-sm">
              Highest → Lowest Budget
            </Button>
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

            <Button onClick={sortMostPopular} variant="outline" className="text-sm">
              Most Popular 🔥
            </Button>
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
