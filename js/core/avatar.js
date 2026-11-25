// Avatar v2: skema konfigurasi, sanitasi (whitelist + warna hex), migrasi dari v1,
// avatar acak yang serasi, dan pembungkus renderer.

import { seeded } from './rng.js';
import {
  SKIN, BG, HAIR_COLORS, EYE_COLORS, LIP_COLORS, SHADOW_COLORS, BLUSH_COLORS, THEMES, COLORS,
  BUILDS, FACE, MAKEUP, ITEMS, getItem, itemsFor, OPTIONAL_SLOTS, COLOR_SLOTS, unlockStatus,
} from './avatarItems.js';
import { renderAvatar, VIEWS } from './avatarCompose.js';

export * from './avatarItems.js';
export { VIEWS };

const HEX = /^#[0-9a-fA-F]{6}$/;
const okHex = (v) => typeof v === 'string' && HEX.test(v);
const inList = (v, list) => list.some((o) => o.id === v);
const inRange = (v, arr) => Number.isInteger(v) && v >= 0 && v < arr.length;

export const DEFAULT_AVATAR = {
  f: {
    v: 2, body: 'f', build: 'f-sedang', skin: 2, face: 'oval', eyes: 'sayu', eyeColor: 0, brows: 'melengkung', nose: 'lurus', lips: 'penuh', expr: 'senyum',
    hair: 'panjang', hairColor: '#4B3329',
    top: 'turtleneck', mid: '', dress: '', bottom: 'rok-mini', outer: 'trench', legwear: 'stoking-hitam', shoes: 'boot',
    head: '', hairAcc: '', ears: 'hoop', neck: '', wrist: 'gelang-emas', ring: '', bag: 'tas-tangan', glasses: '',
    colors: { top: '#2E2A2C', outer: '#2E2A2C', bottom: '#5A4036', shoes: '#2E2A2C', bag: '#4B3329' },
    mk: { shadow: '#A57A5B', liner: 'sayap', lashes: 'lentik', blush: 'lembut', blushColor: '#E79AAE', contour: false, highlight: true, lipColor: '#C47E86', lipFinish: 'satin', freckles: 'none', mark: 'none', glitter: false },
    bg: 0,
  },
  m: {
    v: 2, body: 'm', build: 'm-sedang', skin: 4, face: 'persegi', eyes: 'tajam', eyeColor: 1, brows: 'tebal', nose: 'lurus', lips: 'tipis', expr: 'netral',
    hair: 'belah', hairColor: '#2B2427',
    top: 'turtleneck', mid: '', dress: '', bottom: 'celana-bahan', outer: '', legwear: '', shoes: 'loafer',
    head: '', hairAcc: '', ears: '', neck: '', wrist: 'jam', ring: '', bag: '', glasses: '',
    colors: { top: '#B98D66', bottom: '#4B3329', shoes: '#4B3329' },
    mk: { shadow: 'none', liner: 'none', lashes: 'none', blush: 'none', blushColor: '#E79AAE', contour: false, highlight: false, lipColor: 'auto', lipFinish: 'satin', freckles: 'none', mark: 'none', glitter: false },
    bg: 3,
  },
};
const clone = (o) => JSON.parse(JSON.stringify(o));

