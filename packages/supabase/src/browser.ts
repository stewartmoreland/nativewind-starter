import { createBrowserClient } from '@supabase/ssr';

import type { Database } from './types';

/**
 * Browser client for Next.js Client Components.
 *
 * Takes its config as arguments rather than reading process.env, so this
 * package stays free of any framework-specific env inlining behaviour.
 */
export function createBrowserSupabase(url: string, publishableKey: string) {
  return createBrowserClient<Database>(url, publishableKey);
}
