// Studio Avatar: pembuat karakter layar penuh dengan pratinjau langsung seluruh badan,
// lapisan pakaian, makeup, warna kustom, kelangkaan & koleksi, favorit, riwayat, dan slot outfit.

import { h, clear } from './dom.js';
import { button, toast, confirmModal } from './components.js';
import {
  sanitizeAvatar, avatarSvg, randomAvatar, applyTheme, DEFAULT_AVATAR,
  SKIN, BG, HAIR_COLORS, EYE_COLORS, LIP_COLORS, SHADOW_COLORS, BLUSH_COLORS, COLORS, THEMES, RARITY, COLLECTIONS,
  BUILDS, FACE, MAKEUP, ITEMS, getItem, itemsFor, COLOR_SLOTS, unlockStatus, unlockContext,
} from '../core/avatar.js';
import { colorGroupName } from '../core/avatarItems.js';
import { L, bi, isEn } from '../core/i18n.js';

const TABS = [
  { id: 'tubuh', label: 'Tubuh', en: 'Body' }, { id: 'wajah', label: 'Wajah', en: 'Face' }, { id: 'makeup', label: 'Makeup', en: 'Makeup' }, { id: 'rambut', label: 'Rambut', en: 'Hair' },
  { id: 'pakaian', label: 'Pakaian', en: 'Clothes' }, { id: 'sepatu', label: 'Sepatu', en: 'Shoes' }, { id: 'aksesori', label: 'Aksesori', en: 'Accessories' }, { id: 'lemari', label: 'Lemari', en: 'Wardrobe' },
].map((t) => bi(t, 'label', t.en));
const TAB_SLOTS = {
  rambut: ['hair'], pakaian: ['top', 'mid', 'dress', 'bottom', 'outer', 'legwear'], sepatu: ['shoes'],
  aksesori: ['head', 'hairAcc', 'ears', 'neck', 'wrist', 'ring', 'bag', 'glasses'],
};
// [kunci filter, label Indonesia, label English]
const FILTERS = {
  rambut: [['all', 'Semua', 'All'], ['panjang', 'Panjang', 'Long'], ['pendek', 'Pendek', 'Short'], ['poni', 'Berponi', 'Bangs'], ['gelombang', 'Ikal & gelombang', 'Curls & waves'], ['ikat', 'Ikat & kepang', 'Tied & braided'], ['sanggul', 'Sanggul', 'Buns'], ['vintage', 'Vintage', 'Vintage']],
  pakaian: [['all', 'Semua', 'All'], ['Atasan', 'Atasan', 'Tops'], ['Gaun', 'Gaun', 'Dresses'], ['Luaran', 'Luaran', 'Outerwear'], ['Bawahan', 'Bawahan', 'Bottoms'], ['Kaus kaki', 'Kaus kaki', 'Socks']],
  aksesori: [['all', 'Semua', 'All'], ['Kepala', 'Kepala', 'Head'], ['Rambut', 'Hiasan rambut', 'Hair accessories'], ['Perhiasan', 'Perhiasan', 'Jewelry'], ['Syal', 'Syal', 'Scarves'], ['Tas', 'Tas', 'Bags'], ['Kacamata', 'Kacamata', 'Glasses']],
};
const SLOT_ID = { hair: 'Rambut', top: 'Atasan', mid: 'Lapisan tengah', dress: 'Gaun', bottom: 'Bawahan', outer: 'Luaran', legwear: 'Kaus kaki', shoes: 'Sepatu', head: 'Kepala', hairAcc: 'Hiasan rambut', ears: 'Anting', neck: 'Leher', wrist: 'Gelang', ring: 'Cincin', bag: 'Tas', glasses: 'Kacamata' };
const SLOT_EN = { hair: 'Hair', top: 'Top', mid: 'Mid layer', dress: 'Dress', bottom: 'Bottom', outer: 'Outerwear', legwear: 'Socks', shoes: 'Shoes', head: 'Head', hairAcc: 'Hair accessory', ears: 'Earrings', neck: 'Neck', wrist: 'Wrist', ring: 'Ring', bag: 'Bag', glasses: 'Glasses' };
const SLOT_NAME = new Proxy(SLOT_ID, { get: (_, k) => (isEn() ? SLOT_EN : SLOT_ID)[k] });
const THUMB = { hair: 'hair', top: 'upper', mid: 'upper', dress: 'dress', bottom: 'bottom', outer: 'outer', legwear: 'legwear', shoes: 'shoes', head: 'head', hairAcc: 'head', ears: 'face', glasses: 'face', neck: 'neck', wrist: 'hand', ring: 'hand', bag: 'bag' };
const HIDE = {
  top: ['outer', 'mid', 'hairSide', 'bag', 'neck'], mid: ['outer', 'hairSide', 'bag'], dress: ['outer', 'mid', 'hairSide', 'bag'], bottom: ['outer', 'bag'],
  outer: ['hairSide', 'bag'], neck: ['hairSide'], hair: ['head', 'hairAcc'], wrist: ['bag'], ring: ['bag'],
};
const key = (slot, id) => `${slot}:${id}`;

