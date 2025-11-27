import type { Database } from './database.types'

type BountyRow = Database['public']['Tables']['bounties']['Row']
type SubmissionRow = Database['public']['Tables']['submissions']['Row']

/**
 * Creator profile extracted from past submissions
 */
export interface CreatorProfile {
  userId: string
  platforms: Array<'youtube' | 'tiktok' | 'instagram' | 'other'>
  platformDistribution: Record<string, number> // platform -> count
  avgViewCount: number
  totalSubmissions: number
  approvedSubmissions: number
  successRate: number // approved / total
  submissionTitles: string[]
  submissionDescriptions: string[]
  topPerformingSubmissions: Array<{
    title: string | null
    description: string | null
    viewCount: number
    platform: string | null
  }>
  contentThemes: string[] // Extracted themes from titles/descriptions
}

/**
 * Match reasons for why a bounty matches a creator
 */
export interface MatchReasons {
  platformMatch?: string
  contentStyleMatch?: string
  performanceMatch?: string
  earningsPotential?: string
  specificReasons: string[] // AI-generated specific reasons
}

/**
 * Bounty recommendation with match score and reasons
 */
export interface BountyRecommendation {
  bounty: BountyWithProgress
  matchScore: number // 0-100
  matchReasons: MatchReasons
  platformMatch: boolean
  contentStyleMatch: boolean
  lastCalculatedAt?: string
}

/**
 * Bounty with progress information (from API)
 */
export interface BountyWithProgress extends BountyRow {
  calculated_claimed_bounty: number
  progress_percentage: number
  total_submission_views: number
  is_completed: boolean
}

/**
 * AI matching result from Gemini
 */
export interface AIMatchResult {
  matchScore: number
  reasons: string[]
  platformCompatibility: boolean
  contentStyleAlignment: boolean
  explanation: string
}

/**
 * Recommendation API response
 */
export interface RecommendationsResponse {
  recommendations: BountyRecommendation[]
  cached: boolean
  calculatedAt: string
}

