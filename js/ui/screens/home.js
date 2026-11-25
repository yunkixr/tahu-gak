import { h, fmt } from '../dom.js';
import { button, card, chip, progressBar, toast } from '../components.js';
import { hasAccount, isRanked, IS_APP_BUILD } from '../../core/cloud.js';
import { openJoin, signInLink } from '../leaderboardJoin.js';
import { flag, countryName } from '../../data/countries.js';
import { dailyStatus, buildDaily, reviewPool } from '../../core/quiz.js';
import { QUESTION_BY_ID } from '../../data/questions.js';
import { CATEGORY_BY_ID } from '../../data/categories.js';
import { levelInfo } from '../../core/xp.js';
import { todayKey, weekKeyOf, weekDays, DAYS_SHORT, formatKey, formatDuration, msUntilMidnight } from '../../core/dates.js';
import { dayStatus } from '../../core/streak.js';
import { reminderDue, notificationSupport } from '../../core/reminders.js';
import { standings, TIERS } from '../../core/league.js';
import { pathStatus } from '../../core/path.js';
import { ACHIEVEMENTS } from '../../core/achievements.js';
import { badge } from '../components.js';
import { ICON, art, iconEl, catArt, storefront, letter, rankArt, floralCorner, sparkle, star } from '../art.js';
import { L } from '../../core/i18n.js';
import { funFact } from '../../core/funfact.js';
import { missionsFor, missionText, MISSION_XP, MISSION_BONUS_XP } from '../../core/missions.js';
import { freshPool } from '../../core/quiz.js';
import { storyButton } from '../shareUi.js';
import { dailySpec } from '../storyCard.js';
import { sectionTitle } from '../components.js';

