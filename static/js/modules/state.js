/* ═══════════════════════════════════════════════════════
   STATE MANAGEMENT
═══════════════════════════════════════════════════════ */

// Global state object
export const A = {
  nodo: 'A',
  par: 'B',
  tipo: 'texto',
  bn: false, // dark/light mode

  // Statistics
  txN: 0,
  rxN: 0,
  rxBytes: 0,
  rxErr: 0,
  berAcc: 0,
  snrAcc: 0,

  // Current result
  lastR: null,
  berH: [], // BER history

  // File/Media
  imgB64: null,
  fileB64: null,
  fileNom: '',
  audB64: null,
  audNom: '',

  // Buffers
  bufEsp: [], // max 1200 for spectrogram

  // Animation/Rendering
  rafId: null,
  lastF: 0,
  FPS: 1000 / 60, // 60fps

  // Live data
  liveD: null,
  liveTs: 0,

  // Audio recording
  mRec: null,
  audCh: [],
  grabando: false,
  recSeg: 0,
  recInt: null,
  MAX_AU: 256 * 1024,
};

// Initialize theme from localStorage
export function initializeTheme() {
  const saved = localStorage.getItem('commsim-theme');
  if (saved === 'light') {
    A.bn = true;
    document.body.classList.add('bn');
  }
}
