import { Signika, Cormorant_Garamond, Amiri, IBM_Plex_Sans_Arabic } from 'next/font/google';

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
 * All self-hosted at build time via next/font, with size-adjust to prevent CLS.
 * Variables are wired into Tailwind tokens via @theme inline in globals.css.
 */

export const displayLatin = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display-latin',
  display: 'swap',
  preload: true,
});

export const sansLatin = Signika({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans-latin',
  display: 'swap',
  preload: true,
});

export const displayArabic = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display-arabic',
  display: 'swap',
  preload: false,
});

export const sansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  // IBM Plex Sans Arabic supports 100/200/300/400/500/600/700.
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans-arabic',
  display: 'swap',
  preload: false,
});

/** All font CSS variable names — applied to <html> in the root layout. */
export const fontVariables = [
  displayLatin.variable,
  sansLatin.variable,
  displayArabic.variable,
  sansArabic.variable,
].join(' ');
