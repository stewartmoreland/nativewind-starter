import * as TabsPrimitive from '@rn-primitives/tabs';
import { cva } from 'class-variance-authority';

import { cn } from './lib/cn';
import { TextClassContext } from './lib/text-class-context';

/*
 * These are CONTENT tabs — a segmented control inside a screen. They are not
 * `expo-router`'s NativeTabs, which drives app navigation in
 * `apps/native/src/components/app-tabs.tsx` and takes imperative colour props
 * rather than classNames. Reaching for this one to build a tab bar loses the
 * native bar; reaching for that one here loses `className`.
 */

export const tabsListVariants = cva(
  'flex-row items-center gap-1 rounded-lg bg-surface p-1',
);

export const tabsTriggerVariants = cva(
  'flex-1 flex-row items-center justify-center gap-2 rounded-md px-3 py-2 active:opacity-80 disabled:opacity-50',
  {
    variants: { active: { true: 'bg-bg', false: 'bg-transparent' } },
    defaultVariants: { active: false },
  },
);

export const tabsTriggerTextVariants = cva('text-sm font-medium', {
  variants: { active: { true: 'text-fg', false: 'text-fg-muted' } },
  defaultVariants: { active: false },
});

export type TabsProps = TabsPrimitive.RootProps & { className?: string };

/** Controlled only: the primitive requires `value` and `onValueChange`. */
export function Tabs({ className, ...props }: TabsProps) {
  return <TabsPrimitive.Root {...props} className={cn('gap-3', className)} />;
}

export type TabsListProps = TabsPrimitive.ListProps & { className?: string };

export function TabsList({ className, ...props }: TabsListProps) {
  return (
    <TabsPrimitive.List
      {...props}
      className={cn(tabsListVariants(), className)}
    />
  );
}

export type TabsTriggerProps = TabsPrimitive.TriggerProps & {
  className?: string;
};

/**
 * The primitive publishes the selected value on a context and gives the Trigger
 * no render prop — it only sets `aria-selected` on its own element — so the
 * styling layer has to read the root value and compare for itself.
 */
export function TabsTrigger({ value, className, ...props }: TabsTriggerProps) {
  const { value: selected } = TabsPrimitive.useRootContext();
  const active = selected === value;

  return (
    <TextClassContext.Provider value={tabsTriggerTextVariants({ active })}>
      <TabsPrimitive.Trigger
        value={value}
        {...props}
        className={cn(tabsTriggerVariants({ active }), className)}
      />
    </TextClassContext.Provider>
  );
}

export type TabsContentProps = TabsPrimitive.ContentProps & {
  className?: string;
};

export function TabsContent({ className, ...props }: TabsContentProps) {
  return (
    <TabsPrimitive.Content {...props} className={cn('gap-2', className)} />
  );
}
