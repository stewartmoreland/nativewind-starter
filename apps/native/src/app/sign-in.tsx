import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@repo/ui/button';
import { TextField } from '@repo/ui/text-field';
import { ThemedText } from '@repo/ui/themed-text';
import { ThemedView } from '@repo/ui/themed-view';

import { supabase } from '@/lib/supabase';

const REDIRECT_TO = 'nativewindstarter://auth/callback';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState<'password' | 'magic' | 'signup' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function reset() {
    setError(null);
    setNotice(null);
  }

  async function signInWithPassword() {
    reset();
    setBusy('password');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setBusy(null);
  }

  async function signUp() {
    reset();
    setBusy('signup');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: REDIRECT_TO },
    });
    if (error) setError(error.message);
    else setNotice('Check your email to confirm your account.');
    setBusy(null);
  }

  async function signInWithMagicLink() {
    reset();
    setBusy('magic');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: REDIRECT_TO },
    });
    if (error) setError(error.message);
    else setNotice('Magic link sent. Open it on this device.');
    setBusy(null);
  }

  const disabled = busy !== null || email.length === 0;

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View className="flex-1 justify-center gap-6 px-6">
            <View className="gap-2">
              <ThemedText type="title">Sign in</ThemedText>
              <ThemedText type="small" themeColor="fgMuted">
                Local dev: emails are captured by Mailpit, not delivered.
              </ThemedText>
            </View>

            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              inputMode="email"
            />

            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              autoCapitalize="none"
              autoComplete="current-password"
              secureTextEntry
            />

            {error ? (
              <ThemedText type="small" themeColor="danger">
                {error}
              </ThemedText>
            ) : null}
            {notice ? (
              <ThemedText type="small" themeColor="brand">
                {notice}
              </ThemedText>
            ) : null}

            <View className="gap-3">
              <Button
                title="Sign in"
                onPress={signInWithPassword}
                loading={busy === 'password'}
                disabled={disabled || password.length === 0}
              />
              <Button
                title="Email me a magic link"
                variant="secondary"
                onPress={signInWithMagicLink}
                loading={busy === 'magic'}
                disabled={disabled}
              />
              <Button
                title="Create account"
                variant="secondary"
                onPress={signUp}
                loading={busy === 'signup'}
                disabled={disabled || password.length === 0}
              />
            </View>

            {busy ? <ActivityIndicator /> : null}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}
