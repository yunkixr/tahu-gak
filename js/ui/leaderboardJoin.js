// Ikut / keluar Leaderboard. Syaratnya akun claude.ai; negaranya dipilih pemain sendiri.

import { h } from './dom.js';
import { confirmModal, openCountryModal, toast } from './components.js';
import { hasAccount, IS_APP_BUILD, appOfflineText } from '../core/cloud.js';
import { flag, countryName, suggestCountry } from '../data/countries.js';
import { L } from '../core/i18n.js';

export const SIGNIN_URL = 'https://claude.ai/login';

/** Tautan masuk/daftar akun claude.ai (dibuka di tab baru). */
export function signInLink(cls = 'a.btn.btn-ghost') {
  if (IS_APP_BUILD) return null; // versi aplikasi: tidak ada akun
  return h(cls, { href: SIGNIN_URL, target: '_blank', rel: 'noopener noreferrer' }, L('Masuk atau daftar di claude.ai', 'Sign in or sign up at claude.ai'));
}

/** Pilih negara lalu ikut Leaderboard. Tanpa akun hanya memberi tahu caranya. */
export function openJoin(ctx) {
  if (!hasAccount()) {
    toast(IS_APP_BUILD ? appOfflineText() : L('Leaderboard butuh akun. Buka tahu gak? lewat claude.ai dan masuk dulu.', 'The Leaderboard needs an account. Open tahu gak? through claude.ai and sign in first.'), { icon: '🔒', duration: 4500 });
    return;
  }
  const s = ctx.getState();
  openCountryModal({
    title: L('Ikut Leaderboard', 'Join the Leaderboard'),
    text: L('Pilih negaramu. Kamu bersaing di leaderboard mingguan, peringkat negaramu, dan peringkat global. Pemain lain hanya melihat nama, avatar, negara, dan XP-mu.', 'Choose your country. You\'ll compete on the weekly leaderboard, your country\'s rankings, and the global rankings. Other players only see your name, avatar, country, and XP.'),
    value: s.profile.country || suggestCountry(),
    confirmLabel: L('Ikut Leaderboard', 'Join'),
    onPick: (c) => {
      ctx.update((st) => { st.profile.country = c; st.profile.leaderboard = true; });
      toast(L(`Kamu ikut Leaderboard sebagai ${countryName(c)}!`, `You're on the Leaderboard for ${countryName(c)}!`), { icon: '🏆', tone: 'ok' });
    },
  });
}

export function openChangeCountry(ctx) {
  const s = ctx.getState();
  openCountryModal({
    title: L('Ganti negara', 'Change country'),
    text: L('Peringkat nasionalmu ikut pindah ke negara baru. XP-mu tetap.', 'Your national ranking moves to the new country. Your XP stays the same.'),
    value: s.profile.country,
    onPick: (c) => {
      ctx.update((st) => { st.profile.country = c; });
      toast(L(`Negara diganti ke ${countryName(c)}.`, `Country changed to ${countryName(c)}.`), { icon: '🌍', tone: 'ok' });
    },
  });
}

export async function leave(ctx) {
  if (await confirmModal(L('Keluar dari Leaderboard?', 'Leave the Leaderboard?'),
    L('Kamu tidak akan muncul di Leaderboard lagi. Progres, XP, dan teman tetap aman, dan kamu bisa ikut lagi kapan saja.', 'You won\'t appear on the Leaderboard anymore. Your progress, XP, and friends stay safe, and you can rejoin anytime.'),
    { confirmLabel: L('Keluar', 'Leave'), danger: true })) {
    ctx.update((st) => { st.profile.leaderboard = false; });
    toast(L('Kamu keluar dari Leaderboard.', 'You left the Leaderboard.'), { icon: '👋' });
  }
}
