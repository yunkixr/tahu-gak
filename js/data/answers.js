// "Kenalan sama jawabannya": info tambahan tentang JAWABAN BENAR, tampil setelah soal dijawab.
//
// Format per soal (key = id soal):
//   kind   : jenis jawaban (Kota, Tokoh, Angka, …)
//   icon   : emoji
//   facts  : 2–3 fakta singkat yang belum disebut di penjelasan soal
//   place  : (opsional) { lat, lng, country (ISO alpha-2), label } untuk jawaban berupa lokasi
//   wiki   : kata kunci pencarian Wikipedia bahasa Indonesia
//   title  : (opsional) judul kartu jika teks jawaban kurang cocok sebagai judul
//
// Jalankan `node tests/answers.test.mjs` setelah mengedit.
import { isEn, bi } from '../core/i18n.js';
import ANSWER_EN from './en/answers.js';

export const ANSWER_INFO = {
  // ───────────── Sains ─────────────
  'sains-01': { kind: 'Planet', icon: '🪐', wiki: 'Jupiter', facts: [
    'Planet kelima dari Matahari dan termasuk raksasa gas, sebagian besar tersusun dari hidrogen dan helium.',
    'Bintik Merah Besarnya adalah badai raksasa yang lebih lebar dari Bumi.',
    'Empat bulan terbesarnya (Io, Europa, Ganymede, Callisto) ditemukan Galileo Galilei pada 1610.'] },
  'sains-02': { kind: 'Unsur kimia', icon: '🥇', wiki: 'Emas', title: 'Au (emas)', facts: [
    'Emas adalah unsur dengan nomor atom 79.',
    'Logam mulia yang tidak berkarat dan sangat mudah ditempa menjadi lembaran tipis.',
    'Dipakai untuk perhiasan, cadangan kekayaan negara, dan komponen elektronik.'] },
  'sains-03': { kind: 'Unsur kimia', icon: '🌬️', wiki: 'Nitrogen', facts: [
    'Nomor atom 7 dengan simbol N. Gasnya tidak berwarna dan tidak berbau.',
    'Tumbuhan butuh senyawa nitrogen untuk tumbuh, karena itu pupuk banyak mengandung nitrogen.',
    'Nitrogen cair sangat dingin (sekitar −196 °C) dan dipakai untuk membekukan dengan cepat.'] },
  'sains-04': { kind: 'Organel sel', icon: '🔋', wiki: 'Mitokondria', facts: [
    'Mitokondria punya DNA sendiri, terpisah dari DNA di inti sel.',
    'Pada manusia, DNA mitokondria diwariskan hanya dari ibu.',
    'Sel otot dan sel saraf punya sangat banyak mitokondria karena butuh banyak energi.'] },
  'sains-05': { kind: 'Kecepatan', icon: '⚡', wiki: 'Kecepatan cahaya', facts: [
    'Cahaya Matahari butuh sekitar 8 menit 20 detik untuk sampai ke Bumi.',
    'Dalam satu detik, cahaya bisa mengelilingi Bumi sekitar 7,5 kali.',
    'Menurut fisika modern, benda yang punya massa tidak bisa mencapai kecepatan cahaya.'] },
  'sains-06': { kind: 'Golongan darah', icon: '🩸', wiki: 'Golongan darah', facts: [
    'O negatif sering dipakai dalam keadaan darurat saat golongan darah pasien belum diketahui.',
    'Pemilik golongan O negatif sendiri hanya bisa menerima darah O negatif.',
    'Golongan AB positif disebut penerima universal karena bisa menerima semua golongan.'] },
  'sains-07': { kind: 'Angka', icon: '🧬', wiki: 'Kromosom manusia', facts: [
    '46 kromosom = 23 pasang: 22 pasang autosom dan 1 pasang kromosom seks (XX pada perempuan, XY pada laki-laki).',
    'Simpanse dan gorila punya 48 kromosom.',
    'Kelebihan satu salinan kromosom 21 menyebabkan sindrom Down.'] },
  'sains-08': { kind: 'Tulang', icon: '🦴', wiki: 'Tulang paha', facts: [
    'Panjang femur kira-kira seperempat tinggi badan orang dewasa.',
    'Femur menghubungkan panggul dengan lutut.',
    'Tulang terkecil di tubuh adalah sanggurdi (stapes) di telinga tengah.'] },
  'sains-09': { kind: 'Planet', icon: '🔴', wiki: 'Mars', facts: [
    'Planet keempat dari Matahari.',
    'Punya gunung api tertinggi di Tata Surya, Olympus Mons.',
    'Punya dua bulan kecil, Phobos dan Deimos.'] },
  'sains-10': { kind: 'Proses', icon: '🌿', wiki: 'Fotosintesis', facts: [
    'Berlangsung di kloroplas, organel yang mengandung klorofil (zat hijau daun).',
    'Hampir seluruh oksigen di atmosfer Bumi dihasilkan fotosintesis tumbuhan, alga, dan fitoplankton.',
    'Rumus sederhananya: 6CO₂ + 6H₂O + cahaya → C₆H₁₂O₆ + 6O₂.'] },

  // ───────────── Sejarah ─────────────
  'sejarah-01': { kind: 'Peristiwa', icon: '🇮🇩', wiki: 'Proklamasi Kemerdekaan Indonesia', facts: [
    'Naskah proklamasi diketik oleh Sayuti Melik.',
    'Dibacakan pada hari Jumat sekitar pukul 10.00 pagi, bertepatan dengan bulan Ramadan.',
    'Bendera Merah Putih yang dikibarkan dijahit oleh Fatmawati.'],
    place: { lat: -6.2027, lng: 106.8447, country: 'ID', label: 'Tugu Proklamasi, Jl. Proklamasi (dulu Pegangsaan Timur 56), Jakarta' } },
  'sejarah-02': { kind: 'Tahun', icon: '📜', wiki: 'Sumpah Pemuda', facts: [
    'Diikrarkan pada 28 Oktober 1928 dalam Kongres Pemuda II di Batavia (kini Jakarta).',
    'Lagu Indonesia Raya pertama kali diperdengarkan di kongres yang sama.',
    'Gedung tempat kongres kini menjadi Museum Sumpah Pemuda.'],
    place: { lat: -6.1825, lng: 106.8424, country: 'ID', label: 'Museum Sumpah Pemuda, Jl. Kramat Raya 106, Jakarta' } },
  'sejarah-03': { kind: 'Kerajaan', icon: '🏯', wiki: 'Majapahit', facts: [
    'Didirikan Raden Wijaya sekitar 1293 di Jawa Timur.',
    'Mencapai puncak kejayaan pada masa Raja Hayam Wuruk dan Mahapatih Gajah Mada.',
    'Pusat kerajaannya diperkirakan berada di Trowulan, Mojokerto, yang kini kaya situs peninggalan.'],
    place: { lat: -7.559, lng: 112.38, country: 'ID', label: 'Trowulan, Mojokerto, Jawa Timur' } },
  'sejarah-04': { kind: 'Tahun', icon: '🧱', wiki: 'Tembok Berlin', facts: [
    'Pintu perbatasan dibuka pada malam 9 November 1989.',
    'Jerman Barat dan Jerman Timur bersatu kembali pada 3 Oktober 1990.',
    'Panjang tembok sekitar 155 km dan mengelilingi seluruh Berlin Barat.'],
    place: { lat: 52.5163, lng: 13.3777, country: 'DE', label: 'Gerbang Brandenburg, Berlin, Jerman' } },
  'sejarah-05': { kind: 'Tokoh', icon: '🎩', wiki: 'George Washington', facts: [
    'Memimpin pasukan Amerika dalam Perang Kemerdekaan melawan Inggris.',
    'Menjabat dua periode lalu menolak periode ketiga, sebuah tradisi yang lama diikuti presiden berikutnya.',
    'Ibu kota Amerika Serikat, Washington D.C., dinamai sesuai namanya.'] },
  'sejarah-06': { kind: 'Kota', icon: '🕊️', wiki: 'Konferensi Asia–Afrika', facts: [
    'Konferensi berlangsung 18–24 April 1955 dan dihadiri 29 negara.',
    'Menghasilkan Dasasila Bandung, sepuluh prinsip hidup berdampingan secara damai.',
    'Bandung adalah ibu kota provinsi Jawa Barat; gedungnya kini menjadi Museum Konferensi Asia Afrika.'],
    place: { lat: -6.9211, lng: 107.6094, country: 'ID', label: 'Gedung Merdeka, Bandung, Jawa Barat' } },
  'sejarah-07': { kind: 'Wangsa', icon: '🛕', wiki: 'Wangsa Syailendra', facts: [
    'Wangsa beragama Buddha Mahayana yang berkuasa di Jawa Tengah sekitar abad ke-8 sampai ke-9.',
    'Borobudur di Magelang adalah candi Buddha terbesar di dunia.',
    'Borobudur ditetapkan sebagai Situs Warisan Dunia UNESCO pada 1991.'],
    place: { lat: -7.6079, lng: 110.2038, country: 'ID', label: 'Candi Borobudur, Magelang, Jawa Tengah' } },
  'sejarah-08': { kind: 'Kota', icon: '🏛️', wiki: 'Den Haag', facts: [
    'Kota di pesisir barat Belanda yang menghadap Laut Utara.',
    'Pusat pemerintahan Belanda: parlemen, kantor perdana menteri, dan istana kerja raja ada di sini. Ibu kota resminya tetap Amsterdam.',
    'Dijuluki kota perdamaian dan keadilan karena menjadi markas Mahkamah Internasional (ICJ).'],
    place: { lat: 52.0705, lng: 4.3007, country: 'NL', label: 'Den Haag, Belanda' } },
  'sejarah-09': { kind: 'Tahun', icon: '⚜️', wiki: 'Revolusi Prancis', facts: [
    'Tanggal penyerbuan Bastille, 14 Juli, kini menjadi Hari Nasional Prancis.',
    'Revolusi menghapus monarki absolut dan memopulerkan semboyan liberté, égalité, fraternité (kebebasan, kesetaraan, persaudaraan).',
    'Raja Louis XVI dihukum mati pada 1793.'],
    place: { lat: 48.8532, lng: 2.3692, country: 'FR', label: 'Place de la Bastille, Paris, Prancis' } },
  'sejarah-10': { kind: 'Kerajaan', icon: '👑', wiki: 'Kerajaan Kutai', facts: [
    'Rajanya yang paling terkenal, Mulawarman, namanya tercatat di prasasti Yupa.',
    'Prasasti Yupa berbentuk tugu batu, ditulis dengan huruf Pallawa dalam bahasa Sanskerta.',
    'Pusat kerajaannya diperkirakan berada di Muara Kaman, di tepi Sungai Mahakam.'],
    place: { lat: -0.2976, lng: 116.7376, country: 'ID', label: 'Muara Kaman, Kutai Kartanegara, Kalimantan Timur' } },

  // ───────────── Geografi ─────────────
  'geografi-01': { kind: 'Kota', icon: '🏙️', wiki: 'Canberra', facts: [
    'Kota terencana yang dirancang arsitek Amerika, Walter Burley Griffin dan Marion Mahony Griffin.',
    'Parlemen Australia pindah dari Melbourne ke Canberra pada 1927.',
    'Terletak di wilayah khusus Australian Capital Territory (ACT).'],
    place: { lat: -35.2809, lng: 149.13, country: 'AU', label: 'Canberra, Australia' } },
  'geografi-02': { kind: 'Sungai', icon: '🏞️', wiki: 'Sungai Kapuas', facts: [
    'Berhulu di Kabupaten Kapuas Hulu dan bermuara di Selat Karimata.',
    'Kota Pontianak berdiri di dekat muaranya, tempat Sungai Kapuas bertemu Sungai Landak.',
    'Sejak dulu menjadi jalur transportasi utama warga di pedalaman Kalimantan Barat.'],
    place: { lat: -0.0263, lng: 109.3425, country: 'ID', label: 'Sungai Kapuas di Pontianak, Kalimantan Barat' } },
  'geografi-03': { kind: 'Gunung', icon: '🏔️', wiki: 'Gunung Everest', facts: [
    'Terletak di Pegunungan Himalaya, di perbatasan Nepal dan Tiongkok (Tibet).',
    'Puncaknya pertama kali dicapai Edmund Hillary dan Tenzing Norgay pada 29 Mei 1953.',
    'Di Nepal disebut Sagarmatha, di Tibet disebut Chomolungma.'],
    place: { lat: 27.9881, lng: 86.925, country: 'NP', label: 'Puncak Everest, perbatasan Nepal–Tiongkok' } },
  'geografi-04': { kind: 'Samudra', icon: '🌊', wiki: 'Samudra Pasifik', facts: [
    'Luasnya sekitar 165 juta km², lebih luas dari gabungan semua daratan di Bumi.',
    'Titik terdalam di dunia, Palung Mariana (sekitar 11 km), ada di samudra ini.',
    'Dinamai "pasifik" (tenang) oleh penjelajah Ferdinand Magellan.'] },
  'geografi-05': { kind: 'Negara', icon: '🪆', wiki: 'Rusia', facts: [
    'Wilayahnya membentang di dua benua, Eropa dan Asia, dan meliputi 11 zona waktu.',
    'Ibu kotanya Moskwa.',
    'Danau Baikal di Siberia adalah danau terdalam di dunia.'],
    place: { lat: 55.7558, lng: 37.6173, country: 'RU', label: 'Moskwa, ibu kota Rusia' } },
  'geografi-06': { kind: 'Provinsi', icon: '🏝️', wiki: 'Danau Toba', facts: [
    'Ibu kota Sumatera Utara adalah Medan.',
    'Di tengah Danau Toba ada Pulau Samosir, pulau di dalam danau yang dihuni banyak warga Batak Toba.',
    'Danau Toba terbentuk dari letusan supervulkan sekitar 74.000 tahun lalu.'],
    place: { lat: 2.6845, lng: 98.8756, country: 'ID', label: 'Danau Toba, Sumatera Utara' } },
  'geografi-07': { kind: 'Gurun', icon: '🏜️', wiki: 'Gurun Sahara', facts: [
    'Luasnya sekitar 9 juta km², hampir seluas Amerika Serikat.',
    'Membentang di lebih dari 10 negara di Afrika Utara.',
    'Hanya sebagian kecil Sahara berupa bukit pasir; sebagian besar berupa dataran batu dan kerikil.'],
    place: { lat: 23.4162, lng: 13.0, country: null, label: 'Gurun Sahara, Afrika Utara' } },
  'geografi-08': { kind: 'Selat', icon: '⛴️', wiki: 'Selat Sunda', facts: [
    'Lebarnya sekitar 24 km di titik tersempit.',
    'Kapal feri menyeberang antara Pelabuhan Merak (Banten) dan Bakauheni (Lampung).',
    'Gunung Krakatau di selat ini meletus dahsyat pada 1883.'],
    place: { lat: -5.95, lng: 105.85, country: 'ID', label: 'Selat Sunda, antara Jawa dan Sumatera' } },
  'geografi-09': { kind: 'Kota', icon: '🍁', wiki: 'Ottawa', facts: [
    'Terletak di provinsi Ontario, di tepi Sungai Ottawa.',
    'Dipilih Ratu Victoria sebagai ibu kota pada 1857.',
    'Kanal Rideau di kota ini berubah menjadi arena seluncur es raksasa saat musim dingin.'],
    place: { lat: 45.4215, lng: -75.6972, country: 'CA', label: 'Ottawa, Kanada' } },
  'geografi-10': { kind: 'Pulau', icon: '🧊', wiki: 'Greenland', facts: [
    'Sekitar 80% permukaannya tertutup lapisan es.',
    'Greenland adalah wilayah otonom Kerajaan Denmark.',
    'Ibu kotanya Nuuk.'],
    place: { lat: 64.1814, lng: -51.6941, country: 'GL', label: 'Nuuk, ibu kota Greenland' } },

  // ───────────── Teknologi ─────────────
  'teknologi-01': { kind: 'Protokol', icon: '🌐', wiki: 'Hypertext Transfer Protocol', facts: [
    'Dikembangkan Tim Berners-Lee dan timnya di CERN sejak 1989.',
    'Alamat yang diawali http:// dikirim tanpa enkripsi; https:// sudah dienkripsi.',
    'Kode status terkenal: 200 (berhasil) dan 404 (halaman tidak ditemukan).'] },
  'teknologi-02': { kind: 'Tokoh', icon: '👨‍💻', wiki: 'Paul Allen', facts: [
    'Teman sekolah Bill Gates sejak remaja di Seattle.',
    'Nama "Micro-Soft" (microcomputer software) disebut berasal dari usulannya.',
    'Ia juga pemilik klub American football Seattle Seahawks, dan wafat pada 2018.'] },
  'teknologi-03': { kind: 'Angka', icon: '💾', wiki: 'Bita', facts: [
    '8 bit bisa menyimpan 2⁸ = 256 kombinasi nilai (0 sampai 255).',
    'Satu huruf dalam teks ASCII biasanya memakan 1 byte.',
    '1 kilobyte = 1.000 byte, atau 1.024 byte dalam hitungan biner.'] },
  'teknologi-04': { kind: 'Nomor port', icon: '🔒', wiki: 'HTTPS', facts: [
    'HTTPS memakai protokol TLS untuk mengenkripsi data.',
    'Port lain yang sering ditemui: 21 (FTP), 22 (SSH), 25 (SMTP), 53 (DNS), 80 (HTTP).',
    'Nomor port berkisar dari 0 sampai 65535.'] },
  'teknologi-05': { kind: 'Tokoh', icon: '🐍', wiki: 'Guido van Rossum', facts: [
    'Programmer asal Belanda yang mulai membuat Python pada akhir 1989.',
    'Nama Python diambil dari grup komedi Inggris Monty Python, bukan dari nama ular.',
    'Ia lama dijuluki "Benevolent Dictator For Life" oleh komunitas Python.'] },
  'teknologi-06': { kind: 'Tokoh', icon: '🕸️', wiki: 'Tim Berners-Lee', facts: [
    'Ilmuwan komputer asal Inggris.',
    'Membuat browser dan server web pertama di CERN, dekat Jenewa, pada 1990.',
    'Ia memilih tidak mematenkan web sehingga semua orang bisa memakainya secara gratis.'] },
  'teknologi-07': { kind: 'Layanan jaringan', icon: '📖', title: 'DNS (Domain Name System)', wiki: 'Sistem Penamaan Domain', facts: [
    'Saat kamu mengetik nama situs, perangkatmu bertanya ke server DNS untuk mendapatkan alamat IP-nya.',
    'Hasilnya disimpan sementara (cache) supaya kunjungan berikutnya lebih cepat.',
    'Contoh server DNS publik: 8.8.8.8 milik Google dan 1.1.1.1 milik Cloudflare.'] },
  'teknologi-08': { kind: 'Angka', icon: '🧱', wiki: 'Model OSI', facts: [
    'Urutan dari bawah: Physical, Data Link, Network, Transport, Session, Presentation, Application.',
    'Jembatan keledai populer: "Please Do Not Throw Sausage Pizza Away".',
    'Model ini dikembangkan organisasi standar internasional ISO dan diterbitkan sekitar 1984.'] },
  'teknologi-09': { kind: 'Ukuran alamat', icon: '🔢', wiki: 'IPv4', facts: [
    'Ditulis sebagai 4 angka 0–255 yang dipisah titik, masing-masing 8 bit.',
    'Totalnya sekitar 4,3 miliar alamat, dan kini praktis sudah habis dibagikan.',
    'IPv6 yang 128 bit menyediakan sekitar 3,4 × 10³⁸ alamat.'] },
  'teknologi-10': { kind: 'Satuan data', icon: '💽', wiki: 'Gigabita', facts: [
    'Urutan satuannya: kilobyte, megabyte, gigabyte, terabyte, petabyte.',
    'Satuan biner yang memakai kelipatan 1.024 disebut gibibyte (GiB).',
    'Satu film HD berdurasi dua jam biasanya berukuran beberapa gigabyte.'] },

  // ───────────── Matematika ─────────────
  'matematika-01': { kind: 'Angka', icon: '✖️', wiki: 'Perkalian', facts: [
    'Trik mengingat: 5-6-7-8, yaitu 56 = 7 × 8.',
    '56 juga hasil dari 4 × 14 dan 2 × 28.',
    'Urutan perkalian boleh ditukar: 7 × 8 = 8 × 7 (sifat komutatif).'] },
  'matematika-02': { kind: 'Besar sudut', icon: '📐', wiki: 'Segitiga', facts: [
    'Pada segitiga sama sisi, setiap sudutnya 60°.',
    'Pada segitiga siku-siku, dua sudut lainnya selalu berjumlah 90°.',
    'Jumlah sudut segi empat adalah 360°, karena bisa dibagi menjadi dua segitiga.'] },
  'matematika-03': { kind: 'Angka', icon: '🔢', wiki: 'Bilangan prima', facts: [
    '2 adalah satu-satunya bilangan prima genap; semua bilangan genap lain habis dibagi 2.',
    'Bilangan prima berikutnya: 3, 5, 7, 11, 13.',
    'Euclid membuktikan lebih dari 2.000 tahun lalu bahwa bilangan prima ada tak hingga banyaknya.'] },
  'matematika-04': { kind: 'Angka', icon: '🟦', wiki: 'Akar kuadrat', facts: [
    '144 disebut juga satu gros, yaitu 12 lusin.',
    '12² = 144 dan 13² = 169.',
    'Bilangan hasil kuadrat bilangan bulat, seperti 144, disebut bilangan kuadrat sempurna.'] },
  'matematika-05': { kind: 'Angka', icon: '💯', wiki: 'Persen', facts: [
    'Trik cepat: 10% dari 200 = 20 dan 5% = 10, jadi 15% = 20 + 10 = 30.',
    'Persen bisa dibalik: 15% dari 200 sama dengan 200% dari 15.',
    'Diskon 15% untuk barang Rp200.000 berarti kamu hemat Rp30.000.'] },
  'matematika-06': { kind: 'Angka', icon: '⬡', wiki: 'Segi enam', facts: [
    'Setiap sudut dalam heksagon beraturan besarnya 120°.',
    'Heksagon beraturan bisa disusun rapat tanpa celah; lebah memakai bentuk ini untuk sarangnya.',
    'Kepala baut dan mur sering berbentuk heksagon.'] },
  'matematika-07': { kind: 'Angka', icon: '⚡', wiki: 'Perpangkatan', facts: [
    'Urutan pangkat dua: 2, 4, 8, 16, 32, 64, 128, 256, 512, 1.024.',
    'Komputer bekerja dengan bilangan biner, jadi pangkat dua sering muncul dalam ukuran memori.',
    '2²⁰ = 1.048.576, kira-kira satu juta.'] },
  'matematika-08': { kind: 'Angka', icon: '❗', wiki: 'Faktorial', facts: [
    'Faktorial menghitung banyaknya cara menyusun benda: 5 buku bisa disusun dalam 120 urutan berbeda.',
    '0! didefinisikan bernilai 1.',
    'Faktorial tumbuh sangat cepat: 10! = 3.628.800.'] },
  'matematika-09': { kind: 'Angka', icon: '🔍', wiki: 'Bilangan prima', facts: [
    'Di bawah 100 ada 25 bilangan prima.',
    'Saringan Eratosthenes adalah cara klasik untuk menemukan bilangan prima.',
    'Pasangan prima yang selisihnya 2, seperti 11 dan 13 atau 17 dan 19, disebut prima kembar.'] },
  'matematika-10': { kind: 'Luas', icon: '🟩', wiki: 'Persegi', facts: [
    'Keliling persegi = 4 × sisi, jadi persegi ini kelilingnya 36 cm.',
    'Persegi adalah persegi panjang yang keempat sisinya sama panjang.',
    'Diagonal persegi bersisi 9 cm panjangnya sekitar 12,7 cm (9 × √2).'] },

  // ───────────── Sastra ─────────────
  'sastra-01': { kind: 'Tokoh', icon: '📖', wiki: 'Andrea Hirata', facts: [
    'Penulis kelahiran Belitung, pulau yang menjadi latar Laskar Pelangi.',
    'Novelnya diangkat menjadi film pada 2008 yang disutradarai Riri Riza.',
    'Laskar Pelangi adalah buku pertama dari tetralogi yang dilanjutkan dengan Sang Pemimpi.'],
    place: { lat: -2.9681, lng: 108.1631, country: 'ID', label: 'Gantong, Belitung Timur, latar Laskar Pelangi' } },
  'sastra-02': { kind: 'Tokoh', icon: '✍️', wiki: 'Pramoedya Ananta Toer', facts: [
    'Lahir di Blora, Jawa Tengah, pada 1925.',
    'Sering disebut sebagai kandidat Hadiah Nobel Sastra dari Indonesia.',
    'Karya-karyanya pernah dilarang beredar pada masa Orde Baru.'] },
  'sastra-03': { kind: 'Tokoh', icon: '✒️', wiki: 'Chairil Anwar', facts: [
    'Lahir di Medan pada 1922 dan wafat di Jakarta pada 1949, di usia 26 tahun.',
    'Menulis sekitar 70 puisi, banyak di antaranya masih dikutip hingga kini.',
    'Tanggal wafatnya, 28 April, diperingati sebagai Hari Puisi Nasional.'] },
  'sastra-04': { kind: 'Tokoh', icon: '🎭', wiki: 'William Shakespeare', facts: [
    'Penulis drama Inggris (1564–1616) dari kota Stratford-upon-Avon.',
    'Menulis sekitar 39 drama dan 154 soneta.',
    'Karya terkenal lainnya: Hamlet, Macbeth, dan Othello.'] },
  'sastra-05': { kind: 'Tokoh', icon: '🪄', wiki: 'J. K. Rowling', facts: [
    'Penulis asal Inggris.',
    'Seri Harry Potter terdiri dari tujuh buku yang terbit antara 1997 dan 2007.',
    'Ide Harry Potter muncul saat ia naik kereta dari Manchester ke London pada 1990.'] },
  'sastra-06': { kind: 'Tokoh', icon: '👁️', wiki: 'George Orwell', facts: [
    'Nama aslinya Eric Arthur Blair (1903–1950).',
    'Dari novel 1984 lahir istilah "Big Brother" untuk pengawasan oleh penguasa.',
    'Karya terkenal lainnya: Animal Farm (1945).'] },
  'sastra-07': { kind: 'Tokoh', icon: '🌧️', wiki: 'Sapardi Djoko Damono', facts: [
    'Penyair kelahiran Surakarta (1940–2020).',
    'Puisinya dikenal sederhana namun dalam, dan banyak dijadikan lagu (musikalisasi puisi).',
    'Hujan Bulan Juni juga diangkat menjadi novel dan film.'] },
  'sastra-08': { kind: 'Tokoh', icon: '📕', wiki: 'Marah Rusli', facts: [
    'Sastrawan asal Padang, Sumatera Barat (1889–1968).',
    'Siti Nurbaya mengangkat kisah kawin paksa dan pertentangan adat.',
    'Selain menulis, ia bekerja sebagai dokter hewan.'] },
  'sastra-09': { kind: 'Tokoh', icon: '💃', wiki: 'Ahmad Tohari', facts: [
    'Sastrawan kelahiran Banyumas, Jawa Tengah, pada 1948.',
    'Banyak karyanya berlatar kehidupan desa dan memakai dialek Banyumasan.',
    'Ronggeng Dukuh Paruk diangkat ke layar lebar lewat film Sang Penari (2011).'] },
  'sastra-10': { kind: 'Tokoh', icon: '🔍', wiki: 'Arthur Conan Doyle', facts: [
    'Penulis sekaligus dokter asal Skotlandia (1859–1930).',
    'Sahabat sekaligus pencerita kisah Holmes adalah dr. John Watson.',
    'Alamat fiktif Holmes, 221B Baker Street di London, kini menjadi museum.'],
    place: { lat: 51.5237, lng: -0.1585, country: 'GB', label: '221B Baker Street, London, Inggris' } },

  // ───────────── Seni & Budaya ─────────────
  'seni-01': { kind: 'Tokoh', icon: '🎨', wiki: 'Leonardo da Vinci', facts: [
    'Seniman dan ilmuwan Italia (1452–1519) dari masa Renaisans.',
    'Ia juga merancang mesin terbang, menggambar anatomi tubuh, dan mendesain jembatan.',
    'Lukisan terkenal lainnya: Perjamuan Terakhir (The Last Supper).'],
    place: { lat: 48.8606, lng: 2.3376, country: 'FR', label: 'Museum Louvre, Paris, tempat Mona Lisa dipajang' } },
  'seni-02': { kind: 'Tahun', icon: '🧵', wiki: 'Batik', facts: [
    'Batik tulis dibuat dengan canting dan malam (lilin) panas.',
    'Setiap daerah punya motif khas, misalnya parang, kawung, dan mega mendung dari Cirebon.',
    'Hari Batik Nasional diperingati setiap 2 Oktober.'] },
  'seni-03': { kind: 'Provinsi', icon: '🎋', wiki: 'Angklung', facts: [
    'Setiap angklung hanya menghasilkan satu nada, jadi dimainkan bersama-sama.',
    'Daeng Soetigna mengembangkan angklung bertangga nada diatonis pada 1938, sehingga bisa memainkan lagu modern.',
    'Saung Angklung Udjo di Bandung terkenal sebagai tempat pertunjukan angklung.'],
    place: { lat: -6.8973, lng: 107.6553, country: 'ID', label: 'Saung Angklung Udjo, Bandung, Jawa Barat' } },
  'seni-04': { kind: 'Pulau', icon: '🔥', wiki: 'Kecak', facts: [
    'Kecak dikembangkan pada 1930-an oleh seniman Bali, termasuk Wayan Limbak, bersama pelukis Jerman Walter Spies.',
    'Penari duduk melingkar tanpa iringan alat musik.',
    'Pertunjukannya yang terkenal digelar saat matahari terbenam di Pura Uluwatu.'],
    place: { lat: -8.8291, lng: 115.0849, country: 'ID', label: 'Pura Uluwatu, Bali' } },
  'seni-05': { kind: 'Tokoh', icon: '🌌', wiki: 'Vincent van Gogh', facts: [
    'Pelukis Belanda (1853–1890) beraliran pascaimpresionisme.',
    'Semasa hidupnya, ia hanya menjual sangat sedikit lukisan.',
    'The Starry Night kini dipajang di Museum of Modern Art (MoMA), New York.'],
    place: { lat: 40.7614, lng: -73.9776, country: 'US', label: 'MoMA, New York, tempat The Starry Night dipajang' } },
  'seni-06': { kind: 'Provinsi', icon: '🏠', wiki: 'Rumah Gadang', facts: [
    'Atapnya runcing melengkung seperti tanduk kerbau, disebut gonjong.',
    'Masyarakat Minangkabau menganut sistem matrilineal: garis keturunan ditarik dari pihak ibu.',
    'Istano Basa Pagaruyung adalah contoh rumah gadang megah yang terkenal.'],
    place: { lat: -0.4712, lng: 100.6206, country: 'ID', label: 'Istano Basa Pagaruyung, Tanah Datar, Sumatera Barat' } },
  'seni-07': { kind: 'Provinsi', icon: '👏', wiki: 'Tari Saman', facts: [
    'Dibawakan berkelompok dengan tepukan tangan, dada, dan gerak kepala yang serempak dan cepat.',
    'Dulu dipakai sebagai media dakwah di tanah Gayo.',
    'Sering dijuluki tari seribu tangan.'],
    place: { lat: 3.9906, lng: 97.3395, country: 'ID', label: 'Blangkejeren, Gayo Lues, Aceh' } },
  'seni-08': { kind: 'Tokoh', icon: '🖼️', wiki: 'Raden Saleh', facts: [
    'Pelukis Jawa (sekitar 1811–1880) yang lama belajar dan berkarya di Eropa.',
    'Ia melukis Diponegoro dengan tegak dan bermartabat, berbeda dari versi pelukis Belanda Nicolaas Pieneman.',
    'Lukisan ini termasuk koleksi Istana Kepresidenan Republik Indonesia.'] },
  'seni-09': { kind: 'Alat musik', icon: '🎶', wiki: 'Sasando', facts: [
    'Berasal dari Pulau Rote, Nusa Tenggara Timur.',
    'Dawainya direntangkan di sekeliling tabung bambu dan dipetik dengan jari kedua tangan.',
    'Kini ada juga sasando elektrik yang suaranya bisa diperkuat untuk panggung besar.'],
    place: { lat: -10.73, lng: 123.08, country: 'ID', label: 'Pulau Rote, Nusa Tenggara Timur' } },
  'seni-10': { kind: 'Tokoh', icon: '🖌️', wiki: 'Pablo Picasso', facts: [
    'Pelukis Spanyol (1881–1973) dan salah satu pencetus aliran kubisme.',
    'Guernica kini dipajang di museum Reina Sofía, Madrid.',
    'Sepanjang hidupnya ia membuat puluhan ribu karya: lukisan, patung, keramik, dan grafis.'],
    place: { lat: 40.408, lng: -3.6943, country: 'ES', label: 'Museo Reina Sofía, Madrid, tempat Guernica dipajang' } },

  // ───────────── Olahraga ─────────────
  'olahraga-01': { kind: 'Angka', icon: '⚽', wiki: 'Sepak bola', facts: [
    'Pertandingan normal berlangsung 2 × 45 menit.',
    'Aturan saat ini umumnya mengizinkan 5 pergantian pemain per pertandingan.',
    'Jika satu tim tinggal kurang dari 7 pemain, pertandingan tidak boleh dilanjutkan.'] },
  'olahraga-02': { kind: 'Kota', icon: '🏛️', wiki: 'Olimpiade Musim Panas 1896', facts: [
    'Diikuti sekitar 240 atlet dari 14 negara, semuanya laki-laki.',
    'Digagas Pierre de Coubertin dari Prancis.',
    'Arena utamanya Stadion Panathenaic yang terbuat dari marmer.'],
    place: { lat: 37.9683, lng: 23.7411, country: 'GR', label: 'Stadion Panathenaic, Athena, Yunani' } },
  'olahraga-03': { kind: 'Cabang olahraga', icon: '🏸', wiki: 'Susi Susanti', facts: [
    'Susi Susanti menang di tunggal putri dan Alan Budikusuma di tunggal putra.',
    'Keduanya kemudian menikah dan dijuluki "pengantin emas".',
    'Bulu tangkis tetap menjadi penyumbang emas Olimpiade terbanyak bagi Indonesia.'],
    place: { lat: 41.3649, lng: 2.1527, country: 'ES', label: 'Barcelona, Spanyol, tuan rumah Olimpiade 1992' } },
  'olahraga-04': { kind: 'Nilai', icon: '🏀', wiki: 'Bola basket', facts: [
    'Garis tripoin berjarak 6,75 m dari ring pada aturan FIBA dan sekitar 7,24 m di NBA.',
    'Tembakan tiga angka mulai dipakai di liga profesional Amerika pada 1960-an.',
    'Bola basket diciptakan James Naismith pada 1891.'] },
  'olahraga-05': { kind: 'Negara', icon: '🏆', wiki: 'Piala Dunia FIFA 2022', facts: [
    'Final melawan Prancis berakhir 3–3, lalu Argentina menang 4–2 dalam adu penalti.',
    'Ini gelar Piala Dunia ketiga Argentina, setelah 1978 dan 1986.',
    'Lionel Messi terpilih sebagai pemain terbaik turnamen.'],
    place: { lat: 25.4208, lng: 51.4904, country: 'QA', label: 'Stadion Lusail, Qatar, tempat final 2022' } },
  'olahraga-06': { kind: 'Angka', icon: '🏸', wiki: 'Bulu tangkis', facts: [
    'Satu gim dimenangkan pemain yang lebih dulu meraih 21 poin.',
    'Jika skor 20–20, pemain harus unggul 2 poin, dengan batas 30 poin.',
    'Sistem reli (setiap reli menghasilkan poin) dipakai sejak 2006.'] },
  'olahraga-07': { kind: 'Turnamen', icon: '🎾', wiki: 'Prancis Terbuka', facts: [
    'Diadakan di Paris setiap akhir Mei hingga awal Juni.',
    'Rafael Nadal menjuarainya 14 kali, rekor terbanyak di satu turnamen Grand Slam.',
    'Nama Roland Garros diambil dari pilot Prancis perintis penerbangan.'],
    place: { lat: 48.847, lng: 2.249, country: 'FR', label: 'Stade Roland-Garros, Paris, Prancis' } },
  'olahraga-08': { kind: 'Jarak', icon: '🏃', wiki: 'Maraton', facts: [
    'Jarak 42,195 km dipakai sejak Olimpiade London 1908 dan dibakukan pada 1921.',
    'Terinspirasi kisah Pheidippides yang berlari dari Marathon ke Athena membawa kabar kemenangan.',
    'Rekor dunia maraton putra sudah di bawah 2 jam 1 menit.'] },
  'olahraga-09': { kind: 'Tahun', icon: '🥋', wiki: 'Pencak silat', facts: [
    'Pencak silat memadukan bela diri, seni pertunjukan, dan nilai spiritual.',
    'Di Asian Games 2018 di Jakarta–Palembang, Indonesia meraih 14 emas dari cabang ini.',
    'Perguruan pencak silat tersebar di seluruh Nusantara hingga Malaysia dan Brunei.'] },
  'olahraga-10': { kind: 'Turnamen', icon: '🏆', wiki: 'Piala Thomas', facts: [
    'Dinamai dari Sir George Alan Thomas, pemain bulu tangkis asal Inggris.',
    'Indonesia adalah negara dengan gelar Piala Thomas terbanyak.',
    'Turnamen ini pertama kali digelar pada 1948–1949.'] },

  // ───────────── Hiburan ─────────────
  'hiburan-01': { kind: 'Studio', icon: '🧸', wiki: 'Pixar', facts: [
    'Berdiri pada 1986, dengan Steve Jobs sebagai pemilik utamanya.',
    'Diakuisisi Disney pada 2006.',
    'Film terkenal lainnya: Finding Nemo, Up, dan Coco.'] },
  'hiburan-02': { kind: 'Tokoh', icon: '🦖', wiki: 'Steven Spielberg', facts: [
    'Sutradara asal Amerika Serikat, lahir 1946.',
    'Film terkenal lainnya: Jaws, E.T., dan Schindler\'s List.',
    'Dinosaurus di Jurassic Park dibuat dengan gabungan animasi komputer dan robot (animatronik).'] },
  'hiburan-03': { kind: 'Studio', icon: '🏮', wiki: 'Studio Ghibli', facts: [
    'Didirikan pada 1985 oleh Hayao Miyazaki, Isao Takahata, dan Toshio Suzuki.',
    'Film terkenal lainnya: My Neighbor Totoro dan Princess Mononoke.',
    'Museum Ghibli ada di Mitaka, Tokyo.'],
    place: { lat: 35.6962, lng: 139.5704, country: 'JP', label: 'Museum Ghibli, Mitaka, Tokyo, Jepang' } },
  'hiburan-04': { kind: 'Kota', icon: '🎸', wiki: 'Liverpool', facts: [
    'Kota pelabuhan di barat laut Inggris.',
    'Anggota The Beatles: John Lennon, Paul McCartney, George Harrison, dan Ringo Starr.',
    'Sebelum terkenal, mereka sering tampil di The Cavern Club di Liverpool.'],
    place: { lat: 53.4084, lng: -2.9916, country: 'GB', label: 'Liverpool, Inggris' } },
  'hiburan-05': { kind: 'Tokoh', icon: '🚢', wiki: 'James Cameron', facts: [
    'Sutradara kelahiran Kanada, 1954.',
    'Ia juga menyutradarai The Terminator dan Avatar.',
    'Pada 2012 ia menyelam sendirian ke dasar Palung Mariana.'] },
  'hiburan-06': { kind: 'Negara', icon: '🧒', wiki: 'Upin & Ipin', facts: [
    'Diproduksi studio Les\' Copaque di Shah Alam, Selangor.',
    'Awalnya dibuat sebagai serial pendek untuk bulan Ramadan 2007.',
    'Sangat populer di Indonesia dan rutin tayang di televisi nasional.'],
    place: { lat: 3.0733, lng: 101.5185, country: 'MY', label: 'Shah Alam, Selangor, Malaysia' } },
  'hiburan-07': { kind: 'Tokoh', icon: '🎬', wiki: 'Joko Anwar', facts: [
    'Sutradara dan penulis skenario kelahiran Medan, 1976.',
    'Film lainnya: Gundala dan Perempuan Tanah Jahanam.',
    'Pengabdi Setan (2017) termasuk film horor Indonesia terlaris.'] },
  'hiburan-08': { kind: 'Studio', icon: '⛏️', wiki: 'Mojang Studios', facts: [
    'Studio game asal Stockholm, Swedia.',
    'Microsoft membelinya pada 2014 seharga 2,5 miliar dolar AS.',
    'Minecraft termasuk game terlaris sepanjang masa.'],
    place: { lat: 59.3293, lng: 18.0686, country: 'SE', label: 'Stockholm, Swedia' } },
  'hiburan-09': { kind: 'Tokoh', icon: '🕺', wiki: 'Thriller (album)', facts: [
    'Michael Jackson (1958–2009) dijuluki King of Pop.',
    'Album ini memenangkan 8 Grammy pada 1984.',
    'Video klip Thriller berdurasi sekitar 14 menit dan dianggap salah satu video musik terbaik.'] },
  'hiburan-10': { kind: 'Tokoh', icon: '🎤', wiki: 'Madonna', facts: [
    'Penyanyi asal Amerika Serikat, lahir 1958.',
    'Guinness World Records mencatatnya sebagai artis perempuan dengan penjualan rekaman terbanyak.',
    'Dikenal sering mengubah gaya musik dan citra panggungnya.'] },

  // ───────────── Pengetahuan Umum ─────────────
  'umum-01': { kind: 'Mata uang', icon: '💴', wiki: 'Yen', facts: [
    'Simbolnya ¥ dan kodenya JPY.',
    'Mulai dipakai di Jepang pada 1871.',
    'Koin 5 yen berlubang di tengah dan dianggap membawa keberuntungan.'],
    place: { lat: 35.6762, lng: 139.6503, country: 'JP', label: 'Tokyo, Jepang' } },
  'umum-02': { kind: 'Negara', icon: '🦎', wiki: 'Komodo', facts: [
    'Komodo adalah kadal terbesar di dunia, panjangnya bisa sekitar 3 meter.',
    'Taman Nasional Komodo ditetapkan sebagai Situs Warisan Dunia UNESCO pada 1991.',
    'Gigitannya mengandung bisa yang membuat mangsanya cepat lemah.'],
    place: { lat: -8.55, lng: 119.45, country: 'ID', label: 'Taman Nasional Komodo, Nusa Tenggara Timur' } },
  'umum-03': { kind: 'Angka', icon: '📆', wiki: 'Tahun kabisat', facts: [
    'Tahun kabisat terjadi hampir setiap 4 tahun sekali.',
    'Tahun abad hanya kabisat jika habis dibagi 400: tahun 2000 kabisat, tahun 1900 tidak.',
    'Tambahan hari diperlukan karena Bumi mengelilingi Matahari dalam sekitar 365,25 hari.'] },
  'umum-04': { kind: 'Lambang', icon: '🦅', wiki: 'Garuda Pancasila', facts: [
    'Dirancang oleh Sultan Hamid II dari Pontianak.',
    'Jumlah bulunya melambangkan 17-8-1945: 17 helai di tiap sayap, 8 di ekor, 45 di leher.',
    'Kakinya mencengkeram pita bertuliskan Bhinneka Tunggal Ika.'] },
  'umum-05': { kind: 'Warna', icon: '🎨', wiki: 'Warna primer', facts: [
    'Pada cat tradisional, warna primernya merah, kuning, dan biru.',
    'Pada cahaya (seperti layar ponsel), warna primernya merah, hijau, dan biru (RGB).',
    'Mencampur ketiga warna primer cat cenderung menghasilkan cokelat gelap.'] },
  'umum-06': { kind: 'Organ', icon: '🧴', wiki: 'Kulit', facts: [
    'Berat kulit orang dewasa sekitar 15% dari berat badan.',
    'Kulit terdiri dari tiga lapisan utama: epidermis, dermis, dan hipodermis.',
    'Lapisan terluarnya terus berganti; tubuh melepaskan jutaan sel kulit mati setiap hari.'] },
  'umum-07': { kind: 'Bahasa', icon: '🗣️', wiki: 'Bahasa Portugis', facts: [
    'Lebih dari 200 juta orang di Brasil berbahasa Portugis, jauh lebih banyak dari penduduk Portugal sendiri.',
    'Brasil merdeka dari Portugal pada 1822.',
    'Bahasa Portugis juga bahasa resmi Timor Leste, tetangga Indonesia.'],
    place: { lat: -15.7939, lng: -47.8828, country: 'BR', label: 'Brasília, ibu kota Brasil' } },
  'umum-08': { kind: 'Kitab', icon: '📜', wiki: 'Kakawin Sutasoma', facts: [
    'Ditulis Mpu Tantular dalam bahasa Jawa Kuno pada abad ke-14.',
    'Kalimat lengkapnya: "Bhinneka tunggal ika tan hana dharma mangrwa" (berbeda-beda tetapi satu, tidak ada kebenaran yang mendua).',
    'Mengisahkan Pangeran Sutasoma dan memuat ajaran toleransi antara Hindu (Siwa) dan Buddha.'] },
  'umum-09': { kind: 'Tokoh', icon: '🎻', wiki: 'Wage Rudolf Supratman', facts: [
    'Wage Rudolf Supratman (1903–1938) adalah komponis sekaligus wartawan.',
    'Di Kongres Pemuda II, ia memperdengarkan Indonesia Raya dengan biola, tanpa syair.',
    'Hari lahirnya, 9 Maret, diperingati sebagai Hari Musik Nasional.'] },
  'umum-10': { kind: 'Angka', icon: '🦅', wiki: 'Pancasila', facts: [
    'Rumusan Pancasila tercantum dalam Pembukaan UUD 1945.',
    '1 Juni diperingati sebagai Hari Lahir Pancasila.',
    '1 Oktober diperingati sebagai Hari Kesaktian Pancasila.'] },
};