// ───────────── Migrasi v1 (avatar setengah badan) ─────────────
const V1 = {
  skin: [1, 2, 4, 6, 8, 10],
  eyeColor: [0, 1, 4, 5, 7],
  hairColor: ['#2B2427', '#4B3329', '#7C5640', '#D8B47E', '#9E4E37', '#A9A3A6', '#E3A9BC', '#8296C4', '#A28BC4', '#F1ECE4'],
  cloth: ['#2E2A2C', '#7A3445', '#B98D66', '#A7B59A', '#B6A2CF', '#EBB9C6', '#5A4036', '#F6F1E9', '#9C969A', '#E7D7BE', '#2F3550', '#C9877E'],
  hair: { panjang: 'panjang', bob: 'bob', kuncir: 'ponytail', cepol: 'cepol', keriting: 'ikal-panjang', kepang: 'kepang', belah: 'belah', pendek: 'pendek', spike: 'acak', botak: 'cepak' },
  brows: { normal: 'melengkung', tebal: 'tebal', naik: 'lembut', tegas: 'tegas', sedih: 'lembut' },
  mouth: { senyum: 'senyum', datar: 'netral', kucing: 'manyun', nyengir: 'smirk', lebar: 'tertawa', o: 'kaget' },
};
export function migrateV1(o) {
  const sex = o.body === 'm' ? 'm' : 'f';
  const c = clone(DEFAULT_AVATAR[sex]);
  c.outer = ''; c.legwear = ''; c.bag = ''; c.wrist = ''; c.ears = ''; c.colors = {};
  if (Number.isInteger(o.skin) && V1.skin[o.skin] !== undefined) c.skin = V1.skin[o.skin];
  if (o.eyes === 'senyum') c.expr = 'mata-senyum';
  else if (o.eyes === 'kedip') c.expr = 'kedip';
  else c.expr = V1.mouth[o.mouth] || c.expr;
  c.eyes = o.eyes === 'sayu' ? 'sayu' : o.eyes === 'bulat' || o.eyes === 'anime' ? 'tajam' : c.eyes;
  if (o.eyes === 'anime') c.mk.liner = 'smoky';
  if (Number.isInteger(o.eyeColor) && V1.eyeColor[o.eyeColor] !== undefined) c.eyeColor = V1.eyeColor[o.eyeColor];
  c.brows = V1.brows[o.brows] || c.brows;
  c.mk.blush = o.blush === true ? 'lembut' : sex === 'f' ? c.mk.blush : 'none';
  c.hair = V1.hair[o.hair] || c.hair;
  if (Number.isInteger(o.hairColor) && V1.hairColor[o.hairColor]) c.hairColor = V1.hairColor[o.hairColor];
  const tc = Number.isInteger(o.topColor) && V1.cloth[o.topColor] ? V1.cloth[o.topColor] : null;
  switch (o.top) {
    case 'hoodie': c.top = 'turtleneck'; c.outer = 'trench'; if (tc) c.colors.outer = tc; c.colors.top = '#2E2A2C'; break;
    case 'sweater': c.top = 'breton'; if (tc) c.colors.top = tc; break;
    case 'kemeja': c.top = 'blus-pita'; if (tc) c.colors.top = tc; break;
    case 'jaket': c.top = 'kaos'; c.outer = 'jaket-kulit'; if (tc) c.colors.outer = tc; break;
    case 'jas': c.top = 'kemeja'; c.outer = 'blazer'; c.neck = 'dasi'; if (tc) c.colors.outer = tc; break;
    default: c.top = 'turtleneck'; if (tc) c.colors.top = tc;
  }
  const hcol = Number.isInteger(o.headColor) && V1.cloth[o.headColor] ? V1.cloth[o.headColor] : null;
  const headMap = { hijab: 'hijab', beret: 'baret', topi: 'fedora', kupluk: 'kupluk', kucing: 'bando-kucing', mahkota: 'tiara' };
  if (o.head === 'pita') { c.hairAcc = 'pita-besar'; if (hcol) c.colors.hairAcc = hcol; }
  else if (headMap[o.head]) { c.head = headMap[o.head]; if (hcol) c.colors.head = hcol; }
  c.glasses = { bulat: 'bulat', kotak: 'cat-eye', hitam: 'hitam' }[o.glasses] || '';
  if (o.extra === 'anting') c.ears = 'hoop';
  if (o.extra === 'plester') c.mk.mark = 'pipi';
  if (o.extra === 'headphone' && !c.head) c.head = 'headphone';
  if (Number.isInteger(o.bg)) c.bg = o.bg;
  return c;
}

