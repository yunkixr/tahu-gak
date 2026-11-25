// Sepatu & aksesori.

import { SHAPE, FILL, LINE, shade, lighten, through, MIRROR, BOTH, C, pt, r1, CX, GOLD, PEARL, INK } from './avatarRender.js';
import { bow, scallops } from './avatarClothes.js';

// ───────────── Sepatu (digambar di kaki kiri lalu dicerminkan) ─────────────
export function shoes(m, item, color) {
  const r = item.r;
  const k = m.sex === 'm' ? 1.15 : 1;
  const o = 17 * k, i = 8;
  const L = CX - o, Rr = CX - i;           // tepi luar & dalam pergelangan
  const toe = CX - o - 7 * k;
  const dk = shade(color, 0.22), lt = lighten(color, 0.45);
  const body = (topY, toeExt = 0, sole = 0) => `M${r1(L - 1)},${topY} C${r1(L - 5)},${topY + 5} ${r1(toe - 2 - toeExt)},551 ${r1(toe - 1 - toeExt * 1.4)},${557 + sole * 0.3} Q${r1(L + 1)},${562 + sole} ${r1(Rr - 1)},${559 + sole} C${r1(Rr + 1.5)},553 ${r1(Rr + 1.5)},${topY + 4} ${r1(Rr + 0.5)},${topY} Q${r1((L + Rr) / 2)},${topY + 3} ${r1(L - 1)},${topY} Z`;
  const shaft = (y0, ex = 1.5) => {
    const O = [y0, 490, 530].filter((y) => y >= y0).map((y) => [CX - m.legOut(y) - ex, y]);
    const I = [530, 490, y0].filter((y) => y >= y0).map((y) => [CX - m.legIn(y) + ex, y]);
    return `M${pt(O[0])}${through(O)} L${pt(I[0])}${through(I)} Z`;
  };
  const heel = (h) => SHAPE(`M${r1(Rr - 2)},556 L${r1(Rr - 1)},${556 + h} L${r1(Rr + 1.6)},${556 + h} L${r1(Rr + 1.2)},553 Z`, dk, 0.7, 0.8);
  const soleBand = (h, c) => FILL(`M${r1(toe - 3)},556 Q${r1(L + 1)},${561} ${r1(Rr + 1)},557 L${r1(Rr + 1)},${557 + h} Q${r1(L + 1)},${561 + h} ${r1(toe - 3)},${556 + h} Z`, c) + LINE(`M${r1(toe - 3)},556 Q${r1(L + 1)},${561} ${r1(Rr + 1)},557 L${r1(Rr + 1)},${557 + h} Q${r1(L + 1)},${561 + h} ${r1(toe - 3)},${556 + h} Z`, 0.8, 0.75);
  const strap = (y) => SHAPE(`M${r1(L - 2)},${y} L${r1(Rr + 1.5)},${y - 1} L${r1(Rr + 1.5)},${y + 2.4} L${r1(L - 2)},${y + 3.4} Z`, dk, 0.7, 0.8);
  let s;
  switch (r.kind) {
    case 'flat': s = SHAPE(body(542), color) + (r.bow ? bow(L - 2, 546, 0.38, dk) : ''); break;
    case 'maryjane': s = SHAPE(body(540), color) + strap(536) + (r.pearl ? [0, 1, 2].map((j) => C(L + 1 + j * 3, 537.6, 1.1, PEARL, 0.4)).join('') : `<circle cx="${r1(Rr)}" cy="537.6" r="1.2" fill="${GOLD}"/>`)
      + LINE(`M${r1(toe + 2)},552 q3,2 6,1`, 0.7, 0.4, '#FFFFFF'); break;
    case 'pump': s = heel(9) + SHAPE(body(545, 3), color) + LINE(`M${r1(toe + 1)},553 q3,1.6 6,1`, 0.8, 0.5, '#FFFFFF'); break;
    case 'kitten': s = heel(5) + SHAPE(body(544, 2), color); break;
    case 'slingback': s = heel(8) + SHAPE(body(545, 3), color) + LINE(`M${r1(Rr + 0.6)},546 Q${r1(Rr + 2)},538 ${r1(Rr - 2)},534`, 1.6, 1, color) + LINE(`M${r1(Rr + 0.6)},546 Q${r1(Rr + 2)},538 ${r1(Rr - 2)},534`, 0.5, 0.6); break;
    case 'strappy': s = heel(9) + LINE(`M${r1(toe - 1)},556 Q${r1(L + 1)},560.5 ${r1(Rr)},558`, 1.4, 1, color)
      + [[L - 4, 547, Rr + 1, 545], [toe, 553, L + 4, 550], [L - 1, 531, Rr + 1, 531]].map(([a, b, c2, d]) => LINE(`M${r1(a)},${b} L${r1(c2)},${d}`, 2, 1, color) + LINE(`M${r1(a)},${b} L${r1(c2)},${d}`, 0.5, 0.6)).join('')
      + LINE(`M${r1(Rr)},545 L${r1(Rr + 1)},531`, 1.4, 1, color); break;
    case 'platform': s = soleBand(8, shade(color, 0.3)) + SHAPE(body(541, 0, 0), color); break;
    case 'platformMj': s = soleBand(9, '#FFFCF6') + SHAPE(body(540), color) + strap(536) + `<circle cx="${r1(Rr)}" cy="537.6" r="1.2" fill="${GOLD}"/>`; break;
    case 'sneaker': s = soleBand(5, '#FFFCF6') + SHAPE(body(530, 1), color) + LINE(`M${r1(L + 1)},538 L${r1(Rr - 1)},537 M${r1(L)},542 L${r1(Rr - 1)},541 M${r1(L - 1)},546 L${r1(Rr - 1)},545`, 0.9, 0.7)
      + LINE(`M${r1(toe + 1)},552 Q${r1(L + 2)},550 ${r1(Rr)},549`, 1.6, 0.9, '#E9AFC0'); break;
    case 'boot': s = heel(6) + SHAPE(shaft(446, 1.8), color) + SHAPE(body(528), color) + LINE(`M${r1(CX - m.legOut(452) - 2)},452 L${r1(CX - m.legIn(452) + 2)},452`, 0.8, 0.55) + LINE(`M${r1(CX - m.legOut(470) - 1)},470 C${r1(CX - m.legOut(470) + 4)},490 ${r1(CX - m.legOut(500) + 2)},510 ${r1(L + 1)},526`, 1.4, 0.25, '#FFFFFF'); break;
    case 'ankle': s = heel(6) + SHAPE(shaft(506, 2), color) + SHAPE(body(528), color); break;
    case 'chelsea': s = SHAPE(shaft(504, 2), color) + SHAPE(body(528), color) + SHAPE(`M${r1(CX - m.legIn(506) - 1)},506 L${r1(CX - m.legIn(506) + 2.4)},506 L${r1(Rr + 1.6)},538 L${r1(Rr - 1.4)},538 Z`, dk, 0.6, 0.6)
      + LINE(`M${r1(CX - m.legOut(504) - 1)},504 l2,-5`, 1.2, 0.8, dk) + soleBand(3, dk); break;
    case 'combat': s = soleBand(5, '#2E2A2C') + SHAPE(shaft(496, 2.4), color) + SHAPE(body(528, 1), color)
      + [500, 508, 516, 524].map((y) => LINE(`M${r1(CX - (m.legOut(y) + m.legIn(y)) / 2 - 3)},${y} l6,4 M${r1(CX - (m.legOut(y) + m.legIn(y)) / 2 + 3)},${y} l-6,4`, 0.7, 0.8, '#FFFCF6')).join(''); break;
    case 'loafer': s = soleBand(2.5, dk) + SHAPE(body(538), color) + SHAPE(`M${r1(L - 1)},541 L${r1(Rr + 0.8)},540 L${r1(Rr + 0.8)},544 L${r1(L - 2)},545 Z`, dk, 0.6, 0.7) + LINE(`M${r1((L + Rr) / 2 - 2)},542.4 l4,0`, 1, 0.9, lt); break;
    case 'oxford': s = soleBand(2.5, dk) + SHAPE(body(534), color) + LINE(`M${r1(toe + 1)},548 Q${r1(L + 1)},545 ${r1(Rr)},546`, 0.8, 0.6) + LINE(`M${r1(L + 1)},537 l${r1(Rr - L - 3)},0 M${r1(L + 1)},540.5 l${r1(Rr - L - 3)},0`, 0.8, 0.8); break;
    case 'sandal': s = LINE(`M${r1(toe - 1)},557 Q${r1(L + 1)},561.5 ${r1(Rr)},559`, 2.2, 1, shade(color, 0.15))
      + [[L - 5, 549, Rr + 1, 547], [L - 1, 538, Rr + 1, 538]].map(([a, b, c2, d]) => LINE(`M${r1(a)},${b} L${r1(c2)},${d}`, 2.4, 1, color) + LINE(`M${r1(a)},${b} L${r1(c2)},${d}`, 0.5, 0.6)).join('')
      + LINE(`M${r1(L - 0.5)},531 L${r1(Rr + 0.5)},531`, 2, 1, color); break;
    case 'espadrille': s = soleBand(4, '#D9BF8A') + LINE(`M${r1(toe - 2)},559 l${r1(Rr - toe + 2)},1`, 0.6, 0.6) + SHAPE(body(540), color)
      + LINE(`M${r1(L)},536 C${r1(L + 2)},520 ${r1(Rr - 2)},520 ${r1(Rr)},508 M${r1(Rr)},536 C${r1(Rr - 2)},520 ${r1(L + 2)},520 ${r1(L)},508`, 1.2, 0.9, color); break;
    case 'ribbon': s = SHAPE(body(542), color)
      + [0, 1, 2].map((j) => { const y = 530 - j * 14; return LINE(`M${r1(CX - m.legOut(y) - 1)},${y} L${r1(CX - m.legIn(y - 12) + 1)},${y - 12} M${r1(CX - m.legIn(y) + 1)},${y} L${r1(CX - m.legOut(y - 12) - 1)},${y - 12}`, 1.6, 1, color); }).join('')
      + LINE(`M${r1(CX - m.legOut(490) - 1)},490 l-4,8 M${r1(CX - m.legOut(490) - 1)},490 l-1,10`, 1.4, 1, color); break;
    case 'clog': s = soleBand(6, '#B98D66') + SHAPE(`M${r1(L - 2)},536 C${r1(toe - 4)},538 ${r1(toe - 4)},556 ${r1(toe)},557 Q${r1(L + 1)},561 ${r1(Rr + 1)},558 C${r1(Rr + 2)},550 ${r1(Rr + 2)},540 ${r1(Rr + 0.5)},536 Z`, color)
      + C(L + 1, 544, 0.9, GOLD, 0) + C(Rr - 2, 544, 0.9, GOLD, 0); break;
    case 'rain': s = soleBand(4, dk) + SHAPE(shaft(454, 4), color) + SHAPE(body(528, 1), color) + LINE(`M${r1(CX - m.legOut(470) - 1)},470 L${r1(CX - m.legOut(520) + 1)},520`, 2, 0.35, '#FFFFFF'); break;
    case 'slipper': s = SHAPE(body(540, 1), color) + [0, 1, 2, 3, 4].map((j) => `<circle cx="${r1(L - 3 + j * 3)}" cy="${r1(540 + (j % 2))}" r="3.2" fill="${lt}" stroke="${INK}" stroke-width=".4" stroke-opacity=".5"/>`).join(''); break;
    default: s = SHAPE(body(542), color);
  }
  return BOTH(s);
}

