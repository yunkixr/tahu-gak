import { isEn } from './i18n.js';

// Semua logika tanggal memakai "kunci hari" lokal berformat YYYY-MM-DD.
// Selisih hari dihitung lewat Date.UTC supaya aman dari pergantian DST.

const pad = (n) => String(n).padStart(2, '0');

export function keyFromDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayKey(now = new Date()) {
  return keyFromDate(now);
}

export function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return { y, m, d };
}

/** Nomor hari sejak epoch (UTC) untuk sebuah kunci hari. */
export function dayNumber(key) {
  const { y, m, d } = parseKey(key);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
}

export function keyFromDayNumber(n) {
  const d = new Date(n * 86400000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function addDays(key, n) {
  return keyFromDayNumber(dayNumber(key) + n);
}

/** b - a dalam hari. */
export function diffDays(a, b) {
  return dayNumber(b) - dayNumber(a);
}

/** 0 = Senin … 6 = Minggu */
export function weekday(key) {
  const { y, m, d } = parseKey(key);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

/** Kunci minggu = tanggal hari Senin minggu itu. */
export function weekKeyOf(key) {
  return addDays(key, -weekday(key));
}

export function weekDays(weekKey) {
  return Array.from({ length: 7 }, (_, i) => addDays(weekKey, i));
}

/** Seberapa jauh minggu ini sudah berjalan (0..1), dibulatkan per jam. */
export function weekFraction(now = new Date()) {
  const monday = weekKeyOf(keyFromDate(now));
  const { y, m, d } = parseKey(monday);
  const start = new Date(y, m - 1, d).getTime();
  const hours = Math.floor((now.getTime() - start) / 3600000);
  return Math.min(1, Math.max(0, hours / (7 * 24)));
}

export function msUntilMidnight(now = new Date()) {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime();
}

export function msUntilWeekEnd(now = new Date()) {
  const monday = weekKeyOf(keyFromDate(now));
  const { y, m, d } = parseKey(addDays(monday, 7));
  return new Date(y, m - 1, d).getTime() - now.getTime();
}

// ───────────── Periode kompetisi (UTC) ─────────────
// Liga & papan peringkat memakai batas UTC agar sama untuk semua negara.
// Streak & tantangan harian tetap memakai tanggal lokal.

export const utcDayKey = (now = new Date()) => now.toISOString().slice(0, 10);
export const utcWeekKey = (now = new Date()) => weekKeyOf(utcDayKey(now));
export const utcMonthKey = (now = new Date()) => now.toISOString().slice(0, 7);

/** Waktu (Date) dimulainya minggu UTC berikutnya. */
export function nextUtcWeekStart(now = new Date()) {
  const { y, m, d } = parseKey(addDays(utcWeekKey(now), 7));
  return new Date(Date.UTC(y, m - 1, d));
}
export function nextUtcMonthStart(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
}
/** Seberapa jauh minggu UTC berjalan (0..1), dibulatkan per jam. */
export function utcWeekFraction(now = new Date()) {
  const start = nextUtcWeekStart(now).getTime() - 7 * 86400000;
  return Math.min(1, Math.max(0, Math.floor((now.getTime() - start) / 3600000) / (7 * 24)));
}
export function utcMonthFraction(now = new Date()) {
  const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
  const end = nextUtcMonthStart(now).getTime();
  return Math.min(1, Math.max(0, Math.floor((now.getTime() - start) / 3600000) / ((end - start) / 3600000)));
}
export function daysInUtcMonth(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** "Senin, 30 November pukul 07.00" / "Monday, November 30 at 07:00" dalam waktu lokal. */
export function formatLocalDateTime(date) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  if (isEn()) return `${DAYS_LONG_EN[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()} at ${hh}:${mm}`;
  return `${DAYS_LONG_ID[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} pukul ${hh}.${mm}`;
}

const DAYS_LONG_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const DAYS_LONG_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
// Daftar dua bahasa: indeks, length, map, dll. mengikuti bahasa aktif.
const biList = (id, en) => new Proxy(id, { get: (_, k) => Reflect.get(isEn() ? en : id, k) });
export const MONTHS = biList(
  ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
  ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']);
export const DAYS_SHORT = biList(['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'], ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

export function formatKey(key, { withYear = true } = {}) {
  const { y, m, d } = parseKey(key);
  if (isEn()) return `${MONTHS[m - 1]} ${d}${withYear ? ', ' + y : ''}`;
  return `${d} ${MONTHS[m - 1]}${withYear ? ' ' + y : ''}`;
}

export function formatDuration(ms) {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const days = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  if (isEn()) {
    if (days > 0) return `${days}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m} min`;
  }
  if (days > 0) return `${days} hari ${h} jam`;
  if (h > 0) return `${h} jam ${m} menit`;
  return `${m} menit`;
}
