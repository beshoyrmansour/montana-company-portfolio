'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Closes the header's pure-CSS <details> menus (hamburger + language) after a
 * client-side navigation. Next.js routes without a full reload, so an open
 * <details open> would otherwise stay open once a link is tapped.
 *
 * Rendered inside the (server-component) Header to keep that a server component.
 */
export function CloseMenusOnNavigate() {
  const pathname = usePathname();

  useEffect(() => {
    document.querySelectorAll<HTMLDetailsElement>('header details[open]').forEach((d) => {
      d.open = false;
    });
  }, [pathname]);

  return null;
}
