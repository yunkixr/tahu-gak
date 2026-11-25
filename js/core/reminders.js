// Pengingat harian.
//
// Apa yang benar-benar berjalan:
// - Jika browser mengizinkan Notification API, notifikasi sistem dikirim pada jam pilihanmu
//   SELAMA aplikasi ini terbuka di sebuah tab (boleh di latar belakang).
// - Tanpa server push, notifikasi TIDAK bisa dikirim saat tab sudah ditutup.
// - Jika izin ditolak / tidak didukung (mis. halaman berjalan di iframe yang membatasi),
//   pengingat tampil sebagai banner di dalam aplikasi.

import { todayKey } from './dates.js';
import { playedToday } from './streak.js';
import { L } from './i18n.js';

export function notificationSupport() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  try { return Notification.permission; } catch { return 'unsupported'; } // 'default' | 'granted' | 'denied'
}

export async function requestPermission() {
  if (notificationSupport() === 'unsupported') return 'unsupported';
  try {
    const res = await Notification.requestPermission();
    return res;
  } catch {
    return 'denied';
  }
}

export function reminderMessage(state) {
  const n = state.streak.current;
  if (n > 0) return { title: L(`Streak ${n} harimu menunggu!`, `Your ${n}-day streak is waiting!`), body: L('Selesaikan tantangan hari ini sebelum tengah malam.', 'Finish today\'s challenge before midnight.') };
  return { title: L('Tahu gak? Ada 5 soal baru hari ini', 'tahu gak? 5 new questions today'), body: L('Mainkan tantangan harian dan mulai streak-mu.', 'Play the daily challenge and start your streak.') };
}

export function sendNotification(state) {
  if (notificationSupport() !== 'granted') return false;
  const { title, body } = reminderMessage(state);
  try {
    const n = new Notification(title, { body, tag: 'tahugak-daily' });
    n.onclick = () => { window.focus(); n.close(); };
    return true;
  } catch {
    return false;
  }
}

function minutesOf(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** Apakah pengingat seharusnya aktif sekarang (sudah lewat jamnya & belum main hari ini). */
export function reminderDue(state, now = new Date()) {
  const r = state.settings.reminders;
  if (!r.enabled) return false;
  if (playedToday(state, todayKey(now))) return false;
  return now.getHours() * 60 + now.getMinutes() >= minutesOf(r.time);
}

/**
 * Dicek berkala oleh app.js. Mengirim notifikasi maksimal sekali per hari.
 * @returns true jika notifikasi sistem terkirim
 */
export function tickReminder(state, markNotified, now = new Date()) {
  if (!reminderDue(state, now)) return false;
  const today = todayKey(now);
  if (state.settings.reminders.lastNotified === today) return false;
  const sent = sendNotification(state);
  markNotified(today);
  return sent;
}
