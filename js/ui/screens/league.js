import { art, lamp, letter, medal, ICON, iconEl } from '../art.js';
import { SIMS_ENABLED } from '../../core/flags.js';
import { usernameBanner } from '../usernameUi.js';
import { isValidUsername } from '../../core/username.js';
import { inviteButton } from '../installUi.js';
import { h, fmt, clear } from '../dom.js';
import { button, chip, emptyState, entityAvatar } from '../components.js';
import { standings, TIERS, ZONE, SIM_FRIENDS, simFriendStats } from '../../core/league.js';
import { levelInfo } from '../../core/xp.js';
import { formatDuration, todayKey, nextUtcWeekStart, formatLocalDateTime } from '../../core/dates.js';
import { cloudStatus, resolveNames, searchPeople, hasAccount, isRanked, IS_APP_BUILD, APP_HAS_SERVER, appOfflineText, usernamesSupported } from '../../core/cloud.js';
import { sanitizeRows } from '../../core/leaderboard.js';
import { flag, countryName } from '../../data/countries.js';
import { renderBoard } from './leaderboard.js';
import { openJoin, signInLink } from '../leaderboardJoin.js';
import { duelList, pendingWith, outcomeOf } from '../../core/duel.js';
import { avatarForId } from '../../core/avatar.js';
import { toast } from '../components.js';
import { L } from '../../core/i18n.js';

const TABS = [
  { route: 'league', label: () => L('Mingguan', 'Weekly') },
  { route: 'peringkat', label: () => L('Peringkat', 'Rankings') },
  { route: 'teman', label: () => L('Teman', 'Friends') },
];

export function renderLeague(s, ctx) {
  const current = ctx.route();
  const tabs = h('nav.tabs', { 'aria-label': L('Bagian leaderboard', 'Leaderboard sections') },
    TABS.map((t) => h(`a.tab${current === t.route ? '.active' : ''}`, { href: `#${t.route}`, 'aria-current': current === t.route ? 'page' : undefined }, t.label())));
  const sub = current === 'peringkat'
    ? L('Bandingkan XP-mu dengan pemain di negaramu dan seluruh dunia.', 'Compare your XP with players in your country and around the world.')
    : L(`Bersaing lewat XP. Minggu baru dimulai ${formatLocalDateTime(nextUtcWeekStart())} (waktumu), sama untuk semua negara.`, `Compete with XP. The new week starts ${formatLocalDateTime(nextUtcWeekStart())} (your time), the same for every country.`);

  return h('div.screen.league',
    h('header.page-head', h('div', h('h1.display', 'Leaderboard'), h('p.muted', sub))),
    tabs,
    current === 'teman' ? friendsView(s, ctx) : !isRanked(s) ? lockedView(current, ctx) : current === 'peringkat' ? renderBoard(s, ctx) : leagueView(s, ctx));
}

function lockedView(current, ctx) {
  if (!hasAccount()) {
    return h('section.lock-panel',
      h('div.locked-icon', art(medal(2))),
      h('h2', IS_APP_BUILD ? (APP_HAS_SERVER ? L('Leaderboard butuh internet', 'The Leaderboard needs internet') : L('Leaderboard ada di versi claude.ai', 'The Leaderboard is in the claude.ai version')) : L('Leaderboard butuh akun', 'The Leaderboard needs an account')),
      IS_APP_BUILD ? h('p', appOfflineText()) : h('p', L('Buka tahu gak? lewat claude.ai lalu masuk (atau daftar) dengan akunmu. Setelah itu pilih negaramu dan ikut bersaing.', 'Open tahu gak? through claude.ai and sign in (or sign up). Then choose your country and start competing.')),
      IS_APP_BUILD ? null : h('p.small.muted', L('Tanpa akun, kamu tetap bisa main semua mode. Progresmu hanya tersimpan di browser ini.', 'Without an account you can still play every mode. Your progress is saved in this browser only.')),
      h('div.locked-actions',
        signInLink('a.btn.btn-primary.btn-lg'),
        h('a.btn.btn-ghost.btn-lg', { href: '#teman' }, L('Lihat Teman', 'See Friends'))));
  }
  return h('section.lock-panel',
    h('div.locked-icon', art(medal(2))),
    h('h2', L('Ikut Leaderboard', 'Join the Leaderboard')),
    h('p', L('Pilih negaramu untuk bersaing di leaderboard mingguan, peringkat negaramu, dan peringkat global.', 'Choose your country to compete on the weekly leaderboard, your country\'s rankings, and the global rankings.')),
    h('p.small.muted', L('Pemain lain hanya melihat nama, avatar, negara, dan XP-mu. Kamu bisa keluar kapan saja di Profil.', 'Other players only see your name, avatar, country, and XP. You can leave anytime in Profile.')),
    h('div.locked-actions',
      button(L('Ikut Leaderboard', 'Join the Leaderboard'), { size: 'lg', onClick: () => openJoin(ctx) }),
      h('a.btn.btn-ghost.btn-lg', { href: '#teman' }, L('Lihat Teman', 'See Friends'))));
}

