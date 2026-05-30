import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { displayLatin, sansLatin, displayArabic, sansArabic, fontVariables } from '@/lib/fonts';
import { getActiveTheme } from '@/lib/theme';
import { cn } from '@/lib/cn';
import './globals.css';

export const dynamic = 'error';

/**
 * Single root layout.
 *
 * Notes on static export + per-locale html attributes:
 *   - Next.js requires <html> and <body> in the root layout.
 *   - In static export with N locales, the root layout renders the SAME html
 *     element into N files, so the lang attribute can't be set per-locale here.
 *   - The locale layout (app/[locale]/layout.tsx) injects an inline <script>
 *     that runs synchronously before hydration to set documentElement.lang and dir.
 *   - For SEO, hreflang annotations on every page carry the locale signal.
 *
 * The landing page at `/` reads as English by default — it's redirected to a
 * locale by `src/proxy.ts` based on Accept-Language, so the html lang here
 * only ever applies to the brief fallback page or non-redirecting clients.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Montana — Frozen Foods Since 1985 | Egyptian Vegetables & Fruits Exporter',
    template: '%s | Montana',
  },
  description:
    'Family-owned Egyptian frozen-food exporter since 1985. IQF vegetables, fruits, and signature molokhia delivered to 30 countries. HACCP, ISO, and GMP certified.',
  applicationName: 'Montana Frozen Foods',
  authors: [{ name: 'Montana Frozen Foods', url: SITE_URL }],
  generator: 'Next.js',
  creator: 'Montana Frozen Foods',
  publisher: 'Montana Frozen Foods',
  category: 'Food & Beverage',
  keywords: [
    'Montana frozen foods',
    'Egyptian frozen vegetables',
    'frozen vegetables exporter',
    'IQF vegetables',
    'frozen molokhia',
    'frozen okra',
    'frozen artichoke',
    'frozen strawberry',
    'frozen mixed vegetables',
    'HACCP certified',
    'ISO certified',
    'food export Egypt',
    'B2B frozen food supplier',
  ],
  referrer: 'origin-when-cross-origin',
  formatDetection: { email: false, address: false, telephone: false },
  icons: {
    icon: [
      { url: '/icons/favicon.ico', sizes: 'any' },
      { url: '/icons/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/icons/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icons/android-chrome-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icons/android-chrome-512x512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    siteName: 'Montana',
    locale: 'en_US',
    alternateLocale: ['ar_EG', 'fr_FR'],
    url: SITE_URL,
    title: 'Montana — Frozen Foods Since 1985',
    description:
      'Family-owned Egyptian frozen-food exporter since 1985. IQF vegetables, fruits, and signature molokhia delivered to 30 countries.',
    images: [
      {
        url: '/en/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Montana — Frozen Foods Since 1985',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Montana — Frozen Foods Since 1985',
    description:
      'Family-owned Egyptian frozen-food exporter since 1985. IQF vegetables, fruits, and signature molokhia delivered to 30 countries.',
    images: ['/en/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FBFAF6' },
    { media: '(prefers-color-scheme: dark)', color: '#0E1B12' },
  ],
  colorScheme: 'light dark',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const theme = getActiveTheme();
  return (
    <html
      lang="en"
      dir="ltr"
      data-theme={theme}
      className={cn(fontVariables)}
      suppressHydrationWarning
    >
      <body
        className={cn(
          'flex min-h-screen flex-col font-sans antialiased',
          displayLatin.variable,
          sansLatin.variable,
          displayArabic.variable,
          sansArabic.variable,
        )}
      >
        {children}
      </body>
    </html>
  );
}
