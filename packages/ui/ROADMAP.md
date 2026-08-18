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

Phase 2 (overlays): `portal`, `dialog`, `alert-dialog`, `sheet`, `popover`,
`dropdown-menu`, `context-menu`, `select`, `tooltip`, `toast`. All rendered on
an iPhone 17 Pro simulator, light and dark.

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

## Shared prerequisites for Phase 2 — DONE

1. `@rn-primitives/portal` is installed, along with the nine leaf primitives.
2. `<UiPortalHost />` (from `@repo/ui/portal`) is the **last** child of
   `apps/native/src/app/_layout.tsx`. Without it every portal-based primitive
   renders **nothing, silently** — no error, no warning.
3. That component wraps itself in `FullWindowOverlay` from `react-native-screens`
   on iOS, so overlays clear the navigation bar and any `presentation: 'modal'`
   screen. The wrap is a runtime branch, not an element-type constant, because
   react-native-screens `console.warn`s on every render off iOS.
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

## Phase 2 — overlays — BUILT

Nine components plus `portal.tsx`, on `@rn-primitives/*@^1.5.2`
(`portal` resolves to 1.5.3; it pulls in `zustand` as a new transitive dep).
`menubar`, `navigation-menu` and `hover-card` were deliberately skipped — all
three are near-useless on a phone.

`<UiPortalHost />` from `@repo/ui/portal` is mounted as the last child of
`apps/native/src/app/_layout.tsx`, with `<ToastProvider>` around the navigator.

### What was learned building them

These cost real debugging time; none of them announce themselves.

- **A sibling scrim swallows every touch aimed at the content.** Rendering
  `<Overlay />` and `<Content>` as siblings — which is what the positioning
  maths seems to want, since Content is placed in window coordinates — produces
  an overlay that renders perfectly, positions perfectly, and is completely
  inert. A Select item logged no `onTouchStart` at all. **Content must be
  NESTED inside Overlay**, for every positioned component, exactly as the dialog
  family does. It is safe because the scrim is `absolute inset-0` inside a
  window-sized host, so window coordinates still line up. The same change also
  fixed positioned overlays refusing to appear at all when their trigger was
  inside an open Dialog.
- **`useRelativePosition` applies an inline style, and inline beats className.**
  On `popover` / `dropdown-menu` / `context-menu` / `select` / `tooltip`
  Content: `absolute`, `top-*`, `left-*`, `right-*`, `bottom-*` and `max-w-*`
  are all silently dead; `min-w-*` is the only width lever and `max-h-*` is
  free. The gallery keeps a permanent `min-w-96` vs `max-w-24` pair as the
  regression probe.
- **Five of the Roots cannot be controlled.** `popover`, `dropdown-menu`,
  `context-menu`, `select` and `tooltip` take only `onOpenChange`; `open` lives
  in their own state. Programmatic control is the Trigger ref's `open()` /
  `close()`. Only `dialog` and `alert-dialog` are controllable.
- **`select`'s value is an `Option` object**, not a string, and `Item` needs
  both `value` and `label` — `ItemText` renders `label` from context and ignores
  children. Its `Trigger` also defaults its own `disabled` to `false` and then
  computes `disabled ?? disabledRoot`, so `<Select disabled>` never reaches the
  press guard; the wrapper forwards the root flag itself.
- **The menu family's `ItemIndicator` throws** outside a `CheckboxItem` or
  `RadioGroup`. `select`'s is safe anywhere inside an `Item`.
- **`ContextMenuTrigger asChild` needs a pressable child.** The primitive
  forwards only `onLongPress`, and react-native-css upgrades a View to a
  Pressable on `onPress` alone — so slotting a `Card` gives a trigger that never
  opens, silently.
- **`toast`'s `Title`/`Description` render a raw RN `Text`**, not the kit's, so
  they cannot read `TextClassContext` — they have to take their variant classes
  directly. Its `Close` and `Action` already call `onOpenChange(false)`, so a
  caller's `onPress` must not dismiss again.
- **`alert-dialog`'s Overlay is a View**, which is what makes it undismissable
  by the scrim. Do not add `onPress`: react-native-css would turn it into a
  Pressable and quietly restore the dismissal.
- **Colour tokens cross the portal; safe-area insets do not.** react-native-css
  resolves `:root` variables and the colour scheme from module-scope
  observables, so dark mode flips inside a portal wherever the host sits — but
  `env(safe-area-inset-*)` travels through React context, so `pb-safe-offset-6`
  on a bottom sheet only works because the host is inside `ExpoRoot`'s
  SafeAreaProvider.
- **Animation: none, deliberately.** Overlay Content mounts already in its final
  state, so `transition-*` has nothing to interpolate, and the positioning hook
  parks the first frame off-screen at `opacity: 0` anyway. The one animation in
  the phase is the `SelectTrigger` chevron, which is outside the portal and
  permanently mounted.

### Known limitation

A toast that is **already on screen** when a dialog, sheet or alert-dialog opens
is dimmed underneath that overlay's scrim. A toast raised while the overlay is
already open draws on top, correctly. The cause is `@rn-primitives/portal`: its
host renders the registry with `Array.from(map.values())`, so paint order is
registration order. Two fixes were tried on device and neither works — a
dedicated second `PortalHost` rendered as a later sibling, and `z-50` on the
viewport. Reordering would have to happen inside the primitive.

### Still unbuilt from the original table

`menubar`, `navigation-menu`, `hover-card` — skipped by choice, not blocked.

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
through ordering). `sheet` is **built** — `@rn-primitives/dialog` anchored to an edge, which buys
the whole component for one cva table and no new dependency. It has no drag
gesture, deliberately: dragging means PanResponder or gesture-handler plus
onLayout measurement plus a detent model, which is a component rather than a
variant.

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
