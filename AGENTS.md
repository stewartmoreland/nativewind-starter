# Agent notes

Read this before changing dependencies, styling, or the database.

## Skill Loading

Before editing files for a substantial task:
- Run `yarn dlx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `yarn dlx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Monorepos: run the skill check from the workspace root and prefer the local skill for the package being changed.

## Architecture in one paragraph

`apps/web` (Next.js 16) and `apps/native` (Expo SDK 57) share **design tokens**
(`packages/tokens`), the **tRPC router** (`packages/api`), and the **Supabase
clients + generated DB types** (`packages/supabase`). They do **not** share
components: web is plain Tailwind v4 + React DOM, native is NativeWind v5.
There is no `react-native-web` in Next.js and no NativeWind on web. This is
deliberate — it removes the Turbopack/react-native-web Flow-parsing problem,
which is the most fragile part of this stack.

## Do not

- **Do not invoke the `expo:expo-tailwind-setup` skill.** It pins
  `nativewind@5.0.0-preview.2` + a nightly `react-native-css` and prescribes
  `{ inlineVariables: false, globalClassNamePolyfill: false }` plus hand-written
  `useCssElement` wrappers. Under preview.4 that is backwards: the polyfill
  defaults to `true` and is a Metro `resolveRequest` override that gives every
  RN primitive a working `className`. Following the skill leaves the app
  unstyled. `metro.config.js` must stay `withNativewind(config)` with no options.
- **Do not change the `lightningcss` resolution** without re-running
  `yarn workspace native exec expo export --platform ios`. It is pinned to
  `1.30.1` because `react-native-css@3.0.7` was built against the pre-1.32
  lightningcss AST; `1.32.0` (what Tailwind 4.3.3 itself pins) fails with
  `failed to deserialize; expected an object-like struct named Specifier`.
- Do not add `nativewind/preset`, `jsxImportSource: "nativewind"`, or
  `react-native-css-interop` — all dead v4 content on an unlinked docs page.
- Do not import `nativewind/theme` into `apps/web`.
- Do not use a `dark:` variant in `packages/ui` or `apps/native`.
  react-native-css 3.0.7 implements only `:root[class~="dark"]`, so `dark:`
  utilities compile away on native while still working in the browser — the bug
  only appears on device. Dark mode is a variable swap in `packages/tokens`.
- Do not write a raw colour (a hex, `rgb()`, `placeholderTextColor`,
  `tintColor`) in a `packages/ui` component. Use a token utility; react-native-css
  maps `::placeholder`/`::selection`/`ActivityIndicator`'s colour from CSS.
- Do not build a `className` by string concatenation in `packages/ui`. Use
  `cn()` from `@repo/ui/lib/cn`: react-native-css resolves conflicts by
  stylesheet order, not by position in the string, so a concatenated consumer
  `className` silently loses.
- Do not remove `@source "../../../packages/ui/src"` from
  `apps/native/src/global.css`. Tailwind's source auto-detection stops at
  `apps/native` and does not follow the workspace symlink, so without it any
  utility used only inside `packages/ui` is never emitted and the component
  renders unstyled.
- **Do not put a `className` on `SafeAreaView`.** It is silently dropped on
  native: the Metro resolver rewrites `react-native-safe-area-context` to
  react-native-css's wrapper, but that wrapper only wraps `SafeAreaProvider` —
  `SafeAreaView` is re-exported untouched, so the class lands on a codegen'd
  native view that has no such prop. The failure is a COLLAPSED layout, not an
  unstyled one, because the native view sets padding but never flex. Use
  `p-safe` / `pt-safe` / `pb-safe` on a plain `View` instead.
- Do not use `cssInterop`, `remapProps`, `vars()`, or `useColorScheme` from
  `nativewind` (all deprecated in v5). Import `useColorScheme` from `react-native`.
- Do not add `watchFolders` / `nodeModulesPaths` to `metro.config.js` — Expo
  configures Metro for monorepos since SDK 52 and its docs say to delete them.
- Do not add `@trpc/react-query` or `@trpc/next` (legacy), or
  `httpBatchStreamLink` (cannot set response headers, which Supabase's cookie
  refresh needs; RN also lacks `TextDecoderStream`).
- Do not add `Access-Control-Allow-Origin` to `/api/trpc`.
- Do not enable `cacheComponents` / `use cache` on any route that reads cookies
  or calls Supabase auth.
- Do not move `readSupabaseEnv()` out of the module scope of
  `apps/web/playwright.config.ts` into a `globalSetup`. Playwright spawns
  `webServer` **before** `globalSetup` runs, so Next.js would boot without
  `NEXT_PUBLIC_SUPABASE_URL` and every spec would fail on a page that cannot
  reach Supabase.
- Do not start Metro from the repo root — the NativeWind plugin rewrites
  `tsconfig.json` relative to the cwd. Use `yarn workspace native start`.

## Security rules

1. **No secret key in a public bundle.** `NEXT_PUBLIC_*` / `EXPO_PUBLIC_*` are
   inlined into shipped JS, and `NEXT_PUBLIC_*` is baked into `.next/**`, which
   Turborepo caches. The `sb_secret_*` / `service_role` key has `BYPASSRLS` and
   belongs only in server-only runtime env.
