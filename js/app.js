// Titik masuk aplikasi: shell, routing, perawatan harian, sinkronisasi.

import { h, clear, fmt } from './ui/dom.js';
import { button, toast, modal, avatarEl, langToggle, countryPicker } from './ui/components.js';
import { signInLink } from './ui/leaderboardJoin.js';
import { suggestCountry, isCountry } from './data/countries.js';
import { ICONS } from './ui/icons.js';
import { getState, update, subscribe, onSaved, replaceState, resetState, completeOnboarding } from './core/state.js';
import { reconcileStreak } from './core/streak.js';
import { checkAchievements } from './core/achievements.js';
import { rolloverLeague } from './core/league.js';
import { buildDaily, buildPractice, buildReview, buildPath, reviewPool, dailyStatus, toItem, buildFresh } from './core/quiz.js';
import { ensureMissions, trackMission } from './core/missions.js';
import { createDuel, buildDuelSpec, syncDuels } from './core/duel.js';
import { openKilat } from './ui/screens/kilat.js';
import { renderReport } from './ui/screens/report.js';
import { renderPath } from './ui/screens/path.js';
import { todayKey } from './core/dates.js';
import { tickReminder } from './core/reminders.js';
import { syncPush, pushActive, repairPush } from './core/pushReminder.js';
import { tickFunFact } from './core/funfact.js';
import { initInstall, onInstallChange, installMode } from './core/install.js';
import { openInstallHelp } from './ui/installUi.js';
import { usernameField, problemText } from './ui/usernameUi.js';
import { suggestUsername, usernameProblem } from './core/username.js';
import { initCloud, schedulePush, pushNow, getPlayers, onPlayers, cloudStatus, accountName, hasAccount, isRanked, IS_APP_BUILD, APP_HAS_SERVER, onlineAccountText, usernamesSupported, claimUsername } from './core/cloud.js';
import { FIREBASE_CONFIG } from './firebase-config.js';
import { QUESTION_BY_ID } from './data/questions.js';
import { renderHome } from './ui/screens/home.js';
import { renderPractice } from './ui/screens/practice.js';
import { renderReview } from './ui/screens/review.js';
import { renderLeague } from './ui/screens/league.js';
import { renderProfile } from './ui/screens/profile.js';
import { openAvatarStudio } from './ui/avatarStudio.js';
import { randomAvatar, DEFAULT_AVATAR } from './core/avatar.js';
import { renderShop } from './ui/screens/shop.js';
import { renderStreak } from './ui/screens/streak.js';
import { renderAchievements } from './ui/screens/achievements.js';
import { openQuiz } from './ui/screens/quiz.js';
import { art, storefront, floralCorner, ICON } from './ui/art.js';
import { L, setLang, LANGS, getLang } from './core/i18n.js';

const ROUTES = {
  home: { label: () => L('Beranda', 'Home'), render: renderHome },
  practice: { label: () => L('Latihan', 'Practice'), render: renderPractice },
  hafalan: { label: () => L('Jalur Hafalan', 'Memory Path'), render: renderPath, navAs: 'practice' },
  review: { label: () => L('Ulas', 'Review'), render: renderReview },
  league: { label: () => L('Leaderboard', 'Leaderboard'), render: renderLeague },
  peringkat: { label: () => L('Peringkat', 'Rankings'), render: renderLeague, navAs: 'league' },
  teman: { label: () => L('Teman', 'Friends'), render: renderLeague, navAs: 'league' },
  profile: { label: () => L('Profil', 'Profile'), render: renderProfile },
  streak: { label: () => 'Streak', render: renderStreak, navAs: 'profile' },
  pencapaian: { label: () => L('Pencapaian', 'Achievements'), render: renderAchievements, navAs: 'profile' },
  rapor: { label: () => L('Rapor', 'Report'), render: renderReport, navAs: 'profile' },
  shop: { label: () => L('Toko', 'Shop'), render: renderShop },
};

let route = 'home';
let quizOpen = false;
let lastDay = todayKey();

