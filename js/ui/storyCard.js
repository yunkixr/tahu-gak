// Kartu Story (1080×1920 PNG) untuk dibagikan ke Instagram/WhatsApp Story.
// Digambar di <canvas> dengan ilustrasi tinta + cat air yang sama dengan aplikasi.
// Kartu tidak pernah memuat teks soal atau jawaban, hanya pola benar/salah & kategori.
//
// Jenis kartu (spec.kind):
//   daily     { day, score, total, perfect, marks[], cats[], streak }
//   kilat     { score, best, newBest }
//   duel      { myScore, theirScore, theirName, theirAvatar, outcome, marks[] }
//   milestone { type: 'questions' | 'streak', value }
// Semua jenis juga memakai { name, avatarCfg } pemain.

import { C, CATEGORY_ART, ICON, bow, floralCorner, sparkle, medal } from './art.js';
import { avatarSvg } from '../core/avatar.js';
import { puzzleNumber } from '../core/share.js';
import { formatKey } from '../core/dates.js';
import { CATEGORY_BY_ID } from '../data/categories.js';
import { L } from '../core/i18n.js';

export const STORY_W = 1080;
export const STORY_H = 1920;

const F = {
  display: '"IM Fell English", "Cormorant Garamond", Georgia, serif',
  serif: '"Cormorant Garamond", Georgia, serif',
  sans: '"DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
  script: 'Parisienne, "Great Vibes", cursive',
};
const INK = C.ink;
const MUTED = '#8A7A80';
const VINTAGE = C.vintage;
const TILE = { 1: C.sage, 2: C.butter, 0: C.lavender };

// ───────────── Gambar SVG → Image ─────────────

let filterDefs = null;
function defs() {
  if (filterDefs == null) filterDefs = document.querySelector('svg.svg-defs defs')?.outerHTML || '';
  return filterDefs;
}

