# @repo/ui — remaining work

Phase 0 (foundation) and Phase 1 (base layer) are done. This file is the
handover for everything that is not: what is left, in what order, and the
constraints that will bite whoever picks it up.

Read `packages/ui/README.md` first — the nine authoring rules there are not
style preferences, each one is load-bearing on this stack. This file only adds
what is specific to the unbuilt components.

## Already built

`lib/cn`, `lib/text-class-context`, then `text`, `button`, `input`, `label`,
`field`, `card`, `badge`, `skeleton`, `separator`. Primitives in use:
`@rn-primitives/slot`, `/label`, `/separator`. Gallery:
`apps/native/src/app/ui-kit.tsx`.

`themed-text` and `themed-view` are deprecated but still present — see Phase 4.

## Decide this before writing any Phase 2 or 3 component

**Pick an icon library.** Checkbox needs a check mark, Select and the menu
family need a chevron and a check, Accordion needs a chevron, Dialog needs a
close glyph. There is no icon library in this repo today: the Expo template uses
`expo-symbols`' `SymbolView` (which takes an imperative `tintColor`, not
`className`) and PNG assets. Every one of those components is blocked on this,
and the choice determines whether `icon.tsx` — deliberately not built in Phase 1
because it would have been guesswork — is a `className` passthrough or a
`tintColor` bridge.

The requirement is that icon colour follows `TextClassContext` like text does,
so a chevron inside a `ghost` Button is the right colour without the call site
saying so. A library whose components accept `className` (`lucide-react-native`
is what react-native-reusables uses) satisfies that directly; `SymbolView` would
need a wrapper that reads the context and resolves it to a colour, which
reintroduces exactly the token duplication Phase 1 removed.

## Shared prerequisites for Phase 2

1. `yarn workspace @repo/ui add @rn-primitives/portal` — it was installed for
   the spike and removed again once nothing shipped used it.
2. Mount `<PortalHost />` as the **last** child of
   `apps/native/src/app/_layout.tsx`. Without it every portal-based primitive
   renders **nothing, silently** — no error, no warning.
3. On iOS, wrap the host in `FullWindowOverlay` from `react-native-screens`
   (4.26.2, already a dependency) or overlays render under the navigation bar.
4. Add `react-native-reanimated` (4.5.1, already in `apps/native`) to
   `packages/ui` peers, and build a `native-only-animated-view.tsx` shim so
   enter/exit animation runs on native and is a no-op on web. Do **not** reach
   for `tailwindcss-animate` — react-native-css does not implement `animate-in`.
   Tailwind's own keyframe utilities do work; `animate-pulse` is verified in
   `skeleton.tsx`.
5. `--overlay` and `--ring` already exist in `packages/tokens/theme.css`. Any
   further token must be declared in **all three** blocks (`:root`, the
   `prefers-color-scheme` media query, and `:root[class~="dark"]`) or
   react-native-css folds it and dark mode stops flipping.

## Phase 2 — overlays

All ten take `@rn-primitives/portal` as a peer, so all ten are blocked on the
prerequisites above. Version is 1.5.2 across the board.

| Component | Primitive | Notes |
|---|---|---|
| `dialog` | `@rn-primitives/dialog` | Start here. Bundles and typechecks on this toolchain (verified in the Phase 1 spike) but has **never been rendered** — do that first and the rest follow the same shape. Close on overlay press via `useRootContext()`. |
| `alert-dialog` | `@rn-primitives/alert-dialog` | Same shape as dialog, no dismiss-on-outside-press. |
| `popover` | `@rn-primitives/popover` | Positioning props (`side`, `align`, `sideOffset`, `insets`, `avoidCollisions`) are shared with the menu family. |
| `dropdown-menu` | `@rn-primitives/dropdown-menu` | Needs the icon decision — `ItemIndicator` for checkbox/radio items. |
| `context-menu` | `@rn-primitives/context-menu` | Long-press on native. |
| `menubar` | `@rn-primitives/menubar` | Lowest value on a phone; consider skipping. |
| `navigation-menu` | `@rn-primitives/navigation-menu` | Same. |
| `select` | `@rn-primitives/select` | Needs chevron + check icons. |
| `tooltip` | `@rn-primitives/tooltip` | Upstream bugs: auto-flip is broken on native, and it reopens on click on web. Verify before shipping. |
| `hover-card` | `@rn-primitives/hover-card` | Depends on `popover`; hover is a web-only interaction, so this is near-useless on a phone. |
| `toast` | `@rn-primitives/toast` | **No `.web.tsx`** and no Radix counterpart — the least universal primitive in the set. Docs still show a PortalHost example. |

