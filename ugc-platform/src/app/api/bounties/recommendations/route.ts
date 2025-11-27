import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getRecommendations } from '@/lib/recommendation-engine'
import type { RecommendationsResponse } from '@/types/recommendations'

/**
 * GET /api/bounties/recommendations
 * Get personalized bounty recommendations for the authenticated creator
 * 
 * Returns AI-powered recommendations based on:
 * - Creator's past submission history
 * - Content style and platform preferences
 * - Performance metrics
 * 
 * Response:
 * {
 *   recommendations: BountyRecommendation[],
 *   cached: boolean,
 *   calculatedAt: string
 * }
 */
export async function GET() {
  try {
    // Authenticate user
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to get recommendations.' },
        { status: 401 }
      )
    }

    // Get recommendations (checks cache first, generates if needed)
    const recommendations = await getRecommendations(userId)

    // Check if recommendations were cached
    const cached = recommendations.length > 0 && 
                   recommendations[0].lastCalculatedAt !== undefined

    const response: RecommendationsResponse = {
      recommendations,
      cached: cached || false,
      calculatedAt: new Date().toISOString()
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in GET /api/bounties/recommendations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

