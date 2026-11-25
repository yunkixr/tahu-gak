// Mode Kilat: jawab sebanyak mungkin dalam 60 detik. Tanpa penjelasan di tengah, langsung soal berikutnya.
// Jawaban dicatat di statistik (akurasi per kategori), tapi salah di mode ini TIDAK masuk daftar
// kesalahan supaya tebakan cepat tidak membanjiri daftar ulasan.

import { QUESTIONS, isReleased } from '../data/questions.js';
import { shuffle } from './rng.js';
import { todayKey } from './dates.js';
import { checkMilestones } from './milestones.js';
import { awardXp, awardCatXp, levelInfo } from './xp.js';
import { recordQualifyingDay } from './streak.js';
import { checkAchievements } from './achievements.js';
import { trackMission } from './missions.js';

export const KILAT_SECONDS = 60;
export const KILAT_XP = 2;        // per jawaban benar
const POOL_SIZE = 80;

/** Soal acak (mudah & sedang) dengan pilihan teracak. `toItem` dari core/quiz.js. */
export function buildKilat(toItem, rand = Math.random) {
  const today = todayKey();
  const pool = QUESTIONS.filter((q) => q.difficulty <= 2 && isReleased(q, today));
  return shuffle(pool, rand).slice(0, POOL_SIZE).map((q) => toItem(q, rand));
}

export function emptyKilat() {
  return { best: 0, bestAt: null, plays: 0, total: 0, today: null };
}

/** Mencatat satu jawaban (statistik saja). Mengembalikan misi yang baru selesai. */
export function recordKilatAnswer(state, q, correct, combo, day = todayKey()) {
  const a = (state.answers[q.id] = state.answers[q.id] || { seen: 0, correct: 0, wrong: 0, lastAt: 0, lastCorrectDay: null });
  const cs = (state.catStats[q.category] = state.catStats[q.category] || { answered: 0, correct: 0, sessions: 0 });
  a.seen++; a.lastAt = Date.now();
  cs.answered++;
  state.stats.questions++;
  if (correct) { a.correct++; cs.correct++; state.stats.correct++; } else a.wrong++;
  return trackMission(state, { type: 'answer', correct, category: q.category, mode: 'kilat', combo }, day);
}

/** Menutup ronde: XP, rekor, streak, riwayat, misi, pencapaian. */
export function finishKilat(state, { score, answered, cats = {} }, day = todayKey()) {
  state.kilat = { ...emptyKilat(), ...(state.kilat || {}) };
  const k = state.kilat;
  const levelStart = levelInfo(state.xp.total).level;
  const xpStart = state.xp.total;
  const xp = score * KILAT_XP;
  awardXp(state, xp, day);
  // XP kategori dari jawaban benar per kategori (jumlahnya tidak boleh melebihi skor).
  let left = score;
  for (const [c, n] of Object.entries(cats)) {
    const k = Math.max(0, Math.min(Number(n) || 0, left));
    left -= k;
    awardCatXp(state, c, k * KILAT_XP);
  }
  const prevBest = k.best;
  const newBest = score > prevBest;
  if (newBest) { k.best = score; k.bestAt = Date.now(); }
  k.plays++;
  k.total += score;
  k.today = { day, best: Math.max(score, k.today?.day === day ? k.today.best : 0) };
  state.stats.sessions++;
  const streak = recordQualifyingDay(state, day);
  const missions = trackMission(state, { type: 'kilat', score }, day);
  const unlocked = checkAchievements(state);
  const milestones = checkMilestones(state, day);
  state.history.unshift({ id: `kilat-${Date.now().toString(36)}`, mode: 'kilat', category: null, day, score, total: answered, xp: state.xp.total - xpStart, at: Date.now() });
  state.history = state.history.slice(0, 100);
  const levelNow = levelInfo(state.xp.total).level;
  return { score, answered, xp, xpEarned: state.xp.total - xpStart, best: k.best, prevBest, newBest: newBest && prevBest > 0, firstBest: newBest && prevBest === 0, streak, missions, unlocked, milestones, levelUp: levelNow > levelStart ? levelNow : null };
}
