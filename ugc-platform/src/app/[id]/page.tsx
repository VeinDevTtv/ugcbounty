"use client"; // Client component for interactivity (Modal)

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Modal from "@/components/Modal";
import Toast from "@/components/Toast";
import { CheckCircle, Clock, DollarSign, FileText, Share2, UploadCloud, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BountyDetails({ params }: { params: { id: string } }) {
    const [isModalOpen, setModalOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setModalOpen(false);
        setShowToast(true);
    };

    // UPDATED DATA: "Duolingo Language Chaos Challenge"
    const bounty = {
        title: "Duolingo Language Chaos Challenge",
        brand: "DuoLearn",
        // We use the official Duolingo logo since it matches the vibe
        logo: "https://logo.clearbit.com/duolingo.com",
        badgeText: "Only 2 days left",
        posted: "Posted 3 days ago",
        description: `DuoLearn (yes, the owl’s cousin) is launching a new language-learning feature, and we need bold, funny, chaotic creators to show how FUN learning a language can be.

Your mission is simple: Make a video so entertaining that people forget they’re learning something.

Think: “Learn Spanish or ELSE.” crying green owl memes, relatable language mistakes, gamified progress addiction, your wild reactions to streak pressure.

Make it fun. Make it chaotic. Make Duo proud.`,
        requirements: [
            "Show the language-learning app in the first 3 seconds (Duo must see it IMMEDIATELY.)",
            "Use the official campaign audio (It screams “do your lessons.”)",
            "Tag @DuoLearn + #DuoLanguageChallenge (We track it. Duo tracks everything.)",
            "Minimum video length: 15 seconds (Long enough to show the chaos. Short enough to keep attention.)"
        ],
        payout: "$25.00",
        payoutSub: "per 1,000 qualified views (Duo says no excuses.)",
        budget: "$5,000",
        deadline: "Oct 24, 2025",
        format: "9:16 Vertical Video"
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
                            {/* whitespace-pre-wrap allows the new lines in description to show properly */}
                            <p className="text-zinc-600 leading-relaxed text-lg whitespace-pre-wrap">
                                {bounty.description}
                            </p>
                        </section>

                        <section className="mt-8 space-y-4">
                            <h3 className="text-lg font-bold text-zinc-900">Requirements</h3>
                            <ul className="space-y-3">
                                {bounty.requirements.map((req, i) => (
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
                                <span className="text-xs text-zinc-400">(Learn languages. Get paid. Easy.)</span>
                            </div>
                            
                            <div className="flex flex-col gap-1 text-sm mb-3 border-t border-zinc-200 pt-3">
                                <span className="flex items-center gap-2 text-zinc-500 font-medium">
                                    <Clock className="h-4 w-4" /> Deadline
                                </span>
                                <span className="font-bold text-zinc-900">{bounty.deadline}</span>
                                <span className="text-xs text-zinc-400">(Do your lesson before it’s too late.)</span>
                            </div>

                            <div className="flex flex-col gap-1 text-sm border-t border-zinc-200 pt-3">
                                <span className="flex items-center gap-2 text-zinc-500 font-medium">
                                    <FileText className="h-4 w-4" /> Format
                                </span>
                                <span className="font-bold text-zinc-900">{bounty.format}</span>
                                <span className="text-xs text-zinc-400">(TikTok / Reels / Shorts perfection.)</span>
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
                    title="Submit Your Content"
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
