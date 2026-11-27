// Bendera build. Versi aplikasi HP (data-build="app") tidak memakai pemain simulasi sama sekali (permintaan user, 27 Nov):
// papan, divisi mingguan, teman, dan duel hanya berisi pemain asli.
export const IS_APP = typeof document !== 'undefined' && document.documentElement?.dataset?.build === 'app';
export const SIMS_ENABLED = !IS_APP;
