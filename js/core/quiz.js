// Mesin kuis: menyusun sesi (harian / latihan / ulasan), menilai jawaban, dan menutup sesi.
// Fungsi yang mengubah state dipanggil di dalam store.update().

import { QUESTIONS, QUESTION_BY_ID, isReleased, isFresh } from '../data/questions.js';
import { CATEGORIES } from '../data/categories.js';
import { seeded, shuffle, hashString } from './rng.js';
import { dayNumber, todayKey } from './dates.js';
import { checkMilestones } from './milestones.js';
import { XP, awardXp, awardCatXp, markUnranked, levelInfo, speedBonus } from './xp.js';
import { recordQualifyingDay } from './streak.js';
import { checkAchievements } from './achievements.js';
import { buildPathSession, recordPathAnswer, pathStatus } from './path.js';
import { L } from './i18n.js';
import { trackMission } from './missions.js';
import { marksOf } from './share.js';
import { recordDuelResult } from './duel.js';

export const SESSION_SIZE = 5;

const byCategory = Object.fromEntries(CATEGORIES.map((c) => [c.id, QUESTIONS.filter((q) => q.category === c.id)]));

/** Mengubah soal dari bank menjadi item sesi dengan urutan pilihan acak. */
export function toItem(question, rand = Math.random) {
  const options = shuffle(question.options.map((text, i) => ({ text, correct: i === question.answer })), rand);
  return { qid: question.id, options };
}

// ───────────── Penyusun sesi ─────────────

/**
 * Soal harian: 5 kategori berbeda, dipilih dengan seed tanggal.
 * Dalam tiap kategori, soal berotasi mengikuti urutan acak tetap per kategori,
 * jadi hari yang berurutan tidak mengulang soal yang sama. Hasilnya identik
 * untuk semua pemain pada tanggal yang sama (selama bank soalnya sama).
 */
export function dailyQuestionIds(day) {
  const rand = seeded(`tahugak/daily/${day}`);
  const cats = shuffle(CATEGORIES.map((c) => c.id), rand).slice(0, SESSION_SIZE);
  const n = dayNumber(day);
  return cats.map((cat) => {
    const pool = byCategory[cat].filter((q) => isReleased(q, day));
    // Di hari rilis, soal baru kategori itu yang dipakai (sama untuk semua pemain).
    const fresh = pool.filter((q) => q.since === day);
    if (fresh.length) return fresh[Math.floor(seeded(`tahugak/fresh/${day}/${cat}`)() * fresh.length)].id;
    const order = shuffle(pool.map((q) => q.id), seeded(`tahugak/rotation/${cat}`));
    return order[n % order.length];
  });
}

export function buildDaily(day = todayKey(), state = null) {
  // Tantangan yang sudah dimulai memakai daftar soal yang tersimpan, supaya tidak berubah
  // di tengah jalan kalau bank soal diperbarui.
  const saved = state?.dailyProgress?.day === day && state.dailyProgress.ids?.every((id) => QUESTION_BY_ID[id]) ? state.dailyProgress.ids : null;
  const items = (saved || dailyQuestionIds(day)).map((id) => toItem(QUESTION_BY_ID[id], seeded(`tahugak/opts/${day}/${id}`)));
  return { mode: 'daily', day, title: L('Tantangan Harian', 'Daily Challenge'), items };
}

/** Latihan: prioritaskan soal yang belum pernah dilihat atau sering salah, lalu acak. */
export function buildPractice(state, category) {
  const today = todayKey();
  const pool = (byCategory[category] || []).filter((q) => isReleased(q, today));
  const scored = pool.map((q) => {
    const a = state.answers[q.id];
    let w = Math.random();
    if (!a) w += 2;                                  // belum pernah
    else if (a.wrong > a.correct) w += 1;            // sering salah
    if (a?.lastCorrectDay === todayKey()) w -= 1.5;  // sudah benar hari ini
    return { q, w };
  });
  const picked = scored.sort((x, y) => y.w - x.w).slice(0, SESSION_SIZE).map((x) => x.q);
  return { mode: 'practice', category, title: L('Latihan', 'Practice'), items: shuffle(picked).map((q) => toItem(q)) };
}

