import type { ReactNode } from 'react';
import * as DropdownMenuPrimitive from '@rn-primitives/dropdown-menu';
import { cva, type VariantProps } from 'class-variance-authority';
import Check from 'lucide-react-native/icons/check';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import { View } from 'react-native';

import { Icon } from './icon';
import { Text, type TextProps } from './text';
import { cn } from './lib/cn';
import { TextClassContext } from './lib/text-class-context';

/*
 * A positioned overlay — read the mechanics note at the top of `popover.tsx`
 * first. In particular: `min-w-*` is the only width lever here, `max-w-*` is
 * silently dead, and `Root` cannot be controlled from outside.
 */

/** No colour: a menu should not dim the app, only catch the outside tap. */
export const dropdownMenuOverlayVariants = cva('absolute inset-0');

export const dropdownMenuContentVariants = cva(
  'min-w-56 gap-0.5 rounded-lg border border-border bg-surface p-1',
);

export const dropdownMenuItemVariants = cva(
  'h-10 flex-row items-center gap-2 rounded-md px-2 active:bg-surface-selected disabled:opacity-50',
  {
    variants: {
      /** Colour lives on the text context, not here — see below. */
      variant: { default: '', destructive: '' },
      /** Indents a label to line up with items that carry an indicator. */
      inset: { true: 'pl-8', false: '' },
    },
    defaultVariants: { variant: 'default', inset: false },
  },
);

export const dropdownMenuItemTextVariants = cva('flex-1 text-base', {
  variants: {
    variant: { default: 'text-fg', destructive: 'text-danger' },
  },
  defaultVariants: { variant: 'default' },
});

export const dropdownMenuLabelVariants = cva(
  'px-2 py-1.5 text-xs font-semibold text-fg-muted',
);

export const dropdownMenuSeparatorVariants = cva('my-1 h-px w-full bg-border');

export type DropdownMenuProps = DropdownMenuPrimitive.RootProps & {
  className?: string;
};

export function DropdownMenu(props: DropdownMenuProps) {
  return <DropdownMenuPrimitive.Root {...props} />;
}

export type DropdownMenuTriggerProps = DropdownMenuPrimitive.TriggerProps & {
  className?: string;
};

/** `ref` is `PressableRef & { open(): void; close(): void }`. */
export function DropdownMenuTrigger(props: DropdownMenuTriggerProps) {
  return <DropdownMenuPrimitive.Trigger {...props} />;
}

export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
export const DropdownMenuOverlay = DropdownMenuPrimitive.Overlay;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;

export type DropdownMenuContentProps = DropdownMenuPrimitive.ContentProps & {
  className?: string;
  /** Styles the invisible press-catcher behind the menu. */
  overlayClassName?: string;
  /** Targets a named `<UiPortalHost name="…" />` instead of the default one. */
  portalHost?: string;
};

/**
 * The primitive's Content is a Pressable that already sets `accessible={false}`
 * so the items announce individually — do not pass `accessible`.
 */
export function DropdownMenuContent({
  side = 'bottom',
  align = 'start',
  sideOffset = 4,
  className,
  overlayClassName,
  portalHost,
  ...props
}: DropdownMenuContentProps) {
  return (
    <DropdownMenuPrimitive.Portal hostName={portalHost}>
      <DropdownMenuPrimitive.Overlay
        className={cn(dropdownMenuOverlayVariants(), overlayClassName)}
      >
        <DropdownMenuPrimitive.Content
          side={side}
          align={align}
          sideOffset={sideOffset}
          {...props}
          className={cn(dropdownMenuContentVariants(), className)}
        />
      </DropdownMenuPrimitive.Overlay>
    </DropdownMenuPrimitive.Portal>
  );
}

export type DropdownMenuItemProps = DropdownMenuPrimitive.ItemProps &
  VariantProps<typeof dropdownMenuItemVariants> & { className?: string };

