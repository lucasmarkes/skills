/**
 * Curve quality, read from a path's commands, no pixels:
 *   join        at every anchor, the angle between the tangent arriving and the tangent leaving,
 *               including L→C, C→A and the segment Z draws: under 4° smooth, over 30° a corner on
 *               purpose, between them a kink. A join is measured where both segments are at least 1
 *               long; a shorter one is a terminal, not a join.
 *   inflection  where a cubic changes the side it bends to: at most one per segment, none in a
 *               segment whose chord is under 4. Two is a wobble.
 *   pixel       a note, never a failure: straight H and V strokes whose edges land between pixels at
 *               the display size, so they show a grey row the same stroke placed elsewhere would not.
 * Rects and circles have no joins to judge: a rect's corners are corners, its arcs meet smoothly.
 */
import { commands } from "./geometry.mjs";
import { num } from "./svg.mjs";
import { preset } from "./presets.mjs";

export const SMOOTH = 4, CORNER = 30, MIN_SEGMENT = 1, MIN_CHORD = 4;
/**
 * The sizes a duotone grid is shown at: 1× and 2×. The filled grid has none: CSS scales it to 16–64 px,
 * and at 32 (two thirds) few edges can land on whole pixels, so a note there would name nearly every icon.
 */
export const DISPLAY = { 16: [16, 32], 20: [20, 40], 24: [24, 48] };

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const len = (v) => Math.hypot(v[0], v[1]);
const cross = (u, v) => u[0] * v[1] - u[1] * v[0];
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const fmt = (n) => String(+n.toFixed(2));
/** The angle between two directions, in degrees, 0 to 180. */
export const angle = (u, v) => Math.acos(Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / (len(u) * len(v) || 1)))) * 180 / Math.PI;

const line = (p0, p1) => ({ kind: "line", p: [p0, p1], t0: sub(p1, p0), t1: sub(p1, p0), chord: len(sub(p1, p0)) });
function cubic(p0, c1, c2, p3) {
  // a handle of zero length leaves the tangent to the next control point, then to the far end
  const t0 = [sub(c1, p0), sub(c2, p0), sub(p3, p0)].find((v) => len(v) > 1e-9);
  const t1 = [sub(p3, c2), sub(p3, c1), sub(p3, p0)].find((v) => len(v) > 1e-9);
  return t0 && t1 ? { kind: "cubic", p: [p0, c1, c2, p3], t0, t1, chord: len(sub(p3, p0)) } : null;
}
function arc(p0, p1, [rx0, ry0, deg, large, sweep]) {
  let rx = Math.abs(rx0), ry = Math.abs(ry0);
  if (rx < 1e-9 || ry < 1e-9) return line(p0, p1);
  const phi = deg * Math.PI / 180, cos = Math.cos(phi), sin = Math.sin(phi);
  const dx = (p0[0] - p1[0]) / 2, dy = (p0[1] - p1[1]) / 2, x1 = cos * dx + sin * dy, y1 = -sin * dx + cos * dy;
  const L = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry);
  if (L > 1) { rx *= Math.sqrt(L); ry *= Math.sqrt(L); }
  const n = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1, den = rx * rx * y1 * y1 + ry * ry * x1 * x1;
  const k = (large === sweep ? -1 : 1) * Math.sqrt(Math.max(0, n / den));
  const cx = (k * rx * y1) / ry, cy = (-k * ry * x1) / rx;
  const th0 = Math.atan2((y1 - cy) / ry, (x1 - cx) / rx), th1 = Math.atan2((-y1 - cy) / ry, (-x1 - cx) / rx);
  const dir = (th) => { const ex = -rx * Math.sin(th), ey = ry * Math.cos(th), v = [cos * ex - sin * ey, sin * ex + cos * ey]; return sweep ? v : [-v[0], -v[1]]; };
  let dth = th1 - th0;
  if (sweep && dth < 0) dth += 2 * Math.PI; else if (!sweep && dth > 0) dth -= 2 * Math.PI;
  const c = [cos * cx - sin * cy + (p0[0] + p1[0]) / 2, sin * cx + cos * cy + (p0[1] + p1[1]) / 2];
  // the ellipse itself, for cutting: centre, radii as drawn, start angle and the angle swept (signed)
  return { kind: "arc", p: [p0, p1], t0: dir(th0), t1: dir(th1), chord: len(sub(p1, p0)), arc: { rx, ry, deg, sweep, c, th0, dth } };
}

/**
 * A path's segments, one list per subpath, each `{ kind, p, t0, t1, chord }`: p the points (a cubic's
 * four; a line's or an arc's two), t0 and t1 the directions leaving and arriving. A quadratic is read as
 * its cubic. A segment of zero length is not a segment. `closed` when the subpath ends in Z.
 */