function kindChip(kind) {
  if (kind === 'bot' || kind === 'sim') return chip(L('Simulasi', 'Simulated'), { tone: 'muted', title: L('Pemain simulasi, bukan orang sungguhan', 'A simulated player, not a real person') });
  if (kind === 'real') return SIMS_ENABLED ? chip(L('Pemain asli', 'Real player'), { tone: 'mint' }) : null;
  return chip(L('Kamu', 'You'), { tone: 'cobalt' });
}

function leagueView(s, ctx) {
  const real = sanitizeRows(ctx.players()).valid;
  const rows = standings(s, { realPlayers: real, me: { name: s.profile.name } });
  const tier = TIERS[s.league.tier];
  const cs = cloudStatus();
  const realCount = rows.filter((r) => r.kind === 'real').length;

  const list = h('ol.board');
  rows.forEach((r, i) => {
    if (i === ZONE && rows[0].zone === 'up') list.append(h('li.zone-line.up', L('Zona promosi', 'Promotion zone')));
    if (r.zone === 'down' && rows[i - 1]?.zone !== 'down') list.append(h('li.zone-line.down', L('Zona degradasi', 'Relegation zone')));
    const nameEl = h('span.p-name', r.name);
    if (r.kind === 'real') nameEl.dataset.uid = r.id;
    list.append(h(`li.p-row.kind-${r.kind}.zone-${r.zone}`,
      h('span.p-rank', r.rank),
      h('span.p-avatar', { 'aria-hidden': 'true' }, entityAvatar(r)),
      h('span.p-who', r.country ? h('span.p-flag', { title: countryName(r.country) }, flag(r.country)) : null, nameEl, kindChip(r.kind)),
      h('span.p-xp', `${fmt(r.xp)} XP`)));
  });
  hydrateNames(list);

  const res = s.league.lastResult;
  let resultBanner = null;
  if (res && !res.seen) {
    const msg = res.outcome === 'up' ? L(`Minggu lalu kamu peringkat #${res.rank} dan naik ke divisi ${TIERS[res.tierAfter].name}!`, `Last week you placed #${res.rank} and moved up to the ${TIERS[res.tierAfter].name} division!`)
      : res.outcome === 'down' ? L(`Minggu lalu kamu peringkat #${res.rank} dan turun ke divisi ${TIERS[res.tierAfter].name}. Ayo bangkit!`, `Last week you placed #${res.rank} and dropped to the ${TIERS[res.tierAfter].name} division. Time to bounce back!`)
        : res.outcome === 'idle' ? L('Kamu tidak mendapat XP minggu lalu, jadi divisimu tetap.', 'You earned no XP last week, so your division stayed the same.')
          : L(`Minggu lalu kamu peringkat #${res.rank} dan bertahan di divisi ${TIERS[res.tierAfter].name}.`, `Last week you placed #${res.rank} and stayed in the ${TIERS[res.tierAfter].name} division.`);
    resultBanner = h('div.banner.banner-sun', art(medal(res.tierAfter)), h('p', msg),
      button(L('Oke', 'OK'), { size: 'sm', variant: 'ghost', onClick: () => ctx.update((st) => { st.league.lastResult.seen = true; }) }));
  }

  const note = cs.mode === 'cloud'
    ? !SIMS_ENABLED ? L(`${realCount ? `${realCount} pemain lain di divisimu minggu ini.` : 'Belum ada pemain lain di divisimu minggu ini. Ajak temanmu biar seru.'} Naik dan turun divisi berlaku kalau divisinya berisi minimal 8 pemain.`, `${realCount ? `${realCount} other ${realCount === 1 ? 'player' : 'players'} in your division this week.` : 'No other players in your division this week yet. Invite your friends.'} Moving up and down starts once a division has at least 8 players.`)
    : L(`${realCount ? `${realCount} pemain asli di divisimu. ` : 'Belum ada pemain asli lain di divisimu minggu ini. '}Kursi kosong diisi pemain simulasi.`, `${realCount ? `${realCount} real ${realCount === 1 ? 'player' : 'players'} in your division. ` : 'No other real players in your division this week. '}Empty seats are filled by simulated players.`)
    : IS_APP_BUILD ? appOfflineText() : L('Mode lokal: semua lawan di leaderboard mingguan ini adalah pemain simulasi. Buka aplikasi lewat claude.ai dan masuk untuk bertanding dengan pemain asli.', 'Local mode: every opponent on this weekly leaderboard is simulated. Open the app through claude.ai and sign in to compete with real players.');

  return h('div',
    resultBanner,
    h('section.tier-card', { style: { '--tier': tier.color } },
      h('div.tier-icon', art(medal(s.league.tier))),
      h('div', h('h2', L(`Divisi ${tier.name}`, `${tier.name} division`)), h('p.small', L(`Berakhir dalam ${formatDuration(nextUtcWeekStart() - Date.now())}. ${ZONE} teratas naik divisi, ${ZONE} terbawah turun.`, `Ends in ${formatDuration(nextUtcWeekStart() - Date.now())}. Top ${ZONE} move up, bottom ${ZONE} move down.`))),
      h('div.tier-ladder', { 'aria-hidden': 'true' }, TIERS.map((t, i) => h(`span${i === s.league.tier ? '.now' : i < s.league.tier ? '.past' : ''}`, { title: t.name }, art(medal(i)))))),
    h('p.small.muted.note', note),
    list);
}

