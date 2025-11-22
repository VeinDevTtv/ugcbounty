import { NextRequest, NextResponse } from 'next/server';
import type {
  TikTokViewsRequest,
  TikTokViewsResponse,
  VideoViewResult,
  PeekalinkResponse,
} from './types';

const PEEKALINK_API_URL = 'https://api.peekalink.io/';

/**
 * Fetches TikTok video data from Peekalink API
 */
async function fetchPeekalinkData(url: string, apiKey: string): Promise<PeekalinkResponse> {
  const response = await fetch(PEEKALINK_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ link: url }),
  });

  if (!response.ok) {
    throw new Error(`Peekalink API returned ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Processes a single TikTok URL and extracts view count
 */
async function processVideo(url: string, apiKey: string): Promise<VideoViewResult> {
  try {
    const data = await fetchPeekalinkData(url, apiKey);

    // Check if the response is valid and contains TikTok video data
    if (!data.ok || !data.tiktokVideo) {
      return {
        url,
        viewCount: null,
        success: false,
        error: 'Invalid response or not a TikTok video',
      };
    }

    // Extract view count and metadata
    const { tiktokVideo } = data;
    return {
      url,
      viewCount: tiktokVideo.playsCount,
      success: true,
      metadata: {
        username: tiktokVideo.user.username,
        title: tiktokVideo.text,
        likes: tiktokVideo.likesCount,
        comments: tiktokVideo.commentsCount,
        shares: tiktokVideo.sharesCount,
        publishedAt: tiktokVideo.publishedAt,
      },
    };
  } catch (error) {
    return {
      url,
      viewCount: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * POST /api/tiktok-views
 *
 * Accepts a list of TikTok video URLs and returns view counts for each
 *
 * Request body:
 * {
 *   "urls": ["https://www.tiktok.com/@user/video/123", ...]
 * }
 *
 * Response:
 * {
 *   "results": [{ "url": "...", "viewCount": 123456, "success": true, "metadata": {...} }],
 *   "summary": { "totalVideos": 1, "successful": 1, "failed": 0, "totalViews": 123456 }
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse<TikTokViewsResponse | { error: string }>> {
  try {
    // Get API key from environment
    const apiKey = process.env.PEEKALINK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Peekalink API key not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body: TikTokViewsRequest = await request.json();

    // Validate request
    if (!body.urls || !Array.isArray(body.urls) || body.urls.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: "urls" must be a non-empty array' },
        { status: 400 }
      );
    }

    // Process all URLs in parallel
    const results = await Promise.allSettled(
      body.urls.map((url) => processVideo(url, apiKey))
    );

    // Extract results from Promise.allSettled
    const videoResults: VideoViewResult[] = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          url: body.urls[index],
          viewCount: null,
          success: false,
          error: result.reason?.message || 'Processing failed',
        };
      }
    });

    // Calculate summary statistics
    const successful = videoResults.filter((r) => r.success).length;
    const failed = videoResults.length - successful;
    const totalViews = videoResults.reduce(
      (sum, result) => sum + (result.viewCount || 0),
      0
    );

    const response: TikTokViewsResponse = {
      results: videoResults,
      summary: {
        totalVideos: videoResults.length,
        successful,
        failed,
        totalViews,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing TikTok views request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

