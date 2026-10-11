#!/usr/bin/env node
/**
 * Modifiers: a small sign on a base icon that says add, remove, done, off, locked, new.
 * `node modifiers.mjs <icon.svg> --add <kind> [--corner br|tr|bl|tl] [--solid] [--print]`
 *
 *   badge:plus  badge:minus  badge:check  badge:x   a glyph in the corner (in a paper circle at 48)
 *   arrow:up  arrow:right  arrow:down  arrow:left  a chevron with a tail
 *   lock                                          a cased body and its shackle
 *   dot                                           a filled dot
 *   slash                                         one diagonal, upper left to lower right, across the base
 *
 * It does three things, and writes the file back (or prints it):
 *   1. a body the halo crosses is split into its paint (stroke none) and its contour, a path marked data-cut;
 *   2. every stroke the halo crosses is cut where it enters, the inside dropped, the ends snapped outward
 *      to the quarter grid; a piece shorter than 1 (a crumb) goes too. Paint is never cut;
 *   3. the modifier is drawn last, its elements marked data-modifier="<kind>": duotone in currentColor at
 *      stroke-opacity 0.6 (--solid leaves it out), filled in the line tone at 2, a badge on paper.
 * The halo is the glyph's real reach (its farthest ink, never less than half its box) plus one stroke of clear space
 * and half the base's stroke (its round cap).
 * The result goes through check.mjs's text rules; the command refuses, with them, anything they reject.
 */
