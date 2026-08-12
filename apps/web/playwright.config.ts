import { defineConfig, devices } from '@playwright/test';

import { readSupabaseEnv } from './e2e/supabase-env';

const CI = !!process.env.CI;
const BASE_URL = 'http://localhost:3000';

// Resolved here, not in globalSetup: Playwright starts `webServer` first, so
// anything resolved in globalSetup would arrive too late for Next.js.
const supabaseEnv = readSupabaseEnv();

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  // One worker in CI: every spec reads the same seeded database.
  workers: CI ? 1 : undefined,
  reporter: CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Seeds the database and writes e2e/.auth/*.json. Serial: the seed runs in
    // beforeAll and both sign-ins share it.
    { name: 'setup', testMatch: /.*\.setup\.ts/, fullyParallel: false },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],

  webServer: {
    // In CI the app is already built by `turbo run build`, so serve it.
    command: CI ? 'yarn start' : 'yarn dev',
    cwd: import.meta.dirname,
    url: BASE_URL,
    reuseExistingServer: !CI,
    timeout: 120_000,
    env: {
      ...supabaseEnv,
      // Both the auth email-redirect origin and the /api/trpc CSRF allowlist
      // entry. Must match supabase/config.toml's site_url.
      NEXT_PUBLIC_SITE_URL: BASE_URL,
    },
  },
});