// ───────────── Aksesori kepala & wajah ─────────────
export function headItem(id, color, layer) {
  const c = color || '#2E2A2C';
  const d = shade(c, 0.2);
  if (layer !== 'front') return '';
  switch (id) {
    case 'baret': return SHAPE('M60,57 C57,38 84,25 113,28 C138,30 151,43 144,55 C128,61 88,63 60,57 Z', c, 1.1, 0.85) + LINE('M62,57 C90,63 126,61 144,55', 1.6, 0.6, d) + LINE('M108,28 L110,21', 1.6, 0.85);
    case 'fedora': return SHAPE('M70,56 C68,33 80,25 100,25 C120,25 132,33 130,56 Z', c, 1.1, 0.85) + FILL('M70,49 C90,53 112,53 130,49 L130,56 C112,59 90,59 70,56 Z', d)
      + SHAPE('M42,59 C60,48 140,46 160,56 C151,65 54,67 42,59 Z', c, 1.1, 0.85) + LINE('M96,27 C98,33 100,39 100,45', 0.9, 0.5);
    case 'topi-lebar': return SHAPE('M74,52 C72,30 86,22 100,22 C114,22 128,30 126,52 Z', c, 1.1, 0.85) + SHAPE('M24,62 C40,44 160,42 176,60 C168,72 32,74 24,62 Z', c, 1.1, 0.85)
      + FILL('M73,46 C90,50 110,50 127,46 L127,53 C110,56 90,56 73,53 Z', '#E9AFC0') + bow(124, 50, 0.9, '#E9AFC0') + LINE('M40,60 C70,52 130,50 160,58', 0.8, 0.4);
    case 'kupluk': return SHAPE('M64,66 C62,36 82,24 100,24 C118,24 138,36 136,66 Z', c, 1.1, 0.85) + SHAPE('M60,60 C86,54 114,54 140,60 L140,72 C114,66 86,66 60,72 Z', d, 1, 0.8)
      + [70, 80, 90, 100, 110, 120, 130].map((x) => LINE(`M${x},59 L${x},69`, 0.7, 0.35)).join('') + SHAPE('M92,22 C92,12 108,12 108,22 C108,30 92,30 92,22 Z', '#F6F1E9', 1, 0.8);
    case 'bando': return LINE('M66,70 Q100,26 134,70', 4.4, 1, c) + LINE('M66,70 Q100,26 134,70', 0.7, 0.6);
    case 'bando-beludru': return LINE('M66,70 Q100,24 134,70', 8, 1, c) + LINE('M66,70 Q100,24 134,70', 0.8, 0.6) + LINE('M74,58 Q100,32 126,58', 1.4, 0.3, '#FFFFFF');
    case 'bando-mutiara': return LINE('M66,70 Q100,28 134,70', 2.4, 1, GOLD) + Array.from({ length: 11 }, (_, i) => { const t = i / 10; const x = (1 - t) ** 2 * 66 + 2 * (1 - t) * t * 100 + t * t * 134; const y = (1 - t) ** 2 * 70 + 2 * (1 - t) * t * 28 + t * t * 70; return C(x, y, 2.6, PEARL, 0.5); }).join('');
    case 'bando-kucing': return LINE('M64,66 Q100,28 136,66', 3.4, 1, c) + LINE('M64,66 Q100,28 136,66', 0.8, 0.7)
      + SHAPE('M70,52 L66,26 L88,40 Z', c, 1, 0.85) + SHAPE('M130,52 L134,26 L112,40 Z', c, 1, 0.85) + FILL('M72,46 L70,32 L82,40 Z', '#F3C9D3') + FILL('M128,46 L130,32 L118,40 Z', '#F3C9D3');
    case 'mahkota-bunga': return [[66, 64], [74, 50], [86, 41], [100, 38], [114, 41], [126, 50], [134, 64]].map(([x, y], i) => flowerAt(x, y, i % 2 ? '#F5E3B3' : c)).join('')
      + [[70, 57], [80, 45], [107, 39], [120, 45], [131, 57]].map(([x, y]) => SHAPE(`M${x},${y} q4,-4 7,0 q-4,4 -7,0 Z`, '#A9B89A', 0.6, 0.6)).join('');
    case 'tiara': return LINE('M74,53 Q100,41 126,53', 2, 1, GOLD) + LINE('M80,50 L84,41 L88,48 M94,46 L100,32 L106,46 M112,48 L116,41 L120,50', 1.4, 1, GOLD)
      + [[84, 40], [100, 31], [116, 40]].map(([x, y]) => C(x, y, 2.2, '#FFFBF5', 0)).join('') + `<circle cx="100" cy="31" r="2.2" fill="#F4B6C8" stroke="${GOLD}" stroke-width="1"/>`;
    case 'headphone': return LINE('M64,92 C60,38 140,38 136,92', 5, 1, INK) + LINE('M64,92 C60,38 140,38 136,92', 2.4, 1, c) + SHAPE('M56,82 h12 v24 h-12 Z', c, 1.1, 0.9) + SHAPE('M132,82 h12 v24 h-12 Z', c, 1.1, 0.9);
    default: return '';
  }
}
function flowerAt(x, y, c) {
  return [0, 72, 144, 216, 288].map((a) => { const rad = (a * Math.PI) / 180; return C(x + Math.cos(rad) * 3, y + Math.sin(rad) * 3, 2.6, c, 0.5); }).join('') + C(x, y, 1.6, '#F5E3B3', 0.4);
}

