// Notifikasi push pengingat streak (hanya versi aplikasi mandiri dengan server Firebase).
//
// Cara kerja:
//   1. Saat pengingat dinyalakan, HP berlangganan Web Push (izin notifikasi + kunci publik VAPID
//      dari dokumen Firestore `config/public`, dibuat otomatis oleh GitHub Action).
//   2. Dokumen `push/<uid>` (hanya pemiliknya yang bisa membaca/menulis) menyimpan langganan,
//      jam pengingat, zona waktu, dan hari terakhir main/streak. Ia diperbarui saat itu berubah.
//   3. GitHub Action (.github/workflows/streak-reminder.yml di repo aplikasi) jalan tiap jam,
//      dan mengirim notifikasi ke yang belum main hari itu setelah jam pilihannya.
// Notifikasi tetap masuk walaupun aplikasi ditutup. Di versi claude.ai modul ini tidak aktif.

import { IS_APP_BUILD, APP_HAS_SERVER, isFirebase, cloudStatus } from './cloud.js';

export const pushSupported = () => IS_APP_BUILD && APP_HAS_SERVER
  && typeof navigator !== 'undefined' && 'serviceWorker' in navigator
  && typeof window !== 'undefined' && 'PushManager' in window && 'Notification' in window;

const ready = () => pushSupported() && isFirebase() && cloudStatus().mode === 'cloud' && !!cloudStatus().uid;

function b64urlToBytes(s) {
  const pad = '='.repeat((4 - (s.length % 4)) % 4);
  const raw = atob((s + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function db() { return window.claude.use('db'); }

/** Isi dokumen push/<uid> yang berasal dari state (tanpa langganan). */
export function pushFields(state) {
  return {
    enabled: !!state.settings.reminders.enabled,
    time: state.settings.reminders.time || '19:00',
    tz: -new Date().getTimezoneOffset(),
    lang: state.settings.lang === 'en' ? 'en' : 'id',
    lastDay: state.streak.lastDate || null,
    streak: state.streak.current || 0,
  };
}
const sig = (state) => JSON.stringify(pushFields(state));
let lastSig = null;

async function currentSubscription() {
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

async function write(state, sub) {
  const d = await db();
  await d.doc(`push/${cloudStatus().uid}`).set({ ...pushFields(state), sub: sub ? sub.toJSON() : null, updatedAt: Date.now() }, { merge: true });
  lastSig = sig(state);
}

/**
 * Menyalakan notifikasi push. Mengembalikan 'ok' | 'denied' | 'offline' | 'unsupported' | 'nokey' | 'error'.
 */
export async function enablePush(state) {
  if (!pushSupported()) return 'unsupported';
  if (!ready()) return 'offline';
  let perm = Notification.permission;
  if (perm === 'default') perm = await Notification.requestPermission().catch(() => 'denied');
  if (perm !== 'granted') return 'denied';
  try {
    const snap = await (await db()).doc('config/public').get();
    const key = snap.exists ? snap.data()?.vapidPublic : null;
    if (!key) return 'nokey';
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64urlToBytes(key) });
    await write(state, sub);
    return 'ok';
  } catch (e) {
    console.warn('[tahu gak] push gagal', e);
    return 'error';
  }
}

/** Mematikan notifikasi push: berhenti berlangganan dan menandai dokumen tidak aktif. */
export async function disablePush(state) {
  if (!ready()) return;
  try {
    const sub = await currentSubscription();
    if (sub) await sub.unsubscribe().catch(() => {});
    const d = await db();
    await d.doc(`push/${cloudStatus().uid}`).set({ ...pushFields(state), enabled: false, sub: null, updatedAt: Date.now() }, { merge: true });
    lastSig = sig(state);
  } catch (e) { console.warn('[tahu gak] gagal mematikan push', e); }
}

let timer = null;
/** Dipanggil tiap state tersimpan: perbarui dokumen push bila jam/streak/hari main berubah. */
export function syncPush(state) {
  if (!state.settings.reminders.push || !ready()) return;
  if (sig(state) === lastSig) return;
  clearTimeout(timer);
  timer = setTimeout(async () => {
    try {
      const sub = await currentSubscription();
      if (sub) await write(state, sub);
    } catch { /* coba lagi pada perubahan berikutnya */ }
  }, 1500);
}

/** Pengingat lewat push aktif (pengingat lokal saat app terbuka tidak perlu lagi). */
export const pushActive = (state) => !!state.settings.reminders.enabled && !!state.settings.reminders.push && pushSupported();
