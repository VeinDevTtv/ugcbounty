import { NextRequest, NextResponse } from 'next/server';

interface LinkPreviewRequest {
  url: string;
}

interface LinkPreviewResponse {
  title: string;
  description: string;
  image: string;
  url: string;
}

interface LinkPreviewNetResponse {
  title: string;
  description: string;
  image: string;
  url: string;
}

const LINKPREVIEW_API_URL = 'https://api.linkpreview.net/';

async function fetchLinkPreviewData(url: string, apiKey: string): Promise<LinkPreviewNetResponse> {
  const response = await fetch(`${LINKPREVIEW_API_URL}?q=${encodeURIComponent(url)}`, {
    method: 'GET',
    headers: {
      'X-Linkpreview-Api-Key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`LinkPreview API returned ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    console.log('Link preview API called');
    const body: LinkPreviewRequest = await request.json();
    const { url } = body;

    console.log('Request URL:', url);

    if (!url) {
      console.log('Error: No URL provided');
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      console.log('Error: Invalid URL format:', error);
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    console.log('Detected hostname:', hostname);

    // Check if it's a supported platform
    if (!hostname.includes('youtube.com') && !hostname.includes('youtu.be') && 
        !hostname.includes('instagram.com') && !hostname.includes('tiktok.com')) {
      console.log('Error: Unsupported platform for hostname:', hostname);
      return NextResponse.json(
        { error: 'Unsupported platform' },
        { status: 400 }
      );
    }

    const linkPreviewApiKey = process.env.LINKPREVIEW_API_KEY;
    if (!linkPreviewApiKey) {
      console.log('Error: LinkPreview API key not configured');
      return NextResponse.json(
        { error: 'Preview service not available' },
        { status: 500 }
      );
    }

    try {
      const linkPreviewData = await fetchLinkPreviewData(url, linkPreviewApiKey);

      const previewData: LinkPreviewResponse = {
        title: linkPreviewData.title || 'Untitled',
        description: linkPreviewData.description || 'No description available',
        image: linkPreviewData.image || '',
        url: linkPreviewData.url || url
      };

      console.log('Returning preview data:', previewData);
      return NextResponse.json(previewData);

    } catch (linkPreviewError) {
      console.error('LinkPreview error:', linkPreviewError);
      return NextResponse.json(
        { error: 'Failed to fetch preview data' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error generating link preview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

