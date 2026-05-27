import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps {
  variant?: 'default' | 'bordered' | 'elevated' | 'interactive' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  radius?: 'md' | 'lg' | 'xl';
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

const variantClass = {
  default: 'bg-surface border border-border shadow-xs',
  bordered: 'bg-surface border border-border',
  elevated: 'bg-surface-elevated shadow-md',
  interactive:
    'bg-surface border border-border shadow-xs transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md',
  flat: 'bg-surface-muted',
};

const paddingClass = {
  none: '',
  sm: 'p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
};

const radiusClass = {
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
};

export function Card({
  variant = 'default',
  padding = 'md',
  radius = 'lg',
  as: As = 'div',
  className,
  children,
}: CardProps) {
  return (
    <As
      className={cn(variantClass[variant], paddingClass[padding], radiusClass[radius], className)}
    >
      {children}
    </As>
  );
}
