import type { ReactNode } from 'react';
import * as SelectPrimitive from '@rn-primitives/select';
import { cva } from 'class-variance-authority';
import Check from 'lucide-react-native/icons/check';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import { ScrollView, View } from 'react-native';

import { Icon } from './icon';
import { cn } from './lib/cn';
import { TextClassContext } from './lib/text-class-context';

/*
 * A positioned overlay — read the mechanics note at the top of `popover.tsx`.
 *
 * Two things about this primitive's API surprise people:
 *
 * 1. **The value is an object, not a string.** `SelectOption` is
 *    `{ value, label } | undefined`, and `onValueChange` hands back that shape.
 *    An `Item` therefore needs BOTH props — its `ItemText` renders `label` from
 *    context and ignores children entirely.
 * 2. **`Root` cannot be controlled for open/closed** (it does take `value`).
 *    There is no `open` prop; programmatic control is the Trigger ref's
 *    `open()` / `close()`.
 */

/** Re-exported so a call site can type its state without a second import. */
export type SelectOption = SelectPrimitive.Option;

export const selectTriggerVariants = cva(
  'h-12 w-full flex-row items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 active:opacity-80 disabled:opacity-50',
);

export const selectValueVariants = cva('text-base', {
  variants: {
    placeholder: { true: 'text-fg-muted', false: 'text-fg' },
  },
  defaultVariants: { placeholder: true },
});

export const selectChevronVariants = cva(
  'transition-transform duration-200 ease-standard',
  {
    variants: { open: { true: 'rotate-180', false: 'rotate-0' } },
    defaultVariants: { open: false },
  },
);

export const selectOverlayVariants = cva('absolute inset-0');

export const selectContentVariants = cva(
  'min-w-56 rounded-lg border border-border bg-surface p-1',
);

export const selectItemVariants = cva(
  'h-11 flex-row items-center gap-2 rounded-md px-2 active:bg-surface-selected disabled:opacity-50',
);

export const selectItemTextVariants = cva('flex-1 text-base text-fg');

export const selectLabelVariants = cva(
  'px-2 py-1.5 text-xs font-semibold text-fg-muted',
);

export type SelectProps = SelectPrimitive.RootProps & { className?: string };

export function Select(props: SelectProps) {
  return <SelectPrimitive.Root {...props} />;
}

export type SelectTriggerProps = Omit<
  SelectPrimitive.TriggerProps,
  'children'
> & {
  /**
   * Narrowed from Pressable's `ReactNode | (state) => ReactNode`: the chevron
   * renders as a sibling of these children, and a render-prop child has no
   * sibling to sit beside. Same narrowing as `collapsible.tsx`.
   */
  children?: ReactNode;
  className?: string;
  /** Styles the chevron's rotating wrapper. */
  chevronClassName?: string;
};

/**
 * The only animation in the overlay phase, and it is legal for a specific
 * reason: the trigger lives OUTSIDE the portal on a permanently mounted
 * element, so `transition-transform` has a mounted class change to interpolate.
 * The portalled Content has no such thing — it mounts already in its final
 * state — which is why nothing else here animates.
 *
 * The rotation goes on a plain View rather than the Icon, exactly as in
 * `collapsible.tsx`: a transition makes react-native-css swap the element for
 * `createAnimatedComponent(type)`, and a bare View is the type guaranteed to
 * survive that swap. Colour stays on the Icon so TextClassContext still reaches
 * it.
 *
 * `disabled` is forwarded from the Root because the primitive does NOT do it:
 * its Trigger defaults its own `disabled` prop to `false` and then computes
 * `disabled ?? disabledRoot`, and `false` is not nullish — so the root's flag
 * only ever reaches `accessibilityState`, never the press guard. Without this
 * line `<Select disabled>` announces as disabled, looks enabled, and opens.
 * Passing it BEFORE `{...props}` keeps a per-trigger override working.
 */
export function SelectTrigger({
  className,
  chevronClassName,
  children,
  ...props
}: SelectTriggerProps) {
  const { open, disabled } = SelectPrimitive.useRootContext();

  return (
    <SelectPrimitive.Trigger
      disabled={disabled}
      {...props}
      className={cn(selectTriggerVariants(), className)}
    >
      {children}
      <View className={cn(selectChevronVariants({ open }), chevronClassName)}>
        <Icon as={ChevronDown} className="size-4 text-fg-muted" />
      </View>
    </SelectPrimitive.Trigger>
  );
}

