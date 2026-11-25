// Rambut v2: setiap gaya disusun dari "helaian" (lock): bentuk meruncing yang mengikuti
// garis tengah melengkung, diberi bayangan, garis helai, dan kilau. Lapisan:
//   back  – massa rambut di balik kepala & tubuh (warna lebih gelap)
//   side  – helai di depan bahu, di belakang wajah
//   front – mahkota, poni, dan helai pembingkai wajah (di atas wajah)

import { FILL, LINE, shade, lighten, lum, through, MIRROR, r1, INK } from './avatarRender.js';

// ───────────── Alat dasar ─────────────
function catmull(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return [0, 1].map((i) => 0.5 * ((2 * p1[i]) + (-p0[i] + p2[i]) * t + (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * t2 + (-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * t3));
}
function spline(pts, per = 5) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    for (let s = 0; s < per; s++) out.push(catmull(p0, p1, p2, p3, s / per));
  }
  out.push(pts[pts.length - 1]);
  return out;
}
const P = ([x, y]) => `${r1(x)},${r1(y)}`;
const pathThrough = (pts) => (pts.length > 1 ? `M${P(pts[0])}${through(pts)}` : "M0,0");

/** Profil lebar helai: mulai agak sempit, melebar, lalu meruncing ke ujung. */
const widthAt = (t, w0, start = 0.7, taper = 2.2) => w0 * (start + (1 - start) * Math.sin(Math.min(1, t * 2.4) * Math.PI / 2)) * (1 - Math.pow(t, taper));

/** Titik tepi helai (kiri & kanan) dari garis tengah. */
function lockGeom(pts, w0, o = {}) {
  const c = spline(pts, o.per || 5);
  const n = c.length;
  const L = [], R = [], W = [], N = [];
  for (let i = 0; i < n; i++) {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const len = Math.hypot(tx, ty) || 1; tx /= len; ty /= len;
    const nx = -ty, ny = tx;
    const t = i / (n - 1);
    const w = widthAt(t, w0, o.start ?? 0.7, o.taper ?? 2.2) / 2;
    W.push(w); N.push([nx, ny]);
    L.push([c[i][0] + nx * w, c[i][1] + ny * w]);
    R.push([c[i][0] - nx * w, c[i][1] - ny * w]);
  }
  return { c, L, R, W, N, n };
}
const pick = (arr, k) => arr.filter((_, i) => i % k === 0 || i === arr.length - 1);

function lockPath(g) {
  const L = pick(g.L, 2), R = pick(g.R, 2).reverse();
  return `M${P(L[0])}${through(L)}${through(R)} Z`;
}

/** Garis helai di dalam sebuah lock (offset dari garis tengah, -1..1). */
function lockLine(g, off, t0 = 0.08, t1 = 0.88) {
  const pts = [];
  for (let i = Math.floor(t0 * (g.n - 1)); i <= Math.ceil(t1 * (g.n - 1)); i++) {
    const [nx, ny] = g.N[i];
    pts.push([g.c[i][0] + nx * g.W[i] * off, g.c[i][1] + ny * g.W[i] * off]);
  }
  return pts.length > 1 ? pathThrough(pick(pts, 2)) : '';
}

function kit(c) {
  const dark = lum(c) < 0.25;
  return {
    c,
    d: shade(c, dark ? 0.1 : 0.2),         // massa belakang
    dd: shade(c, dark ? 0.2 : 0.34),       // bayangan terdalam
    st: dark ? lighten(c, 0.22) : shade(c, lum(c) > 0.6 ? 0.42 : 0.5), // garis helai
    hl: lighten(c, lum(c) > 0.6 ? 0.55 : dark ? 0.32 : 0.34),          // kilau
  };
}