import { readFileSync, writeFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { preset, inset, BEND, MODIFIER, PALETTE } from "./presets.mjs";
import { parse, compose, num, G as gridOf, isClosed } from "./svg.mjs";
import { sampleParts } from "./geometry.mjs";
import { segments, inflections, tightest, angle } from "./curve.mjs";

export const KINDS = ["badge:plus", "badge:minus", "badge:check", "badge:x", "arrow:up", "arrow:right", "arrow:down", "arrow:left", "lock", "dot", "slash"];
export const CORNERS = ["br", "tr", "bl", "tl"];
export const OPACITY = 0.6;
export const CRUMB = 1;
const STEP = 0.25, SAMPLES = 96;

export class ModifierError extends Error {}
const refuse = (m) => { throw new ModifierError(m); };
const snap = (n) => Math.round(n / STEP) * STEP;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], add = (a, b) => [a[0] + b[0], a[1] + b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
const len = (v) => Math.hypot(v[0], v[1]), lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const onGrid = (q) => q.every((n) => Math.abs(n / STEP - Math.round(n / STEP)) < 1e-6);
const fmt = (n) => String(+(+n).toFixed(2));
const pt = (p) => `${fmt(p[0])} ${fmt(p[1])}`;
const isNone = (v) => v !== undefined && String(v).trim().toLowerCase() === "none";
export const isModifier = (el) => "data-modifier" in el.attrs;
export const isCut = (el) => "data-cut" in el.attrs;
/** A cut contour split from its own paint, which sits just before it: data-cut="split". */
export const isSplit = (el) => !!el && el.attrs["data-cut"] === "split";

/** The base's widest stroke: the filled finish's contour, or the duotone stroke. */
const baseStroke = (G) => { const p = preset(G); return p.contour ?? p.stroke; };
/** The modifier's own stroke: 2 at the filled finish (a contour), the root's in duotone. */
const ownStroke = (G) => { const p = preset(G); return p.finish === "filled" ? p.contour : p.stroke; };

/** Where a modifier sits: the centre of its box in a corner of the live area, and its ink's half-width. */
export function placement(G, kind, corner = "br") {
  if (!KINDS.includes(kind)) refuse(`--add ${kind}: one of ${KINDS.join(", ")}`);
  if (!CORNERS.includes(corner)) refuse(`--corner ${corner}: br, tr, bl or tl`);
  const p = preset(G), m = MODIFIER[G], half = kind === "dot" ? m.dot : m.size / 2;
  const lo = p.pad + half, hi = G - p.pad - half;
  return { c: [corner.endsWith("l") ? lo : hi, corner.startsWith("t") ? lo : hi], half };
}

/**
 * The halo, as a distance function: how far a point is from the modifier, less the clear space it needs.
 * Negative inside. A badge, an arrow, a lock and a dot clear a circle; a slash clears a band along itself.
 */
export function halo(G, kind, corner = "br") {
  const clear = 1.5 * baseStroke(G);
  if (kind === "slash") {
    const [a, b] = slashEnds(G), r = ownStroke(G) / 2 + clear, ab = sub(b, a), L2 = ab[0] ** 2 + ab[1] ** 2;
    return { r, inside: (q) => { const t = Math.max(0, Math.min(1, ((q[0] - a[0]) * ab[0] + (q[1] - a[1]) * ab[1]) / L2)); return len(sub(q, lerp(a, b, t))) - r; } };
  }
  const { c, half } = placement(G, kind, corner), r = Math.max(half, reach(G, kind, corner)) + clear;
  return { r, c, inside: (q) => len(sub(q, c)) - r };
}
/** The farthest a glyph's ink reaches from its centre: its elements' sampled points, widened by half their stroke. */
function reach(G, kind, corner) {
  if (kind === "dot") return placement(G, kind, corner).half;
  const { c } = placement(G, kind, corner), s = ownStroke(G);
  let far = 0;
  for (const el of glyph(G, kind, { corner })) {
    const w = Number(el.attrs["stroke-width"] ?? s) / 2;
    let parts;
    if (el.tag === "rect") {
      const a = el.attrs, x = +a.x, y = +a.y, W = +a.width, H = +a.height;
      parts = [[[x, y], [x + W, y], [x, y + H], [x + W, y + H]]];
    } else parts = sampleParts(el, 0.05);
    for (const q of parts.flat()) far = Math.max(far, len(sub(q, c)) + w);
  }
  return Math.round(far * 1e6) / 1e6;
}
/** Where a slash starts and ends: a stroke in from the live area's corners. */
export const slashEnds = (G) => { const p = preset(G), e = p.pad + ownStroke(G); return [[e, e], [G - e, G - e]]; };

/** A rect, circle or line as a path's d; a path as it is. */
export function asPath(el) {
  const a = el.attrs, n = (k, f = 0) => num(a, k, f);
  if (el.tag === "path") return a.d ?? "";
  if (el.tag === "line") return `M${pt([n("x1"), n("y1")])}L${pt([n("x2"), n("y2")])}`;
  if (el.tag === "circle") { const [cx, cy, r] = [n("cx"), n("cy"), n("r")]; return `M${pt([cx - r, cy])}A${fmt(r)} ${fmt(r)} 0 1 1 ${pt([cx + r, cy])}A${fmt(r)} ${fmt(r)} 0 1 1 ${pt([cx - r, cy])}Z`; }
  const [x, y, w, h] = [n("x"), n("y"), n("width"), n("height")], r = Math.min(n("rx", n("ry", 0)), w / 2, h / 2);
  if (!r) return `M${pt([x, y])}H${fmt(x + w)}V${fmt(y + h)}H${fmt(x)}Z`;
  const A = (to) => `A${fmt(r)} ${fmt(r)} 0 0 1 ${pt(to)}`;
  return `M${pt([x + r, y])}H${fmt(x + w - r)}${A([x + w, y + r])}V${fmt(y + h - r)}${A([x + w - r, y + h])}H${fmt(x + r)}${A([x, y + h - r])}V${fmt(y + r)}${A([x + r, y])}Z`;
}

// a segment's point at t, and the same segment cut to [t0, t1], as path text from its start
function at(s, t) {
  if (s.kind === "line") return lerp(s.p[0], s.p[1], t);
  if (s.kind === "cubic") { const [a, b, c, d] = s.p, u = 1 - t; return [0, 1].map((k) => u * u * u * a[k] + 3 * u * u * t * b[k] + 3 * u * t * t * c[k] + t * t * t * d[k]); }
  const { rx, ry, deg, c, th0, dth } = s.arc, th = th0 + dth * t, f = (deg * Math.PI) / 180;
  return [c[0] + rx * Math.cos(f) * Math.cos(th) - ry * Math.sin(f) * Math.sin(th), c[1] + rx * Math.sin(f) * Math.cos(th) + ry * Math.cos(f) * Math.sin(th)];
}
/**
 * A control point next to a kept anchor, at frac of its handle's length, moved to a quarter-grid point whose
 * direction from the anchor is within TURN of the handle's: the anchor's join stays smooth (under 4° with the
 * other side untouched). The nearest such length wins; with none, the anchor itself (no handle).
 */
const TURN = 2;
function alongHandle(anchor, control, frac) {
  const v = sub(control, anchor), L = len(v) * frac;
  if (L < 1e-9) return anchor;
  const u = mul(v, 1 / len(v)), n = Math.ceil((1.5 * L) / STEP) + 1;
  let best = null, score = Infinity;
  for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) {
    const w = [i * STEP, j * STEP], l = len(w);
    if (l < 0.5 * L || l > 1.5 * L || !l) continue;
    const turn = (Math.acos(Math.max(-1, Math.min(1, (w[0] * u[0] + w[1] * u[1]) / l))) * 180) / Math.PI;
    if (turn > TURN) continue;
    const sc = Math.abs(l - L) + turn * 0.1;
    if (sc < score) { score = sc; best = w; }
  }
  return best ? add(anchor, best) : anchor;
}
/** The quarter-grid point nearest q that the halo leaves clear. */
function outward(q, inside) {
  const base = q.map((n) => Math.floor(n / STEP) * STEP), cands = [];
  for (let i = -1; i <= 2; i++) for (let j = -1; j <= 2; j++) cands.push([base[0] + i * STEP, base[1] + j * STEP]);
  return cands.filter((c) => inside(c) >= -1e-9).sort((a, b) => len(sub(a, q)) - len(sub(b, q)))[0];
}
/** The tightest radius a cut cubic may keep, in grid units: one stroke's (BEND), set by `cut` for the pass it runs. */
let minRadius = 0;
const calm = (P0, c1, c2, P1) => {
  const seg = segments(`M${pt(P0)}C${pt(c1)} ${pt(c2)} ${pt(P1)}`)[0].segs[0] ?? { kind: "line" }, n = inflections(seg), b = tightest(seg);
  return !(n > 1 || (n && len(sub(P1, P0)) < 4)) && !(b && b.r < minRadius - 1e-9);
};
/**
 * A cubic's text; one whose snapped handles make it wobble (two inflections, or one under a chord of 4) or bend
 * tighter than a stroke's radius is mended at its cut ends: the nearest quarter-grid handles within a unit that
 * are calm, else no handle at that end. A last piece no handles can calm, a crumb of arc between a kept axis point and
 * its snapped cut end, is dropped: the run ends at the axis point, a little short of the halo.
 */
