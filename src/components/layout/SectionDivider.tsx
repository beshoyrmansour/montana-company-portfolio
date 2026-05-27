/**
 * Decorative divider between sections.
 * Inspired by the leaf/seasonal-stamp motifs in the Montana catalogue (page 26).
 * Pure inline SVG — zero HTTP requests, scales perfectly.
 *
 * Use sparingly between major content shifts (e.g. before the newsroom or
 * before the markets teaser). Default opacity is low — meant to feel like
 * a stamp / watermark, not a heavy graphic.
 */

import { cn } from '@/lib/cn';

interface SectionDividerProps {
  variant?: 'leaf' | 'wave' | 'dots';
  className?: string;
}

export function SectionDivider({ variant = 'leaf', className }: SectionDividerProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-4 py-8',
        'text-brand-primary opacity-25',
        className,
      )}
      aria-hidden
    >
      <span className="h-px w-16 bg-current sm:w-24" />
      <DividerIcon variant={variant} />
      <span className="h-px w-16 bg-current sm:w-24" />
    </div>
  );
}

function DividerIcon({ variant }: { variant: 'leaf' | 'wave' | 'dots' }) {
  switch (variant) {
    case 'leaf':
      return (
        <svg viewBox="0 0 32 32" className="h-6 w-6" fill="currentColor">
          <path d="M16 4C9 4 5 10 5 17c0 6 4 11 11 11s11-5 11-11C27 10 23 4 16 4zm0 4c5 0 8 4 8 9 0 5-3 7-8 7s-8-2-8-7c0-5 3-9 8-9z" />
          <path
            d="M16 6c-3 0-5 2-5 5 0 2 1 4 3 5l2-7 2 7c2-1 3-3 3-5 0-3-2-5-5-5z"
            opacity="0.55"
          />
        </svg>
      );
    case 'wave':
      return (
        <svg
          viewBox="0 0 64 16"
          className="h-4 w-16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M0 8 Q 8 0 16 8 T 32 8 T 48 8 T 64 8" />
        </svg>
      );
    case 'dots':
      return (
        <div className="flex gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
        </div>
      );
  }
}
