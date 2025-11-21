import { ArrowRight, DollarSign, Eye, Instagram, Youtube } from "lucide-react";
import Link from "next/link";
import { Badge } from "./ui/Badge";

// Types would usually go in a separate file
interface BountyProps {
    id: string;
    title: string;
    brand: string;
    payout: string;
    platforms: ("instagram" | "tiktok" | "youtube")[];
    budget: string;
    deadline: string;
}

export default function BountyCard({ data }: { data: BountyProps }) {
    return (
        <Link
            href={`/${data.id}`}
            className="group block rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-indigo-300 hover:shadow-md"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-500">
                        {data.brand.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-semibold text-zinc-900 line-clamp-1 group-hover:text-indigo-600">
                            {data.title}
                        </h3>
                        <p className="text-xs text-zinc-500">{data.brand}</p>
                    </div>
                </div>
                <Badge variant="success">${data.payout} / 1k views</Badge>
            </div>

            <div className="flex items-center gap-2 mb-6 text-zinc-500">
                {data.platforms.includes("instagram") && <Instagram className="h-4 w-4" />}
                {data.platforms.includes("youtube") && <Youtube className="h-4 w-4" />}
                <span className="text-xs ml-1">+ Requirements</span>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-100 pt-4 mt-auto">
                <div className="flex gap-4 text-xs text-zinc-500 font-medium">
                    <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" /> Budget: {data.budget}
                    </span>
                    <span>Ends {data.deadline}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </div>
        </Link>
    );
}
