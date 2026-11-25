// Database item avatar: setiap item punya id unik, slot, nama, kelangkaan, warna bawaan,
// syarat buka, koleksi, dan resep gambar (`r`) yang dibaca renderer (avatarRender.js).
// Semua gambar dibuat sendiri dalam SVG; tidak ada aset eksternal.

import { bi, L } from './i18n.js';
import { MONTHS } from './dates.js';

// ───────────── Palet ─────────────
export const SKIN = ['#FCE7DA', '#F8DCC8', '#F3CFB6', '#EBC19F', '#E2AE8C', '#D49C77', '#C38C67', '#AD7752', '#94624A', '#7C5039', '#664333', '#4E3226'];
export const BG = ['#F3C9D3', '#E3D6EE', '#DCE5CE', '#F2E2BE', '#D5E3EC', '#F2D8CC', '#E9E2D6', '#F6E7EC'];
export const HAIR_COLORS = [
  { c: '#2B2427', n: 'Hitam' }, { c: '#4B3329', n: 'Cokelat tua' }, { c: '#6B4430', n: 'Cokelat' }, { c: '#8A5E42', n: 'Cokelat muda' },
  { c: '#D8B47E', n: 'Pirang' }, { c: '#EDE3CF', n: 'Pirang platina' }, { c: '#8C3F2E', n: 'Auburn' }, { c: '#C8693A', n: 'Jahe' },
  { c: '#E3A9BC', n: 'Merah muda' }, { c: '#B9A3D6', n: 'Lavender' }, { c: '#BFBCC3', n: 'Perak' }, { c: '#A9C3E0', n: 'Biru pastel' },
  { c: '#B5D3BE', n: 'Mint' }, { c: '#F2C1A5', n: 'Persik' },
];
export const EYE_COLORS = [
  { c: '#6B4A35', n: 'Cokelat' }, { c: '#2E2629', n: 'Hitam' }, { c: '#8A6A3B', n: 'Hazel' }, { c: '#B07A2A', n: 'Amber' },
  { c: '#5E7FA6', n: 'Biru' }, { c: '#6E8A62', n: 'Hijau' }, { c: '#7E8A93', n: 'Abu' }, { c: '#8B78A6', n: 'Ungu' },
];
export const COLORS = {
  Pastel: ['#F7DCE2', '#EBB9C6', '#F4B6C8', '#E9E0F0', '#C9B8DA', '#D7E4EA', '#DCE5CE', '#F5E3B3', '#F8D9C4'],
  Netral: ['#FFFCF6', '#F6F1E9', '#EFE4D2', '#E7D7BE', '#B98D66', '#9C969A', '#7C5640'],
  Gelap: ['#2E2A2C', '#2F3550', '#7A3445', '#4B3329', '#3F4A3A', '#5A3E5D', '#8E4A66'],
};
export const LIP_COLORS = [
  { c: 'auto', n: 'Alami' }, { c: '#C99383', n: 'Nude' }, { c: '#E58FA6', n: 'Pink' }, { c: '#C47E86', n: 'Rose' }, { c: '#E57F6B', n: 'Koral' },
  { c: '#B9343F', n: 'Merah' }, { c: '#8E2F4E', n: 'Berry' }, { c: '#A66A7E', n: 'Mauve' }, { c: '#6E3350', n: 'Plum' },
  { c: '#EBA48C', n: 'Persik' }, { c: '#8A5446', n: 'Cokelat' },
];
export const SHADOW_COLORS = [
  { c: 'none', n: 'Tanpa' }, { c: '#E7A9B9', n: 'Pink' }, { c: '#E9B894', n: 'Persik' }, { c: '#A57A5B', n: 'Perunggu' }, { c: '#B48797', n: 'Mauve' },
  { c: '#B6A2CF', n: 'Lavender' }, { c: '#6F5352', n: 'Smoky' }, { c: '#D9BF8A', n: 'Sampanye' }, { c: '#9FB394', n: 'Sage' },
];
export const BLUSH_COLORS = [
  { c: '#E79AAE', n: 'Pink' }, { c: '#EFA38F', n: 'Persik' }, { c: '#D98B95', n: 'Rose' }, { c: '#E28FB4', n: 'Fuchsia lembut' }, { c: '#C97E6E', n: 'Terakota' },
];

/** Tema warna: diterapkan sekaligus ke seluruh pakaian. [utama, terang, aksen, sepatu/tas] */
export const THEMES = [
  { id: 'coquette', n: 'Coquette Pink', c: ['#F4B6C8', '#FFFCF6', '#E9AFC0', '#F7DCE2'] },
  { id: 'vanila', n: 'Vanila', c: ['#F6EBD6', '#FFFCF6', '#E7D7BE', '#C9A77C'] },
  { id: 'vintage-rose', n: 'Vintage Rose', c: ['#C98299', '#F2D6DC', '#8E4A66', '#7A3445'] },
  { id: 'lavender', n: 'Lavender Dream', c: ['#C9B8DA', '#F1ECF7', '#9E86C0', '#E9E0F0'] },
  { id: 'cokelat', n: 'Cokelat Hangat', c: ['#7C5640', '#E7D7BE', '#4B3329', '#B98D66'] },
  { id: 'sage', n: 'Taman Sage', c: ['#A7B59A', '#F6F1E9', '#6E8A62', '#DCE5CE'] },
  { id: 'malam', n: 'Tengah Malam', c: ['#2F3550', '#2E2A2C', '#B6A2CF', '#C9A45C'] },
];

// ───────────── Kelangkaan & koleksi ─────────────
export const RARITY = {
  common: { n: 'Umum', c: '#B9B0B3' },
  uncommon: { n: 'Tak biasa', c: '#94A784' },
  rare: { n: 'Langka', c: '#8DA9C9' },
  epic: { n: 'Epik', c: '#B48ACB' },
  legendary: { n: 'Legendaris', c: '#C9A45C' },
};

export const COLLECTIONS = {
  putri: { n: 'Koleksi Putri Kerajaan', d: 'Gaun bervolume, tiara, dan mutiara.' },
  balet: { n: 'Koleksi Balletcore', d: 'Tutu, pita satin, dan sepatu berpita.' },
  vintage: { n: 'Koleksi Romansa Vintage', d: 'Gaya klasik tahun lima puluhan.' },
  semi: { n: 'Koleksi Taman Musim Semi', d: 'Bunga-bunga, keranjang, dan sandal. Musiman: Maret–Mei.' },
  malam: { n: 'Koleksi Tengah Malam', d: 'Gaun malam dan beludru gelap.' },
  teh: { n: 'Koleksi Pesta Teh', d: 'Renda, topi lebar, dan pita.' },
  dingin: { n: 'Koleksi Akhir Tahun', d: 'Mantel hangat dan rajutan. Musiman: Desember–Januari.' },
  pesta: { n: 'Koleksi Malam Tahun Baru', d: 'Edisi acara: main di sekitar malam tahun baru (30 Des–2 Jan).' },
};

