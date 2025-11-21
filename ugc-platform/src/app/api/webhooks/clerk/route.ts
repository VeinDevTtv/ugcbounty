import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']

/**
 * Create Supabase client for webhook handler.
 * Uses service role key to bypass RLS for webhook operations.
 */
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables. Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

/**
 * Clerk webhook handler for user.created events.
 * Automatically creates user profiles in Supabase when users sign up in Clerk.
 * 
 * POST /api/webhooks/clerk
 * 
 * Required environment variable: CLERK_WEBHOOK_SECRET
 * 
 * To set up:
 * 1. In Clerk Dashboard, go to Webhooks > Add Endpoint
 * 2. Set the endpoint URL to: https://your-domain.com/api/webhooks/clerk
 * 3. Subscribe to the "user.created" event
 * 4. Copy the Signing Secret and set it as CLERK_WEBHOOK_SECRET in your environment
 */
export async function POST(req: NextRequest) {
  try {
    // Check all required environment variables upfront for better error messages
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    const missingEnvVars: string[] = []
    if (!webhookSecret) missingEnvVars.push('CLERK_WEBHOOK_SECRET')
    if (!supabaseUrl) missingEnvVars.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!supabaseServiceKey) missingEnvVars.push('SUPABASE_SERVICE_ROLE_KEY')

    if (missingEnvVars.length > 0) {
      console.error(`Missing environment variables: ${missingEnvVars.join(', ')}`)
      return NextResponse.json(
        { 
          error: 'Missing required environment variables',
          missing: missingEnvVars,
          message: `Please set the following environment variables: ${missingEnvVars.join(', ')}`
        },
        { status: 500 }
      )
    }

    // At this point, TypeScript knows these are defined due to the check above
    // Use non-null assertions since we've already validated them
    const webhookSecretValue = webhookSecret as string

    // Get the headers from the request
    // In Next.js App Router, we can access headers directly from the request
    const svixId = req.headers.get('svix-id')
    const svixTimestamp = req.headers.get('svix-timestamp')
    const svixSignature = req.headers.get('svix-signature')

    // Verify that we have all required headers
    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json(
        { error: 'Missing svix headers' },
        { status: 400 }
      )
    }

    // Get the raw body as text for webhook verification
    const body = await req.text()

    // Verify the webhook signature
    const wh = new Webhook(webhookSecretValue)

    // Define webhook event type based on Clerk's webhook payload structure
    type ClerkWebhookEvent = {
      type: string
      data: {
        id: string
        email_addresses?: Array<{ email_address: string }>
        username?: string | null
      }
    }

    let evt: ClerkWebhookEvent

    try {
      evt = wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ClerkWebhookEvent
    } catch (err) {
      console.error('Error verifying webhook:', err)
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      )
    }

    // Handle the webhook event
    const eventType = evt.type

    if (eventType === 'user.created') {
      const user = evt.data

      // Extract user data from Clerk webhook payload
      const userId = user.id
      const email = user.email_addresses?.[0]?.email_address || null
      // Use Clerk username if available, otherwise generate a default one
      // Default format: user_<first8charsOfUserId> for better UX
      const username = user.username || (userId ? `user_${userId.slice(0, 8)}` : null)

      if (!userId) {
        console.error('No user ID in webhook payload')
        return NextResponse.json(
          { error: 'Missing user ID in webhook payload' },
          { status: 400 }
        )
      }

      // Create Supabase client for webhook operations
      const supabase = getSupabaseClient()

      // Create or update user profile in Supabase using upsert
      // This ensures idempotency if the webhook is called multiple times
      const { data: profile, error: upsertError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          email: email,
          username: username,
          total_earnings: 0,
        } as UserProfileInsert)
        .select()
        .single()

      if (upsertError) {
        console.error('Error creating user profile in Supabase:', upsertError)
        return NextResponse.json(
          { error: 'Failed to create user profile', details: upsertError.message },
          { status: 500 }
        )
      }

      console.log(`User profile created/updated for user ${userId}`)
      return NextResponse.json(
        { success: true, profile },
        { status: 200 }
      )
    }

    // Handle other event types (user.updated, etc.)
    if (eventType === 'user.updated') {
      const user = evt.data
      const userId = user.id
      const email = user.email_addresses?.[0]?.email_address || null
      // Use Clerk username if available, otherwise keep existing or generate default
      const username = user.username || (userId ? `user_${userId.slice(0, 8)}` : null)

      if (!userId) {
        return NextResponse.json(
          { error: 'Missing user ID in webhook payload' },
          { status: 400 }
        )
      }

      // Create Supabase client for webhook operations
      const supabase = getSupabaseClient()

      // Update user profile in Supabase
      const { data: profile, error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          email: email,
          username: username,
        } as UserProfileInsert)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating user profile in Supabase:', updateError)
        return NextResponse.json(
          { error: 'Failed to update user profile', details: updateError.message },
          { status: 500 }
        )
      }

      console.log(`User profile updated for user ${userId}`)
      return NextResponse.json(
        { success: true, profile },
        { status: 200 }
      )
    }

    // For unhandled event types, return success to acknowledge receipt
    console.log(`Unhandled webhook event type: ${eventType}`)
    return NextResponse.json(
      { success: true, message: `Event ${eventType} received but not handled` },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error processing Clerk webhook:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
