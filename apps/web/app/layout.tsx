import type { Metadata } from 'next';
import localFont from 'next/font/local';

import { TRPCReactProvider } from '@/trpc/client';

import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'Supabase + Expo + Next.js starter',
  description:
    'Turborepo template: Next.js 16, Expo SDK 57, NativeWind v5, tRPC v11 and Supabase.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
