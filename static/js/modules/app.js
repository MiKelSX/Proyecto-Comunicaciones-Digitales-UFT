/* ═══════════════════════════════════════════════════════
   MAIN APPLICATION
═══════════════════════════════════════════════════════ */

import { A, initializeTheme } from './state.js';
import { $, toast, C } from './ui-elements.js';
import { cv, fill, grid, zeroline, wave } from './canvas-utils.js';
import {
  drawConstIdeal,
  drawEyeAnim,
  drawNRZ,
  drawEM,
} from './graph-rendering.js';
import { fetchLive, loadOpts, loadParams } from './api.js';
import { conectar, sondear } from './event-handlers.js';

// Main animation loop - throttled to 60fps
async function loop(ts) {
  // Throttle to 60fps (16.67ms)
  if (ts - A.lastF < A.FPS) {
    A.rafId = requestAnimationFrame(loop);
    return;
  }

  A.lastF = ts;
  const c = C();
  const d = A.liveD;

  if (d) {
    try {
      // 1. Time-domain signals
      const c1 = cv('cvT');
      if (c1) {
        fill(c1, c.bg);
        grid(c1, 6, 4, c);
        zeroline(c1, c);
        if (d.po) wave(c1, d.po, c.c1, 0.75);
        if (d.mo) wave(c1, d.mo, c.c2, 0.95, false, 1.7);
        if (d.ru) wave(c1, d.ru, c.c3, 0.5, true, 1.1);
      }

      // 2. Spectrum
      const c2 = cv('cvS');
      if (c2 && d.fq && d.pt) {
        fill(c2, c.bg);
        grid(c2, 8, 5, c);
        // waveFill is imported but needs to be called here
        // If waveFill wasn't imported, use wave instead
        const { waveFill } = await import('./canvas-utils.js');
        waveFill(c2, d.pt, c.c6);
      }

      // 3. Ideal constellation
      drawConstIdeal('cvC', d.mod, c);

      // 4. Animated eye diagram
      drawEyeAnim('cvE', c);

      // 5. NRZ bits
      const c5 = cv('cvN');
      if (c5 && d.bits) {
        fill(c5, c.bg);
        grid(c5, 8, 2, c);
        drawNRZ(c5, d.bits, c);

        const bLive = $('bLive');
        if (bLive) {
          bLive.innerHTML = d.bits
            .slice(0, 48)
            .map((b) => `<span class="b${b}">${b}</span>`)
            .join('');
        }
      }

      // 6. EM Spectrum
      drawEM('cvEM', d.fc);
    } catch (e) {
      console.warn('[LOOP DRAW]', e.message);
    }
  }

  fetchLive(); // no-op if called too recently

  A.rafId = requestAnimationFrame(loop);
}

// Initialize application
export async function init() {
  try {
    console.log('[INIT] Iniciando CommSim v3...');

    // Load theme from localStorage
    initializeTheme();

    // Get node from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const nodeParam = urlParams.get('nodo');
    if (nodeParam && ['A', 'B'].includes(nodeParam.toUpperCase())) {
      A.nodo = nodeParam.toUpperCase();
      A.par = A.nodo === 'A' ? 'B' : 'A';
    }

    console.log('[INIT] Nodo: ' + A.nodo + ', Par: ' + A.par);

    // Update UI labels
    $('nPill').textContent = 'NODO ' + A.nodo;
    $('pLbl').textContent = A.par;
    $('selNodo').value = A.nodo;

    // Load options and parameters
    console.log('[INIT] Cargando opciones...');
    await loadOpts();
    await loadParams();

    // Connect event listeners
    conectar();

    // Initialize canvas waveforms with placeholder animation
    setTimeout(() => {
      const c = C();
      [
        { id: 'cvE', fn: () => drawEyeAnim('cvE', c) },
        { id: 'cvRE', fn: () => drawEyeAnim('cvRE', c) },
        { id: 'cvC', fn: () => drawConstIdeal('cvC', 'BPSK', c) },
        { id: 'cvRC', fn: () => drawConstIdeal('cvRC', 'BPSK', c) },
      ].forEach(({ fn }) => {
        try {
          fn();
        } catch (e) {
          console.warn('[DRAW]', e.message);
        }
      });
    }, 100);

    // Fetch initial live data
    await fetchLive();
    console.log('[INIT] Datos vivos cargados');

    // Start main animation loop - ONLY ONCE
    if (!A.rafId) A.rafId = requestAnimationFrame(loop);

    // Start inbox polling every 1.2 seconds
    setInterval(sondear, 1200);

    toast('CommSim v3 — Nodo ' + A.nodo + ' activo');
    console.log('[INIT] Sistema iniciado correctamente');
  } catch (e) {
    console.error('[INIT ERROR]', e);
    toast('Error al inicializar: ' + e.message);
  }
}

// Single entry point with error handling - executed only once
let initExecuted = false;
const executeInit = async () => {
  if (initExecuted) return;  // Prevent double execution
  initExecuted = true;
  await init();
};

window.addEventListener('DOMContentLoaded', executeInit);
if (document.readyState !== 'loading') {
  executeInit();
}
