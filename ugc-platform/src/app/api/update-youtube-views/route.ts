import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import type { YouTubeViewsResponse } from '../youtube-views/types'
import type { Database } from '@/types/database.types'

type SubmissionRow = Database['public']['Tables']['submissions']['Row']

interface UpdateRequest {
  bountyItemIds?: string[] // Array of submission UUIDs
  bountyId?: string // Single bounty UUID
}

/**
 * POST /api/update-youtube-views
 *
 * Background service to update YouTube view counts for existing submissions
 * This endpoint can be called by a cron job or scheduled task
 *
 * Request body:
 * {
 *   "bountyItemIds": ["uuid1", "uuid2", ...], // Optional: specific submissions to update
 *   "bountyId": "uuid", // Optional: update all YouTube submissions for a specific bounty
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "updated": 5,
 *   "failed": 0,
 *   "results": [...]
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: UpdateRequest = await request.json().catch(() => ({}))
    const { bountyItemIds, bountyId } = body

    let submissionsToUpdate: SubmissionRow[] = []

    // Fetch submissions based on provided filters
    if (bountyItemIds && Array.isArray(bountyItemIds) && bountyItemIds.length > 0) {
      // Fetch specific submissions by IDs
      const { data, error } = await supabaseServer
        .from('submissions')
        .select('*')
        .in('id', bountyItemIds)
        .eq('platform', 'youtube')

      if (error) {
        console.error('[Update YouTube Views] Error fetching submissions by IDs:', error)
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to fetch submissions',
          },
          { status: 500 }
        )
      }

      submissionsToUpdate = (data as SubmissionRow[]) || []
    } else if (bountyId) {
      // Fetch all YouTube submissions for a specific bounty
      const { data, error } = await supabaseServer
        .from('submissions')
        .select('*')
        .eq('bounty_id', bountyId)
        .eq('platform', 'youtube')

      if (error) {
        console.error('[Update YouTube Views] Error fetching submissions by bounty:', error)
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to fetch submissions',
          },
          { status: 500 }
        )
      }

      submissionsToUpdate = (data as SubmissionRow[]) || []
    } else {
      // Fetch all YouTube submissions
      // Optionally add date filter: .lt('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      const { data, error } = await supabaseServer
        .from('submissions')
        .select('*')
        .eq('platform', 'youtube')

      if (error) {
        console.error('[Update YouTube Views] Error fetching all YouTube submissions:', error)
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to fetch submissions',
          },
          { status: 500 }
        )
      }

      submissionsToUpdate = (data as SubmissionRow[]) || []
    }

    if (submissionsToUpdate.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No YouTube submissions to update',
        updated: 0,
        failed: 0,
        results: [],
      })
    }

    // Extract URLs from submissions
    const urls = submissionsToUpdate.map((submission) => submission.video_url)

    // Call the YouTube views endpoint
    console.log(
      `[Update YouTube Views] Calling YouTube API for ${urls.length} URLs:`,
      urls
    )

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const youtubeResponse = await fetch(`${baseUrl}/api/youtube-views`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urls }),
    })

    console.log(
      `[Update YouTube Views] YouTube API response status: ${youtubeResponse.status}`
    )

    if (!youtubeResponse.ok) {
      const errorText = await youtubeResponse.text()
      console.error(`[Update YouTube Views] YouTube API error:`, errorText)
      return NextResponse.json(
        {
          success: false,
          error: `YouTube views API returned ${youtubeResponse.status}`,
        },
        { status: 500 }
      )
    }

    const youtubeData: YouTubeViewsResponse = await youtubeResponse.json()
    console.log(
      `[Update YouTube Views] YouTube API response data:`,
      JSON.stringify(youtubeData, null, 2)
    )

    let updatedCount = 0
    let failedCount = 0

    // Update submissions in database
    for (const result of youtubeData.results) {
      const submission = submissionsToUpdate.find(
        (sub) => sub.video_url === result.url
      )

      if (submission && result.success && result.viewCount !== null) {
        try {
          // Update the submission's view_count in database
          const { error: updateError } = await supabaseServer
            .from('submissions')
            .update({
              view_count: result.viewCount,
            })
            .eq('id', submission.id)

          if (updateError) {
            console.error(
              `[Update YouTube Views] Failed to update submission ${submission.id}:`,
              updateError
            )
            failedCount++
          } else {
            updatedCount++
            console.log(
              `[Update YouTube Views] Updated submission ${submission.id}: ${result.viewCount} views`
            )
          }
        } catch (error) {
          console.error(
            `[Update YouTube Views] Error updating submission ${submission.id}:`,
            error
          )
          failedCount++
        }
      } else {
        console.error(
          `[Update YouTube Views] Failed to get view count for ${result.url}:`,
          result.error
        )
        failedCount++
      }
    }

    return NextResponse.json({
      success: true,
      updated: updatedCount,
      failed: failedCount,
      results: youtubeData.results,
    })
  } catch (error) {
    console.error('[Update YouTube Views] Error updating YouTube views:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/update-youtube-views
 *
 * Trigger a manual update of all YouTube view counts
 * This can be called by a cron job or manual trigger
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return POST(request)
}

