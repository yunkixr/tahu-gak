// Backend Firebase untuk versi aplikasi mandiri (PWA/APK).
// Meniru bagian kecil API `window.claude.use('db' | 'user')` yang dipakai cloud.js, sehingga
// Leaderboard, teman, dan duel jalan tanpa claude.ai:
//
//   db.doc('players/<uid>')               → Firestore players/<uid>           (dibaca semua, ditulis pemiliknya)
//   db.doc('data/users/<uid>/progress')   → Firestore users/<uid>/data/progress (privat)
//   db.collection('players').onSnapshot   → langganan real-time
//   user.id()                              → uid akun anonim Firebase (tersimpan di HP ini)
//   user.profiles / user.search            → dari nama panggilan di baris players
//
// Aturan keamanan Firestore (lihat README aplikasi) memastikan tiap pemain hanya bisa menulis datanya sendiri.
// SDK dimuat dari CDN Google dan disimpan service worker, jadi tetap terbuka saat offline.

import { avatarSvg, sanitizeAvatar } from './avatar.js';

export const FIREBASE_SDK_VERSION = '10.12.2';
const sdk = (m) => `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-${m}.js`;

const timeout = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(() => r(null), ms))]);
const clean = (data) => JSON.parse(JSON.stringify(data)); // Firestore menolak `undefined`

function mapPath(path) {
  const m = /^data\/users\/([^/]+)\/progress$/.exec(path);
  return m ? `users/${m[1]}/data/progress` : path;
}

function avatarUrl(cfg) {
  try {
    const svg = avatarSvg(sanitizeAvatar(cfg)).replace(/<svg\b(?![^>]*xmlns=)/, '<svg xmlns="http://www.w3.org/2000/svg"');
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  } catch { return ''; }
}

/**
 * Memasang backend Firebase sebagai `window.claude`. Mengembalikan true bila berhasil.
 * Tidak pernah melempar error: kalau gagal (offline pertama kali, konfigurasi salah), aplikasi jalan lokal.
 */
export async function installFirebase(config) {
  if (typeof window === 'undefined' || window.claude || !config?.apiKey) return false;
  try {
    const mods = await timeout(Promise.all([import(sdk('app')), import(sdk('auth')), import(sdk('firestore'))]), 12000);
    if (!mods) return false;
    const [{ initializeApp }, A, F] = mods;
    const app = initializeApp(config);
    const auth = A.getAuth(app);
    let fs;
    try { fs = F.initializeFirestore(app, { localCache: F.persistentLocalCache(), ignoreUndefinedProperties: true }); }
    catch { fs = F.getFirestore(app); }

    const uid = await timeout(new Promise((resolve) => {
      const off = A.onAuthStateChanged(auth, (u) => {
        if (u) { off(); resolve(u.uid); }
      });
      if (!auth.currentUser) A.signInAnonymously(auth).catch(() => resolve(null));
    }), 12000);
    if (!uid) return false;

    let players = [];
    const ref = (path) => F.doc(fs, mapPath(path));
    const db = {
      doc: (path) => ({
        get: async () => {
          const s = await F.getDoc(ref(path));
          return { exists: s.exists(), data: () => s.data() };
        },
        set: (data) => F.setDoc(ref(path), clean(data)),
      }),
      collection: (name) => ({
        onSnapshot: (next, onError) => F.onSnapshot(F.collection(fs, name), (snap) => {
          const docs = snap.docs.map((d) => ({ id: d.id, data: () => d.data() }));
          if (name === 'players') players = docs.map((d) => ({ id: d.id, ...d.data() }));
          next({ docs });
        }, onError),
      }),
    };
    const user = {
      id: async () => uid,
      me: async () => ({ name: '' }),
      profiles: async (ids) => {
        const out = {};
        for (const id of ids) {
          const p = players.find((x) => x.id === id);
          if (p?.nickname) out[id] = { name: String(p.nickname).slice(0, 24) };
        }
        return out;
      },
      search: async (q) => {
        const t = String(q || '').trim().toLowerCase();
        if (!t) return [];
        return players
          .filter((p) => typeof p.nickname === 'string' && p.nickname.toLowerCase().includes(t))
          .slice(0, 12)
          .map((p) => ({ id: p.id, name: p.nickname.slice(0, 24), avatarUrl: avatarUrl(p.avatarCfg), isMe: p.id === uid }));
      },
    };
    window.claude = { use: async (name) => (name === 'db' ? db : name === 'user' ? user : null), backend: 'firebase' };
    return true;
  } catch (e) {
    console.warn('[tahu gak] Firebase tidak tersedia', e);
    return false;
  }
}
