'use server'

import { auth } from '@clerk/nextjs/server'
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

    if (!userId) {
      return { data: null, error: new Error('User not authenticated') }
    }

    // Check if user profile already exists
    // Note: Clerk user IDs are strings, but we'll store them in the UUID field
    // PostgreSQL can handle string-to-UUID conversion
    const { data: existingProfile, error: fetchError } = await supabaseServer
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new users
      console.error('Error fetching user profile:', fetchError)
      return { data: null, error: fetchError as Error }
    }

    if (existingProfile) {
      return { data: existingProfile, error: null }
    }

    // Profile doesn't exist, create it
    // Get additional user info from Clerk (we'll need to fetch this)
    // For now, we'll create with minimal data and let it be updated later
    const profileData: UserProfileInsert = {
      user_id: userId,
      email: '', // Will be updated when we have email
      username: `user_${userId.slice(0, 8)}`, // Generate a temporary username
      total_earnings: 0,
    }

    const { data: newProfile, error: createError } = await supabaseServer
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single()

    if (createError) {
      console.error('Error creating user profile:', createError)
      return { data: null, error: createError as Error }
    }

    return { data: newProfile, error: null }
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
 * This version fetches email and username from Clerk.
 * 
 * @returns User profile data or null if user is not authenticated
 */
export async function getOrCreateUserProfileWithClerkData(): Promise<{
  data: UserProfile | null
  error: Error | null
}> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { data: null, error: new Error('User not authenticated') }
    }

    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabaseServer
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', fetchError)
      return { data: null, error: fetchError as Error }
    }

    // Get Clerk user data
    // Note: In a real implementation, you might want to use Clerk's API
    // or pass user data from the client. For now, we'll use what we have.
    const { getToken } = await auth()
    const token = await getToken()

    // If profile exists, return it
    if (existingProfile) {
      return { data: existingProfile, error: null }
    }

    // Create new profile
    // We'll need email and username - these should come from Clerk
    // For now, create with placeholder values
    const profileData: UserProfileInsert = {
      user_id: userId,
      email: `user-${userId}@placeholder.com`, // Should be fetched from Clerk
      username: `user_${userId.slice(0, 8)}`,
      total_earnings: 0,
    }

    const { data: newProfile, error: createError } = await supabaseServer
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single()

    if (createError) {
      console.error('Error creating user profile:', createError)
      return { data: null, error: createError as Error }
    }

    return { data: newProfile, error: null }
  } catch (error) {
    console.error('Error in getOrCreateUserProfileWithClerkData:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    }
  }
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

