import { execFileSync } from 'node:child_process';
import path from 'node:path';

import { expect, test as setup } from '@playwright/test';

import { ADA, ALAN, type DemoUser } from './fixtures/users';

const REPO_ROOT = path.resolve(import.meta.dirname, '../../..');

// Idempotent: upsertUser handles a re-run without a db reset, and each user's
// posts are deleted before being re-inserted.
setup.beforeAll(() => {
  execFileSync('node', ['scripts/seed-auth.mjs'], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
  });
});

/**
 * Signs in through the UI rather than minting a session out of band, so the
 * saved cookies are exactly the ones proxy.ts refreshes and getClaims()
 * verifies. A hand-built session would exercise a path the app never takes.
 */
async function saveSignedInState(
  page: import('@playwright/test').Page,
  user: DemoUser,
) {
  await page.goto('/login');
  // The page has three forms with an 'Email' label; target the sign-in one by id.
  await page.locator('#signin-email').fill(user.email);
  await page.locator('#signin-password').fill(user.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  await expect(page).toHaveURL('/protected');
  await expect(page.getByText(`Signed in as ${user.email}`)).toBeVisible();

  await page.context().storageState({ path: user.storageState });
}

setup('authenticate as ada', async ({ page }) => {
  await saveSignedInState(page, ADA);
});

setup('authenticate as alan', async ({ page }) => {
  await saveSignedInState(page, ALAN);
});
