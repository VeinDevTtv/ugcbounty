import { auth } from '@clerk/nextjs/server'
import { supabaseServer } from './supabase-server'
import type { Database } from '@/types/database.types'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export type UserRole = 'creator' | 'business' | null

/**
 * Get user role from database by user ID
 * @param userId Clerk user ID
 * @returns User role ('creator' | 'business' | null)
 */
export async function getUserRole(userId: string): Promise<UserRole> {
  try {
    const { data, error } = await supabaseServer
      .from('user_profiles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle()

    // Handle case where user profile doesn't exist yet (PGRST116)
    if (error) {
      // PGRST116 means "Cannot coerce the result to a single JSON object" (0 rows)
      // This is expected for new users who haven't completed onboarding
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error fetching user role:', error)
      return null
    }

    return (data?.role as UserRole) || null
  } catch (error) {
    console.error('Error in getUserRole:', error)
    return null
  }
}

/**
 * Get current authenticated user's role
 * @returns User role ('creator' | 'business' | null) or null if not authenticated
 */
export async function getCurrentUserRole(): Promise<UserRole> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return null
    }
    return await getUserRole(userId)
  } catch (error) {
    console.error('Error getting current user role:', error)
    return null
  }
}

/**
 * Get current user's full profile including role
 * @returns User profile with role or null if not authenticated
 */
export async function getCurrentUserProfile(): Promise<{
  data: UserProfile | null
  error: Error | null
}> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { data: null, error: new Error('User not authenticated') }
    }

    const { data, error } = await supabaseServer
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    // Handle case where user profile doesn't exist yet (PGRST116)
    if (error) {
      // PGRST116 means "Cannot coerce the result to a single JSON object" (0 rows)
      // This is expected for new users who haven't completed onboarding
      if (error.code === 'PGRST116') {
        return { data: null, error: null }
      }
      console.error('Error fetching user profile:', error)
      return { data: null, error: error as Error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in getCurrentUserProfile:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    }
  }
}

/**
 * Check if user has a specific role
 * @param role Role to check for
 * @param userId Optional user ID (defaults to current user)
 * @returns True if user has the specified role
 */
export async function requireRole(
  role: 'creator' | 'business',
  userId?: string
): Promise<boolean> {
  try {
    const targetUserId = userId || (await auth()).userId
    if (!targetUserId) {
      return false
    }

    const userRole = await getUserRole(targetUserId)
    return userRole === role
  } catch (error) {
    console.error('Error in requireRole:', error)
    return false
  }
}


