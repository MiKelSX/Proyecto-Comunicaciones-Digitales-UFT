/* ═══════════════════════════════════════════════════════
   EVENT HANDLERS
═══════════════════════════════════════════════════════ */

import { A } from './state.js';
import { $, toast, addLog, esc, C } from './ui-elements.js';
import { api, setParam, loadParams } from './api.js';
import { cv, fill, grid, wave, waveFill } from './canvas-utils.js';
import {
  renderR,
  drawNRZ,
  drawConstData,
  drawEyeData,
  drawBERCurva,
} from './graph-rendering.js';
import { iniciarGrab, detenerGrab } from './audio-handler.js';
import { setupDZ, leerImg, leerArch } from './file-handlers.js';

// Transmit message
export async function transmitir() {
  const sp = $('spnE');
  sp.classList.add('on');
  $('btnEnv').disabled = true;
  $('lTX').classList.add('on');

  const cuerpo = { tipo: A.tipo };

  if (A.tipo === 'texto') {
    cuerpo.texto = $('txtMsg').value || 'CommSim test';
  } else if (A.tipo === 'imagen') {
    if (A.imgB64) cuerpo.b64 = A.imgB64;
    cuerpo.nom = 'imagen.png';
  } else if (A.tipo === 'audio') {
    if (A.audB64) {
      cuerpo.tipo = 'audio_grab';
      cuerpo.b64 = A.audB64;
      cuerpo.nom = A.audNom || 'grab.webm';
    } else {
      cuerpo.tipo = 'audio_tono';
      cuerpo.freq = parseFloat($('rAF').value);
    }
  } else if (A.tipo === 'archivo') {
    if (!A.fileB64) {
      toast('Selecciona un archivo primero');
      sp.classList.remove('on');
      $('btnEnv').disabled = false;
      $('lTX').classList.remove('on');
      return;
    }
    cuerpo.b64 = A.fileB64;
    cuerpo.nom = A.fileNom;
  }

  try {
    const d = await api('/api/' + A.nodo + '/tx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
    });

    if (d && d.ok) {
      renderR(d.resultado);
      A.txN++;
      $('sTX').textContent = A.txN;
      addLog(
        'logTX',
        '[' +
          A.tipo.toUpperCase() +
          '] BER:' +
          (d.resultado.ber * 100).toFixed(2) +
          '% SNR:' +
          d.resultado.snr +
          'dB ' +
          (d.resultado.ck_ok ? '✓' : '✗') +
          ' ' +
          d.resultado.bytes_tx +
          'B',
        'ok'
      );
      toast('TX OK — BER: ' + (d.resultado.ber * 100).toFixed(2) + '%');
    } else {
      addLog('logTX', '[ERR] ' + (d && d.error ? d.error : 'desconocido'), 'lw');
      toast('Error en transmisión');
    }
  } catch (e) {
    addLog('logTX', '[EXC] ' + e.message, 'lw');
  }

  sp.classList.remove('on');
  $('btnEnv').disabled = false;
  setTimeout(() => $('lTX').classList.remove('on'), 1600);
}

// Poll inbox for received messages
let _rxB = 0;
let _rxE = 0;
let _berAcc = 0;
let _snrAcc = 0;

