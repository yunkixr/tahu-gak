// Halaman Streak (#streak): streak berjalan, terpanjang, persediaan freeze, dan kalender bulanan.

import { h, fmt } from '../dom.js';
import { button, card, sectionTitle } from '../components.js';
import { calendar } from '../calendar.js';
import { ICON, art, rose, bow, iconEl } from '../art.js';
import { playedToday } from '../../core/streak.js';
import { formatDuration, msUntilMidnight } from '../../core/dates.js';
import { ITEM_BY_ID } from '../../core/shop.js';
import { L } from '../../core/i18n.js';

export function renderStreak(s, ctx) {
  const done = playedToday(s);
  const month = Object.values(s.activity).filter((a) => a.counted).length;
  const freezeMax = ITEM_BY_ID.freeze.max;

  const hero = h('section.streak-hero.frame',
    art(ICON.flame(), `sh-flame${s.streak.current ? '' : '.dim'}`),
    h('div',
      h('span.script', done ? L('Hore, hari ini aman!', 'Yay, today is safe!') : s.streak.current ? L('Jangan putus, ya', 'Keep it going') : L('Mulai hari ini', 'Start today')),
      h('div', h('span.big', fmt(s.streak.current)), h('span.muted', L(' hari berturut-turut', s.streak.current === 1 ? ' day in a row' : ' days in a row'))),
      h('p.small.muted', done ? L('Kamu sudah bermain hari ini. Sampai besok!', 'You\'ve played today. See you tomorrow!') : L(`Main satu kuis apa saja dalam ${formatDuration(msUntilMidnight())} ke depan untuk menjaga streak.`, `Play any quiz in the next ${formatDuration(msUntilMidnight())} to keep your streak.`))),
    done ? null : button(L('Main sekarang', 'Play now'), { variant: 'sun', onClick: ctx.playDaily }));

  const facts = h('div.streak-facts',
    h('div.streak-fact.card', iconEl('crown'), h('div', h('strong', fmt(s.streak.longest)), h('span.small.muted', L('Streak terpanjang', 'Longest streak')))),
    h('div.streak-fact.card', iconEl('bow'), h('div', h('strong', `${s.inventory.freeze}/${freezeMax}`), h('span.small.muted', L('Streak Freeze dimiliki', 'Streak Freezes owned')))),
    h('div.streak-fact.card', iconEl('rose'), h('div', h('strong', fmt(month)), h('span.small.muted', L('Total hari aktif', 'Total active days')))));

  const freezeNote = card('freeze-card',
    h('div.freeze-row',
      art(bow(), 'freeze-art'),
      h('div.grow',
        h('h3', 'Streak Freeze'),
        h('p.small', L('Melindungi streak saat kamu melewatkan hari. Dipakai otomatis, tapi hanya kalau jumlahnya cukup untuk menutup semua hari yang terlewat, supaya tidak terbuang.', 'Protects your streak when you miss a day. Used automatically, but only when you have enough to cover every missed day, so none go to waste.')),
        h('p.small.muted', s.inventory.freeze ? L(`Kamu punya ${s.inventory.freeze}. Hari yang dilindungi ditandai pita di kalender.`, `You have ${s.inventory.freeze}. Protected days get a ribbon on the calendar.`) : L('Kamu belum punya. Beli di Toko dengan XP.', 'You don\'t have any yet. Buy one in the Shop with XP.'))),
      s.inventory.freeze < freezeMax ? button(L('Ke Toko', 'Go to Shop'), { variant: 'ghost', size: 'sm', onClick: () => ctx.navigate('shop') }) : null));

  return h('div.screen.streak-page',
    h('header.page-head', h('div', h('span.script', L('Kalender kecilmu', 'Your little calendar')), h('h1.display', 'Streak'), h('p.muted', L('Setiap hari kamu menyelesaikan minimal satu kuis, rangkaian bunga di kalender bertambah.', 'Each day you finish at least one quiz, the flower chain on your calendar grows.')))),
    hero, facts,
    card('', sectionTitle(L('Kalender bulanan', 'Monthly calendar')), calendar(s, ctx)),
    freezeNote,
    art(rose(), 'page-flourish'));
}
