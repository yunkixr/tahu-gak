// Toko: item dibeli dengan saldo XP (xp.balance). Level tidak turun saat membeli.

import { checkAchievements } from './achievements.js';
import { XP } from './xp.js';
import { bi, L } from './i18n.js';

export const SHOP_ITEMS = [
  {
    id: 'freeze', name: 'Streak Freeze', icon: '🧊', price: 200, max: 2,
    desc: 'Melindungi streak-mu saat kamu melewatkan satu hari. Dipakai otomatis.',
    how: 'Terpasang otomatis. Satu freeze melindungi satu hari yang terlewat.',
  },
  {
    id: 'doubleXp', name: 'Double XP', icon: '⚡', price: 150, max: 3,
    desc: `XP dari jawaban benar jadi 2× untuk ${XP.DOUBLE_XP_CHARGES} soal berikutnya.`,
    how: 'Aktifkan di layar awal kuis. Berlaku untuk soal mana pun, termasuk latihan.',
  },
  {
    id: 'extraLife', name: 'Nyawa Ekstra', icon: '❤️', price: 100, max: 3,
    desc: 'Satu kesalahan dimaafkan dalam satu kuis: pilihan yang salah dicoret dan kamu bisa coba lagi.',
    how: 'Siapkan di layar awal kuis. Baru terpakai kalau kamu benar-benar salah menjawab.',
  },
  {
    id: 'hint', name: 'Petunjuk', icon: '💡', price: 60, max: 5,
    desc: 'Mencoret 2 jawaban salah dari satu soal, jadi tinggal pilih di antara dua. XP dari soal itu tetap kamu dapat, tapi tidak masuk Leaderboard.',
    how: 'Tekan "Petunjuk" saat menjawab soal. Bisa dipakai di tantangan harian, latihan, ulasan, dan Jalur Hafalan (tidak di duel & Kilat).',
  },
];

const EN = {
  freeze: { desc: 'Protects your streak when you miss a day. Used automatically.', how: 'Works automatically. One freeze covers one missed day.' },
  doubleXp: { desc: `XP from correct answers is doubled for your next ${XP.DOUBLE_XP_CHARGES} questions.`, how: 'Turn it on from the quiz start screen. Works for any question, including practice.' },
  hint: { name: 'Hint', desc: 'Crosses out 2 wrong answers on one question, so you only pick between two. You still get that question\'s XP, but it doesn\'t count on the Leaderboard.', how: 'Tap "Hint" while answering. Works in the daily challenge, practice, review, and the Memory Path (not in duels or Lightning).' },
  extraLife: { name: 'Extra Life', desc: 'Forgives one mistake per quiz: the wrong choice is crossed out and you can try again.', how: 'Arm it on the quiz start screen. It\'s only used if you actually answer wrong.' },
};
SHOP_ITEMS.forEach((i) => { for (const [k, v] of Object.entries(EN[i.id])) bi(i, k, v); });

export const ITEM_BY_ID = Object.fromEntries(SHOP_ITEMS.map((i) => [i.id, i]));

export function canBuy(state, id) {
  const item = ITEM_BY_ID[id];
  if (!item) return { ok: false, reason: L('Item tidak dikenal.', 'Unknown item.') };
  if ((state.inventory[id] || 0) >= item.max) return { ok: false, reason: L(`Maksimal ${item.max} dimiliki.`, `You can hold at most ${item.max}.`) };
  if (state.xp.balance < item.price) return { ok: false, reason: L(`Butuh ${item.price - state.xp.balance} XP lagi.`, `You need ${item.price - state.xp.balance} more XP.`) };
  return { ok: true };
}

export function buy(state, id) {
  const check = canBuy(state, id);
  if (!check.ok) return { ...check, unlocked: [] };
  const item = ITEM_BY_ID[id];
  state.xp.balance -= item.price;
  state.inventory[id] = (state.inventory[id] || 0) + 1;
  state.stats.purchases += 1;
  const unlocked = checkAchievements(state);
  return { ok: true, item, unlocked };
}
