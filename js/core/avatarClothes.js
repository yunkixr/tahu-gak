// Pakaian parametrik: bentuk dihitung dari ukuran tubuh (geometry) + resep item,
// sehingga setiap gaun/atasan/luaran/bawahan pas di semua bentuk badan.

import { SHAPE, FILL, LINE, shade, lighten, lum, through, MIRROR, BOTH, C, pt, r1, CX, GOLD, PEARL, nextId, INK } from './avatarRender.js';

// ───────────── Pola kain ─────────────
export function pattern(kind, color) {
  const id = nextId('tgp');
  const dk = shade(color, 0.3), lt = lighten(color, 0.55);
  let size = 12, inner = '';
  switch (kind) {
    case 'floral': size = 18; inner = flower(5, 5, '#E9AFC0', 2.2) + flower(13, 13, '#F7DCE2', 2) + `<circle cx="13" cy="4" r="1.4" fill="#A9B89A"/><circle cx="4" cy="14" r="1.2" fill="#A9B89A"/>`; break;
    case 'floralSmall': size = 10; inner = flower(3, 3, '#C98299', 1.3) + flower(8, 8, '#E9AFC0', 1.2) + `<circle cx="8" cy="2.5" r=".8" fill="#A9B89A"/>`; break;
    case 'gingham': size = 10; inner = `<rect width="5" height="10" fill="${dk}" opacity=".28"/><rect width="10" height="5" fill="${dk}" opacity=".28"/>`; break;
    case 'polka': size = 10; inner = `<circle cx="2.5" cy="2.5" r="1.4" fill="#FFFCF6"/><circle cx="7.5" cy="7.5" r="1.4" fill="#FFFCF6"/>`; break;
    case 'stripes': size = 8; inner = `<rect y="0" width="8" height="3.2" fill="${color}"/>`; break;
    case 'argyle': size = 16; inner = `<path d="M8,0 L16,10 L8,20 L0,10 Z" fill="${dk}" opacity=".3"/><path d="M0,0 L16,20 M16,0 L0,20" stroke="${lt}" stroke-width=".7"/>`; return defsPattern(id, 16, 20, inner);
    case 'lace': size = 8; inner = `<circle cx="4" cy="4" r="1.6" fill="none" stroke="${shade(color, 0.12)}" stroke-width=".7"/><circle cx="0" cy="0" r="1" fill="${shade(color, 0.08)}"/><circle cx="8" cy="8" r="1" fill="${shade(color, 0.08)}"/>`; break;
    case 'tweed': size = 6; inner = `<circle cx="1" cy="1" r=".7" fill="${dk}" opacity=".6"/><circle cx="4" cy="3" r=".6" fill="#FFFCF6" opacity=".8"/><circle cx="2" cy="5" r=".5" fill="${shade(color, 0.5)}" opacity=".5"/><path d="M0,3 L3,0 M3,6 L6,3" stroke="${dk}" stroke-width=".4" opacity=".5"/>`; break;
    case 'sequin': size = 5; inner = `<circle cx="1.5" cy="1.5" r="1.1" fill="${lt}" opacity=".9"/><circle cx="4" cy="4" r="1.1" fill="${dk}" opacity=".35"/>`; break;
    default: return { defs: '', fill: null };
  }
  return defsPattern(id, size, size, inner);
}
function defsPattern(id, w, h, inner) {
  return { defs: `<defs><pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse">${inner}</pattern></defs>`, fill: `url(#${id})` };
}
function flower(x, y, c, r) {
  return [0, 72, 144, 216, 288].map((a) => {
    const rad = (a * Math.PI) / 180;
    return `<circle cx="${r1(x + Math.cos(rad) * r)}" cy="${r1(y + Math.sin(rad) * r)}" r="${r1(r * 0.75)}" fill="${c}"/>`;
  }).join('') + `<circle cx="${x}" cy="${y}" r="${r1(r * 0.55)}" fill="#F5E3B3"/>`;
}
/** Isian berpola: warna dasar + lapisan pola di atasnya. */
function filled(d, color, pat, w = 1, op = 0.75) {
  return SHAPE(d, color, w, op) + (pat && pat.fill ? FILL(d, pat.fill) + LINE(d, w, op) : '');
}

const bow = (x, y, s, c) => SHAPE(`M${x},${y} C${x - 6 * s},${y - 7 * s} ${x - 11 * s},${y - 2 * s} ${x - 8 * s},${y + 3 * s} C${x - 5 * s},${y + 6 * s} ${x - 2 * s},${y + 2 * s} ${x},${y} Z`, c, 0.8, 0.75)
  + SHAPE(`M${x},${y} C${x + 6 * s},${y - 7 * s} ${x + 11 * s},${y - 2 * s} ${x + 8 * s},${y + 3 * s} C${x + 5 * s},${y + 6 * s} ${x + 2 * s},${y + 2 * s} ${x},${y} Z`, c, 0.8, 0.75)
  + SHAPE(`M${x - 1 * s},${y + 1 * s} L${x - 5 * s},${y + 11 * s} L${x - 2 * s},${y + 10 * s} Z M${x + 1 * s},${y + 1 * s} L${x + 5 * s},${y + 11 * s} L${x + 2 * s},${y + 10 * s} Z`, c, 0.7, 0.7)
  + `<circle cx="${x}" cy="${y}" r="${r1(1.8 * s)}" fill="${shade(c, 0.15)}" stroke="${INK}" stroke-width=".6"/>`;
