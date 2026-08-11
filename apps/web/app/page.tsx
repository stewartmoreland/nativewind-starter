import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import { getQueryClient, trpc } from '@/trpc/server';

export const dynamic = 'force-dynamic';

const STACK = [
  ['Next.js 16', 'App Router, Server Components, proxy.ts session refresh'],
  ['Expo SDK 57', 'expo-router, NativeWind v5, shared design tokens'],
  ['tRPC v11', 'One router in packages/api, consumed by web and native'],
  ['Supabase', 'Postgres + auth, RLS on every table, declarative schemas'],
] as const;

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);

  const queryClient = getQueryClient();
  const posts = await queryClient.fetchQuery(trpc.posts.list.queryOptions({}));

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-10 p-6">
      <header className="flex flex-col gap-3 pt-10">
        <h1 className="text-4xl font-semibold tracking-tight">
          Supabase · Expo · Next.js
        </h1>
        <p className="text-fg-muted">
          A Turborepo template where auth, the database and a type-safe API
          already work on web and native.
        </p>
        <div className="flex gap-3">
          <Link
            href={signedIn ? '/protected' : '/login'}
            className="h-11 rounded-md bg-brand px-5 leading-[2.75rem] font-semibold text-brand-fg"
          >
            {signedIn ? 'Go to your account' : 'Sign in'}
          </Link>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        {STACK.map(([name, detail]) => (
          <div key={name} className="rounded-lg border border-border bg-surface p-4">
            <h2 className="font-semibold">{name}</h2>
            <p className="mt-1 text-sm text-fg-muted">{detail}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Published posts</h2>
        <p className="text-sm text-fg-muted">
          Public tRPC query, prefetched on the server. Anonymous users see only
          published rows — enforced by RLS, not by this component.
        </p>
        {posts.length === 0 ? (
          <p className="rounded-md border border-border bg-surface p-4 text-fg-muted">
            Nothing published yet. Run <code className="font-mono">yarn db:seed-auth</code>.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {posts.map((post) => (
              <li key={post.id} className="rounded-md border border-border bg-surface p-4">
                <p className="font-medium">{post.title}</p>
                {post.body ? (
                  <p className="mt-1 text-sm text-fg-muted">{post.body}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
