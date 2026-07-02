import { createClient } from '@supabase/supabase-js'

// Fallback placeholder values allow the build to succeed without env vars.
// Real values must be set at runtime (Vercel environment variables).
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
