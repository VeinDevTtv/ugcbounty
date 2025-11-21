"use client"; 

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Modal from "@/components/Modal";
import Toast from "@/components/Toast";
import { CheckCircle, Clock, DollarSign, FileText, Share2, UploadCloud, ArrowLeft } from "lucide-react";
import Link from "next/link";

// --- THIS IS WHERE THE DIFFERENT PAGES ARE DEFINED ---
const BOUNTIES_DATA: Record<string, any> = {
    // ID 1: Duolingo Data
    "1": {
        title: "Duolingo Language Chaos Challenge",
        brand: "DuoLearn",
        logo: "https://logo.clearbit.com/duolingo.com",
        badgeText: "Only 2 days left",
        posted: "Posted 3 days ago",
        description: `DuoLearn (yes, the owl’s cousin) is launching a new language-learning feature, and we need bold, funny, chaotic creators to show how FUN learning a language can be.\n\nYour mission is simple: Make a video so entertaining that people forget they’re learning something.\n\nThink: “Learn Spanish or ELSE.” crying green owl memes, relatable language mistakes, gamified progress addiction, your wild reactions to streak pressure.\n\nMake it fun. Make it chaotic. Make Duo proud.`,
        requirements: [
            "Show the language-learning app in the first 3 seconds (Duo must see it IMMEDIATELY.)",
            "Use the official campaign audio (It screams “do your lessons.”)",
            "Tag @DuoLearn + #DuoLanguageChallenge (We track it. Duo tracks everything.)",
            "Minimum video length: 15 seconds"
        ],
        payout: "$15.00",
        payoutSub: "per 1,000 qualified views (Duo says no excuses.)",
        budget: "$50,000",
        deadline: "Oct 24, 2025",
        format: "9:16 Vertical Video"
    },
    // ID 2: THE SPECIFIC NOTION DATA YOU WANTED
    "2": {
        title: "Aesthetic 2025 Workspace Setup",
        brand: "Notion",
        // Different Logo
        logo: "https://logo.clearbit.com/notion.so", 
        badgeText: "5 days left",
        posted: "Posted 5 hours ago",
        // Different Brief
        description: `New Year, New System. We want to see your ultimate 2025 life-operating system.\n\nYour mission: Show how you organize your chaotic life into a beautiful, functional dashboard using our new 2025 templates.\n\nThink: Lo-fi study beats, cozy desk setups, satisfying checkbox clicks, and dark mode aesthetic. It needs to be functional, but more importantly, it needs to be BEAUTIFUL.\n\nStop being messy. Start being aesthetic.`,
        // Different Requirements
        requirements: [
            "Must showcase a specific 2025 template structure",
            "Show a 'Dark Mode' toggle moment (The switch up is key)",
            "Tag @Notion + #NotionSetup2025",
            "No talking required—just vibes, music, and screen recording."
        ],
        // Different Payout Rate
        payout: "$25.00", 
        payoutSub: "per 1,000 qualified views (High quality = High payout)",
        budget: "$20,000",
        deadline: "Oct 28, 2025",
        format: "YouTube Shorts / Reels"
    }
};

