import { NextRequest, NextResponse } from 'next/server';
import type {
  TikTokViewsRequest,
  TikTokViewsResponse,
  VideoViewResult,
  PeekalinkResponse,
  TikTokVideoQueryResponse,
  TikTokResearchResponse,
  TikTokVideoObject,
} from './types';

const PEEKALINK_API_URL = 'https://api.peekalink.io/';
const TIKTOK_API_BASE = 'https://open-api.tiktok.com';
const TIKTOK_RESEARCH_API_BASE = 'https://open.tiktokapis.com';

/**
 * Extract video ID from TikTok URL
 */
function extractTikTokVideoId(url: string): string | null {
  try {
    // Pattern: https://www.tiktok.com/@username/video/1234567890123456789
    const videoIdMatch = url.match(/\/video\/(\d+)/);
    if (videoIdMatch) {
      return videoIdMatch[1];
    }
    
    // Pattern: https://vm.tiktok.com/xxxxx (short URL - would need to resolve)
    // Pattern: https://tiktok.com/@username/video/1234567890123456789
    const altMatch = url.match(/tiktok\.com\/.*\/video\/(\d+)/);
    if (altMatch) {
      return altMatch[1];
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Extract username from TikTok URL
 */
function extractTikTokUsername(url: string): string | null {
  try {
    const usernameMatch = url.match(/@([^/]+)/);
    return usernameMatch ? usernameMatch[1] : null;
  } catch {
    return null;
  }
}

/**
 * Fetches TikTok video data from TikTok Direct API (Video Query API)
 * Requires user access token
 */
async function fetchTikTokDirectAPI(
  videoId: string,
  accessToken: string
): Promise<TikTokVideoQueryResponse> {
  const response = await fetch(`${TIKTOK_API_BASE}/video/query/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      access_token: accessToken,
      filters: {
        video_ids: [videoId],
      },
      fields: [
        'id',
        'create_time',
        'cover_image_url',
        'share_url',
        'video_description',
        'duration',
        'height',
        'width',
        'title',
        'like_count',
        'comment_count',
        'share_count',
        'view_count',
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`TikTok API returned ${response.status}: ${errorText}`);
  }

  return response.json();
}

/**
 * Fetches TikTok video data from TikTok Research API
 * Requires client access token (for public data)
 */
async function fetchTikTokResearchAPI(
  videoId: string,
  clientToken: string
): Promise<TikTokResearchResponse> {
  // Research API requires querying by video_id in a query
  const response = await fetch(
    `${TIKTOK_RESEARCH_API_BASE}/v2/research/video/query/?fields=id,create_time,username,region_code,video_description,like_count,comment_count,share_count,view_count`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${clientToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: {
          and: [
            {
              operation: 'EQ',
              field_name: 'video_id',
              field_values: [videoId],
            },
          ],
        },
        max_count: 1,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`TikTok Research API returned ${response.status}: ${errorText}`);
  }

  return response.json();
}

/**
 * Fetches TikTok video data from Peekalink API (Fallback)
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
 * Tries direct TikTok API first, falls back to Peekalink if not configured
 */
async function processVideo(
  url: string,
  peekalinkKey?: string,
  tiktokAccessToken?: string,
  tiktokClientToken?: string
): Promise<VideoViewResult> {
  try {
    const videoId = extractTikTokVideoId(url);
    if (!videoId) {
      return {
        url,
        viewCount: null,
        success: false,
        error: 'Invalid TikTok URL - could not extract video ID',
      };
    }

    // Try TikTok Direct API (Video Query API) first if access token is available
    if (tiktokAccessToken) {
      try {
        const data = await fetchTikTokDirectAPI(videoId, tiktokAccessToken);
        
        if (data.error && data.error.code !== 0) {
          throw new Error(data.error.message || 'TikTok API error');
        }

        if (data.data?.videos && data.data.videos.length > 0) {
          const video = data.data.videos[0];
          return {
            url,
            viewCount: video.view_count || null,
            success: true,
            metadata: {
              username: extractTikTokUsername(url) || '',
              title: video.video_description || video.title || '',
              likes: video.like_count || 0,
              comments: video.comment_count || 0,
              shares: video.share_count || 0,
              publishedAt: video.create_time ? new Date(video.create_time * 1000).toISOString() : '',
            },
          };
        }
      } catch (error) {
        console.warn('[TikTok API] Direct API failed, trying Research API:', error);
        // Fall through to Research API or Peekalink
      }
    }

    // Try TikTok Research API if client token is available
    if (tiktokClientToken) {
      try {
        const data = await fetchTikTokResearchAPI(videoId, tiktokClientToken);
        
        if (data.error) {
          throw new Error(data.error.message || 'TikTok Research API error');
        }

        if (data.data?.videos && data.data.videos.length > 0) {
          const video = data.data.videos[0];
          return {
            url,
            viewCount: video.view_count ? Number(video.view_count) : null,
            success: true,
            metadata: {
              username: video.username || extractTikTokUsername(url) || '',
              title: video.video_description || '',
              likes: video.like_count ? Number(video.like_count) : 0,
              comments: video.comment_count ? Number(video.comment_count) : 0,
              shares: video.share_count ? Number(video.share_count) : 0,
              publishedAt: video.create_time ? new Date(Number(video.create_time) * 1000).toISOString() : '',
            },
          };
        }
      } catch (error) {
        console.warn('[TikTok API] Research API failed, falling back to Peekalink:', error);
        // Fall through to Peekalink
      }
    }

    // Fallback to Peekalink if configured
    if (peekalinkKey) {
      const data = await fetchPeekalinkData(url, peekalinkKey);

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
    }

    // No API configured
    return {
      url,
      viewCount: null,
      success: false,
      error: 'No TikTok API credentials configured. Please set TIKTOK_ACCESS_TOKEN, TIKTOK_CLIENT_TOKEN, or PEEKALINK_API_KEY',
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
    // Get API keys from environment (try direct API first, fallback to Peekalink)
    const tiktokAccessToken = process.env.TIKTOK_ACCESS_TOKEN; // User access token for Video Query API
    const tiktokClientToken = process.env.TIKTOK_CLIENT_TOKEN; // Client access token for Research API
    const peekalinkKey = process.env.PEEKALINK_API_KEY; // Fallback to Peekalink

    // At least one API key must be configured
    if (!tiktokAccessToken && !tiktokClientToken && !peekalinkKey) {
      return NextResponse.json(
        { 
          error: 'No TikTok API credentials configured. Please set TIKTOK_ACCESS_TOKEN, TIKTOK_CLIENT_TOKEN, or PEEKALINK_API_KEY in environment variables' 
        },
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
      body.urls.map((url) => processVideo(url, peekalinkKey, tiktokAccessToken, tiktokClientToken))
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

