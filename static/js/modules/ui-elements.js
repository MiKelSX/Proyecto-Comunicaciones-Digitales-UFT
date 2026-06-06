/* ═══════════════════════════════════════════════════════
   UI UTILITIES AND CONSTANTS
═══════════════════════════════════════════════════════ */

import { A } from './state.js';

// DOM selector utility
export const $ = (id) => document.getElementById(id);

// Device pixel ratio for retina displays
export const DPR = Math.min(window.devicePixelRatio || 1, 2);

// Display toast notification
export function toast(msg) {
  const d = document.createElement('div');
  d.className = 'toast';
  d.textContent = msg;
  $('toasts').appendChild(d);
  setTimeout(() => d.remove(), 4000);
}

// Add message to log
export function addLog(id, msg, cls = 'ok') {
  const c = $(id);
  const e = document.createElement('div');
  e.className = 'le l' + cls;

  const ts = new Date().toLocaleTimeString('es', { hour12: false });
  e.innerHTML = `<span class="lt">[${ts}]</span>${msg}`;

  c.insertBefore(e, c.firstChild);
  while (c.children.length > 60) c.removeChild(c.lastChild);
}

// HTML escape function
export function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Get current color scheme based on theme
export function C() {
  const bn = A.bn;
  return {
    // Backgrounds
    bg: bn ? '#F5F3EF' : '#0D1117',
    bg1: bn ? '#EDEDEA' : '#161B22',
    bg2: bn ? '#E4E2DE' : '#1C2128',
    bdr: bn ? '#D0CCC6' : '#30363D',
    
    // Text & Ink
    ink: bn ? '#0C0C0C' : '#E6EDF3',
    ink2: bn ? '#3A3A3A' : '#8B949E',
    ink3: bn ? '#7A7A7A' : '#484F58',
    
    // Functional colors - CORRECTED to match CSS variables
    c1: bn ? '#0066CC' : '#00F5FF', // Primary (Blue-Light / Cyan-Dark)
    c2: bn ? '#7A3A8D' : '#7C3AED', // Secondary (Purple-Light / Purple-Dark)
    c3: bn ? '#CC8800' : '#F59E0B', // Warning (Amber-Light / Amber-Dark)
    c4: bn ? '#009933' : '#10B981', // Success (Green-Light / Green-Dark)
    c5: bn ? '#CC3333' : '#EF4444', // Error (Red-Light / Red-Dark)
    c6: bn ? '#0066CC' : '#3B82F6', // Info (Blue-Light / Blue-Dark)
    c7: bn ? '#CC3388' : '#EC4899', // RX (Pink-Light / Pink-Dark)
    c8: bn ? '#6633CC' : '#8B5CF6', // Special (Violet-Light / Violet-Dark)
  };
}
