"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import ClaimBountyDialog from "@/components/ClaimBountyDialog";
import { useUser } from "@clerk/nextjs";
import { Bounty } from "@/app/data/bounties";

interface Submission {
  id: string;
  bounty_id: string;
  user_id: string;
  video_url: string;
  view_count: number;
  earned_amount: number;
  status: "pending" | "approved" | "rejected";
  validation_explanation: string | null;
  title: string | null;
  description: string | null;
  cover_image_url: string | null;
  author: string | null;
  platform: "youtube" | "tiktok" | "instagram" | "other" | null;
  created_at: string;
  updated_at: string;
  user_profiles: {
    username: string | null;
    email: string | null;
  } | null;
}

export default function BountyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useUser();
  const bountyId = id;

  const [showModal, setShowModal] = useState(false);
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  // Calculate progress purely from submissions
  const calculateProgressFromSubmissions = () => {
    if (!bounty || !submissions.length) {
      return {
        claimedBounty: 0,
        progressPercentage: 0,
        totalViews: 0,
        isCompleted: false
      };
    }

    const approvedSubmissions = submissions.filter(sub => sub.status === 'approved');
    const totalViews = approvedSubmissions.reduce((sum, sub) => sum + (sub.view_count || 0), 0);
    
    // Calculate how much bounty has been "used" based purely on views
    const usedBounty = (totalViews / 1000) * bounty.ratePer1kViews;
    const cappedUsedBounty = Math.min(usedBounty, bounty.totalBounty);
    const progressPercentage = Math.min((usedBounty / bounty.totalBounty) * 100, 100);
    const isCompleted = usedBounty >= bounty.totalBounty;

    return {
      claimedBounty: cappedUsedBounty,
      progressPercentage,
      totalViews,
      isCompleted
    };
  };

  const progressData = calculateProgressFromSubmissions();

  useEffect(() => {
    const fetchBounty = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/bounties");
        if (response.ok) {
          const data = await response.json();
          const foundBounty = data.find(
            (b: { id: string; creator_id?: string | null }) => b.id === bountyId
          );
          if (foundBounty) {
            // Map to frontend format - only use basic bounty data
            const mappedBounty: Bounty = {
              id: foundBounty.id,
              name: foundBounty.name,
              description: foundBounty.description,
              totalBounty: foundBounty.total_bounty,
              ratePer1kViews: foundBounty.rate_per_1k_views,
              claimedBounty: 0, // Will be calculated from submissions
              logoUrl: foundBounty.logo_url,
              companyName: foundBounty.company_name,
            };
            setBounty(mappedBounty);

            // Check if user is owner
            if (user && foundBounty.creator_id === user.id) {
              setIsOwner(true);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching bounty:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBounty();
  }, [bountyId, user]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(`/api/bounties/${bountyId}/submissions`);
        if (response.ok) {
          const data = await response.json();
          setSubmissions(data);
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
      }
    };

    if (bountyId) {
      fetchSubmissions();
    }
  }, [bountyId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!bounty) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-zinc-900 mb-4">
            Bounty Not Found
          </h1>
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 hover:underline">
            ← Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Link href="/" className="text-indigo-600 hover:text-indigo-700 hover:underline mb-6 inline-block">
        ← Back to Bounties
      </Link>

      <div className="overflow-hidden border border-zinc-200 rounded-xl bg-white">
          {/* Hero Section */}
          <div className="border-b border-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              <div
                className="flex flex-col justify-center items-center bg-indigo-600 p-6 md:h-full md:row-span-full md:self-stretch order-1 md:order-1 rounded-tl-xl"
                style={{ minHeight: "100%" }}
              >
                <span className="text-sm text-white/90">Total Bounty</span>
                <span className="text-4xl font-bold text-white">
                  ${bounty.totalBounty.toLocaleString()}
                </span>
              </div>
              <div className="md:col-span-3 p-6 order-2 md:order-2">
                {(bounty.logoUrl || bounty.companyName) && (
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-zinc-200">
                    {bounty.logoUrl && (
                      <img
                        src={bounty.logoUrl}
                        alt={bounty.companyName || "Company logo"}
                        className="h-12 w-12 object-contain rounded-lg"
                      />
                    )}
                    {bounty.companyName && (
                      <span className="text-lg font-medium text-zinc-700">
                        {bounty.companyName}
                      </span>
                    )}
                  </div>
                )}
                <h2 className="text-3xl font-bold mb-2 text-zinc-900">
                  {bounty.name}
                </h2>
                <p className="text-zinc-600 text-lg">{bounty.description}</p>
              </div>
            </div>
          </div>

          <div className="border-b border-zinc-200">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Rate Card */}
              <div className="border-r border-zinc-200">
                <h3 className="text-lg font-semibold text-zinc-900 mb-2 p-6 pb-0">
                  Earning Rate
                </h3>
                <p className="text-3xl font-bold text-indigo-600 px-6">
                  ${bounty.ratePer1kViews} per 1,000 views
                </p>
                <p className="text-sm text-zinc-600 mt-2 px-6 pb-6">
                  Get paid for every thousand views your content receives
                </p>
              </div>

              {/* Potential Earnings Calculator */}
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2 p-6 pb-0">
                  Potential Earnings
                </h3>
                <div className="space-y-2 px-6 pb-6">
                  <div className="flex justify-between">
                    <span className="text-zinc-600">10k views:</span>
                    <span className="font-semibold text-zinc-900">
                      ${(10 * bounty.ratePer1kViews).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">50k views:</span>
                    <span className="font-semibold text-zinc-900">
                      ${(50 * bounty.ratePer1kViews).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">100k views:</span>
                    <span className="font-semibold text-emerald-600 font-bold">
                      ${(100 * bounty.ratePer1kViews).toFixed(2)}
                    </span>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="border-b border-zinc-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-zinc-900 mb-4">
                Bounty Progress
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-zinc-900">Progress</span>
                  <span className="text-sm text-zinc-600">
                    {progressData.isCompleted ? '$0 remaining' : `$${(bounty.totalBounty - progressData.claimedBounty).toLocaleString()} remaining`}
                  </span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      progressData.isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${progressData.progressPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-600">
                    ${progressData.claimedBounty.toLocaleString()} claimed
                  </span>
                  <span className="text-sm font-semibold text-zinc-900">
                    {progressData.progressPercentage.toFixed(0)}%
                  </span>
                </div>
                {progressData.totalViews > 0 && (
                  <div className="text-sm text-zinc-500">
                    {progressData.totalViews.toLocaleString()} total views from submissions
                  </div>
                )}
                {progressData.isCompleted && (
                  <div className="text-sm text-emerald-600 font-medium">
                    ✓ This bounty has been completed
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8">
            {/* Requirements Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-zinc-900 mb-4">
                Requirements
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl">✓</span>
                  <span className="text-zinc-700">
                    Create original content featuring the product
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl">✓</span>
                  <span className="text-zinc-700">
                    Post on any major social media platform (TikTok, Instagram,
                    YouTube, Twitter, Facebook)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl">✓</span>
                  <span className="text-zinc-700">
                    Submit your content URL to track views and earnings
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl">✓</span>
                  <span className="text-zinc-700">
                    Keep content live for at least 30 days
                  </span>
                </li>
              </ul>
            </div>

            {/* How It Works Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-zinc-900 mb-12">
                How It Works
              </h3>
              <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <span className="text-6xl font-bold text-indigo-600">1</span>
                    <div>
                      <h4 className="font-semibold text-zinc-900 mb-2 text-lg">
                        Create Content
                      </h4>
                      <p className="text-zinc-600">
                        Make engaging content featuring the product
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-6xl font-bold text-indigo-600">2</span>
                    <div>
                      <h4 className="font-semibold text-zinc-900 mb-2 text-lg">
                        Submit & Track
                      </h4>
                      <p className="text-zinc-600">
                        Submit your URL and we&apos;ll track your views
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-6xl font-bold text-indigo-600">3</span>
                    <div>
                      <h4 className="font-semibold text-zinc-900 mb-2 text-lg">
                        Get Paid
                      </h4>
                      <p className="text-zinc-600">
                        Earn money based on your view count
                      </p>
                    </div>
                  </div>
              </div>
            </div>

            {/* CTA Button - Only show if not owner */}
                {!isOwner ? (
                  progressData.isCompleted ? (
                    <div className="w-full border-2 border-emerald-500 bg-emerald-50 text-emerald-700 font-bold py-4 px-8 text-center text-lg rounded-lg">
                      This bounty has been completed
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowModal(true)}
                      className="w-full bg-indigo-600 text-white font-bold py-4 px-8 hover:bg-indigo-700 transition-all duration-200 text-lg rounded-lg"
                    >
                      Submit your content to participate in this bounty
                    </button>
                  )
                ) : (
                  <div className="w-full border-2 border-zinc-200 bg-zinc-50 text-zinc-600 font-bold py-4 px-8 text-center text-lg rounded-lg">
                    This is your bounty. Creators will submit their content here.
                  </div>
                )}
          </div>
        </div>

        {/* Submissions Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-zinc-900 mb-6">
            Submissions ({submissions.length})
          </h3>

          {submissions.length === 0 ? (
            <div className="text-center py-8 border border-zinc-200 rounded-xl bg-white">
              <p className="text-zinc-600">
                No submissions yet. Be the first to submit!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission, index) => (
                <div
                  key={submission.id}
                  className="border border-zinc-200 rounded-xl p-6 bg-white"
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    {submission.cover_image_url && (
                      <div className="flex-shrink-0">
                        <img
                          src={submission.cover_image_url}
                          alt={submission.title || "Video thumbnail"}
                          className="w-32 h-24 object-cover border border-zinc-200 rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${
                              submission.status === "approved"
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                : submission.status === "rejected"
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                            }`}
                          >
                            {submission.status.charAt(0).toUpperCase() +
                              submission.status.slice(1)}
                          </span>
                          <span className="text-sm text-zinc-600">
                            {new Date(
                              submission.created_at
                            ).toLocaleDateString()}
                          </span>
                        </div>

                        <a
                          href={submission.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-700 hover:underline font-medium mb-2 block"
                        >
                          {submission.title || submission.video_url}
                        </a>

                        <p className="text-sm text-zinc-600">
                          Submitted by:{" "}
                          {submission.user_profiles?.username ||
                            submission.user_profiles?.email ||
                            "Anonymous"}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-zinc-900">
                          {submission.view_count.toLocaleString()} views
                        </div>
                        <div className="text-sm text-emerald-600 font-medium">
                          ${submission.earned_amount.toFixed(2)} earned
                        </div>
                      </div>
                    </div>
                  </div>
                  {submission.validation_explanation && (
                    <div className="mt-3 p-3 border border-zinc-200 bg-zinc-50 rounded-lg">
                      <p className="text-sm text-zinc-700">
                        <strong>Note:</strong>{" "}
                        {submission.validation_explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      {/* Claim Bounty Modal */}
      {showModal && bounty && (
        <ClaimBountyDialog
          bounty={bounty}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          isCompleted={progressData.isCompleted}
        />
      )}
    </>
  );
}

