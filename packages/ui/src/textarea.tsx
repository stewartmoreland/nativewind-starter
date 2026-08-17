import { Input, type InputProps } from './input';
import { cn } from './lib/cn';

export type TextareaProps = Omit<InputProps, 'multiline'> & {
  className?: string;
};

/**
 * Wraps `Input` rather than duplicating the TextInput, so the token wiring for
 * `::placeholder`, `::selection` and the focus ring lives in exactly one place.
 *
 * Input's `h-12` is not a problem to work around: it and `h-auto` land in the
 * same tailwind-merge group, so cn() drops `h-12` outright rather than letting
 * the two fight. That is the same mechanism a caller's className relies on.
 *
 * `align-top` is the CSS route to Android's textAlignVertical (react-native-css
 * compiles `vertical-align` to RN's `verticalAlign`); iOS already top-aligns
 * multiline text. Do NOT add `text-left`/`text-center` here — the polyfilled
 * TextInput maps `textAlign` with react-native-css's `true` shorthand, which
 * throws at runtime in 3.0.7.
 */
export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <Input
      multiline
      {...props}
      className={cn('h-auto min-h-24 py-3 align-top', className)}
    />
  );
}