function cubicText(P0, c1, c2, P1, cutStart, cutEnd) {
  if (!calm(P0, c1, c2, P1)) {
    // a cut end's handle goes anywhere near; a kept anchor's keeps its direction within TURN, so the join stays smooth
    const near = (c, anchor, cut) => {
      const out = [], u = sub(c, anchor);
      for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) {
        const q = [c[0] + i * STEP, c[1] + j * STEP], w = sub(q, anchor);
        if (!cut && (!len(w) || !len(u) || angle(u, w) > TURN)) continue;
        out.push(q);
      }
      return out.sort((a, b) => len(sub(a, c)) - len(sub(b, c)));
    };
    let best = null, score = Infinity;
    for (const a of near(c1, P0, cutStart)) for (const b of near(c2, P1, cutEnd)) {
      const sc = len(sub(a, c1)) + len(sub(b, c2));
      if (sc < score && calm(P0, a, b, P1)) { best = [a, b]; score = sc; }
    }
    if (best) [c1, c2] = best;
    else if (cutEnd && !cutStart) return "";
    else { if (cutStart) c1 = P0; if (cutEnd) c2 = P1; }
  }
  return `C${pt(c1)} ${pt(c2)} ${pt(P1)}`;
}
function piece(s, t0, t1, ends) {
  // ends: [start, end], snapped; a kept original anchor stays where it was
  const [P0, P1] = ends;
  if (s.kind === "line") return `L${pt(P1)}`;
  if (s.kind === "cubic") {
    // de Casteljau: the cubic between t0 and t1; a control beside an original anchor keeps its direction
    const split = (p, t) => { const [a, b, c, d] = p, ab = lerp(a, b, t), bc = lerp(b, c, t), cd = lerp(c, d, t), abc = lerp(ab, bc, t), bcd = lerp(bc, cd, t), m = lerp(abc, bcd, t); return [[a, ab, abc, m], [m, bcd, cd, d]]; };
    let q = s.p;
    if (t1 < 1) q = split(q, t1)[0];
    if (t0 > 0) q = split(q, t0 / t1)[1];
    if (t0 === 0 && t1 === 1 && onGrid(s.p[1]) && onGrid(s.p[2])) return `C${pt(s.p[1])} ${pt(s.p[2])} ${pt(P1)}`;
    const c1 = t0 === 0 ? alongHandle(s.p[0], s.p[1], len(sub(q[1], q[0])) / (len(sub(s.p[1], s.p[0])) || 1)) : q[1].map(snap);
    const c2 = t1 === 1 ? alongHandle(s.p[3], s.p[2], len(sub(q[2], q[3])) / (len(sub(s.p[2], s.p[3])) || 1)) : q[2].map(snap);
    return cubicText(P0, c1, c2, P1, t0 > 0, t1 < 1);
  }
  const { rx, ry, deg, sweep, dth } = s.arc;
  if (t0 === 0 && t1 === 1) return `A${fmt(rx)} ${fmt(ry)} ${fmt(deg)} ${Math.abs(dth) > Math.PI ? 1 : 0} ${sweep} ${pt(P1)}`;
  // a cut arc: its snapped end is off the ellipse. It is split where it crosses an axis (a point on the grid when
  // the ellipse is), each part with both ends on it stays an arc, and the part at the cut end goes as one cubic,
  // its handle at the other end along the arc's tangent there, so the join does not turn
  const ts = [t0];
  for (let j = Math.ceil((s.arc.th0 + dth * Math.min(t0, t1)) / (Math.PI / 2)); ; j++) {
    // the axis crossings between t0 and t1, in the direction drawn
    const t = ((j * Math.PI) / 2 - s.arc.th0) / dth;
    if (!(t > t0 + 1e-9 && t < t1 - 1e-9)) { if (dth > 0 ? t >= t1 : t <= t0) break; if (j > 100) break; continue; }
    if (onGrid(at(s, t))) ts.push(t);
  }
  ts.push(t1);
  ts.sort((x, y) => x - y);
  const tangent = (t) => { const e = 1e-6; return mul(sub(at(s, t + e), at(s, t - e)), 1 / (2 * e * dth)); };
  let d = "";
  for (let i = 0; i + 1 < ts.length; i++) {
    const a = ts[i], b = ts[i + 1], cutA = i === 0 && a > 0, cutB = i + 2 === ts.length && b < 1;
    const A = i === 0 ? P0 : at(s, a).map(snap), B = i + 2 === ts.length ? P1 : at(s, b).map(snap);
    if (len(sub(A, B)) < 1e-9) continue;
    if (!cutA && !cutB) { d += `A${fmt(rx)} ${fmt(ry)} ${fmt(deg)} 0 ${sweep} ${pt(B)}`; continue; }
    const k = (4 / 3) * Math.tan((dth * (b - a)) / 4);
    const c1 = add(at(s, a), mul(tangent(a), k)), c2 = sub(at(s, b), mul(tangent(b), k));
    d += cubicText(A, cutA ? c1.map(snap) : alongHandle(A, c1, 1), cutB ? c2.map(snap) : alongHandle(B, c2, 1), B, cutA, cutB);
  }
  return d;
}
const arcLength = (s, t0, t1) => { let L = 0, prev = at(s, t0); for (let i = 1; i <= 16; i++) { const q = at(s, t0 + ((t1 - t0) * i) / 16); L += len(sub(q, prev)); prev = q; } return L; };