const button = (x, y, c, r = 1.7) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" fill="${c}" stroke="${INK}" stroke-width=".6"/>`;
const scallops = (x0, x1, y, n, r, c, down = true) => {
  const w = (x1 - x0) / n;
  let d = `M${r1(x0)},${y}`;
  for (let i = 0; i < n; i++) d += ` a${r1(w / 2)},${r} 0 0 ${down ? 0 : 1} ${r1(w)},0`;
  return LINE(d, 0.9, 0.75) + FILL(d + ` L${r1(x1)},${y - 0.1} Z`, c);
};

// ───────────── Badan pakaian (atasan, gaun, luaran) ─────────────
const BODICE = new Set(['sweet', 'off', 'oneshoulder']);

function sidePoints(m, startY, hem, loose, extra = () => 0) {
  const ys = [200, 214, 238, 262, 286, 308, 336, 380, 430, 480].filter((y) => y > startY && y < hem - 6);
  return [...ys, hem].map((y) => [CX - (m.sideX(Math.min(y, 336)) + loose + (y > 336 ? (y - 336) * 0.07 : 0) + extra(y)), y]);
}

/** Garis leher dari titik kiri ke kanan (perintah path absolut). */
function neckSeg(neck) {
  switch (neck) {
    case 'v': return [[CX - 12, 159], 'L100,190 L112,159'];
    case 'deepv': return [[CX - 13, 159], 'L100,222 L113,159'];
    case 'scoop': return [[CX - 15, 162], 'Q100,196 115,162'];
    case 'square': return [[CX - 17, 166], 'L83,190 L117,190 L117,166'];
    case 'boat': return [[CX - 27, 164], 'Q100,174 127,164'];
    case 'turtle': return [[CX - 11, 160], 'Q100,166 111,160'];
    case 'high': return [[CX - 10, 152], 'Q100,156 110,152'];
    case 'collar': return [[CX - 10, 158], 'L100,180 L110,158'];
    case 'cowl': return [[CX - 16, 162], 'Q100,204 116,162'];
    default: return [[CX - 11, 160], 'Q100,170 111,160'];
  }
}

function torsoBody(m, r, color, pat, hem, loose) {
  const SPL = [CX - (m.S + loose * 0.35), 177];
  if (r.neck === 'oneshoulder') {
    const left = sidePoints(m, 196, hem, loose);
    const startL = [CX - (m.sideX(198) + loose), 198];
    const right = [[CX + m.S + loose * 0.35, 177], ...left.map(([x, y]) => [200 - x, y])];
    const d = `M${pt(startL)} Q${CX + 8},176 ${CX + m.S - 10},166 L${pt(right[0])}${through(right)} Q${CX},${hem + 5} ${pt(left[left.length - 1])}${through(left.slice().reverse().concat([startL]))} Z`;
    return filled(d, color, pat);
  }
  if (BODICE.has(r.neck) || r.straps) {
    const top = 194;
    const left = sidePoints(m, top, hem, loose);
    const L0 = [CX - (m.sideX(top) + loose + (r.neck === 'off' ? 2 : 0)), top];
    const R0 = [200 - L0[0], top];
    const B = m.B;
    let edge;
    switch (r.neck) {
      case 'sweet': edge = `Q${CX - B + 6},184 ${CX - 11},190 Q${CX - 4},192 ${CX},200 Q${CX + 4},192 ${CX + 11},190 Q${CX + B - 6},184 ${pt(R0)}`; break;
      case 'v': edge = `L${CX - 14},188 L${CX},212 L${CX + 14},188 L${pt(R0)}`; break;
      case 'square': edge = `L${CX - B + 5},187 L${CX + B - 5},187 L${pt(R0)}`; break;
      case 'cowl': edge = `Q${CX},214 ${pt(R0)}`; break;
      case 'off': edge = `Q${CX},198 ${pt(R0)}`; break;
      default: edge = `Q${CX},200 ${pt(R0)}`;
    }
    const right = left.map(([x, y]) => [200 - x, y]);
    const d = `M${pt(L0)} ${edge}${through([R0, ...right])} Q${CX},${hem + 5} ${pt(left[left.length - 1])}${through(left.slice().reverse().concat([L0]))} Z`;
    let s = filled(d, color, pat);
    if (r.straps) s += BOTH(LINE(`M${CX - B + 7},190 L${CX - 19},164`, 2.4, 1, color) + LINE(`M${CX - B + 7},190 L${CX - 19},164`, 0.6, 0.6));
    if (r.neck === 'cowl') s += LINE(`M${CX - 14},196 Q${CX},210 ${CX + 14},196 M${CX - 10},204 Q${CX},214 ${CX + 10},204`, 0.8, 0.5);
    return s;
  }
  const [NL, seg] = neckSeg(r.neck);
  const left = sidePoints(m, 177, hem, loose);
  const right = left.map(([x, y]) => [200 - x, y]);
  const SPR = [200 - SPL[0], 177];
  const d = `M${pt(SPL)} L${pt(NL)} ${seg} L${pt(SPR)}${through([SPR, ...right])} Q${CX},${hem + 4} ${pt(left[left.length - 1])}${through(left.slice().reverse().concat([SPL]))} Z`;
  return filled(d, color, pat);
}

