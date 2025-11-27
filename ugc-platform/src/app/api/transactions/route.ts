import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserTransactions } from '@/lib/payment-utils'
import type { TransactionsResponse, Transaction } from '@/types/stripe.types'

/**
 * GET /api/transactions
 * Get transaction history for authenticated user
 * 
 * Query parameters:
 * - limit: Number of transactions to return (default: 50, max: 100)
 * - offset: Number of transactions to skip for pagination (default: 0)
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<TransactionsResponse | { error: string }>> {
  try {
    // Authenticate user
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to view transactions.' },
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

    // Get transactions
    const { data: transactions, error } = await getUserTransactions(
      userId,
      limit,
      offset
    )

    if (error) {
      console.error('Error getting transactions:', error)
      return NextResponse.json(
        {
          error: error.message || 'Failed to retrieve transactions.',
        },
        { status: 500 }
      )
    }

    if (transactions === null) {
      return NextResponse.json(
        {
          error: 'Failed to retrieve transactions.',
        },
        { status: 500 }
      )
    }

    // Transform transactions to ensure metadata is always Record<string, any>
    const transformedTransactions: Transaction[] = transactions.map((tx) => ({
      ...tx,
      metadata:
        tx.metadata &&
        typeof tx.metadata === 'object' &&
        !Array.isArray(tx.metadata)
          ? (tx.metadata as Record<string, any>)
          : {},
    }))

    return NextResponse.json(
      {
        transactions: transformedTransactions,
        total: transformedTransactions.length,
        page: offset > 0 ? Math.floor(offset / limit) + 1 : 1,
        limit,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in GET /api/transactions:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'An error occurred while retrieving transactions.',
      },
      { status: 500 }
    )
  }
}

