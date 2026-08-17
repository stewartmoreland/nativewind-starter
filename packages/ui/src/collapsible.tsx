import { createContext, useContext, useState, type ReactNode } from 'react';
import * as CollapsiblePrimitive from '@rn-primitives/collapsible';
import { cva } from 'class-variance-authority';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import { View } from 'react-native';

import { Icon } from './icon';
import { cn } from './lib/cn';

export const collapsibleTriggerVariants = cva(
  'flex-row items-center justify-between gap-3 py-2 active:opacity-80 disabled:opacity-50',
);

export const collapsibleChevronVariants = cva(
  'transition-transform duration-200 ease-standard',
  {
    variants: { open: { true: 'rotate-180', false: 'rotate-0' } },
    defaultVariants: { open: false },
  },
);

/**
 * `@rn-primitives/collapsible` exports only { Root, Trigger, Content } — its
 * `useCollapsibleContext` is defined but never exported, unlike accordion's
 * `useItemContext`. So `open` is unreadable from outside, and an uncontrolled
 * Root would keep it that way permanently. Owning the state here and driving
 * the Root fully controlled is the only route to a chevron that knows which
 * way to point, and it keeps one source of truth rather than two.
 */
const CollapsibleOpenContext = createContext(false);

export type CollapsibleProps = CollapsiblePrimitive.RootProps & {
  className?: string;
};

export function Collapsible({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  className,
  ...props
}: CollapsibleProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : uncontrolled;

  function handleOpenChange(next: boolean) {
    // Only the uncontrolled branch may write. Writing unconditionally would
    // re-render on every toggle of a controlled Collapsible for a value that
    // is then discarded, and — worse — would let the shadow copy drift away
    // from `open` whenever the owner declines the change, so the component
    // would jump to that stale value if `open` were ever withdrawn.
    if (!controlled) setUncontrolled(next);
    onOpenChange?.(next);
  }

  return (
    <CollapsibleOpenContext.Provider value={open}>
      <CollapsiblePrimitive.Root
        {...props}
        open={open}
        onOpenChange={handleOpenChange}
        className={cn('gap-2', className)}
      />
    </CollapsibleOpenContext.Provider>
  );
}

export type CollapsibleTriggerProps = Omit<
  CollapsiblePrimitive.TriggerProps,
  'children'
> & {
  /**
   * Narrowed from Pressable's `ReactNode | (state) => ReactNode`: the chevron
   * renders as a sibling of these children, and a render-prop child has no
   * sibling to sit beside.
   */
  children?: ReactNode;
  className?: string;
  /** Styles the chevron's rotating wrapper. */
  chevronClassName?: string;
};

export function CollapsibleTrigger({
  className,
  chevronClassName,
  children,
  ...props
}: CollapsibleTriggerProps) {
  const open = useContext(CollapsibleOpenContext);

  return (
    <CollapsiblePrimitive.Trigger
      {...props}
      className={cn(collapsibleTriggerVariants(), className)}
    >
      {children}
      {/*
        The rotation is on a plain View, not on the Icon. A transition makes
        react-native-css swap the element for createAnimatedComponent(type),
        and a bare View is the thing guaranteed to survive that swap. Colour
        stays on the Icon so TextClassContext still reaches it.
      */}
      <View
        className={cn(collapsibleChevronVariants({ open }), chevronClassName)}
      >
        <Icon as={ChevronDown} className="size-4 text-fg-muted" />
      </View>
    </CollapsiblePrimitive.Trigger>
  );
}

export type CollapsibleContentProps = CollapsiblePrimitive.ContentProps & {
  className?: string;
};

export function CollapsibleContent({
  className,
  ...props
}: CollapsibleContentProps) {
  return (
    <CollapsiblePrimitive.Content
      {...props}
      className={cn('gap-2', className)}
    />
  );
}