export async function sondear() {
  const items = await api('/api/' + A.nodo + '/buzon');
  if (!items || !items.length) return;

  $('lRX').classList.add('on');
  const c = C();

  items.forEach((item) => {
    A.rxN++;
    _rxB += item.tam || 0;
    if (!item.ck_ok) _rxE++;
    if (item.resultado) {
      _berAcc += item.resultado.ber || 0;
      _snrAcc += item.resultado.snr || 0;
    }

    addLog(
      'logRX',
      '[' +
        item.tipo.toUpperCase() +
        '] ' +
        item.tam +
        'B BER:' +
        (item.ber * 100).toFixed(2) +
        '% ' +
        (item.ck_ok ? '✓' : '⚠'),
      'ok'
    );

    renderItem(item, c);

    if (item.resultado) {
      drawEyeData('cvRE', item.resultado.ojo || [], c);
      const tx = (item.resultado.ctx || []).map((p) => [p[0], p[1]]);
      const rx2 = (item.resultado.crx || []).map((p) => [p[0], p[1]]);
      drawConstData('cvRC', tx, rx2, item.resultado.mod, c);

      const cr = cv('cvRS');
      if (cr) {
        fill(cr, c.bg);
        grid(cr, 8, 3, c);
        waveFill(cr, item.resultado.potencia || [], c.c7);
      }

      const cn = cv('cvRN');
      if (cn) {
        fill(cn, c.bg);
        grid(cn, 8, 2, c);
        drawNRZ(cn, item.resultado.b_rx || [], c);
      }
    }
  });

  $('rxCnt').textContent = A.rxN + ' msg';
  $('rxT').textContent = A.rxN;
  $('rxB').textContent = _rxB > 1024 ? (_rxB / 1024).toFixed(1) + 'KB' : _rxB + 'B';
  $('rxE').textContent = _rxE;
  $('rxE').className = 'sv ' + (_rxE === 0 ? 'ok' : _rxE < 3 ? 'mid' : 'err');
  $('rxI').textContent = A.rxN > 0 ? Math.round((1 - _rxE / A.rxN) * 100) + '%' : '—';
  $('rxBER').textContent = A.rxN > 0 ? ((_berAcc / A.rxN) * 100).toFixed(2) + '%' : '—';
  $('rxSNR').textContent = A.rxN > 0 ? (_snrAcc / A.rxN).toFixed(1) + 'dB' : '—';
  $('sRX').textContent = A.rxN;

  // ══════════════════════════════════════════════════════
  // RX QUALITY INDICATOR
  // ══════════════════════════════════════════════════════
  if (A.rxN > 0) {
    const avgBER = _berAcc / A.rxN;
    const avgSNR = _snrAcc / A.rxN;
    const integrity = Math.round((1 - _rxE / A.rxN) * 100);

    let rxQuality = '';
    let rxLight = '';

    if (avgBER < 0.01 && avgSNR >= 15 && integrity >= 99) {
      rxQuality = '🟢 Recepción Excelente';
      rxLight = 'green';
    } else if (avgBER < 0.05 && avgSNR >= 12 && integrity >= 95) {
      rxQuality = '🟢 Recepción Buena';
      rxLight = 'green';
    } else if (avgBER < 0.1 && avgSNR >= 8 && integrity >= 85) {
      rxQuality = '🟡 Recepción Aceptable';
      rxLight = 'yellow';
    } else if (avgBER < 0.2 && avgSNR >= 5) {
      rxQuality = '🟡 Recepción Débil';
      rxLight = 'yellow';
    } else {
      rxQuality = '🔴 Recepción Deficiente';
      rxLight = 'red';
    }

    const rxQualEl = $('rxQualityLight');
    const rxQualTxtEl = $('rxQualityText');
    if (rxQualEl && rxQualTxtEl) {
      rxQualEl.className = 'light ' + rxLight;
      rxQualTxtEl.textContent = rxQuality;
    }
  }

  setTimeout(() => $('lRX').classList.remove('on'), 1400);
}

