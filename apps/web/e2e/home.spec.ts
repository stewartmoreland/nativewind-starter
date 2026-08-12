import { expect, test } from '@playwright/test';

import { POSTS } from './fixtures/users';

// No storageState: this file describes what an anonymous visitor sees.
test.describe('landing page (anonymous)', () => {
  test('renders the hero and points at sign in', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: 'Supabase · Expo · Next.js' }),
    ).toBeVisible();

    const cta = page.getByRole('link', { name: 'Sign in' });
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL('/login');
  });

  test('lists published posts and no drafts', async ({ page }) => {
    await page.goto('/');

    const posts = page.getByRole('heading', { name: 'Published posts' });
    await expect(posts).toBeVisible();

    await expect(page.getByText(POSTS.adaPublished)).toBeVisible();
    await expect(page.getByText(POSTS.alanPublished)).toBeVisible();

    // RLS, not the component, is what hides this row.
    await expect(page.getByText(POSTS.adaDraft)).toHaveCount(0);
  });
});
