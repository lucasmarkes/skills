#!/usr/bin/env node
/**
 * A shapes kit: `node shapes.mjs <primitive> [flags]` prints a body's elements, ready to paste into an icon,
 * already on the quarter grid and already clean for check.mjs's join and inflection rules.
 *
 *   drop      a cusp on top, round below           --tip 0..1 (how sharp the cusp)
 *   leaf      two cusps, two bellies               --skew -1..1 (the bellies slide)
 *   lens      two cusps, flat bellies
 *   bean      round, with a dent below            --waist 0..1
 *   crescent  two cusps, a bite out of the bottom  --thick 0..1
 *   taper     round at one end, narrow at the other  --narrow 0..1, --sharp (the narrow end cut flat)
 *   wedge     a slice: apex, two sides, a crust    --angle 15..120
 *   scoop     a box with one side dished in       --depth 0..1, --side top|right|bottom|left, --rx
 *   blob      your own anchors                     --anchors "x,y[,t][,c] …" (c a cusp, t the handle length)
 *
 * Every primitive takes --w --h (its box before rotation, default the live area), --at x,y (default the
 * centre), --rot (steps of 15), --bulge (handle length, default 0.55), --lean -1..1 (the belly slides to one side), --grid (default 48).
 * The finish follows the grid. Duotone: one path with the .2 fill. Filled: tone, shade, contour at 2,
 * with --shade right|lower|none and --seam straight|curved.
 * `--from "<d>"` takes a path you drew, turns its kinks into smooth joins, prints the body and, on stderr,
 * each join it changed. `--from <file.svg>` repairs every kinked path in the file and prints `path@N <d>`.
 * It refuses, with the reason, a shape past the grid's command cap or one check.mjs would reject.
 */
import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { preset, PALETTE, FILL } from "./presets.mjs";
import { pathParts, bounds } from "./geometry.mjs";
import { segments, joins, curveFailures, SMOOTH, CORNER } from "./curve.mjs";
import { pathCommands, parse } from "./svg.mjs";
import { filledChecks } from "./filled.mjs";

// --lean takes -1..1; a full lean slides the belly by 0.3 of the box
const STEP = 0.25, SQ = Math.SQRT1_2, D = Math.PI / 180, BOX_TOL = 0.05, LEAN = 0.3;
const snap = (n) => Math.round(n / STEP) * STEP;
const add = (a, b) => [a[0] + b[0], a[1] + b[1]], sub = (a, b) => [a[0] - b[0], a[1] - b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
const len = (v) => Math.hypot(v[0], v[1]), unit = (v) => { const l = len(v) || 1; return [v[0] / l, v[1] / l]; };
const rot = (v, deg) => { const c = Math.cos(deg * D), s = Math.sin(deg * D); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };
const angle = (u, v) => Math.acos(Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / (len(u) * len(v) || 1)))) / D;
const fmt = (n) => String(+n.toFixed(2));
const pt = (p) => `${fmt(p[0])} ${fmt(p[1])}`;

export class ShapeError extends Error {}
const refuse = (msg) => { throw new ShapeError(msg); };

/**
 * The quarter-grid direction nearest u, and its whole multiples nearest each handle length: both handles of a
 * smooth anchor on one grid line through it, so the join is 0° after snapping, not a few degrees off.
 */
export function collinear(u, lin, lout) {
  let best = null;
  for (let p = -16; p <= 16; p++) for (let q = -16; q <= 16; q++) {
    if (!p && !q) continue;
    const v = [p * STEP, q * STEP], l = len(v);
    if (l > Math.min(lin, lout)) continue;
    const err = angle(u, v);
    if (err > 6) continue;
    const ki = Math.max(1, Math.round(lin / l)), ko = Math.max(1, Math.round(lout / l));
    const score = err + 2 * (Math.abs(ki * l - lin) + Math.abs(ko * l - lout));
    if (!best || score < best.score) best = { score, hin: mul(v, -ki), hout: mul(v, ko) };
  }
  return best ?? { hin: mul(u, -lin).map(snap), hout: mul(u, lout).map(snap) };
}

/**
 * Handles for a closed outline through anchors `{ p, cusp, t, turn, edge, line }`, in drawing order. A smooth
 * anchor's handles lie on the line through its neighbours, or along the box's edge when it sits on one (so the
 * curve never overshoots it); a cusp's run along each chord, turned outward by `turn` degrees.
 */
