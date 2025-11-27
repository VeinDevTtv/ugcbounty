import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { stripe } from '@/lib/stripe'
import { requireRole } from '@/lib/role-utils'
import {
  createTransaction,
  getWalletBalance,
} from '@/lib/payment-utils'
import type {
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
} from '@/types/stripe.types'

const MIN_AMOUNT = 1.0 // Minimum $1
const MAX_AMOUNT = 10000.0 // Maximum $10,000

/**
 * POST /api/payments/create-intent
 * Create a Stripe PaymentIntent for adding funds to business wallet
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<CreatePaymentIntentResponse>> {
  try {
    // Authenticate user
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized. Please sign in to add funds.',
        },
        { status: 401 }
      )
    }

    // Check if user is a business (only businesses can add funds)
    const isBusiness = await requireRole('business', userId)
    if (!isBusiness) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Forbidden. Only businesses can add funds. Creators earn through bounties.',
        },
        { status: 403 }
      )
    }

    // Parse request body
    const body: CreatePaymentIntentRequest = await request.json()
    const { amount, currency = 'usd' } = body

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

    if (amount < MIN_AMOUNT) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum amount is $${MIN_AMOUNT.toFixed(2)}.`,
        },
        { status: 400 }
      )
    }

    if (amount > MAX_AMOUNT) {
      return NextResponse.json(
        {
          success: false,
          error: `Maximum amount is $${MAX_AMOUNT.toFixed(2)}.`,
        },
        { status: 400 }
      )
    }

    // Convert dollars to cents for Stripe
    const amountInCents = Math.round(amount * 100)

    // Create PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata: {
        userId,
        type: 'wallet_deposit',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    // Create transaction record in database (status: 'pending')
    const { data: transaction, error: transactionError } = await createTransaction({
      user_id: userId,
      type: 'deposit',
      amount: amount,
      status: 'pending',
      stripe_payment_intent_id: paymentIntent.id,
      metadata: {
        currency,
        stripe_payment_intent_id: paymentIntent.id,
      },
    })

    if (transactionError || !transaction) {
      console.error('Error creating transaction record:', transactionError)
      // Cancel the payment intent if we can't create the transaction
      try {
        await stripe.paymentIntents.cancel(paymentIntent.id)
      } catch (cancelError) {
        console.error('Error canceling payment intent:', cancelError)
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create transaction record. Please try again.',
        },
        { status: 500 }
      )
    }

    // Validate that client_secret exists (required for frontend)
    if (!paymentIntent.client_secret) {
      console.error('PaymentIntent created without client_secret:', paymentIntent.id)
      // Cancel the payment intent if client_secret is missing
      try {
        await stripe.paymentIntents.cancel(paymentIntent.id)
      } catch (cancelError) {
        console.error('Error canceling payment intent:', cancelError)
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create payment intent. Please try again.',
        },
        { status: 500 }
      )
    }

    // Return client secret for frontend
    return NextResponse.json(
      {
        success: true,
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        transaction_id: transaction.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating payment intent:', error)

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'An error occurred while creating payment intent. Please try again.',
      },
      { status: 500 }
    )
  }
}

