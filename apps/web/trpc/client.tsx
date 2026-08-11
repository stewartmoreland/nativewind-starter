'use client';

import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import { useState, type ReactNode } from 'react';

import type { AppRouter } from '@repo/api/types';

import { makeQueryClient } from './query-client';

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  // Server: always a fresh client, so requests never share cache.
  if (typeof window === 'undefined') return makeQueryClient();
  // Browser: one singleton, or React would discard state on suspense.
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

function getUrl() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  return `${base}/api/trpc`;
}

export function TRPCReactProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        // httpBatchLink, not httpBatchStreamLink: streaming links cannot set
        // response headers, which Supabase's cookie refresh needs.
        httpBatchLink({ url: getUrl() }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
