import Link from 'next/link';
import { cn } from '@/lib/cn';

interface FeatureCard {
  eyebrow?: string;
  title: string;
  body: string;
  cta?: { label: string; href: string };
  image?: string;
  /** Background tint for the card */
  variant: 'cream' | 'rose' | 'brand';
}

interface FeatureCardsProps {
  cards: FeatureCard[];
  className?: string;
}

const variantStyles = {
  cream: {
    bg: 'bg-brand-cream',
    text: 'text-text',
    body: 'text-text-muted',
    button: 'bg-brand-primary text-brand-primary-fg hover:bg-brand-primary-hover',
  },
  rose: {
    bg: 'bg-[#E0CFCB]', // dusty pink from Superfood Grocery Home
    text: 'text-text',
    body: 'text-text-muted',
    button: 'bg-surface text-brand-primary border border-border hover:bg-surface-muted',
  },
  brand: {
    bg: 'bg-brand-primary',
    text: 'text-brand-primary-fg',
    body: 'text-brand-primary-fg/90',
    button: 'bg-surface text-text hover:bg-surface-muted',
  },
};

/**
 * The signature "Grocery Home" 3-card row from Superfood theme.
 * Three full-bleed colored panels (cream / rose / brand-green) with a
 * vegetable photo peeking from the right edge of each card.
 */
export function FeatureCards({ cards, className }: FeatureCardsProps) {
  return (
    <section className={cn('grid grid-cols-1 md:grid-cols-3', className)}>
      {cards.map((card, idx) => {
        const v = variantStyles[card.variant];
        return (
          <div
            key={idx}
            className={cn('relative overflow-hidden px-8 py-12 lg:px-10 lg:py-16', v.bg)}
          >
            {card.image && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 end-0 w-2/5 opacity-90"
                style={{
                  backgroundImage: `url(${card.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  maskImage: 'linear-gradient(to inline-start, black 60%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to left, black 60%, transparent 100%)',
                }}
              />
            )}
            <div className="relative max-w-[60%]">
              {card.eyebrow && (
                <p
                  className={cn(
                    'text-caption mb-2 font-semibold tracking-wider uppercase',
                    v.text,
                    'opacity-70',
                  )}
                >
                  {card.eyebrow}
                </p>
              )}
              <h3 className={cn('text-heading-1 mb-3 font-bold', v.text)}>{card.title}</h3>
              <p className={cn('text-body mb-6 leading-relaxed', v.body)}>{card.body}</p>
              {card.cta && (
                <Link
                  href={card.cta.href}
                  className={cn(
                    'text-body-sm inline-block rounded-md px-6 py-3 font-semibold tracking-wider uppercase transition-colors',
                    v.button,
                  )}
                >
                  {card.cta.label}
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
