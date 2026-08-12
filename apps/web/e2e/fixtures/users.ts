import path from 'node:path';

/**
 * Single source of truth for the demo data these tests assert on.
 * Mirrors DEMO_USERS / DEMO_POSTS in scripts/seed-auth.mjs — change both.
 */

const AUTH_DIR = path.resolve(import.meta.dirname, '../.auth');

export type DemoUser = {
  email: string;
  password: string;
  /** Path to the storage state written by auth.setup.ts. */
  storageState: string;
};

export const ADA: DemoUser = {
  email: 'ada@example.com',
  password: 'password123',
  storageState: path.join(AUTH_DIR, 'ada.json'),
};

export const ALAN: DemoUser = {
  email: 'alan@example.com',
  password: 'password123',
  storageState: path.join(AUTH_DIR, 'alan.json'),
};

export const POSTS = {
  adaPublished: 'Notes on the Analytical Engine',
  adaDraft: 'Draft: on operations',
  alanPublished: 'On computable numbers',
} as const;
