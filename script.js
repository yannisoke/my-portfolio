console.log("Script initialisé ✔️");

// Fonctions utilitaires pour simplifier le code
const qs = sel => document.querySelector(sel);
const qsa = sel => [...document.querySelectorAll(sel)];
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// La gestion des langues (i18n) est retirée, tout est en français

// Gestion de la navigation et du scroll
const navLinks = qsa('.links a[data-nav]');
const sections = qsa('section, header.section-hero');
// Met à jour le lien actif dans le menu selon la section visible
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

// Active le scroll fluide quand on clique sur un lien du menu
qsa('.links a[data-nav]').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      qs(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Cache la barre de navigation quand on descend, affiche le bouton retour en haut
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

// Gère l'ouverture/fermeture des blocs d'expérience (accordion)
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

// Affiche les éléments au scroll (animation reveal)
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
qsa('.reveal, .skill-bar, .reveal-node').forEach(el => revealObserver.observe(el));

// Remplit les barres de progression dans la section À propos
function initProgressBars() {
  const bars = qsa('.pl-bar[data-pl]');
  if (!bars.length) return;
  // Feature detect attr() width support (not widely supported for width) -> fallback JS
  const test = document.createElement('div');
  test.style.width = 'attr(data-x percentage)';
  const attrSupported = test.style.width.includes('attr(') === false; // if browser stripped it, we need JS anyway
  bars.forEach(bar => {
    const target = Number(bar.getAttribute('data-pl')) || 0;
    if (attrSupported) {
      // Use JS animation when element becomes visible
      const animate = () => {
        bar.style.setProperty('--pl-target', target + '%');
        const fill = document.createElement('span');
        fill.className = 'pl-fill';
        fill.style.width = '0%';
        bar.appendChild(fill);
        requestAnimationFrame(() => { fill.style.width = target + '%'; });
      };
      if (bar.closest('.reveal')) {
        const parent = bar.closest('.reveal');
        const obs = new IntersectionObserver(es => {
          es.forEach(en => { if (en.isIntersecting) { animate(); obs.disconnect(); } });
        }, { threshold:0.3 });
        obs.observe(parent);
      } else animate();
    }
  });
}
document.addEventListener('DOMContentLoaded', initProgressBars);

// Gère le changement de thème (clair/sombre) et l'effet Vanta.js
const THEME_KEY = 'pref-theme';
const themeBtn = qs('#modeToggle');
const themeIcon = qs('#toggleIcon');
const ICONS = { light: 'assets/icons/sun.png', dark: 'assets/icons/moon.png' };
let vantaInstance = null;

// Met à jour le texte alternatif de l'icône du bouton thème
function updateThemeIconAlt() {
  if (!themeIcon) return;
  const dark = document.body.getAttribute('data-theme') === 'dark';
  themeIcon.alt = dark ? 'Icône soleil (passer en clair)' : 'Icône lune (passer en sombre)';
}

// Applique le thème choisi et relance l'effet Vanta si besoin
function applyTheme(theme, skipVanta = false) {
  document.body.setAttribute('data-theme', theme);
  if (themeIcon) themeIcon.src = theme === 'dark' ? ICONS.light : ICONS.dark;
  updateThemeIconAlt();
  try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
  if (!skipVanta) reinitVanta();
}

// Initialise le thème au chargement de la page
function initTheme() {
  let stored = null;
  try { stored = localStorage.getItem(THEME_KEY); } catch (_) {}
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(stored || (prefersDark ? 'dark' : 'light'), true);
}
themeBtn?.addEventListener('click', () => {
  const current = document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// Initialise et détruit l'effet Vanta.js (fond animé)
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

// Gère le formulaire de contact (validation et affichage des messages)
const contactForm = qs('#contactForm');
const statusEl = qs('#formStatus');
// Les fonctions d'aide sont retirées, les messages sont en français
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
  if (msg) msg.textContent = 'Champ invalide';
      } else {
        field.removeAttribute('aria-invalid');
        if (msg) msg.textContent = '';
      }
    });
    if (!valid) {
      statusEl.textContent = 'Veuillez corriger les erreurs.';
      return;
    }
    statusEl.textContent = 'Envoi...';
    await new Promise(r => setTimeout(r, 900));
    statusEl.textContent = 'Message envoyé (simulation).';
    contactForm.reset();
  });
}

