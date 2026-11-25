// Misi harian: 3 misi kecil per tanggal (sama untuk semua pemain), hadiah XP, bonus kalau semua selesai.
// Dipanggil dari mesin kuis, Kilat, duel, dan tombol bagikan lewat trackMission().

import { CATEGORIES, CATEGORY_BY_ID } from '../data/categories.js';
import { seeded, shuffle } from './rng.js';
import { todayKey } from './dates.js';
import { awardXp } from './xp.js';
import { L } from './i18n.js';

export const MISSION_XP = 15;
export const MISSION_BONUS_XP = 30;

// kind → { target, weight, teks }
const KINDS = {
  daily: { target: 1, text: () => L('Selesaikan tantangan harian', 'Finish the daily challenge') },
  cat: { target: 3, text: (m) => L(`Jawab benar 3 soal ${CATEGORY_BY_ID[m.cat].name}`, `Get 3 ${CATEGORY_BY_ID[m.cat].name} questions right`) },
  correct: { target: 12, text: () => L('Jawab benar 12 soal di mode apa saja', 'Get 12 questions right in any mode') },
  combo: { target: 4, text: () => L('Jawab benar 4 soal berturut-turut', 'Get 4 questions right in a row') },
  review: { target: 3, text: () => L('Ulas 3 soal yang pernah salah', 'Review 3 questions you got wrong') },
  path: { target: 1, text: () => L('Selesaikan satu tahap Jalur Hafalan', 'Finish one Memory Path stage') },
  kilat: { target: 8, text: () => L('Dapatkan 8 benar dalam satu ronde Kilat', 'Get 8 right in one Lightning round') },
  duel: { target: 1, text: () => L('Selesaikan satu duel', 'Finish a duel') },
  share: { target: 1, text: () => L('Bagikan hasil tantangan harianmu', 'Share your daily challenge result') },
  xp: { target: 80, text: () => L('Kumpulkan 80 XP hari ini', 'Earn 80 XP today') },
};
const ORDER = ['cat', 'correct', 'combo', 'kilat', 'duel', 'share', 'review', 'path', 'xp', 'daily'];

/** Daftar misi untuk satu tanggal. `hasMistakes` menentukan apakah misi ulasan boleh muncul. */
export function missionsFor(day, { hasMistakes = true } = {}) {
  const rand = seeded(`tahugak/missions/${day}`);
  const kinds = shuffle(ORDER.filter((k) => hasMistakes || k !== 'review'), rand).slice(0, 3);
  const cats = CATEGORIES.filter((c) => c.id !== 'matematika');
  return kinds.map((kind) => {
    const m = { kind, target: KINDS[kind].target, progress: 0, done: false };
    if (kind === 'cat') m.cat = cats[Math.floor(rand() * cats.length)].id;
    return m;
  });
}

export const missionText = (m) => KINDS[m.kind]?.text(m) ?? '';

/** Pastikan misi hari ini sudah ada di state. */
export function ensureMissions(state, day = todayKey()) {
  if (!state.missions || state.missions.day !== day) {
    const hasMistakes = Object.values(state.mistakes || {}).filter((m) => !m.mastered).length >= 3;
    state.missions = { day, list: missionsFor(day, { hasMistakes }), bonus: false, done: state.missions?.done || 0, bonusDays: state.missions?.bonusDays || 0 };
  }
  return state.missions;
}

/**
 * Mencatat kejadian dan memberi hadiah untuk misi yang baru selesai.
 * event: { type: 'answer', correct, category, mode, combo } | { type: 'session', mode, stage }
 *        | { type: 'kilat', score } | { type: 'duel' } | { type: 'share' }
 * @returns [{ text, xp }] misi (dan bonus) yang baru selesai
 */
export function trackMission(state, event, day = todayKey()) {
  const ms = ensureMissions(state, day);
  const done = [];
  for (const m of ms.list) {
    if (m.done) continue;
    let p = m.progress;
    switch (m.kind) {
      case 'cat': if (event.type === 'answer' && event.correct && event.category === m.cat) p++; break;
      case 'correct': if (event.type === 'answer' && event.correct) p++; break;
      case 'combo': if (event.type === 'answer') p = Math.max(p, event.combo || 0); break;
      case 'review': if (event.type === 'answer' && event.mode === 'review') p++; break;
      case 'daily': if (event.type === 'session' && event.mode === 'daily') p = 1; break;
      case 'path': if (event.type === 'session' && event.mode === 'path') p = 1; break;
      case 'kilat': if (event.type === 'kilat') p = Math.max(p, event.score); break;
      case 'duel': if (event.type === 'duel') p = 1; break;
      case 'share': if (event.type === 'share') p = 1; break;
      default: break;
    }
    m.progress = Math.min(p, m.target);
  }
  // Misi XP dicek terakhir (dan diulang) karena hadiah misi lain juga menambah XP hari ini.
  let again = true;
  while (again) {
    again = false;
    for (const m of ms.list) {
      if (m.kind === 'xp' && !m.done) m.progress = Math.min(state.xpLog[day] || 0, m.target);
      if (!m.done && m.progress >= m.target) {
        m.done = true;
        ms.done += 1;
        awardXp(state, MISSION_XP, day);
        done.push({ text: missionText(m), xp: MISSION_XP });
        again = true;
      }
    }
  }
  if (!ms.bonus && ms.list.every((m) => m.done)) {
    ms.bonus = true;
    ms.bonusDays += 1;
    awardXp(state, MISSION_BONUS_XP, day);
    done.push({ text: L('Bonus: semua misi hari ini selesai', 'Bonus: all of today\'s missions done'), xp: MISSION_BONUS_XP, bonus: true });
  }
  return done;
}
