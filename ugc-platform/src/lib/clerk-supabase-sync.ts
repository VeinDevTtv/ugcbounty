'use server'

import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseServer } from './supabase-server'
import type { Database } from '@/types/database.types'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']

/**
 * Get or create user profile from Clerk user.
 * This function syncs Clerk user data to Supabase user_profiles table.
 * 
 * @returns User profile data or null if user is not authenticated
 */
export async function getOrCreateUserProfile(): Promise<{
  data: UserProfile | null
  error: Error | null
}> {
  try {
    // Get current Clerk user
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId) {
      return { data: null, error: new Error('User not authenticated') }
    }

    // Use upsert to create or update user profile with Clerk data (like og implementation)
    // This handles both creation and updates in a single operation
    // Generate default username if Clerk doesn't provide one for better UX
    const email = user?.emailAddresses[0]?.emailAddress || null
    const username = user?.username || `user_${userId.slice(0, 8)}`

    const { data: profile, error: upsertError } = await supabaseServer
      .from('user_profiles')
      .upsert({
        user_id: userId,
        email: email,
        username: username,
        total_earnings: 0,
      } as UserProfileInsert)
      .select()
      .single()

    if (upsertError) {
      console.error('Error upserting user profile:', upsertError)
      return { data: null, error: upsertError as Error }
    }

    return { data: profile, error: null }
  } catch (error) {
    console.error('Error in getOrCreateUserProfile:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    }
  }
}

/**
 * Get or create user profile with full Clerk user data.
 * This version fetches email and username from Clerk using currentUser().
 * 
 * Note: This function is now equivalent to getOrCreateUserProfile() which also
 * fetches Clerk user data. This function is kept for backward compatibility.
 * 
 * @returns User profile data or null if user is not authenticated
 */
export async function getOrCreateUserProfileWithClerkData(): Promise<{
  data: UserProfile | null
  error: Error | null
}> {
  // Both functions now do the same thing - use getOrCreateUserProfile for consistency
  return getOrCreateUserProfile()
}

/**
 * Update user profile with Clerk user data.
 * This function updates the profile with current Clerk user information.
 * 
 * @param email User email from Clerk
 * @param username User username from Clerk (optional)
 * @returns Updated user profile or null if user is not authenticated
 */
export async function updateUserProfileFromClerk(
  email: string,
  username?: string
): Promise<{
  data: UserProfile | null
  error: Error | null
}> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { data: null, error: new Error('User not authenticated') }
    }

    const updateData: Partial<UserProfileInsert> = {
      email,
    }

    if (username) {
      updateData.username = username
    }

    const { data: updatedProfile, error: updateError } = await supabaseServer
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating user profile:', updateError)
      return { data: null, error: updateError as Error }
    }

    return { data: updatedProfile, error: null }
  } catch (error) {
    console.error('Error in updateUserProfileFromClerk:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    }
  }
}

/**
 * Get current authenticated user's Clerk ID.
 * 
 * @returns Clerk user ID or null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { userId } = await auth()
    return userId
  } catch (error) {
    console.error('Error getting current user ID:', error)
    return null
  }
}

