import { supabase } from './supabase'
import { supabaseServer } from './supabase-server'
import type { Database } from '@/types/database.types'

type Bounty = Database['public']['Tables']['bounties']['Row']
type BountyInsert = Database['public']['Tables']['bounties']['Insert']
type BountyUpdate = Database['public']['Tables']['bounties']['Update']

type Submission = Database['public']['Tables']['submissions']['Row']
type SubmissionInsert = Database['public']['Tables']['submissions']['Insert']
type SubmissionUpdate = Database['public']['Tables']['submissions']['Update']

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

// ============================================================================
// BOUNTIES UTILITIES
// ============================================================================

/**
 * List all bounties with optional filters
 * @param filters Optional filters: creator_id
 * @returns Array of bounties
 */
export async function listBounties(filters?: { creator_id?: string }) {
  try {
    let query = supabase.from('bounties').select('*')

    if (filters?.creator_id) {
      query = query.eq('creator_id', filters.creator_id)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error listing bounties:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Get a single bounty by ID
 * @param id Bounty ID
 * @returns Bounty or null
 */
export async function getBountyById(id: string) {
  try {
    const { data, error } = await supabase
      .from('bounties')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error getting bounty:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Create a new bounty (server-side only)
 * @param data Bounty data (name, description, total_bounty, rate_per_1k_views, creator_id)
 * @returns Created bounty
 */
export async function createBounty(data: BountyInsert) {
  try {
    const { data: bounty, error } = await supabaseServer
      .from('bounties')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return { data: bounty, error: null }
  } catch (error) {
    console.error('Error creating bounty:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Update a bounty (server-side only)
 * @param id Bounty ID
 * @param data Bounty update data
 * @returns Updated bounty
 */
export async function updateBounty(id: string, data: BountyUpdate) {
  try {
    const { data: bounty, error } = await supabaseServer
      .from('bounties')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data: bounty, error: null }
  } catch (error) {
    console.error('Error updating bounty:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Delete a bounty (server-side only)
 * @param id Bounty ID
 * @returns Success status
 */
export async function deleteBounty(id: string) {
  try {
    const { error } = await supabaseServer
      .from('bounties')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { data: { success: true }, error: null }
  } catch (error) {
    console.error('Error deleting bounty:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Update claimed_bounty amount for a bounty
 * @param id Bounty ID
 * @param amount Amount to add to claimed_bounty
 * @returns Updated bounty
 */
export async function updateClaimedBounty(id: string, amount: number) {
  try {
    // First get current claimed_bounty
    const result = await getBountyById(id)
    if (!result.data) {
      throw new Error('Bounty not found')
    }

    const newClaimedAmount = (result.data.claimed_bounty || 0) + amount

    const { data: updated, error } = await supabaseServer
      .from('bounties')
      .update({ claimed_bounty: newClaimedAmount })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data: updated, error: null }
  } catch (error) {
    console.error('Error updating claimed bounty:', error)
    return { data: null, error: error as Error }
  }
}

// ============================================================================
// SUBMISSIONS UTILITIES
// ============================================================================

/**
 * List submissions with optional filters
 * @param filters Optional filters: user_id, bounty_id, status
 * @returns Array of submissions
 */
export async function listSubmissions(filters?: {
  user_id?: string
  bounty_id?: string
  status?: string
}) {
  try {
    let query = supabase.from('submissions').select('*')

    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id)
    }
    if (filters?.bounty_id) {
      query = query.eq('bounty_id', filters.bounty_id)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error listing submissions:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Get a single submission by ID
 * @param id Submission ID
 * @returns Submission or null
 */
export async function getSubmissionById(id: string) {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error getting submission:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Create a new submission
 * @param data Submission data (bounty_id, user_id, video_url)
 * @returns Created submission
 */
export async function createSubmission(data: SubmissionInsert) {
  try {
    const { data: submission, error } = await supabase
      .from('submissions')
      .insert({
        ...data,
        status: 'pending' // Default status
      })
      .select()
      .single()

    if (error) throw error
    return { data: submission, error: null }
  } catch (error) {
    console.error('Error creating submission:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Update a submission
 * @param id Submission ID
 * @param data Submission update data
 * @returns Updated submission
 */
export async function updateSubmission(id: string, data: SubmissionUpdate) {
  try {
    const { data: submission, error } = await supabase
      .from('submissions')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data: submission, error: null }
  } catch (error) {
    console.error('Error updating submission:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Get all submissions for a specific bounty
 * @param bountyId Bounty ID (UUID string)
 * @returns Array of submissions
 */
export async function getSubmissionsByBounty(bountyId: string) {
  try {
    const { data, error } = await supabaseServer
      .from('submissions')
      .select('*')
      .eq('bounty_id', bountyId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error getting submissions by bounty:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Get all submissions for a specific user
 * @param userId User ID (UUID string)
 * @returns Array of submissions with bounty data
 */
export async function getSubmissionsByUser(userId: string) {
  try {
    const { data, error } = await supabaseServer
      .from('submissions')
      .select(`
        *,
        bounties (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error getting submissions by user:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Update submission status and validation result (matching og/ pattern)
 * @param submissionId Submission ID (UUID string)
 * @param status New status ('pending', 'approved', 'rejected')
 * @param validationExplanation Validation explanation
 * @param viewCount Optional view count to update
 * @returns Updated submission
 */
export async function updateSubmissionStatus(
  submissionId: string,
  status: 'pending' | 'approved' | 'rejected',
  validationExplanation: string,
  viewCount?: number
) {
  try {
    const updateData: {
      status: 'pending' | 'approved' | 'rejected'
      validation_explanation: string
      view_count?: number
      earned_amount?: number
    } = {
      status,
      validation_explanation: validationExplanation
    }

    if (viewCount !== undefined) {
      updateData.view_count = viewCount
      
      // If approved, calculate earned amount
      if (status === 'approved') {
        const { data: submission } = await supabaseServer
          .from('submissions')
          .select('bounty_id')
          .eq('id', submissionId)
          .single()

        if (submission) {
          const bountyResult = await getBountyById(submission.bounty_id)
          if (bountyResult.data) {
            const earnedAmount = (viewCount / 1000) * bountyResult.data.rate_per_1k_views
            updateData.earned_amount = earnedAmount
          }
        }
      }
    }

    const { data, error } = await supabaseServer
      .from('submissions')
      .update(updateData)
      .eq('id', submissionId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating submission status:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Validate a submission (admin function - server-side only)
 * Updates status and validation_explanation
 * @param id Submission ID
 * @param status New status ('approved', 'rejected', etc.)
 * @param explanation Validation explanation
 * @returns Updated submission
 */
export async function validateSubmission(
  id: string,
  status: string,
  explanation?: string
) {
  try {
    const updateData: SubmissionUpdate = {
      status,
      validation_explanation: explanation || null
    }

    const { data: submission, error } = await supabaseServer
      .from('submissions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // If approved, calculate earnings and update user profile
    if (status === 'approved' && submission) {
      const bounty = await getBountyById(submission.bounty_id || '')
      if (bounty.data) {
        const views = submission.view_count || 0
        const rate = bounty.data.rate_per_1k_views
        const earnedAmount = (views / 1000) * rate

        // Update submission earned_amount
        await supabaseServer
          .from('submissions')
          .update({ earned_amount: earnedAmount })
          .eq('id', id)

        // Update user profile total_earnings if user_id exists
        if (submission.user_id) {
          const profile = await getUserProfile(submission.user_id)
          if (profile.data) {
            const newTotal = (profile.data.total_earnings || 0) + earnedAmount
            await supabaseServer
              .from('user_profiles')
              .update({ total_earnings: newTotal })
              .eq('user_id', submission.user_id)
          }
        }

        // Update bounty claimed_bounty
        if (submission.bounty_id) {
          await updateClaimedBounty(submission.bounty_id, earnedAmount)
        }
      }
    }

    // Re-fetch the updated submission
    const { data: updated, error: fetchError } = await supabaseServer
      .from('submissions')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError
    return { data: updated, error: null }
  } catch (error) {
    console.error('Error validating submission:', error)
    return { data: null, error: error as Error }
  }
}

// ============================================================================
// USER PROFILES UTILITIES
// ============================================================================

/**
 * Get user profile by user_id
 * @param userId User ID
 * @returns User profile or null
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error getting user profile:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Get or create user profile (upsert pattern from og/)
 * @param userId User ID
 * @param email Optional email
 * @param username Optional username
 * @returns User profile
 */
export async function getOrCreateUserProfile(
  userId: string,
  email?: string,
  username?: string
) {
  try {
    // Try to get existing profile
    const { data: existingProfile } = await supabaseServer
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (existingProfile) {
      return { data: existingProfile, error: null }
    }

    // Create new profile if doesn't exist
    const { data, error } = await supabaseServer
      .from('user_profiles')
      .insert({
        user_id: userId,
        email: email || null,
        username: username || null,
        total_earnings: 0
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error getting or creating user profile:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Update user total earnings
 * @param userId User ID
 * @param amount Amount to add to total earnings
 * @returns Updated user profile
 */
export async function updateUserEarnings(userId: string, amount: number) {
  try {
    const { data: profile, error: fetchError } = await supabaseServer
      .from('user_profiles')
      .select('total_earnings')
      .eq('user_id', userId)
      .single()

    if (fetchError) throw fetchError
    if (!profile) throw new Error('User profile not found')

    const newTotalEarnings = (profile.total_earnings || 0) + amount

    const { data, error } = await supabaseServer
      .from('user_profiles')
      .update({ total_earnings: newTotalEarnings })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating user earnings:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Create a new user profile
 * @param data User profile data (email, username)
 * @returns Created user profile
 */
export async function createUserProfile(data: UserProfileInsert) {
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return { data: profile, error: null }
  } catch (error) {
    console.error('Error creating user profile:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Update user profile
 * @param userId User ID
 * @param data Profile update data (email, username, total_earnings)
 * @returns Updated user profile
 */
export async function updateUserProfile(userId: string, data: UserProfileUpdate) {
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .update(data)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return { data: profile, error: null }
  } catch (error) {
    console.error('Error updating user profile:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Get leaderboard of top users by total_earnings
 * @param limit Number of users to return (default: 10)
 * @returns Array of user profiles ordered by total_earnings DESC
 */
export async function getLeaderboard(limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('total_earnings', { ascending: false })
      .limit(limit)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error getting leaderboard:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Get user statistics (total_earnings and submission counts)
 * @param userId User ID
 * @returns User statistics object
 */
export async function getUserStats(userId: string) {
  try {
    // Get user profile
    const profile = await getUserProfile(userId)
    if (!profile.data) {
      throw new Error('User profile not found')
    }

    // Get submission counts
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('id, status, earned_amount')
      .eq('user_id', userId)

    if (submissionsError) throw submissionsError

    const totalSubmissions = submissions?.length || 0
    const pendingSubmissions = submissions?.filter((s) => s.status === 'pending').length || 0
    const approvedSubmissions = submissions?.filter((s) => s.status === 'approved').length || 0
    const rejectedSubmissions = submissions?.filter((s) => s.status === 'rejected').length || 0

    return {
      data: {
        total_earnings: profile.data.total_earnings || 0,
        total_submissions: totalSubmissions,
        pending_submissions: pendingSubmissions,
        approved_submissions: approvedSubmissions,
        rejected_submissions: rejectedSubmissions,
        profile: profile.data
      },
      error: null
    }
  } catch (error) {
    console.error('Error getting user stats:', error)
    return { data: null, error: error as Error }
  }
}

