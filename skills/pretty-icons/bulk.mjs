/**
 * The bulk finish: what check.mjs reads from an icon on the 24 grid beyond the
 * rules every grid shares. Two inks in currentColor: a body at fill-opacity .4,
 * an accent full. No contour. An element is a closed shape with a fill, or a
 * line at stroke 1.75 with round caps and joins declared on the element.
 *   body     closed, no stroke, fill-opacity present (.4)
 *   accent   closed with no stroke and no fill-opacity (filled), or a line
 *   line     declares stroke="currentColor" stroke-width="1.75", fill="none"
 * Document order is depth: a later element is in front. Two elements that overlap
 * either overprint (a line over anything, a filled accent inside a body: black
 * straight on the gray, nothing cut) or stack (a later solid over an earlier filled
 * element, partly: the one behind is cut by the front's outline grown by the
 * preset's `stack`, 0.75). knockout.mjs writes the cut, data-cut="knockout" and the
 * uncut geometry in data-body; every relation is judged on the uncut geometry.
 * A modifier, even a line, is a solid: it stacks on what lies behind it.
 */
import { num, isClosed, pathCommands, moves, ROOT_FORBIDDEN } from "./svg.mjs";
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
/** A solid stacks: a body, a filled accent, or a modifier (its lines too). */
export const isSolid = (el) => !isLine(el) || isModifier(el);

/** The same element with its uncut geometry in `d`, when it carries one. */
export function uncut(el) {
  if (!isKnockout(el) || !el.attrs["data-body"]) return el;
  const { "data-body": body, "data-cut": _, ...rest } = el.attrs;
  return { ...el, tag: "path", attrs: { ...rest, d: body } };
}

/** Bodies, accents (everything else, a modifier too) and, among the accents, the lines. */
export function classify(parsed) {
  const els = parsed.elements;
  const accents = els.filter((el) => !isBody(el));
  return { bodies: els.filter(isBody), accents, lines: accents.filter(isLine) };
}

const parts = (el, step = STEP) => sampleParts(el, step);
/** Distance from a point to the nearest edge of any run; a closed run wraps, an open one does not. */
function edgeDistance([x, y], runs, closed = true) {
  let best = Infinity;
  for (const run of runs) {
    for (let i = closed ? 0 : 1, j = closed ? run.length - 1 : 0; i < run.length; j = i++) {
      const [ax, ay] = run[j], [bx, by] = run[i];
      const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy;
      const t = len2 ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len2)) : 0;
      const d = Math.hypot(x - (ax + t * dx), y - (ay + t * dy));
      if (d < best) best = d;
    }
    if (run.length === 1) best = Math.min(best, Math.hypot(x - run[0][0], y - run[0][1]));
  }
  return best;
}
const within = (pt, runs) => runs.reduce((n, run) => n !== inside(pt, run), false);

/** An element as what it paints: its runs, and how far its paint reaches past them (half a line's width). */
function region(el, step = STEP) {
  const src = uncut(el), line = isLine(src);
  return { runs: parts(src, step), half: line ? num(src.attrs, "stroke-width", 1.75) / 2 : 0, line };
}
/** How deep a point lies in a region's paint: positive inside, negative outside. */
function depth(q, R) {
  if (R.line) return R.half - edgeDistance(q, R.runs, false);
  const d = edgeDistance(q, R.runs);
  return within(q, R.runs) ? d : -d;
}

/** Whether two elements' paint overlaps, by more than TOUCH (edges within it only touch). */
export function overlaps(a, b, step = STEP) {
  const A = region(a, step), B = region(b, step);
  for (const run of A.runs) for (const q of run) if (depth(q, B) + A.half > TOUCH) return true;
  for (const run of B.runs) for (const q of run) if (depth(q, A) + B.half > TOUCH) return true;
  return false;
}

/** Whether a's paint lies entirely inside b's (an edge may sit on b's, within TOUCH). */
export function contains(b, a, step = STEP) {
  const A = region(a, step), B = region(b, step);
  for (const run of A.runs) for (const q of run) if (depth(q, B) - A.half < -TOUCH) return false;
  return true;
}

/**
 * How a later element (front) sits on an earlier one (behind): null when apart, "overprint",
 * "stack" (behind is cut by front grown by the gap), or a refusal { got, want }.
 */
export function relate(behind, front, step = STEP) {
  if (behind.tag === "rect" || front.tag === "rect" || !overlaps(behind, front, step)) return null;
  if (!isSolid(front)) return "overprint";
  const at = uncut(front).at ?? front.at;
  if (isLine(behind) && !isModifier(behind)) return { got: `${at} over the line ${behind.at}`, want: "draw the line in front, or keep them apart" };
  if (contains(behind, front, step)) {
    if (isBody(front)) return { got: `${at} inside ${behind.at}`, want: "a gray detail vanishes: make it an accent, or a stack" };
    if (isBody(behind)) return "overprint";
    return { got: `${at} inside ${behind.at}`, want: "black on black: keep them apart, or a stack" };
  }
  if (contains(front, behind, step)) return { got: `${behind.at} hidden under ${at}`, want: "draw it in front, or keep them apart" };
  return "stack";
}

/** Every overlapping pair in document order: [{ behind, front, how }]. */
export function relations(els, step = STEP) {
  const out = [];
  for (let j = 0; j < els.length; j++) for (let i = 0; i < j; i++) {
    const how = relate(els[i], els[j], step);
    if (how) out.push({ behind: els[i], front: els[j], how });
  }
  return out;
}
/** The elements in front that cut each element, by element. */
export function cutters(els, step = STEP) {
  const by = new Map(els.map((el) => [el, []]));
  for (const r of relations(els, step)) if (r.how === "stack") by.get(r.behind).push(r.front);
  return by;
}

