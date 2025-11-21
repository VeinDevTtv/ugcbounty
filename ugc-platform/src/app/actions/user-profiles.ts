'use server'

/**
 * USER PROFILES SERVER ACTIONS
 * 
 * SECURITY WARNING: These actions currently do not include authentication/authorization checks.
 * Authentication integration (e.g., Clerk) must be implemented before production deployment.
 * All mutation operations (create, update) should verify user identity and permissions.
 * 
 * @see TODO comments in each function for authentication integration points
 */

import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  getLeaderboard,
  getUserStats
} from '@/lib/supabase-utils'
import type { Database } from '@/types/database.types'

type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

/**
 * Server action to fetch user profile by user_id
 * @param userId User ID
 * @returns User profile data
 */
export async function getUserProfileAction(userId: string) {
  try {
    if (!userId) {
      return { success: false, data: null, error: 'User ID is required' }
    }

    const result = await getUserProfile(userId)
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
 * @param data User profile data (email, username)
 * @returns Created user profile
 */
export async function createUserProfileAction(data: UserProfileInsert) {
  try {
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

    // TODO: Add authentication check here if needed
    // if (!authenticatedUser) {
    //   return { success: false, data: null, error: 'Unauthorized' }
    // }

    const result = await createUserProfile(data)
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
 * @param userId User ID
 * @param data Profile update data (email, username, total_earnings)
 * @returns Updated user profile
 */
export async function updateUserProfileAction(userId: string, data: UserProfileUpdate) {
  try {
    if (!userId) {
      return { success: false, data: null, error: 'User ID is required' }
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

    // TODO: Add authentication check here
    // if (!authenticatedUser || authenticatedUser.id !== userId) {
    //   return { success: false, data: null, error: 'Unauthorized' }
    // }

    const result = await updateUserProfile(userId, data)
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
 * @param userId User ID
 * @returns User statistics object
 */
export async function getUserStatsAction(userId: string) {
  try {
    if (!userId) {
      return { success: false, data: null, error: 'User ID is required' }
    }

    // TODO: Add authentication check here if needed
    // if (!authenticatedUser || authenticatedUser.id !== userId) {
    //   return { success: false, data: null, error: 'Unauthorized' }
    // }

    const result = await getUserStats(userId)
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

