import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

export type ButtonProps = Omit<PressableProps, 'children'> & {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  className?: string;
};

const CONTAINER = {
  primary: 'bg-brand active:opacity-80',
  secondary: 'bg-surface active:opacity-80 border border-border',
  danger: 'bg-danger active:opacity-80',
} as const;

const LABEL = {
  primary: 'text-brand-fg',
  secondary: 'text-fg',
  danger: 'text-danger-fg',
} as const;

export function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      className={`h-12 flex-row items-center justify-center rounded-md px-4 ${
        CONTAINER[variant]
      } ${isDisabled ? 'opacity-50' : ''} ${className ?? ''}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Text className={`text-base font-semibold ${LABEL[variant]}`}>{title}</Text>
      )}
    </Pressable>
  );
}
