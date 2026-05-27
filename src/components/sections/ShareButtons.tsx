'use client';

import { useState } from 'react';
import { Facebook, Linkedin, Twitter, Link as LinkIcon, Check, MessageCircle } from 'lucide-react';

interface ShareButtonsProps {
  url: string;
  title: string;
  label?: string;
}

/**
 * Minimal share row — opens platform share dialogs in a popup.
 * No tracking, no third-party JS, no SDK loaded.
 */
export function ShareButtons({ url, title, label = 'Share:' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const targets = [
    {
      Icon: Facebook,
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
    },
    {
      Icon: Twitter,
      label: 'X / Twitter',
      href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`,
    },
    {
      Icon: Linkedin,
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
    },
    {
      Icon: MessageCircle,
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodedTitle}%20${encoded}`,
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // no-op — older browsers without clipboard API
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-caption text-text-muted font-semibold tracking-wider uppercase">
        {label}
      </span>
      {targets.map(({ Icon, label, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${label}`}
          className="border-border text-text-muted hover:border-brand-primary hover:bg-brand-primary hover:text-brand-primary-fg flex h-9 w-9 items-center justify-center rounded-full border transition-all"
        >
          <Icon className="h-4 w-4" aria-hidden />
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        aria-label="Copy link"
        className="border-border text-text-muted hover:border-brand-primary hover:bg-brand-primary hover:text-brand-primary-fg flex h-9 w-9 items-center justify-center rounded-full border transition-all"
      >
        {copied ? (
          <Check className="h-4 w-4" aria-hidden />
        ) : (
          <LinkIcon className="h-4 w-4" aria-hidden />
        )}
      </button>
    </div>
  );
}
