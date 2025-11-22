import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabase-server'
import type { Database } from '@/types/database.types'
import type { YouTubeViewsResponse } from '../youtube-views/types'
import type { TikTokViewsResponse } from '../tiktok-views/types'

type SubmissionRow = Database['public']['Tables']['submissions']['Row']

interface UpdateRequest {
  submissionIds?: string[] // Array of submission UUIDs
  bountyId?: string // Single bounty UUID
}

/**
 * Detect platform from URL
 */
function detectPlatform(url: string): 'youtube' | 'tiktok' | 'instagram' | 'other' {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return 'youtube'
    }
    if (hostname.includes('tiktok.com')) {
      return 'tiktok'
    }
    if (hostname.includes('instagram.com')) {
      return 'instagram'
    }
    
    return 'other'
  } catch {
    return 'other'
  }
}

/**
 * POST /api/update-submission-views
 *
 * Updates view counts for submissions (supports YouTube, TikTok, and other platforms)
 * This endpoint can be called to refresh view counts for existing submissions
 *
 * Request body:
 * {
 *   "submissionIds": ["uuid1", "uuid2", ...], // Optional: specific submissions to update
 *   "bountyId": "uuid", // Optional: update all submissions for a specific bounty
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
    // Require authentication for security
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: UpdateRequest = await request.json().catch(() => ({}))
    const { submissionIds, bountyId } = body

    let submissionsToUpdate: SubmissionRow[] = []

    // Fetch submissions based on provided filters
    if (submissionIds && Array.isArray(submissionIds) && submissionIds.length > 0) {
      // Fetch specific submissions by IDs
      const { data, error } = await supabaseServer
        .from('submissions')
        .select('*')
        .in('id', submissionIds)

      if (error) {
        console.error('[Update Submission Views] Error fetching submissions by IDs:', error)
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
      // Fetch all submissions for a specific bounty
      const { data, error } = await supabaseServer
        .from('submissions')
        .select('*')
        .eq('bounty_id', bountyId)

      if (error) {
        console.error('[Update Submission Views] Error fetching submissions by bounty:', error)
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
      return NextResponse.json(
        {
          success: false,
          error: 'Either submissionIds or bountyId must be provided',
        },
        { status: 400 }
      )
    }

    if (submissionsToUpdate.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No submissions to update',
        updated: 0,
        failed: 0,
        results: [],
      })
    }

    // Group submissions by platform
    const youtubeSubmissions = submissionsToUpdate.filter(
      (sub) => detectPlatform(sub.video_url) === 'youtube' || sub.platform === 'youtube'
    )
    const tiktokSubmissions = submissionsToUpdate.filter(
      (sub) => detectPlatform(sub.video_url) === 'tiktok' || sub.platform === 'tiktok'
    )

    let updatedCount = 0
    let failedCount = 0
    const results: Array<{
      submissionId: string
      url: string
      platform: string
      success: boolean
      viewCount: number | null
      error?: string
    }> = []

    // Update YouTube submissions
    if (youtubeSubmissions.length > 0) {
      const youtubeUrls = youtubeSubmissions.map((sub) => sub.video_url)
      
      console.log(
        `[Update Submission Views] Calling YouTube API for ${youtubeUrls.length} URLs`
      )

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const youtubeResponse = await fetch(`${baseUrl}/api/youtube-views`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: youtubeUrls }),
      })

      if (youtubeResponse.ok) {
        const youtubeData: YouTubeViewsResponse = await youtubeResponse.json()

        // Update submissions in database
        for (const result of youtubeData.results) {
          const submission = youtubeSubmissions.find(
            (sub) => sub.video_url === result.url
          )

          if (submission && result.success && result.viewCount !== null) {
            try {
              // Prepare update data
              const updateData: { view_count: number; earned_amount?: number } = {
                view_count: result.viewCount,
              }

              // Only calculate earned_amount for approved submissions
              if (submission.status === 'approved' && submission.bounty_id) {
                // Get bounty to calculate earned_amount
                const { data: bountyData } = await supabaseServer
                  .from('bounties')
                  .select('rate_per_1k_views')
                  .eq('id', submission.bounty_id)
                  .single()

                const ratePer1k = bountyData?.rate_per_1k_views || 0
                updateData.earned_amount = (result.viewCount / 1000) * ratePer1k
              }

              // Update the submission's view_count and earned_amount (if approved)
              const { error: updateError } = await supabaseServer
                .from('submissions')
                .update(updateData)
                .eq('id', submission.id)

              if (updateError) {
                console.error(
                  `[Update Submission Views] Failed to update submission ${submission.id}:`,
                  updateError
                )
                failedCount++
                results.push({
                  submissionId: submission.id,
                  url: result.url,
                  platform: 'youtube',
                  success: false,
                  viewCount: null,
                  error: updateError.message,
                })
              } else {
                updatedCount++
                console.log(
                  `[Update Submission Views] Updated submission ${submission.id}: ${result.viewCount} views`
                )
                results.push({
                  submissionId: submission.id,
                  url: result.url,
                  platform: 'youtube',
                  success: true,
                  viewCount: result.viewCount,
                })
              }
            } catch (error) {
              console.error(
                `[Update Submission Views] Error updating submission ${submission.id}:`,
                error
              )
              failedCount++
              results.push({
                submissionId: submission.id,
                url: result.url,
                platform: 'youtube',
                success: false,
                viewCount: null,
                error: error instanceof Error ? error.message : 'Unknown error',
              })
            }
          } else {
            failedCount++
            results.push({
              submissionId: submission?.id || '',
              url: result.url,
              platform: 'youtube',
              success: false,
              viewCount: null,
              error: result.error || 'Failed to get view count',
            })
          }
        }
      } else {
        const errorText = await youtubeResponse.text()
        console.error(`[Update Submission Views] YouTube API error:`, errorText)
        failedCount += youtubeSubmissions.length
        youtubeSubmissions.forEach((sub) => {
          results.push({
            submissionId: sub.id,
            url: sub.video_url,
            platform: 'youtube',
            success: false,
            viewCount: null,
            error: `YouTube API returned ${youtubeResponse.status}`,
          })
        })
      }
    }

    // Update TikTok submissions
    if (tiktokSubmissions.length > 0) {
      const tiktokUrls = tiktokSubmissions.map((sub) => sub.video_url)
      
      console.log(
        `[Update Submission Views] Calling TikTok API for ${tiktokUrls.length} URLs`
      )

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const tiktokResponse = await fetch(`${baseUrl}/api/tiktok-views`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: tiktokUrls }),
      })

      if (tiktokResponse.ok) {
        const tiktokData: TikTokViewsResponse = await tiktokResponse.json()

        // Update submissions in database
        for (const result of tiktokData.results) {
          const submission = tiktokSubmissions.find(
            (sub) => sub.video_url === result.url
          )

          if (submission && result.success && result.viewCount !== null) {
            try {
              // Prepare update data
              const updateData: { view_count: number; earned_amount?: number } = {
                view_count: result.viewCount,
              }

              // Only calculate earned_amount for approved submissions
              if (submission.status === 'approved' && submission.bounty_id) {
                // Get bounty to calculate earned_amount
                const { data: bountyData } = await supabaseServer
                  .from('bounties')
                  .select('rate_per_1k_views')
                  .eq('id', submission.bounty_id)
                  .single()

                const ratePer1k = bountyData?.rate_per_1k_views || 0
                updateData.earned_amount = (result.viewCount / 1000) * ratePer1k
              }

              // Update the submission's view_count and earned_amount (if approved)
              const { error: updateError } = await supabaseServer
                .from('submissions')
                .update(updateData)
                .eq('id', submission.id)

              if (updateError) {
                console.error(
                  `[Update Submission Views] Failed to update submission ${submission.id}:`,
                  updateError
                )
                failedCount++
                results.push({
                  submissionId: submission.id,
                  url: result.url,
                  platform: 'tiktok',
                  success: false,
                  viewCount: null,
                  error: updateError.message,
                })
              } else {
                updatedCount++
                console.log(
                  `[Update Submission Views] Updated submission ${submission.id}: ${result.viewCount} views`
                )
                results.push({
                  submissionId: submission.id,
                  url: result.url,
                  platform: 'tiktok',
                  success: true,
                  viewCount: result.viewCount,
                })
              }
            } catch (error) {
              console.error(
                `[Update Submission Views] Error updating submission ${submission.id}:`,
                error
              )
              failedCount++
              results.push({
                submissionId: submission.id,
                url: result.url,
                platform: 'tiktok',
                success: false,
                viewCount: null,
                error: error instanceof Error ? error.message : 'Unknown error',
              })
            }
          } else {
            failedCount++
            results.push({
              submissionId: submission?.id || '',
              url: result.url,
              platform: 'tiktok',
              success: false,
              viewCount: null,
              error: result.error || 'Failed to get view count',
            })
          }
        }
      } else {
        const errorText = await tiktokResponse.text()
        console.error(`[Update Submission Views] TikTok API error:`, errorText)
        failedCount += tiktokSubmissions.length
        tiktokSubmissions.forEach((sub) => {
          results.push({
            submissionId: sub.id,
            url: sub.video_url,
            platform: 'tiktok',
            success: false,
            viewCount: null,
            error: `TikTok API returned ${tiktokResponse.status}`,
          })
        })
      }
    }

    return NextResponse.json({
      success: true,
      updated: updatedCount,
      failed: failedCount,
      results,
    })
  } catch (error) {
    console.error('[Update Submission Views] Error updating submission views:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

