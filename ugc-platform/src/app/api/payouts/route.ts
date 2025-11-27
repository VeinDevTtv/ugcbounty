import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserPayouts } from '@/lib/payment-utils'
import type { PayoutsResponse } from '@/types/stripe.types'

/**
 * GET /api/payouts
 * Get payout history for authenticated creator
 * 
 * Query parameters:
 * - limit: Number of payouts to return (default: 50, max: 100)
 * - offset: Number of payouts to skip for pagination (default: 0)
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<PayoutsResponse | { error: string }>> {
  try {
    // Authenticate user
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to view payouts.' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const limitParam = searchParams.get('limit')
    const offsetParam = searchParams.get('offset')

    const limit = limitParam
      ? Math.min(Math.max(parseInt(limitParam, 10) || 50, 1), 100)
      : 50
    const offset = offsetParam ? Math.max(parseInt(offsetParam, 10) || 0, 0) : 0

    // Get payouts
    const { data: payouts, error } = await getUserPayouts(userId, limit, offset)

    if (error) {
      console.error('Error getting payouts:', error)
      return NextResponse.json(
        {
          error: error.message || 'Failed to retrieve payouts.',
        },
        { status: 500 }
      )
    }

    if (payouts === null) {
      return NextResponse.json(
        {
          error: 'Failed to retrieve payouts.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        payouts,
        total: payouts.length,
        page: offset > 0 ? Math.floor(offset / limit) + 1 : 1,
        limit,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in GET /api/payouts:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'An error occurred while retrieving payouts.',
      },
      { status: 500 }
    )
  }
}

