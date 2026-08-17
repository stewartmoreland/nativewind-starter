# @repo/ui — remaining work

Phase 0 (foundation) and Phase 1 (base layer) are done. This file is the
handover for everything that is not: what is left, in what order, and the
constraints that will bite whoever picks it up.

Read `packages/ui/README.md` first — the nine authoring rules there are not
style preferences, each one is load-bearing on this stack. This file only adds
what is specific to the unbuilt components.

## Already built

Phase 1: `lib/cn`, `lib/text-class-context`, then `text`, `button`, `input`,
`label`, `field`, `card`, `badge`, `skeleton`, `separator`.

Phase 3 (non-portal): `icon`, `checkbox`, `radio-group`, `switch`, `toggle`,
`toggle-group`, `textarea`, `progress`, `tabs`, `collapsible`, `accordion`,
`alert`.

Primitives in use: `@rn-primitives/slot`, `/label`, `/separator`, `/checkbox`,
`/radio-group`, `/switch`, `/toggle`, `/toggle-group`, `/progress`, `/tabs`,
`/collapsible`, `/accordion`. Gallery: `apps/native/src/app/ui-kit.tsx`.

`themed-text` and `themed-view` are deprecated but still present — see Phase 4.

## The icon decision — made

`lucide-react-native` + `react-native-svg` (pinned `15.15.4`, what Expo SDK 57's
`bundledNativeModules.json` specifies), bridged by `packages/ui/src/icon.tsx`.

The bridge is `styled()` from `react-native-css` — the sanctioned v5 API, not
the `cssInterop` AGENTS.md bans — with
`nativeStyleMapping: { color: 'color', width: 'size', height: 'size' }`. That
lifts the computed values out of `style` and onto lucide's props, which is the
only thing that works: react-native-svg's `Svg` does read `width`/`height` from
`style`, but lucide always passes explicit `width`/`height` PROPS derived from
`size ?? 24`, and props win — so a `size-4` left in the style is silently
ignored and every icon renders at 24px.

Two constraints discovered building it, both load-bearing:

- **Mapping values must be string paths, never `true`.** react-native-css 3.0.7
  calls `path.split('.')` on the value unconditionally, so the `true` shorthand
  its own types advertise is a `TypeError` the moment the style carries that
  key. (This also means `text-center` on `Input`/`Textarea` crashes — the
  polyfilled `TextInput` maps `textAlign` with exactly that shorthand.)
- **Import icons by path, never from the barrel.** Measured: one barrel import
  grew the iOS bundle from 5.38MB to 7.20MB (+1.82MB, +34%), because Metro does
  not tree-shake and `metro.config.js` must stay optionless. `eslint` enforces
  it in `packages/ui`.

`styled()` mints a new component type per call, so `icon.tsx` caches per glyph
in a module-scope `WeakMap` — a hook-level memo would not help, since it
memoises per instance and two sibling `<Icon as={Check} />` would still be two
types, remounting on every swap.

## Shared prerequisites for Phase 2

1. `yarn workspace @repo/ui add @rn-primitives/portal` — it was installed for
   the spike and removed again once nothing shipped used it.
2. Mount `<PortalHost />` as the **last** child of
   `apps/native/src/app/_layout.tsx`. Without it every portal-based primitive
   renders **nothing, silently** — no error, no warning.
3. On iOS, wrap the host in `FullWindowOverlay` from `react-native-screens`
   (4.26.2, already a dependency) or overlays render under the navigation bar.
4. **Do NOT add `react-native-reanimated` to `packages/ui` peers.** The earlier
   version of this prerequisite said to, and it was wrong: react-native-css
   already *is* the Reanimated layer. `src/native/reanimated.ts` lazily
   `require`s Reanimated and wraps the element in `createAnimatedComponent`,
   and `useNativeCss.ts` triggers that whenever the compiler flags a rule
   carrying an `animation*` **or `transition*`** property. So
   `transition-transform duration-200 ease-standard` — used by the `accordion`
   and `collapsible` chevrons and the `switch` thumb — animates through
   Reanimated with no import, no peer and no worklet we author, exactly as
   `animate-pulse` already does in `skeleton.tsx`. Adding the peer would
   declare a dependency the package never imports.
   Do **not** reach for `tailwindcss-animate` either — react-native-css does
   not implement `animate-in`. Tailwind's own keyframe utilities do work.
   A `native-only-animated-view.tsx` shim is only worth building if a Phase 2
   overlay needs an enter/exit animation that a CSS keyframe cannot express;
   nothing in Phase 3 needed one.
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

None need a portal. Everything except `slider` is **built**; see "Already
built" above.

