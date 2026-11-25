// Teks "bagikan hasil" ala Wordle. Tidak membocorkan soal atau jawaban, hanya pola benar/salah.

import { QUESTION_BY_ID } from '../data/questions.js';
import { CATEGORY_BY_ID } from '../data/categories.js';
import { dayNumber } from './dates.js';
import { L } from './i18n.js';

/** Hari pertama tantangan harian bernomor (#1). */
export const LAUNCH_DAY = '2026-11-01';
export const puzzleNumber = (day) => dayNumber(day) - dayNumber(LAUNCH_DAY) + 1;

const SQUARE = { 0: '🟥', 1: '🟩', 2: '🟨' };

/** Tanda per soal: 1 = benar, 2 = benar setelah Nyawa Ekstra, 0 = salah. */
export const marksOf = (results) => results.map((r) => (r.correct ? (r.retried ? 2 : 1) : 0));

export function dailyShareText(state, day) {
  const d = state.daily?.[day];
  if (!d) return null;
  const lines = [`tahu gak? #${puzzleNumber(day)}  ${d.score}/${d.total}${d.perfect ? ' ✨' : ''}`];
  if (Array.isArray(d.marks) && d.marks.length) lines.push(d.marks.map((m) => SQUARE[m] ?? '⬜').join(''));
  if (Array.isArray(d.ids) && d.ids.length) lines.push(d.ids.map((id) => CATEGORY_BY_ID[QUESTION_BY_ID[id]?.category]?.icon || '❔').join(''));
  if (state.streak?.current > 0) lines.push(L(`🔥 streak ${state.streak.current} hari`, `🔥 ${state.streak.current}-day streak`));
  return lines.join('\n');
}

export function kilatShareText({ score, best, newBest }) {
  return [
    `tahu gak? ⚡ ${L('Kilat', 'Lightning')}`,
    L(`${score} benar dalam 60 detik`, `${score} right in 60 seconds`) + (newBest ? L(' 🏆 rekor baru!', ' 🏆 new record!') : best > score ? L(` (rekor ${best})`, ` (best ${best})`) : ''),
  ].join('\n');
}

export function duelShareText({ myScore, theirScore, theirName, outcome, marks }) {
  const head = outcome === 'win' ? L(`menang lawan ${theirName}`, `beat ${theirName}`)
    : outcome === 'lose' ? L(`kalah tipis dari ${theirName}`, `lost to ${theirName}`)
      : outcome === 'draw' ? L(`seri dengan ${theirName}`, `tied with ${theirName}`)
        : L(`menantang ${theirName}`, `challenged ${theirName}`);
  const lines = [`tahu gak? ⚔️ Duel: ${head}`];
  lines.push(theirScore == null ? `${myScore}/5` : `${myScore}–${theirScore}`);
  if (Array.isArray(marks) && marks.length) lines.push(marks.map((m) => SQUARE[m] ?? '⬜').join(''));
  return lines.join('\n');
}
