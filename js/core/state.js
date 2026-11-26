// Store sederhana: satu objek state, diubah lewat update(fn), lalu disimpan & disiarkan.

import { loadRaw, saveRaw, clearRaw } from './storage.js';
import { todayKey } from './dates.js';
import { emptyPath } from './path.js';
import { isCountry } from '../data/countries.js';
import { sanitizeAvatar, avatarForId } from './avatar.js';
import { normLang } from './i18n.js';

export const STATE_VERSION = 2;

export function defaultState() {
  return {
    version: STATE_VERSION,
    meta: { createdAt: Date.now(), updatedAt: 0 },
    profile: { name: '', avatarCfg: null, startDate: null, onboarded: false, country: null, leaderboard: false, wardrobe: { favs: [], recent: [], outfits: [null, null, null] } }, // country: ISO alpha-2 pilihan pemain; leaderboard: ikut Leaderboard (butuh akun claude.ai)
    xp: { total: 0, balance: 0 },
    xpLog: {},
    xpLogUtc: {},
    catXp: {},             // [cat] -> XP dari jawaban di kategori itu (papan kategori)
    catXpUtc: {},          // [utcDay] -> { [cat]: xp }, 40 hari terakhir
    milestones: {},        // [id] -> tanggal tercapai (core/milestones.js), untuk kartu Story
    xpUnranked: { total: 0, utc: {} }, // XP dari soal yang memakai Petunjuk: tidak masuk Leaderboard
    streak: { current: 0, longest: 0, lastDate: null, lost: null },
    activity: {},
    daily: {},             // [day] -> { score, total, perfect, completedAt }
    dailyProgress: null,   // { day, answers: [{ qid, chosen, correct }], boosts }
    history: [],           // sesi terakhir (maks 100)
    answers: {},           // [qid] -> { seen, correct, wrong, lastAt, lastCorrectDay }
    mistakes: {},          // [qid] -> { wrongCount, firstAt, lastWrongAt, mastered, masteredAt }
    stats: { sessions: 0, perfect: 0, questions: 0, correct: 0, mastered: 0, purchases: 0, reviews: 0, hints: 0 },
    catStats: {},          // [cat] -> { answered, correct, sessions }
    achievements: {},      // [id] -> ISO date
    inventory: { freeze: 0, doubleXp: 0, extraLife: 0, hint: 0 },
    boosts: { doubleXpLeft: 0 },
    settings: {
      timer: false,
      reducedMotion: false,
      reminders: { enabled: false, time: '19:00', lastNotified: null, push: false }, // push: notifikasi HP lewat server (versi aplikasi)
      funFact: { enabled: false, time: '08:00', lastNotified: null }, // fun fact harian (lihat core/funfact.js)
      lbBannerHidden: false,
      lang: 'id',           // 'id' | 'en' (lihat core/i18n.js)
    },
    league: { tier: 0, weekKey: null, lastResult: null },
    friends: { sim: [], real: [] },
    glossarySeen: {},      // [termId] -> timestamp pertama dibuka
    path: emptyPath(),   // Jalur Hafalan (lihat core/path.js)
    leaderboard: { showSim: null }, // null = ikuti mode (lokal: tampil, online: sembunyi)
    missions: null,        // misi harian (lihat core/missions.js)
    kilat: { best: 0, bestAt: null, plays: 0, total: 0, today: null }, // mode Kilat (core/kilat.js)
    duels: {},             // [id] -> duel (core/duel.js)
    duelStats: { won: 0, lost: 0, draw: 0 },
  };
}

