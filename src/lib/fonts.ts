import { Signika, Cormorant_Garamond, Amiri, Tajawal } from 'next/font/google';

/**
 * Editorial type system (v2 — Claude Design handoff).
 *
 * Latin pair:
 *   - Cormorant Garamond  → display serif (hero/section heads + italic emphases)
 *   - Signika             → body sans (UI, paragraphs, captions)
 *
 * Arabic pair:
 *   - Amiri    → display serif for AR (Ramadan also uses for display)
 *   - Tajawal  → body sans for AR (preferred — broad glyph coverage,
 *                excellent in Gulf/Egypt markets, supports 400/500/700)
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

export const sansArabic = Tajawal({
  subsets: ['arabic'],
  // Tajawal supports 200/300/400/500/700/800/900 — no 600 (use 500 as nearest semibold).
  weight: ['400', '500', '700'],
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
