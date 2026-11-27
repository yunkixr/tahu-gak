// Sinkronisasi cloud (opsional) memakai kapabilitas `db` + `user` dari halaman artifact Claude.
//
// - Progres pribadi : data/users/<id>/progress   (privat, hanya pemiliknya)
// - Baris liga      : players/<id>               (dibaca semua orang, ditulis pemiliknya)
//
// Jika kapabilitas tidak tersedia (dibuka sebagai file lokal, belum login, atau hanya akses
// "Viewer"), aplikasi tetap berjalan penuh dengan localStorage saja.

import { todayKey, addDays, utcWeekKey, utcMonthKey } from './dates.js';
import { isValidUsername } from './username.js';
import { levelInfo, rankedTotalXp } from './xp.js';
import { weekXp } from './league.js';
import { myScores, publicCatScores } from './leaderboard.js';
import { isCountry } from '../data/countries.js';
import { publicDuels } from './duel.js';
import { sanitizeAvatar } from './avatar.js';
import { L } from './i18n.js';
import { FIREBASE_CONFIG } from '../firebase-config.js';

const REASONS = {
  none: ['Belum terhubung', 'Not connected yet'],
  local: ['Mode lokal: progres disimpan di browser ini.', 'Local mode: progress is saved in this browser.'],
  signin: ['Masuk ke claude.ai untuk menyinkronkan progres.', 'Sign in to claude.ai to sync your progress.'],
  unknown: ['Akun tidak dikenali di halaman ini.', 'Your account isn\'t recognized on this page.'],
  synced: ['Tersinkron ke akunmu', 'Synced to your account'],
  failed: ['Sinkronisasi gagal, progres disimpan di browser ini.', 'Sync failed; progress is saved in this browser.'],
  viewer: ['Aksesmu hanya "Viewer": progres disimpan di browser ini saja.', 'You have "Viewer" access only: progress is saved in this browser.'],
};
/**
 * Versi aplikasi mandiri (PWA/APK, `<html data-build="app">`): tidak ada akun claude.ai, jadi
 * Leaderboard, teman & duel online tidak tersedia. Teks UI menyesuaikan lewat flag ini.
 */
export const IS_APP_BUILD = typeof document !== 'undefined' && document.documentElement?.dataset?.build === 'app';
/** Versi aplikasi yang punya server sendiri (Firebase): Leaderboard, teman & duel jalan saat online. */
export const APP_HAS_SERVER = IS_APP_BUILD && !!FIREBASE_CONFIG?.apiKey;
export const isFirebase = () => typeof window !== 'undefined' && window.claude?.backend === 'firebase';

/** Penjelasan saat fitur online tidak tersedia di versi aplikasi. */
export const appOfflineText = () => (APP_HAS_SERVER
  ? L('Leaderboard, teman, dan duel butuh internet. Sambungkan HP ke internet, lalu buka ulang aplikasinya.', 'The Leaderboard, friends, and duels need internet. Connect your phone, then reopen the app.')
  : L('Leaderboard, teman, dan duel online hanya ada di versi claude.ai. Di aplikasi ini kamu main solo, dan progresmu tersimpan di HP ini.', 'The Leaderboard, friends, and online duels are only in the claude.ai version. In this app you play solo, and your progress is saved on this phone.'));

/** Keterangan akun saat terhubung, sesuai versi (claude.ai atau aplikasi). */
export const onlineAccountText = () => (isFirebase()
  ? L('Terhubung ke server. Progresmu dicadangkan online untuk HP ini; menghapus data aplikasi akan memutus progresmu.', 'Connected to the tahu gak? server. Your progress is backed up online for this phone; clearing the app\'s data will disconnect it.')
  : L('Masuk dengan akun claude.ai. Progresmu tersimpan di akunmu.', 'Signed in with claude.ai. Your progress is saved to your account.'));

const status = { mode: 'local', reason: 'none', uid: null, canWrite: false };
let db = null;
let user = null;
let players = [];
const playerListeners = new Set();
let pushTimer = null;
let progressChain = Promise.resolve();
let playerChain = Promise.resolve();
let lastPlayerJson = '';
let lastProgressJson = '';

export const cloudStatus = () => ({ ...status, reason: L(...REASONS[status.reason]) });
// ───────────── Username unik (hanya backend Firebase versi aplikasi) ─────────────
export const usernamesSupported = () => typeof window !== 'undefined' && !!window.claude?.usernames && status.mode === 'cloud';
/** 'ok' | 'taken' | 'offline' | 'error' | 'unsupported' */
export async function claimUsername(name) {
  if (!usernamesSupported()) return 'unsupported';
  return window.claude.usernames.claim(name);
}
export async function releaseUsername(name) {
  if (usernamesSupported() && name) await window.claude.usernames.release(name);
}
/** uid pemilik, null kalau belum dipakai, undefined kalau tidak bisa dicek */
export async function usernameOwner(name) {
  if (!usernamesSupported()) return undefined;
  return window.claude.usernames.get(name);
}
export const myUid = () => status.uid;

