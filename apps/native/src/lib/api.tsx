import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink, loggerLink } from '@trpc/client';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import { useState, type ReactNode } from 'react';

import type { AppRouter } from '@repo/api/types';

import { getBaseUrl } from './base-url';
import { supabase } from './supabase';

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();

export function TRPCReactProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        loggerLink({
          enabled: (opts) =>
            __DEV__ || (opts.direction === 'down' && opts.result instanceof Error),
        }),
        // httpBatchLink, never httpBatchStreamLink: React Native has no
        // TextDecoderStream, and streaming links cannot set response headers.
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          /**
           * Called per batch and awaited. getSession() is the correct call
           * here — this is the one place in the repo it belongs, because we
           * need the raw access token, and the AppState auto-refresh wiring
           * means it returns a fresh one without a network round trip.
           * Never cache the token in a module variable.
           */
          async headers() {
            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;
            return {
              'x-trpc-source': 'expo',
              ...(token ? { authorization: `Bearer ${token}` } : {}),
            };
          },
        }),
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
