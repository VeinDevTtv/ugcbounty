import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { requireRole } from '@/lib/role-utils'
import { supabaseServer } from '@/lib/supabase-server'
import {
  createPayout,
  createTransaction,
} from '@/lib/payment-utils'
import type {
  CreatePayoutRequest,
  CreatePayoutResponse,
} from '@/types/stripe.types'

const MIN_PAYOUT_AMOUNT = 10.0 // Minimum $10 payout

/**
 * POST /api/payouts/create
 * Create a payout request for creators
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<CreatePayoutResponse>> {
  try {
    // Authenticate user
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized. Please sign in to request a payout.',
        },
        { status: 401 }
      )
    }

    // Check if user is a creator (only creators can request payouts)
    const isCreator = await requireRole('creator', userId)
    if (!isCreator) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Forbidden. Only creators can request payouts. Businesses add funds to their wallet.',
        },
        { status: 403 }
      )
    }

    // Parse request body
    const body: CreatePayoutRequest = await request.json()
    const { amount, payout_method = 'stripe' } = body

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid amount. Amount must be a positive number.',
        },
        { status: 400 }
      )
    }

    if (amount < MIN_PAYOUT_AMOUNT) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum payout amount is $${MIN_PAYOUT_AMOUNT.toFixed(2)}.`,
        },
        { status: 400 }
      )
    }

    // Get user profile to check available earnings
    const { data: profile, error: profileError } = await supabaseServer
      .from('user_profiles')
      .select('total_earnings')
      .eq('user_id', userId)
      .single()

    if (profileError || !profile) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to retrieve user profile.',
        },
        { status: 500 }
      )
    }

    const availableEarnings = profile.total_earnings || 0

    // Check if user has sufficient earnings
    if (availableEarnings < amount) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient earnings. Available: $${availableEarnings.toFixed(
            2
          )}, Requested: $${amount.toFixed(2)}.`,
        },
        { status: 400 }
      )
    }

    // Create payout record
    const { data: payout, error: payoutError } = await createPayout({
      user_id: userId,
      amount: amount,
      status: 'pending',
      payout_method: payout_method as 'stripe' | 'bank',
    })

    if (payoutError || !payout) {
      console.error('Error creating payout:', payoutError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create payout request.',
        },
        { status: 500 }
      )
    }

    // Deduct from total_earnings
    const newTotalEarnings = availableEarnings - amount

    const { error: updateError } = await supabaseServer
      .from('user_profiles')
      .update({ total_earnings: newTotalEarnings })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error updating user earnings:', updateError)
      // Try to delete the payout record if we can't update earnings
      await supabaseServer.from('payouts').delete().eq('id', payout.id)

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to process payout. Please try again.',
        },
        { status: 500 }
      )
    }

    // Create transaction record for the payout
    await createTransaction({
      user_id: userId,
      type: 'payout',
      amount: amount,
      status: 'pending',
      metadata: {
        payout_id: payout.id,
        payout_method: payout_method,
      },
    })

    return NextResponse.json(
      {
        success: true,
        payout_id: payout.id,
        amount: amount,
        status: payout.status,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating payout:', error)

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'An error occurred while creating payout request.',
      },
      { status: 500 }
    )
  }
}

