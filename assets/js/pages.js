/* Broski Talk inner pages: lite YouTube players, chapter seeking, shorts, email gates. */
(() => {
  /* ---------- lite player: the poster becomes the real player on click ---------- */
  function mount(box, start, isShort) {
    const id = box.dataset.id;
    let f = box.querySelector('iframe');
    if (f) {
      f.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'seekTo', args: [start || 0, true] }), '*');
      f.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
      return;
    }
    f = document.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0&enablejsapi=1${start ? `&start=${start}` : ''}${isShort ? '&loop=1' : ''}`;
    f.title = 'Broski Talk on YouTube';
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    f.allowFullscreen = true;
    box.querySelector('.poster')?.remove();
    box.appendChild(f);
  }
  document.querySelectorAll('.player, .frame').forEach(box => {
    box.querySelector('.poster')?.addEventListener('click', () => mount(box, 0, box.hasAttribute('data-short')));
  });

  /* ---------- chapters seek the episode player ---------- */
  const player = document.querySelector('.player');
  document.querySelectorAll('#chapters button').forEach(b => b.addEventListener('click', () => {
    if (!player) return;
    document.querySelectorAll('#chapters li').forEach(li => li.classList.toggle('on', li === b.parentElement));
    mount(player, +b.dataset.t);
    player.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  }));

  /* ---------- email forms (newsletter band, episode gates) ---------- */
  const KEY = 'bt-unlocked';
  const unlocked = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
  const remember = slug => { try { localStorage.setItem(KEY, JSON.stringify([...new Set([...unlocked(), slug])])); } catch {} };

  function openGate(gate) {
    const tpl = gate.querySelector('template[data-unlocked]');
    const locked = gate.querySelector('[data-locked]');
    if (!tpl || !locked) return;
    const box = document.createElement('div');
    box.tabIndex = -1;
    box.appendChild(tpl.content.cloneNode(true));
    locked.replaceWith(box);
    const f = gate.querySelector('[data-gate-form]');
    if (f) f.innerHTML = '<p class="sub" role="status"><strong>Unlocked.</strong> New episodes will land in your inbox too.</p>';
    box.focus({ preventScroll: true });
  }

  document.querySelectorAll('form.notify').forEach(form => {
    const slug = form.dataset.resource || null;
    const gate = form.closest('.gate');
    if (gate && slug && unlocked().includes(slug)) { openGate(gate); return; }
    BroskiSubscribe.attach(form, {
      resource: slug,
      done: form.dataset.done || "You're in.",
      onSuccess: gate ? () => { remember(slug); openGate(gate); } : undefined,
    });
  });
})();
