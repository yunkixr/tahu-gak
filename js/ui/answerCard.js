import { art, ICON, catArt } from './art.js';
// Kartu "Kenalan sama jawabannya": fakta, lokasi (kompas dari Jakarta), dan tautan keluar.

import { h, fmt } from './dom.js';
import { ANSWER_INFO, distanceAndBearing, wikiUrl, mapUrl, photoUrl } from '../data/answers.js';
import { QUESTION_BY_ID } from '../data/questions.js';
import { flag, countryName } from '../data/countries.js';
import { CATEGORY_BY_ID } from '../data/categories.js';
import { L } from '../core/i18n.js';

const EXT = '<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h4v4"/><path d="M13 3 7 9"/><path d="M12 9.5V13H3V4h3.5"/></svg>';

function extLink(label, href, icon) {
  return h('a.ans-link', { href, target: '_blank', rel: 'noopener noreferrer' },
    h('span', { 'aria-hidden': 'true' }, icon), h('span', label), h('span.ext', { html: EXT }));
}

function compass(bearing) {
  return h('div.compass', {
    role: 'img', 'aria-label': L(`Arah ${Math.round(bearing)} derajat dari utara`, `Bearing ${Math.round(bearing)} degrees from north`),
    html: `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="46" class="c-ring"/>
      <circle cx="50" cy="50" r="34" class="c-inner"/>
      <text x="50" y="13" class="c-n">${L('U', 'N')}</text><text x="89" y="54" class="c-l">${L('T', 'E')}</text>
      <text x="50" y="94" class="c-l">S</text><text x="11" y="54" class="c-l">${L('B', 'W')}</text>
      <g transform="rotate(${bearing.toFixed(1)} 50 50)">
        <path d="M50 20 L58 52 L50 47 L42 52 Z" class="c-arrow"/>
        <path d="M50 80 L56 52 L50 56 L44 52 Z" class="c-tail"/>
      </g>
      <circle cx="50" cy="50" r="4.5" class="c-dot"/>
    </svg>`,
  });
}

// Soal tanpa info khusus: kartu ringkas berisi jawaban + tautan pencarian Wikipedia.
// Jawaban berupa angka/rumus (mis. soal matematika) tidak dibuatkan kartu karena pencariannya tidak berguna.
function fallbackInfo(q) {
  const answer = q.options[q.answer];
  if (q.category === 'matematika' || !/\p{L}{3}/u.test(answer)) return null;
  return {
    kind: CATEGORY_BY_ID[q.category]?.name || L('Jawaban', 'Answer'),
    facts: [],
    wiki: answer.replace(/\s*\(.*?\)\s*/g, ' ').trim(),
  };
}

export function answerCard(qid, { compact = false } = {}) {
  const q = QUESTION_BY_ID[qid];
  if (!q) return null;
  const info = ANSWER_INFO[qid] || fallbackInfo(q);
  if (!info) return null;
  const title = info.title || q.options[q.answer];

  let placeBlock = null;
  if (info.place) {
    const p = info.place;
    const { km, bearing, dir } = distanceAndBearing(p);
    const rel = km < 40 ? L('Ada di Jakarta.', 'Right in Jakarta.') : L(`Sekitar ${fmt(Math.round(km / 10) * 10)} km ke arah ${dir} dari Jakarta.`, `About ${fmt(Math.round(km / 10) * 10)} km ${dir} of Jakarta.`);
    placeBlock = h('div.ans-place',
      km >= 40 ? compass(bearing) : h('div.compass.here', art(ICON.pin())),
      h('div.ans-place-text',
        h('strong', p.country ? h('span.flag', { title: countryName(p.country) }, flag(p.country), ' ') : '', p.label),
        h('p.small', rel),
        h('p.small.muted', `${Math.abs(p.lat).toFixed(2)}° ${p.lat >= 0 ? L('LU', 'N') : L('LS', 'S')}, ${Math.abs(p.lng).toFixed(2)}° ${p.lng >= 0 ? L('BT', 'E') : L('BB', 'W')}`)));
  }

  const links = [extLink(L('Baca di Wikipedia', 'Read on Wikipedia'), wikiUrl(info.wiki), '')];
  if (info.place) {
    links.push(extLink(L('Lihat di peta', 'View on map'), mapUrl(info.place), ''));
    links.push(extLink(L('Lihat foto', 'See photos'), photoUrl(info.place.label.split(',')[0]), ''));
  }

  const facts = info.facts.length ? h('ul.ans-facts', info.facts.map((f) => h('li', f))) : null;

  return h(`section.ans-card${compact ? '.compact' : ''}`, { 'aria-label': L(`Tentang ${title}`, `About ${title}`) },
    h('p.ans-kicker', L('Kenalan sama jawabannya', 'Get to know the answer')),
    h('div.ans-head', h('span.ans-icon', catArt(QUESTION_BY_ID[qid]?.category)),
      h('div', h('h4', title), h('span.ans-kind', info.kind))),
    facts,
    placeBlock,
    h('div.ans-links', links),
    h('p.ans-note', L('Tautan dibuka di luar aplikasi.', 'Links open outside the app.')));
}
