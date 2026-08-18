import type { ReactNode } from 'react';
import * as ContextMenuPrimitive from '@rn-primitives/context-menu';
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
 *
 * Structurally identical to `dropdown-menu.tsx`, and deliberately a separate
 * file rather than a shared factory: the house rule is one component family per
 * file, and a factory would have to abstract over two independent RootContexts
 * and two ItemIndicators whose behaviour can diverge upstream at any release.
 * Duplicating a cva table is the cheaper failure mode. Neither file imports the
 * other.
 *
 * What actually differs is the interaction. The Trigger opens on LONG PRESS,
 * not press, and the menu appears at the finger rather than at the trigger —
 * `Root`'s `relativeTo` defaults to `'longPress'`, which measures a zero-size
 * rect at the touch point. Pass `relativeTo="trigger"` to anchor to the element
 * instead. The Trigger also declares its own `accessibilityActions` and
 * `onAccessibilityAction` so the menu is reachable without the gesture; spread
 * `{...props}` and leave those handlers alone.
 */

/** No colour: a menu should not dim the app, only catch the outside tap. */
export const contextMenuOverlayVariants = cva('absolute inset-0');

export const contextMenuContentVariants = cva(
  'min-w-56 gap-0.5 rounded-lg border border-border bg-surface p-1',
);

