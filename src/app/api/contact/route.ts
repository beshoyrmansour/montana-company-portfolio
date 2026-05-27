/**
 * Contact form endpoint — Next.js App Router API route.
 * Deploys automatically on Vercel as a serverless function at /api/contact.
 *
 * Defense layers:
 *   1. Schema validation (length, format, enum)
 *   2. Honeypot field (must be empty)
 *   3. Cloudflare Turnstile verification (invisible captcha)
 *   4. CR/LF strip on user input
 *   5. From: always a verified Resend domain; user input goes in Reply-To
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ContactPayload {
  name?: string;
  email?: string;
  company?: string;
  subject?: string;
  message?: string;
  consent?: boolean | string;
  website?: string;
  cfToken?: string;
}

const ALLOWED_SUBJECTS = new Set(['general', 'sales', 'export', 'press']);

function clean(value: string): string {
  return value.trim().replace(/[\r\n]+/g, ' ');
}

function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  const first = fwd?.split(',')[0]?.trim();
  return first || request.headers.get('x-real-ip') || 'unknown';
}

function validate(
  body: ContactPayload,
): { ok: true; data: ContactPayload } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!body.name || body.name.trim().length < 2 || body.name.length > 100) {
    errors.name = 'Name must be 2–100 characters';
  }
  if (!body.email || body.email.length > 200 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) {
    errors.email = 'Valid email required';
  }
  if (!body.subject || !ALLOWED_SUBJECTS.has(body.subject)) {
    errors.subject = 'Invalid subject';
  }
  if (!body.message || body.message.trim().length < 10 || body.message.length > 5000) {
    errors.message = 'Message must be 10–5000 characters';
  }
  if (!body.consent) {
    errors.consent = 'Consent required';
  }
  if (body.website && body.website.length > 0) {
    return { ok: false, errors: { spam: 'spam' } };
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: body };
}

async function verifyTurnstile(token: string, secret: string, ip: string): Promise<boolean> {
  if (!token) return false;
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  const result = (await res.json()) as { success?: boolean };
  return result.success === true;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(request: Request): Promise<Response> {
  const ip = clientIp(request);

  let body: ContactPayload;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 });
  }

  const result = validate(body);
  if (!result.ok) {
    return Response.json({ error: 'invalid', errors: result.errors }, { status: 400 });
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET;
  if (turnstileSecret && body.cfToken) {
    const ok = await verifyTurnstile(body.cfToken, turnstileSecret, ip);
    if (!ok) return Response.json({ error: 'captcha' }, { status: 400 });
  }

  const safe = {
    name: clean(result.data.name!),
    email: clean(result.data.email!),
    company: result.data.company ? clean(result.data.company) : '',
    subject: result.data.subject!,
    message: result.data.message!.trim(),
    ip,
    receivedAt: new Date().toISOString(),
  };

  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const ccEmail = process.env.CONTACT_CC_EMAIL;

  if (resendKey && fromEmail && toEmail) {
    const subject = `[Montana website] ${safe.subject} — ${safe.name}`;
    const html = `
      <h2>New website inquiry</h2>
      <p><strong>From:</strong> ${escapeHtml(safe.name)} &lt;${escapeHtml(safe.email)}&gt;</p>
      ${safe.company ? `<p><strong>Company:</strong> ${escapeHtml(safe.company)}</p>` : ''}
      <p><strong>Subject:</strong> ${safe.subject}</p>
      <hr/>
      <p style="white-space: pre-wrap">${escapeHtml(safe.message)}</p>
      <hr/>
      <p style="color: #888; font-size: 12px">Received at ${safe.receivedAt} from ${safe.ip}</p>
    `;
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: toEmail,
        cc: ccEmail || undefined,
        reply_to: safe.email,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('Resend failure:', res.status, text);
      return Response.json({ error: 'mail_failed' }, { status: 502 });
    }
  } else {
    console.log('Contact form submission (no Resend configured):', JSON.stringify(safe));
  }

  return Response.json({ ok: true });
}
