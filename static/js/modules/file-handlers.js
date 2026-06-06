/* ═══════════════════════════════════════════════════════
   FILE HANDLERS
═══════════════════════════════════════════════════════ */

import { A } from './state.js';
import { $, toast } from './ui-elements.js';

// Clear image selection
export function limpiarImg() {
  A.imgB64 = null;
  $('imgPrev').innerHTML = '';
  $('fImg').value = '';
  toast('Imagen eliminada');
}

// Clear file selection
export function limpiarArch() {
  A.fileB64 = null;
  A.fileNom = '';
  $('fileInfo').innerHTML = '';
  $('fBin').value = '';
  toast('Archivo eliminado');
}

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
    const preview = $('imgPrev');
    preview.innerHTML =
      '<div style="position:relative;display:inline-block;margin-top:8px">' +
      '<img src="' +
      ev.target.result +
      '" style="max-width:200px;border-radius:var(--r);border:1px solid var(--bdr);display:block">' +
      '<button id="btnLimpiarImg" class="btn bsm" style="position:absolute;top:4px;right:4px;width:28px;height:28px;padding:0;display:flex;align-items:center;justify-content:center;background:rgba(255,0,0,.85);border:none;border-radius:50%;cursor:pointer;color:#fff;font-size:1.1rem;font-weight:bold;line-height:1">×</button>' +
      '</div>';
    
    // Attach event listener to delete button
    const btnLimpiar = document.getElementById('btnLimpiarImg');
    if (btnLimpiar) {
      btnLimpiar.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        limpiarImg();
      });
    }
    
    toast('✓ Imagen cargada correctamente');
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
    
    const fileInfoEl = $('fileInfo');
    fileInfoEl.innerHTML =
      '<div style="display:flex;align-items:center;gap:8px;margin-top:8px">' +
      '<span>✓ ' + f.name + ' — ' + (f.size / 1024).toFixed(1) + 'KB</span>' +
      '<button id="btnLimpiarArch" class="btn bsm" style="width:24px;height:24px;padding:0;display:flex;align-items:center;justify-content:center;background:rgba(255,0,0,.85);border:none;border-radius:50%;cursor:pointer;color:#fff;font-size:.95rem;font-weight:bold">×</button>' +
      '</div>';
    
    // Attach event listener to delete button
    const btnLimpiar = document.getElementById('btnLimpiarArch');
    if (btnLimpiar) {
      btnLimpiar.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        limpiarArch();
      });
    }
    
    toast('✓ Archivo subido correctamente - Listo para enviar');
  };
  r.readAsDataURL(f);
}