const ctx = {
  getState,
  update: (fn, opts) => update(fn, opts),
  rerender: () => render(),
  route: () => route,
  navigate,
  players: () => getPlayers(),
  questionById: (id) => QUESTION_BY_ID[id],
  setQuizOpen: (v) => { quizOpen = v; },
  lookupTerm: (id) => {
    if (getState().glossarySeen?.[id]) return;
    const unlocked = update((st) => {
      st.glossarySeen = st.glossarySeen || {};
      st.glossarySeen[id] = Date.now();
      return checkAchievements(st);
    }, { silent: true }); // jangan render ulang: popover sedang terbuka
    if (!quizOpen) renderTopStats(getState());
    unlocked.forEach((a) => toast(L(`Pencapaian terbuka: ${a.name} (+${a.xp} XP)`, `Achievement unlocked: ${a.name} (+${a.xp} XP)`), { icon: a.icon, tone: 'sun' }));
  },
  onClose: () => { maintenance(); render(); },
  reset: () => { resetState(); route = 'home'; boot(); },
  playDaily: () => {
    const s = getState();
    if (dailyStatus(s).status === 'done') { toast(L('Tantangan hari ini sudah selesai. Kembali besok!', 'Today\'s challenge is done. Come back tomorrow!'), { icon: '✅' }); return; }
    openQuiz(buildDaily(todayKey(), s), ctx);
  },
  playPractice: (cat) => openQuiz(buildPractice(getState(), cat), ctx),
  playPath: () => openQuiz(buildPath(getState()), ctx),
  playKilat: () => openKilat(ctx),
  playFresh: () => openQuiz(buildFresh(getState()), ctx),
  /** Menantang teman. friend: { id, kind: 'sim'|'real', name, avatarCfg } */
  startDuel: (friend) => {
    const duel = update((st) => createDuel(st, friend), { silent: true });
    openQuiz({ ...buildDuelSpec(duel, toItem, friend.name), opponentAvatar: friend.avatarCfg || null }, ctx);
  },
  /** Memainkan duel yang sudah ada (tantangan masuk). */
  playDuel: (id, name, avatarCfg) => {
    const duel = getState().duels?.[id];
    if (!duel || duel.me) return;
    // Penantang otomatis masuk daftar teman supaya hasilnya terlihat di halaman Teman.
    if (duel.kind === 'real' && !getState().friends.real.includes(duel.with)) update((st) => { st.friends.real.push(duel.with); }, { silent: true });
    openQuiz({ ...buildDuelSpec(duel, toItem, name), opponentAvatar: avatarCfg || null }, ctx);
  },
  playReview: () => {
    if (!reviewPool(getState()).length) { toast(L('Tidak ada soal untuk diulas.', 'Nothing to review yet.'), { icon: 'ℹ️' }); return; }
    openQuiz(buildReview(getState()), ctx);
  },
};

// ───────────── Shell ─────────────
const main = document.getElementById('main');
const rail = document.getElementById('rail-nav');
const bottom = document.getElementById('bottom-nav');
const topStats = document.getElementById('top-stats');

function navItems(target, compact) {
  const s = getState();
  const pending = reviewPool(s).length;
  clear(target);
  const activeNav = ROUTES[route]?.navAs || route;
  for (const [id, r] of Object.entries(ROUTES)) {
    if (r.navAs) continue;
    const a = h(`a.nav-item${activeNav === id ? '.active' : ''}`, { href: `#${id}`, 'aria-current': activeNav === id ? 'page' : undefined },
      h('span.nav-icon', { html: ICONS[id] }),
      h('span.nav-label', r.label()),
      id === 'review' && pending ? h('span.nav-badge', { 'aria-label': L(`${pending} soal`, `${pending} questions`) }, pending > 99 ? '99+' : pending) : null);
    target.append(a);
  }
  if (!compact) return;
}

