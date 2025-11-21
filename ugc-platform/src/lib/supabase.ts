import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Lazy initialization to avoid build-time errors
let _supabase: ReturnType<typeof createClient<Database>> | null = null

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  if (!_supabase) {
    _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
  }

  return _supabase
}

/**
 * Client-side Supabase client with anonymous key.
 * This client respects Row Level Security (RLS) policies.
 * Use this for client-side operations.
 * 
 * For Clerk integration, use createSupabaseClientWithClerk() instead
 * to pass Clerk session tokens.
 * 
 * Note: Client is created lazily to avoid build-time errors when env vars are not available.
 */
export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_target, prop) {
    const client = getSupabaseClient()
    const value = (client as any)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  }
})

/**
 * Create a Supabase client with Clerk session token.
 * Use this in client components that need authenticated Supabase access.
 * 
 * @param getToken Function that returns Clerk session token (from useAuth hook)
 * @returns Supabase client configured with Clerk token
 * 
 * @example
 * ```tsx
 * import { useAuth } from '@clerk/nextjs'
 * import { createSupabaseClientWithClerk } from '@/lib/supabase'
 * 
 * function MyComponent() {
 *   const { getToken } = useAuth()
 *   const supabase = createSupabaseClientWithClerk(getToken)
 *   // Use supabase client...
 * }
 * ```
 */
export function createSupabaseClientWithClerk(
  getToken: () => Promise<string | null>
) {
  // Validate at runtime
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (url, options = {}) => {
        const token = await getToken()
        const headers = new Headers(options.headers)
        if (token) {
          headers.set('Authorization', `Bearer ${token}`)
        }
        return fetch(url, {
          ...options,
          headers,
        })
      },
    },
  })
}
