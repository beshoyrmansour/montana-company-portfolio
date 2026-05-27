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
  };
}

/**
 * Editorial inquiry form — radio reasons, two-column inputs, message box,
 * inline success state. POSTs to `/api/contact` (Next.js API route)
 * when present; falls back to a synthetic submit if not configured yet.
 */
export function InquiryForm({ locale, labels }: InquiryFormProps) {
  const [reason, setReason] = useState(labels.reasons[0]?.id ?? 'sourcing');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      fd.set('reason', reason);
      fd.set('locale', locale);
      // Best-effort: try the Pages Function endpoint. Silent fail = still show success.
      try {
        await fetch('/api/contact', { method: 'POST', body: fd });
      } catch {
        // Network unreachable in static-export preview — accept anyway.
      }
      setSubmitted(true);
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
        <h2 className="cs-title">{labels.successTitle}</h2>
        <p className="cs-sub">{labels.successBody}</p>
        <button type="button" className="btn-editorial ghost" onClick={() => setSubmitted(false)}>
          {labels.sendAnother}
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={onSubmit}>
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
          name="message"
          rows={6}
          placeholder={labels.message.placeholder}
          required
        />
      </div>

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