## Phase 3 — the rest

None need a portal.

| Component | Primitive | Notes |
|---|---|---|
| `checkbox` | `@rn-primitives/checkbox` | Blocked on the icon decision. |
| `radio-group` | `@rn-primitives/radio-group` | Indicator can be a plain filled `View` — buildable before icons. |
| `switch` | `@rn-primitives/switch` | Note this is *not* RN's `Switch`; react-native-css also polyfills that one, so keep the imports straight. |
| `slider` | `@rn-primitives/slider` | |
| `progress` | `@rn-primitives/progress` | |
| `tabs` | `@rn-primitives/tabs` | Distinct from `expo-router`'s `NativeTabs` used for app navigation. |
| `accordion` | `@rn-primitives/accordion` | Chevron — icon decision. Wants animated height (Reanimated). |
| `collapsible` | `@rn-primitives/collapsible` | Would replace `apps/native/src/components/ui/collapsible.tsx`. |
| `toggle`, `toggle-group` | `@rn-primitives/toggle`, `/toggle-group` | Reuse `buttonVariants` rather than a parallel map. |
| `toolbar` | `@rn-primitives/toolbar` | |
| `avatar` | `@rn-primitives/avatar` | **No `.web.tsx`.** Known upstream Storybook breakage. |
| `aspect-ratio` | `@rn-primitives/aspect-ratio` | **No `.web.tsx`.** Thin enough that `aspect-*` utilities may be enough — check before adding a dependency. |
| `table` | `@rn-primitives/table` | **No `.web.tsx`.** Open upstream issue on the `scope` prop. |

Components with no primitive behind them, worth adding to round the set out:
`alert` (Card + `TextClassContext`, same shape as `badge`), `textarea` (`Input`
with `multiline`), and `sheet`/bottom-sheet (no rn-primitive exists; would be
`dialog` positioned bottom, or a separate native library — a real decision, not
a component).

"No `.web.tsx`" means the single React Native implementation also serves web
through `react-native-web`. For a native-only library that is mostly irrelevant;
it only shows up under `expo start --web`. Ground truth is the presence of a
`<name>.web.js` in the package's `dist/`.

## Phase 4 — retire the duplicate theme system

`apps/native/src/constants/theme.ts` is a second hand-written copy of the same
hex values under a third set of names (`background`/`backgroundElement`/
`backgroundSelected` vs the tokens' `bg`/`surface`/`surface-selected`). It and
`hooks/use-theme.ts` should go once their consumers move to classNames.

Still on it:

```
apps/native/src/app/(app)/explore.tsx
apps/native/src/components/app-tabs.tsx
apps/native/src/components/app-tabs.web.tsx
apps/native/src/components/ui/collapsible.tsx
apps/native/src/components/web-badge.tsx
apps/native/src/hooks/use-theme.ts
```

Still importing the deprecated `themed-text` / `themed-view`:

```
apps/native/src/app/(app)/explore.tsx
apps/native/src/components/hint-row.tsx
apps/native/src/components/web-badge.tsx
apps/native/src/components/ui/collapsible.tsx
apps/native/src/components/app-tabs.web.tsx
apps/native/src/components/themed-text.tsx   (re-export shim)
apps/native/src/components/themed-view.tsx   (re-export shim)
```

`app-tabs.tsx` is the one legitimate holdout: `expo-router`'s `NativeTabs` takes
imperative colour props, so it cannot use classNames. It needs a small helper
that reads the token values once — the only place in the app where an imperative
colour is justified. Everything else migrates to `Text` + `bg-*` utilities, and
then `constants/theme.ts`, `hooks/use-theme.ts` and both shims can be deleted.

## Definition of done, per component

1. Rendered in `apps/native/src/app/ui-kit.tsx` in every variant, size and state.
2. An override case in the gallery proving `cn()` still wins — e.g. a Dialog
   content forced to `bg-danger`. If it does not visibly differ, class merging
   has regressed.
3. Dark mode flips with no reload, and `grep -r "dark:" packages/ui/src` stays
   empty.
4. `yarn check-types` and `yarn lint` from the root.
5. `yarn workspace native exec expo export --platform ios` succeeds, and
   `yarn why lightningcss` still reports only 1.30.1.
6. **Run it on a device or simulator.** Phase 1 could not: there is no Xcode on
   the machine it was built on, so it was verified by bundle inspection plus
   `expo start --web`, which exercises the Radix-backed web path rather than the
   native implementations. Every portal-based component in Phase 2 is
   specifically the kind that can bundle cleanly and render nothing on device.
