import Constants from 'expo-constants';

/**
 * Where the Next.js app (and therefore /api/trpc) lives.
 *
 * Deliberately throws rather than defaulting to localhost: an Android emulator
 * cannot reach the host's localhost, and a silent default turns that into a
 * confusing network error instead of an actionable message.
 */
export function getBaseUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (explicit) {
    if (!__DEV__ && explicit.startsWith('http://')) {
      throw new Error('EXPO_PUBLIC_API_URL must use https:// in production builds.');
    }
    return explicit.replace(/\/$/, '');
  }

  // Dev fallback: the LAN IP of the machine running `expo start`.
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (!host) {
    throw new Error(
      'Could not infer the dev host from Constants.expoConfig.hostUri.\n' +
        'Set EXPO_PUBLIC_API_URL in apps/native/.env.local, e.g. http://192.168.1.20:3000',
    );
  }
  return `http://${host}:3000`;
}
