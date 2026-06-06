/* Montana — vanilla JS cookie consent banner (GDPR / PDPL compliant).
 * Loaded as a deferred <script> from the locale layout.
 * No framework, no React — keeps Tier-1 pages within their JS budget.
 *
 * Analytics model:
 *   - Cookieless Vercel Web Analytics runs on all pages (no cookies, no stored
 *     IP, no personal data) via the <Analytics/> tag in the root layout — it
 *     needs no consent and is NOT governed by this banner.
 *   - The OPTIONAL Plausible tag below is consent-gated: it is injected only
 *     after the visitor clicks "Accept". "Decline" (or no choice) loads nothing.
 *   - Accept and Decline are presented with equal prominence (no dark pattern).
 *   - Consent is withdrawable at any time: window.MontanaCookies.open()
 *     (wired to the "Cookie settings" link in the footer) re-opens the banner.
 *   - A consent record (decision + ISO timestamp + policy version) is stored
 *     so the choice is auditable.
 *
 * The only cookie this sets is `cookie-consent`, which is strictly necessary
 * (it remembers the visitor's own privacy choice) and therefore exempt.
 */
(function () {
  'use strict';

  var COOKIE_NAME = 'cookie-consent';
  var COOKIE_DAYS = 180; // GDPR best practice: re-ask at least every 6 months
  var CONSENT_VERSION = 1; // bump to re-prompt everyone after a policy change

  function getEl() {
    return document.getElementById('cookie-banner');
  }

  function getStrings() {
    var el = getEl();
    if (!el) return null;
    return {
      title: el.dataset.title || 'Cookies & privacy',
      body:
        el.dataset.body ||
        'We use privacy-friendly, cookieless analytics to understand site traffic — it stores no cookies and no personal data.',
      accept: el.dataset.accept || 'Accept',
      reject: el.dataset.reject || 'Decline',
      learnMore: el.dataset.learnMore || 'Privacy policy',
      cookiePolicy: el.dataset.cookiePolicy || 'Cookie policy',
      privacyHref: el.dataset.privacyHref || '/privacy',
      cookiesHref: el.dataset.cookiesHref || '/cookies',
      plausibleDomain: el.dataset.plausibleDomain || '',
      plausibleSrc: el.dataset.plausibleSrc || '',
    };
  }

  function getCookie(name) {
    var m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return m ? decodeURIComponent(m[2]) : null;
  }

  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 86400000);
    document.cookie =
      name +
      '=' +
      encodeURIComponent(value) +
      ';expires=' +
      d.toUTCString() +
      ';path=/;SameSite=Lax;Secure';
  }

  /** Returns the stored decision: 'accepted' | 'denied' | null. Tolerates the
   *  legacy plain-string format as well as the new JSON record. */
  function readConsent() {
    var raw = getCookie(COOKIE_NAME);
    if (!raw) return null;
    if (raw === 'accepted' || raw === 'denied') return raw;
    try {
      var rec = JSON.parse(raw);
      if (rec && (rec.consent === 'accepted' || rec.consent === 'denied')) {
        // Re-prompt if the policy version moved on since this record was stored.
        if (rec.v !== CONSENT_VERSION) return null;
        return rec.consent;
      }
    } catch (e) {
      /* corrupt cookie → treat as no decision */
    }
    return null;
  }

  function writeConsent(decision) {
    var record = {
      consent: decision, // 'accepted' | 'denied'
      v: CONSENT_VERSION,
      ts: new Date().toISOString(),
    };
    setCookie(COOKIE_NAME, JSON.stringify(record), COOKIE_DAYS);
  }

  /** Inject the Plausible analytics tag — once, and only after consent. */
  function loadAnalytics(strings) {
    if (!strings.plausibleDomain) return; // analytics not configured
    if (document.querySelector('script[data-domain="' + strings.plausibleDomain + '"]')) return;
    var s = document.createElement('script');
    s.defer = true;
    s.setAttribute('data-domain', strings.plausibleDomain);
    s.src = strings.plausibleSrc || 'https://plausible.io/js/script.js';
    document.head.appendChild(s);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var BTN_BASE =
    'flex:0 0 auto;min-width:7.5rem;padding:0.625rem 1.25rem;border-radius:8px;font:inherit;' +
    'font-size:0.875rem;font-weight:600;cursor:pointer;line-height:1.2;transition:filter .15s ease';

  function render(strings) {
    // Avoid duplicate banners (e.g. re-open while one is already shown).
    var existing = document.getElementById('cookie-banner-ui');
    if (existing) existing.remove();

    var wrap = document.createElement('div');
    wrap.id = 'cookie-banner-ui';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'false');
    wrap.setAttribute('aria-labelledby', 'cookie-banner-title');
    wrap.setAttribute('aria-describedby', 'cookie-banner-body');
    wrap.style.cssText =
      'position:fixed;bottom:0;inset-inline-start:0;inset-inline-end:0;z-index:60;' +
      'background:#FFFFFF;border-top:1px solid #E5E5E5;box-shadow:0 -10px 30px rgba(0,0,0,0.10);' +
      'padding:1.25rem 1rem;font-family:system-ui,-apple-system,sans-serif;color:#2B2B2B';

    wrap.innerHTML =
      '<div style="max-width:1280px;margin:0 auto;display:flex;flex-wrap:wrap;gap:1rem 1.5rem;align-items:center;justify-content:space-between">' +
      '<div style="flex:1 1 22rem;min-width:0">' +
      '<p id="cookie-banner-title" style="font-size:0.9375rem;font-weight:700;margin:0 0 0.25rem">' +
      escapeHtml(strings.title) +
      '</p>' +
      '<p id="cookie-banner-body" style="font-size:0.875rem;line-height:1.5;margin:0;color:#4A4A4A">' +
      escapeHtml(strings.body) +
      ' <a href="' +
      escapeHtml(strings.cookiesHref) +
      '" style="color:#147239;text-decoration:underline;font-weight:600">' +
      escapeHtml(strings.cookiePolicy) +
      '</a>' +
      ' · ' +
      '<a href="' +
      escapeHtml(strings.privacyHref) +
      '" style="color:#147239;text-decoration:underline;font-weight:600">' +
      escapeHtml(strings.learnMore) +
      '</a>' +
      '</p>' +
      '</div>' +
      '<div style="display:flex;gap:0.625rem;flex:0 0 auto;flex-wrap:wrap">' +
      '<button type="button" data-action="decline" style="' +
      BTN_BASE +
      ';border:1px solid #CFCFCF;background:#F4F4F4;color:#2B2B2B">' +
      escapeHtml(strings.reject) +
      '</button>' +
      '<button type="button" data-action="accept" style="' +
      BTN_BASE +
      ';border:1px solid #147239;background:#147239;color:#FFFFFF">' +
      escapeHtml(strings.accept) +
      '</button>' +
      '</div>' +
      '</div>';

    document.body.appendChild(wrap);

    function close() {
      wrap.remove();
    }

    wrap.querySelector('[data-action="accept"]').addEventListener('click', function () {
      writeConsent('accepted');
      close();
      loadAnalytics(strings);
      window.dispatchEvent(new Event('mt:consent-accepted'));
    });

    wrap.querySelector('[data-action="decline"]').addEventListener('click', function () {
      writeConsent('denied');
      close();
      // Nothing to load. Any previously-injected analytics will simply not run
      // on the next page load (consent is now 'denied').
      window.dispatchEvent(new Event('mt:consent-denied'));
    });

    // Move focus to the dialog so keyboard/screen-reader users land on it.
    wrap.setAttribute('tabindex', '-1');
    try {
      wrap.focus({ preventScroll: true });
    } catch (e) {
      /* older browsers: ignore */
    }
  }

  function open() {
    var strings = getStrings();
    if (strings) render(strings);
  }

  // Public API — used by the footer "Cookie settings" control to withdraw or
  // change consent at any time (GDPR Art. 7(3) — withdrawal as easy as giving).
  window.MontanaCookies = {
    open: open,
    accept: function () {
      var s = getStrings();
      if (!s) return;
      writeConsent('accepted');
      loadAnalytics(s);
    },
    decline: function () {
      writeConsent('denied');
    },
  };

  function init() {
    var strings = getStrings();
    if (!strings) return;

    // Wire up any "Cookie settings" trigger in the page (e.g. footer link).
    var triggers = document.querySelectorAll('[data-cookie-settings]');
    for (var i = 0; i < triggers.length; i++) {
      triggers[i].addEventListener('click', function (ev) {
        ev.preventDefault();
        open();
      });
    }

    var decision = readConsent();
    if (decision === 'accepted') {
      loadAnalytics(strings); // returning visitor who already opted in
      return;
    }
    if (decision === 'denied') {
      return; // honour the decline — load nothing, show nothing
    }
    render(strings); // no decision yet → ask
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
