import * as PopoverPrimitive from '@rn-primitives/popover';
import { cva } from 'class-variance-authority';

import { cn } from './lib/cn';

/*
 * The first of the POSITIONED overlays — popover, dropdown-menu, context-menu,
 * select and tooltip all share the mechanics below.
 *
 * 1. Content is placed by `useRelativePosition`, which applies an INLINE style
 *    of { position: 'absolute', top, left, maxWidth }. react-native-css merges
 *    className-derived styles before the inline prop, and last wins, so on these
 *    Contents the inline style beats every class:
 *
 *      - `absolute` / `top-*` / `left-*` / `right-*` / `bottom-*` — dead
 *      - `max-w-*`                                                — dead
 *      - `min-w-*`                                                — the width lever
 *      - `max-h-*`                                                — free, no height is set
 *
 *    The gallery keeps a permanent side-by-side of `max-w-24` and `min-w-24` for
 *    exactly this reason; if the max-w one ever starts taking, this comment is
 *    what to revisit.
 *
 * 2. Content is nested INSIDE the Overlay, not rendered beside it. This is not
 *    cosmetic: as siblings, the full-screen scrim swallows every touch aimed at
 *    the content, even though the content paints on top and its frame is
 *    correct. Verified on device — a Select item received no `onTouchStart` at
 *    all until the scrim was nested around it rather than placed before it.
 *
 *    Nesting is safe for positioning because the scrim is `absolute inset-0`
 *    inside a window-sized `<UiPortalHost />`, so its frame IS the window — and
 *    the content's `top`/`left` come from `measure()`'s pageX/pageY, which are
 *    window coordinates. The two systems coincide. If the host ever stops being
 *    window-level, this equivalence breaks and every positioned overlay lands
 *    at the wrong offset.
 *
 * 3. `Root` takes only `onOpenChange` — there is no `open` or `defaultOpen`, so
 *    a Popover cannot be driven from outside. Programmatic control is
 *    `triggerRef.current?.open()` / `.close()`; the primitive augments the
 *    Trigger's ref with both.
 */

/** No colour: a popover should not dim the app, only catch the outside tap. */
export const popoverOverlayVariants = cva('absolute inset-0');

export const popoverContentVariants = cva(
  'min-w-64 gap-2 rounded-lg border border-border bg-surface p-4',
);

export type PopoverProps = PopoverPrimitive.RootProps & { className?: string };

export function Popover(props: PopoverProps) {
  return <PopoverPrimitive.Root {...props} />;
}

export type PopoverTriggerProps = PopoverPrimitive.TriggerProps & {
  className?: string;
};

/** `ref` is `PressableRef & { open(): void; close(): void }`. */
export function PopoverTrigger(props: PopoverTriggerProps) {
  return <PopoverPrimitive.Trigger {...props} />;
}

export type PopoverCloseProps = PopoverPrimitive.CloseProps & {
  className?: string;
};

export function PopoverClose(props: PopoverCloseProps) {
  return <PopoverPrimitive.Close {...props} />;
}

export const PopoverPortal = PopoverPrimitive.Portal;
export const PopoverOverlay = PopoverPrimitive.Overlay;

export type PopoverContentProps = PopoverPrimitive.ContentProps & {
  className?: string;
  /** Styles the invisible press-catcher behind the popover. */
  overlayClassName?: string;
  /** Targets a named `<UiPortalHost name="…" />` instead of the default one. */
  portalHost?: string;
};

export function PopoverContent({
  side = 'bottom',
  align = 'center',
  sideOffset = 4,
  className,
  overlayClassName,
  portalHost,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal hostName={portalHost}>
      <PopoverPrimitive.Overlay
        className={cn(popoverOverlayVariants(), overlayClassName)}
      >
        <PopoverPrimitive.Content
          side={side}
          align={align}
          sideOffset={sideOffset}
          {...props}
          className={cn(popoverContentVariants(), className)}
        />
      </PopoverPrimitive.Overlay>
    </PopoverPrimitive.Portal>
  );
}
