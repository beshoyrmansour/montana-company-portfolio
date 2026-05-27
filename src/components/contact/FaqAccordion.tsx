'use client';

import { useState } from 'react';

interface FaqEntry {
  q: string;
  a: string;
}

/**
 * FAQ accordion. First item open by default; mutually exclusive — clicking
 * an open item closes it. Pure CSS-driven open-state class.
 */
export function FaqAccordion({ items }: { items: FaqEntry[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="faq-list">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className={`faq-item ${isOpen ? 'open' : ''}`}>
            <button
              type="button"
              className="faq-q"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`faq-a-${i}`}
            >
              <span>{f.q}</span>
              <span className="faq-toggle" aria-hidden>
                {isOpen ? '−' : '+'}
              </span>
            </button>
            {isOpen && (
              <p id={`faq-a-${i}`} className="faq-a">
                {f.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
