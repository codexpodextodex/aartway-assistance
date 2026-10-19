(() => {
  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Language (SV default, FI) ---------- */
  const META = {
    sv: {
      title: 'AartWay Assistance – Nina Aartokallio | Assistans, workshops och arrangemang i Helsingfors',
      description: 'AartWay Assistance – personlig service som levererar. Administrativ assistans, föreläsningar och workshops samt praktiska arrangemang för privatpersoner och företag i Helsingfors, på svenska och finska.',
      menu: 'Meny', top: 'Till toppen', scroll: 'Scrolla vidare',
      subject: 'Förfrågan via webbplatsen',
      topics: ['Administrativ assistans', 'Föreläsning / workshop', 'Praktiska arrangemang', 'Något annat'],
      labels: { name: 'Namn', email: 'E-post', topic: 'Gäller', message: 'Meddelande' },
      invalid: 'Fyll i ditt namn och en giltig e-postadress.',
      opened: 'Ditt e-postprogram öppnas – skicka meddelandet därifrån. Fungerar det inte? Mejla aartwayassistance@gmail.com.'
    },
    fi: {
      title: 'AartWay Assistance – Nina Aartokallio | Hallinnollinen apu, työpajat ja järjestelyt Helsingissä',
      description: 'AartWay Assistance – henkilökohtaista palvelua, joka tuottaa tulosta. Hallinnollista apua, luentoja ja työpajoja sekä käytännön järjestelyjä yksityishenkilöille ja yrityksille Helsingissä, suomeksi ja ruotsiksi.',
      menu: 'Valikko', top: 'Ylös', scroll: 'Jatka alas',
      subject: 'Yhteydenotto verkkosivuilta',
      topics: ['Hallinnollinen apu', 'Luento / työpaja', 'Käytännön järjestelyt', 'Jotain muuta'],
      labels: { name: 'Nimi', email: 'Sähköposti', topic: 'Aihe', message: 'Viesti' },
      invalid: 'Täytä nimesi ja toimiva sähköpostiosoite.',
      opened: 'Sähköpostiohjelmasi avautuu – lähetä viesti sieltä. Eikö se toimi? Kirjoita osoitteeseen aartwayassistance@gmail.com.'
    }
  };
  let lang = 'sv';

  const store = {
    get() { try { return localStorage.getItem('aartway-lang'); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem('aartway-lang', v); } catch (e) { /* private mode */ } }
  };

  function swapAttr(el, attr, key, toFi) {
    const svKey = 'sv' + key;
    if (!(svKey in el.dataset)) el.dataset[svKey] = el.getAttribute(attr) || '';
    el.setAttribute(attr, toFi ? el.dataset['fi' + key] : el.dataset[svKey]);
  }

  function setLang(next, save) {
    lang = next === 'fi' ? 'fi' : 'sv';
    const toFi = lang === 'fi';
    document.querySelectorAll('[data-fi]').forEach((el) => {
      if (!('sv' in el.dataset)) el.dataset.sv = el.innerHTML;
      el.innerHTML = toFi ? el.dataset.fi : el.dataset.sv;
    });
    document.querySelectorAll('[data-fi-alt]').forEach((el) => swapAttr(el, 'alt', 'Alt', toFi));
    document.querySelectorAll('[data-fi-placeholder]').forEach((el) => swapAttr(el, 'placeholder', 'Placeholder', toFi));
    root.lang = lang;
    const m = META[lang];
    document.title = m.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', m.description);
    document.querySelector('.menu-btn').setAttribute('aria-label', m.menu);
    document.querySelectorAll('a[href="#top"].round-btn').forEach((a) => a.setAttribute('aria-label', m.top));
    document.querySelectorAll('a[href="#varfor"].round-btn').forEach((a) => a.setAttribute('aria-label', m.scroll));
    document.querySelectorAll('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    if (save) store.set(lang);
  }

  // Remember the Swedish originals before anything changes them.
  document.querySelectorAll('[data-fi]').forEach((el) => { el.dataset.sv = el.innerHTML; });

  const urlLang = new URLSearchParams(location.search).get('lang');
  const initial = urlLang || store.get() || 'sv';
  if (initial === 'fi') setLang('fi', false);
  document.querySelectorAll('.lang button').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang, true)));

  /* ---------- Header + mobile menu ---------- */
  const header = document.getElementById('header');
  const menuBtn = document.querySelector('.menu-btn');
  let lastY = window.scrollY;

  function closeMenu() {
    body.classList.remove('menu-open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
  menuBtn.addEventListener('click', () => {
    const open = !body.classList.contains('menu-open');
    body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  document.querySelectorAll('.nav a').forEach((a) => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Scroll effects (header state + hero parallax) ---------- */
  const mast = document.querySelector('.hero-mast span');
  const sun = document.querySelector('.hero-sun');
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 12);
    const goingDown = y > lastY && y > 480 && !body.classList.contains('menu-open');
    header.classList.toggle('hide', goingDown);
    lastY = y;
    if (!reduceMotion && y < window.innerHeight * 1.2) {
      if (mast) mast.style.transform = `translate3d(-.035em, ${y * 0.22}px, 0)`;
      if (sun) sun.style.translate = `0 ${y * 0.12}px`;
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    document.querySelectorAll('.stat-grid, .bento, .beyond-grid, .bg-grid').forEach((group) => {
      group.querySelectorAll('.reveal').forEach((el, i) => el.style.setProperty('--d', `${i * 0.09}s`));
    });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* ---------- Count-up stats ---------- */
  const counters = document.querySelectorAll('[data-count]');
  function countUp(el) {
    const target = Number(el.dataset.count);
    if (reduceMotion || target <= 1) { el.textContent = target; return; }
    const start = performance.now();
    const dur = 1300;
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = '0';
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        cio.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => cio.observe(el));
  }

  /* ---------- Services tabs ---------- */
  const tabs = Array.from(document.querySelectorAll('.svc-tab'));
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
  const canHover = window.matchMedia('(hover: hover) and (min-width: 1181px)').matches;

  function selectTab(i, focus) {
    tabs.forEach((t, j) => {
      const on = i === j;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      panels[j].hidden = !on;
    });
    if (focus) tabs[i].focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(i));
    if (canHover) t.addEventListener('mouseenter', () => { if (t.getAttribute('aria-selected') !== 'true') selectTab(i); });
    t.addEventListener('keydown', (e) => {
      if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();
      let n = i;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = (i + 1) % tabs.length;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') n = 0;
      if (e.key === 'End') n = tabs.length - 1;
      selectTab(n, true);
    });
  });
  document.querySelectorAll('[data-service]').forEach((a) => a.addEventListener('click', () => selectTab(Number(a.dataset.service))));

  /* ---------- Contact form → e-mail ---------- */
  const form = document.getElementById('contact-form');
  const note = document.getElementById('form-note');
  const topicInputs = form.querySelectorAll('input[name="topic"]');

  document.querySelectorAll('[data-topic]').forEach((a) => a.addEventListener('click', () => {
    const input = topicInputs[Number(a.dataset.topic)];
    if (input) input.checked = true;
  }));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const m = META[lang];
    const name = form.elements.name;
    const email = form.elements.email;
    const okName = name.value.trim().length > 1;
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    name.classList.toggle('invalid', !okName);
    email.classList.toggle('invalid', !okEmail);
    if (!okName || !okEmail) {
      note.textContent = m.invalid;
      note.classList.add('error');
      (okName ? email : name).focus();
      return;
    }
    const checked = form.querySelector('input[name="topic"]:checked');
    const topic = checked ? m.topics[Number(checked.value)] : '';
    const subject = topic ? `${m.subject} – ${topic}` : m.subject;
    const lines = [
      `${m.labels.name}: ${name.value.trim()}`,
      `${m.labels.email}: ${email.value.trim()}`,
      topic ? `${m.labels.topic}: ${topic}` : '',
      '',
      form.elements.message.value.trim()
    ].filter((l, i) => l !== '' || i === 3);
    const href = `mailto:aartwayassistance@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    note.classList.remove('error');
    note.textContent = m.opened;
    window.location.href = href;
  });

  /* ---------- Footer year ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
