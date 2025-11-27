import { NextRequest, NextResponse } from 'next/server';

// Instagram API Response Types

interface InstagramMediaObject {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  permalink?: string;
  thumbnail_url?: string;
  timestamp?: string;
  username?: string;
  caption?: string;
  like_count?: number;
  comments_count?: number;
  insights?: {
    data: Array<{
      name: string;
      period: string;
      values: Array<{
        value: {
          [key: string]: number;
        };
        end_time: string;
      }>;
    }>;
  };
}

interface InstagramGraphAPIResponse {
  data: InstagramMediaObject[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
    previous?: string;
  };
  error?: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
}

interface InstagramOEmbedResponse {
  version: string;
  type: string;
  title?: string;
  author_name?: string;
  author_url?: string;
  provider_name: string;
  provider_url: string;
  thumbnail_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
  html: string;
  width: number;
  height: number;
}

interface VideoViewResult {
  url: string;
  viewCount: number | null;
  success: boolean;
  error?: string;
  metadata?: {
    username?: string;
    title?: string;
    caption?: string;
    likes?: number;
    comments?: number;
    publishedAt?: string;
    thumbnail?: string;
  };
}

interface InstagramViewsRequest {
  urls: string[];
}

interface InstagramViewsResponse {
  results: VideoViewResult[];
  summary: {
    totalVideos: number;
    successful: number;
    failed: number;
    totalViews: number;
  };
}

const INSTAGRAM_GRAPH_API_BASE = 'https://graph.facebook.com/v21.0';
const INSTAGRAM_OEMBED_API = 'https://graph.facebook.com/v21.0/instagram_oembed';

/**
 * Extract media ID from Instagram URL
 */
