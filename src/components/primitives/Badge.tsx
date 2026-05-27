import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { ProductBadge } from '@/schemas/product';

type SemanticVariant = ProductBadge | 'neutral';
type FeedbackVariant = 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  variant?: SemanticVariant | FeedbackVariant;
  size?: 'sm' | 'md';
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const variantClass: Record<SemanticVariant | FeedbackVariant, string> = {
  popular: 'bg-brand-orange text-white',
  seasonal: 'bg-brand-amber text-text',
  new: 'bg-brand-primary text-brand-primary-fg',
  signature: 'bg-brand-secondary text-brand-secondary-fg',
  'export-only': 'bg-surface-muted text-text-muted border border-border',
  organic: 'bg-brand-lime text-white',
  neutral: 'bg-surface-muted text-text border border-border',
  success: 'bg-success-bg text-success border border-success-border',
  warning: 'bg-warning-bg text-warning border border-warning-border',
  danger: 'bg-danger-bg text-danger border border-danger-border',
  info: 'bg-info-bg text-info border border-info-border',
};

const sizeClass = {
  sm: 'text-caption px-2 py-0.5 gap-1',
  md: 'text-caption px-3 py-1 gap-1.5',
};

export function Badge({ variant = 'neutral', size = 'md', icon, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold uppercase tracking-wider',
        variantClass[variant],
        sizeClass[size],
        className,
      )}
    >
      {icon && (
        <span aria-hidden className="inline-flex">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
