import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabase-server';

function detectPlatform(url: string): 'youtube' | 'tiktok' | 'instagram' | 'other' {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return 'youtube';
    }
    if (hostname.includes('tiktok.com')) {
      return 'tiktok';
    }
    if (hostname.includes('instagram.com')) {
      return 'instagram';
    }
    
    return 'other';
  } catch {
    return 'other';
  }
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user submissions from Supabase
    const { data: submissions, error } = await supabaseServer
      .from('submissions')
      .select(`
        *,
        bounties (
          id,
          name,
          description,
          total_bounty,
          rate_per_1k_views
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch submissions' },
        { status: 500 }
      );
    }

    // Transform database format to frontend format
    const formattedSubmissions = (submissions as any[]).map((submission) => ({
      id: submission.id,
      url: submission.video_url,
      bountyId: submission.bounty_id,
      title: submission.title || submission.bounties?.name || 'Unknown Bounty',
      coverImage: submission.cover_image_url || '',
      author: submission.author,
      viewCount: submission.view_count,
      platform: submission.platform || detectPlatform(submission.video_url),
      createdAt: submission.created_at,
      status: submission.status,
      earnedAmount: submission.earned_amount,
      bountyName: submission.bounties?.name,
      bountyDescription: submission.bounties?.description,
      description: submission.description,
      submittedBy: {
        userId: submission.user_id,
      },
    }));

    return NextResponse.json({
      success: true,
      submissions: formattedSubmissions,
    });
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

