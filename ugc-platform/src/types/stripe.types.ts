/**
 * Stripe payment-related types and interfaces
 */

export type TransactionType = 'deposit' | 'withdrawal' | 'payout' | 'bounty_charge'

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type PayoutMethod = 'stripe' | 'bank'

/**
 * Transaction record from database
 */
export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  status: TransactionStatus
  stripe_payment_intent_id: string | null
  stripe_transfer_id: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

/**
 * Payout record from database
 */
export interface Payout {
  id: string
  user_id: string
  amount: number
  status: PayoutStatus
  stripe_transfer_id: string | null
  payout_method: PayoutMethod | null
  created_at: string
  updated_at: string
}

/**
 * Request body for creating a payment intent
 */
export interface CreatePaymentIntentRequest {
  amount: number // Amount in dollars (will be converted to cents)
  currency?: string // Default: 'usd'
}

/**
 * Response from payment intent creation API
 */
export type CreatePaymentIntentResponse =
  | {
      success: true
      client_secret: string
      payment_intent_id: string
      transaction_id: string
    }
  | {
      success: false
      error: string
    }

/**
 * Request body for creating a payout
 */
export interface CreatePayoutRequest {
  amount: number // Amount in dollars
  payout_method: PayoutMethod
}

/**
 * Response from payout creation API
 */
export type CreatePayoutResponse =
  | {
      success: true
      payout_id: string
      amount: number
      status: PayoutStatus
    }
  | {
      success: false
      error: string
    }

/**
 * Wallet balance response
 */
export interface WalletBalanceResponse {
  balance: number
  currency: string
  formatted_balance: string
}

/**
 * Transaction list response
 */
export interface TransactionsResponse {
  transactions: Transaction[]
  total: number
  page?: number
  limit?: number
}

/**
 * Payout list response
 */
export interface PayoutsResponse {
  payouts: Payout[]
  total: number
  page?: number
  limit?: number
}

/**
 * Stripe webhook event metadata
 */
export interface StripeWebhookEventMetadata {
  userId?: string
  transactionId?: string
  payoutId?: string
  [key: string]: any
}

