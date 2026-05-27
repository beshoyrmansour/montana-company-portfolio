import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Tailwind-merge has to be told about our custom font-size utilities,
 * otherwise it groups them with text-colors (`text-*` namespace) and
 * silently drops one when both are present.
 *
 * Real bug this fixes: `text-brand-primary-fg text-body-lg` would collapse
 * to just `text-body-lg`, leaving every Button with a custom size invisible
 * (white-on-green became unstyled-on-green).
 *
 * If you add a new typography token to `--text-*` in tokens.css, add it here.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display-2xl',
            'display-xl',
            'display-lg',
            'display',
            'heading-1',
            'heading-2',
            'heading-3',
            'body-lg',
            'body',
            'body-sm',
            'caption',
            'eyebrow',
          ],
        },
      ],
    },
  },
});

/**
 * Combine class names with Tailwind conflict resolution.
 * Use everywhere instead of raw string concatenation.
 *
 * cn('p-4', isActive && 'bg-brand-primary', 'p-8')  →  'bg-brand-primary p-8'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