// Render received item in inbox
export function renderItem(item, c) {
  const lista = $('inbox');

  // Remove placeholder
  const ph = lista.querySelector('div[style]');
  if (ph) ph.remove();

  const ts = new Date(item.ts * 1000).toLocaleTimeString('es', { hour12: false });
  const ok = item.ck_ok;
  const r = item.resultado;
  const tipo = item.tipo || 'texto';

  let body = '';

  if (tipo === 'texto') {
    try {
      const raw = atob(item.b64);
      const txt = new TextDecoder().decode(Uint8Array.from(raw, (ch) => ch.charCodeAt(0)));
      body = '<div class="ib">' + esc(txt) + '</div>';
    } catch {
      body = '<div class="ib">[Error decodificando]</div>';
    }
  } else if (tipo === 'imagen') {
    const ext = (item.nom || '').split('.').pop()?.toLowerCase() || 'png';
    const mime = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
    }[ext] || 'image/png';
    body = '<img class="ii" src="data:' + mime + ';base64,' + item.b64 + '" alt="imagen">';
  } else if (tipo === 'audio_grab' || tipo === 'audio_tono') {
    const ext = (item.nom || '').endsWith('.wav') ? 'wav' : 'webm';
    const mime = ext === 'wav' ? 'audio/wav' : 'audio/webm';
    body =
      '<div style="display:flex;align-items:center;gap:8px;margin-top:6px"><span style="font-family:var(--mono);font-size:.63rem;color:var(--ink3)">🔊 ' +
      (item.nom || 'audio') +
      '</span><audio controls style="height:28px;flex:1" src="data:' +
      mime +
      ';base64,' +
      item.b64 +
      '"></audio></div>';
  } else {
    body =
      '<div style="display:flex;align-items:center;gap:8px;margin-top:6px"><span style="font-family:var(--mono);font-size:.63rem;color:var(--ink3)">📁 ' +
      (item.nom || 'archivo') +
      ' (' +
      item.tam +
      'B)</span><a href="data:application/octet-stream;base64,' +
      item.b64 +
      '" download="' +
      (item.nom || 'archivo.bin') +
      '" class="btn bsm" style="text-decoration:none"><span class="bi">💾 Guardar</span></a></div>';
  }

  let metricas = '';
  if (r) {
    metricas =
      '<div class="icm">' +
      '<div class="icmb"><div class="icml">BER</div><div class="icmv">' +
      (r.ber * 100).toFixed(2) +
      '%</div></div>' +
      '<div class="icmb"><div class="icml">SNR</div><div class="icmv">' +
      r.snr +
      'dB</div></div>' +
      '<div class="icmb"><div class="icml">Éxito</div><div class="icmv">' +
      r.exito +
      '%</div></div>' +
      '<div class="icmb"><div class="icml">Bytes</div><div class="icmv">' +
      r.bytes_tx +
      '</div></div>' +
      '<div class="icmb"><div class="icml">MD5</div><div class="icmv">' +
      (r.ck_ok ? '✓ OK' : '✗ ERR') +
      '</div></div>' +
      '<div class="icmb"><div class="icml">Mod.</div><div class="icmv">' +
      r.mod +
      '</div></div>' +
      '</div>';
  }

  const el = document.createElement('div');
  el.className = 'ic';
  el.innerHTML =
    '<div class="ih">' +
    '<span class="badge btipo">' +
    tipo.replace('_', ' ').toUpperCase() +
    '</span>' +
    '<span class="badge ' +
    (ok ? 'bok' : 'berr') +
    '">' +
    (ok ? '✓ ÍNTEGRO' : '⚠ ADVERTENCIA') +
    '</span>' +
    '<span class="im">' +
    ts +
    ' · ' +
    item.emisor +
    '→' +
    A.nodo +
    '</span>' +
    '</div>' +
    body +
    metricas;

  lista.insertBefore(el, lista.firstChild);
  while (lista.children.length > 20) lista.removeChild(lista.lastChild);
}

