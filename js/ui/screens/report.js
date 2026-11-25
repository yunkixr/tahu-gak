// Rapor belajar: ringkasan, per kategori (dengan saran latihan), XP 8 minggu, 7 hari terakhir.

import { art, ICON, catArt } from '../art.js';
import { h, fmt } from '../dom.js';
import { button, card, chip, progressBar, sectionTitle } from '../components.js';
import { reportData } from '../../core/report.js';
import { CATEGORY_BY_ID } from '../../data/categories.js';
import { formatKey, DAYS_SHORT, weekday } from '../../core/dates.js';
import { L } from '../../core/i18n.js';

const pct = (x) => (x == null ? '–' : `${Math.round(x * 100)}%`);

export function renderReport(s, ctx) {
  const r = reportData(s);
  const t = r.totals;

  const tile = (icon, value, label) => h('div.stat', h('span.stat-icon', { html: ICON[icon]() }), h('strong', value), h('span.small.muted', label));
  const summary = h('div.stat-grid.report-grid',
    tile('book', fmt(t.questions), L('Soal dijawab', 'Questions answered')),
    tile('check', pct(t.accuracy), L('Akurasi', 'Accuracy')),
    tile('flame', fmt(t.longestStreak), L('Streak terpanjang', 'Longest streak')),
    tile('star', fmt(t.memorized), L('Soal hafal', 'Memorized')),
    tile('bolt', fmt(t.kilatBest), L('Rekor Kilat', 'Lightning best')),
    tile('crown', t.duelsPlayed ? `${t.duels.won}/${t.duelsPlayed}` : '0', L('Duel dimenangkan', 'Duels won')),
    tile('bow', fmt(t.missionsDone), L('Misi selesai', 'Missions done')),
    tile('heart', fmt(t.daysPlayed), L('Hari bermain', 'Days played')));

  // ── Saran: kategori terlemah (atau yang belum dicoba)
  let advice;
  if (!t.questions) {
    advice = h('p.muted', L('Rapormu terisi setelah kamu mulai menjawab soal. Coba tantangan harian dulu!', 'Your report fills in once you start answering. Try the daily challenge first!'));
  } else if (r.weakest) {
    advice = h('div.report-advice',
      h('span.ra-icon', catArt(r.weakest.id)),
      h('div.grow',
        h('strong', L(`Paling perlu dilatih: ${r.weakest.name}`, `Needs the most practice: ${r.weakest.name}`)),
        h('p.small.muted', L(`Akurasimu ${pct(r.weakest.acc)} dari ${r.weakest.answered} soal.`, `You're at ${pct(r.weakest.acc)} over ${r.weakest.answered} questions.`),
          r.strongest ? L(` Terkuat: ${r.strongest.name} (${pct(r.strongest.acc)}).`, ` Strongest: ${r.strongest.name} (${pct(r.strongest.acc)}).`) : '')),
      button(L(`Latih ${r.weakest.name}`, `Practice ${r.weakest.name}`), { size: 'sm', onClick: () => ctx.playPractice(r.weakest.id) }));
  } else {
    advice = h('p.small.muted', L('Jawab minimal 5 soal di dua kategori atau lebih supaya rapor bisa menunjukkan kategori terkuat dan terlemah.', 'Answer at least 5 questions in two or more categories so the report can show your strongest and weakest.'));
  }
  const untried = r.untried.length && t.questions ? h('p.small.muted.report-untried', L('Belum dicoba: ', 'Not tried yet: '), r.untried.map((c, i) => [i ? ', ' : '', h('a', { href: '#practice' }, c.name)])) : null;

  // ── Per kategori
  const sorted = [...r.cats].sort((a, b) => (b.acc ?? -1) - (a.acc ?? -1) || b.answered - a.answered);
  const catList = h('ul.report-cats', sorted.map((c) => h(`li${r.weakest?.id === c.id ? '.weak' : ''}`, { style: { '--cat': CATEGORY_BY_ID[c.id].color } },
    h('span.rc-icon', catArt(c.id)),
    h('span.rc-name', c.name, r.weakest?.id === c.id ? chip(L('perlu latihan', 'needs work'), { tone: 'red' }) : r.strongest?.id === c.id ? chip(L('terkuat', 'strongest'), { tone: 'mint' }) : null),
    progressBar(c.acc ?? 0, { tone: 'cat', label: L(`Akurasi ${c.name}`, `${c.name} accuracy`) }),
    h('span.rc-pct', pct(c.acc)),
    h('span.rc-n.small.muted', L(`${c.answered} soal`, `${c.answered} answered`)),
    button(L('Latih', 'Practice'), { variant: 'ghost', size: 'xs', onClick: () => ctx.playPractice(c.id) }))));

  // ── XP 8 minggu
  const maxW = Math.max(50, ...r.weeks.map((w) => w.xp));
  const weeks = h('div.report-bars', { role: 'img', 'aria-label': L('XP per minggu, 8 minggu terakhir', 'XP per week, last 8 weeks') },
    r.weeks.map((w) => h(`div.rb${w.current ? '.now' : ''}`, { title: L(`Minggu ${formatKey(w.start, { withYear: false })}: ${fmt(w.xp)} XP`, `Week of ${formatKey(w.start, { withYear: false })}: ${fmt(w.xp)} XP`) },
      h('span.rb-val', w.xp ? fmt(w.xp) : ''),
      h('span.rb-bar', { style: { '--h': w.xp / maxW } }),
      h('span.rb-lbl', w.current ? L('ini', 'now') : `${Number(w.start.slice(8))}/${Number(w.start.slice(5, 7))}`))));

  // ── 7 hari terakhir
  const days = h('ol.report-days', r.days.map((d) => h(`li${d.played ? '.played' : ''}`,
    h('span.rd-day', DAYS_SHORT[weekday(d.day)]),
    h('span.rd-dot', { 'aria-hidden': 'true' }),
    h('strong', d.xp ? `${fmt(d.xp)} XP` : '–'),
    h('span.small.muted', d.acc == null ? '' : L(`${pct(d.acc)} benar`, `${pct(d.acc)} right`)))));

  return h('div.screen.report',
    h('header.page-head', h('div',
      h('span.script', L('Rapor belajar', 'Learning report')),
      h('h1.display', L('Rapor', 'Report')),
      h('p.muted', L('Ringkasan belajarmu: di mana kamu kuat, dan apa yang perlu dilatih.', 'A summary of your learning: where you\'re strong, and what to practice.')))),
    summary,
    card('report-card', sectionTitle(L('Saran latihan', 'Practice tip')), advice, untried),
    card('report-card', sectionTitle(L('Akurasi per kategori', 'Accuracy by category')), catList),
    h('div.two-col',
      card('report-card', sectionTitle(L('XP 8 minggu terakhir', 'XP, last 8 weeks')), weeks),
      card('report-card', sectionTitle(L('7 hari terakhir', 'Last 7 days')), days)),
    h('p.small.muted.report-foot', h('a', { href: '#profile' }, L('Kembali ke Profil', 'Back to Profile'))));
}
