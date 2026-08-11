import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Routes that require a session. Deliberately an allow-list of PROTECTED
 * paths rather than deny-by-default: a template needs a public landing page,
 * and deny-by-default silently redirects every new marketing/docs route to
 * /login until someone remembers to add it here.
 *
 * This is defence in depth, not the only gate. Every protected page re-checks
 * with getClaims(), and RLS is the real boundary — a matcher change or a
 * Server Function moved to another route can silently drop proxy coverage.
 */
const PROTECTED_PREFIXES = ['/protected'];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        // TWO parameters. `headers` carries Cache-Control/Expires/Pragma; a
        // one-arg setAll compiles fine but drops them, which lets a CDN serve
        // one user's Set-Cookie to another.
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          if (headers) {
            Object.entries(headers).forEach(([key, value]) =>
              supabaseResponse.headers.set(key, value),
            );
          }
        },
      },
    },
  );

  // Do not put code between createServerClient and getClaims(). getClaims()
  // verifies the JWT signature and performs the refresh; removing it means
  // tokens are never refreshed and users are logged out roughly hourly.
  // Never getSession() here — it is not revalidated.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  const { pathname } = request.nextUrl;
  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (!claims && needsAuth) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Return supabaseResponse as-is. Building a different response without
  // copying every cookie across desynchronises browser and server and
  // terminates the session early.
  return supabaseResponse;
}
