import { createServerClient } from '@supabase/ssr';

import type { Database } from './types';

export type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

/**
 * The cookie bridge. `setAll` takes TWO parameters: the cookies to write, and
 * response headers (Cache-Control / Expires / Pragma) that @supabase/ssr needs
 * set alongside them. A one-argument setAll still COMPILES but silently drops
 * those headers, which lets a CDN serve one user's Set-Cookie to another.
 */
export type CookieAdapter = {
  getAll(): { name: string; value: string }[];
  setAll(cookiesToSet: CookieToSet[], headers?: Record<string, string>): void;
};

const NOOP_COOKIES: CookieAdapter = {
  getAll: () => [],
  setAll: () => {},
};

/**
 * Server client for Route Handlers, Server Components, the proxy, and tRPC.
 *
 * Never hoist the result to module scope. Serverless instances are reused
 * across concurrent requests, so a shared client leaks one user's session into
 * another's request. Always construct it per request.
 */
export function createServerSupabase(opts: {
  url: string;
  key: string;
  cookies?: CookieAdapter;
  /** Bearer token path, used by the native app (no cookies). */
  accessToken?: string;
}) {
  return createServerClient<Database>(opts.url, opts.key, {
    cookies: opts.cookies ?? NOOP_COOKIES,
    global: opts.accessToken
      ? { headers: { Authorization: `Bearer ${opts.accessToken}` } }
      : undefined,
  });
}
