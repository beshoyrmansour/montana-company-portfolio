'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker (public/sw.js) for offline / PWA support.
 *
 * - Side-effect only: renders nothing.
 * - Skips registration on localhost so the SW never caches the dev server
 *   (which would mask code changes during development).
 * - Fails quietly: a registration error must never break the page.
 */
export default function ServiceWorkerRegister(): null {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const { hostname } = window.location;
    const isLocalhost =
      hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';

    // Avoid surprising caching during local development.
    if (process.env.NODE_ENV !== 'production' || isLocalhost) return;

    const register = (): void => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error: unknown) => {
        console.warn('[pwa] service worker registration failed', error);
      });
    };

    // Register after load to avoid contending with first-paint resources.
    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
      return () => window.removeEventListener('load', register);
    }
  }, []);

  return null;
}
