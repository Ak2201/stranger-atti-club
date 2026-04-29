import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import PWARegister from '@/components/PWARegister';
import AuthProvider from '@/components/AuthProvider';

const display = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Stranger Atti Club — A common platform for stranger-meets',
    template: '%s · Stranger Atti Club',
  },
  description:
    'A common platform for stranger-meets in Chennai. New theme every month, same warm room — sangeeths, glow-ups, supper clubs, sunrise dances. Different vibe each time, never the same night twice.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://strangeratticlub.vercel.app'
  ),
  openGraph: {
    title: 'Stranger Atti Club',
    description:
      'A common platform for stranger-meets in Chennai. New theme every month.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Stranger Atti Club',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stranger Atti Club',
    description: 'A common platform for stranger-meets in Chennai. New theme every month.',
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Stranger Atti Club',
  },
};

export const viewport: Viewport = {
  themeColor: '#FFF8E7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        {/* Razorpay Checkout SDK */}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </head>
      <body className="font-sans bg-cream text-ink antialiased">
        <AuthProvider>
          <PWARegister />
          <Nav />
          <main className="min-h-[80vh]">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
