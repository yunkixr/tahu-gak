# tahu gak? — versi aplikasi

Kuis pengetahuan umum harian: tantangan 5 soal, streak, XP, Jalur Hafalan, Mode Kilat, dan kartu Story.
Versi ini berdiri sendiri (tanpa claude.ai): bisa di-install di HP, punya ikon sendiri, dan jalan offline.
Progres tersimpan di HP masing-masing. Kalau aplikasinya dibangun dengan Firebase (berkas `js/firebase-config.js` berisi
konfigurasi), Leaderboard, teman, dan duel jalan antar pemain aplikasi ini saat online; kalau tidak, aplikasinya main solo.

## 1. Online-kan gratis lewat GitHub Pages

1. Buat akun di github.com (gratis).
2. Buat repository baru (tombol **New**). Biar alamatnya pendek, beri nama persis `USERNAME.github.io`
   (ganti USERNAME dengan username GitHub-mu). Pilih **Public**, lalu **Create repository**.
3. Klik **uploading an existing file**, lalu seret **semua isi** folder ini (index.html, sw.js,
   manifest.webmanifest, README.md, folder `css`, `js`, `icons`) ke halaman itu. Klik **Commit changes**.
   Lebih gampang dari laptop/PC.
4. Buka **Settings → Pages**. Di *Build and deployment* pilih **Deploy from a branch**, branch **main**,
   folder **/ (root)**, lalu **Save**.
5. Tunggu 1–2 menit. Aplikasinya ada di `https://USERNAME.github.io/`.

## 2. Install di HP (cara paling gampang, termasuk buat teman-teman)

- **Android (Chrome):** buka alamatnya → ketuk **Instal aplikasi** yang muncul di bawah, atau menu **⋮ → Instal aplikasi / Tambahkan ke layar utama**.
- **iPhone (Safari):** buka alamatnya → tombol **Bagikan** → **Tambahkan ke Layar Utama**.

Setelah itu tahu gak? muncul dengan ikonnya sendiri, terbuka layar penuh, dan tetap jalan tanpa internet.

## 3. (Opsional) Jadikan file APK

1. Buka **pwabuilder.com**, tempel alamat aplikasimu, klik **Start**.
2. Pilih **Package for stores → Android → Generate**, lalu unduh zip-nya.
3. Di dalam zip ada file **.apk** (untuk diinstall) dan **signing key** (simpan baik-baik, dipakai lagi kalau mau update APK).
4. Kirim file .apk ke teman lewat WA/Drive. Saat install, izinkan **Install aplikasi tidak dikenal**.
5. Supaya APK tidak menampilkan bar alamat kecil di atas: di repository klik **Add file → Create new file**,
   beri nama `.well-known/assetlinks.json`, tempel isi file `assetlinks.json` dari zip PWABuilder, lalu commit.
   Pastikan juga ada file kosong bernama `.nojekyll` di repository (buat dengan cara yang sama) supaya
   GitHub Pages mau menyajikan folder yang namanya diawali titik.

## Notifikasi streak

Kalau belum main sampai jam pengingat, HP dapat notifikasi walaupun aplikasi ditutup.
Pengirimnya GitHub Action `Pengingat streak` (.github/workflows/streak-reminder.yml) yang jalan tiap jam, gratis.

1. Firebase → Project settings → **Service accounts → Generate new private key** (file JSON terunduh).
   File ini kunci utama proyekmu: jangan dibagikan ke siapa pun.
2. Repo GitHub → **Settings → Secrets and variables → Actions → New repository secret**,
   nama `FIREBASE_SERVICE_ACCOUNT`, isi dengan seluruh isi file JSON tadi.
3. Tab **Actions → Pengingat streak → Run workflow** sekali (membuat kunci notifikasi otomatis).
4. Di HP: install aplikasinya dulu, lalu **Profil → Notifikasi streak** → nyalakan → izinkan notifikasi.
   iPhone: notifikasi hanya jalan dari aplikasi yang dipasang di Layar Utama (iOS 16.4 ke atas).

## Update

Soal baru ditambahkan tiap hari di versi claude.ai. Versi aplikasi ini memakai bank soal saat zip dibuat;
untuk memperbarui, unggah ulang isi zip terbaru ke repository yang sama (aplikasi di HP ikut terbarui
otomatis saat dibuka dengan internet). APK dari PWABuilder ikut terbarui juga, karena isinya diambil dari situs.
