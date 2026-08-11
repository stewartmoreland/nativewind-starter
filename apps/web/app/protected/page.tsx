import Link from 'next/link';
import { redirect } from 'next/navigation';

import { SignOutButton } from '@/components/sign-out-button';
import { createClient } from '@/lib/supabase/server';
import { getQueryClient, trpc } from '@/trpc/server';

// Reads cookies, so it must never be statically cached.
export const dynamic = 'force-dynamic';

export default async function ProtectedPage() {
  const supabase = await createClient();

  // getClaims() verifies the JWT signature. Never getSession() on the server.
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect('/login?next=/protected');

  // Server-side tRPC call — in-process, no HTTP hop.
  const queryClient = getQueryClient();
  const myPosts = await queryClient.fetchQuery(trpc.posts.mine.queryOptions());

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-8 p-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Protected</h1>
          <p className="text-fg-muted">
            Signed in as {String(data.claims.email ?? data.claims.sub)}
          </p>
        </div>
        <SignOutButton />
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Your posts</h2>
        <p className="text-sm text-fg-muted">
          Fetched through tRPC on the server. RLS scopes these rows to you.
        </p>
        {myPosts.length === 0 ? (
          <p className="rounded-md border border-border bg-surface p-4 text-fg-muted">
            No posts yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {myPosts.map((post) => (
              <li key={post.id} className="rounded-md border border-border bg-surface p-4">
                <p className="font-medium">{post.title}</p>
                <p className="text-sm text-fg-muted">
                  {post.published ? 'Published' : 'Draft'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link className="text-sm text-fg-muted underline underline-offset-4" href="/">
        Back home
      </Link>
    </main>
  );
}
