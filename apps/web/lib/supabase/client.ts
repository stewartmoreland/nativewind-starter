import { createBrowserSupabase } from '@repo/supabase/browser';

export function createClient() {
  return createBrowserSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
