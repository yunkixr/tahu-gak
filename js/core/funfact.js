// Fun fact harian: satu fakta per tanggal, diambil dari bank soal.
//
// - Sama untuk semua pemain di tanggal yang sama (seeded per tanggal).
// - Tidak pernah memakai soal yang ada di tantangan harian hari itu (biar nggak bocor).
// - Matematika dilewati karena isinya hitungan, bukan fakta.
// - Notifikasi sistem hanya bisa dikirim selama app terbuka di sebuah tab
//   (sama seperti pengingat harian; tidak ada server push).

import { QUESTIONS, isReleased } from '../data/questions.js';
import { CATEGORIES } from '../data/categories.js';
import { seeded } from './rng.js';
import { todayKey } from './dates.js';
import { dailyQuestionIds } from './quiz.js';
import { notificationSupport } from './reminders.js';
import { L } from './i18n.js';

const POOL = QUESTIONS.filter((q) => q.category !== 'matematika' && q.explanation);

/** Urutan fakta untuk suatu tanggal; index 0 = fakta hari itu, sisanya untuk tombol "fakta lain". */
export function factOrder(day = todayKey()) {
  const skip = new Set(dailyQuestionIds(day));
  const rand = seeded(`funfact:${day}`);
  const pool = POOL.filter((q) => !skip.has(q.id) && isReleased(q, day));
  const out = [];
  const used = new Set();
  while (out.length < 12 && used.size < pool.length) {
    const i = Math.floor(rand() * pool.length);
    if (used.has(i)) continue;
    used.add(i);
    out.push(pool[i]);
  }
  return out;
}

/** Ubah soal jadi kalimat fakta dalam bahasa yang aktif. */
export function factText(q) {
  // Soal ditampilkan apa adanya lalu jawabannya sebagai "reveal", supaya huruf besar/kecil
  // jawaban tidak janggal di tengah kalimat ("…dan Lari").
  const lead = q.text.trim();
  const answer = q.options[0];
  return { lead, answer, more: q.explanation };
}

export function funFact(day = todayKey(), offset = 0) {
  const list = factOrder(day);
  const q = list[((offset % list.length) + list.length) % list.length];
  const cat = CATEGORIES.find((c) => c.id === q.category);
  return { q, cat, ...factText(q) };
}

export function factNotification(day = todayKey()) {
  const f = funFact(day);
  return {
    title: L('Tahu gak?', 'Did you know?'),
    body: `${f.lead} ${f.answer}! ${f.more}`,
  };
}

export function sendFactNotification(day = todayKey()) {
  if (notificationSupport() !== 'granted') return false;
  const { title, body } = factNotification(day);
  try {
    const n = new Notification(title, { body, tag: 'tahugak-funfact' });
    n.onclick = () => { window.focus(); n.close(); };
    return true;
  } catch {
    return false;
  }
}

function minutesOf(hhmm) {
  const [h, m] = String(hhmm || '08:00').split(':').map(Number);
  return h * 60 + m;
}

/** Dicek berkala oleh app.js. Maksimal sekali per hari, setelah jam yang dipilih. */
export function tickFunFact(state, markNotified, now = new Date()) {
  const f = state.settings.funFact;
  if (!f || !f.enabled) return false;
  const today = todayKey(now);
  if (f.lastNotified === today) return false;
  if (now.getHours() * 60 + now.getMinutes() < minutesOf(f.time)) return false;
  const sent = sendFactNotification(today);
  markNotified(today);
  return sent;
}
