"use client";

import BountyCard from "@/components/BountyCard"; // Make sure this path matches your folder
import { Button } from "@/components/ui/Button";
import { Filter, Search } from "lucide-react";

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

  // ⭐ NEW + UNIQUE BOUNTIES BELOW

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

export default function FeedPage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Browse Bounties</h1>
          <p className="text-zinc-500 mt-1">Find campaigns that match your vibe.</p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search brands..."
              className="h-10 w-full rounded-lg border border-zinc-200 pl-9 pr-4 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
        </div>
      </section>

      {/* Grid */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {BOUNTIES.map((bounty) => (
          <BountyCard key={bounty.id} data={bounty} />
        ))}
      </section>
    </div>
  );
}