export function hijab(c, layer) {
  const d = shade(c, 0.12);
  if (layer === 'back') return SHAPE('M62,88 C58,48 80,30 100,30 C120,30 142,48 138,88 L140,132 L60,132 Z', c, 1.1, 0.8);
  if (layer === 'drape') return SHAPE('M60,118 C56,150 52,190 48,236 Q100,256 152,236 C148,190 144,150 140,118 Q100,150 60,118 Z', c, 1.1, 0.8)
    + LINE('M66,150 Q100,176 134,150', 0.9, 0.4) + LINE('M58,196 Q100,222 142,196', 0.9, 0.4);
  return SHAPE('M64,98 C62,58 80,36 100,36 C120,36 138,58 136,98 L133,124 C130,96 124,64 100,60 C76,64 70,96 67,124 Z', c, 1.1, 0.8)
    + SHAPE('M67,122 C70,138 84,148 100,148 C116,148 130,138 133,122 C128,132 116,138 100,138 C84,138 72,132 67,122 Z', d, 0.9, 0.6)
    + LINE('M70,110 C74,80 84,66 100,62', 0.9, 0.4) + LINE('M130,110 C126,80 116,66 100,62', 0.9, 0.35);
}

export function hairAcc(id, color, hairBack) {
  const c = color || '#F4B6C8';
  switch (id) {
    case 'pita-besar': return bow(126, 40, 1.3, c);
    case 'pita-dua': return bow(72, 58, 0.75, c) + bow(128, 58, 0.75, c);
    case 'pita-satin': return LINE('M120,44 C126,70 122,100 128,134 M124,44 C134,72 132,104 140,128', 2.4, 1, c) + LINE('M120,44 C126,70 122,100 128,134 M124,44 C134,72 132,104 140,128', 0.5, 0.6) + bow(122, 42, 1, c);
    case 'jepit-mutiara': return [[73, 64], [77, 58], [81, 53], [86, 49]].map(([x, y]) => C(x, y, 2.3, PEARL, 0.5)).join('');
    case 'jepit-kupu': return [[76, 58, -20], [124, 56, 20]].map(([x, y, a]) => `<g transform="rotate(${a} ${x} ${y})">${SHAPE(`M${x},${y} c-6,-6 -10,0 -6,4 c-4,2 -2,7 6,2 Z M${x},${y} c6,-6 10,0 6,4 c4,2 2,7 -6,2 Z`, c, 0.7, 0.75)}</g>`).join('');
    case 'jepit-bintang': return [[76, 60], [84, 52]].map(([x, y]) => SHAPE(`M${x},${y - 4} L${x + 1.2},${y - 1.2} L${x + 4},${y - 1} L${x + 1.8},${y + 0.9} L${x + 2.5},${y + 3.8} L${x},${y + 2.2} L${x - 2.5},${y + 3.8} L${x - 1.8},${y + 0.9} L${x - 4},${y - 1} L${x - 1.2},${y - 1.2} Z`, c, 0.6, 0.75)).join('');
    case 'bunga-telinga': return flowerAt(70, 86, c) + SHAPE('M74,92 q6,-2 8,2 q-6,3 -8,-2 Z', '#A9B89A', 0.6, 0.6);
    case 'scrunchie': return hairBack === 'ponyHigh' || hairBack === 'ponyLow' ? [0, 1, 2, 3, 4, 5].map((j) => C(120 + Math.cos(j) * 5, 46 + Math.sin(j) * 5, 3.4, c, 0.5)).join('')
      : [0, 1, 2, 3, 4, 5].map((j) => C(100 + Math.cos(j) * 6, 28 + Math.sin(j) * 4, 3.4, c, 0.5)).join('');
    default: return '';
  }
}