/** Ubah markup SVG aplikasi (memakai filter #ink/#wash) jadi gambar mandiri. */
function svgImage(markup, w, h) {
  let s = String(markup);
  s = s.replace(/<svg\b([^>]*)>/, (m, attrs) => {
    let a = attrs.replace(/\s(width|height)="[^"]*"/g, '');
    if (!/xmlns=/.test(a)) a += ' xmlns="http://www.w3.org/2000/svg"';
    return `<svg${a} width="${w}" height="${h}">${defs()}`;
  });
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null); // ilustrasi gagal dimuat: kartu tetap jadi tanpa gambar itu
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(s)}`;
  });
}

async function fontsReady() {
  if (!document.fonts?.load) return;
  const want = [`italic 120px ${F.display}`, `600 64px ${F.serif}`, `700 200px ${F.serif}`, `500 40px ${F.sans}`, `700 40px ${F.sans}`, `60px ${F.script}`];
  await Promise.race([
    Promise.all(want.map((f) => document.fonts.load(f).catch(() => null))),
    new Promise((r) => setTimeout(r, 1500)),
  ]);
}

// ───────────── Primitif ─────────────

function rr(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function text(g, str, x, y, { font, size, weight = '', style = '', color = INK, align = 'center', maxWidth = 900 }) {
  g.font = `${style} ${weight} ${size}px ${font}`.trim();
  g.fillStyle = color;
  g.textAlign = align;
  g.textBaseline = 'alphabetic';
  let s = size;
  while (g.measureText(str).width > maxWidth && s > 18) { s -= 2; g.font = `${style} ${weight} ${s}px ${font}`.trim(); }
  g.fillText(str, x, y);
}

const draw = (g, img, x, y, w, h) => { if (img) g.drawImage(img, x, y, w, h); };

/** Lingkaran berbingkai ganda, gaya bingkai foto vintage. */
function ringFrame(g, cx, cy, r, fill = C.cream) {
  g.save();
  g.beginPath(); g.arc(cx, cy, r + 14, 0, Math.PI * 2); g.fillStyle = C.pink; g.fill();
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fillStyle = fill; g.fill();
  g.lineWidth = 3; g.strokeStyle = C.roseDeep; g.stroke();
  g.beginPath(); g.arc(cx, cy, r + 14, 0, Math.PI * 2); g.lineWidth = 2; g.strokeStyle = 'rgba(183,110,139,.55)'; g.stroke();
  g.restore();
}

async function avatarCircle(g, cfg, cx, cy, r) {
  ringFrame(g, cx, cy, r, '#FBEFF2');
  const img = await svgImage(avatarSvg(cfg), r * 2, r * 2);
  if (!img) return;
  g.save();
  g.beginPath(); g.arc(cx, cy, r - 2, 0, Math.PI * 2); g.clip();
  g.drawImage(img, cx - r, cy - r, r * 2, r * 2);
  g.restore();
}

/** Pil teks dengan ikon di kiri. */
async function pill(g, label, cx, cy, iconMarkup, { fill = C.pink, stroke = C.rose } = {}) {
  g.font = `700 40px ${F.sans}`;
  const tw = g.measureText(label).width;
  const icon = iconMarkup ? 56 : 0;
  const w = tw + icon + (icon ? 18 : 0) + 72;
  const x = cx - w / 2;
  rr(g, x, cy - 44, w, 88, 44);
  g.fillStyle = fill; g.fill();
  g.lineWidth = 2.5; g.strokeStyle = stroke; g.stroke();
  if (iconMarkup) draw(g, await svgImage(iconMarkup, icon, icon), x + 36, cy - icon / 2, icon, icon);
  text(g, label, x + 36 + icon + (icon ? 18 : 0), cy + 14, { font: F.sans, size: 40, weight: 700, align: 'left', maxWidth: 800 });
}

/** Tanda benar/salah kecil di pojok kotak. */
function markBadge(g, cx, cy, mark) {
  g.save();
  g.beginPath(); g.arc(cx, cy, 24, 0, Math.PI * 2);
  g.fillStyle = mark ? '#7E9468' : '#9B86B3'; g.fill();
  g.strokeStyle = C.cream; g.lineWidth = 4; g.stroke();
  g.strokeStyle = '#fff'; g.lineWidth = 6; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath();
  if (mark) { g.moveTo(cx - 10, cy + 1); g.lineTo(cx - 3, cy + 9); g.lineTo(cx + 11, cy - 8); }
  else { g.moveTo(cx - 8, cy - 8); g.lineTo(cx + 8, cy + 8); g.moveTo(cx + 8, cy - 8); g.lineTo(cx - 8, cy + 8); }
  g.stroke();
  g.restore();
}

// ───────────── Latar & kepala bersama ─────────────

async function backdrop(g) {
  g.fillStyle = C.cream;
  g.fillRect(0, 0, STORY_W, STORY_H);
  // noda cat air pink yang lembut
  for (const [x, y, r, a] of [[160, 260, 420, 0.5], [960, 900, 460, 0.38], [220, 1650, 420, 0.42], [900, 1780, 300, 0.3]]) {
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(247,220,226,${a})`);
    grad.addColorStop(1, 'rgba(247,220,226,0)');
    g.fillStyle = grad; g.fillRect(0, 0, STORY_W, STORY_H);
  }
  // bingkai ganda
  g.save();
  rr(g, 44, 44, STORY_W - 88, STORY_H - 88, 46);
  g.lineWidth = 3; g.strokeStyle = 'rgba(183,110,139,.55)'; g.stroke();
  rr(g, 64, 64, STORY_W - 128, STORY_H - 128, 34);
  g.lineWidth = 1.6; g.strokeStyle = 'rgba(183,110,139,.35)'; g.stroke();
  g.restore();
  // ornamen
  const corner = await svgImage(floralCorner(), 260, 260);
  if (corner) {
    g.save(); g.translate(STORY_W - 70, 70); g.rotate(Math.PI / 2); g.drawImage(corner, 0, 0, 260, 260); g.restore();
    g.save(); g.translate(70, STORY_H - 70); g.rotate(-Math.PI / 2); g.drawImage(corner, 0, 0, 190, 190); g.restore();
  }
  const spk = await svgImage(sparkle(C.pink), 60, 60);
  for (const [x, y, s] of [[150, 560, 46], [930, 470, 38], [120, 1220, 34], [960, 1330, 50], [520, 1700, 30]]) draw(g, spk, x - s / 2, y - s / 2, s, s);
}

async function header(g, kicker) {
  draw(g, await svgImage(bow(C.rose), 150, 104), STORY_W / 2 - 75, 120, 150, 104);
  text(g, 'tahu gak?', STORY_W / 2, 340, { font: F.display, size: 118, style: 'italic' });
  if (kicker) text(g, kicker, STORY_W / 2, 430, { font: F.script, size: 60, color: VINTAGE });
}

function footer(g, line) {
  g.save();
  g.strokeStyle = 'rgba(183,110,139,.45)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(300, 1748); g.lineTo(780, 1748); g.stroke();
  g.restore();
  text(g, line || L('Kamu tahu gak? Main juga, yuk!', 'Do you know it? Come play too!'), STORY_W / 2, 1812, { font: F.serif, size: 44, weight: 600, style: 'italic', color: VINTAGE, maxWidth: 560 });
}

// ───────────── Isi per jenis ─────────────

