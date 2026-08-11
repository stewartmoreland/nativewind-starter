import { signOut } from '@/app/login/actions';

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button className="h-10 rounded-md border border-border px-4 text-sm font-medium">
        Sign out
      </button>
    </form>
  );
}
