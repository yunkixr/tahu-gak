// Papan peringkat Nasional & Global.
//
// Periode (batas UTC, sama untuk semua negara):
//   week  : XP yang didapat sejak Senin 00.00 UTC
//   month : XP yang didapat sejak tanggal 1, 00.00 UTC
//   all   : total XP seumur hidup
//
// Reset terjadi otomatis: setiap baris pemain menyimpan kunci periodenya (weekKey/monthKey);
// baris dengan kunci lama dihitung 0 untuk periode yang sedang berjalan.
//
// Catatan keamanan: tanpa server, peringkat dihitung di perangkat dari data bersama, dan setiap
// pemain menulis barisnya sendiri. sanitizeRows() menyaring data yang mustahil (manipulasi kasar),
// tetapi bukan pengganti validasi server-side untuk aplikasi produksi.

import { utcWeekKey, utcMonthKey, utcDayKey, utcWeekFraction, utcMonthFraction, weekDays, dayNumber, daysInUtcMonth, keyFromDayNumber } from './dates.js';
import { isValidUsername } from './username.js';
import { seeded, unit } from './rng.js';
import { isCountry } from '../data/countries.js';
import { bi, L } from './i18n.js';
import { CATEGORY_BY_ID } from '../data/categories.js';
import { rankedDayXp, rankedTotalXp } from './xp.js';

export const PERIODS = [
  bi({ id: 'week', label: 'Mingguan' }, 'label', 'Weekly'),
  bi({ id: 'month', label: 'Bulanan' }, 'label', 'Monthly'),
  bi({ id: 'all', label: 'Sepanjang masa' }, 'label', 'All time'),
];

/** Batas atas XP per hari yang masih masuk akal (latihan tanpa batas + bonus + pencapaian). */
export const DAILY_XP_CAP = 2500;
const ACHIEVEMENT_SLACK = 2000;

/** Skor papan utama (category = null) atau papan kategori (XP dari jawaban di kategori itu). */
export function myScores(state, now = new Date(), category = null) {
  if (category) return myCatScores(state, now)[category] || { week: 0, month: 0, all: 0 };
  const wk = utcWeekKey(now);
  const mk = utcMonthKey(now);
  // XP dari soal yang memakai Petunjuk tidak dihitung (lihat markUnranked di xp.js).
  const week = weekDays(wk).reduce((s, d) => s + rankedDayXp(state, d), 0);
  const month = Object.keys(state.xpLogUtc).reduce((s, d) => (d.startsWith(mk) ? s + rankedDayXp(state, d) : s), 0);
  return { week, month, all: rankedTotalXp(state) };
}

/** XP per kategori untuk minggu & bulan berjalan (UTC) dan seumur hidup: { [cat]: {week, month, all} }. */
export function myCatScores(state, now = new Date()) {
  const wk = new Set(weekDays(utcWeekKey(now)));
  const mk = utcMonthKey(now);
  const out = {};
  const get = (c) => (out[c] = out[c] || { week: 0, month: 0, all: 0 });
  for (const [d, cats] of Object.entries(state.catXpUtc || {})) {
    for (const [c, v] of Object.entries(cats || {})) {
      if (wk.has(d)) get(c).week += v;
      if (d.startsWith(mk)) get(c).month += v;
    }
  }
  for (const [c, v] of Object.entries(state.catXp || {})) get(c).all = v;
  for (const c of Object.keys(out)) out[c].all = Math.max(out[c].all, out[c].month, out[c].week);
  return out;
}

/** Bentuk ringkas untuk baris publik: hanya kategori yang punya XP. */
export function publicCatScores(state, now = new Date()) {
  const per = myCatScores(state, now);
  const pick = (k) => Object.fromEntries(Object.entries(per).filter(([c, v]) => CATEGORY_BY_ID[c] && v[k] > 0).map(([c, v]) => [c, v[k]]));
  return { catWeek: pick('week'), catMonth: pick('month'), catAll: pick('all') };
}

export function rowScore(row, period, now = new Date(), category = null) {
  if (category) {
    if (period === 'week') return row.weekKey === utcWeekKey(now) ? row.catWeek?.[category] || 0 : 0;
    if (period === 'month') return row.monthKey === utcMonthKey(now) ? row.catMonth?.[category] || 0 : 0;
    return row.catAll?.[category] || 0;
  }
  if (period === 'week') return row.weekKey === utcWeekKey(now) ? row.weekXp : 0;
  if (period === 'month') return row.monthKey === utcMonthKey(now) ? row.monthXp : 0;
  return row.totalXp;
}

