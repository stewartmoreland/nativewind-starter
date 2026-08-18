import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as ToastPrimitive from '@rn-primitives/toast';
import { cva, type VariantProps } from 'class-variance-authority';
import X from 'lucide-react-native/icons/x';
import { View } from 'react-native';

import { Icon } from './icon';
import { Portal } from './portal';
import { Text } from './text';
import { cn } from './lib/cn';
import { TextClassContext } from './lib/text-class-context';

/*
 * `@rn-primitives/toast` is the thinnest primitive in the set: Root, Title,
 * Description, Action, Close, and Root returns null when `open` is false. There
 * is no provider, no viewport, no queue and no timer — every one of those is
 * ours, below.
 *
 * That is also why this is the one overlay with an imperative API. A toast is
 * raised from an event handler, usually far from where it should appear, so
 * asking every call site to own an `open` boolean would be the wrong shape.
 *
 * KNOWN LIMITATION — a toast that is ALREADY on screen when a dialog, sheet or
 * alert-dialog opens is dimmed underneath that overlay's scrim. A toast raised
 * while the overlay is already open draws on top, correctly.
 *
 * The cause is `@rn-primitives/portal`: its host renders the registry with
 * `Array.from(map.values())`, so paint order is registration order, and the
 * provider registers when the app mounts — before any overlay. Two fixes were
 * tried on device and NEITHER works, so do not reach for them again: a
 * dedicated second `PortalHost` rendered as a later sibling, and `z-50` on the
 * viewport. Reordering would have to happen inside the primitive.
 *
 * It is a cosmetic edge case — toasts are transient and a modal legitimately
 * takes focus — so it is documented rather than worked around.
 */

