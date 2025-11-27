import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import {
  getTransactionByPaymentIntentId,
  updateTransactionStatus,
  addFundsToWallet,
} from '@/lib/payment-utils'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

if (!webhookSecret) {
  console.warn(
    'STRIPE_WEBHOOK_SECRET is not set. Webhook signature verification will be disabled.'
  )
}

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events for payment processing
 * 
 * Configure webhook in Stripe Dashboard:
 * 1. Go to Developers > Webhooks
 * 2. Add endpoint: https://your-domain.com/api/webhooks/stripe
 * 3. Select events:
 *    - payment_intent.succeeded
 *    - payment_intent.payment_failed
 *    - transfer.created
 * 4. Copy the Signing Secret and set as STRIPE_WEBHOOK_SECRET
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('Missing stripe-signature header')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Only process wallet deposits
        if (paymentIntent.metadata?.type !== 'wallet_deposit') {
          console.log('Skipping payment intent - not a wallet deposit')
          return NextResponse.json({ received: true })
        }

        const userId = paymentIntent.metadata?.userId
        if (!userId) {
          console.error('Payment intent missing userId in metadata')
          return NextResponse.json({ received: true })
        }

        // Find transaction by payment intent ID
        const { data: transaction, error: transactionError } =
          await getTransactionByPaymentIntentId(paymentIntent.id)

        if (transactionError || !transaction) {
          console.error(
            'Transaction not found for payment intent:',
            paymentIntent.id,
            transactionError
          )
          return NextResponse.json({ received: true })
        }

        // If already processed, skip
        if (transaction.status === 'completed') {
          console.log('Transaction already processed:', transaction.id)
          return NextResponse.json({ received: true })
        }

        // Update transaction status to completed
        const { error: updateError } = await updateTransactionStatus(
          transaction.id,
          'completed',
          {
            stripe_payment_intent_id: paymentIntent.id,
          }
        )

        if (updateError) {
          console.error('Error updating transaction status:', updateError)
          return NextResponse.json({ received: true })
        }

        // Add funds to wallet
        const { error: walletError } = await addFundsToWallet(
          userId,
          transaction.amount
        )

        if (walletError) {
          console.error('Error adding funds to wallet:', walletError)
          // Mark transaction as failed if we can't update wallet
          await updateTransactionStatus(transaction.id, 'failed')
          return NextResponse.json({ received: true })
        }

        console.log(
          `Successfully processed payment: ${paymentIntent.id}, added $${transaction.amount} to wallet for user ${userId}`
        )

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Find transaction by payment intent ID
        const { data: transaction } = await getTransactionByPaymentIntentId(
          paymentIntent.id
        )

        if (transaction) {
          // Update transaction status to failed
          await updateTransactionStatus(transaction.id, 'failed', {
            stripe_payment_intent_id: paymentIntent.id,
          })
          console.log(`Payment failed for transaction: ${transaction.id}`)
        }

        break
      }

      case 'transfer.created': {
        // Handle payout transfers if needed in the future
        const transfer = event.data.object as Stripe.Transfer
        console.log('Transfer created:', transfer.id)
        // You can add payout tracking logic here if needed
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing Stripe webhook:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Webhook processing failed',
      },
      { status: 500 }
    )
  }
}

