import { Slot } from '@rn-primitives/slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { cn } from './lib/cn';
import { useTextClass } from './lib/text-class-context';

export const textVariants = cva('text-fg', {
  variants: {
    variant: {
      default: 'text-base',
      lead: 'text-lg text-fg-muted',
      large: 'text-lg font-semibold',
      small: 'text-sm font-medium',
      muted: 'text-sm text-fg-muted',
      code: 'text-xs font-mono',
      h1: 'text-5xl font-semibold',
      h2: 'text-3xl font-semibold',
      h3: 'text-2xl font-semibold',
      h4: 'text-xl font-semibold',
    },
  },
  defaultVariants: { variant: 'default' },
});

export type TextProps = RNTextProps &
  VariantProps<typeof textVariants> & {
    asChild?: boolean;
    className?: string;
  };

export function Text({ variant, asChild, className, ...props }: TextProps) {
  const inherited = useTextClass();
  const Component = asChild ? Slot : RNText;

  // `inherited` sits between the variant and the caller's className: a Button
  // can recolour its label, and the call site can still override the Button.
  return (
    <Component
      {...props}
      className={cn(textVariants({ variant }), inherited, className)}
    />
  );
}