// ───────────── Tubuh & wajah ─────────────
// Ukuran tubuh: S=bahu, B=dada, W=pinggang, H=pinggul, T=paha, A=lengan (setengah lebar dari tengah).
export const BUILDS = [
  { id: 'f-ramping', sex: 'f', n: 'Ramping', m: { S: 43, B: 33, W: 25, H: 37, T: 17, A: 6.5 } },
  { id: 'f-sedang', sex: 'f', n: 'Sedang', m: { S: 45, B: 36, W: 28, H: 41, T: 19, A: 7 } },
  { id: 'f-jam-pasir', sex: 'f', n: 'Jam pasir', m: { S: 46, B: 41, W: 28, H: 49, T: 22, A: 7.5 } },
  { id: 'f-atletis', sex: 'f', n: 'Atletis', m: { S: 49, B: 37, W: 31, H: 41, T: 20, A: 8 } },
  { id: 'f-berisi', sex: 'f', n: 'Berisi', m: { S: 51, B: 46, W: 41, H: 54, T: 25, A: 10 } },
  { id: 'm-ramping', sex: 'm', n: 'Ramping', m: { S: 49, B: 35, W: 30, H: 34, T: 17, A: 7.5 } },
  { id: 'm-sedang', sex: 'm', n: 'Sedang', m: { S: 53, B: 39, W: 34, H: 37, T: 19, A: 8.5 } },
  { id: 'm-atletis', sex: 'm', n: 'Atletis', m: { S: 58, B: 45, W: 35, H: 38, T: 21, A: 10 } },
  { id: 'm-tegap', sex: 'm', n: 'Tegap', m: { S: 61, B: 46, W: 38, H: 40, T: 22, A: 10.5 } },
  { id: 'm-berisi', sex: 'm', n: 'Berisi', m: { S: 57, B: 48, W: 47, H: 47, T: 25, A: 11 } },
];

export const FACE = {
  shape: [{ id: 'oval', n: 'Oval' }, { id: 'hati', n: 'Hati' }, { id: 'bulat', n: 'Bulat' }, { id: 'persegi', n: 'Persegi' }, { id: 'panjang', n: 'Panjang' }, { id: 'berlian', n: 'Berlian' }],
  eyes: [{ id: 'tajam', n: 'Almond' }, { id: 'sayu', n: 'Sayu' }, { id: 'bulat', n: 'Bulat' }, { id: 'monolid', n: 'Monolid' }, { id: 'turun', n: 'Menurun' }, { id: 'kucing', n: 'Kucing' }],
  brows: [{ id: 'melengkung', n: 'Melengkung' }, { id: 'lurus', n: 'Lurus' }, { id: 'tebal', n: 'Tebal' }, { id: 'tipis', n: 'Tipis' }, { id: 'tegas', n: 'Tegas' }, { id: 'lembut', n: 'Lembut' }],
  nose: [{ id: 'lurus', n: 'Lurus' }, { id: 'kecil', n: 'Mungil' }, { id: 'lebar', n: 'Lebar' }, { id: 'runcing', n: 'Runcing' }, { id: 'bulat', n: 'Bulat' }],
  lips: [{ id: 'penuh', n: 'Penuh' }, { id: 'tipis', n: 'Tipis' }, { id: 'hati', n: 'Busur cupid' }, { id: 'lebar', n: 'Lebar' }, { id: 'kecil', n: 'Mungil' }, { id: 'bawah', n: 'Bibir bawah tebal' }],
  expr: [
    { id: 'netral', n: 'Tenang' }, { id: 'senyum', n: 'Senyum' }, { id: 'tertawa', n: 'Tertawa' }, { id: 'smirk', n: 'Smirk' },
    { id: 'manyun', n: 'Manyun' }, { id: 'kaget', n: 'Kaget' }, { id: 'kedip', n: 'Kedip' }, { id: 'mata-senyum', n: 'Mata tersenyum' },
  ],
};

export const MAKEUP = {
  liner: [{ id: 'none', n: 'Tanpa' }, { id: 'tipis', n: 'Tipis' }, { id: 'sayap', n: 'Bersayap' }, { id: 'kucing', n: 'Cat eye' }, { id: 'smoky', n: 'Smoky' }],
  lashes: [{ id: 'none', n: 'Polos' }, { id: 'natural', n: 'Natural' }, { id: 'lentik', n: 'Lentik' }, { id: 'dramatis', n: 'Dramatis' }],
  blush: [{ id: 'none', n: 'Tanpa' }, { id: 'lembut', n: 'Lembut' }, { id: 'apel', n: 'Pipi apel' }, { id: 'sunkissed', n: 'Sunkissed' }, { id: 'draping', n: 'Draping' }],
  lipFinish: [{ id: 'satin', n: 'Satin' }, { id: 'matte', n: 'Matte' }, { id: 'gloss', n: 'Gloss' }, { id: 'tint', n: 'Tint' }],
  freckles: [{ id: 'none', n: 'Tanpa' }, { id: 'sedikit', n: 'Sedikit' }, { id: 'banyak', n: 'Banyak' }],
  mark: [{ id: 'none', n: 'Tanpa' }, { id: 'pipi', n: 'Di pipi' }, { id: 'bibir', n: 'Dekat bibir' }, { id: 'mata', n: 'Bawah mata' }],
};

// ───────────── Item ─────────────
// slot: hair | top | mid | dress | bottom | outer | legwear | shoes | head | hairAcc | ears | neck | wrist | ring | bag | glasses
// cat: label filter di studio. unlock: { lv } | { streak } | { ach } | { season: [bulan 0-11], label } | { event: [[MM-DD, MM-DD]], label }
const I = (slot, cat, id, n, rarity, color, r, extra = {}) => ({ slot, cat, id, n, rarity, color, r, ...extra });