export function outline(anchors, { bulge = 0.55, turn = 22 } = {}) {
  const n = anchors.length;
  const area = anchors.reduce((s, a, i) => { const b = anchors[(i + 1) % n].p; return s + a.p[0] * b[1] - b[0] * a.p[1]; }, 0);
  const sgn = area >= 0 ? 1 : -1, xs = anchors.map((a) => a.p[0]), ys = anchors.map((a) => a.p[1]);
  const lo = [Math.min(...xs), Math.min(...ys)], hi = [Math.max(...xs), Math.max(...ys)];
  // a handle along an edge stops at the box's corner, so the curve it pulls never leaves the box
  const within = (p, h, ax) => { const room = h[ax] > 0 ? hi[ax] - p[ax] : p[ax] - lo[ax], k = Math.abs(h[ax]) > room ? room / Math.abs(h[ax]) : 1; return mul(h, k); };
  const hs = anchors.map((a, i) => {
    const prev = anchors[(i + n - 1) % n].p, next = anchors[(i + 1) % n].p, k = (bulge * SQ * (a.t ?? 0.5)) / 0.5;
    const lin = k * len(sub(a.p, prev)), lout = k * len(sub(next, a.p));
    if (!a.cusp) {
      let u = unit(sub(next, prev));
      if (a.edge === "x") u = [0, Math.sign(u[1]) || 1];
      else if (a.edge === "y") u = [Math.sign(u[0]) || 1, 0];
      if (!a.edge) return { hin: mul(u, -lin), hout: mul(u, lout) };
      const ax = a.edge === "x" ? 1 : 0;
      return { hin: within(a.p, mul(u, -lin), ax), hout: within(a.p, mul(u, lout), ax) };
    }
    const d = unit(sub(next, a.p)), e = unit(sub(prev, a.p));
    const ext = 180 - angle(d, e), tt = Math.max(0, Math.min(a.turn ?? turn, (ext - 34) / 2));
    return { hin: mul(rot(e, -sgn * tt), lin), hout: mul(rot(d, sgn * tt), lout) };
  });
  return { anchors, hs };
}

/** The outline snapped: anchors on the quarter grid, smooth handles re-solved on one grid line. Points and handles, then d. */
export function snapOutline({ anchors, hs }) {
  const P = anchors.map((a) => a.p.map(snap));
  const H = anchors.map((a, i) => (a.cusp || a.line ? { hin: hs[i].hin.map(snap), hout: hs[i].hout.map(snap) } : collinear(unit(sub(hs[i].hout, hs[i].hin)), len(hs[i].hin), len(hs[i].hout))));
  const segs = P.map((p, i) => {
    const j = (i + 1) % P.length;
    return anchors[i].line ? { line: true, to: P[j] } : { c1: add(p, H[i].hout), c2: add(P[j], H[j].hin), to: P[j] };
  });
  return { P, segs };
}
const segText = (s) => (s.line ? `L${pt(s.to)}` : `C${pt(s.c1)} ${pt(s.c2)} ${pt(s.to)}`);
export const pathOf = ({ P, segs }) => `M${pt(P[0])}${segs.map(segText).join("")}Z`;

// the primitives drawn from anchors, in a unit box: x and y from -1 to 1
const UNIT = {
  drop: (o) => [{ p: [0, -1], cusp: true, turn: 44 * (o.tip ?? 0.5) }, { p: [1, 0.4] }, { p: [0, 1] }, { p: [-1, 0.4] }],
  leaf: (o) => { const x = 0.1 + 0.5 * (o.skew ?? 0); return [{ p: [-1, 0], cusp: true }, { p: [x, -1] }, { p: [1, 0], cusp: true }, { p: [x, 1] }]; },
  lens: () => [{ p: [-1, 0], cusp: true, turn: 40 }, { p: [0, -1], t: 0.4 }, { p: [1, 0], cusp: true, turn: 40 }, { p: [0, 1], t: 0.4 }],
  bean: (o) => [{ p: [-1, 0] }, { p: [0, -1] }, { p: [1, 0] }, { p: [0.6, 1] }, { p: [0, 1 - 0.6 * (o.waist ?? 0.5)] }, { p: [-0.6, 1] }],
  crescent: (o) => [{ p: [-1, 0.5], cusp: true }, { p: [0, -1] }, { p: [1, 0.5], cusp: true }, { p: [0, -1 + 1.4 * (o.thick ?? 0.5)] }],
  taper: (o) => {
    const n = o.narrow ?? 0.3;
    return o.sharp
      ? [{ p: [-1, 0] }, { p: [-0.4, -1] }, { p: [1, -n], cusp: true, turn: 0, line: true }, { p: [1, n], cusp: true, turn: 0 }, { p: [-0.4, 1] }]
      : [{ p: [-1, 0] }, { p: [-0.4, -1] }, { p: [1, 0], t: n }, { p: [-0.4, 1] }];
  },
};

