"use client"; 

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Modal from "@/components/Modal";
import Toast from "@/components/Toast";
import { CheckCircle, Clock, DollarSign, FileText, Share2, UploadCloud, ArrowLeft } from "lucide-react";
import Link from "next/link";

// --- 1. COMPLETE DATABASE FOR ALL 10 CARDS ---
const BOUNTIES_DATA: Record<string, any> = {
    "1": {
        title: "Duolingo Language Chaos Challenge",
        brand: "DuoLearn",
        logo: "https://logo.clearbit.com/duolingo.com",
        badgeText: "Only 2 days left",
        posted: "Posted 3 days ago",
        description: `DuoLearn (yes, the owl’s cousin) is launching a new language-learning feature, and we need bold, funny, chaotic creators to show how FUN learning a language can be.\n\nYour mission is simple: Make a video so entertaining that people forget they’re learning something.\n\nThink: “Learn Spanish or ELSE.” crying green owl memes, relatable language mistakes, gamified progress addiction, your wild reactions to streak pressure.\n\nMake it fun. Make it chaotic. Make Duo proud.`,
        requirements: ["Show the app in first 3s", "Use campaign audio", "Tag @DuoLearn", "Min length: 15s"],
        payout: "$15.00", payoutSub: "per 1,000 qualified views", budget: "$50,000", deadline: "Oct 24, 2025", format: "9:16 Vertical Video"
    },
    "2": {
        title: "Aesthetic 2025 Workspace Setup",
        brand: "Notion",
        logo: "https://logo.clearbit.com/notion.so",
        badgeText: "5 days left",
        posted: "Posted 5 hours ago",
        description: `New Year, New System. We want to see your ultimate 2025 life-operating system.\n\nYour mission: Show how you organize your chaotic life into a beautiful, functional dashboard using our new 2025 templates.\n\nThink: Lo-fi study beats, cozy desk setups, satisfying checkbox clicks, and dark mode aesthetic. It needs to be functional, but more importantly, it needs to be BEAUTIFUL.\n\nStop being messy. Start being aesthetic.`,
        requirements: ["Show 2025 template", "Dark Mode toggle", "Tag @Notion", "No talking required"],
        payout: "$25.00", payoutSub: "per 1,000 qualified views", budget: "$20,000", deadline: "Oct 28, 2025", format: "YouTube Shorts"
    },
    "3": {
        title: "Coding with AI Superpowers",
        brand: "Cursor",
        logo: "https://logo.clearbit.com/cursor.com",
        badgeText: "SOLD OUT",
        posted: "Posted 1 day ago",
        description: `This bounty is currently CLOSED. The budget has been fully allocated.\n\nCursor is the AI code editor that lets you build software faster. We wanted to see how fast you could build a landing page using our new 'Composer' feature.`,
        requirements: ["Campaign Closed", "Budget Exhausted", "Watch for future drops"],
        payout: "$40.00", payoutSub: "per 1,000 qualified views", budget: "$10,000", deadline: "Ended", format: "Twitter / X Video"
    },
    "4": {
        title: "Murder Your Thirst",
        brand: "Liquid Death",
        logo: "https://logo.clearbit.com/liquiddeath.com",
        badgeText: "SOLD OUT",
        posted: "Posted 1 week ago",
        description: `This bounty is currently CLOSED.\n\nWe wanted to see you murder your thirst. The internet responded. The budget is dead.`,
        requirements: ["Campaign Closed", "Budget Exhausted"],
        payout: "$18.00", payoutSub: "per 1,000 qualified views", budget: "$35,000", deadline: "Ended", format: "Instagram Reels"
    },
    "5": {
        title: "Latte Art at Home Challenge",
        brand: "Starbucks",
        logo: "https://logo.clearbit.com/starbucks.com",
        badgeText: "Trending",
        posted: "Posted 2 hours ago",
        description: `We want to see your morning ritual. Whether it's a perfect pour or a hilarious fail, show us how you start your day with Starbucks at Home. Make it cozy, make it chaotic, just make it coffee.`,
        requirements: ["Must use a Starbucks mug or bag", "Morning vibes aesthetic", "Tag @StarbucksAtHome", "ASMR sounds preferred"],
        payout: "$30.00", payoutSub: "per 1,000 qualified views", budget: "$75,000", deadline: "Nov 01, 2025", format: "TikTok / Reels"
    },
    "6": {
        title: "Glow Up Morning Routine",
        brand: "Fenty Beauty",
        logo: "https://logo.clearbit.com/fentybeauty.com",
        badgeText: "High Payout",
        posted: "Posted 1 day ago",
        description: `Get ready with us. Show your transformation from 'just woke up' to 'ready to conquer' using Fenty Skin and Beauty products. We want real skin textures and genuine reactions.`,
        requirements: ["Before & After transition", "List products in caption", "Tag @FentyBeauty", "Upbeat trending audio"],
        payout: "$45.00", payoutSub: "per 1,000 qualified views", budget: "$120,000", deadline: "Oct 30, 2025", format: "9:16 Vertical Video"
    },
    "7": {
        title: "Show Your Spotify Wrapped",
        brand: "Spotify",
        // Spotify logo URL sometimes tricky, using a reliable fallback or icon
        logo: "https://logo.clearbit.com/spotify.com",
        badgeText: "Seasonal",
        posted: "Posted 4 hours ago",
        description: `It's that time of year. Expose your music taste. Whether you're proud or embarrassed, share your Top 5 Artists and your Listening Personality. Roast yourself or flex your taste.`,
        requirements: ["Green screen effect over your Wrapped", "Commentary on your top artist", "Tag #SpotifyWrapped", "No copyright music (use library)"],
        payout: "$25.00", payoutSub: "per 1,000 qualified views", budget: "$90,000", deadline: "Dec 01, 2025", format: "TikTok / Reels"
    },
    "8": {
        title: "Before & After Writing",
        brand: "Grammarly",
        logo: "https://logo.clearbit.com/grammarly.com",
        badgeText: "Easy",
        posted: "Posted 6 hours ago",
        description: `Show a chaotic, typo-filled email draft... and then the magic fix. Demonstrate how Grammarly saves you from sending embarrassing texts to your boss or professor.`,
        requirements: ["Screen recording of the 'Fix All' button", "Relatable work/school scenario", "Tag @Grammarly", "Humorous tone"],
        payout: "$18.00", payoutSub: "per 1,000 qualified views", budget: "$40,000", deadline: "Nov 15, 2025", format: "Any Format"
    },
    "9": {
        title: "My Weekend Airbnb Find",
        brand: "Airbnb",
        logo: "https://logo.clearbit.com/airbnb.com",
        badgeText: "Travel",
        posted: "Posted 2 days ago",
        description: `Found a unique stay? A cabin in the woods? A downtown loft? Give us a 15-second tour of your weekend getaway. Focus on the unique details that make it special.`,
        requirements: ["Walkthrough tour style", "Mention the specific 'Category' (e.g. Amazing Pools)", "Tag @Airbnb", "Cozy/Wanderlust vibe"],
        payout: "$55.00", payoutSub: "per 1,000 qualified views", budget: "$150,000", deadline: "Nov 10, 2025", format: "Instagram Reels"
    },
    "10": {
        title: "Train Like an Athlete",
        brand: "Nike",
        logo: "https://logo.clearbit.com/nike.com",
        badgeText: "Active",
        posted: "Posted 12 hours ago",
        description: `Just do it. Show us your intense training session, your morning run, or your recovery routine. We want grit, sweat, and determination. Show us what you're working for.`,
        requirements: ["Wearing Nike gear visibly", "High energy editing", "Tag @Nike + #JustDoIt", "Motivational voiceover"],
        payout: "$50.00", payoutSub: "per 1,000 qualified views", budget: "$200,000", deadline: "Nov 20, 2025", format: "TikTok / Shorts"
    }
};