async function hydrateNames(root) {
  const els = [...root.querySelectorAll('[data-uid]')];
  if (!els.length) return;
  const ps = await resolveNames(els.map((e) => e.dataset.uid));
  for (const el of els) {
    const p = ps[el.dataset.uid];
    if (p?.name) el.textContent = p.name;
  }
}

function friendsView(s, ctx) {
  const cs = cloudStatus();
  const players = ctx.players();
  const today = todayKey();
  const meRow = {
    id: 'you', kind: 'you', name: s.profile.name || L('Kamu', 'You'), username: s.profile.username, avatarCfg: s.profile.avatarCfg, country: s.profile.country,
    totalXp: s.xp.total, streak: s.streak.current, dailyScore: s.daily[today]?.score ?? null,
  };
  const simRows = !SIMS_ENABLED ? [] : s.friends.sim.map((id) => SIM_FRIENDS.find((f) => f.id === id)).filter(Boolean).map((f) => simFriendStats(f));
  const realRows = s.friends.real.map((id) => {
    const p = players.find((x) => x.id === id);
    return {
      id, kind: 'real', name: p?.nickname || L('Pemain', 'Player'), username: isValidUsername(p?.username) ? p.username : null, avatarCfg: p?.avatarCfg, country: p?.country,
      totalXp: p?.totalXp ?? 0, streak: p?.streak ?? 0, dailyScore: p?.dailyDate === today ? p.dailyScore : null, missing: !p,
    };
  });
  const rows = [meRow, ...realRows, ...simRows].sort((a, b) => b.totalXp - a.totalXp);

  const table = h('ol.board.friends-board');
  rows.forEach((r, i) => {
    const nameEl = h('span.p-name', r.name);
    if (r.kind === 'real') nameEl.dataset.uid = r.id;
    table.append(h(`li.p-row.kind-${r.kind}`,
      h('span.p-rank', i + 1),
      h('span.p-avatar', { 'aria-hidden': 'true' }, entityAvatar(r)),
      h('span.p-who', r.country ? h('span.p-flag', { title: countryName(r.country) }, flag(r.country)) : null, nameEl, r.username ? h('span.p-uname', `@${r.username}`) : null, kindChip(r.kind), r.missing ? h('span.small.muted', L('belum main', 'hasn\'t played')) : null),
      h('span.f-stats',
        h('span', { title: 'Total XP' }, `${fmt(r.totalXp)} XP`),
        h('span.f-streak', { title: 'Streak' }, iconEl('flame'), `${r.streak}`),
        h('span', { title: L('Skor tantangan hari ini', 'Today\'s challenge score') }, r.dailyScore === null ? L('Hari ini: belum', 'Today: not yet') : L(`Hari ini: ${r.dailyScore}/5`, `Today: ${r.dailyScore}/5`))),
      r.kind !== 'you' ? h('span.f-actions',
        duelButton(r, s, ctx),
        button(L('Hapus', 'Remove'), { variant: 'ghost', size: 'xs', title: L(`Hapus ${r.name} dari teman`, `Remove ${r.name} from friends`), onClick: () => ctx.update((st) => {
          st.friends.sim = st.friends.sim.filter((x) => x !== r.id);
          st.friends.real = st.friends.real.filter((x) => x !== r.id);
        }) })) : h('span')));
  });
  hydrateNames(table);

  // Tambah teman asli (butuh mode cloud)
  let addReal;
  if (cs.mode === 'cloud' || cs.mode === 'readonly') {
    const results = h('ul.search-results');
    const input = h('input.input', {
      type: 'search', placeholder: usernamesSupported() ? L('Cari nama atau @username…', 'Search name or @username…') : L('Cari nama rekan…', 'Search by name…'), 'aria-label': L('Cari teman', 'Search friends'),
      onfocus: () => run(''), oninput: (e) => run(e.target.value),
    });
    async function run(q) {
      const hits = (await searchPeople(q)).filter((p) => !p.isMe);
      clear(results);
      if (!hits.length) {
        const msg = q ? L('Tidak ada yang cocok. Pastikan temanmu sudah membuka aplikasinya dan mengisi nama.', 'No matches. Make sure your friend has opened the app and entered a name.')
          : (IS_APP_BUILD ? L('Belum ada pemain lain. Ajak temanmu dulu lewat tombol di bawah.', 'No other players yet. Invite your friends with the button below.') : '');
        if (msg) results.append(h('li.small.muted', msg));
        return;
      }
      for (const p of hits) {
        const already = s.friends.real.includes(p.id);
        const played = players.some((x) => x.id === p.id);
        const img = h('img', { src: p.avatarUrl, alt: '' });
        const name = h('span'); name.textContent = p.name;
        results.append(h('li.search-hit', img, h('span.grow', name, p.username ? h('span.small.muted.block.s-uname', `@${p.username}`) : null, played ? null : h('span.small.muted.block', L('belum pernah main', 'hasn\'t played yet'))),
          button(already ? L('Sudah teman', 'Already friends') : L('Tambah', 'Add'), { size: 'xs', variant: already ? 'ghost' : 'primary', disabled: already,
            onClick: () => ctx.update((st) => { if (!st.friends.real.includes(p.id)) st.friends.real.push(p.id); }) })));
      }
    }
    const mine = !usernamesSupported() ? null : s.profile.username
      ? h('p.small.uname-mine', L('Username-mu: ', 'Your username: '), h('strong', `@${s.profile.username}`), L('. Kasih tahu temanmu biar mereka bisa menambahkanmu.', '. Share it so friends can add you.'))
      : usernameBanner(s, ctx, { dismissable: false });
    addReal = h('section.card.add-friend', h('h3', L('Tambah teman', 'Add friends')), mine, h('p.small.muted', L('Cari orang yang bisa membuka aplikasi ini. Skor mereka tampil setelah mereka bermain.', 'Search for people who can open this app. Their scores appear once they\'ve played.')), input, results,
      IS_APP_BUILD ? h('div.invite-row', h('p.small.muted', L('Temanmu belum pakai tahu gak? Kirimi link-nya.', 'Friends not on tahu gak? yet? Send them the link.')), inviteButton(s)) : null);
  } else {
    addReal = h('section.card.add-friend', h('h3', L('Tambah teman asli', 'Add real friends')),
      h('p.small.muted', IS_APP_BUILD ? appOfflineText() : L('Butuh mode online: buka aplikasi ini lewat claude.ai dan masuk ke akunmu. Di mode lokal, kamu bisa menambah pemain simulasi di bawah untuk perbandingan.', 'This needs online mode: open the app through claude.ai and sign in. In local mode you can add simulated players below to compare against.')));
  }

  const suggestions = SIM_FRIENDS.filter((f) => !s.friends.sim.includes(f.id));
  const simAdd = SIMS_ENABLED && suggestions.length ? h('section.card.add-friend',
    h('h3', L('Pemain simulasi', 'Simulated players')),
    h('p.small.muted', L('Lawan latihan buatan aplikasi, bukan orang sungguhan. Statistiknya berubah setiap hari.', 'Practice opponents made by the app, not real people. Their stats change every day.')),
    h('div.sim-list', suggestions.map((f) => h('button.sim-chip', { type: 'button', onclick: () => ctx.update((st) => { st.friends.sim.push(f.id); }) },
      h('span.sim-av', { 'aria-hidden': 'true' }, entityAvatar({ ...f, kind: 'sim' })), f.name, h('span.plus', '+'))))) : null;

  return h('div',
    duelSection(s, ctx, players),
    rows.length > 1 ? table : emptyState(letter(), L('Belum ada teman', 'No friends yet'), L('Tambahkan teman untuk membandingkan XP, streak, dan skor tantangan harian.', 'Add friends to compare XP, streaks, and daily challenge scores.')),
    addReal, simAdd);
}

