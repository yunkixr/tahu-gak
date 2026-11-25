import { art, iconEl, catArt, ICON, rankArt, floralCorner, sparkle } from '../art.js';
// Layar kuis layar-penuh: intro → soal → umpan balik → hasil.

import { h, clear, fmt } from '../dom.js';
import { button, chip, progressBar, toggle, xpBurst, countUp, confetti, modal, confirmModal, badge, toast, termText, closeTermPopover, petalBurst, avatarEl } from '../components.js';
import { termsIn } from '../../data/glossary.js';
import { answerCard } from '../answerCard.js';
import { pathStatus, BOX_LABELS } from '../../core/path.js';
import { startSession, answerQuestion, nextQuestion, finishSession, useHint, HINT_MODES } from '../../core/quiz.js';
import { CATEGORY_BY_ID, DIFFICULTY } from '../../data/categories.js';
import { levelInfo, TIMER_SECONDS, XP } from '../../core/xp.js';
import { L } from '../../core/i18n.js';
import { isFresh } from '../../data/questions.js';
import { todayKey } from '../../core/dates.js';
import { DUEL_WIN_XP } from '../../core/duel.js';
import { storyButton, openStory } from '../shareUi.js';
import { dailySpec } from '../storyCard.js';
import { milestoneTitle } from '../../core/milestones.js';

const LETTERS = ['A', 'B', 'C', 'D'];

