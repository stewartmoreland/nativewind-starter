'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useActionState } from 'react';

import {
  signIn,
  signInWithMagicLink,
  signUp,
  type AuthState,
} from './actions';

const EMPTY: AuthState = {};

function Notice({ state }: { state: AuthState }) {
  if (state.error) {
    return (
      <p role="alert" className="text-sm text-danger">
        {state.error}
      </p>
    );
  }
  if (state.message) {
    return (
      <p role="status" className="text-sm text-brand">
        {state.message}
      </p>
    );
  }
  return null;
}

function LoginForms() {
  // useSearchParams needs a Suspense boundary or the route bails out to CSR.
  const next = useSearchParams().get('next') ?? '/protected';

  const [signInState, signInAction, signingIn] = useActionState(signIn, EMPTY);
  const [signUpState, signUpAction, signingUp] = useActionState(signUp, EMPTY);
  const [magicState, magicAction, sendingMagic] = useActionState(
    signInWithMagicLink,
    EMPTY,
  );

  const field =
    'h-11 w-full rounded-md border border-border bg-surface px-3 text-base outline-none focus:border-brand';
  const button =
    'h-11 w-full rounded-md bg-brand px-4 font-semibold text-brand-fg disabled:opacity-50';

  return (
    <div className="flex flex-col gap-10">
      <form action={signInAction} className="flex flex-col gap-3">
        <input type="hidden" name="next" value={next} />
        <h2 className="text-lg font-semibold">Sign in</h2>
        <label className="sr-only" htmlFor="signin-email">Email</label>
        <input id="signin-email" className={field} name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
        <label className="sr-only" htmlFor="signin-password">Password</label>
        <input id="signin-password" className={field} name="password" type="password" placeholder="Password" autoComplete="current-password" required />
        <button className={button} disabled={signingIn}>
          {signingIn ? 'Signing in…' : 'Sign in'}
        </button>
        <Notice state={signInState} />
      </form>

      <form action={magicAction} className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Or use a magic link</h2>
        <label className="sr-only" htmlFor="magic-email">Email</label>
        <input id="magic-email" className={field} name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
        <button className={`${button} bg-surface-selected text-fg`} disabled={sendingMagic}>
          {sendingMagic ? 'Sending…' : 'Email me a link'}
        </button>
        <Notice state={magicState} />
      </form>

      <form action={signUpAction} className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">New here?</h2>
        <label className="sr-only" htmlFor="signup-email">Email</label>
        <input id="signup-email" className={field} name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
        <label className="sr-only" htmlFor="signup-password">Password</label>
        <input id="signup-password" className={field} name="password" type="password" placeholder="Password (min 8 characters)" autoComplete="new-password" required />
        <button className={`${button} bg-surface-selected text-fg`} disabled={signingUp}>
          {signingUp ? 'Creating account…' : 'Create account'}
        </button>
        <Notice state={signUpState} />
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-8 p-6">
      <div>
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-fg-muted">
          Local dev: emails are captured by Mailpit, not delivered.
        </p>
      </div>
      <Suspense fallback={<p className="text-fg-muted">Loading…</p>}>
        <LoginForms />
      </Suspense>
      <Link className="text-sm text-fg-muted underline underline-offset-4" href="/">
        Back home
      </Link>
    </main>
  );
}
