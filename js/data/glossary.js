// Kamus kata: istilah di soal & penjelasan yang bisa diklik.
//
// Aturan menulis entri:
// - `match`: bentuk kata yang dicari di teks (tidak peka huruf besar/kecil, harus kata utuh).
// - `def`  : 1–2 kalimat sederhana. JANGAN membocorkan jawaban soal mana pun.
//            (tests/glossary.test.mjs memeriksa ini otomatis.)
// - `skip` : id soal tempat istilah ini TIDAK boleh disorot karena menjelaskannya = memberi jawaban.
import GLOSSARY_EN from './en/glossary.js';
import { bi, isEn } from '../core/i18n.js';

export const GLOSSARY = [
  // ── Sains
  { id: 'tata-surya', term: 'Tata Surya', match: ['tata surya'],
    def: 'Matahari beserta semua benda langit yang mengitarinya: planet, bulan, asteroid, dan komet.' },
  { id: 'simbol-kimia', term: 'Simbol kimia', match: ['simbol kimia'],
    def: 'Singkatan satu atau dua huruf untuk sebuah unsur kimia. Huruf pertamanya selalu kapital, misalnya O untuk oksigen dan H untuk hidrogen.' },
  { id: 'atmosfer', term: 'Atmosfer', match: ['atmosfer'],
    def: 'Lapisan gas yang menyelimuti sebuah planet. Atmosfer Bumi melindungi kita dari radiasi Matahari dan menjaga suhu tetap layak huni.' },
  { id: 'sel', term: 'Sel', match: ['sel', 'sel tubuh'],
    def: 'Unit terkecil penyusun makhluk hidup. Tubuh manusia tersusun dari triliunan sel, misalnya sel kulit, sel otot, dan sel saraf.' },
  { id: 'organel', term: 'Organel', match: ['organel', 'organel sel'],
    def: 'Bagian kecil di dalam sel yang punya tugas khusus, mirip "organ" versi mini. Ada organel yang membuat protein, menyimpan materi genetik, atau mengolah energi.' },
  { id: 'kromosom', term: 'Kromosom', match: ['kromosom'],
    def: 'Struktur seperti benang di dalam inti sel yang tersusun dari DNA yang tergulung rapat. Kromosom membawa gen, yaitu "resep" yang menentukan sifat makhluk hidup seperti warna mata dan golongan darah.',
    example: 'Kromosom diwariskan dari kedua orang tua: separuh dari ayah, separuh dari ibu.' },
  { id: 'dna', term: 'DNA', match: ['dna'],
    def: 'Molekul panjang yang menyimpan informasi genetik. Bentuknya seperti tangga yang terpilin (heliks ganda).' },
  { id: 'gen', term: 'Gen', match: ['gen'],
    def: 'Potongan DNA yang berisi instruksi untuk satu sifat atau fungsi tertentu di tubuh.' },
  { id: 'ruang-hampa', term: 'Ruang hampa', match: ['ruang hampa'],
    def: 'Ruang tanpa udara atau materi apa pun, disebut juga vakum. Luar angkasa hampir sepenuhnya hampa.' },
  { id: 'golongan-darah', term: 'Golongan darah', match: ['golongan darah'],
    def: 'Pengelompokan darah berdasarkan penanda (antigen) di permukaan sel darah merah. Sistem yang paling dikenal adalah ABO dan rhesus (positif/negatif).' },
  { id: 'donor-universal', term: 'Donor universal', match: ['donor universal'],
    def: 'Golongan darah yang sel darah merahnya bisa diberikan ke penerima dengan golongan darah apa pun, karena kecil kemungkinannya memicu reaksi penolakan.' },
  { id: 'sel-darah-merah', term: 'Sel darah merah', match: ['sel darah merah'],
    def: 'Sel darah yang mengangkut oksigen dari paru-paru ke seluruh tubuh. Warnanya merah karena mengandung hemoglobin.' },
  { id: 'antigen', term: 'Antigen', match: ['antigen'],
    def: 'Penanda di permukaan sel atau kuman yang bisa dikenali sistem kekebalan tubuh.' },
  { id: 'rhesus', term: 'Rhesus (Rh)', match: ['rh'],
    def: 'Penanda tambahan pada sel darah merah. Jika ada, golongan darahnya disebut positif; jika tidak ada, disebut negatif.' },
  { id: 'atp', term: 'ATP', match: ['atp'],
    def: 'Adenosin trifosfat, molekul yang menjadi "baterai" energi bagi sel.' },
  { id: 'respirasi-seluler', term: 'Respirasi seluler', match: ['respirasi seluler'],
    def: 'Proses sel mengolah zat makanan (seperti glukosa) dengan oksigen untuk menghasilkan energi.' },
  { id: 'klorofil', term: 'Klorofil', match: ['klorofil'],
    def: 'Zat hijau daun yang menyerap cahaya matahari untuk diubah menjadi energi bagi tumbuhan.' },
  { id: 'sel-kelamin', term: 'Sel kelamin', match: ['sel kelamin'],
    def: 'Sel sperma dan sel telur. Saat keduanya bertemu, terbentuklah sel pertama calon makhluk hidup baru.' },

  // ── Sejarah
  { id: 'proklamasi', term: 'Proklamasi', match: ['proklamasi'],
    def: 'Pernyataan resmi yang diumumkan kepada publik. Dalam sejarah Indonesia, merujuk pada pernyataan kemerdekaan bangsa Indonesia.' },
  { id: 'sumpah-pemuda', term: 'Sumpah Pemuda', match: ['sumpah pemuda'],
    def: 'Ikrar para pemuda dari berbagai daerah untuk mengakui satu tanah air, satu bangsa, dan menjunjung satu bahasa persatuan: Indonesia.' },
  { id: 'ikrar', term: 'Ikrar', match: ['ikrar', 'diikrarkan'],
    def: 'Janji yang diucapkan dengan sungguh-sungguh, biasanya di depan banyak orang.' },
  { id: 'sumpah-palapa', term: 'Sumpah Palapa', match: ['sumpah palapa'],
    def: 'Sumpah Gajah Mada bahwa ia tidak akan menikmati "palapa" (kesenangan atau rempah tertentu, tafsirannya beragam) sebelum menyatukan wilayah Nusantara.' },
  { id: 'mahapatih', term: 'Mahapatih', match: ['mahapatih'],
    def: 'Jabatan tertinggi di bawah raja pada kerajaan-kerajaan Jawa kuno, kira-kira setara perdana menteri.' },
  { id: 'tembok-berlin', term: 'Tembok Berlin', match: ['tembok berlin'],
    def: 'Tembok beton yang memisahkan Berlin Barat dan Berlin Timur di Jerman pada masa Perang Dingin. Runtuhnya menjadi simbol berakhirnya perpecahan Eropa.' },
  { id: 'perang-dingin', term: 'Perang Dingin', match: ['perang dingin'], skip: ['sejarah-068'],
    def: 'Persaingan panjang antara blok Amerika Serikat dan blok Uni Soviet setelah Perang Dunia II, tanpa perang langsung di antara keduanya.' },
  { id: 'kaa', term: 'Konferensi Asia Afrika', match: ['konferensi asia afrika', 'kaa'],
    def: 'Pertemuan negara-negara Asia dan Afrika, banyak di antaranya baru merdeka, untuk menggalang kerja sama dan menentang penjajahan.' },
  { id: 'candi', term: 'Candi', match: ['candi'], skip: ['sejarah-032'],
    def: 'Bangunan kuno dari batu peninggalan masa Hindu-Buddha, biasanya untuk tempat ibadah atau memuliakan raja.' },
  { id: 'wangsa', term: 'Wangsa', match: ['wangsa'],
    def: 'Garis keturunan keluarga raja yang memerintah turun-temurun. Sama artinya dengan dinasti.' },
  { id: 'kmb', term: 'Konferensi Meja Bundar (KMB)', match: ['konferensi meja bundar', 'kmb'],
    def: 'Perundingan antara Indonesia dan Belanda, ditengahi PBB, untuk menyelesaikan sengketa setelah Indonesia memproklamasikan kemerdekaannya.' },
  { id: 'kedaulatan', term: 'Kedaulatan', match: ['kedaulatan'],
    def: 'Kekuasaan penuh sebuah negara untuk mengatur dirinya sendiri tanpa campur tangan negara lain.' },
  { id: 'revolusi', term: 'Revolusi', match: ['revolusi'],
    def: 'Perubahan besar yang terjadi dengan cepat, misalnya dalam sistem pemerintahan atau cara hidup masyarakat.' },
  { id: 'prasasti', term: 'Prasasti', match: ['prasasti'],
    def: 'Tulisan kuno yang dipahat di batu, logam, atau benda keras lain. Prasasti menjadi sumber penting untuk mengetahui sejarah kerajaan.' },
  { id: 'bastille', term: 'Bastille', match: ['bastille'],
    def: 'Benteng sekaligus penjara di Paris yang dianggap lambang kekuasaan raja yang sewenang-wenang.' },

  // ── Geografi
  { id: 'ibu-kota', term: 'Ibu kota', match: ['ibu kota'],
    def: 'Kota tempat pusat pemerintahan sebuah negara atau provinsi berada. Ibu kota tidak selalu kota terbesar.' },
  { id: 'permukaan-laut', term: 'Permukaan laut', match: ['permukaan laut'],
    def: 'Patokan ketinggian rata-rata air laut. Tinggi gunung biasanya diukur dari titik ini dan ditulis "mdpl" (meter di atas permukaan laut).' },
  { id: 'samudra', term: 'Samudra', match: ['samudra'],
    def: 'Laut yang sangat luas dan dalam yang memisahkan benua-benua.' },
  { id: 'danau-vulkanik', term: 'Danau vulkanik', match: ['danau vulkanik'],
    def: 'Danau yang terbentuk di bekas kawah atau kaldera gunung berapi.' },
  { id: 'supervulkan', term: 'Supervulkan', match: ['supervulkan'],
    def: 'Gunung berapi yang letusannya sangat dahsyat, jauh lebih besar dari letusan gunung api biasa, dan bisa memengaruhi iklim dunia.' },
  { id: 'gurun', term: 'Gurun', match: ['gurun'],
    def: 'Wilayah yang sangat sedikit menerima hujan. Gurun tidak selalu panas; ada juga gurun dingin.' },
  { id: 'selat', term: 'Selat', match: ['selat'],
    def: 'Perairan sempit yang memisahkan dua daratan dan menghubungkan dua laut.' },

  // ── Teknologi
  { id: 'http', term: 'HTTP', match: ['http'], skip: ['teknologi-01'],
    def: 'Aturan komunikasi antara browser dan server web untuk meminta dan mengirim halaman.' },
  { id: 'https', term: 'HTTPS', match: ['https'],
    def: 'Versi HTTP yang dienkripsi, sehingga data yang lewat (misalnya kata sandi) tidak bisa diintip di tengah jalan. Ditandai ikon gembok di browser.' },
  { id: 'protokol', term: 'Protokol', match: ['protokol'],
    def: 'Dalam jaringan, protokol adalah aturan baku agar perangkat yang berbeda bisa saling berkomunikasi.' },
  { id: 'port', term: 'Port', match: ['port'],
    def: 'Nomor "pintu" di sebuah komputer yang menentukan layanan mana yang menerima data, misalnya layanan web, email, atau remote login.' },
  { id: 'byte', term: 'Byte', match: ['byte'],
    def: 'Satuan ukuran data digital yang tersusun dari beberapa bit. Ukuran file (KB, MB, GB) dihitung dalam byte.' },
  { id: 'bit', term: 'Bit', match: ['bit'],
    def: 'Satuan data terkecil di komputer. Nilainya hanya 0 atau 1.' },
  { id: 'bahasa-pemrograman', term: 'Bahasa pemrograman', match: ['bahasa pemrograman'],
    def: 'Bahasa buatan untuk menulis perintah yang bisa dijalankan komputer, misalnya untuk membuat aplikasi atau situs web.' },
  { id: 'www', term: 'World Wide Web', match: ['world wide web', 'www'],
    def: 'Kumpulan halaman yang saling terhubung lewat tautan dan dibuka dengan browser. Web hanyalah salah satu layanan di atas internet.' },
  { id: 'jaringan-komputer', term: 'Jaringan komputer', match: ['jaringan komputer'],
    def: 'Dua komputer atau lebih yang terhubung sehingga bisa bertukar data, baik lewat kabel maupun nirkabel.' },
  { id: 'dns', term: 'DNS', match: ['dns'], skip: ['teknologi-07'],
    def: 'Domain Name System: "buku telepon" internet yang mencocokkan nama situs dengan alamat IP servernya.' },
  { id: 'dhcp', term: 'DHCP', match: ['dhcp'],
    def: 'Layanan yang otomatis memberi alamat IP ke perangkat saat terhubung ke jaringan, sehingga tidak perlu diatur manual.' },
  { id: 'alamat-ip', term: 'Alamat IP', match: ['alamat ip'],
    def: 'Alamat unik untuk setiap perangkat di jaringan, supaya data tahu harus dikirim ke mana.' },
  { id: 'osi', term: 'Model OSI', match: ['model osi', 'osi'],
    def: 'Model acuan yang membagi komunikasi jaringan menjadi beberapa lapisan bertingkat, dari kabel fisik sampai aplikasi yang kamu pakai.' },
  { id: 'layer', term: 'Layer (lapisan)', match: ['layer', 'lapisan'],
    def: 'Tingkatan dalam model jaringan. Setiap lapisan punya tugas sendiri dan hanya "berbicara" dengan lapisan di atas dan bawahnya.' },
  { id: 'ipv4', term: 'IPv4', match: ['ipv4'],
    def: 'Versi ke-4 dari Internet Protocol, format alamat IP yang ditulis sebagai empat angka dipisah titik, misalnya 192.168.1.1.' },
  { id: 'enkripsi', term: 'Enkripsi', match: ['enkripsi', 'mengenkripsi'],
    def: 'Mengubah data menjadi kode acak agar hanya pihak yang punya kuncinya yang bisa membacanya.' },

  // ── Matematika
  { id: 'bilangan-prima', term: 'Bilangan prima', match: ['bilangan prima', 'prima'],
    def: 'Bilangan bulat lebih dari 1 yang hanya bisa dibagi habis oleh 1 dan dirinya sendiri.',
    example: 'Contoh: 7 adalah prima, tetapi 9 bukan karena bisa dibagi 3.' },
  { id: 'akar-kuadrat', term: 'Akar kuadrat', match: ['akar kuadrat'],
    def: 'Bilangan yang jika dikalikan dengan dirinya sendiri menghasilkan bilangan semula.',
    example: 'Contoh: akar kuadrat dari 25 adalah 5, karena 5 × 5 = 25.' },
  { id: 'pangkat', term: 'Pangkat', match: ['pangkat'],
    def: 'Perkalian sebuah bilangan dengan dirinya sendiri berulang kali.',
    example: 'Contoh: 3 pangkat 4 (3⁴) = 3 × 3 × 3 × 3 = 81.' },
  { id: 'faktorial', term: 'Faktorial', match: ['faktorial'],
    def: 'Hasil perkalian semua bilangan bulat positif dari 1 sampai bilangan itu. Ditulis dengan tanda seru (!).',
    example: 'Contoh: 4! = 4 × 3 × 2 × 1 = 24.' },
  { id: 'persen', term: 'Persen (%)', match: ['persen'],
    def: 'Bagian dari seratus. 50% berarti 50 dari setiap 100, atau setengah.' },

  // ── Sastra
  { id: 'novel', term: 'Novel', match: ['novel'],
    def: 'Karya cerita fiksi panjang berbentuk prosa, dengan tokoh dan alur yang dikembangkan secara mendalam.' },
  { id: 'puisi', term: 'Puisi', match: ['puisi'],
    def: 'Karya sastra yang mengutamakan pilihan kata, irama, dan makna yang padat, biasanya ditulis dalam baris dan bait.' },
  { id: 'drama', term: 'Drama', match: ['drama'],
    def: 'Karya sastra yang ditulis dalam bentuk dialog untuk dipentaskan oleh aktor di panggung.' },
  { id: 'roman', term: 'Roman', match: ['roman'],
    def: 'Istilah lama untuk cerita prosa panjang yang mengisahkan hidup tokohnya dari muda sampai dewasa, mirip novel.' },
  { id: 'distopia', term: 'Distopia', match: ['distopia'],
    def: 'Gambaran masyarakat masa depan yang suram dan menindas, kebalikan dari utopia (masyarakat ideal).' },
  { id: 'balai-pustaka', term: 'Balai Pustaka', match: ['balai pustaka'],
    def: 'Penerbit yang didirikan pemerintah Hindia Belanda pada 1917 dan menerbitkan banyak karya sastra Indonesia awal.' },
  { id: 'kumpulan-puisi', term: 'Kumpulan puisi', match: ['kumpulan puisi'],
    def: 'Buku yang berisi banyak puisi, biasanya dari satu penyair. Disebut juga antologi.' },

  // ── Seni & Budaya
  { id: 'unesco', term: 'UNESCO', match: ['unesco'],
    def: 'Badan PBB untuk pendidikan, ilmu pengetahuan, dan kebudayaan. Salah satu tugasnya menetapkan warisan dunia yang perlu dilestarikan.' },
  { id: 'wbtb', term: 'Warisan Budaya Takbenda', match: ['warisan budaya takbenda'],
    def: 'Budaya yang tidak berupa benda, seperti tradisi, tarian, keterampilan, atau pengetahuan yang diwariskan turun-temurun.' },
  { id: 'rumah-adat', term: 'Rumah adat', match: ['rumah adat'],
    def: 'Rumah tradisional yang bentuk dan aturannya khas suatu suku atau daerah.' },
  { id: 'alat-musik', term: 'Alat musik', match: ['alat musik'],
    def: 'Benda yang dibuat untuk menghasilkan bunyi musik, misalnya dengan dipukul, dipetik, ditiup, atau digoyang.' },

  // ── Olahraga
  { id: 'olimpiade', term: 'Olimpiade', match: ['olimpiade'],
    def: 'Pesta olahraga antarnegara terbesar di dunia yang diadakan setiap empat tahun, terinspirasi dari pertandingan di Yunani kuno.' },
  { id: 'grand-slam', term: 'Grand Slam', match: ['grand slam'],
    def: 'Sebutan untuk empat turnamen tenis paling bergengsi di dunia setiap tahunnya.' },
  { id: 'tripoin', term: 'Garis tripoin', match: ['garis tripoin', 'tripoin'],
    def: 'Garis setengah lingkaran di lapangan basket. Tembakan dari luar garis ini bernilai lebih tinggi daripada tembakan dari dalam.' },
  { id: 'maraton', term: 'Maraton', match: ['maraton'],
    def: 'Lomba lari jarak jauh di jalan raya. Namanya berasal dari kisah pelari Yunani kuno dari kota Marathon.' },
  { id: 'gim', term: 'Gim', match: ['gim'],
    def: 'Dalam bulu tangkis atau voli, satu babak pertandingan. Pemenang pertandingan ditentukan dari jumlah gim yang dimenangkan.' },
  { id: 'adu-penalti', term: 'Adu penalti', match: ['adu penalti'],
    def: 'Cara menentukan pemenang sepak bola saat skor masih imbang: tiap tim bergantian menendang bola ke gawang dari titik penalti.' },

  // ── Hiburan
  { id: 'sutradara', term: 'Sutradara', match: ['sutradara', 'disutradarai'],
    def: 'Orang yang memimpin pembuatan film dan menentukan bagaimana cerita ditampilkan di layar.' },
  { id: 'animasi', term: 'Animasi', match: ['animasi'],
    def: 'Gambar atau model yang dibuat seolah bergerak dengan menampilkan banyak gambar berurutan dengan cepat.' },
  { id: 'studio', term: 'Studio', match: ['studio'],
    def: 'Dalam film dan game, perusahaan yang memproduksi karya tersebut.' },
  { id: 'album', term: 'Album', match: ['album'],
    def: 'Kumpulan lagu seorang penyanyi atau band yang dirilis bersama dalam satu paket.' },

  // ── Umum
  { id: 'mata-uang', term: 'Mata uang', match: ['mata uang'],
    def: 'Satuan uang resmi yang berlaku di sebuah negara, misalnya rupiah di Indonesia.' },
  { id: 'lambang-negara', term: 'Lambang negara', match: ['lambang negara'],
    def: 'Simbol resmi yang mewakili identitas sebuah negara dan dipakai pada dokumen serta gedung pemerintahan.' },
  { id: 'organ', term: 'Organ', match: ['organ'], skip: ['sains-017'],
    def: 'Bagian tubuh yang tersusun dari berbagai jaringan dan punya fungsi khusus, seperti jantung untuk memompa darah.' },
  { id: 'bahasa-resmi', term: 'Bahasa resmi', match: ['bahasa resmi'],
    def: 'Bahasa yang ditetapkan negara untuk pemerintahan, pendidikan, dan dokumen resmi.' },
  { id: 'semboyan', term: 'Semboyan', match: ['semboyan'],
    def: 'Kalimat pendek yang menjadi pegangan atau prinsip, biasanya mudah diingat.' },
  { id: 'kitab', term: 'Kitab', match: ['kitab'], skip: ['sastra-087'],
    def: 'Buku, terutama buku lama yang dianggap penting. Dalam sastra Jawa kuno, banyak kitab ditulis sebagai syair panjang bernama kakawin.' },
  { id: 'kakawin', term: 'Kakawin', match: ['kakawin'],
    def: 'Syair panjang berbahasa Jawa kuno dengan aturan irama dari India.' },
  { id: 'lagu-kebangsaan', term: 'Lagu kebangsaan', match: ['lagu kebangsaan'],
    def: 'Lagu resmi sebuah negara yang dinyanyikan pada upacara dan acara kenegaraan.' },
];

