'use client';

import { useEffect } from 'react';

/**
 * Toggles `.is-scrolled` on <html> once the visitor scrolls past a small
 * threshold. CSS (`.site-logo`) uses it to shrink the header logo from its
 * large at-rest-at-top size down to the compact scrolled size.
 *
 * Side-effect only — renders nothing. Kept as a tiny client component so the
 * Header itself can stay a server component.
 */
export function HeaderScroll() {
  useEffect(() => {
    const root = document.documentElement;
    let ticking = false;

    const update = () => {
      root.classList.toggle('is-scrolled', window.scrollY > 24);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    update(); // set correct state on mount (e.g. reloads mid-page)
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return null;
}