/**
 * Colour is published through TextClassContext rather than applied to a private
 * label, which is what lets an item hold an `<Icon>` and a `<Text>` and have
 * BOTH turn red on `variant="destructive"` with nothing at the call site.
 *
 * The provider has to be here, inside the portalled subtree. A TextClassContext
 * wrapped around the `<DropdownMenu>` would not reach these: portalled children
 * render at the host's tree position, so they inherit the host's context, not
 * the trigger's.
 */
export function DropdownMenuItem({
  variant,
  inset,
  className,
  ...props
}: DropdownMenuItemProps) {
  return (
    <TextClassContext.Provider value={dropdownMenuItemTextVariants({ variant })}>
      <DropdownMenuPrimitive.Item
        {...props}
        className={cn(dropdownMenuItemVariants({ variant, inset }), className)}
      />
    </TextClassContext.Provider>
  );
}

export type DropdownMenuCheckboxItemProps = Omit<
  DropdownMenuPrimitive.CheckboxItemProps,
  'children'
> &
  /*
   * `inset` is omitted deliberately. It indents an item that carries no
   * indicator so it lines up with ones that do — and this item always carries
   * one, so the class would only double-indent it. Leaving it in the type was
   * worse than useless: the component does not destructure it, so it fell
   * through `{...props}` onto the primitive's Pressable as an unknown native
   * prop while applying nothing.
   */
  Omit<VariantProps<typeof dropdownMenuItemVariants>, 'inset'> & {
    className?: string;
  /**
   * Narrowed from Pressable's `ReactNode | (state) => ReactNode`: the indicator
   * renders as a sibling of these children, and a render-prop child has no
   * sibling to sit beside. Same narrowing as `accordion.tsx`.
   */
  children?: ReactNode;
  };

/**
 * The indicator sits in a fixed-size slot so labels line up whether or not the
 * item is checked — `ItemIndicator` renders nothing when it is not.
 *
 * Note that this family's `ItemIndicator` THROWS outside a CheckboxItem or a
 * RadioGroup: it reads a form-item context that only those two provide. It is
 * not a general-purpose indicator, and must never appear in a plain Item.
 * (`select`'s is different — see the note in `select.tsx`.)
 */
export function DropdownMenuCheckboxItem({
  variant,
  className,
  children,
  ...props
}: DropdownMenuCheckboxItemProps) {
  return (
    <TextClassContext.Provider value={dropdownMenuItemTextVariants({ variant })}>
      <DropdownMenuPrimitive.CheckboxItem
        {...props}
        className={cn(dropdownMenuItemVariants({ variant }), className)}
      >
        <View className="size-4 items-center justify-center">
          <DropdownMenuPrimitive.ItemIndicator>
            <Icon as={Check} className="size-4" />
          </DropdownMenuPrimitive.ItemIndicator>
        </View>
        {children}
      </DropdownMenuPrimitive.CheckboxItem>
    </TextClassContext.Provider>
  );
}

export type DropdownMenuRadioGroupProps =
  DropdownMenuPrimitive.RadioGroupProps & { className?: string };

export function DropdownMenuRadioGroup(props: DropdownMenuRadioGroupProps) {
  return <DropdownMenuPrimitive.RadioGroup {...props} />;
}

export type DropdownMenuRadioItemProps = Omit<
  DropdownMenuPrimitive.RadioItemProps,
  'children'
> &
  /*
   * `inset` is omitted deliberately. It indents an item that carries no
   * indicator so it lines up with ones that do — and this item always carries
   * one, so the class would only double-indent it. Leaving it in the type was
   * worse than useless: the component does not destructure it, so it fell
   * through `{...props}` onto the primitive's Pressable as an unknown native
   * prop while applying nothing.
   */
  Omit<VariantProps<typeof dropdownMenuItemVariants>, 'inset'> & {
    className?: string;
  /**
   * Narrowed from Pressable's `ReactNode | (state) => ReactNode`: the indicator
   * renders as a sibling of these children, and a render-prop child has no
   * sibling to sit beside. Same narrowing as `accordion.tsx`.
   */
  children?: ReactNode;
  };

