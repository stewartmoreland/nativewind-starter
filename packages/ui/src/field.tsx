import { useId } from 'react';
import { View, type ViewProps } from 'react-native';

import { Input, type InputProps } from './input';
import { Label } from './label';
import { Text } from './text';
import { cn } from './lib/cn';

export type FieldProps = InputProps & {
  label: string;
  /** Shown under the input; switches the border to `danger` when set. */
  error?: string | null;
  /** Shown under the input when there is no error. */
  description?: string;
  /** Styles the wrapper. `className` styles the input itself. */
  containerClassName?: ViewProps['className'];
};

/**
 * Label + Input + message, wired together. The three pieces stay exported
 * separately so a layout this does not cover can be assembled by hand.
 */
export function Field({
  label,
  error,
  description,
  containerClassName,
  className,
  ...props
}: FieldProps) {
  const id = useId();

  return (
    <View className={cn('gap-2', containerClassName)}>
      <Label nativeID={id}>{label}</Label>
      <Input
        // `aria-labelledby` is Android-only in React Native, so the label also
        // has to be set directly or the input is unnamed under VoiceOver.
        accessibilityLabel={label}
        aria-labelledby={id}
        aria-invalid={!!error}
        {...props}
        className={cn(error && 'border-danger', className)}
      />
      {error ? (
        <Text variant="small" className="text-danger" role="alert">
          {error}
        </Text>
      ) : description ? (
        <Text variant="muted">{description}</Text>
      ) : null}
    </View>
  );
}
