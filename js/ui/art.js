// Ilustrasi orisinal bergaya tinta + cat air (SVG).
//
// - Garis tinta memakai filter #ink (sedikit goyah seperti digambar tangan).
// - Warna memakai filter #wash (tepi meleber seperti cat air), sedikit bergeser dari garis.
// - Kedua filter didefinisikan sekali di index.html dan dipakai bersama.
// Semua gambar dekoratif: aria-hidden, tidak menerima klik.

import { h } from './dom.js';

export const C = {
  ink: '#3D3335', pink: '#F7DCE2', rose: '#E9AFC0', roseDeep: '#C98299', vintage: '#B76E8B',
  cream: '#FFF8ED', sage: '#C9D1B8', leaf: '#A9B89A', lavender: '#E2D6EC', butter: '#F5E3B3',
  sky: '#D7E4EA', wood: '#D9BFA6', grey: '#CFC8D6',
};

const ink = (d, w = 1.8) => `<path d="${d}" fill="none" stroke="${C.ink}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" filter="url(#ink)"/>`;
const wash = (d, fill, dx = 1.2, dy = 0.8) => `<path d="${d}" fill="${fill}" filter="url(#wash)" transform="translate(${dx} ${dy})"/>`;
const circ = (cx, cy, r, fill, inked = true, w = 1.6) =>
  `<circle cx="${cx + 1}" cy="${cy + 0.6}" r="${r}" fill="${fill}" filter="url(#wash)"/>` +
  (inked ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.ink}" stroke-width="${w}" filter="url(#ink)"/>` : '');
const both = (d, fill, w) => wash(d, fill) + ink(d, w);
const svg = (vb, inner, cls = '') => `<svg viewBox="${vb}" class="art ${cls}" aria-hidden="true" focusable="false">${inner}</svg>`;

// ───────────── Ornamen kecil ─────────────
const STAR_D = 'M20,3 L24.5,15 L37,15.5 L27,23 L31,36 L20,28 L9,36 L13,23 L3,15.5 L15.5,15 Z';
const SPARKLE_D = 'M20,2 C21,14 26,19 38,20 C26,21 21,26 20,38 C19,26 14,21 2,20 C14,19 19,14 20,2 Z';

export const star = (fill = C.butter) => svg('0 0 40 40', both(STAR_D, fill, 1.6));
export const sparkle = (fill = C.pink) => svg('0 0 40 40', both(SPARKLE_D, fill, 1.4));

export function rose() {
  return svg('0 0 60 64',
    wash('M14,46 Q6,34 20,34 Q24,44 14,46 Z', C.leaf) + wash('M46,46 Q54,34 40,34 Q36,44 46,46 Z', C.leaf)
    + circ(30, 27, 16, C.rose, false)
    + ink('M14,46 Q6,34 20,34 Q24,44 14,46 Z M46,46 Q54,34 40,34 Q36,44 46,46 Z', 1.4)
    + ink('M30,28 C26,24 33,20 36,25 C39,31 29,36 24,30 C19,23 31,13 40,19 C47,25 43,38 32,41 C21,43 12,35 16,24 C19,15 28,10 36,12')
    + ink('M30,43 L30,62', 1.6));
}

export function floralCorner() {
  const bud = (x, y) => circ(x, y, 3.2, C.rose, true, 1.2);
  return svg('0 0 140 140',
    ink('M4,136 C10,92 34,56 70,36 C92,24 114,14 136,6', 1.5)
    + wash('M30,84 C20,78 22,64 34,68 C40,72 38,82 30,84 Z', C.leaf) + ink('M30,84 C20,78 22,64 34,68 C40,72 38,82 30,84 Z', 1.2)
    + wash('M58,46 C56,34 70,30 72,40 C72,48 64,50 58,46 Z', C.leaf) + ink('M58,46 C56,34 70,30 72,40 C72,48 64,50 58,46 Z', 1.2)
    + wash('M98,22 C94,12 108,8 110,18 C110,26 102,26 98,22 Z', C.leaf) + ink('M98,22 C94,12 108,8 110,18 C110,26 102,26 98,22 Z', 1.2)
    + circ(46, 66, 10, C.rose, false) + ink('M46,66 C43,63 49,60 51,64 C53,69 45,72 42,67 C39,61 48,55 54,60 C58,65 54,73 46,75', 1.3)
    + circ(84, 34, 8, C.pink, false) + ink('M84,34 C82,32 86,30 87,33 C88,37 82,38 80,35 C78,30 85,27 89,30', 1.2)
    + bud(20, 110) + bud(120, 10) + bud(70, 20), 'corner');
}

export function bow(fill = C.rose) {
  const L = 'M45,26 C30,8 6,10 9,25 C12,40 32,38 45,26 Z';
  const R = 'M45,26 C60,8 84,10 81,25 C78,40 58,38 45,26 Z';
  const T1 = 'M42,30 L30,56 L38,52 L42,58 L47,32 Z';
  const T2 = 'M48,30 L60,56 L52,52 L48,58 L43,32 Z';
  return svg('0 0 90 62', both(T1, fill, 1.4) + both(T2, fill, 1.4) + both(L, fill, 1.6) + both(R, fill, 1.6)
    + ink('M20,22 C26,26 32,27 38,26 M70,22 C64,26 58,27 52,26', 1.1) + circ(45, 27, 6, C.roseDeep, true, 1.5), 'bow');
}

export function books() {
  return svg('0 0 90 72',
    both('M8,50 L82,50 L82,64 L8,64 Z', C.sage) + ink('M14,57 L70,57', 1.1)
    + both('M14,36 L76,36 L76,50 L14,50 Z', C.rose) + ink('M20,43 L64,43', 1.1)
    + both('M20,22 L66,26 L65,36 L19,32 Z', C.lavender) + ink('M26,29 L56,32', 1.1)
    + both('M58,24 L62,24 L62,44 L60,41 L58,44 Z', C.roseDeep, 1.2), 'books');
}

export function letter() {
  return svg('0 0 90 64',
    both('M6,10 L84,10 L84,58 L6,58 Z', C.cream) + ink('M6,10 L45,38 L84,10 M6,58 L36,32 M84,58 L54,32', 1.4)
    + circ(45, 38, 7.5, C.vintage, true, 1.4) + ink('M42,37 C42,34 45,34 45,37 C45,34 48,34 48,37 C48,40 45,42 45,43 C45,42 42,40 42,37 Z', 1), 'letter');
}

export function teacup() {
  return svg('0 0 72 62',
    both('M6,52 C14,58 58,58 66,52 C58,48 14,48 6,52 Z', C.cream, 1.4)
    + both('M14,22 L56,22 C56,42 46,50 35,50 C24,50 14,42 14,22 Z', C.pink)
    + ink('M56,28 C67,27 67,40 54,40', 1.6) + ink('M20,30 C28,34 42,34 50,30', 1)
    + ink('M28,16 C24,12 32,8 28,3 M38,16 C34,12 42,8 38,3', 1.2), 'teacup');
}

export function cupcake(fill = C.rose) {
  return svg('0 0 64 70',
    both('M14,38 L50,38 L45,66 L19,66 Z', C.cream, 1.3) + ink('M22,40 L24,64 M32,40 L32,64 M42,40 L40,64', 1)
    + both('M10,40 C6,30 14,22 22,24 C22,14 42,12 44,22 C52,20 60,30 54,40 Z', fill)
    + ink('M18,34 Q28,30 34,34 Q42,38 48,32', 1) + circ(32, 14, 4.5, C.roseDeep, true, 1.1) + ink('M32,10 Q34,5 38,4', 1.1), 'cupcake');
}

// ───────────── Pemandangan ─────────────
export function lamp() {
  return svg('0 0 60 220',
    `<g class="lamp-glow">${circ(30, 52, 22, C.butter, false)}</g>`
    + both('M20,216 L40,216 L37,200 L23,200 Z', C.grey, 1.6)
    + ink('M27,200 L28,72 M33,200 L32,72 M23,74 L37,74', 1.6)
    + ink('M28,92 C18,90 14,100 22,102 M32,92 C42,90 46,100 38,102', 1.3)
    + both('M18,44 L42,44 L38,70 L22,70 Z', C.butter, 1.6) + ink('M30,44 L30,70', 1)
    + both('M13,44 L30,28 L47,44 Z', C.grey, 1.6) + ink('M30,28 L30,20', 1.4) + circ(30, 18, 2.6, C.grey, true, 1.2), 'lamp');
}

export function cafe() {
  const chair = (x, flip) => {
    const s = flip ? -1 : 1;
    const X = (v) => x + s * v;
    return ink(`M${X(0)},58 L${X(-4)},104 M${X(22)},58 L${X(26)},104 M${X(-2)},58 L${X(24)},58`, 1.5)
      + ink(`M${X(0)},58 C${X(-4)},34 ${X(4)},20 ${X(11)},20 C${X(18)},20 ${X(26)},34 ${X(22)},58`, 1.5)
      + ink(`M${X(4)},30 L${X(18)},30 M${X(3)},40 L${X(19)},40 M${X(2)},50 L${X(20)},50`, 0.9)
      + wash(`M${X(-2)},56 C${X(4)},50 ${X(18)},50 ${X(24)},56 L${X(24)},60 L${X(-2)},60 Z`, C.rose);
  };
  return svg('0 0 160 110',
    chair(18, false) + chair(142, true)
    + wash('M46,52 C46,44 114,44 114,52 C114,60 46,60 46,52 Z', C.cream)
    + ink('M46,52 C46,44 114,44 114,52 C114,60 46,60 46,52 Z', 1.6)
    + ink('M80,59 L80,98 M66,105 Q80,95 94,105', 1.6)
    + both('M68,40 L80,40 C80,47 77,49 74,49 C71,49 68,47 68,40 Z', C.pink, 1.2)
    + both('M86,46 C86,40 98,40 98,46 Z', C.rose, 1.2) + both('M86,40 C86,34 98,34 98,40 Z', C.sage, 1.2), 'cafe');
}

export function storefront() {
  const win = (x, y, w, hgt) => both(`M${x},${y} L${x + w},${y} L${x + w},${y + hgt} L${x},${y + hgt} Z`, C.sky, 1.5)
    + ink(`M${x + w / 2},${y} L${x + w / 2},${y + hgt} M${x},${y + hgt / 2} L${x + w},${y + hgt / 2}`, 1);
  const planter = (x, y, w) => [0, 1, 2, 3].map((i) => circ(x + 4 + i * (w - 8) / 3, y - 2, 3.6, i % 2 ? C.rose : C.pink, true, 1)).join('')
    + ink(`M${x + 2},${y + 1} q2,-4 5,-3 M${x + w - 2},${y + 1} q-2,-4 -5,-3`, 0.9)
    + both(`M${x - 4},${y} L${x + w + 4},${y} L${x + w + 1},${y + 9} L${x - 1},${y + 9} Z`, C.wood, 1.2);
  const stripes = Array.from({ length: 12 }, (_, i) => {
    const x0 = 78 + i * 20.5;
    return wash(`M${x0},150 L${x0 + 20.5},150 L${x0 + 20.5},172 L${x0},172 Z`, i % 2 ? C.cream : C.rose, 0.6, 0.4);
  }).join('');
  const scallop = Array.from({ length: 12 }, (_, i) => `Q${88 + i * 20.5},${184} ${98.5 + i * 20.5},172`).join(' ');
  return svg('0 0 430 290',
    // langit: awan, matahari, burung
    wash('M250,40 C280,10 360,8 390,40 C400,70 380,110 330,112 C290,110 250,80 250,40 Z', C.pink, 0, 0)
    + `<g class="sf-sun">${circ(386, 60, 12, C.butter, true, 1.2)}</g>`
    + `<g class="sf-cloud"><g transform="translate(22 -18)">${both('M300,62 C300,52 316,50 320,56 C324,46 342,48 342,60 C350,60 352,70 344,72 L304,72 C296,72 294,64 300,62 Z', '#FFFCF6', 1.2)}</g></g>`
    + `<g class="sf-birds">${ink('M352,92 q5,-5 10,0 q5,-5 10,0', 1.2)}</g><g class="sf-birds b2">${ink('M376,80 q4,-4 8,0 q4,-4 8,0', 1.2)}</g>`
    // atap pelana dengan jendela loteng bundar
    + both('M58,64 L200,16 L342,64 Z', C.rose)
    + ink('M100,50 L300,50 M134,38 L266,38', 0.9) + both('M186,44 a14,14 0 1 0 28,0 a14,14 0 1 0 -28,0', C.sky, 1.3)
    // fasad
    + wash('M72,62 L328,62 L328,252 L72,252 Z', '#FBEFE6', 0, 0) + ink('M72,62 L72,252 M328,62 L328,252', 1.6)
    + win(98, 72, 44, 40) + win(178, 72, 44, 40) + win(258, 72, 44, 40)
    + planter(98, 116, 44) + planter(178, 116, 44) + planter(258, 116, 44)
    // papan nama
    + both('M82,128 L318,128 L318,150 L82,150 Z', C.rose)
    + `<text x="200" y="144" text-anchor="middle" font-family="IM Fell English, Cormorant Garamond, Georgia, serif" font-style="italic" font-size="18" font-weight="400" letter-spacing="0.3" fill="${C.ink}">tahu gak?</text>`
    // kanopi bergaris
    + stripes + ink(`M78,150 L324,150 M78,150 L78,172 ${scallop}`, 1.5)
    // etalase
    + both('M82,184 L318,184 L318,252 L82,252 Z', C.roseDeep, 1.6)
    + win(92, 192, 80, 50) + win(228, 192, 80, 50)
    + both('M184,252 L184,206 Q200,186 216,206 L216,252 Z', C.sky, 1.6) + ink('M200,190 L200,252', 1) + circ(210, 226, 1.8, C.butter, true, 1)
    // isi etalase: kue & buku
    + both('M110,236 L150,236 M130,236 L130,226 M114,226 L146,226 Z', C.cream, 1.2)
    + both('M116,226 C116,212 144,212 144,226 Z', C.pink, 1.2) + circ(130, 210, 3, C.rose, true, 1)
    + both('M238,236 L278,236 L278,228 L238,228 Z', C.sage, 1.1) + both('M242,228 L274,228 L274,220 L242,220 Z', C.lavender, 1.1)
    + both('M284,236 L298,236 C298,228 296,226 291,226 C286,226 284,228 284,236 Z', C.pink, 1.1)
    // pot bunga di samping pintu
    + both('M166,252 L176,252 L174,240 L168,240 Z', C.wood, 1.2) + circ(171, 232, 9, C.leaf, true, 1.3)
    + both('M224,252 L234,252 L232,240 L226,240 Z', C.wood, 1.2) + circ(229, 232, 9, C.leaf, true, 1.3)
    // trotoar & batu jalan
    + ink('M20,252 L420,252', 1.6) + ink('M30,264 Q60,258 90,264 M120,268 Q150,262 180,268 M220,264 Q250,258 280,264 M310,270 Q340,264 370,270 M60,280 Q90,274 120,280 M250,282 Q280,276 310,282', 1)
    // lampu jalan & pot mawar besar
    + `<g transform="translate(18 64) scale(.86)">${lamp().replace(/<svg[^>]*>|<\/svg>/g, '')}</g>`
    + (() => { const r = rose().replace(/<svg[^>]*>|<\/svg>/g, ''); return `<g transform="translate(339.5 190) scale(.55)">${r}</g><g transform="translate(363.5 190) scale(.55)">${r}</g><g transform="translate(347 180) scale(.7)">${r}</g>`; })()
    + both('M352,252 L384,252 L388,222 L348,222 Z', C.wood, 1.4) + ink('M350,230 L386,230', 1), 'storefront');
}

// ───────────── Kategori ─────────────
export const CATEGORY_ART = {
  sains: () => svg('0 0 80 80',
    wash('M27,46 L53,46 L62,66 Q64,70 58,70 L22,70 Q16,70 18,66 Z', C.lavender)
    + ink('M32,10 L48,10 M34,10 L34,32 L16,66 Q14,72 22,72 L58,72 Q66,72 64,66 L46,32 L46,10') + ink('M27,46 L53,46', 1.2)
    + circ(40, 56, 2.6, C.cream, true, 1) + circ(47, 50, 1.8, C.cream, true, 1) + circ(33, 61, 1.6, C.cream, true, 1)
    + ink('M58,14 L60,8 M64,20 L70,18 M60,26 L66,30', 1.2)),
  sejarah: () => svg('0 0 80 80',
    wash('M22,22 L58,22 L54,64 L26,64 Z', C.cream)
    + both('M16,12 L64,12 L60,22 L20,22 Z', C.rose, 1.6) + circ(18, 17, 4, C.rose, true, 1.2) + circ(62, 17, 4, C.rose, true, 1.2)
    + ink('M26,22 L28,64 M54,22 L52,64 M36,24 L37,62 M44,24 L43,62') + both('M20,64 L60,64 L64,72 L16,72 Z', C.sage, 1.6)),
  geografi: () => svg('0 0 80 80',
    circ(40, 32, 21, C.sky) + wash('M30,22 C34,16 42,18 40,26 C38,32 30,30 30,22 Z', C.leaf) + wash('M44,36 C50,32 56,38 50,44 C46,46 42,42 44,36 Z', C.leaf)
    + ink('M40,11 C28,22 28,42 40,53 M19,32 C30,36 50,36 61,32', 1.1) + ink('M14,30 C14,54 32,62 48,59 M40,53 L40,64', 1.6)
    + both('M28,72 L52,72 L48,64 L32,64 Z', C.wood, 1.6)),
  teknologi: () => svg('0 0 80 80',
    both('M14,70 L14,38 C14,16 66,16 66,38 L66,70 Z', C.wood) + both('M22,48 C22,28 58,28 58,48 Z', C.cream, 1.4)
    + ink('M30,34 L30,48 M36,30 L36,48 M42,29 L42,48 M48,31 L48,48 M54,36 L54,48', 1) + circ(30, 60, 4.5, C.rose, true, 1.3) + circ(50, 60, 4.5, C.rose, true, 1.3)
    + ink('M10,72 L70,72', 1.6)),
  matematika: () => svg('0 0 80 80',
    both('M10,58 L62,30 L68,40 L16,68 Z', C.butter, 1.5) + ink('M20,54 L22,58 M28,50 L30,54 M36,46 L38,50 M44,42 L46,46 M52,38 L54,42', 1)
    + circ(50, 14, 4, C.rose, true, 1.4) + ink('M48,18 L34,60 M52,18 L62,56') + ink('M30,68 Q46,76 62,62', 1.1)),
  sastra: () => svg('0 0 80 80',
    both('M8,58 C22,52 33,52 40,58 C47,52 58,52 72,58 L72,24 C58,18 47,18 40,24 C33,18 22,18 8,24 Z', C.cream)
    + ink('M40,24 L40,58 M15,32 L33,30 M15,40 L33,38 M15,48 L30,46 M47,30 L65,32 M47,38 L65,40', 1)
    + both('M54,4 C68,8 72,22 62,34 C57,27 53,18 54,4 Z', C.rose, 1.4) + ink('M62,34 L50,50', 1.4)),
  seni: () => svg('0 0 80 80',
    both('M40,12 C60,12 72,24 70,38 C68,50 56,48 52,54 C48,62 58,68 46,70 C26,72 10,58 10,40 C10,24 22,12 40,12 Z', C.cream)
    + circ(26, 28, 5, C.rose) + circ(40, 22, 5, C.butter) + circ(54, 28, 5, C.leaf) + circ(24, 44, 5, C.lavender)
    + circ(36, 56, 4, '#FBEFE6', true, 1.2) + ink('M56,68 L74,42', 1.8) + both('M72,40 L78,32 L76,44 Z', C.roseDeep, 1.2)),
  olahraga: () => svg('0 0 80 80',
    both('M22,10 L58,10 C58,34 50,44 40,44 C30,44 22,34 22,10 Z', C.butter)
    + ink('M22,16 C10,16 10,32 26,34 M58,16 C70,16 70,32 54,34', 1.6)
    + ink('M40,44 L40,56', 1.8) + both('M30,56 L50,56 L52,62 L28,62 Z', C.rose, 1.5) + both('M24,62 L56,62 L56,72 L24,72 Z', C.wood, 1.6)
    + both('M40,18 L42.5,24 L49,24.3 L44,28.2 L45.6,34.5 L40,31 L34.4,34.5 L36,28.2 L31,24.3 L37.5,24 Z', C.cream, 1.1)),
  hiburan: () => svg('0 0 80 80',
    both('M38,26 C50,20 66,22 68,26 C70,44 64,58 54,60 C44,58 36,44 38,26 Z', C.lavender)
    + ink('M46,36 L52,34 M58,34 L63,36 M47,50 C51,46 57,46 61,50', 1.3)
    + both('M10,16 C22,10 38,12 40,16 C42,34 36,48 26,50 C16,48 8,34 10,16 Z', C.rose)
    + ink('M16,26 Q19,23 22,26 M28,26 Q31,23 34,26 M17,36 C21,42 29,42 33,36', 1.3) + ink('M12,46 C8,56 14,62 20,58 M66,56 C72,64 66,72 60,66', 1.1)),
  umum: () => svg('0 0 80 80',
    both('M40,10 C56,10 64,24 60,38 C57,46 50,50 50,58 L30,58 C30,50 23,46 20,38 C16,24 24,10 40,10 Z', C.butter)
    + ink('M34,46 C34,36 37,31 40,37 C43,31 46,36 46,46', 1.2) + both('M30,58 L50,58 L49,68 L31,68 Z', C.grey, 1.4) + ink('M31,63 L49,63 M37,72 L43,72', 1.4)
    + ink('M10,22 L4,18 M70,22 L76,18 M8,40 L2,40 M72,40 L78,40 M40,4 L40,0', 1.2)),
};

// ───────────── Ikon UI (24px) ─────────────
const icon = (inner) => svg('0 0 24 24', inner, 'icon');
export const ICON = {
  flame: () => icon(wash('M12,3 C16,8 19,11 19,15 C19,19 16,22 12,22 C8,22 5,19 5,15 C5,11 9,9 12,3 Z', '#F2B9A4', 0.6, 0.4)
    + ink('M12,3 C16,8 19,11 19,15 C19,19 16,22 12,22 C8,22 5,19 5,15 C5,11 9,9 12,3 Z', 1.5) + ink('M12,12 C14,14 15,16 14,18 C13,20 11,20 10,18 C9,16 11,14 12,12 Z', 1.2)),
  star: () => icon(wash('M12,2.5 L14.7,9 L21.5,9.4 L16.2,13.7 L18,20.5 L12,16.8 L6,20.5 L7.8,13.7 L2.5,9.4 L9.3,9 Z', C.butter, 0.5, 0.4)
    + ink('M12,2.5 L14.7,9 L21.5,9.4 L16.2,13.7 L18,20.5 L12,16.8 L6,20.5 L7.8,13.7 L2.5,9.4 L9.3,9 Z', 1.4)),
  snow: () => icon(ink('M12,2 L12,22 M3.3,7 L20.7,17 M3.3,17 L20.7,7 M9.5,3.5 L12,6 L14.5,3.5 M9.5,20.5 L12,18 L14.5,20.5', 1.4)),
  heart: () => icon(wash('M12,20 C6,16 2.5,12.5 3,8.5 C3.5,5 7.5,3.5 10,6 L12,8 L14,6 C16.5,3.5 20.5,5 21,8.5 C21.5,12.5 18,16 12,20 Z', C.rose, 0.6, 0.4)
    + ink('M12,20 C6,16 2.5,12.5 3,8.5 C3.5,5 7.5,3.5 10,6 L12,8 L14,6 C16.5,3.5 20.5,5 21,8.5 C21.5,12.5 18,16 12,20 Z', 1.4)),
  bolt: () => icon(wash('M13,2 L5,13 L11,13 L9,22 L19,9 L13,9 Z', C.butter, 0.5, 0.4) + ink('M13,2 L5,13 L11,13 L9,22 L19,9 L13,9 Z', 1.4)),
  check: () => icon(ink('M5,12.5 L10,17 L19,7', 2.2)),
  lock: () => icon(wash('M5,11 L19,11 L19,21 L5,21 Z', C.lavender, 0.5, 0.4) + ink('M5,11 L19,11 L19,21 L5,21 Z M8,11 L8,8 C8,3 16,3 16,8 L16,11', 1.5)),
  crown: () => icon(wash('M3,18 L4,7 L9,12 L12,5 L15,12 L20,7 L21,18 Z', C.butter, 0.5, 0.4) + ink('M3,18 L4,7 L9,12 L12,5 L15,12 L20,7 L21,18 Z', 1.4)),
  sparkle: () => icon(wash('M12,2 C12.7,8.5 15.5,11.3 22,12 C15.5,12.7 12.7,15.5 12,22 C11.3,15.5 8.5,12.7 2,12 C8.5,11.3 11.3,8.5 12,2 Z', C.pink, 0.4, 0.3)
    + ink('M12,2 C12.7,8.5 15.5,11.3 22,12 C15.5,12.7 12.7,15.5 12,22 C11.3,15.5 8.5,12.7 2,12 C8.5,11.3 11.3,8.5 12,2 Z', 1.3)),
  bow: () => icon(wash('M12,11 C8,5 2,6 3,10.5 C4,15 9,14 12,11 Z M12,11 C16,5 22,6 21,10.5 C20,15 15,14 12,11 Z', C.rose, 0.4, 0.3)
    + ink('M12,11 C8,5 2,6 3,10.5 C4,15 9,14 12,11 Z M12,11 C16,5 22,6 21,10.5 C20,15 15,14 12,11 Z M11,12 L8,20 M13,12 L16,20', 1.3)),
  rose: () => icon(circ(12, 10, 6.5, C.rose, false) + ink('M12,10 C10,8.5 13,7 14,9 C15,11.5 11,13 9.5,10.5 C8,7.5 13,5 15.5,7 C18,9 16,14 12,15 C8,16 5.5,12 7,8.5 M12,16 L12,22', 1.2)),
  cup: () => icon(wash('M5,8 L17,8 C17,15 14.5,18 11,18 C7.5,18 5,15 5,8 Z', C.pink, 0.5, 0.4) + ink('M5,8 L17,8 C17,15 14.5,18 11,18 C7.5,18 5,15 5,8 Z M17,10 C21,10 21,15 16.5,15 M4,21 L18,21', 1.4)),
  globe: () => icon(circ(12, 12, 9, C.sky, false) + ink('M12,3 C7,7 7,17 12,21 C17,17 17,7 12,3 Z M3,12 L21,12 M12,3 L12,21', 1.2) + `<circle cx="12" cy="12" r="9" fill="none" stroke="${C.ink}" stroke-width="1.4" filter="url(#ink)"/>`),
  book: () => icon(wash('M3,6 C7,4.5 10,4.5 12,6.5 C14,4.5 17,4.5 21,6 L21,19 C17,17.5 14,17.5 12,19 C10,17.5 7,17.5 3,19 Z', C.cream, 0.5, 0.4)
    + ink('M3,6 C7,4.5 10,4.5 12,6.5 C14,4.5 17,4.5 21,6 L21,19 C17,17.5 14,17.5 12,19 C10,17.5 7,17.5 3,19 Z M12,6.5 L12,19', 1.3)),
  letter: () => icon(wash('M3,6 L21,6 L21,18 L3,18 Z', C.cream, 0.5, 0.4) + ink('M3,6 L21,6 L21,18 L3,18 Z M3,6 L12,13 L21,6', 1.3)),
  lamp: () => icon(ink('M11,22 L13,22 M12,22 L12,9 M8,9 L16,9 L14.5,4 L9.5,4 Z', 1.3) + circ(12, 6.5, 2, C.butter, false)),
  pin: () => icon(wash('M12,22 C7,15 5,12 5,9 a7,7 0 0 1 14,0 C19,12 17,15 12,22 Z', C.rose) + ink('M12,22 C7,15 5,12 5,9 a7,7 0 0 1 14,0 C19,12 17,15 12,22 Z', 1.2) + circ(12, 9, 2.4, '#FFFCF6', true, 1)),
  palette: () => icon(wash('M12,3 C18,3 21,7 21,11 C21,14.5 17.5,13.5 16.5,15.5 C15.5,18 18,20 14,21 C8,22 3,18 3,12 C3,7 7,3 12,3 Z', C.cream, 0.4, 0.3)
    + ink('M12,3 C18,3 21,7 21,11 C21,14.5 17.5,13.5 16.5,15.5 C15.5,18 18,20 14,21 C8,22 3,18 3,12 C3,7 7,3 12,3 Z', 1.3) + circ(8, 9, 1.6, C.rose, false) + circ(12, 7, 1.6, C.butter, false) + circ(16, 9, 1.6, C.leaf, false)),
  bulb: () => icon(wash('M12,3 C16.5,3 18.5,7 17.5,10.5 C16.8,13 15,14 15,16 L9,16 C9,14 7.2,13 6.5,10.5 C5.5,7 7.5,3 12,3 Z', C.butter, 0.5, 0.4)
    + ink('M12,3 C16.5,3 18.5,7 17.5,10.5 C16.8,13 15,14 15,16 L9,16 C9,14 7.2,13 6.5,10.5 C5.5,7 7.5,3 12,3 Z M9,19 L15,19 M10.5,22 L13.5,22', 1.3)),
  camera: () => icon(wash('M3,8 L7,8 L8.6,5.4 L15.4,5.4 L17,8 L21,8 L21,19 L3,19 Z', C.pink, 0.5, 0.4)
    + ink('M3,8 L7,8 L8.6,5.4 L15.4,5.4 L17,8 L21,8 L21,19 L3,19 Z', 1.4)
    + circ(12, 13.2, 3.7, C.sky, true, 1.3) + ink('M17.8,10.6 L18.4,10.6', 1.6)),
  download: () => icon(wash('M4,16.5 L20,16.5 L20,20.5 L4,20.5 Z', C.pink, 0.5, 0.4)
    + ink('M12,3.5 L12,14.5 M7.6,10.2 L12,14.6 L16.4,10.2 M4,15.5 L4,20.5 L20,20.5 L20,15.5', 1.5)),
  send: () => icon(wash('M5,10 L19,10 L19,21 L5,21 Z', C.pink, 0.5, 0.4)
    + ink('M12,15 L12,3.2 M7.8,7.2 L12,3 L16.2,7.2 M9,10 L5,10 L5,21 L19,21 L19,10 L15,10', 1.5)),
  shop: () => icon(wash('M3,9 L21,9 L21,21 L3,21 Z', C.pink, 0.5, 0.4) + ink('M3,9 L21,9 L21,21 L3,21 Z M2,9 L4,4 L20,4 L22,9 M9,21 L9,14 L15,14 L15,21', 1.3)),
};

/** Elemen ilustrasi siap pakai. */
export function art(markup, cls = '') {
  return h(`span.art-wrap${cls ? '.' + cls : ''}`, { html: markup, 'aria-hidden': 'true' });
}
export const iconEl = (name, cls = '') => art(ICON[name](), `ico${cls ? '.' + cls : ''}`);
export const catArt = (id, cls = '') => art((CATEGORY_ART[id] || CATEGORY_ART.umum)(), `cat-art${cls ? '.' + cls : ''}`);

/** Medali liga: cakram berpita dengan warna pastel per tingkat. */
export const TIER_TINTS = ['#E3C3A6', '#DADCE2', '#F2DDA4', '#CFDDEB', '#F1C4CF', '#CFDDC6', '#E2D3EC', '#F7E6EE', '#CFC8D6', '#D5ECF0'];
export function medal(i = 0) {
  const c = TIER_TINTS[i % TIER_TINTS.length];
  return svg('0 0 40 40', wash('M13,4 L19,18 L14,20 L8,6 Z', C.rose, 0.4, 0.3) + ink('M13,4 L19,18 L14,20 L8,6 Z', 1.3)
    + wash('M27,4 L21,18 L26,20 L32,6 Z', C.lavender, 0.4, 0.3) + ink('M27,4 L21,18 L26,20 L32,6 Z', 1.3)
    + circ(20, 26, 10, c) + `<circle cx="20" cy="26" r="6.5" fill="none" stroke="${C.ink}" stroke-width="1" stroke-dasharray="2 2"/>`
    + both(STAR_D_SMALL(20, 26), '#FFFCF6', 1));
}
const STAR_D_SMALL = (cx, cy) => `M${cx},${cy - 4} L${cx + 1.2},${cy - 1.2} L${cx + 4},${cy - 1} L${cx + 1.8},${cy + 0.9} L${cx + 2.5},${cy + 3.8} L${cx},${cy + 2.2} L${cx - 2.5},${cy + 3.8} L${cx - 1.8},${cy + 0.9} L${cx - 4},${cy - 1} L${cx - 1.2},${cy - 1.2} Z`;

/** Bingkai perangko bergerigi (perforasi) untuk lencana pencapaian. */
export function stampFrame(tint = C.pink) {
  const W = 100, H = 120, r = 4.2, step = 11;
  const bites = [];
  for (let x = step / 2; x < W; x += step) bites.push([x, 0], [x, H]);
  for (let y = step / 2; y < H; y += step) bites.push([0, y], [W, y]);
  return `<svg viewBox="0 0 ${W} ${H}" class="art stamp-frame" aria-hidden="true">`
    + `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" fill="#FFFCF6" stroke="${C.ink}" stroke-width="1.2" filter="url(#ink)"/>`
    + bites.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" class="stamp-bite"/>`).join('')
    + `<rect x="10" y="10" width="${W - 20}" height="${H - 20}" fill="${tint}" filter="url(#wash)"/>`
    + `<rect x="10" y="10" width="${W - 20}" height="${H - 20}" fill="none" stroke="${C.roseDeep}" stroke-width="1" stroke-dasharray="3 3"/>`
    + '</svg>';
}

export const RANK_ART = { Beginner: () => sparkle(C.pink), Explorer: () => CATEGORY_ART.geografi(), Scholar: () => books(), Expert: () => letter(), Master: () => ICON.crown(), Grandmaster: () => CATEGORY_ART.olahraga() };
export const rankArt = (name, cls = '') => art((RANK_ART[name] || RANK_ART.Beginner)(), `rank-art${cls ? '.' + cls : ''}`);

/** Motif ilustrasi untuk setiap pencapaian (dipakai di dalam perangko). */
export const ACH_MOTIF = {
  first_steps: () => letter(), on_fire: () => ICON.flame(), dedicated: () => rose(), unstoppable: () => sparkle(C.rose),
  perfect_mind: () => star(), perfectionist: () => sparkle(C.butter), knowledge_seeker: () => books(), comeback_kid: () => bow(),
  explorer: () => CATEGORY_ART.geografi(), all_rounder: () => CATEGORY_ART.seni(), shopper: () => cupcake(),
  path_half: () => lamp(), memory_master: () => CATEGORY_ART.sastra(), curious_mind: () => CATEGORY_ART.umum(),
};