export function segments(d) {
  const subs = [];
  let cur = null, x = 0, y = 0, sx = 0, sy = 0, prev = "", ctrl = [0, 0];
  for (const { C, rel, a } of commands(d)) {
    const X = (v) => (rel ? x + v : v), Y = (v) => (rel ? y + v : v), p0 = [x, y];
    if (C === "M") { x = X(a[0]); y = Y(a[1]); sx = x; sy = y; subs.push((cur = { segs: [], closed: false, start: [x, y] })); prev = C; continue; }
    // after Z, drawing on without a move starts a new subpath where the last one began
    if (!cur) subs.push((cur = { segs: [], closed: false, start: [x, y] }));
    let seg = null, p1;
    if (C === "C" || C === "S") {
      const c1 = C === "C" ? [X(a[0]), Y(a[1])] : "CS".includes(prev) ? [2 * x - ctrl[0], 2 * y - ctrl[1]] : p0;
      const o = C === "C" ? 2 : 0, c2 = [X(a[o]), Y(a[o + 1])];
      p1 = [X(a[o + 2]), Y(a[o + 3])]; seg = cubic(p0, c1, c2, p1); ctrl = c2;
    } else if (C === "Q" || C === "T") {
      const q = C === "Q" ? [X(a[0]), Y(a[1])] : "QT".includes(prev) ? [2 * x - ctrl[0], 2 * y - ctrl[1]] : p0;
      p1 = C === "Q" ? [X(a[2]), Y(a[3])] : [X(a[0]), Y(a[1])];
      seg = cubic(p0, lerp(p0, q, 2 / 3), lerp(p1, q, 2 / 3), p1); ctrl = q;
    } else if (C === "A") {
      p1 = [X(a[5]), Y(a[6])];
      if (len(sub(p1, p0)) > 1e-9) seg = arc(p0, p1, a);
    } else {
      p1 = C === "H" ? [X(a[0]), y] : C === "V" ? [x, Y(a[0])] : C === "Z" ? [sx, sy] : [X(a[0]), Y(a[1])];
      if (len(sub(p1, p0)) > 1e-9) seg = line(p0, p1);
    }
    if (seg) cur.segs.push(seg);
    [x, y] = p1;
    if (C === "Z") { cur.closed = true; cur = null; }
    prev = C;
  }
  return subs;
}

/** Every join of a path read by `segments`: `{ at: [x, y], angle, kind: "smooth" | "corner" | "kink" }`. */
export function joinsOf(subs) {
  const out = [];
  for (const { segs, closed } of subs) {
    const pairs = segs.slice(1).map((s, i) => [segs[i], s]);
    if (closed && segs.length > 1) pairs.push([segs.at(-1), segs[0]]);
    for (const [u, v] of pairs) {
      if (u.chord < MIN_SEGMENT || v.chord < MIN_SEGMENT) continue;
      const a = angle(u.t1, v.t0);
      out.push({ at: u.p.at(-1), angle: a, kind: a < SMOOTH ? "smooth" : a > CORNER ? "corner" : "kink" });
    }
  }
  return out;
}
export const joins = (d) => joinsOf(segments(d));

/** How many times a cubic changes the side it bends to, strictly inside it; 0 for anything else. */
export function inflections(seg) {
  if (seg.kind !== "cubic") return 0;
  const [p0, p1, p2, p3] = seg.p, a = sub(p1, p0), b = sub(p2, p1), c = sub(p3, p2);
  // B'(t)/3 = A t² + B t + a and B''(t)/6 = A t + B/2; they are parallel where k2 t² + k1 t + k0 = 0
  const A = [a[0] - 2 * b[0] + c[0], a[1] - 2 * b[1] + c[1]], B = [2 * (b[0] - a[0]), 2 * (b[1] - a[1])];
  const k2 = -cross(A, B), k1 = 2 * cross(a, A), k0 = cross(a, B), eps = 1e-9;
  let roots = [];
  if (Math.abs(k2) < eps) { if (Math.abs(k1) > eps) roots = [-k0 / k1]; }
  else {
    const disc = k1 * k1 - 4 * k2 * k0;
    // a double root touches zero curvature without crossing it: not an inflection
    if (disc > eps) roots = [(-k1 - Math.sqrt(disc)) / (2 * k2), (-k1 + Math.sqrt(disc)) / (2 * k2)];
  }
  return roots.filter((t) => t > 1e-3 && t < 1 - 1e-3).length;
}