export function earrings(id) {
  switch (id) {
    case 'hoop': return BOTH(`<circle cx="69" cy="106" r="4.6" fill="none" stroke="${GOLD}" stroke-width="1.5"/>`);
    case 'mutiara': return BOTH(C(69, 103, 2.2, PEARL, 0.5));
    case 'hati': return BOTH(LINE('M69,101 L69,105', 0.8, 1, GOLD) + `<path d="M69,112 C64,108 65,104 67.5,104.5 C68.5,104.7 69,105.6 69,106 C69,105.6 69.5,104.7 70.5,104.5 C73,104 74,108 69,112 Z" fill="#E9AFC0" stroke="${INK}" stroke-width=".5"/>`);
    case 'juntai': return BOTH(LINE('M69,101 L69,114', 0.9, 1, GOLD) + C(69, 108, 1.4, GOLD, 0) + C(69, 116, 2.2, PEARL, 0.5));
    case 'pita': return BOTH(bow(69, 104, 0.45, '#E9AFC0'));
    default: return '';
  }
}

export function glasses(id, color) {
  const arms = LINE('M76,88 L69,86 M124,88 L131,86', 1.2, 0.85);
  const catL = 'M75,85 Q86,81 96,84.5 L95,92 Q86,96.5 78,92.5 Z', catR = 'M125,85 Q114,81 104,84.5 L105,92 Q114,96.5 122,92.5 Z';
  switch (id) {
    case 'bulat': return `<circle cx="86" cy="89" r="9" fill="#fff" fill-opacity=".12" stroke="${INK}" stroke-width="1.4"/><circle cx="114" cy="89" r="9" fill="#fff" fill-opacity=".12" stroke="${INK}" stroke-width="1.4"/>` + LINE('M95,88 Q100,86 105,88', 1.2) + LINE('M77,88 L70,86 M123,88 L130,86', 1.2, 0.85);
    case 'cat-eye': return FILL(catL, '#fff', 0.12) + FILL(catR, '#fff', 0.12) + LINE(catL, 1.5) + LINE(catR, 1.5) + LINE('M75,85 l-2.5,-2.6 M125,85 l2.5,-2.6', 1.4) + LINE('M96,87 Q100,85.6 104,87', 1.2) + arms;
    case 'oval-tipis': return `<ellipse cx="86" cy="89.5" rx="9.5" ry="6.5" fill="#fff" fill-opacity=".1" stroke="${GOLD}" stroke-width="1"/><ellipse cx="114" cy="89.5" rx="9.5" ry="6.5" fill="#fff" fill-opacity=".1" stroke="${GOLD}" stroke-width="1"/>` + LINE('M95.5,88.5 Q100,86.6 104.5,88.5', 0.9, 1, GOLD) + LINE('M76.5,88 L69,86 M123.5,88 L131,86', 0.9, 1, GOLD);
    case 'hitam': return FILL(catL, '#2E2A2C', 0.93) + FILL(catR, '#2E2A2C', 0.93) + LINE(catL, 1.3) + LINE(catR, 1.3) + LINE('M80,86.5 L85,86 M108,86 L113,86.5', 1, 0.5, '#FFFFFF') + LINE('M75,85 l-2.5,-2.6 M125,85 l2.5,-2.6', 1.4) + LINE('M96,87 Q100,85.6 104,87', 1.4) + arms;
    case 'hati': {
      const h = (x) => `M${x},97 C${x - 11},90 ${x - 10},81 ${x - 4.5},82 C${x - 2},82.4 ${x},84.5 ${x},86 C${x},84.5 ${x + 2},82.4 ${x + 4.5},82 C${x + 10},81 ${x + 11},90 ${x},97 Z`;
      return FILL(h(86), color || '#E9AFC0', 0.85) + FILL(h(114), color || '#E9AFC0', 0.85) + LINE(h(86), 1.2) + LINE(h(114), 1.2) + LINE('M96,86 Q100,84.6 104,86', 1.2) + arms;
    }
    default: return '';
  }
}

