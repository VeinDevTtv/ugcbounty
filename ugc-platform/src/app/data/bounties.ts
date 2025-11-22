export interface Bounty {
  id: string; // UUID format
  name: string;
  totalBounty: number;
  ratePer1kViews: number;
  description: string;
  claimedBounty: number; // Amount of bounty claimed so far (calculated from submissions)
  logoUrl?: string;
  companyName?: string;
  progressPercentage?: number; // Calculated progress percentage
  totalSubmissionViews?: number; // Total views from approved submissions
  isCompleted?: boolean; // Whether the bounty is completed (views exceed total)
  submittedBy?: {
    userId: string;
    username?: string;
    email?: string;
  };
  createdAt?: string;
}