/** The join and inflection failures of one element; a path the reader cannot read is the elements rule's, not these. */
export function curveFailures(icon, el) {
  if (el.tag !== "path") return [];
  let subs;
  try { subs = segments(el.attrs.d ?? ""); } catch { return []; }
  const out = [];
  for (const j of joinsOf(subs)) if (j.kind === "kink")
    out.push({ rule: "join", icon, got: `${el.at} ${j.angle.toFixed(1)}° at ${fmt(j.at[0])}, ${fmt(j.at[1])}`, want: `under ${SMOOTH}° or over ${CORNER}°: smooth, or a corner on purpose` });
  subs.flatMap((s) => s.segs).forEach((s, i) => {
    const n = inflections(s);
    if (n >= 2 || (n >= 1 && s.chord < MIN_CHORD))
      out.push({ rule: "inflection", icon, got: `${el.at} segment ${i + 1} ${n} inflection${n > 1 ? "s" : ""} over a chord of ${fmt(s.chord)}`, want: `at most 1, none under a chord of ${MIN_CHORD}` });
  });
  return out;
}

/** An icon's curve columns for --print: its joins by kind and its inflections, each path drawn once (a contour repeats its tone). */
export function curveColumns(elements) {
  let smooth = 0, corner = 0, kink = 0, infl = 0;
  const seen = new Set();
  for (const el of elements) {
    const d = el.tag === "path" ? el.attrs.d ?? "" : null;
    if (d === null || seen.has(d)) continue;
    seen.add(d);
    let subs;
    try { subs = segments(d); } catch { continue; }
    for (const j of joinsOf(subs)) j.kind === "smooth" ? smooth++ : j.kind === "corner" ? corner++ : kink++;
    for (const s of subs) for (const g of s.segs) infl += inflections(g);
  }
  return { joins: `${smooth} smooth · ${corner} corners${kink ? ` · ${kink} kink${kink > 1 ? "s" : ""}` : ""}`, infl };
}

/** The rows of grey a span from e0 to e1 leaves: pixels it covers by more than 0.2 and less than 0.8. */
export function greyRows(e0, e1) {
  let n = 0;
  for (let r = Math.floor(e0); r < e1; r++) {
    const cover = Math.min(e1, r + 1) - Math.max(e0, r);
    if (cover > 0.2 + 1e-9 && cover < 0.8 - 1e-9) n++;
  }
  return n;
}
/** The fewest grey rows a span this wide can leave, wherever it lands. */
export const fewestGrey = (span) => Math.min(...Array.from({ length: 64 }, (_, i) => greyRows(i / 64, i / 64 + span)));

/** Every straight horizontal or vertical stroke at least 1 long that an icon draws: `{ c, w }`, its centre across it and its width. */
export function straightStrokes(parsed, G) {
  const rootW = num(parsed.attrs, "stroke-width", preset(G).stroke), out = [];
  for (const el of parsed.elements) {
    const a = el.attrs;
    if (String(a.stroke ?? parsed.attrs.stroke ?? "none").trim().toLowerCase() === "none") continue;
    const w = num(a, "stroke-width", rootW);
    if (el.tag === "rect") {
      const x = num(a, "x", 0), y = num(a, "y", 0), wd = num(a, "width"), ht = num(a, "height"), rx = num(a, "rx", 0);
      if (ht - 2 * rx >= MIN_SEGMENT) out.push({ c: x, w }, { c: x + wd, w });
      if (wd - 2 * rx >= MIN_SEGMENT) out.push({ c: y, w }, { c: y + ht, w });
    } else if (el.tag === "line") {
      const [x1, y1, x2, y2] = ["x1", "y1", "x2", "y2"].map((k) => num(a, k, 0));
      if (x1 === x2 && Math.abs(y2 - y1) >= MIN_SEGMENT) out.push({ c: x1, w });
      else if (y1 === y2 && Math.abs(x2 - x1) >= MIN_SEGMENT) out.push({ c: y1, w });
    } else if (el.tag === "path") {
      let subs = [];
      try { subs = segments(a.d ?? ""); } catch {}
      for (const s of subs) for (const g of s.segs) {
        if (g.kind !== "line" || g.chord < MIN_SEGMENT) continue;
        const [[x0, y0], [x1, y1]] = g.p;
        if (Math.abs(x0 - x1) < 1e-9) out.push({ c: x0, w }); else if (Math.abs(y0 - y1) < 1e-9) out.push({ c: y0, w });
      }
    }
  }
  return out;
}

/** An icon's pixel note, one line for every display size it is off at, or none. */
export function pixelNotes(icon, parsed, G) {
  const sizes = DISPLAY[G] ?? [];
  if (!sizes.length) return [];
  const strokes = straightStrokes(parsed, G), off = [];
  for (const S of sizes) {
    const k = S / G;
    const n = strokes.filter(({ c, w }) => greyRows((c - w / 2) * k, (c + w / 2) * k) > fewestGrey(w * k)).length;
    if (n) off.push(off.length ? `${n} at ${S} px` : `${n} of ${strokes.length} straight strokes off the pixel at ${S} px`);
  }
  return off.length ? [{ rule: "pixel", icon, got: off.join(", "), want: "their edges on whole pixels" }] : [];
}