/** Unit anchors placed in a w × h box at `at`, an inset in from its edge, leaned and turned. */
function place(unitAnchors, { w, h, at, inset, rot: deg = 0, lean = 0 }) {
  const sx = (w / 2 - inset) / (1 + Math.abs(lean)), sy = h / 2 - inset;
  const swap = Math.abs(deg % 180) === 90 ? { x: "y", y: "x" } : { x: "x", y: "y" };
  return unitAnchors.map((a) => {
    const [x, y] = a.p, edge = deg % 90 || lean ? undefined : Math.abs(x) === 1 ? swap.x : Math.abs(y) === 1 ? swap.y : undefined;
    return { ...a, edge, p: add(at, rot([(x - lean * y) * sx, y * sy], deg)) };
  });
}

function wedgeOutline({ w, h, at, inset, angle: ang = 60 }) {
  if (ang < 15 || ang > 120) refuse(`--angle ${ang}: from 15 to 120`);
  // a step short of the box: the cubic arc, snapped, bulges past the true one by up to a tenth
  const R = Math.min(h - 2 * inset, (w / 2 - inset) / Math.sin((ang / 2) * D)) - STEP, apex = [at[0], at[1] + R / 2];
  const on = (deg) => [apex[0] + R * Math.cos(deg * D), apex[1] + R * Math.sin(deg * D)];
  const a0 = -90 - ang / 2, n = Math.ceil(ang / 90), step = ang / n, k = (4 / 3) * Math.tan((step / 4) * D) * R;
  const P = (p) => pt(p.map(snap));
  let d = `M${P(apex)}L${P(on(a0))}`;
  for (let i = 0; i < n; i++) {
    const s = a0 + i * step, e = s + step, p0 = on(s), p1 = on(e);
    d += `C${P([p0[0] - k * Math.sin(s * D), p0[1] + k * Math.cos(s * D)])} ${P([p1[0] + k * Math.sin(e * D), p1[1] - k * Math.cos(e * D)])} ${P(p1)}`;
  }
  return d + "Z";
}

function scoopOutline({ w, h, at, inset, depth = 0.5, side = "top", rx = 0 }) {
  const turns = { top: 0, right: 90, bottom: 180, left: 270 }[side];
  if (turns === undefined) refuse(`--side ${side}: top, right, bottom or left`);
  const [bw, bh] = turns % 180 ? [h - 2 * inset, w - 2 * inset] : [w - 2 * inset, h - 2 * inset];
  if (rx > Math.min(bw, bh) / 2) refuse(`scoop: --rx ${rx}: at most ${fmt(Math.min(bw, bh) / 2)}`);
  const x = -bw / 2, y = -bh / 2, K = 0.5523 * rx, m = 0, dy = y + depth * bh * 0.4, q = (bw / 2 - rx) * 0.5;
  const P = (...v) => { const out = []; for (let i = 0; i < v.length; i += 2) out.push(pt(add(at, rot([v[i], v[i + 1]], turns)).map(snap))); return out.join(" "); };
  let d = `M${P(x, y + rx)}`;
  if (rx) d += `C${P(x, y + rx - K, x + rx - K, y, x + rx, y)}`;
  d += `C${P(x + rx + q, y, m - q, dy, m, dy)}C${P(m + q, dy, x + bw - rx - q, y, x + bw - rx, y)}`;
  if (rx) d += `C${P(x + bw - rx + K, y, x + bw, y + rx - K, x + bw, y + rx)}`;
  d += `L${P(x + bw, y + bh - rx)}`;
  if (rx) d += `C${P(x + bw, y + bh - rx + K, x + bw - rx + K, y + bh, x + bw - rx, y + bh)}`;
  d += `L${P(x + rx, y + bh)}`;
  if (rx) d += `C${P(x + rx - K, y + bh, x, y + bh - rx + K, x, y + bh - rx)}`;
  return d + "Z";
}

