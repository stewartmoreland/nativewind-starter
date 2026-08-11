import { cookies } from 'next/headers';

import { createServerSupabase } from '@repo/supabase/server';

/**
 * Per-request server client. Never hoist the result to module scope: serverless
 * instances are reused across concurrent requests, so a shared client leaks one
 * user's session into another's.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerSupabase({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component, where cookies are read-only. The
          // proxy refreshes the session, so this is safe to swallow.
        }
      },
    },
  });
}
