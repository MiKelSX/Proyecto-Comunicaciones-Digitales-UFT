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
    bg: bn ? '#F5F3EF' : '#0D1117',
    bg1: bn ? '#EDEDEA' : '#161B22',
    bg2: bn ? '#E4E2DE' : '#1C2128',
    bdr: bn ? '#D0CCC6' : '#30363D',
    ink: bn ? '#0C0C0C' : '#E6EDF3',
    ink2: bn ? '#3A3A3A' : '#8B949E',
    ink3: bn ? '#7A7A7A' : '#484F58',
    c1: bn ? '#0C0C0C' : '#00F5FF', // Cyan
    c2: bn ? '#3A3A3A' : '#7C3AED', // Purple
    c3: bn ? '#7A7A7A' : '#F59E0B', // Amber
    c4: bn ? '#0C0C0C' : '#10B981', // Green
    c5: bn ? '#3A3A3A' : '#EF4444', // Red
    c6: bn ? '#0C0C0C' : '#3B82F6', // Blue
    c7: bn ? '#5A5A5A' : '#EC4899', // Pink
    c8: bn ? '#3A3A3A' : '#8B5CF6', // Violet
  };
}
