import 'server-only';

import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { headers } from 'next/headers';
import { cache } from 'react';

import { appRouter, createTRPCContext } from '@repo/api';

import { makeQueryClient } from './query-client';

/** One QueryClient per request. */
export const getQueryClient = cache(makeQueryClient);

const createContext = cache(async () => {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return createTRPCContext({
    headers: await headers(),
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {
        // Read-only in RSC; the proxy owns session refresh.
      },
    },
  });
});

/**
 * Server-side caller for prefetching in Server Components. Calls the router
 * in-process — no HTTP hop.
 */
export const trpc = createTRPCOptionsProxy({
  ctx: createContext,
  router: appRouter,
  queryClient: getQueryClient,
});