// ───────────── Duel ─────────────
function duelButton(r, s, ctx) {
  if (r.kind === 'real' && (!hasAccount() || r.missing)) return null;
  const waiting = pendingWith(s, r.id);
  if (waiting) return button(L('Menunggu', 'Waiting'), { variant: 'ghost', size: 'xs', disabled: true, title: L(`Menunggu ${r.name} menjawab duelmu`, `Waiting for ${r.name} to play your duel`) });
  return button('Duel', { size: 'xs', title: L(`Tantang ${r.name} duel 5 soal`, `Challenge ${r.name} to a 5-question duel`),
    onClick: () => ctx.startDuel({ id: r.id, kind: r.kind === 'real' ? 'real' : 'sim', name: r.name, avatarCfg: r.kind === 'real' ? r.avatarCfg : avatarForId(r.id) }) });
}

function duelSection(s, ctx, players) {
  const { incoming, rest } = duelList(s);
  if (!incoming.length && !rest.length) {
    return h('section.card.duel-card', h('h3', 'Duel'),
      h('p.small.muted', L('Tantang teman dengan 5 soal yang sama. Skor lebih tinggi menang; kalau seri, yang lebih cepat. Menang = +15 XP. Tekan "Duel" di samping nama teman.', 'Challenge a friend with the same 5 questions. Higher score wins; on a tie, the faster one. A win is +15 XP. Tap "Duel" next to a friend\'s name.')));
  }
  const who = (d) => {
    if (d.kind === 'sim') { const f = SIM_FRIENDS.find((x) => x.id === d.with); return { name: f?.name || L('Pemain', 'Player'), avatarCfg: avatarForId(d.with), sim: true }; }
    const p = players.find((x) => x.id === d.with);
    return { name: p?.nickname || L('Pemain', 'Player'), avatarCfg: p?.avatarCfg || null, sim: false };
  };
  const line = (d) => {
    const w = who(d);
    const o = outcomeOf(d.me, d.them);
    const status = !d.me ? L('Belum kamu mainkan', 'You haven\'t played yet')
      : !d.them ? L(`Menunggu ${w.name} main`, `Waiting for ${w.name}`)
        : o === 'win' ? L('Kamu menang', 'You won') : o === 'lose' ? L(`${w.name} menang`, `${w.name} won`) : L('Seri', 'Tie');
    return h(`li.duel-line.out-${o || 'pending'}`,
      h('span.p-avatar', { 'aria-hidden': 'true' }, entityAvatar({ id: d.with, kind: w.sim ? 'sim' : 'real', avatarCfg: w.avatarCfg })),
      h('span.dl-who', h('strong', w.name), w.sim ? kindChip('sim') : null, h('span.small.muted.block', status)),
      h('span.dl-score', d.me ? String(d.me.score) : '–', ' : ', d.them && d.me ? String(d.them.score) : '?'));
  };
  return h('section.card.duel-card', h('h3', 'Duel'),
    incoming.length ? h('div.duel-incoming', incoming.map((d) => {
      const w = who(d);
      return h('div.duel-invite', art(ICON.crown(), 'ico'),
        h('span.grow', h('strong', w.name), L(' menantangmu duel 5 soal!', ' challenged you to a 5-question duel!')),
        button(L('Main', 'Play'), { size: 'sm', onClick: () => ctx.playDuel(d.id, w.name, w.avatarCfg) }));
    })) : null,
    rest.length ? h('ul.duel-list', rest.map(line)) : null);
}

export { levelInfo };
