#!/usr/bin/env node
/**
 * Seeds demo users + posts against the LOCAL Supabase stack.
 *
 * Users are created through the Auth Admin API, never by inserting into
 * auth.users directly. Hand-written INSERTs with crypt()/gen_salt() depend on
 * pgcrypto being on the search path, break whenever GoTrue adds a column, and
 * create a confirmed account with a known password — which is a live
 * credential the moment someone runs `supabase db push --include-seed`.
 *
 * Run: yarn db:seed-auth
 */
import { createClient } from '@supabase/supabase-js';
import { execFileSync } from 'node:child_process';

function readStatus() {
  const out = execFileSync('yarn', ['supabase', 'status', '-o', 'env'], {
    encoding: 'utf8',
  });
  const get = (key) => out.match(new RegExp(`^${key}="(.*)"$`, 'm'))?.[1];
  return { url: get('API_URL'), secret: get('SECRET_KEY') };
}

const { url, secret } = readStatus();

if (!url || !secret) {
  console.error('Could not read local Supabase status. Is `yarn db:start` running?');
  process.exit(1);
}

// HARD GUARD. This script uses the secret key, which has BYPASSRLS. It must
// never be pointed at a hosted project.
if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:|\/|$)/.test(url)) {
  console.error(`Refusing to seed a non-local URL: ${url}`);
  process.exit(1);
}

const admin = createClient(url, secret, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_USERS = [
  { email: 'ada@example.com', password: 'password123', username: 'ada', full_name: 'Ada Lovelace' },
  { email: 'alan@example.com', password: 'password123', username: 'alan', full_name: 'Alan Turing' },
];

const DEMO_POSTS = {
  'ada@example.com': [
    { title: 'Notes on the Analytical Engine', body: 'A published post, visible to everyone.', published: true },
    { title: 'Draft: on operations', body: 'Only Ada can read this.', published: false },
  ],
  'alan@example.com': [
    { title: 'On computable numbers', body: 'Another published post.', published: true },
  ],
};

async function upsertUser({ email, password, username, full_name }) {
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username, full_name },
  });

  if (!error) return created.user;

  // Already exists (re-run without a db reset) — look it up instead.
  const { data: list } = await admin.auth.admin.listUsers();
  const existing = list?.users.find((u) => u.email === email);
  if (existing) return existing;

  throw error;
}

for (const spec of DEMO_USERS) {
  const user = await upsertUser(spec);
  console.log(`user  ${spec.email} -> ${user.id}`);

  // The handle_new_user trigger already created the profile row.
  await admin.from('posts').delete().eq('user_id', user.id);

  const rows = DEMO_POSTS[spec.email].map((p) => ({ ...p, user_id: user.id }));
  const { error } = await admin.from('posts').insert(rows);
  if (error) throw error;
  console.log(`  posts ${rows.length}`);
}

console.log('\nSeeded. Sign in with any demo email / password123.');
