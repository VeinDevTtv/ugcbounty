import BountyCard from "@/components/BountyCard";
import { Button } from "@/components/ui/Button";
import { Filter, Search } from "lucide-react";

// Temporary placeholder data for UI visualization
const BOUNTIES = [
  { id: "1", title: "Summer Energy Drink Launch", brand: "Vitality", payout: "25", platforms: ["tiktok", "instagram"] as any, budget: "$5,000", deadline: "2d left" },
  { id: "2", title: "Tech Gadget Review", brand: "GizmoLab", payout: "40", platforms: ["youtube"] as any, budget: "$12,000", deadline: "5d left" },
  { id: "3", title: "Skincare Routine AM/PM", brand: "GlowUp", payout: "30", platforms: ["tiktok"] as any, budget: "$8,500", deadline: "1w left" },
  { id: "4", title: "Fitness App Challenge", brand: "MoveIt", payout: "20", platforms: ["instagram"] as any, budget: "$2,000", deadline: "12h left" },
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