export function renderHome(s, ctx) {
  const today = todayKey();
  const ds = dailyStatus(s, today);
  const lv = levelInfo(s.xp.total);
  const mistakes = reviewPool(s).length;
  const cats = buildDaily(today, s).items.map((it) => CATEGORY_BY_ID[QUESTION_BY_ID[it.qid].category]);
  const hour = new Date().getHours();
  const greet = hour < 11 ? L('Selamat pagi', 'Good morning') : hour < 15 ? L('Selamat siang', 'Good afternoon') : hour < 18 ? L('Selamat sore', 'Good afternoon') : L('Selamat malam', 'Good evening');

  // ── Hero: tantangan harian
  let heroText, heroAction, heroSub;
  if (ds.status === 'done') {
    heroText = ds.perfect ? L('Lima dari lima. Otakmu lagi panas!', 'Five out of five. Your brain is on fire!') : L(`Hari ini kamu jawab ${ds.score} dari ${ds.total} dengan benar. Soal yang salah sudah menunggu di Ulas.`, `You got ${ds.score} of ${ds.total} right today. The ones you missed are waiting in Review.`);
    heroSub = L(`Soal baru dalam ${formatDuration(msUntilMidnight())}.`, `New questions in ${formatDuration(msUntilMidnight())}.`);
    heroAction = button(L('Latihan lagi', 'Practice more'), { variant: 'ghost', size: 'lg', onClick: () => ctx.navigate('practice') });
  } else if (ds.status === 'in-progress') {
    heroText = L(`Kamu sudah menjawab ${ds.answered} dari 5 soal. Tinggal sedikit lagi!`, `You've answered ${ds.answered} of 5. Almost there!`);
    heroSub = L('Progres tersimpan otomatis.', 'Progress saves automatically.');
    heroAction = button(L('Lanjutkan tantangan', 'Continue challenge'), { variant: 'sun', size: 'lg', onClick: ctx.playDaily });
  } else {
    heroText = L('Lima soal baru dari lima kategori. Sama untuk semua pemain hari ini.', 'Five new questions from five categories. The same for every player today.');
    heroSub = s.streak.current > 0 ? L(`Mainkan untuk menjaga streak ${s.streak.current} harimu.`, `Play to keep your ${s.streak.current}-day streak.`) : L('Selesaikan untuk memulai streak.', 'Finish it to start a streak.');
    heroAction = button(L('Mulai tantangan hari ini', 'Start today\'s challenge'), { variant: 'sun', size: 'lg', onClick: ctx.playDaily });
  }

  const hero = h('section.hero.frame',
    art(floralCorner(), 'corner-orn.tl'),
    h('div.hero-bubble',
      h('p.hero-kicker', L(`Halo, ${s.profile.name || 'teman'}!`, `Hi, ${s.profile.name || 'friend'}!`)),
      h('h1.display', ds.status === 'done' ? (ds.perfect ? L('Sempurna hari ini.', 'Perfect today.') : L('Tantangan hari ini selesai.', 'Today\'s challenge is done.')) : L('Sedikit pengetahuan setiap hari', 'A little knowledge every day')),
      h('p.hero-text', ds.status === 'done' ? heroText : L('membentuk pikiran yang cemerlang.', 'shapes a brilliant mind.')),
      h('div.hero-foot', heroAction, h('p.hero-sub', heroSub))),
    h('div.hero-art', art(storefront())));

  const dailyCard = card('daily-card',
    art(letter(), 'dc-art'),
    h('div',
      h('h2', ds.status === 'done' ? L(`Skor hari ini ${ds.score}/${ds.total}`, `Today's score ${ds.score}/${ds.total}`) : L('Tantangan harian', 'Daily challenge')),
      h('p.small.muted', ds.status === 'done' ? heroText : heroText),
      h('div.hero-cats', { 'aria-label': L('Kategori hari ini', 'Today\'s categories') }, cats.map((c) => h('span.hero-cat', { title: c.name }, catArt(c.id))))),
    ds.status === 'done'
      ? h('div.dc-done', chip(L('Selesai', 'Done'), { tone: 'mint' }), storyButton(() => dailySpec(ctx.getState(), today), { ctx, mission: true }))
      : h('div.dc-todo',
        chip(ds.status === 'in-progress' ? L(`${ds.answered}/5 dijawab`, `${ds.answered}/5 answered`) : L('5 soal, +25 XP', '5 questions, +25 XP'), { tone: 'cobalt' }),
        button(ds.status === 'in-progress' ? L('Lanjutkan', 'Continue') : L('Mulai', 'Start'), { variant: 'sun', size: 'sm', onClick: ctx.playDaily }),
        h('p.small.muted.dc-share-hint', L('Selesai main, kamu bisa bikin kartu Story dari hasilmu di sini.', 'When you finish, you can turn your result into a Story card right here.'))));

  // ── Banner pengingat / streak hilang / freeze
  const banners = [];
  if (s.streak.lost && !s.streak.lost.seen && s.streak.current === 0) {
    banners.push(h('div.banner.banner-red', art(ICON.heart()), h('p', L(`Streak ${s.streak.lost.amount} harimu terputus. Main hari ini untuk mulai lagi. Streak Freeze di Toko bisa melindunginya lain kali.`, `Your ${s.streak.lost.amount}-day streak ended. Play today to start again. A Streak Freeze from the Shop can protect it next time.`))));
  }
  if ((!IS_APP_BUILD || hasAccount()) && !isRanked(s) && !s.settings.lbBannerHidden) {
    const later = button(L('Nanti', 'Later'), { size: 'sm', variant: 'ghost', onClick: () => ctx.update((st) => { st.settings.lbBannerHidden = true; }) });
    banners.push(hasAccount()
      ? h('div.banner.banner-sun', art(ICON.crown()), h('p', L('Pilih negaramu dan ikut Leaderboard.', 'Choose your country and join the Leaderboard.')),
        h('div.row-gap', later, button(L('Ikut Leaderboard', 'Join'), { size: 'sm', onClick: () => openJoin(ctx) })))
      : h('div.banner.banner-sun', art(ICON.crown()), h('p', L('Kamu main tanpa akun, jadi tidak masuk Leaderboard dan progres hanya tersimpan di browser ini.', 'You\'re playing without an account, so you\'re not on the Leaderboard and progress is saved in this browser only.')),
        h('div.row-gap', later, signInLink('a.btn.btn-primary.btn-sm'))));
  }
  const fresh = freshPool(s, today);
  if (fresh.length) {
    const cats = [...new Set(fresh.map((q) => q.category))].map((c) => CATEGORY_BY_ID[c].name);
    banners.push(h('div.banner.banner-fresh', art(ICON.sparkle()),
      h('p', L(`${fresh.length} soal baru minggu ini belum kamu coba`, `${fresh.length} new questions this week you haven't tried`), h('span.small.muted.block', cats.slice(0, 4).join(', ') + (cats.length > 4 ? L(`, +${cats.length - 4} lagi`, `, +${cats.length - 4} more`) : ''))),
      button(L('Coba soal baru', 'Try them'), { size: 'sm', onClick: () => ctx.playFresh() })));
  }
  if (reminderDue(s) && ds.status !== 'done') {
    const perm = notificationSupport();
    banners.push(h('div.banner.banner-sun', art(ICON.lamp()), h('p', s.streak.current > 0 ? L(`Streak ${s.streak.current} harimu menunggu! Selesaikan tantangan hari ini sebelum tengah malam.`, `Your ${s.streak.current}-day streak is waiting! Finish today's challenge before midnight.`) : L('Sudah waktunya main. Tantangan hari ini menunggumu!', 'Time to play. Today\'s challenge is waiting!'),
      perm !== 'granted' ? h('span.small.muted.block', L('Pengingat tampil di sini karena notifikasi browser tidak aktif.', 'This reminder shows here because browser notifications are off.')) : null)));
  }

  // ── Streak
  const wk = weekKeyOf(today);
  const week = weekDays(wk).map((d, i) => {
    const st = dayStatus(s, d, today);
    return h(`div.wday.st-${st}`, h('span.wday-label', DAYS_SHORT[i]), h('span.wday-dot', { title: formatKey(d) },
      st === 'done' || st === 'today-done' ? art(star()) : st === 'protected' ? art(ICON.bow()) : st === 'missed' ? '·' : ''));
  });
  const streakCard = card('streak-card',
    h('div.streak-main',
      h('span.flame', { class: s.streak.current ? 'lit' : '', 'aria-hidden': 'true' }, art(ICON.flame())),
      h('div', h('div.streak-num', fmt(s.streak.current)), h('div.muted', L('hari streak', s.streak.current === 1 ? 'day streak' : 'day streak')))),
    h('div.streak-side',
      h('p.small', L('Terpanjang: ', 'Longest: '), h('strong', L(`${fmt(s.streak.longest)} hari`, `${fmt(s.streak.longest)} ${s.streak.longest === 1 ? 'day' : 'days'}`))),
      h('p.small', 'Streak Freeze: ', h('strong', s.inventory.freeze)),
      h('a.card-link.static.small', { href: '#streak' }, L('Buka kalender', 'Open calendar'))),
    h('div.week-strip', week));

  // ── Level
  const levelCard = card('level-card',
    h('div.level-top',
      h('div.level-badge', { 'aria-hidden': 'true' }, rankArt(lv.rank.name)),
      h('div', h('div.level-num', `Level ${lv.level}`), h('div.muted.small', lv.rank.name)),
      h('div.level-xp', h('strong', fmt(s.xp.total)), h('span.muted.small', L('total XP', 'total XP')))),
    progressBar(lv.pct, { tone: 'sun', label: L('Progres level', 'Level progress') }),
    h('p.small.muted', L(`${fmt(lv.needed - lv.into)} XP lagi ke level ${lv.level + 1}`, `${fmt(lv.needed - lv.into)} XP to level ${lv.level + 1}`), lv.nextRank ? L(`. Gelar ${lv.nextRank.name} di level ${lv.nextRank.level}.`, `. ${lv.nextRank.name} title at level ${lv.nextRank.level}.`) : '.'));

  // ── Aksi cepat
  const me = standings(s, { realPlayers: ctx.players(), me: { name: s.profile.name } }).find((r) => r.kind === 'you');
  const tier = TIERS[s.league.tier];
  const quick = h('div.quick-grid',
    quickTile('bow', L('Ulas kesalahan', 'Review mistakes'), mistakes ? L(`${mistakes} soal menunggu`, `${mistakes} waiting`) : L('Belum ada', 'None yet'), () => ctx.navigate('review'), mistakes ? 'red' : ''),
    quickTile('book', L('Jalur Hafalan', 'Memory Path'), (() => { const ps = pathStatus(s); return ps.done ? L(`${ps.memorized}/${ps.total} hafal`, `${ps.memorized}/${ps.total} memorized`) : L(`Tahap ${ps.stage + 1}, ${ps.memorized} hafal`, `Stage ${ps.stage + 1}, ${ps.memorized} memorized`); })(), () => ctx.navigate('hafalan')),
    isRanked(s) ? quickTile('crown', 'Leaderboard', L(`Divisi ${tier.name}, peringkat #${me.rank}`, `${tier.name} division, rank #${me.rank}`), () => ctx.navigate('league'))
      : quickTile('letter', L('Teman', 'Friends'), hasAccount() ? L('Ikut Leaderboard untuk bersaing', 'Join the Leaderboard to compete') : L('Leaderboard butuh akun', 'The Leaderboard needs an account'), () => ctx.navigate('teman')),
    quickTile('bolt', L('Mode Kilat', 'Lightning Mode'), s.kilat?.best ? L(`Rekor ${s.kilat.best} benar`, `Best: ${s.kilat.best} right`) : L('60 detik, sebanyak mungkin', '60 seconds, as many as you can'), () => ctx.playKilat()),
    quickTile('star', L('Rapor', 'Report'), L('Lihat kekuatan & kelemahanmu', 'See your strengths and gaps'), () => ctx.navigate('rapor')),
    quickTile('shop', L('Toko', 'Shop'), L(`Saldo ${fmt(s.xp.balance)} XP`, `${fmt(s.xp.balance)} XP balance`), () => ctx.navigate('shop')));

  const boost = s.boosts.doubleXpLeft > 0 ? h('div.banner.banner-sun', art(ICON.bolt()), h('p', L(`Double XP aktif untuk ${s.boosts.doubleXpLeft} soal berikutnya.`, `Double XP is on for your next ${s.boosts.doubleXpLeft} questions.`))) : null;

  const unlocked = ACHIEVEMENTS.filter((a) => s.achievements[a.id]).sort((a, b) => s.achievements[b.id].localeCompare(s.achievements[a.id])).slice(0, 5);
  const recent = card('recent-ach',
    h('div.section-title', h('h2', L('Perangko terbaru', 'Latest stamps')), h('a.card-link.static', { href: '#pencapaian' }, L('Lihat koleksi', 'See collection'))),
    unlocked.length ? h('div.recent-row', unlocked.map((a) => h('div.recent-item', badge(a, true), h('span', a.name))))
      : h('p.small.muted', L('Selesaikan kuis pertamamu untuk mendapatkan perangko pertama.', 'Finish your first quiz to earn your first stamp.')));

  return h('div.screen.home',
    h('header.page-head', h('div', h('p.muted', `${greet}. ${formatKey(today)}`))),
    hero, banners, boost, dailyCard,
    missionsCard(s, ctx, today),
    factCard(today),
    h('div.two-col', streakCard, levelCard),
    h('div', h('div.section-title', h('h2', L('Lanjut belajar', 'Keep learning'))), quick),
    recent);
}

