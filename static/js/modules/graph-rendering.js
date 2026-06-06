/* ═══════════════════════════════════════════════════════
   GRAPH RENDERING
═══════════════════════════════════════════════════════ */

import { A } from './state.js';
import { $, C, DPR, esc, addLog, toast } from './ui-elements.js';
import { cv, fill, grid, zeroline, wave, waveFill, norm } from './canvas-utils.js';
import { api } from './api.js';

// Get ideal constellation points for modulation type
function idealPts(mod) {
  if (mod === 'ASK') return [[0, 0], [1, 0]];
  if (mod === 'QAM') return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  if (mod === 'OFDM') return [[-1, 0], [1, 0]];
  return [[-1, 0], [1, 0]]; // BPSK default
}

// Draw NRZ bit display
export function drawNRZ(ctx, bits, c) {
  const n = Math.min(bits.length, 32);
  const bw = ctx.W / n;

  ctx.fillStyle = c.c1 + '22';
  bits.slice(0, n).forEach((b, i) => {
    if (b) ctx.fillRect(i * bw, ctx.H * 0.15, bw, ctx.H * 0.7);
  });

  ctx.strokeStyle = c.c1;
  ctx.lineWidth = 2.2;
  ctx.beginPath();

  bits.slice(0, n).forEach((b, i) => {
    const x0 = i * bw;
    const x1 = (i + 1) * bw;
    const y = b ? ctx.H * 0.15 : ctx.H * 0.85;

    if (i === 0) {
      ctx.moveTo(x0, y);
    } else {
      const yp = bits[i - 1] ? ctx.H * 0.15 : ctx.H * 0.85;
      if (yp !== y) {
        ctx.lineTo(x0, yp);
        ctx.lineTo(x0, y);
      }
    }
    ctx.lineTo(x1, y);
  });

  ctx.stroke();

  // Labels
  ctx.fillStyle = c.ink3;
  ctx.font = 12 * DPR + 'px Space Mono';
  ctx.save();
  ctx.scale(1 / DPR, 1 / DPR);
  ctx.fillText('1', 4 * DPR, ctx.H * 0.2 * DPR);
  ctx.fillText('0', 4 * DPR, ctx.H * 0.88 * DPR);

  const ones = bits.slice(0, n).filter((b) => b).length;
  const zeros = n - ones;
  ctx.fillStyle = c.c1;
  ctx.font = 'bold ' + 14 * DPR + 'px Space Mono';
  ctx.textAlign = 'right';
  ctx.fillText(`${n} bits | 1s:${ones} 0s:${zeros}`, (ctx.W - 4) * DPR, (ctx.H - 6) * DPR);
  ctx.textAlign = 'left';
  ctx.restore();
}

// Draw ideal constellation
export function drawConstIdeal(id, mod, c) {
  const ctx = cv(id);
  if (!ctx) return;

  fill(ctx, c.bg);

  const W = ctx.W;
  const H = ctx.H;
  const cx = W / 2;
  const cy = H / 2;

  // Reference circles
  [0.28, 0.56, 0.84].forEach((r) => {
    ctx.strokeStyle = c.bdr;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(W, H) * r * 0.47, 0, 2 * Math.PI);
    ctx.stroke();
  });

  // Axes
  ctx.strokeStyle = c.ink3;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(W, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, H);
  ctx.stroke();

  // Labels
  ctx.fillStyle = c.ink3;
  ctx.font = 12 * DPR + 'px Space Mono';
  ctx.save();
  ctx.scale(1 / DPR, 1 / DPR);
  ctx.fillText('I', (W - 11) * DPR, (cy + 12) * DPR);
  ctx.fillText('Q', (cx + 4) * DPR, 12 * DPR);
  ctx.restore();

  // Points
  const pts = idealPts(mod || 'BPSK');
  const sc = Math.min(W, H) * 0.27;

  pts.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(cx + x * sc, cy - y * sc, 8, 0, 2 * Math.PI);
    ctx.fillStyle = c.c4 + '33';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx + x * sc, cy - y * sc, 4, 0, 2 * Math.PI);
    ctx.fillStyle = c.c4;
    ctx.fill();

    ctx.strokeStyle = c.c4;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(cx + x * sc, cy - y * sc, 7, 0, 2 * Math.PI);
    ctx.stroke();
  });
}