/** Gambar satu helai lengkap. tone: 'c' (depan) | 'd' (belakang). */
function lock(k, pts, w0, o = {}) {
  const g = lockGeom(pts, w0, o);
  const d = lockPath(g);
  const fill = o.tone === 'd' ? k.d : o.tone === 'dd' ? k.dd : k.c;
  let s = FILL(d, fill) + LINE(d, 0.7, o.edge ?? 0.38);
  if (o.lines !== false) {
    s += LINE(lockLine(g, -0.3, 0.12, 0.82), 0.75, 0.5, k.st);
    if (o.lines !== 1) s += LINE(lockLine(g, 0.3, 0.2, 0.7), 0.65, 0.4, k.st);
  }
  if (o.shine !== false && o.tone !== 'd' && o.tone !== 'dd') s += LINE(lockLine(g, 0.05, o.shine0 ?? 0.06, o.shine1 ?? 0.38), 1.8, 0.5, k.hl);
  return s;
}
const locks = (k, list) => list.map(([pts, w, o]) => lock(k, pts, w, o)).join('');
const mirrorPts = (pts) => pts.map(([x, y]) => [200 - x, y]);
const pair = (k, pts, w, o) => lock(k, pts, w, o) + lock(k, mirrorPts(pts), w, o);

/** Mahkota: menutup atas kepala. `inner` = garis rambut dari pelipis kanan ke kiri (perintah path). */
function crown(k, inner, o = {}) {
  const top = o.top ?? 27, side = o.side ?? 64, low = o.low ?? 92;
  const d = `M${side},${low} C${side - 4},${top + 26} ${78},${top + 1} 100,${top} C122,${top + 1} ${200 - side + 4},${top + 26} ${200 - side},${low} ${inner} Z`;
  return FILL(d, k.c) + LINE(d, 0.8, 0.5)
    + LINE(`M${side + 6},${low - 18} C${side + 6},${top + 26} 84,${top + 6} 100,${top + 5}`, 2.6, 0.45, k.hl)
    + LINE(`M${side + 12},${low - 28} C${side + 14},${top + 30} 88,${top + 12} 100,${top + 10}`, 0.8, 0.5, k.st)
    + LINE(`M${200 - side - 12},${low - 28} C${200 - side - 14},${top + 30} 112,${top + 12} 100,${top + 10}`, 0.8, 0.5, k.st);
}

/** Awan bergelombang (ikal/afro/sanggul). */
function cloud(cx, cy, rx, ry, n, bump, rot = 0) {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const a = rot + (i / n) * Math.PI * 2;
    const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
    if (i === 0) d = `M${r1(x)},${r1(y)}`;
    else d += ` A${r1(bump)},${r1(bump)} 0 0 1 ${r1(x)},${r1(y)}`;
  }
  return d + ' Z';
}
const curlMarks = (k, list) => list.map(([x, y, s = 1]) => LINE(`M${r1(x - 3 * s)},${r1(y)} c0,-${r1(4 * s)} ${r1(6 * s)},-${r1(4 * s)} ${r1(6 * s)},0 c0,${r1(3 * s)} -${r1(4 * s)},${r1(3 * s)} -${r1(4 * s)},${r1(1 * s)}`, 0.8, 0.6, k.st)).join('');

// ───────────── Massa belakang ─────────────
/**
 * Siluet rambut panjang di balik kepala: kubah halus, sisi yang sedikit mengembang,
 * dan ujung bawah berupa beberapa ujung helai yang meruncing.
 */