/** Soal baru (rilis 7 hari terakhir) yang belum pernah kamu jawab. */
export function freshPool(state, day = todayKey()) {
  return QUESTIONS.filter((q) => isFresh(q, day) && !state.answers[q.id]);
}

/** Latihan berisi soal-soal baru yang belum dijawab. */
export function buildFresh(state) {
  const picked = shuffle(freshPool(state)).slice(0, SESSION_SIZE);
  return { mode: 'practice', category: null, fresh: true, title: L('Soal baru', 'New questions'), items: picked.map((q) => toItem(q)) };
}

/** Kesalahan yang belum dikuasai, diurutkan: paling sering salah dulu, lalu yang paling lama. */
export function reviewPool(state) {
  return Object.entries(state.mistakes)
    .filter(([id, m]) => !m.mastered && QUESTION_BY_ID[id])
    .sort(([, a], [, b]) => b.wrongCount - a.wrongCount || a.lastWrongAt - b.lastWrongAt)
    .map(([id, m]) => ({ id, ...m }));
}

export function buildPath(state) {
  return buildPathSession(state, (q) => toItem(q));
}

export function buildReview(state) {
  const ids = reviewPool(state).slice(0, SESSION_SIZE).map((m) => m.id);
  return { mode: 'review', title: L('Ulas Kesalahan', 'Review Mistakes'), items: ids.map((id) => toItem(QUESTION_BY_ID[id])) };
}

// ───────────── Sesi berjalan ─────────────

export function startSession(state, spec, { timer = false, useDoubleXp = false, useExtraLife = false } = {}) {
  const session = {
    ...spec,
    id: `${spec.mode}-${Date.now().toString(36)}`,
    index: 0,
    results: [],        // { qid, correct, xp, chosen }
    startedAt: Date.now(),
    timer,
    extraLife: { armed: useExtraLife && state.inventory.extraLife > 0, used: false },
    retrying: false,
    xpStart: state.xp.total,
    levelStart: levelInfo(state.xp.total).level,
    combo: 0,           // benar berturut-turut (untuk misi)
    ms: 0,              // total waktu menjawab (untuk duel)
    missionsDone: [],   // misi yang selesai selama sesi ini
  };
  if (useDoubleXp && state.inventory.doubleXp > 0) {
    state.inventory.doubleXp -= 1;
    state.boosts.doubleXpLeft += XP.DOUBLE_XP_CHARGES;
  }
  // Lanjutkan tantangan harian yang terputus.
  if (spec.mode === 'daily') {
    const p = state.dailyProgress;
    if (p && p.day === spec.day) {
      session.results = p.answers.slice();
      session.index = session.results.length;
      session.extraLife = p.extraLife || session.extraLife;
    } else {
      state.dailyProgress = { day: spec.day, ids: spec.items.map((it) => it.qid), answers: [], extraLife: session.extraLife };
    }
  }
  return session;
}

/**
 * Menilai satu jawaban. `chosen` = indeks pilihan atau null (waktu habis).
 * Mengembalikan detail untuk UI. Bisa mengembalikan { retry: true } jika Nyawa Ekstra dipakai.
 */
