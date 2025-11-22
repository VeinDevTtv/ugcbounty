"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { Edit2, ExternalLink, DollarSign, Eye, CheckCircle, XCircle, Clock } from "lucide-react";

// TypeScript Interfaces
interface BountyWithProgress {
  id: string; // UUID
  name: string;
  description: string;
  total_bounty: number;
  rate_per_1k_views: number;
  calculated_claimed_bounty: number;
  progress_percentage: number;
  total_submission_views: number;
  is_completed: boolean;
  creator_id: string | null;
  created_at: string;
}

interface SubmissionWithBounty {
  id: string; // UUID
  bounty_id: string | null;
  user_id: string | null;
  video_url: string;
  view_count: number;
  earned_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  validation_explanation: string | null;
  created_at: string;
  bounties: {
    id: string;
    name: string;
    rate_per_1k_views: number;
  } | null;
}

// Helper Functions
const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'error' => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    case 'pending':
    default:
      return 'warning';
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const calculatePotentialEarnings = (viewCount: number, ratePer1kViews: number): number => {
  return (viewCount / 1000) * ratePer1kViews;
};

const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'bounties' | 'submissions'>('bounties');
  
  // Data state
  const [bounties, setBounties] = useState<BountyWithProgress[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionWithBounty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Edit state
  const [editingBountyId, setEditingBountyId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
  }, [isLoaded, user, router]);

  // Fetch bounties
  useEffect(() => {
    if (user && isLoaded) {
      fetchBounties();
      fetchSubmissions();
    }
  }, [user, isLoaded]);

  const fetchBounties = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/bounties');
      if (response.ok) {
        const data: BountyWithProgress[] = await response.json();
        // Filter by creator_id
        const userBounties = data.filter(bounty => bounty.creator_id === user?.id);
        setBounties(userBounties);
      } else {
        console.error('Failed to fetch bounties');
      }
    } catch (error) {
      console.error('Error fetching bounties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/submissions');
      if (response.ok) {
        const data: SubmissionWithBounty[] = await response.json();
        setSubmissions(data);
      } else {
        console.error('Failed to fetch submissions');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleEditClick = (bounty: BountyWithProgress) => {
    setEditingBountyId(bounty.id);
    setEditName(bounty.name);
    setEditDescription(bounty.description);
  };

  const handleCancelEdit = () => {
    setEditingBountyId(null);
    setEditName('');
    setEditDescription('');
  };

  const handleSaveEdit = async (bountyId: string) => {
    if (!editName.trim() || !editDescription.trim()) {
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/bounties', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bountyId,
          name: editName.trim(),
          description: editDescription.trim(),
        }),
      });

      if (response.ok) {
        const updatedBounty = await response.json();
        // Update local state
        setBounties(prevBounties =>
          prevBounties.map(bounty =>
            bounty.id === bountyId
              ? { ...bounty, name: updatedBounty.name, description: updatedBounty.description }
              : bounty
          )
        );
        setEditingBountyId(null);
        setEditName('');
        setEditDescription('');
      } else {
        const error = await response.json();
        console.error('Failed to update bounty:', error);
        alert('Failed to update bounty. Please try again.');
      }
    } catch (error) {
      console.error('Error updating bounty:', error);
      alert('An error occurred while updating the bounty.');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate stats for submissions
  const submissionStats = {
    totalEarnings: submissions.reduce((sum, sub) => sum + (sub.earned_amount || 0), 0),
    totalViews: submissions.reduce((sum, sub) => sum + (sub.view_count || 0), 0),
    approvedCount: submissions.filter(sub => sub.status === 'approved').length,
    pendingCount: submissions.filter(sub => sub.status === 'pending').length,
    rejectedCount: submissions.filter(sub => sub.status === 'rejected').length,
  };

  // Show loading spinner
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-[#E8ECF3] dark:bg-[#020617] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B3C73] dark:border-[#10B981]"></div>
      </div>
    );
  }

  // Redirect if not logged in (handled by useEffect, but show nothing while redirecting)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#E8ECF3] dark:bg-[#020617]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile Header */}
        <div className="bg-white border border-[#C8D1E0] rounded-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.username || user.emailAddresses[0]?.emailAddress || "Profile"}
                className="h-20 w-20 rounded-full border-2 border-[#C8D1E0]"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-2xl border-2 border-[#C8D1E0]">
                {user?.username?.[0]?.toUpperCase() || user?.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-[#2E3A47]">
                {user?.username || user?.firstName || user?.lastName || "Profile"}
              </h1>
              {user?.emailAddresses?.[0]?.emailAddress && (
                <p className="text-[#52677C] mt-1">{user.emailAddresses[0].emailAddress}</p>
              )}
              {user?.username && user?.emailAddresses?.[0]?.emailAddress && (
                <p className="text-sm text-[#6B7A8F] mt-1">@{user.username}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-8 border-b border-[#C8D1E0] mb-8">
          <button
            onClick={() => setActiveTab('bounties')}
            className={cn(
              "pb-4 px-2 text-sm font-medium transition-colors",
              activeTab === 'bounties'
                ? "border-b-2 border-[#1B3C73] text-black"
                : "text-[#6B7A8F] hover:text-[#2E3A47]"
            )}
          >
            My Bounties ({bounties.length})
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={cn(
              "pb-4 px-2 text-sm font-medium transition-colors",
              activeTab === 'submissions'
                ? "border-b-2 border-[#1B3C73] text-black"
                : "text-[#6B7A8F] hover:text-[#2E3A47]"
            )}
          >
            My Submissions ({submissions.length})
          </button>
        </div>

        {/* Bounties Tab */}
        {activeTab === 'bounties' && (
          <div className="space-y-6">
            {bounties.length === 0 ? (
              <div className="bg-white border border-[#1B3C73] rounded-lg p-12 text-center">
                <p className="text-[#52677C] text-lg mb-4">
                  You haven't created any bounties yet.
                </p>
                <Link href="/">
                  <Button>Browse Bounties</Button>
                </Link>
              </div>
            ) : (
              bounties.map((bounty) => (
                <div
                  key={bounty.id}
                  className="bg-white border border-[#1B3C73] rounded-lg p-6 space-y-4"
                >
                  {editingBountyId === bounty.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#2E3A47] mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-4 py-2 border border-[#C8D1E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                          placeholder="Bounty name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#2E3A47] mb-2">
                          Description
                        </label>
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full px-4 py-2 border border-[#C8D1E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-black min-h-[100px]"
                          placeholder="Bounty description"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSaveEdit(bounty.id)}
                          disabled={!editName.trim() || !editDescription.trim() || isSaving}
                        >
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button variant="outline" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-[#2E3A47] mb-2">
                            {bounty.name}
                          </h2>
                          <p className="text-[#52677C] mb-4">{bounty.description}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(bounty)}
                          className="ml-4"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit Details
                        </Button>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-[#C8D1E0]">
                        <div>
                          <p className="text-sm text-[#6B7A8F] mb-1">Total Bounty</p>
                          <p className="text-lg font-bold text-[#2E3A47]">
                            {formatCurrency(bounty.total_bounty)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[#6B7A8F] mb-1">Rate per 1k Views</p>
                          <p className="text-lg font-bold text-[#2E3A47]">
                            {formatCurrency(bounty.rate_per_1k_views)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[#6B7A8F] mb-1">Claimed Bounty</p>
                          <p className="text-lg font-bold text-[#2E3A47]">
                            {formatCurrency(bounty.calculated_claimed_bounty)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[#6B7A8F] mb-1">Remaining</p>
                          <p className="text-lg font-bold text-[#2E3A47]">
                            {formatCurrency(
                              bounty.total_bounty - bounty.calculated_claimed_bounty
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#C8D1E0]">
                        <Link
                          href={`/bounty/${bounty.id}`}
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-sm inline-flex items-center gap-1"
                        >
                          View Bounty Details →
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-[#1B3C73] rounded-lg p-4">
                <p className="text-sm text-[#6B7A8F] mb-1">Total Earnings</p>
                <p className="text-2xl font-bold text-[#2E3A47]">
                  {formatCurrency(submissionStats.totalEarnings)}
                </p>
              </div>
              <div className="bg-white border border-[#1B3C73] rounded-lg p-4">
                <p className="text-sm text-[#6B7A8F] mb-1">Total Views</p>
                <p className="text-2xl font-bold text-[#2E3A47]">
                  {submissionStats.totalViews.toLocaleString()}
                </p>
              </div>
              <div className="bg-white border border-[#1B3C73] rounded-lg p-4">
                <p className="text-sm text-[#6B7A8F] mb-1">Approved</p>
                <p className="text-2xl font-bold text-[#2E3A47]">
                  {submissionStats.approvedCount}
                </p>
              </div>
              <div className="bg-white border border-[#1B3C73] rounded-lg p-4">
                <p className="text-sm text-[#6B7A8F] mb-1">Pending</p>
                <p className="text-2xl font-bold text-[#2E3A47]">
                  {submissionStats.pendingCount}
                </p>
              </div>
            </div>

            {submissions.length === 0 ? (
              <div className="bg-white border border-[#1B3C73] rounded-lg p-12 text-center">
                <p className="text-[#52677C] text-lg mb-4">
                  You haven't submitted to any bounties yet.
                </p>
                <Link href="/">
                  <Button>Browse Bounties</Button>
                </Link>
              </div>
            ) : (
              submissions.map((submission) => {
                const potentialEarnings = submission.bounties
                  ? calculatePotentialEarnings(
                      submission.view_count,
                      submission.bounties.rate_per_1k_views
                    )
                  : 0;

                return (
                  <div
                    key={submission.id}
                    className="bg-white border border-[#1B3C73] rounded-lg p-6 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link
                          href={`/bounty/${submission.bounty_id}`}
                          className="text-xl font-bold text-[#2E3A47] hover:text-[#4F6FA8] mb-2 block"
                        >
                          {submission.bounties?.name || 'Unknown Bounty'}
                        </Link>
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant={getStatusBadgeVariant(submission.status)}>
                            {submission.status}
                          </Badge>
                          <span className="text-sm text-[#6B7A8F]">
                            {formatDate(submission.created_at)}
                          </span>
                        </div>
                        <a
                          href={submission.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-sm inline-flex items-center gap-1 mb-4"
                        >
                          {submission.video_url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-[#C8D1E0]">
                      <div>
                        <p className="text-sm text-[#6B7A8F] mb-1">Views</p>
                        <p className="text-lg font-bold text-[#2E3A47]">
                          {submission.view_count.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[#6B7A8F] mb-1">Rate per 1k</p>
                        <p className="text-lg font-bold text-[#2E3A47]">
                          {submission.bounties
                            ? formatCurrency(submission.bounties.rate_per_1k_views)
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[#6B7A8F] mb-1">Earned</p>
                        <p className="text-lg font-bold text-[#2E3A47]">
                          {formatCurrency(submission.earned_amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[#6B7A8F] mb-1">Potential Earnings</p>
                        <p className="text-lg font-bold text-[#2E3A47]">
                          {formatCurrency(potentialEarnings)}
                        </p>
                      </div>
                    </div>

                    {submission.validation_explanation && (
                      <div className="mt-4 p-3 bg-[#F7FAFC] rounded-lg border border-[#C8D1E0]">
                        <p className="text-xs text-[#52677C]">
                          <span className="font-semibold">Note: </span>
                          {submission.validation_explanation}
                        </p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-[#C8D1E0]">
                      <Link
                        href={`/bounty/${submission.bounty_id}`}
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-sm inline-flex items-center gap-1"
                      >
                        View Bounty Details →
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

