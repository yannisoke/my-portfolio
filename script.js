console.log("Script initialisé ✔️");

/* ================= Utilitaires ================= */
const qs = sel => document.querySelector(sel);
const qsa = sel => [...document.querySelectorAll(sel)];
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/* ================= i18n ================= */
const I18N_STORAGE_KEY = 'lang';
const SUPPORTED_LANGS = ['fr', 'en'];
let currentLang = 'fr';
let translations = {};

async function loadTranslations(lang) {
  try {
    const res = await fetch(`locales/${lang}.json`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    translations[lang] = await res.json();
  } catch (e) {
    console.warn('Traductions indisponibles pour', lang, e);
  }
}
function resolvePath(obj, path) {
  return path.split('.').reduce((acc, k) => acc && acc[k] !== undefined ? acc[k] : undefined, obj);
}
function applyTranslations() {
  const dict = translations[currentLang] || {};
  document.documentElement.setAttribute('lang', currentLang);
  qsa('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = resolvePath(dict, key);
    if (val !== undefined) el.innerHTML = String(val).replace('2025', new Date().getFullYear());
  });
  qsa('[data-i18n-list]').forEach(listEl => {
    const key = listEl.getAttribute('data-i18n-list');
    const arr = resolvePath(dict, key);
    if (Array.isArray(arr)) listEl.innerHTML = arr.map(v => `<li>${v}</li>`).join('');
  });
  qsa('.lang-btn').forEach(btn => {
    const active = btn.dataset.lang === currentLang;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
  updateThemeIconAlt();
}
async function initI18n() {
  const stored = localStorage.getItem(I18N_STORAGE_KEY);
  const browserLang = (navigator.language || 'fr').slice(0,2).toLowerCase();
  currentLang = SUPPORTED_LANGS.includes(stored) ? stored :
                SUPPORTED_LANGS.includes(browserLang) ? browserLang : 'fr';
  await Promise.all(SUPPORTED_LANGS.map(loadTranslations));
  applyTranslations();
}
qsa('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const lang = btn.dataset.lang;
    if (lang && SUPPORTED_LANGS.includes(lang) && lang !== currentLang) {
      currentLang = lang;
      localStorage.setItem(I18N_STORAGE_KEY, lang);
      applyTranslations();
      restartTyped();
    }
  });
});

/* ================= Navigation & scroll ================= */
const navLinks = qsa('.links a[data-nav]');
const sections = qsa('section, header.section-hero');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(a => {
        a.removeAttribute('aria-current');
        if (a.getAttribute('href') === `#${id}`) a.setAttribute('aria-current', 'page');
      });
    }
  });
}, { threshold: 0.5 });
sections.forEach(s => sectionObserver.observe(s));

/* Scroll fluide */
qsa('.links a[data-nav]').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      qs(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* Hide nav on scroll + bouton top */
let lastScroll = 0;
const nav = qs('.nav');
const SCROLL_HIDE_OFFSET = 160;
const toTopBtn = qs('#toTopBtn');

window.addEventListener('scroll', () => {
  const y = window.pageYOffset;
  if (y > lastScroll && y > SCROLL_HIDE_OFFSET) nav?.classList.add('hidden-nav');
  else nav?.classList.remove('hidden-nav');

  if (toTopBtn) {
    if (y > 320) toTopBtn.classList.add('visible');
    else toTopBtn.classList.remove('visible');
  }
  lastScroll = y;
}, { passive: true });

toTopBtn?.addEventListener('click', () => {
  window.scrollTo({ top:0, behavior:'smooth' });
});

/* ================= Accordion Expérience ================= */
function setupAccordion(rootSelector) {
  const root = qs(rootSelector);
  if (!root) return;
  root.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => toggle(trigger));
    trigger.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); toggle(trigger);
      }
    });
  });
  function toggle(trigger) {
    const expanded = trigger.getAttribute('aria-expanded') === 'true';
    const panel = qs('#' + trigger.getAttribute('aria-controls'));
    const icon = trigger.querySelector('.acc-icon');
    trigger.setAttribute('aria-expanded', String(!expanded));
    if (!panel) return;
    if (!expanded) {
      panel.classList.add('open');
      panel.style.maxHeight = panel.scrollHeight + 'px';
      panel.style.opacity = '1';
      if (icon) icon.textContent = '−';
    } else {
      panel.style.maxHeight = panel.scrollHeight + 'px';
      requestAnimationFrame(() => {
        panel.style.maxHeight = '0px';
        panel.style.opacity = '0';
      });
      if (icon) icon.textContent = '+';
      panel.addEventListener('transitionend', function end(ev) {
        if (ev.propertyName === 'max-height') {
          panel.classList.remove('open');
          panel.removeEventListener('transitionend', end);
        }
      });
    }
  }
}
setupAccordion('#exp-accordion');

