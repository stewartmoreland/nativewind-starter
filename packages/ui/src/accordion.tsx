import type { ReactNode } from 'react';
import * as AccordionPrimitive from '@rn-primitives/accordion';
import { cva } from 'class-variance-authority';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import { View } from 'react-native';

import { Icon } from './icon';
import { cn } from './lib/cn';
import { TextClassContext } from './lib/text-class-context';

export const accordionItemVariants = cva('border-b border-border');

export const accordionTriggerVariants = cva(
  'flex-row items-center justify-between gap-4 py-4 active:opacity-80 disabled:opacity-50',
);

export const accordionTriggerTextVariants = cva(
  'flex-1 text-base font-medium text-fg',
);

export const accordionChevronVariants = cva(
  'transition-transform duration-200 ease-standard',
  {
    variants: { expanded: { true: 'rotate-180', false: 'rotate-0' } },
    defaultVariants: { expanded: false },
  },
);

export type AccordionProps = AccordionPrimitive.RootProps & {
  className?: string;
};

/**
 * The `type: 'single' | 'multiple'` discriminated union is forwarded verbatim.
 * Flattening it would let `type="single"` take a `string[]` default value.
 */
export function Accordion({ className, ...props }: AccordionProps) {
  return (
    <AccordionPrimitive.Root {...props} className={cn('w-full', className)} />
  );
}

export type AccordionItemProps = AccordionPrimitive.ItemProps & {
  className?: string;
};

export function AccordionItem({ className, ...props }: AccordionItemProps) {
  return (
    <AccordionPrimitive.Item
      {...props}
      className={cn(accordionItemVariants(), className)}
    />
  );
}

export type AccordionTriggerProps = Omit<
  AccordionPrimitive.TriggerProps,
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

/**
 * No animated height, deliberately: the primitive's Content unmounts when
 * collapsed, and a CSS transition can neither animate a mount nor interpolate
 * to `height: auto` — in RN no more than in the browser. Getting it would mean
 * forceMount plus an onLayout measurement plus an imperative animation, for a
 * 200ms effect. The chevron rotation IS a class change on a mounted element,
 * so it animates for free through react-native-css's transition path.
 */
export function AccordionTrigger({
  className,
  chevronClassName,
  children,
  ...props
}: AccordionTriggerProps) {
  const { isExpanded } = AccordionPrimitive.useItemContext();

  return (
    <TextClassContext.Provider value={accordionTriggerTextVariants()}>
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger
          {...props}
          className={cn(accordionTriggerVariants(), className)}
        >
          {children}
          <View
            className={cn(
              accordionChevronVariants({ expanded: isExpanded }),
              chevronClassName,
            )}
          >
            <Icon as={ChevronDown} className="size-4 text-fg-muted" />
          </View>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
    </TextClassContext.Provider>
  );
}

export type AccordionContentProps = AccordionPrimitive.ContentProps & {
  className?: string;
};

export function AccordionContent({
  className,
  ...props
}: AccordionContentProps) {
  return (
    <AccordionPrimitive.Content
      {...props}
      className={cn('gap-2 pb-4', className)}
    />
  );
}
