import { h, fmt } from '../dom.js';
import { installMode } from '../../core/install.js';
import { button, card, chip, progressBar, sectionTitle, badge, toggle, modal, confirmModal, toast, avatarEl, langToggle } from '../components.js';
import { openAvatarStudio } from '../avatarStudio.js';
import { sanitizeAvatar, avatarSvg, getItem, RARITY } from '../../core/avatar.js';
import { levelInfo as lvInfo } from '../../core/xp.js';
import { openJoin, openChangeCountry, leave, signInLink } from '../leaderboardJoin.js';
import { accountName, hasAccount, isRanked, usernamesSupported } from '../../core/cloud.js';
import { openUsernameModal } from '../usernameUi.js';
import { flag, countryName } from '../../data/countries.js';
import { levelInfo, RANKS } from '../../core/xp.js';
import { ACHIEVEMENTS } from '../../core/achievements.js';
import { CATEGORIES, CATEGORY_BY_ID } from '../../data/categories.js';
import { formatKey, diffDays } from '../../core/dates.js';
import { calendar } from '../calendar.js';
import { ICON, art, rose, letter, catArt, iconEl, rankArt } from '../art.js';
import { notificationSupport, requestPermission, sendNotification } from '../../core/reminders.js';
import { pushSupported, enablePush, disablePush } from '../../core/pushReminder.js';
import { sendFactNotification } from '../../core/funfact.js';
import { cloudStatus, IS_APP_BUILD, APP_HAS_SERVER, appOfflineText, onlineAccountText, isFirebase } from '../../core/cloud.js';
import { storageAvailable } from '../../core/storage.js';
import { L } from '../../core/i18n.js';

// Profil sebagai "jurnal pengetahuan" pribadi.