2. **No client-supplied identity.** No procedure input schema may contain
   `userId`, `user_id`, `authorId`, `ownerId`, or `role`. Identity comes from
   `ctx.userId`, derived from a signature-verified JWT.
3. **`getSession()` never on the server.** It reads request-supplied storage
   and is spoofable. Server code uses `getClaims()`. The one legitimate use is
   `apps/native/src/lib/api.tsx`, to read the raw access token for the header.
4. **PKCE only on native.** Never call `setSession()` with tokens parsed from a
   deep link — any app on the device could then sign the user into an
   attacker-controlled account.
5. **New tables**: copy `supabase/schemas/20_posts.sql`. Every table needs
   `revoke all` → explicit grants → `enable row level security` → policies with
   `TO authenticated` **and** an ownership predicate → an index on every
   policy-filtered column. `TO authenticated` alone is authentication without
   authorization.
6. **Views** must be `create view ... with (security_invoker = on)` and carry
   their own grants, or they run as their owner and bypass RLS.
7. After any schema change, run `yarn db:test-rls`.
8. **The e2e suite must never hold the secret key.** `apps/web/e2e/supabase-env.ts`
   reads only `API_URL` and `PUBLISHABLE_KEY` from `supabase status`. The
   `sb_secret_*` key has `BYPASSRLS`, so a suite handed one would assert RLS
   behaviour vacuously — the same reason `yarn db:test-rls` runs as
   `authenticated`/`anon` rather than `postgres`.
9. `apps/web/e2e/.auth/*.json` are **live session cookies** for the demo users.
   They are gitignored and regenerated by the `setup` project; never commit them
   and never add a step that prints them.

## Known sharp edges

- `pg-delta` (the `supabase db diff` engine) emits only `GRANT`s, never
  `REVOKE`s, because it models a new table as starting with an empty ACL. It
  does not: Supabase's `ALTER DEFAULT PRIVILEGES` in `public` grants `arwdDxtm`
  to `anon`/`authenticated` at `CREATE TABLE` time, leaving `anon` holding
  `TRUNCATE` — which RLS does **not** filter. Generated migrations therefore
  need the `REVOKE ALL` lines added by hand; `supabase/migrations/*_init_schema.sql`
  shows the pattern, and `yarn db:test-rls` assertion (v) catches regressions.
- For a **single** UPDATE policy, Postgres reuses `USING` as the `WITH CHECK`
  expression when the latter is omitted, so omitting it does not by itself allow
  row-ownership transfer (contrary to widely repeated advice). Declare it
  anyway: it is required the moment the two expressions differ or a second
  permissive policy is added.
- **Never write `nativeStyleMapping: { key: true }`.** react-native-css 3.0.7
  calls `path.split('.')` on the mapping value unconditionally
  (`src/native/styles/index.ts`), so the `true` shorthand its own types
  advertise is a `TypeError` the moment a style carries that key. Always use a
  string path — `{ color: 'color' }`, as `packages/ui/src/icon.tsx` does.
- **Do not put `text-center` / `text-right` on `Input` or `Textarea`.** Same
  bug, upstream: the polyfilled `TextInput` maps `textAlign` with the `true`
  shorthand, so those utilities crash on native rather than being ignored.
- **Import lucide icons by path**, never from the barrel. Measured on this
  repo: one barrel import grew the iOS bundle from 5.38MB to 7.20MB (+1.82MB,
  +34%), because Metro does not tree-shake and `metro.config.js` must stay
  optionless. Both `packages/ui`'s and `apps/native`'s eslint configs enforce
  it — the rule has to be in both, since `apps/native` is what Metro actually
  bundles.
- **`react-native-reanimated` is not a `packages/ui` dependency and must not
  become one.** react-native-css already wraps any element carrying a
  `transition-*` / `animate-*` rule in `createAnimatedComponent`, resolving
  Reanimated from its own location. A CSS transition in a `@repo/ui` component
  is already Reanimated-backed.

## Expected warnings (do not "fix" these)

`yarn install` prints three peer warnings:

```
@repo/ui   doesn't provide @expo/metro-config, requested by react-native-css
@repo/ui   doesn't provide lightningcss,      requested by react-native-css
native     doesn't provide @expo/metro-config, requested by react-native-css
```

They are correct and must stay. `@expo/metro-config` and `lightningcss` are
**build-time** peers of `react-native-css`, used by the Metro transformer.
Installing `@expo/metro-config` directly to silence them makes `expo-doctor`
fail ("should not be installed directly… use `expo/metro-config`, a sub-export
of the `expo` package"). A cosmetic Yarn warning is the better trade than a
broken Expo project.

Likewise, do not re-add `devEngines.packageManager` to the root `package.json`.
`packageManager` already pins Yarn through corepack; `devEngines` additionally
makes any npm invocation hard-error, which breaks `npx`, `npm view`, and
`expo-doctor` (three of its checks shell out to `npm explain`).
