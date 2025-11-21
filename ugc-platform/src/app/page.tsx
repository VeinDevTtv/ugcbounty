"use client";

import { useState } from "react";
import BountyCard from "@/components/BountyCard";
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

export default function FeedPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortedBounties, setSortedBounties] = useState(BOUNTIES);

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

  const sortMostPopular = () => {
    setSortedBounties(prev =>
      [...prev].sort((a, b) => b.filled - a.filled)
    );
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

  return (
    <div className="space-y-8">
      {/* Header + Controls */}
      <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        {/* Left: Title */}
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Browse Bounties</h1>
          <p className="text-zinc-500 mt-1">Find campaigns that match your vibe.</p>
        </div>

        {/* Right: Search, Filter, Sort */}
        <div className="flex flex-col gap-3 w-full md:w-auto">
          {/* SEARCH + FILTERS (top row) */}
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-lg border border-zinc-200 pl-9 pr-4 text-sm focus:b