| Component | Primitive | Status |
|---|---|---|
| `checkbox` | `@rn-primitives/checkbox` | Built. `Root` + `Indicator`, controlled; Indicator renders `null` when unchecked. |
| `radio-group` | `@rn-primitives/radio-group` | Built. Exports **no** context hook, unlike `toggle-group`, so the wrapper publishes its own value context to colour the selected ring. Indicator is a plain filled `View`. |
| `switch` | `@rn-primitives/switch` | Built. Still *not* RN's `Switch` — react-native-css polyfills that one too, and the wrong import renders a plausible-looking system control rather than erroring. The primitive does no layout or animation; the 20px thumb travel is ours. |
| `slider` | `@rn-primitives/slider` | **Not built.** The primitive ships **no gesture handling at all** — `Track` only adds screen-reader `accessibilityActions`, and `Range`/`Thumb` are bare `View`s. Dragging means hand-written `PanResponder` (or gesture-handler) plus `onLayout` measurement. Note also its `value` is a `number` while `onValueChange` gives `number[]`. |
| `progress` | `@rn-primitives/progress` | Built. Indeterminate on `value={null}`; the width is the one justified inline style, since a runtime percentage can never be a Tailwind class. |
| `tabs` | `@rn-primitives/tabs` | Built. Controlled-only. Selected state comes from `useRootContext()` compared against the trigger's `value` — there is no render prop. Distinct from `expo-router`'s `NativeTabs`. |
| `accordion` | `@rn-primitives/accordion` | Built. Chevron state from `useItemContext().isExpanded`. **No animated height**: Content unmounts when collapsed, so there is nothing to interpolate and no `height: auto` to animate to. The chevron rotation is a class change on a mounted element, so it animates for free. |
| `collapsible` | `@rn-primitives/collapsible` | Built. Exports **no** context hook, so the wrapper owns `open` and drives the Root controlled. Does **not** replace `apps/native/src/components/ui/collapsible.tsx` — that is a convenience wrapper with a different API, and it retires with `explore.tsx` in Phase 4. |
| `toggle`, `toggle-group` | `@rn-primitives/toggle`, `/toggle-group` | Built. Both map `(variant, pressed)` onto existing `buttonVariants` rather than a parallel table. `toggle-group` *does* export `useRootContext()` + `utils.getIsSelected()`. |
| `toolbar` | `@rn-primitives/toolbar` | Not built. |
| `avatar` | `@rn-primitives/avatar` | Not built. **No `.web.tsx`.** Known upstream Storybook breakage. |
| `table` | `@rn-primitives/table` | Not built. **No `.web.tsx`.** Open upstream issue on the `scope` prop. |

`aspect-ratio` **needs no component and no dependency**: react-native-css
compiles the CSS `aspect-ratio` property straight to RN's `aspectRatio`, so
`aspect-square` / `aspect-[16/9]` / `aspect-video` all work. The utility also
beats the primitive, because `aspect-[16/9]` is overridable through `cn()` and
a `ratio` prop is not. Proven in the gallery.

Components with no primitive behind them: `alert` (**built** — Card +
`TextClassContext`, same shape as `badge`, `default`/`destructive` only because
the palette has no `warning`/`success` token) and `textarea` (**built** —
`Input` with `multiline`; `h-auto` beats Input's `h-12` through `cn()`, not
through ordering). Still open: `sheet`/bottom-sheet — no rn-primitive exists,
so it is `dialog` positioned bottom or a separate native library, which is a
real decision rather than a component.

"No `.web.tsx`" means the single React Native implementation also serves web
through `react-native-web`. For a native-only library that is mostly
irrelevant; it only shows up under `expo start --web`. Ground truth is the
presence of a `<name>.web.js` in the package's `dist/`.

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
6. **Run it on a device or simulator.** Phase 1 could not — no Xcode on the
   machine it was built on — so it was verified by bundle inspection plus
   `expo start --web`, which exercises the Radix-backed web path rather than
   the native implementations. Phase 3 could and did.
   The app needs a dev build (`@expo/ui`, `expo-glass-effect` and now
   `react-native-svg` are all outside Expo Go), and `apps/native/ios` is
   gitignored, so:

   ```
   yarn db:start && yarn db:seed-auth        # the gallery is behind the auth guard
   yarn workspace native exec expo run:ios --device "iPhone 17 Pro"
   ```

   Then sign in as `ada@example.com` / `password123` and tap **Component
   gallery** on the home screen. Toggle the theme *without reloading* with
   `xcrun simctl ui booted appearance dark|light`; anything that needs a reload
   means a token was declared in fewer than all four blocks.

   Every portal-based component in Phase 2 is specifically the kind that can
   bundle cleanly and render nothing on device, so this step is not optional
   there.
