# @repo/ui

NativeWind v5 component kit for `apps/native`. **Native only** — `apps/web` is
plain Tailwind + React DOM and must never import from here.

Behaviour and accessibility come from [rn-primitives][rnp] (headless, Radix-shaped);
styling is Tailwind utilities that resolve to the variables in `@repo/tokens`.
Nothing is compiled: apps consume the `.tsx` source through
`"exports": { "./*": "./src/*.tsx" }`, so `@repo/ui/button` is the import path
and there is no build step.

[rnp]: https://rnprimitives.com

## Restyling without touching a component

Two levers, in order of reach:

1. **Globally** — edit `packages/tokens/theme.css`. Every component draws its
   colour from those variables, so changing `--brand` reskins every button,
   badge and link at once, on both platforms. Declare each variable in **all
   three** blocks (`:root`, the `prefers-color-scheme: dark` media query, and
   `:root[class~="dark"]`); react-native-css folds any custom property declared
   exactly once, and dark mode stops flipping.
2. **Per call site** — pass `className`. It is merged last through `cn()`, so it
   wins: `<Button className="h-8 rounded-full bg-danger" />` really is 32px tall,
   fully rounded and red.

Each component also exports its `cva` config (`buttonVariants`,
`textVariants`, `badgeVariants`…) if you want to compose against it.

## Authoring rules

These are not style preferences — each one is load-bearing on this stack.

1. **Never write a raw colour.** Only `bg-*` / `text-*` / `border-*` utilities
   that resolve to a `@repo/tokens` variable. A literal is a value a fork cannot
   retheme and that will not follow dark mode.
2. **Never use a `dark:` variant.** react-native-css 3.0.7 implements only the
   `:root[class~="dark"]` form; the `.dark *` branches are commented out in its
   compiler, so `dark:` *utilities* compile away on native. They would still
   work in the browser — meaning the bug only shows up on device. Dark mode is a
   variable swap, not a class.
3. **Merge with `cn()`, always last.** react-native-css compiles utilities into a
   stylesheet and resolves conflicts by specificity and source order, exactly
   like CSS. Position within a `className` string decides nothing, so
   `` `${base} ${className}` `` does not let a caller override anything.
   `cn(base, variants, className)` drops the losing class outright.
   The one exception is the `asChild` path: `@rn-primitives/slot` merges its
   own `className` with the child's by joining the two strings, never through
   `cn()`, so a conflict there is decided by stylesheet order. Style either the
   wrapper or the slotted child, not both.
4. **Spread `{...props}` before applying `className`**, so a spread cannot
   clobber the base styles.
5. **Recolour text through `TextClassContext`, not a private label element.**
   RN does not inherit text colour; publishing the classes instead of applying
   them is what lets `<Button>` accept an icon, two Texts, or a Badge.
6. **Reach for a CSS mechanism before an imperative prop.** react-native-css
   maps `::placeholder { color }` onto `placeholderTextColor`, `::selection`
   onto `selectionColor`, and `ActivityIndicator`'s `color` prop from the CSS
   `color` property — so `placeholder:text-fg-muted` beats a hard-coded hex.
   Supported pseudo-classes are `hover`, `active`, `focus`, `disabled`, `empty`.
7. **Prefer NativeWind's `ios:` / `android:` / `native:` / `web:` variants** over
   `Platform.select` inside `cn()`.
8. **No `tailwindcss-animate`.** react-native-css does not implement
   `animate-in`. Tailwind's own `animate-*` keyframes (e.g. `animate-pulse`) do
   work; anything richer should use `react-native-reanimated`.
9. **One component per file, kebab-case**, `Props` exported, `ref` taken as a
   plain prop (React 19 — no `forwardRef`), and `asChild` forwarded wherever the
   underlying primitive supports it.
10. **Import icons one at a time, by path.**
    `import Check from 'lucide-react-native/icons/check'` — kebab-case module,
    default export. The barrel re-exports 1768 icon modules and Metro does not
    tree-shake: its experimental pass is off by default and `metro.config.js`
    must stay optionless. Measured on this repo, switching a single icon from
    the deep path to `import { Check } from 'lucide-react-native'` grew the iOS
    bundle from **5.38MB to 7.20MB (+1.82MB, +34%)**. `eslint` enforces this in
    this package *and* in `apps/native` (the workspace Metro actually bundles);
    the one exception it allows is `import type { LucideProps }` in `icon.tsx`,
    which Babel erases.
    Colour and size come from `className`, never props — `<Icon as={Check} />`
    reads `TextClassContext` exactly as `Text` does, so a glyph inside a
    `ghost` Button is the right colour with nothing at the call site.