function backMass(k, len = 250, { wave = 0, spread = 10, tips = 7, top = 24, side = 63, dip = 9 } = {}) {
  const xL = (y) => side - spread * Math.min(1, (y - 92) / 110) + (wave ? Math.sin(y / 17) * wave : 0) + (y > len - 30 ? (y - (len - 30)) * 0.15 : 0);
  const ys = []; for (let y = 104; y < len - 4; y += 18) ys.push(y);
  const left = ys.map((y) => [xL(y), y]);
  const right = ys.map((y) => [200 - xL(y) + (wave ? Math.sin(y / 17) * wave * 2 : 0), y]);
  const bl = [xL(len), len], br = [200 - xL(len), len];
  let tipsSeg = '';
  for (let i = 1; i <= tips; i++) {
    const x = br[0] + ((bl[0] - br[0]) * i) / tips;
    const xm = br[0] + ((bl[0] - br[0]) * (i - 0.5)) / tips;
    const dd = i % 2 ? dip : dip * 0.45;
    tipsSeg += ` Q${r1(xm)},${r1(len + dd)} ${r1(x)},${r1(len - 3)}`;
  }
  const d = `M${side},92 C${side - 4},${top + 26} 78,${top} 100,${top} C122,${top} ${200 - side + 4},${top + 26} ${200 - side},92`
    + `${through([[200 - side, 92], ...right, br])}${tipsSeg}${through([[bl[0], len - 3], ...left.slice().reverse(), [side, 92]])} Z`;
  const lines = [[-14, 0.7], [-26, 0.6], [14, 0.7], [26, 0.6], [0, 0.5]].map(([dx, op]) => {
    const pts = []; for (let y = 120; y < len - 6; y += 22) pts.push([100 + dx * (1 + (y - 120) / 220) + (wave ? Math.sin(y / 17 + dx) * wave : 0), y]);
    return LINE(pathThrough(pts), 0.8, op * 0.6, k.dd);
  }).join('');
  return FILL(d, k.d) + LINE(d, 0.7, 0.4) + FILL(`M80,120 Q100,112 120,120 L118,${len - 20} Q100,${len - 10} 82,${len - 20} Z`, k.dd, 0.35) + lines;
}

/** Helai panjang di depan bahu (lapisan side), dua lapis tiap sisi. */
function sideLong(k, len = 248, wave = 0) {
  const wv = (y, ph) => (wave ? Math.sin(y / 16 + ph) * wave : 0);
  const A = [[76, 90], [70, 118], [66 + wv(150, 0), 150], [64 + wv(190, 0), 190], [66 + wv(225, 0), 225], [71, len]];
  const B = [[72, 84], [64, 114], [60 + wv(156, 1.5), 156], [58 + wv(200, 1.5), 200], [60, len - 14]];
  const o = { start: 0.75, taper: 2.4, shine0: 0.08, shine1: 0.3, lines: 1 };
  return lock(k, B, 15, { ...o, tone: 'd' }) + lock(k, mirrorPts(B), 15, { ...o, tone: 'd' })
    + lock(k, A, 21, o) + lock(k, mirrorPts(A), 21, o);
}

// ───────────── Bagian depan ─────────────
/** Poni: blok dengan tepi bawah bergerigi halus (rata) atau helai tipis terpisah (tipis). */
function bangs(k, y, kind) {
  if (kind === 'wispy') {
    return [[82, 4], [90, 7], [97, 3], [104, 7], [111, 4], [118, 6]].map(([x, dy], i) => lock(k, [[100 + (x - 100) * 0.3, 36], [x - 1, 52], [x + (i % 2 ? 2 : -2), y + dy - 4]], 8, { start: 1, taper: 1.5, lines: false, shine0: 0.25, shine1: 0.6, edge: 0.25 })).join('')
      + LINE('M80,62 q2,6 1,12 M120,62 q-2,6 -1,12', 0.7, 0.5, k.st);
  }
  let edge = '';
  const xs = [128, 121, 114, 107, 100, 93, 86, 79, 72];
  for (let i = 1; i < xs.length; i++) edge += ` Q${(xs[i - 1] + xs[i]) / 2},${y + (i % 2 ? 4 : 2)} ${xs[i]},${y - (i % 3 === 0 ? 1 : 0)}`;
  const d = `M70,${y - 4} C70,46 84,36 100,36 C116,36 130,46 130,${y - 4} L128,${y}${edge} L70,${y - 4} Z`;
  return FILL(d, k.c) + LINE(d, 0.7, 0.4)
    + [80, 88, 96, 104, 112, 120].map((x, i) => LINE(`M${100 + (x - 100) * 0.5},40 Q${x},${y - 20} ${x + (i % 2 ? 1 : -1)},${y - 2}`, 0.75, 0.5, k.st)).join('')
    + LINE(`M78,48 Q100,40 122,48`, 2.4, 0.45, k.hl);
}

