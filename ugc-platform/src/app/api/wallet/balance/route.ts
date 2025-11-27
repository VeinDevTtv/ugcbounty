import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getWalletBalance } from '@/lib/payment-utils'
import type { WalletBalanceResponse } from '@/types/stripe.types'

/**
 * GET /api/wallet/balance
 * Get current wallet balance for authenticated business user
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<WalletBalanceResponse | { error: string }>> {
  try {
    // Authenticate user
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to view wallet balance.' },
        { status: 401 }
      )
    }

    // Get wallet balance
    const { data: balance, error } = await getWalletBalance(userId)

    if (error) {
      console.error('Error getting wallet balance:', error)
      return NextResponse.json(
        {
          error: error.message || 'Failed to retrieve wallet balance.',
        },
        { status: 500 }
      )
    }

    if (balance === null) {
      return NextResponse.json(
        {
          error: 'Wallet balance not found.',
        },
        { status: 404 }
      )
    }

    // Format balance for response
    const formattedBalance = balance.toFixed(2)

    return NextResponse.json(
      {
        balance,
        currency: 'USD',
        formatted_balance: `$${formattedBalance}`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in GET /api/wallet/balance:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'An error occurred while retrieving wallet balance.',
      },
      { status: 500 }
    )
  }
}