// Draw constellation with TX and RX data
export function drawConstData(id, tx, rx, mod, c) {
  const ctx = cv(id);
  if (!ctx) return;

  fill(ctx, c.bg);

  const W = ctx.W;
  const H = ctx.H;
  const cx = W / 2;
  const cy = H / 2;

  // Reference circles
  [0.28, 0.56, 0.84].forEach((r) => {
    ctx.strokeStyle = c.bdr;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(W, H) * r * 0.47, 0, 2 * Math.PI);
    ctx.stroke();
  });

  // Axes
  ctx.strokeStyle = c.ink3;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(W, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, H);
  ctx.stroke();

  const sc = Math.min(W, H) * 0.25;

  // TX points (triangles)
  if (tx && tx.length) {
    ctx.fillStyle = c.c4;
    tx.slice(0, 80).forEach(([x, y]) => {
      ctx.beginPath();
      ctx.moveTo(cx + x * sc, cy - y * sc - 6);
      ctx.lineTo(cx + x * sc - 4, cy - y * sc + 4);
      ctx.lineTo(cx + x * sc + 4, cy - y * sc + 4);
      ctx.closePath();
      ctx.fill();
    });
  }

  // RX points (circles)
  if (rx && rx.length) {
    rx.slice(0, 120).forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(cx + x * sc, cy - y * sc, 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = c.c7 + 'CC';
      ctx.fill();
    });
  }

  // If no TX data, show ideal
  if (!tx || !tx.length) drawConstIdeal(id, mod, c);
}

