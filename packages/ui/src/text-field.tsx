import { Text, TextInput, View, type TextInputProps } from 'react-native';

export type TextFieldProps = TextInputProps & {
  label: string;
  error?: string | null;
  className?: string;
};

export function TextField({ label, error, className, ...rest }: TextFieldProps) {
  return (
    <View className={`gap-2 ${className ?? ''}`}>
      <Text className="text-sm font-medium text-fg">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="rgb(128,128,128)"
        className={`h-12 rounded-md border px-3 text-base text-fg ${
          error ? 'border-danger' : 'border-border'
        } bg-surface`}
        {...rest}
      />
      {error ? <Text className="text-sm text-danger">{error}</Text> : null}
    </View>
  );
}