const HAIR = [
  ['panjang', 'Panjang lurus', 'common', { back: 'long', front: 'sweep' }, ['panjang']],
  ['panjang-tengah', 'Panjang belah tengah', 'common', { back: 'long', front: 'center' }, ['panjang']],
  ['panjang-tirai', 'Panjang poni tirai', 'common', { back: 'long', front: 'curtain' }, ['panjang', 'poni']],
  ['panjang-rata', 'Panjang poni rata', 'uncommon', { back: 'long', front: 'blunt' }, ['panjang', 'poni']],
  ['panjang-tipis', 'Panjang poni tipis', 'common', { back: 'long', front: 'wispy' }, ['panjang', 'poni']],
  ['gelombang', 'Bergelombang', 'common', { back: 'wavy', front: 'center' }, ['panjang', 'gelombang']],
  ['gelombang-tirai', 'Gelombang poni tirai', 'uncommon', { back: 'wavy', front: 'curtain' }, ['gelombang', 'poni']],
  ['ikal-panjang', 'Ikal panjang', 'uncommon', { back: 'curlyLong', front: 'curly' }, ['ikal']],
  ['ikal-pendek', 'Ikal pendek', 'common', { back: 'curlyShort', front: 'curly' }, ['ikal', 'pendek']],
  ['afro', 'Afro bulat', 'uncommon', { back: 'afro', front: 'afro' }, ['ikal']],
  ['bob', 'Bob berponi', 'common', { back: 'bob', front: 'blunt', sides: true }, ['pendek', 'poni']],
  ['bob-samping', 'Bob belah samping', 'common', { back: 'bob', front: 'sweep' }, ['pendek']],
  ['lob', 'Lob sebahu', 'common', { back: 'lob', front: 'center' }, ['sedang']],
  ['bob-retro', 'Bob gelombang retro', 'rare', { back: 'retroBob', front: 'fingerWave' }, ['vintage', 'pendek'], { col: 'vintage', unlock: { ach: 'knowledge_seeker' } }],
  ['ponytail', 'Ponytail tinggi', 'common', { back: 'ponyHigh', front: 'sleek' }, ['ikat']],
  ['ponytail-rendah', 'Ponytail rendah berpita', 'uncommon', { back: 'ponyLow', front: 'center' }, ['ikat']],
  ['twintail', 'Twin tail', 'uncommon', { back: 'twin', front: 'blunt' }, ['ikat', 'poni']],
  ['kepang', 'Kepang dua', 'common', { back: 'braids', front: 'center' }, ['kepang']],
  ['kepang-rapat', 'Kepang rapat samping', 'rare', { back: 'dutch', front: 'sleekSide' }, ['kepang'], { col: 'balet', unlock: { streak: 7 } }],
  ['kepang-satu', 'Kepang satu di bahu', 'uncommon', { back: 'sideBraid', front: 'sweep' }, ['kepang']],
  ['cepol', 'Cepol atas', 'common', { back: 'bunTop', front: 'sleek' }, ['sanggul']],
  ['cepol-berantakan', 'Cepol berantakan', 'common', { back: 'messyBun', front: 'wispy' }, ['sanggul']],
  ['sanggul-rendah', 'Sanggul rendah', 'uncommon', { back: 'chignon', front: 'sweep' }, ['sanggul', 'elegan']],
  ['sanggul-elegan', 'Sanggul elegan', 'epic', { back: 'updo', front: 'wispySweep' }, ['sanggul', 'elegan'], { col: 'malam', unlock: { lv: 8 } }],
  ['cepol-dua', 'Cepol dua', 'uncommon', { back: 'spaceBuns', front: 'center' }, ['sanggul']],
  ['setengah-ikat', 'Setengah ikat', 'common', { back: 'halfUp', front: 'center' }, ['panjang']],
  ['gulung-vintage', 'Gulung vintage', 'epic', { back: 'victory', front: 'rolls' }, ['vintage'], { col: 'vintage', unlock: { lv: 6 } }],
  ['pixie', 'Pixie', 'common', { back: 'none', front: 'pixie' }, ['pendek']],
  ['pendek', 'Pendek rapi', 'common', { back: 'none', front: 'short' }, ['pendek']],
  ['belah', 'Belah samping', 'common', { back: 'nape', front: 'sidePart' }, ['pendek']],
  ['belah-tengah-pendek', 'Belah tengah pendek', 'common', { back: 'nape', front: 'curtainShort' }, ['pendek', 'poni']],
  ['acak', 'Acak-acakan', 'common', { back: 'nape', front: 'tousled' }, ['pendek']],
  ['pompadour', 'Pompadour', 'rare', { back: 'nape', front: 'pompadour' }, ['vintage', 'pendek'], { unlock: { lv: 4 } }],
  ['cepak', 'Cepak', 'common', { back: 'none', front: 'buzz' }, ['pendek']],
].map(([id, n, rarity, r, tags, extra = {}]) => I('hair', 'Rambut', id, n, rarity, null, r, { tags, ...extra }));