/**
 * A path's d cut by a halo: what lies outside it, as a d of open runs, or "" when nothing is left, or null
 * when the halo does not touch it. A closed subpath cut once becomes one run, from where it leaves the halo
 * round to where it enters. Runs shorter than CRUMB are dropped.
 */
export function cut(d, { inside, minR = 0 }) {
  minRadius = minR;
  const subs = segments(d);
  let touched = false;
  const runs = [];
  for (const { segs, closed, start } of subs) {
    // a dot (a subpath of no length, drawn by its round cap): kept whole or dropped whole
    if (!segs.length) { if (inside(start) < 0) touched = true; else runs.push({ dot: start }); continue; }
    // each segment's stretches outside the halo, as [t0, t1]
    const outs = segs.map((s) => {
      const ts = [];
      let prev = inside(at(s, 0)) >= 0;
      if (!prev) touched = true;
      let start = prev ? 0 : null;
      for (let i = 1; i <= SAMPLES; i++) {
        const t = i / SAMPLES, now = inside(at(s, t)) >= 0;
        if (now !== prev) {
          touched = true;
          let lo = (i - 1) / SAMPLES, hi = t;
          for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; ((inside(at(s, m)) >= 0) === prev ? (lo = m) : (hi = m)); }
          const x = (lo + hi) / 2;
          if (now) start = x; else { ts.push([start, x]); start = null; }
          prev = now;
        }
      }
      if (prev) ts.push([start, 1]);
      return ts;
    });
    // the pieces in drawing order; a closed subpath begins where it first leaves the halo
    let pieces = segs.flatMap((s, i) => outs[i].map(([t0, t1]) => ({ s, i, t0, t1 })));
    if (closed && pieces.length) {
      const k = pieces.findIndex((p) => p.t0 > 0);
      if (k > 0) pieces = [...pieces.slice(k), ...pieces.slice(0, k)];
    }
    let run = null;
    for (const p of pieces) {
      const joined = run && run.last.t1 === 1 && p.t0 === 0 && (p.i === (run.last.i + 1) % segs.length);
      if (!joined) { run = { list: [], last: null }; runs.push(run); }
      run.list.push(p); run.last = p;
    }
  }
  if (!touched) return null;
  const out = [];
  for (const { list, dot } of runs) {
    if (dot) { out.push(`M${pt(dot)}h0`); continue; }
    // a sliver at either end of a run, where it leaves the halo, goes: its handles would loop on the grid
    while (list.length > 1 && arcLength(list[0].s, list[0].t0, list[0].t1) < CRUMB && list[0].t0 > 0) list.shift();
    while (list.length > 1 && arcLength(list.at(-1).s, list.at(-1).t0, list.at(-1).t1) < CRUMB && list.at(-1).t1 < 1) list.pop();
    if (list.reduce((L, p) => L + arcLength(p.s, p.t0, p.t1), 0) < CRUMB) continue;
    const endOf = (p, t) => (t === 0 ? p.s.p[0] : t === 1 ? p.s.p.at(-1) : outward(at(p.s, t), inside));
    let d0 = `M${pt(endOf(list[0], list[0].t0))}`;
    for (const p of list) d0 += piece(p.s, p.t0, p.t1, [endOf(p, p.t0), endOf(p, p.t1)]);
    out.push(d0);
  }
  return out.join("");
}

