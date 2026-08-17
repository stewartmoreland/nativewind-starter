import * as SwitchPrimitive from '@rn-primitives/switch';

import { cn } from './lib/cn';

/*
 * This is `@rn-primitives/switch`, NOT React Native's own `Switch`.
 *
 * The distinction is a genuine hazard here rather than pedantry: react-native-css
 * polyfills RN's Switch (`react-native-css/src/components/Switch.tsx`), and
 * withNativewind's globalClassNamePolyfill redirects `react-native` to those
 * polyfilled copies. So `import { Switch } from 'react-native'` yields the
 * platform switch WITH a working className — it renders, it accepts classes,
 * and it looks plausible. The wrong import produces a different-looking
 * control, not an error. The two names never appear together in this file for
 * exactly that reason.
 */

export type SwitchProps = SwitchPrimitive.RootProps & {
  className?: string;
  /** Styles the sliding knob. */
  thumbClassName?: string;
};

/**
 * The primitive supplies behaviour and accessibility only — it does no layout
 * and no animation, so the track geometry and the thumb offset are ours. The
 * travel is 20px: a 48px track, less 2×2px padding, less a 24px thumb.
 *
 * `transition-transform` is not decoration: react-native-css compiles any
 * `transition-*` rule into reanimated's CSS-transition props and swaps the
 * element for an Animated one, which is the same path `animate-pulse` takes in
 * skeleton.tsx. If it ever fails to ease, dropping the class leaves a correct
 * static result.
 */
export function Switch({
  checked,
  className,
  thumbClassName,
  ...props
}: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      {...props}
      className={cn(
        'h-7 w-12 shrink-0 flex-row items-center rounded-full p-0.5 disabled:opacity-50',
        checked ? 'bg-brand' : 'bg-surface-selected',
        className,
      )}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'size-6 rounded-full bg-bg transition-transform duration-200 ease-standard',
          checked && 'translate-x-5',
          thumbClassName,
        )}
      />
    </SwitchPrimitive.Root>
  );
}
