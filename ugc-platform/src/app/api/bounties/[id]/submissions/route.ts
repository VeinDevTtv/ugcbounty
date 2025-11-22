import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import type { Database } from '@/types/database.types'

type SubmissionRow = Database['public']['Tables']['submissions']['Row']
type UserProfileRow = Database['public']['Tables']['user_profiles']['Row']

interface SubmissionWithUser extends SubmissionRow {
  user_profiles: UserProfileRow | null
}

/**
 * GET /api/bounties/[id]/submissions
 * Fetch all submissions for a specific bounty
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const bountyId = id

    // Validate UUID format (basic check)
    if (!bountyId || typeof bountyId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid bounty ID' },
        { status: 400 }
      )
    }

    // Fetch submissions for this bounty
    const { data: submissions, error: submissionsError } = await supabaseServer
      .from('submissions')
      .select('*')
      .eq('bounty_id', bountyId)
      .order('created_at', { ascending: false })

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError)
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      )
    }

    // Get unique user IDs from submissions
    const submissionsData = submissions as SubmissionRow[] | null
    const userIds = submissionsData 
      ? [...new Set(submissionsData.map(s => s.user_id).filter(Boolean) as string[])]
      : []

    // Fetch user profiles for all submissions
    let userProfiles: UserProfileRow[] | null = null
    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabaseServer
        .from('user_profiles')
        .select('user_id, username, email')
        .in('user_id', userIds)

      if (profilesError) {
        console.error('Error fetching user profiles:', profilesError)
        // Don't fail the request if profiles fail, just log it
      } else {
        userProfiles = profiles as UserProfileRow[] | null
      }
    }

    // Combine submissions with user profiles
    const data: SubmissionWithUser[] = submissionsData 
      ? submissionsData.map(submission => ({
          ...submission,
          user_profiles: userProfiles?.find(
            profile => profile.user_id === submission.user_id
          ) || null
        }))
      : []

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/bounties/[id]/submissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

