import type { NextRequest } from 'next/server';

import { updateSession } from '@/lib/supabase/proxy';

// Next.js 16 renamed middleware.ts -> proxy.ts. It runs on the Node.js runtime
// and the `runtime` segment option is not configurable here.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Deliberately INCLUDES /api/trpc: that route authenticates by cookie, and a
  // token refreshed during the request must be persisted to the response.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