export function renderProfile(s, ctx) {
  const lv = levelInfo(s.xp.total);
  const acc = s.stats.questions ? Math.round((s.stats.correct / s.stats.questions) * 100) : 0;
  const unlocked = ACHIEVEMENTS.filter((a) => s.achievements[a.id]);

  const head = h('section.profile-head.frame',
    h('button.avatar-big', { type: 'button', title: L('Ubah avatar', 'Edit avatar'), 'aria-label': L('Ubah avatar', 'Edit avatar'), onclick: () => openStudio(s, ctx) }, avatarEl(s.profile.avatarCfg), h('span.avatar-edit', { html: ICON.sparkle() })),
    h('div.grow',
      h('span.script.journal-kicker', L('Jurnalku', 'My journal')),
      h('h1.display', s.profile.name || L('Pemain', 'Player')),
      h('p.muted', `${lv.rank.name}, level ${lv.level}`, s.profile.country ? `, ${countryName(s.profile.country)}` : ''),
      progressBar(lv.pct, { label: L('Progres level', 'Level progress') }),
      h('p.small.muted', L(`${fmt(lv.into)}/${fmt(lv.needed)} XP ke level ${lv.level + 1}. Bermain sejak ${s.profile.startDate ? formatKey(s.profile.startDate) : 'hari ini'}.`, `${fmt(lv.into)}/${fmt(lv.needed)} XP to level ${lv.level + 1}. Playing since ${s.profile.startDate ? formatKey(s.profile.startDate) : 'today'}.`))),
    button(L('Ubah', 'Edit'), { variant: 'ghost', size: 'sm', onClick: () => editProfile(s, ctx) }));

  const stats = h('div.stat-grid',
    stat('star', fmt(s.xp.total), 'Total XP'),
    stat('flame', fmt(s.streak.current), L(`Streak sekarang (terpanjang ${fmt(s.streak.longest)})`, `Current streak (longest ${fmt(s.streak.longest)})`)),
    stat('book', fmt(s.stats.sessions), L('Kuis selesai', 'Quizzes finished')),
    stat('check', `${acc}%`, L('Akurasi', 'Accuracy')),
    stat('crown', fmt(s.stats.perfect), L('Skor sempurna', 'Perfect scores')),
    stat('bow', fmt(s.stats.mastered), L('Kesalahan dikuasai', 'Mistakes mastered')));

  const links = h('div.journal-links',
    h('a.journal-link.frame', { href: '#streak' }, art(rose(), 'jl-art'),
      h('div', h('strong', L('Kalender streak', 'Streak calendar')), h('span.small.muted', L(`${fmt(s.streak.current)} hari berjalan, ${s.inventory.freeze} Streak Freeze`, `${fmt(s.streak.current)}-day streak, ${s.inventory.freeze} Streak Freeze`)))),
    h('a.journal-link.frame', { href: '#pencapaian' }, art(letter(), 'jl-art'),
      h('div', h('strong', L('Koleksi pencapaian', 'Achievement collection')), h('span.small.muted', L(`${unlocked.length} dari ${ACHIEVEMENTS.length} perangko terkumpul`, `${unlocked.length} of ${ACHIEVEMENTS.length} stamps collected`)))),
    h('a.journal-link.frame', { href: '#rapor' }, art(ICON.star(), 'jl-art'),
      h('div', h('strong', L('Rapor belajar', 'Learning report')), h('span.small.muted', L('Akurasi per kategori, XP mingguan, dan saran latihan', 'Accuracy by category, weekly XP, and practice tips')))));

  const ranks = h('ol.rank-road', RANKS.map((r) => h(`li${lv.level >= r.level ? '.reached' : ''}${lv.rank.level === r.level ? '.current' : ''}`,
    h('span.rr-icon', rankArt(r.name)), h('span.rr-name', r.name), h('span.rr-lv', `Lv ${r.level}`))));

  const recent = unlocked.sort((a, b) => s.achievements[b.id].localeCompare(s.achievements[a.id])).slice(0, 4);
  const achCard = card('',
    sectionTitle(L('Perangko terbaru', 'Latest stamps'), h('a.card-link.static', { href: '#pencapaian' }, L('Lihat koleksi', 'See collection'))),
    recent.length ? h('div.recent-row', recent.map((a) => h('div.recent-item', badge(a, true), h('span', a.name))))
      : h('p.muted.small', L('Selesaikan kuis pertamamu untuk mendapatkan perangko pertama.', 'Finish your first quiz to earn your first stamp.')));

  const catPerf = h('ul.cat-perf', CATEGORIES.map((c) => {
    const st = s.catStats[c.id];
    const pct = st?.answered ? st.correct / st.answered : 0;
    return h('li', { style: { '--cat': c.color } }, h('span.cp-name', catArt(c.id), c.name),
      progressBar(pct, { tone: 'cat', label: c.name }),
      h('span.cp-val', st?.answered ? `${Math.round(pct * 100)}% (${st.correct}/${st.answered})` : '–'));
  }));

  const history = s.history.slice(0, 8);
  const modeName = (x) => (x.mode === 'daily' ? L('Tantangan harian', 'Daily challenge') : x.mode === 'review' ? L('Ulasan', 'Review') : x.mode === 'path' ? L('Jalur Hafalan', 'Memory Path') : CATEGORY_BY_ID[x.category]?.name || L('Latihan', 'Practice'));
  const modeArt = (x) => (x.mode === 'practice' && x.category ? catArt(x.category) : iconEl(x.mode === 'daily' ? 'letter' : x.mode === 'review' ? 'bow' : 'book'));
  const histList = history.length ? h('ul.history', history.map((x) => h('li',
    h('span.h-mode', modeArt(x), modeName(x)),
    h('span.muted.small', formatKey(x.day, { withYear: false })),
    h('strong', `${x.score}/${x.total}`),
    h('span.h-xp', `+${fmt(x.xp)} XP`)))) : h('p.muted.small', L('Riwayat kuis akan muncul di sini.', 'Your quiz history will show up here.'));

  return h('div.screen.profile',
    head, styleCard(s, ctx), stats, links,
    card('', sectionTitle(L('Aktivitas bulan ini', 'This month\'s activity')), calendar(s, ctx)),
    achCard,
    card('', sectionTitle(L('Gelar', 'Titles')), ranks),
    card('', sectionTitle(L('Performa per kategori', 'Performance by category')), catPerf),
    card('', sectionTitle(L('Riwayat terbaru', 'Recent history')), histList),
    accountCard(s, ctx),
    settings(s, ctx));
}

function stat(icon, value, label) {
  return h('div.stat', h('span.stat-icon', { html: ICON[icon]() }), h('strong', value), h('span.small.muted', label));
}

