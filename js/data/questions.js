// Bank soal "tahu gak?"
//
// Cara menambah soal:
//   q(id, kategori, kesulitan, pertanyaan, [JAWABAN_BENAR, salah1, salah2, salah3], penjelasan)
//
// - Jawaban benar SELALU ditulis di urutan pertama. Urutan pilihan diacak saat soal tampil
//   (untuk tantangan harian diacak dengan seed tanggal supaya sama untuk semua pemain).
// - `id` harus unik dan tidak boleh diganti setelah rilis (riwayat & daftar kesalahan memakai id).
// - kesulitan: 1 = mudah, 2 = sedang, 3 = sulit.
// - Soal tambahan ada di js/data/bank/<kategori>.js (format ringkas, id otomatis dari urutan).
// - Jalankan `node tests/validate-questions.mjs` setelah mengedit file ini.

import sainsBank from './bank/sains.js';
import sejarahBank from './bank/sejarah.js';
import geografiBank from './bank/geografi.js';
import teknologiBank from './bank/teknologi.js';
import matematikaBank from './bank/matematika.js';
import sastraBank from './bank/sastra.js';
import seniBank from './bank/seni.js';
import olahragaBank from './bank/olahraga.js';
import hiburanBank from './bank/hiburan.js';
import umumBank from './bank/umum.js';
import { QUESTIONS_EN } from './en/index.js';
import { bi } from '../core/i18n.js';

const q = (id, category, difficulty, text, options, explanation, since = null) => ({
  id, category, difficulty, text, options, answer: 0, explanation, ...(since ? { since } : {}),
});

/**
 * Soal baru punya tanggal rilis (`since`, YYYY-MM-DD, tanggal lokal pemain).
 * Sebelum tanggal itu soalnya tidak dipakai di mode mana pun, supaya bank yang diperbarui
 * di tengah hari tidak mengubah tantangan harian, fun fact, Jalur Hafalan, atau duel hari itu.
 */
export const isReleased = (question, day) => !question.since || question.since <= day;
/** Soal dengan tanggal rilis dalam `days` hari terakhir (termasuk hari ini). */
export const isFresh = (question, day, days = 7) => !!question.since && question.since <= day && daysBetween(question.since, day) < days;
function daysBetween(a, b) { return Math.round((Date.UTC(...b.split('-').map((n, i) => (i === 1 ? n - 1 : +n))) - Date.UTC(...a.split('-').map((n, i) => (i === 1 ? n - 1 : +n)))) / 86400000); }

