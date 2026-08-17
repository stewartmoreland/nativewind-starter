import { createContext, useContext } from 'react';
import * as RadioGroupPrimitive from '@rn-primitives/radio-group';

import { cn } from './lib/cn';

/**
 * `@rn-primitives/radio-group` exports only { Root, Item, Indicator } — its
 * own context is module-private, unlike `toggle-group`, which publishes
 * `useRootContext()`. So an Item cannot ask the primitive whether it is
 * selected, and colouring the ring means carrying the value ourselves. This
 * mirrors the Root's value rather than duplicating state: Root stays the one
 * that owns it.
 */
const RadioGroupValueContext = createContext<string | undefined>(undefined);

export type RadioGroupProps = RadioGroupPrimitive.RootProps & {
  className?: string;
};

export function RadioGroup({ value, className, ...props }: RadioGroupProps) {
  return (
    <RadioGroupValueContext.Provider value={value}>
      <RadioGroupPrimitive.Root
        value={value}
        {...props}
        className={cn('gap-3', className)}
      />
    </RadioGroupValueContext.Provider>
  );
}

export type RadioGroupItemProps = RadioGroupPrimitive.ItemProps & {
  className?: string;
  /** Styles the filled dot. */
  indicatorClassName?: string;
};

/**
 * The indicator is a plain filled View — a radio dot needs no glyph, so this
 * component is buildable without an icon at all.
 */
export function RadioGroupItem({
  value,
  className,
  indicatorClassName,
  ...props
}: RadioGroupItemProps) {
  const selected = useContext(RadioGroupValueContext) === value;

  return (
    <RadioGroupPrimitive.Item
      value={value}
      {...props}
      className={cn(
        'size-5 items-center justify-center rounded-full border border-border bg-surface',
        'active:opacity-80 disabled:opacity-50',
        selected && 'border-brand',
        className,
      )}
    >
      <RadioGroupPrimitive.Indicator
        className={cn('size-2.5 rounded-full bg-brand', indicatorClassName)}
      />
    </RadioGroupPrimitive.Item>
  );
}
