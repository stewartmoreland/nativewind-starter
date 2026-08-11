import { View, type ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps & {
  className?: string;
  type?: 'background' | 'backgroundElement' | 'backgroundSelected';
};

const TYPES = {
  background: 'bg-bg',
  backgroundElement: 'bg-surface',
  backgroundSelected: 'bg-surface-selected',
} as const;

export function ThemedView({
  type = 'background',
  className,
  ...rest
}: ThemedViewProps) {
  return <View className={`${TYPES[type]} ${className ?? ''}`} {...rest} />;
}
