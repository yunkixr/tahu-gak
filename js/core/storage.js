// Penyimpanan lokal (localStorage) dengan cadangan di memori.
// localStorage bisa tidak tersedia (mode privat, iframe tertentu) — semua akses dibungkus try/catch.

const KEY = 'tahugak:state:v1';
let memory = null;
let available = null;

export function storageAvailable() {
  if (available !== null) return available;
  try {
    const t = '__tahugak_test__';
    localStorage.setItem(t, '1');
    localStorage.removeItem(t);
    available = true;
  } catch {
    available = false;
  }
  return available;
}

export function loadRaw() {
  if (storageAvailable()) {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('[tahu gak] gagal membaca progres lokal', e);
      return { __corrupt: true };
    }
  }
  return memory ? JSON.parse(memory) : null;
}

export function saveRaw(state) {
  const json = JSON.stringify(state);
  if (storageAvailable()) {
    try {
      localStorage.setItem(KEY, json);
      return true;
    } catch (e) {
      console.warn('[tahu gak] gagal menyimpan progres lokal', e);
    }
  }
  memory = json;
  return false;
}

export function clearRaw() {
  memory = null;
  if (storageAvailable()) {
    try { localStorage.removeItem(KEY); } catch { /* abaikan */ }
  }
}
