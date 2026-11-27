// Banner "Pasang aplikasi" dan tombol "Ajak teman" (versi aplikasi).
import { h } from './dom.js';
import { button, modal, toast } from './components.js';
import { ICON, art, iconEl } from './art.js';
import { L } from '../core/i18n.js';
import { installMode, promptInstall, appUrl, apkUrl, isAndroid } from '../core/install.js';

function steps(items) {
  return h('ol.install-steps', items.map((it) => h('li', ...[].concat(it))));
}

const shareGlyph = () => h('span.inline-ico', { 'aria-label': L('tombol Bagikan', 'Share button') }, iconEl('send'));

export function openInstallHelp(mode = installMode()) {
  const url = appUrl();
  let body;
  if (mode === 'ios') {
    body = steps([
      [L('Ketuk ', 'Tap '), shareGlyph(), L(' Bagikan di bagian bawah Safari.', ' Share at the bottom of Safari.')],
      L('Gulir ke bawah, pilih Tambah ke Layar Utama.', 'Scroll down and choose Add to Home Screen.'),
      L('Ketuk Tambah, lalu buka tahu gak? dari layar utama.', 'Tap Add, then open tahu gak? from your home screen.'),
    ]);
  } else if (mode === 'ios-other' || mode === 'inapp') {
    body = h('div',
      h('p', mode === 'inapp'
        ? L('Aplikasi ini sedang terbuka di dalam aplikasi lain, jadi belum bisa dipasang.', 'This page is open inside another app, so it can\'t be installed here.')
        : L('Di iPhone, pemasangan paling lancar lewat Safari.', 'On iPhone, installing works best from Safari.')),
      steps([
        mode === 'inapp'
          ? L('Ketuk menu di pojok kanan atas, lalu pilih Buka di browser (Chrome atau Safari).', 'Tap the menu in the top corner and choose Open in browser (Chrome or Safari).')
          : L('Buka link ini di Safari.', 'Open this link in Safari.'),
        L('Setelah terbuka, ketuk Pasang di Beranda.', 'Once it opens, tap Install on Home.'),
      ]),
      h('p.small.muted.install-url', url));
  } else {
    body = steps([
      L('Buka link ini di Chrome.', 'Open this link in Chrome.'),
      L('Ketuk menu tiga titik di pojok kanan atas.', 'Tap the three-dot menu in the top corner.'),
      L('Pilih Instal aplikasi atau Tambahkan ke layar utama.', 'Choose Install app or Add to Home screen.'),
    ]);
  }
  modal({ title: L('Pasang tahu gak? di HP', 'Install tahu gak? on your phone'), icon: ICON.download(), body,
    actions: [{ label: L('Mengerti', 'Got it') }] });
}

/** Banner di Beranda. Null kalau sudah terpasang atau disembunyikan. */
export function installBanner(s, ctx) {
  const mode = installMode();
  if (mode === 'installed' || s.settings.installHidden) return null;
  const later = button(L('Nanti', 'Later'), { size: 'sm', variant: 'ghost', onClick: () => ctx.update((st) => { st.settings.installHidden = true; }) });
  if (isAndroid() && mode !== 'inapp') {
    const apk = h('a.btn.btn-primary.btn-sm', { href: apkUrl(), download: 'tahu-gak.apk', onclick: () => {
      toast(L('Setelah selesai diunduh, buka file-nya lalu ketuk Instal. Kalau diminta, izinkan pemasangan dari Chrome.', 'Once it has downloaded, open the file and tap Install. If asked, allow installs from Chrome.'), { duration: 7000 });
    } }, h('span.btn-icon', { 'aria-hidden': 'true' }, iconEl('download')), h('span', L('Unduh APK', 'Download APK')));
    return h('div.banner.banner-install', art(ICON.download()),
      h('p', L('Pasang aplikasi tahu gak? di HP Android-mu biar bisa dibuka dari layar utama dan dapat notifikasi streak.', 'Install the tahu gak? app on your Android phone to open it from your home screen and get streak notifications.')),
      h('div.row-gap', later, apk));
  }
  const act = mode === 'prompt'
    ? button(L('Pasang', 'Install'), { size: 'sm', onClick: async () => {
      const r = await promptInstall();
      if (r === 'accepted') toast(L('tahu gak? sedang dipasang di HP-mu.', 'tahu gak? is being installed on your phone.'), { tone: 'ok' });
      else if (r === 'unavailable') openInstallHelp('manual');
      ctx.rerender();
    } })
    : button(L('Caranya', 'How'), { size: 'sm', onClick: () => openInstallHelp(mode) });
  return h('div.banner.banner-install', art(ICON.download()),
    h('p', L('Pasang tahu gak? di HP biar bisa dibuka dari layar utama dan dapat notifikasi streak.', 'Install tahu gak? to open it from your home screen and get streak notifications.')),
    h('div.row-gap', later, act));
}

function inviteText(s) {
  const name = (s.profile.name || '').trim();
  const handle = s.profile.username ? `@${s.profile.username}` : name;
  const base = L('Main kuis tahu gak? bareng aku. Tiap hari 5 soal, kita adu streak dan XP di Leaderboard.', 'Play the tahu gak? quiz with me. 5 questions a day, and we compete on streaks and XP on the Leaderboard.');
  return handle ? `${base} ${L(`Tambahkan aku di Teman: ${handle}`, `Add me under Friends: ${handle}`)}` : base;
}

export async function shareInvite(s) {
  const url = appUrl();
  const text = `${inviteText(s)} ${L(`Pengguna Android bisa langsung pasang APK-nya: ${apkUrl()}`, `Android users can install the APK: ${apkUrl()}`)}`;
  if (navigator.share) {
    try { await navigator.share({ title: 'tahu gak?', text, url }); return; } catch (e) { if (e?.name === 'AbortError') return; }
  }
  const wa = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
  modal({ title: L('Ajak teman', 'Invite friends'), icon: ICON.send(),
    body: h('div', h('p', L('Kirim link ini ke temanmu:', 'Send this link to your friends:')), h('p.install-url', url),
      h('p.small.muted', L('APK untuk Android:', 'APK for Android:')), h('p.install-url', apkUrl())),
    actions: [
      { label: L('Tutup', 'Close'), variant: 'ghost' },
      { label: L('Kirim lewat WhatsApp', 'Send on WhatsApp'), onClick: () => window.open(wa, '_blank', 'noopener') },
    ] });
}

export function inviteButton(s, { variant = 'ghost', size = 'sm', label = L('Ajak teman', 'Invite friends') } = {}) {
  return button(label, { variant, size, icon: iconEl('send'), onClick: () => shareInvite(s) });
}