// Gère l'animation de chargement (preloader)
const PRELOADER_DURATION = 1800;
let preloaderStart = null;
let preloaderRAF = null;
let preloaderDone = false;
const preloaderEl = qs('#preloader');
const preloaderBar = qs('#preloader-bar');
const preloaderPercent = qs('#preloader-percent');

// Met à jour la barre de progression du preloader
function setProgress(p) {
  const c = Math.min(1, Math.max(0, p));
  if (preloaderBar) preloaderBar.style.width = (c * 100).toFixed(2) + '%';
  if (preloaderPercent) preloaderPercent.textContent = Math.round(c * 100) + '%';
}

// Termine l'animation de chargement et affiche le contenu
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

// Anime la progression du preloader
function animatePreloader(ts) {
  if (preloaderDone) return;
  if (!preloaderStart) preloaderStart = ts;
  const elapsed = ts - preloaderStart;
  const prog = elapsed / PRELOADER_DURATION;
  setProgress(prog);
  if (elapsed >= PRELOADER_DURATION) finishPreloader();
  else preloaderRAF = requestAnimationFrame(animatePreloader);
}

// Lance le preloader au chargement de la page
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

// Effet d'écriture animée pour le sous-titre
let typedTimer = null;
// Liste des phrases à afficher en animation
function typedStrings() {
  return [
    'De la conformité à l’ingénierie informatique',
    'Objectif : alternance école d’ingénieur',
    'Rigueur. Service. Structuration.'
  ];
}

// Affiche chaque phrase lettre par lettre puis passe à la suivante
function typeSequence(el, phrases, idx = 0) {
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
      typedTimer = setTimeout(() => typeSequence(el, phrases, idx + 1), 1700);
    }
  }
  step();
}

// Démarre l'effet d'écriture animée
function startTyped() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const el = qs('[data-typed]');
  if (!el) return;
  clearTimeout(typedTimer);
  typeSequence(el, typedStrings());
}

// Relance l'effet d'écriture animée
function restartTyped() {
  clearTimeout(typedTimer);
  startTyped();
}

// Copie l'email dans le presse-papier
const copyBtn = qs('#copyEmailBtn');
copyBtn?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('yannis.oukacine@gmail.com');
    copyBtn.classList.add('copied');
    const original = copyBtn.textContent;
    copyBtn.textContent = 'Copié !';
    setTimeout(() => {
      copyBtn.textContent = original;
      copyBtn.classList.remove('copied');
    }, 1800);
  } catch (e) {
    alert('Impossible de copier (clipboard)');
  }
});

// Gère l'ouverture et la fermeture du menu sur mobile
const navEl = qs('.nav');
const navToggleBtn = qs('#navToggle');
const navMenu = qs('#navMenu');

// Ouvre le menu de navigation mobile
function openNavMenu() {
  if (!navEl || !navMenu) return;
  navEl.classList.add('nav--open');
  navToggleBtn.setAttribute('aria-expanded','true');
  navMenu.hidden = false;
  document.body.classList.add('menu-open');
  navMenu.querySelector('a')?.focus({ preventScroll:true });
}

// Ferme le menu de navigation mobile
function closeNavMenu(focusToggle = false) {
  if (!navEl || !navMenu) return;
  navEl.classList.remove('nav--open');
  navToggleBtn.setAttribute('aria-expanded','false');
  navMenu.hidden = true;
  document.body.classList.remove('menu-open');
  if (focusToggle) navToggleBtn.focus({ preventScroll:true });
}

// Alterne entre ouverture et fermeture du menu mobile
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

// Initialise l'application au démarrage
(function initApp() {
  document.documentElement.setAttribute('lang','fr');
  initTheme();
  updateThemeIconAlt();
})();

// Fin du script