// Pakaian: resep torso (neck, sleeve, hem, loose, open, details) dan rok/celana.
const CLOTHES = [
  // Atasan (lapisan dasar)
  I('top', 'Atasan', 'blus-renda', 'Blus kerah renda', 'uncommon', '#FFFCF6', { neck: 'collarPP', sleeve: 'puff', hem: 286, tuck: true, details: ['buttons', 'laceCollar'] }),
  I('top', 'Atasan', 'kemeja', 'Kemeja klasik', 'common', '#F6F1E9', { neck: 'collar', sleeve: 'long', hem: 300, tuck: true, details: ['buttons', 'cuffs', 'pocket'] }),
  I('top', 'Atasan', 'turtleneck', 'Turtleneck', 'common', '#2E2A2C', { neck: 'turtle', sleeve: 'long', hem: 292, tuck: true, details: ['knitRib'] }),
  I('top', 'Atasan', 'korset', 'Atasan korset', 'rare', '#F4B6C8', { neck: 'sweet', sleeve: 'none', straps: true, hem: 276, tuck: true, details: ['lacing', 'boning', 'bowFront'] }, { col: 'teh', unlock: { ach: 'perfectionist' } }),
  I('top', 'Atasan', 'sabrina', 'Atasan sabrina', 'uncommon', '#FFFCF6', { neck: 'off', sleeve: 'flutter', hem: 282, tuck: true, details: ['ruffleNeck'] }),
  I('top', 'Atasan', 'crop-rajut', 'Crop top rajut', 'common', '#DCE5CE', { neck: 'square', sleeve: 'short', hem: 244, tuck: false, details: ['knitRib', 'buttons'] }),
  I('top', 'Atasan', 'kamisol-renda', 'Kamisol renda', 'uncommon', '#F7DCE2', { neck: 'v', sleeve: 'none', straps: true, hem: 270, tuck: true, details: ['laceTrim'] }),
  I('top', 'Atasan', 'kaos', 'Kaos basic', 'common', '#F6F1E9', { neck: 'crew', sleeve: 'short', hem: 300, tuck: false, details: [] }),
  I('top', 'Atasan', 'blus-pita', 'Blus pita', 'common', '#F2D6DC', { neck: 'v', sleeve: 'bishop', hem: 290, tuck: true, details: ['bowNeck'] }),
  I('top', 'Atasan', 'sweter-kabel', 'Sweter rajut kabel', 'common', '#EFE4D2', { neck: 'crew', sleeve: 'long', hem: 312, loose: 5, tuck: false, details: ['cable', 'knitRib'] }),
  I('top', 'Atasan', 'breton', 'Sweter garis', 'common', '#2F3550', { neck: 'boat', sleeve: 'long', hem: 304, loose: 3, tuck: false, pattern: 'stripes', base: '#F6F1E9' }),
  I('top', 'Atasan', 'hoodie', 'Hoodie', 'common', '#C9B8DA', { neck: 'hood', sleeve: 'long', hem: 314, loose: 6, tuck: false, details: ['drawstring', 'pouch', 'knitRib'] }),
  // Lapisan tengah
  I('mid', 'Atasan', 'kardigan', 'Kardigan pendek', 'common', '#F4B6C8', { neck: 'v', sleeve: 'long', hem: 272, loose: 3, details: ['buttons', 'knitRib'], cardigan: true }),
  I('mid', 'Atasan', 'rompi', 'Rompi rajut', 'uncommon', '#EFE4D2', { neck: 'deepv', sleeve: 'none', hem: 286, loose: 2, pattern: 'argyle', details: ['knitRib'] }),
  I('mid', 'Atasan', 'kardigan-panjang', 'Kardigan panjang', 'uncommon', '#E7D7BE', { neck: 'open', sleeve: 'long', hem: 380, loose: 6, open: 10, details: ['knitRib', 'pockets'] }),
  // Gaun
  I('dress', 'Gaun', 'gaun-putri', 'Gaun putri', 'epic', '#F4B6C8', { neck: 'sweet', sleeve: 'puff', skirt: { shape: 'bell', len: 548, flare: 62, hem: 'ruffle' }, details: ['tulle', 'bowWaist', 'sheen'] }, { col: 'putri', unlock: { lv: 10 } }),
  I('dress', 'Gaun', 'gaun-bunga', 'Gaun bunga', 'common', '#F6EBD6', { neck: 'square', sleeve: 'puff', skirt: { shape: 'a', len: 452, flare: 26, hem: 'straight' }, pattern: 'floral' }),
  I('dress', 'Gaun', 'gaun-vintage', 'Gaun vintage', 'rare', '#C98299', { neck: 'collarPP', sleeve: 'short', skirt: { shape: 'a', len: 440, flare: 34, hem: 'straight' }, pattern: 'polka', details: ['buttons', 'belt'] }, { col: 'vintage', unlock: { lv: 5 } }),
  I('dress', 'Gaun', 'sundress', 'Sundress', 'common', '#D7E4EA', { neck: 'square', sleeve: 'none', straps: true, skirt: { shape: 'a', len: 462, flare: 30, hem: 'ruffle' }, pattern: 'gingham' }),
  I('dress', 'Gaun', 'gaun-pesta', 'Gaun pesta bervolume', 'legendary', '#C9B8DA', { neck: 'off', sleeve: 'none', skirt: { shape: 'bell', len: 552, flare: 72, hem: 'scallop' }, details: ['sheen', 'tulle', 'sequinTop'] }, { col: 'putri', unlock: { streak: 30 } }),
  I('dress', 'Gaun', 'gaun-mini', 'Gaun mini pita', 'common', '#EBB9C6', { neck: 'crew', sleeve: 'long', skirt: { shape: 'a', len: 346, flare: 18, hem: 'straight' }, details: ['bowFront', 'collarBow'] }),
  I('dress', 'Gaun', 'gaun-maxi', 'Gaun maxi', 'common', '#A7B59A', { neck: 'v', sleeve: 'flutter', skirt: { shape: 'a', len: 540, flare: 30, hem: 'curve' }, details: ['tieWaist'] }),
  I('dress', 'Gaun', 'gaun-satin', 'Slip dress satin', 'uncommon', '#E7D7BE', { neck: 'cowl', sleeve: 'none', straps: true, skirt: { shape: 'slip', len: 470, flare: 10, hem: 'asym' }, details: ['sheen'] }),
  I('dress', 'Gaun', 'gaun-renda', 'Gaun renda', 'rare', '#FFFCF6', { neck: 'high', sleeve: 'sheer', skirt: { shape: 'a', len: 430, flare: 22, hem: 'scallop' }, pattern: 'lace' }, { col: 'teh', unlock: { ach: 'curious_mind' } }),
  I('dress', 'Gaun', 'gaun-cottage', 'Gaun cottagecore', 'uncommon', '#F5E3B3', { neck: 'square', sleeve: 'bishop', skirt: { shape: 'tiered', len: 520, flare: 34, hem: 'ruffle' }, pattern: 'floralSmall', details: ['ruffleNeck'] }),
  I('dress', 'Gaun', 'gaun-coquette', 'Gaun babydoll coquette', 'rare', '#F7DCE2', { neck: 'sweet', sleeve: 'puff', empire: true, skirt: { shape: 'a', len: 352, flare: 28, hem: 'ruffle' }, details: ['bowsMany', 'laceTrim'] }, { col: 'balet', unlock: { ach: 'on_fire' } }),
  I('dress', 'Gaun', 'gaun-malam', 'Gaun malam satu bahu', 'legendary', '#2F3550', { neck: 'oneshoulder', sleeve: 'none', skirt: { shape: 'mermaid', len: 552, flare: 34, hem: 'curve' }, details: ['sheen', 'slit'] }, { col: 'malam', unlock: { ach: 'unstoppable' } }),
  I('dress', 'Gaun', 'gaun-payet', 'Gaun payet tahun baru', 'legendary', '#D9BF8A', { neck: 'v', sleeve: 'none', straps: true, skirt: { shape: 'pencil', len: 360, flare: 6, hem: 'fringe' }, details: ['sequinAll'] }, { col: 'pesta', unlock: { event: [['12-30', '01-02']], label: 'Main di sekitar malam tahun baru (30 Des–2 Jan)' } }),
  I('dress', 'Gaun', 'gaun-taman', 'Gaun taman musim semi', 'epic', '#F7DCE2', { neck: 'sweet', sleeve: 'flutter', skirt: { shape: 'tiered', len: 470, flare: 36, hem: 'scallop' }, pattern: 'floral', details: ['bowWaist'] }, { col: 'semi', unlock: { season: [2, 3, 4], label: 'Main di bulan Maret–Mei' } }),
  // Luaran
  I('outer', 'Luaran', 'trench', 'Trench coat', 'common', '#C9A77C', { neck: 'lapel', sleeve: 'long', hem: 430, loose: 8, open: 4, details: ['buttons2', 'belt', 'epaulette', 'cuffsBelt'] }),
  I('outer', 'Luaran', 'blazer', 'Blazer', 'common', '#2E2A2C', { neck: 'lapel', sleeve: 'long', hem: 330, loose: 5, open: 6, details: ['pocketsFlap', 'button1'] }),
  I('outer', 'Luaran', 'jaket-kulit', 'Jaket kulit', 'uncommon', '#2E2A2C', { neck: 'moto', sleeve: 'long', hem: 286, loose: 5, open: 8, details: ['zip', 'sheen'] }),
  I('outer', 'Luaran', 'mantel-wol', 'Mantel wol', 'uncommon', '#7A3445', { neck: 'lapel', sleeve: 'long', hem: 470, loose: 9, open: 2, details: ['buttons2', 'pocketsFlap'] }),
  I('outer', 'Luaran', 'jaket-denim', 'Jaket denim', 'common', '#8DA9C9', { neck: 'collarOpen', sleeve: 'long', hem: 296, loose: 6, open: 10, details: ['denim', 'chestPockets'] }),
  I('outer', 'Luaran', 'jaket-tweed', 'Jaket tweed pendek', 'rare', '#F2D6DC', { neck: 'round', sleeve: 'long', hem: 270, loose: 4, open: 6, pattern: 'tweed', details: ['trim', 'chestPockets', 'buttonsGold'] }, { col: 'putri', unlock: { ach: 'all_rounder' } }),
  I('outer', 'Luaran', 'mantel-bulu', 'Mantel bulu', 'epic', '#EFE4D2', { neck: 'lapel', sleeve: 'long', hem: 440, loose: 10, open: 6, details: ['fur'] }, { col: 'dingin', unlock: { season: [11, 0], label: 'Main di bulan Desember–Januari' } }),
  // Bawahan
  I('bottom', 'Bawahan', 'rok-lipit', 'Rok lipit', 'common', '#7A3445', { skirt: { shape: 'pleat', len: 432, flare: 24, hem: 'zigzag' } }),
  I('bottom', 'Bawahan', 'rok-mini', 'Rok mini', 'common', '#F4B6C8', { skirt: { shape: 'a', len: 350, flare: 16, hem: 'straight' }, details: ['buttons'] }),
  I('bottom', 'Bawahan', 'rok-maxi', 'Rok maxi', 'common', '#E7D7BE', { skirt: { shape: 'a', len: 536, flare: 28, hem: 'curve' } }),
  I('bottom', 'Bawahan', 'rok-pensil', 'Rok pensil', 'uncommon', '#2E2A2C', { skirt: { shape: 'pencil', len: 430, flare: 2, hem: 'straight' }, details: ['slitBack'] }),
  I('bottom', 'Bawahan', 'rok-tutu', 'Rok tutu', 'rare', '#F7DCE2', { skirt: { shape: 'tutu', len: 420, flare: 40, hem: 'scallop' }, details: ['tulle'] }, { col: 'balet', unlock: { streak: 3 } }),
  I('bottom', 'Bawahan', 'celana-bahan', 'Celana bahan', 'common', '#4B3329', { pants: { len: 532, wide: 4, fit: 3, style: 'trouser' } }),
  I('bottom', 'Bawahan', 'kulot', 'Celana kulot', 'common', '#F6EBD6', { pants: { len: 534, wide: 18, fit: 6, style: 'wide' } }),
  I('bottom', 'Bawahan', 'jeans', 'Jeans', 'common', '#7F9BBE', { pants: { len: 530, wide: 0, fit: 1.5, style: 'jeans' } }),
  I('bottom', 'Bawahan', 'celana-pendek', 'Celana pendek', 'common', '#E7D7BE', { pants: { len: 370, wide: 4, fit: 3, style: 'shorts' } }),
  // Kaki
  I('legwear', 'Kaus kaki', 'stoking-hitam', 'Stoking hitam', 'common', '#2E2A2C', { kind: 'tights', op: 0.55 }),
  I('legwear', 'Kaus kaki', 'stoking-pink', 'Stoking pink', 'uncommon', '#F4B6C8', { kind: 'tights', op: 0.45 }),
  I('legwear', 'Kaus kaki', 'kaus-renda', 'Kaus kaki renda', 'common', '#FFFCF6', { kind: 'ankle', lace: true }),
  I('legwear', 'Kaus kaki', 'kaus-selutut', 'Kaus kaki selutut', 'common', '#FFFCF6', { kind: 'knee' }),
];

