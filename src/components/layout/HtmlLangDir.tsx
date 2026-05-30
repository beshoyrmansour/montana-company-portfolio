'use client';

import { useEffect } from 'react';
import { getDir, type Locale } from '@/lib/i18n';

interface HtmlLangDirProps {
  locale: Locale;
}

/**
 * Keeps <html lang> and <html dir> in sync with the active locale on the client.
 *
 * The locale layout renders an inline <script> that sets these synchronously on
 * the initial paint (no FOUC). But that script does NOT re-run on Next.js
 * soft navigation, so switching language via <Link> (e.g. AR → EN) would leave
 * the document direction stale — Arabic content stuck in an LTR layout, or vice
 * versa. This effect re-applies lang/dir whenever the locale changes, covering
 * client-side language switches.
 */
export function HtmlLangDir({ locale }: HtmlLangDirProps) {
  useEffect(() => {
    const el = document.documentElement;
    el.lang = locale;
    el.dir = getDir(locale);
  }, [locale]);

  return null;
}