function extractInstagramMediaId(url: string): string | null {
  try {
    // Pattern: https://www.instagram.com/p/ABC123xyz/
    // Pattern: https://www.instagram.com/reel/ABC123xyz/
    const shortcodeMatch = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
    if (shortcodeMatch) {
      return shortcodeMatch[1];
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Extract username from Instagram URL
 */
function extractInstagramUsername(url: string): string | null {
  try {
    const usernameMatch = url.match(/instagram\.com\/([^/]+)/);
    return usernameMatch ? usernameMatch[1] : null;
  } catch {
    return null;
  }
}

/**
 * Convert Instagram shortcode to media ID (requires API call or decoding)
 * For now, we'll use the shortcode directly in Graph API queries
 */
async function getInstagramMediaByShortcode(
  shortcode: string,
  accessToken: string
): Promise<InstagramMediaObject | null> {
  try {
    // Try to get media by shortcode using Graph API
    // Note: This requires the media to be associated with an Instagram Business/Creator account
    const response = await fetch(
      `${INSTAGRAM_GRAPH_API_BASE}/${shortcode}?fields=id,media_type,media_url,permalink,thumbnail_url,timestamp,username,caption,like_count,comments_count&access_token=${accessToken}`
    );

    if (!response.ok) {
      return null;
    }

    const data: InstagramMediaObject = await response.json();
    return data;
  } catch {
    return null;
  }
}

/**
 * Fetch Instagram media insights (views, reach, etc.) using Graph API
 * Requires Instagram Business or Creator account
 */
async function fetchInstagramInsights(
  mediaId: string,
  accessToken: string
): Promise<number | null> {
  try {
    const response = await fetch(
      `${INSTAGRAM_GRAPH_API_BASE}/${mediaId}/insights?metric=impressions,reach,plays&access_token=${accessToken}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    // Get plays (for videos) or impressions (for images)
    if (data.data) {
      const playsMetric = data.data.find((m: any) => m.name === 'plays');
      const impressionsMetric = data.data.find((m: any) => m.name === 'impressions');
      
      if (playsMetric && playsMetric.values && playsMetric.values.length > 0) {
        return playsMetric.values[0].value || null;
      }
      
      if (impressionsMetric && impressionsMetric.values && impressionsMetric.values.length > 0) {
        return impressionsMetric.values[0].value || null;
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch Instagram oEmbed data (public, no auth required)
 * Limited data but works for public posts
 */
async function fetchInstagramOEmbed(url: string): Promise<InstagramOEmbedResponse | null> {
  try {
    const response = await fetch(
      `${INSTAGRAM_OEMBED_API}?url=${encodeURIComponent(url)}&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN || ''}`
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

/**
 * Processes a single Instagram URL and extracts view count
 * Tries Instagram Graph API first, falls back to oEmbed if not configured
 */
async function processVideo(
  url: string,
  accessToken?: string
): Promise<VideoViewResult> {
  try {
    const shortcode = extractInstagramMediaId(url);
    if (!shortcode) {
      return {
        url,
        viewCount: null,
        success: false,
        error: 'Invalid Instagram URL - could not extract media ID',
      };
    }

    // Try Instagram Graph API if access token is available
    if (accessToken) {
      try {
        const media = await getInstagramMediaByShortcode(shortcode, accessToken);
        
        if (media) {
          // Try to get insights (views/plays) for the media
          let viewCount: number | null = null;
          
          if (media.id) {
            viewCount = await fetchInstagramInsights(media.id, accessToken);
          }
          
          // If insights not available, use like_count as fallback metric
          if (viewCount === null && media.like_count) {
            // For Instagram, we might not have view counts for all media types
            // Reels typically have plays, posts have impressions
            viewCount = null; // Keep as null if we can't get actual views
          }

          return {
            url,
            viewCount,
            success: true,
            metadata: {
              username: media.username || extractInstagramUsername(url) || undefined,
              title: media.caption || undefined,
              caption: media.caption || undefined,
              likes: media.like_count || 0,
              comments: media.comments_count || 0,
              publishedAt: media.timestamp || undefined,
              thumbnail: media.thumbnail_url || media.media_url || undefined,
            },
          };
        }
      } catch (error) {
        console.warn('[Instagram API] Graph API failed, trying oEmbed:', error);
        // Fall through to oEmbed
      }
    }

    // Fallback to oEmbed (public, limited data)
    const oEmbedData = await fetchInstagramOEmbed(url);
    
    if (oEmbedData) {
      return {
        url,
        viewCount: null, // oEmbed doesn't provide view counts
        success: true,
        metadata: {
          username: extractInstagramUsername(url) || undefined,
          title: oEmbedData.title || undefined,
          thumbnail: oEmbedData.thumbnail_url || undefined,
          likes: 0, // oEmbed doesn't provide engagement metrics
          comments: 0,
        },
      };
    }

    // No data available
    return {
      url,
      viewCount: null,
      success: false,
      error: accessToken 
        ? 'Could not fetch Instagram data. Make sure the post is public and accessible.'
        : 'Instagram API access token not configured. Please set INSTAGRAM_ACCESS_TOKEN in environment variables',
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
 * POST /api/instagram-views
 *
 * Accepts a list of Instagram post/reel URLs and returns view counts for each
 *
 * Request body:
 * {
 *   "urls": ["https://www.instagram.com/p/ABC123xyz/", ...]
 * }
 *
 * Response:
 * {
 *   "results": [{ "url": "...", "viewCount": 123456, "success": true, "metadata": {...} }],
 *   "summary": { "totalVideos": 1, "successful": 1, "failed": 0, "totalViews": 123456 }
 * }
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<InstagramViewsResponse | { error: string }>> {
  try {
    // Get API key from environment
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

    // Parse request body
    const body: InstagramViewsRequest = await request.json();

    // Validate request
    if (!body.urls || !Array.isArray(body.urls) || body.urls.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: "urls" must be a non-empty array' },
        { status: 400 }
      );
    }

    // Process all URLs in parallel
    const results = await Promise.allSettled(
      body.urls.map((url) => processVideo(url, accessToken))
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

    const response: InstagramViewsResponse = {
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
    console.error('Error processing Instagram views request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

