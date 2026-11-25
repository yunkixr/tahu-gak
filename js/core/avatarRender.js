// Renderer avatar seluruh badan, gaya ilustrasi fashion: garis tinta tipis di atas isian cat air.
// Kanvas 200×570. Kepala & wajah memakai koordinat yang sama dengan versi setengah badan,
// jadi tampilan "bust" cukup memotong viewBox. Semua input sudah disanitasi oleh avatar.js.

import { SKIN, BG, EYE_COLORS, BUILDS, getItem } from './avatarItems.js';

// ───────────── Utilitas ─────────────
export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v * (1 - amt))));
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, '0')).join('')}`;
}
export function lighten(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.round(v + (255 - v) * amt);
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, '0')).join('')}`;
}
export function lum(hex) {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
}
export const INK = '#3D3335';
const PAPER = '#FFFBF5';
const GOLD = '#C9A45C';
const PEARL = '#FBF7F0';
const CX = 100;
let uid = 0;

const r1 = (v) => Math.round(v * 10) / 10;
const pt = ([x, y]) => `${r1(x)},${r1(y)}`;
export const LINE = (d, w = 1.2, op = 1, color = INK) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${op < 1 ? ` opacity="${op}"` : ''}/>`;
export const FILL = (d, fill, op = 1) => `<path d="${d}" fill="${fill}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
/** Isian + garis tepi + garis sketsa kedua yang sedikit bergeser. */
export const SHAPE = (d, fill, w = 1, op = 0.75) => FILL(d, fill) + LINE(d, w, op)
  + `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${r1(w * 0.6)}" opacity="${r1(op * 0.35)}" transform="translate(.9 -.7)"/>`;
const C = (cx, cy, r, fill, stroke = 0.8, op = 1) => `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" fill="${fill}"${stroke ? ` stroke="${INK}" stroke-width="${stroke}"` : ''}${op < 1 ? ` opacity="${op}"` : ''}/>`;
const MIRROR = (inner) => `<g transform="translate(200 0) scale(-1 1)">${inner}</g>`;
const BOTH = (inner) => inner + MIRROR(inner);

