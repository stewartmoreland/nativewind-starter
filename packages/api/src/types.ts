/**
 * Type-only entrypoint for clients (notably apps/native), so importing the
 * router's TYPE never drags @trpc/server or @supabase/ssr into the bundle.
 */
export type { AppRouter } from './root';