/** A filled dot rather than an icon, matching `radio-group.tsx`. */
export function DropdownMenuRadioItem({
  variant,
  className,
  children,
  ...props
}: DropdownMenuRadioItemProps) {
  return (
    <TextClassContext.Provider value={dropdownMenuItemTextVariants({ variant })}>
      <DropdownMenuPrimitive.RadioItem
        {...props}
        className={cn(dropdownMenuItemVariants({ variant }), className)}
      >
        <View className="size-4 items-center justify-center">
          <DropdownMenuPrimitive.ItemIndicator>
            <View className="size-2 rounded-full bg-brand" />
          </DropdownMenuPrimitive.ItemIndicator>
        </View>
        {children}
      </DropdownMenuPrimitive.RadioItem>
    </TextClassContext.Provider>
  );
}

export type DropdownMenuLabelProps = DropdownMenuPrimitive.LabelProps & {
  className?: string;
};

export function DropdownMenuLabel({
  className,
  ...props
}: DropdownMenuLabelProps) {
  return (
    <DropdownMenuPrimitive.Label
      {...props}
      className={cn(dropdownMenuLabelVariants(), className)}
    />
  );
}

export type DropdownMenuSeparatorProps =
  DropdownMenuPrimitive.SeparatorProps & { className?: string };

export function DropdownMenuSeparator({
  className,
  ...props
}: DropdownMenuSeparatorProps) {
  return (
    <DropdownMenuPrimitive.Separator
      {...props}
      className={cn(dropdownMenuSeparatorVariants(), className)}
    />
  );
}

/** Ours, not the primitive's — a trailing hint on the right of an item. */
export function DropdownMenuShortcut({ className, ...props }: TextProps) {
  return (
    <Text
      {...props}
      className={cn('ml-auto text-xs text-fg-muted', className)}
    />
  );
}

export type DropdownMenuSubProps = DropdownMenuPrimitive.SubProps & {
  className?: string;
};

export function DropdownMenuSub(props: DropdownMenuSubProps) {
  return <DropdownMenuPrimitive.Sub {...props} />;
}

export type DropdownMenuSubTriggerProps = Omit<
  DropdownMenuPrimitive.SubTriggerProps,
  'children'
> &
  VariantProps<typeof dropdownMenuItemVariants> & {
    className?: string;
  /**
   * Narrowed from Pressable's `ReactNode | (state) => ReactNode`: the chevron
   * renders as a sibling of these children, and a render-prop child has no
   * sibling to sit beside. Same narrowing as `accordion.tsx`.
   */
  children?: ReactNode;
  };

export function DropdownMenuSubTrigger({
  variant,
  inset,
  className,
  children,
  ...props
}: DropdownMenuSubTriggerProps) {
  return (
    <TextClassContext.Provider value={dropdownMenuItemTextVariants({ variant })}>
      <DropdownMenuPrimitive.SubTrigger
        {...props}
        className={cn(dropdownMenuItemVariants({ variant, inset }), className)}
      >
        {children}
        <Icon as={ChevronRight} className="size-4 text-fg-muted" />
      </DropdownMenuPrimitive.SubTrigger>
    </TextClassContext.Provider>
  );
}

export type DropdownMenuSubContentProps =
  DropdownMenuPrimitive.SubContentProps & { className?: string };

/**
 * `SubContentProps` carries no positioning props, so on native a sub-menu is not
 * a floating panel — it expands INLINE inside the parent content. That is the
 * right behaviour on a phone (there is nowhere for a flyout to go), but it does
 * mean a deeply nested menu grows the parent rather than escaping it.
 */
export function DropdownMenuSubContent({
  className,
  ...props
}: DropdownMenuSubContentProps) {
  return (
    <DropdownMenuPrimitive.SubContent
      {...props}
      className={cn('gap-0.5 pl-4', className)}
    />
  );
}