/** Kurva Catmull-Rom melalui titik-titik (dimulai dari titik pertama sebagai posisi sekarang). */
function through(pts) {
  let s = '';
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    s += ` C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return s;
}
const interp = (table, y) => {
  if (y <= table[0][0]) return table[0][1];
  for (let i = 1; i < table.length; i++) {
    if (y <= table[i][0]) {
      const [y0, v0] = table[i - 1], [y1, v1] = table[i];
      return v0 + ((v1 - v0) * (y - y0)) / (y1 - y0);
    }
  }
  return table[table.length - 1][1];
};

// ───────────── Geometri tubuh ─────────────
export const Y = { neck: 160, shoulder: 176, armpit: 200, bust: 214, waist: 262, hip: 308, crotch: 336, knee: 440, ankle: 532, sole: 558 };

function geometry(build) {
  const b = BUILDS.find((x) => x.id === build) || BUILDS[1];
  const m = { ...b.m, sex: b.sex, nk: b.sex === 'm' ? 13 : 9 };
  const { S, B, W, H, T, A, nk } = m;
  m.side = [[158, nk], [168, S * 0.72], [176, S], [200, B + 2], [214, B], [238, (B + W) / 2], [262, W], [286, W + (H - W) * 0.62], [308, H], [336, H - 1], [620, H + 14]];
  m.sideX = (y) => interp(m.side, y);
  const ank = b.sex === 'm' ? 19 : 17;
  m.legO = [[300, H], [336, H - 1], [380, T + 10], [440, T * 0.75 + 9], [490, T * 0.8 + 10], [532, ank], [560, ank]];
  m.legI = [[300, 1], [336, 1], [380, 3], [440, 5], [490, 6], [532, 8], [560, 8]];
  m.legOut = (y) => interp(m.legO, y);
  m.legIn = (y) => interp(m.legI, y);
  // Lengan kiri (setengah lebar dari tengah): sisi luar & dalam per ketinggian
  m.armO = [[170, S - 3], [186, S + 1.5], [222, S + 4], [262, S + 5.5], [298, S + 6.5], [330, S + 7], [352, S + 7]];
  m.armI = [[200, S + 1.5 - 2.1 * A], [226, S + 4 - 1.85 * A], [262, S + 5.5 - 1.6 * A], [298, S + 6.5 - 1.4 * A], [330, S + 7 - 1.25 * A], [352, S + 7 - 1.25 * A]];
  m.armOut = (y) => interp(m.armO, y);
  m.armIn = (y) => interp(m.armI, y);
  m.hand = { x: CX - (S + 7 - 0.62 * A), y: 330, w: A * 0.68 };
  return m;
}

// ───────────── Latar ─────────────
function backdrop(cfg, full, lite) {
  const w = BG[cfg.bg];
  const f = lite ? '' : ' filter="url(#wash)"';
  let s = `<rect x="-200" y="-20" width="600" height="620" fill="${PAPER}"/>`
    + `<path d="M118,-12 C160,14 214,30 212,84 L212,136 C176,126 146,108 118,86 C92,66 66,28 44,-12 Z" fill="${w}"${f}/>`
    + `<path d="M-12,118 C14,126 34,152 44,212 L-12,212 Z" fill="${w}" opacity=".75"${f}/>`;
  if (full) {
    s += `<path d="M-20,330 C30,300 70,360 120,330 C160,306 200,330 230,310 L230,600 L-20,600 Z" fill="${w}" opacity=".45"${f}/>`
      + `<ellipse cx="100" cy="561" rx="52" ry="6" fill="${INK}" opacity=".08"/>`
      + `<g opacity=".28">${LINE('M178,196 C176,160 180,120 172,84 M176,140 C184,132 190,134 192,126 M174,112 C166,104 160,106 156,98 M184,196 C186,170 190,150 196,132', 0.9)}`
      + `<circle cx="172" cy="80" r="5" fill="none" stroke="${INK}" stroke-width=".9"/><circle cx="196" cy="128" r="4" fill="none" stroke="${INK}" stroke-width=".9"/></g>`
      + `<g opacity=".22">${LINE('M24,30 l1.4,4 4,1.4 -4,1.4 -1.4,4 -1.4,-4 -4,-1.4 4,-1.4 Z M40,62 l1,2.6 2.6,1 -2.6,1 -1,2.6 -1,-2.6 -2.6,-1 2.6,-1 Z M22,420 l1.2,3.4 3.4,1.2 -3.4,1.2 -1.2,3.4 -1.2,-3.4 -3.4,-1.2 3.4,-1.2 Z M180,380 l1,2.6 2.6,1 -2.6,1 -1,2.6 -1,-2.6 -2.6,-1 2.6,-1 Z', 0.9)}</g>`;
  }
  return s;
}

// ───────────── Badan (kulit) ─────────────
function legsSvg(m, skin, skinD) {
  const outer = [300, 336, 380, 440, 490, 532].map((y) => [CX - m.legOut(y), y]);
  const inner = [532, 490, 440, 380, 336].map((y) => [CX - m.legIn(y), y]);
  const d = `M${pt(outer[0])}${through(outer)} L${pt(inner[0])}${through(inner)} L${CX - 1},300 Z`;
  const knee = LINE(`M${r1(CX - m.legOut(436) + 5)},437 q4,3 8,0`, 0.8, 0.45);
  const foot = footPath(m);
  return BOTH(SHAPE(d, skin, 1, 0.7) + knee + SHAPE(foot, skin, 0.9, 0.7))
    + FILL(`M${CX - 4},300 L${CX + 4},300 L${CX + 2},338 L${CX - 2},338 Z`, skin);
}
/** Kaki kiri (telapak) – dipakai juga sebagai dasar sepatu. */
function footPath(m, grow = 0) {
  const k = m.sex === 'm' ? 1.15 : 1;
  const o = 17 * k + grow, i = 8 - grow * 0.6;
  return `M${r1(CX - o)},530 C${r1(CX - o - 1)},540 ${r1(CX - o - 7 * k - grow)},549 ${r1(CX - o - 6 * k - grow)},${r1(556 + grow * 0.5)} Q${r1(CX - o + 1)},${r1(561 + grow)} ${r1(CX - i - 1)},${r1(558 + grow * 0.6)} C${r1(CX - i + 1)},552 ${r1(CX - i + 1)},540 ${r1(CX - i)},530 Z`;
}

function torsoSkin(m, skin, skinD) {
  const pts = [[158, m.nk], [168, m.S * 0.72], [177, m.S], [200, m.B + 1], [214, m.B], [262, m.W], [308, m.H], [338, m.H - 1]];
  const L = pts.map(([y, x]) => [CX - x, y]);
  const R = pts.slice().reverse().map(([y, x]) => [CX + x, y]);
  const d = `M${pt(L[0])}${through(L)} L${pt(R[0])}${through(R)} Z`;
  return FILL(d, skin) + LINE(through(L).replace(/^ C/, `M${pt(L[0])} C`), 1, 0.6) + LINE(through(R).replace(/^ C/, `M${pt(R[0])} C`), 1, 0.6)
    + LINE('M80,171 Q89,168 96,172 M104,172 Q111,168 120,171', 0.8, 0.4)
    + (m.sex === 'f' ? LINE(`M${CX - m.B + 6},226 Q${CX - m.B / 2},234 ${CX - 3},226 M${CX + 3},226 Q${CX + m.B / 2},234 ${CX + m.B - 6},226`, 0.8, 0.35) : '')
    + LINE(`M${CX},250 q-1,3 0,5`, 0.8, 0.35);
}

function armSvg(m, skin) {
  const o = [170, 186, 222, 262, 298, 332].map((y) => [CX - m.armOut(y), y]);
  const i = [332, 298, 262, 226, 200].map((y) => [CX - m.armIn(y), y]);
  const d = `M${pt(o[0])}${through(o)} L${pt(i[0])}${through(i)} Q${CX - m.S + 6},186 ${pt(o[0])} Z`;
  return BOTH(SHAPE(d, skin, 1, 0.7) + LINE(`M${r1(CX - m.armIn(262) - 2)},262 q2,2 4,0`, 0.7, 0.35));
}

function handSvg(m, skin) {
  const { x, y, w } = m.hand;
  const d = `M${r1(x - w)},${y - 2} C${r1(x - w - 1.5)},${y + 8} ${r1(x - w)},${y + 17} ${r1(x - w * 0.15)},${y + 20} C${r1(x + w * 0.5)},${y + 21} ${r1(x + w + 0.5)},${y + 13} ${r1(x + w)},${y - 2} Z`;
  return BOTH(SHAPE(d, skin, 0.9, 0.7) + LINE(`M${r1(x + w * 0.85)},${y + 4} q2.4,5 0.4,9`, 0.8, 0.6) + LINE(`M${r1(x - w * 0.3)},${y + 12} l0,6 M${r1(x + w * 0.2)},${y + 12} l0,6`, 0.6, 0.35));
}

// ───────────── Wajah ─────────────
const HEADS = {
  oval: 'M70,82 C69,56 83,42 100,42 C117,42 131,56 130,82 C130,100 123,116 111,127 C106,131 94,131 89,127 C77,116 70,100 70,82 Z',
  persegi: 'M68,80 C68,54 82,40 100,40 C118,40 132,54 132,80 C132,98 129,111 121,121 C114,129 107,133 100,133 C93,133 86,129 79,121 C71,111 68,98 68,80 Z',
  bulat: 'M68,84 C68,56 82,42 100,42 C118,42 132,56 132,84 C132,108 120,128 100,129 C80,128 68,108 68,84 Z',
  hati: 'M68,80 C68,54 82,42 100,42 C118,42 132,54 132,80 C132,96 124,110 112,122 C107,127 103,131 100,131 C97,131 93,127 88,122 C76,110 68,96 68,80 Z',
  panjang: 'M71,82 C70,54 84,40 100,40 C116,40 130,54 129,82 C129,104 124,122 112,132 C107,136 93,136 88,132 C76,122 71,104 71,82 Z',
  berlian: 'M72,80 C72,56 86,42 100,42 C114,42 128,56 128,80 C132,92 130,104 120,118 C112,128 106,131 100,131 C94,131 88,128 80,118 C70,104 68,92 72,80 Z',
};
const JAWS = {
  oval: 'M70.5,88 C72,104 79,117 90,127.5 Q100,132 110,127.5 C121,117 128,104 129.5,88',
  persegi: 'M68.5,86 C69,101 73,112 80,121.5 Q90,133 100,133 Q110,133 120,121.5 C127,112 131,101 131.5,86',
  bulat: 'M68.5,88 C70,108 82,128 100,129 C118,128 130,108 131.5,88',
  hati: 'M68.5,86 C70,98 77,110 88,122 Q100,134 112,122 C123,110 130,98 131.5,86',
  panjang: 'M71.5,88 C72,106 77,122 88,132 Q100,138 112,132 C123,122 128,106 128.5,88',
  berlian: 'M71,84 C69,94 71,106 80,118 Q100,136 120,118 C129,106 131,94 129,84',
};

function quadPt(p0, c, p2, t) {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p2[1]];
}

const EYE_SHAPES = {
  tajam: { lid: 7.4, low: 4.4, outY: -1.6, inX: 8, outX: 9.5, r: 3.7, crease: true },
  sayu: { lid: 4.4, low: 4.4, outY: -1.6, inX: 8, outX: 9.5, r: 3.7, crease: true, heavy: true },
  bulat: { lid: 9.4, low: 6, outY: -0.6, inX: 7.5, outX: 8.6, r: 4.3, crease: true },
  monolid: { lid: 5.4, low: 3.2, outY: -1.4, inX: 8, outX: 9.5, r: 3.4, crease: false },
  turun: { lid: 7, low: 4.4, outY: 1.4, inX: 8, outX: 9.2, r: 3.7, crease: true },
  kucing: { lid: 6.6, low: 3.6, outY: -4, inX: 8, outX: 10, r: 3.5, crease: true },
};

function eye(cx, cy, dir, cfg, closed) {
  const mk = cfg.mk;
  const fem = cfg.sex === 'f';
  const sh = EYE_SHAPES[cfg.eyes] || EYE_SHAPES.tajam;
  const ec = EYE_COLORS[cfg.eyeColor].c;
  const inX = cx - dir * sh.inX, outX = cx + dir * sh.outX;
  const lw = { none: fem ? 1.6 : 1.4, tipis: 1.9, sayap: 2.3, kucing: 2.6, smoky: 2.5 }[mk.liner];
  const lashN = { none: 0, natural: 2, lentik: 3, dramatis: 5 }[mk.lashes];
  const lashes = (p0, c, p2) => Array.from({ length: lashN }, (_, i) => {
    const t = 0.45 + (i / Math.max(1, lashN - 1)) * 0.47;
    const [x, y] = quadPt(p0, c, p2, lashN === 1 ? 0.8 : t);
    const len = (mk.lashes === 'dramatis' ? 3.4 : 2.4) + i * 0.4;
    return LINE(`M${r1(x)},${r1(y)} q${r1(dir * 0.6)},-1.4 ${r1(dir * len * 0.6)},${r1(-len)}`, mk.lashes === 'dramatis' ? 1.2 : 0.9);
  }).join('');
  const shadow = mk.shadow !== 'none' ? mk.shadow : null;
  if (closed) {
    const p0 = [inX, cy - 0.5], c = [cx, cy - 4.8], p2 = [outX, cy - 1];
    return (shadow ? FILL(`M${pt(p0)} Q${pt(c)} ${pt(p2)} Q${cx},${cy - 11} ${pt(p0)} Z`, shadow, 0.4) : '')
      + LINE(`M${pt(p0)} Q${pt(c)} ${pt(p2)}`, lw) + lashes(p0, c, p2)
      + LINE(`M${inX + dir},${cy - 5} Q${cx},${cy - 9} ${outX - dir},${cy - 5.5}`, 0.8, 0.45);
  }
  const lid = cy - sh.lid, outY = cy + sh.outY;
  const p0 = [inX, cy], c = [cx, lid], p2 = [outX, outY];
  const white = `M${pt(p0)} Q${pt(c)} ${pt(p2)} Q${cx + dir},${cy + sh.low} ${pt(p0)} Z`;
  const clip = `tge${++uid}`;
  const sc = shadow || (fem ? '#B48583' : null);
  const so = shadow ? (mk.liner === 'smoky' ? 0.55 : 0.42) : 0.22;
  const wingLen = { none: 0, tipis: 0, sayap: 3.8, kucing: 6.4, smoky: 2.6 }[mk.liner];
  return (sc ? FILL(`M${pt(p0)} Q${pt(c)} ${pt(p2)} Q${cx},${lid - 7} ${pt(p0)} Z`, sc, so) : '')
    + (mk.liner === 'smoky' ? FILL(`M${inX + dir},${cy + 1} Q${cx},${cy + sh.low + 3.5} ${outX},${outY + 0.5} Q${cx},${cy + sh.low + 0.5} ${inX + dir},${cy + 1} Z`, shadow || '#6F5352', 0.4) : '')
    + `<clipPath id="${clip}"><path d="${white}"/></clipPath>`
    + FILL(white, '#FBF6F2')
    + `<g clip-path="url(#${clip})"><circle cx="${cx + dir * 0.6}" cy="${cy - 0.6}" r="${sh.r}" fill="${ec}"/><circle cx="${cx + dir * 0.6}" cy="${cy - 0.6}" r="${r1(sh.r * 0.46)}" fill="#221B1D"/><circle cx="${r1(cx + dir * 0.6 - 1.2)}" cy="${cy - 1.9}" r="0.9" fill="#fff"/>`
    + LINE(`M${inX},${cy - 0.4} Q${cx},${lid + 1.2} ${outX},${outY - 0.3}`, 1.6, 0.35) + '</g>'
    + LINE(`M${pt(p0)} Q${pt(c)} ${pt(p2)}`, lw)
    + (wingLen ? LINE(`M${pt(p2)} l${r1(dir * wingLen)},${r1(-wingLen * 0.62)}`, lw * 0.85) : '')
    + LINE(`M${inX + dir},${cy + 0.9} Q${cx},${cy + sh.low} ${outX - dir * 0.6},${outY + 0.8}`, 0.8, mk.liner === 'smoky' ? 0.85 : 0.5)
    + (sh.crease ? LINE(`M${inX + dir},${cy - 3.4} Q${cx},${lid - 4.6} ${outX - dir * 0.5},${outY - 2.6}`, 0.8, 0.5) : '')
    + lashes(p0, c, p2);
}

const BROWS = {
  melengkung: ['M77,81 Q84,74.5 95,78.5', 0],
  lurus: ['M77,80 Q86,78 95,79', 0],
  tebal: ['M77,81 Q84,75 95,78.5', 1.2],
  tipis: ['M78,80.5 Q85,75.5 94,78.5', -0.6],
  tegas: ['M77,80 L88,76 L95,78.5', 0.3],
  lembut: ['M77,80 Q85,76.5 95,79.5', 0.2],
};
function browsSvg(cfg, hc) {
  const bc = lum(hc) > 0.55 ? shade(hc, 0.5) : shade(hc, 0.15);
  const [d, extra] = BROWS[cfg.brows] || BROWS.melengkung;
  const w = (cfg.sex === 'm' ? 2.4 : 1.6) + extra;
  const browUp = cfg.expr === 'kaget' ? -2.5 : 0;
  const g = LINE(d, w, 0.95, bc);
  return `<g transform="translate(0 ${browUp})">${g}${MIRROR(g)}</g>`;
}

const NOSES = {
  lurus: ['M101.5,93 C100.8,98.5 99.5,102 97.8,104.5', 'M97.8,105.2 Q100.2,106.6 102.8,105.2'],
  kecil: ['M100.4,98 C100,101 99.2,103 98.4,104.4', 'M98.4,105 Q100.2,106 102,105'],
  lebar: ['M101.5,92 C101,98 100,101.5 98,104', 'M95.6,104.2 Q97,107.4 100,106.6 Q103,107.4 104.4,104.2'],
  runcing: ['M101.6,90 C101.2,97 99.6,102.5 96.6,105.2', 'M96.8,105.6 Q99,106.6 102.4,105.4'],
  bulat: ['M101.2,93 C100.6,98 100.4,100.5 99.6,102.4', 'M96.6,103.6 C96,108.2 104,108.2 103.4,103.6'],
};
function noseSvg(cfg) {
  const [a, b] = NOSES[cfg.nose] || NOSES.lurus;
  const s = cfg.sex === 'm' ? ' transform="translate(-5 -5.5) scale(1.05)"' : '';
  return `<g${s}>${LINE(a, 1, 0.72)}${LINE(b, 1, 0.75)}</g>`;
}

const LIPS = {
  penuh: { w: 8, up: 112.4, low: 122 }, tipis: { w: 8, up: 113.6, low: 119.4 }, hati: { w: 7.5, up: 111.2, low: 121.2, cupid: true },
  lebar: { w: 10, up: 112.8, low: 121 }, kecil: { w: 6, up: 112.8, low: 120.4 }, bawah: { w: 8, up: 113.4, low: 123 },
};
function mouthSvg(cfg, skin) {
  const mk = cfg.mk;
  const fem = cfg.sex === 'f';
  const L = { ...(LIPS[cfg.lips] || LIPS.penuh) };
  if (cfg.expr === 'manyun') { L.w -= 1.6; L.low += 1; }
  const lip = mk.lipColor === 'auto' ? shade(skin, 0.2) : mk.lipColor;
  const lipOp = mk.lipColor === 'auto' ? (fem ? 0.85 : 0.55) : mk.lipFinish === 'tint' ? 0.8 : 1;
  const w = L.w;
  const dip = L.cupid ? 114.3 : 113.9;
  const upper = `M${100 - w},116 Q${100 - w / 2},${L.up} 100,${dip} Q${100 + w / 2},${L.up} ${100 + w},116 Q100,117 ${100 - w},116 Z`;
  const lower = `M${100 - w},116 Q100,117 ${100 + w},116 Q${100 + w * 0.55},${L.low} 100,${L.low} Q${100 - w * 0.55},${L.low} ${100 - w},116 Z`;
  const fin = mk.lipFinish;
  let lips = FILL(upper, shade(lip, fin === 'matte' ? 0.18 : 0.1), lipOp) + FILL(lower, fin === 'matte' ? shade(lip, 0.06) : lip, lipOp);
  if (fin === 'tint') lips += FILL(`M${100 - w * 0.5},116 Q100,${L.low - 1.6} ${100 + w * 0.5},116 Z`, shade(lip, 0.15), 0.7);
  if (fin === 'gloss') lips += `<path d="M${100 - w * 0.35},${L.low - 2.4} Q100,${L.low - 1.3} ${100 + w * 0.35},${L.low - 2.4}" stroke="#fff" stroke-width="1.6" fill="none" opacity=".8" stroke-linecap="round"/><circle cx="${100 + w * 0.45}" cy="${L.up + 1.6}" r=".7" fill="#fff" opacity=".8"/>`;
  else if (fin === 'satin' && mk.lipColor !== 'auto') lips += `<path d="M97,${L.low - 2.2} Q100,${L.low - 1.3} 103,${L.low - 2.2}" stroke="#fff" stroke-width="1" fill="none" opacity=".45" stroke-linecap="round"/>`;
  const dy = fem ? 0 : 2;
  let out;
  switch (cfg.expr) {
    case 'tertawa':
      out = FILL('M90.5,113.5 Q100,111.5 109.5,113.5 Q106.5,123.5 100,124 Q93.5,123.5 90.5,113.5 Z', '#6E3A40')
        + FILL('M92.5,114.3 Q100,113.4 107.5,114.3 L106.6,117 Q100,118 93.4,117 Z', '#FBF6F2')
        + LINE('M90.5,113.5 Q100,111.5 109.5,113.5 Q106.5,123.5 100,124 Q93.5,123.5 90.5,113.5 Z', 1.5, 0.85, mk.lipColor === 'auto' ? INK : lip);
      break;
    case 'kaget':
      out = `<ellipse cx="100" cy="117" rx="3.6" ry="4.6" fill="#6E3A40"/><ellipse cx="100" cy="117" rx="4.6" ry="5.6" fill="none" stroke="${lip}" stroke-width="2"/>`;
      break;
    case 'senyum': case 'kedip': case 'mata-senyum': out = lips + LINE(`M${100 - w - 1.2},114.6 Q100,118.4 ${100 + w + 1.2},114.6`, 1.1); break;
    case 'smirk': out = lips + LINE(`M${100 - w},116.3 Q100,117.4 ${100 + w + 1.2},113.6`, 1.1); break;
    case 'manyun': out = lips + LINE(`M${100 - w + 0.5},116.2 Q100,115 ${100 + w - 0.5},116.2`, 1.1); break;
    default: out = lips + LINE(`M${100 - w - 0.4},115.9 Q100,117.3 ${100 + w + 0.4},115.9`, 1.1);
  }
  return dy ? `<g transform="translate(0 ${dy})">${out}</g>` : out;
}

function makeupFace(cfg, skin) {
  const mk = cfg.mk;
  const skinD = shade(skin, 0.18);
  let s = '';
  if (mk.contour) s += BOTH(FILL('M72,90 C74,100 79,110 86,116 L88,113 C83,106 79,98 77,90 Z', skinD, 0.35)) + FILL('M98.4,90 L98.8,101 M101.6,90 L101.2,101', 'none');
  const bc = mk.blushColor;
  const bo = cfg.sex === 'f' ? 0.42 : 0.28;
  switch (mk.blush) {
    case 'lembut': s += `<ellipse cx="81" cy="105" rx="7.5" ry="3.4" fill="${bc}" opacity="${bo}"/><ellipse cx="119" cy="105" rx="7.5" ry="3.4" fill="${bc}" opacity="${bo}"/>`; break;
    case 'apel': s += `<circle cx="82" cy="104" r="5.6" fill="${bc}" opacity="${bo + 0.1}"/><circle cx="118" cy="104" r="5.6" fill="${bc}" opacity="${bo + 0.1}"/>`; break;
    case 'sunkissed': s += FILL('M74,103 Q86,98 100,101 Q114,98 126,103 Q114,108 100,104.5 Q86,108 74,103 Z', bc, bo); break;
    case 'draping': s += BOTH(FILL('M74,108 C72,100 74,90 80,84 C84,92 86,100 86,106 Z', bc, bo)); break;
    default:
  }
  if (mk.highlight) s += BOTH(LINE('M78,98 Q83,96 88,98', 1.6, 0.5, '#FFFFFF')) + LINE('M100.6,94 L100.4,100', 1.2, 0.45, '#FFFFFF') + LINE('M98.6,111.6 Q100,110.8 101.4,111.6', 1, 0.5, '#FFFFFF');
  if (mk.freckles !== 'none') {
    const pts = [[86, 101], [89, 103], [84, 104], [92, 100.5], [108, 100.5], [111, 103], [114, 101], [116, 104], [96, 99], [104, 99]];
    const n = mk.freckles === 'banyak' ? 10 : 6;
    s += pts.slice(0, n).map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".75" fill="${shade(skin, 0.42)}" opacity=".7"/>`).join('');
  }
  const markAt = { pipi: [112, 108.5], bibir: [108.4, 112.2], mata: [118, 96] }[mk.mark];
  if (markAt) s += `<circle cx="${markAt[0]}" cy="${markAt[1]}" r="1" fill="${INK}"/>`;
  if (mk.glitter) s += [[76, 92], [124, 92], [79, 98], [121, 98], [100, 82]].map(([x, y], i) => `<path d="M${x},${y - 1.6} L${x + 0.5},${y - 0.5} L${x + 1.6},${y} L${x + 0.5},${y + 0.5} L${x},${y + 1.6} L${x - 0.5},${y + 0.5} L${x - 1.6},${y} L${x - 0.5},${y - 0.5} Z" fill="${i % 2 ? '#E8D29A' : '#FFFFFF'}" opacity=".9"/>`).join('');
  return s;
}

function faceSvg(cfg, skin, hc) {
  const skinD = shade(skin, 0.14);
  const closedBoth = cfg.expr === 'mata-senyum';
  const head = HEADS[cfg.face] || HEADS.oval;
  return FILL(head, skin)
    + FILL('M70.5,86 C72,103 79,116 90,127 L93,126 C84,114 79,100 77,86 Z', skinD, 0.35)
    + LINE(JAWS[cfg.face] || JAWS.oval, 1.1, 0.85)
    + makeupFace(cfg, skin)
    + eye(86, 90, -1, cfg, closedBoth) + eye(114, 90, 1, cfg, closedBoth || cfg.expr === 'kedip')
    + browsSvg(cfg, hc) + noseSvg(cfg) + mouthSvg(cfg, skin);
}

export { geometry, backdrop, legsSvg, footPath, torsoSkin, armSvg, handSvg, faceSvg, through, interp, MIRROR, BOTH, C, pt, r1, GOLD, PEARL, CX, PAPER };
export const nextId = (p) => `${p}${++uid}`;
export { getItem, SKIN };
