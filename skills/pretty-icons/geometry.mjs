/**
 * Centrelines as points. check.mjs measures ink from pixels; what it needs
 * from geometry is only where each element's stroke runs, to tell a shared
 * edge from an "almost" gap. Curves are flattened, arcs are converted the
 * SVG way (endpoint to centre), and everything comes back as [x, y] samples
 * about `step` apart.
 */
const n = (a, k, d = 0) => { const v = Number(a[k]); return Number.isNaN(v) || a[k] === undefined ? d : v; };

export function bounds(points) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of points) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return { x0, y0, x1, y1 };
}

export function minDistance(A, B) {
  let best = Infinity;
  for (const [ax, ay] of A) for (const [bx, by] of B) { const d = Math.hypot(ax - bx, ay - by); if (d < best) best = d; }
  return best;
}

function segment(out, x0, y0, x1, y1, step) {
  const len = Math.hypot(x1 - x0, y1 - y0), k = Math.max(1, Math.ceil(len / step));
  for (let i = 1; i <= k; i++) out.push([x0 + (x1 - x0) * i / k, y0 + (y1 - y0) * i / k]);
}

function cubic(out, p0, p1, p2, p3, step) {
  // By the control polygon, which bounds the curve's length: a looped or nearly closed curve has a short chord.
  const poly = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) + Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) + Math.hypot(p3[0] - p2[0], p3[1] - p2[1]);
  const k = Math.max(4, Math.ceil(poly / step) * 2);
  for (let i = 1; i <= k; i++) {
    const t = i / k, u = 1 - t;
    out.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]);
  }
}

/** SVG arc, endpoint form to centre form, then sampled. */
function arc(out, x0, y0, rx, ry, rot, large, sweep, x1, y1, step) {
  if (rx === 0 || ry === 0) return segment(out, x0, y0, x1, y1, step);
  const phi = rot * Math.PI / 180, cos = Math.cos(phi), sin = Math.sin(phi);
  const dx = (x0 - x1) / 2, dy = (y0 - y1) / 2;
  const x1p = cos * dx + sin * dy, y1p = -sin * dx + cos * dy;
  rx = Math.abs(rx); ry = Math.abs(ry);
  const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lambda > 1) { rx *= Math.sqrt(lambda); ry *= Math.sqrt(lambda); }
  const sign = large === sweep ? -1 : 1;
  const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
  const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
  const coef = sign * Math.sqrt(Math.max(0, num / den));
  const cxp = coef * (rx * y1p / ry), cyp = coef * (-ry * x1p / rx);
  const cx = cos * cxp - sin * cyp + (x0 + x1) / 2, cy = sin * cxp + cos * cyp + (y0 + y1) / 2;
  const ang = (ux, uy, vx, vy) => { const a = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy); return a; };
  const t0 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
  let dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
  if (!sweep && dt > 0) dt -= 2 * Math.PI; else if (sweep && dt < 0) dt += 2 * Math.PI;
  const k = Math.max(4, Math.ceil(Math.abs(dt) * Math.max(rx, ry) / step));
  for (let i = 1; i <= k; i++) {
    const t = t0 + dt * i / k, ex = rx * Math.cos(t), ey = ry * Math.sin(t);
    out.push([cos * ex - sin * ey + cx, sin * ex + cos * ey + cy]);
  }
}

const TOKENS = /[a-zA-Z]|-?\d*\.?\d+(?:[eE][-+]?\d+)?/g;
const ARGS = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };

/**
 * A path's commands, one at a time, as `{ C, rel, a }`: the command upper-cased, whether it was
 * relative, and its numbers. Implicit repeats come out as commands of their own (after M, an L).
 */
function* commands(d) {
  const toks = d.match(TOKENS) ?? [];
  let i = 0, cmd = "";
  const next = () => Number(toks[i++]);
  // Arc flags are one character each, so optimisers write "0 012 2" for "0 0 1 2 2": peel the flag off the token.
  const flag = () => {
    const t = toks[i];
    if (t === undefined || (t[0] !== "0" && t[0] !== "1")) { i++; return NaN; }
    if (t.length === 1) i++; else toks[i] = t.slice(1);
    return Number(t[0]);
  };
  while (i < toks.length) {
    const start = i;
    if (/[a-zA-Z]/.test(toks[i])) cmd = toks[i++];
    // Numbers after a command repeat it; after M they mean L, and after Z (as browsers do) an L from the subpath start.
    else if (cmd === "M" || cmd === "Z") cmd = "L"; else if (cmd === "m" || cmd === "z") cmd = "l";
    const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
    if (!(C in ARGS)) throw new Error(`d: unknown command "${cmd}"`);
    const a = C === "A" ? [next(), next(), next(), flag(), flag(), next(), next()] : Array.from({ length: ARGS[C] }, next);
    // A missing or non-numeric argument ends the path here, as a renderer would; also never spin in place.
    if (a.some(Number.isNaN) || i === start) return;
    yield { C, rel, a };
  }
}

/** Where each command ends, by its last two numbers (H and V by one); Z returns to the subpath's start. */
const END = { M: 0, L: 0, T: 0, S: 2, Q: 2, C: 4, A: 5 };

/**
 * The straight sides a path draws: every L, H and V (implicit repeats included), and a Z that
 * closes with a segment of its own. A side of zero length is not a side.
 */