export type SelectValueProps = SelectPrimitive.ValueProps & {
  className?: string;
};

/**
 * Applies its own classes rather than relying on TextClassContext: the
 * primitive's Value renders a raw RN `Text`, not our `Text`, so it never reads
 * the context. The placeholder branch comes from the root value.
 */
export function SelectValue({ className, ...props }: SelectValueProps) {
  const { value } = SelectPrimitive.useRootContext();

  return (
    <SelectPrimitive.Value
      {...props}
      className={cn(selectValueVariants({ placeholder: !value }), className)}
    />
  );
}

export const SelectPortal = SelectPrimitive.Portal;
export const SelectOverlay = SelectPrimitive.Overlay;
export const SelectGroup = SelectPrimitive.Group;

export type SelectContentProps = SelectPrimitive.ContentProps & {
  className?: string;
  /** Styles the invisible press-catcher behind the list. */
  overlayClassName?: string;
  /** Styles the scrolling list itself — this is where `max-h-*` belongs. */
  scrollClassName?: string;
  /** Targets a named `<UiPortalHost name="…" />` instead of the default one. */
  portalHost?: string;
};

/**
 * The height cap is on the ScrollView, not on Content. Content already carries
 * an inline `maxWidth` from the positioning hook, and its measured height is fed
 * back into that hook through `onLayout` — a class-level `max-h` there would
 * fight the measurement rather than bound the list.
 */
export function SelectContent({
  side = 'bottom',
  align = 'start',
  sideOffset = 4,
  className,
  overlayClassName,
  scrollClassName,
  portalHost,
  children,
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal hostName={portalHost}>
      <SelectPrimitive.Overlay
        className={cn(selectOverlayVariants(), overlayClassName)}
      >
        <SelectPrimitive.Content
          side={side}
          align={align}
          sideOffset={sideOffset}
          {...props}
          className={cn(selectContentVariants(), className)}
        >
          <ScrollView
            className={cn('max-h-80', scrollClassName)}
            contentContainerClassName="gap-0.5"
            bounces={false}
          >
            {children}
          </ScrollView>
        </SelectPrimitive.Content>
      </SelectPrimitive.Overlay>
    </SelectPrimitive.Portal>
  );
}

export type SelectItemProps = SelectPrimitive.ItemProps & {
  className?: string;
  /** Styles the label text. */
  textClassName?: string;
};

/**
 * `label` is required and is what actually renders — `ItemText` reads it from
 * context and ignores children.
 *
 * Unlike the menu family's, this `ItemIndicator` is safe anywhere inside an
 * `Item`: it reads the item context rather than the form-item context that
 * `CheckboxItem`/`RadioGroup` provide, so it cannot throw here.
 */
export function SelectItem({
  className,
  textClassName,
  ...props
}: SelectItemProps) {
  return (
    <TextClassContext.Provider value={selectItemTextVariants()}>
      <SelectPrimitive.Item
        {...props}
        className={cn(selectItemVariants(), className)}
      >
        <SelectPrimitive.ItemText
          className={cn(selectItemTextVariants(), textClassName)}
        />
        {/* Trailing, iOS convention — a checkmark beside the chosen row. */}
        <View className="size-4 items-center justify-center">
          <SelectPrimitive.ItemIndicator>
            <Icon as={Check} className="size-4 text-brand" />
          </SelectPrimitive.ItemIndicator>
        </View>
      </SelectPrimitive.Item>
    </TextClassContext.Provider>
  );
}

export type SelectLabelProps = SelectPrimitive.LabelProps & {
  className?: string;
};

export function SelectLabel({ className, ...props }: SelectLabelProps) {
  return (
    <SelectPrimitive.Label
      {...props}
      className={cn(selectLabelVariants(), className)}
    />
  );
}

export type SelectSeparatorProps = SelectPrimitive.SeparatorProps & {
  className?: string;
};

export function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return (
    <SelectPrimitive.Separator
      {...props}
      className={cn('my-1 h-px w-full bg-border', className)}
    />
  );
}

/*
 * `ScrollUpButton`, `ScrollDownButton` and `Viewport` are deliberately NOT
 * re-exported: on native they are passthrough fragments that exist only so the
 * web build can mirror Radix's API.
 */