// Versi English (js/data/en/answers.js): kind, title, wiki, label tempat, dan fakta mengikuti bahasa aktif.
for (const [id, a] of Object.entries(ANSWER_INFO)) {
  const en = ANSWER_EN[id];
  if (!en) continue;
  bi(a, 'kind', en.kind);
  bi(a, 'wiki', en.wiki);
  bi(a, 'facts', en.facts);
  if (en.title) bi(a, 'title', en.title);
  if (a.place && en.place) bi(a.place, 'label', en.place);
}

// ───────────── Lokasi relatif ─────────────
export const JAKARTA = { lat: -6.2088, lng: 106.8456 };
const DIRS = ['utara', 'timur laut', 'timur', 'tenggara', 'selatan', 'barat daya', 'barat', 'barat laut'];
const DIRS_EN = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
const rad = (d) => (d * Math.PI) / 180;

/** Jarak (km) & arah kompas dari titik `from` ke `to` (great-circle). */
export function distanceAndBearing(to, from = JAKARTA) {
  const R = 6371;
  const [φ1, φ2] = [rad(from.lat), rad(to.lat)];
  const Δφ = rad(to.lat - from.lat);
  const Δλ = rad(to.lng - from.lng);
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const km = 2 * R * Math.asin(Math.sqrt(a));
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const bearing = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  return { km, bearing, dir: (isEn() ? DIRS_EN : DIRS)[Math.round(bearing / 45) % 8] };
}

const q = (s) => encodeURIComponent(s);
export const wikiUrl = (term) => `https://${isEn() ? 'en' : 'id'}.wikipedia.org/w/index.php?search=${q(term)}`;
export const mapUrl = (p) => `https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lng}#map=${p.zoom || 7}/${p.lat}/${p.lng}`;
export const photoUrl = (term) => `https://commons.wikimedia.org/w/index.php?search=${q(term)}&title=Special:MediaSearch&type=image`;
