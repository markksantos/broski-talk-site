/* Broski Talk email signup: one front end for every form on the site.
 *
 * Today every signup goes to Netlify Forms (form "subscribe", declared as a hidden form in
 * index.html): a URL-encoded POST to "/forms/subscribe.html" with email, resource ("newsletter" or a freebie slug),
 * source (page path) and the "company" honeypot, which Netlify drops as spam when filled.
 * Signups are in Netlify -> broskitalk -> Forms, exportable as CSV.
 *
 * To move to the email-provider backend in BACKEND.md, set API = '/api/subscribe' and it posts
 * the JSON contract described there instead.
 *
 * Local preview: python's http.server answers POST with 501, so on localhost the form
 * shows its success state marked as a preview. Nothing is saved anywhere.
 */
(() => {
  const API = null; // null = Netlify Forms; '/api/subscribe' = the BACKEND.md function
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

  function attach(form, opts = {}) {
    const input = form.querySelector('input[type="email"]');
    const hp = form.querySelector('input[name="bt_hp"]');
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

      const body = { email, resource: opts.resource || null, source: location.pathname, bt_hp: hp ? hp.value : '' };
      let data = null, status = 0;
      try {
        if (API) {
          const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
          status = res.status;
          data = await res.json().catch(() => null);
        } else {
          const form = new URLSearchParams({ 'form-name': 'subscribe', email, resource: body.resource || 'newsletter', source: body.source, bt_hp: body.bt_hp });
          // A static file, so Netlify Forms takes the POST (function routes would swallow it).
          const res = await fetch('/forms/subscribe.html', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form.toString() });
          status = res.status;
          data = res.ok ? { ok: true } : null;
        }
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

/* Thumbnails: some videos have no maxres image, and YouTube then serves a 120×90 grey placeholder.
   Swap to the always-present hqdefault when that happens. (Loaded on every page, so it lives here.) */
(() => {
  const fix = (img) => {
    if (!img.src.includes("/maxresdefault.jpg") || !img.complete || img.naturalWidth > 120) return;
    const hq = img.src.replace("maxresdefault", "hqdefault");
    img.removeAttribute("srcset");
    img.src = hq;
  };
  document.addEventListener("load", (e) => { if (e.target.tagName === "IMG") fix(e.target); }, true);
  document.addEventListener("error", (e) => { if (e.target.tagName === "IMG") fix(e.target); }, true);
  document.querySelectorAll("img").forEach(fix);
})();
