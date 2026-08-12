import { expect, test } from '@playwright/test';

import { ADA } from './fixtures/users';

// proxy.ts builds this with searchParams.set(), which percent-encodes the slash.
const LOGIN_REDIRECT = '/login?next=%2Fprotected';

// No storageState: each test drives the session itself.
test.describe('auth (anonymous)', () => {
  test('/protected redirects to /login with a next param', async ({ page }) => {
    await page.goto('/protected');

    // The proxy.ts gate, before the page's own getClaims() re-check.
    await expect(page).toHaveURL(LOGIN_REDIRECT);
  });

  test('signs in and lands on the protected page', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#signin-email').fill(ADA.email);
    await page.locator('#signin-password').fill(ADA.password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    await expect(page).toHaveURL('/protected');
    await expect(page.getByText(`Signed in as ${ADA.email}`)).toBeVisible();
  });

  test('returns to the requested page after signing in', async ({ page }) => {
    await page.goto('/protected');
    await expect(page).toHaveURL(LOGIN_REDIRECT);

    await page.locator('#signin-email').fill(ADA.email);
    await page.locator('#signin-password').fill(ADA.password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    await expect(page).toHaveURL('/protected');
  });

  test('shows an error for a wrong password', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#signin-email').fill(ADA.email);
    await page.locator('#signin-password').fill('not-the-password');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('rejects a password under 8 characters before hitting Supabase', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.locator('#signin-email').fill(ADA.email);
    // Deliberate: supabase/config.toml sets minimum_password_length = 6, so
    // this bound is enforced by the server action, not by the database.
    await page.locator('#signin-password').fill('short');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    await expect(
      page.getByRole('alert').filter({
        hasText: 'Password must be at least 8 characters.',
      }),
    ).toBeVisible();
  });

  test('signs out and loses access to the protected page', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#signin-email').fill(ADA.email);
    await page.locator('#signin-password').fill(ADA.password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page).toHaveURL('/protected');

    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL('/login');

    await page.goto('/protected');
    await expect(page).toHaveURL(LOGIN_REDIRECT);
  });
});
