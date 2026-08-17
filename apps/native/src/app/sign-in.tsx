import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@repo/ui/button';
import { Field } from '@repo/ui/field';
import { Text } from '@repo/ui/text';

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
    <View className="flex-1 bg-bg">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View className="flex-1 justify-center gap-6 px-6">
            <View className="gap-2">
              <Text variant="h1">Sign in</Text>
              <Text variant="muted">
                Local dev: emails are captured by Mailpit, not delivered.
              </Text>
            </View>

            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              inputMode="email"
            />

            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              autoCapitalize="none"
              autoComplete="current-password"
              secureTextEntry
            />

            {error ? (
              <Text variant="small" className="text-danger" role="alert">
                {error}
              </Text>
            ) : null}
            {notice ? (
              <Text variant="small" className="text-brand" role="status">
                {notice}
              </Text>
            ) : null}

            <View className="gap-3">
              <Button
                onPress={signInWithPassword}
                loading={busy === 'password'}
                disabled={disabled || password.length === 0}
              >
                <Text>Sign in</Text>
              </Button>
              <Button
                variant="secondary"
                onPress={signInWithMagicLink}
                loading={busy === 'magic'}
                disabled={disabled}
              >
                <Text>Email me a magic link</Text>
              </Button>
              <Button
                variant="secondary"
                onPress={signUp}
                loading={busy === 'signup'}
                disabled={disabled || password.length === 0}
              >
                <Text>Create account</Text>
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