const SHOES = [
  ['flat', 'Flat balet', 'common', '#F4B6C8', { kind: 'flat', bow: true }],
  ['maryjane', 'Mary Jane', 'common', '#2E2A2C', { kind: 'maryjane' }],
  ['maryjane-mutiara', 'Mary Jane mutiara', 'rare', '#FFFCF6', { kind: 'maryjane', pearl: true }, { col: 'putri', unlock: { lv: 7 } }],
  ['pump', 'Sepatu hak runcing', 'common', '#C98299', { kind: 'pump' }],
  ['kitten', 'Hak pendek', 'common', '#E7D7BE', { kind: 'kitten' }],
  ['strappy', 'Hak bertali', 'epic', '#C9A45C', { kind: 'strappy' }, { col: 'malam', unlock: { lv: 12 } }],
  ['slingback', 'Slingback', 'uncommon', '#FFFCF6', { kind: 'slingback' }],
  ['platform', 'Platform', 'uncommon', '#2E2A2C', { kind: 'platform' }],
  ['platform-mj', 'Platform Mary Jane', 'rare', '#F4B6C8', { kind: 'platformMj' }, { unlock: { streak: 5 } }],
  ['sneaker', 'Sneakers', 'common', '#FFFCF6', { kind: 'sneaker' }],
  ['boot', 'Sepatu bot tinggi', 'uncommon', '#4B3329', { kind: 'boot' }],
  ['ankle', 'Bot pergelangan', 'common', '#2E2A2C', { kind: 'ankle' }],
  ['chelsea', 'Bot chelsea', 'common', '#7C5640', { kind: 'chelsea' }],
  ['combat', 'Bot bertali', 'uncommon', '#2E2A2C', { kind: 'combat' }],
  ['loafer', 'Loafer', 'common', '#4B3329', { kind: 'loafer' }],
  ['oxford', 'Sepatu pantofel', 'common', '#2E2A2C', { kind: 'oxford' }],
  ['sandal', 'Sandal tali', 'common', '#C9A77C', { kind: 'sandal' }, { col: 'semi' }],
  ['espadrille', 'Espadrilles', 'uncommon', '#F6EBD6', { kind: 'espadrille' }],
  ['pita-balet', 'Sepatu pita balet', 'epic', '#F7DCE2', { kind: 'ribbon' }, { col: 'balet', unlock: { streak: 14 } }],
  ['clog', 'Clog kayu', 'common', '#B98D66', { kind: 'clog' }],
  ['bot-hujan', 'Bot hujan', 'common', '#F5E3B3', { kind: 'rain' }],
  ['selop', 'Selop bulu', 'uncommon', '#F7DCE2', { kind: 'slipper' }],
].map(([id, n, rarity, color, r, extra = {}]) => I('shoes', 'Sepatu', id, n, rarity, color, r, extra));