// ───────────── Sanitasi ─────────────
/** Memvalidasi konfigurasi dari sumber mana pun (termasuk pemain lain). Nilai tak dikenal diganti default. */
export function sanitizeAvatar(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const src = raw.v === 2 ? raw : migrateV1(raw);
  const build = BUILDS.find((b) => b.id === src.build) || BUILDS.find((b) => b.id === (src.body === 'm' ? 'm-sedang' : 'f-sedang'));
  const sex = build.sex;
  const d = DEFAULT_AVATAR[sex];
  const pick = (k, list) => (inList(src[k], list) ? src[k] : d[k]);
  const out = {
    v: 2, body: sex, build: build.id,
    skin: inRange(src.skin, SKIN) ? src.skin : d.skin,
    face: pick('face', FACE.shape), eyes: pick('eyes', FACE.eyes), eyeColor: inRange(src.eyeColor, EYE_COLORS) ? src.eyeColor : d.eyeColor,
    brows: pick('brows', FACE.brows), nose: pick('nose', FACE.nose), lips: pick('lips', FACE.lips), expr: pick('expr', FACE.expr),
    hair: getItem('hair', src.hair) ? src.hair : d.hair,
    hairColor: okHex(src.hairColor) ? src.hairColor.toUpperCase() : d.hairColor,
    bg: inRange(src.bg, BG) ? src.bg : d.bg,
  };
  for (const slot of OPTIONAL_SLOTS) out[slot] = typeof src[slot] === 'string' && getItem(slot, src[slot]) ? src[slot] : '';
  if (out.dress) out.bottom = '';
  else {
    if (!out.top) out.top = d.top || 'kaos';
    if (!out.bottom) out.bottom = d.bottom || 'jeans';
  }
  out.colors = {};
  const cs = src.colors && typeof src.colors === 'object' ? src.colors : {};
  for (const slot of COLOR_SLOTS) if (out[slot] && okHex(cs[slot])) out.colors[slot] = cs[slot].toUpperCase();
  const mk = src.mk && typeof src.mk === 'object' ? src.mk : {};
  const dm = d.mk;
  const mPick = (k, list) => (inList(mk[k], list) ? mk[k] : dm[k]);
  out.mk = {
    shadow: mk.shadow === 'none' || okHex(mk.shadow) ? mk.shadow : dm.shadow,
    liner: mPick('liner', MAKEUP.liner), lashes: mPick('lashes', MAKEUP.lashes), blush: mPick('blush', MAKEUP.blush),
    blushColor: okHex(mk.blushColor) ? mk.blushColor : dm.blushColor,
    contour: mk.contour === true, highlight: mk.highlight === true, glitter: mk.glitter === true,
    lipColor: mk.lipColor === 'auto' || okHex(mk.lipColor) ? mk.lipColor : dm.lipColor,
    lipFinish: mPick('lipFinish', MAKEUP.lipFinish), freckles: mPick('freckles', MAKEUP.freckles), mark: mPick('mark', MAKEUP.mark),
  };
  return out;
}

/** SVG avatar. view: 'bust' (bawaan, untuk lingkaran kecil), 'full', 'face', dan tampilan thumbnail lain. */
export function avatarSvg(cfg, opts = {}) {
  const clean = sanitizeAvatar(cfg) || sanitizeAvatar(DEFAULT_AVATAR.f);
  return renderAvatar(clean, opts);
}

// ───────────── Tema & acak ─────────────
export function applyTheme(cfg, themeId) {
  const t = THEMES.find((x) => x.id === themeId);
  if (!t) return cfg;
  const [main, light, accent, shoes] = t.c;
  const map = { dress: main, top: cfg.dress ? light : light, mid: main, bottom: accent, outer: cfg.dress ? accent : main, legwear: null, shoes, head: main, hairAcc: accent, neck: accent, bag: shoes };
  const colors = { ...cfg.colors };
  for (const [slot, c] of Object.entries(map)) if (c && cfg[slot]) colors[slot] = c;
  return { ...cfg, colors };
}

const FEM_HAIR = ['panjang', 'panjang-tengah', 'panjang-tirai', 'panjang-rata', 'gelombang', 'gelombang-tirai', 'ikal-panjang', 'bob', 'bob-samping', 'lob', 'ponytail', 'ponytail-rendah', 'twintail', 'kepang', 'kepang-satu', 'cepol', 'cepol-berantakan', 'sanggul-rendah', 'cepol-dua', 'setengah-ikat', 'pixie', 'afro', 'ikal-pendek'];
const MASC_HAIR = ['pendek', 'belah', 'belah-tengah-pendek', 'acak', 'cepak', 'ikal-pendek', 'afro', 'pixie'];
const MASC_BOTTOM = ['celana-bahan', 'jeans', 'celana-pendek', 'kulot'];
const MASC_SHOES = ['sneaker', 'loafer', 'oxford', 'chelsea', 'combat', 'ankle', 'boot', 'espadrille', 'sandal'];

/**
 * Avatar acak yang serasi. `rand` = fungsi 0..1. `ctx` (opsional) = konteks buka item;
 * tanpa ctx hanya item gratis yang dipakai (misalnya untuk pemain simulasi).
 */
