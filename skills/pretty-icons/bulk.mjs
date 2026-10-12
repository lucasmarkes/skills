/**
 * The bulk finish: what check.mjs reads from an icon on the 24 grid beyond the
 * rules every grid shares. Two inks in currentColor: a body at fill-opacity .4,
 * an accent full. No contour. An element is a closed shape with a fill, or a
 * line at stroke 2 with round caps and joins declared on the element.
 *   body     closed, no stroke, fill-opacity present (.4)
 *   accent   closed with no stroke and no fill-opacity (filled), or a line
 *   line     declares stroke="currentColor" stroke-width="2", fill="none"
 * Where an accent crosses a body the body carries data-cut="knockout" and its
 * uncut geometry in data-body (knockout.mjs writes both); crossings are judged
 * on the uncut geometry. A modifier is an accent for the crossing rule only.
 */
import { num, isClosed, pathCommands } from "./svg.mjs";
import { sampleParts, inside, bounds } from "./geometry.mjs";
import { isModifier } from "./modifiers.mjs";

const fail = (list, rule, icon, got, want) => list.push({ rule, icon, got, want });
const isNone = (v) => v === undefined || String(v).trim().toLowerCase() === "none";
const ACCENT_COMMANDS = 8, MIN_SIDE = 2, MIN_LENGTH = 3, TOUCH = 0.1, STEP = 0.25, OPACITY = 0.4;
// every attribute a bulk element may carry; anything else is paint the root already gives
const ALLOWED = ["fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "fill-opacity", "d", "cx", "cy", "r", "x", "y", "width", "height", "rx", "ry", "x1", "y1", "x2", "y2", "points"];

export const isKnockout = (el) => el.attrs["data-cut"] === "knockout";
export const isLine = (el) => !isNone(el.attrs.stroke);
export const isBody = (el) => !isLine(el) && "fill-opacity" in el.attrs && isClosed(el);

/** The same element with its uncut geometry in `d`, when it carries one. */
export function uncut(el) {
  if (!isKnockout(el) || !el.attrs["data-body"]) return el;
  const { "data-body": body, "data-cut": _, ...rest } = el.attrs;
  return { ...el, attrs: { ...rest, d: body } };
}

/** Bodies, accents (everything else, a modifier too) and, among the accents, the lines. */
export function classify(parsed) {
  const els = parsed.elements;
  const accents = els.filter((el) => !isBody(el));
  return { bodies: els.filter(isBody), accents, lines: accents.filter(isLine) };
}

const parts = (el, step = STEP) => sampleParts(el, step);
/** Distance from a point to the nearest edge of any run. */
function edgeDistance([x, y], runs) {
  let best = Infinity;
  for (const run of runs) {
    for (let i = 0, j = run.length - 1; i < run.length; j = i++) {
      const [ax, ay] = run[j], [bx, by] = run[i];
      const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy;
      const t = len2 ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len2)) : 0;
      const d = Math.hypot(x - (ax + t * dx), y - (ay + t * dy));
      if (d < best) best = d;
    }
  }
  return best;
}
const within = (pt, runs) => runs.reduce((n, run) => n !== inside(pt, run), false);

/**
 * Whether an accent reaches into a body (its uncut geometry): a point of it inside the
 * body by more than TOUCH, a line passing within half its width of the edge, or a filled
 * accent that swallows a point of the body. Centrelines within TOUCH of the edge only touch.
 */
export function crosses(accent, body, step = STEP) {
  const B = parts(uncut(body), step), A = parts(accent, step);
  const half = isLine(accent) ? num(accent.attrs, "stroke-width", 2) / 2 : 0;
  let nearest = Infinity;
  for (const run of A) for (const q of run) {
    const d = edgeDistance(q, B);
    if (d < nearest) nearest = d;
    if (d > TOUCH && within(q, B)) return true;
  }
  if (half) return nearest > TOUCH && nearest < half;
  for (const run of B) for (const q of run) if (edgeDistance(q, A) > TOUCH && within(q, A)) return true;
  return false;
}

const runLength = (run) => run.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - run[i][0], q[1] - run[i][1]), 0);
export const accentLength = (el) => parts(el).reduce((t, run) => t + runLength(run), 0);
export function accentBox(el) {
  const b = bounds(parts(el).flat());
  return { w: Math.round((b.x1 - b.x0) * 100) / 100, h: Math.round((b.y1 - b.y0) * 100) / 100 };
}
export const knockoutPath = (folder, icon) => `${String(folder ?? "pretty-icons").replace(/^\.\//, "").replace(/\/$/, "")}/${icon}.svg`;

