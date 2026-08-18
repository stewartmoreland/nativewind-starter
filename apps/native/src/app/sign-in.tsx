import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

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
    /*
     * The safe area is `p-safe` on a plain View, NOT `<SafeAreaView className="flex-1">`.
     *
     * SafeAreaView cannot take a className on native, and it fails silently. The
     * Metro resolver `withNativewind` installs rewrites
     * `react-native-safe-area-context` to
     * `react-native-css/components/react-native-safe-area-context`, but that
     * module is only `export * from 'react-native-safe-area-context'` plus a
     * wrapped SafeAreaProvider. SafeAreaView is re-exported untouched, so the
     * className is spread onto the codegen'd RNCSafeAreaView, which has no such
     * prop, and is dropped with no warning.
     *
     * The symptom is not "unstyled" but a COLLAPSED layout. RNCSafeAreaView's
     * shadow node only ever sets padding from the insets, never flex, so without
     * the dropped flex-1 it is an auto-height, flex-grow: 0 box — and Yoga hands
     * a container that cannot itself grow no free space to distribute, sizing it
     * to the sum of its children's flex BASES instead. `flex-1` compiles to
     * flex-basis: 0%, so everything below collapsed to height 0, `justify-center`
     * centred ~410pt of form inside a 0pt box, and the top third of the screen
     * was painted above y=0 (RN Views default to overflow: visible).
     *
     * `p-safe` compiles to padding-*: var(--react-native-css-safe-area-inset-*),
     * which the SafeAreaProvider expo-router mounts in ExpoRoot publishes through
     * VariableContext — and that provider IS the wrapped one, because the
     * resolver rewrites node_modules imports too. Same result as SafeAreaView's
     * default edges in its default padding mode; only the mechanism is one that
     * actually works.
     */
    <View className="flex-1 bg-bg p-safe">
      {/*
        KeyboardAvoidingView IS polyfilled — react-native-css ships a
        className-aware one in its components/ directory — so flex-1 is real here.
        `padding` is right on iOS: it shrinks this view by the keyboard height,
        which shrinks the ScrollView viewport below it. Android is left undefined
        because Expo ships windowSoftInputMode=adjustResize, so the OS already
        resizes the window and a behavior would double-count. No
        keyboardVerticalOffset either — this route sets headerShown: false, so the
        view starts at the top of the window and KAV's frame maths already line up
        with the keyboard's.
      */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/*
          A ScrollView rather than a bare View, because `justify-center` in a box
          smaller than its content is exactly the failure above — and the keyboard
          recreates it on demand. On a 667pt iPhone SE with the keyboard up there
          are ~400pt left for ~410pt of form: a View clips the heading off the top
          again, a ScrollView just scrolls.

          `grow` (flex-grow: 1) on the content container, NOT `flex-1`. flex-1
          adds flex-basis: 0%, which pins the content to exactly the viewport
          height and brings the clipping back. flex-grow: 1 keeps flex-basis:
          auto, so the container is max(viewport, content) — tall enough to centre
          when the form fits, scrollable when it does not.

          keyboardShouldPersistTaps="handled" so a tap on Sign in while the
          keyboard is open submits on the first tap instead of being swallowed as
          a dismiss.
        */}
        <ScrollView
          className="flex-1"
          contentContainerClassName="grow justify-center gap-6 px-6"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
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
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
