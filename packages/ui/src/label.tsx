import * as LabelPrimitive from '@rn-primitives/label';

import { cn } from './lib/cn';

export type LabelProps = LabelPrimitive.TextProps & {
  className?: string;
  /** Applied to the pressable wrapper rather than the text. */
  containerClassName?: string;
};

/**
 * Pressing a Label moves focus to the input it labels. `nativeID` here should
 * match the input's `aria-labelledby`.
 */
export function Label({ className, containerClassName, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root className={containerClassName}>
      <LabelPrimitive.Text
        {...props}
        className={cn('text-sm font-medium text-fg', className)}
      />
    </LabelPrimitive.Root>
  );
}
