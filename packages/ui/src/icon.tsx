import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react-native';
import { styled, type StyledConfiguration } from 'react-native-css';

import { cn } from './lib/cn';
import { useTextClass } from './lib/text-class-context';

/**
 * A lucide icon component. Import icons ONE AT A TIME, by path:
 *
 *     import Check from 'lucide-react-native/icons/check';
 *
 * kebab-case, default export. The barrel re-exports 1768 icon modules and
 * Metro does not tree-shake — its experimental pass is off by default and
 * `metro.config.js` must stay optionless — so `import { Check } from
 * 'lucide-react-native'` drags ~1.82MB of icon source into the native bundle
 * for one glyph (measured: iOS 5.38MB -> 7.20MB, +34%). The type import above
 * is erased by Babel, so it is free.
 */
export type LucideIconComponent = ComponentType<LucideProps>;

/**
 * `nativeStyleMapping` lifts a computed style value OUT of `style` and onto a
 * prop. It is the only route that works here: react-native-svg's Svg does read
 * width/height off `style`, but lucide always passes explicit width/height
 * PROPS derived from `size ?? 24`, and props win — so a `size-4` left in the
 * style is silently overridden and every icon renders at 24px.
 *
 * Both dimensions target the same scalar because lucide's viewBox is square
 * and `size` is one number; when they differ, `height` wins. `size` and
 * `color` are the right targets because lucide destructures both, so neither
 * leaks onto the child <Path> elements the way its `...rest` spread does.
 *
 * Every value here MUST be a string path, never `true`. react-native-css 3.0.7
 * calls `path.split('.')` on the mapping value unconditionally
 * (native/styles/index.ts), so the `true` shorthand its own types advertise is
 * a TypeError the moment the style carries that key.
 */
const mapping: StyledConfiguration<LucideIconComponent> = {
  className: {
    target: 'style',
    nativeStyleMapping: {
      color: 'color',
      width: 'size',
      height: 'size',
    },
  },
};

/**
 * `styled()` mints a NEW component type per call, and a new type at a tree
 * position unmounts and remounts the subtree. `useMemo` — and React Compiler's
 * auto-memoisation, which is on for this app — both memoise per component
 * INSTANCE, so two sibling `<Icon as={Check} />` would still be two types.
 * Keying on the icon component itself gives one stable type per glyph for the
 * whole app. react-native-css does exactly this internally to wrap components
 * for reanimated (`animatedComponentFamily`, a weakFamily over a WeakMap).
 */
const styledIcons = new WeakMap<LucideIconComponent, LucideIconComponent>();

function styledIcon(icon: LucideIconComponent): LucideIconComponent {
  const cached = styledIcons.get(icon);
  if (cached) return cached;

  const created = styled(icon, mapping) as LucideIconComponent;
  styledIcons.set(icon, created);
  return created;
}

export type IconProps = Omit<LucideProps, 'color' | 'size' | 'className'> & {
  /** The lucide icon to render, e.g. `as={Check}`. */
  as: LucideIconComponent;
  /**
   * Names the icon for a screen reader. Without it the icon is decorative and
   * hidden from accessibility, which is right for an icon beside a label.
   */
  label?: string;
  className?: string;
};

/**
 * `color` and `size` are deliberately not in the public props: they are the two
 * imperative escape hatches that would let a raw colour into a component, and
 * they are exactly what `text-*` and `size-*` already express. `strokeWidth`
 * stays a plain prop — it has no CSS analogue.
 *
 * Note that `opacity-*` double-applies here: it survives in `style`, which
 * lucide spreads onto the root Svg AND every child path, so `opacity-50`
 * renders at 0.25. Put opacity on the parent instead — which is already the
 * house pattern, since Button carries `disabled:opacity-50`.
 */
export function Icon({ as, label, className, ...props }: IconProps) {
  const inherited = useTextClass();
  const Component = styledIcon(as);

  // Same precedence ladder as text.tsx: own default, then the container's
  // TextClassContext, then the caller. A chevron inside a ghost Button is the
  // right colour because the Button published it, with nothing at the call site.
  return (
    <Component
      accessible={!!label}
      accessibilityRole={label ? 'image' : undefined}
      accessibilityLabel={label}
      accessibilityElementsHidden={!label}
      importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}
      aria-hidden={label ? undefined : true}
      {...props}
      className={cn('size-4 text-fg', inherited, className)}
    />
  );
}
