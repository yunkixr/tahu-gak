// Ikon navigasi (SVG garis, 24px).
const wrap = (d) => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

export const ICONS = {
  home: wrap('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h5v-6h4v6h5V9.5"/>'),
  practice: wrap('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>'),
  review: wrap('<path d="M4 12a8 8 0 0 1 14-5.3L20 9"/><path d="M20 4v5h-5"/><path d="M20 12a8 8 0 0 1-14 5.3L4 15"/><path d="M4 20v-5h5"/>'),
  league: wrap('<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4.5a3 3 0 0 0 3.5 4"/><path d="M16 6h3.5a3 3 0 0 1-3.5 4"/><path d="M12 13v4"/><path d="M8 21h8l-1-4H9z"/>'),
  profile: wrap('<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>'),
  shop: wrap('<path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'),
};
