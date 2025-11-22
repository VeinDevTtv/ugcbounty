import { NextRequest, NextResponse } from 'next/server';
import type {
  YouTubeViewsRequest,
  YouTubeViewsResponse,
  VideoViewResult,
  YouTubeVideoResponse,
} from './types';

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/videos';

function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      console.log(`[YouTube API] Extracted video ID: ${match[1]} using pattern: ${pattern}`);
      return match[1];
    }
  }

  console.log(`[YouTube API] No matching pattern found for URL: ${url}`);
  return null;
}

/**
 * Fetches YouTube video data from YouTube Data API
 */
async function fetchYouTubeData(videoId: string, apiKey: string): Promise<YouTubeVideoResponse> {
  const url = `${YOUTUBE_API_URL}?id=${videoId}&part=snippet,statistics&key=${apiKey}`;
  
  console.log(`[YouTube API] Fetching data for video ID: ${videoId}`);
  console.log(`[YouTube API] Request URL: ${url.replace(apiKey, '[API_KEY]')}`);
  
  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[YouTube API] Error response: ${response.status} ${response.statusText}`);
    console.error(`[YouTube API] Error body:`, errorText);
    throw new Error(`YouTube API returned ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`[YouTube API] Success response for ${videoId}:`, JSON.stringify(data, null, 2));
  
  return data;
}

/**
 * Processes a single YouTube URL and extracts view count
 */
async function processVideo(url: string, apiKey: string): Promise<VideoViewResult> {
  try {
    console.log(`[YouTube API] Processing URL: ${url}`);
    
    const videoId = extractYouTubeVideoId(url);
    
    if (!videoId) {
      console.error(`[YouTube API] Failed to extract video ID from URL: ${url}`);
      return {
        url,
        viewCount: null,
        success: false,
        error: 'Invalid YouTube URL - could not extract video ID',
      };
    }

    console.log(`[YouTube API] Extracted video ID: ${videoId}`);
    const data = await fetchYouTubeData(videoId, apiKey);

    // Check if the response contains video data
    if (!data.items || data.items.length === 0) {
      console.error(`[YouTube API] No video data found for ID: ${videoId}`);
      console.error(`[YouTube API] Response data:`, JSON.stringify(data, null, 2));
      return {
        url,
        viewCount: null,
        success: false,
        error: 'Video not found or not accessible',
      };
    }

    const video = data.items[0];
    const statistics = video.statistics;
    const snippet = video.snippet;

    console.log(`[YouTube API] Video statistics:`, JSON.stringify(statistics, null, 2));
    console.log(`[YouTube API] Video snippet:`, JSON.stringify(snippet, null, 2));

    // Parse statistics with proper error handling
    const viewCount = statistics.viewCount ? parseInt(statistics.viewCount, 10) : 0;
    const likeCount = statistics.likeCount ? parseInt(statistics.likeCount, 10) : 0;
    const commentCount = statistics.commentCount ? parseInt(statistics.commentCount, 10) : 0;

    console.log(`[YouTube API] Parsed counts - Views: ${viewCount}, Likes: ${likeCount}, Comments: ${commentCount}`);

    const result = {
      url,
      viewCount,
      success: true,
      metadata: {
        title: snippet.title,
        channelTitle: snippet.channelTitle,
        likes: likeCount,
        comments: commentCount,
        publishedAt: snippet.publishedAt,
        thumbnail: snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url || snippet.thumbnails.default?.url,
      },
    };

    console.log(`[YouTube API] Final result for ${url}:`, JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error(`[YouTube API] Error processing ${url}:`, error);
    return {
      url,
      viewCount: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * POST /api/youtube-views
 *
 * Accepts a list of YouTube video URLs and returns view counts for each
 *
 * Request body:
 * {
 *   "urls": ["https://www.youtube.com/watch?v=123", ...]
 * }
 *
 * Response:
 * {
 *   "results": [{ "url": "...", "viewCount": 123456, "success": true, "metadata": {...} }],
 *   "summary": { "totalVideos": 1, "successful": 1, "failed": 0, "totalViews": 123456 }
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse<YouTubeViewsResponse | { error: string }>> {
  try {
    console.log('[YouTube API] Starting YouTube views request');
    
    // Get API key from environment
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.error('[YouTube API] No API key configured');
      return NextResponse.json(
        { error: 'YouTube API key not configured' },
        { status: 500 }
      );
    }

    console.log('[YouTube API] API key found, parsing request body');
    
    // Parse request body
    const body: YouTubeViewsRequest = await request.json();
    console.log('[YouTube API] Request body:', JSON.stringify(body, null, 2));

    // Validate request
    if (!body.urls || !Array.isArray(body.urls) || body.urls.length === 0) {
      console.error('[YouTube API] Invalid request: no URLs provided');
      return NextResponse.json(
        { error: 'Invalid request: "urls" must be a non-empty array' },
        { status: 400 }
      );
    }

    console.log(`[YouTube API] Processing ${body.urls.length} URLs`);
    
    // Process all URLs in parallel
    const results = await Promise.allSettled(
      body.urls.map((url) => processVideo(url, apiKey))
    );

    console.log('[YouTube API] All video processing completed');

    // Extract results from Promise.allSettled
    const videoResults: VideoViewResult[] = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`[YouTube API] Promise rejected for URL ${body.urls[index]}:`, result.reason);
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

    console.log(`[YouTube API] Summary - Total: ${videoResults.length}, Successful: ${successful}, Failed: ${failed}, Total Views: ${totalViews}`);

    const response: YouTubeViewsResponse = {
      results: videoResults,
      summary: {
        totalVideos: videoResults.length,
        successful,
        failed,
        totalViews,
      },
    };

    console.log('[YouTube API] Final response:', JSON.stringify(response, null, 2));
    return NextResponse.json(response);
  } catch (error) {
    console.error('[YouTube API] Error processing YouTube views request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/youtube-views
 *
 * Test endpoint to verify YouTube API configuration
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('[YouTube API] Test endpoint called');
    
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'YouTube API key not configured',
          hasApiKey: false 
        },
        { status: 500 }
      );
    }

    // Test with a known YouTube video ID
    const testVideoId = 'dQw4w9WgXcQ'; // Rick Roll video
    const testUrl = `https://www.youtube.com/watch?v=${testVideoId}`;
    
    console.log(`[YouTube API] Testing with video ID: ${testVideoId}`);
    
    const result = await processVideo(testUrl, apiKey);
    
    return NextResponse.json({
      success: true,
      hasApiKey: true,
      testResult: result,
      message: 'YouTube API test completed'
    });
  } catch (error) {
    console.error('[YouTube API] Test endpoint error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Test failed',
        hasApiKey: !!process.env.YOUTUBE_API_KEY
      },
      { status: 500 }
    );
  }
}