export const toastVariants = cva(
  'w-full flex-row items-start gap-3 rounded-lg border p-4',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface',
        destructive: 'border-danger bg-danger',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

/**
 * `default` publishes nothing on purpose — the same trick as `alert.tsx`.
 * Publishing `text-fg` here would beat the description's `text-fg-muted` and
 * flatten the title/description hierarchy. `destructive` does override both
 * lines, which is the point there.
 *
 * Unlike `alert.tsx`, this cannot ride on TextClassContext ALONE. Alert's title
 * and description are our `<Text>`, which reads the context; `ToastTitle` and
 * `ToastDescription` wrap the primitive's Title/Description, which render a raw
 * RN `Text` and never read it. So those two merge this table into their own
 * className directly — the same move `SelectValue` makes for the same reason.
 * The context stays for arbitrary `<Text>` / `<Icon>` children of a Toast.
 */
export const toastTextVariants = cva('', {
  variants: {
    variant: { default: '', destructive: 'text-danger-fg' },
  },
  defaultVariants: { variant: 'default' },
});

/**
 * `text-fg` is not optional here. Every other Title in the kit carries it, and
 * this one has no `<Text>` beneath it to supply a default — without it a toast
 * title renders in RN's own default black, which is invisible on `bg-surface`
 * in dark mode.
 */
export const toastTitleVariants = cva('text-sm font-semibold text-fg');

export const toastDescriptionVariants = cva('text-sm text-fg-muted');

export const toastCloseVariants = cva(
  'size-6 items-center justify-center rounded-md active:opacity-80',
);

export const toastViewportVariants = cva('absolute left-0 right-0 gap-2 p-4', {
  variants: {
    position: {
      top: 'top-0 pt-safe-offset-2',
      bottom: 'bottom-0 pb-safe-offset-2',
    },
  },
  defaultVariants: { position: 'top' },
});

/* ------------------------------------------------------------------------- */
/* Presentational                                                            */
/* ------------------------------------------------------------------------- */

export type ToastProps = ToastPrimitive.RootProps &
  VariantProps<typeof toastVariants> & { className?: string };

/**
 * Carries the variant to Title and Description, which cannot read it from
 * TextClassContext — see the note on `toastTextVariants`.
 */
const ToastVariantContext =
  createContext<VariantProps<typeof toastVariants>['variant']>(undefined);

export function Toast({ variant, className, ...props }: ToastProps) {
  return (
    <ToastVariantContext.Provider value={variant}>
      <TextClassContext.Provider value={toastTextVariants({ variant })}>
        <ToastPrimitive.Root
          {...props}
          className={cn(toastVariants({ variant }), className)}
        />
      </TextClassContext.Provider>
    </ToastVariantContext.Provider>
  );
}

export type ToastTitleProps = ToastPrimitive.TitleProps & {
  className?: string;
};

export function ToastTitle({ className, ...props }: ToastTitleProps) {
  const variant = useContext(ToastVariantContext);

  return (
    <ToastPrimitive.Title
      {...props}
      className={cn(
        toastTitleVariants(),
        toastTextVariants({ variant }),
        className,
      )}
    />
  );
}

export type ToastDescriptionProps = ToastPrimitive.DescriptionProps & {
  className?: string;
};

export function ToastDescription({
  className,
  ...props
}: ToastDescriptionProps) {
  const variant = useContext(ToastVariantContext);

  return (
    <ToastPrimitive.Description
      {...props}
      className={cn(
        toastDescriptionVariants(),
        toastTextVariants({ variant }),
        className,
      )}
    />
  );
}

export type ToastActionProps = ToastPrimitive.ActionProps & {
  className?: string;
};

export function ToastAction({ className, ...props }: ToastActionProps) {
  return (
    <ToastPrimitive.Action
      {...props}
      className={cn('rounded-md px-2 py-1 active:opacity-80', className)}
    />
  );
}

export type ToastCloseProps = ToastPrimitive.CloseProps & {
  className?: string;
};

export function ToastClose({ className, ...props }: ToastCloseProps) {
  return (
    <ToastPrimitive.Close
      {...props}
      className={cn(toastCloseVariants(), className)}
    />
  );
}

/* ------------------------------------------------------------------------- */
/* Imperative                                                                */
/* ------------------------------------------------------------------------- */

export type ToastVariant = 'default' | 'destructive';

export type ToastOptions = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** Milliseconds on screen. `null` keeps it until dismissed. */
  duration?: number | null;
  action?: { label: string; onPress: () => void };
};

export type ToastRecord = ToastOptions & { id: string };

type ToastContextValue = {
  toast: (options: ToastOptions) => string;
  dismiss: (id?: string) => void;
  toasts: readonly ToastRecord[];
};

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Module-scope counter rather than `useId` — there is no hook at an imperative
 * call site — and rather than `Math.random`, which would make ids
 * non-deterministic for no benefit.
 */
let seq = 0;
const nextId = () => `toast-${++seq}`;

export type ToastProviderProps = {
  children: ReactNode;
  /** Rendered at once; the rest wait their turn. */
  limit?: number;
  /** Fallback for a toast that does not set its own `duration`. */
  duration?: number;
  position?: 'top' | 'bottom';
  /**
   * Targets a named `<UiPortalHost name="…" />`. Defaults to the same unnamed
   * host every other overlay uses — a dedicated second host does NOT fix the
   * stacking limitation described at the top of this file, so only set this if
   * you are hosting toasts somewhere genuinely separate.
   */
  portalHost?: string;
  /** Styles the viewport that holds the stack. */
  className?: string;
};

/**
 * Mount ONE of these, above every screen that can raise a toast. A second
 * provider would register a portal under the same fixed name and overwrite the
 * first, so the stacks would fight rather than merge.
 */