/** The modifier's elements, as { tag, attrs } with data-modifier set. */
export function glyph(G, kind, { corner = "br", solid = false } = {}) {
  const p = preset(G), filled = p.finish === "filled", s = ownStroke(G);
  const { c, half } = placement(G, kind, corner), [cx, cy] = c;
  const mark = { "data-modifier": kind, ...(filled ? {} : solid ? {} : { "stroke-opacity": String(OPACITY) }) };
  const P = (...xy) => { const o = []; for (let i = 0; i < xy.length; i += 2) o.push(pt([snap(xy[i]), snap(xy[i + 1])])); return o; };
  if (kind === "dot") return [{ tag: "circle", attrs: { cx: fmt(cx), cy: fmt(cy), r: fmt(half), fill: filled ? PALETTE.line : "currentColor", stroke: "none", "data-modifier": kind } }];
  if (kind === "slash") { const [a, b] = slashEnds(G); return [{ tag: "path", attrs: { d: `M${pt(a)}L${pt(b)}`, ...(filled ? { "stroke-width": String(s) } : {}), ...mark } }]; }
  const out = [];
  // the glyph's half-extent: the box less half a stroke; at 48 inside a paper circle, half that circle's
  let h = half - inset(G);
  if (filled && kind.startsWith("badge")) {
    out.push({ tag: "circle", attrs: { cx: fmt(cx), cy: fmt(cy), r: fmt(h), fill: PALETTE.paper, "stroke-width": String(s), ...mark } });
    h = snap(h / 2);
  }
  const k = snap((h * 2) / 3);
  let d;
  if (kind === "badge:plus") { const [a, b, e, f] = P(cx - h, cy, cx + h, cy, cx, cy - h, cx, cy + h); d = `M${a}H${b.split(" ")[0]}M${e}V${f.split(" ")[1]}`; }
  else if (kind === "badge:minus") { const [a, b] = P(cx - h, cy, cx + h, cy); d = `M${a}H${b.split(" ")[0]}`; }
  else if (kind === "badge:x") { const [a, b, e, f] = P(cx - h, cy - h, cx + h, cy + h, cx + h, cy - h, cx - h, cy + h); d = `M${a}L${b}M${e}L${f}`; }
  else if (kind === "badge:check") { const [a, b, e] = P(cx - h, cy, cx - h / 3, cy + k, cx + h, cy - k); d = `M${a}L${b}L${e}`; }
  else if (kind.startsWith("arrow")) {
    const turn = { up: 0, right: 90, down: 180, left: 270 }[kind.split(":")[1]], r = (turn * Math.PI) / 180;
    const T = (x, y) => [cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)];
    const [a, b, e, f, g] = P(...T(0, h), ...T(0, -h), ...T(-k, -h + k), ...T(0, -h), ...T(k, -h + k));
    d = `M${a}L${b}M${e}L${f}L${g}`;
  } else {
    // lock: a cased body over the lower part of the box, a shackle above it
    const bw = 2 * h, bh = snap(h * 1.2), top = cy + h - bh, sr = snap(h * 0.55);
    out.push({ tag: "rect", attrs: { x: fmt(snap(cx - h)), y: fmt(snap(top)), width: fmt(bw), height: fmt(bh), rx: fmt(G === 48 ? 2.5 : 1), ...(filled ? { fill: PALETTE.paper, "stroke-width": String(s) } : {}), ...mark } });
    const [a, b] = P(cx - sr, top, cx + sr, top);
    d = `M${a}V${fmt(snap(cy - h + sr))}A${fmt(sr)} ${fmt(sr)} 0 0 1 ${b.split(" ")[0]} ${fmt(snap(cy - h + sr))}V${b.split(" ")[1]}`;
  }
  out.push({ tag: "path", attrs: { d, ...mark } });
  return out;
}

