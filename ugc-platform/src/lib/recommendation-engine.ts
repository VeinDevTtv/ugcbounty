import { supabaseServer } from './supabase-server'
import { matchCreatorToBounties } from './ai-matching'
import type { CreatorProfile, BountyRecommendation, BountyWithProgress, MatchReasons } from '@/types/recommendations'
import type { Database } from '@/types/database.types'

type SubmissionRow = Database['public']['Tables']['submissions']['Row']
type BountyRow = Database['public']['Tables']['bounties']['Row']

const CACHE_TTL_HOURS = 24
const MAX_RECOMMENDATIONS = 10

/**
 * Analyze creator profile from past submissions
 */
export async function analyzeCreatorProfile(userId: string): Promise<CreatorProfile | null> {
  try {
    // Fetch user's submissions with metadata
    const { data: submissions, error } = await supabaseServer
      .from('submissions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching submissions for profile:', error)
      return null
    }

    if (!submissions || submissions.length === 0) {
      // Return empty profile for new creators
      return {
        userId,
        platforms: [],
        platformDistribution: {},
        avgViewCount: 0,
        totalSubmissions: 0,
        approvedSubmissions: 0,
        successRate: 0,
        submissionTitles: [],
        submissionDescriptions: [],
        topPerformingSubmissions: [],
        contentThemes: []
      }
    }

    // Calculate metrics
    const approvedSubmissions = submissions.filter(s => s.status === 'approved')
    const totalViews = submissions.reduce((sum, s) => sum + (Number(s.view_count) || 0), 0)
    const avgViewCount = submissions.length > 0 ? totalViews / submissions.length : 0
    const successRate = submissions.length > 0 ? approvedSubmissions.length / submissions.length : 0

    // Extract platforms
    const platforms = new Set<string>()
    const platformDistribution: Record<string, number> = {}
    
    submissions.forEach(s => {
      const platform = s.platform || 'other'
      platforms.add(platform)
      platformDistribution[platform] = (platformDistribution[platform] || 0) + 1
    })

    // Extract titles and descriptions
    const submissionTitles = submissions
      .map(s => s.title)
      .filter((t): t is string => t !== null && t.trim().length > 0)
    
    const submissionDescriptions = submissions
      .map(s => s.description)
      .filter((d): d is string => d !== null && d.trim().length > 0)

    // Get top performing submissions (by view count)
    const topPerformingSubmissions = submissions
      .map(s => ({
        title: s.title,
        description: s.description,
        viewCount: Number(s.view_count) || 0,
        platform: s.platform
      }))
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 10)

    // Extract content themes (simple keyword extraction from titles)
    const contentThemes = extractContentThemes(submissionTitles, submissionDescriptions)

    return {
      userId,
      platforms: Array.from(platforms) as Array<'youtube' | 'tiktok' | 'instagram' | 'other'>,
      platformDistribution,
      avgViewCount,
      totalSubmissions: submissions.length,
      approvedSubmissions: approvedSubmissions.length,
      successRate,
      submissionTitles,
      submissionDescriptions,
      topPerformingSubmissions,
      contentThemes
    }
  } catch (error) {
    console.error('Error analyzing creator profile:', error)
    return null
  }
}

/**
 * Extract content themes from titles and descriptions
 * Simple keyword extraction - could be enhanced with NLP
 */
function extractContentThemes(titles: string[], descriptions: string[]): string[] {
  const allText = [...titles, ...descriptions].join(' ').toLowerCase()
  
  // Common content theme keywords
  const themeKeywords = [
    'tech', 'technology', 'review', 'tutorial', 'how to', 'unboxing',
    'gaming', 'game', 'play', 'stream', 'entertainment', 'comedy',
    'fashion', 'style', 'outfit', 'beauty', 'makeup', 'skincare',
    'food', 'cooking', 'recipe', 'restaurant', 'travel', 'adventure',
    'fitness', 'workout', 'health', 'lifestyle', 'product', 'demo'
  ]

  const foundThemes = themeKeywords.filter(keyword => 
    allText.includes(keyword)
  )

  return foundThemes.slice(0, 10) // Limit to top 10 themes
}