async function bodyDaily(g, s) {
  await avatarCircle(g, s.avatarCfg, STORY_W / 2, 610, 120);
  text(g, s.name || L('Pemain', 'Player'), STORY_W / 2, 800, { font: F.sans, size: 44, weight: 700 });
  text(g, L(`Tantangan Harian #${puzzleNumber(s.day)}`, `Daily Challenge #${puzzleNumber(s.day)}`), STORY_W / 2, 900, { font: F.serif, size: 70, weight: 700 });
  text(g, formatKey(s.day), STORY_W / 2, 960, { font: F.sans, size: 38, weight: 500, color: MUTED });

  // skor di dalam cincin progres
  const cx = STORY_W / 2, cy = 1170, r = 150;
  ringFrame(g, cx, cy, r);
  g.save();
  g.beginPath(); g.arc(cx, cy, r - 18, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * s.score) / Math.max(1, s.total));
  g.lineWidth = 16; g.lineCap = 'round'; g.strokeStyle = s.perfect ? C.butter : VINTAGE; g.stroke();
  g.restore();
  text(g, `${s.score}/${s.total}`, cx, cy + 50, { font: F.serif, size: 150, weight: 700 });
  if (s.perfect) await pill(g, L('Sempurna!', 'Perfect!'), cx, cy + r + 52, ICON.star(), { fill: C.butter, stroke: '#D8BC79' });

  // kotak per soal: warna = benar/salah, gambar = kategori
  const n = s.marks.length || 5, size = 148, gap = 22;
  const x0 = (STORY_W - (n * size + (n - 1) * gap)) / 2, y0 = s.perfect ? 1452 : 1420;
  for (let i = 0; i < n; i++) {
    const mark = s.marks[i] ?? 0;
    const x = x0 + i * (size + gap);
    rr(g, x, y0, size, size, 30);
    g.fillStyle = TILE[mark] || C.lavender; g.fill();
    g.lineWidth = 2.5; g.strokeStyle = 'rgba(61,51,53,.35)'; g.stroke();
    const cat = CATEGORY_ART[s.cats[i]] || CATEGORY_ART.umum;
    draw(g, await svgImage(cat(), 104, 104), x + 22, y0 + 20, 104, 104);
    markBadge(g, x + size - 10, y0 + 10, mark > 0);
  }
  if (s.streak > 0) await pill(g, L(`Streak ${s.streak} hari`, `${s.streak}-day streak`), STORY_W / 2, 1676, ICON.flame());
}

async function bodyKilat(g, s) {
  await avatarCircle(g, s.avatarCfg, STORY_W / 2, 610, 120);
  text(g, s.name || L('Pemain', 'Player'), STORY_W / 2, 800, { font: F.sans, size: 44, weight: 700 });
  text(g, L('Mode Kilat', 'Lightning Mode'), STORY_W / 2, 910, { font: F.serif, size: 76, weight: 700 });
  const cx = STORY_W / 2, cy = 1170, r = 170;
  ringFrame(g, cx, cy, r, '#FFF6DE');
  draw(g, await svgImage(ICON.bolt(), 96, 96), cx - 48, cy - r + 18, 96, 96);
  text(g, String(s.score), cx, cy + 70, { font: F.serif, size: 190, weight: 700 });
  text(g, L('jawaban benar dalam 60 detik', 'right answers in 60 seconds'), cx, cy + r + 90, { font: F.sans, size: 44, weight: 600, color: MUTED });
  if (s.newBest) await pill(g, L('Rekor baru!', 'New record!'), cx, 1560, ICON.crown(), { fill: C.butter, stroke: '#D8BC79' });
  else if (s.best > 0) await pill(g, L(`Rekorku ${s.best}`, `My best: ${s.best}`), cx, 1560, ICON.crown());
}

