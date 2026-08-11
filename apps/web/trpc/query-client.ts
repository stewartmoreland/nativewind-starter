import { QueryClient, defaultShouldDehydrateQuery } from '@tanstack/react-query';

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Long enough that a client immediately refetching after SSR is a
        // cache hit rather than a duplicate request.
        staleTime: 30 * 1000,
      },
      dehydrate: {
        // Also ship still-pending queries, so streamed RSC prefetches hydrate.
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
    },
  });
}
