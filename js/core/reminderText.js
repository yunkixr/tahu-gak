// Teks notifikasi streak yang santai. Dipakai aplikasi (notifikasi lokal & tombol Tes) dan server pengingat
// di GitHub Actions (.github/scripts/plan.mjs mengimpor berkas ini), jadi modul ini murni: tanpa DOM, tanpa impor.
// Aturan: tanpa emoji, pendek (judul ±40 huruf), tidak menyalahkan pemain.

const ALIVE = {
  id: [
    (n) => [`Apimu mulai kedip-kedip`, `Streak ${n} harimu nungguin kamu. 5 soal aja, abis itu boleh rebahan lagi.`],
    (n) => [`Psst, streak ${n} hari dalam bahaya`, 'Satu ronde 5 soal cukup buat nyelametin dia.'],
    (n) => [`Jangan PHP-in streak-mu`, `Udah ${n} hari bareng, masa putus hari ini?`],
    (n) => [`Otakmu kangen dikasih soal`, `Streak ${n} hari masih bisa diselamatkan sebelum tengah malam.`],
    (n) => [`Tahu gak? Streak-mu belum diisi`, `${n} hari berturut-turut, sayang banget kalau berhenti di sini.`],
    (n) => [`Pesan dari api streak-mu`, `"Aku butuh 5 soal biar tetap nyala." Cuma 2 menit, kok. (Streak ${n} hari)`],
    (n) => [`${n} hari, jangan sampai jadi 0`, 'Mampir sebentar, jawab 5 soal, streak aman.'],
    (n) => [`Lagi sibuk? Streak-mu ngerti kok`, `Tapi dia tetap butuh 5 soal hari ini biar ${n} harimu nggak hangus.`],
  ],
  en: [
    (n) => ['Your flame is flickering', `Your ${n}-day streak is waiting. 5 questions, then back to the couch.`],
    (n) => [`Psst, your ${n}-day streak is in danger`, 'One round of 5 questions is all it takes to save it.'],
    (n) => ['Don\'t ghost your streak', `${n} days together. Breaking up today? Really?`],
    (n) => ['Your brain misses its daily snack', `There's still time to save your ${n}-day streak before midnight.`],
    (n) => ['Did you know? Your streak is hungry', `${n} days in a row. It would be a shame to stop here.`],
    (n) => ['A message from your streak flame', `"I need 5 questions to keep burning." Takes 2 minutes. (${n}-day streak)`],
    (n) => [`${n} days. Let's not make it 0.`, 'Pop in, answer 5 questions, streak saved.'],
    (n) => ['Busy day? Your streak gets it', `But it still needs 5 questions today, or ${n} days go poof.`],
  ],
};

const FRESH = {
  id: [
    () => ['Tahu gak? Ada 5 soal nunggu kamu', 'Cobain sekarang, siapa tahu kamu lebih pinter dari kemarin.'],
    () => ['Waktunya pemanasan otak', '5 soal, 2 menit, langsung mulai streak baru.'],
    () => ['Kuis hari ini udah siap', 'Hari pertama streak selalu yang paling seru. Gas?'],
    () => ['Ada yang belum main hari ini', 'Dan itu kamu. 5 soal aja, yuk.'],
    () => ['Otak juga butuh olahraga', 'Pemanasan 5 soal hari ini, biar besok makin jago.'],
    () => ['Streak baru, siapa takut?', 'Mulai dari hari ini. Satu ronde aja udah dihitung.'],
  ],
  en: [
    () => ['Did you know? 5 questions are waiting', 'Give it a go. You might be smarter than yesterday.'],
    () => ['Brain warm-up time', '5 questions, 2 minutes, and a fresh streak starts.'],
    () => ['Today\'s quiz is ready', 'Day one of a streak is always the best one. Ready?'],
    () => ['Someone hasn\'t played today', 'And it\'s you. Just 5 questions.'],
    () => ['Brains need workouts too', 'A 5-question warm-up today, a sharper you tomorrow.'],
    () => ['New streak? Easy.', 'Start today. One round is all it takes.'],
  ],
};

/** Hash string sederhana (FNV-1a) supaya pilihan teks tetap sama untuk orang & hari yang sama. */
export function textSeed(s) {
  let h = 2166136261;
  for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/**
 * @param {{ lang?: 'id'|'en', alive: boolean, streak?: number, seed?: number }} o
 * @returns {{ title: string, body: string }}
 */
export function streakMessage({ lang = 'id', alive, streak = 0, seed = 0 }) {
  const l = lang === 'en' ? 'en' : 'id';
  const list = alive && streak > 0 ? ALIVE[l] : FRESH[l];
  const [title, body] = list[Math.abs(seed) % list.length](streak);
  return { title, body };
}

export const MESSAGE_COUNTS = { alive: ALIVE.id.length, fresh: FRESH.id.length };
