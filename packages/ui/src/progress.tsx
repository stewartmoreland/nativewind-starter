import * as ProgressPrimitive from '@rn-primitives/progress';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from './lib/cn';

export const progressVariants = cva(
  'w-full overflow-hidden rounded-full bg-surface-selected',
  {
    variants: { size: { sm: 'h-1', default: 'h-2', lg: 'h-3' } },
    defaultVariants: { size: 'default' },
  },
);

export const progressIndicatorVariants = cva('h-full rounded-full bg-brand', {
  variants: { indeterminate: { true: 'w-full animate-pulse', false: '' } },
  defaultVariants: { indeterminate: false },
});

export type ProgressProps = ProgressPrimitive.RootProps &
  VariantProps<typeof progressVariants> & {
    className?: string;
    /** Styles the filled bar. `className` styles the track. */
    indicatorClassName?: string;
  };

/**
 * Pass `value={null}` (or omit it) for an indeterminate bar. The primitive
 * coerces a null value to 0 for `aria-valuenow`, so `busy` is what actually
 * carries "we don't know how far along this is" to a screen reader.
 *
 * `rounded-full` is on the indicator as well as the track: RN honours
 * `overflow: hidden`, but clipping a child's corners has historically been
 * unreliable, and a rounded child is correct either way.
 */
export function Progress({
  value,
  size,
  className,
  indicatorClassName,
  ...props
}: ProgressProps) {
  const indeterminate = value === null || value === undefined;
  // `max` must be positive or the division is meaningless: `max={0}` with
  // `value={0}` — "0 of 0 processed", a real state for an empty batch — yields
  // NaN, and `width: "NaN%"` is a style RN silently drops, leaving the bar at
  // its intrinsic width rather than empty. Fall back to the primitive's own
  // DEFAULT_MAX, which is what it uses for the aria values in that case too.
  const rawMax = props.max ?? 100;
  const max = rawMax > 0 ? rawMax : 100;
  const percent = indeterminate
    ? 100
    : Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <ProgressPrimitive.Root
      value={value}
      accessibilityState={{ busy: indeterminate }}
      {...props}
      className={cn(progressVariants({ size }), className)}
    >
      <ProgressPrimitive.Indicator
        // The width is the one inline style in this file, and it has to be:
        // Tailwind only emits utilities it literally sees in source, so a
        // percentage computed at runtime can never be a class. Everything else
        // here — colour, radius, height — stays a utility.
        style={indeterminate ? undefined : { width: `${percent}%` }}
        className={cn(
          progressIndicatorVariants({ indeterminate }),
          indicatorClassName,
        )}
      />
    </ProgressPrimitive.Root>
  );
}