/** Panel kiri luaran terbuka (dicerminkan untuk panel kanan). */
function openPanel(m, r, color, pat, hem, loose) {
  const SPL = [CX - (m.S + loose * 0.35), 177];
  const left = sidePoints(m, 177, hem, loose);
  const o = r.open || 4;
  let front;
  switch (r.neck) {
    case 'round': front = `L${CX - 12},160 Q${CX - o - 2},176 ${CX - o},196 L${CX - o},${hem}`; break;
    case 'collarOpen': case 'open': front = `L${CX - 11},160 L${CX - o},220 L${CX - o},${hem}`; break;
    default: front = `L${CX - 11},158 L${CX - o},246 L${CX - o},${hem}`;
  }
  const d = `M${pt(SPL)} ${front} Q${(CX - o + left[left.length - 1][0]) / 2},${hem + 3} ${pt(left[left.length - 1])}${through(left.slice().reverse().concat([SPL]))} Z`;
  let s = filled(d, color, pat);
  const dk = shade(color, 0.16);
  if (r.neck === 'lapel' || r.neck === 'moto') {
    const w = r.neck === 'moto' ? 6 : 0;
    s += SHAPE(`M${CX - 11},158 L${CX - 22 - w},168 L${CX - 29 - w},${196 + w} L${CX - 22 - w},${199 + w} L${CX - o - 1},246 L${CX - o},236 L${CX - 13},166 Z`, dk, 0.9, 0.8);
  }
  if (r.neck === 'collarOpen') s += SHAPE(`M${CX - 11},160 L${CX - 26},166 L${CX - 20},184 L${CX - o - 2},200 Z`, dk, 0.9, 0.8);
  return s;
}