/**
 * The icon with the modifier added, as text. Bodies the halo crosses are split, strokes it crosses are cut,
 * the modifier is appended. Refuses an icon that already has one, and anything check.mjs's text rules, gap or
 * live reject.
 */
export async function addModifier(text, kind, { corner = "br", solid = false, name = "icon" } = {}) {
  const parsed = parse(text), G = gridOf(parsed.attrs);
  if (G === null) refuse("no viewBox of a grid");
  const { textChecks } = await import("./check.mjs");
  const before = textChecks(name, text, G).failures;
  if (before.length) refuse(`it fails check before the modifier; fix it first:\n${before.map((f) => `${f.rule}  ${f.icon}  ${f.got} → ${f.want}`).join("\n")}`);
  if (parsed.elements.some(isModifier)) refuse("it has a modifier already: one per icon");
  if (kind === "slash" && corner !== "br") refuse("--corner: a slash crosses the whole icon");
  const H = { ...halo(G, kind, corner), minR: BEND * preset(G).stroke }, rootStroke = parsed.attrs.stroke;
  const strokes = (el) => !isNone(el.attrs.stroke ?? rootStroke);
  const paints = (el) => el.attrs.fill !== undefined && !isNone(el.attrs.fill);
  const out = [];
  for (const el of parsed.elements) {
    if (!strokes(el)) { out.push(el); continue; }
    const rest = Object.fromEntries(Object.entries(el.attrs).filter(([k]) => !["x", "y", "width", "height", "rx", "ry", "cx", "cy", "r", "x1", "y1", "x2", "y2", "d", "fill", "fill-opacity"].includes(k)));
    const d = cut(asPath(el), H);
    if (d === null) { out.push(el); continue; }
    if (d === "" && paints(el)) refuse(`${el.at} lies under the ${kind}'s halo: try another --corner, or move the body`);
    if (paints(el)) {
      // a body: its paint whole, then its contour cut (the filled finish draws them apart already)
      if (!isClosed(el)) refuse(`${el.at} is filled and open: close it before a modifier`);
      out.push({ tag: el.tag, attrs: { ...el.attrs, stroke: "none" } });
    }
    // every stroke the halo cut is marked: "split" when its paint is just before it, empty otherwise
    if (d) out.push({ tag: "path", attrs: { d, ...rest, "data-cut": paints(el) ? "split" : "" } });
  }
  out.push(...glyph(G, kind, { corner, solid }));
  // one element a line, as the icons are written
  const result = compose(parsed.attrs, out).replace(/ \/><(?!\/svg>)/g, " />\n  <").replace(/^(<svg[^>]*>)/, "$1\n  ").replace(/<\/svg>$/, "\n</svg>");
  const failures = textChecks(name, result, G).failures;
  // gap and live are measured: a cut can leave a stub nearer a body than a stroke. Without the
  // rasteriser they wait for check.mjs, which says "not measured".
  const { measuredChecks } = await import("./measure.mjs"), { NO_RASTER } = await import("./raster.mjs");
  if (!failures.length) {
    try {
      failures.push(...(await measuredChecks([{ name, text: result }], G)).failures.filter((f) => f.rule === "gap" || f.rule === "live"));
    } catch (e) { if (e?.code !== NO_RASTER) throw e; }
  }
  if (failures.length) refuse(`the result would fail check:\n${failures.map((f) => `${f.rule}  ${f.icon}  ${f.got} → ${f.want}`).join("\n")}\ntry another --corner or another kind`);
  return result;
}