// Draw animated eye diagram
export function drawEyeAnim(id, c) {
  const ctx = cv(id);
  if (!ctx) return;

  fill(ctx, c.bg);
  grid(ctx, 4, 4, c);

  const t = performance.now() / 1000;
  ctx.lineWidth = 3.2;

  for (let i = 0; i < 35; i++) {
    const ph = ((i * 0.23 + t * 0.12) % 0.6) - 0.3;
    const am = 0.5 + Math.sin(i * 0.7 + t * 0.35) * 0.28;

    ctx.beginPath();
    ctx.globalAlpha = 0.13;
    ctx.strokeStyle = c.c8;

    for (let x = 0; x <= ctx.W; x += 2) {
      const y = ctx.H / 2 - Math.sin((x / ctx.W * 2 + ph) * Math.PI) * ctx.H * am * 0.42;
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.strokeStyle = c.c3;
  ctx.lineWidth = 3.5;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(ctx.W / 2, 0);
  ctx.lineTo(ctx.W / 2, ctx.H);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = c.c4 + '18';
  ctx.fillRect(ctx.W * 0.43, ctx.H * 0.22, ctx.W * 0.14, ctx.H * 0.56);
}

// Draw eye diagram with data
export function drawEyeData(id, rows, c) {
  if (!rows || !rows.length) {
    drawEyeAnim(id, c);
    return;
  }

  const ctx = cv(id);
  if (!ctx) return;

  fill(ctx, c.bg);
  grid(ctx, 4, 4, c);
  ctx.lineWidth = 3.2;

  rows.forEach((row) => {
    const mn = Math.min(...row);
    const mx = Math.max(...row);
    const r = Math.max(mx - mn, 1e-8);

    ctx.beginPath();
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = c.c8;

    row.forEach((v, i) => {
      const x = (i / (row.length - 1)) * ctx.W;
      const y = ctx.H - ((v - mn) / r) * ctx.H * 0.84 - ctx.H * 0.08;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });

    ctx.stroke();
  });

  ctx.globalAlpha = 1;
  ctx.strokeStyle = c.c3;
  ctx.lineWidth = 3.5;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(ctx.W / 2, 0);
  ctx.lineTo(ctx.W / 2, ctx.H);
  ctx.stroke();
  ctx.setLineDash([]);
}

// Draw EM spectrum
export function drawEM(id, fc) {
  const ctx = cv(id);
  if (!ctx) return;

  const W = ctx.W;
  const H = ctx.H;

  // EM spectrum bands
  const bandas = A.bn
    ? [
        ['#FF0050', '#FF4500'],
        ['#FF8C00', '#FFB300'],
        ['#FFE600', '#AAEE00'],
        ['#00D4FF', '#0066FF'],
        ['#8800FF', '#CC00EE'],
        ['#FF00AA', '#FF0066'],
        ['#E8E8FF', '#C0C0FF'],
      ]
    : [
        ['#FF0050', '#FF4500'],
        ['#FF8C00', '#FFB300'],
        ['#FFE600', '#AAEE00'],
        ['#00D4FF', '#0066FF'],
        ['#8800FF', '#CC00EE'],
        ['#FF00AA', '#FF0066'],
        ['#E8E8FF', '#C0C0FF'],
      ];

  bandas.forEach(([c1, c2], i) => {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.fillRect((i * W) / 7, 0, W / 7, H);
  });

  // Frequency marker
  const pos = Math.min(Math.log10(fc || 400) / 7, 1) * W * 0.32;
  ctx.fillStyle = 'rgba(255,255,255,.92)';
  ctx.fillRect(pos - 1.5, 0, 3, H);

  ctx.save();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold ' + 14 * DPR + 'px Space Mono';
  ctx.scale(1 / DPR, 1 / DPR);
  ctx.fillText('fc: ' + Math.round(fc || 400) + 'Hz', (pos + 5) * DPR, 12 * DPR);

  // Band labels
  const bands = ['RF', 'MW', 'HF', 'VHF', 'UHF', 'SHF', 'EHF'];
  bands.forEach((b, i) => {
    ctx.font = 11 * DPR + 'px Space Mono';
    ctx.fillText(b, ((i * W) / 7 + W / 14) * DPR, (H - 4) * DPR);
  });

  ctx.restore();
}

// Main render function for transmission/reception results
export function renderR(r) {
  if (!r) return;

  A.lastR = r;
  const c = C();
  const ber = (r.ber * 100).toFixed(3);

  // ══════════════════════════════════════════════════════
  // QUALITY INDICATOR
  // ══════════════════════════════════════════════════════
  let quality = '';
  let qualityLight = '';
  let qualityExplain = '';

  if (r.ber < 0.01 && r.snr >= 15 && r.exito >= 99) {
    quality = '🟢 EXCELENTE';
    qualityLight = 'green';
    qualityExplain = '✓ Transmisión perfecta. BER casi nulo, SNR muy alto, integridad total.';
  } else if (r.ber < 0.05 && r.snr >= 12 && r.exito >= 95) {
    quality = '🟢 BUENO';
    qualityLight = 'green';
    qualityExplain = '✓ Muy pocos errores. Condiciones favorables para comunicación confiable.';
  } else if (r.ber < 0.1 && r.snr >= 8 && r.exito >= 85) {
    quality = '🟡 ACEPTABLE';
    qualityLight = 'yellow';
    qualityExplain = '⚠ Calidad moderada. Algunos errores correctos o detectables con codificación.';
  } else if (r.ber < 0.2 && r.snr >= 5) {
    quality = '🟡 DÉBIL';
    qualityLight = 'yellow';
    qualityExplain = '⚠ Muchos errores. Considere aumentar SNR o usar codificación de errores.';
  } else {
    quality = '🔴 DEFICIENTE';
    qualityLight = 'red';
    qualityExplain = '✗ Comunicación muy ruidosa. Aumenta SNR significativamente o cambia parámetros.';
  }

  const qualEl = $('qualityLight');
  const qualTxtEl = $('qualityText');
  if (qualEl) {
    qualEl.className = 'light ' + qualityLight;
    qualTxtEl.textContent = quality;
  }

  const explEl = $('txExplain');
  const explTxtEl = $('txExplainText');
  if (explEl && explTxtEl) {
    explTxtEl.textContent = qualityExplain;
    explEl.style.display = 'block';
  }

  // TX Stats
  $('tBER').textContent = ber + '%';
  $('tBER').className = 'sv ' + (r.ber < 0.01 ? 'ok' : r.ber < 0.1 ? 'mid' : 'err');
  $('tSNR').textContent = r.snr + 'dB';
  $('tEx').textContent = r.exito + '%';
  $('tEx').className = 'sv ' + (r.exito > 90 ? 'ok' : r.exito > 70 ? 'mid' : 'err');
  $('tBy').textContent = r.bytes_tx + 'B';
  $('tMD').textContent = r.ck_ok ? '✓ OK' : '✗ ERR';
  $('tMD').className = 'sv ' + (r.ck_ok ? 'ok' : 'err');
  $('tOH').textContent = '×' + r.overhead;

  // TX Signal vs RX Signal
  const c1 = cv('cvTS');
  if (c1) {
    fill(c1, c.bg);
    grid(c1, 6, 4, c);
    zeroline(c1, c);
    wave(c1, r.v_tx, c.c2, 0.9, false, 1.7);
    wave(c1, r.v_rx, c.c3, 0.55, true, 1.1);
  }

  // TX Spectrum
  const c2 = cv('cvTP');
  if (c2) {
    fill(c2, c.bg);
    grid(c2, 8, 4, c);
    waveFill(c2, r.potencia, c.c6);
  }

  // Constellation
  const tx = (r.ctx || []).map((p) => [p[0], p[1]]);
  const rx = (r.crx || []).map((p) => [p[0], p[1]]);
  drawConstData('cvTC', tx, rx, r.mod, c);

  // Bits
  $('bTX').innerHTML = (r.b_orig || []).map((b) => `<span class="b${b}">${b}</span>`).join('');
  $('bRX').innerHTML = (r.b_rx || []).map((b) => `<span class="b${b}">${b}</span>`).join('');

  // Stats tab
  $('sBER').textContent = ber + '%';
  $('sSNR').textContent = r.snr + 'dB';
  $('sEx').textContent = r.exito + '%';
  $('sBy').textContent = r.bytes_tx + 'B';
  $('sIn').textContent = r.ck_ok ? '✓ OK' : '✗ ERR';
  $('sOH').textContent = '×' + r.overhead;

  // BER history
  A.berH.push(r.ber);
  if (A.berH.length > 35) A.berH = A.berH.slice(-35);
  drawBERH(c);
  drawEspectrog(c);
  drawHisto(r.v_rx || [], c);

  // Reception panel
  drawEyeData('cvRE', r.ojo || [], c);
  drawConstData('cvRC', tx, rx, r.mod, c);
  const c3 = cv('cvRS');
  if (c3) {
    fill(c3, c.bg);
    grid(c3, 8, 3, c);
    waveFill(c3, r.potencia, c.c7);
  }
  const c4 = cv('cvRN');
  if (c4) {
    fill(c4, c.bg);
    grid(c4, 8, 2, c);
    drawNRZ(c4, r.b_rx || [], c);
  }
}

// Draw BER history
export function drawBERH(c) {
  const ctx = cv('cvBH');
  if (!ctx) return;

  fill(ctx, c.bg);
  grid(ctx, 6, 5, c);

  const d = A.berH;
  if (d.length < 2) return;

  const mx = Math.max(...d, 0.001);
  const pts = d.map((v, i) => ({
    x: (i / (d.length - 1)) * ctx.W,
    y: ctx.H - (v / mx) * ctx.H * 0.84 - ctx.H * 0.08,
  }));

  // 1% threshold
  const yu = ctx.H - (0.01 / mx) * ctx.H * 0.84 - ctx.H * 0.08;
  ctx.strokeStyle = c.c5 + '66';
  ctx.lineWidth = 3.5;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(0, yu);
  ctx.lineTo(ctx.W, yu);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = c.ink3;
  ctx.font = 11 * DPR + 'px Space Mono';
  ctx.save();
  ctx.scale(1 / DPR, 1 / DPR);
  ctx.fillText('BER=1%', 4 * DPR, (yu - 3) * DPR);
  ctx.restore();

  // Area
  const g = ctx.createLinearGradient(0, 0, 0, ctx.H);
  g.addColorStop(0, c.c1 + '55');
  g.addColorStop(1, c.c1 + '00');

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, ctx.H);
  pts.forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.lineTo(pts[pts.length - 1].x, ctx.H);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = c.c1;
  ctx.lineWidth = 4;
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.stroke();

  ctx.fillStyle = c.c1;
  pts.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
    ctx.fill();
  });

  ctx.fillStyle = c.ink2;
  ctx.font = 12 * DPR + 'px Space Mono';
  ctx.save();
  ctx.scale(1 / DPR, 1 / DPR);
  ctx.fillText('BER: ' + (d[d.length - 1] * 100).toFixed(3) + '%', 6 * DPR, 14 * DPR);
  ctx.restore();
}

