import { createClient } from '@supabase/supabase-js'

// Ensure this module is only used on the server-side
if (typeof window !== 'undefined') {
  throw new Error(
    'supabase-server.ts cannot be imported in client-side code. ' +
    'Use supabase.ts for client-side operations instead.'
  )
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase server environment variables')
}

/**
 * Server-side Supabase client with service role key.
 * This client bypasses Row Level Security (RLS) and should ONLY be used in server-side code.
 * NEVER expose this client to the client-side.
 * 
 * SECURITY WARNING: This file includes a runtime check to prevent client-side usage.
 * The service role key grants full database access and must remain server-side only.
 */
export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