export function openQuiz(spec, ctx) {
  const { update, getState } = ctx;
  const layer = document.getElementById('quiz-layer');
  clear(layer);
  layer.hidden = false;
  document.body.classList.add('quiz-open');
  ctx.setQuizOpen(true);

  let session = null;
  let keyHandler = null;
  let timerId = null;
  let pendingLevelUp = null; // { timer, level, rankName }

  const close = () => {
    closeTermPopover();
    if (pendingLevelUp) {
      clearTimeout(pendingLevelUp.timer);
      toast(L(`Naik ke level ${pendingLevelUp.level}!${pendingLevelUp.rankName ? ` Gelar baru: ${pendingLevelUp.rankName}.` : ''}`, `Level ${pendingLevelUp.level} reached!${pendingLevelUp.rankName ? ` New title: ${pendingLevelUp.rankName}.` : ''}`), { tone: 'sun', duration: 4500 });
      pendingLevelUp = null;
    }
    clearInterval(timerId);
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
    if (!session || session.index >= session.items.length) { close(); return; }
    const isDaily = session.mode === 'daily';
    const ok = await confirmModal(L('Keluar dari kuis?', 'Leave the quiz?'),
      isDaily ? L('Jawabanmu sejauh ini tersimpan. Kamu bisa melanjutkan tantangan harian kapan saja hari ini.', 'Your answers so far are saved. You can finish the daily challenge anytime today.')
        : L('Jawaban yang sudah kamu periksa tetap tercatat, tapi sesi ini tidak dihitung selesai.', 'Answers you\'ve checked still count, but this session won\'t be marked complete.'),
      { confirmLabel: L('Keluar', 'Leave'), cancelLabel: L('Lanjut main', 'Keep playing') });
    if (ok) close();
  }

  // ───────────── Intro ─────────────
  function renderIntro() {
    const s = getState();
    const cat = spec.category ? CATEGORY_BY_ID[spec.category] : null;
    const resumed = spec.mode === 'daily' && s.dailyProgress?.day === spec.day ? s.dailyProgress.answers.length : 0;
    let useDouble = false;
    let useLife = false;

    const timerNote = () => {
      const on = getState().settings.timer;
      if (!on) return L('Tanpa batas waktu. Santai saja.', 'No time limit. Take it easy.');
      return spec.mode === 'daily'
        ? L(`Timer ${TIMER_SECONDS} detik hanya untuk bonus kecepatan. Waktu habis tidak membuatmu salah.`, `The ${TIMER_SECONDS}-second timer is only for a speed bonus. Running out of time doesn't count as wrong.`)
        : L(`Timer ${TIMER_SECONDS} detik per soal. Jawab cepat untuk bonus XP; kalau waktu habis, soal dihitung salah.`, `${TIMER_SECONDS} seconds per question. Answer fast for bonus XP; if time runs out, it counts as wrong.`);
    };
    const timerText = h('p.muted.small', timerNote());

    const boosts = [];
    if (s.boosts.doubleXpLeft > 0) {
      boosts.push(h('div.boost-row.active', h('span.boost-icon', iconEl('bolt')), h('div', h('strong', L('Double XP aktif', 'Double XP on')), h('p.small.muted', L(`${s.boosts.doubleXpLeft} soal tersisa.`, `${s.boosts.doubleXpLeft} questions left.`)))));
    } else if (s.inventory.doubleXp > 0) {
      boosts.push(h('div.boost-row', h('span.boost-icon', iconEl('bolt')), h('div', h('strong', 'Double XP'), h('p.small.muted', L(`Punya ${s.inventory.doubleXp}. 2× XP untuk ${XP.DOUBLE_XP_CHARGES} soal.`, `You have ${s.inventory.doubleXp}. 2× XP for ${XP.DOUBLE_XP_CHARGES} questions.`))),
        toggle(false, (v) => { useDouble = v; }, L('Pakai', 'Use'))));
    }
    if (s.inventory.extraLife > 0 && !(resumed && s.dailyProgress?.extraLife?.used)) {
      boosts.push(h('div.boost-row', h('span.boost-icon', iconEl('heart')), h('div', h('strong', L('Nyawa Ekstra', 'Extra Life')), h('p.small.muted', L(`Punya ${s.inventory.extraLife}. Terpakai hanya jika kamu salah.`, `You have ${s.inventory.extraLife}. Only used if you answer wrong.`))),
        toggle(false, (v) => { useLife = v; }, L('Siapkan', 'Arm'))));
    }

    const start = () => {
      session = update((st) => startSession(st, spec, { timer: st.settings.timer, useDoubleXp: useDouble, useExtraLife: useLife }), { silent: true });
      renderQuestion();
    };

    clear(layer).append(h('div.quiz-shell.intro',
      h('header.quiz-top', button(L('Tutup', 'Close'), { variant: 'ghost', size: 'sm', onClick: close })),
      h('div.intro-body',
        h('div.intro-mark', cat ? catArt(cat.id) : art(ICON[spec.fresh ? 'sparkle' : spec.mode === 'review' ? 'bow' : spec.mode === 'path' ? 'book' : spec.mode === 'duel' ? 'crown' : 'letter']())),
        h('h1.display', spec.mode === 'practice' && cat ? L(`Latihan ${cat.name}`, `${cat.name} practice`) : spec.mode === 'path' ? L(`Jalur Hafalan: ${spec.title}`, `Memory Path: ${spec.title}`) : spec.title),
        h('p.lead', spec.mode === 'daily' ? L('Lima soal dari lima kategori. Sama untuk semua pemain hari ini.', 'Five questions from five categories. The same for every player today.')
          : spec.mode === 'review' ? L('Soal yang pernah kamu jawab salah. Jawab benar untuk menguasainya.', 'Questions you got wrong before. Answer them right to master them.')
            : spec.mode === 'duel' ? L(`Lima soal yang sama untuk kamu dan ${spec.opponentName}. Skor lebih tinggi menang; kalau seri, yang lebih cepat menang.`, `The same five questions for you and ${spec.opponentName}. Higher score wins; on a tie, the faster player wins.`)
            : spec.mode === 'path' ? (spec.newIds.length ? L('Kenali soal baru, lalu ulangi soal lama supaya makin hafal. Urutannya diacak.', 'Meet new questions, then repeat older ones so they stick. The order is shuffled.') : L('Semua soal sudah kamu kenal. Putaran ini mengulang soal yang paling rawan lupa.', 'You know every question. This round repeats the ones you\'re most likely to forget.'))
              : spec.fresh ? L('Soal-soal yang baru ditambahkan minggu ini dan belum pernah kamu jawab.', 'Questions added this week that you haven\'t answered yet.')
              : L('Latihan bebas. Tidak memengaruhi tantangan harian.', 'Free practice. It doesn\'t affect the daily challenge.')),
        h('ul.intro-facts',
          h('li', h('strong', L(`${spec.items.length} soal`, `${spec.items.length} questions`)), resumed ? L(` (lanjut dari soal ${resumed + 1})`, ` (continuing from question ${resumed + 1})`) : ''),
          h('li', h('strong', `+${XP.CORRECT} XP`), L(' per jawaban benar', ' per correct answer')),
          spec.mode === 'daily' ? h('li', h('strong', `+${XP.DAILY_COMPLETE} XP`), L(' selesai, ', ' for finishing, '), h('strong', `+${XP.DAILY_PERFECT}`), L(' jika 5/5', ' for 5/5')) : null,
          spec.mode === 'review' ? h('li', h('strong', `+${XP.REVIEW_COMPLETE} XP`), L(' saat sesi ulasan selesai', ' when the review session is done')) : null,
          spec.mode === 'duel' ? h('li', h('strong', `+${DUEL_WIN_XP} XP`), L(' kalau menang', ' if you win')) : null,
          HINT_MODES.has(spec.mode) && (s.inventory.hint || 0) > 0 ? h('li', h('strong', L(`${s.inventory.hint} Petunjuk`, `${s.inventory.hint} Hint${s.inventory.hint > 1 ? 's' : ''}`)), L(' siap dipakai (coret 2 jawaban salah; XP soalnya tidak masuk Leaderboard)', ' ready to use (crosses out 2 wrong answers; that question\'s XP won\'t count on the Leaderboard)')) : null,
          spec.mode === 'path' ? h('li', h('strong', L(`${spec.newIds.length} baru + ${spec.oldIds.length} ulang`, `${spec.newIds.length} new + ${spec.oldIds.length} review`))) : null,
          spec.mode === 'path' && spec.oldIds.length ? h('li', h('strong', `+${XP.PATH_OLD} XP`), L(' per soal ulang benar', ' per review question right')) : null,
          spec.mode === 'path' ? h('li', h('strong', `+${spec.newIds.length ? XP.PATH_STAGE : XP.PATH_ROUND} XP`), L(' saat selesai', ' when done')) : null),
        h('div.intro-option', toggle(s.settings.timer, (v) => { update((st) => { st.settings.timer = v; }, { silent: true }); timerText.textContent = timerNote(); }, L('Mode timer', 'Timer mode')), timerText),
        boosts.length ? h('div.boosts', h('h3', 'Power-up'), boosts) : null,
      ),
      h('footer.quiz-footer', button(resumed ? L('Lanjutkan', 'Continue') : L('Mulai', 'Start'), { size: 'lg', onClick: start, cls: 'wide' })),
    ));
    setKeys((e) => { if (e.key === 'Enter') start(); });
    layer.querySelector('.quiz-footer .btn').focus();
  }

  // ───────────── Soal ─────────────
  function renderQuestion() {
    clearInterval(timerId);
    closeTermPopover();
    const item = session.items[session.index];
    const q = ctx.questionById(item.qid);
    const cat = CATEGORY_BY_ID[q.category];
    let selected = null;
    let phase = 'answer';
    const eliminated = new Set();
    let started = performance.now();
    let timeUp = false;

    const segs = session.items.map((_, i) => {
      const r = session.results[i];
      return h(`span.seg${i < session.index ? (r?.correct ? '.ok' : '.bad') : i === session.index ? '.now' : ''}`);
    });

    const opts = item.options.map((o, i) => h('button.option', {
      type: 'button', onclick: () => select(i), 'aria-pressed': 'false',
    }, h('span.key', LETTERS[i]), h('span.opt-text', o.text)));

    const checkBtn = button(L('Periksa', 'Check'), { size: 'lg', cls: 'wide', disabled: true, onClick: () => check() });

    // Petunjuk: coret 2 jawaban salah (sekali per soal).
    const hintsOwned = getState().inventory.hint || 0;
    const hintNote = h('p.hint-note', { 'aria-live': 'polite' });
    const hintBtn = HINT_MODES.has(session.mode) && hintsOwned > 0 && !session.hinted?.[session.index]
      ? button(L(`Petunjuk (${hintsOwned})`, `Hint (${hintsOwned})`), { variant: 'ghost', size: 'sm', icon: iconEl('bulb'), cls: 'hint-btn', title: L('Coret 2 jawaban salah. XP soal ini tidak masuk Leaderboard.', 'Cross out 2 wrong answers. This question\'s XP won\'t count on the Leaderboard.'), onClick: () => applyHint() })
      : null;
    function applyHint() {
      if (phase !== 'answer' || !hintBtn) return;
      const picked = update((st) => useHint(st, session, [...eliminated]), { silent: true });
      if (!picked) return;
      picked.forEach((i) => {
        eliminated.add(i);
        opts[i].classList.add('eliminated');
        opts[i].classList.remove('selected');
        opts[i].disabled = true;
        if (selected === i) { selected = null; checkBtn.disabled = true; }
      });
      hintBtn.remove();
      hintNote.textContent = L(`${picked.length} jawaban salah dicoret. XP soal ini tidak masuk Leaderboard. Sisa Petunjuk: ${getState().inventory.hint}.`, `${picked.length} wrong answers crossed out. XP from this question won't count on the Leaderboard. Hints left: ${getState().inventory.hint}.`);
    }
    const sheet = h('div.sheet', { 'aria-live': 'polite' });
    const footer = h('footer.quiz-footer', checkBtn);

    // Timer
    let timerEl = null;
    if (session.timer) {
      const R = 20, C = 2 * Math.PI * R;
      timerEl = h('div.timer', { html: `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="${R}" class="t-bg"/><circle cx="24" cy="24" r="${R}" class="t-fg" stroke-dasharray="${C}" stroke-dashoffset="0"/></svg><span class="t-num">${TIMER_SECONDS}</span>` });
      timerEl.title = L('Sisa waktu', 'Time left');
      const fg = () => timerEl.querySelector('.t-fg');
      const num = () => timerEl.querySelector('.t-num');
      timerId = setInterval(() => {
        const left = Math.max(0, TIMER_SECONDS - (performance.now() - started) / 1000);
        fg().style.strokeDashoffset = `${C * (1 - left / TIMER_SECONDS)}`;
        num().textContent = Math.ceil(left);
        timerEl.classList.toggle('low', left <= 5);
        if (left <= 0) {
          clearInterval(timerId);
          timeUp = true;
          timerEl.classList.add('done');
          if (session.mode === 'daily') {
            num().textContent = '0';
            toast(L('Waktu bonus habis. Jawab dengan santai, tidak ada penalti.', 'Bonus time is up. Take your time, there\'s no penalty.'), {});
          } else if (phase === 'answer') {
            check(true);
          }
        }
      }, 200);
    }

    const life = session.extraLife.armed
      ? chip(session.extraLife.used ? L('Nyawa terpakai', 'Life used') : L('Nyawa ekstra', 'Extra life'), { tone: session.extraLife.used ? 'muted' : 'red', icon: iconEl('heart') }) : null;
    const dbl = getState().boosts.doubleXpLeft > 0 ? chip(`2× XP: ${getState().boosts.doubleXpLeft}`, { tone: 'sun', icon: iconEl('bolt') }) : null;

    clear(layer).append(h('div.quiz-shell',
      h('header.quiz-top',
        button(L('Keluar', 'Leave'), { variant: 'ghost', size: 'sm', onClick: askQuit }),
        h('div.segs', { 'aria-label': L(`Soal ${session.index + 1} dari ${session.items.length}`, `Question ${session.index + 1} of ${session.items.length}`) }, segs),
        h('div.quiz-top-right', dbl, life, timerEl)),
      h('main.q-body',
        h('div.q-meta',
          chip(cat.name, { icon: catArt(cat.id), tone: 'cat' }),
          session.mode !== 'path' && isFresh(q, todayKey()) ? chip(L('Baru', 'New'), { tone: 'sun', icon: iconEl('sparkle') }) : null,
          session.mode === 'path' ? (session.newIds.includes(q.id)
            ? chip(L('Soal baru', 'New question'), { tone: 'sun', icon: iconEl('sparkle') })
            : chip(L(`Ulang: ${BOX_LABELS[getState().path.items[q.id]?.box ?? 0].toLowerCase()}`, `Review: ${BOX_LABELS[getState().path.items[q.id]?.box ?? 0].toLowerCase()}`), { tone: 'cobalt' })) : null,
          h('span.diff', { title: L(`Kesulitan: ${DIFFICULTY[q.difficulty].label}`, `Difficulty: ${DIFFICULTY[q.difficulty].label}`) },
            [1, 2, 3].map((d) => h(`i${d <= q.difficulty ? '.on' : ''}`)), DIFFICULTY[q.difficulty].label),
          h('span.q-count', `${session.index + 1}/${session.items.length}`)),
        h('div.bubble.q-bubble', h('p', termText(q.text, { qid: q.id, onLookup: ctx.lookupTerm }))),
        termsIn(q.text, q.id).length && !Object.keys(getState().glossarySeen || {}).length
          ? h('p.term-hint', L('Ada kata yang belum kamu tahu? Ketuk kata bergaris titik untuk melihat artinya.', 'Don\'t know a word? Tap a dotted word to see what it means.')) : null,
        h('div.options', { role: 'group', 'aria-label': L('Pilihan jawaban', 'Answer choices') }, opts),
        hintBtn || session.hinted?.[session.index] ? h('div.hint-row', hintBtn, hintNote) : null),
      sheet,
      footer));

    function select(i) {
      if (phase !== 'answer' || eliminated.has(i)) return;
      selected = i;
      opts.forEach((o, j) => { o.classList.toggle('selected', j === i); o.setAttribute('aria-pressed', String(j === i)); });
      checkBtn.disabled = false;
    }

    function check(timedOut = false) {
      if (phase !== 'answer' || (!timedOut && selected === null)) return;
      const elapsed = timeUp ? TIMER_SECONDS * 1000 + 1 : performance.now() - started;
      const res = update((st) => answerQuestion(st, session, timedOut ? null : selected, elapsed), { silent: true });

      if (res.retry) {
        phase = 'retry';
        eliminated.add(res.eliminated);
        opts[res.eliminated].classList.add('eliminated');
        opts[res.eliminated].classList.remove('selected');
        opts[res.eliminated].disabled = true;
        selected = null;
        checkBtn.disabled = true;
        showSheet('retry', h('div', h('h3', iconEl('heart'), L('Nyawa Ekstra terpakai', 'Extra Life used')), h('p', L('Pilihan itu salah, tapi kamu dapat satu kesempatan lagi.', 'That choice was wrong, but you get one more try.'))),
          button(L('Coba lagi', 'Try again'), { variant: 'sun', size: 'lg', cls: 'wide', onClick: () => { phase = 'answer'; hideSheet(); } }));
        return;
      }

      phase = 'feedback';
      clearInterval(timerId);
      opts.forEach((o, j) => {
        o.disabled = true;
        if (item.options[j].correct) o.classList.add('correct');
        else if (j === selected) o.classList.add('wrong');
      });
      const correctText = item.options.find((o) => o.correct).text;
      const head = res.correct
        ? h('h3', h('span.script', L(['Yeay!', 'Keren!', 'Asyik!', 'Hore!'], ['Yay!', 'Lovely!', 'Nice!', 'Hooray!'])[session.index % 4]), L(['Benar!', 'Tepat sekali!', 'Mantap!', 'Kamu tahu!'], ['Correct!', 'Spot on!', 'Great job!', 'You knew it!'])[session.index % 4])
        : h('h3', h('span.script', L('Hampir…', 'Almost…')), res.timedOut ? L('Waktu habis, tidak apa-apa', 'Time\'s up, that\'s okay') : L('Belum tepat, tidak apa-apa', 'Not quite, that\'s okay'));
      const xpLine = res.correct
        ? h('p.xp-line', `+${res.xp} XP`,
          res.bonus ? h('span', L(` (termasuk bonus cepat +${res.bonus})`, ` (including +${res.bonus} speed bonus)`)) : null,
          res.doubled ? h('span', L(' (digandakan)', ' (doubled)')) : null,
          res.repeat ? h('span', L(' (soal ulangan hari ini)', ' (repeat question today)')) : null,
          res.mastered ? h('span.mastered', L(' Kesalahan lama dikuasai!', ' Old mistake mastered!')) : null,
          res.hinted ? h('span.unranked', L(' · pakai Petunjuk, tidak masuk Leaderboard', ' · hint used, doesn\'t count on the Leaderboard')) : null)
        : h('p', L('Jawaban benar: ', 'Correct answer: '), h('strong', correctText), L('. Soal ini masuk ke daftar Ulas.', '. This question is added to Review.'));
      const pathLine = !res.path ? null
        : res.path.memorizedNow ? h('p.path-line.good', L('Hafal! Kamu sudah menjawab soal ini benar 3 kali berturut-turut.', 'Memorized! You\'ve answered this right 3 times in a row.'))
          : res.path.forgot ? h('p.path-line', L('Hampir hafal, tapi lupa. Soal ini kembali ke kotak awal dan muncul lagi di sesi berikutnya.', 'Almost memorized, but it slipped. It goes back to the first box and returns next session.'))
            : !res.correct ? h('p.path-line', L('Soal ini akan muncul lagi di tahap berikutnya.', 'This question will come back in the next stage.'))
              : h('p.path-line.good', L(`Naik ke kotak ${res.path.box} dari 5. ${res.path.box >= 3 ? '' : `Benar ${3 - res.path.box}× lagi untuk hafal.`}`, `Up to box ${res.path.box} of 5. ${res.path.box >= 3 ? '' : `${3 - res.path.box} more right to memorize it.`}`));
      showSheet(res.correct ? 'ok' : 'bad', h('div', head, xpLine, pathLine, h('p.expl', termText(q.explanation, { onLookup: ctx.lookupTerm })), answerCard(q.id)),
        button(session.index + 1 < session.items.length ? L('Lanjut', 'Next') : L('Lihat hasil', 'See results'), {
          variant: res.correct ? 'mint' : 'danger', size: 'lg', cls: 'wide', onClick: next,
        }));
      if (res.correct) { xpBurst(opts[selected] || checkBtn, res.xp); petalBurst(opts[selected] || checkBtn); }
      segs[session.index].classList.remove('now');
      segs[session.index].classList.add(res.correct ? 'ok' : 'bad');
    }

    function showSheet(tone, content, action) {
      sheet.className = `sheet show sheet-${tone}`;
      clear(sheet).append(h('div.sheet-inner', h('div.sheet-scroll', content), h('div.sheet-action', action)));
      footer.hidden = true;
      setTimeout(() => sheet.querySelector('.btn')?.focus(), 50);
    }
    function hideSheet() {
      sheet.className = 'sheet';
      clear(sheet);
      footer.hidden = false;
    }

    function next() {
      closeTermPopover();
      if (nextQuestion(session)) renderQuestion();
      else renderResults();
    }

    setKeys((e) => {
      const n = '1234'.indexOf(e.key) >= 0 ? '1234'.indexOf(e.key) : 'abcd'.indexOf(e.key.toLowerCase());
      if (phase === 'answer' && (e.key === 'h' || e.key === 'H' || e.key === 'p' || e.key === 'P') && hintBtn?.isConnected) { applyHint(); return; }
      if (phase === 'answer' && n >= 0 && n < opts.length && e.key.length === 1) { select(n); return; }
      if (e.key === 'Enter' && phase === 'answer' && selected !== null && !document.activeElement?.closest('.sheet, .term-pop, .term')) { e.preventDefault(); check(); }
    });
  }

  // ───────────── Hasil ─────────────
  function renderResults() {
    clearInterval(timerId);
    const sum = update((st) => finishSession(st, session), { silent: true });
    const s = getState();
    const lvStart = levelInfo(session.xpStart);
    const lvNow = levelInfo(s.xp.total);
    const ratio = sum.score / sum.total;
    const title = sum.perfect ? L('Sempurna!', 'Perfect!') : ratio >= 0.8 ? L('Mantap!', 'Great job!') : ratio >= 0.6 ? L('Lumayan!', 'Not bad!') : ratio >= 0.4 ? L('Terus belajar!', 'Keep learning!') : L('Tiap salah = bahan belajar', 'Every miss is something to learn');

    const xpTotalEl = h('span.big-num', '0');
    const rows = [
      h('li', h('span', L(`Jawaban benar (${sum.score}/${sum.total})`, `Correct answers (${sum.score}/${sum.total})`)), h('strong', `+${fmt(sum.answerXp)}`)),
      ...sum.bonuses.map((b) => h('li', h('span', b.label), h('strong', `+${b.xp}`))),
      ...(sum.duel?.xp ? [h('li', h('span', sum.duel.outcome === 'win' ? L('Menang duel', 'Duel won') : L('Duel seri', 'Duel tied')), h('strong', `+${sum.duel.xp}`))] : []),
      ...sum.missions.map((m) => h('li', h('span', L(`Misi: ${m.text}`, `Mission: ${m.text}`)), h('strong', `+${m.xp}`))),
      ...sum.unlocked.map((a) => h('li', h('span', L(`Pencapaian: ${a.name}`, `Achievement: ${a.name}`)), h('strong', `+${a.xp}`))),
    ];

    const ring = h('div.score-ring', { style: { '--p': ratio } }, h('div.score-inner', h('strong', `${sum.score}/${sum.total}`), h('span', L('benar', 'correct'))));

    const streakMsg = sum.streak.increased
      ? h('div.result-streak', h('span.flame.big', art(ICON.flame())), h('div', h('strong', L(`Streak ${sum.streak.current} hari!`, `${sum.streak.current}-day streak!`)), h('p.small.muted', sum.streak.current === 1 ? L('Streak baru dimulai. Kembali besok untuk menambahnya.', 'A new streak has started. Come back tomorrow to grow it.') : L('Hari ini sudah aman. Sampai besok!', 'Today is safe. See you tomorrow!'))))
      : null;

    const achievements = sum.unlocked.length
      ? h('div.result-ach', h('h3', L('Pencapaian baru', 'New achievements')), h('div.ach-row', sum.unlocked.map((a) => h('div.ach-mini', badge(a, true), h('strong', a.name)))))
      : null;

    const pathBlock = sum.path ? h('div.res-path',
      h('div.res-level-top', h('strong', sum.path.stageDone ? L(`Tahap ${sum.path.stageDone} selesai`, `Stage ${sum.path.stageDone} complete`) : L('Putaran ulang selesai', 'Review round complete')),
        sum.path.memorizedGained ? h('span.chip.chip-mint', L(`+${sum.path.memorizedGained} soal hafal`, `+${sum.path.memorizedGained} memorized`)) : null),
      h('div.pp-row', h('span', L('Dikenal', 'Known')), h('strong', `${sum.path.introduced}/${sum.path.total}`)),
      progressBar(sum.path.introduced / sum.path.total, { tone: 'cobalt', label: L('Soal dikenal', 'Questions known') }),
      h('div.pp-row', h('span', L('Hafal', 'Memorized')), h('strong', `${sum.path.memorized}/${sum.path.total}`)),
      progressBar(sum.path.memorized / sum.path.total, { tone: 'mint', label: L('Soal hafal', 'Questions memorized') })) : null;

    const duelBlock = sum.duel ? duelResult(sum.duel, session, getState().profile.avatarCfg) : null;
    const shareBlock = session.mode === 'daily' && getState().daily[session.day]
      ? h('div.res-share', h('p.small.muted', L('Pamerkan hasilmu tanpa membocorkan soalnya.', 'Show off your result without spoiling the questions.')),
        storyButton(() => dailySpec(getState(), session.day), { ctx, mission: true, variant: 'sun', size: null }))
      : sum.duel ? h('div.res-share', storyButton(() => ({ kind: 'duel', myScore: sum.duel.me.score, theirScore: sum.duel.them?.score ?? null, theirName: session.opponentName, theirAvatar: session.opponentAvatar || null, outcome: sum.duel.outcome, marks: sum.duel.me.marks, name: getState().profile.name, avatarCfg: getState().profile.avatarCfg }),
        { variant: 'ghost', size: null }))
        : null;

    const actions = [];
    if (session.mode === 'path') actions.push(button(pathStatus(getState()).done ? L('Putaran berikutnya', 'Next round') : L('Tahap berikutnya', 'Next stage'), { variant: 'ghost', size: 'lg', onClick: () => { close(); ctx.playPath(); } }));
    if (sum.mistakes.length && session.mode !== 'path') actions.push(button(L('Ulas kesalahan', 'Review mistakes'), { variant: 'ghost', size: 'lg', onClick: () => { close(); ctx.navigate('review'); } }));
    actions.push(button(L('Selesai', 'Done'), { size: 'lg', onClick: close, cls: 'grow' }));

    clear(layer).append(h('div.quiz-shell.results',
      h('main.res-body',
        avatarEl(getState().profile.avatarCfg, { cls: 'res-avatar' }),
        h('p.res-kicker', sum.perfect ? L('Sempurna!', 'Perfect!') : ratio >= 0.6 ? L('Kerja bagus!', 'Nice work!') : L('Semangat!', 'Keep going!')),
        ring,
        h('h1.display', title),
        duelBlock,
        h('div.res-xp', h('span', L('XP didapat', 'XP earned')), xpTotalEl),
        h('ul.xp-breakdown', rows),
        (() => { const n = session.results.filter((r) => r.hinted && r.correct).reduce((t, r) => t + r.xp, 0); return n > 0 ? h('p.small.muted.unranked-note', L(`${fmt(n)} XP dari soal yang memakai Petunjuk tetap masuk level & saldo, tapi tidak dihitung di Leaderboard.`, `${fmt(n)} XP from questions where you used a Hint still counts toward your level and balance, but not on the Leaderboard.`)) : null; })(),
        h('div.res-level',
          h('div.res-level-top', h('strong', `Level ${lvNow.level}`), h('span.muted', lvNow.rank.name), h('span.muted.small', `${fmt(lvNow.into)}/${fmt(lvNow.needed)} XP`)),
          progressBar(lvNow.pct, { tone: 'sun', animateFrom: lvNow.level > lvStart.level ? 0 : lvStart.pct, label: L('Progres level', 'Level progress') })),
        shareBlock,
        pathBlock,
        streakMsg,
        achievements),
      h('footer.quiz-footer.split', actions)));
    countUp(xpTotalEl, sum.xpEarned, { prefix: '+' });
    if (sum.perfect) confetti(110);

    if (sum.levelUp) {
      const rankChanged = lvNow.rank.level !== lvStart.rank.level;
      pendingLevelUp = { level: sum.levelUp, rankName: rankChanged ? lvNow.rank.name : null };
      pendingLevelUp.timer = setTimeout(() => {
        pendingLevelUp = null;
        confetti(140);
        modal({
          icon: (rankChanged ? rankArt(lvNow.rank.name) : art(ICON.star())).innerHTML, tone: 'sun',
          title: L(`Naik ke level ${sum.levelUp}!`, `Level ${sum.levelUp} reached!`),
          body: rankChanged ? L(`Gelar baru: ${lvNow.rank.name}. Keren!`, `New title: ${lvNow.rank.name}. Lovely!`) : L(`Butuh ${fmt(lvNow.needed)} XP untuk level berikutnya.`, `${fmt(lvNow.needed)} XP to the next level.`),
          actions: [{ label: L('Asyik!', 'Yay!') }],
        });
      }, 900);
    }
    if (sum.milestones?.length) showMilestone(sum.milestones[0], getState(), sum.levelUp ? 1900 : 700);
    setKeys((e) => { if (e.key === 'Enter' && !document.querySelector('#modals .overlay')) close(); });
  }

  renderIntro();
}

