// Rapor belajar: ringkasan angka, akurasi per kategori, XP per minggu, dan 7 hari terakhir.
// Semua dihitung dari state yang sudah ada (tidak menyimpan data baru).

import { CATEGORIES } from '../data/categories.js';
import { QUESTIONS } from '../data/questions.js';
import { todayKey, addDays, weekKeyOf } from './dates.js';
import { pathStatus } from './path.js';

const MIN_FOR_RANK = 5; // minimal soal dijawab supaya kategori ikut dinilai terkuat/terlemah

export function reportData(state, now = new Date()) {
  const today = todayKey(now);
  const st = state.stats;
  const accuracy = st.questions ? st.correct / st.questions : null;

  const cats = CATEGORIES.map((c) => {
    const cs = state.catStats[c.id] || { answered: 0, correct: 0, sessions: 0 };
    const total = QUESTIONS.filter((q) => q.category === c.id).length;
    return { id: c.id, name: c.name, answered: cs.answered, correct: cs.correct, acc: cs.answered ? cs.correct / cs.answered : null, total };
  });
  const ranked = cats.filter((c) => c.answered >= MIN_FOR_RANK).sort((a, b) => a.acc - b.acc || b.answered - a.answered);
  const weakest = ranked.length >= 2 ? ranked[0] : null;
  const strongest = ranked.length >= 2 ? ranked[ranked.length - 1] : null;
  const untried = cats.filter((c) => c.answered === 0);

  // XP per minggu (Senin–Minggu, waktu lokal), 8 minggu terakhir termasuk minggu ini.
  const thisWeek = weekKeyOf(today);
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const start = addDays(thisWeek, -7 * (7 - i));
    let xp = 0;
    for (let d = 0; d < 7; d++) xp += state.xpLog[addDays(start, d)] || 0;
    return { start, xp, current: start === thisWeek };
  });

  // 7 hari terakhir: XP & akurasi (dari riwayat sesi).
  const days = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(today, i - 6);
    const sessions = state.history.filter((hh) => hh.day === day && hh.total > 0);
    const answered = sessions.reduce((a, hh) => a + hh.total, 0);
    const correct = sessions.reduce((a, hh) => a + hh.score, 0);
    return { day, xp: state.xpLog[day] || 0, answered, acc: answered ? correct / answered : null, played: (state.activity?.[day]?.sessions || 0) > 0 };
  });

  const duels = state.duelStats || { won: 0, lost: 0, draw: 0 };
  return {
    totals: {
      questions: st.questions, correct: st.correct, accuracy, sessions: st.sessions, perfect: st.perfect,
      mastered: st.mastered, memorized: pathStatus(state).memorized,
      currentStreak: state.streak.current, longestStreak: state.streak.longest,
      kilatBest: state.kilat?.best || 0, kilatPlays: state.kilat?.plays || 0,
      duels, duelsPlayed: duels.won + duels.lost + duels.draw,
      missionsDone: state.missions?.done || 0,
      daysPlayed: Object.values(state.activity || {}).filter((a) => (a?.sessions || 0) > 0).length,
    },
    cats, weakest, strongest, untried, weeks, days,
  };
}
