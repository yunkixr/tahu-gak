// Jalur Hafalan (spaced repetition berbasis sesi).
//
// - Tahap 1: 5 soal baru. Tahap berikutnya: 5 soal baru + 5 soal lama, sampai semua soal dikenal.
//   Setelah semua soal dikenal: putaran ulang berisi 10 soal lama.
// - Setiap soal di jalur punya "kotak" (sistem Leitner):
//     salah  → kotak 0, muncul lagi di sesi berikutnya
//     benar  → naik satu kotak (maks 5), jeda sebelum muncul lagi makin panjang
//   Kotak ≥ 3 (benar 3× berturut-turut) = HAFAL.
// - Jeda dihitung dalam SESI jalur, bukan hari, supaya bisa dimainkan dengan ritme sendiri.

import { QUESTIONS, QUESTION_BY_ID, isReleased } from '../data/questions.js';
import { todayKey } from './dates.js';
import { CATEGORIES } from '../data/categories.js';
import { seeded, shuffle } from './rng.js';
import { isEn, L } from './i18n.js';

export const PATH_NEW = 5;
export const PATH_OLD = 5;
export const PATH_REVIEW_ONLY = 10;
export const MEMORIZED_BOX = 3;
export const MAX_BOX = 5;
/** Jeda (dalam sesi) sebelum soal di kotak tertentu muncul lagi. */
export const INTERVALS = [1, 1, 2, 4, 8, 16];

let curriculum = null;
/**
 * Urutan soal baru: dari mudah ke sulit, bergiliran antarkategori.
 * Urutan di dalam kategori diacak dengan seed tetap, jadi sama untuk semua pemain.
 */
export function pathCurriculum() {
  if (curriculum) return curriculum;
  curriculum = [];
  const base = QUESTIONS.filter((q) => !q.since);
  for (const diff of [1, 2, 3]) {
    const lanes = CATEGORIES.map((c) => shuffle(
      base.filter((q) => q.category === c.id && q.difficulty === diff).map((q) => q.id),
      seeded(`tahugak/path/${c.id}/${diff}`),
    ));
    interleave(lanes);
  }
  // Soal yang ditambahkan belakangan masuk di AKHIR kurikulum (per tanggal rilis), supaya urutan
  // tahap pemain yang sedang berjalan tidak berubah saat bank soal diperbarui.
  const later = QUESTIONS.filter((q) => q.since);
  for (const day of [...new Set(later.map((q) => q.since))].sort()) {
    const batch = later.filter((q) => q.since === day);
    for (const diff of [1, 2, 3]) interleave(CATEGORIES.map((c) => batch.filter((q) => q.category === c.id && q.difficulty === diff).map((q) => q.id)));
  }
  return curriculum;
}
function interleave(lanes) {
  for (let i = 0; lanes.some((l) => i < l.length); i++) {
    for (const lane of lanes) if (i < lane.length) curriculum.push(lane[i]);
  }
}
/** Kurikulum yang sudah dirilis per hari ini. */
const releasedCurriculum = (day = todayKey()) => pathCurriculum().filter((id) => isReleased(QUESTION_BY_ID[id], day));

export function emptyPath() {
  return { introduced: [], items: {}, sessions: 0 };
}

export function pathStatus(state) {
  const p = state.path;
  const total = releasedCurriculum().length;
  const introduced = p.introduced.filter((id) => QUESTION_BY_ID[id]).length;
  const boxes = [0, 0, 0, 0, 0, 0];
  let due = 0;
  for (const id of p.introduced) {
    const it = p.items[id];
    if (!it || !QUESTION_BY_ID[id]) continue;
    boxes[it.box]++;
    if (it.due <= p.sessions) due++;
  }
  const memorized = boxes.slice(MEMORIZED_BOX).reduce((a, b) => a + b, 0);
  const stages = Math.ceil(total / PATH_NEW);
  const stage = Math.min(stages, Math.floor(introduced / PATH_NEW)); // indeks tahap berikutnya (0-based)
  return { total, introduced, memorized, due, boxes, stages, stage, done: introduced >= total, sessions: p.sessions };
}

function pickOld(state, count, exclude) {
  const p = state.path;
  const now = p.sessions;
  return p.introduced
    .filter((id) => QUESTION_BY_ID[id] && p.items[id] && !exclude.has(id))
    .map((id) => ({ id, ...p.items[id] }))
    .sort((a, b) => (a.due <= now ? 0 : 1) - (b.due <= now ? 0 : 1) || a.box - b.box || a.due - b.due || a.lastSession - b.lastSession)
    .slice(0, count)
    .map((x) => x.id);
}

/** Menyusun sesi jalur berikutnya. */
export function buildPathSession(state, toItem) {
  const p = state.path;
  const known = new Set(p.introduced);
  const newIds = releasedCurriculum().filter((id) => !known.has(id)).slice(0, PATH_NEW);
  const oldIds = pickOld(state, newIds.length ? PATH_OLD : PATH_REVIEW_ONLY, new Set(newIds));
  const st = pathStatus(state);
  const ids = shuffle([...newIds, ...oldIds]);
  return {
    mode: 'path',
    title: newIds.length ? L(`Tahap ${st.stage + 1}`, `Stage ${st.stage + 1}`) : L('Putaran ulang', 'Review round'),
    stage: st.stage + 1,
    newIds,
    oldIds,
    items: ids.map((id) => toItem(QUESTION_BY_ID[id])),
  };
}

/** Dipanggil untuk percobaan PERTAMA setiap soal di sesi jalur. */
export function recordPathAnswer(state, qid, correct) {
  const p = state.path;
  if (!p.introduced.includes(qid)) p.introduced.push(qid);
  const it = p.items[qid] || { box: 0, due: 0, seen: 0, correct: 0, wrong: 0, lastSession: 0 };
  const before = it.box;
  const wasNew = it.seen === 0;
  it.seen++;
  if (correct) { it.correct++; it.box = wasNew ? 1 : Math.min(MAX_BOX, it.box + 1); }
  else { it.wrong++; it.box = 0; }
  it.due = p.sessions + INTERVALS[it.box]; // sesi ke berapa soal ini muncul lagi
  it.lastSession = p.sessions;
  p.items[qid] = it;
  return { box: it.box, memorizedNow: before < MEMORIZED_BOX && it.box >= MEMORIZED_BOX, forgot: before >= MEMORIZED_BOX && !correct };
}

const BOX_ID = ['Perlu diulang', 'Baru kenal', 'Mulai ingat', 'Hafal', 'Hafal banget', 'Melekat'];
const BOX_EN = ['Needs review', 'Just met', 'Starting to stick', 'Memorized', 'Well memorized', 'Locked in'];
export const BOX_LABELS = new Proxy(BOX_ID, { get: (_, k) => Reflect.get(isEn() ? BOX_EN : BOX_ID, k) });
