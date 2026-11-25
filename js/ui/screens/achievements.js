// Koleksi pencapaian (#pencapaian): perangko vintage, terkunci & terbuka, progres, hadiah XP.

import { h, fmt } from '../dom.js';
import { progressBar, badge } from '../components.js';
import { ACHIEVEMENTS } from '../../core/achievements.js';
import { formatKey } from '../../core/dates.js';
import { art, letter } from '../art.js';
import { L } from '../../core/i18n.js';
import { MILESTONES, reachedMilestones, milestoneTitle } from '../../core/milestones.js';
import { openStory } from '../shareUi.js';
import { button } from '../components.js';
import { ICON, iconEl } from '../art.js';

const TILTS = [-2, 1.6, -1, 2.2, -1.6, 1, -2.4, 1.2];

export function renderAchievements(s, ctx) {
  const done = ACHIEVEMENTS.filter((a) => s.achievements[a.id]);
  const xpEarned = done.reduce((sum, a) => sum + a.xp, 0);
  const xpLeft = ACHIEVEMENTS.reduce((sum, a) => sum + a.xp, 0) - xpEarned;

  // Yang sudah terbuka dulu (terbaru di depan), lalu yang paling dekat selesai.
  const ordered = [...ACHIEVEMENTS].sort((a, b) => {
    const da = s.achievements[a.id], db = s.achievements[b.id];
    if (da && db) return db.localeCompare(da);
    if (da || db) return da ? -1 : 1;
    const [ca, ta] = a.progress(s), [cb, tb] = b.progress(s);
    return cb / tb - ca / ta;
  });

  const cards = ordered.map((a, i) => {
    const open = !!s.achievements[a.id];
    const [cur, target] = a.progress(s);
    return h(`article.stamp-card.card${open ? '.done' : ''}`, { style: { '--tilt': `${TILTS[i % TILTS.length]}deg` } },
      badge(a, open),
      h('strong', a.name),
      h('p.small', a.desc),
      open ? h('p.small.ach-date', L(`Terkumpul ${formatKey(s.achievements[a.id].slice(0, 10))}`, `Collected ${formatKey(s.achievements[a.id].slice(0, 10))}`))
        : h('div.stamp-progress', progressBar(Math.min(1, cur / target), { label: a.name }), h('p.small.muted', L(`${fmt(Math.min(cur, target))}/${fmt(target)}. Hadiah +${a.xp} XP`, `${fmt(Math.min(cur, target))}/${fmt(target)}. Reward +${a.xp} XP`))));
  });

  return h('div.screen.ach-page',
    h('header.page-head', h('div', h('span.script', L('Album perangko', 'Stamp album')), h('h1.display', L('Koleksi pencapaian', 'Achievement collection')), h('p.muted', L('Setiap pencapaian adalah perangko untuk album jurnalmu. Hadiah XP langsung masuk saat perangko terkumpul.', 'Every achievement is a stamp for your journal. The XP reward lands as soon as you collect it.')))),
    h('section.ach-summary.frame',
      art(letter(), 'summary-art'),
      h('div.grow', h('span.big', `${done.length}/${ACHIEVEMENTS.length}`), h('p', L('perangko terkumpul', 'stamps collected'))),
      h('div', h('strong', `+${fmt(xpEarned)} XP`), h('p.small.muted', L(`${fmt(xpLeft)} XP lagi menunggu`, `${fmt(xpLeft)} XP still waiting`)))),
    milestoneSection(s),
    h('div.stamp-grid', cards));
}

/** Kartu Story milestone: yang sudah tercapai bisa dibagikan ulang kapan saja. */
function milestoneSection(s) {
  const got = reachedMilestones(s);
  const next = (type) => MILESTONES.find((m) => m.type === type && !s.milestones?.[m.id]);
  const nq = next('questions'), ns = next('streak');
  const goals = [
    nq ? L(`${fmt(nq.value)} soal (sekarang ${fmt(s.stats.questions)})`, `${fmt(nq.value)} questions (now ${fmt(s.stats.questions)})`) : null,
    ns ? L(`streak ${ns.value} hari (sekarang ${s.streak.current})`, `a ${ns.value}-day streak (now ${s.streak.current})`) : null,
  ].filter(Boolean);
  return h('section.card.milestone-card',
    h('div.section-title', h('h2', L('Kartu Story', 'Story cards'))),
    h('p.small.muted', L('Tiap tembus jumlah soal atau streak tertentu, kamu dapat kartu spesial buat dipamerin di Story.', 'Each time you hit a question count or streak milestone, you get a special card to post on your Story.')),
    got.length ? h('ul.ms-list', got.map((m) => h('li.ms-item',
      h('span.ms-icon', { html: (m.type === 'streak' ? ICON.flame : ICON.book)(), 'aria-hidden': 'true' }),
      h('div.grow', h('strong', milestoneTitle(m)), h('p.small.muted', L(`Tercapai ${formatKey(m.day)}`, `Reached ${formatKey(m.day)}`))),
      button(L('Bagikan', 'Share'), { variant: 'ghost', size: 'sm', icon: iconEl('camera'), onClick: () => openStory({ kind: 'milestone', type: m.type, value: m.value, name: s.profile.name, avatarCfg: s.profile.avatarCfg }, { title: milestoneTitle(m) }) }))))
      : null,
    goals.length ? h('p.small.ms-next', L(`Kartu berikutnya: ${goals.join(' atau ')}.`, `Next card: ${goals.join(' or ')}.`)) : null);
}