// ───────────── Milestone: kartu Story otomatis ─────────────
export function showMilestone(m, state, delay = 700) {
  setTimeout(() => {
    confetti(120);
    openStory({ kind: 'milestone', type: m.type, value: m.value, name: state.profile.name, avatarCfg: state.profile.avatarCfg }, {
      title: milestoneTitle(m),
      intro: m.type === 'questions' ? L('Keren banget! Ini kartu spesial buat dipamerin di Story.', 'Amazing! Here\'s a special card to show off on your Story.') : L('Konsisten banget! Ini kartu spesial buat dipamerin di Story.', 'So consistent! Here\'s a special card to show off on your Story.'),
    });
  }, delay);
}

// ───────────── Hasil duel ─────────────
function duelResult(d, spec, myAvatar) {
  const opponentName = spec.opponentName;
  const outcomeText = d.outcome === 'win' ? L('Kamu menang!', 'You won!') : d.outcome === 'lose' ? L(`${opponentName} menang kali ini`, `${opponentName} won this time`)
    : d.outcome === 'draw' ? L('Seri!', 'It\'s a tie!') : L(`Menunggu ${opponentName} main`, `Waiting for ${opponentName} to play`);
  const secs = (ms) => L(`${Math.round(ms / 1000)} dtk`, `${Math.round(ms / 1000)}s`);
  return h(`section.duel-res.out-${d.outcome || 'pending'}`,
    h('div.duel-side', avatarEl(myAvatar, { cls: 'duel-av' }), h('span.duel-name', L('Kamu', 'You')), h('strong.duel-score', String(d.me.score)), h('span.small.muted', secs(d.me.ms))),
    h('span.duel-vs', 'vs'),
    h('div.duel-side', spec.opponentAvatar ? avatarEl(spec.opponentAvatar, { cls: 'duel-av' }) : h('span.duel-av.ph', { 'aria-hidden': 'true' }, opponentName.slice(0, 1).toUpperCase()), h('span.duel-name', opponentName, d.kind === 'sim' ? h('span.small.muted', L(' (simulasi)', ' (simulated)')) : null),
      h('strong.duel-score', d.them ? String(d.them.score) : '…'), h('span.small.muted', d.them ? secs(d.them.ms) : L('belum main', 'not yet'))),
    h('p.duel-outcome', outcomeText),
    !d.them ? h('p.small.muted.duel-note', L('Hasilnya muncul di halaman Teman begitu lawanmu selesai main.', 'The result shows up on the Friends page once your opponent plays.')) : null);
}

