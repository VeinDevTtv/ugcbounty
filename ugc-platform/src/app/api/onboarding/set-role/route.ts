import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabase-server'

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

    // Update user profile with role
    const { data, error } = await supabaseServer
      .from('user_profiles')
      .update({ role })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user role:', error)
      return NextResponse.json(
        { error: 'Failed to update user role', details: error.message },
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

