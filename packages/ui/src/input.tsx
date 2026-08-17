import { TextInput, type TextInputProps } from 'react-native';

import { cn } from './lib/cn';

export type InputProps = TextInputProps & { className?: string };

export function Input({ className, editable, ...props }: InputProps) {
  return (
    <TextInput
      {...props}
      editable={editable}
      className={cn(
        'h-12 rounded-md border border-border bg-surface px-3 text-base text-fg',
        // react-native-css compiles `::placeholder { color }` to the
        // placeholderTextColor prop and `::selection { color }` to
        // selectionColor, so neither needs a hard-coded literal.
        'placeholder:text-fg-muted selection:text-brand',
        'focus:border-ring',
        editable === false && 'opacity-50',
        className,
      )}
    />
  );
}