function renderTopStats(s) {
  clear(topStats).append(...[
    h(`a.stat-pill.flame-pill${s.streak.current ? '.is-lit' : ''}`, { href: '#streak', title: L(`Streak ${s.streak.current} hari`, `${s.streak.current}-day streak`), 'aria-label': L(`Streak ${s.streak.current} hari`, `${s.streak.current}-day streak`) }, art(ICON.flame(), 'ico'), fmt(s.streak.current)),
    h('span.stat-pill', { title: L('Saldo XP', 'XP balance'), 'aria-label': L(`Saldo ${s.xp.balance} XP`, `${s.xp.balance} XP balance`) }, art(ICON.star(), 'ico'), fmt(s.xp.balance)),
    h('span.stat-pill.ice-pill', { title: L('Streak Freeze dimiliki', 'Streak Freezes owned'), 'aria-label': `${s.inventory.freeze} Streak Freeze` }, art(ICON.bow(), 'ico'), s.inventory.freeze),
    cloudStatus().mode === 'cloud' ? h('span.stat-pill.sync', { title: L('Tersinkron ke akunmu', 'Synced to your account'), 'aria-label': L('Tersinkron ke akunmu', 'Synced to your account') }, art(ICON.check(), 'ico')) : null,
    h('a.top-avatar', { href: '#profile', title: L('Profil', 'Profile'), 'aria-label': L('Buka profil', 'Open profile') }, avatarEl(s.profile.avatarCfg)),
  ].filter(Boolean));
}

function render() {
  const s = getState();
  setLang(s.settings.lang);
  applyStaticText();
  document.documentElement.classList.toggle('reduce-motion', !!s.settings.reducedMotion);
  if (!s.profile.onboarded) { renderOnboarding(); return; }
  document.body.classList.remove('onboarding');
  clear(document.getElementById('onboard'));
  navItems(rail);
  navItems(bottom, true);
  renderTopStats(s);
  try {
    const screen = ROUTES[route].render(s, ctx);
    clear(main).append(screen);
  } catch (e) {
    console.error(e);
    clear(main).append(h('div.screen', h('div.empty',
      h('div.empty-icon', art(ICON.letter(), 'ico')), h('h3', L('Halaman ini gagal ditampilkan', 'This page failed to load')),
      h('p', L('Progresmu aman. Coba buka halaman lain atau muat ulang.', 'Your progress is safe. Try another page or reload.')),
      button(L('Muat ulang halaman', 'Reload page'), { onClick: () => location.reload() }))));
  }
}

function navigate(to) {
  if (!ROUTES[to]) to = 'home';
  if (location.hash !== `#${to}`) location.hash = to; // memicu hashchange → render
  else { route = to; render(); }
}

window.addEventListener('hashchange', () => {
  const to = location.hash.slice(1);
  route = ROUTES[to] ? to : 'home';
  render();
  main.scrollTo?.(0, 0);
  window.scrollTo(0, 0);
});

// Teks statis di index.html (splash, rail, label navigasi)
function applyStaticText() {
  const set = (sel, text) => { const el = document.querySelector(sel); if (el) el.textContent = text; };
  set('#splash p', L('Menyiapkan soal…', 'Getting questions ready…'));
  set('.rail-foot', L('Sedikit demi sedikit, tiap hari.', 'A little every day.'));
  document.querySelectorAll('.logo-bubble[href="#home"]').forEach((a) => a.setAttribute('aria-label', L('tahu gak? Beranda', 'tahu gak? Home')));
  document.querySelectorAll('#rail-nav, #bottom-nav').forEach((n) => n.setAttribute('aria-label', L('Navigasi utama', 'Main navigation')));
}

// ───────────── Onboarding ─────────────
let onbDraft = null; // simpan nama & avatar saat bahasa diganti di tengah pendaftaran

function langSwitch() {
  return langToggle(getLang(), (lang) => {
    const nick = document.getElementById('nick');
    onbDraft = { ...(onbDraft || {}), name: nick?.value || '' };
    update((st) => { st.settings.lang = lang; });
  }, { compact: true });
}