// ───────────── Edit profil ─────────────
export function openStudio(s, ctx) {
  openAvatarStudio({
    cfg: s.profile.avatarCfg,
    level: lvInfo(s.xp.total).level,
    state: s,
    achNames: Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a.name])),
    wardrobe: s.profile.wardrobe,
    onWardrobe: (w) => ctx.update((st) => { st.profile.wardrobe = w; }),
    onSave: (cfg) => ctx.update((st) => { st.profile.avatarCfg = cfg; }),
  });
}

/** Kartu "Gaya hari ini": avatar seluruh badan dan item yang dipakai. */
function styleCard(s, ctx) {
  const cfg = sanitizeAvatar(s.profile.avatarCfg);
  const worn = ['dress', 'top', 'mid', 'bottom', 'outer', 'shoes', 'bag', 'head', 'neck', 'ears'].filter((k) => cfg[k]).map((k) => getItem(k, cfg[k]));
  return card('style-card',
    h('div.style-full', { html: avatarSvg(cfg, { view: 'full' }) }),
    h('div',
      h('span.script', L('Gaya hari ini', 'Today\'s look')),
      h('h2.display', L('Lemari kecilmu', 'Your little wardrobe')),
      h('div.style-list', worn.map((it) => chip(it.n, { tone: it.rarity === 'legendary' || it.rarity === 'epic' ? 'sun' : 'plain', title: RARITY[it.rarity].n }))),
      button(L('Buka Studio Avatar', 'Open Avatar Studio'), { onClick: () => openStudio(s, ctx) })));
}

export function editProfile(s, ctx) {
  const input = h('input.input', { type: 'text', value: s.profile.name, maxlength: 24, 'aria-label': L('Nama', 'Name') });
  const dlg = modal({
    title: L('Ubah profil', 'Edit profile'),
    body: h('div.form', h('label.small', L('Nama', 'Name')), input,
      h('p.small.muted', L('Negara Leaderboard bisa diganti di bagian Akun.', 'You can change your Leaderboard country in the Account section.'))),
    actions: [
      { label: L('Atur avatar', 'Edit avatar'), variant: 'ghost', onClick: () => openStudio(s, ctx) },
      { label: L('Simpan', 'Save'), keepOpen: true, onClick: () => {
        const name = input.value.trim();
        if (name.length < 2) { toast(L('Nama minimal 2 huruf.', 'Use at least 2 letters.'), { icon: '⚠️' }); input.focus(); return; }
        dlg.close(false);
        ctx.update((st) => { st.profile.name = name.slice(0, 24); });
        toast(L('Profil disimpan.', 'Profile saved.'), { icon: '✅' });
      } },
    ],
  });
}

// ───────────── Akun & Leaderboard ─────────────
function accountCard(s, ctx) {
  const cs = cloudStatus();
  const online = cs.mode === 'cloud' || cs.mode === 'readonly';
  const status = h('p.small', online ? onlineAccountText() : IS_APP_BUILD ? appOfflineText() : L('Mode tamu: progres hanya tersimpan di browser ini. Buka aplikasi lewat claude.ai dan masuk untuk menyimpan akun.', 'Guest mode: progress is saved in this browser only. Open the app through claude.ai and sign in to keep an account.'));
  if (cs.mode === 'cloud') accountName().then((n) => { if (n) status.textContent = L(`Masuk dengan akun claude.ai sebagai ${n}. Progresmu tersimpan di akunmu.`, `Signed in with claude.ai as ${n}. Your progress is saved to your account.`); });
  const lbRow = !hasAccount()
    ? h('div.set-row',
      h('div', h('strong', 'Leaderboard'), h('p.small.muted', IS_APP_BUILD ? (APP_HAS_SERVER ? L('Butuh internet. Buka ulang aplikasinya saat online.', 'Needs internet. Reopen the app while online.') : L('Hanya ada di versi claude.ai.', 'Only in the claude.ai version.')) : L('Butuh akun. Buka tahu gak? lewat claude.ai dan masuk untuk ikut.', 'Needs an account. Open tahu gak? through claude.ai and sign in to join.'))),
      signInLink('a.btn.btn-ghost.btn-sm'))
    : isRanked(s)
      ? h('div.set-row',
        h('div', h('strong', 'Leaderboard'), h('p.small', L(`Ikut sebagai ${countryName(s.profile.country)}.`, `Competing for ${countryName(s.profile.country)}.`)),
          h('p.small.muted', L('Pemain lain hanya melihat nama, avatar, negara, dan XP-mu.', 'Other players only see your name, avatar, country, and XP.'))),
        h('div.row-gap',
          button(L('Ganti negara', 'Change country'), { variant: 'ghost', size: 'sm', onClick: () => openChangeCountry(ctx) }),
          button(L('Keluar', 'Leave'), { variant: 'danger-ghost', size: 'sm', onClick: () => leave(ctx) })))
      : h('div.set-row',
        h('div', h('strong', 'Leaderboard'), h('p.small.muted', L('Belum ikut. Kamu tetap bisa main semua mode dan berteman.', 'Not joined. You can still play every mode and add friends.'))),
        button(L('Ikut Leaderboard', 'Join'), { size: 'sm', onClick: () => openJoin(ctx) }));
  const unameRow = usernamesSupported() ? h('div.set-row',
    h('div', h('strong', 'Username'),
      s.profile.username ? h('p.small.uname-show', `@${s.profile.username}`) : h('p.small.muted', L('Belum ada. Temanmu mencarimu lewat username.', 'Not set yet. Friends find you by your username.'))),
    button(s.profile.username ? L('Ubah', 'Change') : L('Buat username', 'Create username'), { size: 'sm', variant: s.profile.username ? 'ghost' : 'primary', onClick: () => openUsernameModal(ctx) })) : null;
  return card('settings account', sectionTitle(L('Akun', 'Account')), h('div.set-row.col', h('strong', L('Status masuk', 'Sign-in status')), status), unameRow, lbRow);
}

