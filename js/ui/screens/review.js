import { art, ICON, catArt, rose } from '../art.js';
import { h, fmt } from '../dom.js';
import { button, chip, emptyState, sectionTitle, termText } from '../components.js';
import { reviewPool, SESSION_SIZE } from '../../core/quiz.js';
import { QUESTION_BY_ID } from '../../data/questions.js';
import { CATEGORY_BY_ID } from '../../data/categories.js';
import { XP } from '../../core/xp.js';
import { keyFromDate, formatKey } from '../../core/dates.js';
import { answerCard } from '../answerCard.js';
import { L } from '../../core/i18n.js';

export function renderReview(s, ctx) {
  const pool = reviewPool(s);
  const mastered = Object.entries(s.mistakes)
    .filter(([id, m]) => m.mastered && QUESTION_BY_ID[id])
    .sort(([, a], [, b]) => b.masteredAt - a.masteredAt);

  const head = h('header.page-head',
    h('div', h('h1.display', L('Ulas', 'Review')), h('p.muted', L('Setiap soal yang kamu jawab salah disimpan di sini. Soal tetap muncul sampai kamu menjawabnya dengan benar.', 'Every question you get wrong is saved here. It keeps coming back until you answer it correctly.'))));

  if (!pool.length && !mastered.length) {
    return h('div.screen.review', head,
      emptyState(rose(), L('Belum ada kesalahan', 'No mistakes yet'), L('Soal yang kamu jawab salah akan muncul di sini supaya bisa kamu ulang sampai paham.', 'Questions you get wrong show up here so you can replay them until they stick.'),
        button(L('Main tantangan harian', 'Play the daily challenge'), { onClick: ctx.playDaily })));
  }

  const start = pool.length
    ? h('section.review-cta',
      h('div', h('strong.big', L(`${pool.length} soal perlu diulang`, `${pool.length} to review`)),
        h('p.small', L(`Sesi berisi ${Math.min(SESSION_SIZE, pool.length)} soal, mulai dari yang paling sering salah. +${XP.REVIEW_COMPLETE} XP saat selesai.`, `A session has ${Math.min(SESSION_SIZE, pool.length)} questions, starting with the ones you miss most. +${XP.REVIEW_COMPLETE} XP when done.`))),
      button(L('Mulai ulasan', 'Start review'), { variant: 'sun', size: 'lg', onClick: ctx.playReview }))
    : h('section.review-cta.done', h('div', h('strong.big', L('Semua kesalahan sudah dikuasai!', 'Every mistake mastered!')), h('p.small', L('Mainkan kuis lagi; soal yang salah akan kembali ke sini.', 'Play more quizzes; anything you miss will come back here.'))));

  const list = pool.map((m, i) => mistakeRow(m.id, m, i < SESSION_SIZE, ctx));
  const masteredList = mastered.map(([id, m]) => {
    const q = QUESTION_BY_ID[id];
    return h('li.m-row.mastered',
      h('span.m-check', art(ICON.check(), 'ico')),
      h('div.m-text', h('p', q.text), h('p.small.muted', L(`Jawaban: ${q.options[q.answer]}. Dikuasai ${formatKey(keyFromDate(new Date(m.masteredAt)), { withYear: false })}.`, `Answer: ${q.options[q.answer]}. Mastered ${formatKey(keyFromDate(new Date(m.masteredAt)), { withYear: false })}.`))));
  });

  return h('div.screen.review', head, start,
    pool.length ? sectionTitle(L('Perlu diulang', 'To review'), chip(`${pool.length}`, { tone: 'red' })) : null,
    pool.length ? h('ol.m-list', list) : null,
    mastered.length ? h('details.mastered-block', h('summary', h('span', L('Sudah dikuasai', 'Mastered')), chip(fmt(mastered.length), { tone: 'mint' })), h('ul.m-list', masteredList)) : null);
}

function mistakeRow(id, m, next, ctx) {
  const q = QUESTION_BY_ID[id];
  const cat = CATEGORY_BY_ID[q.category];
  const reveal = h('details.reveal', h('summary', L('Lihat jawaban', 'Show answer')),
    h('p', h('strong', q.options[q.answer])), h('p.small.muted', termText(q.explanation, { onLookup: ctx.lookupTerm })), answerCard(id, { compact: true }));
  return h('li.m-row',
    h('div.m-heat', { title: L(`Salah ${m.wrongCount} kali`, `Missed ${m.wrongCount} ${m.wrongCount === 1 ? 'time' : 'times'}`), class: m.wrongCount >= 3 ? 'hot' : m.wrongCount === 2 ? 'warm' : '' }, `${m.wrongCount}×`),
    h('div.m-text',
      h('div.m-tags', chip(cat.name, { icon: catArt(cat.id), tone: 'cat' }), next ? chip(L('Sesi berikutnya', 'Next session'), { tone: 'sun' }) : null),
      h('p', termText(q.text, { qid: id, onLookup: ctx.lookupTerm })),
      reveal));
}
