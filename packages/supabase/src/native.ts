import { createClient } from '@supabase/supabase-js';

import type { Database } from './types';

/**
 * React Native / Expo client.
 *
 * `storage` is injected rather than imported so this package carries no
 * react-native dependency. Expo also does not inline EXPO_PUBLIC_* inside
 * node_modules, so url/key must be read in the app and passed in.
 */
export function createNativeSupabase(opts: {
  url: string;
  key: string;
  /** AsyncStorage on device; omit on web so the default is used. */
  storage?: unknown;
  isWeb?: boolean;
}) {
  return createClient<Database>(opts.url, opts.key, {
    auth: {
      ...(opts.storage ? { storage: opts.storage as never } : {}),
      autoRefreshToken: true,
      persistSession: true,
      // There is no window.location on native, so URL detection can never
      // fire; the auth callback arrives as an OS deep link instead.
      detectSessionInUrl: Boolean(opts.isWeb),
      // MANDATORY. Under the implicit flow, any app on the device can open
      // yourscheme://?access_token=...&refresh_token=... and silently sign the
      // victim into an attacker-controlled account. With PKCE an injected code
      // is useless without the locally stored verifier.
      flowType: 'pkce',
      // Do NOT pass `lock: processLock` — deprecated in auth-js 2.112 and
      // removed in v3. The client is lockless by default. Published
      // quickstarts showing it are stale.
    },
  });
}