// ───────────── Pengaturan ─────────────
function settings(s, ctx) {
  const r = s.settings.reminders;
  const perm = notificationSupport();
  const permText = {
    granted: L('Notifikasi browser aktif. Pengingat dikirim selama aplikasi ini terbuka di sebuah tab.', 'Browser notifications are on. Reminders are sent while the app is open in a tab.'),
    default: L('Izin notifikasi belum diberikan. Aktifkan pengingat untuk meminta izin.', 'Notification permission isn\'t granted yet. Turn on reminders to ask for it.'),
    denied: L('Notifikasi diblokir oleh browser atau halaman ini. Pengingat akan tampil sebagai banner di Beranda.', 'Notifications are blocked by the browser or this page. Reminders will show as a banner on Home.'),
    unsupported: IS_APP_BUILD && (installMode() === 'ios' || installMode() === 'ios-other')
      ? L('Di iPhone dan iPad, notifikasi baru bisa dinyalakan setelah tahu gak? dipasang ke Layar Utama (iOS 16.4 ke atas). Buka app-nya dari Layar Utama, lalu nyalakan lagi di sini.', 'On iPhone and iPad, notifications work once tahu gak? is added to the Home Screen (iOS 16.4 or later). Open it from the Home Screen, then turn this on again.')
      : L('Browser ini tidak mendukung notifikasi. Pengingat akan tampil sebagai banner di Beranda.', 'This browser doesn\'t support notifications. Reminders will show as a banner on Home.'),
  }[perm];
  const usePush = pushSupported();
  const pushText = r.enabled && r.push
    ? L('Notifikasi streak dikirim ke HP-mu pada jam pilihanmu kalau kamu belum main, walaupun aplikasi sedang ditutup.', 'A streak notification is sent to your phone at your chosen time if you haven\'t played, even when the app is closed.')
    : L('Nyalakan untuk dapat notifikasi streak di HP, walaupun aplikasi sedang ditutup. Butuh internet.', 'Turn on to get streak notifications on your phone, even when the app is closed. Needs internet.');

  const onPushReminder = async (on) => {
    ctx.update((st) => { st.settings.reminders.enabled = on; if (!on) st.settings.reminders.push = false; });
    if (!on) { await disablePush(ctx.getState()); return; }
    const res = await enablePush(ctx.getState());
    ctx.update((st) => { st.settings.reminders.push = res === 'ok'; });
    const msg = {
      ok: L(`Notifikasi streak aktif pukul ${r.time}.`, `Streak notifications on at ${r.time}.`),
      denied: L('Izin notifikasi ditolak. Izinkan notifikasi untuk tahu gak? di pengaturan HP, lalu coba lagi.', 'Notification permission was denied. Allow notifications for tahu gak? in your phone settings, then try again.'),
      offline: L('Butuh internet untuk menyalakan notifikasi. Coba lagi saat online.', 'You need internet to turn on notifications. Try again when online.'),
      nokey: L('Server notifikasi belum siap. Coba lagi beberapa saat lagi.', 'The notification server isn\'t ready yet. Try again in a little while.'),
      error: L('Notifikasi belum bisa dinyalakan di HP ini. Pengingat tetap muncul saat aplikasi terbuka.', 'Notifications couldn\'t be turned on on this phone. Reminders still show while the app is open.'),
      unsupported: L('HP atau browser ini tidak mendukung notifikasi push. Pengingat tetap muncul saat aplikasi terbuka.', 'This phone or browser doesn\'t support push notifications. Reminders still show while the app is open.'),
    }[res];
    toast(msg, { tone: res === 'ok' ? 'ok' : 'plain', duration: res === 'ok' ? 3000 : 5000 });
  };

  const onReminder = async (on) => {
    if (usePush) return onPushReminder(on);
    let p = notificationSupport();
    if (on && p === 'default') p = await requestPermission();
    ctx.update((st) => { st.settings.reminders.enabled = on; });
    if (on) toast(p === 'granted' ? L(`Pengingat aktif pukul ${r.time}.`, `Reminder set for ${r.time}.`) : L('Pengingat aktif sebagai banner di Beranda.', 'Reminder on as a banner on Home.'), { icon: '⏰' });
  };

  const time = h('input.input.time', {
    type: 'time', value: r.time, disabled: !r.enabled, 'aria-label': L('Jam pengingat', 'Reminder time'),
    onchange: (e) => { if (e.target.value) ctx.update((st) => { st.settings.reminders.time = e.target.value; st.settings.reminders.lastNotified = null; }); },
  });

  const ff = s.settings.funFact;
  const onFact = async (on) => {
    let p = notificationSupport();
    if (on && p === 'default') p = await requestPermission();
    ctx.update((st) => { st.settings.funFact.enabled = on; });
    if (on) toast(p === 'granted' ? L(`Fun fact dikirim tiap hari pukul ${ff.time}.`, `A fun fact will arrive daily at ${ff.time}.`) : L('Notifikasi tidak aktif di sini. Fun fact tetap ada di Beranda tiap hari.', 'Notifications are off here. The fun fact is still on Home every day.'), { icon: '💡' });
  };
  const factTime = h('input.input.time', {
    type: 'time', value: ff.time, disabled: !ff.enabled, 'aria-label': L('Jam fun fact', 'Fun fact time'),
    onchange: (e) => { if (e.target.value) ctx.update((st) => { st.settings.funFact.time = e.target.value; st.settings.funFact.lastNotified = null; }); },
  });

  const cs = cloudStatus();
  const syncText = cs.mode === 'cloud' ? (isFirebase() ? L('Progres dicadangkan ke server tahu gak? untuk HP ini.', 'Progress is backed up to the tahu gak? server for this phone.') : L('Progres tersinkron ke akun claude.ai-mu dan bisa dipakai di perangkat lain.', 'Progress is synced to your claude.ai account and works on other devices.'))
    : IS_APP_BUILD ? L('Progres tersimpan di HP ini. Menghapus data aplikasi atau browser akan menghapus progres.', 'Progress is saved on this phone. Clearing the app or browser data will erase it.') : `${cs.reason} ${storageAvailable() ? L('Data tersimpan di localStorage browser ini; menghapus data situs akan menghapus progres.', 'Data is stored in this browser\'s localStorage; clearing site data will erase your progress.') : L('Penyimpanan browser tidak tersedia: progres hilang saat halaman ditutup.', 'Browser storage isn\'t available: progress is lost when the page closes.')}`;

  return card('settings',
    sectionTitle(L('Pengaturan', 'Settings')),
    h('div.set-row', h('div', h('strong', L('Bahasa', 'Language')), h('p.small.muted', L('Bahasa tampilan, soal, dan penjelasan.', 'Language for the app, questions, and explanations.'))),
      langToggle(s.settings.lang, (lang) => ctx.update((st) => { st.settings.lang = lang; }))),
    h('div.set-row', h('div', h('strong', L('Mode timer', 'Timer mode')), h('p.small.muted', L('Bonus XP untuk jawaban cepat. Di tantangan harian, waktu habis tidak membuatmu salah.', 'Bonus XP for quick answers. In the daily challenge, running out of time doesn\'t count as wrong.'))),
      toggle(s.settings.timer, (v) => ctx.update((st) => { st.settings.timer = v; }), 'Timer')),
    h('div.set-row', h('div', h('strong', usePush ? L('Notifikasi streak', 'Streak notifications') : L('Pengingat harian', 'Daily reminder')), h('p.small.muted', usePush ? pushText : permText)),
      toggle(usePush ? r.enabled && r.push : r.enabled, onReminder, L('Pengingat', 'Reminder'))),
    h('div.set-row', h('div', h('strong', L('Jam pengingat', 'Reminder time')), h('p.small.muted', L('Dikirim jika kamu belum main hari itu.', 'Sent if you haven\'t played that day.'))),
      h('div.row-gap', time, button(L('Tes', 'Test'), { variant: 'ghost', size: 'sm', disabled: usePush ? !(r.enabled && r.push) : !r.enabled, onClick: () => {
        const ok = sendNotification(ctx.getState(), { seed: Math.floor(Math.random() * 1e6) });
        toast(ok && usePush ? L('Ini contoh notifikasinya. Yang asli dikirim server sekitar jam pilihanmu, kalau hari itu kamu belum main.', 'This is a preview. The real one comes from the server around your chosen time, if you haven\'t played that day.')
          : ok ? L('Notifikasi tes dikirim.', 'Test notification sent.') : L('Notifikasi tidak bisa dikirim di sini. Pengingat akan muncul sebagai banner.', 'Notifications can\'t be sent here. Reminders will show as a banner.'), { icon: ok ? '🔔' : 'ℹ️' });
      } }))),
    h('div.set-row', h('div', h('strong', L('Fun fact harian', 'Daily fun fact')), h('p.small.muted', L('Satu fakta baru tiap hari sebagai notifikasi, selama app ini terbuka di sebuah tab. Faktanya juga selalu ada di Beranda.', 'One new fact a day as a notification, while the app is open in a tab. The fact is always on Home too.'))),
      toggle(ff.enabled, onFact, L('Fun fact harian', 'Daily fun fact'))),
    h('div.set-row', h('div', h('strong', L('Jam fun fact', 'Fun fact time')), h('p.small.muted', L('Dikirim sekali sehari setelah jam ini.', 'Sent once a day after this time.'))),
      h('div.row-gap', factTime, button(L('Tes', 'Test'), { variant: 'ghost', size: 'sm', disabled: !ff.enabled, onClick: () => {
        const ok = sendFactNotification();
        toast(ok ? L('Fun fact tes dikirim.', 'Test fun fact sent.') : L('Notifikasi tidak bisa dikirim di sini. Fun fact tetap ada di Beranda.', 'Notifications can\'t be sent here. The fun fact is still on Home.'), { icon: ok ? '💡' : 'ℹ️' });
      } }))),
    h('div.set-row', h('div', h('strong', L('Kurangi animasi', 'Reduce motion')), h('p.small.muted', L('Matikan konfeti dan animasi angka.', 'Turn off confetti and number animations.'))),
      toggle(s.settings.reducedMotion, (v) => ctx.update((st) => { st.settings.reducedMotion = v; }), L('Kurangi animasi', 'Reduce motion'))),
    h('div.set-row.col', h('strong', L('Penyimpanan', 'Storage')), h('p.small.muted', syncText)),
    h('div.set-row', h('div', h('strong', L('Reset progres', 'Reset progress')), h('p.small.muted', L('Menghapus XP, streak, pencapaian, dan riwayat. Tidak bisa dibatalkan.', 'Deletes XP, streaks, achievements, and history. This can\'t be undone.'))),
      button('Reset', { variant: 'danger-ghost', size: 'sm', onClick: async () => {
        if (await confirmModal(L('Reset semua progres?', 'Reset all progress?'), L('Semua XP, streak, item, pencapaian, dan riwayat akan dihapus permanen.', 'All XP, streaks, items, achievements, and history will be permanently deleted.'), { confirmLabel: L('Hapus semua', 'Delete everything'), danger: true })) ctx.reset();
      } })));
}

export { diffDays };
