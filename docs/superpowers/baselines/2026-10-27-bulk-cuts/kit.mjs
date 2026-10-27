// primitive kit: one gap, a short radius scale, a geometric sparkle, filleted polygons
export const GAP = 0.75;          // white gap between tones
export const LINE = 1.75;         // line weight
export const R = { xs: 1, s: 1.5, m: 2.5, l: 3.5, xl: 4.5 }; // corner radii

const f = (n) => +n.toFixed(2);
const pt = (p) => `${f(p[0])} ${f(p[1])}`;
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// sub-curve of cubic p0..p3 between t0 and t1 (de Casteljau, twice)
function split(p0, p1, p2, p3, t) {
  const a = lerp(p0, p1, t), b = lerp(p1, p2, t), c = lerp(p2, p3, t);
  const d = lerp(a, b, t), e = lerp(b, c, t), m = lerp(d, e, t);
  return [[p0, a, d, m], [m, e, c, p3]];
}
function sub(c, t0, t1) {
  const right = split(...c, t0)[1];
  return split(...right, (t1 - t0) / (1 - t0))[0];
}

// four-point sparkle: each tip opens at a fixed angle (2·a degrees) and is filleted by a true arc of
// radius rt; sides are cubics leaving each tip along that angle with handles of length l·r
const bez = (c, t) => {
  const u = 1 - t;
  return [0, 1].map((j) => u * u * u * c[0][j] + 3 * u * u * t * c[1][j] + 3 * u * t * t * c[2][j] + t * t * t * c[3][j]);
};
function tAtDist(c, from, dist, fromEnd) {
  let lo = 0, hi = 0.5;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2, p = bez(c, fromEnd ? 1 - mid : mid);
    if (Math.hypot(p[0] - from[0], p[1] - from[1]) < dist) lo = mid; else hi = mid;
  }
  return fromEnd ? 1 - lo : lo;
}
// r is the visible radius: the sharp construction tip sits further out by what the fillet takes off
export function star(cx, cy, r, { a = 12, l = 0.75, rt = Math.min(0.45, r * 0.075) } = {}) {
  const s = Math.sin(a * Math.PI / 180), c = Math.cos(a * Math.PI / 180);
  r += rt * (1 / s - 1);
  const L = l * r;
  const T = [[cx, cy - r], [cx + r, cy], [cx, cy + r], [cx - r, cy]];
  const inward = [[0, 1], [-1, 0], [0, -1], [1, 0]];
  const rot = (v, sg) => [v[0] * c - sg * v[1] * s, sg * v[0] * s + v[1] * c];
  const dist = rt / Math.tan(a * Math.PI / 180);
  const segs = T.map((t, i) => {
    const n = T[(i + 1) % 4];
    const o = rot(inward[i], -1), e = rot(inward[(i + 1) % 4], 1);
    const cub = [t, [t[0] + o[0] * L, t[1] + o[1] * L], [n[0] + e[0] * L, n[1] + e[1] * L], n];
    return sub(cub, tAtDist(cub, t, dist, false), tAtDist(cub, n, dist, true));
  });
  let d = `M${pt(segs[0][0])}`;
  segs.forEach((sg, i) => {
    d += ` C${pt(sg[1])} ${pt(sg[2])} ${pt(sg[3])}`;
    d += ` A${f(rt)} ${f(rt)} 0 0 1 ${pt(segs[(i + 1) % 4][0])}`;
  });
  return d + ' Z';
}

// closed polygon with every corner filleted by a true arc of radius r (or r[i] per corner)
export function roundPoly(pts, r) {
  const n = pts.length, out = [];
  for (let i = 0; i < n; i++) {
    const v = pts[i], a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
    const ri = Array.isArray(r) ? r[i] : r;
    const ua = norm([a[0] - v[0], a[1] - v[1]]), ub = norm([b[0] - v[0], b[1] - v[1]]);
    const th = Math.acos(Math.max(-1, Math.min(1, ua[0] * ub[0] + ua[1] * ub[1])));
    const dist = ri / Math.tan(th / 2);
    const p1 = [v[0] + ua[0] * dist, v[1] + ua[1] * dist], p2 = [v[0] + ub[0] * dist, v[1] + ub[1] * dist];
    const cross = ua[0] * ub[1] - ua[1] * ub[0];
    out.push({ p1, p2, r: ri, sweep: cross < 0 ? 1 : 0 });
  }
  let d = `M${pt(out[0].p1)}`;
  out.forEach((c, i) => {
    if (i > 0) d += ` L${pt(c.p1)}`;
    d += c.r > 0 ? ` A${f(c.r)} ${f(c.r)} 0 0 ${c.sweep} ${pt(c.p2)}` : '';
  });
  return d + ' Z';
}
const norm = (v) => { const l = Math.hypot(v[0], v[1]); return [v[0] / l, v[1] / l]; };

export function rrect(x, y, w, h, r) {
  return `M${f(x + r)} ${f(y)} H${f(x + w - r)} A${r} ${r} 0 0 1 ${f(x + w)} ${f(y + r)} V${f(y + h - r)} A${r} ${r} 0 0 1 ${f(x + w - r)} ${f(y + h)} H${f(x + r)} A${r} ${r} 0 0 1 ${f(x)} ${f(y + h - r)} V${f(y + r)} A${r} ${r} 0 0 1 ${f(x + r)} ${f(y)} Z`;
}
export const circle = (cx, cy, r) => `M${f(cx - r)} ${f(cy)} A${r} ${r} 0 1 0 ${f(cx + r)} ${f(cy)} A${r} ${r} 0 1 0 ${f(cx - r)} ${f(cy)} Z`;

// svg helpers in the bulk format
export const svg = (body, defs = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">\n${defs ? `  <defs>${defs}</defs>\n` : ''}${body}</svg>\n`;
// mask that removes `cut` plus a GAP all round (solid cutter) or a line cutter of width LINE+2·GAP
export const mask = (id, cut, { line = false, gap = GAP } = {}) =>
  `<mask id="${id}"><rect width="24" height="24" fill="#fff"/><path d="${cut}" fill="${line ? 'none' : '#000'}" stroke="#000" stroke-width="${line ? LINE + 2 * gap : 2 * gap}" stroke-linecap="round" stroke-linejoin="round"/></mask>`;
export const gray = (d, m) => `  <path d="${d}" fill-opacity=".4"${m ? ` mask="url(#${m})"` : ''}/>\n`;
export const black = (d, m, extra = '') => `  <path d="${d}"${m ? ` mask="url(#${m})"` : ''}${extra}/>\n`;
export const line = (d, { tone = 'black', m } = {}) => `  <path d="${d}" fill="none" stroke="currentColor" stroke-width="${LINE}" stroke-linecap="round" stroke-linejoin="round"${tone === 'gray' ? ' stroke-opacity=".4"' : ''}${m ? ` mask="url(#${m})"` : ''}/>\n`;