export const getPlayers = () => players.filter((p) => p.id !== status.uid);
export const onPlayers = (fn) => { playerListeners.add(fn); return () => playerListeners.delete(fn); };
export const userApi = () => user;
/** Masuk dengan akun claude.ai yang bisa menyimpan: syarat ikut Leaderboard. */
export const hasAccount = () => status.mode === 'cloud';
/** Ikut Leaderboard: punya akun, memilih ikut, dan sudah memilih negara. */
export const isRanked = (state) => hasAccount() && state.profile.leaderboard === true && isCountry(state.profile.country);
/** Hanya untuk tes unit: berpura-pura sudah masuk akun. */
export function _testSetAccount(uid) { status.mode = uid ? 'cloud' : 'local'; status.uid = uid || null; }

function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve(null), ms))]);
}

/** Menghubungkan ke db. Mengembalikan progres cloud (atau null). Tidak pernah melempar error. */
export async function initCloud() {
  if (typeof window === 'undefined' || !window.claude?.use) {
    status.reason = 'local';
    return null;
  }
  try {
    [db, user] = await withTimeout(Promise.all([window.claude.use('db'), window.claude.use('user')]), 10000) || [null, null];
    if (!db || !user) { status.reason = 'signin'; return null; }
    status.uid = await user.id();
    if (!status.uid) { status.reason = 'unknown'; return null; }
    status.mode = 'cloud';
    status.reason = 'synced';
    status.canWrite = true;

    db.collection('players').onSnapshot(
      (snap) => {
        players = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        playerListeners.forEach((fn) => fn(getPlayers()));
      },
      () => { /* liga asli tidak tersedia, bot tetap jalan */ },
    );

    const snap = await withTimeout(db.doc(`data/users/${status.uid}/progress`).get(), 10000);
    if (snap && snap.exists) {
      const body = snap.data();
      try { return JSON.parse(body.json); } catch { return null; }
    }
    return null;
  } catch (e) {
    console.warn('[tahu gak] cloud tidak tersedia', e);
    status.mode = 'local';
    status.reason = 'failed';
    return null;
  }
}

function markReadOnly(err) {
  if (err?.code === 'invalid_argument') {
    status.canWrite = false;
    status.mode = 'readonly';
    status.reason = 'viewer';
  }
}

/** Baris publik pemain. TIDAK PERNAH memuat nomor telepon; hanya kode negara bila terdaftar. */
export function playerRow(state) {
  const now = new Date();
  const wk = utcWeekKey(now);
  const prevWk = addDays(wk, -7);
  const today = todayKey(now);
  const scores = myScores(state, now);
  // Baris ini menyimpan STATE (bukan penambahan), jadi menulis ulang tidak pernah menggandakan XP.
  const ranked = isRanked(state);
  return {
    ranked,                                         // hanya pemain berakun yang memilih ikut Leaderboard
    country: ranked ? state.profile.country : null, // negara pilihan pemain
    startDate: state.profile.startDate,
    sessions: state.stats.sessions,
    monthKey: utcMonthKey(now),
    monthXp: scores.month,
    nickname: state.profile.name.slice(0, 24),
    username: isValidUsername(state.profile.username) ? state.profile.username : null, // @handle unik untuk dicari teman
    avatarCfg: sanitizeAvatar(state.profile.avatarCfg), // hanya pilihan dari daftar, tanpa teks bebas
    totalXp: rankedTotalXp(state),                 // tanpa XP soal berpetunjuk (aturan Petunjuk)
    duels: status.mode === 'cloud' ? publicDuels(state) : [], // hasil duel yang sudah kamu mainkan (tanpa data pribadi)
    level: levelInfo(state.xp.total).level,
    streak: state.streak.current,
    longest: state.streak.longest,
    tier: state.league.tier,
    weekKey: wk,
    weekXp: scores.week,
    prevWeekKey: prevWk,
    prevWeekXp: weekXp(state, prevWk),
    dailyDate: state.daily[today] ? today : null,
    dailyScore: state.daily[today]?.score ?? null,
    ...publicCatScores(state, now),                 // XP per kategori: { catWeek, catMonth, catAll } (papan kategori)
  };
}

/** Dijadwalkan setelah setiap perubahan state (debounce), satu penulisan per dokumen. */
export function schedulePush(state) {
  if (status.mode !== 'cloud' || !status.canWrite) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => pushNow(state), 1500);
}

export function pushNow(state) {
  if (status.mode !== 'cloud' || !status.canWrite || !state.profile.onboarded) return;
  const progressJson = JSON.stringify(state);
  if (progressJson !== lastProgressJson) {
    lastProgressJson = progressJson;
    progressChain = progressChain
      .then(() => db.doc(`data/users/${status.uid}/progress`).set({ json: progressJson, updatedAt: state.meta.updatedAt }))
      .catch(markReadOnly);
  }
  const row = playerRow(state);
  const rowJson = JSON.stringify(row);
  if (rowJson !== lastPlayerJson) {
    lastPlayerJson = rowJson;
    playerChain = playerChain
      .then(() => db.doc(`players/${status.uid}`).set({ ...row, updatedAt: Date.now() }))
      .catch(markReadOnly);
  }
}

/** Nama tampilan pemain asli, diambil dari profil akun (bukan disimpan). */
export async function resolveNames(ids) {
  if (!user || !ids.length) return {};
  try { return await user.profiles(ids); } catch { return {}; }
}

/** Nama akun claude.ai yang sedang masuk (hanya untuk ditampilkan, tidak disimpan). */
export async function accountName() {
  if (!user) return '';
  try { return (await user.me()).name || ''; } catch { return ''; }
}

export async function searchPeople(q) {
  if (!user) return [];
  try { return await user.search(q); } catch { return []; }
}
