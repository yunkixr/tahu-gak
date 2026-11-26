// tahu gak? — service worker: aplikasi tetap jalan tanpa internet, dan menerima notifikasi streak.
const VERSION = 'tahugak-20261126-2157-11f0b25e';
const FILES = [
  "./",
  "css/styles.css",
  "icons/apple-touch-icon.png",
  "icons/badge-96.png",
  "icons/favicon-64.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "index.html",
  "js/app.js",
  "js/core/achievements.js",
  "js/core/avatar.js",
  "js/core/avatarAcc.js",
  "js/core/avatarClothes.js",
  "js/core/avatarCompose.js",
  "js/core/avatarHair.js",
  "js/core/avatarItems.js",
  "js/core/avatarRender.js",
  "js/core/cloud.js",
  "js/core/dates.js",
  "js/core/duel.js",
  "js/core/firebaseShim.js",
  "js/core/funfact.js",
  "js/core/i18n.js",
  "js/core/kilat.js",
  "js/core/leaderboard.js",
  "js/core/league.js",
  "js/core/milestones.js",
  "js/core/missions.js",
  "js/core/path.js",
  "js/core/pushReminder.js",
  "js/core/quiz.js",
  "js/core/reminders.js",
  "js/core/report.js",
  "js/core/rng.js",
  "js/core/share.js",
  "js/core/shop.js",
  "js/core/state.js",
  "js/core/storage.js",
  "js/core/streak.js",
  "js/core/xp.js",
  "js/data/answers.js",
  "js/data/bank/geografi.js",
  "js/data/bank/hiburan.js",
  "js/data/bank/matematika.js",
  "js/data/bank/olahraga.js",
  "js/data/bank/sains.js",
  "js/data/bank/sastra.js",
  "js/data/bank/sejarah.js",
  "js/data/bank/seni.js",
  "js/data/bank/teknologi.js",
  "js/data/bank/umum.js",
  "js/data/categories.js",
  "js/data/countries.js",
  "js/data/en/answers.js",
  "js/data/en/geografi.js",
  "js/data/en/glossary.js",
  "js/data/en/hiburan.js",
  "js/data/en/index.js",
  "js/data/en/matematika.js",
  "js/data/en/olahraga.js",
  "js/data/en/sains.js",
  "js/data/en/sastra.js",
  "js/data/en/sejarah.js",
  "js/data/en/seni.js",
  "js/data/en/teknologi.js",
  "js/data/en/umum.js",
  "js/data/glossary.js",
  "js/data/questions.js",
  "js/firebase-config.js",
  "js/ui/answerCard.js",
  "js/ui/art.js",
  "js/ui/avatarStudio.js",
  "js/ui/calendar.js",
  "js/ui/components.js",
  "js/ui/dom.js",
  "js/ui/icons.js",
  "js/ui/leaderboardJoin.js",
  "js/ui/screens/achievements.js",
  "js/ui/screens/home.js",
  "js/ui/screens/kilat.js",
  "js/ui/screens/leaderboard.js",
  "js/ui/screens/league.js",
  "js/ui/screens/path.js",
  "js/ui/screens/practice.js",
  "js/ui/screens/profile.js",
  "js/ui/screens/quiz.js",
  "js/ui/screens/report.js",
  "js/ui/screens/review.js",
  "js/ui/screens/shop.js",
  "js/ui/screens/streak.js",
  "js/ui/shareUi.js",
  "js/ui/storyCard.js",
  "manifest.webmanifest"
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== 'tahugak-fonts').map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Font Google: ambil dari simpanan dulu, simpan saat pertama kali dimuat.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com' || (url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/'))) {
    e.respondWith(caches.open('tahugak-fonts').then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok || res.type === 'opaque') c.put(req, res.clone());
      return res;
    }));
    return;
  }
  if (url.origin !== location.origin) return;
  // Berkas aplikasi: dari simpanan (cepat & offline), lalu perbarui di latar.
  e.respondWith(caches.open(VERSION).then(async (c) => {
    const hit = await c.match(req, { ignoreSearch: true }) || (req.mode === 'navigate' ? await c.match('index.html') : null);
    const net = fetch(req).then((res) => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => null);
    return hit || (await net) || new Response('Offline', { status: 503 });
  }));
});

// Notifikasi push pengingat streak (dikirim GitHub Action, lihat .github/scripts/streak-reminder.mjs).
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'tahu gak?', {
    body: d.body || '',
    tag: d.tag || 'tahugak-streak',
    renotify: true,
    icon: 'icons/icon-192.png',
    badge: 'icons/badge-96.png',
    data: { url: d.url || './' },
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    for (const c of list) if (c.url.startsWith(self.registration.scope) && 'focus' in c) return c.focus();
    return self.clients.openWindow(url);
  }));
});