function details(m, r, color, hem, loose, closed) {
  const dk = shade(color, 0.2);
  const lt = lighten(color, 0.4);
  const D = new Set(r.details || []);
  const xw = (y) => m.sideX(y) + loose;
  let s = '';
  const topY = BODICE.has(r.neck) || r.straps ? 200 : r.neck === 'v' ? 192 : r.neck === 'deepv' ? 224 : r.neck === 'square' ? 192 : r.neck === 'collar' ? 182 : 174;
  if (D.has('buttons') && closed) for (let y = topY + 8; y < hem - 6; y += 16) s += button(CX, y, lt);
  if (D.has('buttonsGold')) for (let y = 204; y < hem - 6; y += 18) s += button(CX - (r.open || 4) - 5, y, GOLD, 1.8) + button(CX + (r.open || 4) + 5, y, GOLD, 1.8);
  if (D.has('buttons2')) for (let y = 256; y < Math.min(hem - 10, 340); y += 22) s += button(CX - 10, y, dk, 2) + button(CX + 10, y, dk, 2);
  if (D.has('button1')) s += button(CX - (r.open || 4) + 1, 286, dk, 2.2);
  if (D.has('belt')) {
    const y = 258;
    s += FILL(`M${CX - xw(y) - 1},${y} L${CX + xw(y) + 1},${y} L${CX + xw(y + 10) + 1},${y + 10} L${CX - xw(y + 10) - 1},${y + 10} Z`, dk) + LINE(`M${CX - xw(y) - 1},${y} L${CX + xw(y) + 1},${y} M${CX - xw(y + 10) - 1},${y + 10} L${CX + xw(y + 10) + 1},${y + 10}`, 0.8, 0.7)
      + `<rect x="${CX - 6}" y="${y - 1}" width="12" height="12" rx="2" fill="none" stroke="${GOLD}" stroke-width="1.6"/>`;
  }
  if (D.has('tieWaist')) s += FILL(`M${CX - xw(256)},256 L${CX + xw(256)},256 L${CX + xw(264)},264 L${CX - xw(264)},264 Z`, dk) + bow(CX + 8, 260, 0.8, dk);
  if (D.has('bowWaist')) s += bow(CX, 262, 1.2, lighten(color, 0.25));
  if (D.has('bowFront')) s += bow(CX, 206, 0.9, lighten(color, 0.3));
  if (D.has('collarBow')) s += bow(CX, 166, 0.8, dk);
  if (D.has('bowNeck')) s += bow(CX, 168, 1.1, color) + LINE('M88,159 L100,166 L112,159', 0.8, 0.6);
  if (D.has('bowsMany')) s += bow(CX - m.S + 8, 182, 0.7, '#FFFCF6') + bow(CX + m.S - 8, 182, 0.7, '#FFFCF6') + bow(CX, 232, 0.9, '#FFFCF6');
  if (D.has('lacing')) { for (let y = 214; y < hem - 8; y += 9) s += LINE(`M${CX - 4},${y} L${CX + 4},${y + 7} M${CX + 4},${y} L${CX - 4},${y + 7}`, 0.9, 0.85, '#FFFCF6') + LINE(`M${CX - 4},${y} L${CX + 4},${y + 7} M${CX + 4},${y} L${CX - 4},${y + 7}`, 0.4, 0.5); }
  if (D.has('boning')) s += BOTH(LINE(`M${CX - 14},206 L${CX - 15},${hem - 2} M${CX - 28},206 Q${CX - 30},240 ${CX - 26},${hem - 2}`, 0.7, 0.4));
  if (D.has('laceTrim')) { const y = BODICE.has(r.neck) || r.straps ? 196 : hem; s += scallops(CX - xw(y) + 2, CX + xw(y) - 2, y, 10, 2.4, '#FFFCF6', y !== hem); }
  if (D.has('laceCollar') || r.neck === 'collarPP') {
    const c = D.has('laceCollar') ? '#FFFCF6' : lighten(color, 0.6);
    s += BOTH(SHAPE(`M${CX},171 C${CX - 4},180 ${CX - 18},182 ${CX - 22},172 C${CX - 22},166 ${CX - 16},160 ${CX - 10},159 Z`, c, 0.8, 0.8));
  }
  if (r.neck === 'collar') s += BOTH(SHAPE(`M${CX - 10},157 L${CX - 1},180 L${CX - 9},183 L${CX - 19},166 Z`, lighten(color, 0.15), 0.8, 0.8));
  if (r.neck === 'turtle') s += SHAPE(`M${CX - 11},146 C${CX - 11},140 ${CX + 11},140 ${CX + 11},146 L${CX + 13},166 C${CX + 5},171 ${CX - 5},171 ${CX - 13},166 Z`, color, 1, 0.8)
    + LINE(`M${CX - 12},156 Q${CX},160 ${CX + 12},156`, 0.8, 0.5) + [-7, -2.5, 2.5, 7].map((x) => LINE(`M${CX + x},148 L${CX + x * 1.1},165`, 0.6, 0.35)).join('');
  if (r.neck === 'high') s += SHAPE(`M${CX - 10},150 C${CX - 10},144 ${CX + 10},144 ${CX + 10},150 L${CX + 11},160 Q${CX},164 ${CX - 11},160 Z`, color, 0.9, 0.75) + scallops(CX - 11, CX + 11, 146, 6, 1.6, color, false);
  if (r.neck === 'hood') s += SHAPE(`M${CX - 22},170 C${CX - 30},150 ${CX - 18},146 ${CX},150 C${CX + 18},146 ${CX + 30},150 ${CX + 22},170 Q${CX},180 ${CX - 22},170 Z`, shade(color, 0.08), 0.9, 0.75)
    + LINE(`M${CX - 5},172 L${CX - 6},204 M${CX + 5},172 L${CX + 6},204`, 1, 0.8, '#FFFCF6');
  if (D.has('pouch')) s += SHAPE(`M${CX - 20},270 L${CX + 20},270 L${CX + 26},300 L${CX - 26},300 Z`, shade(color, 0.06), 0.8, 0.6);
  if (D.has('ruffleNeck')) s += LINE(r.neck === 'off' ? `M${CX - m.B - 4},194 q4,4 8,0 q4,4 8,0 q4,4 8,0 q4,4 8,0 q4,4 8,0 q4,4 8,0 q4,4 8,0 q4,4 8,0 q4,4 8,0 q4,4 8,0` : `M83,190 q3,3 6,0 q3,3 6,0 q3,3 6,0 q3,3 6,0 q3,3 6,0 q3,3 6,0`, 0.9, 0.6);
  if (D.has('pocket')) s += SHAPE(`M${CX + 12},204 L${CX + 24},204 L${CX + 24},218 L${CX + 12},218 Z`, color, 0.7, 0.55);
  if (D.has('pockets')) s += BOTH(LINE(`M${CX - xw(330) + 8},318 L${CX - xw(330) + 22},318`, 1, 0.6));
  if (D.has('pocketsFlap')) s += BOTH(SHAPE(`M${CX - xw(310) + 6},306 L${CX - xw(310) + 24},306 L${CX - xw(310) + 24},313 L${CX - xw(310) + 6},313 Z`, dk, 0.8, 0.7));
  if (D.has('chestPockets')) s += BOTH(SHAPE(`M${CX - 30},204 L${CX - 16},204 L${CX - 16},212 L${CX - 23},215 L${CX - 30},212 Z`, dk, 0.8, 0.7) + button(CX - 23, 210, GOLD, 1.3));
  if (D.has('epaulette')) s += BOTH(SHAPE(`M${CX - m.S - loose * 0.3 + 2},178 L${CX - m.S + 14},172 L${CX - m.S + 15},177 L${CX - m.S - loose * 0.3 + 3},183 Z`, dk, 0.7, 0.7));
  if (D.has('zip')) s += LINE(`M${CX - 4},176 L${CX + 6},${hem}`, 1.2, 0.8, '#B9B0B3') + LINE(`M${CX - 4},176 L${CX + 6},${hem}`, 0.5, 0.6);
  if (D.has('denim')) s += BOTH(LINE(`M${CX - xw(250) + 4},250 L${CX - 4},250 M${CX - 30},222 L${CX - 16},222`, 0.8, 0.9, GOLD));
  if (D.has('trim')) s += BOTH(LINE(`M${CX - 12},161 Q${CX - (r.open || 4) - 3},176 ${CX - (r.open || 4) - 1},196 L${CX - (r.open || 4) - 1},${hem - 1} L${CX - xw(hem) + 2},${hem - 1}`, 2.2, 0.9, '#FFFCF6') + LINE(`M${CX - 12},161 Q${CX - (r.open || 4) - 3},176 ${CX - (r.open || 4) - 1},196 L${CX - (r.open || 4) - 1},${hem - 1}`, 0.5, 0.6));
  if (D.has('fur')) {
    const fluff = (x0, y0, x1, y1, n) => Array.from({ length: n }, (_, i) => {
      const t = i / (n - 1); return `<circle cx="${r1(x0 + (x1 - x0) * t)}" cy="${r1(y0 + (y1 - y0) * t)}" r="4.2" fill="#FBF6EE" stroke="${INK}" stroke-width=".5" stroke-opacity=".5"/>`;
    }).join('');
    s += BOTH(fluff(CX - 12, 160, CX - 30, 200, 6) + fluff(CX - 30, 200, CX - (r.open || 4) - 1, 246, 6) + fluff(CX - (r.open || 4), 250, CX - (r.open || 4), hem - 4, Math.max(3, Math.round((hem - 250) / 10))) + fluff(CX - (r.open || 4), hem - 2, CX - xw(hem), hem - 2, 6));
  }
  if (D.has('knitRib') && hem < 400) s += LINE(`M${CX - xw(hem - 8)},${hem - 8} Q${CX},${hem - 4} ${CX + xw(hem - 8)},${hem - 8}`, 0.8, 0.5)
    + Array.from({ length: 9 }, (_, i) => LINE(`M${r1(CX - xw(hem) + 4 + i * (2 * xw(hem) - 8) / 8)},${hem - 7} l0,7`, 0.5, 0.35)).join('');
  if (D.has('cable')) s += [-16, 0, 16].map((x) => LINE(`M${CX + x},${topY + 12} ` + Array.from({ length: Math.floor((hem - topY - 30) / 14) }, () => 'q5,7 0,14').join(' '), 1, 0.45) + LINE(`M${CX + x},${topY + 12} ` + Array.from({ length: Math.floor((hem - topY - 30) / 14) }, () => 'q-5,7 0,14').join(' '), 1, 0.45)).join('');
  if (D.has('drawstring')) s += '';
  if (D.has('sheen')) s += LINE(`M${CX - xw(220) + 6},218 C${CX - xw(250) + 8},250 ${CX - xw(290) + 6},290 ${CX - xw(Math.min(hem, 336)) + 8},${Math.min(hem - 6, 330)}`, 2.4, 0.3, '#FFFFFF');
  if (D.has('sequinTop') || D.has('sequinAll')) {
    const yEnd = D.has('sequinAll') ? hem - 4 : 256;
    for (let y = 200; y < yEnd; y += 7) for (let x = -xw(y) + 5; x < xw(y) - 4; x += 7) s += `<circle cx="${r1(CX + x + ((y / 7) % 2) * 3)}" cy="${y}" r="1.2" fill="${(x + y) % 3 ? lighten(color, 0.6) : '#FFFFFF'}" opacity=".85"/>`;
  }
  return s;
}

