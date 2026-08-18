import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import * as TooltipPrimitive from '@rn-primitives/tooltip';
import { cva } from 'class-variance-authority';

import { cn } from './lib/cn';
import { TextClassContext } from './lib/text-class-context';

/*
 * A positioned overlay — read the mechanics note at the top of `popover.tsx`.
 *
 * Two upstream behaviours are worth knowing before using this, both verified in
 * `@rn-primitives/hooks`' `getSidePosition`:
 *
 * 1. **Auto-flip does not exist on native — it CLAMPS.** For `side="top"` the
 *    hook returns
 *      Math.min(Math.max(insetTop, positionTop), height - insetBottom - contentHeight)
 *    so a tooltip near the top of the screen is pushed back DOWN onto its
 *    trigger rather than flipping underneath it. Pass `insets` to keep it clear
 *    of a header; there is no prop that makes it flip.
 * 2. **`side="left"` and `"right"` silently become `"bottom"`.** The hook only
 *    branches on `side === 'top'`; every other value falls through to the bottom
 *    placement. The primitive's own type advertises all four, so this wrapper
 *    narrows it back to the two that work — a silent mis-placement is worth a
 *    type error.
 */

export const tooltipOverlayVariants = cva('absolute inset-0');

/** Inverted surface, in tokens, so it inverts again in dark mode for free. */
export const tooltipContentVariants = cva('rounded-md bg-fg px-3 py-1.5');

export const tooltipTextVariants = cva('text-xs font-medium text-bg');

/**
 * Holds the Trigger's ref so `Tooltip` can close what it did not render.
 *
 * `@rn-primitives/tooltip` exports no context hook and its Root takes only
 * `onOpenChange` — no `open`, no `defaultOpen` — so the open state is
 * unreachable from outside and unsettable from outside. The one handle the
 * primitive does give us is on the TRIGGER: it augments that node's ref with
 * `open()` and `close()`. Owning the ref here is what makes auto-dismiss
 * possible at all. Same move as `collapsible.tsx`, for the same reason.
 */
const TooltipTriggerRefContext =
  createContext<React.RefObject<TooltipPrimitive.TriggerRef | null> | null>(
    null,
  );

export type TooltipProps = TooltipPrimitive.RootProps & {
  /**
   * Milliseconds before the tooltip closes itself. `null` keeps it open until
   * it is tapped away.
   *
   * A timer rather than a hover-out, because on native this is a press-to-toggle
   * control: there is no pointer to leave, so without one a tooltip opened by a
   * stray tap would stay on screen indefinitely.
   */
  autoDismiss?: number | null;
  className?: string;
};

export function Tooltip({
  autoDismiss = 2000,
  onOpenChange,
  children,
  ...props
}: TooltipProps) {
  const triggerRef = useRef<TooltipPrimitive.TriggerRef | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clear() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }

  useEffect(() => clear, []);

  function handleOpenChange(open: boolean) {
    clear();
    if (open && autoDismiss !== null) {
      timer.current = setTimeout(() => {
        timer.current = null;
        triggerRef.current?.close();
      }, autoDismiss);
    }
    onOpenChange?.(open);
  }

  return (
    <TooltipTriggerRefContext.Provider value={triggerRef}>
      <TooltipPrimitive.Root {...props} onOpenChange={handleOpenChange}>
        {children}
      </TooltipPrimitive.Root>
    </TooltipTriggerRefContext.Provider>
  );
}

export type TooltipTriggerProps = TooltipPrimitive.TriggerProps & {
  className?: string;
  /**
   * Declared here because the primitive keeps `ref` in its component signature
   * rather than in `TriggerProps`, and this wrapper has to intercept it: the
   * shared ref above is what gives `Tooltip` its `close()` handle.
   */
  ref?: React.Ref<TooltipPrimitive.TriggerRef | null>;
};

export function TooltipTrigger({ ref, ...props }: TooltipTriggerProps) {
  const shared = useContext(TooltipTriggerRefContext);

  return (
    <TooltipPrimitive.Trigger
      {...props}
      ref={(node) => {
        if (shared) shared.current = node;
        // Honour a caller's ref too — both forms, since React 19 allows either.
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
    />
  );
}

export const TooltipPortal = TooltipPrimitive.Portal;
export const TooltipOverlay = TooltipPrimitive.Overlay;

export type TooltipContentProps = Omit<
  TooltipPrimitive.ContentProps,
  'side' | 'children'
> & {
  /**
   * Narrowed from the primitive's `'top' | 'right' | 'bottom' | 'left'`.
   * Left and right are web-only and fall through to `bottom` on native without
   * any warning — see the note at the top of this file.
   */
  side?: 'top' | 'bottom';
  children?: ReactNode;
  className?: string;
  /** Styles the invisible press-catcher behind the tooltip. */
  overlayClassName?: string;
  /** Targets a named `<UiPortalHost name="…" />` instead of the default one. */
  portalHost?: string;
};

export function TooltipContent({
  side = 'top',
  align = 'center',
  sideOffset = 4,
  className,
  overlayClassName,
  portalHost,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal hostName={portalHost}>
      <TooltipPrimitive.Overlay
        className={cn(tooltipOverlayVariants(), overlayClassName)}
      >
        <TextClassContext.Provider value={tooltipTextVariants()}>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={sideOffset}
            {...props}
            className={cn(tooltipContentVariants(), className)}
          />
        </TextClassContext.Provider>
      </TooltipPrimitive.Overlay>
    </TooltipPrimitive.Portal>
  );
}
