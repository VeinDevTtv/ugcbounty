import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Client-side Supabase client with anonymous key.
 * This client respects Row Level Security (RLS) policies.
 * Use this for client-side operations.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