/**
 * Fetch active bounties (not completed)
 */
export async function getActiveBounties(): Promise<BountyWithProgress[]> {
  try {
    const { data: bounties, error } = await supabaseServer
      .from('bounties')
      .select(`
        *,
        submissions (
          id,
          view_count,
          status
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bounties:', error)
      return []
    }

    // Calculate progress for each bounty
    const bountiesWithProgress: BountyWithProgress[] = (bounties as any[]).map(bounty => {
      const approvedSubmissions = (bounty.submissions || []).filter(
        (s: any) => s.status === 'approved'
      )
      
      const totalViews = approvedSubmissions.reduce(
        (sum: number, s: any) => sum + (Number(s.view_count) || 0),
        0
      )
      
      const usedBounty = (totalViews / 1000) * Number(bounty.rate_per_1k_views)
      const totalBounty = Number(bounty.total_bounty)
      
      const cappedUsedBounty = Math.min(usedBounty, totalBounty)
      const progressPercentage = totalBounty > 0
        ? Math.min((usedBounty / totalBounty) * 100, 100)
        : 0
      
      const isCompleted = usedBounty >= totalBounty

      return {
        ...bounty,
        calculated_claimed_bounty: cappedUsedBounty,
        progress_percentage: progressPercentage,
        total_submission_views: totalViews,
        is_completed: isCompleted
      }
    })

    // Filter out completed bounties
    return bountiesWithProgress.filter(b => !b.is_completed)
  } catch (error) {
    console.error('Error getting active bounties:', error)
    return []
  }
}

/**
 * Get cached recommendations for a user
 */
export async function getCachedRecommendations(
  userId: string,
  maxAgeHours: number = CACHE_TTL_HOURS
): Promise<BountyRecommendation[] | null> {
  try {
    const cutoffTime = new Date()
    cutoffTime.setHours(cutoffTime.getHours() - maxAgeHours)

    const { data: cached, error } = await supabaseServer
      .from('bounty_recommendations')
      .select(`
        *,
        bounties (
          *,
          submissions (
            id,
            view_count,
            status
          )
        )
      `)
      .eq('user_id', userId)
      .gte('last_calculated_at', cutoffTime.toISOString())
      .order('match_score', { ascending: false })
      .limit(MAX_RECOMMENDATIONS)

    if (error) {
      console.error('Error fetching cached recommendations:', error)
      return null
    }

    if (!cached || cached.length === 0) {
      return null
    }

    // Transform cached data to recommendations
    const recommendations: BountyRecommendation[] = cached.map((rec: any) => {
      const bounty = rec.bounties
      
      // Calculate progress for bounty
      const approvedSubmissions = (bounty.submissions || []).filter(
        (s: any) => s.status === 'approved'
      )
      const totalViews = approvedSubmissions.reduce(
        (sum: number, s: any) => sum + (Number(s.view_count) || 0),
        0
      )
      const usedBounty = (totalViews / 1000) * Number(bounty.rate_per_1k_views)
      const totalBounty = Number(bounty.total_bounty)
      const cappedUsedBounty = Math.min(usedBounty, totalBounty)
      const progressPercentage = totalBounty > 0
        ? Math.min((usedBounty / totalBounty) * 100, 100)
        : 0
      const isCompleted = usedBounty >= totalBounty

      const bountyWithProgress: BountyWithProgress = {
        ...bounty,
        calculated_claimed_bounty: cappedUsedBounty,
        progress_percentage: progressPercentage,
        total_submission_views: totalViews,
        is_completed: isCompleted
      }

      return {
        bounty: bountyWithProgress,
        matchScore: Number(rec.match_score),
        matchReasons: {
          specificReasons: Array.isArray(rec.match_reasons) 
            ? rec.match_reasons 
            : (rec.match_reasons ? [rec.match_reasons] : [])
        },
        platformMatch: rec.platform_match || false,
        contentStyleMatch: rec.content_style_match || false,
        lastCalculatedAt: rec.last_calculated_at
      }
    })

    return recommendations
  } catch (error) {
    console.error('Error getting cached recommendations:', error)
    return null
  }
}

/**
 * Generate recommendations using AI matching
 */
export async function generateRecommendations(
  userId: string,
  creatorProfile: CreatorProfile,
  bounties: BountyWithProgress[]
): Promise<BountyRecommendation[]> {
  try {
    // Use AI to match creator to bounties
    const matches = await matchCreatorToBounties(creatorProfile, bounties)

    // Transform to recommendations
    const recommendations: BountyRecommendation[] = matches.map(({ bounty, match }) => ({
      bounty,
      matchScore: match.matchScore,
      matchReasons: {
        platformMatch: match.platformCompatibility ? 'Platform experience matches' : undefined,
        contentStyleMatch: match.contentStyleAlignment ? 'Content style aligns' : undefined,
        specificReasons: match.reasons
      },
      platformMatch: match.platformCompatibility,
      contentStyleMatch: match.contentStyleAlignment
    }))

    // Sort by match score (highest first)
    recommendations.sort((a, b) => b.matchScore - a.matchScore)

    // Take top N
    const topRecommendations = recommendations.slice(0, MAX_RECOMMENDATIONS)

    // Cache the recommendations
    await cacheRecommendations(userId, topRecommendations)

    return topRecommendations
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return []
  }
}

/**
 * Cache recommendations in database
 */
async function cacheRecommendations(
  userId: string,
  recommendations: BountyRecommendation[]
): Promise<void> {
  try {
    // Delete old recommendations for this user
    await supabaseServer
      .from('bounty_recommendations')
      .delete()
      .eq('user_id', userId)

    // Insert new recommendations
    const now = new Date().toISOString()
    const inserts = recommendations.map(rec => ({
      user_id: userId,
      bounty_id: rec.bounty.id,
      match_score: rec.matchScore,
      match_reasons: rec.matchReasons.specificReasons,
      platform_match: rec.platformMatch,
      content_style_match: rec.contentStyleMatch,
      last_calculated_at: now
    }))

    if (inserts.length > 0) {
      const { error } = await supabaseServer
        .from('bounty_recommendations')
        .insert(inserts)

      if (error) {
        console.error('Error caching recommendations:', error)
      }
    }
  } catch (error) {
    console.error('Error caching recommendations:', error)
    // Don't throw - caching failure shouldn't break the flow
  }
}

/**
 * Main function to get recommendations (checks cache first, generates if needed)
 */
export async function getRecommendations(userId: string): Promise<BountyRecommendation[]> {
  // Try to get cached recommendations first
  const cached = await getCachedRecommendations(userId)
  if (cached && cached.length > 0) {
    return cached
  }

  // Cache miss - generate new recommendations
  const creatorProfile = await analyzeCreatorProfile(userId)
  if (!creatorProfile) {
    // No profile - return empty or general recommendations
    return []
  }

  const activeBounties = await getActiveBounties()
  if (activeBounties.length === 0) {
    return []
  }

  // If creator has no submissions, return general recommendations (newest bounties)
  if (creatorProfile.totalSubmissions === 0) {
    const generalRecommendations: BountyRecommendation[] = activeBounties
      .slice(0, MAX_RECOMMENDATIONS)
      .map(bounty => ({
        bounty,
        matchScore: 50, // Neutral score for new creators
        matchReasons: {
          specificReasons: ['New creator - explore this opportunity']
        },
        platformMatch: false,
        contentStyleMatch: false
      }))
    
    await cacheRecommendations(userId, generalRecommendations)
    return generalRecommendations
  }

  // Generate AI-powered recommendations
  return await generateRecommendations(userId, creatorProfile, activeBounties)
}

