// Kolom username (@handle) dengan cek ketersediaan langsung, dialog ubah username, dan banner pengingat.
import { h } from './dom.js';
import { button, modal, toast } from './components.js';
import { ICON, art } from './art.js';
import { L } from '../core/i18n.js';
import { normalizeUsername, usernameProblem, USERNAME_MAX } from '../core/username.js';
import { claimUsername, releaseUsername, usernameOwner, usernamesSupported, myUid } from '../core/cloud.js';

export function problemText(code) {
  return {
    short: L('Minimal 3 karakter.', 'At least 3 characters.'),
    long: L('Maksimal 20 karakter.', 'At most 20 characters.'),
    chars: L('Hanya huruf kecil, angka, titik, dan garis bawah.', 'Only lowercase letters, numbers, dots, and underscores.'),
    dots: L('Titik tidak boleh di awal, di akhir, atau berurutan.', 'Dots can\'t be at the start, the end, or next to each other.'),
    reserved: L('Username ini tidak bisa dipakai.', 'This username isn\'t available.'),
    taken: L('Sudah dipakai orang lain.', 'Someone else already has it.'),
    offline: L('Butuh internet untuk menyimpan username.', 'You need internet to save a username.'),
    error: L('Server belum bisa menyimpan username. Coba lagi sebentar lagi.', 'The server couldn\'t save the username. Try again shortly.'),
    unsupported: L('Username butuh koneksi ke server.', 'Usernames need a server connection.'),
  }[code] || '';
}

/**
 * Kolom "@ username" dengan cek langsung.
 * Hasil: { el, input, value(), setValue(v), touched() }
 */
export function usernameField({ initial = '', current = null, id = 'uname', onInput } = {}) {
  let touched = false;
  let seq = 0;
  let timer = null;
  const input = h('input.input.uname-input', {
    id, type: 'text', value: initial, maxlength: USERNAME_MAX + 1, autocomplete: 'off', autocapitalize: 'none', spellcheck: 'false',
    'aria-label': L('Username', 'Username'), placeholder: L('username', 'username'),
    oninput: () => { touched = true; const v = normalizeUsername(input.value); if (input.value !== v) input.value = v; check(); onInput?.(v); },
  });
  const note = h('p.small.uname-note', { 'aria-live': 'polite' });
  const setNote = (text, tone = '') => { note.textContent = text; note.className = `small uname-note${tone ? ` ${tone}` : ''}`; };

  function check() {
    clearTimeout(timer);
    const v = normalizeUsername(input.value);
    const my = seq += 1;
    if (!v) { setNote(''); return; }
    const p = usernameProblem(v);
    if (p) { setNote(problemText(p), 'err'); return; }
    if (v === current) { setNote(L('Ini username-mu sekarang.', 'This is your current username.'), 'ok'); return; }
    setNote(L('Mengecek…', 'Checking…'), 'muted');
    timer = setTimeout(async () => {
      const owner = await usernameOwner(v);
      if (my !== seq) return;
      if (owner === undefined) setNote('');
      else if (owner === null) setNote(L('Tersedia.', 'Available.'), 'ok');
      else if (owner === myUid()) setNote(L('Ini username-mu.', 'This is yours.'), 'ok');
      else setNote(problemText('taken'), 'err');
    }, 450);
  }

  const el = h('div.uname-field', h('div.uname-wrap', h('span.uname-at', { 'aria-hidden': 'true' }, '@'), input), note);
  if (initial) check();
  return {
    el, input,
    value: () => normalizeUsername(input.value),
    setValue: (v) => { input.value = v; check(); },
    touched: () => touched,
    showError: (code) => setNote(problemText(code), 'err'),
  };
}

/** Klaim username lalu simpan ke state (dan lepas yang lama). Hasil: kode dari claimUsername / problem. */
export async function saveUsername(ctx, raw) {
  const v = normalizeUsername(raw);
  const p = usernameProblem(v);
  if (p) return p;
  const old = ctx.getState().profile.username;
  if (v === old) return 'ok';
  const r = await claimUsername(v);
  if (r !== 'ok') return r;
  ctx.update((st) => { st.profile.username = v; });
  if (old && old !== v) releaseUsername(old);
  return 'ok';
}

export function openUsernameModal(ctx) {
  const cur = ctx.getState().profile.username;
  const field = usernameField({ initial: cur || '', current: cur, id: 'uname-modal' });
  let busy = false;
  const save = async () => {
    if (busy) return;
    busy = true;
    const r = await saveUsername(ctx, field.value());
    busy = false;
    if (r === 'ok') {
      m.close(false);
      toast(L(`Username-mu sekarang @${field.value()}`, `Your username is now @${field.value()}`), { tone: 'ok' });
    } else field.showError(r);
  };
  const body = h('form.uname-form', { onsubmit: (e) => { e.preventDefault(); save(); } },
    h('p.small.muted', L('Temanmu bisa mencarimu lewat username ini. Nama tampilanmu tidak berubah.', 'Friends can find you with this username. Your display name stays the same.')),
    field.el);
  const m = modal({ title: cur ? L('Ubah username', 'Change username') : L('Buat username', 'Create a username'), icon: ICON.letter(), body,
    actions: [{ label: L('Batal', 'Cancel'), variant: 'ghost' }, { label: L('Simpan', 'Save'), keepOpen: true, onClick: save }] });
  setTimeout(() => field.input.focus(), 60);
  return m;
}

/** Banner di Beranda/Teman untuk pemain yang belum punya username. */
export function usernameBanner(s, ctx, { dismissable = true } = {}) {
  if (!usernamesSupported() || s.profile.username) return null;
  if (dismissable && s.settings.usernameBannerHidden) return null;
  return h('div.banner.banner-uname', art(ICON.letter()),
    h('p', L('Buat username biar temanmu bisa menemukanmu.', 'Create a username so your friends can find you.')),
    h('div.row-gap',
      dismissable ? button(L('Nanti', 'Later'), { size: 'sm', variant: 'ghost', onClick: () => ctx.update((st) => { st.settings.usernameBannerHidden = true; }) }) : null,
      button(L('Buat username', 'Create username'), { size: 'sm', onClick: () => openUsernameModal(ctx) })));
}
