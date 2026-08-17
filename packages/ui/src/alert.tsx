import { cva, type VariantProps } from 'class-variance-authority';
import { View, type ViewProps } from 'react-native';

import { Text, type TextProps } from './text';
import { cn } from './lib/cn';
import { TextClassContext } from './lib/text-class-context';

export const alertVariants = cva(
  'w-full flex-row items-start gap-3 rounded-lg border p-4',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface',
        destructive: 'border-danger bg-surface',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

/**
 * `default` publishes nothing on purpose. Text merges this context ABOVE its
 * own variant, so publishing `text-fg` here would beat `variant="muted"` on the
 * description and flatten the title/description hierarchy. Only `destructive`
 * needs to override, because there recolouring both lines is the point.
 */
export const alertTextVariants = cva('', {
  variants: { variant: { default: '', destructive: 'text-danger' } },
  defaultVariants: { variant: 'default' },
});

export type AlertProps = ViewProps &
  VariantProps<typeof alertVariants> & { className?: string };

/**
 * Card-shaped and TextClassContext-driven, the same shape as Badge — there is
 * no rn-primitive behind this one.
 *
 * The leading icon is a child rather than a prop, so the call site chooses the
 * glyph and it recolours from the context like any other child:
 *
 *     <Alert variant="destructive">
 *       <Icon as={TriangleAlert} className="mt-0.5 size-5" />
 *       <AlertContent>
 *         <AlertTitle>Payment failed</AlertTitle>
 *         <AlertDescription>Your card was declined.</AlertDescription>
 *       </AlertContent>
 *     </Alert>
 */
export function Alert({ variant, className, ...props }: AlertProps) {
  return (
    <TextClassContext.Provider value={alertTextVariants({ variant })}>
      <View
        role="alert"
        {...props}
        className={cn(alertVariants({ variant }), className)}
      />
    </TextClassContext.Provider>
  );
}

export type AlertContentProps = ViewProps & { className?: string };

/**
 * Holds the title and description as a column beside the icon, so a wrapping
 * description stays aligned instead of flowing under the glyph.
 */
export function AlertContent({ className, ...props }: AlertContentProps) {
  return <View {...props} className={cn('flex-1 gap-1', className)} />;
}

export function AlertTitle({ className, ...props }: TextProps) {
  return (
    <Text
      variant="small"
      {...props}
      className={cn('font-semibold', className)}
    />
  );
}

export function AlertDescription({ className, ...props }: TextProps) {
  return <Text variant="muted" {...props} className={className} />;
}