export function answerQuestion(state, session, chosen, elapsedMs = 0) {
  const item = session.items[session.index];
  const q = QUESTION_BY_ID[item.qid];
  const day = todayKey();
  const correct = chosen !== null && !!item.options[chosen]?.correct;
  const timedOut = chosen === null;
  const isRetry = session.retrying;

  // Statistik per soal & kategori (hanya percobaan pertama)
  if (!isRetry) {
    const a = (state.answers[q.id] = state.answers[q.id] || { seen: 0, correct: 0, wrong: 0, lastAt: 0, lastCorrectDay: null });
    const cs = (state.catStats[q.category] = state.catStats[q.category] || { answered: 0, correct: 0, sessions: 0 });
    a.seen++; a.lastAt = Date.now();
    cs.answered++;
    state.stats.questions++;
    if (correct) { a.correct++; cs.correct++; state.stats.correct++; }
    else a.wrong++;
  }

  // Sistem kesalahan: setiap jawaban salah disimpan; benar (bukan percobaan ulang) = dikuasai.
  let mastered = false;
  if (!correct && !isRetry) {
    const m = state.mistakes[q.id];
    if (m) { m.wrongCount++; m.lastWrongAt = Date.now(); m.mastered = false; m.masteredAt = null; }
    else state.mistakes[q.id] = { wrongCount: 1, firstAt: Date.now(), lastWrongAt: Date.now(), mastered: false, masteredAt: null };
  }
  if (correct && !isRetry && state.mistakes[q.id] && !state.mistakes[q.id].mastered) {
    state.mistakes[q.id].mastered = true;
    state.mistakes[q.id].masteredAt = Date.now();
    state.stats.mastered++;
    mastered = true;
  }

  // Jalur Hafalan: kotak soal ditentukan oleh percobaan pertama.
  let path = null;
  if (session.mode === 'path' && !isRetry) {
    path = recordPathAnswer(state, q.id, correct);
    if (path.memorizedNow) session.pathMemorized = (session.pathMemorized || 0) + 1;
  }

  // Nyawa ekstra: kesalahan pertama dimaafkan, pemain boleh mencoba lagi.
  if (!correct && !isRetry && !timedOut && session.extraLife.armed && !session.extraLife.used && state.inventory.extraLife > 0) {
    state.inventory.extraLife -= 1;
    session.extraLife.used = true;
    session.retrying = true;
    if (session.mode === 'daily' && state.dailyProgress) state.dailyProgress.extraLife = session.extraLife;
    return { correct: false, retry: true, eliminated: chosen, question: q, xp: 0 };
  }

  // XP
  let base = 0;
  let bonus = 0;
  let repeat = false;
  if (correct) {
    repeat = (session.mode === 'practice' || session.mode === 'duel') && state.answers[q.id].lastCorrectDay === day && !isRetry
      && state.answers[q.id].correct > 1;
    const isOld = session.mode === 'path' && session.oldIds?.includes(q.id);
    base = repeat ? XP.PRACTICE_REPEAT : isOld ? XP.PATH_OLD : XP.CORRECT;
    if (session.timer) bonus = speedBonus(elapsedMs);
    state.answers[q.id].lastCorrectDay = day;
  }
  let doubled = false;
  if (state.boosts.doubleXpLeft > 0) {
    state.boosts.doubleXpLeft -= 1;
    if (correct) doubled = true;
  }
  const xp = (base + bonus) * (doubled ? 2 : 1);
  const lv = awardXp(state, xp, day);
  // Aturan Petunjuk: XP soal yang dibantu Petunjuk tidak masuk Leaderboard (utama, kategori, divisi).
  const hinted = !!session.hinted?.[session.index];
  if (hinted) markUnranked(state, xp);
  else awardCatXp(state, q.category, xp);

  const result = { qid: q.id, correct, xp, hinted, chosen: chosen === null ? null : item.options[chosen].text, retried: isRetry };
  session.results.push(result);
  session.ms += Math.max(0, Math.min(Number(elapsedMs) || 0, 120000));
  session.combo = correct ? (session.combo || 0) + 1 : 0;
  const missions = isRetry ? [] : trackMission(state, { type: 'answer', correct, category: q.category, mode: session.mode, combo: session.combo }, day);
  session.missionsDone = [...(session.missionsDone || []), ...missions];
  session.retrying = false;
  if (session.mode === 'daily' && state.dailyProgress) state.dailyProgress.answers.push(result);

  return { ...result, base, bonus, doubled, repeat, mastered, timedOut, path, missions, question: q, levelUp: lv.after > lv.before ? lv.after : null };
}

/** Mode yang boleh memakai Petunjuk (duel & Kilat tidak, supaya adil/cepat). */
export const HINT_MODES = new Set(['daily', 'practice', 'review', 'path']);

/**
 * Memakai satu Petunjuk pada soal yang sedang dijawab: mencoret 2 jawaban salah.
 * `eliminated` = indeks yang sudah dicoret (mis. oleh Nyawa Ekstra).
 * @returns daftar indeks yang baru dicoret, atau null kalau tidak bisa dipakai.
 */