function renderOnboarding() {
  document.body.classList.add('onboarding');
  let avatar = onbDraft?.avatar || randomAvatar(Math.random, Math.random() < 0.5 ? 'f' : 'm');
  const remember = () => { onbDraft = { ...(onbDraft || {}), avatar }; };
  remember();
  const input = h('input.input.big', { value: onbDraft?.name || '', type: 'text', placeholder: L('Nama panggilanmu', 'Your nickname'), maxlength: 24, 'aria-label': L('Nama panggilan', 'Nickname'), autocomplete: 'nickname', id: 'nick' });
  const err = h('p.small.err', { role: 'alert' });
  // Username unik (versi aplikasi + server): diusulkan dari nama sampai pemain mengubahnya sendiri.
  const unameSuffix = Math.random();
  const ufield = usernamesSupported() ? usernameField({ initial: onbDraft?.username || '', id: 'uname', onInput: (v) => { onbDraft = { ...(onbDraft || {}), username: v }; } }) : null;
  if (ufield) input.addEventListener('input', () => {
    if (!ufield.touched() && !onbDraft?.username) ufield.setValue(input.value.trim().length >= 2 ? suggestUsername(input.value, () => unameSuffix) : '');
  });
  let claiming = false;
  const withUsername = async (go) => {
    if (!ufield) { go(null); return; }
    const v = ufield.value();
    const p = usernameProblem(v);
    if (p) { ufield.showError(p); ufield.input.focus(); return; }
    if (claiming) return;
    claiming = true;
    const r = await claimUsername(v);
    claiming = false;
    if (r === 'ok') { go(v); return; }
    if (r === 'taken') { ufield.showError('taken'); ufield.input.focus(); return; }
    toast(`${problemText(r)} ${L('Kamu bisa membuatnya nanti di Profil.', 'You can create one later in Profile.')}`, { duration: 6000 });
    go(null);
  };
  // Pemilih avatar cepat: cewek/cowok, acak, atau buka studio untuk detail.
  const avPreview = h('div.onb-av');
  const segBtns = h('div.segctl', { role: 'group', 'aria-label': L('Tipe badan', 'Body type') });
  const drawAv = () => {
    remember();
    clear(avPreview).append(avatarEl(avatar));
    clear(segBtns).append(...[['f', L('Cewek', 'Girl')], ['m', L('Cowok', 'Boy')]].map(([b, label]) => h(`button.segctl-btn${avatar.body === b ? '.on' : ''}`, {
      type: 'button', 'aria-pressed': String(avatar.body === b),
      onclick: () => { if (avatar.body !== b) { avatar = { ...DEFAULT_AVATAR[b], skin: avatar.skin, bg: avatar.bg }; drawAv(); } },
    }, label)));
  };
  const grid = h('div.onb-avatar', avPreview,
    h('div.onb-av-ctrl', segBtns,
      h('div.row-gap',
        button(L('Acak', 'Shuffle'), { variant: 'ghost', size: 'sm', onClick: () => { avatar = randomAvatar(Math.random, avatar.body); drawAv(); } }),
        button(L('Kustomisasi', 'Customize'), { size: 'sm', onClick: () => openAvatarStudio({ cfg: avatar, level: 1, onSave: (c) => { avatar = c; drawAv(); } }) })),
      h('p.small.muted', L('Atur rambut, baju, dan aksesori. Bisa diubah lagi kapan saja di Profil.', 'Pick hair, clothes, and accessories. You can change them anytime in Profile.'))));
  drawAv();
  // Negara hanya dipilih kalau pemain punya akun (syarat ikut Leaderboard).
  const signedIn = hasAccount();
  let country = isCountry(onbDraft?.country) ? onbDraft.country : suggestCountry();
  const countryErr = h('p.small.err', { role: 'alert' });

  // Status masuk: akun claude.ai (online) atau tamu (lokal)
  const account = h('div.account-line', signedIn
    ? [art(ICON.check(), 'ico'), h('span', IS_APP_BUILD ? onlineAccountText() : L('Kamu masuk dengan akun claude.ai. Progresmu tersimpan di akunmu.', 'You\'re signed in with your claude.ai account. Your progress is saved to it.'))]
    : [art(ICON.letter(), 'ico'), h('span', IS_APP_BUILD ? L('Progresmu tersimpan di HP ini.', 'Your progress is saved on this phone.') : L('Kamu belum masuk akun. Progres tersimpan di browser ini saja.', 'You\'re not signed in. Progress is saved in this browser only.'))]);
  if (signedIn) accountName().then((n) => { if (n) account.lastChild.textContent = L(`Kamu masuk dengan akun claude.ai sebagai ${n}. Progresmu tersimpan di akunmu.`, `You're signed in with claude.ai as ${n}. Your progress is saved to your account.`); });

  const checkName = () => {
    const name = input.value.trim();
    if (name.length < 2) { err.textContent = L('Tulis nama minimal 2 huruf.', 'Use at least 2 letters.'); input.focus(); return null; }
    err.textContent = '';
    return name;
  };
  const finish = (name, joinCountry, username = null) => {
    const finalAvatar = onbDraft?.avatar || avatar;
    onbDraft = null;
    completeOnboarding(name, finalAvatar, joinCountry);
    if (username) update((st) => { st.profile.username = username; });
    maintenance(); // misi hari ini, dll.
    route = 'home';
    if (location.hash !== '#home') location.hash = 'home'; else render();
    toast(joinCountry
      ? L('Pendaftaran selesai. Kamu ikut Leaderboard!', 'You\'re signed up and on the Leaderboard!')
      : IS_APP_BUILD && !hasAccount() ? L('Selamat main!', 'Have fun!') : L('Selamat main! Kamu bisa ikut Leaderboard kapan saja dari Profil.', 'Have fun! You can join the Leaderboard anytime from Profile.'),
    { icon: joinCountry ? '🏆' : '👋', duration: 4500 });
  };
  const register = (e) => {
    e?.preventDefault();
    const name = checkName(); if (!name) return;
    if (!signedIn) { finish(name, null); return; }
    if (!isCountry(country)) { countryErr.textContent = L('Pilih negaramu dulu, atau pilih "Main tanpa Leaderboard".', 'Choose your country, or pick "Play without the Leaderboard".'); return; }
    withUsername((u) => finish(name, country, u));
  };
  const skip = () => { const name = checkName(); if (name) withUsername((u) => finish(name, null, u)); };

  const regBox = signedIn
    ? h('section.reg-box',
      h('h2', L('Ikut Leaderboard', 'Join the Leaderboard')),
      h('p.small.muted', L('Pilih negaramu untuk bersaing di leaderboard mingguan, peringkat negaramu, dan peringkat global.', 'Choose your country to compete on the weekly leaderboard, your country\'s rankings, and the global rankings.')),
      countryPicker({ value: country, onChange: (c) => { country = c; onbDraft = { ...(onbDraft || {}), country: c }; countryErr.textContent = ''; } }),
      countryErr,
      h('ul.reg-points',
        h('li', L('Pemain lain hanya melihat nama, avatar, negara, dan XP-mu.', 'Other players only see your name, avatar, country, and XP.')),
        h('li', L('Negara dan keikutsertaan bisa diubah kapan saja di Profil.', 'You can change your country or leave anytime in Profile.'))))
    : IS_APP_BUILD ? null : h('section.reg-box',
      h('h2', L('Mau ikut Leaderboard?', 'Want to join the Leaderboard?')),
      h('p.small.muted', L('Leaderboard butuh akun. Buka tahu gak? lewat claude.ai lalu masuk (atau daftar) dengan akunmu, maka kamu bisa memilih negara dan ikut bersaing.', 'The Leaderboard needs an account. Open tahu gak? through claude.ai and sign in (or sign up), then you can choose your country and compete.')),
      signInLink('a.btn.btn-ghost.reg-signin'),
      h('ul.reg-points',
        h('li', L('Tanpa akun, kamu tetap bisa main semua mode, tapi tidak masuk Leaderboard.', 'Without an account you can still play every mode, but you won\'t be on the Leaderboard.'))));

  clear(main);
  const layer = document.getElementById('onboard');
  clear(layer).append(h('form.onboard-card.frame', { onsubmit: register },
    art(floralCorner(), 'corner-orn.tl'),
    h('div.onb-art', art(storefront())),
    h('div.logo-bubble.xl', h('span', 'tahu gak?')),
    langSwitch(),
    h('span.script.onb-script', L('Selamat datang', 'Welcome')),
    h('h1.display', L('Lima soal sehari, makin tahu tiap hari.', 'Five questions a day, a little wiser every day.')),
    h('p.lead', L('Jawab tantangan harian, jaga streak, kumpulkan XP, dan ulang soal yang kamu salah sampai paham.', 'Answer the daily challenge, keep your streak, earn XP, and replay what you got wrong until it sticks.')),
    account,
    iosNote(),
    h('label.small', { for: 'nick' }, L('Siapa namamu?', 'What\'s your name?')),
    input, err,
    ufield ? h('label.small', { for: 'uname' }, L('Username (untuk dicari teman)', 'Username (so friends can find you)')) : null,
    ufield ? ufield.el : null,
    ufield ? h('p.small.muted.uname-hint', L('Huruf kecil, angka, titik, atau garis bawah. Nama di atas tetap jadi nama tampilanmu.', 'Lowercase letters, numbers, dots, or underscores. The name above stays your display name.')) : null,
    h('p.small', L('Avatarmu', 'Your avatar')), grid,
    regBox,
    h('div.reg-actions', signedIn
      ? [button(L('Daftar & masuk Leaderboard', 'Sign up & join the Leaderboard'), { type: 'submit', size: 'lg', cls: 'wide' }),
        button(L('Main tanpa Leaderboard', 'Play without the Leaderboard'), { variant: 'ghost', size: 'lg', cls: 'wide', onClick: skip })]
      : [button(L('Main tanpa akun', 'Play without an account'), { type: 'submit', size: 'lg', cls: 'wide' })])));
  setTimeout(() => input.focus(), 50);
}

