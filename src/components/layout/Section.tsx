import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface SectionProps {
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  background?: 'surface' | 'muted' | 'cream' | 'inverse' | 'brand';
  as?: ElementType;
  id?: string;
  className?: string;
  children: ReactNode;
}

const spacingClass = {
  none: '',
  sm: 'py-8 md:py-12',
  md: 'py-12 md:py-20',
  lg: 'py-16 md:py-24',
  xl: 'py-24 md:py-32',
};

const bgClass = {
  surface: 'bg-surface text-text',
  muted: 'bg-surface-muted text-text',
  cream: 'bg-brand-cream text-text',
  inverse: 'bg-surface-inverse text-text-inverse',
  brand: 'bg-brand-primary text-text-on-brand',
};

export function Section({
  spacing = 'lg',
  background = 'surface',
  as: As = 'section',
  id,
  className,
  children,
}: SectionProps) {
  return (
    <As id={id} className={cn(spacingClass[spacing], bgClass[background], className)}>
      {children}
    </As>
  );
}
