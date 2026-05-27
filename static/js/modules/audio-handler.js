/* ═══════════════════════════════════════════════════════
   AUDIO HANDLER
═══════════════════════════════════════════════════════ */

import { A } from './state.js';
import { $, toast } from './ui-elements.js';

// Start audio recording from microphone
export function iniciarGrab() {
  if (!navigator.mediaDevices?.getUserMedia) {
    toast('Sin soporte de micrófono');
    return;
  }

  navigator.mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then((stream) => {
      A.audCh = [];

      const opts = {};
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        opts.mimeType = 'audio/webm;codecs=opus';
      }

      A.mRec = new MediaRecorder(stream, opts);

      A.mRec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) A.audCh.push(e.data);
      };

      A.mRec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());

        const blob = new Blob(A.audCh, {
          type: A.mRec.mimeType || 'audio/webm',
        });

        if (blob.size > A.MAX_AU) {
          toast('Audio muy largo (máx 256KB)');
          resetGrab();
          return;
        }

        A.audNom = 'grab.' + (A.mRec.mimeType?.includes('wav') ? 'wav' : 'webm');

        const r = new FileReader();
        r.onload = (ev) => {
          A.audB64 = ev.target.result.split(',')[1];
          const url = URL.createObjectURL(blob);
          $('audPrev').innerHTML =
            '<audio controls style="width:100%;margin-top:8px" src="' +
            url +
            '"></audio>';
          $('rSts').textContent =
            '✓ Grabado (' + (blob.size / 1024).toFixed(1) + 'KB) — listo para enviar';
        };
        r.readAsDataURL(blob);
        resetGrab();
      };

      A.mRec.start(200);
      A.grabando = true;

      $('btnGrb').classList.add('grabando');
      $('btnGrb').querySelector('.bi').textContent = '🔴 Grabando...';
      $('btnStp').disabled = false;
      $('rSts').textContent = 'Grabando desde el micrófono...';
      $('rTmr').style.display = 'block';
      A.recSeg = 0;

      A.recInt = setInterval(() => {
        A.recSeg++;
        const m = String(Math.floor(A.recSeg / 60)).padStart(2, '0');
        const s = String(A.recSeg % 60).padStart(2, '0');
        $('rTmr').textContent = m + ':' + s;

        if (A.recSeg >= 30) {
          detenerGrab();
          toast('Auto-stop 30s');
        }
      }, 1000);

      animBars();
    })
    .catch((e) => toast('Micrófono: ' + e.message));
}

// Stop audio recording
export function detenerGrab() {
  if (A.mRec && A.grabando) {
    A.mRec.stop();
    A.grabando = false;
  }
}

// Reset recording UI
export function resetGrab() {
  clearInterval(A.recInt);
  A.recInt = null;
  A.recSeg = 0;

  $('btnGrb').classList.remove('grabando');
  $('btnGrb').querySelector('.bi').textContent = '🎙 Grabar';
  $('btnStp').disabled = true;
  $('rTmr').style.display = 'none';
}

// Animate waveform bars during recording
export function animBars() {
  const c = $('wfBars');

  if (!c.children.length) {
    for (let i = 0; i < 20; i++) {
      const b = document.createElement('div');
      b.className = 'wb';
      b.style.height = '3px';
      c.appendChild(b);
    }
  }

  function tick() {
    if (!A.grabando) {
      Array.from(c.children).forEach((b) => (b.style.height = '3px'));
      return;
    }

    Array.from(c.children).forEach((b) => (b.style.height = 3 + Math.random() * 22 + 'px'));
    setTimeout(tick, 80);
  }

  tick();
}