// ── Fun fact harian. "Fakta lain" mengganti kartu ini saja tanpa render ulang halaman.
let factOffset = 0;
let factDay = null;
function factCard(day) {
  if (factDay !== day) { factDay = day; factOffset = 0; }
  const f = funFact(day, factOffset);
  const el = card('fact-card',
    h('div.fact-icon', { 'aria-hidden': 'true' }, catArt(f.cat.id)),
    h('div.fact-body',
      h('p.fact-kicker', factOffset === 0 ? L('Tahu gak? Fakta hari ini', 'Did you know? Today\'s fact') : L('Tahu gak?', 'Did you know?')),
      h('p.fact-lead', f.lead),
      h('p.fact-answer', f.answer),
      h('p.fact-more', f.more),
      h('div.fact-foot',
        chip(f.cat.name),
        button(L('Fakta lain', 'Another fact'), { size: 'sm', variant: 'ghost', onClick: () => {
          factOffset += 1;
          el.replaceWith(factCard(day));
        } }))));
  return el;
}

// ── Misi harian
function missionsCard(s, ctx, today) {
  const ms = s.missions?.day === today ? s.missions : { list: missionsFor(today), bonus: false };
  const ds = dailyStatus(s);
  const go = {
    daily: () => ctx.playDaily(),
    cat: (m) => ctx.playPractice(m.cat),
    correct: () => (ds.status === 'done' ? ctx.playKilat() : ctx.playDaily()),
    combo: () => ctx.navigate('practice'),
    review: () => ctx.playReview(),
    path: () => ctx.playPath(),
    kilat: () => ctx.playKilat(),
    duel: () => ctx.navigate('teman'),
    share: () => (ds.status === 'done' ? document.querySelector('.daily-card .dc-done .btn')?.click() : ctx.playDaily()),
    xp: () => ctx.navigate('practice'),
  };
  const done = ms.list.filter((m) => m.done).length;
  const rows = ms.list.map((m) => {
    const progress = m.kind === 'xp' && !m.done ? Math.min(s.xpLog[today] || 0, m.target) : m.progress;
    return h(`li.mission${m.done ? '.done' : ''}`,
      h('span.m-check', { 'aria-hidden': 'true' }, m.done ? art(ICON.check()) : null),
      h('div.m-body',
        h('span.m-text', missionText(m)),
        m.target > 1 ? h('div.m-prog', progressBar(progress / m.target, { tone: m.done ? 'mint' : 'sun', label: missionText(m) }), h('span.small.muted', `${progress}/${m.target}`)) : null),
      m.done ? h('span.m-xp', `+${MISSION_XP}`) : button(L('Mulai', 'Go'), { size: 'xs', variant: 'ghost', onClick: () => go[m.kind]?.(m) }));
  });
  return card('missions-card',
    sectionTitle(L('Misi hari ini', 'Today\'s missions'), chip(`${done}/${ms.list.length}`, { tone: done === ms.list.length ? 'mint' : 'cobalt' })),
    h('ul.mission-list', rows),
    h('p.small.muted.m-bonus', ms.bonus
      ? L(`Semua misi selesai! Bonus +${MISSION_BONUS_XP} XP sudah masuk. Misi baru besok.`, `All missions done! The +${MISSION_BONUS_XP} XP bonus is yours. New missions tomorrow.`)
      : L(`+${MISSION_XP} XP per misi, bonus +${MISSION_BONUS_XP} XP kalau semuanya selesai.`, `+${MISSION_XP} XP per mission, plus a +${MISSION_BONUS_XP} XP bonus when all are done.`)));
}

function quickTile(icon, title, sub, onClick, tone = '') {
  return h(`button.quick${tone ? '.tone-' + tone : ''}`, { type: 'button', onclick: onClick },
    h('span.quick-icon', art(ICON[icon]())), h('span.quick-title', title), h('span.quick-sub', sub));
}

export { chip };