const HAIRLINE = {
  center: 'C134,72 124,54 106,46 Q100,44 94,46 C76,54 66,72 64,92',
  side: 'C134,72 126,56 114,48 C100,48 82,56 70,74 Q66,82 64,92',
  high: 'C134,70 126,52 112,48 Q100,46 88,48 C74,52 66,70 64,92',
};

function frontLong(k, kind) {
  switch (kind) {
    case 'center': return crown(k, HAIRLINE.center)
      + pair(k, [[99, 34], [86, 46], [74, 64], [69, 88], [69, 112]], 17, { start: 0.85, taper: 2.4 });
    case 'sweep': return crown(k, HAIRLINE.side)
      + lock(k, [[114, 32], [96, 40], [80, 52], [71, 72], [68, 96], [69, 114]], 22, { start: 0.85, taper: 2.4 })
      + lock(k, [[116, 34], [126, 46], [131, 66], [132, 92], [131, 112]], 15, { start: 0.85, taper: 2.4 })
      + LINE('M114,32 Q106,36 100,42', 0.8, 0.5, k.dd);
    case 'curtain': return crown(k, HAIRLINE.center)
      + pair(k, [[99, 34], [90, 44], [84, 56], [80, 72], [74, 90], [70, 106]], 15, { start: 0.9, taper: 2 })
      + pair(k, [[96, 40], [90, 50], [86, 62], [82, 74]], 9, { start: 1, taper: 1.6, lines: false, shine0: 0.1, shine1: 0.5 });
    case 'blunt': return crown(k, HAIRLINE.high, { low: 94 }) + bangs(k, 70, 'blunt')
      + pair(k, [[76, 56], [69, 80], [68, 108]], 13, { start: 0.9, taper: 2, lines: 1 });
    case 'wispy': return crown(k, HAIRLINE.high) + bangs(k, 72, 'wispy')
      + pair(k, [[86, 40], [74, 60], [69, 86], [70, 110]], 15, { start: 0.85, taper: 2.3, lines: 1 });
    default: return '';
  }
}