// ───────────── Lengan baju ─────────────
const SLEEVE_LEN = { cap: 194, short: 216, puff: 214, flutter: 212, elbow: 262, three: 296, long: 334, bishop: 334, sheer: 334 };

function sleeve(m, kind, loose, color, pat, topY = 168) {
  if (!SLEEVE_LEN[kind]) return '';
  const len = SLEEVE_LEN[kind];
  const oo = 1.5 + loose * 0.6, io = 1 + loose * 0.4;
  const bulge = (y) => kind === 'puff' ? (y < 214 ? 7 * Math.sin(((y - 180) / 34) * Math.PI) : 0)
    : kind === 'bishop' ? Math.max(0, ((y - 222) / 100) * 7) : kind === 'flutter' ? Math.max(0, ((y - 186) / 26) * 9) : 0;
  const bIn = (y) => kind === 'flutter' ? Math.max(0, ((y - 196) / 16) * 4) : kind === 'bishop' ? Math.max(0, ((y - 240) / 90) * 2) : kind === 'puff' ? 2 : 0;
  const ys = [186, 198, 210, 222, 262, 298, 322].filter((y) => y < len - 3);
  const O = [...ys, len].map((y) => [CX - (m.armOut(y) + oo + bulge(y)), y]);
  const Ii = [len, ...[322, 298, 262, 226, 206].filter((y) => y < len - 3 && y > 202)].map((y) => [CX - (m.armIn(y) - io - bIn(y)), y]);
  const seam = [CX - m.S + 9, topY];
  const pit = [CX - (m.armIn(202) - io), 202];
  const hemSeg = kind === 'flutter'
    ? (() => { const a = O[O.length - 1], b = Ii[0]; const n = 4, w = (b[0] - a[0]) / n; return Array.from({ length: n }, (_, i) => `Q${r1(a[0] + w * i + w / 2)},${len + 5} ${r1(a[0] + w * (i + 1))},${len}`).join(' '); })()
    : `Q${r1((O[O.length - 1][0] + Ii[0][0]) / 2)},${len + 2.5} ${pt(Ii[0])}`;
  const d = `M${pt(seam)} Q${r1(CX - m.S - oo - bulge(180))},${topY + 4} ${pt(O[0])}${through(O)} ${hemSeg}${through(Ii.concat([pit]))} Q${CX - m.S + 6},190 ${pt(seam)} Z`;
  let s = kind === 'sheer' ? FILL(d, color, 0.42) + (pat?.fill ? FILL(d, pat.fill, 0.8) : '') + LINE(d, 0.9, 0.6) : filled(d, color, pat);
  const cuff = (y, h) => LINE(`M${r1(CX - m.armOut(y) - oo - bulge(y))},${y} L${r1(CX - m.armIn(y) + io + bIn(y))},${y}`, 0.8, 0.6) + (h ? LINE(`M${r1(CX - m.armOut(y + h) - oo)},${y + h} L${r1(CX - m.armIn(y + h) + io)},${y + h}`, 0.8, 0.6) : '');
  if (kind === 'puff') s += cuff(len - 4, 0) + LINE(`M${CX - m.S + 4},176 l-2,8 M${CX - m.S - 2},178 l-1,8`, 0.7, 0.4);
  if (kind === 'long' || kind === 'bishop') s += cuff(len - 8, 0);
  if (kind === 'sheer') s += cuff(len - 6, 0);
  return s;
}

