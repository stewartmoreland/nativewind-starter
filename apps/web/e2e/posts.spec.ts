import { expect, test } from '@playwright/test';

import { ADA, ALAN, POSTS } from './fixtures/users';

test.describe('as ada', () => {
  test.use({ storageState: ADA.storageState });

  test('sees her own published post and her draft', async ({ page }) => {
    await page.goto('/protected');

    await expect(page.getByText(`Signed in as ${ADA.email}`)).toBeVisible();
    await expect(page.getByText(POSTS.adaPublished)).toBeVisible();

    // posts.mine returns drafts too — only for their owner.
    await expect(page.getByText(POSTS.adaDraft)).toBeVisible();
    await expect(page.getByText('Draft', { exact: true })).toBeVisible();
  });

  test('does not see another user\'s posts', async ({ page }) => {
    await page.goto('/protected');

    await expect(page.getByText(POSTS.alanPublished)).toHaveCount(0);
  });

  test('the landing page offers the account link', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('link', { name: 'Go to your account' }),
    ).toBeVisible();
  });
});

test.describe('as alan', () => {
  test.use({ storageState: ALAN.storageState });

  test('sees only his own post', async ({ page }) => {
    await page.goto('/protected');

    await expect(page.getByText(`Signed in as ${ALAN.email}`)).toBeVisible();
    await expect(page.getByText(POSTS.alanPublished)).toBeVisible();

    // The isolation RLS actually buys: neither Ada's public post nor her draft.
    await expect(page.getByText(POSTS.adaPublished)).toHaveCount(0);
    await expect(page.getByText(POSTS.adaDraft)).toHaveCount(0);
  });
});
