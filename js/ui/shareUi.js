// Bagikan ke Story: membuat kartu gambar 1080×1920 (lihat storyCard.js), lalu
//   - "Bagikan"      → lembar bagikan bawaan HP (Web Share API dengan berkas), bisa pilih IG/WA Story
//   - "Simpan gambar" → unduh PNG
//   - tekan lama / klik kanan gambar pratinjau → simpan manual (selalu bisa, juga di dalam iframe)
// Tidak ada teks soal atau jawaban di kartu. Ikon tombol digambar sendiri (art.js), bukan emoji.

import { h } from './dom.js';
import { button, modal, toast } from './components.js';
import { trackMission } from '../core/missions.js';
import { storyBlob, storyFileName } from './storyCard.js';
import { L } from '../core/i18n.js';
import { iconEl } from './art.js';

function missionShared(ctx, mission) {
  if (!mission || !ctx) return;
  const done = ctx.update((st) => trackMission(st, { type: 'share' }));
  done.forEach((m) => toast(L(`Misi selesai: ${m.text} (+${m.xp} XP)`, `Mission done: ${m.text} (+${m.xp} XP)`), { tone: 'sun' }));
}

/**
 * Membuka pratinjau kartu Story dengan pilihan bagikan/simpan/salin teks.
 * @param spec     data kartu (lihat storyCard.js)
 * @param title    judul dialog (mis. untuk milestone)
 * @param intro    kalimat pembuka di atas gambar (opsional)
 */
export function openStory(spec, { ctx = null, mission = false, title, intro } = {}) {
  let shared = false;
  const markShared = () => { if (!shared) { shared = true; missionShared(ctx, mission); } };
  const holder = h('div.story-preview', { 'aria-busy': 'true' }, h('p.small.muted.story-loading', L('Menyiapkan kartu…', 'Preparing your card…')));
  const btnRow = h('div.story-actions');
  const hint = h('p.small.muted.story-hint', L('Di HP: tekan lama gambarnya lalu simpan, terus unggah ke Story IG atau WA.', 'On your phone: press and hold the image to save it, then post it to your Instagram or WhatsApp Story.'));
  const dlg = modal({
    title: title || L('Bagikan ke Story', 'Share to Story'),
    tone: 'story',
    body: h('div.story-body', intro ? h('p.story-intro', intro) : null, holder, btnRow, hint),
    actions: [{ label: L('Tutup', 'Close'), variant: 'ghost' }],
  });

  storyBlob(spec).then((blob) => {
    if (!blob || !dlg.el.isConnected) return;
    const url = URL.createObjectURL(blob);
    const name = storyFileName(spec);
    const file = typeof File === 'function' ? new File([blob], name, { type: 'image/png' }) : null;
    holder.removeAttribute('aria-busy');
    holder.replaceChildren(h('img.story-img', { src: url, alt: L('Kartu Story tahu gak?', 'tahu gak? Story card'), width: 1080, height: 1920 }));

    const canShare = !!(file && navigator.canShare?.({ files: [file] }));
    if (canShare) btnRow.append(button(L('Bagikan', 'Share'), { variant: 'sun', icon: iconEl('send'), cls: 'story-share', onClick: async () => {
      try {
        await navigator.share({ files: [file], title: 'tahu gak?' });
        markShared();
      } catch (e) {
        if (e?.name !== 'AbortError') toast(L('Browser ini belum bisa langsung membagikan gambar. Simpan gambarnya dulu, lalu unggah ke Story.', 'This browser can\'t share images directly. Save the image first, then post it to your Story.'), { tone: 'plain', duration: 4500 });
      }
    } }));
    btnRow.append(button(L('Simpan gambar', 'Save image'), { variant: canShare ? 'ghost' : 'sun', icon: iconEl('download'), cls: 'story-save', onClick: () => {
      const a = h('a', { href: url, download: name });
      document.body.append(a); a.click(); a.remove();
      markShared();
      toast(L('Gambar disimpan. Kalau tidak muncul, tekan lama atau klik kanan gambarnya.', 'Image saved. If nothing happened, press and hold or right-click the image.'), { tone: 'ok', duration: 4500 });
    } }));
    // Tekan lama/klik kanan gambar juga dihitung sebagai membagikan (untuk misi).
    holder.addEventListener('contextmenu', markShared, { once: true });
  }).catch(() => {
    holder.replaceChildren(h('p.small', L('Kartunya gagal dibuat di browser ini.', 'Couldn\'t create the card in this browser.')));
  });
  return dlg;
}

/**
 * Tombol "Bagikan ke Story".
 * @param getSpec  fungsi yang mengembalikan data kartu (dipanggil saat diklik)
 * @param mission  true kalau ini hasil tantangan harian (misi bagikan)
 */
export function storyButton(getSpec, { ctx = null, mission = false, label = L('Bagikan ke Story', 'Share to Story'), variant = 'ghost', size = 'sm', cls } = {}) {
  return button(label, { variant, size, cls: ['story-btn', cls].filter(Boolean).join('.'), icon: iconEl('camera'), onClick: () => {
    const spec = getSpec();
    if (spec) openStory(spec, { ctx, mission });
  } });
}
