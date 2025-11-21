'use server'

/**
 * USER PROFILES SERVER ACTIONS
 * 
 * All mutation operations (create, update) verify user identity using Clerk authentication.
 */

import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  getLeaderboard,
  getUserStats
} from '@/lib/supabase-utils'
import { getOrCreateUserProfile, getCurrentUserId } from '@/lib/clerk-supabase-sync'
import type { Database } from '@/types/database.types'

type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

/**
 * Server action to fetch user profile by user_id
 * If userId is not provided, returns the current authenticated user's profile
 * @param userId Optional user ID (defaults to current user)
 * @returns User profile data
 */
export async function getUserProfileAction(userId?: string) {
  try {
    const currentUserId = await getCurrentUserId()
    
    // If no userId provided, use current user
    const targetUserId = userId || currentUserId
    
    if (!targetUserId) {
      return { success: false, data: null, error: 'User ID is required' }
    }

    // If requesting own profile, ensure it exists
    if (targetUserId === currentUserId) {
      const syncResult = await getOrCreateUserProfile()
      if (syncResult.data) {
        return { success: true, data: syncResult.data, error: null }
      }
    }

    const result = await getUserProfile(targetUserId)
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
 * Server action to get current authenticated user's profile
 * @returns Current user's profile data
 */
export async function getCurrentUserProfileAction() {
  try {
    const result = await getOrCreateUserProfile()
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
 * Server action to create a new user profile
 * Note: User profiles are typically auto-created via getOrCreateUserProfile()
 * This action is kept for manual creation if needed
 * @param data User profile data (email, username)
 * @returns Created user profile
 */
export async function createUserProfileAction(data: UserProfileInsert) {
  try {
    // Check authentication
    const userId = await getCurrentUserId()
    if (!userId) {
      return { success: false, data: null, error: 'Unauthorized: User not authenticated' }
    }

    // Validate required fields
    if (!data.email || !data.username) {
      return {
        success: false,
        data: null,
        error: 'Missing required fields: email, username'
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return {
        success: false,
        data: null,
        error: 'Invalid email format'
      }
    }

    // Validate username (alphanumeric and underscore, 3-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    if (!usernameRegex.test(data.username)) {
      return {
        success: false,
        data: null,
        error: 'Username must be 3-20 characters, alphanumeric with underscores only'
      }
    }

    // Ensure user_id matches authenticated user
    if (data.user_id && data.user_id !== userId) {
      return {
        success: false,
        data: null,
        error: 'Unauthorized: user_id must match authenticated user'
      }
    }

    // Set user_id to authenticated user
    const profileData: UserProfileInsert = {
      ...data,
      user_id: userId,
    }

    const result = await createUserProfile(profileData)
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
 * Server action to update user profile
 * Requires authentication - only owner can update
 * If userId is not provided, updates the current authenticated user's profile
 * @param userId Optional user ID (defaults to current user)
 * @param data Profile update data (email, username, total_earnings)
 * @returns Updated user profile
 */
export async function updateUserProfileAction(
  userId: string | undefined,
  data: UserProfileUpdate
) {
  try {
    // Check authentication
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) {
      return { success: false, data: null, error: 'Unauthorized: User not authenticated' }
    }

    // Use current user if userId not provided
    const targetUserId = userId || currentUserId

    // Ensure user can only update their own profile
    if (targetUserId !== currentUserId) {
      return {
        success: false,
        data: null,
        error: 'Unauthorized: You can only update your own profile'
      }
    }

    // Validate email format if provided
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        return {
          success: false,
          data: null,
          error: 'Invalid email format'
        }
      }
    }

    // Validate username format if provided
    if (data.username) {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
      if (!usernameRegex.test(data.username)) {
        return {
          success: false,
          data: null,
          error: 'Username must be 3-20 characters, alphanumeric with underscores only'
        }
      }
    }

    // Ensure profile exists
    await getOrCreateUserProfile()

    const result = await updateUserProfile(targetUserId, data)
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
 * Server action to fetch leaderboard of top users by total_earnings
 * @param limit Number of users to return (default: 10)
 * @returns Array of user profiles ordered by total_earnings DESC
 */
export async function getLeaderboardAction(limit: number = 10) {
  try {
    if (limit < 1 || limit > 100) {
      return {
        success: false,
        data: null,
        error: 'Limit must be between 1 and 100'
      }
    }

    const result = await getLeaderboard(limit)
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
 * Server action to get user statistics
 * Returns total_earnings and submission counts
 * If userId is not provided, returns the current authenticated user's stats
 * @param userId Optional user ID (defaults to current user)
 * @returns User statistics object
 */
export async function getUserStatsAction(userId?: string) {
  try {
    const currentUserId = await getCurrentUserId()
    const targetUserId = userId || currentUserId

    if (!targetUserId) {
      return { success: false, data: null, error: 'User ID is required' }
    }

    // Users can view their own stats, or we can allow public viewing
    // For now, allow viewing own stats or any user's stats (public leaderboard data)
    // If you want to restrict, uncomment the check below:
    // if (targetUserId !== currentUserId) {
    //   return { success: false, data: null, error: 'Unauthorized' }
    // }

    const result = await getUserStats(targetUserId)
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

