import localFont from 'next/font/local';

/**
 * Editorial type system (v2 — Claude Design handoff).
 *
 * Latin pair:
 *   - Cormorant Garamond  → display serif (hero/section heads + italic emphases)
 *   - Signika             → body sans (UI, paragraphs, captions)
 *
 * Arabic pair:
 *   - Amiri              → display serif for AR (Ramadan also uses for display)
 *   - IBM Plex Sans Arabic → body sans for AR (preferred — broad glyph coverage,
 *                            highly legible at UI sizes, supports 400/500/600/700)
 *
 * Local WOFF2 assets avoid the Google Fonts URL parsing bug in Next.js 16.4.2.
 * next/font keeps automatic fallback metrics and the existing CSS variables.
 * Variables are wired into Tailwind tokens via @theme inline in globals.css.
 */

export const displayLatin = localFont({
  src: [
    {
      path: '../assets/fonts/cormorantgaramond/CormorantGaramond.woff2',
      weight: '400 700',
      style: 'normal',
    },
    {
      path: '../assets/fonts/cormorantgaramond/CormorantGaramond-Italic.woff2',
      weight: '400 700',
      style: 'italic',
    },
  ],
  variable: '--font-display-latin',
  display: 'swap',
  preload: true,
  // size-adjust against the serif fallback so swap doesn't reflow headings (CLS).
  adjustFontFallback: 'Times New Roman',
  fallback: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
});

export const sansLatin = localFont({
  src: '../assets/fonts/signika/Signika.woff2',
  weight: '400 700',
  style: 'normal',
  variable: '--font-sans-latin',
  display: 'swap',
  preload: true,
  // metric-matched sans fallback minimises body-text shift during swap (CLS).
  fallback: ['system-ui', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
});

export const displayArabic = localFont({
  src: [
    { path: '../assets/fonts/amiri/Amiri-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../assets/fonts/amiri/Amiri-Bold.woff2', weight: '700', style: 'normal' },
    { path: '../assets/fonts/amiri/Amiri-Italic.woff2', weight: '400', style: 'italic' },
    { path: '../assets/fonts/amiri/Amiri-BoldItalic.woff2', weight: '700', style: 'italic' },
  ],
  adjustFontFallback: 'Times New Roman',
  variable: '--font-display-arabic',
  display: 'swap',
  preload: false,
  fallback: ['Times New Roman', 'serif'],
});

export const sansArabic = localFont({
  src: [
    {
      path: '../assets/fonts/ibmplexsansarabic/IBMPlexSansArabic-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../assets/fonts/ibmplexsansarabic/IBMPlexSansArabic-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../assets/fonts/ibmplexsansarabic/IBMPlexSansArabic-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../assets/fonts/ibmplexsansarabic/IBMPlexSansArabic-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-sans-arabic',
  display: 'swap',
  preload: false,
  fallback: ['Segoe UI', 'Tahoma', 'Arial', 'sans-serif'],
});

/** All font CSS variable names — applied to <html> in the root layout. */
export const fontVariables = [
  displayLatin.variable,
  sansLatin.variable,
  displayArabic.variable,
  sansArabic.variable,
].join(' ');
