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

/** @deprecated Use a plain `View` with a `bg-*` token utility. Kept for the
 * Expo-template screens that have not been migrated yet. */
export function ThemedView({
  type = 'background',
  className,
  ...rest
}: ThemedViewProps) {
  return <View className={`${TYPES[type]} ${className ?? ''}`} {...rest} />;
}
