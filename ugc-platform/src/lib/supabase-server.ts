import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Ensure this module is only used on the server-side
if (typeof window !== 'undefined') {
  throw new Error(
    'supabase-server.ts cannot be imported in client-side code. ' +
    'Use supabase.ts for client-side operations instead.'
  )
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Lazy initialization to avoid build-time errors
let _supabaseServer: ReturnType<typeof createClient<Database>> | null = null

function getSupabaseServer() {
  // Only validate and create client at runtime, not during build
  if (typeof window !== 'undefined') {
    throw new Error('supabase-server.ts cannot be used in client-side code')
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  if (!supabaseServiceRoleKey) {
    throw new Error('Missing Supabase server environment variables')
  }

  if (!_supabaseServer) {
    _supabaseServer = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }

  return _supabaseServer
}

/**
 * Server-side Supabase client with service role key.
 * This client bypasses Row Level Security (RLS) and should ONLY be used in server-side code.
 * NEVER expose this client to the client-side.
 * 
 * SECURITY WARNING: This file includes a runtime check to prevent client-side usage.
 * The service role key grants full database access and must remain server-side only.
 * 
 * Note: Client is created lazily to avoid build-time errors when env vars are not available.
 */
export const supabaseServer = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_target, prop) {
    const client = getSupabaseServer()
    const value = (client as any)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  }
})

/**
 * Create a server-side Supabase client with Clerk session token.
 * Use this in server actions and API routes that need authenticated Supabase access.
 * 
 * @param clerkToken Clerk session token (from auth().getToken())
 * @returns Supabase client configured with Clerk token
 * 
 * @example
 * ```ts
 * import { auth } from '@clerk/nextjs/server'
 * import { createSupabaseServerClientWithClerk } from '@/lib/supabase-server'
 * 
 * export async function myServerAction() {
 *   const { getToken } = await auth()
 *   const token = await getToken()
 *   const supabase = createSupabaseServerClientWithClerk(token)
 *   // Use supabase client...
 * }
 * ```
 */
export function createSupabaseServerClientWithClerk(clerkToken: string | null) {
  // Validate at runtime
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: clerkToken
        ? {
            Authorization: `Bearer ${clerkToken}`,
          }
        : {},
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

