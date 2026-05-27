/* ═══════════════════════════════════════════════════════
   CANVAS UTILITIES
═══════════════════════════════════════════════════════ */

import { $, DPR, C } from './ui-elements.js';

// Get or create canvas context with proper scaling
export function cv(id) {
  const el = $(id);
  if (!el) return null;

  // Get actual width of canvas container
  let W = el.parentElement?.offsetWidth || el.offsetWidth;
  if (!W || W < 10) W = 300;
  W = Math.max(W, 50);

  const H = parseInt(el.getAttribute('height')) || 150;
  const Wp = Math.round(W * DPR);
  const Hp = Math.round(H * DPR);

  // Update canvas if needed (e.g., when panel becomes visible)
  if (el.width !== Wp || el.height !== Hp) {
    el.width = Wp;
    el.height = Hp;
    el._cW = Wp;
    el._cH = Hp;
  }

  const ctx = el.getContext('2d', { willReadFrequently: false });
  ctx.scale(DPR, DPR);
  ctx.W = W;
  ctx.H = H;

  return ctx;
}

// Fill canvas with color
export function fill(ctx, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, ctx.W, ctx.H);
}

// Draw grid
export function grid(ctx, nx = 6, ny = 4, col) {
  const c = col || C();
  ctx.save();
  ctx.strokeStyle = c.bdr;
  ctx.lineWidth = 0.6;

  // Vertical lines
  for (let i = 1; i < nx; i++) {
    const x = (ctx.W / nx) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, ctx.H);
    ctx.stroke();
  }

  // Horizontal lines
  for (let i = 1; i < ny; i++) {
    const y = (ctx.H / ny) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(ctx.W, y);
    ctx.stroke();
  }

  ctx.restore();
}

// Draw center reference line
export function zeroline(ctx, col) {
  const c = col || C();
  ctx.save();
  ctx.strokeStyle = c.ink3;
  ctx.lineWidth = 0.7;
  ctx.setLineDash([4, 4]);

  ctx.beginPath();
  ctx.moveTo(0, ctx.H / 2);
  ctx.lineTo(ctx.W, ctx.H / 2);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.restore();
}

// Normalize array to 0-1 range
export function norm(a) {
  if (!a || !a.length) return [];
  const mn = Math.min(...a);
  const mx = Math.max(...a);
  const r = Math.max(mx - mn, 1e-8);
  return a.map((v) => (v - mn) / r);
}

// Draw wave line
export function wave(ctx, data, color, alpha, dashed, lw) {
  if (!data || !data.length) return;

  alpha = alpha || 1;
  lw = lw || 1.4;

  const n = data.length;
  const N = norm(data);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;

  if (dashed) ctx.setLineDash([5, 4]);

  ctx.beginPath();
  N.forEach((v, i) => {
    const x = (i / (n - 1)) * ctx.W;
    const y = ctx.H - v * ctx.H * 0.84 - ctx.H * 0.08;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  });

  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

// Draw filled wave area with gradient
export function waveFill(ctx, data, color) {
  if (!data || !data.length) return;

  const n = data.length;
  const N = norm(data);
  const pts = N.map((v, i) => ({
    x: (i / (n - 1)) * ctx.W,
    y: ctx.H - v * ctx.H * 0.84 - ctx.H * 0.08,
  }));

  // Create gradient
  const g = ctx.createLinearGradient(0, 0, 0, ctx.H);
  g.addColorStop(0, color + '66');
  g.addColorStop(1, color + '00');

  // Fill area
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, ctx.H);
  pts.forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.lineTo(pts[pts.length - 1].x, ctx.H);
  ctx.closePath();
  ctx.fill();

  // Draw outline
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.stroke();
}
