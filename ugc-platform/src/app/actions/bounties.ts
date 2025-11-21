'use server'

/**
 * BOUNTIES SERVER ACTIONS
 * 
 * All mutation operations (create, update, delete) verify user identity using Clerk authentication.
 */

import { auth } from '@clerk/nextjs/server'
import {
  listBounties,
  getBountyById,
  createBounty,
  updateBounty,
  deleteBounty,
  updateClaimedBounty
} from '@/lib/supabase-utils'
import { getOrCreateUserProfile, getCurrentUserId } from '@/lib/clerk-supabase-sync'
import type { Database } from '@/types/database.types'

type BountyInsert = Database['public']['Tables']['bounties']['Insert']
type BountyUpdate = Database['public']['Tables']['bounties']['Update']

/**
 * Server action to fetch all bounties
 * @param filters Optional filters (creator_id)
 * @returns Array of bounties
 */
export async function getBountiesAction(filters?: { creator_id?: string }) {
  try {
    const result = await listBounties(filters)
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
 * Server action to fetch a single bounty by ID
 * @param id Bounty ID
 * @returns Bounty data
 */
export async function getBountyByIdAction(id: string) {
  try {
    if (!id) {
      return { success: false, data: null, error: 'Bounty ID is required' }
    }

    const result = await getBountyById(id)
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
 * Server action to create a new bounty
 * Requires authentication - creator_id should match authenticated user
 * @param data Bounty data (name, description, total_bounty, rate_per_1k_views, creator_id)
 * @returns Created bounty
 */
export async function createBountyAction(data: BountyInsert) {
  try {
    // Validate required fields
    if (!data.name || !data.description || !data.total_bounty || !data.rate_per_1k_views) {
      return {
        success: false,
        data: null,
        error: 'Missing required fields: name, description, total_bounty, rate_per_1k_views'
      }
    }

    // Check authentication
    const userId = await getCurrentUserId()
    if (!userId) {
      return { success: false, data: null, error: 'Unauthorized: User not authenticated' }
    }

    // Sync user profile
    const profileResult = await getOrCreateUserProfile()
    if (profileResult.error) {
      return { success: false, data: null, error: 'Failed to sync user profile' }
    }

    // Ensure creator_id matches authenticated user
    if (data.creator_id && data.creator_id !== userId) {
      return {
        success: false,
        data: null,
        error: 'Unauthorized: creator_id must match authenticated user'
      }
    }

    // Set creator_id to authenticated user
    const bountyData: BountyInsert = {
      ...data,
      creator_id: userId,
    }

    const result = await createBounty(bountyData)
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
 * Server action to update a bounty
 * Requires authentication - only creator can update
 * @param id Bounty ID
 * @param data Bounty update data
 * @returns Updated bounty
 */
export async function updateBountyAction(id: string, data: BountyUpdate) {
  try {
    if (!id) {
      return { success: false, data: null, error: 'Bounty ID is required' }
    }

    // Check authentication
    const userId = await getCurrentUserId()
    if (!userId) {
      return { success: false, data: null, error: 'Unauthorized: User not authenticated' }
    }

    // Verify user is the creator
    const bountyResult = await getBountyById(id)
    if (bountyResult.error || !bountyResult.data) {
      return { success: false, data: null, error: 'Bounty not found' }
    }

    if (bountyResult.data.creator_id !== userId) {
      return {
        success: false,
        data: null,
        error: 'Unauthorized: Only the creator can update this bounty'
      }
    }

    const result = await updateBounty(id, data)
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
 * Server action to delete a bounty
 * Requires authentication - only creator can delete
 * @param id Bounty ID
 * @returns Success status
 */
export async function deleteBountyAction(id: string) {
  try {
    if (!id) {
      return { success: false, data: null, error: 'Bounty ID is required' }
    }

    // Check authentication
    const userId = await getCurrentUserId()
    if (!userId) {
      return { success: false, data: null, error: 'Unauthorized: User not authenticated' }
    }

    // Verify user is the creator
    const bountyResult = await getBountyById(id)
    if (bountyResult.error || !bountyResult.data) {
      return { success: false, data: null, error: 'Bounty not found' }
    }

    if (bountyResult.data.creator_id !== userId) {
      return {
        success: false,
        data: null,
        error: 'Unauthorized: Only the creator can delete this bounty'
      }
    }

    const result = await deleteBounty(id)
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
 * Server action to update claimed_bounty amount
 * @param id Bounty ID
 * @param amount Amount to add to claimed_bounty
 * @returns Updated bounty
 */
export async function updateClaimedBountyAction(id: string, amount: number) {
  try {
    if (!id) {
      return { success: false, data: null, error: 'Bounty ID is required' }
    }

    if (typeof amount !== 'number' || amount < 0) {
      return {
        success: false,
        data: null,
        error: 'Amount must be a non-negative number'
      }
    }

    const result = await updateClaimedBounty(id, amount)
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