// Calculate and draw BER curve
export async function drawBERCurva() {
  $('btnBER').querySelector('.bi').textContent = 'Calculando...';
  $('btnBER').disabled = true;

  const d = await api('/api/' + A.nodo + '/ber_curva');

  $('btnBER').querySelector('.bi').textContent = 'Calcular';
  $('btnBER').disabled = false;

  if (!d || !d.snr) return;

  const c = C();
  const ctx = cv('cvBC');
  if (!ctx) return;

  fill(ctx, c.bg);
  grid(ctx, 6, 5, c);

  const W = ctx.W;
  const H = ctx.H;
  const smn = d.snr[0];
  const smx = d.snr[d.snr.length - 1];
  const lmn = Math.log10(1e-5);
  const lmx = 0;

  const bl = d.ber.map((b) => Math.log10(Math.max(b, 1e-5)));
  const pts = d.snr.map((s, i) => ({
    x: ((s - smn) / (smx - smn)) * W,
    y: H - (((bl[i] - lmn) / (lmx - lmn)) * H * 0.84 + H * 0.08),
  }));

  const teo = d.snr.map((s, i) => {
    const b = Math.max(0.5 * Math.exp((-s / 10) * Math.LN10 / 2), 1e-5);
    return {
      x: pts[i].x,
      y: H - (((Math.log10(b) - lmn) / (lmx - lmn)) * H * 0.84 + H * 0.08),
    };
  });

  // Theoretical line
  ctx.strokeStyle = c.ink3;
  ctx.lineWidth = 3.5;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  teo.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.stroke();
  ctx.setLineDash([]);

  // Measured area
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, c.c1 + '55');
  g.addColorStop(1, c.c1 + '00');

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, H);
  pts.forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.lineTo(pts[pts.length - 1].x, H);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = c.c1;
  ctx.lineWidth = 4;
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.stroke();

  ctx.fillStyle = c.c1;
  pts.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = c.bg;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  ctx.fillStyle = c.ink2;
  ctx.font = 12 * DPR + 'px Space Mono';
  ctx.save();
  ctx.scale(1 / DPR, 1 / DPR);
  ctx.fillText('─ Medido   - - Teórico BPSK', 8 * DPR, 14 * DPR);
  ctx.restore();

  toast('Curva BER calculada ✓');
}

