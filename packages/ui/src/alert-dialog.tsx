import * as AlertDialogPrimitive from '@rn-primitives/alert-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { View, type ViewProps } from 'react-native';

import { buttonTextVariants, buttonVariants } from './button';
import { cn } from './lib/cn';
import { TextClassContext } from './lib/text-class-context';

/*
 * Same shape as `dialog`, one behavioural difference: this one cannot be
 * dismissed by pressing the scrim. That is the whole point of the component —
 * the user must choose an action — and it is enforced by the primitive rather
 * than by us: its Overlay is a plain View, not a Pressable, so there is no
 * press to handle.
 *
 * Do NOT "fix" that by passing `onPress` to the Overlay. react-native-css swaps
 * a View carrying an onPress for a Pressable, so it would silently work — and
 * reintroduce exactly the dismissal this component exists to prevent.
 */

export const alertDialogOverlayVariants = cva(
  'absolute inset-0 items-center justify-center bg-overlay p-6',
);

export const alertDialogContentVariants = cva(
  'w-full max-w-md gap-4 rounded-card border border-border bg-surface p-6',
);

export const alertDialogTitleVariants = cva('text-xl font-semibold text-fg');

export const alertDialogDescriptionVariants = cva('text-sm text-fg-muted');

export type AlertDialogProps = AlertDialogPrimitive.RootProps & {
  className?: string;
};

export function AlertDialog(props: AlertDialogProps) {
  return <AlertDialogPrimitive.Root {...props} />;
}

export type AlertDialogTriggerProps = AlertDialogPrimitive.TriggerProps & {
  className?: string;
};

export function AlertDialogTrigger(props: AlertDialogTriggerProps) {
  return <AlertDialogPrimitive.Trigger {...props} />;
}

export const AlertDialogPortal = AlertDialogPrimitive.Portal;
export const AlertDialogOverlay = AlertDialogPrimitive.Overlay;

export type AlertDialogContentProps = AlertDialogPrimitive.ContentProps & {
  className?: string;
  /** Styles the scrim behind the card. */
  overlayClassName?: string;
  /** Targets a named `<UiPortalHost name="…" />` instead of the default one. */
  portalHost?: string;
};

export function AlertDialogContent({
  className,
  overlayClassName,
  portalHost,
  ...props
}: AlertDialogContentProps) {
  return (
    <AlertDialogPrimitive.Portal hostName={portalHost}>
      <AlertDialogPrimitive.Overlay
        className={cn(alertDialogOverlayVariants(), overlayClassName)}
      >
        <AlertDialogPrimitive.Content
          {...props}
          className={cn(alertDialogContentVariants(), className)}
        />
      </AlertDialogPrimitive.Overlay>
    </AlertDialogPrimitive.Portal>
  );
}

export type AlertDialogHeaderProps = ViewProps & { className?: string };

/** No `pr-8` here, unlike DialogHeader — there is no corner close button. */
export function AlertDialogHeader({
  className,
  ...props
}: AlertDialogHeaderProps) {
  return <View {...props} className={cn('gap-1', className)} />;
}

export type AlertDialogFooterProps = ViewProps & { className?: string };

export function AlertDialogFooter({
  className,
  ...props
}: AlertDialogFooterProps) {
  return (
    <View
      {...props}
      className={cn('flex-row items-center justify-end gap-2', className)}
    />
  );
}

export type AlertDialogTitleProps = AlertDialogPrimitive.TitleProps & {
  className?: string;
};

export function AlertDialogTitle({
  className,
  ...props
}: AlertDialogTitleProps) {
  return (
    <AlertDialogPrimitive.Title
      {...props}
      className={cn(alertDialogTitleVariants(), className)}
    />
  );
}

export type AlertDialogDescriptionProps =
  AlertDialogPrimitive.DescriptionProps & { className?: string };

export function AlertDialogDescription({
  className,
  ...props
}: AlertDialogDescriptionProps) {
  return (
    <AlertDialogPrimitive.Description
      {...props}
      className={cn(alertDialogDescriptionVariants(), className)}
    />
  );
}

/**
 * Action and Cancel reuse `buttonVariants` rather than declaring a parallel
 * table, the same way `toggle.tsx` does. That is what keeps them the same
 * height, radius and press feedback as every other Button in the app forever,
 * and it means a destructive confirm is `<AlertDialogAction variant="destructive">`
 * with nothing new to define.
 */
export type AlertDialogActionProps = AlertDialogPrimitive.ActionProps &
  VariantProps<typeof buttonVariants> & { className?: string };

export function AlertDialogAction({
  variant = 'default',
  size,
  className,
  ...props
}: AlertDialogActionProps) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <AlertDialogPrimitive.Action
        {...props}
        className={cn(buttonVariants({ variant, size }), className)}
      />
    </TextClassContext.Provider>
  );
}

export type AlertDialogCancelProps = AlertDialogPrimitive.CancelProps &
  VariantProps<typeof buttonVariants> & { className?: string };

export function AlertDialogCancel({
  variant = 'secondary',
  size,
  className,
  ...props
}: AlertDialogCancelProps) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <AlertDialogPrimitive.Cancel
        {...props}
        className={cn(buttonVariants({ variant, size }), className)}
      />
    </TextClassContext.Provider>
  );
}
