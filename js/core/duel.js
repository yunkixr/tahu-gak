// Duel teman: dua pemain menjawab 5 soal yang sama (urutan pilihan juga sama), lalu skornya dibandingkan.
//
// Tanpa server khusus: setiap pemain menaruh hasil duelnya di baris publiknya sendiri (players/<id>.duels).
//   - Penantang menulis { id, role: 'from', with: <id lawan>, qids, score, ms, marks }.
//   - Lawan melihatnya di baris penantang, memainkan soal yang sama, lalu menulis { role: 'to' } di barisnya.
//   - Masing-masing membaca baris lawan untuk mengetahui hasil akhirnya.
// Lawan simulasi langsung "menjawab" secara deterministik (dan selalu berlabel simulasi).

import { QUESTION_BY_ID, QUESTIONS, isReleased } from '../data/questions.js';
import { SIMS_ENABLED } from './flags.js';
import { CATEGORIES } from '../data/categories.js';
import { seeded, shuffle, unit } from './rng.js';
import { todayKey } from './dates.js';
import { awardXp } from './xp.js';
import { trackMission } from './missions.js';
import { L } from './i18n.js';
import { SIM_FRIENDS } from './league.js';

export const DUEL_SIZE = 5;
export const DUEL_WIN_XP = 15;
export const DUEL_DRAW_XP = 5;
const MAX_PUBLIC = 12;
const MAX_STORED = 40;
const INCOMING_DAYS = 7;

const ID_RE = /^d[a-z0-9]{8,24}$/;
const UID_RE = /^[A-Za-z0-9_\-:.@]{1,128}$/;

export function newDuelId(rand = Math.random) {
  return `d${Date.now().toString(36)}${Math.floor(rand() * 36 ** 4).toString(36).padStart(4, '0')}`;
}

/** 5 soal dari 5 kategori berbeda, ditentukan dari id duel (sama untuk kedua pemain). */
export function duelQids(id) {
  const rand = seeded(`tahugak/duel/${id}`);
  const cats = shuffle(CATEGORIES.map((c) => c.id), rand).slice(0, DUEL_SIZE);
  // Kumpulan soal dikunci ke tanggal (UTC) pembuatan duel, supaya kedua pemain mendapat soal yang
  // sama walaupun bank soal bertambah setelahnya.
  const ts = parseInt(String(id).slice(1, -4), 36);
  const created = Number.isFinite(ts) && ts > 1.6e12 && ts < 4e12 ? new Date(ts).toISOString().slice(0, 10) : '0000-00-00';
  return cats.map((cat) => {
    const pool = QUESTIONS.filter((q) => q.category === cat && isReleased(q, created));
    return pool[Math.floor(rand() * pool.length)].id;
  });
}

/** Spesifikasi sesi kuis duel. `toItem` dari core/quiz.js (diteruskan untuk menghindari impor melingkar). */
export function buildDuelSpec(duel, toItem, opponentName) {
  return {
    mode: 'duel', duelId: duel.id, title: L(`Duel lawan ${opponentName}`, `Duel vs ${opponentName}`), opponentName,
    items: duel.qids.map((qid) => toItem(QUESTION_BY_ID[qid], seeded(`tahugak/duel/${duel.id}/opts/${qid}`))),
  };
}

export function outcomeOf(me, them) {
  if (!me || !them) return null;
  if (me.score !== them.score) return me.score > them.score ? 'win' : 'lose';
  if (me.ms !== them.ms) return me.ms < them.ms ? 'win' : 'lose';
  return 'draw';
}

/** Hasil lawan simulasi: deterministik dari id duel dan "kemampuan" teman simulasi. */
export function simDuelResult(friend, id) {
  const p = Math.min(0.9, 0.35 + (friend.rate || 40) / 150);
  const marks = Array.from({ length: DUEL_SIZE }, (_, i) => (unit(`tahugak/duel/${id}/${friend.id}/${i}`) < p ? 1 : 0));
  return { score: marks.reduce((a, b) => a + b, 0), ms: Math.round(25000 + unit(`tahugak/duel/${id}/${friend.id}/ms`) * 45000), marks, at: Date.now() };
}

function ensure(state) {
  state.duels = state.duels || {};
  state.duelStats = state.duelStats || { won: 0, lost: 0, draw: 0 };
}

/** Membuat duel baru (kamu penantangnya). */
export function createDuel(state, { id: withId, kind }, rand = Math.random) {
  ensure(state);
  const id = newDuelId(rand);
  const duel = { id, with: withId, kind: kind === 'real' ? 'real' : 'sim', role: 'from', qids: duelQids(id), at: Date.now(), me: null, them: null, settled: false };
  state.duels[id] = duel;
  return duel;
}

/** Menerima tantangan dari baris pemain lain (sudah disaring dengan sanitizeDuelEntry). */
export function acceptDuel(state, entry) {
  ensure(state);
  if (state.duels[entry.id]) return state.duels[entry.id];
  const duel = { id: entry.id, with: entry.from, kind: 'real', role: 'to', qids: entry.qids, at: entry.at, me: null,
    them: { score: entry.score, ms: entry.ms, marks: entry.marks, at: entry.at }, settled: false };
  state.duels[entry.id] = duel;
  return duel;
}

