import { art, medal, catArt, ICON } from '../art.js';
// Papan peringkat Nasional & Global (tab "Peringkat" di halaman Liga, rute #peringkat).

import { h, fmt, clear } from '../dom.js';
import { button, chip, toggle, openCountryModal, countryPicker, entityAvatar } from '../components.js';
import { PERIODS, buildBoard, sanitizeRows } from '../../core/leaderboard.js';
import { cloudStatus } from '../../core/cloud.js';
import { flag, countryName } from '../../data/countries.js';
import { nextUtcWeekStart, nextUtcMonthStart, formatLocalDateTime } from '../../core/dates.js';
import { L } from '../../core/i18n.js';
import { CATEGORIES, CATEGORY_BY_ID } from '../../data/categories.js';

const ui = { scope: 'national', period: 'week', country: null, query: '', cat: null }; // cat: null = papan utama
const LIST_LIMIT = 50;

export function renderBoard(s, ctx) {
  const cs = cloudStatus();
  const online = cs.mode === 'cloud' || cs.mode === 'readonly';
  const includeSim = s.leaderboard.showSim ?? !online;
  const country = ui.country || s.profile.country;
  const { valid, rejected } = sanitizeRows(ctx.players());

  // ── Kontrol
  const scopeTabs = h('div.tabs.scope-tabs', { role: 'tablist', 'aria-label': L('Cakupan peringkat', 'Ranking scope') },
    scopeTab('national', L('Nasional', 'National'), ctx),
    scopeTab('global', 'Global', ctx));
  const periodTabs = h('div.period-tabs', { role: 'tablist', 'aria-label': L('Periode', 'Period') },
    PERIODS.map((p) => h(`button.period${ui.period === p.id ? '.active' : ''}`, {
      type: 'button', role: 'tab', 'aria-selected': String(ui.period === p.id),
      onclick: () => { ui.period = p.id; ctx.rerender(); },
    }, p.label)));
  const resetNote = ui.period === 'week' ? L(`Direset ${formatLocalDateTime(nextUtcWeekStart())}.`, `Resets ${formatLocalDateTime(nextUtcWeekStart())}.`)
    : ui.period === 'month' ? L(`Direset ${formatLocalDateTime(nextUtcMonthStart())}.`, `Resets ${formatLocalDateTime(nextUtcMonthStart())}.`)
      : L('Total XP sejak pertama bermain. Tidak pernah direset.', 'Total XP since you first played. Never resets.');

  const catPills = h('div.cat-pills', { role: 'tablist', 'aria-label': L('Papan', 'Board') },
    [null, ...CATEGORIES.map((c) => c.id)].map((id) => {
      const c = id ? CATEGORY_BY_ID[id] : null;
      return h(`button.cat-pill${ui.cat === id ? '.active' : ''}`, {
        type: 'button', role: 'tab', 'aria-selected': String(ui.cat === id), style: c ? { '--cat': c.color, '--cat-tint': c.tint } : null,
        onclick: (e) => { ui.cat = id; ui.query = ''; ctx.rerender(); requestAnimationFrame(() => document.querySelector('.cat-pill.active')?.scrollIntoView({ block: 'nearest', inline: 'center' })); },
      }, c ? catArt(c.id, 'pill-ico') : art(ICON.crown(), 'pill-ico'), h('span', c ? c.name : L('Utama', 'Overall')));
    }));
  const cat = ui.cat ? CATEGORY_BY_ID[ui.cat] : null;
  const head = h('div.board-controls', catPills, scopeTabs, periodTabs,
    h('p.small.muted', resetNote, L(' Batas periode sama untuk semua negara (UTC).', ' Periods change at the same moment for every country (UTC).')));

  // ── Nasional tanpa negara
  if (ui.scope === 'national' && !country) {
    return h('div.board-wrap', head, h('section.card.pick-country',
      h('h3', L('Pilih negaramu dulu', 'Choose your country first')),
      h('p.small.muted', L('Peringkat nasional hanya membandingkan pemain dari negara yang sama.', 'National rankings only compare players from the same country.')),
      countryPicker({ onChange: (c) => ctx.update((st) => { st.profile.country = c; }) })));
  }

  const { entries, me } = buildBoard({ state: s, rows: valid, scope: ui.scope, country, period: ui.period, includeSim, category: ui.cat });
  const boardName = cat ? L(`papan ${cat.name}`, `the ${cat.name} board`) : L('papan utama', 'the overall board');
  const realCount = entries.filter((e) => e.kind === 'real').length;
  const periodWord = L({ week: 'minggu ini', month: 'bulan ini', all: 'sepanjang masa' }, { week: 'this week', month: 'this month', all: 'of all time' })[ui.period];
  const where = ui.scope === 'global' ? L('di seluruh dunia', 'worldwide') : L(`di ${countryName(country)}`, `in ${countryName(country)}`);

  // ── Ringkasan posisimu
  const viewingOther = ui.scope === 'national' && country !== s.profile.country;
  const summary = me
    ? h('section.my-rank',
      h('div.my-rank-num', `#${me.rank}`),
      h('div', h('strong', cat ? L(`Peringkat ${cat.name}-mu ${where} ${periodWord}`, `Your ${cat.name} rank ${where} ${periodWord}`) : L(`Peringkatmu ${where} ${periodWord}`, `Your rank ${where} ${periodWord}`)),
        h('p.small', cat ? L(`${fmt(me.xp)} XP ${cat.name} dari ${fmt(entries.length)} pemain di papan ini.`, `${fmt(me.xp)} ${cat.name} XP among ${fmt(entries.length)} players on this board.`) : L(`${fmt(me.xp)} XP dari ${fmt(entries.length)} pemain di papan ini.`, `${fmt(me.xp)} XP among ${fmt(entries.length)} players on this board.`)),
        cat && me.xp === 0 ? button(L(`Latihan ${cat.name}`, `Practice ${cat.name}`), { size: 'sm', variant: 'ghost', onClick: () => ctx.playPractice?.(cat.id) }) : null),
      me.rank > 3 ? button(L('Lihat posisiku', 'Show my spot'), { size: 'sm', variant: 'ghost', onClick: () => document.querySelector('.lb-row.kind-you')?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }) : null)
    : h('section.my-rank.other', h('div.my-rank-num', flag(country)), h('div', h('strong', L(`Kamu sedang melihat ${countryName(country)}`, `You're viewing ${countryName(country)}`)), h('p.small', L('Kamu tidak ada di papan ini karena negaramu berbeda.', 'You\'re not on this board because your country is different.'))));

  // ── Pilihan tambahan
  const extras = h('div.board-extras',
    ui.scope === 'national' ? button(viewingOther ? L(`Kembali ke negaraku`, `Back to my country`) : L('Lihat negara lain', 'View another country'), {
      size: 'sm', variant: 'ghost', icon: null,
      onClick: () => {
        if (viewingOther) { ui.country = null; ctx.rerender(); return; }
        openCountryModal({ title: L('Lihat peringkat negara', 'View a country\'s rankings'), value: country, confirmLabel: L('Lihat', 'View'), onPick: (c) => { ui.country = c; ctx.rerender(); } });
      },
    }) : null,
    toggle(includeSim, (v) => ctx.update((st) => { st.leaderboard.showSim = v; }), L('Tampilkan pemain simulasi', 'Show simulated players')));

  const modeNote = online
    ? L(`Pemain asli dari database aplikasi (${realCount} di papan ini).${includeSim ? ' Pemain berlabel "Simulasi" bukan orang sungguhan.' : ''}`, `Real players from the app's database (${realCount} on this board).${includeSim ? ' Players labeled "Simulated" are not real people.' : ''}`)
    : L(`Mode lokal: belum terhubung ke database, jadi belum ada pemain asli lain. ${includeSim ? 'Semua lawan di bawah adalah pemain simulasi, bukan orang sungguhan.' : 'Aktifkan pemain simulasi untuk mencoba papan ini.'}`, `Local mode: not connected to the database, so there are no other real players yet. ${includeSim ? 'Everyone below is a simulated player, not a real person.' : 'Turn on simulated players to try this board.'}`);

  // ── Podium & daftar
  const searchInput = h('input.input', {
    type: 'search', placeholder: L('Cari pemain…', 'Search players…'), 'aria-label': L('Cari pemain', 'Search players'), value: ui.query,
    oninput: (e) => { ui.query = e.target.value; drawList(); },
  });
  const podiumEl = h('div');
  const listEl = h('ol.lb-list');

  function drawList() {
    const q = ui.query.trim().toLowerCase();
    clear(podiumEl);
    clear(listEl);
    if (q) {
      const hits = entries.filter((e) => e.name.toLowerCase().includes(q));
      if (!hits.length) listEl.append(h('li.small.muted.pad', L(`Tidak ada pemain bernama "${ui.query.trim()}" di papan ini.`, `No player named "${ui.query.trim()}" on this board.`)));
      hits.slice(0, LIST_LIMIT).forEach((e) => listEl.append(row(e)));
      return;
    }
    if (entries.length) podiumEl.append(podium(entries.slice(0, 3)));
    const rest = entries.slice(3, LIST_LIMIT);
    rest.forEach((e) => listEl.append(row(e)));
    if (me && me.rank > LIST_LIMIT) {
      listEl.append(h('li.lb-gap', { 'aria-hidden': 'true' }, '⋯'));
      listEl.append(row(me));
    }
  }
  drawList();

  const empty = entries.length <= 1
    ? h('div.board-empty', h('p', h('strong', me ? L(`Baru kamu yang tercatat di ${boardName} ${where} ${periodWord}.`, `So far it's just you on ${boardName} ${where} ${periodWord}.`) : L(`Belum ada pemain di ${boardName} ${where} ${periodWord}.`, `No players on ${boardName} ${where} ${periodWord} yet.`))),
      h('p.small.muted', online ? L('Bagikan aplikasi ini ke temanmu supaya papan ini makin ramai.', 'Share the app with friends to liven up this board.') : L('Aktifkan pemain simulasi untuk melihat contoh papan yang ramai.', 'Turn on simulated players to see a busy example board.')))
    : null;

  return h('div.board-wrap', head, summary, extras, h('p.small.muted.note', modeNote),
    rejected.length ? h('p.small.muted.note', L(`${rejected.length} pemain disembunyikan karena datanya tidak wajar.`, `${rejected.length} players hidden because their data looked invalid.`)) : null,
    empty, podiumEl, entries.length > 3 ? searchInput : null, listEl,
    h('details.board-about', h('summary', L('Bagaimana peringkat dihitung?', 'How are rankings calculated?')),
      h('p.small', L('Mingguan dan bulanan menghitung XP yang kamu dapat dalam periode itu; membelanjakan XP di Toko tidak mengurangi peringkat. Peringkat diperbarui otomatis setelah kamu mendapat XP.', 'Weekly and monthly count the XP you earned in that period; spending XP in the Shop doesn\'t lower your rank. Rankings update automatically after you earn XP.')),
      h('p.small', L('Aturan Petunjuk: XP dari soal yang kamu jawab dengan bantuan Petunjuk tetap masuk level dan saldo, tapi tidak dihitung di Leaderboard mana pun (papan utama, papan kategori, dan divisi mingguan).', 'Hint rule: XP from questions you answered with a Hint still counts toward your level and balance, but not on any Leaderboard (overall, category boards, or the weekly division).')),
      h('p.small', L('Papan utama menghitung semua XP kecuali dari soal berpetunjuk. Papan kategori hanya menghitung XP dari menjawab soal di kategori itu (di Tantangan Harian, Latihan, Ulas, Jalur Hafalan, Kilat, dan duel); bonus harian, misi, dan pencapaian tidak ikut. XP kategori mulai dicatat 24 November 2026; nilai "sepanjang masa" sebelum itu diperkirakan dari jumlah jawaban benarmu.', 'The overall board counts all XP except from hinted questions. Category boards only count XP from answering questions in that category (Daily Challenge, Practice, Review, Memory Path, Lightning Mode and duels); daily bonuses, missions and achievements don\'t count. Category XP has been tracked since November 24, 2026; all-time values from before then are estimated from your correct answers.')),
      h('p.small', L('Untuk prototipe ini, peringkat dihitung di perangkatmu dari data bersama. Setiap pemain hanya bisa menulis datanya sendiri, dan data yang jelas tidak wajar disaring. Versi produksi tetap butuh perhitungan dan validasi di server agar tidak bisa dicurangi.', 'In this prototype, rankings are calculated on your device from shared data. Each player can only write their own data, and clearly invalid data is filtered out. A production version would still need server-side calculation and validation to prevent cheating.'))));
}