/* ================= Reveal Observer ================= */
const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
      // Skill bar fill
      if (entry.target.classList.contains('skill-bar')) {
        const lv = clamp(Number(entry.target.dataset.level || 0), 0, 100);
        const fill = entry.target.querySelector('.skill-bar-fill');
        if (fill) {
          fill.style.setProperty('--target', lv + '%');
          entry.target.classList.add('is-filled');
        }
      }
    }
  });
}, { threshold: 0.25 });
qsa('.reveal, .skill-bar').forEach(el => revealObserver.observe(el));

/* ================= Thème & Vanta ================= */
const THEME_KEY = 'pref-theme';
const themeBtn = qs('#modeToggle');
const themeIcon = qs('#toggleIcon');
const ICONS = { light: 'assets/icons/sun.png', dark: 'assets/icons/moon.png' };
let vantaInstance = null;

function updateThemeIconAlt() {
  if (!themeIcon) return;
  const dark = document.body.getAttribute('data-theme') === 'dark';
  themeIcon.alt = currentLang === 'en'
    ? dark ? 'Sun icon (switch to light mode)' : 'Moon icon (switch to dark mode)'
    : dark ? 'Icône soleil (passer en clair)' : 'Icône lune (passer en sombre)';
}
function applyTheme(theme, skipVanta=false) {
  document.body.setAttribute('data-theme', theme);
  themeIcon.src = theme === 'dark' ? ICONS.light : ICONS.dark;
  updateThemeIconAlt();
  localStorage.setItem(THEME_KEY, theme);
  if (!skipVanta) reinitVanta();
}
function initTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(stored || (prefersDark ? 'dark' : 'light'), true);
}
themeBtn?.addEventListener('click', () => {
  const current = document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

/* Vanta */
function destroyVanta() {
  if (vantaInstance && typeof vantaInstance.destroy === 'function') {
    vantaInstance.destroy(); vantaInstance = null;
  }
}
function initVanta() {
  const el = qs('#vanta-bg');
  if (!el) return;
  if (typeof VANTA === 'undefined' || !VANTA.BIRDS) {
    el.classList.add('fallback-bg'); return;
  }
  const dark = document.body.getAttribute('data-theme') === 'dark';
  try {
    vantaInstance = VANTA.BIRDS({
      el,
      mouseControls:true,
      touchControls:true,
      gyroControls:false,
      minHeight:200.0,
      minWidth:200.0,
      scale:1.0,
      scaleMobile:1.0,
      backgroundColor: dark ? 0x000000 : 0xffffff,
      color1: dark ? 0x6f3cff : 0x5c2de0,
      color2: dark ? 0xe6007e : 0x6f3cff,
      birdSize:1.2,
      wingSpan:20.0,
      speedLimit:4.0,
      separation:50.0,
      alignment:20.0,
      cohesion:20.0,
      quantity:3.0
    });
  } catch (e) {
    console.error('Erreur Vanta:', e);
    el.classList.add('fallback-bg');
  }
}
function reinitVanta() { destroyVanta(); initVanta(); }
window.addEventListener('beforeunload', destroyVanta);

/* ================= Formulaire Contact ================= */
const contactForm = qs('#contactForm');
const statusEl = qs('#formStatus');
function t(key, fallback='') {
  const dict = translations[currentLang] || {};
  const val = resolvePath(dict, key);
  return val !== undefined ? val : fallback;
}
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    statusEl.textContent = '';
    let valid = true;
    qsa('#contactForm [required]').forEach(field => {
      const container = field.closest('.form-field');
      const msg = container?.querySelector('.field-msg');
      const isInvalid =
        field.value.trim() === '' ||
        (field.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(field.value));
      if (isInvalid) {
        valid = false;
        field.setAttribute('aria-invalid', 'true');
        if (msg) msg.textContent = t('form.fieldError','Champ invalide');
      } else {
        field.removeAttribute('aria-invalid');
        if (msg) msg.textContent = '';
      }
    });
    if (!valid) {
      statusEl.textContent = t('form.validationError','Veuillez corriger les erreurs.');
      return;
    }
    statusEl.textContent = t('contact.sending','Envoi...');
    await new Promise(r => setTimeout(r, 900));
    statusEl.textContent = t('contact.sent','Message envoyé (simulation).');
    contactForm.reset();
  });
}

/* ================= PRELOADER ================= */
const PRELOADER_DURATION = 1800;
let preloaderStart = null;
let preloaderRAF = null;
let preloaderDone = false;
const preloaderEl = qs('#preloader');
const preloaderBar = qs('#preloader-bar');
const preloaderPercent = qs('#preloader-percent');

