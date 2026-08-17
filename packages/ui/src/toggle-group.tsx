import * as ToggleGroupPrimitive from '@rn-primitives/toggle-group';
import type { VariantProps } from 'class-variance-authority';

import { buttonTextVariants, buttonVariants } from './button';
import { toggleButtonVariants, type ToggleVariant } from './toggle';
import { cn } from './lib/cn';
import { TextClassContext } from './lib/text-class-context';

export type ToggleGroupProps = ToggleGroupPrimitive.RootProps & {
  className?: string;
};

/**
 * The `type: 'single' | 'multiple'` discriminated union is forwarded verbatim.
 * Flattening it would let `type="single"` accept a `string[]` value, which the
 * primitive would then hand straight to `onValueChange` as the wrong shape.
 */
export function ToggleGroup({ className, ...props }: ToggleGroupProps) {
  return (
    <ToggleGroupPrimitive.Root
      {...props}
      className={cn('flex-row items-center gap-1', className)}
    />
  );
}

export type ToggleGroupItemProps = ToggleGroupPrimitive.ItemProps &
  Pick<VariantProps<typeof buttonVariants>, 'size'> & {
    variant?: ToggleVariant;
    className?: string;
  };

/**
 * Unlike `radio-group`, this primitive publishes its state: `useRootContext()`
 * plus `utils.getIsSelected()` answer the selected question without a context
 * of our own. Must be rendered inside a `ToggleGroup` — the hook throws
 * otherwise, by design.
 */
export function ToggleGroupItem({
  value,
  variant = 'default',
  size,
  className,
  ...props
}: ToggleGroupItemProps) {
  const { value: groupValue } = ToggleGroupPrimitive.useRootContext();
  const pressed = ToggleGroupPrimitive.utils.getIsSelected(groupValue, value);
  const resolved = toggleButtonVariants[variant];

  return (
    <TextClassContext.Provider
      value={buttonTextVariants({ variant: resolved, size })}
    >
      <ToggleGroupPrimitive.Item
        value={value}
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
