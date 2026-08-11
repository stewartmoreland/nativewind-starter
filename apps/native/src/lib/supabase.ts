import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

import { createNativeSupabase } from '@repo/supabase/native';

/**
 * Env must be read with DOT NOTATION and inside the app (not in a workspace
 * package): Expo inlines process.env.EXPO_PUBLIC_* at build time by static
 * substitution, and does not apply that inlining inside node_modules.
 */
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.\n' +
      'Copy apps/native/.env.example to apps/native/.env.local and fill it from `yarn supabase status`.',
  );
}

const isWeb = Platform.OS === 'web';

export const supabase = createNativeSupabase({
  url,
  key,
  // AsyncStorage keeps the refresh token in the app sandbox in plaintext. That
  // is Supabase's own recommendation and fine for the default threat model;
  // app.json sets android.allowBackup:false so it is not swept into cloud
  // backups. For a stricter model, wrap SecureStore with AES and swap it here.
  storage: isWeb ? undefined : AsyncStorage,
  isWeb,
});

/**
 * Register ONCE at module scope, never inside a component or effect. Off the
 * browser, supabase-js refreshes continuously in the background unless it is
 * told when the app is foregrounded.
 */
if (!isWeb) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      void supabase.auth.startAutoRefresh();
    } else {
      void supabase.auth.stopAutoRefresh();
    }
  });
}