// ───────────── Leher, tangan, tas ─────────────
export function neckItem(id, color, m) {
  const c = color || '#F4B6C8';
  const d = shade(c, 0.2);
  switch (id) {
    case 'kalung-mutiara': return Array.from({ length: 13 }, (_, i) => { const t = i / 12; const x = (1 - t) ** 2 * (CX - 14) + 2 * (1 - t) * t * CX + t * t * (CX + 14); const y = (1 - t) ** 2 * 164 + 2 * (1 - t) * t * 196 + t * t * 164; return C(x, y, 1.9, PEARL, 0.45); }).join('');
    case 'choker-beludru': return SHAPE(`M${CX - m.nk + 0.5},146 Q${CX},150 ${CX + m.nk - 0.5},146 L${CX + m.nk - 0.5},151 Q${CX},155 ${CX - m.nk + 0.5},151 Z`, c, 0.7, 0.7) + `<circle cx="${CX}" cy="155" r="1.6" fill="${GOLD}"/>`;
    case 'choker-renda': return SHAPE(`M${CX - m.nk + 0.5},146 Q${CX},150 ${CX + m.nk - 0.5},146 L${CX + m.nk - 0.5},150 Q${CX},154 ${CX - m.nk + 0.5},150 Z`, c, 0.6, 0.6) + scallops(CX - m.nk + 1, CX + m.nk - 1, 152, 5, 1.2, c, true);
    case 'liontin': return LINE(`M${CX - 12},162 Q${CX - 6},190 ${CX},194 Q${CX + 6},190 ${CX + 12},162`, 0.7, 1, GOLD)
      + `<path d="M${CX},203 C${CX - 6},198 ${CX - 6},193 ${CX - 3},193 C${CX - 1.4},193 ${CX},194.4 ${CX},195 C${CX},194.4 ${CX + 1.4},193 ${CX + 3},193 C${CX + 6},193 ${CX + 6},198 ${CX},203 Z" fill="${GOLD}" stroke="${INK}" stroke-width=".5"/>`;
    case 'syal': return SHAPE(`M${CX - 16},158 Q${CX},170 ${CX + 16},158 L${CX + 15},166 Q${CX},176 ${CX - 15},166 Z`, c, 0.9, 0.75)
      + SHAPE(`M${CX + 2},170 L${CX + 14},196 L${CX + 6},198 Z`, d, 0.8, 0.75) + SHAPE(`M${CX},170 L${CX - 8},192 L${CX - 1},190 Z`, c, 0.8, 0.75) + C(CX + 1, 170, 3, d, 0.6);
    case 'syal-rajut': return SHAPE(`M${CX - 22},160 C${CX - 22},150 ${CX + 22},150 ${CX + 22},160 L${CX + 22},172 C${CX + 10},180 ${CX - 10},180 ${CX - 22},172 Z`, c, 1, 0.8)
      + SHAPE(`M${CX + 6},174 L${CX + 18},174 L${CX + 20},272 L${CX + 8},272 Z`, c, 0.9, 0.75) + LINE(`M${CX + 8},266 l0,10 M${CX + 12},266 l0,10 M${CX + 16},266 l0,10`, 0.8, 0.6, d)
      + [154, 162, 170].map((y) => LINE(`M${CX - 20},${y} Q${CX},${y + 6} ${CX + 20},${y}`, 0.6, 0.35)).join('');
    case 'dasi': return SHAPE(`M${CX - 3},162 L${CX + 3},162 L${CX + 5},236 L${CX},244 L${CX - 5},236 Z`, c, 0.8, 0.8) + SHAPE(`M${CX - 4},158 L${CX + 4},158 L${CX + 3},165 L${CX - 3},165 Z`, d, 0.7, 0.7);
    case 'dasi-kupu': return SHAPE(`M${CX},162 L${CX - 9},156 L${CX - 9},168 Z M${CX},162 L${CX + 9},156 L${CX + 9},168 Z`, c, 0.8, 0.8) + C(CX, 162, 2.2, d, 0.6);
    default: return '';
  }
}