/** "x,y[,t][,c] …": absolute anchors; c makes a cusp, a number after x,y is the handle length. */
export function parseAnchors(text = "") {
  const anchors = text.trim().split(/\s+/).filter(Boolean).map((tok) => {
    const parts = tok.split(","), [x, y] = parts.map(Number);
    if (!Number.isFinite(x) || !Number.isFinite(y)) refuse(`--anchors ${tok}: x,y[,t][,c]`);
    const a = { p: [x, y] };
    for (const f of parts.slice(2)) if (f === "c") a.cusp = true; else if (Number.isFinite(Number(f))) a.t = Number(f); else refuse(`--anchors ${tok}: x,y[,t][,c]`);
    return a;
  });
  if (anchors.length < 3) refuse("--anchors: at least three");
  const xs = anchors.map((a) => a.p[0]), ys = anchors.map((a) => a.p[1]);
  for (const a of anchors) if (!a.cusp) a.edge = [Math.min(...xs), Math.max(...xs)].includes(a.p[0]) ? "x" : [Math.min(...ys), Math.max(...ys)].includes(a.p[1]) ? "y" : undefined;
  return anchors;
}

/** One primitive's outline as `{ d, P, segs }`: P and segs for the shade, null for wedge and scoop. */
export function shape(name, o = {}) {
  const G = o.grid ?? 48, p = preset(G), inset = (p.contour ?? p.stroke) / 2;
  // the box on the grid: its sides in halves and its centre in quarters, so its edges fall on quarters
  const half = (n) => Math.floor(n * 2) / 2;
  const box = { w: half(o.w ?? p.live), h: half(o.h ?? p.live), at: (o.at ?? p.centre).map(snap), inset, rot: o.rot ?? 0, lean: (o.lean ?? 0) * LEAN };
  if (box.rot % 15) refuse(`--rot ${box.rot}: a step of 15`);
  if (Math.abs(o.lean ?? 0) > 1) refuse(`--lean ${o.lean}: from -1 to 1`);
  let d, P = null, segs = null;
  if (name === "wedge" || name === "scoop") {
    if (box.rot && name === "scoop") refuse("scoop: turn it with --side, not --rot");
    d = name === "wedge" ? wedgeOutline({ ...box, angle: o.angle }) : scoopOutline({ ...box, depth: o.depth, side: o.side, rx: o.rx });
    if (name === "scoop" && pathCommands(d) > p.commands) refuse(`scoop: ${pathCommands(d)} commands, the grid allows ${p.commands}: use --rx 0`);
    if (name === "wedge" && box.rot) refuse("wedge: draw it pointing down; --rot is for the anchor shapes");
  } else {
    const anchors = name === "blob" ? parseAnchors(o.anchors) : UNIT[name] ? place(UNIT[name](o), box) : refuse(`no primitive "${name}": ${[...Object.keys(UNIT), "wedge", "scoop", "blob"].join(", ")}`);
    if (anchors.length + 2 > p.commands) refuse(`${name}: ${anchors.length} anchors, the grid allows ${p.commands - 2}: remove ${anchors.length + 2 - p.commands} anchors`);
    ({ P, segs } = snapOutline(outline(anchors, { bulge: o.bulge ?? 0.55 })));
    d = pathOf({ P, segs });
  }
  const failures = curveFailures(name, { tag: "path", attrs: { d }, at: "path@1" });
  if (failures.length) refuse(`${name}: ${failures.map((f) => `${f.rule} ${f.got.replace("path@1 ", "")}`).join("; ")}: change --bulge or the box`);
  if (name !== "blob") {
    const b = bounds(pathParts(d).flat()), half = [box.w / 2 - inset, box.h / 2 - inset], [cx, cy] = box.at;
    const r = Math.abs(box.rot % 180) === 90 ? [half[1], half[0]] : half;
    const over = Math.max(cx - r[0] - b.x0, b.x1 - cx - r[0], cy - r[1] - b.y0, b.y1 - cy - r[1]);
    if (!(box.rot % 90) && over > BOX_TOL) refuse(`${name}: overshoots its box by ${fmt(over)}: lower --bulge`);
  }
  return { d, P, segs };
}

