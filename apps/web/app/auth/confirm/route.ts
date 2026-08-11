import { type EmailOtpType } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * Handles both callback shapes:
 *   - PKCE / magic link  -> ?code=...
 *   - email OTP          -> ?token_hash=...&type=...
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  // Open-redirect guard: only same-origin relative paths.
  const raw = searchParams.get('next') ?? '/protected';
  const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/protected';

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) redirect(next);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) redirect(next);
  }

  redirect('/auth/auth-code-error');
}
