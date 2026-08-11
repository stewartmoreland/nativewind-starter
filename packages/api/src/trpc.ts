import { initTRPC, TRPCError } from '@trpc/server';
import { createServerSupabase, type CookieAdapter } from '@repo/supabase/server';

/**
 * One context factory serves three transports:
 *   - Next.js Route Handler  -> { headers, cookies }
 *   - Next.js Server Caller  -> { headers, cookies }
 *   - Expo (Bearer token)    -> { headers }            (no cookies)
 *
 * This module must NOT import from 'next/headers'. Metro compiles it into the
 * native bundle, where Next internals are unresolvable.
 */
export async function createTRPCContext(opts: {
  headers: Headers;
  cookies?: CookieAdapter;
}) {
  const authHeader = opts.headers.get('authorization');
  const accessToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : undefined;

  const supabase = createServerSupabase({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    cookies: opts.cookies,
    accessToken,
  });

  /**
   * getClaims() verifies the JWT signature. Never getSession() on the server —
   * it reads request-supplied storage and is spoofable.
   *
   * Pass the token explicitly on the Bearer path: a header-only client has no
   * stored session, so a bare getClaims() would find nothing to verify.
   */
  const { data } = accessToken
    ? await supabase.auth.getClaims(accessToken)
    : await supabase.auth.getClaims();

  const claims = data?.claims ?? null;

  return {
    supabase,
    claims,
    userId: (claims?.sub as string | undefined) ?? null,
    headers: opts.headers,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// No transformer. superjson must be configured in three coupled places
// (server, every link, and the QueryClient's de/hydrate hooks); one mismatch
// corrupts data silently across the RSC boundary. Supabase returns JSON-safe
// values, so it buys nothing here.
const t = initTRPC.context<Context>().create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

/**
 * Narrows claims/userId from `T | null` to `T` for every downstream procedure.
 * Re-passing the keys in next({ ctx }) is what performs the narrowing.
 */
export const protectedProcedure = t.procedure.use(async function isAuthed(opts) {
  const { ctx } = opts;
  if (!ctx.claims || !ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return opts.next({
    ctx: { ...ctx, claims: ctx.claims, userId: ctx.userId },
  });
});