/** Atasan / gaun (bagian badan) / luaran: { body, sleeves, defs }. */
export function torsoGarment(m, item, color, { cut } = {}) {
  const r = item.r;
  const loose = r.loose || 0;
  const base = r.base || color;
  const pat = r.pattern ? pattern(r.pattern, r.pattern === 'stripes' ? color : base) : null;
  const fill = r.pattern === 'stripes' ? base : base;
  const hem = cut || r.hem || 262;
  let body;
  const closed = !r.open;
  if (r.open) body = BOTH(openPanel(m, r, fill, pat, hem, loose)) + details(m, r, fill, hem, loose, false);
  else body = torsoBody(m, r, fill, pat, hem, loose) + details(m, r, fill, hem, loose, closed);
  const top = r.neck === 'off' ? 186 : BODICE.has(r.neck) || r.straps ? 184 : 168;
  const sl = r.neck === 'oneshoulder' ? '' : sleeve(m, r.sleeve, loose, fill, pat, top);
  const sleeves = sl ? sl + MIRROR(sl) : '';
  const extras = r.neck === 'off' && r.sleeve === 'flutter' ? '' : '';
  return { body, sleeves: sleeves + extras, defs: pat?.defs || '' };
}

// ───────────── Rok ─────────────
export function skirt(m, sk, color, r, waistY = 262) {
  const pat = r.pattern ? pattern(r.pattern, color) : null;
  const W0 = m.W + 1.5 + (r.loose || 0), H0 = m.H + 2.5;
  const f = sk.flare || 0, len = sk.len;
  let P;
  switch (sk.shape) {
    case 'bell': P = [[waistY, W0], [Math.max(waistY + 18, 284), m.H + f * 0.3], [330, H0 + f * 0.62], [420, H0 + f * 0.9], [len, H0 + f]]; break;
    case 'pencil': P = [[waistY, W0], [308, H0], [len, H0 - 3]]; break;
    case 'mermaid': P = [[waistY, W0], [308, H0], [430, H0 - 5], [490, H0 + f * 0.45], [len, H0 + f]]; break;
    case 'tutu': P = [[waistY, W0], [286, H0 + f * 0.55], [len - 30, H0 + f * 0.95], [len, H0 + f]]; break;
    default: P = [[waistY, W0], [308, H0 + f * 0.12], [(308 + len) / 2, H0 + f * 0.6], [len, H0 + f]];
  }
  P = P.filter(([y], i) => i === 0 || i === P.length - 1 || y < len - 8);
  const L = P.map(([y, x]) => [CX - x, y]);
  const R = P.map(([y, x]) => [CX + x, y]).reverse();
  const hl = L[L.length - 1], hr = R[0];
  const span = hr[0] - hl[0];
  let hemSeg, extra = '';
  switch (sk.hem) {
    case 'curve': hemSeg = `Q${CX},${len + 9} ${pt(hr)}`; break;
    case 'ruffle': {
      const n = Math.max(6, Math.round(span / 12)), w = span / n;
      hemSeg = Array.from({ length: n }, (_, i) => `Q${r1(hl[0] + w * i + w / 2)},${len + 7} ${r1(hl[0] + w * (i + 1))},${len}`).join(' ');
      extra = LINE(`M${r1(hl[0] + 3)},${len - 14} ` + Array.from({ length: n }, () => `q${r1(w / 2)},4 ${r1(w)},0`).join(' '), 0.8, 0.5);
      break;
    }
    case 'scallop': {
      const n = Math.max(6, Math.round(span / 13)), w = span / n;
      hemSeg = Array.from({ length: n }, () => `a${r1(w / 2)},${r1(w / 2.4)} 0 0 0 ${r1(w)},0`).join(' ');
      break;
    }
    case 'zigzag': {
      const n = Math.max(8, Math.round(span / 9)), w = span / n;
      hemSeg = Array.from({ length: n }, (_, i) => `L${r1(hl[0] + w * (i + 0.5))},${len + (i % 2 ? 2 : 5)} L${r1(hl[0] + w * (i + 1))},${len}`).join(' ');
      break;
    }
    case 'asym': hemSeg = `L${pt([hr[0], len + 14])}`; break;
    case 'fringe': hemSeg = `Q${CX},${len + 3} ${pt(hr)}`; extra = Array.from({ length: Math.round(span / 4) }, (_, i) => LINE(`M${r1(hl[0] + 2 + i * 4)},${len + 1} l0,9`, 1.1, 0.8, shade(color, 0.12))).join(''); break;
    default: hemSeg = `Q${CX},${len + 5} ${pt(hr)}`;
  }
  const rightUp = sk.hem === 'asym' ? [[hr[0], len + 14], ...R.slice(1)] : R;
  const d = `M${pt(L[0])}${through(L)} ${hemSeg}${through(rightUp)} Z`;
  let s = (r.details || []).includes('tulle')
    ? FILL(d, color) + FILL(d, lighten(color, 0.45), 0.35) + LINE(d, 1, 0.7)
      + [0.3, 0.55, 0.8].map((t) => LINE(`M${r1(CX - interpX(P, waistY + (len - waistY) * t) + 4)},${r1(waistY + (len - waistY) * t)} q${r1(interpX(P, waistY + (len - waistY) * t) / 2)},6 ${r1(interpX(P, waistY + (len - waistY) * t) - 4)},2 q${r1(interpX(P, waistY + (len - waistY) * t) / 2)},-4 ${r1(interpX(P, waistY + (len - waistY) * t) - 4)},-2`, 0.7, 0.35)).join('')
    : filled(d, color, pat);
  s += extra;
  if (sk.shape === 'pleat') {
    const n = 9;
    for (let i = 1; i < n; i++) {
      const t = i / n;
      s += LINE(`M${r1(L[0][0] + (R[R.length - 1][0] - L[0][0]) * t)},${waistY + 8} L${r1(hl[0] + span * t)},${len - 1}`, 0.8, 0.45);
    }
  }
  if (sk.shape === 'tiered') {
    for (const ty of [waistY + (len - waistY) * 0.36, waistY + (len - waistY) * 0.68]) {
      const x = interpX(P, ty);
      s += LINE(`M${r1(CX - x)},${r1(ty)} ` + Array.from({ length: 8 }, () => `q${r1(x / 8)},4 ${r1(x / 4)},0`).join(' '), 0.9, 0.55);
    }
  }
  if (sk.shape === 'tutu') s += LINE(`M${r1(CX - H0 - f * 0.5)},${len - 24} ` + Array.from({ length: 8 }, () => `q${r1((H0 + f * 0.5) / 8)},6 ${r1((H0 + f * 0.5) / 4)},0`).join(' '), 0.8, 0.5);
  if ((r.details || []).includes('slit')) s += LINE(`M${CX + 18},${len} L${CX + 14},${len - 120}`, 0.9, 0.6);
  if ((r.details || []).includes('slitBack')) s += LINE(`M${CX},${len} L${CX},${len - 34}`, 0.8, 0.55);
  if ((r.details || []).includes('buttons') && r.skirt) for (let y = waistY + 14; y < len - 6; y += 14) s += button(CX, y, lighten(color, 0.4));
  s += LINE(`M${pt(L[0])} L${pt(R[R.length - 1])}`, 0.9, 0.55);
  return { svg: s, defs: pat?.defs || '' };
}
function interpX(P, y) {
  for (let i = 1; i < P.length; i++) if (y <= P[i][0]) { const [y0, x0] = P[i - 1], [y1, x1] = P[i]; return x0 + ((x1 - x0) * (y - y0)) / (y1 - y0); }
  return P[P.length - 1][1];
}