/** Each primitive by name: `drop(o)` is `shape("drop", o)`. */
export const drop = (o) => shape("drop", o), leaf = (o) => shape("leaf", o), lens = (o) => shape("lens", o);
export const bean = (o) => shape("bean", o), crescent = (o) => shape("crescent", o), taper = (o) => shape("taper", o);
export const wedge = (o) => shape("wedge", o), scoop = (o) => shape("scoop", o), blob = (o) => shape("blob", o);

/**
 * The shade of an anchor outline: the run of segments on the side away from the light, closed by a seam.
 * "right" runs from the top anchor to the bottom one through the right; "lower" from the leftmost to the
 * rightmost through the bottom. The seam is the chord back, or with "curved" a cubic bowed into the shade.
 */
export function shadeOf(s, { side = "right", seam = "straight" } = {}) {
  if (side !== "right" && side !== "lower") refuse(`--shade ${side}: right, lower or none`);
  if (seam !== "straight" && seam !== "curved") refuse(`--seam ${seam}: straight or curved`);
  return closeRun(s, sideRun(s, side), seam === "curved" && side);
}

// the anchor furthest along axis `ax`, or least with `least`; of two level ones, the one further along the other axis
const extreme = (P, ax, least = false) => P.reduce((b, p, i) => ((least ? p[ax] < P[b][ax] : p[ax] > P[b][ax]) || (p[ax] === P[b][ax] && p[1 - ax] > P[b][1 - ax]) ? i : b), 0);

/** The two runs of segments between a side's extreme anchors (top and bottom for "right", leftmost and rightmost for "lower"). */
function halves({ P }, side) {
  const n = P.length, along = side === "right" ? 1 : 0;
  // of two level extremes, the one further into the shade (a crescent's right cusp)
  const a = extreme(P, along, true), z = extreme(P, along);
  const runFrom = (s, e) => { const r = []; for (let i = s; i !== e; i = (i + 1) % n) r.push(i); return r; };
  return [runFrom(a, z), runFrom(z, a)];
}

/** The indices of the segments a side's shade runs along: the half further into the shade. */
function sideRun(s, side) {
  const out = side === "right" ? 0 : 1, mean = (r) => r.reduce((t, i) => t + s.segs[i].to[out], 0) / r.length;
  const [r0, r1] = halves(s, side);
  return mean(r0) >= mean(r1) ? r0 : r1;
}

/** A run of segments closed: by its chord, or, with `bowSide`, by a cubic bowed that way (right or lower) into the shade. */
function closeRun({ P, segs }, run, bowSide = false) {
  const start = P[run[0]], end = segs[run.at(-1)].to;
  let d = `M${pt(start)}${run.map((i) => segText(segs[i])).join("")}`;
  if (bowSide) {
    const chord = sub(start, end), bow = bowSide === "right" ? [0.15 * len(chord), 0] : [0, 0.15 * len(chord)];
    d += `C${pt(add(add(end, mul(chord, 1 / 3)), bow).map(snap))} ${pt(add(add(end, mul(chord, 2 / 3)), bow).map(snap))} ${pt(start)}`;
  }
  return d + "Z";
}

// the three paths of a body at the filled finish
const toneLine = (d) => `<path d="${d}" fill="${PALETTE.fill}" stroke="none" />`;
const shadeLine = (d) => `<path d="${d}" fill="${PALETTE.shade}" stroke="none" />`;
const contourLine = (d, p) => `<path d="${d}" stroke-width="${p.contour}" />`;

/** Whether check.mjs's light rule passes this shade on this tone: the check itself, run on the three paths alone. */
export function lit(toneD, shadeD, G = 48) {
  const p = preset(G), svg = `<svg viewBox="0 0 ${G} ${G}" fill="none" stroke="${PALETTE.line}" stroke-width="${p.stroke}">\n${toneLine(toneD)}\n${shadeLine(shadeD)}\n${contourLine(toneD, p)}\n</svg>`;
  return !filledChecks("shade", parse(svg), G).some((f) => f.rule === "light");
}

/**
 * The shades to try when the asked one fails the light, nearest first: the other side's run, then the parts
 * of the halves between either side's extremes. Longest first; then a part that reaches the asked side's
 * extreme (the rightmost anchor for "right", the lowest for "lower"); then the lowest, then furthest right.
 * A slanted leaf's half has the tone's own box; a part of it, from the lower belly to a tip, sits off its centre.
 * A part is closed by its chord: a bowed seam can cross the belly it runs beside.
 */