/** Peta XP kategori dari pemain lain: kunci kategori dikenal, angka bulat ≥ 0, jumlahnya ≤ XP periode. */
function badCatMap(m, limit) {
  if (m == null) return false;
  if (typeof m !== 'object' || Array.isArray(m)) return true;
  let sum = 0;
  for (const [c, v] of Object.entries(m)) {
    if (!CATEGORY_BY_ID[c] || !isCount(v)) return true;
    sum += v;
  }
  return sum > limit;
}

const isCount = (n) => Number.isFinite(n) && n >= 0 && Math.floor(n) === n;
const isDayKey = (k) => typeof k === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(k);

/** Memisahkan baris yang wajar dari yang jelas dimanipulasi atau rusak. */
export function sanitizeRows(rows, now = new Date()) {
  const valid = [];
  const rejected = [];
  const today = dayNumber(utcDayKey(now));
  for (const r of rows) {
    const reasons = [];
    if (!isCount(r.totalXp) || !isCount(r.weekXp ?? 0) || !isCount(r.monthXp ?? 0)) reasons.push('angka XP tidak valid');
    if ((r.weekXp ?? 0) > r.totalXp || (r.monthXp ?? 0) > r.totalXp) reasons.push('XP periode melebihi total XP');
    if ((r.weekXp ?? 0) > 7 * DAILY_XP_CAP) reasons.push('XP mingguan mustahil');
    if ((r.monthXp ?? 0) > 31 * DAILY_XP_CAP) reasons.push('XP bulanan mustahil');
    if (!isDayKey(r.startDate) || dayNumber(r.startDate) > today + 1) reasons.push('tanggal mulai tidak valid');
    else if (r.totalXp > (today - dayNumber(r.startDate) + 2) * DAILY_XP_CAP + ACHIEVEMENT_SLACK) reasons.push('total XP terlalu besar untuk umur akunnya');
    if (badCatMap(r.catWeek, r.weekXp ?? 0) || badCatMap(r.catMonth, r.monthXp ?? 0) || badCatMap(r.catAll, r.totalXp)) reasons.push('XP kategori tidak valid');
    if (r.country != null && !isCountry(r.country)) reasons.push('kode negara tidak valid');
    if (typeof r.nickname !== 'string' || r.nickname.length > 24) reasons.push('nama tidak valid');
    if (r.username != null && !isValidUsername(r.username)) reasons.push('username tidak valid');
    if (reasons.length) rejected.push({ id: r.id, reasons });
    else valid.push(r);
  }
  return { valid, rejected };
}

// ───────────── Pemain simulasi (hanya tampil jika diaktifkan & selalu berlabel) ─────────────

const COUNTRY_WEIGHTS = [
  ['ID', 38], ['MY', 6], ['SG', 3], ['PH', 6], ['TH', 4], ['VN', 4], ['JP', 4], ['KR', 3], ['IN', 6], ['US', 6],
  ['GB', 3], ['AU', 2], ['DE', 3], ['FR', 2], ['NL', 1], ['BR', 4], ['MX', 2], ['EG', 2], ['NG', 2], ['TR', 2], ['SA', 2], ['CA', 2],
];
const NAMES = {
  ID: ['raka', 'nadia', 'bimasakti', 'sekar', 'dimas', 'ayu', 'fajar', 'laras', 'yoga', 'putri', 'arif', 'citra', 'bayu', 'intan', 'galih', 'wulan', 'reza', 'tiara', 'joko', 'melati'],
  MY: ['aiman', 'nurul', 'hafiz', 'syafiqah', 'irfan'], SG: ['weijie', 'priya', 'darren', 'shu_ting'], PH: ['migs', 'joanna', 'paolo', 'bea'],
  TH: ['nattapong', 'ploy', 'krit'], VN: ['minh', 'linh', 'tuan'], JP: ['haruto', 'yui', 'sota'], KR: ['jiwoo', 'minseo', 'hyun'],
  IN: ['arjun', 'ananya', 'rohan', 'isha'], US: ['jake', 'emily', 'tyler', 'maddie'], GB: ['oliver', 'amelia', 'harry'], AU: ['lachlan', 'chloe'],
  DE: ['lukas', 'mia', 'felix'], FR: ['lucas', 'chloe_fr', 'hugo'], NL: ['daan', 'sanne'], BR: ['joao', 'ana_bea', 'pedro'], MX: ['diego', 'sofia'],
  EG: ['omar', 'nour'], NG: ['tunde', 'amaka'], TR: ['emre', 'zeynep'], SA: ['faisal', 'reem'], CA: ['liam', 'ava'],
};
const SUFFIX = ['', '', '_', '7', '21', '99', '.qz', 'x', '_pro', '04'];
const AVATARS = ['🦊', '🐼', '🐯', '🐸', '🐨', '🦁', '🐙', '🐧', '🦄', '🐵', '🐻', '🐰', '🦉', '🐳', '🦖', '🐝', '🐢', '🦜'];
const POOL_EPOCH = dayNumber('2026-01-01');