// ───────────── Celana ─────────────
export function pants(m, item, color) {
  const p = item.r.pants;
  const f = p.fit, len = p.len;
  const widen = (y) => (y > 380 ? (p.wide * (y - 380)) / Math.max(1, len - 380) : 0);
  const ys = [336, 380, 440, 490].filter((y) => y < len - 6);
  const O = [[CX - (m.W + 1 + f), 262], [CX - (m.H + 1 + f), 308], ...ys.map((y) => [CX - (m.legOut(y) + f + widen(y)), y]), [CX - (m.legOut(len) + f + widen(len)), len]];
  const inX = (y) => Math.max(0.6, m.legIn(y) - f * 0.4 - widen(y) * 0.35);
  const Ii = [[CX - inX(len), len], ...ys.slice().reverse().map((y) => [CX - inX(y), y]), [CX - 0.6, 344]];
  const leftHalf = `${through(O)} L${pt(Ii[0])}${through(Ii)}`;
  const Rin = Ii.slice().reverse().map(([x, y]) => [200 - x, y]);
  const Rout = O.slice().reverse().map(([x, y]) => [200 - x, y]);
  const d = `M${pt(O[0])}${leftHalf} L${pt(Rin[0])}${through(Rin)} L${pt(Rout[0])}${through(Rout)} Z`;
  let s = SHAPE(d, color, 1, 0.75);
  const dk = shade(color, 0.22);
  if (p.style === 'jeans') s += BOTH(LINE(`M${r1(CX - m.H - f + 3)},300 C${r1(CX - m.legOut(400) - f + 3)},400 ${r1(CX - m.legOut(480) - f + 3)},480 ${r1(CX - m.legOut(len) - f + 3)},${len - 2}`, 0.8, 0.85, GOLD)
    + LINE(`M${r1(CX - m.W - f + 2)},272 Q${CX - 20},284 ${CX - 14},270`, 0.8, 0.85, GOLD)) + LINE(`M${CX},264 L${CX},300 Q${CX + 2},306 ${CX + 8},304`, 0.8, 0.85, GOLD);
  if (p.style === 'trouser' || p.style === 'wide') s += BOTH(LINE(`M${r1(CX - (m.legOut(380) + m.legIn(380)) / 2 - f * 0.3)},300 L${r1(CX - (m.legOut(len) + m.legIn(len)) / 2 - widen(len) * 0.3)},${len - 2}`, 0.8, 0.45));
  if (p.style === 'wide') s += BOTH(LINE(`M${CX - m.W + 4},266 l-1,22 M${CX - m.W + 10},266 l-1,18`, 0.8, 0.45));
  if (p.style === 'shorts') s += BOTH(LINE(`M${r1(CX - m.legOut(len - 8) - f)},${len - 8} L${r1(CX - inX(len - 8))},${len - 8}`, 0.8, 0.55));
  // ban pinggang: digambar ulang di atas atasan yang dimasukkan
  const band = FILL(`M${CX - m.W - 1 - f},258 L${CX + m.W + 1 + f},258 L${r1(CX + m.sideX(270) + 1 + f)},270 L${r1(CX - m.sideX(270) - 1 - f)},270 Z`, color)
    + LINE(`M${CX - m.W - 1 - f},258 L${CX + m.W + 1 + f},258 M${r1(CX - m.sideX(270) - 1 - f)},270 L${r1(CX + m.sideX(270) + 1 + f)},270`, 0.9, 0.7)
    + BOTH(`<rect x="${CX - 20}" y="257" width="2.6" height="14" fill="${dk}"/>`) + button(CX, 264, p.style === 'jeans' ? GOLD : dk, 1.8);
  return { svg: s, band };
}

