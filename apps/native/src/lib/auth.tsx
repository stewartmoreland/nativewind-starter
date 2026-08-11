import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { supabase } from './supabase';

type AuthValue = {
  session: Session | null;
  /** False once the persisted session has been read from storage. */
  loading: boolean;
};

const AuthContext = createContext<AuthValue>({ session: null, loading: true });

export const useAuth = () => useContext(AuthContext);

/**
 * Exchanges a PKCE `?code=` deep link for a session.
 *
 * PKCE ONLY. Do not add an implicit-flow branch that reads access_token /
 * refresh_token from the URL and calls setSession(): any app on the device can
 * open nativewindstarter://?access_token=... and silently sign the victim into
 * an attacker-controlled account, capturing everything they then create. An
 * injected `code` is useless without the locally stored verifier.
 */
async function exchangeCodeFromUrl(url: string) {
  const { queryParams } = Linking.parse(url);
  const code = queryParams?.code;
  if (typeof code !== 'string') return;
  await supabase.auth.exchangeCodeForSession(code);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  // Magic-link callbacks: cold start and warm resume.
  useEffect(() => {
    void Linking.getInitialURL().then((url) => {
      if (url) void exchangeCodeFromUrl(url);
    });
    const sub = Linking.addEventListener('url', ({ url }) => {
      void exchangeCodeFromUrl(url);
    });
    return () => sub.remove();
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
