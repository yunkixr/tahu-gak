// Bahasa tampilan: 'id' (Bahasa Indonesia, bawaan) atau 'en' (English).
//
// - L('teks Indonesia', 'English text') memilih teks sesuai bahasa aktif. Dipakai langsung di UI.
// - bi(obj, 'field', enValue) membuat field data (soal, kategori, item avatar, …) otomatis
//   mengembalikan versi English saat bahasa aktif 'en', jadi kode lama yang membaca q.text dll. tetap jalan.
// - Bahasa disimpan di state.settings.lang; app memanggil setLang() setiap render.

export const LANGS = [
  { id: 'id', label: 'Bahasa Indonesia', short: 'ID' },
  { id: 'en', label: 'English', short: 'EN' },
];

let lang = 'id';

export const getLang = () => lang;
export const isEn = () => lang === 'en';

export function setLang(next) {
  lang = next === 'en' ? 'en' : 'id';
  if (typeof document !== 'undefined') document.documentElement.lang = lang;
  return lang;
}

export const normLang = (v) => (v === 'en' ? 'en' : 'id');

/** Pilih teks sesuai bahasa. `en` kosong → pakai teks Indonesia. */
export const L = (id, en) => (lang === 'en' && en !== undefined && en !== null ? en : id);

/** Kode locale untuk angka & tanggal. */
export const locale = () => (lang === 'en' ? 'en-US' : 'id-ID');

/** Jadikan obj[key] dua bahasa. Nilai asli dipakai untuk 'id'. */
export function bi(obj, key, en) {
  if (en === undefined || en === null) return obj;
  const idValue = obj[key];
  Object.defineProperty(obj, key, {
    get: () => (lang === 'en' ? en : idValue),
    set: () => {},
    enumerable: true,
    configurable: true,
  });
  return obj;
}

/** Bentuk jamak sederhana untuk English: plural(3, 'day') → '3 days'. */
export const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
