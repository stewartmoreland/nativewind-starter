import { execFileSync } from 'node:child_process';
import path from 'node:path';

/**
 * Derives the local Supabase connection details for the app under test.
 *
 * This runs at config-module load time, NOT in globalSetup: Playwright spawns
 * `webServer` before globalSetup, so env resolved there would arrive after
 * Next.js had already booted without NEXT_PUBLIC_SUPABASE_URL.
 *
 * Same `supabase status -o env` parse as scripts/seed-auth.mjs.
 */

const REPO_ROOT = path.resolve(import.meta.dirname, '../../..');

const NOT_RUNNING =
  'Local Supabase is not running. Run `yarn db:start` (and `yarn db:reset`) first.';

function readStatus(): Record<string, string> {
  let out: string;
  try {
    out = execFileSync('yarn', ['supabase', 'status', '-o', 'env'], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    throw new Error(NOT_RUNNING);
  }

  const entries: Record<string, string> = {};
  for (const line of out.split('\n')) {
    const match = line.match(/^([A-Z_]+)="(.*)"$/);
    if (match) entries[match[1]!] = match[2]!;
  }
  return entries;
}

export type SupabaseEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
};

export function readSupabaseEnv(): SupabaseEnv {
  const status = readStatus();

  const url = status.API_URL;
  // The CLI renamed ANON_KEY -> PUBLISHABLE_KEY alongside the sb_publishable_*
  // format; accept either so this does not break on a CLI bump.
  const key = status.PUBLISHABLE_KEY ?? status.ANON_KEY;

  if (!url || !key) throw new Error(NOT_RUNNING);

  // Same hard guard as scripts/seed-auth.mjs. These tests assert what RLS
  // permits; pointing them at a hosted project would mutate real data.
  if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:|\/|$)/.test(url)) {
    throw new Error(`Refusing to run e2e tests against a non-local URL: ${url}`);
  }

  // SECRET_KEY is deliberately not read here. It holds BYPASSRLS, and a suite
  // that proves RLS works must never be handed a key that bypasses it.
  return {
    NEXT_PUBLIC_SUPABASE_URL: url,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key,
  };
}
