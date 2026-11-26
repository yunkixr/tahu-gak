// Menentukan siapa yang perlu diingatkan sekarang. Fungsi murni (tanpa jaringan) supaya bisa dites.
//
// Dokumen push/<uid> (ditulis aplikasi): { enabled, sub, time 'HH:MM', tz (menit dari UTC),
//   lang 'id'|'en', lastDay 'YYYY-MM-DD' (hari terakhir main/terlindungi), streak, lastNotified }

const DAY = 86400000;
const ymd = (ms) => new Date(ms).toISOString().slice(0, 10);

const TEXT = {
  id: {
    alive: (n) => ({ title: `Streak ${n} harimu hampir putus`, body: 'Jawab 5 soal hari ini biar streak-mu tetap nyala.' }),
    fresh: () => ({ title: 'Tantangan hari ini udah siap', body: '5 soal baru nunggu kamu. Yuk mulai streak lagi.' }),
  },
  en: {
    alive: (n) => ({ title: `Your ${n}-day streak is about to break`, body: 'Answer today\'s 5 questions to keep it going.' }),
    fresh: () => ({ title: 'Today\'s challenge is ready', body: '5 new questions are waiting. Start a new streak.' }),
  },
};

/**
 * @param docs  [{ id, ...dataDokumen }]
 * @param now   Date
 * @returns [{ id, sub, localDay, payload }]
 */
export function planReminders(docs, now = new Date()) {
  const out = [];
  for (const d of docs) {
    if (!d || !d.enabled || !d.sub || !d.sub.endpoint) continue;
    const tz = Number.isFinite(d.tz) && Math.abs(d.tz) <= 14 * 60 ? d.tz : 420; // default WIB
    const localMs = now.getTime() + tz * 60000;
    const localDay = ymd(localMs);
    const local = new Date(localMs);
    const mins = local.getUTCHours() * 60 + local.getUTCMinutes();
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(d.time || '19:00'));
    const target = m ? Math.min(23 * 60 + 59, Number(m[1]) * 60 + Number(m[2])) : 19 * 60;
    if (mins < target) continue;                 // belum jamnya
    if (d.lastNotified === localDay) continue;   // sudah diingatkan hari ini
    if (d.lastDay === localDay) continue;        // sudah main hari ini
    const yesterday = ymd(localMs - DAY);
    const alive = d.lastDay === yesterday && (d.streak || 0) > 0; // streak masih bisa diselamatkan
    const t = TEXT[d.lang === 'en' ? 'en' : 'id'];
    const msg = alive ? t.alive(d.streak) : t.fresh();
    out.push({ id: d.id, sub: d.sub, localDay, payload: { ...msg, tag: 'tahugak-streak', url: './' } });
  }
  return out;
}