## Adding a utility that only this package uses

`apps/native/src/global.css` carries an `@source "../../../packages/ui/src"`
line. Tailwind's automatic source detection stops at `apps/native` and will not
follow the workspace symlink, so without it any class used *only* here is never
emitted and the component silently renders unstyled. Keep that line.

## Components

| | Built on |
|---|---|
| `text` | `Text` + `TextClassContext` |
| `button` | `Pressable` + `@rn-primitives/slot` |
| `input`, `label`, `field` | `TextInput`, `@rn-primitives/label` |
| `card`, `badge`, `skeleton`, `alert` | `View` |
| `separator` | `@rn-primitives/separator` |
| `icon` | `lucide-react-native` + `styled()` from `react-native-css` |
| `textarea` | `Input` with `multiline` |
| `checkbox`, `radio-group`, `switch` | `@rn-primitives/checkbox`, `/radio-group`, `/switch` |
| `toggle`, `toggle-group` | `@rn-primitives/toggle`, `/toggle-group` (both reuse `buttonVariants`) |
| `progress`, `tabs` | `@rn-primitives/progress`, `/tabs` |
| `collapsible`, `accordion` | `@rn-primitives/collapsible`, `/accordion` |
| `portal` | `@rn-primitives/portal` + `FullWindowOverlay` (iOS) |
| `dialog`, `alert-dialog` | `@rn-primitives/dialog`, `/alert-dialog` |
| `sheet` | `@rn-primitives/dialog`, anchored to an edge |
| `popover` | `@rn-primitives/popover` |
| `dropdown-menu`, `context-menu` | `@rn-primitives/dropdown-menu`, `/context-menu` |
| `select` | `@rn-primitives/select` (value is an `Option` object, not a string) |
| `tooltip` | `@rn-primitives/tooltip` (press-toggled, auto-dismisses) |
| `toast` | `@rn-primitives/toast` + `ToastProvider` / `useToast()` |

`themed-text` and `themed-view` are deprecated. They remain only for the
Expo-template screens (`explore`, `collapsible`, `hint-row`, `web-badge`) that
still use `StyleSheet` and `constants/theme.ts`.

`apps/native/src/app/ui-kit.tsx` renders every component in every variant and
state, and is the fastest way to check a change.

## Aspect ratio needs no component

`react-native-css` compiles the CSS `aspect-ratio` property straight to React
Native's `aspectRatio` style, so `aspect-square`, `aspect-[16/9]` and
`aspect-video` all work and `@rn-primitives/aspect-ratio` buys nothing. The
utility is also strictly better than the primitive would be: `aspect-[16/9]` is
overridable through `cn()`, a `ratio={16 / 9}` prop is not. Prefer the literal
forms — `aspect-video` resolves through a `var(--aspect-video)` hop, which
works but is one more thing that can fold.

## Overlays need a host

Everything portal-based renders **nothing, silently** — no error, no warning —
unless `<UiPortalHost />` from `@repo/ui/portal` is mounted as the **last** child
of `apps/native/src/app/_layout.tsx`, and `<ToastProvider>` wraps the navigator
if you use `useToast()`. That is the first thing to check when an overlay "does
not open".

Two rules matter when authoring one, both learned the hard way and both
documented at the top of `popover.tsx`:

- **Nest `Content` inside `Overlay`.** As siblings the scrim swallows every
  touch aimed at the content, while still rendering and positioning perfectly.
- **On positioned overlays the inline positioning style beats your classes.**
  `absolute`, `top-*`/`left-*`/`right-*`/`bottom-*` and `max-w-*` are dead;
  `min-w-*` is the width lever, `max-h-*` is free.

## What is not built yet

`slider` — the primitive ships no gesture handling at all, so it means a
hand-written PanResponder plus `onLayout` measurement. Plus `toolbar`, `avatar`,
`table`, and `menubar` / `navigation-menu` / `hover-card`, all skipped as
low-value on a phone. See **[ROADMAP.md](./ROADMAP.md)**.