function fallbacks(s, side, seam) {
  const other = side === "right" ? "lower" : "right", tip = extreme(s.P, side === "right" ? 0 : 1);
  const parts = [], seen = new Set();
  for (const run of [...halves(s, side), ...halves(s, other)]) for (let k = run.length - 1; k >= 1; k--) for (let i = 0; i + k <= run.length; i++) {
    const r = run.slice(i, i + k), key = r.join(",");
    if (seen.has(key)) continue;
    seen.add(key);
    const at = [r[0], ...r.map((j) => (j + 1) % s.P.length)], mean = (ax) => at.reduce((t, j) => t + s.P[j][ax], 0) / at.length;
    parts.push({ k, reach: at.includes(tip) ? 1 : 0, y: mean(1), x: mean(0), d: closeRun(s, r) });
  }
  parts.sort((a, b) => b.k - a.k || b.reach - a.reach || b.y - a.y || b.x - a.x);
  return [closeRun(s, sideRun(s, other), seam === "curved" && other), ...parts.map((p) => p.d)];
}

/** The elements a body takes at its grid's finish, as lines of SVG; `given` a body already drawn (--from), unshaded unless asked. */
export function finishOf(name, o = {}, given = null) {
  const G = o.grid ?? 48, p = preset(G), s = given ?? shape(name, o);
  if (p.finish !== "filled") return [`<path d="${s.d}" fill="currentColor" fill-opacity="${FILL}" />`];
  const out = [toneLine(s.d)];
  const side = o.shade ?? (s.P ? "right" : "none");
  if (side !== "none") {
    if (!s.P) refuse(`${name}: no --shade for wedge and scoop yet; draw the shade by hand, or --shade none`);
    const seam = o.seam ?? "straight", kinks = (d) => curveFailures(name, { tag: "path", attrs: { d }, at: "path@1" });
    let sh = shadeOf(s, { side, seam });
    if (lit(s.d, sh, G)) {
      const f = kinks(sh);
      if (f.length) refuse(`${name}: the shade has a ${f[0].rule} (${f[0].got.replace("path@1 ", "")}): try --seam ${seam === "curved" ? "straight" : "curved"} or --shade ${side === "right" ? "lower" : "right"}`);
    } else {
      // the asked side's run fails the light (a body turned 30° to 60°): the nearest run that passes it, and is clean
      sh = fallbacks(s, side, seam).find((d) => lit(s.d, d, G) && !kinks(d).length)
        ?? refuse(`${name}: no shade the kit can draw passes the light check: use --shade none, or shade it by hand (rules-filled.md 04)`);
    }
    out.push(shadeLine(sh));
  }
  out.push(contourLine(s.d, p));
  return out;
}

/**
 * A path you drew, its kinks made smooth: at every join between 4° and 30°, both handles turn to the
 * direction halfway between them (a line keeps its own, and the curve's handle takes it), then snap.
 * One closed subpath of lines and cubics; an arc is refused. `repair` also says which joins it changed.
 */
export const reconcile = (d) => repair(d).d;
// every number of a path on the quarter grid, so the joins measured and the d written are on it
const snapNumbers = (d) => d.replace(/-?\d*\.?\d+(?:e-?\d+)?/gi, (n) => fmt(snap(Number(n))));
export function repair(d) {
  d = snapNumbers(d);
  const subs = segments(d);
  if (subs.length !== 1 || !subs[0].closed) refuse("--from: one closed subpath");
  const segs = subs[0].segs.map((s) => (s.kind === "arc" ? refuse(`--from: an arc at ${pt(s.p[0])}: draw that part with a primitive, or as a cubic`) : { ...s, p: s.p.map((q) => [...q]) }));
  const n = segs.length;
  for (let i = 0; i < n; i++) {
    const a = segs[i], b = segs[(i + 1) % n], ang = angle(a.t1, b.t0);
    if (ang < SMOOTH || ang > CORNER) continue;
    const P = a.p.at(-1);
    const u = a.kind === "line" ? unit(a.t1) : b.kind === "line" ? unit(b.t0) : unit(add(unit(a.t1), unit(b.t0)));
    let hin = a.kind === "cubic" ? mul(u, -len(sub(P, a.p[2]))) : null, hout = b.kind === "cubic" ? mul(u, len(sub(b.p[1], P))) : null;
    if (hin && hout) ({ hin, hout } = collinear(u, len(hin), len(hout)));
    else if (hin) hin = collinear(u, len(hin), len(hin)).hin; else if (hout) hout = collinear(u, len(hout), len(hout)).hout;
    if (hin) a.p[2] = add(P, hin);
    if (hout) b.p[1] = add(P, hout);
  }
  const out = `M${pt(segs[0].p[0])}${segs.map((s) => (s.kind === "line" ? `L${pt(s.p[1])}` : `C${pt(s.p[1])} ${pt(s.p[2])} ${pt(s.p[3])}`)).join("")}Z`;
  const f = curveFailures("from", { tag: "path", attrs: { d: out }, at: "path@1" });
  if (f.length) refuse(`--from: still ${f.map((x) => `${x.rule} ${x.got.replace("path@1 ", "")}`).join("; ")}: move that anchor`);
  // the anchors never move, so the joins before and after pair up one to one
  const before = joins(d), after = joins(out);
  const changed = before.flatMap((j, i) => (j.kind === "kink" ? [`${j.angle.toFixed(1)}° at ${pt(j.at)}, now ${after[i].angle.toFixed(1)}°`] : []));
  return { d: out, changed };
}

