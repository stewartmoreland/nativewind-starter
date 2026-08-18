import '@/global.css';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { UiPortalHost } from '@repo/ui/portal';
import { ToastProvider } from '@repo/ui/toast';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/lib/auth';
import { TRPCReactProvider } from '@/lib/api';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, loading } = useAuth();

  // Render nothing until the persisted session has been read, or the guard
  // would flip from false to true and blow away the navigation history.
  if (loading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>

      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(app)" />
        <Stack.Screen
          name="ui-kit"
          options={{ headerShown: true, title: 'UI kit', presentation: 'modal' }}
        />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <TRPCReactProvider>
          {/*
            Wraps the navigator so useToast() resolves from any screen. Its
            position does not affect paint order — the stack reaches the host
            through a Portal — so it does not compete with UiPortalHost below.
          */}
          <ToastProvider>
            <AnimatedSplashOverlay />
            <RootNavigator />
          </ToastProvider>
          {/*
            LAST child, always. Portalled overlays render HERE rather than where
            their <Dialog> lives, so this position decides both paint order and
            which React contexts they inherit — and without a host mounted they
            render nothing at all, silently. On iOS UiPortalHost wraps itself in
            FullWindowOverlay so overlays clear the navigation bar and any
            `presentation: 'modal'` screen (which the UI kit route is).
          */}
          <UiPortalHost />
        </TRPCReactProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
