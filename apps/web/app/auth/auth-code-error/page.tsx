import Link from 'next/link';

export default function AuthCodeErrorPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Sign-in link invalid</h1>
      <p className="text-fg-muted">
        That link was already used, expired, or was issued for a different
        device. Request a new one.
      </p>
      <Link className="text-brand underline underline-offset-4" href="/login">
        Back to sign in
      </Link>
    </main>
  );
}