export const QUESTIONS = [
  // ───────────── Sains ─────────────
  q('sains-01', 'sains', 1, 'Planet terbesar di Tata Surya adalah…',
    ['Jupiter', 'Saturnus', 'Neptunus', 'Bumi'],
    'Massa Jupiter lebih dari dua kali gabungan massa semua planet lain di Tata Surya.'),
  q('sains-02', 'sains', 1, 'Apa simbol kimia untuk emas?',
    ['Au', 'Ag', 'Em', 'Fe'],
    'Au berasal dari bahasa Latin "aurum". Ag adalah perak, Fe adalah besi.'),
  q('sains-03', 'sains', 2, 'Gas apa yang paling banyak terkandung di atmosfer Bumi?',
    ['Nitrogen', 'Oksigen', 'Karbon dioksida', 'Argon'],
    'Nitrogen menyusun sekitar 78% atmosfer, oksigen sekitar 21%.'),
  q('sains-04', 'sains', 1, 'Organel sel yang dijuluki "pembangkit tenaga" sel adalah…',
    ['Mitokondria', 'Ribosom', 'Nukleus', 'Kloroplas'],
    'Mitokondria menghasilkan sebagian besar ATP, sumber energi sel, lewat respirasi seluler.'),
  q('sains-05', 'sains', 2, 'Berapa kira-kira kecepatan cahaya di ruang hampa?',
    ['300.000 km/detik', '30.000 km/detik', '3.000.000 km/detik', '343 meter/detik'],
    'Tepatnya 299.792,458 km/detik. Angka 343 m/detik adalah kecepatan bunyi di udara (sekitar 20°C).'),
  q('sains-06', 'sains', 2, 'Golongan darah yang dikenal sebagai donor universal sel darah merah adalah…',
    ['O negatif', 'AB positif', 'A negatif', 'B positif'],
    'Sel darah merah O negatif tidak memiliki antigen A, B, maupun Rh, sehingga risiko reaksinya paling kecil.'),
  q('sains-07', 'sains', 2, 'Berapa jumlah kromosom pada sel tubuh manusia normal?',
    ['46', '23', '44', '48'],
    'Sel tubuh manusia memiliki 23 pasang kromosom, total 46. Sel kelamin hanya membawa 23.'),
  q('sains-08', 'sains', 2, 'Tulang terpanjang di tubuh manusia adalah…',
    ['Tulang paha (femur)', 'Tulang kering (tibia)', 'Tulang lengan atas (humerus)', 'Tulang belakang'],
    'Femur adalah tulang terpanjang sekaligus salah satu yang terkuat di tubuh manusia.'),
  q('sains-09', 'sains', 1, 'Planet yang dijuluki "Planet Merah" adalah…',
    ['Mars', 'Venus', 'Jupiter', 'Merkurius'],
    'Warna kemerahan Mars berasal dari besi oksida (karat) yang melapisi permukaannya.'),
  q('sains-10', 'sains', 1, 'Proses tumbuhan membuat makanan sendiri dengan bantuan cahaya matahari disebut…',
    ['Fotosintesis', 'Respirasi', 'Transpirasi', 'Evaporasi'],
    'Dengan bantuan klorofil, fotosintesis mengubah karbon dioksida dan air menjadi glukosa dan oksigen.'),

  // ───────────── Sejarah ─────────────
  q('sejarah-01', 'sejarah', 1, 'Kapan Proklamasi Kemerdekaan Indonesia dibacakan?',
    ['17 Agustus 1945', '17 Agustus 1949', '20 Mei 1908', '28 Oktober 1928'],
    'Soekarno dan Hatta membacakan proklamasi di Jalan Pegangsaan Timur 56, Jakarta.'),
  q('sejarah-02', 'sejarah', 1, 'Sumpah Pemuda diikrarkan pada tahun…',
    ['1928', '1908', '1945', '1918'],
    'Sumpah Pemuda lahir dari Kongres Pemuda II, 28 Oktober 1928.'),
  q('sejarah-03', 'sejarah', 1, 'Sumpah Palapa diucapkan oleh Gajah Mada, mahapatih kerajaan…',
    ['Majapahit', 'Sriwijaya', 'Singasari', 'Mataram Kuno'],
    'Gajah Mada bersumpah tidak akan menikmati palapa sebelum menyatukan Nusantara di bawah Majapahit.'),
  q('sejarah-04', 'sejarah', 2, 'Tembok Berlin runtuh pada tahun…',
    ['1989', '1991', '1961', '1975'],
    'Tembok Berlin dibangun pada 1961 dan dibuka pada 9 November 1989.'),
  q('sejarah-05', 'sejarah', 1, 'Siapa presiden pertama Amerika Serikat?',
    ['George Washington', 'Abraham Lincoln', 'Thomas Jefferson', 'John Adams'],
    'George Washington menjabat pada 1789–1797.'),
  q('sejarah-06', 'sejarah', 1, 'Konferensi Asia Afrika pertama tahun 1955 diadakan di kota…',
    ['Bandung', 'Jakarta', 'Yogyakarta', 'Surabaya'],
    'KAA berlangsung pada April 1955 di Gedung Merdeka, Bandung.'),
  q('sejarah-07', 'sejarah', 2, 'Candi Borobudur dibangun pada masa wangsa…',
    ['Syailendra', 'Sanjaya', 'Rajasa', 'Isyana'],
    'Borobudur dibangun sekitar abad ke-8–9 Masehi oleh wangsa Syailendra yang beragama Buddha.'),
  q('sejarah-08', 'sejarah', 3, 'Konferensi Meja Bundar (KMB) tahun 1949 diadakan di kota…',
    ['Den Haag', 'Amsterdam', 'Jakarta', 'Linggarjati'],
    'KMB di Den Haag berujung pada pengakuan kedaulatan Indonesia oleh Belanda pada 27 Desember 1949.'),
  q('sejarah-09', 'sejarah', 2, 'Revolusi Prancis dimulai pada tahun…',
    ['1789', '1776', '1815', '1848'],
    'Penyerbuan Penjara Bastille pada 14 Juli 1789 menjadi simbol dimulainya Revolusi Prancis.'),
  q('sejarah-10', 'sejarah', 2, 'Kerajaan Hindu tertua di Indonesia adalah…',
    ['Kutai', 'Tarumanegara', 'Majapahit', 'Kediri'],
    'Kerajaan Kutai di Kalimantan Timur diketahui dari prasasti Yupa yang berasal dari sekitar abad ke-4 sampai ke-5 Masehi.'),

  // ───────────── Geografi ─────────────
  q('geografi-01', 'geografi', 2, 'Apa ibu kota Australia?',
    ['Canberra', 'Sydney', 'Melbourne', 'Perth'],
    'Canberra dipilih sebagai kompromi antara Sydney dan Melbourne yang sama-sama ingin menjadi ibu kota.'),
  q('geografi-02', 'geografi', 2, 'Sungai terpanjang di Indonesia adalah…',
    ['Kapuas', 'Mahakam', 'Barito', 'Musi'],
    'Sungai Kapuas di Kalimantan Barat panjangnya sekitar 1.143 km.'),
  q('geografi-03', 'geografi', 1, 'Gunung tertinggi di dunia jika diukur dari permukaan laut adalah…',
    ['Everest', 'K2', 'Kilimanjaro', 'Puncak Jaya'],
    'Tinggi Everest sekitar 8.849 meter di atas permukaan laut.'),
  q('geografi-04', 'geografi', 1, 'Samudra terluas di dunia adalah…',
    ['Samudra Pasifik', 'Samudra Atlantik', 'Samudra Hindia', 'Samudra Arktik'],
    'Samudra Pasifik meliputi sekitar sepertiga permukaan Bumi.'),
  q('geografi-05', 'geografi', 1, 'Negara dengan wilayah terluas di dunia adalah…',
    ['Rusia', 'Kanada', 'Tiongkok', 'Amerika Serikat'],
    'Luas Rusia sekitar 17,1 juta km², hampir dua kali luas Kanada.'),
  q('geografi-06', 'geografi', 1, 'Danau Toba terletak di provinsi…',
    ['Sumatera Utara', 'Sumatera Barat', 'Aceh', 'Riau'],
    'Danau Toba adalah danau vulkanik terbesar di dunia, terbentuk dari letusan supervulkan.'),
  q('geografi-07', 'geografi', 2, 'Gurun panas terluas di dunia adalah…',
    ['Sahara', 'Gobi', 'Kalahari', 'Gurun Arab'],
    'Sahara di Afrika Utara adalah gurun panas terluas. Jika gurun dingin dihitung, Antarktika yang terluas.'),
  q('geografi-08', 'geografi', 1, 'Selat yang memisahkan Pulau Jawa dan Pulau Sumatera adalah…',
    ['Selat Sunda', 'Selat Malaka', 'Selat Bali', 'Selat Makassar'],
    'Gunung Anak Krakatau berada di Selat Sunda.'),
  q('geografi-09', 'geografi', 2, 'Apa ibu kota Kanada?',
    ['Ottawa', 'Toronto', 'Vancouver', 'Montreal'],
    'Toronto adalah kota terbesar di Kanada, tetapi ibu kotanya adalah Ottawa di provinsi Ontario.'),
  q('geografi-10', 'geografi', 2, 'Pulau terbesar di dunia adalah…',
    ['Greenland', 'Kalimantan', 'Papua', 'Madagaskar'],
    'Luas Greenland sekitar 2,1 juta km². Papua di urutan kedua dan Kalimantan ketiga. Australia tidak dihitung karena tergolong benua.'),

  // ───────────── Teknologi ─────────────
  q('teknologi-01', 'teknologi', 1, 'Apa kepanjangan dari HTTP?',
    ['HyperText Transfer Protocol', 'High Transfer Text Protocol', 'HyperText Transmission Process', 'Hyperlink Text Transfer Protocol'],
    'HTTP adalah protokol yang dipakai browser untuk meminta dan menerima halaman web.'),
  q('teknologi-02', 'teknologi', 1, 'Bill Gates mendirikan Microsoft bersama…',
    ['Paul Allen', 'Steve Jobs', 'Steve Wozniak', 'Larry Page'],
    'Bill Gates dan Paul Allen mendirikan Microsoft pada 1975.'),
  q('teknologi-03', 'teknologi', 1, 'Satu byte terdiri dari berapa bit?',
    ['8', '4', '16', '10'],
    '1 byte = 8 bit, cukup untuk menyimpan 256 nilai berbeda.'),
  q('teknologi-04', 'teknologi', 2, 'Port standar untuk HTTPS adalah…',
    ['443', '80', '22', '8080'],
    'Port 80 untuk HTTP biasa dan port 22 untuk SSH.'),
  q('teknologi-05', 'teknologi', 2, 'Bahasa pemrograman Python pertama kali dibuat oleh…',
    ['Guido van Rossum', 'James Gosling', 'Dennis Ritchie', 'Rasmus Lerdorf'],
    'Python dirilis pertama kali pada 1991. James Gosling membuat Java, Dennis Ritchie membuat C, dan Rasmus Lerdorf membuat PHP.'),
  q('teknologi-06', 'teknologi', 2, 'Siapa penemu World Wide Web?',
    ['Tim Berners-Lee', 'Vint Cerf', 'Alan Turing', 'Linus Torvalds'],
    'Tim Berners-Lee mengusulkan WWW pada 1989 saat bekerja di CERN.'),
  q('teknologi-07', 'teknologi', 1, 'Dalam jaringan komputer, DNS berfungsi untuk…',
    ['Menerjemahkan nama domain menjadi alamat IP', 'Mengenkripsi lalu lintas jaringan', 'Membagikan alamat IP secara otomatis', 'Memblokir serangan virus'],
    'DNS (Domain Name System) mengubah nama seperti contoh.com menjadi alamat IP. Pembagian IP otomatis adalah tugas DHCP.'),
  q('teknologi-08', 'teknologi', 2, 'Berapa jumlah lapisan (layer) pada model OSI?',
    ['7', '4', '5', '9'],
    'Lapisan OSI: Physical, Data Link, Network, Transport, Session, Presentation, Application. Model TCP/IP umumnya memakai 4 lapisan.'),
  q('teknologi-09', 'teknologi', 3, 'Sebuah alamat IPv4 berukuran berapa bit?',
    ['32 bit', '64 bit', '128 bit', '16 bit'],
    'IPv4 memakai 32 bit (sekitar 4,3 miliar alamat). IPv6 memakai 128 bit.'),
  q('teknologi-10', 'teknologi', 1, 'Dalam satuan penyimpanan data, 1 gigabyte (GB) setara dengan…',
    ['1.000 megabyte', '100 megabyte', '1.000 kilobyte', '10.000 megabyte'],
    'Dalam satuan standar (SI), setiap tingkat dikali 1.000: 1 GB = 1.000 MB. Sistem operasi kadang memakai hitungan biner 1.024.'),

  // ───────────── Matematika ─────────────
  q('matematika-01', 'matematika', 1, 'Berapa hasil dari 7 × 8?',
    ['56', '54', '48', '64'],
    '7 × 8 = 56.'),
  q('matematika-02', 'matematika', 1, 'Jumlah besar sudut dalam sebuah segitiga adalah…',
    ['180°', '360°', '90°', '270°'],
    'Pada geometri bidang datar, jumlah ketiga sudut segitiga selalu 180°.'),
  q('matematika-03', 'matematika', 2, 'Bilangan prima terkecil adalah…',
    ['2', '1', '3', '0'],
    'Bilangan prima punya tepat dua faktor. Angka 1 hanya punya satu faktor, jadi bukan prima. Angka 2 satu-satunya prima genap.'),
  q('matematika-04', 'matematika', 1, 'Akar kuadrat dari 144 adalah…',
    ['12', '14', '11', '16'],
    '12 × 12 = 144.'),
  q('matematika-05', 'matematika', 1, 'Berapa 15% dari 200?',
    ['30', '15', '20', '35'],
    '15/100 × 200 = 30.'),
  q('matematika-06', 'matematika', 1, 'Segi enam (heksagon) memiliki berapa sisi?',
    ['6', '5', '7', '8'],
    'Heksa berarti enam. Sarang lebah adalah contoh bentuk heksagon di alam.'),
  q('matematika-07', 'matematika', 2, 'Berapa hasil dari 2¹⁰ (2 pangkat 10)?',
    ['1.024', '1.000', '512', '2.048'],
    '2¹⁰ = 1.024. Karena itu 1 kilobyte sering dihitung sebagai 1.024 byte.'),
  q('matematika-08', 'matematika', 2, 'Berapa nilai 5! (5 faktorial)?',
    ['120', '25', '60', '720'],
    '5! = 5 × 4 × 3 × 2 × 1 = 120.'),
  q('matematika-09', 'matematika', 3, 'Ada berapa bilangan prima di antara 1 dan 20?',
    ['8', '7', '9', '10'],
    'Bilangan primanya: 2, 3, 5, 7, 11, 13, 17, dan 19.'),
  q('matematika-10', 'matematika', 1, 'Berapa luas persegi dengan panjang sisi 9 cm?',
    ['81 cm²', '36 cm²', '18 cm²', '72 cm²'],
    'Luas persegi = sisi × sisi = 9 × 9 = 81 cm². Angka 36 adalah kelilingnya (dalam cm).'),

  // ───────────── Sastra ─────────────
  q('sastra-01', 'sastra', 1, 'Siapa penulis novel "Laskar Pelangi"?',
    ['Andrea Hirata', 'Pramoedya Ananta Toer', 'Tere Liye', 'Dewi Lestari'],
    'Laskar Pelangi terbit pada 2005 dan berlatar di Belitung.'),
  q('sastra-02', 'sastra', 1, 'Novel "Bumi Manusia" ditulis oleh…',
    ['Pramoedya Ananta Toer', 'Ahmad Tohari', 'Andrea Hirata', 'Mochtar Lubis'],
    'Bumi Manusia adalah buku pertama Tetralogi Buru, disusun Pramoedya saat diasingkan di Pulau Buru.'),
  q('sastra-03', 'sastra', 1, 'Puisi terkenal berjudul "Aku" ditulis oleh…',
    ['Chairil Anwar', 'W.S. Rendra', 'Sapardi Djoko Damono', 'Taufiq Ismail'],
    'Chairil Anwar adalah pelopor Angkatan \'45 dalam sastra Indonesia.'),
  q('sastra-04', 'sastra', 1, 'Drama "Romeo and Juliet" ditulis oleh…',
    ['William Shakespeare', 'Charles Dickens', 'Jane Austen', 'Mark Twain'],
    'Shakespeare menulis Romeo and Juliet pada akhir abad ke-16.'),
  q('sastra-05', 'sastra', 1, 'Siapa penulis seri novel "Harry Potter"?',
    ['J.K. Rowling', 'J.R.R. Tolkien', 'C.S. Lewis', 'Roald Dahl'],
    'Buku pertamanya terbit pada 1997.'),
  q('sastra-06', 'sastra', 2, 'Novel distopia "1984" ditulis oleh…',
    ['George Orwell', 'Aldous Huxley', 'Ray Bradbury', 'H.G. Wells'],
    'Novel itu terbit pada 1949. Aldous Huxley menulis "Brave New World", distopia terkenal lainnya.'),
  q('sastra-07', 'sastra', 2, 'Puisi "Hujan Bulan Juni" adalah karya…',
    ['Sapardi Djoko Damono', 'Chairil Anwar', 'Joko Pinurbo', 'W.S. Rendra'],
    'Hujan Bulan Juni juga menjadi judul kumpulan puisi Sapardi yang terbit pada 1994.'),
  q('sastra-08', 'sastra', 3, 'Roman "Siti Nurbaya" yang diterbitkan Balai Pustaka ditulis oleh…',
    ['Marah Rusli', 'Abdul Muis', 'Sutan Takdir Alisjahbana', 'Hamka'],
    'Siti Nurbaya terbit pada 1922 dan menjadi salah satu karya penting Angkatan Balai Pustaka.'),
  q('sastra-09', 'sastra', 2, 'Novel "Ronggeng Dukuh Paruk" ditulis oleh…',
    ['Ahmad Tohari', 'Mochtar Lubis', 'NH. Dini', 'Seno Gumira Ajidarma'],
    'Novel yang terbit pada 1982 ini berlatar sebuah dusun kecil di daerah Banyumas, Jawa Tengah.'),
  q('sastra-10', 'sastra', 1, 'Tokoh detektif Sherlock Holmes diciptakan oleh…',
    ['Arthur Conan Doyle', 'Agatha Christie', 'Edgar Allan Poe', 'Charles Dickens'],
    'Holmes pertama kali muncul dalam novel "A Study in Scarlet" pada 1887.'),

  // ───────────── Seni & Budaya ─────────────
  q('seni-01', 'seni', 1, 'Siapa pelukis "Mona Lisa"?',
    ['Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Vincent van Gogh'],
    'Mona Lisa dipamerkan di Museum Louvre, Paris.'),
  q('seni-02', 'seni', 2, 'Batik Indonesia diakui UNESCO sebagai Warisan Budaya Takbenda pada tahun…',
    ['2009', '2005', '2012', '1999'],
    'Penetapan pada 2 Oktober 2009 itulah yang kini diperingati sebagai Hari Batik Nasional.'),
  q('seni-03', 'seni', 1, 'Alat musik angklung berasal dari daerah…',
    ['Jawa Barat', 'Bali', 'Sumatera Barat', 'Jawa Timur'],
    'Angklung berasal dari tradisi Sunda dan diakui UNESCO pada 2010.'),
  q('seni-04', 'seni', 1, 'Tari Kecak berasal dari…',
    ['Bali', 'Jawa Tengah', 'Aceh', 'Papua'],
    'Kecak dibawakan puluhan penari pria yang berseru "cak" berulang-ulang, sering mengangkat kisah Ramayana.'),
  q('seni-05', 'seni', 1, 'Lukisan "The Starry Night" dibuat oleh…',
    ['Vincent van Gogh', 'Claude Monet', 'Pablo Picasso', 'Salvador Dalí'],
    'Van Gogh melukisnya pada 1889 di Saint-Rémy-de-Provence, Prancis.'),
  q('seni-06', 'seni', 1, 'Rumah Gadang adalah rumah adat dari…',
    ['Sumatera Barat', 'Sumatera Utara', 'Kalimantan Barat', 'Sulawesi Selatan'],
    'Rumah Gadang adalah rumah adat Minangkabau dengan atap bergonjong yang khas.'),
  q('seni-07', 'seni', 1, 'Tari Saman berasal dari provinsi…',
    ['Aceh', 'Bali', 'Nusa Tenggara Timur', 'Kalimantan Timur'],
    'Tari Saman dari suku Gayo, Aceh, diakui UNESCO pada 2011.'),
  q('seni-08', 'seni', 3, 'Lukisan "Penangkapan Pangeran Diponegoro" (1857) adalah karya…',
    ['Raden Saleh', 'Affandi', 'Basuki Abdullah', 'S. Sudjojono'],
    'Raden Saleh dianggap pelopor seni lukis modern Indonesia.'),
  q('seni-09', 'seni', 2, 'Alat musik petik dari Nusa Tenggara Timur yang wadah suaranya terbuat dari daun lontar adalah…',
    ['Sasando', 'Kolintang', 'Tifa', 'Kecapi'],
    'Sasando berasal dari Pulau Rote. Dawainya dipetik, lalu bunyinya dipantulkan oleh lengkungan daun lontar.'),
  q('seni-10', 'seni', 2, 'Lukisan "Guernica" (1937) dibuat oleh…',
    ['Pablo Picasso', 'Salvador Dalí', 'Joan Miró', 'Henri Matisse'],
    'Picasso melukisnya sebagai protes atas pengeboman kota Guernica di Spanyol saat Perang Saudara Spanyol.'),

  // ───────────── Olahraga ─────────────
  q('olahraga-01', 'olahraga', 1, 'Berapa jumlah pemain satu tim sepak bola di lapangan?',
    ['11', '10', '9', '12'],
    'Setiap tim menurunkan 11 pemain, termasuk satu penjaga gawang.'),
  q('olahraga-02', 'olahraga', 2, 'Olimpiade modern pertama tahun 1896 diadakan di kota…',
    ['Athena', 'Paris', 'London', 'Roma'],
    'Yunani dipilih untuk menghormati asal-usul Olimpiade kuno.'),
  q('olahraga-03', 'olahraga', 1, 'Medali emas Olimpiade pertama Indonesia diraih dari cabang…',
    ['Bulu tangkis', 'Angkat besi', 'Panahan', 'Tinju'],
    'Susi Susanti dan Alan Budikusuma meraih emas di Olimpiade Barcelona 1992.'),
  q('olahraga-04', 'olahraga', 1, 'Dalam bola basket, tembakan dari luar garis tripoin bernilai…',
    ['3 poin', '2 poin', '4 poin', '1 poin'],
    'Tembakan di dalam garis bernilai 2 poin, lemparan bebas 1 poin.'),
  q('olahraga-05', 'olahraga', 1, 'Negara mana yang menjuarai Piala Dunia FIFA 2022?',
    ['Argentina', 'Prancis', 'Brasil', 'Kroasia'],
    'Argentina mengalahkan Prancis lewat adu penalti di final di Qatar.'),
  q('olahraga-06', 'olahraga', 2, 'Pertandingan bulu tangkis (sistem skor 21) dimainkan maksimal berapa gim?',
    ['3', '5', '2', '4'],
    'Pemain yang lebih dulu memenangkan 2 gim menjadi pemenang.'),
  q('olahraga-07', 'olahraga', 2, 'Turnamen Grand Slam tenis yang dimainkan di lapangan tanah liat adalah…',
    ['Prancis Terbuka (Roland Garros)', 'Wimbledon', 'AS Terbuka', 'Australia Terbuka'],
    'Wimbledon memakai lapangan rumput, AS Terbuka dan Australia Terbuka memakai lapangan keras.'),
  q('olahraga-08', 'olahraga', 2, 'Berapa jarak resmi lari maraton?',
    ['42,195 km', '40 km', '21,0975 km', '50 km'],
    'Jarak 21,0975 km adalah setengah maraton.'),
  q('olahraga-09', 'olahraga', 3, 'Tradisi Pencak Silat diakui UNESCO sebagai Warisan Budaya Takbenda dari Indonesia pada tahun…',
    ['2019', '2009', '2015', '2021'],
    'UNESCO menetapkannya pada 12 Desember 2019.'),
  q('olahraga-10', 'olahraga', 2, 'Dalam bulu tangkis, kejuaraan beregu putra tingkat dunia disebut…',
    ['Piala Thomas', 'Piala Uber', 'Piala Sudirman', 'Piala Davis'],
    'Piala Uber untuk beregu putri dan Piala Sudirman untuk beregu campuran. Piala Davis adalah kejuaraan beregu tenis.'),

  // ───────────── Hiburan ─────────────
  q('hiburan-01', 'hiburan', 1, 'Film animasi "Toy Story" (1995) diproduksi oleh studio…',
    ['Pixar', 'DreamWorks', 'Studio Ghibli', 'Illumination'],
    'Toy Story adalah film panjang pertama yang seluruhnya dibuat dengan animasi komputer.'),
  q('hiburan-02', 'hiburan', 2, 'Siapa sutradara film "Jurassic Park" (1993)?',
    ['Steven Spielberg', 'James Cameron', 'George Lucas', 'Christopher Nolan'],
    'Film ini diadaptasi dari novel karya Michael Crichton.'),
  q('hiburan-03', 'hiburan', 1, 'Film animasi "Spirited Away" dibuat oleh studio…',
    ['Studio Ghibli', 'Toei Animation', 'Madhouse', 'Kyoto Animation'],
    'Disutradarai Hayao Miyazaki, film ini memenangkan Oscar untuk Film Animasi Terbaik.'),
  q('hiburan-04', 'hiburan', 2, 'Band The Beatles berasal dari kota…',
    ['Liverpool', 'London', 'Manchester', 'Birmingham'],
    'The Beatles terbentuk di Liverpool, Inggris, pada 1960.'),
  q('hiburan-05', 'hiburan', 1, 'Film "Titanic" (1997) disutradarai oleh…',
    ['James Cameron', 'Steven Spielberg', 'Ridley Scott', 'Peter Jackson'],
    'Titanic memenangkan 11 Piala Oscar, termasuk Film Terbaik.'),
  q('hiburan-06', 'hiburan', 1, 'Serial animasi "Upin & Ipin" berasal dari negara…',
    ['Malaysia', 'Indonesia', 'Singapura', 'Brunei'],
    'Upin & Ipin diproduksi oleh studio Les\' Copaque di Malaysia sejak 2007.'),
  q('hiburan-07', 'hiburan', 2, 'Film horor Indonesia "Pengabdi Setan" (2017) disutradarai oleh…',
    ['Joko Anwar', 'Hanung Bramantyo', 'Riri Riza', 'Garin Nugroho'],
    'Film ini adalah versi baru dari film berjudul sama tahun 1980.'),
  q('hiburan-08', 'hiburan', 1, 'Game "Minecraft" pertama kali dikembangkan oleh studio…',
    ['Mojang', 'Valve', 'Nintendo', 'Rockstar Games'],
    'Minecraft dibuat oleh Markus "Notch" Persson di Mojang, yang kemudian diakuisisi Microsoft pada 2014.'),
  q('hiburan-09', 'hiburan', 1, 'Album "Thriller" (1982) adalah album milik…',
    ['Michael Jackson', 'Prince', 'Madonna', 'Elvis Presley'],
    'Thriller sering disebut sebagai album terlaris sepanjang masa.'),
  q('hiburan-10', 'hiburan', 1, 'Penyanyi yang dijuluki "Queen of Pop" adalah…',
    ['Madonna', 'Beyoncé', 'Lady Gaga', 'Taylor Swift'],
    'Madonna mendapat julukan itu sejak era 1980-an berkat deretan lagu hit dan pengaruhnya pada musik pop.'),

  // ───────────── Pengetahuan Umum ─────────────
  q('umum-01', 'umum', 1, 'Apa mata uang Jepang?',
    ['Yen', 'Won', 'Yuan', 'Ringgit'],
    'Won adalah mata uang Korea Selatan, Yuan milik Tiongkok, dan Ringgit milik Malaysia.'),
  q('umum-02', 'umum', 1, 'Komodo hidup secara alami hanya di negara…',
    ['Indonesia', 'Australia', 'Filipina', 'Papua Nugini'],
    'Komodo hidup di Pulau Komodo, Rinca, Flores, dan pulau-pulau kecil di sekitarnya di Nusa Tenggara Timur.'),
  q('umum-03', 'umum', 1, 'Berapa jumlah hari dalam tahun kabisat?',
    ['366', '365', '364', '360'],
    'Tahun kabisat punya tambahan satu hari, yaitu 29 Februari.'),
  q('umum-04', 'umum', 1, 'Lambang negara Indonesia adalah…',
    ['Garuda Pancasila', 'Bendera Merah Putih', 'Pohon Beringin', 'Banteng'],
    'Pohon beringin dan banteng adalah dua dari lima simbol di perisai Garuda Pancasila.'),
  q('umum-05', 'umum', 1, 'Mencampur cat biru dan kuning menghasilkan warna…',
    ['Hijau', 'Ungu', 'Oranye', 'Cokelat'],
    'Biru + merah = ungu, kuning + merah = oranye.'),
  q('umum-06', 'umum', 2, 'Organ terbesar pada tubuh manusia adalah…',
    ['Kulit', 'Hati', 'Paru-paru', 'Otak'],
    'Kulit orang dewasa luasnya sekitar 1,5–2 m². Hati adalah organ dalam terbesar.'),
  q('umum-07', 'umum', 2, 'Bahasa resmi Brasil adalah…',
    ['Portugis', 'Spanyol', 'Inggris', 'Prancis'],
    'Brasil pernah menjadi koloni Portugal, berbeda dengan sebagian besar negara Amerika Selatan yang berbahasa Spanyol.'),
  q('umum-08', 'umum', 3, 'Semboyan "Bhinneka Tunggal Ika" berasal dari kitab…',
    ['Sutasoma karya Mpu Tantular', 'Negarakertagama karya Mpu Prapanca', 'Arjunawiwaha karya Mpu Kanwa', 'Pararaton'],
    'Kakawin Sutasoma ditulis pada masa Majapahit, abad ke-14.'),
  q('umum-09', 'umum', 1, 'Lagu kebangsaan "Indonesia Raya" diciptakan oleh…',
    ['W.R. Supratman', 'Ismail Marzuki', 'C. Simanjuntak', 'Kusbini'],
    'Lagu ini pertama kali diperdengarkan di Kongres Pemuda II, 28 Oktober 1928.'),
  q('umum-10', 'umum', 1, 'Berapa jumlah sila dalam Pancasila?',
    ['5', '4', '6', '7'],
    'Pancasila berasal dari bahasa Sanskerta: panca berarti lima, sila berarti dasar.'),
];

// Soal tambahan per kategori (js/data/bank/*.js). Id dibuat dari urutan: kategori-011, kategori-012, …
const BANKS = {
  sains: sainsBank, sejarah: sejarahBank, geografi: geografiBank, teknologi: teknologiBank,
  matematika: matematikaBank, sastra: sastraBank, seni: seniBank, olahraga: olahragaBank,
  hiburan: hiburanBank, umum: umumBank,
};
for (const [cat, list] of Object.entries(BANKS)) {
  list.forEach(([difficulty, text, options, explanation, since], i) => {
    QUESTIONS.push(q(`${cat}-${String(i + 11).padStart(3, '0')}`, cat, difficulty, text, options, explanation, since));
  });
}

// Versi English (js/data/en/*.js): text, options, dan explanation mengikuti bahasa aktif.
for (const q of QUESTIONS) {
  const en = QUESTIONS_EN[q.id];
  if (!en) continue;
  bi(q, 'text', en[0]);
  bi(q, 'options', en[1]);
  bi(q, 'explanation', en[2]);
}

export const QUESTION_BY_ID = Object.fromEntries(QUESTIONS.map((x) => [x.id, x]));
