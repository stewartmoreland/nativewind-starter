import { View, type ViewProps } from 'react-native';

import { cn } from './lib/cn';

export type CardProps = ViewProps & { className?: string };

export function Card({ className, ...props }: CardProps) {
  return (
    <View {...props} className={cn('gap-3 rounded-card bg-surface p-4', className)} />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return <View {...props} className={cn('gap-1', className)} />;
}

export function CardContent({ className, ...props }: CardProps) {
  return <View {...props} className={cn('gap-2', className)} />;
}

export function CardFooter({ className, ...props }: CardProps) {
  return (
    <View {...props} className={cn('flex-row items-center gap-2', className)} />
  );
}