export default function BountyDetails({ params }: { params: { id: string } }) {
    const [isModalOpen, setModalOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // --- 2. SAFETY NET ---
    // If ID is missing (e.g. ID 11), show this Generic Bounty instead of crashing
    const defaultBounty = {
        title: "Exclusive Brand Campaign",
        brand: "Mystery Brand",
        logo: "https://logo.clearbit.com/google.com",
        badgeText: "Limited Time",
        posted: "Posted recently",
        description: "This is a placeholder for a new campaign. If you are seeing this, the database details haven't loaded yet, but you can still apply!",
        requirements: ["Create high quality content", "Tag the brand", "Follow guidelines"],
        payout: "$20.00", payoutSub: "per 1,000 views", budget: "$10,000", deadline: "Soon", format: "Video"
    };

    const bounty = BOUNTIES_DATA[params.id] || defaultBounty;

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
                            {/* Logo Box */}
                            <div className="h-20 w-20 shrink-0 rounded-2xl bg-white border border-zinc-100 shadow-sm p-3 flex items-center justify-center">
                                <img src={bounty.logo} alt="Brand Logo" className="w-full h-full object-contain" />
                            </div>
                        </div>

                        <hr className="my-8 border-zinc-100" />

                        <section className="space-y-4">
                            <h3 className="text-lg font-bold text-zinc-900">Campaign Brief</h3>
                            {/* whitespace-pre-wrap allows new lines in description */}
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