/** The text rules at bulk, on the icon's own elements (modifiers included, shadows never). */
export function bulkChecks(icon, parsed, p, { folder } = {}) {
  const failures = [], root = parsed.attrs, els = parsed.elements;
  if (root.fill !== "currentColor") fail(failures, "stroke", icon, `root fill ${root.fill ?? "missing"}`, "currentColor");
  for (const k of ["stroke", "stroke-width", "stroke-linecap", "stroke-linejoin"]) if (k in root) fail(failures, "stroke", icon, `root ${k} ${root[k]}`, "not set at bulk");
  for (const el of els) {
    const a = el.attrs, at = el.at;
    if (el.tag === "rect") { fail(failures, "radius", icon, at, "shapes.mjs squircle"); continue; }
    if ("fill" in a && a.fill !== "currentColor" && !isNone(a.fill)) fail(failures, "stroke", icon, `${at} fill ${a.fill}`, "currentColor, by the root");
    if (isLine(el)) {
      if (a.stroke !== "currentColor") fail(failures, "stroke", icon, `${at} stroke ${a.stroke}`, "currentColor");
      if (!isClosed(el) && a.fill !== "none") fail(failures, "stroke", icon, `${at} fill ${a.fill ?? "missing"}`, "none on a line");
      if (num(a, "stroke-width") !== p.stroke) fail(failures, "stroke", icon, `${at} stroke-width ${a["stroke-width"] ?? "missing"}`, `${p.stroke}`);
      for (const k of ["stroke-linecap", "stroke-linejoin"]) if (a[k] !== "round") fail(failures, "stroke", icon, `${at} ${k} ${a[k] ?? "missing"}`, "round");
      if (isClosed(el)) fail(failures, "construction", icon, `${at} fill and stroke`, "a body at .4 or an accent, no contour");
    } else {
      if (!isClosed(el)) fail(failures, "construction", icon, `${at} open and unstroked`, "a line declares stroke");
      if ("fill-opacity" in a && Number(a["fill-opacity"]) !== OPACITY) fail(failures, "construction", icon, `${at} fill-opacity ${a["fill-opacity"]}`, ".4");
    }
    if (isKnockout(el) && !isBody(el)) fail(failures, "knockout", icon, `${at} data-cut`, "only on a body");
    for (const k of Object.keys(a)) if (!ALLOWED.includes(k) && !/^(data|aria)-/.test(k)) fail(failures, "stroke", icon, `${at} ${k}`, "not set");
  }
  const { bodies, accents } = classify(parsed);
  const contoured = els.some((el) => isLine(el) && isClosed(el));
  if (!bodies.length && !contoured) fail(failures, "construction", icon, "no body", "at least one body at .4");
  // a modifier is an accent for the crossing rule only: size and count judge the rest
  const base = accents.filter((el) => !isModifier(el));
  if (!base.length) fail(failures, "construction", icon, "no accent", "at least one accent, full");
  for (const el of base) {
    if (el.tag === "rect") continue;
    if (isLine(el)) {
      const L = accentLength(el);
      if (L < MIN_LENGTH - 1e-9) fail(failures, "construction", icon, `${el.at} ${+L.toFixed(2)} long`, `a line accent no shorter than ${MIN_LENGTH}`);
    } else if (isClosed(el)) {
      const { w, h } = accentBox(el), side = Math.min(w, h);
      if (side < MIN_SIDE - 1e-9) fail(failures, "construction", icon, `${el.at} ${side} wide`, `a filled accent no side under ${MIN_SIDE}`);
    }
  }
  const drawn = base.reduce((t, el) => t + (el.tag === "path" ? pathCommands(el.attrs.d ?? "") : 1), 0);
  if (drawn > ACCENT_COMMANDS) fail(failures, "count", icon, `accents ${drawn} drawing commands`, `at most ${ACCENT_COMMANDS}`);
  // crossings: every accent against each body's uncut geometry (any body tag; knockout.mjs turns a circle into a path)
  // A body at the wrong opacity has been reported already.
  for (const body of bodies) {
    if (body.tag === "rect" || Number(body.attrs["fill-opacity"]) !== OPACITY) continue;
    const crossing = accents.filter((a) => a.tag !== "rect" && crosses(a, body));
    if (crossing.length && !isKnockout(body)) for (const a of crossing) fail(failures, "knockout", icon, `${a.at} crosses ${body.at} without a cut`, `node knockout.mjs ${knockoutPath(folder, icon)}`);
    if (!crossing.length && isKnockout(body)) fail(failures, "knockout", icon, `${body.at} cut with no crossing`, "re-run knockout.mjs");
  }
  return failures;
}
