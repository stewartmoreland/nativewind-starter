import * as SeparatorPrimitive from '@rn-primitives/separator';

import { cn } from './lib/cn';

export type SeparatorProps = SeparatorPrimitive.RootProps & {
  className?: string;
};

export function Separator({
  orientation = 'horizontal',
  decorative = true,
  className,
  ...props
}: SeparatorProps) {
  return (
    <SeparatorPrimitive.Root
      orientation={orientation}
      decorative={decorative}
      {...props}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
    />
  );
}
