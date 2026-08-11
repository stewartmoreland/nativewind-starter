import type { ReactNode } from 'react';
import { View } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type HintRowProps = {
  title?: string;
  hint?: ReactNode;
};

export function HintRow({ title = 'Try editing', hint = 'app/index.tsx' }: HintRowProps) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <ThemedText type="small">{title}</ThemedText>
      <ThemedView type="backgroundSelected" className="rounded-md px-2 py-1">
        <ThemedText themeColor="fgMuted">{hint}</ThemedText>
      </ThemedView>
    </View>
  );
}
