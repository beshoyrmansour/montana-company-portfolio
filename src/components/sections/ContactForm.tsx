'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/primitives/Button';

interface ContactFormProps {
  subjects: Array<{ value: string; label: string }>;
  successMessage: string;
  errorMessage: string;
  privacyHref: string;
}

export function ContactForm({
  subjects,
  successMessage,
  errorMessage,
  privacyHref,
}: ContactFormProps) {
  const tForm = useTranslations('contact.form');
  const tPrefill = useTranslations('contact.prefill');

  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [prefilledSubject, setPrefilledSubject] = useState<string | undefined>();
  const [prefilledMessage, setPrefilledMessage] = useState<string>('');

  // Read ?product=<slug> from URL and pre-fill the form for a smoother lead capture
  // from product-detail pages. Runs client-side because static export has no query
  // params at build time.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const product = sp.get('product');
    if (product) {
      const productName = product.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      setPrefilledSubject('sales');
      setPrefilledMessage(
        [
          tPrefill('intro', { productName }),
          '',
          tPrefill('askFor'),
          `  • ${tPrefill('varieties')}`,
          `  • ${tPrefill('packaging')}`,
          `  • ${tPrefill('moq')}`,
          `  • ${tPrefill('leadTime')}`,
          '',
          tPrefill('marketLabel'),
          '',
          tPrefill('signoff'),
          '',
        ].join('\n'),
      );
    }
  }, [tPrefill]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('submitting');
    setErrors({});

    const data = Object.fromEntries(new FormData(e.currentTarget));

    // Honeypot check
    if (data.website) {
      setState('success');
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setState('success');
        (e.target as HTMLFormElement).reset();
      } else {
        const body = await res.json().catch(() => ({}));
        setErrors(body.errors ?? {});
        setState('error');
      }
    } catch {
      setState('error');
    }
  }

  return (
    <form onSubmit={onSubmit} aria-busy={state === 'submitting'} noValidate>
      {state === 'success' && (
        <div
          role="alert"
          className="border-success-border bg-success-bg text-success mb-6 rounded-md border p-4"
        >
          {successMessage}
        </div>
      )}
      {state === 'error' && (
        <div
          role="alert"
          className="border-danger-border bg-danger-bg text-danger mb-6 rounded-md border p-4"
        >
          {errorMessage}
        </div>
      )}

      <div className="grid gap-5">
        <div>
          <label htmlFor="cf-name" className="text-body-sm mb-2 block font-semibold">
            {tForm('name')} <span className="text-danger">*</span>
          </label>
          <input
            id="cf-name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            className="border-border bg-surface text-body focus:border-brand-primary focus:ring-brand-primary/40 h-11 w-full rounded-md border px-4 focus:ring-4 focus:outline-none"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && (
            <p role="alert" className="text-body-sm text-danger mt-1">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="cf-email" className="text-body-sm mb-2 block font-semibold">
            {tForm('email')} <span className="text-danger">*</span>
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            inputMode="email"
            required
            maxLength={200}
            autoComplete="email"
            className="border-border bg-surface text-body focus:border-brand-primary focus:ring-brand-primary/40 h-11 w-full rounded-md border px-4 focus:ring-4 focus:outline-none"
            aria-invalid={Boolean(errors.email)}
          />
        </div>

        <div>
          <label htmlFor="cf-company" className="text-body-sm mb-2 block font-semibold">
            {tForm('company')}{' '}
            <span className="text-text-muted font-normal">{tForm('optional')}</span>
          </label>
          <input
            id="cf-company"
            name="company"
            type="text"
            maxLength={100}
            autoComplete="organization"
            className="border-border bg-surface text-body focus:border-brand-primary focus:ring-brand-primary/40 h-11 w-full rounded-md border px-4 focus:ring-4 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="cf-subject" className="text-body-sm mb-2 block font-semibold">
            {tForm('subject')} <span className="text-danger">*</span>
          </label>
          <select
            id="cf-subject"
            name="subject"
            required
            defaultValue={prefilledSubject ?? subjects[0]?.value}
            key={prefilledSubject ?? 'default'}
            className="border-border bg-surface text-body focus:border-brand-primary focus:ring-brand-primary/40 h-11 w-full rounded-md border px-4 focus:ring-4 focus:outline-none"
          >
            {subjects.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="cf-message" className="text-body-sm mb-2 block font-semibold">
            {tForm('message')} <span className="text-danger">*</span>
          </label>
          <textarea
            id="cf-message"
            name="message"
            required
            minLength={10}
            maxLength={5000}
            rows={8}
            defaultValue={prefilledMessage}
            key={prefilledMessage}
            className="border-border bg-surface text-body focus:border-brand-primary focus:ring-brand-primary/40 w-full rounded-md border px-4 py-3 focus:ring-4 focus:outline-none"
          />
        </div>

        {/* Honeypot — hidden from users + screen readers */}
        <div aria-hidden="true" className="absolute -start-[9999px]">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <label className="text-body-sm flex items-start gap-3">
          <input type="checkbox" name="consent" required className="mt-1" />
          <span>
            {tForm('consent')}{' '}
            <a href={privacyHref} className="underline">
              {tForm('privacyLink')}
            </a>
            .
          </span>
        </label>

        <Button type="submit" size="lg" fullWidth loading={state === 'submitting'}>
          {tForm('submit')}
        </Button>
      </div>
    </form>
  );
}