export function straightSides(d) {
  let x = 0, y = 0, sx = 0, sy = 0, n = 0;
  for (const { C, rel, a } of commands(d)) {
    let nx = x, ny = y;
    if (C === "H") nx = rel ? x + a[0] : a[0];
    else if (C === "V") ny = rel ? y + a[0] : a[0];
    else if (C === "Z") { nx = sx; ny = sy; }
    else { const k = END[C]; nx = rel ? x + a[k] : a[k]; ny = rel ? y + a[k + 1] : a[k + 1]; }
    if ("LHVZ".includes(C) && Math.hypot(nx - x, ny - y) > 1e-9) n++;
    x = nx; y = ny;
    if (C === "M") { sx = x; sy = y; }
  }
  return n;
}

/** A path's centreline as one point list per subpath: a new one starts at each M or m. */
export function pathParts(d, step = 0.1) {
  const parts = [];
  let part = null;
  // Points go to the current subpath; a path that does not open with M still gets one.
  const out = { push: (p) => { if (!part) parts.push(part = []); part.push(p); } };
  let x = 0, y = 0, sx = 0, sy = 0, px = 0, py = 0, prev = "";
  for (const { C, rel, a } of commands(d)) {
    const X = (v) => (rel ? x + v : v), Y = (v) => (rel ? y + v : v);
    switch (C) {
      case "M": x = X(a[0]); y = Y(a[1]); sx = x; sy = y; parts.push(part = [[x, y]]); break;
      case "L": segment(out, x, y, X(a[0]), Y(a[1]), step); x = X(a[0]); y = Y(a[1]); break;
      case "H": segment(out, x, y, X(a[0]), y, step); x = X(a[0]); break;
      case "V": segment(out, x, y, x, Y(a[0]), step); y = Y(a[0]); break;
      case "C": cubic(out, [x, y], [X(a[0]), Y(a[1])], [X(a[2]), Y(a[3])], [X(a[4]), Y(a[5])], step); px = X(a[2]); py = Y(a[3]); x = X(a[4]); y = Y(a[5]); break;
      case "S": { const r = /[CS]/.test(prev) ? [2 * x - px, 2 * y - py] : [x, y]; cubic(out, [x, y], r, [X(a[0]), Y(a[1])], [X(a[2]), Y(a[3])], step); px = X(a[0]); py = Y(a[1]); x = X(a[2]); y = Y(a[3]); break; }
      case "Q": { const q1 = [X(a[0]), Y(a[1])], q2 = [X(a[2]), Y(a[3])]; cubic(out, [x, y], [x + 2 / 3 * (q1[0] - x), y + 2 / 3 * (q1[1] - y)], [q2[0] + 2 / 3 * (q1[0] - q2[0]), q2[1] + 2 / 3 * (q1[1] - q2[1])], q2, step); px = q1[0]; py = q1[1]; x = q2[0]; y = q2[1]; break; }
      case "T": { const q1 = /[QT]/.test(prev) ? [2 * x - px, 2 * y - py] : [x, y], q2 = [X(a[0]), Y(a[1])]; cubic(out, [x, y], [x + 2 / 3 * (q1[0] - x), y + 2 / 3 * (q1[1] - y)], [q2[0] + 2 / 3 * (q1[0] - q2[0]), q2[1] + 2 / 3 * (q1[1] - q2[1])], q2, step); px = q1[0]; py = q1[1]; x = q2[0]; y = q2[1]; break; }
      case "A": arc(out, x, y, a[0], a[1], a[2], a[3] !== 0, a[4] !== 0, X(a[5]), Y(a[6]), step); x = X(a[5]); y = Y(a[6]); break;
      case "Z": segment(out, x, y, sx, sy, step); x = sx; y = sy; break;
    }
    prev = C;
  }
  return parts;
}

export const pathPoints = (d, step = 0.1) => pathParts(d, step).flat();

export function sample(el, step = 0.1) {
  const a = el.attrs;
  switch (el.tag) {
    case "line": { const o = [[n(a, "x1"), n(a, "y1")]]; segment(o, n(a, "x1"), n(a, "y1"), n(a, "x2"), n(a, "y2"), step); return o; }
    case "circle": { const cx = n(a, "cx"), cy = n(a, "cy"), r = n(a, "r"), k = Math.max(16, Math.ceil(2 * Math.PI * r / step)); return Array.from({ length: k + 1 }, (_, i) => [cx + r * Math.cos(2 * Math.PI * i / k), cy + r * Math.sin(2 * Math.PI * i / k)]); }
    case "rect": {
      const x = n(a, "x"), y = n(a, "y"), w = n(a, "width"), h = n(a, "height"), rx = Math.min(n(a, "rx", n(a, "ry")), w / 2), ry = Math.min(n(a, "ry", rx), h / 2);
      const d = rx > 0
        ? `M${x + rx} ${y}H${x + w - rx}A${rx} ${ry} 0 0 1 ${x + w} ${y + ry}V${y + h - ry}A${rx} ${ry} 0 0 1 ${x + w - rx} ${y + h}H${x + rx}A${rx} ${ry} 0 0 1 ${x} ${y + h - ry}V${y + ry}A${rx} ${ry} 0 0 1 ${x + rx} ${y}Z`
        : `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
      return pathPoints(d, step);
    }
    case "path": return pathPoints(a.d ?? "", step);
    default: throw new Error(`geometry: no sampler for <${el.tag}>`);
  }
}

/** An element's centreline in parts: a path's subpaths, or the whole of any other element. */
export const sampleParts = (el, step = 0.1) => (el.tag === "path" ? pathParts(el.attrs.d ?? "", step) : [sample(el, step)]);
