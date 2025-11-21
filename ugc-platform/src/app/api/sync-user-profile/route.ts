import { NextResponse } from 'next/server'
import { getOrCreateUserProfile } from '@/lib/clerk-supabase-sync'

/**
 * API route to manually sync user profile from Clerk to Supabase
 * This can be called after sign-in/sign-up to ensure user profile exists
 * 
 * GET /api/sync-user-profile
 * Returns the user's profile data
 */
export async function GET() {
  try {
    const result = await getOrCreateUserProfile()

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: 401 }
      )
    }

    if (!result.data) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error('Error syncing user profile:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sync-user-profile
 * Same as GET, but can be used for explicit sync requests
 */
export async function POST() {
  return GET()
}

