// Username unik (@handle) untuk mencari teman. Nama biasa (profile.name) tetap bebas dan boleh sama.
// Keunikan dijaga server: dokumen Firestore `usernames/{username}` = { uid }, hanya bisa dibuat kalau belum ada.

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const USERNAME_RE = /^[a-z0-9._]{3,20}$/;

const RESERVED = new Set([
  'admin', 'administrator', 'root', 'support', 'help', 'official', 'resmi', 'moderator', 'mod', 'staff',
  'tahugak', 'tahu_gak', 'tahu.gak', 'system', 'sistem', 'null', 'undefined', 'anonymous', 'anonim', 'claude', 'anthropic',
]);

/** "@Budi.Santoso " -> "budi.santoso" */
export function normalizeUsername(s) {
  return String(s ?? '').trim().replace(/^@+/, '').toLowerCase();
}

/** null kalau valid; kalau tidak, kode alasan: short | long | chars | dots | reserved */
export function usernameProblem(u) {
  if (typeof u !== 'string' || u.length < USERNAME_MIN) return 'short';
  if (u.length > USERNAME_MAX) return 'long';
  if (!USERNAME_RE.test(u)) return 'chars';
  if (u.startsWith('.') || u.endsWith('.') || u.includes('..')) return 'dots';
  if (RESERVED.has(u)) return 'reserved';
  return null;
}

export const isValidUsername = (u) => usernameProblem(u) === null;

/** Usulan dari nama biasa: "Laras Ayu!" -> "larasayu" (+ angka kalau terlalu pendek). */
export function suggestUsername(name, rnd = Math.random) {
  let base = String(name ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/\s+/g, '').replace(/[^a-z0-9._]/g, '').replace(/\.{2,}/g, '.').replace(/^\.+|\.+$/g, '')
    .slice(0, 14);
  if (base.length < USERNAME_MIN || RESERVED.has(base)) base = (base + 'pemain').slice(0, 14);
  return base + String(Math.floor(rnd() * 900) + 100);
}
