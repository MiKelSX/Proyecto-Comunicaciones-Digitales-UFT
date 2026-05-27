/* ═══════════════════════════════════════════════════════
   FILE HANDLERS
═══════════════════════════════════════════════════════ */

import { A } from './state.js';
import { $, toast } from './ui-elements.js';

// Setup drop zone for files
export function setupDZ(dzId, inpId, cb) {
  const dz = $(dzId);
  const inp = $(inpId);

  // Prevent duplicate listeners
  if (dz._setup) return;
  dz._setup = true;

  // Click on drop zone
  dz.addEventListener('click', () => inp.click());

  // Drag and drop
  ['dragover', 'dragleave', 'drop'].forEach((ev) => {
    dz.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dz.classList.toggle('ov', ev === 'dragover');

      if (ev === 'drop' && e.dataTransfer.files[0]) {
        cb(e.dataTransfer.files[0]);
      }
    });
  });

  // File input change
  inp.addEventListener('change', (e) => {
    if (e.target.files[0]) cb(e.target.files[0]);
    e.target.value = '';
  });
}

// Read image file
export function leerImg(f) {
  if (f.size > 10 * 1024 * 1024) {
    toast('Imagen >10MB');
    return;
  }

  const r = new FileReader();
  r.onload = (ev) => {
    A.imgB64 = ev.target.result.split(',')[1];
    $('imgPrev').innerHTML =
      '<img src="' +
      ev.target.result +
      '" style="max-width:200px;border-radius:var(--r);margin-top:8px;border:1px solid var(--bdr)">';
  };
  r.readAsDataURL(f);
}

// Read file
export function leerArch(f) {
  if (f.size > 1024 * 1024) {
    toast('Archivo >1MB');
    return;
  }

  const r = new FileReader();
  r.onload = (ev) => {
    A.fileB64 = ev.target.result.split(',')[1] || btoa(ev.target.result);
    A.fileNom = f.name;
    $('fileInfo').textContent = '✓ ' + f.name + ' — ' + (f.size / 1024).toFixed(1) + 'KB';
  };
  r.readAsDataURL(f);
}
