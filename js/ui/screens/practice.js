import { h, fmt } from '../dom.js';
import { progressBar, toggle } from '../components.js';
import { CATEGORIES } from '../../data/categories.js';
import { QUESTIONS } from '../../data/questions.js';
import { TIMER_SECONDS } from '../../core/xp.js';
import { pathTeaser } from './path.js';
import { catArt, art, ICON } from '../art.js';
import { button } from '../components.js';
import { L } from '../../core/i18n.js';

export function renderPractice(s, ctx) {
  const tiles = CATEGORIES.map((c) => {
    const st = s.catStats[c.id] || { answered: 0, correct: 0, sessions: 0 };
    const total = QUESTIONS.filter((q) => q.category === c.id).length;
    const seen = QUESTIONS.filter((q) => q.category === c.id && s.answers[q.id]).length;
    const acc = st.answered ? st.correct / st.answered : 0;
    return h('button.cat-tile', { type: 'button', style: { '--cat': c.color, '--tint': c.tint }, onclick: () => ctx.playPractice(c.id) },
      h('span.cat-icon', catArt(c.id)),
      h('span.cat-name', c.name),
      h('span.cat-meta', st.answered ? L(`Akurasi ${Math.round(acc * 100)}%`, `${Math.round(acc * 100)}% accuracy`) : L('Belum dimainkan', 'Not played yet')),
      progressBar(st.answered ? acc : 0, { tone: 'cat', label: L(`Akurasi ${c.name}`, `${c.name} accuracy`) }),
      h('span.cat-foot', L(`${seen}/${total} soal pernah dilihat`, `${seen}/${total} questions seen`), st.sessions ? L(`, ${fmt(st.sessions)} sesi`, `, ${fmt(st.sessions)} ${st.sessions === 1 ? 'session' : 'sessions'}`) : ''));
  });

  return h('div.screen.practice',
    h('header.page-head',
      h('div', h('span.script', L('Ruang belajar', 'Study room')), h('h1.display', L('Latihan', 'Practice')), h('p.muted', L('Pilih kategori dan main sepuasnya. Latihan tidak mengubah tantangan harianmu, tapi tetap menjaga streak.', 'Pick a category and play as much as you like. Practice doesn\'t change your daily challenge, but it still keeps your streak.')))),
    pathTeaser(s, ctx),
    h('div.mode-row',
      modeCard('bolt', L('Mode Kilat', 'Lightning Mode'), s.kilat?.best ? L(`60 detik, jawab sebanyak mungkin. Rekormu ${s.kilat.best}.`, `60 seconds, answer as many as you can. Your best: ${s.kilat.best}.`) : L('60 detik, jawab sebanyak mungkin.', '60 seconds, answer as many as you can.'), L('Main', 'Play'), () => ctx.playKilat()),
      modeCard('crown', L('Duel teman', 'Friend duel'), L('Tantang teman dengan 5 soal yang sama.', 'Challenge a friend with the same 5 questions.'), L('Tantang', 'Challenge'), () => ctx.navigate('teman')),
      modeCard('star', L('Rapor', 'Report'), L('Lihat kategori terkuat dan yang perlu dilatih.', 'See your strongest categories and what to practice.'), L('Lihat', 'View'), () => ctx.navigate('rapor'))),
    h('div.setting-inline',
      toggle(s.settings.timer, (v) => ctx.update((st) => { st.settings.timer = v; }), L('Mode timer', 'Timer mode')),
      h('span.small.muted', s.settings.timer ? L(`${TIMER_SECONDS} detik per soal, bonus XP untuk jawaban cepat.`, `${TIMER_SECONDS} seconds per question, bonus XP for quick answers.`) : L('Mati. Main santai tanpa batas waktu.', 'Off. Play at your own pace.'))),
    h('div.cat-grid', tiles));
}

function modeCard(icon, title, text, cta, onClick) {
  return h('div.mode-card', h('span.mode-icon', art(ICON[icon]())), h('div.grow', h('strong', title), h('p.small.muted', text)), button(cta, { size: 'sm', variant: 'ghost', onClick }));
}
