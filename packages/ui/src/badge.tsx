import { cva, type VariantProps } from 'class-variance-authority';
import { View, type ViewProps } from 'react-native';

import { cn } from './lib/cn';
import { TextClassContext } from './lib/text-class-context';

export const badgeVariants = cva(
  'flex-row items-center gap-1 self-start rounded-full px-2.5 py-0.5',
  {
    variants: {
      variant: {
        default: 'bg-brand',
        secondary: 'bg-surface-selected',
        destructive: 'bg-danger',
        outline: 'border border-border bg-transparent',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export const badgeTextVariants = cva('text-xs font-semibold', {
  variants: {
    variant: {
      default: 'text-brand-fg',
      secondary: 'text-fg',
      destructive: 'text-danger-fg',
      outline: 'text-fg',
    },
  },
  defaultVariants: { variant: 'default' },
});

export type BadgeProps = ViewProps &
  VariantProps<typeof badgeVariants> & { className?: string };

export function Badge({ variant, className, ...props }: BadgeProps) {
  return (
    <TextClassContext.Provider value={badgeTextVariants({ variant })}>
      <View {...props} className={cn(badgeVariants({ variant }), className)} />
    </TextClassContext.Provider>
  );
}
