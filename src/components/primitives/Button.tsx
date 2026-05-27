import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  fullWidth?: boolean;
}

const variantClass: Record<Required<ButtonProps>['variant'], string> = {
  primary:
    'bg-brand-primary text-brand-primary-fg hover:bg-brand-primary-hover',
  secondary:
    'bg-surface text-text border border-border hover:bg-surface-muted',
  ghost: 'bg-transparent text-brand-primary hover:bg-brand-primary-subtle',
  danger: 'bg-danger text-white hover:opacity-90',
  link: 'bg-transparent text-brand-primary underline-offset-2 hover:underline px-0',
};

const sizeClass: Record<Required<ButtonProps>['size'], string> = {
  sm: 'h-9 px-3 text-body-sm gap-1.5',
  md: 'h-11 px-4 text-body gap-2',
  lg: 'h-12 px-6 text-body-lg gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading,
      iconStart,
      iconEnd,
      fullWidth,
      className,
      children,
      disabled,
      type = 'button',
      ...rest
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-semibold whitespace-nowrap',
        'transition-colors duration-150 ease-out',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClass[variant],
        sizeClass[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <>
          <span
            aria-hidden
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          <span className="sr-only">Loading…</span>
        </>
      ) : (
        <>
          {iconStart && <span aria-hidden>{iconStart}</span>}
          {children && <span>{children}</span>}
          {iconEnd && <span aria-hidden>{iconEnd}</span>}
        </>
      )}
    </button>
  ),
);

Button.displayName = 'Button';