/**
 * @param opts.cfg        konfigurasi awal
 * @param opts.level      level pemain
 * @param opts.state      state pemain (untuk syarat buka); boleh null saat pendaftaran
 * @param opts.achNames   { id: nama pencapaian }
 * @param opts.wardrobe   { favs: [], recent: [], outfits: [cfg|null ×3] }
 * @param opts.onWardrobe (wardrobe) => void, disimpan langsung
 * @param opts.onSave     (cfg) => void
 */
export function openAvatarStudio({ cfg, level = 1, state = null, achNames = {}, wardrobe = null, onWardrobe = () => {}, onSave }) {
  const initial = sanitizeAvatar(cfg) || sanitizeAvatar(DEFAULT_AVATAR.f);
  let draft = initial;
  const history = [];
  const ctx = unlockContext(state, level);
  const wr = {
    favs: [...(wardrobe?.favs || [])], recent: [...(wardrobe?.recent || [])],
    outfits: [0, 1, 2].map((i) => (wardrobe?.outfits?.[i] ? sanitizeAvatar(wardrobe.outfits[i]) : null)),
  };
  const ui = { tab: 'pakaian', filter: { rambut: 'all', pakaian: 'all', aksesori: 'all' }, query: '', rarity: 'all', view: 'full', mirror: false, active: { pakaian: 'top', aksesori: 'bag', sepatu: 'shoes', rambut: 'hair' }, preview: null };

  const layer = document.getElementById('studio-layer');
  layer.hidden = false;
  document.body.classList.add('quiz-open');

  const previewBox = h('div.studio-preview-av.st-full', { 'aria-live': 'polite' });
  const previewTag = h('span.st-preview-tag', { hidden: true });
  const optionsEl = h('div.studio-options');
  const tabsEl = h('div.studio-tabs', { role: 'tablist', 'aria-label': L('Bagian avatar', 'Avatar sections') });
  const toolEl = h('div.st-tools');
  const sideCtl = h('div.st-side-ctl');
  const undoBtn = button(L('Urungkan', 'Undo'), { variant: 'ghost', size: 'sm', onClick: () => undo(), cls: 'st-undo' });
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.__paint?.(); observer.unobserve(e.target); }
  }, { root: null, rootMargin: '200px' }) : null;

  const close = () => {
    document.removeEventListener('keydown', onKey);
    observer?.disconnect();
    layer.hidden = true;
    clear(layer);
    if (!document.getElementById('quiz-layer') || document.getElementById('quiz-layer').hidden) document.body.classList.remove('quiz-open');
  };
  const onKey = (e) => {
    if (document.querySelector('#modals .overlay')) return;
    if (e.key === 'Escape') close();
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
  };
  document.addEventListener('keydown', onKey);

  const saveWardrobe = () => onWardrobe({ favs: wr.favs.slice(0, 80), recent: wr.recent.slice(0, 16), outfits: wr.outfits });
  const commit = (next, { keepTiles = false } = {}) => {
    history.push(draft);
    if (history.length > 40) history.shift();
    draft = sanitizeAvatar(next);
    ui.preview = null;
    draw(keepTiles);
  };
  const undo = () => { if (!history.length) return; draft = history.pop(); draw(); };
  const status = (it) => unlockStatus(it, ctx, achNames);

  function equip(slot, id) {
    const it = getItem(slot, id);
    if (!it) return;
    const st = status(it);
    if (!st.ok) { toast(L(`Terkunci: ${st.label}.`, `Locked: ${st.label}.`)); return; }
    const d = { ...draft, colors: { ...draft.colors } };
    if (d[slot] === id && slot !== 'hair') {
      if ((slot === 'top' || slot === 'bottom') && !d.dress) { toast(slot === 'top' ? L('Atasan dibutuhkan kecuali memakai gaun.', 'A top is needed unless you\'re wearing a dress.') : L('Bawahan dibutuhkan kecuali memakai gaun.', 'A bottom is needed unless you\'re wearing a dress.')); return; }
      d[slot] = '';
    } else {
      d[slot] = id;
      delete d.colors[slot];
      if (slot === 'dress') d.bottom = '';
      if (slot === 'bottom') d.dress = '';
      wr.recent = [key(slot, id), ...wr.recent.filter((k) => k !== key(slot, id))].slice(0, 16);
      saveWardrobe();
    }
    if (ui.tab in ui.active) ui.active[ui.tab] = slot;
    commit(d);
  }
  const setColor = (slot, c) => commit({ ...draft, colors: { ...draft.colors, [slot]: c } }, { keepTiles: true });
  const setMk = (k, v) => commit({ ...draft, mk: { ...draft.mk, [k]: v } });
  const set = (patch) => commit({ ...draft, ...patch });

  // ───────────── Pratinjau ─────────────
  function drawPreview() {
    const c = ui.preview || draft;
    previewBox.className = `studio-preview-av st-${ui.view}`;
    previewBox.innerHTML = avatarSvg(c, { view: ui.view, mirror: ui.mirror });
    previewBox.firstElementChild?.classList.add('st-fade');
    previewTag.hidden = !ui.preview;
    if (ui.preview) previewTag.textContent = L(`Pratinjau: ${ui.previewName}`, `Preview: ${ui.previewName}`);
    undoBtn.disabled = !history.length;
  }
  function hoverPreview(slot, it) {
    return {
      onpointerenter: (e) => { if (e.pointerType !== 'mouse') return; ui.preview = sanitizeAvatar(withItem(slot, it.id)); ui.previewName = it.n; drawPreview(); },
      onpointerleave: (e) => { if (e.pointerType !== 'mouse' || !ui.preview) return; ui.preview = null; drawPreview(); },
    };
  }
  const withItem = (slot, id) => {
    const d = { ...draft, colors: { ...draft.colors }, [slot]: id };
    delete d.colors[slot];
    if (slot === 'dress') d.bottom = '';
    if (slot === 'bottom') d.dress = '';
    return d;
  };

  function drawSide() {
    clear(sideCtl).append(
      h('div.segctl', { role: 'group', 'aria-label': L('Tipe badan', 'Body type') }, ...[['f', L('Cewek', 'Girl')], ['m', L('Cowok', 'Boy')]].map(([s, n]) => h(`button.segctl-btn${draft.body === s ? '.on' : ''}`, {
        type: 'button', 'aria-pressed': String(draft.body === s),
        onclick: () => {
          if (draft.body === s) return;
          const base = DEFAULT_AVATAR[s];
          commit({ ...base, skin: draft.skin, bg: draft.bg, eyeColor: draft.eyeColor, colors: { ...base.colors } });
        },
      }, n))),
      h('div.segctl', { role: 'group', 'aria-label': L('Tampilan', 'View') }, ...[['full', L('Seluruh badan', 'Full body')], ['face', L('Zoom wajah', 'Face zoom')]].map(([v, n]) => h(`button.segctl-btn${ui.view === v ? '.on' : ''}`, {
        type: 'button', 'aria-pressed': String(ui.view === v), onclick: () => { ui.view = v; drawPreview(); drawSide(); },
      }, n))),
      h('div.row-gap.st-side-btns',
        button(ui.mirror ? L('Hadap kanan', 'Face right') : L('Hadap kiri', 'Face left'), { variant: 'ghost', size: 'sm', onClick: () => { ui.mirror = !ui.mirror; drawPreview(); drawSide(); }, title: L('Balik arah hadap karakter', 'Flip which way the character faces') }),
        button(L('Acak', 'Shuffle'), { variant: 'ghost', size: 'sm', onClick: () => commit(randomAvatar(Math.random, draft.body, ctx)) }),
        undoBtn,
        button(L('Atur ulang', 'Reset'), { variant: 'ghost', size: 'sm', onClick: async () => { if (await confirmModal(L('Atur ulang avatar?', 'Reset avatar?'), L('Kembali ke avatar saat studio dibuka. Kamu masih bisa mengurungkannya.', 'Go back to the avatar you had when the studio opened. You can still undo it.'), { confirmLabel: L('Atur ulang', 'Reset') })) commit(initial); } })),
      h('p.small.muted.studio-hint', L('Arahkan kursor ke item untuk pratinjau. Ilustrasi 2D, jadi karakter bisa dibalik arahnya tapi tidak diputar 360°.', 'Hover over an item to preview it. It\'s a 2D illustration, so the character can be flipped but not rotated 360°.')));
  }

  // ───────────── Komponen ─────────────
  function tile({ label, html, paint, on, locked, lockLabel, rarity, fav, onFav, onClick, hover, title }) {
    const thumb = h('span.tile-av');
    if (html) thumb.innerHTML = html;
    else if (paint) { thumb.__paint = () => { thumb.innerHTML = paint(); }; if (observer) observer.observe(thumb); else thumb.__paint(); }
    const b = h(`button.opt-tile${on ? '.on' : ''}${locked ? '.locked' : ''}`, {
      type: 'button', 'aria-pressed': String(!!on), 'aria-disabled': locked ? 'true' : null, title: title || (locked ? `${label}: ${lockLabel}` : label),
      onclick: onClick, ...(hover || {}),
    }, thumb, h('span.tile-name', label),
    rarity ? h(`span.tile-rarity.r-${rarity}`, { title: RARITY[rarity].n }, RARITY[rarity].n) : null,
    locked ? h('span.tile-lock', lockLabel) : null);
    const wrap = h('div.tile-wrap', b);
    if (onFav) wrap.append(h(`button.tile-fav${fav ? '.on' : ''}`, { type: 'button', 'aria-pressed': String(!!fav), 'aria-label': fav ? L(`Hapus ${label} dari favorit`, `Remove ${label} from favorites`) : L(`Tambahkan ${label} ke favorit`, `Add ${label} to favorites`), title: fav ? L('Favorit', 'Favorite') : L('Jadikan favorit', 'Add to favorites'), onclick: onFav, html: `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12,20 C5,14.5 3,11.5 3,8.6 C3,6 5,4.2 7.3,4.2 C9.2,4.2 10.9,5.3 12,7 C13.1,5.3 14.8,4.2 16.7,4.2 C19,4.2 21,6 21,8.6 C21,11.5 19,14.5 12,20 Z" fill="${fav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>` }));
    return wrap;
  }

  function itemTile(it) {
    const st = status(it);
    const k = key(it.slot, it.id);
    const fav = wr.favs.includes(k);
    return tile({
      label: it.n, on: draft[it.slot] === it.id, locked: !st.ok, lockLabel: st.label, rarity: it.rarity, fav,
      paint: () => avatarSvg(withItem(it.slot, it.id), { view: THUMB[it.slot], lite: true, hide: new Set(HIDE[it.slot] || []) }),
      onClick: () => equip(it.slot, it.id),
      onFav: () => { wr.favs = fav ? wr.favs.filter((x) => x !== k) : [k, ...wr.favs]; saveWardrobe(); drawContent(); },
      hover: hoverPreview(it.slot, it),
      title: `${it.n} · ${SLOT_NAME[it.slot]} · ${RARITY[it.rarity].n}${it.col ? ` · ${COLLECTIONS[it.col].n}` : ''}${st.ok ? '' : L(` · Terkunci: ${st.label}`, ` · Locked: ${st.label}`)}`,
    });
  }

  function choiceTiles(title, list, cur, onPick, paint) {
    return h('section.opt-group', h('h3', title), h('div.opt-grid', list.map((o) => tile({
      label: o.n, on: cur === o.id, paint: () => paint(o.id), onClick: () => onPick(o.id),
    }))));
  }

  function swatches(title, list, cur, onPick, { custom = false, extra = null } = {}) {
    const sw = list.map((item) => {
      const c = typeof item === 'string' ? item : item.c;
      const name = typeof item === 'string' ? c : item.n;
      const special = c === 'none' || c === 'auto';
      return h(`button.swatch${cur === c ? '.on' : ''}${special ? '.sw-special' : ''}`, {
        type: 'button', 'aria-pressed': String(cur === c), 'aria-label': name, title: name,
        style: special ? {} : { '--sw': c }, onclick: () => onPick(c),
      }, c === 'none' ? '∅' : c === 'auto' ? 'A' : '');
    });
    if (custom) {
      const val = /^#[0-9a-fA-F]{6}$/.test(cur) ? cur : '#E9AFC0';
      const input = h('input', { type: 'color', value: val.toLowerCase(), 'aria-label': L(`${title}: warna kustom`, `${title}: custom color`), oninput: (e) => { previewColor(e.target.value); }, onchange: (e) => onPick(e.target.value.toUpperCase()) });
      sw.push(h('label.swatch.sw-custom', { title: L('Warna kustom', 'Custom color') }, input, h('span', { 'aria-hidden': 'true' }, '+')));
    }
    return h('section.opt-group', h('h3', title), extra, h('div.swatches', sw));
  }
  let colorPreviewSlot = null;
  function previewColor(hex) {
    if (!colorPreviewSlot) return;
    const [kind, k2] = colorPreviewSlot;
    const c = kind === 'slot' ? { ...draft, colors: { ...draft.colors, [k2]: hex.toUpperCase() } }
      : kind === 'hair' ? { ...draft, hairColor: hex.toUpperCase() } : { ...draft, mk: { ...draft.mk, [k2]: hex.toUpperCase() } };
    ui.preview = sanitizeAvatar(c); ui.previewName = L('warna kustom', 'custom color'); drawPreview();
  }

  function colorPanel(slot) {
    const it = draft[slot] ? getItem(slot, draft[slot]) : null;
    if (!it || !COLOR_SLOTS.includes(slot) || !it.color) return h('p.small.muted.st-note', it ? L(`${it.n} memakai warna aslinya.`, `${it.n} keeps its original colors.`) : L(`Pilih ${SLOT_NAME[slot].toLowerCase()} dulu untuk mengubah warnanya.`, `Pick a ${SLOT_NAME[slot].toLowerCase()} first to change its color.`));
    colorPreviewSlot = ['slot', slot];
    const cur = draft.colors[slot] || it.color;
    const groups = Object.entries(COLORS).map(([g, list]) => h('div.sw-row', h('span.sw-label', colorGroupName(g)), h('div.swatches', list.map((c) => h(`button.swatch${cur === c ? '.on' : ''}`, {
      type: 'button', 'aria-pressed': String(cur === c), 'aria-label': c, title: c, style: { '--sw': c }, onclick: () => setColor(slot, c),
    })))));
    const val = cur.toLowerCase();
    return h('section.opt-group.st-colors',
      h('div.st-colors-head', h('h3', L(`Warna ${it.n.toLowerCase()}`, `${it.n} color`)),
        button(L('Warna asli', 'Original color'), { variant: 'ghost', size: 'xs', onClick: () => { const d = { ...draft, colors: { ...draft.colors } }; delete d.colors[slot]; commit(d, { keepTiles: true }); } }),
        h('label.swatch.sw-custom', { title: L('Warna kustom', 'Custom color') }, h('input', { type: 'color', value: val, 'aria-label': L('Warna kustom', 'Custom color'), oninput: (e) => previewColor(e.target.value), onchange: (e) => setColor(slot, e.target.value.toUpperCase()) }), h('span', { 'aria-hidden': 'true' }, '+'))),
      ...groups);
  }

  function wornStrip(tab) {
    const slots = TAB_SLOTS[tab].filter((s) => draft[s]);
    if (!slots.length) return null;
    return h('div.st-worn', h('span.small.muted', L('Dipakai:', 'Wearing:')), ...slots.map((s) => {
      const it = getItem(s, draft[s]);
      const c = draft.colors[s] || it.color;
      return h(`span.st-worn-chip${ui.active[tab] === s ? '.on' : ''}`,
        h('button', { type: 'button', title: L(`Ubah warna ${it.n}`, `Change ${it.n} color`), onclick: () => { ui.active[tab] = s; drawContent(); } }, c ? h('i.st-dot', { style: { '--sw': c } }) : null, `${SLOT_NAME[s]}: ${it.n}`),
        (s === 'top' || s === 'bottom') && !draft.dress || s === 'hair' ? null : h('button.st-x', { type: 'button', 'aria-label': L(`Lepas ${it.n}`, `Take off ${it.n}`), title: L('Lepas', 'Take off'), onclick: () => equip(s, draft[s]) }, '×'));
    }));
  }

  // ───────────── Tab & isi ─────────────
  function drawTabs() {
    clear(tabsEl).append(...TABS.map((t) => h(`button.studio-tab${ui.tab === t.id ? '.on' : ''}`, {
      type: 'button', role: 'tab', 'aria-selected': String(ui.tab === t.id), onclick: () => { ui.tab = t.id; ui.query = ''; draw(); optionsEl.scrollTop = 0; },
    }, h('span', t.label))));
  }

  function drawTools() {
    const search = h('input.input.st-search', {
      type: 'search', placeholder: L('Cari item: gaun, pita, bot…', 'Search items: dress, bow, boots…'), value: ui.query, 'aria-label': L('Cari item', 'Search items'),
      oninput: (e) => { ui.query = e.target.value; drawContent(); },
    });
    const chips = FILTERS[ui.tab] ? h('div.st-chips', FILTERS[ui.tab].map(([id, n, en]) => h(`button.period${ui.filter[ui.tab] === id ? '.active' : ''}`, {
      type: 'button', onclick: () => { ui.filter[ui.tab] = id; drawTools(); drawContent(); },
    }, L(n, en)))) : null;
    const rar = TAB_SLOTS[ui.tab] ? h('select.input.st-rarity', { 'aria-label': L('Filter kelangkaan', 'Rarity filter'), onchange: (e) => { ui.rarity = e.target.value; drawContent(); } },
      h('option', { value: 'all', selected: ui.rarity === 'all' }, L('Semua kelangkaan', 'All rarities')),
      ...Object.entries(RARITY).map(([id, r]) => h('option', { value: id, selected: ui.rarity === id }, r.n))) : null;
    clear(toolEl).append(...[h('div.st-tools-row', search, rar), chips].filter(Boolean));
    // pertahankan fokus saat mengetik
    if (document.activeElement?.classList?.contains('st-search')) { const s = toolEl.querySelector('.st-search'); s.focus(); s.setSelectionRange(s.value.length, s.value.length); }
  }

  const matches = (it) => {
    if (ui.rarity !== 'all' && it.rarity !== ui.rarity) return false;
    const f = ui.filter[ui.tab];
    if (!f || f === 'all') return true;
    if (ui.tab === 'rambut') return f === 'gelombang' ? it.tags.some((t) => t === 'ikal' || t === 'gelombang') : f === 'ikat' ? it.tags.some((t) => t === 'ikat' || t === 'kepang') : it.tags.includes(f);
    return it.cat === f;
  };

  function drawContent(keepScroll = true) {
    const top = optionsEl.scrollTop;
    clear(optionsEl);
    colorPreviewSlot = null;
    const g = [];
    const q = ui.query.trim().toLowerCase();
    if (q) {
      const found = ITEMS.filter((it) => (it.n.toLowerCase().includes(q) || SLOT_NAME[it.slot].toLowerCase().includes(q) || (it.tags || []).some((t) => t.includes(q)) || (it.col && COLLECTIONS[it.col].n.toLowerCase().includes(q))) && (ui.rarity === 'all' || it.rarity === ui.rarity));
      g.push(h('section.opt-group', h('h3', L(`Hasil pencarian (${found.length})`, `Search results (${found.length})`)),
        found.length ? h('div.opt-grid', found.map(itemTile)) : h('p.small.muted', L('Tidak ada item yang cocok. Coba kata lain, misalnya "pita" atau "bot".', 'No matching items. Try another word, like "bow" or "boots".'))));
    } else if (ui.tab === 'tubuh') {
      g.push(h('section.opt-group', h('h3', L('Bentuk badan', 'Body shape')), h('div.opt-grid', BUILDS.filter((b) => b.sex === draft.body).map((b) => tile({
        label: b.n, on: draft.build === b.id, paint: () => avatarSvg({ ...draft, build: b.id }, { view: 'dress', lite: true }), onClick: () => set({ build: b.id }),
      })))));
      g.push(swatches(L('Warna kulit', 'Skin tone'), SKIN.map((c, i) => ({ c, n: L(`Kulit ${i + 1}`, `Skin ${i + 1}`) })), SKIN[draft.skin], (c) => set({ skin: SKIN.indexOf(c) })));
      g.push(swatches(L('Latar', 'Background'), BG.map((c, i) => ({ c, n: L(`Latar ${i + 1}`, `Background ${i + 1}`) })), BG[draft.bg], (c) => set({ bg: BG.indexOf(c) })));
    } else if (ui.tab === 'wajah') {
      const face = (k, id) => avatarSvg({ ...draft, [k]: id }, { view: 'face', lite: true });
      g.push(choiceTiles(L('Bentuk wajah', 'Face shape'), FACE.shape, draft.face, (id) => set({ face: id }), (id) => avatarSvg({ ...draft, face: id }, { view: 'head', lite: true, hide: new Set(['head', 'hairAcc']) })));
      g.push(choiceTiles(L('Bentuk mata', 'Eye shape'), FACE.eyes, draft.eyes, (id) => set({ eyes: id }), (id) => face('eyes', id)));
      g.push(swatches(L('Warna mata', 'Eye color'), EYE_COLORS, EYE_COLORS[draft.eyeColor].c, (c) => set({ eyeColor: EYE_COLORS.findIndex((e) => e.c === c) })));
      g.push(choiceTiles(L('Alis', 'Brows'), FACE.brows, draft.brows, (id) => set({ brows: id }), (id) => face('brows', id)));
      g.push(choiceTiles(L('Hidung', 'Nose'), FACE.nose, draft.nose, (id) => set({ nose: id }), (id) => face('nose', id)));
      g.push(choiceTiles(L('Bentuk bibir', 'Lip shape'), FACE.lips, draft.lips, (id) => set({ lips: id }), (id) => face('lips', id)));
      g.push(choiceTiles(L('Ekspresi', 'Expression'), FACE.expr, draft.expr, (id) => set({ expr: id }), (id) => face('expr', id)));
    } else if (ui.tab === 'makeup') {
      const mkFace = (patch) => avatarSvg({ ...draft, mk: { ...draft.mk, ...patch } }, { view: 'face', lite: true });
      colorPreviewSlot = ['mk', 'lipColor'];
      g.push(h('p.small.muted.st-note', L('Semua pilihan makeup bisa digabung. Warna kustom tersedia di lipstik.', 'All makeup options can be combined. Lipstick has a custom color.')));
      g.push(swatches('Eyeshadow', SHADOW_COLORS, draft.mk.shadow, (c) => setMk('shadow', c)));
      g.push(choiceTiles('Eyeliner', MAKEUP.liner, draft.mk.liner, (id) => setMk('liner', id), (id) => mkFace({ liner: id })));
      g.push(choiceTiles(L('Bulu mata', 'Lashes'), MAKEUP.lashes, draft.mk.lashes, (id) => setMk('lashes', id), (id) => mkFace({ lashes: id })));
      g.push(choiceTiles('Blush', MAKEUP.blush, draft.mk.blush, (id) => setMk('blush', id), (id) => mkFace({ blush: id })));
      g.push(swatches(L('Warna blush', 'Blush color'), BLUSH_COLORS, draft.mk.blushColor, (c) => setMk('blushColor', c)));
      g.push(swatches(L('Lipstik', 'Lipstick'), LIP_COLORS, draft.mk.lipColor, (c) => setMk('lipColor', c), { custom: true }));
      g.push(h('section.opt-group', h('h3', L('Hasil akhir bibir', 'Lip finish')), h('div.segctl', MAKEUP.lipFinish.map((o) => h(`button.segctl-btn${draft.mk.lipFinish === o.id ? '.on' : ''}`, { type: 'button', onclick: () => setMk('lipFinish', o.id) }, o.n)))));
      g.push(h('section.opt-group', h('h3', L('Kontur, highlight & kilau', 'Contour, highlight & shimmer')), h('div.st-toggles',
        ...[['contour', L('Kontur', 'Contour')], ['highlight', 'Highlight'], ['glitter', L('Glitter wajah', 'Face glitter')]].map(([k, n]) => h(`button.st-toggle${draft.mk[k] ? '.on' : ''}`, { type: 'button', 'aria-pressed': String(draft.mk[k]), onclick: () => setMk(k, !draft.mk[k]) }, n)))));
      g.push(h('section.opt-group', h('h3', L('Bintik wajah', 'Freckles')), h('div.segctl', MAKEUP.freckles.map((o) => h(`button.segctl-btn${draft.mk.freckles === o.id ? '.on' : ''}`, { type: 'button', onclick: () => setMk('freckles', o.id) }, o.n)))));
      g.push(choiceTiles(L('Tahi lalat', 'Beauty mark'), MAKEUP.mark, draft.mk.mark, (id) => setMk('mark', id), (id) => mkFace({ mark: id })));
    } else if (ui.tab === 'lemari') {
      g.push(outfitSlots());
      const favItems = wr.favs.map((k) => { const [s, id] = k.split(':'); return getItem(s, id); }).filter(Boolean);
      g.push(h('section.opt-group', h('h3', L('Favorit', 'Favorites')), favItems.length ? h('div.opt-grid', favItems.map(itemTile)) : h('p.small.muted', L('Ketuk ♡ di item mana pun untuk menyimpannya di sini.', 'Tap ♡ on any item to save it here.'))));
      const rec = wr.recent.map((k) => { const [s, id] = k.split(':'); return getItem(s, id); }).filter(Boolean);
      g.push(h('section.opt-group', h('h3', L('Terakhir dipakai', 'Recently worn')), rec.length ? h('div.opt-grid', rec.map(itemTile)) : h('p.small.muted', L('Item yang kamu coba akan muncul di sini.', 'Items you try on will show up here.'))));
      g.push(collections());
    } else {
      const slots = TAB_SLOTS[ui.tab];
      const list = ITEMS.filter((it) => slots.includes(it.slot) && matches(it));
      if (ui.tab === 'pakaian') g.push(h('section.opt-group.st-themes', h('h3', L('Tema warna', 'Color themes')), h('div.st-theme-row', THEMES.map((t) => h('button.st-theme', {
        type: 'button', title: L(`Terapkan ${t.n} ke seluruh pakaian`, `Apply ${t.n} to the whole outfit`), onclick: () => commit(applyTheme(draft, t.id), { keepTiles: true }),
      }, h('span.st-theme-sw', t.c.map((c) => h('i', { style: { '--sw': c } }))), h('span', t.n))))));
      g.push(wornStrip(ui.tab));
      if (ui.tab !== 'rambut') g.push(colorPanel(ui.active[ui.tab] && draft[ui.active[ui.tab]] ? ui.active[ui.tab] : slots.find((s) => draft[s]) || slots[0]));
      if (ui.tab === 'rambut') {
        if (draft.head === 'hijab') g.splice(g.length - 1, 0, h('p.small.muted.studio-note', L('Rambut tertutup hijab. Lepas hijab di tab Aksesori untuk melihat gaya rambut.', 'Hair is covered by the hijab. Take off the hijab in Accessories to see the hairstyle.')));
        colorPreviewSlot = ['hair'];
        g.push(swatches(L('Warna rambut', 'Hair color'), HAIR_COLORS, draft.hairColor, (c) => set({ hairColor: c }), { custom: true }));
      }
      if (ui.tab === 'pakaian' && ui.filter.pakaian === 'all') {
        for (const [cat, title] of [['Atasan', L('Atasan & lapisan', 'Tops & layers')], ['Gaun', L('Gaun', 'Dresses')], ['Luaran', L('Luaran', 'Outerwear')], ['Bawahan', L('Bawahan', 'Bottoms')], ['Kaus kaki', L('Kaus kaki & stoking', 'Socks & tights')]]) {
          const sub = list.filter((it) => it.cat === cat);
          if (sub.length) g.push(h('section.opt-group', h('h3', `${title} (${sub.length})`), h('div.opt-grid', sub.map(itemTile))));
        }
      } else {
        g.push(h('section.opt-group', h('h3', L(`${list.length} item`, `${list.length} items`)), list.length ? h('div.opt-grid', list.map(itemTile)) : h('p.small.muted', L('Tidak ada item untuk filter ini.', 'No items for this filter.'))));
      }
    }
    optionsEl.append(...g.filter(Boolean));
    if (keepScroll) optionsEl.scrollTop = top;
  }

  function outfitSlots() {
    return h('section.opt-group', h('h3', L('Slot outfit', 'Outfit slots')), h('p.small.muted', L('Simpan sampai tiga gaya lengkap dan ganti kapan saja.', 'Save up to three complete looks and switch anytime.')),
      h('div.st-outfits', wr.outfits.map((o, i) => h('div.st-outfit',
        h('div.st-outfit-av', { html: o ? avatarSvg(o, { view: 'dress', lite: true }) : '' }, o ? null : h('span.muted.small', L('Kosong', 'Empty'))),
        h('strong', `Slot ${i + 1}`),
        h('div.row-gap',
          button(o ? L('Timpa', 'Replace') : L('Simpan', 'Save'), { size: 'xs', variant: 'ghost', onClick: () => { wr.outfits[i] = draft; saveWardrobe(); toast(L(`Outfit disimpan ke slot ${i + 1}.`, `Outfit saved to slot ${i + 1}.`), { tone: 'ok' }); drawContent(); } }),
          o ? button(L('Pakai', 'Wear'), { size: 'xs', onClick: () => commit(o) }) : null,
          o ? button(L('Hapus', 'Delete'), { size: 'xs', variant: 'ghost', onClick: () => { wr.outfits[i] = null; saveWardrobe(); drawContent(); } }) : null)))));
  }

  function collections() {
    return h('section.opt-group', h('h3', L('Koleksi', 'Collections')), h('div.st-cols', Object.entries(COLLECTIONS).map(([id, c]) => {
      const items = ITEMS.filter((it) => it.col === id);
      const owned = items.filter((it) => status(it).ok).length;
      return h('article.st-col.card',
        h('div.st-col-head', h('strong', c.n), h('span.small.muted', L(`${owned}/${items.length} terbuka`, `${owned}/${items.length} unlocked`))),
        h('p.small.muted', c.d),
        h('div.opt-grid.st-col-grid', items.map(itemTile)));
    })));
  }

  function draw(keepTiles = false) {
    drawPreview();
    drawSide();
    drawTabs();
    drawTools();
    drawContent();
  }

  clear(layer).append(h('div.studio', { role: 'dialog', 'aria-modal': 'true', 'aria-label': L('Studio avatar', 'Avatar studio') },
    h('header.studio-top',
      button(L('Batal', 'Cancel'), { variant: 'ghost', size: 'sm', onClick: close }),
      h('h1.display', L('Studio Avatar', 'Avatar Studio')),
      button(L('Simpan', 'Save'), { size: 'sm', cls: 'studio-save', onClick: () => { onSave(draft); saveWardrobe(); close(); toast(L('Avatar disimpan.', 'Avatar saved.'), { tone: 'ok' }); } })),
    h('div.studio-body',
      h('aside.studio-side', h('div.st-stage', previewBox, previewTag), sideCtl),
      h('div.studio-main', tabsEl, toolEl, optionsEl))));
  draw();
  setTimeout(() => layer.querySelector('.studio-tab.on')?.focus(), 50);
}
