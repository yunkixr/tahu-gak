// Menyusun semua lapisan avatar dalam urutan yang benar (belakang → depan).

import { getItem, SKIN, HAIR_COLORS } from './avatarItems.js';
import {
  geometry, backdrop, legsSvg, torsoSkin, armSvg, handSvg, faceSvg, FILL, LINE, SHAPE, shade, CX, MIRROR,
} from './avatarRender.js';
import { hairLayers } from './avatarHair.js';
import { torsoGarment, skirt, pants, legwear } from './avatarClothes.js';
import { shoes, headItem, hijab, hairAcc, earrings, glasses, neckItem, wristItem, ringItem, bagItem } from './avatarAcc.js';

/** Tampilan (viewBox). `bust` dipakai untuk avatar kecil di seluruh aplikasi. */
export const VIEWS = {
  full: '0 0 200 570',
  bust: '28 12 144 144',
  face: '66 62 68 68',
  head: '30 10 140 140',
  hair: '8 8 184 184',
  upper: '5 128 190 190',
  outer: '-40 128 280 280',
  dress: '-105 140 410 410',
  bottom: '-60 236 320 320',
  legwear: '-25 320 250 250',
  shoes: '45 470 110 100',
  neck: '45 120 110 110',
  hand: '8 276 96 96',
  bag: '-20 150 240 240',
};

/**
 * @param cfg   konfigurasi tersanitasi (lihat avatar.js)
 * @param opts.view   kunci VIEWS
 * @param opts.lite   tanpa filter tinta/cat air (thumbnail cepat)
 * @param opts.hide   Set slot yang tidak digambar (untuk thumbnail)
 * @param opts.mirror balik arah hadap
 */