// Draw spectrogram
export function drawEspectrog(c) {
  const ctx = cv('cvSG');
  if (!ctx) return;

  const W = ctx.W;
  const H = ctx.H;
  const buf = A.bufEsp;

  if (buf.length < 32) {
    fill(ctx, c.bg);
    return;
  }

  const nC = Math.min(Math.round(W), 150);
  const fSz = Math.floor(buf.length / nC);

  if (fSz < 4) {
    fill(ctx, c.bg);
    return;
  }

  for (let col = 0; col < nC; col++) {
    const fr = buf.slice(col * fSz, col * fSz + fSz);
    const N = Math.min(fr.length, 32);
    const bins = N / 2;

    for (let k = 0; k < bins; k++) {
      let re = 0;
      let im = 0;

      for (let n = 0; n < N; n++) {
        re += (fr[n] || 0) * Math.cos((2 * Math.PI * k * n) / N);
        im -= (fr[n] || 0) * Math.sin((2 * Math.PI * k * n) / N);
      }

      const db = 20 * Math.log10(Math.sqrt(re * re + im * im) / N + 1e-8);
      const nrm = Math.max(0, Math.min(1, (db + 60) / 60));

      ctx.fillStyle = A.bn
        ? `rgb(${Math.round((1 - nrm) * 240)},${Math.round((1 - nrm) * 240)},${Math.round((1 - nrm) * 240)})`
        : `hsl(${240 - nrm * 240},80%,${10 + nrm * 50}%)`;

      ctx.fillRect((col * W) / nC, H - (k / bins) * H, W / nC + 1, H / bins + 1);
    }
  }
}

// Draw histogram
export function drawHisto(sig, c) {
  const ctx = cv('cvHA');
  if (!ctx) return;

  fill(ctx, c.bg);
  grid(ctx, 6, 4, c);

  if (!sig || !sig.length) return;

  const nb = 28;
  const mn = Math.min(...sig);
  const mx = Math.max(...sig);
  const rng = Math.max(mx - mn, 1e-8);

  const bins = new Array(nb).fill(0);
  sig.forEach((v) => {
    bins[Math.min(Math.floor(((v - mn) / rng) * (nb - 1)), nb - 1)]++;
  });

  const maxB = Math.max(...bins, 1);
  const bw = ctx.W / nb;

  bins.forEach((b, i) => {
    const bh = (b / maxB) * ctx.H * 0.84;
    const x = i * bw;
    const y = ctx.H - bh;
    const norm = b / maxB;
    const hue = A.bn ? 0 : 200 + i * (100 / nb);
    const sat = A.bn ? '0%' : '75%';
    const lum = A.bn ? `${60 - Math.round(i * (40 / nb))}%` : `${15 + Math.round(norm * 40)}%`;

    ctx.fillStyle = A.bn ? `rgba(12,12,12,${0.2 + 0.7 * norm})` : `hsl(${hue},${sat},${lum})`;
    ctx.fillRect(x, y, bw - 1, bh);
  });

  // Gaussian reference
  ctx.strokeStyle = c.c1;
  ctx.lineWidth = 1.5;
  ctx.beginPath();

  for (let x = 0; x <= ctx.W; x += 2) {
    const t = x / ctx.W;
    const y = ctx.H - Math.exp(-(((t - 0.5) ** 2) / (2 * (0.18 ** 2)))) * ctx.H * 0.84;
    x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }

  ctx.stroke();
}
