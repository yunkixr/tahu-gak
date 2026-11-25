// XP & level.
// - xp.total   : XP seumur hidup. Menentukan level & tidak pernah berkurang.
// - xp.balance : XP yang bisa dibelanjakan di Toko. Berkurang saat membeli.
// - xpLog[day] : XP yang DIDAPAT per hari lokal.
// - xpLogUtc[day]: sama, per hari UTC (dipakai liga & papan peringkat agar batasnya seragam di semua negara).

import { todayKey, utcDayKey } from './dates.js';

export const XP = {
  CORRECT: 10,
  PRACTICE_REPEAT: 2,     // soal latihan yang sudah dijawab benar hari ini
  DAILY_COMPLETE: 25,
  DAILY_PERFECT: 20,
  REVIEW_COMPLETE: 10,
  DOUBLE_XP_CHARGES: 10,  // jumlah soal per Double XP
  PATH_OLD: 5,            // soal lama yang dijawab benar di Jalur Hafalan
  PATH_STAGE: 15,         // menyelesaikan satu tahap Jalur Hafalan (ada soal baru)
  PATH_ROUND: 10,         // menyelesaikan putaran ulang (semua soal sudah dikenal)
};

/** Bonus kecepatan (mode timer). Batas waktu per soal: 20 detik. */
export const TIMER_SECONDS = 20;
export function speedBonus(ms) {
  const s = ms / 1000;
  if (s <= 5) return 5;
  if (s <= 10) return 3;
  if (s <= 15) return 1;
  return 0;
}

export const RANKS = [
  { level: 1, name: 'Beginner', icon: '🌱' },
  { level: 5, name: 'Explorer', icon: '🧭' },
  { level: 10, name: 'Scholar', icon: '📜' },
  { level: 20, name: 'Expert', icon: '🎓' },
  { level: 30, name: 'Master', icon: '🏅' },
  { level: 50, name: 'Grandmaster', icon: '👑' },
];

/** XP yang dibutuhkan untuk naik dari `level` ke `level + 1`. */
export const xpToNext = (level) => 40 + 20 * (level - 1);

export function totalXpForLevel(level) {
  let sum = 0;
  for (let l = 1; l < level; l++) sum += xpToNext(l);
  return sum;
}

export function levelInfo(total) {
  let level = 1;
  let remaining = Math.max(0, total);
  while (remaining >= xpToNext(level)) {
    remaining -= xpToNext(level);
    level++;
  }
  const needed = xpToNext(level);
  const rank = rankFor(level);
  const next = RANKS.find((r) => r.level > level) || null;
  return { level, into: remaining, needed, pct: remaining / needed, rank, nextRank: next };
}

export function rankFor(level) {
  let r = RANKS[0];
  for (const rank of RANKS) if (level >= rank.level) r = rank;
  return r;
}

/** Menambah XP yang didapat. Mengembalikan level sebelum & sesudah. */
const CAT_LOG_DAYS = 40;
const UNRANKED_LOG_DAYS = 70;

/**
 * XP dari soal yang dijawab dengan bantuan Petunjuk: tetap masuk level & saldo, tetapi tidak
 * dihitung di Leaderboard (papan utama, papan kategori, dan divisi mingguan).
 */
export function markUnranked(state, amount, now = new Date()) {
  if (!(amount > 0)) return;
  const u = (state.xpUnranked = state.xpUnranked || { total: 0, utc: {} });
  u.total += amount;
  const d = utcDayKey(now);
  u.utc[d] = (u.utc[d] || 0) + amount;
  const days = Object.keys(u.utc).sort();
  for (const k of days.slice(0, Math.max(0, days.length - UNRANKED_LOG_DAYS))) delete u.utc[k];
}

/** XP yang dihitung Leaderboard untuk satu hari UTC. */
export const rankedDayXp = (state, day) => Math.max(0, (state.xpLogUtc[day] || 0) - (state.xpUnranked?.utc?.[day] || 0));

/** Total XP yang dihitung Leaderboard (sepanjang masa). */
export const rankedTotalXp = (state) => Math.max(0, state.xp.total - (state.xpUnranked?.total || 0));

/**
 * XP per kategori untuk papan peringkat kategori: hanya XP dari menjawab soal di kategori itu
 * (bonus harian, misi, pencapaian, duel tidak dihitung). Dicatat per hari UTC + total seumur hidup.
 */
export function awardCatXp(state, category, amount, now = new Date()) {
  if (!(amount > 0) || !category) return;
  state.catXp = state.catXp || {};
  state.catXpUtc = state.catXpUtc || {};
  const u = utcDayKey(now);
  const d = (state.catXpUtc[u] = state.catXpUtc[u] || {});
  d[category] = (d[category] || 0) + amount;
  state.catXp[category] = (state.catXp[category] || 0) + amount;
  const days = Object.keys(state.catXpUtc).sort();
  for (const k of days.slice(0, Math.max(0, days.length - CAT_LOG_DAYS))) delete state.catXpUtc[k];
}

export function awardXp(state, amount, day = todayKey()) {
  const before = levelInfo(state.xp.total).level;
  if (amount > 0) {
    state.xp.total += amount;
    state.xp.balance += amount;
    state.xpLog[day] = (state.xpLog[day] || 0) + amount;
    const u = utcDayKey();
    state.xpLogUtc[u] = (state.xpLogUtc[u] || 0) + amount; // untuk liga & papan peringkat
  }
  return { before, after: levelInfo(state.xp.total).level };
}
