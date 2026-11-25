// Milestone untuk kartu Story: jumlah soal terjawab & panjang streak.
// Setiap milestone tercatat sekali (state.milestones[id] = tanggal), lalu bisa dibagikan ulang
// dari halaman Pencapaian.

import { todayKey } from './dates.js';
import { L } from './i18n.js';

export const QUESTION_STEPS = [100, 250, 500, 1000, 2500, 5000, 10000];
export const STREAK_STEPS = [7, 14, 30, 50, 100, 200, 365];

export const MILESTONES = [
  ...QUESTION_STEPS.map((value) => ({ id: `q-${value}`, type: 'questions', value })),
  ...STREAK_STEPS.map((value) => ({ id: `streak-${value}`, type: 'streak', value })),
];
export const MILESTONE_BY_ID = Object.fromEntries(MILESTONES.map((m) => [m.id, m]));

export const milestoneTitle = (m) => (m.type === 'questions'
  ? L(`Tembus ${m.value.toLocaleString('id-ID')} soal!`, `${m.value.toLocaleString('en-US')} questions answered!`)
  : L(`Streak ${m.value} hari!`, `${m.value}-day streak!`));

const reached = (state, m) => (m.type === 'questions' ? (state.stats?.questions || 0) >= m.value : (state.streak?.current || 0) >= m.value);

/**
 * Mencatat milestone yang baru tercapai. Mengembalikan yang baru, tapi hanya yang tertinggi per jenis
 * (pemain lama yang sudah lewat 100 & 250 sekaligus cukup melihat 250).
 */
export function checkMilestones(state, day = todayKey()) {
  state.milestones = state.milestones && typeof state.milestones === 'object' ? state.milestones : {};
  const fresh = MILESTONES.filter((m) => !state.milestones[m.id] && reached(state, m));
  for (const m of fresh) state.milestones[m.id] = day;
  const top = {};
  for (const m of fresh) if (!top[m.type] || m.value > top[m.type].value) top[m.type] = m;
  return Object.values(top);
}

/** Milestone yang sudah tercapai, terbaru/terbesar dulu. */
export function reachedMilestones(state) {
  const got = state.milestones || {};
  return MILESTONES.filter((m) => got[m.id]).map((m) => ({ ...m, day: got[m.id] }))
    .sort((a, b) => b.day.localeCompare(a.day) || b.value - a.value);
}
