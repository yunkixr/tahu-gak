// Layar Mode Kilat (layar penuh): intro → 60 detik soal beruntun → hasil.

import { art, ICON, catArt } from '../art.js';
import { h, clear, fmt } from '../dom.js';
import { button, chip, confirmModal, confetti, countUp, toast } from '../components.js';
import { toItem } from '../../core/quiz.js';
import { buildKilat, recordKilatAnswer, finishKilat, KILAT_SECONDS, KILAT_XP } from '../../core/kilat.js';
import { CATEGORY_BY_ID } from '../../data/categories.js';
import { storyButton } from '../shareUi.js';
import { showMilestone } from './quiz.js';
import { L } from '../../core/i18n.js';

const LETTERS = ['A', 'B', 'C', 'D'];

export function openKilat(ctx) {
  const { update, getState } = ctx;
  const layer = document.getElementById('quiz-layer');
  clear(layer);
  layer.hidden = false;
  document.body.classList.add('quiz-open');
  ctx.setQuizOpen(true);

  let keyHandler = null;
  let tickId = null;
  let flashId = null;
  let round = null; // { items, index, score, answered, wrong: [], combo, endAt }

  const close = () => {
    clearInterval(tickId);
    clearTimeout(flashId);
    document.removeEventListener('keydown', keyHandler);
    layer.hidden = true;
    clear(layer);
    document.body.classList.remove('quiz-open');
    ctx.setQuizOpen(false);
    ctx.onClose?.();
  };
  const setKeys = (fn) => {
    document.removeEventListener('keydown', keyHandler);
    keyHandler = (e) => {
      if (document.querySelector('#modals .overlay')) return;
      if (e.key === 'Escape') { e.preventDefault(); askQuit(); return; }
      fn?.(e);
    };
    document.addEventListener('keydown', keyHandler);
  };
  async function askQuit() {
    if (!round || round.done) { close(); return; }
    const ok = await confirmModal(L('Keluar dari ronde Kilat?', 'Leave this Lightning round?'),
      L('Ronde ini tidak dihitung dan tidak memberi XP.', 'This round won\'t count and gives no XP.'),
      { confirmLabel: L('Keluar', 'Leave'), cancelLabel: L('Lanjut main', 'Keep playing') });
    if (ok) close();
  }

  // ───────────── Intro ─────────────
  function renderIntro() {
    const k = getState().kilat || {};
    clear(layer).append(h('div.quiz-shell.intro.kilat',
      h('header.quiz-top', button(L('Tutup', 'Close'), { variant: 'ghost', size: 'sm', onClick: close })),
      h('div.intro-body',
        h('div.intro-mark', art(ICON.bolt())),
        h('h1.display', L('Mode Kilat', 'Lightning Mode')),
        h('p.lead', L(`Jawab sebanyak mungkin dalam ${KILAT_SECONDS} detik. Begitu kamu memilih, soal berikutnya langsung muncul.`, `Answer as many as you can in ${KILAT_SECONDS} seconds. The next question appears as soon as you choose.`)),
        h('ul.intro-facts',
          h('li', h('strong', `+${KILAT_XP} XP`), L(' per jawaban benar', ' per correct answer')),
          h('li', L('Salah tidak mengurangi skor dan tidak masuk daftar ulasan.', 'Wrong answers don\'t lower your score and aren\'t added to your review list.')),
          h('li', L('Pakai tombol 1–4 atau A–D supaya lebih cepat.', 'Use keys 1–4 or A–D to go faster.'))),
        k.best ? h('p.kilat-best', art(ICON.crown(), 'ico'), L(`Rekormu: ${k.best} benar`, `Your best: ${k.best} right`)) : null),
      h('footer.quiz-footer', button(L('Mulai', 'Start'), { variant: 'sun', size: 'lg', cls: 'wide', onClick: start }))));
    setKeys((e) => { if (e.key === 'Enter') { e.preventDefault(); start(); } });
  }

  function start() {
    round = { items: buildKilat(toItem), index: 0, score: 0, answered: 0, wrong: [], cats: {}, combo: 0, endAt: performance.now() + KILAT_SECONDS * 1000, done: false, missions: [] };
    renderQuestion();
    tickId = setInterval(tick, 100);
  }

  function tick() {
    const left = Math.max(0, round.endAt - performance.now());
    const bar = layer.querySelector('.kilat-bar > i');
    const num = layer.querySelector('.kilat-time');
    if (bar) bar.style.transform = `scaleX(${left / (KILAT_SECONDS * 1000)})`;
    if (num) { num.textContent = String(Math.ceil(left / 1000)); num.parentElement.classList.toggle('low', left <= 10000); }
    if (left <= 0) finish();
  }

  // ───────────── Soal ─────────────
  function renderQuestion() {
    if (round.index >= round.items.length) round.index = 0;
    const item = round.items[round.index];
    const q = ctx.questionById(item.qid);
    const cat = CATEGORY_BY_ID[q.category];
    let locked = false;

    const opts = item.options.map((o, i) => h('button.option', { type: 'button', onclick: () => pick(i) }, h('span.key', LETTERS[i]), h('span.opt-text', o.text)));

    function pick(i) {
      if (locked || round.done) return;
      locked = true;
      const correct = !!item.options[i].correct;
      round.answered++;
      round.combo = correct ? round.combo + 1 : 0;
      if (correct) { round.score++; round.cats[q.category] = (round.cats[q.category] || 0) + 1; } else round.wrong.push({ qid: q.id, chosen: item.options[i].text });
      const missions = update((st) => recordKilatAnswer(st, q, correct, round.combo), { silent: true });
      round.missions.push(...missions);
      opts.forEach((o, j) => { o.disabled = true; if (item.options[j].correct) o.classList.add('correct'); else if (j === i) o.classList.add('wrong'); });
      const sc = layer.querySelector('.kilat-score strong');
      if (sc) { sc.textContent = String(round.score); sc.parentElement.classList.remove('pop'); void sc.offsetWidth; if (correct) sc.parentElement.classList.add('pop'); }
      flashId = setTimeout(() => { round.index++; if (!round.done) renderQuestion(); }, correct ? 260 : 650);
    }

    const left = Math.max(0, round.endAt - performance.now());
    clear(layer).append(h('div.quiz-shell.kilat',
      h('header.quiz-top',
        button(L('Keluar', 'Leave'), { variant: 'ghost', size: 'sm', onClick: askQuit }),
        h('div.kilat-bar', { role: 'progressbar', 'aria-label': L('Sisa waktu', 'Time left'), 'aria-valuemin': 0, 'aria-valuemax': KILAT_SECONDS },
          h('i', { style: { transform: `scaleX(${left / (KILAT_SECONDS * 1000)})` } })),
        h('div.kilat-clock', art(ICON.bolt(), 'ico'), h('span.kilat-time', String(Math.ceil(left / 1000))))),
      h('main.q-body',
        h('div.q-meta',
          chip(cat.name, { icon: catArt(cat.id), tone: 'cat' }),
          h('span.kilat-score', { 'aria-live': 'polite' }, L('Benar ', 'Right '), h('strong', String(round.score)))),
        h('div.bubble.q-bubble', h('p', q.text)),
        h('div.options', { role: 'group', 'aria-label': L('Pilihan jawaban', 'Answer choices') }, opts))));
    setKeys((e) => {
      const n = ['1', '2', '3', '4'].indexOf(e.key) >= 0 ? Number(e.key) - 1 : LETTERS.indexOf(e.key.toUpperCase());
      if (n >= 0 && n < opts.length && e.key.length === 1) pick(n);
    });
  }

  // ───────────── Hasil ─────────────
  function finish() {
    if (round.done) return;
    round.done = true;
    clearInterval(tickId);
    clearTimeout(flashId);
    const sum = update((st) => finishKilat(st, { score: round.score, answered: round.answered, cats: round.cats }), { silent: true });
    const missions = [...round.missions, ...sum.missions];
    const xpEl = h('span.big-num', '0');
    const rows = [
      h('li', h('span', L(`Jawaban benar (${sum.score})`, `Correct answers (${sum.score})`)), h('strong', `+${fmt(sum.xp)}`)),
      ...missions.map((m) => h('li', h('span', L(`Misi: ${m.text}`, `Mission: ${m.text}`)), h('strong', `+${m.xp}`))),
      ...sum.unlocked.map((a) => h('li', h('span', L(`Pencapaian: ${a.name}`, `Achievement: ${a.name}`)), h('strong', `+${a.xp}`))),
    ];
    const wrong = round.wrong.slice(0, 8).map((w) => {
      const q = ctx.questionById(w.qid);
      return h('li', h('p.kw-q', q.text), h('p.kw-a', h('span.muted', L('Jawaban: ', 'Answer: ')), h('strong', q.options[q.answer])));
    });
    const recordLine = sum.newBest ? h('p.kilat-record', art(ICON.crown(), 'ico'), L(`Rekor baru! Sebelumnya ${sum.prevBest}.`, `New record! Previous best: ${sum.prevBest}.`))
      : h('p.muted', L(`Rekormu: ${sum.best} benar`, `Your best: ${sum.best} right`));

    clear(layer).append(h('div.quiz-shell.results.kilat',
      h('main.res-body',
        h('p.res-kicker', L('Waktu habis!', 'Time\'s up!')),
        h('div.score-ring.kilat-ring', { style: { '--p': Math.min(1, sum.score / Math.max(sum.best, 10)) } },
          h('div.score-inner', h('strong', String(sum.score)), h('span', L('benar', 'right')))),
        h('h1.display', sum.score >= 15 ? L('Secepat kilat!', 'Lightning fast!') : sum.score >= 8 ? L('Gesit!', 'Quick!') : L('Pemanasan dulu', 'Just warming up')),
        recordLine,
        h('p.small.muted', L(`${sum.answered} soal dijawab`, `${sum.answered} answered`)),
        h('div.res-xp', h('span', L('XP didapat', 'XP earned')), xpEl),
        h('ul.xp-breakdown', rows),
        wrong.length ? h('section.kilat-wrong', h('h3', L('Yang tadi salah', 'The ones you missed')), h('ul', wrong)) : null),
      h('footer.quiz-footer.split',
        storyButton(() => ({ kind: 'kilat', score: sum.score, best: sum.best, newBest: sum.newBest || sum.firstBest, name: getState().profile.name, avatarCfg: getState().profile.avatarCfg }), { size: 'lg' }),
        button(L('Main lagi', 'Play again'), { variant: 'ghost', size: 'lg', onClick: () => { round = null; renderIntro(); } }),
        button(L('Selesai', 'Done'), { size: 'lg', onClick: close, cls: 'grow' }))));
    countUp(xpEl, sum.xpEarned, { prefix: '+' });
    if (sum.newBest || sum.firstBest) confetti(80);
    if (sum.milestones?.length) showMilestone(sum.milestones[0], getState(), 900);
    if (sum.levelUp) toast(L(`Naik ke level ${sum.levelUp}!`, `Level ${sum.levelUp} reached!`), { tone: 'sun' });
    setKeys((e) => { if (e.key === 'Enter' && !document.activeElement?.closest('button')) close(); });
  }

  renderIntro();
}