// ───────────── Perawatan harian ─────────────
function maintenance() {
  const s = getState();
  if (!s.profile.onboarded) return;
  const events = update((st) => ({
    streak: reconcileStreak(st),
    league: rolloverLeague(st, { realPlayers: getPlayers(), eligible: isRanked(st) }),
    missions: (ensureMissions(st), trackMission(st, { type: 'tick' })),
  }), { silent: true });
  events.missions.forEach((m) => toast(L(`Misi selesai: ${m.text} (+${m.xp} XP)`, `Mission done: ${m.text} (+${m.xp} XP)`), { tone: 'sun' }));
  if (events.streak?.type === 'protected') {
    const n = events.streak.days.length;
    toast(L(`Streak Freeze melindungi ${n} hari yang terlewat. Streak-mu aman!`, `A Streak Freeze covered ${n === 1 ? 'the missed day' : `${n} missed days`}. Your streak is safe!`), { icon: '🧊', tone: 'ok', duration: 5000 });
  }
  if (events.streak?.type === 'broken') {
    toast(L(`Streak ${events.streak.lost} harimu terputus. Mulai lagi hari ini!`, `Your ${events.streak.lost}-day streak ended. Start a new one today!`), { icon: '💔', duration: 5000 });
  }
}

function tick() {
  const now = todayKey();
  if (now !== lastDay) {
    lastDay = now;
    maintenance();
    if (!quizOpen) render();
    toast(L('Hari baru, tantangan baru!', 'New day, new challenge!'), { icon: '📅' });
  }
  const s = getState();
  if (s.profile.onboarded) {
    if (!pushActive(s)) tickReminder(s, (day) => update((st) => { st.settings.reminders.lastNotified = day; }, { silent: true }));
    tickFunFact(getState(), (day) => update((st) => { st.settings.funFact.lastNotified = day; }, { silent: true }));
  }
}

