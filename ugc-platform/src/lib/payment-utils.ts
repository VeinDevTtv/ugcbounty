import { supabaseServer } from './supabase-server'
import type { Database } from '@/types/database.types'

type Transaction = Database['public']['Tables']['transactions']['Row']
type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
type TransactionUpdate = Database['public']['Tables']['transactions']['Update']

type Payout = Database['public']['Tables']['payouts']['Row']
type PayoutInsert = Database['public']['Tables']['payouts']['Insert']

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

/**
 * Add funds to a user's wallet balance
 * @param userId User ID
 * @param amount Amount to add (in dollars)
 * @returns Updated wallet balance
 */
export async function addFundsToWallet(
  userId: string,
  amount: number
): Promise<{ data: number | null; error: Error | null }> {
  try {
    // Get current balance
    const { data: profile, error: profileError } = await supabaseServer
      .from('user_profiles')
      .select('wallet_balance')
      .eq('user_id', userId)
      .single()

    if (profileError) throw profileError
    if (!profile) {
      throw new Error('User profile not found')
    }

    const currentBalance = profile.wallet_balance || 0
    const newBalance = currentBalance + amount

    // Update wallet balance
    const { error: updateError } = await supabaseServer
      .from('user_profiles')
      .update({ wallet_balance: newBalance } as UserProfileUpdate)
      .eq('user_id', userId)

    if (updateError) throw updateError

    return { data: newBalance, error: null }
  } catch (error) {
    console.error('Error adding funds to wallet:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Deduct funds from a user's wallet balance
 * @param userId User ID
 * @param amount Amount to deduct (in dollars)
 * @returns Updated wallet balance or error if insufficient funds
 */
export async function deductFromWallet(
  userId: string,
  amount: number
): Promise<{ data: number | null; error: Error | null }> {
  try {
    // Get current balance
    const { data: profile, error: profileError } = await supabaseServer
      .from('user_profiles')
      .select('wallet_balance')
      .eq('user_id', userId)
      .single()

    if (profileError) throw profileError
    if (!profile) {
      throw new Error('User profile not found')
    }

    const currentBalance = profile.wallet_balance || 0

    if (currentBalance < amount) {
      throw new Error('Insufficient funds')
    }

    const newBalance = currentBalance - amount

    // Update wallet balance
    const { error: updateError } = await supabaseServer
      .from('user_profiles')
      .update({ wallet_balance: newBalance } as UserProfileUpdate)
      .eq('user_id', userId)

    if (updateError) throw updateError

    return { data: newBalance, error: null }
  } catch (error) {
    console.error('Error deducting from wallet:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Get current wallet balance for a user
 * @param userId User ID
 * @returns Current wallet balance
 */
export async function getWalletBalance(
  userId: string
): Promise<{ data: number | null; error: Error | null }> {
  try {
    const { data: profile, error } = await supabaseServer
      .from('user_profiles')
      .select('wallet_balance')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    if (!profile) {
      throw new Error('User profile not found')
    }

    return { data: profile.wallet_balance || 0, error: null }
  } catch (error) {
    console.error('Error getting wallet balance:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Check if user has sufficient wallet balance
 * @param userId User ID
 * @param requiredAmount Required amount (in dollars)
 * @returns true if sufficient funds, false otherwise
 */
export async function checkWalletBalance(
  userId: string,
  requiredAmount: number
): Promise<{ data: boolean | null; error: Error | null }> {
  try {
    const { data: balance, error } = await getWalletBalance(userId)

    if (error) throw error
    if (balance === null) {
      throw new Error('Could not retrieve wallet balance')
    }

    return { data: balance >= requiredAmount, error: null }
  } catch (error) {
    console.error('Error checking wallet balance:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Create a transaction record
 * @param transactionData Transaction data
 * @returns Created transaction
 */
export async function createTransaction(
  transactionData: TransactionInsert
): Promise<{ data: Transaction | null; error: Error | null }> {
  try {
    const { data: transaction, error } = await supabaseServer
      .from('transactions')
      .insert(transactionData)
      .select()
      .single()

    if (error) throw error
    return { data: transaction, error: null }
  } catch (error) {
    console.error('Error creating transaction:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Update transaction status
 * @param transactionId Transaction ID
 * @param status New status
 * @param additionalData Additional data to update (e.g., stripe_payment_intent_id)
 * @returns Updated transaction
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: TransactionUpdate['status'],
  additionalData?: Partial<TransactionUpdate>
): Promise<{ data: Transaction | null; error: Error | null }> {
  try {
    const updateData: TransactionUpdate = {
      status,
      ...additionalData,
    }

    const { data: transaction, error } = await supabaseServer
      .from('transactions')
      .update(updateData)
      .eq('id', transactionId)
      .select()
      .single()

    if (error) throw error
    return { data: transaction, error: null }
  } catch (error) {
    console.error('Error updating transaction status:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Get transaction by Stripe payment intent ID
 * @param paymentIntentId Stripe payment intent ID
 * @returns Transaction or null
 */
export async function getTransactionByPaymentIntentId(
  paymentIntentId: string
): Promise<{ data: Transaction | null; error: Error | null }> {
  try {
    const { data: transaction, error } = await supabaseServer
      .from('transactions')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single()

    if (error) {
      // Not found is not necessarily an error
      if (error.code === 'PGRST116') {
        return { data: null, error: null }
      }
      throw error
    }

    return { data: transaction, error: null }
  } catch (error) {
    console.error('Error getting transaction by payment intent ID:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Get transactions for a user
 * @param userId User ID
 * @param limit Optional limit (default: 50)
 * @param offset Optional offset for pagination
 * @returns Array of transactions
 */
export async function getUserTransactions(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ data: Transaction[] | null; error: Error | null }> {
  try {
    const { data: transactions, error } = await supabaseServer
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { data: transactions || [], error: null }
  } catch (error) {
    console.error('Error getting user transactions:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Create a payout record
 * @param payoutData Payout data
 * @returns Created payout
 */
export async function createPayout(
  payoutData: PayoutInsert
): Promise<{ data: Payout | null; error: Error | null }> {
  try {
    const { data: payout, error } = await supabaseServer
      .from('payouts')
      .insert(payoutData)
      .select()
      .single()

    if (error) throw error
    return { data: payout, error: null }
  } catch (error) {
    console.error('Error creating payout:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Get payouts for a user
 * @param userId User ID
 * @param limit Optional limit (default: 50)
 * @param offset Optional offset for pagination
 * @returns Array of payouts
 */
export async function getUserPayouts(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ data: Payout[] | null; error: Error | null }> {
  try {
    const { data: payouts, error } = await supabaseServer
      .from('payouts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { data: payouts || [], error: null }
  } catch (error) {
    console.error('Error getting user payouts:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Update payout status
 * @param payoutId Payout ID
 * @param status New status
 * @param stripeTransferId Optional Stripe transfer ID
 * @returns Updated payout
 */
export async function updatePayoutStatus(
  payoutId: string,
  status: Payout['status'],
  stripeTransferId?: string | null
): Promise<{ data: Payout | null; error: Error | null }> {
  try {
    const updateData: Partial<Database['public']['Tables']['payouts']['Update']> = {
      status,
    }

    if (stripeTransferId !== undefined) {
      updateData.stripe_transfer_id = stripeTransferId
    }

    const { data: payout, error } = await supabaseServer
      .from('payouts')
      .update(updateData)
      .eq('id', payoutId)
      .select()
      .single()

    if (error) throw error
    return { data: payout, error: null }
  } catch (error) {
    console.error('Error updating payout status:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Deduct amount when creating a bounty (charge wallet)
 * @param userId User ID (business)
 * @param bountyAmount Bounty amount to deduct
 * @returns Updated wallet balance
 */
export async function deductBountyAmount(
  userId: string,
  bountyAmount: number
): Promise<{ data: number | null; error: Error | null }> {
  return deductFromWallet(userId, bountyAmount)
}

