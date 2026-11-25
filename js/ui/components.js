// Komponen UI yang dipakai ulang di semua layar.

import { h, clear, fmt, prefersReducedMotion } from './dom.js';
import { segmentText, GLOSSARY_BY_ID } from '../data/glossary.js';
import { countryList, countryName, flag, isCountry, suggestCountry } from '../data/countries.js';
import { avatarSvg, avatarForId, sanitizeAvatar } from '../core/avatar.js';
import { ACH_MOTIF, stampFrame, ICON, art, C as ART_C } from './art.js';
import { L, LANGS } from '../core/i18n.js';

export function button(label, { variant = 'primary', size, icon, onClick, disabled, type = 'button', title, cls } = {}) {
  return h(`button.btn.btn-${variant}${size ? '.btn-' + size : ''}${cls ? '.' + cls : ''}`,
    { type, onclick: onClick, disabled, title },
    icon ? h('span.btn-icon', { 'aria-hidden': 'true' }, icon) : null,
    h('span', label));
}

export function progressBar(pct, { tone = 'cobalt', label, animateFrom } = {}) {
  const fill = h(`div.bar-fill.tone-${tone}`);
  const start = animateFrom ?? pct;
  fill.style.width = `${Math.max(0, Math.min(1, start)) * 100}%`;
  if (animateFrom !== undefined) requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = `${Math.min(1, pct) * 100}%`; }));
  return h('div.bar', { role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(pct * 100), 'aria-label': label }, fill);
}

export function chip(text, { tone = 'plain', icon, title } = {}) {
  return h(`span.chip.chip-${tone}`, { title }, icon ? h('span', { 'aria-hidden': 'true' }, icon) : null, text);
}

export function card(cls, ...children) {
  return h(`section.card${cls ? '.' + cls : ''}`, ...children);
}

export function sectionTitle(text, extra) {
  return h('div.section-title', h('h2', text), extra || null);
}

export function emptyState(icon, title, text, action) {
  const ic = typeof icon === 'string' && icon.startsWith('<svg') ? h('div.empty-icon', { html: icon }) : h('div.empty-icon', { 'aria-hidden': 'true' }, icon);
  return h('div.empty', ic, h('h3', title), h('p', text), action || null);
}

const STAMP_TINT = { mint: '#E4EAD8', orange: '#F8EAD2', red: '#F7DCE2', violet: '#E9E0F0', blue: '#DCE8EE', yellow: '#F8EEDA' };

/** Lencana pencapaian berbentuk perangko vintage dengan motif ilustrasi. */
export function badge(a, unlocked) {
  const motif = ACH_MOTIF[a.id] ? ACH_MOTIF[a.id]() : ICON.star();
  return h(`div.badge${unlocked ? '' : '.locked'}`,
    h('span.stamp-wrap', { html: stampFrame(unlocked ? STAMP_TINT[a.tone] || '#F7DCE2' : '#F1ECEA') }),
    h('span.badge-icon', { html: motif }),
    unlocked ? h('span.badge-val', `+${a.xp} XP`) : h('span.badge-lock', { html: ICON.lock() }));
}

// ───────────── Toast ─────────────
let toastRoot;
const TOAST_ART = { ok: 'rose', sun: 'star', plain: 'sparkle' };
/** Notifikasi singkat. Ikon emoji lama diganti ilustrasi sesuai nada (ok/sun/plain). */
export function toast(message, { tone = 'plain', duration = 3200 } = {}) {
  toastRoot = toastRoot || document.getElementById('toasts');
  const el = h(`div.toast.toast-${tone}`, { role: 'status' }, h('span.toast-icon', { html: ICON[TOAST_ART[tone] || 'sparkle']() }), h('span', message));
  toastRoot.append(el);
  while (toastRoot.children.length > 3) toastRoot.firstChild.remove();
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, duration);
}