let pool = null;
export function simPool() {
  if (pool) return pool;
  const rand = seeded('tahugak/leaderboard/pool/v1');
  const total = COUNTRY_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  pool = Array.from({ length: 180 }, (_, i) => {
    let pick = rand() * total;
    const country = COUNTRY_WEIGHTS.find(([, w]) => (pick -= w) < 0)[0];
    const names = NAMES[country];
    return {
      id: `sim-lb-${i}`,
      name: names[Math.floor(rand() * names.length)] + SUFFIX[Math.floor(rand() * SUFFIX.length)],
      avatar: AVATARS[Math.floor(rand() * AVATARS.length)],
      country,
      rate: Math.round(10 + Math.pow(rand(), 2.4) * 150),   // XP per hari aktif
      activity: 0.3 + rand() * 0.65,                         // peluang aktif per hari
      joinDay: POOL_EPOCH + Math.floor(rand() * 320),
      kind: 'sim',
    };
  });
  return pool;
}

export function simScore(p, period, now = new Date()) {
  const today = dayNumber(utcDayKey(now));
  if (p.joinDay > today) return 0;
  const daily = p.rate * p.activity;
  if (period === 'week') {
    return Math.round(daily * 7 * utcWeekFraction(now) * (0.5 + unit(`${p.id}/${utcWeekKey(now)}`)));
  }
  const mk = utcMonthKey(now);
  const month = Math.round(daily * daysInUtcMonth(mk) * utcMonthFraction(now) * (0.6 + 0.8 * unit(`${p.id}/${mk}`)));
  if (period === 'month') return Math.min(month, Math.round(daily * (today - p.joinDay + 1)));
  return Math.max(month, Math.round(daily * (today - p.joinDay) + 40));
}

/** Bagian XP pemain simulasi di satu kategori: tiap pemain punya kategori favorit yang tetap. */
export function simCatShare(p, category) {
  const ids = Object.keys(CATEGORY_BY_ID);
  const w = (c) => 0.15 + Math.pow(unit(`${p.id}/cat/${c}`), 3) * 2;
  const total = ids.reduce((s, c) => s + w(c), 0);
  return (0.75 * w(category)) / total; // ±75% XP berasal dari menjawab soal
}

// ───────────── Menyusun papan ─────────────

/**
 * @param scope 'national' | 'global'
 * @param rows  baris pemain asli (sudah disaring), TANPA baris milikmu
 * @returns { entries, me } — entries terurut, dengan peringkat kompetisi standar (1, 2, 2, 4)
 */
export function buildBoard({ state, rows = [], scope, country, period, includeSim, category = null, now = new Date() }) {
  if (category && !CATEGORY_BY_ID[category]) category = null;
  const mine = myScores(state, now, category);
  const list = [];
  const myCountry = state.profile.country;
  if (scope === 'global' || myCountry === country) {
    list.push({ id: 'you', kind: 'you', name: state.profile.name || L('Kamu', 'You'), avatarCfg: state.profile.avatarCfg, country: myCountry, xp: mine[period] });
  }
  for (const r of rows) {
    if (r.ranked !== true) continue; // tidak ikut Leaderboard = tidak ikut peringkat
    if (scope === 'national' && r.country !== country) continue;
    const xp = rowScore(r, period, now, category);
    if (xp > 0) list.push({ id: r.id, kind: 'real', name: r.nickname || L('Pemain', 'Player'), avatarCfg: r.avatarCfg, country: r.country, xp });
  }
  if (includeSim) {
    for (const p of simPool()) {
      if (scope === 'national' && p.country !== country) continue;
      const xp = category ? Math.round(simScore(p, period, now) * simCatShare(p, category)) : simScore(p, period, now);
      if (xp > 0) list.push({ ...p, xp });
    }
  }
  list.sort((a, b) => b.xp - a.xp || (a.kind === 'you' ? -1 : b.kind === 'you' ? 1 : a.name.localeCompare(b.name)));
  let rank = 0;
  list.forEach((e, i) => { rank = i > 0 && e.xp === list[i - 1].xp ? rank : i + 1; e.rank = rank; });
  return { entries: list, me: list.find((e) => e.kind === 'you') || null };
}

export { keyFromDayNumber };