const ACC = [
  // Kepala
  I('head', 'Kepala', 'baret', 'Baret', 'common', '#2E2A2C', {}),
  I('head', 'Kepala', 'fedora', 'Fedora', 'common', '#C9A77C', {}),
  I('head', 'Kepala', 'topi-lebar', 'Topi lebar berpita', 'rare', '#F6EBD6', {}, { col: 'teh', unlock: { lv: 6 } }),
  I('head', 'Kepala', 'kupluk', 'Kupluk rajut', 'common', '#F4B6C8', {}, { col: 'dingin' }),
  I('head', 'Kepala', 'bando', 'Bando polos', 'common', '#2E2A2C', {}),
  I('head', 'Kepala', 'bando-beludru', 'Bando beludru', 'uncommon', '#7A3445', {}),
  I('head', 'Kepala', 'bando-mutiara', 'Bando mutiara', 'rare', null, {}, { col: 'putri', unlock: { lv: 3 } }),
  I('head', 'Kepala', 'bando-kucing', 'Bando kucing', 'uncommon', '#2E2A2C', {}, { unlock: { lv: 4 } }),
  I('head', 'Kepala', 'mahkota-bunga', 'Mahkota bunga', 'epic', '#F4B6C8', {}, { col: 'semi', unlock: { season: [2, 3, 4], label: 'Main di bulan Maret–Mei' } }),
  I('head', 'Kepala', 'tiara', 'Tiara', 'legendary', null, {}, { col: 'putri', unlock: { lv: 10 } }),
  I('head', 'Kepala', 'hijab', 'Hijab', 'common', '#EBB9C6', {}),
  I('head', 'Kepala', 'headphone', 'Headphone', 'uncommon', '#C9B8DA', {}, { unlock: { lv: 3 } }),
  // Hiasan rambut
  I('hairAcc', 'Rambut', 'pita-besar', 'Pita besar', 'common', '#F4B6C8', {}),
  I('hairAcc', 'Rambut', 'pita-dua', 'Pita kecil kembar', 'common', '#E9AFC0', {}),
  I('hairAcc', 'Rambut', 'pita-satin', 'Pita satin panjang', 'uncommon', '#2E2A2C', {}, { col: 'balet' }),
  I('hairAcc', 'Rambut', 'jepit-mutiara', 'Jepit mutiara', 'uncommon', null, {}),
  I('hairAcc', 'Rambut', 'jepit-kupu', 'Jepit kupu-kupu', 'common', '#C9B8DA', {}),
  I('hairAcc', 'Rambut', 'jepit-bintang', 'Jepit bintang', 'common', '#F5E3B3', {}),
  I('hairAcc', 'Rambut', 'bunga-telinga', 'Bunga di telinga', 'uncommon', '#F4B6C8', {}),
  I('hairAcc', 'Rambut', 'scrunchie', 'Scrunchie', 'common', '#F7DCE2', {}),
  // Telinga
  I('ears', 'Perhiasan', 'hoop', 'Anting hoop', 'common', null, {}),
  I('ears', 'Perhiasan', 'mutiara', 'Anting mutiara', 'common', null, {}),
  I('ears', 'Perhiasan', 'hati', 'Anting hati', 'uncommon', null, {}),
  I('ears', 'Perhiasan', 'juntai', 'Anting juntai', 'uncommon', null, {}),
  I('ears', 'Perhiasan', 'pita', 'Anting pita', 'rare', null, {}, { unlock: { ach: 'perfect_mind' } }),
  // Leher
  I('neck', 'Perhiasan', 'kalung-mutiara', 'Kalung mutiara', 'uncommon', null, {}),
  I('neck', 'Perhiasan', 'choker-beludru', 'Choker beludru', 'rare', '#2E2A2C', {}, { col: 'malam', unlock: { lv: 5 } }),
  I('neck', 'Perhiasan', 'choker-renda', 'Choker renda', 'common', '#FFFCF6', {}),
  I('neck', 'Perhiasan', 'liontin', 'Liontin hati', 'uncommon', null, {}, { col: 'vintage' }),
  I('neck', 'Syal', 'syal', 'Syal sutra', 'common', '#F4B6C8', {}),
  I('neck', 'Syal', 'syal-rajut', 'Syal rajut', 'common', '#7A3445', {}, { col: 'dingin' }),
  I('neck', 'Perhiasan', 'dasi', 'Dasi', 'common', '#7A3445', {}),
  I('neck', 'Perhiasan', 'dasi-kupu', 'Dasi kupu-kupu', 'common', '#2E2A2C', {}),
  // Tangan
  I('wrist', 'Perhiasan', 'gelang-mutiara', 'Gelang mutiara', 'common', null, {}),
  I('wrist', 'Perhiasan', 'gelang-emas', 'Gelang emas', 'common', null, {}),
  I('wrist', 'Perhiasan', 'jam', 'Jam tangan', 'common', '#7C5640', {}),
  I('wrist', 'Perhiasan', 'gelang-manik', 'Gelang manik pastel', 'common', null, {}),
  I('ring', 'Perhiasan', 'cincin-emas', 'Cincin emas', 'common', null, {}),
  I('ring', 'Perhiasan', 'cincin-permata', 'Cincin permata', 'rare', '#B6A2CF', {}, { unlock: { lv: 9 } }),
  // Tas
  I('bag', 'Tas', 'tas-tangan', 'Tas tangan', 'common', '#2E2A2C', {}),
  I('bag', 'Tas', 'tas-bahu', 'Tas bahu', 'common', '#C98299', {}),
  I('bag', 'Tas', 'tas-mini', 'Tas mini rantai', 'uncommon', '#F4B6C8', {}),
  I('bag', 'Tas', 'tote', 'Tote kanvas', 'common', '#F6EBD6', {}),
  I('bag', 'Tas', 'tas-keranjang', 'Tas keranjang', 'rare', '#D9BF8A', {}, { col: 'semi', unlock: { ach: 'explorer' } }),
  I('bag', 'Tas', 'tas-hati', 'Tas hati', 'epic', '#E9AFC0', {}, { unlock: { ach: 'comeback_kid' } }),
  // Kacamata
  I('glasses', 'Kacamata', 'bulat', 'Kacamata bulat', 'common', null, {}),
  I('glasses', 'Kacamata', 'cat-eye', 'Kacamata cat-eye', 'common', null, {}),
  I('glasses', 'Kacamata', 'oval-tipis', 'Kacamata oval tipis', 'common', null, {}),
  I('glasses', 'Kacamata', 'hitam', 'Kacamata hitam', 'uncommon', null, {}, { unlock: { lv: 2 } }),
  I('glasses', 'Kacamata', 'hati', 'Kacamata hati', 'rare', '#E9AFC0', {}, { unlock: { ach: 'shopper' } }),
];

export const ITEMS = [...HAIR, ...CLOTHES, ...SHOES, ...ACC];
export const ITEM_BY_ID = Object.fromEntries(ITEMS.map((it) => [`${it.slot}:${it.id}`, it]));
export const itemsFor = (slot) => ITEMS.filter((it) => it.slot === slot);
export const getItem = (slot, id) => ITEM_BY_ID[`${slot}:${id}`] || null;

/** Slot yang boleh kosong. `top`/`bottom` hanya boleh kosong jika memakai gaun (diatur sanitasi). */
export const OPTIONAL_SLOTS = ['top', 'mid', 'dress', 'bottom', 'outer', 'legwear', 'shoes', 'head', 'hairAcc', 'ears', 'neck', 'wrist', 'ring', 'bag', 'glasses'];
/** Slot yang warnanya bisa diubah. */
export const COLOR_SLOTS = ['top', 'mid', 'dress', 'bottom', 'outer', 'legwear', 'shoes', 'head', 'hairAcc', 'neck', 'bag'];

// ───────────── Syarat buka ─────────────
/** Ringkasan pemain untuk mengecek syarat buka item. */
export function unlockContext(s, level = 1) {
  if (!s) return { level, streak: 0, ach: new Set(), days: [] };
  return {
    level,
    streak: s.streak?.longest || 0,
    ach: new Set(Object.keys(s.achievements || {})),
    days: Object.keys(s.activity || {}),
  };
}


/** { ok, label } untuk sebuah item. */
export function unlockStatus(item, ctx, achNames = {}) {
  const u = item?.unlock;
  if (!u) return { ok: true, label: '' };
  if (u.lv) return { ok: ctx.level >= u.lv, label: L(`Capai level ${u.lv}`, `Reach level ${u.lv}`) };
  if (u.streak) return { ok: ctx.streak >= u.streak, label: L(`Raih streak ${u.streak} hari`, `Reach a ${u.streak}-day streak`) };
  if (u.ach) return { ok: ctx.ach.has(u.ach), label: L(`Buka pencapaian "${achNames[u.ach] || u.ach}"`, `Unlock the "${achNames[u.ach] || u.ach}" achievement`) };
  if (u.season) {
    const ok = ctx.days.some((d) => u.season.includes(Number(d.slice(5, 7)) - 1));
    return { ok, label: u.label || L(`Main di bulan ${u.season.map((m) => MONTHS[m]).join('/')}`, `Play in ${u.season.map((m) => MONTHS[m]).join('/')}`) };
  }
  if (u.event) {
    const ok = ctx.days.some((d) => u.event.some(([a, b]) => { const md = d.slice(5); return a <= b ? md >= a && md <= b : md >= a || md <= b; }));
    return { ok, label: u.label || L('Item acara khusus', 'Special event item') };
  }
  return { ok: true, label: '' };
}

