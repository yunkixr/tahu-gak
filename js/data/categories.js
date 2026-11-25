// Kategori soal. `id` dipakai di bank soal; `name` & `icon` untuk UI.
import { bi } from '../core/i18n.js';
export const CATEGORIES = [
  { id: 'sains',       name: 'Sains',            icon: '🔬', color: '#B9A7D3', tint: '#F1ECF7' },
  { id: 'sejarah',     name: 'Sejarah',          icon: '🏛️', color: '#CDA98A', tint: '#F7EFE7' },
  { id: 'geografi',    name: 'Geografi',         icon: '🌏', color: '#9DBDCB', tint: '#ECF3F6' },
  { id: 'teknologi',   name: 'Teknologi',        icon: '💻', color: '#B8A08A', tint: '#F4EEE8' },
  { id: 'matematika',  name: 'Matematika',       icon: '➗', color: '#D8BC79', tint: '#F8F0DC' },
  { id: 'sastra',      name: 'Sastra',           icon: '📚', color: '#D59AAF', tint: '#FBEEF2' },
  { id: 'seni',        name: 'Seni & Budaya',    icon: '🎭', color: '#E3A49A', tint: '#FBEDEA' },
  { id: 'olahraga',    name: 'Olahraga',         icon: '⚽', color: '#9FB38E', tint: '#EEF2E8' },
  { id: 'hiburan',     name: 'Hiburan',          icon: '🎬', color: '#C4A3C9', tint: '#F5EEF6' },
  { id: 'umum',        name: 'Pengetahuan Umum', icon: '💡', color: '#D9C27E', tint: '#F8F2DE' },
];

const EN_NAMES = {
  sains: 'Science', sejarah: 'History', geografi: 'Geography', teknologi: 'Technology', matematika: 'Math',
  sastra: 'Literature', seni: 'Arts & Culture', olahraga: 'Sports', hiburan: 'Entertainment', umum: 'General Knowledge',
};
CATEGORIES.forEach((c) => bi(c, 'name', EN_NAMES[c.id]));

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export const DIFFICULTY = {
  1: bi({ label: 'Mudah', dots: 1 }, 'label', 'Easy'),
  2: bi({ label: 'Sedang', dots: 2 }, 'label', 'Medium'),
  3: bi({ label: 'Sulit', dots: 3 }, 'label', 'Hard'),
};