// ───────────── Kaus kaki & stoking ─────────────
export function legwear(m, item, color) {
  const r = item.r;
  const seg = (y0) => {
    const outer = [y0, 440, 490, 532].filter((y) => y >= y0).map((y) => [CX - m.legOut(y) - 0.4, y]);
    const inner = [532, 490, 440, y0].filter((y) => y >= y0).map((y) => [CX - m.legIn(y) + 0.4, y]);
    return `M${pt(outer[0])}${through(outer)} L${pt(inner[0])}${through(inner)} Z`;
  };
  if (r.kind === 'tights') {
    const outer = [300, 336, 380, 440, 490, 532].map((y) => [CX - m.legOut(y) - 0.3, y]);
    const inner = [532, 490, 440, 380, 336].map((y) => [CX - m.legIn(y) + 0.3, y]);
    const d = `M${pt(outer[0])}${through(outer)} L${pt(inner[0])}${through(inner)} L${CX},300 Z`;
    return BOTH(FILL(d, color, r.op) + FILL(footShape(m), color, r.op)) + LINE(`M${CX - m.legOut(436) + 6},440 q3,-2 6,0`, 0.8, 0.3, '#FFFFFF');
  }
  const y0 = r.kind === 'knee' ? 430 : 510;
  const s = SHAPE(seg(y0), color, 0.8, 0.6) + FILL(footShape(m), color) + (r.lace ? scallops(CX - m.legOut(y0) - 2, CX - m.legIn(y0) + 2, y0, 4, 1.8, color, false) : LINE(`M${r1(CX - m.legOut(y0 + 6))},${y0 + 6} L${r1(CX - m.legIn(y0 + 6))},${y0 + 6}`, 0.7, 0.5));
  return BOTH(s);
}
function footShape(m) {
  const k = m.sex === 'm' ? 1.15 : 1;
  const o = 17 * k, i = 8;
  return `M${r1(CX - o)},530 C${r1(CX - o - 1)},540 ${r1(CX - o - 7 * k)},549 ${r1(CX - o - 6 * k)},556 Q${r1(CX - o + 1)},561 ${CX - i - 1},558 C${CX - i + 1},552 ${CX - i + 1},540 ${CX - i},530 Z`;
}
export { bow, button, scallops };