/**
 * The modifier rule, for check.mjs: one modifier per icon, of a known kind, its size and corner from the
 * preset, stroke-opacity 0.6 or none in duotone and none at 48, and no other stroke inside its halo.
 */
export function modifierFailures(icon, parsed, G) {
  const out = [], mods = parsed.elements.filter(isModifier), p = preset(G), filled = p.finish === "filled";
  const f = (got, want) => out.push({ rule: "modifier", icon, got, want });
  for (const el of parsed.elements) if (isCut(el) && !mods.length) f(`${el.at} data-cut`, "only in an icon with a modifier");
  if (!mods.length) return out;
  const kinds = [...new Set(mods.map((el) => el.attrs["data-modifier"]))];
  if (kinds.length > 1) { f(`${kinds.length} modifiers: ${kinds.join(", ")}`, "one"); return out; }
  const kind = kinds[0];
  if (!KINDS.includes(kind)) { f(`${mods[0].at} data-modifier ${kind}`, KINDS.join(", ")); return out; }
  for (const el of mods) {
    const o = el.attrs["stroke-opacity"];
    if (o !== undefined && (filled || Number(o) !== OPACITY)) f(`${el.at} stroke-opacity ${o}`, filled ? "not set at the filled finish" : `${OPACITY}, or not set (--solid)`);
  }
  // where it sits: the corner whose box its ink centres on, and its ink's size
  let pts;
  try { pts = mods.flatMap((el) => sampleParts(el, 0.05).flat()); } catch { return out; }
  const s = kind === "dot" ? 0 : ownStroke(G);
  const x0 = Math.min(...pts.map((q) => q[0])) - s / 2, x1 = Math.max(...pts.map((q) => q[0])) + s / 2;
  const y0 = Math.min(...pts.map((q) => q[1])) - s / 2, y1 = Math.max(...pts.map((q) => q[1])) + s / 2;
  const box = Math.max(x1 - x0, y1 - y0), mid = [(x0 + x1) / 2, (y0 + y1) / 2];
  let corner = null;
  if (kind === "slash") {
    const [a, b] = slashEnds(G);
    if (mods.length !== 1 || mods[0].tag !== "path" || Math.abs(x0 + s / 2 - a[0]) > 0.3 || Math.abs(x1 - s / 2 - b[0]) > 0.3 || Math.abs(y0 + s / 2 - a[1]) > 0.3 || Math.abs(y1 - s / 2 - b[1]) > 0.3)
      f(`slash ${fmt(x0 + s / 2)}, ${fmt(y0 + s / 2)} to ${fmt(x1 - s / 2)}, ${fmt(y1 - s / 2)}`, `one line from ${pt(a)} to ${pt(b)}`);
    corner = "br";
  } else {
    const want = kind === "dot" ? 2 * MODIFIER[G].dot : MODIFIER[G].size;
    corner = CORNERS.find((k) => len(sub(placement(G, kind, k).c, mid)) <= 0.3);
    if (!corner || Math.abs(box - want) > 0.3) f(`${kind} ${fmt(box)} wide, centred at ${pt(mid)}`, `${fmt(want)} wide, in a corner of the live area: ${CORNERS.map((k) => pt(placement(G, kind, k).c)).join(" / ")}`);
  }
  if (!corner) return out;
  // the halo: every other stroke's centreline clear of it (a tenth for the snap)
  const H = halo(G, kind, corner), rootStroke = parsed.attrs.stroke;
  for (const el of parsed.elements) {
    if (isModifier(el) || isNone(el.attrs.stroke ?? rootStroke)) continue;
    let q;
    try { q = sampleParts(el, 0.05).flat(); } catch { continue; }
    const worst = Math.min(...q.map(H.inside));
    if (worst < -0.1) f(`${el.at} ${fmt(-worst)} inside ${kind}'s halo`, "clear of it: add the modifier with modifiers.mjs, which cuts the stroke");
  }
  return out;
}

