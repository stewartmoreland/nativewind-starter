import { expect, test } from '@playwright/test';

/**
 * Route-level hardening for /api/trpc. These use the `request` fixture, so they
 * carry no cookies and no browser session.
 *
 * The router has no transformer (packages/api/src/trpc.ts), so inputs are plain
 * JSON and an unbatched response is { result: { data } }.
 */

const CREATE = '/api/trpc/posts.create';
const LIST = '/api/trpc/posts.list';

test.describe('/api/trpc', () => {
  test('rejects a cross-site POST', async ({ request }) => {
    const response = await request.post(CREATE, {
      headers: { origin: 'https://evil.example' },
      data: { title: 'csrf' },
    });

    // Route Handlers have no built-in CSRF protection and this route
    // authenticates by cookie, so the origin check is the only thing standing
    // between a user's session and a cross-site form post.
    expect(response.status()).toBe(403);
  });

  test('allows a request with no Origin header', async ({ request }) => {
    // React Native's fetch sends no Origin. If this ever starts failing, the
    // native app has lost access to the API.
    const response = await request.get(LIST);

    expect(response.status()).toBe(200);
  });

  test('returns only published posts to an anonymous caller', async ({
    request,
  }) => {
    const response = await request.get(LIST);
    const body = (await response.json()) as {
      result: { data: { published: boolean }[] };
    };

    expect(body.result.data.length).toBeGreaterThan(0);
    expect(body.result.data.every((post) => post.published)).toBe(true);
  });

  test('rejects an unauthenticated mutation', async ({ request }) => {
    const response = await request.post(CREATE, {
      headers: { origin: 'http://localhost:3000' },
      data: { title: 'no session' },
    });

    // protectedProcedure — identity comes from a verified token, and there
    // isn't one here.
    expect(response.status()).toBe(401);
  });
});