// ───────────── Modal ─────────────
export function modal({ title, body, actions = [], icon, tone = 'plain', onClose, dismissable = true }) {
  const root = document.getElementById('modals');
  // dismissed = ditutup tanpa memilih tombol (Escape / klik latar). Hanya itu yang memicu onClose.
  let closed = false;
  const close = (dismissed = true) => {
    if (closed) return;
    closed = true;
    overlay.classList.add('out');
    document.removeEventListener('keydown', onKey);
    setTimeout(() => overlay.remove(), 200);
    if (dismissed) onClose?.();
  };
  const onKey = (e) => { if (e.key === 'Escape' && dismissable) { e.stopPropagation(); close(); } };
  const dialog = h(`div.modal.modal-${tone}`, { role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
    icon ? (String(icon).startsWith('<svg') ? h('div.modal-icon.modal-art', { html: icon }) : h('div.modal-icon', { 'aria-hidden': 'true' }, icon)) : null,
    h('h2', title),
    body ? (typeof body === 'string' ? h('p', body) : body) : null,
    h('div.modal-actions', actions.map((a) => button(a.label, {
      variant: a.variant || 'primary', icon: a.icon,
      onClick: () => { if (a.keepOpen) a.onClick?.(); else { close(false); a.onClick?.(); } },
    }))));
  const overlay = h('div.overlay', { onclick: (e) => { if (e.target === overlay && dismissable) close(); } }, dialog);
  root.append(overlay);
  document.addEventListener('keydown', onKey);
  setTimeout(() => dialog.querySelector('.modal-actions .btn')?.focus(), 30);
  return { close, el: dialog };
}

export function confirmModal(title, text, { confirmLabel = L('Ya', 'Yes'), cancelLabel = L('Batal', 'Cancel'), danger = false } = {}) {
  return new Promise((resolve) => {
    let decided = false;
    modal({
      title, body: text,
      actions: [
        { label: cancelLabel, variant: 'ghost', onClick: () => { decided = true; resolve(false); } },
        { label: confirmLabel, variant: danger ? 'danger' : 'primary', onClick: () => { decided = true; resolve(true); } },
      ],
      onClose: () => { if (!decided) resolve(false); },
    });
  });
}

// ───────────── Efek ─────────────
export function countUp(el, to, { from = 0, duration = 900, prefix = '', suffix = '' } = {}) {
  if (prefersReducedMotion() || to === from) { el.textContent = prefix + fmt(to) + suffix; return; }
  const start = performance.now();
  const step = (t) => {
    const p = Math.min(1, (t - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + fmt(Math.round(from + (to - from) * eased)) + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/** Kelopak bunga yang memercik dari sebuah elemen (hadiah jawaban benar). */
export function petalBurst(anchor, n = 14) {
  if (!anchor || prefersReducedMotion()) return;
  const r = anchor.getBoundingClientRect();
  const layer = h('div.petals', { 'aria-hidden': 'true' });
  layer.style.left = `${r.left + r.width / 2}px`;
  layer.style.top = `${r.top + r.height / 2}px`;
  const colors = ['#E9AFC0', '#F7DCE2', '#D59AAF', '#F5E3B3', '#C9D1B8'];
  for (let i = 0; i < n; i++) {
    const p = h('i');
    const ang = (Math.PI * 2 * i) / n + Math.random() * 0.5;
    const dist = 50 + Math.random() * 60;
    p.style.background = colors[i % colors.length];
    p.style.setProperty('--dx', `${Math.cos(ang) * dist}px`);
    p.style.setProperty('--dy', `${Math.sin(ang) * dist - 20}px`);
    p.style.setProperty('--rot', `${(Math.random() - 0.5) * 540}deg`);
    p.style.animationDelay = `${Math.random() * 0.08}s`;
    layer.append(p);
  }
  document.body.append(layer);
  setTimeout(() => layer.remove(), 1200);
}

/** "+10 XP" yang melayang dari sebuah elemen. */
export function xpBurst(anchor, amount, { label = 'XP' } = {}) {
  if (!anchor || amount <= 0) return;
  const r = anchor.getBoundingClientRect();
  const el = h('div.xp-burst', `+${amount} ${label}`);
  el.style.left = `${r.left + r.width / 2}px`;
  el.style.top = `${r.top}px`;
  document.body.append(el);
  setTimeout(() => el.remove(), 1300);
}

export function confetti(amount = 90) {
  if (prefersReducedMotion()) return;
  const colors = ['#E9AFC0', '#F7DCE2', '#D59AAF', '#F5E3B3', '#C9D1B8', '#E2D6EC'];
  const layer = h('div.confetti', { 'aria-hidden': 'true' });
  for (let i = 0; i < amount; i++) {
    const p = h('i');
    p.style.left = `${Math.random() * 100}%`;
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = `${Math.random() * 0.4}s`;
    p.style.animationDuration = `${1.6 + Math.random() * 1.4}s`;
    p.style.setProperty('--drift', `${(Math.random() - 0.5) * 240}px`);
    p.style.setProperty('--spin', `${(Math.random() - 0.5) * 1080}deg`);
    if (i % 4 === 0) p.className = 'star';
    layer.append(p);
  }
  document.body.append(layer);
  setTimeout(() => layer.remove(), 3400);
}

/** Pilihan bahasa ID / EN. `onChange(lang)` dipanggil saat bahasa lain dipilih. */
export function langToggle(current, onChange, { compact = false } = {}) {
  return h(`div.lang-toggle${compact ? '.compact' : ''}`, { role: 'group', 'aria-label': L('Bahasa', 'Language') },
    LANGS.map((l) => h(`button.lang-opt${l.id === current ? '.on' : ''}`, {
      type: 'button', lang: l.id, 'aria-pressed': String(l.id === current), title: l.label,
      onclick: () => { if (l.id !== current) onChange(l.id); },
    }, compact ? l.short : l.label)));
}

export function toggle(checked, onChange, label) {
  const input = h('input', { type: 'checkbox', checked, onchange: (e) => onChange(e.target.checked) });
  return h('label.switch', input, h('span.switch-track', { 'aria-hidden': 'true' }, h('span.switch-thumb')), h('span.switch-label', label));
}

// ───────────── Pemilih negara ─────────────
/** Daftar negara yang bisa dicari. `onChange(code)` dipanggil saat sebuah negara dipilih. */
export function countryPicker({ value = null, onChange, suggested = suggestCountry() } = {}) {
  let selected = value;
  const all = countryList();
  const input = h('input.input', { type: 'search', placeholder: L('Cari negara…', 'Search countries…'), 'aria-label': L('Cari negara', 'Search countries'), autocomplete: 'off' });
  const list = h('div.country-list', { role: 'listbox', 'aria-label': L('Daftar negara', 'Country list') });
  const current = h('div.country-current');

  const showCurrent = () => {
    clear(current).append(selected
      ? h('span', h('span.flag', flag(selected)), ' ', countryName(selected))
      : h('span.muted', L('Belum memilih negara', 'No country selected')));
  };
  const draw = () => {
    const q = input.value.trim().toLowerCase();
    let items = q ? all.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q) : all;
    if (!q) {
      const top = [selected, suggested, 'ID'].filter((c, i, a) => c && isCountry(c) && a.indexOf(c) === i);
      items = [...top.map((c) => all.find((x) => x.code === c)), ...items.filter((x) => !top.includes(x.code))];
    }
    clear(list);
    if (!items.length) { list.append(h('p.small.muted.pad', L('Negara tidak ditemukan.', 'No country found.'))); return; }
    for (const c of items.slice(0, 80)) {
      list.append(h(`button.country-opt${c.code === selected ? '.on' : ''}`, {
        type: 'button', role: 'option', 'aria-selected': String(c.code === selected),
        onclick: () => { selected = c.code; showCurrent(); draw(); onChange?.(c.code); },
      }, h('span.flag', c.flag), h('span', c.name), c.code === suggested && !q ? h('span.small.muted', L('saran', 'suggested')) : null));
    }
  };
  input.addEventListener('input', draw);
  showCurrent();
  draw();
  return h('div.country-picker', current, input, list);
}

export function openCountryModal({ title = L('Pilih negaramu', 'Choose your country'), text, value, confirmLabel = L('Simpan', 'Save'), onPick }) {
  let picked = value || suggestCountry();
  modal({
    title,
    body: h('div.form', text ? h('p', text) : null, countryPicker({ value: picked, onChange: (c) => { picked = c; } })),
    actions: [
      { label: L('Batal', 'Cancel'), variant: 'ghost' },
      { label: confirmLabel, onClick: () => { if (picked) onPick(picked); else toast(L('Pilih negara dulu.', 'Choose a country first.'), { icon: '⚠️' }); } },
    ],
  });
}

// ───────────── Avatar ─────────────
/** Elemen avatar dari konfigurasi (selalu divalidasi ulang sebelum dirender). */
export function avatarEl(cfg, { cls = '' } = {}) {
  return h(`span.av-img${cls ? '.' + cls : ''}`, { html: avatarSvg(cfg) });
}

/** Avatar untuk baris pemain: kamu & pemain asli memakai konfigurasinya; simulasi memakai avatar tetap dari id. */
export function entityAvatar(entry, cls = '') {
  if (entry.kind === 'you' || entry.kind === 'real') {
    const cfg = sanitizeAvatar(entry.avatarCfg);
    if (cfg) return avatarEl(cfg, { cls });
    return h(`span.av-img.av-fallback${cls ? '.' + cls : ''}`, { 'aria-hidden': 'true' }, '·');
  }
  return avatarEl(avatarForId(entry.id), { cls });
}

// ───────────── Kata yang bisa diklik (kamus) ─────────────
let openPop = null;

export function closeTermPopover() {
  if (!openPop) return;
  openPop.cleanup();
  openPop = null;
}

/**
 * Teks dengan istilah kamus sebagai tombol. `onLookup(id)` dipanggil saat istilah dibuka.
 */
export function termText(text, { qid = null, onLookup } = {}) {
  return segmentText(text, qid).map((seg) => {
    if (typeof seg === 'string') return seg;
    const btn = h('button.term', { type: 'button', 'aria-haspopup': 'dialog', title: L(`Apa itu "${seg.text}"?`, `What is "${seg.text}"?`) }, seg.text);
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasOpen = openPop?.anchor === btn;
      closeTermPopover();
      if (!wasOpen) { openTermPopover(btn, GLOSSARY_BY_ID[seg.id]); onLookup?.(seg.id); }
    });
    return btn;
  });
}

function openTermPopover(anchor, entry) {
  const pop = h('div.term-pop', { role: 'dialog', 'aria-label': entry.term },
    h('div.term-pop-head', h('span.term-pop-icon', { html: ICON.bulb() }), h('strong', entry.term),
      h('button.term-close', { type: 'button', 'aria-label': L('Tutup penjelasan', 'Close explanation'), onclick: () => closeTermPopover(), html: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6,6 L18,18 M18,6 L6,18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' })),
    h('p', entry.def),
    entry.example ? h('p.term-ex', entry.example) : null);
  document.body.append(pop);
  anchor.classList.add('open');
  anchor.setAttribute('aria-expanded', 'true');

  const place = () => {
    const r = anchor.getBoundingClientRect();
    const w = Math.min(340, window.innerWidth - 24);
    pop.style.width = `${w}px`;
    let left = r.left + r.width / 2 - w / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - w - 12));
    const below = r.bottom + 10;
    const ph = pop.offsetHeight;
    const flip = below + ph > window.innerHeight - 12 && r.top - ph - 10 > 12;
    pop.style.left = `${left}px`;
    pop.style.top = `${flip ? r.top - ph - 10 : below}px`;
    pop.classList.toggle('flip', flip);
    pop.style.setProperty('--arrow', `${Math.max(16, Math.min(w - 16, r.left + r.width / 2 - left))}px`);
  };
  place();

  const onDoc = (e) => { if (!pop.contains(e.target) && e.target !== anchor) closeTermPopover(); };
  const onKey = (e) => { if (e.key === 'Escape') { e.stopImmediatePropagation(); e.preventDefault(); closeTermPopover(); anchor.focus(); } };
  const onScroll = () => place();
  setTimeout(() => document.addEventListener('click', onDoc), 0);
  document.addEventListener('keydown', onKey, true);
  window.addEventListener('resize', onScroll);
  document.addEventListener('scroll', onScroll, true);
  pop.querySelector('.term-close').focus({ preventScroll: true });

  openPop = {
    anchor,
    cleanup: () => {
      document.removeEventListener('click', onDoc);
      document.removeEventListener('keydown', onKey, true);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('scroll', onScroll, true);
      anchor.classList.remove('open');
      anchor.setAttribute('aria-expanded', 'false');
      pop.remove();
    },
  };
}

export { clear };
