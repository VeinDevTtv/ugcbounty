import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabase-server'
import type { Database } from '@/types/database.types'

type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']

/**
 * POST /api/onboarding/set-role
 * Set user role during onboarding
 * Body: { role: 'creator' | 'business' }
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to set your role.' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { role } = body

    // Validate role
    if (!role || (role !== 'creator' && role !== 'business')) {
      return NextResponse.json(
        { error: 'Invalid role. Role must be "creator" or "business".' },
        { status: 400 }
      )
    }

    // Ensure user profile exists first (in case webhook hasn't fired yet)
    const user = await currentUser()
    // Clerk typically requires email, but provide fallback to prevent database errors
    const email = user?.emailAddresses[0]?.emailAddress || `user_${userId}@placeholder.local`
    const username = user?.username || `user_${userId.slice(0, 8)}`

    // First, check if profile already exists to preserve existing data (like total_earnings)
    const { data: existingProfile } = await supabaseServer
      .from('user_profiles')
      .select('total_earnings')
      .eq('user_id', userId)
      .maybeSingle()

    // Use upsert to ensure profile exists, then update role
    // Preserve existing total_earnings if profile exists, otherwise set to 0
    const { data, error } = await supabaseServer
      .from('user_profiles')
      .upsert({
        user_id: userId,
        email: email,
        username: username,
        role: role,
        // Only set total_earnings to 0 if profile doesn't exist yet
        // Otherwise preserve existing earnings
        total_earnings: existingProfile?.total_earnings ?? 0,
      } as UserProfileInsert)
      .select()
      .single()

    if (error) {
      console.error('Error upserting user role:', error)
      return NextResponse.json(
        { error: 'Failed to set user role', details: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      console.error('No data returned after upsert')
      return NextResponse.json(
        { error: 'Failed to set user role - no data returned' },
        { status: 500 }
      )
    }

    // Verify the role was actually saved by querying it again
    console.log('[Set-Role API] Verifying role was saved...')
    const { data: verifiedData, error: verifyError } = await supabaseServer
      .from('user_profiles')
      .select('role')
      .eq('user_id', userId)
      .single()

    if (verifyError) {
      console.error('[Set-Role API] Verification query failed:', verifyError)
      // Still return success since upsert succeeded, but log the warning
    } else if (verifiedData?.role !== role) {
      console.error('[Set-Role API] Role mismatch! Expected:', role, 'Got:', verifiedData?.role)
      // This shouldn't happen, but if it does, return error
      return NextResponse.json(
        { 
          error: 'Role verification failed',
          details: `Expected role ${role} but got ${verifiedData?.role}`
        },
        { status: 500 }
      )
    } else {
      console.log('[Set-Role API] Role verified successfully:', verifiedData.role)
    }

    // Return response with cache headers to prevent stale data
    return NextResponse.json(
      { 
        success: true, 
        data: { user_id: data.user_id, role: data.role },
        message: 'Role set successfully'
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    )
  } catch (error) {
    console.error('Error in set-role API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