/** Menggabungkan state tersimpan dengan default (untuk field baru di versi mendatang). */
export function migrate(raw) {
  const base = defaultState();
  if (!raw || typeof raw !== 'object' || raw.__corrupt) return base;
  const merged = { ...base, ...raw };
  for (const k of ['meta', 'profile', 'xp', 'streak', 'stats', 'inventory', 'boosts', 'league', 'friends', 'leaderboard', 'path']) {
    merged[k] = { ...base[k], ...(raw[k] || {}) };
  }
  merged.settings = {
    ...base.settings,
    ...(raw.settings || {}),
    reminders: { ...base.settings.reminders, ...(raw.settings?.reminders || {}) },
    funFact: { ...base.settings.funFact, ...(raw.settings?.funFact || {}) },
  };
  merged.settings.lang = normLang(merged.settings.lang);
  // v1 → v2: log XP UTC belum ada; perkirakan dari log lokal.
  if (!raw.xpLogUtc) merged.xpLogUtc = { ...(raw.xpLog || {}) };
  merged.glossarySeen = raw.glossarySeen || {};
  // v15: XP per kategori. Pemain lama: perkiraan seumur hidup dari jawaban benar (10 XP/soal),
  // diskalakan agar tidak melebihi total XP. Mingguan/bulanan mulai dihitung dari sekarang.
  if (!raw.catXp || typeof raw.catXp !== 'object') {
    const est = {};
    for (const [c, v] of Object.entries(merged.catStats || {})) if (v?.correct > 0) est[c] = v.correct * 10;
    const sum = Object.values(est).reduce((a, b) => a + b, 0);
    const cap = Math.floor((merged.xp?.total || 0) * 0.8);
    if (sum > cap) for (const c of Object.keys(est)) est[c] = Math.floor((est[c] * cap) / sum);
    merged.catXp = Object.fromEntries(Object.entries(est).filter(([, v]) => v > 0));
  }
  if (!raw.catXpUtc || typeof raw.catXpUtc !== 'object') merged.catXpUtc = {};
  merged.milestones = raw.milestones && typeof raw.milestones === 'object' && !Array.isArray(raw.milestones) ? raw.milestones : {};
  const ur = raw.xpUnranked;
  merged.xpUnranked = ur && typeof ur === 'object' && Number.isFinite(ur.total) ? { total: Math.max(0, ur.total), utc: ur.utc && typeof ur.utc === 'object' ? ur.utc : {} } : { total: 0, utc: {} };
  // v5 → v6: avatar emoji diganti avatar kustom. Pemain lama mendapat avatar acak yang tetap.
  merged.profile.avatarCfg = sanitizeAvatar(merged.profile.avatarCfg) || avatarForId(`player-${merged.meta.createdAt}`);
  delete merged.profile.avatar;
  const w = merged.profile.wardrobe || {};
  merged.profile.wardrobe = { favs: Array.isArray(w.favs) ? w.favs.filter((x) => typeof x === 'string').slice(0, 80) : [], recent: Array.isArray(w.recent) ? w.recent.filter((x) => typeof x === 'string').slice(0, 16) : [], outfits: [0, 1, 2].map((i) => (Array.isArray(w.outfits) && w.outfits[i] ? sanitizeAvatar(w.outfits[i]) : null)) };
  // v12: nomor telepon dihapus dari app. Yang dulu punya nomor tetap ikut Leaderboard dengan
  // negara yang sama; nomornya sendiri dibuang dari data.
  if (raw.profile && raw.profile.phone && raw.profile.leaderboard === undefined) merged.profile.leaderboard = true;
  delete merged.profile.phone;
  merged.profile.country = isCountry(merged.profile.country) ? merged.profile.country : null;
  merged.profile.leaderboard = merged.profile.leaderboard === true && !!merged.profile.country;
  if (merged.settings.phoneBannerHidden) merged.settings.lbBannerHidden = true;
  delete merged.settings.phoneBannerHidden;
  merged.version = STATE_VERSION;
  return merged;
}

let state = migrate(loadRaw());
const listeners = new Set();
let afterSave = null;

export const getState = () => state;

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Hook dipanggil setiap kali state disimpan (dipakai sinkronisasi cloud). */
export function onSaved(fn) { afterSave = fn; }

/** `unchanged(result)` → true: mutator tidak mengubah apa pun, jadi tidak perlu disimpan. */
export function update(mutator, { silent = false, unchanged = null } = {}) {
  const result = mutator(state);
  if (unchanged?.(result)) return result;
  state.meta.updatedAt = Date.now();
  saveRaw(state);
  if (afterSave) afterSave(state);
  if (!silent) listeners.forEach((fn) => fn(state));
  return result;
}

export function replaceState(next, { silent = false } = {}) {
  state = migrate(next);
  saveRaw(state);
  if (!silent) listeners.forEach((fn) => fn(state));
}

export function resetState() {
  clearRaw();
  state = defaultState();
  state.meta.updatedAt = Date.now();
  saveRaw(state);
  if (afterSave) afterSave(state);
  listeners.forEach((fn) => fn(state));
}

/** `country` diisi kalau pemain memilih ikut Leaderboard (hanya bisa dengan akun). */
export function completeOnboarding(name, avatarCfg, country = null) {
  update((s) => {
    s.profile.name = name.trim().slice(0, 24);
    s.profile.avatarCfg = sanitizeAvatar(avatarCfg);
    s.profile.onboarded = true;
    if (isCountry(country)) { s.profile.country = country; s.profile.leaderboard = true; }
    s.profile.startDate = s.profile.startDate || todayKey();
  });
}
