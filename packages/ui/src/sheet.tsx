import * as DialogPrimitive from '@rn-primitives/dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { View, type ViewProps } from 'react-native';

import { cn } from './lib/cn';

/*
 * There is no `@rn-primitives/sheet`, so this is `@rn-primitives/dialog`
 * anchored to an edge instead of centred. That buys the whole component for one
 * cva table and no new dependency.
 *
 * What it deliberately does NOT buy is a drag gesture. Dragging a sheet means
 * PanResponder or gesture-handler plus onLayout measurement plus a spring, and
 * a detent model to snap to — a real component, not a variant. Dismissal here
 * is the scrim or an explicit SheetClose, both of which the primitive already
 * provides.
 */

export const sheetOverlayVariants = cva('absolute inset-0 bg-overlay', {
  variants: {
    side: { bottom: 'justify-end', top: 'justify-start' },
  },
  defaultVariants: { side: 'bottom' },
});

/**
 * `pb-safe-offset-6` rather than `pb-6`: a bottom sheet sits flush against the
 * home indicator, so its padding has to clear the inset as well.
 *
 * That utility compiles to `env(safe-area-inset-bottom)`, which react-native-css
 * resolves from `VariableContext` — a React context, published by the
 * SafeAreaProvider wrapper expo-router mounts. Portalled content inherits the
 * context of the HOST, not of the call site, so this class only works because
 * `<UiPortalHost />` is mounted inside `RootLayout`. If a bottom sheet ever
 * renders with no bottom padding on a notched device, the host has been hoisted
 * out of the provider — this is the class that catches it.
 */
export const sheetContentVariants = cva(
  'w-full gap-4 border-border bg-surface p-6',
  {
    variants: {
      side: {
        bottom: 'rounded-t-card border-t pb-safe-offset-6',
        top: 'rounded-b-card border-b pt-safe-offset-6',
      },
    },
    defaultVariants: { side: 'bottom' },
  },
);

export const sheetHandleVariants = cva(
  'h-1 w-10 self-center rounded-full bg-border',
);

export const sheetTitleVariants = cva('text-lg font-semibold text-fg');

export const sheetDescriptionVariants = cva('text-sm text-fg-muted');

export type SheetProps = DialogPrimitive.RootProps & { className?: string };

export function Sheet(props: SheetProps) {
  return <DialogPrimitive.Root {...props} />;
}

export type SheetTriggerProps = DialogPrimitive.TriggerProps & {
  className?: string;
};

export function SheetTrigger(props: SheetTriggerProps) {
  return <DialogPrimitive.Trigger {...props} />;
}

export type SheetCloseProps = DialogPrimitive.CloseProps & {
  className?: string;
};

export function SheetClose(props: SheetCloseProps) {
  return <DialogPrimitive.Close {...props} />;
}

export type SheetContentProps = DialogPrimitive.ContentProps &
  VariantProps<typeof sheetContentVariants> & {
    className?: string;
    /** Styles the scrim behind the sheet. */
    overlayClassName?: string;
    /** The grabber. Purely decorative here — nothing is draggable. */
    showHandle?: boolean;
    /** Targets a named `<UiPortalHost name="…" />` instead of the default one. */
    portalHost?: string;
  };

/**
 * No `max-h` by default, so a short sheet stays short. A caller that needs a cap
 * passes `className="max-h-[80%]"` and it takes — unlike the positioned overlays
 * (`popover`, `select`, the menu family), whose Content receives an inline style
 * from the positioning hook that beats any class.
 */
export function SheetContent({
  side = 'bottom',
  className,
  overlayClassName,
  showHandle = true,
  portalHost,
  children,
  ...props
}: SheetContentProps) {
  const handle = showHandle ? (
    <View className={sheetHandleVariants()} />
  ) : null;

  return (
    <DialogPrimitive.Portal hostName={portalHost}>
      <DialogPrimitive.Overlay
        className={cn(sheetOverlayVariants({ side }), overlayClassName)}
      >
        <DialogPrimitive.Content
          {...props}
          className={cn(sheetContentVariants({ side }), className)}
        >
          {side === 'bottom' ? handle : null}
          {children}
          {side === 'top' ? handle : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Overlay>
    </DialogPrimitive.Portal>
  );
}

export type SheetHeaderProps = ViewProps & { className?: string };

export function SheetHeader({ className, ...props }: SheetHeaderProps) {
  return <View {...props} className={cn('gap-1', className)} />;
}

export type SheetFooterProps = ViewProps & { className?: string };

export function SheetFooter({ className, ...props }: SheetFooterProps) {
  return (
    <View
      {...props}
      className={cn('flex-row items-center justify-end gap-2', className)}
    />
  );
}

export type SheetTitleProps = DialogPrimitive.TitleProps & {
  className?: string;
};

export function SheetTitle({ className, ...props }: SheetTitleProps) {
  return (
    <DialogPrimitive.Title
      {...props}
      className={cn(sheetTitleVariants(), className)}
    />
  );
}

export type SheetDescriptionProps = DialogPrimitive.DescriptionProps & {
  className?: string;
};

export function SheetDescription({
  className,
  ...props
}: SheetDescriptionProps) {
  return (
    <DialogPrimitive.Description
      {...props}
      className={cn(sheetDescriptionVariants(), className)}
    />
  );
}
