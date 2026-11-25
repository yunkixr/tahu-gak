// Kalender streak bulanan (dipakai di halaman Streak & Profil).
import { h } from './dom.js';
import { button } from './components.js';
import { ICON } from './art.js';
import { todayKey, parseKey, MONTHS, DAYS_SHORT, formatKey, weekday } from '../core/dates.js';
import { dayStatus, streakChain } from '../core/streak.js';
import { L } from '../core/i18n.js';

let calMonth = null; // { y, m }

export function calendar(s, ctx) {
  const today = todayKey();
  const t = parseKey(today);
  if (!calMonth) calMonth = { y: t.y, m: t.m };
  const { y, m } = calMonth;
  const first = `${y}-${String(m).padStart(2, '0')}-01`;
  const daysInMonth = new Date(y, m, 0).getDate();
  const offset = weekday(first);
  const chain = streakChain(s, today);

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(h('span.cal-cell.blank'));
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const st = dayStatus(s, key, today);
    const inChain = chain.has(key);
    const prevInChain = chain.has(addDay(key, -1)) && weekday(key) !== 0;
    const nextInChain = chain.has(addDay(key, 1)) && weekday(key) !== 6;
    const labels = { done: L('selesai', 'done'), 'today-done': L('hari ini, selesai', 'today, done'), protected: L('dilindungi freeze', 'protected by a freeze'), missed: L('terlewat', 'missed'), today: L('hari ini', 'today'), future: '', idle: '' };
    cells.push(h(`span.cal-cell.st-${st}${inChain ? '.chain' : ''}${prevInChain ? '.join-l' : ''}${nextInChain ? '.join-r' : ''}`,
      { title: `${formatKey(key)}${labels[st] ? ': ' + labels[st] : ''}` },
      h('span.cal-day', d),
      st === 'protected' ? h('span.cal-mark', { html: ICON.bow(), title: L('Dilindungi Streak Freeze', 'Protected by a Streak Freeze') }) : null));
  }

  const canNext = y < t.y || (y === t.y && m < t.m);
  const go = (delta) => {
    let nm = m + delta, ny = y;
    if (nm < 1) { nm = 12; ny--; } if (nm > 12) { nm = 1; ny++; }
    calMonth = { y: ny, m: nm };
    ctx.rerender();
  };
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => `${y}-${String(m).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`);
  const doneCount = monthDays.filter((k) => s.activity[k]?.counted).length;

  return h('div.calendar',
    h('div.cal-nav',
      button('‹', { variant: 'ghost', size: 'sm', title: L('Bulan sebelumnya', 'Previous month'), onClick: () => go(-1) }),
      h('strong', `${MONTHS[m - 1]} ${y}`),
      button('›', { variant: 'ghost', size: 'sm', title: L('Bulan berikutnya', 'Next month'), disabled: !canNext, onClick: () => go(1) })),
    h('div.cal-grid', DAYS_SHORT.map((d) => h('span.cal-head', d)), cells),
    h('div.cal-legend',
      h('span', h('i.lg.done'), L('Selesai', 'Done')), h('span', h('i.lg.protected'), L('Dilindungi freeze', 'Freeze-protected')),
      h('span', h('i.lg.missed'), L('Terlewat', 'Missed')), h('span', h('i.lg.today'), L('Hari ini', 'Today'))),
    h('p.small.muted', L(`${doneCount} hari aktif di bulan ini. Hari berturut-turut terhubung sebagai satu streak.`, `${doneCount} active days this month. Consecutive days join up as one streak.`)));
}

function addDay(key, n) {
  const { y, m, d } = parseKey(key);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
}