// ───────────── English ─────────────
// Nama item, palet, dan pilihan wajah dalam English (lihat core/i18n.js → bi()).
const EN_ITEMS = {
  // Rambut
  'hair:panjang': 'Long straight', 'hair:panjang-tengah': 'Long, center part', 'hair:panjang-tirai': 'Long with curtain bangs',
  'hair:panjang-rata': 'Long with blunt bangs', 'hair:panjang-tipis': 'Long with wispy bangs', 'hair:gelombang': 'Wavy',
  'hair:gelombang-tirai': 'Waves with curtain bangs', 'hair:ikal-panjang': 'Long curls', 'hair:ikal-pendek': 'Short curls',
  'hair:afro': 'Rounded afro', 'hair:bob': 'Bob with bangs', 'hair:bob-samping': 'Side-part bob', 'hair:lob': 'Shoulder-length lob',
  'hair:bob-retro': 'Retro wave bob', 'hair:ponytail': 'High ponytail', 'hair:ponytail-rendah': 'Low ponytail with bow',
  'hair:twintail': 'Twin tails', 'hair:kepang': 'Two braids', 'hair:kepang-rapat': 'Tight side braids', 'hair:kepang-satu': 'Single shoulder braid',
  'hair:cepol': 'Top bun', 'hair:cepol-berantakan': 'Messy bun', 'hair:sanggul-rendah': 'Low chignon', 'hair:sanggul-elegan': 'Elegant updo',
  'hair:cepol-dua': 'Space buns', 'hair:setengah-ikat': 'Half-up', 'hair:gulung-vintage': 'Vintage victory rolls', 'hair:pixie': 'Pixie',
  'hair:pendek': 'Neat short', 'hair:belah': 'Side part', 'hair:belah-tengah-pendek': 'Short center part', 'hair:acak': 'Tousled',
  'hair:pompadour': 'Pompadour', 'hair:cepak': 'Buzz cut',
  // Pakaian
  'top:blus-renda': 'Lace-collar blouse', 'top:kemeja': 'Classic shirt', 'top:turtleneck': 'Turtleneck', 'top:korset': 'Corset top',
  'top:sabrina': 'Off-shoulder top', 'top:crop-rajut': 'Knit crop top', 'top:kamisol-renda': 'Lace camisole', 'top:kaos': 'Basic tee',
  'top:blus-pita': 'Bow blouse', 'top:sweter-kabel': 'Cable-knit sweater', 'top:breton': 'Striped sweater', 'top:hoodie': 'Hoodie',
  'mid:kardigan': 'Cropped cardigan', 'mid:rompi': 'Knit vest', 'mid:kardigan-panjang': 'Long cardigan',
  'dress:gaun-putri': 'Princess gown', 'dress:gaun-bunga': 'Floral dress', 'dress:gaun-vintage': 'Vintage dress', 'dress:sundress': 'Sundress',
  'dress:gaun-pesta': 'Voluminous ball gown', 'dress:gaun-mini': 'Bow mini dress', 'dress:gaun-maxi': 'Maxi dress', 'dress:gaun-satin': 'Satin slip dress',
  'dress:gaun-renda': 'Lace dress', 'dress:gaun-cottage': 'Cottagecore dress', 'dress:gaun-coquette': 'Coquette babydoll dress',
  'dress:gaun-malam': 'One-shoulder evening gown', 'dress:gaun-payet': 'New Year sequin dress', 'dress:gaun-taman': 'Spring garden dress',
  'outer:trench': 'Trench coat', 'outer:blazer': 'Blazer', 'outer:jaket-kulit': 'Leather jacket', 'outer:mantel-wol': 'Wool coat',
  'outer:jaket-denim': 'Denim jacket', 'outer:jaket-tweed': 'Cropped tweed jacket', 'outer:mantel-bulu': 'Faux fur coat',
  'bottom:rok-lipit': 'Pleated skirt', 'bottom:rok-mini': 'Mini skirt', 'bottom:rok-maxi': 'Maxi skirt', 'bottom:rok-pensil': 'Pencil skirt',
  'bottom:rok-tutu': 'Tutu skirt', 'bottom:celana-bahan': 'Trousers', 'bottom:kulot': 'Wide-leg culottes', 'bottom:jeans': 'Jeans', 'bottom:celana-pendek': 'Shorts',
  'legwear:stoking-hitam': 'Black tights', 'legwear:stoking-pink': 'Pink tights', 'legwear:kaus-renda': 'Lace ankle socks', 'legwear:kaus-selutut': 'Knee socks',
  // Sepatu
  'shoes:flat': 'Ballet flats', 'shoes:maryjane': 'Mary Janes', 'shoes:maryjane-mutiara': 'Pearl Mary Janes', 'shoes:pump': 'Pointed pumps',
  'shoes:kitten': 'Kitten heels', 'shoes:strappy': 'Strappy heels', 'shoes:slingback': 'Slingbacks', 'shoes:platform': 'Platforms',
  'shoes:platform-mj': 'Platform Mary Janes', 'shoes:sneaker': 'Sneakers', 'shoes:boot': 'Tall boots', 'shoes:ankle': 'Ankle boots',
  'shoes:chelsea': 'Chelsea boots', 'shoes:combat': 'Lace-up boots', 'shoes:loafer': 'Loafers', 'shoes:oxford': 'Oxfords',
  'shoes:sandal': 'Strappy sandals', 'shoes:espadrille': 'Espadrilles', 'shoes:pita-balet': 'Ribbon ballet shoes', 'shoes:clog': 'Wooden clogs',
  'shoes:bot-hujan': 'Rain boots', 'shoes:selop': 'Fluffy slippers',
  // Aksesori
  'head:baret': 'Beret', 'head:fedora': 'Fedora', 'head:topi-lebar': 'Wide-brim bow hat', 'head:kupluk': 'Knit beanie', 'head:bando': 'Plain headband',
  'head:bando-beludru': 'Velvet headband', 'head:bando-mutiara': 'Pearl headband', 'head:bando-kucing': 'Cat-ear headband', 'head:mahkota-bunga': 'Flower crown',
  'head:tiara': 'Tiara', 'head:hijab': 'Hijab', 'head:headphone': 'Headphones',
  'hairAcc:pita-besar': 'Big bow', 'hairAcc:pita-dua': 'Twin little bows', 'hairAcc:pita-satin': 'Long satin ribbon', 'hairAcc:jepit-mutiara': 'Pearl clip',
  'hairAcc:jepit-kupu': 'Butterfly clip', 'hairAcc:jepit-bintang': 'Star clip', 'hairAcc:bunga-telinga': 'Flower behind the ear', 'hairAcc:scrunchie': 'Scrunchie',
  'ears:hoop': 'Hoop earrings', 'ears:mutiara': 'Pearl earrings', 'ears:hati': 'Heart earrings', 'ears:juntai': 'Drop earrings', 'ears:pita': 'Bow earrings',
  'neck:kalung-mutiara': 'Pearl necklace', 'neck:choker-beludru': 'Velvet choker', 'neck:choker-renda': 'Lace choker', 'neck:liontin': 'Heart locket',
  'neck:syal': 'Silk scarf', 'neck:syal-rajut': 'Knit scarf', 'neck:dasi': 'Necktie', 'neck:dasi-kupu': 'Bow tie',
  'wrist:gelang-mutiara': 'Pearl bracelet', 'wrist:gelang-emas': 'Gold bangle', 'wrist:jam': 'Wristwatch', 'wrist:gelang-manik': 'Pastel bead bracelet',
  'ring:cincin-emas': 'Gold ring', 'ring:cincin-permata': 'Gemstone ring',
  'bag:tas-tangan': 'Handbag', 'bag:tas-bahu': 'Shoulder bag', 'bag:tas-mini': 'Mini chain bag', 'bag:tote': 'Canvas tote', 'bag:tas-keranjang': 'Basket bag', 'bag:tas-hati': 'Heart bag',
  'glasses:bulat': 'Round glasses', 'glasses:cat-eye': 'Cat-eye glasses', 'glasses:oval-tipis': 'Thin oval glasses', 'glasses:hitam': 'Sunglasses', 'glasses:hati': 'Heart glasses',
};
/** Nama kategori item (kunci `cat` tetap bahasa Indonesia karena dipakai sebagai filter). */
export const catName = (c) => L(c, EN_CAT[c]);
const EN_CAT = { Rambut: 'Hair', Atasan: 'Tops', Gaun: 'Dresses', Luaran: 'Outerwear', Bawahan: 'Bottoms', 'Kaus kaki': 'Socks', Sepatu: 'Shoes', Kepala: 'Head', Perhiasan: 'Jewelry', Syal: 'Scarves', Tas: 'Bags', Kacamata: 'Glasses' };
const EN_LABEL = {
  'Main di bulan Maret–Mei': 'Play in March–May',
  'Main di bulan Desember–Januari': 'Play in December–January',
  'Main di sekitar malam tahun baru (30 Des–2 Jan)': 'Play around New Year\'s Eve (Dec 30–Jan 2)',
};
for (const it of ITEMS) {
  bi(it, 'n', EN_ITEMS[`${it.slot}:${it.id}`]);
  if (it.unlock?.label) bi(it.unlock, 'label', EN_LABEL[it.unlock.label]);
}
const EN_NAMES = {
  Hitam: 'Black', 'Cokelat tua': 'Dark brown', Cokelat: 'Brown', 'Cokelat muda': 'Light brown', Pirang: 'Blonde', 'Pirang platina': 'Platinum blonde',
  Auburn: 'Auburn', Jahe: 'Ginger', 'Merah muda': 'Pink', Lavender: 'Lavender', Perak: 'Silver', 'Biru pastel': 'Pastel blue', Mint: 'Mint', Persik: 'Peach',
  Hazel: 'Hazel', Amber: 'Amber', Biru: 'Blue', Hijau: 'Green', Abu: 'Gray', Ungu: 'Purple',
  Alami: 'Natural', Nude: 'Nude', Pink: 'Pink', Rose: 'Rose', Koral: 'Coral', Merah: 'Red', Berry: 'Berry', Mauve: 'Mauve', Plum: 'Plum',
  Tanpa: 'None', Perunggu: 'Bronze', Smoky: 'Smoky', Sampanye: 'Champagne', Sage: 'Sage', 'Fuchsia lembut': 'Soft fuchsia', Terakota: 'Terracotta',
  // Tubuh & wajah
  Ramping: 'Slim', Sedang: 'Average', 'Jam pasir': 'Hourglass', Atletis: 'Athletic', Berisi: 'Curvy', Tegap: 'Broad',
  Oval: 'Oval', Hati: 'Heart', Bulat: 'Round', Persegi: 'Square', Panjang: 'Long', Berlian: 'Diamond',
  Almond: 'Almond', Sayu: 'Hooded', Monolid: 'Monolid', Menurun: 'Downturned', Kucing: 'Cat',
  Melengkung: 'Arched', Lurus: 'Straight', Tebal: 'Thick', Tipis: 'Thin', Tegas: 'Defined', Lembut: 'Soft',
  Mungil: 'Petite', Lebar: 'Wide', Runcing: 'Pointed', Penuh: 'Full', 'Busur cupid': 'Cupid\'s bow', 'Bibir bawah tebal': 'Full lower lip',
  Tenang: 'Calm', Senyum: 'Smile', Tertawa: 'Laugh', Smirk: 'Smirk', Manyun: 'Pout', Kaget: 'Surprised', Kedip: 'Wink', 'Mata tersenyum': 'Smiling eyes',
  // Makeup
  Bersayap: 'Winged', 'Cat eye': 'Cat eye', Polos: 'Bare', Natural: 'Natural', Lentik: 'Curled', Dramatis: 'Dramatic',
  'Pipi apel': 'Apple cheeks', Sunkissed: 'Sunkissed', Draping: 'Draping', Satin: 'Satin', Matte: 'Matte', Gloss: 'Gloss', Tint: 'Tint',
  Sedikit: 'A few', Banyak: 'Lots', 'Di pipi': 'On the cheek', 'Dekat bibir': 'Near the lips', 'Bawah mata': 'Under the eye',
  // Tema
  'Coquette Pink': 'Coquette Pink', Vanila: 'Vanilla', 'Vintage Rose': 'Vintage Rose', 'Lavender Dream': 'Lavender Dream',
  'Cokelat Hangat': 'Warm Cocoa', 'Taman Sage': 'Sage Garden', 'Tengah Malam': 'Midnight',
};
const nameEn = (o) => bi(o, 'n', EN_NAMES[o.n]);
[HAIR_COLORS, EYE_COLORS, LIP_COLORS, SHADOW_COLORS, BLUSH_COLORS, THEMES, BUILDS, ...Object.values(FACE), ...Object.values(MAKEUP)].forEach((list) => list.forEach(nameEn));
const EN_RARITY = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };
for (const [k, r] of Object.entries(RARITY)) bi(r, 'n', EN_RARITY[k]);
const EN_COLL = {
  putri: ['Royal Princess Collection', 'Voluminous gowns, tiaras, and pearls.'],
  balet: ['Balletcore Collection', 'Tutus, satin ribbons, and ribbon shoes.'],
  vintage: ['Vintage Romance Collection', 'Classic fifties style.'],
  semi: ['Spring Garden Collection', 'Flowers, baskets, and sandals. Seasonal: March–May.'],
  malam: ['Midnight Collection', 'Evening gowns and dark velvet.'],
  teh: ['Tea Party Collection', 'Lace, wide-brim hats, and bows.'],
  dingin: ['Year-End Collection', 'Warm coats and knits. Seasonal: December–January.'],
  pesta: ['New Year\'s Eve Collection', 'Event edition: play around New Year\'s Eve (Dec 30–Jan 2).'],
};
for (const [k, c] of Object.entries(COLLECTIONS)) { bi(c, 'n', EN_COLL[k][0]); bi(c, 'd', EN_COLL[k][1]); }
/** Nama grup warna (kunci COLORS tetap bahasa Indonesia). */
export const colorGroupName = (g) => L(g, { Pastel: 'Pastel', Netral: 'Neutral', Gelap: 'Dark' }[g]);