export default function BountyDetails({ params }: { params: { id: string } }) {
    const [isModalOpen, setModalOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // --- THE MAGIC SWITCH ---
    // This line checks the URL ID (e.g., "2") and loads the matching data.
    const bounty = BOUNTIES_DATA[params.id];

    // If someone types a wrong ID (like /99), show a "Not Found" state
    if (!bounty) {
         return (
            <div className="max-w-5xl mx-auto text-center py-20">
                <h1 className="text-3xl font-bold">Bounty Not Found</h1>
                <Link href="/" className="text-indigo-600 hover:underline mt-4 block">
                 Go Back Home
                </Link>
            </div>
         );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setModalOpen(false);
        setShowToast(true);
    };

    return (
        <div className="max-w-5xl mx-auto">
            {/* Back Button */}
            <Link href="/" className="inline-flex items-center text-zinc-500 hover:text-zinc-900 mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Bounties
            </Link>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Left Col: Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <Badge variant="warning">
                                    {bounty.badgeText}
                                </Badge>
                                <h1 className="mt-4 text-3xl md:text-4xl font-black text-zinc-900 leading-tight">
                                    {bounty.title}
                                </h1>
                                <div className="mt-3 flex items-center gap-2 text-zinc-500 text-sm">
                                    <span className="font-bold text-zinc-900">{bounty.brand}</span>
                                    <span>•</span>
                                    <span>{bounty.posted}</span>
                                </div>
                            </div>
                            {/* The logo will change automatically based on the data */}
                            <div className="h-20 w-20 shrink-0 rounded-2xl bg-white border border-zinc-100 shadow-sm p-3 flex items-center justify-center">
                                <img src={bounty.logo} alt="Brand Logo" className="w-full h-full object-contain" />
                            </div>
                        </div>

                        <hr className="my-8 border-zinc-100" />

                        <section className="space-y-4">
                            <h3 className="text-lg font-bold text-zinc-900">Campaign Brief</h3>
                            <p className="text-zinc-600 leading-relaxed text-lg whitespace-pre-wrap">
                                {bounty.description}
                            </p>
                        </section>

                        <section className="mt-8 space-y-4">
                            <h3 className="text-lg font-bold text-zinc-900">Requirements</h3>
                            <ul className="space-y-3">
                                {bounty.requirements.map((req: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3 text-zinc-700 bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                                        <CheckCircle className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                                        <span className="font-medium">{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                </div>

                {/* Right Col: Action Sidebar */}
                <div className="space-y-6">
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 sticky top-24 shadow-lg shadow-zinc-100">
                        <div className="mb-8 text-center">
                            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-1">Payout Rate</p>
                            {/* Payout changes automatically */}
                            <div className="text-5xl font-black text-zinc-900 tracking-tight">{bounty.payout}</div>
                            <p className="text-xs font-medium text-zinc-400 mt-2">{bounty.payoutSub}</p>
                        </div>

                        <div className="space-y-4 mb-8 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                            <div className="flex flex-col gap-1 text-sm mb-3">
                                <span className="flex items-center gap-2 text-zinc-500 font-medium">
                                    <DollarSign className="h-4 w-4" /> Total Budget
                                </span>
                                <span className="font-bold text-zinc-900">{bounty.budget}</span>
                            </div>
                            
                            <div className="flex flex-col gap-1 text-sm mb-3 border-t border-zinc-200 pt-3">
                                <span className="flex items-center gap-2 text-zinc-500 font-medium">
                                    <Clock className="h-4 w-4" /> Deadline
                                </span>
                                <span className="font-bold text-zinc-900">{bounty.deadline}</span>
                            </div>

                            <div className="flex flex-col gap-1 text-sm border-t border-zinc-200 pt-3">
                                <span className="flex items-center gap-2 text-zinc-500 font-medium">
                                    <FileText className="h-4 w-4" /> Format
                                </span>
                                <span className="font-bold text-zinc-900">{bounty.format}</span>
                            </div>
                        </div>

                        <Button className="w-full text-lg py-6 shadow-xl shadow-indigo-200" size="lg" onClick={() => setModalOpen(true)}>
                            Submit Content
                        </Button>
                        <Button variant="ghost" className="w-full mt-3 gap-2 text-zinc-500 hover:text-zinc-900">
                            <Share2 className="h-4 w-4" /> Share Campaign
                        </Button>
                    </div>
                </div>

                {/* Submission Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    title={`Submit to ${bounty.brand}`}
                >
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-zinc-900 mb-1.5">Content URL</label>
                            <div className="relative">
                                <input
                                    required
                                    type="url"
                                    placeholder="https://tiktok.com/@user/video/..."
                                    className="w-full rounded-xl border border-zinc-300 pl-4 pr-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all"
                                />
                            </div>
                            <p className="text-xs text-zinc-500 mt-2">Paste the direct link to your published post.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-zinc-900 mb-1.5">Platform</label>
                            <select className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none bg-white">
                                <option>TikTok</option>
                                <option>Instagram Reels</option>
                                <option>YouTube Shorts</option>
                            </select>
                        </div>

                        <div className="pt-2">
                            <Button type="submit" className="w-full gap-2 py-6 text-lg">
                                <UploadCloud className="h-5 w-5" /> Submit for Review
                            </Button>
                        </div>
                    </form>
                </Modal>

                <Toast
                    show={showToast}
                    message="Submission sent successfully! Tracking started."
                    onClose={() => setShowToast(false)}
                />
            </div>
        </div>
    );
}