function setProgress(p) {
  const c = Math.min(1, Math.max(0, p));
  if (preloaderBar) preloaderBar.style.width = (c * 100).toFixed(2) + '%';
  if (preloaderPercent) preloaderPercent.textContent = Math.round(c * 100) + '%';
}
function finishPreloader() {
  if (preloaderDone) return;
  preloaderDone = true;
  setProgress(1);
  document.body.classList.remove('is-preloading');
  if (preloaderEl) {
    preloaderEl.classList.add('preloader--hide');
    setTimeout(() => preloaderEl.remove(), 650);
  }
  setTimeout(() => reinitVanta(), 40);
  startTyped();
}
function animatePreloader(ts) {
  if (preloaderDone) return;
  if (!preloaderStart) preloaderStart = ts;
  const elapsed = ts - preloaderStart;
  const prog = elapsed / PRELOADER_DURATION;
  setProgress(prog);
  if (elapsed >= PRELOADER_DURATION) finishPreloader();
  else preloaderRAF = requestAnimationFrame(animatePreloader);
}
function initPreloader() {
  if (!preloaderEl) { reinitVanta(); startTyped(); return; }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setProgress(1);
    finishPreloader();
    return;
  }
  requestAnimationFrame(animatePreloader);
}
document.addEventListener('DOMContentLoaded', initPreloader);

/* ================= Typed Effect ================= */
let typedTimer = null;
function typedStrings() {
  const dict = translations[currentLang] || {};
  const arr = resolvePath(dict, 'hero.typed') || [
    'De la conformité immobilière au web',
    'Rigueur. Service. Structuration.'
  ];
  return arr;
}
function typeSequence(el, phrases, idx=0) {
  if (!el || phrases.length === 0) return;
  const phrase = phrases[idx % phrases.length];
  let i = 0;
  el.textContent = '';
  function step() {
    if (i <= phrase.length) {
      el.textContent = phrase.slice(0, i);
      i++;
      typedTimer = setTimeout(step, 38);
    } else {
      // Pause then next
      typedTimer = setTimeout(() => typeSequence(el, phrases, idx+1), 1700);
    }
  }
  step();
}
function startTyped() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const el = qs('[data-typed]');
  if (!el) return;
  clearTimeout(typedTimer);
  typeSequence(el, typedStrings());
}
function restartTyped() {
  clearTimeout(typedTimer);
  startTyped();
}

/* ================= Copy Email ================= */
const copyBtn = qs('#copyEmailBtn');
copyBtn?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('yannis.oukacine@gmail.com');
    copyBtn.classList.add('copied');
    const original = copyBtn.textContent;
    copyBtn.textContent = currentLang === 'en' ? 'Copied!' : 'Copié !';
    setTimeout(() => {
      copyBtn.textContent = original;
      copyBtn.classList.remove('copied');
    }, 1800);
  } catch (e) {
    alert(currentLang === 'en'
      ? 'Clipboard not available'
      : 'Impossible de copier (clipboard)');
  }
});

/* ================= Navigation Mobile ================= */
const navEl = qs('.nav');
const navToggleBtn = qs('#navToggle');
const navMenu = qs('#navMenu');

function openNavMenu() {
  if (!navEl || !navMenu) return;
  navEl.classList.add('nav--open');
  navToggleBtn.setAttribute('aria-expanded','true');
  navMenu.hidden = false;
  document.body.classList.add('menu-open');
  navMenu.querySelector('a')?.focus({ preventScroll:true });
}
function closeNavMenu(focusToggle=false) {
  if (!navEl || !navMenu) return;
  navEl.classList.remove('nav--open');
  navToggleBtn.setAttribute('aria-expanded','false');
  navMenu.hidden = true;
  document.body.classList.remove('menu-open');
  if (focusToggle) navToggleBtn.focus({ preventScroll:true });
}
function toggleNavMenu() {
  const expanded = navToggleBtn.getAttribute('aria-expanded') === 'true';
  expanded ? closeNavMenu(true) : openNavMenu();
}
if (navToggleBtn && navMenu) {
  navToggleBtn.addEventListener('click', toggleNavMenu);
  navMenu.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (a) closeNavMenu();
  });
  document.addEventListener('click', e => {
    if (!navEl.classList.contains('nav--open')) return;
    if (!navEl.contains(e.target)) closeNavMenu();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navEl.classList.contains('nav--open')) closeNavMenu(true);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 860 && navMenu.hidden) {
      navMenu.hidden = false;
      navEl.classList.remove('nav--open');
      navToggleBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    } else if (window.innerWidth <= 860 && !navEl.classList.contains('nav--open')) {
      navMenu.hidden = true;
    }
  });
}

/* ================= Initialisation ================= */
(async function initApp() {
  await initI18n();
  initTheme();
  applyTranslations();
})();

/* Fin */