/** Every path in an icon whose joins have a kink, repaired: `{ at, d, changed }` each, in the file's order. */
export function repairFile(text) {
  const out = [];
  for (const el of parse(text).elements) {
    if (el.tag !== "path" || !joins(el.attrs.d ?? "").some((j) => j.kind === "kink")) continue;
    try { out.push({ at: el.at, ...repair(el.attrs.d) }); }
    catch (e) { if (e instanceof ShapeError) refuse(`${el.at}: ${e.message}`); throw e; }
  }
  return out;
}

const NUMERIC = ["w", "h", "rot", "bulge", "lean", "grid", "tip", "skew", "waist", "thick", "narrow", "angle", "depth", "rx"];
export const USAGE = "usage: node shapes.mjs <drop|leaf|lens|bean|crescent|taper|wedge|scoop|blob> [--w N --h N --at x,y --rot N --bulge N --lean N --grid 16|20|24|48 --shade right|lower|none --seam straight|curved ...] | node shapes.mjs --from \"<d>\"|<file.svg> [--grid N]";

export function parseArgs(argv) {
  const o = {}, rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) { rest.push(a); continue; }
    const k = a.slice(2);
    if (k === "sharp") { o.sharp = true; continue; }
    const v = argv[++i];
    if (v === undefined) return null;
    if (NUMERIC.includes(k)) { o[k] = Number(v); if (!Number.isFinite(o[k])) return null; }
    else if (k === "at") { o.at = v.split(",").map(Number); if (o.at.length !== 2 || !o.at.every(Number.isFinite)) return null; }
    else if (["shade", "seam", "side", "anchors", "from"].includes(k)) o[k] = v;
    else return null;
  }
  if (rest.length > 1 || (rest.length ? o.from !== undefined : o.from === undefined)) return null;
  return { name: rest[0], o };
}

export function main(argv) {
  const args = parseArgs(argv);
  if (!args) { console.error(USAGE); process.exit(1); }
  try {
    if (args.o.grid !== undefined && ![16, 20, 24, 48].includes(args.o.grid)) refuse(`no preset for grid ${args.o.grid}: use 16, 20, 24 or 48`);
    const from = args.o.from;
    if (from !== undefined && from.endsWith(".svg")) {
      const fixed = repairFile(readFileSync(from, "utf8"));
      if (!fixed.length) console.error("no kinks: nothing to repair");
      for (const f of fixed) {
        console.log(`${f.at} ${f.d}`);
        for (const c of f.changed) console.error(`${f.at} changed ${c}`);
      }
      return;
    }
    if (from !== undefined) {
      const { d, changed } = repair(from);
      for (const l of finishOf("from", args.o, { d, P: null, segs: null })) console.log(l);
      for (const c of changed) console.error(`changed ${c}`);
      return;
    }
    for (const l of finishOf(args.name, args.o)) console.log(l);
  } catch (e) {
    if (e.code === "ENOENT") { console.error(`shapes: --from ${e.path}: no such file`); process.exit(1); }
    if (!(e instanceof ShapeError)) throw e;
    console.error(`shapes: ${e.message}`);
    process.exit(1);
  }
}

const entry = process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (entry) main(process.argv.slice(2));
