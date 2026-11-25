// Liga mingguan & teman. Minggu dihitung dalam UTC (Senin 00.00 UTC).
//
// Pemain SIMULASI (bot) dibuat secara deterministik dari kunci minggu + divisi, lalu
// XP-nya "tumbuh" mengikuti berapa jauh minggu sudah berjalan. Semua bot ditandai jelas di UI.
// Pemain ASLI berasal dari database bersama (lihat cloud.js) bila tersedia.

import { seeded, unit } from './rng.js';
import { todayKey, weekDays, addDays, dayNumber, utcWeekKey, utcWeekFraction } from './dates.js';
import { bi, L } from './i18n.js';
import { rankedDayXp } from './xp.js';

export const TIERS = [
  { name: 'Perunggu', icon: '🥉', color: '#B9773D' },
  { name: 'Perak', icon: '🥈', color: '#8C99A8' },
  { name: 'Emas', icon: '🥇', color: '#E0A800' },
  { name: 'Safir', icon: '🔷', color: '#2F6BFF' },
  { name: 'Rubi', icon: '♦️', color: '#E0245E' },
  { name: 'Zamrud', icon: '🟢', color: '#12A26B' },
  { name: 'Ametis', icon: '🔮', color: '#8A4FD8' },
  { name: 'Mutiara', icon: '🫧', color: '#C78BB0' },
  { name: 'Obsidian', icon: '⬛', color: '#3A3550' },
  { name: 'Berlian', icon: '💠', color: '#11A9C9' },
];

const TIER_EN = ['Bronze', 'Silver', 'Gold', 'Sapphire', 'Ruby', 'Emerald', 'Amethyst', 'Pearl', 'Obsidian', 'Diamond'];
TIERS.forEach((t, i) => bi(t, 'name', TIER_EN[i]));

export const GROUP_SIZE = 16;
export const ZONE = 3; // 3 teratas naik, 3 terbawah turun

const NAMES = ['Raka', 'Nadia', 'Bima', 'Sekar', 'Dimas', 'Ayu', 'Fajar', 'Laras', 'Yoga', 'Putri', 'Arif', 'Citra', 'Bayu', 'Intan',
  'Galih', 'Wulan', 'Reza', 'Tiara', 'Hendra', 'Maya', 'Kevin', 'Salsa', 'Rizky', 'Dinda', 'Aldi', 'Nisa', 'Teguh', 'Melati', 'Irfan', 'Gita',
  'Joko', 'Ratna', 'Ilham', 'Vina', 'Andre', 'Kirana', 'Satria', 'Bunga', 'Farhan', 'Lestari'];
const SUFFIX = ['', '', '', '_', '99', '.id', '07', 'x', '23', 'jr', '_tkj', '88'];
const AVATARS = ['🦊', '🐼', '🐯', '🐸', '🐨', '🦁', '🐙', '🐧', '🦄', '🐵', '🐻', '🐰', '🦉', '🐳', '🦖', '🐝'];

function botName(rand) {
  const n = NAMES[Math.floor(rand() * NAMES.length)];
  const s = SUFFIX[Math.floor(rand() * SUFFIX.length)];
  return (rand() < 0.5 ? n.toLowerCase() : n) + s;
}

export function botsFor(weekKey, tier) {
  const rand = seeded(`tahugak/league/${weekKey}/${tier}`);
  return Array.from({ length: GROUP_SIZE - 1 }, (_, i) => ({
    id: `bot-${weekKey}-${tier}-${i}`,
    name: botName(rand),
    avatar: AVATARS[Math.floor(rand() * AVATARS.length)],
    target: Math.round((110 + tier * 45) * (0.15 + rand() * 1.9)),
    curve: 0.6 + rand() * 0.9,
    delay: rand() < 0.6 ? 0 : rand() * 0.3, // sebagian bot sudah aktif sejak Senin

    kind: 'bot',
  }));
}

export function botXpAt(bot, fraction) {
  if (fraction <= bot.delay) return 0;
  const f = Math.min(1, (fraction - bot.delay) / (1 - bot.delay));
  return Math.round((bot.target * Math.pow(f, bot.curve)) / 5) * 5;
}

export function weekXp(state, weekKey) {
  return weekDays(weekKey).reduce((sum, d) => sum + rankedDayXp(state, d), 0); // tanpa XP soal berpetunjuk
}

/**
 * Klasemen divisi minggu ini: kamu + pemain asli di divisi yang sama + bot pengisi.
 * @param realPlayers [{ id, weekKey, weekXp, tier, ... }] dari database bersama (tanpa dirimu)
 */
