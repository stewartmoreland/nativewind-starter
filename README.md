# Supabase · Expo · Next.js starter

A Turborepo template where auth, the database, and a type-safe API already work
on **both** web and native.

| | |
|---|---|
| Web | Next.js 16 (App Router, Server Components, Turbopack) + Tailwind CSS v4 |
| Native | Expo SDK 57 + expo-router 57 + NativeWind v5 |
| API | tRPC v11 — one router, consumed by both apps |
| Data | Supabase (Postgres 17 + Auth), RLS on every table, declarative schemas |
| Repo | Turborepo + Yarn 4 |

## What is shared, and what is not

```
packages/tokens     design tokens (CSS)      -> web + native
packages/api        tRPC router              -> web + native
packages/supabase   clients + DB types       -> web + native
packages/ui         NativeWind components    -> native only
```

Web and native share **design tokens and server logic, not components**.
`apps/web` is plain Tailwind + React DOM; `apps/native` is NativeWind. There is
no `react-native-web` in Next.js and no NativeWind on web.

That is a deliberate trade: you write a button twice, and in exchange
`next.config.js` stays empty — no `transpilePackages`, no Turbopack
`resolveAlias`, no `.web.tsx` resolution ordering, and no exposure to the
still-open Turbopack/React-Native Flow-parsing issue. Colour, spacing, radii and
type scale stay in lockstep because both platforms compile the same
`packages/tokens/theme.css`.

`packages/ui` is a small shadcn-shaped kit: behaviour and accessibility come
from [rn-primitives](https://rnprimitives.com), styling is Tailwind utilities
that resolve to `packages/tokens`, and every component takes a `className` that
overrides its defaults. See `packages/ui/README.md`, and
`apps/native/src/app/ui-kit.tsx` for a gallery of every component and state.

## Requirements

- Node >= 22.13
- Yarn 4 (`corepack enable`)
- Docker (for the local Supabase stack)

## Setup

```bash
yarn install
yarn db:start                 # boots Postgres, Auth, Studio, Mailpit
yarn db:reset                 # applies supabase/migrations
yarn db:seed-auth             # demo users + posts (local only)
yarn db:types                 # regenerate packages/supabase/src/types.gen.ts
```

Write the env files from the running stack (`--force` to overwrite existing
ones; see `apps/*/.env.example` for what each value is):

```bash
yarn env:local
```

Demo accounts: `ada@example.com` / `alan@example.com`, password `password123`.

## Run

```bash
yarn dev --filter=web         # http://localhost:3000
yarn workspace native start   # always from the workspace, never the repo root
```

Local email (magic links, confirmations) is captured by **Mailpit** at
<http://127.0.0.1:54324> — nothing is delivered.

### Pointing the native app at the API

`apps/native` calls the tRPC route hosted by `apps/web`. In dev it infers your
machine's LAN IP from the Expo dev server. Override when that is wrong:

| Target | `EXPO_PUBLIC_API_URL` |
|---|---|
| iOS simulator | `http://localhost:3000` |
| Android emulator | `http://10.0.2.2:3000` |
| Physical device | `http://<your-lan-ip>:3000` |

It throws with an actionable message rather than silently defaulting to
localhost, because an Android emulator cannot reach the host's localhost.

## Database workflow

Schemas are **declarative**: edit `supabase/schemas/*.sql` (the desired state),
then generate a migration from the diff.

```bash
yarn db:diff <name>    # writes supabase/migrations/<ts>_<name>.sql
yarn db:reset          # re-apply from scratch
yarn db:test-rls       # RLS assertions — run after EVERY schema change
yarn db:types          # regenerate TypeScript types
```

**Always read the generated migration.** The diff engine emits only `GRANT`s,
never `REVOKE`s, so the `REVOKE ALL` lines must be carried over by hand — see
`AGENTS.md` for why that matters (`anon` otherwise keeps `TRUNCATE`, which RLS
does not filter).

`yarn db:test-rls` runs as the `authenticated` and `anon` roles with a JWT claim
set, because running as `postgres` or `service_role` proves nothing — both hold
`BYPASSRLS`, so every policy appears to pass. It includes positive controls so
the suite fails loudly if the claim plumbing breaks, rather than passing
vacuously.

## Adding a table

Copy `supabase/schemas/20_posts.sql`. Every table gets, in one file:
`revoke all` → explicit grants → `enable row level security` → policies scoped
`TO authenticated` with an ownership predicate → an index on every
policy-filtered column.

## Verify everything

```bash
yarn turbo run check-types build lint
yarn db:test-rls
yarn test:e2e
yarn workspace native exec expo-doctor
```

## End-to-end tests

Playwright drives `apps/web` in a real browser against the local Supabase
stack. It seeds itself — `yarn db:start` is the only prerequisite.

```bash
yarn test:e2e         # headless, boots `next dev` (or reuses a running one)
yarn test:e2e:ui      # interactive runner
```

Config lives in `apps/web/playwright.config.ts`, specs in `apps/web/e2e`. The
suite covers the `/protected` gate in `proxy.ts`, the sign-in / sign-out server
actions, RLS visibility (Ada sees her draft, Alan does not), and the
same-origin check on `/api/trpc`.

A `setup` project signs in as each demo user and caches the session in
`apps/web/e2e/.auth/`. Those are real session cookies and are gitignored.

`apps/native` is not covered — Playwright drives browsers, and this repo has no
`react-native-web` target by design.

## Security notes

- `NEXT_PUBLIC_*` / `EXPO_PUBLIC_*` are inlined into shipped bundles, and
  `NEXT_PUBLIC_*` is baked into `.next/**` which Turborepo caches. The
  `sb_secret_*` key has `BYPASSRLS` and must never carry either prefix.
- Native auth uses the **PKCE** flow only.
- `/api/trpc` enforces a same-origin check: Route Handlers have no built-in
  CSRF protection and the web client authenticates by cookie.
- Before going to production: set `enable_confirmations = true`, raise
  `minimum_password_length` to 8+ with `password_requirements`, configure real
  SMTP, and scope `additional_redirect_urls` to production origins.

`AGENTS.md` documents the version pins and the traps worth knowing before
changing dependencies.
