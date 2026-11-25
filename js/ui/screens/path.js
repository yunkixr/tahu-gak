import { art, ICON, books, iconEl } from '../art.js';
// Halaman Jalur Hafalan (#hafalan).

import { h, fmt } from '../dom.js';
import { button, progressBar, sectionTitle, card } from '../components.js';
import { pathStatus, PATH_NEW, PATH_OLD, PATH_REVIEW_ONLY, MEMORIZED_BOX, BOX_LABELS, INTERVALS } from '../../core/path.js';
import { XP } from '../../core/xp.js';
import { L } from '../../core/i18n.js';

const OFFSETS = [0, 56, 84, 56, 0, -56, -84, -56];

export function renderPath(s, ctx) {
  const st = pathStatus(s);
  const p = s.path;
  const nextIsReview = st.done;
  const oldCount = nextIsReview ? Math.min(PATH_REVIEW_ONLY, st.introduced) : Math.min(PATH_OLD, st.introduced);

  const cta = h('section.path-cta',
    h('div.grow',
      h('p.path-cta-kicker', nextIsReview ? L('Semua soal sudah kamu kenal', 'You know every question') : L(`Tahap ${st.stage + 1} dari ${st.stages}`, `Stage ${st.stage + 1} of ${st.stages}`)),
      h('h2', nextIsReview ? L('Putaran ulang', 'Review round') : st.introduced === 0 ? L('Mulai dengan 5 soal', 'Start with 5 questions') : L(`${PATH_NEW} soal baru + ${oldCount} soal ulang`, `${PATH_NEW} new + ${oldCount} review questions`)),
      h('p.small', nextIsReview
        ? L(`${oldCount} soal lama, diprioritaskan yang paling rawan lupa. +${XP.PATH_ROUND} XP saat selesai.`, `${oldCount} older questions, the ones you're most likely to forget first. +${XP.PATH_ROUND} XP when done.`)
        : L(`+${XP.CORRECT} XP per soal baru benar, +${XP.PATH_OLD} XP per soal ulang benar, +${XP.PATH_STAGE} XP saat tahap selesai.`, `+${XP.CORRECT} XP per new question right, +${XP.PATH_OLD} XP per review question right, +${XP.PATH_STAGE} XP when the stage is done.`))),
    button(nextIsReview ? L('Mulai putaran', 'Start round') : st.introduced === 0 ? L('Mulai tahap 1', 'Start stage 1') : L('Lanjut', 'Continue'), { variant: 'sun', size: 'lg', onClick: ctx.playPath }));

  const progress = card('path-progress',
    h('div.pp-row', h('span', L('Dikenal', 'Known')), h('strong', `${st.introduced}/${st.total}`)),
    progressBar(st.introduced / st.total, { tone: 'cobalt', label: L('Soal dikenal', 'Questions known') }),
    h('div.pp-row', h('span', L('Hafal', 'Memorized')), h('strong', `${st.memorized}/${st.total}`)),
    progressBar(st.memorized / st.total, { tone: 'mint', label: L('Soal hafal', 'Questions memorized') }),
    h('p.small.muted', st.due ? L(`${st.due} soal sudah waktunya diulang dan akan masuk ke sesi berikutnya.`, `${st.due} questions are due and will be in your next session.`) : L('Belum ada soal yang perlu diulang. Lanjutkan tahap untuk mengenal soal baru.', 'Nothing is due yet. Keep going to meet new questions.')));

  // Jalur berliku: satu simpul = satu tahap (5 soal baru). Dengan ratusan tahap, tampilkan jendela di sekitar tahap sekarang.
  const nodes = [];
  const from = st.done ? Math.max(0, st.stages - 6) : Math.max(0, st.stage - 4);
  const to = st.done ? st.stages : Math.min(st.stages, Math.max(from + 12, st.stage + 8));
  if (from > 0) nodes.push(h('li.path-gap', h('span', L(`${fmt(from)} tahap sebelumnya sudah selesai`, `${fmt(from)} earlier stages complete`))));
  for (let i = from; i < to; i++) {
    const state = i < st.stage ? 'done' : i === st.stage && !st.done ? 'current' : 'locked';
    const ids = p.introduced.slice(i * PATH_NEW, i * PATH_NEW + PATH_NEW);
    const dots = state === 'done'
      ? h('span.node-dots', { title: L(`${ids.filter((id) => p.items[id]?.box >= MEMORIZED_BOX).length} dari ${ids.length} soal sudah hafal`, `${ids.filter((id) => p.items[id]?.box >= MEMORIZED_BOX).length} of ${ids.length} memorized`) },
        ids.map((id) => h(`i.b${Math.min(p.items[id]?.box ?? 0, 5)}`)))
      : null;
    const milestone = (i + 1) % 5 === 0 ? h('span.node-milestone', iconEl('crown'), L(`${(i + 1) * PATH_NEW} soal`, `${(i + 1) * PATH_NEW} questions`)) : null;
    const inner = art(ICON[state === 'done' ? 'check' : state === 'current' ? 'star' : 'lock']());
    const node = h(`button.node.${state}`, {
      type: 'button',
      disabled: state !== 'current',
      'aria-label': L(`Tahap ${i + 1}${state === 'done' ? ', selesai' : state === 'current' ? ', tahap berikutnya' : ', terkunci'}`, `Stage ${i + 1}${state === 'done' ? ', complete' : state === 'current' ? ', up next' : ', locked'}`),
      onclick: state === 'current' ? ctx.playPath : undefined,
    }, h('span.node-face', inner));
    nodes.push(h(`li.path-step.${state}`, { style: { '--x': `${OFFSETS[i % OFFSETS.length]}px` } },
      state === 'current' ? h('span.node-tip', L('Mulai di sini', 'Start here')) : null,
      node,
      h('span.node-label', L(`Tahap ${i + 1}`, `Stage ${i + 1}`)),
      dots,
      milestone));
  }
  if (to < st.stages) nodes.push(h('li.path-gap', h('span', L(`${fmt(st.stages - to)} tahap lagi menunggu`, `${fmt(st.stages - to)} more stages ahead`))));
  if (st.done) {
    nodes.push(h('li.path-step.current.finale', { style: { '--x': '0px' } },
      h('span.node-tip', L('Putaran ulang', 'Review round')),
      h('button.node.current', { type: 'button', onclick: ctx.playPath, 'aria-label': L('Mulai putaran ulang', 'Start review round') }, h('span.node-face', art(ICON.bow()))),
      h('span.node-label', st.memorized >= st.total ? L('Semua hafal! Ulang sesekali agar tetap ingat.', 'All memorized! Review now and then so it stays.') : L('Ulang sampai semua hafal', 'Review until everything sticks'))));
  }

  const boxes = card('',
    sectionTitle(L('Kotak hafalan', 'Memory boxes')),
    h('p.small.muted.box-intro', L('Jawab benar: soal naik satu kotak dan makin jarang muncul. Jawab salah: soal kembali ke kotak 0 dan muncul lagi di sesi berikutnya. Soal dianggap hafal mulai kotak 3, yaitu setelah benar 3 kali berturut-turut.', 'Right answer: the question moves up a box and shows up less often. Wrong answer: it goes back to box 0 and returns next session. A question counts as memorized from box 3, after 3 correct answers in a row.')),
    h('ol.box-list', st.boxes.map((n, b) => h(`li.box-${b}`,
      h('span.box-num', b),
      h('span.box-name', BOX_LABELS[b], b >= MEMORIZED_BOX ? h('span.box-tag', L('hafal', 'memorized')) : null),
      h('span.box-gap.small.muted', b === 0 ? L('muncul lagi di sesi berikutnya', 'back next session') : L(`muncul lagi setelah ${INTERVALS[b]} sesi`, `back after ${INTERVALS[b]} ${INTERVALS[b] === 1 ? 'session' : 'sessions'}`)),
      h('strong.box-count', fmt(n))))));

  return h('div.screen.path-screen',
    h('header.page-head', h('div', h('h1.display', L('Jalur Hafalan', 'Memory Path')),
      h('p.muted', L(`Mulai dari ${PATH_NEW} soal. Setiap tahap menambah ${PATH_NEW} soal baru dan mengulang ${PATH_OLD} soal lama, sampai kamu hafal ${st.total} soal.`, `Start with ${PATH_NEW} questions. Each stage adds ${PATH_NEW} new ones and repeats ${PATH_OLD} older ones, until you've memorized all ${fmt(st.total)}.`)))),
    cta, progress,
    h('ol.path-map', { 'aria-label': L('Peta tahap', 'Stage map') }, nodes),
    boxes);
}

/** Kartu ringkas untuk halaman Latihan & Beranda. */
export function pathTeaser(s, ctx) {
  const st = pathStatus(s);
  return h('a.path-teaser', { href: '#hafalan' },
    h('span.pt-icon', art(books())),
    h('span.grow',
      h('strong', L('Jalur Hafalan', 'Memory Path')),
      h('span.small.block', st.done ? L(`Semua soal dikenal. ${st.memorized}/${st.total} sudah hafal.`, `Every question known. ${st.memorized}/${st.total} memorized.`) : L(`Tahap ${st.stage + 1}. ${st.introduced}/${st.total} dikenal, ${st.memorized} hafal.`, `Stage ${st.stage + 1}. ${st.introduced}/${st.total} known, ${st.memorized} memorized.`)),
      progressBar(st.memorized / st.total, { tone: 'mint', label: L('Soal hafal', 'Questions memorized') })),
    h('span.pt-go', { 'aria-hidden': 'true' }, '›'));
}
