import * as DialogPrimitive from '@rn-primitives/dialog';
import { cva } from 'class-variance-authority';
import X from 'lucide-react-native/icons/x';
import { View, type ViewProps } from 'react-native';

import { Icon } from './icon';
import { cn } from './lib/cn';

/*
 * The first portal-based component in the kit. Everything it does with the
 * portal, `alert-dialog` and `sheet` repeat, so the notes here are the ones
 * worth reading first.
 *
 * Nothing renders unless `<UiPortalHost />` from `@repo/ui/portal` is mounted as
 * the last child of the app's root layout. That failure is silent — no error, no
 * warning, no empty box — so it is the first thing to check when a dialog "does
 * not open".
 */

export const dialogOverlayVariants = cva(
  'absolute inset-0 items-center justify-center bg-overlay p-6',
);

export const dialogContentVariants = cva(
  'w-full max-w-md gap-4 rounded-card border border-border bg-surface p-6',
);

export const dialogCloseVariants = cva(
  'absolute right-4 top-4 size-8 items-center justify-center rounded-md active:opacity-80',
);

export const dialogTitleVariants = cva('text-xl font-semibold text-fg');

export const dialogDescriptionVariants = cva('text-sm text-fg-muted');

export type DialogProps = DialogPrimitive.RootProps & { className?: string };

/**
 * Controllable, unlike the positioned overlays (`popover`, `select`, the menu
 * family), whose Roots keep `open` in their own state and expose nothing but
 * `onOpenChange`. Here `open` / `defaultOpen` / `onOpenChange` all work.
 */
export function Dialog(props: DialogProps) {
  return <DialogPrimitive.Root {...props} />;
}

export type DialogTriggerProps = DialogPrimitive.TriggerProps & {
  className?: string;
};

export function DialogTrigger(props: DialogTriggerProps) {
  return <DialogPrimitive.Trigger {...props} />;
}

export type DialogCloseProps = DialogPrimitive.CloseProps & {
  className?: string;
};

export function DialogClose(props: DialogCloseProps) {
  return <DialogPrimitive.Close {...props} />;
}

export const DialogPortal = DialogPrimitive.Portal;
export const DialogOverlay = DialogPrimitive.Overlay;

export type DialogContentProps = DialogPrimitive.ContentProps & {
  className?: string;
  /** Styles the scrim behind the card. */
  overlayClassName?: string;
  /** Styles the corner close button. */
  closeClassName?: string;
  /** Set false when the dialog must be dismissed through its own actions. */
  showCloseButton?: boolean;
  /** Targets a named `<UiPortalHost name="…" />` instead of the default one. */
  portalHost?: string;
};

/**
 * Content is nested INSIDE Overlay rather than sitting beside it, because the
 * Overlay is the only element here with a size — it is what centres the card.
 * (The positioned family does the opposite; see the note in `popover.tsx`.)
 *
 * Nesting is safe even though the Overlay closes on press: the primitive's
 * Content claims the touch responder with `onStartShouldSetResponder`, so a tap
 * on the card never reaches the scrim's `onPress`. Controls inside the card
 * still work, because responder negotiation gives children first refusal —
 * only the `…Capture` variant would block them.
 *
 * Android's hardware back button already closes the dialog; the primitive
 * registers that listener itself, so do not add one.
 */
export function DialogContent({
  className,
  overlayClassName,
  closeClassName,
  showCloseButton = true,
  portalHost,
  children,
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal hostName={portalHost}>
      <DialogPrimitive.Overlay
        className={cn(dialogOverlayVariants(), overlayClassName)}
      >
        <DialogPrimitive.Content
          {...props}
          className={cn(dialogContentVariants(), className)}
        >
          {children}
          {showCloseButton ? (
            <DialogPrimitive.Close
              className={cn(dialogCloseVariants(), closeClassName)}
            >
              <Icon as={X} label="Close" className="size-4 text-fg-muted" />
            </DialogPrimitive.Close>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Overlay>
    </DialogPrimitive.Portal>
  );
}

export type DialogHeaderProps = ViewProps & { className?: string };

/** `pr-8` reserves the corner the close button sits in. */
export function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return <View {...props} className={cn('gap-1 pr-8', className)} />;
}

export type DialogFooterProps = ViewProps & { className?: string };

export function DialogFooter({ className, ...props }: DialogFooterProps) {
  return (
    <View
      {...props}
      className={cn('flex-row items-center justify-end gap-2', className)}
    />
  );
}

export type DialogTitleProps = DialogPrimitive.TitleProps & {
  className?: string;
};

/**
 * Styles the primitive's own Text rather than slotting our `<Text>` in through
 * `asChild`. Two reasons: the native Title/Description do not destructure
 * `asChild` at all (only the web builds do), and `@rn-primitives/slot` merges
 * className by string concatenation instead of through `cn()`, which would put
 * a caller's override at the mercy of stylesheet order.
 */
export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <DialogPrimitive.Title
      {...props}
      className={cn(dialogTitleVariants(), className)}
    />
  );
}

export type DialogDescriptionProps = DialogPrimitive.DescriptionProps & {
  className?: string;
};

export function DialogDescription({
  className,
  ...props
}: DialogDescriptionProps) {
  return (
    <DialogPrimitive.Description
      {...props}
      className={cn(dialogDescriptionVariants(), className)}
    />
  );
}
