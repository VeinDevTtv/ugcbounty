import Stripe from 'stripe'

// Ensure this module is only used on the server-side
if (typeof window !== 'undefined') {
  throw new Error(
    'stripe.ts cannot be imported in client-side code. ' +
    'Stripe client must remain server-side only.'
  )
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

// Lazy initialization to avoid build-time errors
let _stripe: Stripe | null = null

function getStripeClient() {
  // Only validate and create client at runtime, not during build
  if (typeof window !== 'undefined') {
    throw new Error('stripe.ts cannot be used in client-side code')
  }

  if (!stripeSecretKey) {
    throw new Error(
      'Missing STRIPE_SECRET_KEY environment variable. ' +
      'Please set it in your .env.local file. ' +
      'Get your key at https://dashboard.stripe.com/apikeys'
    )
  }

  if (!_stripe) {
    _stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover' as Stripe.StripeConfig['apiVersion'],
      typescript: true,
    })
  }

  return _stripe
}

/**
 * Server-side Stripe client.
 * This client should ONLY be used in server-side code (API routes, server components, server actions).
 * NEVER expose this client to the client-side.
 * 
 * SECURITY WARNING: This file includes a runtime check to prevent client-side usage.
 * The Stripe secret key grants full access to your Stripe account and must remain server-side only.
 * 
 * Note: Client is created lazily to avoid build-time errors when env vars are not available.
 * 
 * @example
 * ```ts
 * import { stripe } from '@/lib/stripe'
 * 
 * export async function POST(request: Request) {
 *   const paymentIntent = await stripe.paymentIntents.create({
 *     amount: 1000,
 *     currency: 'usd',
 *   })
 *   // ...
 * }
 * ```
 */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripeClient()
    const value = client[prop as keyof Stripe]
    return typeof value === 'function' ? value.bind(client) : value
  },
})

