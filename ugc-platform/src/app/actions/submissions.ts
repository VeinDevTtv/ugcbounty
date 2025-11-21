'use server'

/**
 * SUBMISSIONS SERVER ACTIONS
 * 
 * SECURITY WARNING: These actions currently do not include authentication/authorization checks.
 * Authentication integration (e.g., Clerk) must be implemented before production deployment.
 * All mutation operations (create, update, validate) should verify user identity and permissions.
 * 
 * @see TODO comments in each function for authentication integration points
 */

import {
  listSubmissions,
  getSubmissionById,
  createSubmission,
  updateSubmission,
  validateSubmission
} from '@/lib/supabase-utils'
import type { Database } from '@/types/database.types'

type SubmissionInsert = Database['public']['Tables']['submissions']['Insert']
type SubmissionUpdate = Database['public']['Tables']['submissions']['Update']

/**
 * Server action to fetch submissions with optional filters
 * @param filters Optional filters (user_id, bounty_id, status)
 * @returns Array of submissions
 */
export async function getSubmissionsAction(filters?: {
  user_id?: string
  bounty_id?: string
  status?: string
}) {
  try {
    const result = await listSubmissions(filters)
    if (result.error) {
      return { success: false, data: null, error: result.error.message }
    }
    return { success: true, data: result.data, error: null }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Server action to fetch a single submission by ID
 * @param id Submission ID
 * @returns Submission data
 */
export async function getSubmissionByIdAction(id: string) {
  try {
    if (!id) {
      return { success: false, data: null, error: 'Submission ID is required' }
    }

    const result = await getSubmissionById(id)
    if (result.error) {
      return { success: false, data: null, error: result.error.message }
    }
    return { success: true, data: result.data, error: null }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Server action to create a new submission
 * Requires authentication - user_id should match authenticated user
 * @param data Submission data (bounty_id, user_id, video_url)
 * @returns Created submission
 */
export async function createSubmissionAction(data: SubmissionInsert) {
  try {
    // Validate required fields
    if (!data.bounty_id || !data.user_id || !data.video_url) {
      return {
        success: false,
        data: null,
        error: 'Missing required fields: bounty_id, user_id, video_url'
      }
    }

    // Validate video URL format
    try {
      new URL(data.video_url)
    } catch {
      return {
        success: false,
        data: null,
        error: 'Invalid video URL format'
      }
    }

    // TODO: Add authentication check here
    // if (!authenticatedUser || authenticatedUser.id !== data.user_id) {
    //   return { success: false, data: null, error: 'Unauthorized' }
    // }

    const result = await createSubmission(data)
    if (result.error) {
      return { success: false, data: null, error: result.error.message }
    }
    return { success: true, data: result.data, error: null }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Server action to update a submission
 * Requires authentication - only owner can update pending submissions
 * @param id Submission ID
 * @param data Submission update data
 * @returns Updated submission
 */
export async function updateSubmissionAction(id: string, data: SubmissionUpdate) {
  try {
    if (!id) {
      return { success: false, data: null, error: 'Submission ID is required' }
    }

    // TODO: Add authentication check here
    // const submission = await getSubmissionById(id)
    // if (authenticatedUser?.id !== submission.data?.user_id) {
    //   return { success: false, data: null, error: 'Unauthorized' }
    // }
    // if (submission.data?.status !== 'pending') {
    //   return { success: false, data: null, error: 'Can only update pending submissions' }
    // }

    const result = await updateSubmission(id, data)
    if (result.error) {
      return { success: false, data: null, error: result.error.message }
    }
    return { success: true, data: result.data, error: null }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Server action for admin validation of submissions
 * Updates status and validation_explanation, calculates earnings if approved
 * @param id Submission ID
 * @param status New status ('approved', 'rejected', etc.)
 * @param explanation Optional validation explanation
 * @returns Updated submission
 */
export async function validateSubmissionAction(
  id: string,
  status: string,
  explanation?: string
) {
  try {
    if (!id) {
      return { success: false, data: null, error: 'Submission ID is required' }
    }

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return {
        success: false,
        data: null,
        error: 'Status must be one of: approved, rejected, pending'
      }
    }

    // TODO: Add admin authentication check here
    // if (!authenticatedUser || !isAdmin(authenticatedUser)) {
    //   return { success: false, data: null, error: 'Unauthorized - Admin access required' }
    // }

    const result = await validateSubmission(id, status, explanation)
    if (result.error) {
      return { success: false, data: null, error: result.error.message }
    }
    return { success: true, data: result.data, error: null }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

