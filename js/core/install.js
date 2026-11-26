// Pasang aplikasi ke layar utama (versi aplikasi/PWA).
// Android/desktop Chrome: tangkap beforeinstallprompt lalu tampilkan tombol "Pasang" sendiri.
// iPhone: tidak ada prompt otomatis, jadi tampilkan langkah lewat tombol Bagikan Safari.

let deferred = null;
let installedNow = false;
const subs = new Set();
const notify = () => subs.forEach((f) => { try { f(); } catch { /* abaikan */ } });

export function initInstall() {
  if (typeof window === 'undefined') return;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; notify(); });
  window.addEventListener('appinstalled', () => { deferred = null; installedNow = true; notify(); });
}

export const onInstallChange = (f) => { subs.add(f); return () => subs.delete(f); };

export function isStandalone() {
  try {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  } catch { return false; }
}

const ua = () => (typeof navigator !== 'undefined' ? navigator.userAgent || '' : '');
export const isIOS = () => /iPhone|iPad|iPod/i.test(ua()) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
// Browser bawaan aplikasi lain (Instagram, Facebook, LINE, TikTok, WebView Android) tidak bisa memasang PWA.
export const isInAppBrowser = () => /FBAN|FBAV|Instagram|\bLine\/|TikTok|musical_ly|; wv\)/i.test(ua());
export const isAndroid = () => /Android/i.test(ua());
const isIOSSafari = () => isIOS() && /Safari/i.test(ua()) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua()) && !isInAppBrowser();

/** 'installed' | 'prompt' | 'ios' | 'ios-other' | 'inapp' | 'manual' */
export function installMode() {
  if (installedNow || isStandalone()) return 'installed';
  if (deferred) return 'prompt';
  if (isInAppBrowser()) return 'inapp';
  if (isIOS()) return isIOSSafari() ? 'ios' : 'ios-other';
  return 'manual';
}

/** Menampilkan dialog pasang bawaan Chrome. Hasil: 'accepted' | 'dismissed' | 'unavailable'. */
export async function promptInstall() {
  const e = deferred;
  if (!e) return 'unavailable';
  deferred = null;
  try {
    e.prompt();
    const choice = await e.userChoice;
    if (choice?.outcome === 'accepted') installedNow = true;
    return choice?.outcome || 'dismissed';
  } catch { return 'unavailable'; } finally { notify(); }
}

/** Link APK Android (TWA dari PWABuilder) di folder yang sama dengan aplikasi. */
export function apkUrl() {
  try { return new URL('tahu-gak.apk', appUrl()).href; } catch { return 'tahu-gak.apk'; }
}

/** Link aplikasi yang dibagikan: alamat saat ini tanpa hash/query. */
export function appUrl() {
  try { return location.origin + location.pathname; } catch { return ''; }
}
