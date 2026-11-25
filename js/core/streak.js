// Logika streak harian.
//
// state.streak = { current, longest, lastDate, lost }
//   lastDate: hari terakhir yang "tertutup" — baik karena main, maupun dilindungi Streak Freeze.
// state.activity[day] = { sessions, counted, daily, protected }
//
// Aturan:
// 1. Menyelesaikan minimal 1 kuis (harian, latihan, atau ulasan) pada suatu hari = hari itu dihitung.
// 2. Hari berturut-turut menambah streak. Hari yang dilindungi freeze menjaga streak tapi tidak menambah angka.
// 3. Saat aplikasi dibuka (atau tanggal berganti) kita cek hari-hari yang terlewat:
//    - Jika jumlah Streak Freeze yang dimiliki cukup untuk SEMUA hari yang terlewat, freeze dipakai otomatis.
//    - Jika tidak cukup, streak kembali ke 0 dan freeze TIDAK dipakai (supaya tidak terbuang sia-sia).

import { addDays, diffDays, todayKey } from './dates.js';

export function reconcileStreak(state, today = todayKey()) {
  const s = state.streak;
  if (!s.lastDate || s.current === 0) return null;
  const gap = diffDays(s.lastDate, today);
  if (gap <= 1) return null; // main kemarin atau hari ini — aman

  const missed = gap - 1;
  const missedDays = Array.from({ length: missed }, (_, i) => addDays(s.lastDate, i + 1));

  if (state.inventory.freeze >= missed) {
    state.inventory.freeze -= missed;
    for (const d of missedDays) {
      state.activity[d] = { ...(state.activity[d] || {}), protected: true };
    }
    s.lastDate = addDays(today, -1);
    return { type: 'protected', days: missedDays };
  }

  const lost = s.current;
  s.current = 0;
  s.lost = { amount: lost, on: today, seen: false };
  return { type: 'broken', lost };
}

/** Dipanggil saat sebuah sesi kuis selesai. */
export function recordQualifyingDay(state, today = todayKey()) {
  reconcileStreak(state, today);
  const act = (state.activity[today] = { sessions: 0, ...(state.activity[today] || {}) });
  act.sessions += 1;
  if (act.counted) return { increased: false, current: state.streak.current };

  act.counted = true;
  const s = state.streak;
  const yesterday = addDays(today, -1);
  s.current = s.lastDate === yesterday && s.current > 0 ? s.current + 1 : 1;
  s.lastDate = today;
  s.longest = Math.max(s.longest, s.current);
  if (s.lost) s.lost.seen = true;
  return { increased: true, current: s.current };
}

export function playedToday(state, today = todayKey()) {
  return !!state.activity[today]?.counted;
}

/**
 * Status sebuah hari untuk kalender:
 * 'done' | 'protected' | 'missed' | 'today' | 'today-done' | 'future' | 'idle' (sebelum mulai)
 */
export function dayStatus(state, key, today = todayKey()) {
  const act = state.activity[key];
  if (key === today) return act?.counted ? 'today-done' : 'today';
  if (diffDays(today, key) > 0) return 'future';
  if (act?.counted) return 'done';
  if (act?.protected) return 'protected';
  if (state.profile.startDate && diffDays(state.profile.startDate, key) >= 0) return 'missed';
  return 'idle';
}

/** Hari yang menjadi bagian dari streak berjalan (untuk garis penghubung di kalender). */
export function streakChain(state, today = todayKey()) {
  const chain = new Set();
  if (!state.streak.current || !state.streak.lastDate) return chain;
  let d = state.streak.lastDate;
  let safety = 0;
  while (safety++ < 3660) {
    const a = state.activity[d];
    if (!(a?.counted || a?.protected)) break;
    chain.add(d);
    d = addDays(d, -1);
  }
  // hari ini belum main tapi streak masih hidup: tidak ditandai.
  return chain;
}