const runLength = (run) => run.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - run[i][0], q[1] - run[i][1]), 0);
export const accentLength = (el) => parts(uncut(el)).reduce((t, run) => t + runLength(run), 0);
export function accentBox(el) {
  const b = bounds(parts(uncut(el)).flat());
  return { w: Math.round((b.x1 - b.x0) * 100) / 100, h: Math.round((b.y1 - b.y0) * 100) / 100 };
}
export const knockoutPath = (folder, icon) => `${String(folder ?? "pretty-icons").replace(/^\.\//, "").replace(/\/$/, "")}/${icon}.svg`;

/** The text rules at bulk, on the icon's own elements (modifiers included, shadows never). */
export function bulkChecks(icon, parsed, p, { folder } = {}) {
  const failures = [], root = parsed.attrs, els = parsed.elements;
  if (root.fill !== "currentColor") fail(failures, "stroke", icon, `root fill ${root.fill ?? "missing"}`, "currentColor");
  for (const k of ["stroke", "stroke-width", "stroke-linecap", "stroke-linejoin"]) if (k in root) fail(failures, "stroke", icon, `root ${k} ${root[k]}`, "not set at bulk");
  for (const k of [...ROOT_FORBIDDEN, "stroke-dasharray"]) if (k in root) fail(failures, "stroke", icon, `root ${k}`, "not set");
  for (const el of els) {
    const a = el.attrs, at = el.at;
    if (el.tag === "rect") { fail(failures, "radius", icon, at, "shapes.mjs squircle"); continue; }
    if ("fill" in a && a.fill !== "currentColor" && !isNone(a.fill)) fail(failures, "stroke", icon, `${at} fill ${a.fill}`, "currentColor, by the root");
    if (isLine(el)) {
      if (a.stroke !== "currentColor") fail(failures, "stroke", icon, `${at} stroke ${a.stroke}`, "currentColor");
      if (!isClosed(el) && a.fill !== "none") fail(failures, "stroke", icon, `${at} fill ${a.fill ?? "missing"}`, "none on a line");
      if (!isClosed(el) && "fill-opacity" in a) fail(failures, "construction", icon, `${at} fill-opacity on a line`, "not set");
      if (num(a, "stroke-width") !== p.stroke) fail(failures, "stroke", icon, `${at} stroke-width ${a["stroke-width"] ?? "missing"}`, `${p.stroke}`);
      for (const k of ["stroke-linecap", "stroke-linejoin"]) if (a[k] !== "round") fail(failures, "stroke", icon, `${at} ${k} ${a[k] ?? "missing"}`, "round");
      if (isClosed(el)) fail(failures, "construction", icon, `${at} fill and stroke`, "a body at .4 or an accent, no contour");
      if (isKnockout(el)) fail(failures, "stack", icon, `${at} data-cut`, "only on a body or a filled accent");
    } else {
      if (!isClosed(el)) fail(failures, "construction", icon, `${at} open and unstroked`, "a line declares stroke");
      if ("fill-opacity" in a && Number(a["fill-opacity"]) !== OPACITY) fail(failures, "construction", icon, `${at} fill-opacity ${a["fill-opacity"]}`, ".4");
    }
    for (const k of Object.keys(a)) if (!ALLOWED.includes(k) && !/^(data|aria)-/.test(k)) fail(failures, "stroke", icon, `${at} ${k}`, "not set");
  }
  const { bodies, accents } = classify(parsed);
  const contoured = els.some((el) => isLine(el) && isClosed(el));
  if (!bodies.length && !contoured) fail(failures, "construction", icon, "no body", "at least one body at .4");
  // a modifier is judged by modifiers.mjs: size and count judge the rest
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
  // a line counts its drawing commands; a filled accent (a squircle, a pill, a circle) one a subpath
  const dOf = (el) => uncut(el).attrs.d ?? "";
  const drawn = base.reduce((t, el) => t + (el.tag !== "path" ? 1 : isLine(el) ? pathCommands(dOf(el)) - moves(dOf(el)) : moves(dOf(el))), 0);
  if (drawn > ACCENT_COMMANDS) fail(failures, "count", icon, `accents ${drawn} drawing commands`, `at most ${ACCENT_COMMANDS}`);
  // depth: every pair in document order, on the uncut geometry. A body at the wrong opacity has been reported already.
  const judged = els.filter((el) => el.tag !== "rect" && !(isBody(el) && Number(el.attrs["fill-opacity"]) !== OPACITY));
  let rel;
  try { rel = relations(judged); } catch { return failures; }
  for (const r of rel) if (typeof r.how === "object") fail(failures, "stack", icon, r.how.got, r.how.want);
  const by = new Map(judged.map((el) => [el, []]));
  for (const r of rel) if (r.how === "stack") by.get(r.behind).push(r.front);
  for (const [el, fronts] of by) {
    if (isLine(el)) continue;
    if (fronts.length && !isKnockout(el)) for (const f of fronts) fail(failures, "stack", icon, `${f.at} overlaps ${el.at} without a cut`, `node knockout.mjs ${knockoutPath(folder, icon)}`);
    if (!fronts.length && isKnockout(el)) fail(failures, "stack", icon, `${el.at} cut with no overlap`, "re-run knockout.mjs");
  }
  return failures;
}
