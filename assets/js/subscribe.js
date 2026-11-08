/* Broski Talk email signup: one front end for every form on the site.
 *
 * The backend is not built yet (see BACKEND.md). Every form posts the same JSON:
 *   POST /api/subscribe  {"email": "...", "resource": "12-skills" | null, "source": "/free/12-skills/", "company": ""}
 *   200 -> {"ok": true, "download_url": "..." (optional)}
 *   4xx -> {"ok": false, "error": "invalid_email" | "rate_limited" | ...}
 * "company" is a honeypot: people never see it, bots fill it in.
 *
 * Local preview: python's http.server answers POST with 501, so on localhost the form
 * shows its success state marked as a preview. Nothing is saved anywhere.
 */
(() => {
  const API = '/api/subscribe';
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

  function attach(form, opts = {}) {
    const input = form.querySelector('input[type="email"]');
    const hp = form.querySelector('input[name="company"]');
    const btn = form.querySelector('button[type="submit"]');
    const msg = form.querySelector('.msg');
    const idle = btn.textContent;

    const say = (text, err) => { msg.textContent = text; msg.classList.toggle('err', !!err); };

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const email = input.value.trim();
      if (!EMAIL.test(email)) {
        input.setAttribute('aria-invalid', 'true');
        say('That email looks off. Check it and try again.', true);
        input.focus();
        return;
      }
      input.setAttribute('aria-invalid', 'false');
      btn.disabled = true; form.setAttribute('aria-busy', 'true'); btn.textContent = 'Sending…'; say('');

      const body = { email, resource: opts.resource || null, source: location.pathname, company: hp ? hp.value : '' };
      let data = null, status = 0;
      try {
        const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        status = res.status;
        data = await res.json().catch(() => null);
      } catch { status = 0; }

      btn.disabled = false; form.removeAttribute('aria-busy'); btn.textContent = idle;

      if (status >= 200 && status < 300 && data && data.ok !== false) {
        opts.onSuccess ? opts.onSuccess(data, email) : say(opts.done || "You're in.");
        return;
      }
      if (LOCAL && [0, 404, 405, 501].includes(status)) {
        const preview = { ok: true, preview: true };
        opts.onSuccess ? opts.onSuccess(preview, email) : say((opts.done || "You're in.") + ' (Preview: not saved, the backend isn\'t connected yet.)');
        return;
      }
      if (data && data.error === 'invalid_email') { input.setAttribute('aria-invalid', 'true'); say('That email looks off. Check it and try again.', true); return; }
      if (status === 429) { say('Too many tries. Give it a minute and try again.', true); return; }
      say("Couldn't sign you up just now. Try again in a minute.", true);
    });
  }

  window.BroskiSubscribe = { attach };
})();
