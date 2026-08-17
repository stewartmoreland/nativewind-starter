import { Slot } from '@rn-primitives/slot';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
} from 'react-native';

import { cn } from './lib/cn';
import { TextClassContext } from './lib/text-class-context';

export const buttonVariants = cva(
  'flex-row items-center justify-center gap-2 rounded-md active:opacity-80 disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-brand',
        secondary: 'border border-border bg-surface',
        destructive: 'bg-danger',
        outline: 'border border-border bg-transparent',
        ghost: 'bg-transparent',
        link: 'bg-transparent',
      },
      size: {
        sm: 'h-9 px-3',
        default: 'h-12 px-4',
        lg: 'h-14 px-6',
        icon: 'h-12 w-12 px-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

/** Foreground colour per variant, with no typography mixed in. */
const FOREGROUND = {
  default: 'text-brand-fg',
  secondary: 'text-fg',
  destructive: 'text-danger-fg',
  outline: 'text-fg',
  ghost: 'text-fg',
  link: 'text-brand',
} as const;

/**
 * Published through TextClassContext rather than applied to a private label
 * element, so `<Button>` can take arbitrary children — an icon, two Texts, a
 * Badge — and they all pick up the right colour.
 */
export const buttonTextVariants = cva('font-semibold', {
  variants: {
    variant: { ...FOREGROUND, link: 'text-brand underline' },
    size: {
      sm: 'text-sm',
      default: 'text-base',
      lg: 'text-lg',
      icon: 'text-base',
    },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});

/**
 * Colour only. ActivityIndicator's polyfill lifts the CSS `color` property onto
 * its `color` prop and sends everything else to `style`, which is a ViewStyle —
 * so font classes must not be handed to it.
 */
const spinnerVariants = cva('', {
  variants: { variant: FOREGROUND },
  defaultVariants: { variant: 'default' },
});

export type ButtonProps = PressableProps &
  VariantProps<typeof buttonVariants> & {
    /**
     * Render the single child instead of a `Pressable`, forwarding props to it.
     * Note that `@rn-primitives/slot` merges `className` by string
     * concatenation rather than through `cn()`, so on this path a conflicting
     * class on the child is resolved by stylesheet order, not by the child
     * winning — keep the styling on one side or the other.
     */
    asChild?: boolean;
    /**
     * Swaps the children for a spinner and blocks presses. Ignored under
     * `asChild`, where there is no wrapper to host a spinner.
     */
    loading?: boolean;
    className?: string;
  };

export function Button({
  variant,
  size,
  asChild,
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const Component = asChild ? Slot : Pressable;

  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Component
        accessibilityRole="button"
        accessibilityState={{ disabled: !!isDisabled, busy: loading }}
        {...props}
        disabled={isDisabled}
        className={cn(buttonVariants({ variant, size }), className)}
      >
        {/*
          Not under `asChild`: Slot clones its single child, so a spinner here
          would replace the caller's element — and with it the press target —
          rather than render inside it. `disabled` still blocks the press.
        */}
        {loading && !asChild ? (
          <ActivityIndicator className={spinnerVariants({ variant })} />
        ) : (
          children
        )}
      </Component>
    </TextClassContext.Provider>
  );
}
