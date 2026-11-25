'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import type { Locale } from '@/lib/i18n';

interface InquiryFormProps {
  locale: Locale;
  labels: {
    reasonQ: string;
    reasons: { id: string; label: string }[];
    name: { label: string; placeholder: string };
    company: { label: string; placeholder: string };
    email: { label: string; placeholder: string };
    country: { label: string; placeholder: string };
    message: { label: string; placeholder: string };
    note: string;
    submit: string;
    successTitle: string;
    successBody: string;
    sendAnother: string;
    consent: string;
    privacyLink: string;
    error: string;
  };
}

const SUBJECT_BY_REASON: Readonly<Record<string, string>> = {
  sourcing: 'export',
  existing: 'sales',
  sample: 'sales',
  press: 'press',
  careers: 'general',
  other: 'general',
};

/** Editorial inquiry form for the localized contact page. */
export function InquiryForm({ locale, labels }: InquiryFormProps) {
  const [reason, setReason] = useState(labels.reasons[0]?.id ?? 'sourcing');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [failed, setFailed] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setSubmitting(true);
    setFailed(false);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          reason,
          subject: SUBJECT_BY_REASON[reason] ?? 'general',
          consent: data.consent === 'on',
        }),
      });
      if (!response.ok || (await response.json()).ok !== true) {
        setFailed(true);
        return;
      }
      setSubmitted(true);
    } catch {
      setFailed(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="contact-form contact-success">
        <div className="cs-check">
          <Check size={56} strokeWidth={1.5} />
        </div>
        <h2 role="status" className="cs-title">
          {labels.successTitle}
        </h2>
        <p className="cs-sub">{labels.successBody}</p>
        <button type="button" className="btn-editorial ghost" onClick={() => setSubmitted(false)}>
          {labels.sendAnother}
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} aria-busy={submitting}>
      <div className="cf-field">
        <label>{labels.reasonQ}</label>
        <div className="cf-radio-grid">
          {labels.reasons.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`cf-radio ${reason === r.id ? 'active' : ''}`}
              onClick={() => setReason(r.id)}
              aria-pressed={reason === r.id}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="cf-row">
        <div className="cf-field">
          <label htmlFor="cf-name">{labels.name.label}</label>
          <input
            id="cf-name"
            minLength={2}
            maxLength={100}
            name="name"
            type="text"
            placeholder={labels.name.placeholder}
            required
          />
        </div>
        <div className="cf-field">
          <label htmlFor="cf-company">{labels.company.label}</label>
          <input
            id="cf-company"
            maxLength={100}
            name="company"
            type="text"
            placeholder={labels.company.placeholder}
          />
        </div>
      </div>

      <div className="cf-row">
        <div className="cf-field">
          <label htmlFor="cf-email">{labels.email.label}</label>
          <input
            id="cf-email"
            maxLength={200}
            name="email"
            type="email"
            placeholder={labels.email.placeholder}
            required
          />
        </div>
        <div className="cf-field">
          <label htmlFor="cf-country">{labels.country.label}</label>
          <input
            id="cf-country"
            maxLength={100}
            name="country"
            type="text"
            placeholder={labels.country.placeholder}
          />
        </div>
      </div>

      <div className="cf-field">
        <label htmlFor="cf-msg">{labels.message.label}</label>
        <textarea
          id="cf-msg"
          minLength={10}
          maxLength={5000}
          name="message"
          rows={6}
          placeholder={labels.message.placeholder}
          required
        />
      </div>

      <div aria-hidden="true" className="sr-only">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="text-body-sm">
        <label className="flex items-start gap-2">
          <input type="checkbox" name="consent" required className="mt-1 shrink-0" />
          {labels.consent}
        </label>
        <a href={`/${locale}/privacy`} className="underline">
          {labels.privacyLink}
        </a>
      </div>
      {failed && (
        <p role="alert" className="text-danger text-body-sm">
          {labels.error}
        </p>
      )}

      <div className="cf-foot">
        <p className="cf-note">{labels.note}</p>
        <button type="submit" className="btn-editorial primary" disabled={submitting}>
          {submitting ? '…' : labels.submit}
          <ArrowRight size={16} className="rtl:rotate-180" />
        </button>
      </div>
    </form>
  );
}
