import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_SERVICE_KEY) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_KEY in .env')
}

// Service client — full access, only for backend
export const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
)

// Anon client — for auth operations
export const supabaseAnon = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)