export function wristItem(id, color, m) {
  const y = 322;
  const x0 = CX - m.armOut(y) - 1.4, x1 = CX - m.armIn(y) + 1.4;
  const cx = (x0 + x1) / 2, rx = (x1 - x0) / 2;
  switch (id) {
    case 'gelang-mutiara': return Array.from({ length: 6 }, (_, i) => C(x0 + 1 + i * ((x1 - x0 - 2) / 5), y + 1.4 * Math.sin((i / 5) * Math.PI), 1.7, PEARL, 0.45)).join('');
    case 'gelang-emas': return `<ellipse cx="${r1(cx)}" cy="${y}" rx="${r1(rx)}" ry="2.2" fill="none" stroke="${GOLD}" stroke-width="2"/>`;
    case 'jam': return `<rect x="${r1(x0)}" y="${y - 2.4}" width="${r1(x1 - x0)}" height="4.8" fill="${color || '#7C5640'}" stroke="${INK}" stroke-width=".5"/>` + C(cx, y, 3.4, '#FFFCF6', 0.8) + `<circle cx="${r1(cx)}" cy="${y}" r="3.4" fill="none" stroke="${GOLD}" stroke-width="1"/>`;
    case 'gelang-manik': return ['#F4B6C8', '#C9B8DA', '#DCE5CE', '#F5E3B3', '#D7E4EA', '#F4B6C8'].map((c, i) => C(x0 + 1 + i * ((x1 - x0 - 2) / 5), y + 1.2 * Math.sin((i / 5) * Math.PI), 1.6, c, 0.4)).join('');
    default: return '';
  }
}