export const USAGE = "usage: node modifiers.mjs <icon.svg> --add <kind> [--corner br|tr|bl|tl] [--solid] [--print]";

export function parseArgs(argv) {
  const o = { corner: "br", solid: false, print: false }, files = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--solid") o.solid = true;
    else if (a === "--print") o.print = true;
    else if (a === "--add" || a === "--corner") { const v = argv[++i]; if (v === undefined || v.startsWith("--")) return null; o[a.slice(2)] = v; }
    else if (a.startsWith("--")) return null;
    else files.push(a);
  }
  return files.length === 1 && o.add ? { file: files[0], ...o } : null;
}

export async function main(argv) {
  const args = parseArgs(argv);
  if (!args) { console.error(USAGE); process.exit(1); }
  try {
    const text = readFileSync(args.file, "utf8");
    const out = await addModifier(text, args.add, { ...args, name: args.file.replace(/^.*\/|\.svg$/g, "") });
    if (args.print) process.stdout.write(out + "\n"); else { writeFileSync(args.file, out + "\n"); console.log(`${args.file}: ${args.add}`); }
  } catch (e) {
    if (!(e instanceof ModifierError)) throw e;
    console.error(`modifiers: ${e.message}`);
    process.exit(1);
  }
}

const entry = process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (entry) main(process.argv.slice(2));
