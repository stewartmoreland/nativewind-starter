import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

// Never resubscribes: we only need the server/client snapshot distinction.
const subscribe = () => () => {};

/**
 * Static rendering has no colour scheme, so the value must be recomputed on the
 * client. useSyncExternalStore gives us the server-vs-client distinction
 * directly, without a setState-in-effect (which React's lint rules now reject
 * and the React Compiler handles poorly).
 */
export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(
    subscribe,
    () => true, // client snapshot
    () => false, // server snapshot
  );

  const colorScheme = useRNColorScheme();

  return hasHydrated ? colorScheme : 'light';
}