export const contextMenuItemVariants = cva(
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

export const contextMenuItemTextVariants = cva('flex-1 text-base', {
  variants: {
    variant: { default: 'text-fg', destructive: 'text-danger' },
  },
  defaultVariants: { variant: 'default' },
});

export const contextMenuLabelVariants = cva(
  'px-2 py-1.5 text-xs font-semibold text-fg-muted',
);

export const contextMenuSeparatorVariants = cva('my-1 h-px w-full bg-border');

export type ContextMenuProps = ContextMenuPrimitive.RootProps & {
  className?: string;
};

export function ContextMenu(props: ContextMenuProps) {
  return <ContextMenuPrimitive.Root {...props} />;
}

export type ContextMenuTriggerProps = ContextMenuPrimitive.TriggerProps & {
  className?: string;
};

/**
 * Opens on LONG PRESS.
 *
 * Under `asChild` the child MUST handle presses itself. The primitive forwards
 * only `onLongPress` — no `onPress` — and react-native-css upgrades a View to a
 * Pressable on `onPress` alone, so slotting a plain View (a `Card`, say) gives
 * a trigger that silently never opens. Slot a `Pressable`, or drop `asChild`
 * and let the Trigger render its own.
 *
 * `ref` is `PressableRef & { open(): void; close(): void }`.
 */
export function ContextMenuTrigger(props: ContextMenuTriggerProps) {
  return <ContextMenuPrimitive.Trigger {...props} />;
}

export const ContextMenuPortal = ContextMenuPrimitive.Portal;
export const ContextMenuOverlay = ContextMenuPrimitive.Overlay;
export const ContextMenuGroup = ContextMenuPrimitive.Group;

export type ContextMenuContentProps = ContextMenuPrimitive.ContentProps & {
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
export function ContextMenuContent({
  side = 'bottom',
  align = 'start',
  sideOffset = 4,
  className,
  overlayClassName,
  portalHost,
  ...props
}: ContextMenuContentProps) {
  return (
    <ContextMenuPrimitive.Portal hostName={portalHost}>
      <ContextMenuPrimitive.Overlay
        className={cn(contextMenuOverlayVariants(), overlayClassName)}
      >
        <ContextMenuPrimitive.Content
          side={side}
          align={align}
          sideOffset={sideOffset}
          {...props}
          className={cn(contextMenuContentVariants(), className)}
        />
      </ContextMenuPrimitive.Overlay>
    </ContextMenuPrimitive.Portal>
  );
}

export type ContextMenuItemProps = ContextMenuPrimitive.ItemProps &
  VariantProps<typeof contextMenuItemVariants> & { className?: string };

/**
 * Colour is published through TextClassContext rather than applied to a private
 * label, which is what lets an item hold an `<Icon>` and a `<Text>` and have
 * BOTH turn red on `variant="destructive"` with nothing at the call site.
 *
 * The provider has to be here, inside the portalled subtree. A TextClassContext
 * wrapped around the `<ContextMenu>` would not reach these: portalled children
 * render at the host's tree position, so they inherit the host's context, not
 * the trigger's.
 */
export function ContextMenuItem({
  variant,
  inset,
  className,
  ...props
}: ContextMenuItemProps) {
  return (
    <TextClassContext.Provider value={contextMenuItemTextVariants({ variant })}>
      <ContextMenuPrimitive.Item
        {...props}
        className={cn(contextMenuItemVariants({ variant, inset }), className)}
      />
    </TextClassContext.Provider>
  );
}

export type ContextMenuCheckboxItemProps = Omit<
  ContextMenuPrimitive.CheckboxItemProps,
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
  Omit<VariantProps<typeof contextMenuItemVariants>, 'inset'> & {
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
export function ContextMenuCheckboxItem({
  variant,
  className,
  children,
  ...props
}: ContextMenuCheckboxItemProps) {
  return (
    <TextClassContext.Provider value={contextMenuItemTextVariants({ variant })}>
      <ContextMenuPrimitive.CheckboxItem
        {...props}
        className={cn(contextMenuItemVariants({ variant }), className)}
      >
        <View className="size-4 items-center justify-center">
          <ContextMenuPrimitive.ItemIndicator>
            <Icon as={Check} className="size-4" />
          </ContextMenuPrimitive.ItemIndicator>
        </View>
        {children}
      </ContextMenuPrimitive.CheckboxItem>
    </TextClassContext.Provider>
  );
}

export type ContextMenuRadioGroupProps =
  ContextMenuPrimitive.RadioGroupProps & { className?: string };

export function ContextMenuRadioGroup(props: ContextMenuRadioGroupProps) {
  return <ContextMenuPrimitive.RadioGroup {...props} />;
}

export type ContextMenuRadioItemProps = Omit<
  ContextMenuPrimitive.RadioItemProps,
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
  Omit<VariantProps<typeof contextMenuItemVariants>, 'inset'> & {
    className?: string;
  /**
   * Narrowed from Pressable's `ReactNode | (state) => ReactNode`: the indicator
   * renders as a sibling of these children, and a render-prop child has no
   * sibling to sit beside. Same narrowing as `accordion.tsx`.
   */
  children?: ReactNode;
  };

/** A filled dot rather than an icon, matching `radio-group.tsx`. */
export function ContextMenuRadioItem({
  variant,
  className,
  children,
  ...props
}: ContextMenuRadioItemProps) {
  return (
    <TextClassContext.Provider value={contextMenuItemTextVariants({ variant })}>
      <ContextMenuPrimitive.RadioItem
        {...props}
        className={cn(contextMenuItemVariants({ variant }), className)}
      >
        <View className="size-4 items-center justify-center">
          <ContextMenuPrimitive.ItemIndicator>
            <View className="size-2 rounded-full bg-brand" />
          </ContextMenuPrimitive.ItemIndicator>
        </View>
        {children}
      </ContextMenuPrimitive.RadioItem>
    </TextClassContext.Provider>
  );
}

export type ContextMenuLabelProps = ContextMenuPrimitive.LabelProps & {
  className?: string;
};

export function ContextMenuLabel({
  className,
  ...props
}: ContextMenuLabelProps) {
  return (
    <ContextMenuPrimitive.Label
      {...props}
      className={cn(contextMenuLabelVariants(), className)}
    />
  );
}

export type ContextMenuSeparatorProps =
  ContextMenuPrimitive.SeparatorProps & { className?: string };

export function ContextMenuSeparator({
  className,
  ...props
}: ContextMenuSeparatorProps) {
  return (
    <ContextMenuPrimitive.Separator
      {...props}
      className={cn(contextMenuSeparatorVariants(), className)}
    />
  );
}

/** Ours, not the primitive's — a trailing hint on the right of an item. */
export function ContextMenuShortcut({ className, ...props }: TextProps) {
  return (
    <Text
      {...props}
      className={cn('ml-auto text-xs text-fg-muted', className)}
    />
  );
}

export type ContextMenuSubProps = ContextMenuPrimitive.SubProps & {
  className?: string;
};

export function ContextMenuSub(props: ContextMenuSubProps) {
  return <ContextMenuPrimitive.Sub {...props} />;
}

export type ContextMenuSubTriggerProps = Omit<
  ContextMenuPrimitive.SubTriggerProps,
  'children'
> &
  VariantProps<typeof contextMenuItemVariants> & {
    className?: string;
  /**
   * Narrowed from Pressable's `ReactNode | (state) => ReactNode`: the chevron
   * renders as a sibling of these children, and a render-prop child has no
   * sibling to sit beside. Same narrowing as `accordion.tsx`.
   */
  children?: ReactNode;
  };

export function ContextMenuSubTrigger({
  variant,
  inset,
  className,
  children,
  ...props
}: ContextMenuSubTriggerProps) {
  return (
    <TextClassContext.Provider value={contextMenuItemTextVariants({ variant })}>
      <ContextMenuPrimitive.SubTrigger
        {...props}
        className={cn(contextMenuItemVariants({ variant, inset }), className)}
      >
        {children}
        <Icon as={ChevronRight} className="size-4 text-fg-muted" />
      </ContextMenuPrimitive.SubTrigger>
    </TextClassContext.Provider>
  );
}

export type ContextMenuSubContentProps =
  ContextMenuPrimitive.SubContentProps & { className?: string };

/**
 * `SubContentProps` carries no positioning props, so on native a sub-menu is not
 * a floating panel — it expands INLINE inside the parent content. That is the
 * right behaviour on a phone (there is nowhere for a flyout to go), but it does
 * mean a deeply nested menu grows the parent rather than escaping it.
 */
export function ContextMenuSubContent({
  className,
  ...props
}: ContextMenuSubContentProps) {
  return (
    <ContextMenuPrimitive.SubContent
      {...props}
      className={cn('gap-0.5 pl-4', className)}
    />
  );
}