export function ringItem(id, color, m) {
  const { x, y } = m.hand;
  if (id === 'cincin-emas') return `<ellipse cx="${r1(x - 1)}" cy="${y + 13}" rx="2.2" ry="1" fill="none" stroke="${GOLD}" stroke-width="1.3"/>`;
  if (id === 'cincin-permata') return `<ellipse cx="${r1(x - 1)}" cy="${y + 13}" rx="2.2" ry="1" fill="none" stroke="${GOLD}" stroke-width="1.3"/>` + C(x - 1, y + 11.6, 1.6, color || '#B6A2CF', 0.5);
  return '';
}

/** Tas: { back, front }. Tas tangan dipegang tangan kanan (digambar sebelum tangan). */
export function bagItem(id, color, m) {
  const c = color || '#2E2A2C';
  const d = shade(c, 0.2);
  const hx = 200 - m.hand.x, hy = m.hand.y + 12;
  switch (id) {
    case 'tas-tangan': return SHAPE(`M${hx - 8},${hy - 2} Q${hx},${hy - 16} ${hx + 8},${hy - 2}`, 'none', 2.2, 0.85).replace('fill="none"', 'fill="none"')
      + SHAPE(`M${hx - 13},${hy} L${hx + 13},${hy} L${hx + 15},${hy + 26} Q${hx},${hy + 30} ${hx - 15},${hy + 26} Z`, c, 1, 0.85) + LINE(`M${hx - 13},${hy + 8} L${hx + 13},${hy + 8}`, 0.8, 0.5) + `<rect x="${hx - 3}" y="${hy + 6}" width="6" height="5" rx="1" fill="${GOLD}"/>`;
    case 'tas-keranjang': return LINE(`M${hx - 10},${hy + 2} Q${hx},${hy - 20} ${hx + 10},${hy + 2}`, 2.4, 1, shade(c, 0.25))
      + SHAPE(`M${hx - 16},${hy + 2} L${hx + 16},${hy + 2} Q${hx + 14},${hy + 30} ${hx},${hy + 30} Q${hx - 14},${hy + 30} ${hx - 16},${hy + 2} Z`, c, 1, 0.85)
      + [8, 14, 20, 26].map((dy) => LINE(`M${hx - 15},${hy + dy} Q${hx},${hy + dy + 3} ${hx + 15},${hy + dy}`, 0.7, 0.5)).join('') + [-8, 0, 8].map((dx) => LINE(`M${hx + dx},${hy + 3} L${hx + dx * 0.8},${hy + 29}`, 0.7, 0.45)).join('')
      + flowerAt(hx - 9, hy + 3, '#F4B6C8');
    case 'tas-hati': return LINE(`M${hx - 6},${hy + 2} Q${hx},${hy - 14} ${hx + 6},${hy + 2}`, 2, 1, GOLD)
      + SHAPE(`M${hx},${hy + 30} C${hx - 20},${hy + 18} ${hx - 18},${hy + 1} ${hx - 9},${hy + 1} C${hx - 4},${hy + 1} ${hx},${hy + 5} ${hx},${hy + 8} C${hx},${hy + 5} ${hx + 4},${hy + 1} ${hx + 9},${hy + 1} C${hx + 18},${hy + 1} ${hx + 20},${hy + 18} ${hx},${hy + 30} Z`, c, 1, 0.85)
      + LINE(`M${hx - 10},${hy + 8} q3,-3 6,-2`, 1.4, 0.4, '#FFFFFF');
    case 'tas-bahu': return LINE(`M${CX - m.S + 12},172 L${CX + m.H - 2},292`, 2.4, 1, d) + LINE(`M${CX - m.S + 12},172 L${CX + m.H - 2},292`, 0.5, 0.6)
      + SHAPE(`M${CX + m.H - 14},290 L${CX + m.H + 10},290 L${CX + m.H + 10},308 Q${CX + m.H - 2},312 ${CX + m.H - 14},308 Z`, c, 1, 0.85) + SHAPE(`M${CX + m.H - 14},290 L${CX + m.H + 10},290 L${CX + m.H + 8},298 L${CX + m.H - 12},298 Z`, d, 0.7, 0.7);
    case 'tas-mini': return LINE(`M${CX + m.S - 12},172 L${CX - m.H + 2},294`, 1.4, 1, GOLD).replace('stroke-linecap="round"', 'stroke-dasharray="2 1.4" stroke-linecap="round"')
      + SHAPE(`M${CX - m.H - 8},292 L${CX - m.H + 8},292 L${CX - m.H + 8},304 Q${CX - m.H},307 ${CX - m.H - 8},304 Z`, c, 0.9, 0.85) + SHAPE(`M${CX - m.H - 8},292 L${CX - m.H + 8},292 L${CX - m.H},299 Z`, d, 0.7, 0.75) + C(CX - m.H, 298, 1.2, GOLD, 0);
    case 'tote': {
      const x = CX - m.S - 6;
      return LINE(`M${CX - m.S + 8},172 L${x + 8},272 M${CX - m.S + 2},175 L${x - 6},272`, 2, 1, d)
        + SHAPE(`M${x - 14},270 L${x + 14},270 L${x + 16},322 L${x - 16},322 Z`, c, 1, 0.85) + LINE(`M${x - 6},288 q6,-6 12,0 q-6,6 -12,0`, 0.9, 0.55);
    }
    default: return '';
  }
}
