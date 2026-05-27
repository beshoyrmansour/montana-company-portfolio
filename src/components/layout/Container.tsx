import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ContainerProps {
  width?: 'narrow' | 'default' | 'wide' | 'full';
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

const widthClass = {
  narrow: 'max-w-[720px]',
  default: 'max-w-7xl',
  wide: 'max-w-[1440px]',
  full: 'max-w-none',
};

export function Container({
  width = 'default',
  as: As = 'div',
  className,
  children,
}: ContainerProps) {
  return (
    <As className={cn('mx-auto w-full px-4 lg:px-8', widthClass[width], className)}>{children}</As>
  );
}
