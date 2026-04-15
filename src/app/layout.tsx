import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNavBar from '@/components/layout/BottomNavBar';

export const metadata: Metadata = {
  title: 'Post Proper Northside Basketball Score Sheet',
  description: 'Official digital score sheet and statistics tracker for Post Proper Northside Basketball League.',
  keywords: ['basketball', 'scores', 'standings', 'Northside', 'Post Proper'],
  authors: [{ name: 'Post Proper Northside' }],
  openGraph: {
    title: 'Post Proper Northside Basketball Score Sheet',
    description: 'Live scores, standings, and player statistics for the Post Proper Northside Basketball League.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#080810',
};

import AuthProvider from '@/components/providers/AuthProvider';
import PendingApproval from '@/components/auth/PendingApproval';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Bebas+Neue&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-mesh antialiased text-white">
        <AuthProvider>
          <PendingApproval />
          {/* Page content */}
          <main className="safe-bottom min-h-dvh">
            {children}
          </main>

          {/* Persistent bottom navigation */}
          <BottomNavBar />
        </AuthProvider>
      </body>
    </html>
  );
}
