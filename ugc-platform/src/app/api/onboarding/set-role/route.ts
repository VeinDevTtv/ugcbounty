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
    const email = user?.emailAddresses[0]?.emailAddress || null
    const username = user?.username || `user_${userId.slice(0, 8)}`

    // Use upsert to ensure profile exists, then update role
    // Supabase automatically uses the primary key (user_id) for conflict resolution
    const { data, error } = await supabaseServer
      .from('user_profiles')
      .upsert({
        user_id: userId,
        email: email,
        username: username,
        role: role,
        total_earnings: 0,
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

    return NextResponse.json(
      { 
        success: true, 
        data: { user_id: data.user_id, role: data.role },
        message: 'Role set successfully'
      },
      { status: 200 }
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