export function renderAvatar(cfg, { view = 'bust', lite = false, hide = null, mirror = false } = {}) {
  const vb = VIEWS[view] || VIEWS.bust;
  const bottomY = Number(vb.split(' ')[1]) + Number(vb.split(' ')[3]);
  const low = bottomY > 180;   // perlu menggambar badan bawah?
  const m = geometry(cfg.build);
  const skin = SKIN[cfg.skin];
  const skinD = shade(skin, 0.14);
  const hc = cfg.hairColor;
  const has = (slot) => cfg[slot] && !(hide && hide.has(slot));
  const it = (slot) => (has(slot) ? getItem(slot, cfg[slot]) : null);
  const col = (slot) => cfg.colors[slot] || it(slot)?.color || '#F4B6C8';
  const isHijab = cfg.head === 'hijab' && has('head');
  const hairItem = getItem('hair', cfg.hair);
  const hair = isHijab ? {} : hairLayers(hairItem?.r, hc, m.sex);
  const defs = [];
  const take = (g) => { if (g.defs) defs.push(g.defs); return g; };

  const top = it('top'), mid = it('mid'), dress = it('dress'), bottom = it('bottom'), outer = it('outer');
  const isPants = bottom && bottom.r.pants;
  let lower = '', body = '', sleeves = '', pantsBand = '';

  const skinBase = torsoSkin(m, skin, skinD)
    + FILL(`M${CX - m.nk},114 L${CX - m.nk - 1},164 Q${CX},171 ${CX + m.nk + 1},164 L${CX + m.nk},114 Z`, skin)
    + FILL(`M${CX - m.nk},118 Q${CX},136 ${CX + m.nk},118 L${CX + m.nk},127 Q${CX},140 ${CX - m.nk},127 Z`, skinD, 0.55)
    + LINE(`M${CX - m.nk},124 L${CX - m.nk - 0.6},158`, 1, 0.7) + LINE(`M${CX + m.nk},124 L${CX + m.nk + 0.6},158`, 1, 0.7);
  if (low) {
    lower += legsSvg(m, skin, skinD) + skinBase;
    if (it('legwear')) lower += legwear(m, it('legwear'), col('legwear'));
    const longPants = isPants && bottom.r.pants.len > 500;
    if (longPants && it('shoes')) lower += shoes(m, it('shoes'), col('shoes'));
    if (isPants) { const p = pants(m, bottom, col('bottom')); lower += p.svg; pantsBand = p.band; }
    if (!longPants && it('shoes')) lower += shoes(m, it('shoes'), col('shoes'));
  }

  // Badan & pakaian
  if (!low) body += skinBase;

  const skirtPart = (item, color, waistY = 262) => { const s = take(skirt(m, item.r.skirt, color, item.r, waistY)); return s.svg; };
  const topG = top ? take(torsoGarment(m, top, col('top'), { cut: dress ? Math.min(top.r.hem, 262) : top.r.tuck && isPants ? 268 : undefined })) : null;
  if (top && (top.r.tuck || dress)) {
    body += topG.body;
    if (bottom && low && !dress) body += isPants ? pantsBand : skirtPart(bottom, col('bottom'));
  } else {
    if (bottom && low && !dress && !isPants) body += skirtPart(bottom, col('bottom'));
    if (top) body += topG.body;
  }
  if (top) sleeves += topG.sleeves;
  if (dress) {
    const waistY = dress.r.empire ? 230 : 262;
    if (low) body += skirtPart(dress, col('dress'), waistY);
    const g = take(torsoGarment(m, dress, col('dress'), { cut: waistY + 4 }));
    body += g.body; sleeves += g.sleeves;
  }
  if (mid) { const g = take(torsoGarment(m, mid, col('mid'))); body += g.body; sleeves += g.sleeves; }
  if (outer) { const g = take(torsoGarment(m, outer, col('outer'))); body += g.body; sleeves += g.sleeves; }

  // Lengan & tangan
  let arms = armSvg(m, skin) + sleeves;
  if (it('neck')) arms += neckItem(cfg.neck, col('neck'), m);
  if (isHijab) arms += hijab(col('head'), 'drape');
  if (low && it('bag')) arms += bagItem(cfg.bag, col('bag'), m);
  else if (it('bag') && ['tas-bahu', 'tas-mini', 'tote'].includes(cfg.bag)) arms += bagItem(cfg.bag, col('bag'), m);
  if (low) {
    arms += handSvg(m, skin);
    if (it('wrist')) arms += wristItem(cfg.wrist, col('wrist'), m);
    if (it('ring')) arms += ringItem(cfg.ring, col('ring'), m);
  }

  // Kepala
  let head = hide && hide.has('hairSide') ? '' : hair.side || '';
  if (!isHijab) head += [[69, -1], [131, 1]].map(([x, dir]) => SHAPE(`M${x},86 C${x + dir * 4.5},85 ${x + dir * 5.5},92 ${x + dir * 4.5},97 C${x + dir * 3.5},101 ${x + dir},103 ${x},101 Z`, skin, 0.9, 0.7)).join('');
  head += faceSvg({ ...cfg, sex: m.sex }, skin, hc);
  head += hair.front || '';
  if (it('ears') && !isHijab) head += earrings(cfg.ears);
  if (isHijab) head += hijab(col('head'), 'front');
  else if (it('head')) head += headItem(cfg.head, col('head'), 'front');
  if (it('hairAcc') && !isHijab) head += hairAcc(cfg.hairAcc, col('hairAcc'), hairItem?.r?.back);
  if (it('glasses')) head += glasses(cfg.glasses, col('glasses'));

  const back = (isHijab ? hijab(col('head'), 'back') : hair.back || '');
  let figure = back + lower + body + arms + head;
  if (mirror) figure = MIRROR(figure);
  const filter = lite ? '' : ' filter="url(#ink)"';
  return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Avatar">${defs.join('')}`
    + backdrop(cfg, view === 'full' || view === 'dress' || view === 'bottom', lite)
    + `<g${filter}>${figure}</g></svg>`;
}
