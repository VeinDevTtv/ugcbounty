"use client"; // Client component for interactivity (Modal)

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Modal from "@/components/Modal";
import Toast from "@/components/Toast";
import { CheckCircle, Clock, DollarSign, FileText, Share2, UploadCloud } from "lucide-react";

export default function BountyDetails({ params }: { params: { id: string } }) {
    const [isModalOpen, setModalOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // --- NEW DUOLINGO CAMPAIGN DATA ---
    const campaign = {
        title: "Do your lesson or else...",
        brand: "Duolingo",
        brief: "We are looking for creators to demonstrate the Duolingo course structure. Showcase the learning path, how lessons are organized, and provide a clear, easy-to-follow instruction on how a user could successfully register for and begin a course module.",
        requirements: [
            "Video must showcase a specific course module and lesson structure clearly.",
            "Video must be a full-screen recording with clear voiceover instruction.",
            "Tag @Duolingo and use #DuolingoCourseReview",
            "Minimum video length: 60 seconds (for detailed instruction)"
        ],
        payoutRate: "$15.00",
        totalBudget: "$50,000",
        deadline: "Nov 30, 2025",
        format: "9:16 Vertical Video (Instructional)"
    };
    // ----------------------------------

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setModalOpen(false);
        setShowToast(true);
    };

    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

            {/* Left Col: Content */}
            <div className="lg:col-span-2 space-y-8">
                <div className="rounded-2xl border border-zinc-200 bg-white p-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <Badge variant="warning">Only 2 days left</Badge>
                            <h1 className="mt-3 text-3xl font-bold text-zinc-900">{campaign.title}</h1> {/* TITLE CHANGE */}
                            <div className="mt-2 flex items-center gap-2 text-zinc-500">
                                <span className="font-medium text-zinc-900">{campaign.brand}</span> {/* BRAND CHANGE */}
                                <span>•</span>
                                <span>Posted 3 days ago</span>
                            </div>
                        </div>
                        <div className="h-16 w-16 rounded-xl bg-zinc-100 flex items-center justify-center font-bold text-zinc-400">
                            LOGO
                        </div>
                    </div>

                    <hr className="my-8 border-zinc-100" />

                    <section className="space-y-4">
                        <h3 className="text-lg font-semibold text-zinc-900">Campaign Brief</h3>
                        <p className="text-zinc-600 leading-relaxed">
                            {campaign.brief} {/* BRIEF CHANGE */}
                        </p>
                    </section>

                    <section className="mt-8 space-y-4">
                        <h3 className="text-lg font-semibold text-zinc-900">Requirements</h3>
                        <ul className="space-y-2">
                            {/* REQUIREMENTS LOOP CHANGE */}
                            {campaign.requirements.map((req, i) => (
                                <li key={i} className="flex items-start gap-3 text-zinc-600">
                                    <CheckCircle className="h-5 w-5 shrink-0 text-indigo-600" />
                                    <span>{req}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </div>

            {/* Right Col: Action Sidebar */}
            <div className="space-y-6">
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 sticky top-24">
                    <div className="mb-6 text-center">
                        <p className="text-sm text-zinc-500">Payout Rate</p>
                        <div className="text-4xl font-bold text-zinc-900">{campaign.payoutRate}</div> {/* PAYOUT RATE CHANGE */}
                        <p className="text-xs font-medium text-zinc-400">per 1,000 qualified views</p>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2 text-zinc-600">
                                <DollarSign className="h-4 w-4" /> Total Budget
                            </span>
                            <span className="font-medium">{campaign.totalBudget}</span> {/* BUDGET CHANGE */}
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2 text-zinc-600">
                                <Clock className="h-4 w-4" /> Deadline
                            </span>
                            <span className="font-medium">{campaign.deadline}</span> {/* DEADLINE CHANGE */}
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2 text-zinc-600">
                                <FileText className="h-4 w-4" /> Format
                            </span>
                            <span className="font-medium">{campaign.format}</span> {/* FORMAT CHANGE */}
                        </div>
                    </div>

                    <Button className="w-full" size="lg" onClick={() => setModalOpen(true)}>
                        Submit Content
                    </Button>
                    <Button variant="ghost" className="w-full mt-2 gap-2">
                        <Share2 className="h-4 w-4" /> Share Campaign
                    </Button>
                </div>
            </div>

            {/* Submission Modal & Toast (unchanged) */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                title="Submit Your Content"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Content URL</label>
                        <input
                            required
                            type="url"
                            placeholder="https://tiktok.com/@user/video/..."
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        />
                        <p className="text-xs text-zinc-500 mt-1">Paste the direct link to your published post.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Platform</label>
                        <select className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                            <option>TikTok</option>
                            <option>Instagram Reels</option>
                            <option>YouTube Shorts</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Notes (Optional)</label>
                        <textarea
                            rows={3}
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none resize-none"
                        />
                    </div>

                    <div className="pt-2">
                        <Button type="submit" className="w-full gap-2">
                            <UploadCloud className="h-4 w-4" /> Submit for Review
                        </Button>
                    </div>
                </form>
            </Modal>

            <Toast
                show={showToast}
                message="Submission sent successfully!"
                onClose={() => setShowToast(false)}
            />
        </div>
    );
}
