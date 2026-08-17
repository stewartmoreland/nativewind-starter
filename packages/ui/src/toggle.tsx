import * as TogglePrimitive from '@rn-primitives/toggle';
import type { VariantProps } from 'class-variance-authority';

import { buttonTextVariants, buttonVariants } from './button';
import { cn } from './lib/cn';
import { TextClassContext } from './lib/text-class-context';

/**
 * A toggle's chrome is a Button variant rather than a parallel table, which is
 * what keeps a Toggle and a Button the same height, radius, gap and disabled
 * treatment forever — a second table would drift the first time one of them is
 * tuned.
 *
 * The pressed look is purely the `bg-surface-selected` layer applied on top;
 * the Button variant does NOT change between states. Swapping the default
 * variant to `secondary` when pressed would read fine in a screenshot but adds
 * a 1px border that is absent when off, insetting the content and making the
 * label twitch on every press.
 *
 * Exported so `toggle-group` uses literally this map rather than a copy.
 */
export const toggleButtonVariants = {
  default: 'ghost',
  outline: 'outline',
} as const;

export type ToggleVariant = keyof typeof toggleButtonVariants;

export type ToggleProps = TogglePrimitive.RootProps &
  Pick<VariantProps<typeof buttonVariants>, 'size'> & {
    variant?: ToggleVariant;
    className?: string;
  };

/**
 * Publishing the resolved Button text classes through TextClassContext is what
 * lets a Toggle hold a Text, an Icon, or both and have all of them recolour
 * when it is pressed, with no colour named at the call site.
 *
 * `bg-surface-selected` is layered over the resolved variant's own background,
 * and cn() drops the loser — the same merge guarantee the whole kit rests on.
 */
export function Toggle({
  variant = 'default',
  size,
  pressed,
  className,
  ...props
}: ToggleProps) {
  const resolved = toggleButtonVariants[variant];

  return (
    <TextClassContext.Provider
      value={buttonTextVariants({ variant: resolved, size })}
    >
      <TogglePrimitive.Root
        pressed={pressed}
        {...props}
        className={cn(
          buttonVariants({ variant: resolved, size }),
          pressed && 'bg-surface-selected',
          className,
        )}
      />
    </TextClassContext.Provider>
  );
}
