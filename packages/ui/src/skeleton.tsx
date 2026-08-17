import { View, type ViewProps } from 'react-native';

import { cn } from './lib/cn';

export type SkeletonProps = ViewProps & { className?: string };

/** Give it a height and width; it has none of its own. */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      {...props}
      className={cn('animate-pulse rounded-md bg-surface-selected', className)}
    />
  );
}
