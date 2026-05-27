/* Montana — vanilla JS cookie banner.
 * Loaded as a deferred <script> from the root layout.
 * No framework, no React — keeps Tier-1 pages at ≤5kB JS budget.
 *
 * Behavior:
 *   1. On load: check cookie `cookie-consent`. If absent → show banner.
 *   2. Click "Accept" → set cookie `cookie-consent=accepted` (1 year) + hide banner + optionally enable analytics.
 *   3. Click "Decline" → set cookie `cookie-consent=denied` (1 year) + hide banner.
 *   4. Both choices are remembered for 365 days.
 */
(function () {
  'use strict';

  var COOKIE_NAME = 'cookie-consent';
  var COOKIE_DAYS = 365;

  // Translation strings — injected as data-* attrs on the placeholder div
  function getStrings() {
    var el = document.getElementById('cookie-banner');
    if (!el) return null;
    return {
      title: el.dataset.title || 'Cookies & privacy',
      body: el.dataset.body || 'We use cookieless analytics to improve your experience.',
      accept: el.dataset.accept || 'Got it',
      reject: el.dataset.reject || 'Decline',
      learnMore: el.dataset.learnMore || 'Privacy policy',
      privacyHref: el.dataset.privacyHref || '/privacy',
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
      name + '=' + encodeURIComponent(value) + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax;Secure';
  }

  function render(strings) {
    var wrap = document.createElement('div');
    wrap.setAttribute('role', 'region');
    wrap.setAttribute('aria-label', strings.title);
    wrap.style.cssText =
      'position:fixed;bottom:0;inset-inline-start:0;inset-inline-end:0;z-index:60;background:#FFFFFF;border-top:1px solid #E5E5E5;box-shadow:0 -8px 24px rgba(0,0,0,0.08);padding:1rem;font-family:system-ui,-apple-system,sans-serif;color:#2B2B2B';
    wrap.innerHTML =
      '<div style="max-width:1280px;margin:0 auto;display:flex;flex-direction:column;gap:1rem;align-items:flex-start">' +
      '<p style="font-size:0.875rem;line-height:1.5;margin:0">' +
      strings.body +
      ' <a href="' +
      strings.privacyHref +
      '" style="color:#147239;text-decoration:underline">' +
      strings.learnMore +
      '</a>' +
      '</p>' +
      '<div style="display:flex;gap:0.5rem;align-self:flex-end">' +
      '<button type="button" data-action="decline" style="padding:0.5rem 1rem;border-radius:6px;border:1px solid #E5E5E5;background:transparent;color:#2B2B2B;font-weight:600;cursor:pointer">' +
      strings.reject +
      '</button>' +
      '<button type="button" data-action="accept" style="padding:0.5rem 1rem;border-radius:6px;border:0;background:#147239;color:#FFFFFF;font-weight:600;cursor:pointer">' +
      strings.accept +
      '</button>' +
      '</div>' +
      '</div>';
    document.body.appendChild(wrap);

    wrap.querySelector('[data-action="accept"]').addEventListener('click', function () {
      setCookie(COOKIE_NAME, 'accepted', COOKIE_DAYS);
      wrap.remove();
      // Cookie banner accepted — nothing to load (Plausible is cookieless and loaded conditionally elsewhere)
      window.dispatchEvent(new Event('mt:consent-accepted'));
    });

    wrap.querySelector('[data-action="decline"]').addEventListener('click', function () {
      setCookie(COOKIE_NAME, 'denied', COOKIE_DAYS);
      wrap.remove();
      window.dispatchEvent(new Event('mt:consent-denied'));
    });
  }

  // Run after DOM ready
  function init() {
    if (getCookie(COOKIE_NAME)) return;
    var strings = getStrings();
    if (!strings) return;
    render(strings);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