// iPhone/iPad: app di Layar Utama punya penyimpanan sendiri, terpisah dari Safari. Daftar dari Safari lalu memasang
// app = akun baru. Jadi sarankan pasang dulu sebelum daftar.
function iosNote() {
  if (!IS_APP_BUILD) return null;
  const mode = installMode();
  if (mode !== 'ios' && mode !== 'ios-other') return null;
  return h('div.onb-ios', h('p.small', h('strong', L('Pakai iPhone atau iPad? ', 'On an iPhone or iPad? ')),
    L('Pasang tahu gak? ke Layar Utama dulu, baru daftar dari app-nya. Kalau daftar di Safari, akun dan progresmu tidak ikut pindah ke app.', 'Add tahu gak? to your Home Screen first, then sign up inside the app. If you sign up in Safari, your account and progress won\'t carry over to the app.')),
  button(L('Caranya', 'How'), { size: 'sm', onClick: () => openInstallHelp(mode) }));
}

// ───────────── Pasang aplikasi ─────────────
// Didaftarkan sedini mungkin: beforeinstallprompt bisa muncul sebelum boot selesai.
if (IS_APP_BUILD) {
  initInstall();
  onInstallChange(() => { if (getState().profile.onboarded && route === 'home' && !quizOpen) render(); });
}

