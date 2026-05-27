/* ═══════════════════════════════════════════════════════
   API COMMUNICATION
═══════════════════════════════════════════════════════ */

import { A } from './state.js';
import { $, toast } from './ui-elements.js';

// Generic API request handler
export async function api(url, ops) {
  try {
    return await (await fetch(url, ops || {})).json();
  } catch (e) {
    console.warn('[API]', url, e);
    return null;
  }
}

// Load available modulation and coding options
export async function loadOpts() {
  const d = await api('/api/opciones');
  if (!d) return;

  const sm = $('selMod');
  const sc = $('selCod');

  d.mods.forEach((m) => {
    sm.add(new Option(m, m));
  });

  d.cods.forEach((c) => {
    sc.add(new Option(c, c));
  });
}

// Load node parameters
export async function loadParams() {
  const d = await api('/api/' + A.nodo + '/params');
  if (!d) return;

  $('rSNR').value = d.snr;
  $('vSNR').textContent = d.snr;
  $('rFC').value = d.fc;
  $('vFC').textContent = d.fc;
  $('rSR').value = d.sr;
  $('vSR').textContent = d.sr;
  $('rBPS').value = d.bps;
  $('vBPS').textContent = d.bps;
  $('selMod').value = d.mod;
  $('selCod').value = d.cod;
}

// Set a single parameter
export async function setParam(k, v) {
  await api('/api/' + A.nodo + '/params', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ [k]: v }),
  });
}

// Fetch live data
export async function fetchLive() {
  if (performance.now() - A.liveTs < 150) return; // Throttle to 150ms
  A.liveTs = performance.now();

  const d = await api('/api/' + A.nodo + '/vivo');
  if (!d) return;

  A.liveD = d;

  // Accumulate modulated signal for spectrogram
  if (d.mo) {
    A.bufEsp.push(...d.mo.slice(0, 16));
    if (A.bufEsp.length > 1200) A.bufEsp = A.bufEsp.slice(-1200);
  }
}