export function standings(state, { realPlayers = [], now = new Date(), me = {} } = {}) {
  const wk = utcWeekKey(now);
  const tier = state.league.tier;
  const real = realPlayers
    .filter((p) => p.ranked === true && p.weekKey === wk && p.tier === tier && p.weekXp > 0)
    .slice(0, GROUP_SIZE - 1)
    .map((p) => ({ id: p.id, name: p.nickname || 'Pemain', avatarCfg: p.avatarCfg, xp: p.weekXp, kind: 'real', country: p.country }));
  const frac = utcWeekFraction(now);
  const bots = botsFor(wk, tier).slice(0, GROUP_SIZE - 1 - real.length).map((b) => ({ ...b, xp: botXpAt(b, frac) }));
  const you = { id: 'you', name: me.name || state.profile.name || L('Kamu', 'You'), avatarCfg: state.profile.avatarCfg, xp: weekXp(state, wk), kind: 'you', country: state.profile.country };
  const rows = [you, ...real, ...bots].sort((a, b) => b.xp - a.xp || (a.kind === 'you' ? -1 : b.kind === 'you' ? 1 : 0));
  return rows.map((r, i) => ({ ...r, rank: i + 1, zone: zoneFor(i + 1, rows.length, tier) }));
}

export function zoneFor(rank, size, tier) {
  if (size < 8) return 'stay';
  if (rank <= ZONE && tier < TIERS.length - 1) return 'up';
  if (rank > size - ZONE && tier > 0) return 'down';
  return 'stay';
}

/**
 * Pergantian minggu: hitung peringkat akhir minggu lalu, lalu naik/turun divisi.
 * Pemain yang tidak mendapat XP sama sekali minggu itu tidak ikut dinilai.
 */
export function rolloverLeague(state, { now = new Date(), realPlayers = [], eligible = true } = {}) {
  const current = utcWeekKey(now);
  const prev = state.league.weekKey;
  if (prev === current) return null;
  state.league.weekKey = current;
  if (!prev || prev > current) return null; // data lama (minggu lokal) di depan minggu UTC: cukup sesuaikan
  if (!eligible) return null; // belum terdaftar dengan nomor telepon: tidak ikut liga, divisi tidak berubah

  const xp = weekXp(state, prev);
  const tierBefore = state.league.tier;
  if (xp <= 0) {
    state.league.lastResult = { weekKey: prev, outcome: 'idle', tierBefore, tierAfter: tierBefore, rank: null, seen: false };
    return state.league.lastResult;
  }
  const real = realPlayers
    .map((p) => (p.weekKey === prev ? { ...p, xpThen: p.weekXp } : p.prevWeekKey === prev ? { ...p, xpThen: p.prevWeekXp } : null))
    .filter((p) => p && p.ranked === true && p.tier === tierBefore && p.xpThen > 0)
    .slice(0, GROUP_SIZE - 1);
  const bots = botsFor(prev, tierBefore).slice(0, GROUP_SIZE - 1 - real.length);
  const scores = [xp, ...real.map((p) => p.xpThen), ...bots.map((b) => botXpAt(b, 1))];
  const rank = 1 + scores.slice(1).filter((s) => s > xp).length;
  const zone = zoneFor(rank, scores.length, tierBefore);
  const tierAfter = zone === 'up' ? tierBefore + 1 : zone === 'down' ? tierBefore - 1 : tierBefore;
  state.league.tier = tierAfter;
  state.league.lastResult = { weekKey: prev, outcome: zone, tierBefore, tierAfter, rank, xp, seen: false };
  return state.league.lastResult;
}

// ───────────── Teman simulasi ─────────────

export const SIM_FRIENDS = [
  { id: 'sim-1', name: 'Nadia', avatar: '🦊', rate: 55, playChance: 0.85, hour: 7 },
  { id: 'sim-2', name: 'Bima', avatar: '🐯', rate: 35, playChance: 0.6, hour: 20 },
  { id: 'sim-3', name: 'Sekar', avatar: '🐼', rate: 70, playChance: 0.95, hour: 6 },
  { id: 'sim-4', name: 'Dimas', avatar: '🐸', rate: 25, playChance: 0.45, hour: 21 },
  { id: 'sim-5', name: 'Laras', avatar: '🦄', rate: 45, playChance: 0.75, hour: 12 },
  { id: 'sim-6', name: 'Yoga', avatar: '🐧', rate: 60, playChance: 0.8, hour: 18 },
];

const playedOn = (f, day) => unit(`tahugak/friend/${f.id}/${day}`) < f.playChance;

/** Statistik teman simulasi, deterministik per hari. */
export function simFriendStats(f, now = new Date()) {
  const today = todayKey(now);
  const playsToday = playedOn(f, today) && now.getHours() >= f.hour;
  let streak = playsToday ? 1 : 0;
  let d = addDays(today, -1);
  for (let i = 0; i < 400 && playedOn(f, d); i++) { streak++; d = addDays(d, -1); }
  const days = dayNumber(today) - dayNumber('2026-01-01');
  const totalXp = 400 + Math.round(days * f.rate * f.playChance);
  const dailyScore = playsToday ? 2 + Math.floor(unit(`tahugak/friend/${f.id}/${today}/score`) * 4) : null;
  return { ...f, kind: 'sim', totalXp, streak, dailyScore };
}
