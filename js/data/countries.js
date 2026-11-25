// Negara: kode ISO 3166-1 alpha-2. Nama diambil dari Intl.DisplayNames (bahasa Indonesia),
// bendera dibuat dari kode (regional indicator symbols).
import { L, getLang, locale } from '../core/i18n.js';

export const COUNTRY_CODES = (
  'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ ' +
  'CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR ' +
  'GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP ' +
  'KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT ' +
  'MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW ' +
  'SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG ' +
  'UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'
).split(' ');

const VALID = new Set(COUNTRY_CODES);
export const isCountry = (code) => typeof code === 'string' && VALID.has(code);

const NAMES = {};
function namesFor(lang) {
  if (!(lang in NAMES)) { try { NAMES[lang] = new Intl.DisplayNames([lang], { type: 'region' }); } catch { NAMES[lang] = null; } }
  return NAMES[lang];
}

export function countryName(code) {
  if (!isCountry(code)) return L('Tidak diketahui', 'Unknown');
  try { return namesFor(getLang())?.of(code) || code; } catch { return code; }
}

/** Kode negara dua huruf untuk label kecil (.flag / .p-flag). Sengaja bukan emoji bendera. */
export function flag(code) {
  return isCountry(code) ? code : '··';
}

/** Daftar negara terurut nama (Indonesia), dengan negara saran di depan. */
export function countryList() {
  return COUNTRY_CODES.map((code) => ({ code, name: countryName(code), flag: flag(code) }))
    .sort((a, b) => a.name.localeCompare(b.name, locale()));
}

const TZ_COUNTRY = {
  'Asia/Jakarta': 'ID', 'Asia/Pontianak': 'ID', 'Asia/Makassar': 'ID', 'Asia/Jayapura': 'ID',
  'Asia/Kuala_Lumpur': 'MY', 'Asia/Kuching': 'MY', 'Asia/Singapore': 'SG', 'Asia/Manila': 'PH', 'Asia/Bangkok': 'TH',
  'Asia/Ho_Chi_Minh': 'VN', 'Asia/Saigon': 'VN', 'Asia/Brunei': 'BN', 'Asia/Dili': 'TL', 'Asia/Tokyo': 'JP', 'Asia/Seoul': 'KR',
  'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN', 'Asia/Shanghai': 'CN', 'Asia/Hong_Kong': 'HK', 'Asia/Taipei': 'TW',
  'Europe/London': 'GB', 'Europe/Berlin': 'DE', 'Europe/Paris': 'FR', 'Europe/Amsterdam': 'NL', 'Europe/Madrid': 'ES',
  'Europe/Rome': 'IT', 'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Perth': 'AU', 'Pacific/Auckland': 'NZ',
};

/** Tebakan awal negara pengguna dari zona waktu / bahasa browser. Selalu dikonfirmasi pengguna. */
export function suggestCountry() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (TZ_COUNTRY[tz]) return TZ_COUNTRY[tz];
  } catch { /* abaikan */ }
  const langs = (typeof navigator !== 'undefined' && navigator.languages) || [];
  for (const l of langs) {
    const region = l.split('-')[1]?.toUpperCase();
    if (isCountry(region)) return region;
  }
  return null;
}
