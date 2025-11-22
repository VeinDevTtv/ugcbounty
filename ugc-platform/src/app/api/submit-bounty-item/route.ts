import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabase-server'
import type {
  SubmitBountyItemRequest,
  SubmitBountyItemResponse,
  BountyItemData,
} from './types'
import type { Database } from '@/types/database.types'

interface LinkPreviewResponse {
  title: string
  description: string
  image: string
  url: string
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
 * Fetch link preview data from internal API
 */
async function fetchLinkPreviewData(url: string): Promise<LinkPreviewResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/link-preview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to fetch preview data' }))
    throw new Error(errorData.error || 'Failed to fetch preview data')
  }

  return response.json()
}

/**
 * POST /api/submit-bounty-item
 * Submit a bounty item with platform detection, link preview, and view fetching
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<SubmitBountyItemResponse>> {
  try {
    // Get the authenticated user
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: You must be signed in to submit a bounty item' },
        { status: 401 }
      )
    }

    const body: SubmitBountyItemRequest = await request.json()

    if (!body.url || !body.bountyId) {
      return NextResponse.json(
        { success: false, error: 'URL and bountyId are required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(body.url)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Detect platform
    const platform = detectPlatform(body.url)
    
    // Fetch link preview data
    const linkPreviewData = await fetchLinkPreviewData(body.url)

    // Initialize metadata from link preview
    let title = linkPreviewData.title
    let coverImage = linkPreviewData.image
    let author: string | undefined
    let viewCount: number | undefined

    // Fetch platform-specific data (YouTube/TikTok)
    if (platform === 'youtube') {
      try {
        console.log(`[Submit Bounty] Fetching YouTube data for URL: ${body.url}`)
        
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const youtubeResponse = await fetch(`${baseUrl}/api/youtube-views`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ urls: [body.url] }),
        })

        console.log(`[Submit Bounty] YouTube API response status: ${youtubeResponse.status}`)

        if (youtubeResponse.ok) {
          const youtubeData = await youtubeResponse.json()
          console.log(`[Submit Bounty] YouTube API response data:`, JSON.stringify(youtubeData, null, 2))
          
          const result = youtubeData.results?.[0]
          
          if (result?.success && result.metadata) {
            title = result.metadata.title || title
            author = result.metadata.channelTitle
            viewCount = result.viewCount
            coverImage = result.metadata.thumbnail || coverImage
            
            console.log(`[Submit Bounty] YouTube data extracted - Title: ${title}, Author: ${author}, Views: ${viewCount}`)
          } else {
            console.error(`[Submit Bounty] YouTube API failed for ${body.url}:`, result?.error)
          }
        } else {
          const errorText = await youtubeResponse.text()
          console.error(`[Submit Bounty] YouTube API error response:`, errorText)
        }
      } catch (error) {
        console.error('[Submit Bounty] Failed to fetch YouTube data:', error)
        // Continue with link preview data if YouTube API fails
      }
    } else if (platform === 'tiktok') {
      try {
        console.log(`[Submit Bounty] Fetching TikTok data for URL: ${body.url}`)
        
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const tiktokResponse = await fetch(`${baseUrl}/api/tiktok-views`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ urls: [body.url] }),
        })

        if (tiktokResponse.ok) {
          const tiktokData = await tiktokResponse.json()
          const result = tiktokData.results?.[0]
          
          if (result?.success && result.metadata) {
            title = result.metadata.title || title
            author = result.metadata.username
            viewCount = result.viewCount
            // TikTok may not have cover image in API response, keep link preview image
            
            console.log(`[Submit Bounty] TikTok data extracted - Title: ${title}, Author: ${author}, Views: ${viewCount}`)
          }
        }
      } catch (error) {
        console.error('[Submit Bounty] Failed to fetch TikTok data:', error)
        // Continue with link preview data if TikTok API fails
      }
    }

    // Prepare submission data
    // Note: title, description, cover_image_url, author, platform may not exist in schema yet
    // If they don't exist, they'll be ignored by Supabase
    const submissionData: Database['public']['Tables']['submissions']['Insert'] = {
      bounty_id: body.bountyId,
      user_id: userId,
      video_url: body.url,
      view_count: viewCount || 0,
      status: 'approved', // Auto-approve for now
      validation_explanation: null,
      // Include optional metadata fields if they exist in schema
      ...(title && { title: title as any }),
      ...(linkPreviewData.description && { description: linkPreviewData.description as any }),
      ...(coverImage && { cover_image_url: coverImage as any }),
      ...(author && { author: author as any }),
      ...(platform && { platform: platform as any }),
    }

    // Store submission in Supabase
    const { data: submission, error: submissionError } = await supabaseServer
      .from('submissions')
      .insert(submissionData)
      .select()
      .single()

    if (submissionError) {
      console.error('Error storing submission in Supabase:', submissionError)
      
      // If metadata fields don't exist, retry without them
      if (submissionError.message?.includes('column') && 
          (submissionError.message?.includes('title') || 
           submissionError.message?.includes('description') || 
           submissionError.message?.includes('cover_image_url') || 
           submissionError.message?.includes('author') || 
           submissionError.message?.includes('platform'))) {
        
        const { data: retrySubmission, error: retryError } = await supabaseServer
          .from('submissions')
          .insert({
            bounty_id: body.bountyId,
            user_id: userId,
            video_url: body.url,
            view_count: viewCount || 0,
            status: 'approved',
            validation_explanation: null,
          })
          .select()
          .single()

        if (retryError) {
          console.error('Error storing submission (retry):', retryError)
          return NextResponse.json(
            { success: false, error: 'Failed to store submission' },
            { status: 500 }
          )
        }

        // Use retry submission for response
        const itemData: BountyItemData = {
          url: body.url,
          bountyId: body.bountyId,
          title,
          description: linkPreviewData.description || '',
          coverImage,
          author,
          viewCount,
          platform,
          createdAt: (retrySubmission as any).created_at,
          submittedBy: {
            userId,
            username: user?.username || undefined,
            email: user?.emailAddresses[0]?.emailAddress || undefined,
          },
        }

        // Update or create user profile
        await supabaseServer
          .from('user_profiles')
          .upsert({
            user_id: userId,
            username: user?.username || null,
            email: user?.emailAddresses[0]?.emailAddress || null,
          } as any)

        return NextResponse.json({
          success: true,
          data: itemData,
        })
      }

      return NextResponse.json(
        { success: false, error: 'Failed to store submission' },
        { status: 500 }
      )
    }

    // Update or create user profile (upsert pattern from og)
    await supabaseServer
      .from('user_profiles')
      .upsert({
        user_id: userId,
        username: user?.username || null,
        email: user?.emailAddresses[0]?.emailAddress || null,
      } as any)

    const itemData: BountyItemData = {
      url: body.url,
      bountyId: body.bountyId,
      title,
      description: linkPreviewData.description || '',
      coverImage,
      author,
      viewCount,
      platform,
      createdAt: (submission as any).created_at,
      submittedBy: {
        userId,
        username: user?.username || undefined,
        email: user?.emailAddresses[0]?.emailAddress || undefined,
      },
    }

    return NextResponse.json({
      success: true,
      data: itemData,
    })
  } catch (error) {
    console.error('Error submitting bounty item:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