// Versi English (js/data/en/glossary.js): term/def/example mengikuti bahasa aktif.
// Pencocokan kata memakai daftar `match` milik bahasa aktif; `skip` berlaku di kedua bahasa,
// ditambah `skip` khusus English bila ada.
for (const g of GLOSSARY) {
  const en = GLOSSARY_EN[g.id];
  if (!en) continue;
  g.matchEn = en.match;
  g.skipEn = en.skip || [];
  bi(g, 'term', en.term);
  bi(g, 'def', en.def);
  if (en.example || g.example) bi(g, 'example', en.example || '');
}

export const GLOSSARY_BY_ID = Object.fromEntries(GLOSSARY.map((g) => [g.id, g]));

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function matcher(key) {
  const patterns = GLOSSARY.flatMap((g) => (g[key] || []).map((m) => ({ m: m.toLowerCase(), id: g.id })))
    .sort((a, b) => b.m.length - a.m.length);
  return {
    byPattern: Object.fromEntries(patterns.map((p) => [p.m, p.id])),
    re: new RegExp(`(?<![\\p{L}\\p{N}])(${patterns.map((p) => escape(p.m)).join('|')})(?![\\p{L}\\p{N}])`, 'giu'),
  };
}
const MATCHERS = { id: matcher('match'), en: matcher('matchEn') };

/**
 * Memecah teks menjadi potongan: string biasa atau { id, text } untuk istilah kamus.
 * Setiap istilah hanya disorot sekali per teks. `qid` dipakai untuk aturan `skip`.
 */
export function segmentText(text, qid = null) {
  const out = [];
  const used = new Set();
  let last = 0;
  const { re, byPattern } = MATCHERS[isEn() ? 'en' : 'id'];
  for (const m of text.matchAll(re)) {
    const id = byPattern[m[0].toLowerCase()];
    const entry = GLOSSARY_BY_ID[id];
    if (!entry || used.has(id) || (qid && (entry.skip?.includes(qid) || (isEn() && entry.skipEn?.includes(qid))))) continue;
    used.add(id);
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push({ id, text: m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function termsIn(text, qid = null) {
  return segmentText(text, qid).filter((s) => typeof s !== 'string').map((s) => s.id);
}
