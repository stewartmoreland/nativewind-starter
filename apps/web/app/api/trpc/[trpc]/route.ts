import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { cookies } from 'next/headers';

import { appRouter, createTRPCContext } from '@repo/api';

/**
 * CSRF: Route Handlers have no built-in protection (Server Actions do) and this
 * route authenticates by cookie, so a cross-site POST would carry the user's
 * session. React Native's fetch sends no Origin, so an absent Origin is allowed.
 *
 * Never add Access-Control-Allow-Origin here — the native app is not subject to
 * CORS and does not need one; adding it would turn this check into a real leak.
 */
const ALLOWED_ORIGINS = new Set(
  [
    process.env.NEXT_PUBLIC_SITE_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ].filter(Boolean) as string[],
);

function isCrossSite(req: Request) {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  return !ALLOWED_ORIGINS.has(origin);
}

async function handler(req: Request) {
  if (isCrossSite(req)) {
    return new Response('Forbidden', { status: 403 });
  }

  const cookieStore = await cookies();

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () =>
      createTRPCContext({
        headers: req.headers,
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // no-op
            }
          },
        },
      }),
    onError({ error, path, type }) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`tRPC failed on ${type} ${path ?? '<no-path>'}:`, error);
      }
    },
  });
}

export { handler as GET, handler as POST };