export function randomAvatar(rand = Math.random, sex = rand() < 0.5 ? 'f' : 'm', ctx = null) {
  const any = (arr) => arr[Math.floor(rand() * arr.length)];
  const chance = (p) => rand() < p;
  const usable = (it) => (ctx ? unlockStatus(it, ctx).ok : !it.unlock);
  const pickSlot = (slot, filter = () => true) => { const list = itemsFor(slot).filter((it) => usable(it) && filter(it)); return list.length ? any(list).id : ''; };
  const pickId = (ids) => { const ok = ids.filter((id) => { const it = ITEMS.find((x) => x.id === id); return it && usable(it); }); return ok.length ? any(ok) : ids[0]; };
  const fem = sex === 'f';
  const c = clone(DEFAULT_AVATAR[sex]);
  c.build = any(BUILDS.filter((b) => b.sex === sex)).id;
  c.skin = Math.floor(rand() * SKIN.length);
  c.face = any(FACE.shape).id; c.eyes = any(FACE.eyes).id; c.eyeColor = rand() < 0.7 ? Math.floor(rand() * 3) : Math.floor(rand() * EYE_COLORS.length);
  c.brows = fem ? any(['melengkung', 'lurus', 'tipis', 'lembut', 'tegas']) : any(['tebal', 'lurus', 'tegas', 'melengkung']);
  c.nose = any(FACE.nose).id; c.lips = any(FACE.lips).id;
  c.expr = any(['netral', 'senyum', 'senyum', 'smirk', 'tertawa', 'manyun', 'kedip', 'mata-senyum']);
  c.hair = pickId(fem ? FEM_HAIR : MASC_HAIR);
  c.hairColor = rand() < 0.8 ? HAIR_COLORS[Math.floor(rand() * 8)].c : any(HAIR_COLORS).c;
  for (const s of ['top', 'mid', 'dress', 'bottom', 'outer', 'legwear', 'head', 'hairAcc', 'ears', 'neck', 'wrist', 'ring', 'bag', 'glasses']) c[s] = '';
  c.colors = {};
  if (fem && chance(0.45)) {
    c.dress = pickSlot('dress');
    if (chance(0.15)) c.top = pickId(['kemeja', 'turtleneck', 'blus-renda']);
  }
  if (!c.dress) {
    c.top = pickSlot('top', (it) => fem || ['kemeja', 'turtleneck', 'kaos', 'sweter-kabel', 'breton', 'hoodie'].includes(it.id));
    c.bottom = fem ? pickSlot('bottom') : pickId(MASC_BOTTOM);
  }
  if (chance(0.15)) c.mid = pickSlot('mid');
  if (chance(0.35)) c.outer = pickSlot('outer', (it) => fem || it.id !== 'jaket-tweed');
  const skirtish = c.dress || (c.bottom && !getItem('bottom', c.bottom)?.r.pants);
  if (fem && skirtish && chance(0.35)) c.legwear = pickSlot('legwear');
  c.shoes = fem ? pickSlot('shoes') : pickId(MASC_SHOES);
  if (fem && chance(0.14)) c.head = 'hijab';
  else if (chance(fem ? 0.15 : 0.1)) c.head = pickSlot('head', (it) => it.id !== 'hijab');
  if (fem && c.head !== 'hijab' && chance(0.25)) c.hairAcc = pickSlot('hairAcc');
  if (fem && chance(0.5)) c.ears = pickSlot('ears');
  if (chance(fem ? 0.3 : 0.12)) c.neck = fem ? pickSlot('neck', (it) => !['dasi', 'dasi-kupu'].includes(it.id)) : pickId(['dasi', 'dasi-kupu', 'syal-rajut']);
  if (chance(0.3)) c.wrist = pickSlot('wrist');
  if (fem && chance(0.15)) c.ring = pickSlot('ring');
  if (chance(fem ? 0.4 : 0.1)) c.bag = fem ? pickSlot('bag') : pickId(['tote', 'tas-bahu']);
  if (chance(0.2)) c.glasses = pickSlot('glasses');
  if (chance(0.5)) Object.assign(c, applyTheme(c, any(THEMES).id));
  else for (const s of COLOR_SLOTS) if (c[s] && chance(0.6)) c.colors[s] = any([...COLORS.Pastel, ...COLORS.Netral, ...COLORS.Gelap]);
  c.mk = fem ? {
    shadow: chance(0.6) ? any(SHADOW_COLORS.slice(1)).c : 'none', liner: any(['none', 'tipis', 'sayap', 'sayap', 'kucing']), lashes: any(['natural', 'lentik', 'lentik', 'dramatis']),
    blush: chance(0.75) ? any(['lembut', 'apel', 'sunkissed', 'draping']) : 'none', blushColor: any(BLUSH_COLORS).c, contour: chance(0.2), highlight: chance(0.35),
    lipColor: any(LIP_COLORS.slice(1)).c, lipFinish: any(MAKEUP.lipFinish).id, freckles: chance(0.15) ? 'sedikit' : 'none', mark: chance(0.12) ? any(['pipi', 'bibir', 'mata']) : 'none', glitter: chance(0.06),
  } : {
    ...clone(DEFAULT_AVATAR.m.mk), freckles: chance(0.1) ? 'sedikit' : 'none', mark: chance(0.08) ? 'pipi' : 'none',
  };
  c.bg = Math.floor(rand() * BG.length);
  return sanitizeAvatar(c);
}

export const avatarForId = (id) => randomAvatar(seeded(`tahugak/avatar/${id}`));