// ───────────── Boot ─────────────
let booted = false;
async function boot() {
  const splash = document.getElementById('splash');
  if (!booted) {
    booted = true;
    if (APP_HAS_SERVER) await (await import('./core/firebaseShim.js')).installFirebase(FIREBASE_CONFIG);
    const cloud = await initCloud();
    const local = getState();
    if (cloud && (!local.profile.onboarded || (cloud.meta?.updatedAt || 0) > (local.meta?.updatedAt || 0))) {
      replaceState(cloud, { silent: true });
      if (local.profile.onboarded) toast(L('Progres dimuat dari akunmu.', 'Progress loaded from your account.'), { icon: '☁️' });
    }
    onSaved((st) => { schedulePush(st); syncPush(st); });
    if (cloudStatus().mode === 'cloud') pushNow(getState());
    if (getState().profile.onboarded) {
      repairPush(getState()).then((res) => {
        if (res && (res === 'ok') !== !!getState().settings.reminders.push) update((st) => { st.settings.reminders.push = res === 'ok'; });
      }).catch(() => {});
    }
    subscribe(() => { if (!quizOpen) render(); });
    onPlayers((players) => {
      // Duel: tantangan baru untukmu & balasan lawan.
      const changes = getState().profile.onboarded ? update((st) => syncDuels(st, players, cloudStatus().uid), { silent: true, unchanged: (c) => !c.length }) : [];
      for (const c of changes) {
        const who = players.find((p) => p.id === c.duel.with)?.nickname || L('Temanmu', 'Your friend');
        if (c.type === 'incoming') toast(L(`${who} menantangmu duel! Buka Teman untuk main.`, `${who} challenged you to a duel! Open Friends to play.`), { tone: 'sun', duration: 5000 });
        else toast(c.duel.outcome === 'win' ? L(`Kamu menang duel lawan ${who}!`, `You won your duel against ${who}!`) : c.duel.outcome === 'lose' ? L(`${who} menang duel kali ini.`, `${who} won the duel this time.`) : L(`Duel lawan ${who} seri.`, `Your duel with ${who} was a tie.`), { tone: 'sun', duration: 5000 });
      }
      if (quizOpen || !getState().profile.onboarded) return; // jangan gambar ulang pendaftaran
      if (document.activeElement?.matches('input')) return; // jangan ganggu yang sedang mengetik
      if (['league', 'peringkat', 'teman', 'home'].includes(route)) render();
    });
    setInterval(tick, 30000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
    window.addEventListener('pagehide', () => pushNow(getState()));
  }
  const hash = location.hash.slice(1);
  route = ROUTES[hash] ? hash : 'home';
  maintenance();
  render();
  splash?.classList.add('gone');
  setTimeout(() => splash?.remove(), 400);
  tick();
}

boot().catch((e) => {
  console.error(e);
  const splash = document.getElementById('splash');
  if (splash) splash.querySelector('p').textContent = L('Aplikasi gagal dimuat. Muat ulang halaman untuk mencoba lagi.', 'The app failed to load. Reload the page to try again.');
});

export { modal };