function scopeTab(id, label, ctx) {
  return h(`button.tab${ui.scope === id ? '.active' : ''}`, {
    type: 'button', role: 'tab', 'aria-selected': String(ui.scope === id),
    onclick: () => { ui.scope = id; ui.query = ''; ctx.rerender(); },
  }, label);
}

function kindChip(e) {
  if (e.kind === 'sim') return chip(L('Simulasi', 'Simulated'), { tone: 'muted', title: L('Pemain simulasi, bukan orang sungguhan', 'A simulated player, not a real person') });
  if (e.kind === 'you') return chip(L('Kamu', 'You'), { tone: 'cobalt' });
  return null;
}

function row(e) {
  return h(`li.lb-row.kind-${e.kind}`,
    h('span.p-rank', e.rank),
    h('span.p-avatar', { 'aria-hidden': 'true' }, entityAvatar(e)),
    h('span.p-who', h('span.p-flag', { title: countryName(e.country), 'aria-label': countryName(e.country) }, flag(e.country)), h('span.p-name', e.name), kindChip(e)),
    h('span.p-xp', `${fmt(e.xp)} XP`));
}

function podium(top) {
  const order = [top[1], top[0], top[2]];
  const medals = { 1: 2, 2: 1, 3: 0 };
  return h('div.podium', order.map((e, i) => {
    const place = [2, 1, 3][i];
    if (!e) return h('div.pod.empty', { style: { order: i } });
    return h(`div.pod.place-${place}.kind-${e.kind}`,
      h('div.pod-avatar', entityAvatar(e), e.rank <= 3 ? h('span.pod-medal', art(medal(medals[e.rank]))) : null),
      h('div.pod-name', h('span.p-flag', { title: countryName(e.country) }, flag(e.country)), ' ', h('span', e.name)),
      kindChip(e),
      h('div.pod-xp', `${fmt(e.xp)} XP`),
      h('div.pod-step', h('span', `#${e.rank}`)));
  }));
}
