// Cek kesehatan data (manual). Hanya mencetak JUMLAH, tidak pernah nama atau isi data pemain,
// karena log GitHub Actions di repo publik bisa dilihat siapa saja.
import admin from 'firebase-admin';
const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();
const now = Date.now();
const players = (await db.collection('players').get()).docs.map((d) => d.data());
const n = (f) => players.filter(f).length;
console.log(`players: ${players.length}`);
console.log(`  dengan nama: ${n((p) => typeof p.nickname === 'string' && p.nickname.trim())}`);
console.log(`  ikut Leaderboard (ranked): ${n((p) => p.ranked === true)}`);
console.log(`  aktif 24 jam terakhir: ${n((p) => now - (p.updatedAt || 0) < 86400000)}`);
const users = await db.collectionGroup('data').get();
console.log(`progres tersimpan: ${users.size}`);
const push = await db.collection('push').get();
console.log(`langganan notifikasi: ${push.size} (aktif: ${push.docs.filter((d) => d.data().enabled && d.data().sub).length})`);