async function bodyDuel(g, s) {
  text(g, 'Duel', STORY_W / 2, 560, { font: F.serif, size: 84, weight: 700 });
  const y = 820;
  await avatarCircle(g, s.avatarCfg, 300, y, 130);
  if (s.theirAvatar) await avatarCircle(g, s.theirAvatar, 780, y, 130);
  else {
    ringFrame(g, 780, y, 130, C.lavender);
    text(g, (s.theirName || '?').slice(0, 1).toUpperCase(), 780, y + 50, { font: F.serif, size: 140, weight: 700, color: VINTAGE });
  }
  text(g, 'vs', STORY_W / 2, y + 28, { font: F.script, size: 90, color: VINTAGE });
  text(g, s.name || L('Aku', 'Me'), 300, y + 210, { font: F.sans, size: 42, weight: 700, maxWidth: 380 });
  text(g, s.theirName || '?', 780, y + 210, { font: F.sans, size: 42, weight: 700, maxWidth: 380 });
  const score = s.theirScore == null ? `${s.myScore}/5` : `${s.myScore} – ${s.theirScore}`;
  text(g, score, STORY_W / 2, 1260, { font: F.serif, size: 200, weight: 700 });
  const outcome = s.outcome === 'win' ? L('Aku menang!', 'I won!') : s.outcome === 'lose' ? L('Kalah tipis, lain kali!', 'Lost this time!')
    : s.outcome === 'draw' ? L('Seri!', 'A tie!') : L('Menunggu lawan main…', 'Waiting for my opponent…');
  await pill(g, outcome, STORY_W / 2, 1400, s.outcome === 'win' ? ICON.crown() : ICON.heart(), s.outcome === 'win' ? { fill: C.butter, stroke: '#D8BC79' } : {});
  const n = s.marks?.length || 0, size = 110, gap = 20;
  const x0 = (STORY_W - (n * size + (n - 1) * gap)) / 2;
  for (let i = 0; i < n; i++) {
    rr(g, x0 + i * (size + gap), 1530, size, size, 24);
    g.fillStyle = TILE[s.marks[i]] || C.lavender; g.fill();
    g.lineWidth = 2; g.strokeStyle = 'rgba(61,51,53,.3)'; g.stroke();
    markBadge(g, x0 + i * (size + gap) + size / 2, 1530 + size / 2, s.marks[i] > 0);
  }
}

async function bodyMilestone(g, s) {
  const isStreak = s.type === 'streak';
  await avatarCircle(g, s.avatarCfg, STORY_W / 2, 610, 120);
  text(g, s.name || L('Pemain', 'Player'), STORY_W / 2, 800, { font: F.sans, size: 44, weight: 700 });
  // medali besar dengan angka
  const cx = STORY_W / 2, cy = 1150, r = 230;
  draw(g, await svgImage(medal(isStreak ? 6 : 2), 300, 300), cx - 150, 860, 300, 300);
  ringFrame(g, cx, cy + 40, r - 40, isStreak ? '#FFF1E6' : '#F6F1FA');
  draw(g, await svgImage(isStreak ? ICON.flame() : ICON.book(), 110, 110), cx - 55, cy - 120, 110, 110);
  text(g, s.value.toLocaleString(L('id-ID', 'en-US')), cx, cy + 110, { font: F.serif, size: s.value >= 1000 ? 150 : 190, weight: 700 });
  text(g, isStreak ? L('hari berturut-turut', 'days in a row') : L('soal sudah kujawab', 'questions answered'), cx, 1500, { font: F.serif, size: 66, weight: 700 });
  text(g, isStreak ? L('main kuis tiap hari tanpa bolong', 'playing every single day') : L('sedikit demi sedikit, tiap hari', 'a little every day'), cx, 1580, { font: F.script, size: 58, color: VINTAGE });
}

const KICKER = {
  daily: () => L('hasil hari ini', 'today\'s result'),
  kilat: () => L('secepat kilat', 'lightning round'),
  duel: () => L('adu pintar', 'brain battle'),
  milestone: () => L('pencapaian baru', 'new milestone'),
};
const BODY = { daily: bodyDaily, kilat: bodyKilat, duel: bodyDuel, milestone: bodyMilestone };

/** Menggambar kartu ke canvas baru dan mengembalikannya. */
export async function drawStory(spec) {
  await fontsReady();
  const canvas = document.createElement('canvas');
  canvas.width = STORY_W; canvas.height = STORY_H;
  const g = canvas.getContext('2d');
  await backdrop(g);
  await header(g, KICKER[spec.kind]?.());
  await (BODY[spec.kind] || bodyDaily)(g, spec);
  footer(g);
  return canvas;
}

/** Kartu sebagai PNG Blob. */
export async function storyBlob(spec) {
  const canvas = await drawStory(spec);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
}

/** Nama berkas yang rapi untuk diunduh/dibagikan. */
export const storyFileName = (spec) => `tahu-gak-${spec.kind}${spec.kind === 'daily' ? '-' + puzzleNumber(spec.day) : spec.kind === 'milestone' ? `-${spec.type}-${spec.value}` : ''}.png`;

// ───────────── Data kartu dari state ─────────────

export function dailySpec(state, day) {
  const d = state.daily?.[day];
  if (!d) return null;
  const cats = (d.ids || []).map((id) => {
    const cat = id.replace(/-\d+$/, '');
    return CATEGORY_BY_ID[cat] ? cat : 'umum';
  });
  return { kind: 'daily', day, score: d.score, total: d.total, perfect: !!d.perfect, marks: d.marks || [], cats, streak: state.streak?.current || 0, name: state.profile.name, avatarCfg: state.profile.avatarCfg };
}