export function useHint(state, session, eliminated = [], rand = Math.random) {
  if (!HINT_MODES.has(session.mode) || (state.inventory.hint || 0) < 1) return null;
  session.hinted = session.hinted || {};
  if (session.hinted[session.index]) return null;
  const item = session.items[session.index];
  const wrong = item.options.map((o, i) => (o.correct || eliminated.includes(i) ? -1 : i)).filter((i) => i >= 0);
  if (wrong.length < 1) return null;
  const picked = shuffle(wrong, rand).slice(0, 2);
  state.inventory.hint -= 1;
  state.stats.hints = (state.stats.hints || 0) + 1;
  session.hinted[session.index] = picked;
  return picked;
}

export function nextQuestion(session) {
  session.index++;
  return session.index < session.items.length;
}

/** Menutup sesi: bonus, streak, statistik, riwayat, pencapaian. */
export function finishSession(state, session) {
  const day = todayKey();
  const total = session.items.length;
  const score = session.results.filter((r) => r.correct).length;
  const perfect = total >= SESSION_SIZE && score === total;
  const bonuses = [];

  if (session.mode === 'daily') {
    if (!state.daily[session.day] && session.day === day) {
      awardXp(state, XP.DAILY_COMPLETE, day);
      bonuses.push({ label: L('Tantangan harian selesai', 'Daily challenge complete'), xp: XP.DAILY_COMPLETE });
      if (perfect) {
        awardXp(state, XP.DAILY_PERFECT, day);
        bonuses.push({ label: L('Bonus sempurna 5/5', 'Perfect 5/5 bonus'), xp: XP.DAILY_PERFECT });
      }
      state.daily[session.day] = { score, total, perfect, completedAt: Date.now(), marks: marksOf(session.results), ids: session.items.map((it) => it.qid) };
    }
    state.dailyProgress = null;
  }
  if (session.mode === 'review') {
    awardXp(state, XP.REVIEW_COMPLETE, day);
    bonuses.push({ label: L('Sesi ulasan selesai', 'Review session complete'), xp: XP.REVIEW_COMPLETE });
    state.stats.reviews++;
  }
  let path = null;
  if (session.mode === 'path') {
    state.path.sessions++;
    const introducedNew = session.newIds.length > 0;
    const xp = introducedNew ? XP.PATH_STAGE : XP.PATH_ROUND;
    awardXp(state, xp, day);
    bonuses.push({ label: introducedNew ? L(`Tahap ${session.stage} selesai`, `Stage ${session.stage} complete`) : L('Putaran ulang selesai', 'Review round complete'), xp });
    path = { ...pathStatus(state), memorizedGained: session.pathMemorized || 0, stageDone: introducedNew ? session.stage : null };
  }
  if (session.mode === 'practice' && session.category) {
    const cs = (state.catStats[session.category] = state.catStats[session.category] || { answered: 0, correct: 0, sessions: 0 });
    cs.sessions++;
  }

  let duel = null;
  if (session.mode === 'duel') duel = recordDuelResult(state, session.duelId, { score, ms: Math.round(session.ms), marks: marksOf(session.results) });

  state.stats.sessions++;
  if (perfect) state.stats.perfect++;
  const missions = [...(session.missionsDone || []), ...(duel?.missions || []), ...trackMission(state, { type: 'session', mode: session.mode }, day)];

  const streak = recordQualifyingDay(state, day);
  const unlocked = checkAchievements(state);
  const milestones = checkMilestones(state, day);

  const xpEarned = state.xp.total - session.xpStart;
  state.history.unshift({
    id: session.id, mode: session.mode, category: session.category || null, day,
    score, total, xp: xpEarned, at: Date.now(),
  });
  state.history = state.history.slice(0, 100);

  const levelNow = levelInfo(state.xp.total).level;
  return {
    score, total, perfect, bonuses, xpEarned, streak, unlocked, path, missions, duel, milestones,
    levelUp: levelNow > session.levelStart ? levelNow : null,
    answerXp: session.results.reduce((s, r) => s + r.xp, 0),
    mistakes: session.results.filter((r) => !r.correct).map((r) => r.qid),
  };
}

export function dailyStatus(state, day = todayKey()) {
  if (state.daily[day]) return { status: 'done', ...state.daily[day] };
  if (state.dailyProgress?.day === day && state.dailyProgress.answers.length) {
    return { status: 'in-progress', answered: state.dailyProgress.answers.length };
  }
  return { status: 'new' };
}

export { hashString };
