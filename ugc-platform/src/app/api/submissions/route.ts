import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { auth } from '@clerk/nextjs/server'
import type { Database } from '@/types/database.types'

type SubmissionRow = Database['public']['Tables']['submissions']['Row']
type SubmissionInsert = Database['public']['Tables']['submissions']['Insert']
type BountyRow = Database['public']['Tables']['bounties']['Row']

interface SubmissionWithBounty extends SubmissionRow {
  bounties: Pick<BountyRow, 'id' | 'name' | 'rate_per_1k_views'> | null
}

/**
 * GET /api/submissions
 * Fetch all submissions for the authenticated user with basic bounty info
 * Returns raw Supabase data (different from /api/user-submissions which formats data)
 */
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabaseServer
      .from('submissions')
      .select(`
        *,
        bounties (
          id,
          name,
          rate_per_1k_views
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching submissions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      )
    }

    return NextResponse.json(data as SubmissionWithBounty[])
  } catch (error) {
    console.error('Error in GET /api/submissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/submissions
 * Create a new simple submission
 * Requires: bounty_id (UUID string), video_url
 * Creates submission with status: 'pending'
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { bounty_id, video_url } = body

    // Validate required fields
    if (!bounty_id || !video_url) {
      return NextResponse.json(
        { error: 'bounty_id and video_url are required' },
        { status: 400 }
      )
    }

    // Validate UUID format (basic check - should be string)
    if (typeof bounty_id !== 'string') {
      return NextResponse.json(
        { error: 'bounty_id must be a valid UUID string' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(video_url)
    } catch {
      return NextResponse.json(
        { error: 'video_url must be a valid URL' },
        { status: 400 }
      )
    }

    // Create submission with status: 'pending'
    const submissionData: SubmissionInsert = {
      bounty_id,
      user_id: userId,
      video_url,
      status: 'pending',
      view_count: 0,
      validation_explanation: null,
    }

    const { data, error } = await supabaseServer
      .from('submissions')
      .insert(submissionData)
      .select()
      .single()

    if (error) {
      console.error('Error creating submission:', error)
      return NextResponse.json(
        { error: 'Failed to create submission' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/submissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
