import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { supabaseServer } from '@/lib/supabase-server'
import type { Database } from '@/types/database.types'

type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']

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
    // Get the webhook secret from environment variables
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET is not set')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

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
    const wh = new Webhook(webhookSecret)

    let evt: any

    try {
      evt = wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as any
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
      const username = user.username || null

      if (!userId) {
        console.error('No user ID in webhook payload')
        return NextResponse.json(
          { error: 'Missing user ID in webhook payload' },
          { status: 400 }
        )
      }

      // Create or update user profile in Supabase using upsert
      // This ensures idempotency if the webhook is called multiple times
      const { data: profile, error: upsertError } = await supabaseServer
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
      const username = user.username || null

      if (!userId) {
        return NextResponse.json(
          { error: 'Missing user ID in webhook payload' },
          { status: 400 }
        )
      }

      // Update user profile in Supabase
      const { data: profile, error: updateError } = await supabaseServer
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
