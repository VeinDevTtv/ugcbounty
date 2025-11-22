"use client";

import { useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { Edit2, ExternalLink, DollarSign, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

// TypeScript Interfaces
interface BountyWithProgress {
  id: string; // UUID
  name: string;
  description: string;
  instructions: string | null;
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
  const { theme } = useTheme();
  
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
  const [editInstructions, setEditInstructions] = useState('');
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
    setEditInstructions(bounty.instructions || '');
  };

  const handleCancelEdit = () => {
    setEditingBountyId(null);
    setEditName('');
    setEditDescription('');
    setEditInstructions('');
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
          instructions: editInstructions.trim() || null,
        }),
      });

      if (response.ok) {
        const updatedBounty = await response.json();
        // Update local state
        setBounties(prevBounties =>
          prevBounties.map(bounty =>
            bounty.id === bountyId
              ? { ...bounty, name: updatedBounty.name, description: updatedBounty.description, instructions: updatedBounty.instructions || null }
              : bounty
          )
        );
        setEditingBountyId(null);
        setEditName('');
        setEditDescription('');
        setEditInstructions('');
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
      <div className={`min-h-screen transition-colors ${
        theme === "light" ? "bg-[#E8ECF3]" : "bg-[#0A0F17]"
      } flex items-center justify-center`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
          theme === "light" ? "border-[#1B3C73]" : "border-[#60A5FA]"
        }`}></div>
      </div>
    );
  }

  // Redirect if not logged in (handled by useEffect, but show nothing while redirecting)
  if (!user) {
    return null;
  }

  return (
    <div className={`min-h-screen transition-colors ${
      theme === "light" ? "bg-[#E8ECF3]" : "bg-[#0A0F17]"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile Header */}
        <div className={`border rounded-lg p-6 mb-8 ${
          theme === "light"
            ? "bg-white border-[#C8D1E0]"
            : "bg-[#141B23] border-[#1A2332]"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.username || user.emailAddresses[0]?.emailAddress || "Profile"}
                  className={`h-20 w-20 rounded-full border-2 ${
                    theme === "light" ? "border-[#C8D1E0]" : "border-[#1A2332]"
                  }`}
                />
              ) : (
                <div className={`h-20 w-20 rounded-full flex items-center justify-center text-white font-bold text-2xl border-2 ${
                  theme === "light"
                    ? "bg-emerald-600 border-[#C8D1E0]"
                    : "bg-emerald-600 border-[#1A2332]"
                }`}>
                  {user?.username?.[0]?.toUpperCase() || user?.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <div>
                <h1 className={`text-3xl font-bold ${
                  theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
                }`}>
                  {user?.username || user?.firstName || user?.lastName || "Profile"}
                </h1>
                {user?.emailAddresses?.[0]?.emailAddress && (
                  <p className={`mt-1 ${
                    theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
                  }`}>
                    {user.emailAddresses[0].emailAddress}
                  </p>
                )}
                {user?.username && user?.emailAddresses?.[0]?.emailAddress && (
                  <p className={`text-sm mt-1 ${
                    theme === "light" ? "text-[#6B7A8F]" : "text-[#B8C5D6]"
                  }`}>
                    @{user.username}
                  </p>
                )}
              </div>
            </div>
            {/* UserButton for sign out and account management */}
            <div className="flex items-center">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`flex gap-8 border-b mb-8 ${
          theme === "light" ? "border-[#C8D1E0]" : "border-[#1A2332]"
        }`}>
          <button
            onClick={() => setActiveTab('bounties')}
            className={cn(
              "pb-4 px-2 text-sm font-medium transition-colors",
              activeTab === 'bounties'
                ? theme === "light"
                  ? "border-b-2 border-[#1B3C73] text-black"
                  : "border-b-2 border-[#60A5FA] text-[#F5F8FC]"
                : theme === "light"
                  ? "text-[#6B7A8F] hover:text-[#2E3A47]"
                  : "text-[#B8C5D6] hover:text-[#F5F8FC]"
            )}
          >
            My Bounties ({bounties.length})
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={cn(
              "pb-4 px-2 text-sm font-medium transition-colors",
              activeTab === 'submissions'
                ? theme === "light"
                  ? "border-b-2 border-[#1B3C73] text-black"
                  : "border-b-2 border-[#60A5FA] text-[#F5F8FC]"
                : theme === "light"
                  ? "text-[#6B7A8F] hover:text-[#2E3A47]"
                  : "text-[#B8C5D6] hover:text-[#F5F8FC]"
            )}
          >
            My Submissions ({submissions.length})
          </button>
        </div>

        {/* Bounties Tab */}
        {activeTab === 'bounties' && (
          <div className="space-y-6">
            {bounties.length === 0 ? (
              <div className={`border rounded-lg p-12 text-center ${
                theme === "light"
                  ? "bg-white border-[#C8D1E0]"
                  : "bg-[#141B23] border-[#1A2332]"
              }`}>
                <p className={`text-lg mb-4 ${
                  theme === "light" ? "text-[#52677C]" : "text-gray-400"
                }`}>
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
                  className={`border rounded-lg p-6 space-y-4 ${
                    theme === "light"
                      ? "bg-white border-[#C8D1E0]"
                      : "bg-[#141B23] border-[#1A2332]"
                  }`}
                >
                  {editingBountyId === bounty.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
                        }`}>
                          Name
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            theme === "light"
                              ? "border-[#C8D1E0] bg-white text-[#2E3A47] focus:ring-black"
                              : "border-[#1A2332] bg-[#1F2937] text-[#F5F8FC] focus:ring-[#60A5FA]"
                          }`}
                          placeholder="Bounty name"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
                        }`}>
                          Description
                        </label>
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 min-h-[100px] ${
                            theme === "light"
                              ? "border-[#C8D1E0] bg-white text-[#2E3A47] focus:ring-black"
                              : "border-[#1A2332] bg-[#1F2937] text-[#F5F8FC] focus:ring-[#60A5FA]"
                          }`}
                          placeholder="Bounty description"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
                        }`}>
                          Instructions 
                        </label>
                        <textarea
                          value={editInstructions}
                          onChange={(e) => setEditInstructions(e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 min-h-[100px] ${
                            theme === "light"
                              ? "border-[#C8D1E0] bg-white text-[#2E3A47] focus:ring-black"
                              : "border-[#1A2332] bg-[#1F2937] text-[#F5F8FC] focus:ring-[#60A5FA]"
                          }`}
                          placeholder="Exact requirements that submitted videos must meet to be accepted..."
                        />
                        <p className={`text-xs mt-1 ${
                          theme === "light" ? "text-[#6B7A8F]" : "text-[#B8C5D6]"
                        }`}>
                          These instructions will be used for video validation. If left empty, the description will be used.
                        </p>
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
                          <h2 className={`text-2xl font-bold mb-2 ${
                            theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
                          }`}>
                            {bounty.name}
                          </h2>
                          <p className={`mb-4 ${
                            theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
                          }`}>
                            {bounty.description}
                          </p>
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
                      <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t ${
                        theme === "light" ? "border-[#C8D1E0]" : "border-[#1A2332]"
                      }`}>
                        <div>
                          <p className={`text-sm mb-1 ${
                            theme === "light" ? "text-[#6B7A8F]" : "text-[#B8C5D6]"
                          }`}>
                            Total Bounty
                          </p>
                          <p className={`text-lg font-bold ${
                            theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
                          }`}>
                            {formatCurrency(bounty.total_bounty)}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm mb-1 ${
                            theme === "light" ? "text-[#6B7A8F]" : "text-[#B8C5D6]"
                          }`}>
                            Rate per 1k Views
                          </p>
                          <p className={`text-lg font-bold ${
                            theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
                          }`}>
                            {formatCurrency(bounty.rate_per_1k_views)}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm mb-1 ${
                            theme === "light" ? "text-[#6B7A8F]" : "text-[#B8C5D6]"
                          }`}>
                            Claimed Bounty
                          </p>
                          <p className={`text-lg font-bold ${
                            theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
                          }`}>
                            {formatCurrency(bounty.calculated_claimed_bounty)}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm mb-1 ${
                            theme === "light" ? "text-[#6B7A8F]" : "text-[#B8C5D6]"
                          }`}>
                            Remaining
                          </p>
                          <p className={`text-lg font-bold ${
                            theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
                          }`}>
                            {formatCurrency(
                              bounty.total_bounty - bounty.calculated_claimed_bounty
                            )}
                          </p>
                        </div>
                      </div>

                      <div className={`pt-4 border-t ${
                        theme === "light" ? "border-[#C8D1E0]" : "border-[#1A2332]"
                      }`}>
                        <Link
                          href={`/bounty/${bounty.id}`}
                          className={`font-medium text-sm inline-flex items-center gap-1 ${
                            theme === "light"
                              ? "text-indigo-600 hover:text-indigo-800"
                              : "text-[#60A5FA] hover:text-[#3B82F6]"
                          }`}
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
              <div className={`border rounded-lg p-4 ${
                theme === "light"
                  ? "bg-white border-[#C8D1E0]"
                  : "bg-[#141B23] border-[#1A2332]"
              }`}>
                <p className={`text-sm mb-1 ${
                  theme === "light" ? "text-[#6B7A8F]" : "text-[#B8C5D6]"
                }`}>
                  Total Earnings
                </p>
                <p className={`text-2xl font-bold ${
                  theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
                }`}>
                  {formatCurrency(submissionStats.totalEarnings)}
                </p>
              </div>
              <div className={`border rounded-lg p-4 ${
                theme === "light"
                  ? "bg-white border-[#C8D1E0]"
                  : "bg-[#141B23] border-[#1A2332]"
              }`}>
                <p className={`text-sm mb-1 ${
                  theme === "light" ? "text-[#6B7A8F]" : "text-[#B8C5D6]"
                }`}>
                  Total Views
                </p>
                <p className={`text-2xl font-bold ${
                  theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
                }`}>
                  {submissionStats.totalViews.toLocaleString()}
                </p>
              </div>
              <div className={`border rounded-lg p-4 ${
                theme === "light"
                  ? "bg-white border-[#C8D1E0]"
                  : "bg-[#141B23] border-[#1A2332]"
              }`}>
                <p className={`text-sm mb-1 ${
                  theme === "light" ? "text-[#6B7A8F]" : "text-[#B8C5D6]"
                }`}>
                  Approved
                </p>
                <p className={`text-2xl font-bold ${
                  theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
                }`}>
                  {submissionStats.approvedCount}
                </p>
              </div>
              <div className={`border rounded-lg p-4 ${
                theme === "light"
                  ? "bg-white border-[#C8D1E0]"
                  : "bg-[#141B23] border-[#1A2332]"
              }`}>
                <p className={`text-sm mb-1 ${
                  theme === "light" ? "text-[#6B7A8F]" : "text-[#B8C5D6]"
                }`}>
                  Pending
                </p>
                <p className={`text-2xl font-bold ${
                  theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
                }`}>
                  {submissionStats.pendingCount}
                </p>
              </div>
            </div>

            {submissions.length === 0 ? (
              <div className={`border rounded-lg p-12 text-center ${
                theme === "light"
                  ? "bg-white border-[#C8D1E0]"
                  : "bg-[#141B23] border-[#1A2332]"
              }`}>
                <p className={`text-lg mb-4 ${
                  theme === "light" ? "text-[#52677C]" : "text-gray-400"
                }`}>
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
                    className={`border rounded-lg p-6 space-y-4 ${
                      theme === "light"
                        ? "bg-white border-[#C8D1E0]"
                        : "bg-[#141B23] border-[#1A2332]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link
                          href={`/bounty/${submission.bounty_id}`}
                          className={`text-xl font-bold mb-2 block ${
                            theme === "light"
                              ? "text-[#2E3A47] hover:text-[#4F6FA8]"
                              : "text-[#F5F8FC] hover:text-[#60A5FA]"
                          }`}
                        >
                          {submission.bounties?.name || 'Unknown Bounty'}
                        </Link>
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant={getStatusBadgeVariant(submission.status)}>
                            {submission.status}
                          </Badge>
                          <span className={`text-sm ${
                            theme === "light" ? "text-[#6B7A8F]" : "text-[#B8C5D6]"
                          }`}>
                            {formatDate(submission.created_at)}
                          </span>
                        </div>
                        <a
                          href={submission.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`font-medium text-sm inline-flex items-center gap-1 mb-4 ${
                            theme === "light"
                              ? "text-indigo-600 hover:text-indigo-800"
                              : "text-[#60A5FA] hover:text-[#3B82F6]"
                          }`}
                        >
                          {submission.video_url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t ${
                      theme === "light" ? "border-[#C8D1E0]" : "border-[#1A2332]"
                    }`}>
                      <div>
                        <p className={`text-sm mb-1 ${
                          theme === "light" ? "text-[#6B7A8F]" : "text-[#B8C5D6]"
                        }`}>
                          Views
                        </p>
                        <p className={`text-lg font-bold ${
                          theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
                        }`}>
                          {submission.view_count.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm mb-1 ${
                          theme === "light" ? "text-[#6B7A8F]" : "text-[#B8C5D6]"
                        }`}>
                          Rate per 1k
                        </p>
                        <p className={`text-lg font-bold ${
                          theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
                        }`}>
                          {submission.bounties
                            ? formatCurrency(submission.bounties.rate_per_1k_views)
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm mb-1 ${
                          theme === "light" ? "text-[#6B7A8F]" : "text-[#B8C5D6]"
                        }`}>
                          Earned
                        </p>
                        <p className={`text-lg font-bold ${
                          theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
                        }`}>
                          {formatCurrency(submission.earned_amount)}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm mb-1 ${
                          theme === "light" ? "text-[#6B7A8F]" : "text-[#B8C5D6]"
                        }`}>
                          Potential Earnings
                        </p>
                        <p className={`text-lg font-bold ${
                          theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
                        }`}>
                          {formatCurrency(potentialEarnings)}
                        </p>
                      </div>
                    </div>

                    {submission.validation_explanation && (
                      <div className={`mt-4 p-3 rounded-lg border ${
                        theme === "light"
                          ? "bg-[#F7FAFC] border-[#C8D1E0]"
                          : "bg-[#0D1419] border-[#1A2332]"
                      }`}>
                        <p className={`text-xs ${
                          theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
                        }`}>
                          <span className="font-semibold">Note: </span>
                          {submission.validation_explanation}
                        </p>
                      </div>
                    )}

                    <div className={`pt-4 border-t ${
                      theme === "light" ? "border-[#C8D1E0]" : "border-[#1A2332]"
                    }`}>
                      <Link
                        href={`/bounty/${submission.bounty_id}`}
                        className={`font-medium text-sm inline-flex items-center gap-1 ${
                          theme === "light"
                            ? "text-indigo-600 hover:text-indigo-800"
                            : "text-[#60A5FA] hover:text-[#3B82F6]"
                        }`}
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

