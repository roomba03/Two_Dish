import { createClient } from "@supabase/supabase-js";

// Uses the anon key (not the service role key) so signInWithPassword
// runs as a regular user — correct for validating credentials.
// Add SUPABASE_ANON_KEY to .env.local.
export function createAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_ANON_KEY in .env.local"
    );
  }

  return createClient(url, key, { auth: { persistSession: false } });
}
