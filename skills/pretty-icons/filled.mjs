/**
 * The filled finish: what check.mjs reads from an icon on the 48 grid beyond
 * the rules every grid shares. An icon is a shadow, one or more bodies, details
 * and parts, told apart by paint alone:
 *   shadow   the first element: a body's geometry moved by the preset's offset, filled with the
 *            body's shade, no stroke. The one element that carries a transform.
 *   body     a closed element filled with a palette fill; its contour is the root's ink.
 *   detail   what is on the object: a stroke in a shade or in paper with no fill, or a dot filled
 *            with a shade and no stroke. One detail in paper is the highlight.
 *   part     what is of the object but not on it (a stem, a handle): no fill, the root's ink.
 * It also makes the two texts the measured rules read: the object without its
 * shadow (keyline, gravity) and its lines alone (weight).
 */
import { PALETTE, preset } from "./presets.mjs";
import { parse, compose, isClosed, geometryKey } from "./svg.mjs";
import { straightSides } from "./geometry.mjs";

const SIDES = 5;
const pairs = Object.entries(PALETTE).filter(([, v]) => Array.isArray(v));
export const FILLS = new Map(pairs.map(([name, [fill, shade]]) => [fill, { name, shade }]));
export const SHADES = new Map(pairs.map(([name, [fill, shade]]) => [shade, { name, fill }]));
const hex = (v) => String(v ?? "").trim().toLowerCase();
const isNone = (v) => v === undefined || hex(v) === "none";
const isInk = (v) => hex(v) === PALETTE.ink;
const isPaper = (v) => hex(v) === PALETTE.paper;
const inPalette = (v) => isInk(v) || isPaper(v) || FILLS.has(hex(v)) || SHADES.has(hex(v));
const fail = (list, rule, icon, got, want) => list.push({ rule, icon, got, want });

/** The elements sorted by what their paint says they are. An element with a transform is a shadow wherever it sits. */
export function classify(elements) {
  const out = { shadow: null, shadows: [], bodies: [], details: [], parts: [] };
  for (const el of elements) {
    const a = el.attrs;
    if ("transform" in a) { out.shadows.push(el); continue; }
    if (!isNone(a.fill)) { (SHADES.has(hex(a.fill)) && isNone(a.stroke) ? out.details : out.bodies).push(el); continue; }
    if (!isNone(a.stroke) && !isInk(a.stroke)) { out.details.push(el); continue; }
    out.parts.push(el);
  }
  out.shadow = out.shadows[0] ?? null;
  return out;
}

/** The finish's own text rules: stroke, palette, construction, contour. Grid, radius and count are check.mjs's. */
export function filledChecks(icon, parsed, G) {
  const failures = [], p = preset(G), root = parsed.attrs, [ox, oy] = p.shadow;
  const offset = `translate(${ox} ${oy})`;

  if (!isInk(root.stroke)) fail(failures, "stroke", icon, `stroke ${root.stroke ?? "missing"}`, `${PALETTE.ink}, the ink`);
  for (const el of parsed.elements) {
    const a = el.attrs, where = el.at;
    for (const k of ["fill", "stroke"]) if (k in a && !isNone(a[k]) && !inPalette(a[k])) fail(failures, "palette", icon, `${where} ${k} ${a[k]}`, k === "fill" ? "a palette fill, or none" : "a palette shade, paper or ink");
  }

  const c = classify(parsed.elements);
  if (c.bodies.length === 0 && parsed.elements.length > 0) fail(failures, "construction", icon, "no body", "a closed element with a palette fill");
  const keys = new Map(c.bodies.map((b) => [geometryKey(b), b]));
  if (!c.shadow && parsed.elements.length > 0) fail(failures, "construction", icon, "no shadow", `the first element: a body's geometry, transform="${offset}", its shade, stroke none`);
  for (const el of c.shadows) {
    const a = el.attrs, where = el.at;
    if (el !== parsed.elements[0]) fail(failures, "construction", icon, `${where} transform`, "only on the shadow, the first element");
    if (String(a.transform).replace(/\s+/g, " ").trim() !== offset) fail(failures, "construction", icon, `${where} transform ${a.transform}`, `transform="${offset}"`);
    if (hex(a.stroke) !== "none") fail(failures, "construction", icon, `${where} stroke ${a.stroke ?? "missing"}`, "stroke none on the shadow");
    const twin = keys.get(geometryKey(el));
    if (!twin) fail(failures, "construction", icon, `${where} shadow`, "a body's geometry, copied exactly");
    else {
      const shade = FILLS.get(hex(twin.attrs.fill))?.shade;
      if (shade && hex(a.fill) !== shade) fail(failures, "construction", icon, `${where} fill ${a.fill ?? "missing"}`, `${shade}, the shade of ${twin.at}'s fill`);
    }
  }
  for (const el of c.bodies) {
    const a = el.attrs, where = el.at;
    if (!FILLS.has(hex(a.fill))) fail(failures, "construction", icon, `${where} fill ${a.fill}`, "a palette fill on a body; a shade only on a detail with no stroke");
    if (!isNone(a.stroke) && !isInk(a.stroke)) fail(failures, "construction", icon, `${where} stroke ${a.stroke}`, "the root's ink on a body's contour");
    if (hex(a.stroke) === "none") fail(failures, "construction", icon, `${where} stroke none`, "a contour on every body");
    if (!isClosed(el)) fail(failures, "construction", icon, `${where} fill ${a.fill}`, "a body is closed; a fill on an open path draws nothing");
    if (el.tag === "path") {
      let sides = 0;
      try { sides = straightSides(a.d ?? ""); } catch {}
      if (sides > SIDES) fail(failures, "contour", icon, `${where} ${sides} straight sides`, `at most ${SIDES}, or curves`);
    }
  }
  let highlights = 0;
  for (const el of c.details) {
    const a = el.attrs, where = el.at;
    if (!isNone(a.fill) && !isNone(a.stroke)) fail(failures, "construction", icon, `${where} fill ${a.fill} stroke ${a.stroke}`, "a detail is a stroke with no fill, or a shade dot with no stroke");
    if (isPaper(a.stroke)) highlights++;
    if (isPaper(a.fill)) fail(failures, "construction", icon, `${where} fill ${a.fill}`, "paper only as a stroke, the highlight");
  }
  if (highlights > 1) fail(failures, "construction", icon, `${highlights} highlights`, "one stroke in paper");
  return failures;
}

/** The icon without its shadow: what the keyline and gravity are read from. */
export function objectOf(text) {
  const { attrs, elements } = parse(text);
  return compose(attrs, elements.filter((el) => !("transform" in el.attrs)));
}

/** The icon's lines alone: no shadow, no fill, every stroke in ink. What weight is read from. */
export function linesOf(text) {
  const { attrs, elements } = parse(text);
  const lines = elements.filter((el) => !("transform" in el.attrs) && hex(el.attrs.stroke) !== "none")
    .map((el) => ({ ...el, attrs: { ...Object.fromEntries(Object.entries(el.attrs).filter(([k]) => k !== "fill" && k !== "fill-opacity")), stroke: PALETTE.ink } }));
  return compose({ ...attrs, stroke: PALETTE.ink }, lines);
}