// Connect event listeners
export function conectar() {
  // Parameter sliders
  [
    ['rSNR', 'vSNR', 'snr'],
    ['rFC', 'vFC', 'fc'],
    ['rSR', 'vSR', 'sr'],
    ['rBPS', 'vBPS', 'bps'],
  ].forEach(([r, v, k]) => {
    $(r).addEventListener('input', (e) => {
      $(v).textContent = e.target.value;
      setParam(k, parseFloat(e.target.value));
    });
  });

  $('selMod').addEventListener('change', (e) => setParam('mod', e.target.value));
  $('selCod').addEventListener('change', (e) => setParam('cod', e.target.value));
  $('rAF').addEventListener('input', (e) => ($('vAF').textContent = e.target.value + ' Hz'));

  // Node select
  $('selNodo').addEventListener('change', async (e) => {
    A.nodo = e.target.value;
    A.par = A.nodo === 'A' ? 'B' : 'A';

    $('nPill').textContent = 'NODO ' + A.nodo;
    $('pLbl').textContent = A.par;

    A.rxN = 0;
    _rxB = 0;
    _rxE = 0;
    _berAcc = 0;
    _snrAcc = 0;
    A.berH = [];
    A.txN = 0;
    A.lastR = null;

    const inbox = $('inbox');
    inbox.innerHTML =
      '<div style="text-align:center;padding:32px;font-family:var(--mono);font-size:.65rem;color:var(--ink3)">Esperando transmisiones del peer...<br><span style="font-size:.58rem">Se actualizan automáticamente</span></div>';

    try {
      await loadParams();
      toast('Nodo ' + A.nodo + ' activo');
      console.log('[NODE] Cambiado a nodo', A.nodo);
    } catch (e) {
      console.error('[NODE ERR]', e);
      toast('Error al cambiar nodo');
    }
  });

  // Tabs
  document.querySelectorAll('.tab').forEach((t) =>
    t.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((x) => x.classList.remove('on'));
      document.querySelectorAll('.pan').forEach((x) => x.classList.remove('on'));

      t.classList.add('on');
      const tabId = t.dataset.tab;
      const pan = $('pan-' + tabId);
      if (pan) pan.classList.add('on');

      if (A.lastR) setTimeout(() => renderR(A.lastR), 320);
    })
  );

  // Type tabs
  document.querySelectorAll('.ttab').forEach((t) =>
    t.addEventListener('click', () => {
      document.querySelectorAll('.ttab').forEach((x) => x.classList.remove('on'));
      t.classList.add('on');
      A.tipo = t.dataset.t;

      ['texto', 'imagen', 'audio', 'archivo'].forEach((n) => {
        $('inp-' + n).style.display = 'none';
      });
      $('inp-' + A.tipo).style.display = '';
    })
  );

  // Buttons
  $('btnEnv').addEventListener('click', transmitir);
  $('btnDemo').addEventListener('click', () => {
    $('txtMsg').value =
      'CommSim v3 — Demo Nodo ' +
      A.nodo +
      '→' +
      A.par +
      ' | ' +
      new Date().toLocaleTimeString() +
      ' | Mod:' +
      $('selMod').value +
      ' | SNR:' +
      $('rSNR').value +
      'dB';
    transmitir();
  });

  $('btnBER').addEventListener('click', drawBERCurva);

  $('btnTema').addEventListener('click', () => {
    A.bn = !A.bn;
    document.body.classList.toggle('bn', A.bn);
    localStorage.setItem('commsim-theme', A.bn ? 'light' : 'dark');
    $('btnTema').textContent = A.bn ? '🌙 Tema' : '🌞 Tema';
    $('btnTema').title = A.bn ? 'Tema claro (Light Mode)' : 'Tema oscuro (Dark Mode)';
    if (A.lastR) setTimeout(() => renderR(A.lastR), 50);
  });

  $('btnGrb').addEventListener('click', iniciarGrab);
  $('btnStp').addEventListener('click', detenerGrab);
  $('btnTon').addEventListener('click', () => {
    A.audB64 = null;
    A.audNom = '';
    $('audPrev').innerHTML = '';
    $('rSts').textContent = 'Se enviará tono sinusoidal de prueba';
    toast('Tono de prueba seleccionado');
  });

  // File drop zones
  setupDZ('dzImg', 'fImg', leerImg);
  setupDZ('dzFile', 'fBin', leerArch);

  // Window resize
  window.addEventListener('resize', () => {
    document.querySelectorAll('canvas').forEach((el) => {
      el._cW = null;
      el._cH = null;
    });
    if (A.lastR) setTimeout(() => renderR(A.lastR), 150);
  });
}