function frontMore(k, kind, sex) {
  const burns = sex === 'm' ? pair(k, [[70, 72], [69, 86], [70, 100]], 5, { start: 1, taper: 3, lines: false, shine: false }) : '';
  switch (kind) {
    case 'sleek': return crown(k, HAIRLINE.high, { top: 29 })
      + [[-22, 0.5], [-10, 0.55], [4, 0.55], [18, 0.5]].map(([dx, op]) => LINE(`M${100 + dx * 1.2},50 Q${100 + dx},38 ${100 + dx * 0.4},30`, 0.8, op, k.st)).join('')
      + pair(k, [[80, 50], [71, 66], [68, 86]], 7, { start: 1, taper: 2, lines: false });
    case 'sleekSide': {
      const segs = [[86, 44], [80, 50], [75, 57], [72, 65], [70, 74], [69, 83]];
      return crown(k, HAIRLINE.high, { top: 29 }) + LINE('M110,30 L108,46', 0.8, 0.55, k.dd)
        + segs.map(([x, y], i) => braidLeaf(k, x, y, 5.2, i % 2 ? -35 : 35)).join('')
        + LINE('M108,46 Q120,40 128,52 M108,40 Q118,36 126,44', 0.8, 0.5, k.st);
    }
    case 'wispySweep': return crown(k, HAIRLINE.side, { top: 28 })
      + lock(k, [[112, 34], [94, 42], [80, 54], [73, 70]], 16, { start: 0.9, taper: 1.8 })
      + pair(k, [[72, 84], [71, 98], [73, 110], [76, 118]], 2.6, { start: 1, taper: 1.2, lines: false, shine: false, edge: 0.25 });
    case 'curly': return crown(k, HAIRLINE.center, { top: 25 })
      + [[74, 60, 9], [84, 50, 9], [96, 46, 8], [106, 46, 8], [117, 50, 9], [127, 60, 9], [70, 74, 8], [131, 74, 8]].map(([x, y, r]) => FILL(cloud(x, y, r, r * 0.85, 7, r * 0.45), k.c) + LINE(cloud(x, y, r, r * 0.85, 7, r * 0.45), 0.6, 0.4)).join('')
      + curlMarks(k, [[76, 60], [96, 46], [118, 50], [70, 74, 0.8], [130, 74, 0.8]]);
    case 'afro': return [[72, 58, 11], [86, 46, 11], [100, 42, 11], [114, 46, 11], [128, 58, 11], [66, 74, 9], [134, 74, 9]].map(([x, y, r]) => FILL(cloud(x, y, r, r * 0.9, 8, r * 0.42), k.c) + LINE(cloud(x, y, r, r * 0.9, 8, r * 0.42), 0.6, 0.4)).join('')
      + curlMarks(k, [[72, 58], [100, 42], [128, 58], [86, 46, 0.8], [114, 46, 0.8]]);
    case 'fingerWave': return crown(k, HAIRLINE.side, { top: 30 })
      + lock(k, [[110, 34], [96, 40], [104, 48], [88, 54], [78, 64], [72, 80]], 20, { start: 0.9, taper: 1.6, lines: false })
      + LINE('M110,34 C98,38 108,46 94,52 C84,58 90,66 78,72', 1, 0.7, k.st) + LINE('M120,40 C112,44 122,52 112,58', 1, 0.6, k.st)
      + lock(k, [[128, 56], [134, 74], [132, 94]], 12, { start: 1, taper: 1.6, lines: false });
    case 'rolls': return crown(k, HAIRLINE.high, { top: 34 }) + LINE('M100,40 L100,50', 0.8, 0.55, k.dd)
      + [[80, 42], [120, 42]].map(([x, y]) => {
        const d = `M${x - 15},${y + 4} C${x - 17},${y - 14} ${x + 15},${y - 16} ${x + 15},${y + 2} C${x + 13},${y + 12} ${x - 13},${y + 14} ${x - 15},${y + 4} Z`;
        return FILL(d, k.c) + LINE(d, 0.8, 0.5) + LINE(`M${x - 8},${y} C${x - 8},${y - 8} ${x + 8},${y - 8} ${x + 7},${y} C${x + 5},${y + 5} ${x - 3},${y + 5} ${x - 2},${y}`, 0.9, 0.7, k.st) + LINE(`M${x - 10},${y - 6} Q${x},${y - 12} ${x + 10},${y - 6}`, 2, 0.5, k.hl);
      }).join('')
      + pair(k, [[72, 56], [68, 76], [69, 96]], 9, { start: 1, taper: 2, lines: false });
    case 'pixie': return crown(k, 'C134,70 128,60 120,58 C106,56 90,62 78,74 Q71,82 66,92', { top: 27, low: 92 })
      + lock(k, [[118, 34], [100, 42], [86, 54], [78, 68], [76, 78]], 20, { start: 0.95, taper: 1.5 })
      + pair(k, [[68, 78], [67, 92], [69, 102]], 6, { start: 1, taper: 1.6, lines: false, shine: false })
      + LINE('M126,44 Q132,52 134,64', 0.8, 0.5, k.st);
    case 'short': return burns + crown(k, 'C134,74 130,62 122,58 Q112,56 104,58 Q96,56 88,58 Q76,60 70,72 Q66,80 66,92', { top: 29, low: 90 })
      + [[78, 58], [88, 55], [98, 54], [108, 55], [118, 57]].map(([x, y]) => LINE(`M${x},${y} q2,-8 ${x < 100 ? -2 : 4},-14`, 0.8, 0.55, k.st)).join('');
    case 'sidePart': return burns + crown(k, 'C134,72 130,62 124,58 C110,54 92,58 80,66 Q70,74 66,90', { top: 28, low: 90 })
      + lock(k, [[110, 32], [94, 38], [82, 48], [74, 62]], 20, { start: 0.95, taper: 1.4 })
      + LINE('M110,30 L114,44', 0.8, 0.55, k.dd) + LINE('M116,36 Q126,42 130,56', 0.8, 0.5, k.st);
    case 'curtainShort': return burns + crown(k, HAIRLINE.center, { top: 28, low: 90 })
      + pair(k, [[99, 36], [90, 46], [82, 58], [78, 70]], 14, { start: 0.95, taper: 1.5 });
    case 'tousled': return burns + crown(k, 'C134,72 128,62 120,60 Q112,62 106,58 Q98,62 92,58 Q84,62 78,62 Q70,68 66,90', { top: 30, low: 90 })
      + [[[100, 34], [88, 40], [78, 50], [74, 62]], [[104, 34], [116, 42], [124, 52], [126, 62]], [[96, 38], [92, 48], [86, 56], [84, 64]], [[104, 40], [108, 50], [112, 58], [116, 64]], [[94, 30], [86, 28], [80, 32]], [[108, 30], [116, 28], [122, 34]]]
        .map(([a, b, c, d2], i) => lock(k, d2 ? [a, b, c, d2] : [a, b, c], i > 3 ? 8 : 13, { start: 1, taper: 1.5, lines: false, shine0: 0.1, shine1: 0.5 })).join('');
    case 'pompadour': return burns + crown(k, 'C134,72 130,62 122,58 Q100,54 78,58 Q70,64 66,90', { top: 18, low: 90 })
      + LINE('M74,46 C82,26 118,22 128,40', 1, 0.6, k.st) + LINE('M78,52 C88,34 114,32 124,46', 0.9, 0.55, k.st) + LINE('M84,30 C96,22 112,22 120,28', 2.6, 0.45, k.hl);
    case 'buzz': return FILL('M69,78 C68,52 82,40 100,40 C118,40 132,52 131,78 C126,66 112,60 100,60 C88,60 74,66 69,78 Z', k.c, 0.6)
      + LINE('M69,78 C68,52 82,40 100,40 C118,40 132,52 131,78', 0.9, 0.5)
      + [[80, 52], [92, 47], [106, 47], [118, 52], [86, 56], [100, 52], [114, 56], [76, 62], [124, 62]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".7" fill="${k.st}" opacity=".6"/>`).join('');
    default: return frontLong(k, kind);
  }
}

/** Satu "daun" kepang yang miring. */
function braidLeaf(k, x, y, s, rot) {
  const d = `M${x},${y - s * 1.3} C${x + s * 1.2},${y - s * 0.6} ${x + s * 1.1},${y + s * 0.8} ${x},${y + s * 1.3} C${x - s * 1.1},${y + s * 0.8} ${x - s * 1.2},${y - s * 0.6} ${x},${y - s * 1.3} Z`;
  return `<g transform="rotate(${rot} ${x} ${y})">${FILL(d, k.c)}${LINE(d, 0.7, 0.45)}${LINE(`M${x},${y - s} Q${x + s * 0.4},${y} ${x},${y + s}`, 0.6, 0.5, k.st)}${LINE(`M${x - s * 0.4},${y - s * 0.6} Q${x - s * 0.1},${y - s * 0.2} ${x - s * 0.2},${y + s * 0.2}`, 1.2, 0.5, k.hl)}</g>`;
}
/** Kepang menggantung: daun berpasangan bergantian + ujung berhelai + ikat pita. */
function braid(k, pts, n, s = 6, tie = '#E9AFC0') {
  const c = spline(pts, 8);
  let out = '';
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const p = c[Math.round(t * (c.length - 1))];
    const sc = s * (1 - t * 0.25);
    out += braidLeaf(k, p[0] - sc * 0.45, p[1], sc, 28) + braidLeaf(k, p[0] + sc * 0.45, p[1] + sc * 0.9, sc, -28);
  }
  const end = c[c.length - 1];
  out += lock(k, [[end[0], end[1] - 2], [end[0] + 1, end[1] + 8], [end[0] - 1, end[1] + 16]], s * 1.6, { start: 1, taper: 1.2, lines: false });
  out += FILL(`M${end[0]},${end[1]} l-7,-5 l0,10 Z M${end[0]},${end[1]} l7,-5 l0,10 Z`, tie) + LINE(`M${end[0]},${end[1]} l-7,-5 l0,10 Z M${end[0]},${end[1]} l7,-5 l0,10 Z`, 0.6, 0.6) + `<circle cx="${r1(end[0])}" cy="${r1(end[1])}" r="2" fill="${shade(tie, 0.2)}"/>`;
  return out;
}

function bun(k, cx, cy, r, messy = false) {
  const d = cloud(cx, cy, r, r * 0.9, messy ? 9 : 12, r * (messy ? 0.5 : 0.36));
  return FILL(d, k.c) + LINE(d, 0.7, 0.45)
    + LINE(`M${cx - r * 0.6},${cy} C${cx - r * 0.6},${cy - r * 0.7} ${cx + r * 0.6},${cy - r * 0.7} ${cx + r * 0.5},${cy} C${cx + r * 0.4},${cy + r * 0.5} ${cx - r * 0.3},${cy + r * 0.5} ${cx - r * 0.2},${cy}`, 0.9, 0.65, k.st)
    + LINE(`M${cx - r * 0.5},${cy - r * 0.5} Q${cx},${cy - r * 0.85} ${cx + r * 0.5},${cy - r * 0.5}`, 1.8, 0.5, k.hl)
    + (messy ? lock(k, [[cx - r * 0.6, cy - r * 0.4], [cx - r * 1.2, cy - r * 1.1], [cx - r * 0.9, cy - r * 1.6]], 6, { start: 1, taper: 1.3, lines: false })
      + lock(k, [[cx + r * 0.5, cy - r * 0.6], [cx + r * 1.3, cy - r * 0.9], [cx + r * 1.5, cy - r * 0.4]], 5, { start: 1, taper: 1.3, lines: false }) : '');
}

const SHORT_BACK = (k, len = 112) => {
  const d = `M66,90 C62,56 80,32 100,32 C120,32 138,56 134,90 L133,${len} Q100,${len + 6} 67,${len} Z`;
  return FILL(d, k.d) + LINE(d, 0.7, 0.4);
};

/** Bagian rambut untuk resep `r` ({ back, front, sides }). */
export function hairLayers(r, color, sex) {
  if (!r) return {};
  const k = kit(color);
  let back = '', side = '', front = '';
  switch (r.back) {
    case 'long': back = backMass(k, 252); side = sideLong(k, 246); break;
    case 'halfUp': back = backMass(k, 248); side = sideLong(k, 240); front = bun(k, 100, 30, 9); break;
    case 'wavy': back = backMass(k, 250, { wave: 5, spread: 14 }); side = sideLong(k, 244, 5); break;
    case 'curlyLong': {
      const d = cloud(100, 126, 50, 102, 34, 8.5);
      back = FILL(d, k.d) + LINE(d, 0.7, 0.4) + curlMarks(k, [[56, 120], [146, 120], [52, 160], [148, 160], [60, 200], [140, 200], [70, 222], [130, 222]]);
      side = [[[72, 96], [64, 130], [70, 160], [62, 196], [68, 226]], [[78, 108], [74, 140], [80, 168], [74, 200]]].map((pts, i) => pair(k, pts, i ? 12 : 16, { start: 0.8, taper: 1.8, lines: false })).join('')
        + curlMarks(k, [[66, 140], [134, 140], [68, 186], [132, 186], [74, 214, 0.8], [126, 214, 0.8]]);
      break;
    }
    case 'curlyShort': { const d = cloud(100, 86, 46, 50, 16, 11); back = FILL(d, k.d) + LINE(d, 0.7, 0.4) + curlMarks(k, [[58, 96], [142, 96], [62, 120], [138, 120]]); break; }
    case 'afro': { const d = cloud(100, 72, 62, 58, 20, 13); back = FILL(d, k.d) + LINE(d, 0.7, 0.4) + curlMarks(k, [[50, 80], [150, 80], [60, 40], [140, 40], [100, 18], [54, 110], [146, 110]]); break; }
    case 'bob': back = backMass(k, 132, { spread: 2, tips: 6, dip: 3 }); side = pair(k, [[72, 84], [67, 104], [67, 122], [71, 133]], 14, { start: 0.9, taper: 5, lines: 1 }); break;
    case 'lob': back = backMass(k, 176, { spread: 6, tips: 7, dip: 5 }); side = pair(k, [[74, 86], [67, 116], [66, 150], [70, 176]], 17, { start: 0.8, taper: 2.4, lines: 1 }); break;
    case 'retroBob': {
      back = backMass(k, 124, { spread: 4, tips: 1 });
      side = pair(k, [[74, 82], [66, 100], [64, 118], [68, 130], [78, 130], [80, 122]], 16, { start: 0.9, taper: 1.6, lines: 1 });
      break;
    }
    case 'ponyHigh': back = SHORT_BACK(k, 104) + lock(k, [[122, 40], [144, 54], [154, 90], [152, 140], [144, 186], [146, 214]], 30, { start: 0.7, taper: 1.7, edge: 0.4, shine0: 0.05, shine1: 0.3 }) + lock(k, [[130, 46], [146, 76], [146, 130], [138, 176]], 14, { tone: 'd', start: 1, taper: 1.5, lines: false }); front = '<g>' + `<ellipse cx="124" cy="42" rx="4" ry="6" fill="#C98299" stroke="${INK}" stroke-width=".6"/>` + '</g>'; break;
    case 'ponyLow': back = SHORT_BACK(k, 116); side = lock(k, [[120, 116], [134, 140], [138, 180], [132, 216], [126, 236]], 22, { start: 0.8, taper: 1.8 })
      + FILL('M118,114 l-9,-7 l1,14 Z M118,114 l9,-7 l-1,14 Z', '#E9AFC0') + LINE('M118,114 l-9,-7 l1,14 Z M118,114 l9,-7 l-1,14 Z', 0.6, 0.6) + `<circle cx="118" cy="114" r="2.2" fill="#C98299"/>`; break;
    case 'twin': back = SHORT_BACK(k, 104);
      side = pair(k, [[68, 56], [52, 74], [44, 110], [44, 150], [50, 190], [46, 212]], 22, { start: 0.85, taper: 1.9 })
        + [68, 132].map((x) => `<ellipse cx="${x}" cy="58" rx="5" ry="4" fill="#E9AFC0" stroke="${INK}" stroke-width=".6"/>`).join(''); break;
    case 'braids': back = SHORT_BACK(k, 108); side = braid(k, [[72, 104], [70, 150], [72, 200]], 8) + braid(k, [[128, 104], [130, 150], [128, 200]], 8); break;
    case 'dutch': back = SHORT_BACK(k, 108); side = braid(k, [[74, 94], [68, 140], [66, 196], [68, 224]], 10, 6.4); break;
    case 'sideBraid': back = SHORT_BACK(k, 110); side = lock(k, [[110, 96], [124, 106], [130, 118]], 16, { start: 1, taper: 1, lines: false }) + braid(k, [[128, 116], [132, 160], [130, 206], [132, 228]], 10, 7); break;
    case 'bunTop': back = SHORT_BACK(k, 104) + bun(k, 100, 22, 15); break;
    case 'messyBun': back = SHORT_BACK(k, 104) + bun(k, 100, 22, 16, true); break;
    case 'chignon': back = SHORT_BACK(k, 108) + bun(k, 132, 108, 13); break;
    case 'updo': back = SHORT_BACK(k, 100) + bun(k, 100, 22, 18) + bun(k, 112, 12, 10); break;
    case 'spaceBuns': back = SHORT_BACK(k, 104) + bun(k, 70, 32, 13) + bun(k, 130, 32, 13); break;
    case 'victory': back = backMass(k, 160, { spread: 6, tips: 1 }); side = pair(k, [[74, 96], [66, 120], [62, 146], [66, 164], [78, 166], [80, 156]], 18, { start: 0.85, taper: 1.6, lines: 1 }); break;
    case 'nape': back = SHORT_BACK(k, 110); break;
    default: break;
  }
  front += frontMore(k, r.front, sex);
  if (r.sides) side += pair(k, [[74, 70], [67, 94], [67, 116], [70, 131]], 13, { start: 0.95, taper: 5, lines: 1 });
  return { back, side, front };
}