/** Hadiah & statistik saat kedua hasil sudah ada. Hanya sekali per duel. */
function settle(state, duel) {
  const outcome = outcomeOf(duel.me, duel.them);
  if (!outcome || duel.settled) return outcome;
  duel.settled = true;
  duel.outcome = outcome;
  if (outcome === 'win') { state.duelStats.won++; awardXp(state, DUEL_WIN_XP); }
  else if (outcome === 'lose') state.duelStats.lost++;
  else { state.duelStats.draw++; awardXp(state, DUEL_DRAW_XP); }
  return outcome;
}

/** Menyimpan hasilmu setelah sesi duel selesai. Lawan simulasi langsung mendapat hasilnya. */
export function recordDuelResult(state, id, result) {
  ensure(state);
  const duel = state.duels[id];
  if (!duel || duel.me) return null;
  duel.me = { ...result, at: Date.now() };
  if (duel.kind === 'sim' && !duel.them) duel.them = simDuelResult(SIM_FRIENDS.find((f) => f.id === duel.with) || { id: duel.with, rate: 45 }, id);
  const outcome = settle(state, duel);
  const missions = trackMission(state, { type: 'duel' });
  prune(state);
  return { id, outcome, me: duel.me, them: duel.them, with: duel.with, kind: duel.kind, missions,
    xp: outcome === 'win' ? DUEL_WIN_XP : outcome === 'draw' ? DUEL_DRAW_XP : 0 };
}

function prune(state) {
  const all = Object.values(state.duels).sort((a, b) => b.at - a.at);
  for (const d of all.slice(MAX_STORED)) delete state.duels[d.id];
}

// ───────────── Data publik ─────────────

/** Entri duel untuk baris publikmu: hanya duel yang sudah kamu mainkan. */
export function publicDuels(state) {
  return Object.values(state.duels || {}).filter((d) => d.kind === 'real' && d.me)
    .sort((a, b) => b.at - a.at).slice(0, MAX_PUBLIC)
    .map((d) => ({ id: d.id, role: d.role, with: d.with, qids: d.qids, at: d.at, score: d.me.score, ms: d.me.ms, marks: d.me.marks }));
}

const isInt = (n, lo, hi) => Number.isInteger(n) && n >= lo && n <= hi;

/** Memvalidasi entri duel dari baris pemain lain. Mengembalikan entri bersih atau null. */
export function sanitizeDuelEntry(e, ownerId) {
  if (!e || typeof e !== 'object') return null;
  if (typeof e.id !== 'string' || !ID_RE.test(e.id)) return null;
  if (e.role !== 'from' && e.role !== 'to') return null;
  if (typeof e.with !== 'string' || !UID_RE.test(e.with)) return null;
  if (!Array.isArray(e.qids) || e.qids.length !== DUEL_SIZE || !e.qids.every((q) => typeof q === 'string' && QUESTION_BY_ID[q])) return null;
  if (e.qids.join() !== duelQids(e.id).join()) return null; // soal harus sesuai id duel
  if (!isInt(e.score, 0, DUEL_SIZE) || !isInt(e.ms, 0, 600000) || !isInt(e.at, 0, Date.now() + 86400000)) return null;
  const marks = Array.isArray(e.marks) && e.marks.length === DUEL_SIZE && e.marks.every((m) => m === 0 || m === 1 || m === 2) ? e.marks : null;
  if (marks && marks.filter((m) => m > 0).length !== e.score) return null;
  return { id: e.id, role: e.role, from: ownerId, with: e.with, qids: e.qids.slice(), score: e.score, ms: e.ms, at: e.at, marks };
}

/**
 * Menyelaraskan duel dengan baris pemain lain.
 * - Tantangan baru untukmu (role 'from', with = kamu) → ditambahkan sebagai tantangan masuk.
 * - Balasan lawan untuk tantanganmu (role 'to' dengan id sama) → hasil lawan disimpan & duel diselesaikan.
 * @returns daftar perubahan: [{ type: 'incoming'|'settled', duel }]
 */
export function syncDuels(state, players, myId, now = Date.now()) {
  ensure(state);
  if (!myId) return [];
  const changes = [];
  for (const row of players) {
    if (!row || typeof row.id !== 'string' || row.id === myId || !Array.isArray(row.duels)) continue;
    for (const raw of row.duels.slice(0, MAX_PUBLIC)) {
      const e = sanitizeDuelEntry(raw, row.id);
      if (!e || e.with !== myId) continue;
      const mine = state.duels[e.id];
      if (e.role === 'from' && !mine && now - e.at < INCOMING_DAYS * 86400000) {
        changes.push({ type: 'incoming', duel: acceptDuel(state, e) });
      } else if (e.role === 'to' && mine && mine.role === 'from' && mine.with === row.id && !mine.them) {
        mine.them = { score: e.score, ms: e.ms, marks: e.marks, at: e.at };
        if (settle(state, mine)) changes.push({ type: 'settled', duel: mine });
      }
    }
  }
  return changes;
}

/** Duel untuk ditampilkan: tantangan masuk dulu, lalu yang terbaru. */
export function duelList(state) {
  const all = Object.values(state.duels || {}).filter((d) => SIMS_ENABLED || d.kind !== 'sim');
  const incoming = all.filter((d) => d.role === 'to' && !d.me).sort((a, b) => b.at - a.at);
  const rest = all.filter((d) => !(d.role === 'to' && !d.me)).sort((a, b) => b.at - a.at).slice(0, 8);
  return { incoming, rest };
}

/** Duel yang menunggu lawan tertentu (supaya tidak menantang dua kali sekaligus). */
export const pendingWith = (state, friendId) => Object.values(state.duels || {}).find((d) => d.with === friendId && d.role === 'from' && d.me && !d.them);

export { todayKey };
