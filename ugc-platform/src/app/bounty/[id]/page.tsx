"use client";

import { use, useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import ClaimBountyDialog from "@/components/ClaimBountyDialog";
import { ArrowLeft, CheckCircle, Clock, DollarSign, FileText, Eye, User } from "lucide-react";

interface BountyWithCreator {
  id: string;
  name: string;
  description: string;
  total_bounty: number;
  rate_per_1k_views: number;
  claimed_bounty: number;
  creator_id: string | null;
  logo_url?: string | null;
  company_name?: string | null;
  calculated_claimed_bounty: number;
  progress_percentage: number;
  total_submission_views: number;
  is_completed: boolean;
  created_at: string;
}

interface SubmissionWithUser {
  id: string;
  bounty_id: string | null;
  user_id: string | null;
  video_url: string;
  view_count: number;
  earned_amount: number;
  status: string;
  validation_explanation: string | null;
  title: string | null;
  description: string | null;
  cover_image_url: string | null;
  author: string | null;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'other' | null;
  created_at: string;
  user_profiles: {
    user_id: string;
    username: string;
    email: string;
  } | null;
}

interface Bounty {
  id: string;
  name: string;
  description: string;
  totalBounty: number;
  ratePer1kViews: number;
  claimedBounty: number;
  logoUrl?: string | null;
  companyName?: string | null;
  progressPercentage: number;
  totalSubmissionViews: number;
  isCompleted: boolean;
  createdAt: string;
  creatorId: string | null;
}

export default function BountyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = useUser();
  const resolvedParams = use(params);
  const bountyId = resolvedParams.id;

  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Calculate progress from submissions
  const [calculatedProgress, setCalculatedProgress] = useState({
    usedBounty: 0,
    progressPercentage: 0,
    isCompleted: false,
  });

  useEffect(() => {
    if (bountyId) {
      fetchBountyDetails();
      fetchSubmissions();
    }
  }, [bountyId]);

  const fetchBountyDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/bounties");
      if (response.ok) {
        const data: BountyWithCreator[] = await response.json();
        const foundBounty = data.find((b) => b.id === bountyId);

        if (!foundBounty) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        // Map database fields to frontend format
        const mappedBounty: Bounty = {
          id: foundBounty.id,
          name: foundBounty.name,
          description: foundBounty.description,
          totalBounty: Number(foundBounty.total_bounty),
          ratePer1kViews: Number(foundBounty.rate_per_1k_views),
          claimedBounty: Number(foundBounty.calculated_claimed_bounty),
          logoUrl: foundBounty.logo_url,
          companyName: foundBounty.company_name,
          progressPercentage: Number(foundBounty.progress_percentage),
          totalSubmissionViews: Number(foundBounty.total_submission_views),
          isCompleted: foundBounty.is_completed,
          createdAt: foundBounty.created_at,
          creatorId: foundBounty.creator_id,
        };

        setBounty(mappedBounty);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error("Error fetching bounty:", error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`/api/bounties/${bountyId}/submissions`);
      if (response.ok) {
        const data: SubmissionWithUser[] = await response.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  // Calculate progress from approved submissions
  useEffect(() => {
    if (bounty) {
      const approvedSubmissions = submissions.filter(
        (sub) => sub.status === "approved"
      );
      const totalViews = approvedSubmissions.reduce(
        (sum, sub) => sum + (Number(sub.view_count) || 0),
        0
      );

      // Formula: (totalViews / 1000) * ratePer1kViews
      const usedBounty = (totalViews / 1000) * bounty.ratePer1kViews;
      const totalBounty = bounty.totalBounty;
      
      // Cap at total: cappedUsedBounty = Math.min(usedBounty, totalBounty)
      const cappedUsedBounty = Math.min(usedBounty, totalBounty);
      
      // Percentage: progressPercentage = Math.min((usedBounty / totalBounty) * 100, 100)
      const progressPercentage =
        totalBounty > 0 ? Math.min((usedBounty / totalBounty) * 100, 100) : 0;
      
      // Completed if: usedBounty >= totalBounty
      const isCompleted = usedBounty >= totalBounty;

      setCalculatedProgress({
        usedBounty: cappedUsedBounty,
        progressPercentage,
        isCompleted,
      });
    }
  }, [bounty, submissions]);

  const isOwner = Boolean(user && bounty && bounty.creatorId === user.id);
  const isCompleted = calculatedProgress.isCompleted || bounty?.isCompleted || false;

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "pending":
      default:
        return "warning";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981]"></div>
      </div>
    );
  }

  if (notFound || !bounty) {
    return (
      <div className="min-h-screen bg-[#020617]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/"
            className="inline-flex items-center text-zinc-500 hover:text-zinc-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Bounties
          </Link>
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-zinc-900 mb-4">
              Bounty Not Found
            </h1>
            <p className="text-zinc-600">
              The bounty you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-zinc-500 hover:text-zinc-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Bounties
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Col: Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {isCompleted && (
                    <div className="mb-2">
                      <Badge variant="success">
                        Completed
                      </Badge>
                    </div>
                  )}
                  {!isCompleted && (
                    <Badge variant="warning">
                      {Math.round(calculatedProgress.progressPercentage)}% Filled
                    </Badge>
                  )}
                  <h1 className="mt-4 text-3xl md:text-4xl font-black text-zinc-900 leading-tight">
                    {bounty.name}
                  </h1>
                  <div className="mt-3 flex items-center gap-2 text-zinc-500 text-sm">
                    <span className="font-bold text-zinc-900">
                      {bounty.companyName || "Unknown Brand"}
                    </span>
                    <span>•</span>
                    <span>
                      Posted {formatDate(bounty.createdAt)}
                    </span>
                  </div>
                </div>
                {bounty.logoUrl && (
                  <div className="h-20 w-20 shrink-0 rounded-2xl bg-white border border-zinc-100 shadow-sm p-3 flex items-center justify-center">
                    <img
                      src={bounty.logoUrl}
                      alt="Brand Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>

              <hr className="my-8 border-zinc-100" />

              <section className="space-y-4">
                <h3 className="text-lg font-bold text-zinc-900">
                  Campaign Brief
                </h3>
                <p className="text-zinc-600 leading-relaxed text-lg whitespace-pre-wrap">
                  {bounty.description}
                </p>
              </section>

              {/* Progress Bar */}
              <section className="mt-8 space-y-4">
                <h3 className="text-lg font-bold text-zinc-900">Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600">
                      ${calculatedProgress.usedBounty.toFixed(2)} / ${bounty.totalBounty.toFixed(2)} used
                    </span>
                    <span className="text-zinc-600">
                      {Math.round(calculatedProgress.progressPercentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 rounded-full h-3">
                    <div
                      className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(calculatedProgress.progressPercentage, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </section>

              {/* Submissions List */}
              <section className="mt-8 space-y-4">
                <h3 className="text-lg font-bold text-zinc-900">
                  Submissions ({submissions.length})
                </h3>
                {submissions.length === 0 ? (
                  <div className="text-center py-12 bg-zinc-50 rounded-xl border border-zinc-100">
                    <p className="text-zinc-600 text-lg">
                      No submissions yet. Be the first to submit!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-4">
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
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <Badge variant={getStatusBadgeVariant(submission.status)}>
                                {submission.status}
                              </Badge>
                              {submission.user_profiles && (
                                <div className="flex items-center gap-2 text-sm text-zinc-600">
                                  <User className="h-4 w-4" />
                                  <span className="font-medium">
                                    {submission.user_profiles.username ||
                                      submission.user_profiles.email}
                                  </span>
                                </div>
                              )}
                              <span className="text-xs text-zinc-500">
                                {formatDate(submission.created_at)}
                              </span>
                            </div>

                            <div>
                              <a
                                href={submission.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-800 font-medium text-sm break-all"
                              >
                                {submission.title || submission.video_url}
                              </a>
                            </div>

                            <div className="flex items-center gap-6 text-sm">
                              <div className="flex items-center gap-2 text-zinc-600">
                                <Eye className="h-4 w-4" />
                                <span>
                                  {submission.view_count.toLocaleString()} views
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-zinc-600">
                                <DollarSign className="h-4 w-4" />
                                <span>
                                  ${submission.earned_amount.toFixed(2)} earned
                                </span>
                              </div>
                            </div>

                            {submission.validation_explanation && (
                              <div className="mt-3 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                                <p className="text-xs text-zinc-600">
                                  <span className="font-semibold">Note: </span>
                                  {submission.validation_explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* Right Col: Action Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 sticky top-24 shadow-lg shadow-zinc-100">
              <div className="mb-8 text-center">
                <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-1">
                  Payout Rate
                </p>
                <div className="text-5xl font-black text-zinc-900 tracking-tight">
                  ${bounty.ratePer1kViews.toFixed(2)}
                </div>
                <p className="text-xs font-medium text-zinc-400 mt-2">
                  per 1,000 qualified views
                </p>
              </div>

              <div className="space-y-4 mb-8 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                <div className="flex flex-col gap-1 text-sm mb-3">
                  <span className="flex items-center gap-2 text-zinc-500 font-medium">
                    <DollarSign className="h-4 w-4" /> Total Budget
                  </span>
                  <span className="font-bold text-zinc-900">
                    ${bounty.totalBounty.toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-col gap-1 text-sm border-t border-zinc-200 pt-3">
                  <span className="flex items-center gap-2 text-zinc-500 font-medium">
                    <FileText className="h-4 w-4" /> Status
                  </span>
                  <span className="font-bold text-zinc-900">
                    {isCompleted ? "Completed" : "Active"}
                  </span>
                </div>
              </div>

              {isOwner ? (
                <div className="space-y-3">
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <p className="text-sm text-indigo-900 font-medium text-center">
                      This is your bounty. Creators will submit their content
                      here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {isCompleted ? (
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                      <p className="text-sm text-green-900 font-medium text-center">
                        This bounty has been completed
                      </p>
                    </div>
                  ) : (
                    <Button
                      className="w-full text-lg py-6 shadow-xl shadow-indigo-200"
                      size="lg"
                      onClick={() => setIsDialogOpen(true)}
                    >
                      Submit for this Bounty
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Claim Bounty Dialog */}
        {bounty && (
          <ClaimBountyDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            bounty={{
              id: bounty.id,
              title: bounty.name,
              brand: bounty.companyName || "Unknown",
              payout: bounty.ratePer1kViews.toFixed(2),
              deadline: "Ongoing",
              description: bounty.description,
            }}
            isCompleted={isCompleted}
          />
        )}
      </div>
    </div>
  );
}

