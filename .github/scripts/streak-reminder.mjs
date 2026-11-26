// Dijalankan GitHub Action tiap jam: kirim notifikasi streak ke pemain yang belum main hari ini.
// Butuh secret FIREBASE_SERVICE_ACCOUNT (JSON kunci akun layanan Firebase).
// Kunci VAPID dibuat otomatis sekali dan disimpan di Firestore:
//   config/vapid  → kunci publik + privat (tidak bisa dibaca aplikasi, aturan Firestore menolak)
//   config/public → kunci publik saja (dibaca aplikasi untuk berlangganan)
import admin from 'firebase-admin';
import webpush from 'web-push';
import { planReminders } from './plan.mjs';

const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

async function vapidKeys() {
  const ref = db.doc('config/vapid');
  const snap = await ref.get();
  if (snap.exists && snap.data().privateKey) return snap.data();
  const keys = webpush.generateVAPIDKeys();
  await ref.set({ ...keys, createdAt: Date.now() });
  await db.doc('config/public').set({ vapidPublic: keys.publicKey });
  console.log('Kunci notifikasi baru dibuat.');
  return keys;
}

const keys = await vapidKeys();
const pub = await db.doc('config/public').get();
if (!pub.exists || pub.data().vapidPublic !== keys.publicKey) await db.doc('config/public').set({ vapidPublic: keys.publicKey });
webpush.setVapidDetails(process.env.PUSH_SUBJECT || 'https://yunkixr.github.io/tahu-gak/', keys.publicKey, keys.privateKey);

const snap = await db.collection('push').where('enabled', '==', true).get();
const plan = planReminders(snap.docs.map((d) => ({ id: d.id, ...d.data() })), new Date());
let sent = 0, gone = 0, failed = 0;
for (const p of plan) {
  try {
    await webpush.sendNotification(p.sub, JSON.stringify(p.payload), { TTL: 4 * 3600, urgency: 'normal' });
    await db.doc(`push/${p.id}`).set({ lastNotified: p.localDay }, { merge: true });
    sent++;
  } catch (e) {
    if (e.statusCode === 404 || e.statusCode === 410) {
      await db.doc(`push/${p.id}`).set({ enabled: false, sub: null }, { merge: true });
      gone++;
    } else {
      failed++;
      console.error('Gagal kirim ke satu pemain:', e.statusCode || e.message);
    }
  }
}
console.log(`Langganan aktif: ${snap.size}. Diingatkan: ${sent}. Langganan kedaluwarsa: ${gone}. Gagal: ${failed}.`);