export function ToastProvider({
  children,
  limit = 3,
  duration = 4000,
  position = 'top',
  portalHost,
  className,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  // Timers are refs, never state: a pending timeout is not something the tree
  // renders, and putting it in state would re-render the whole app on every
  // toast tick.
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id?: string) => {
    setToasts((prev) => {
      if (id === undefined) {
        prev.forEach((t) => {
          const timer = timers.current.get(t.id);
          if (timer) clearTimeout(timer);
        });
        timers.current.clear();
        return [];
      }
      const timer = timers.current.get(id);
      if (timer) clearTimeout(timer);
      timers.current.delete(id);
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    const id = nextId();
    setToasts((prev) => [...prev, { ...options, id }]);
    return id;
  }, []);

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach(clearTimeout);
      map.clear();
    };
  }, []);

  const visible = toasts.slice(0, limit);

  /*
   * Timers start when a toast becomes VISIBLE, not when it is raised. A burst
   * of six with `limit={3}` would otherwise expire the last three while they
   * were still queued, and the user would never see them.
   */
  useEffect(() => {
    for (const t of visible) {
      if (timers.current.has(t.id)) continue;
      const ms = t.duration === null ? null : (t.duration ?? duration);
      if (ms === null) continue;
      timers.current.set(
        t.id,
        setTimeout(() => {
          timers.current.delete(t.id);
          dismiss(t.id);
        }, ms),
      );
    }
  }, [visible, duration, dismiss]);

  const value = useMemo(
    () => ({ toast, dismiss, toasts }),
    [toast, dismiss, toasts],
  );

  /*
   * The stack renders through the portal rather than here, for three reasons:
   * on iOS it lands inside FullWindowOverlay, so a toast paints over a modal
   * screen AND over an open Dialog — which is the entire point of a toast; the
   * app's root layout keeps <UiPortalHost /> as its last child with no special
   * casing; and it makes the ordering of this provider irrelevant to paint
   * order, so it can sit wherever `useToast()` needs to be reachable from.
   *
   * These elements are CREATED here but RENDERED at the host, so they see the
   * host's React context. `toasts` and `dismiss` are closed over rather than
   * read from context, and Toast publishes its own TextClassContext, so nothing
   * here depends on the call site's position in the tree.
   */
  return (
    <ToastContext.Provider value={value}>
      {children}
      <Portal name="@repo/ui/toast" hostName={portalHost}>
        {/*
          `box-none` lets touches through the invisible bar while keeping the
          toasts themselves tappable. It is a prop rather than a class because
          RN's `box-none` has no CSS analogue — Tailwind's pointer-events-* only
          maps `none` and `auto`, and `none` here would make the actions dead.
        */}
        <View
          pointerEvents="box-none"
          className={cn(toastViewportVariants({ position }), className)}
        >
          {visible.map((t) => (
            <ToastItem key={t.id} record={t} onDismiss={dismiss} />
          ))}
        </View>
      </Portal>
    </ToastContext.Provider>
  );
}

function ToastItem({
  record,
  onDismiss,
}: {
  record: ToastRecord;
  onDismiss: (id: string) => void;
}) {
  return (
    /*
     * Only `onOpenChange` dismisses. The primitive's Action and Close both call
     * `onOpenChange(false)` themselves before running the caller's `onPress`,
     * so dismissing again from those handlers would just be a second pass over
     * the same id.
     */
    <Toast
      open
      variant={record.variant}
      onOpenChange={(open) => {
        if (!open) onDismiss(record.id);
      }}
    >
      <View className="flex-1 gap-1">
        <ToastTitle>{record.title}</ToastTitle>
        {record.description ? (
          <ToastDescription>{record.description}</ToastDescription>
        ) : null}
      </View>
      {record.action ? (
        <ToastAction onPress={record.action.onPress}>
          <Text className="text-sm font-semibold text-brand">
            {record.action.label}
          </Text>
        </ToastAction>
      ) : null}
      <ToastClose>
        <Icon as={X} label="Dismiss" className="size-4 text-fg-muted" />
      </ToastClose>
    </Toast>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error('useToast must be used inside a <ToastProvider>.');
  }
  return value;
}
