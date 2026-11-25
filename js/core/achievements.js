// Pencapaian. Setiap pencapaian punya `progress(state)` -> [sekarang, target].
// XP hadiah diberikan sekali saat terbuka.

import { awardXp, levelInfo } from './xp.js';
import { CATEGORIES } from '../data/categories.js';
import { pathStatus } from './path.js';
import { bi } from './i18n.js';

export const ACHIEVEMENTS = [
  { id: 'first_steps', name: 'First Steps', desc: 'Selesaikan kuis pertamamu.', icon: '👣', tone: 'mint', xp: 20,
    progress: (s) => [s.stats.sessions, 1] },
  { id: 'on_fire', name: 'On Fire', desc: 'Jaga streak selama 3 hari.', icon: '🔥', tone: 'orange', xp: 30,
    progress: (s) => [s.streak.longest, 3] },
  { id: 'dedicated', name: 'Dedicated Learner', desc: 'Jaga streak selama 7 hari.', icon: '📅', tone: 'orange', xp: 50,
    progress: (s) => [s.streak.longest, 7] },
  { id: 'unstoppable', name: 'Unstoppable', desc: 'Jaga streak selama 30 hari.', icon: '🚀', tone: 'red', xp: 200,
    progress: (s) => [s.streak.longest, 30] },
  { id: 'perfect_mind', name: 'Perfect Mind', desc: 'Jawab 5 dari 5 soal dengan benar dalam satu kuis.', icon: '🧠', tone: 'violet', xp: 30,
    progress: (s) => [s.stats.perfect, 1] },
  { id: 'perfectionist', name: 'Perfectionist', desc: 'Dapatkan skor 5/5 sebanyak tiga kali.', icon: '💎', tone: 'violet', xp: 60,
    progress: (s) => [s.stats.perfect, 3] },
  { id: 'knowledge_seeker', name: 'Knowledge Seeker', desc: 'Selesaikan 50 kuis.', icon: '📚', tone: 'blue', xp: 150,
    progress: (s) => [s.stats.sessions, 50] },
  { id: 'comeback_kid', name: 'Comeback Kid', desc: 'Jawab benar 10 soal yang sebelumnya kamu jawab salah.', icon: '🔁', tone: 'mint', xp: 100,
    progress: (s) => [s.stats.mastered, 10] },
  { id: 'explorer', name: 'Rising Explorer', desc: 'Capai level 5 dan raih gelar Explorer.', icon: '🧭', tone: 'blue', xp: 50,
    progress: (s) => [levelInfo(s.xp.total).level, 5] },
  { id: 'all_rounder', name: 'All-Rounder', desc: 'Selesaikan latihan di semua 10 kategori.', icon: '🎯', tone: 'yellow', xp: 80,
    progress: (s) => [CATEGORIES.filter((c) => s.catStats[c.id]?.sessions > 0).length, CATEGORIES.length] },
  { id: 'path_half', name: 'Halfway There', desc: 'Kenali 50 soal di Jalur Hafalan.', icon: '🛤️', tone: 'blue', xp: 80,
    progress: (s) => [pathStatus(s).introduced, 50] },
  { id: 'memory_master', name: 'Memory Master', desc: 'Hafalkan 100 soal di Jalur Hafalan.', icon: '🧠', tone: 'violet', xp: 300,
    progress: (s) => [pathStatus(s).memorized, 100] },
  { id: 'curious_mind', name: 'Curious Mind', desc: 'Buka penjelasan 10 kata berbeda dari kamus.', icon: '💡', tone: 'yellow', xp: 30,
    progress: (s) => [Object.keys(s.glossarySeen || {}).length, 10] },
  { id: 'lightning', name: 'Lightning Fast', desc: 'Jawab benar 15 soal dalam satu ronde Kilat.', icon: '⚡', tone: 'yellow', xp: 60,
    progress: (s) => [s.kilat?.best || 0, 15] },
  { id: 'duelist', name: 'Duelist', desc: 'Menangkan 5 duel.', icon: '⚔️', tone: 'red', xp: 60,
    progress: (s) => [s.duelStats?.won || 0, 5] },
  { id: 'mission_week', name: 'Mission Accomplished', desc: 'Selesaikan semua misi harian pada 7 hari berbeda.', icon: '🎀', tone: 'mint', xp: 80,
    progress: (s) => [s.missions?.bonusDays || 0, 7] },
  { id: 'shopper', name: 'Smart Shopper', desc: 'Beli item pertamamu di Toko.', icon: '🛍️', tone: 'yellow', xp: 20,
    progress: (s) => [s.stats.purchases, 1] },
];

const EN_DESC = {
  first_steps: 'Finish your first quiz.',
  on_fire: 'Keep a 3-day streak.',
  dedicated: 'Keep a 7-day streak.',
  unstoppable: 'Keep a 30-day streak.',
  perfect_mind: 'Get 5 out of 5 right in one quiz.',
  perfectionist: 'Score 5/5 three times.',
  knowledge_seeker: 'Finish 50 quizzes.',
  comeback_kid: 'Get 10 questions right that you previously got wrong.',
  explorer: 'Reach level 5 and earn the Explorer title.',
  all_rounder: 'Finish a practice round in all 10 categories.',
  path_half: 'Get to know 50 questions on the Memory Path.',
  memory_master: 'Memorize 100 questions on the Memory Path.',
  curious_mind: 'Open the explanation for 10 different dictionary words.',
  shopper: 'Buy your first item in the Shop.',
  lightning: 'Get 15 right in one Lightning round.',
  duelist: 'Win 5 duels.',
  mission_week: 'Finish all daily missions on 7 different days.',
};
ACHIEVEMENTS.forEach((a) => bi(a, 'desc', EN_DESC[a.id]));

export function isUnlocked(state, id) {
  return !!state.achievements[id];
}

/**
 * Membuka pencapaian yang syaratnya terpenuhi. XP hadiah bisa memicu
 * pencapaian lain (mis. level 5), jadi diulang sampai stabil.
 * @returns daftar pencapaian yang baru terbuka
 */
export function checkAchievements(state) {
  const unlocked = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (const a of ACHIEVEMENTS) {
      if (state.achievements[a.id]) continue;
      const [cur, target] = a.progress(state);
      if (cur >= target) {
        state.achievements[a.id] = new Date().toISOString();
        awardXp(state, a.xp);
        unlocked.push(a);
        changed = true;
      }
    }
  }
  return unlocked;
}
