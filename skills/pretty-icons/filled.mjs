/**
 * The filled finish: what check.mjs reads from an icon on the 48 grid beyond
 * the rules every grid shares. Five tones (presets.mjs PALETTE), no colour, no
 * offset shadow, no highlight: the light comes from the top, and the side away
 * from it is shaded inside the body. One line weight: the root's 1.5, and 2 on a contour.
 * An icon's elements are told apart by paint:
 *   tone     a body's colour: closed, filled with the fill or paper tone, stroke none.
 *            Its contour follows it.
 *   shade    the side away from the light: filled with the shade tone, stroke none. It sits between a
 *            tone and that tone's contour, so the line covers its edge.
 *   contour  a tone's geometry pasted, no fill, at 2: the line draws it, over the tone and the shade.
 *   shape    a closed element filled and drawn in one: glass or a hole in paper, a base in the shade.
 *   dot      a circle of r 2.5 or less, filled, stroke none: a hub, a lit lamp. The one place the line tone fills.
 *   line     an open stroke in the line tone, at the root's width: a part (a hose, a needle, a sign).
 *   mark     a stroke in the mark tone: ticks, treads, a label. A detail: half a stroke from anything.
 *   solid    refused: anything else filled in the line tone. It is a body, or a dot.
 *   painted  refused: a stroke in the fill or the shade tone.
 * Tone, shade and dot are paint: they are left out of gap and weight.
 */
import { PALETTE, preset } from "./presets.mjs";
import { parse, compose, isClosed, geometryKey, num } from "./svg.mjs";
import { straightSides, sampleParts, bounds } from "./geometry.mjs";

const SIDES = 5, DOT = 2.5, CONTOUR = 2;
const TONES = new Map(Object.entries(PALETTE).map(([name, hex]) => [hex, name]));
const hex = (v) => String(v ?? "").trim().toLowerCase();
const isNone = (v) => v === undefined || hex(v) === "none";
const tone = (v) => TONES.get(hex(v));
const fail = (list, rule, icon, got, want) => list.push({ rule, icon, got, want });
const isDot = (el) => el.tag === "circle" && num(el.attrs, "r") <= DOT;

/** Each element's role, by its paint and its place. An element with a transform is a shadow, which this finish has none of. */
export function classify(elements) {
  const out = { shadows: [], tones: [], shades: [], contours: [], shapes: [], dots: [], solids: [], lines: [], marks: [], painted: [], highlights: [], role: new Map() };
  const put = (el, role) => { out[role].push(el); out.role.set(el, role); };
  const open = new Map();
  // a modifier's cut marks every stroke it cut data-cut. "split" is a shape's line (fill and line on one element,
  // split in two), and the paint just before it is that shape; any other cut stroke at 2 is a tone's contour
  const cutLine = (el) => el && el.attrs["data-cut"] === "split";
  for (const [i, el] of elements.entries()) {
    const a = el.attrs, fill = isNone(a.fill) ? null : tone(a.fill) ?? "other", stroke = a.stroke === undefined ? "line" : isNone(a.stroke) ? null : tone(a.stroke) ?? "other";
    if ("transform" in a) put(el, "shadows");
    else if (fill && !stroke && cutLine(elements[i + 1])) put(el, "shapes");
    else if (cutLine(el)) put(el, "lines");
    else if (fill === "line" && !isDot(el)) put(el, "solids");
    else if (fill && !stroke) put(el, fill === "shade" ? "shades" : isDot(el) ? "dots" : "tones");
    else if (fill) put(el, "shapes");
    else if (stroke === "fill" || stroke === "shade") put(el, "painted");
    else if (stroke === "mark") put(el, "marks");
    else if (stroke === "paper") put(el, "highlights");
    else if ("data-cut" in a && num(a, "stroke-width") === CONTOUR) put(el, "contours");
    else if (open.has(geometryKey(el))) { put(el, "contours"); open.delete(geometryKey(el)); }
    else put(el, "lines");
    if (out.role.get(el) === "tones") open.set(geometryKey(el), el);
  }
  out.paint = new Set([...out.tones, ...out.shades, ...out.dots]);
  out.details = out.marks;
  return out;
}

const centre = (el) => { const b = bounds(sampleParts(el, 0.25).flat()); return [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2]; };

/** The finish's own text rules: stroke, palette, construction, contour, light. Grid, radius and count are check.mjs's. */
export function filledChecks(icon, parsed, G) {
  const failures = [], root = parsed.attrs, els = parsed.elements;
  const p = preset(G);

  if (hex(root.stroke) !== PALETTE.line) fail(failures, "stroke", icon, `stroke ${root.stroke ?? "missing"}`, `${PALETTE.line}, the line tone`);
  for (const el of els) for (const k of ["fill", "stroke"]) {
    const v = el.attrs[k];
    if (v !== undefined && !isNone(v) && !tone(v)) fail(failures, "palette", icon, `${el.at} ${k} ${v}`, `one of the five tones: ${Object.values(PALETTE).join(" ")}`);
  }

  const c = classify(els), at = (el) => els.indexOf(el);
  for (const el of c.shadows) fail(failures, "construction", icon, `${el.at} transform`, "no offset shadow: the shade sits inside the body");
  for (const el of c.highlights) fail(failures, "construction", icon, `${el.at} stroke ${el.attrs.stroke}`, "no highlight: paper only as a fill (glass, a lamp that is off)");
  for (const el of els) if (tone(el.attrs.fill) === "mark") fail(failures, "construction", icon, `${el.at} fill ${el.attrs.fill}`, "the mark tone only as a stroke");
  for (const el of els) {
    const s = tone(el.attrs.stroke);
    if (s === "fill" || s === "shade") fail(failures, "construction", icon, `${el.at} stroke ${el.attrs.stroke}`, `the ${s} tone only as a fill`);
  }
  for (const el of c.solids) fail(failures, "solid", icon, `${el.at}${el.tag === "circle" ? ` r ${el.attrs.r}` : ""} filled in the line tone`, `a body (tone, shade, contour), or a dot of r ≤ ${DOT}`);
  if (els.length && ![...c.tones, ...c.shapes].some((el) => tone(el.attrs.fill) === "fill")) fail(failures, "construction", icon, "no body", `a closed element in the fill tone, ${PALETTE.fill}`);

  // a tone and its contour: the tone's geometry pasted after it, no fill
  // a contour a modifier cut (data-cut) is the first unclaimed one after its tone
  const contourOf = new Map(), claimed = new Set();
  for (const t of c.tones) {
    const k = geometryKey(t), twin = c.contours.find((x) => at(x) > at(t) && geometryKey(x) === k)
      ?? c.contours.find((x) => at(x) > at(t) && "data-cut" in x.attrs && !claimed.has(x));
    if (twin) claimed.add(twin);
    if (twin) contourOf.set(t, twin);
    else fail(failures, "construction", icon, `${t.at} fill ${t.attrs.fill} stroke none`, "its contour after it: the same geometry, no fill, at 2");
  }
  // the hierarchy: a contour at 2, over the parts' line at the root's 1.5; a closed line at 2 is a contour that lost its tone
  const rootW = num(root, "stroke-width");
  for (const el of c.contours) {
    const w = num(el.attrs, "stroke-width", rootW);
    if (w !== CONTOUR) fail(failures, "stroke", icon, `${el.at} contour at ${w}`, `${CONTOUR}`);
  }
  for (const el of c.lines) if (isClosed(el) && num(el.attrs, "stroke-width", rootW) === CONTOUR)
    fail(failures, "construction", icon, `${el.at} contour without a tone`, "a tone before it with the same geometry, or the root's line");
  // one line weight: an open line or mark at 2 is a part drawn as a contour
  for (const el of [...c.lines, ...c.marks]) if (!isClosed(el) && num(el.attrs, "stroke-width", rootW) === CONTOUR)
    fail(failures, "stroke", icon, `${el.at} stroke-width ${el.attrs["stroke-width"]}`, `${p.stroke}, or ${CONTOUR} on a contour`);
  // a shade sits inside a body: after its tone, before its contour, below or right of its centre
  for (const s of c.shades) {
    const t = [...contourOf.keys()].reverse().find((x) => at(x) < at(s) && at(contourOf.get(x)) > at(s));
    if (!t) { fail(failures, "construction", icon, `${s.at} shade`, "between a body's tone and its contour, so the line covers its edge"); continue; }
    try {
      const [sx, sy] = centre(s), [tx, ty] = centre(t);
      if (sy <= ty && sx <= tx) fail(failures, "light", icon, `${s.at} shade centred at ${+sx.toFixed(2)}, ${+sy.toFixed(2)}`, `below or right of ${t.at}'s centre ${+tx.toFixed(2)}, ${+ty.toFixed(2)}: the light comes from the top`);
    } catch {}
  }
  for (const el of [...c.tones, ...c.shapes, ...c.dots, ...c.solids, ...c.shades]) {
    if (!isClosed(el)) fail(failures, "construction", icon, `${el.at} fill ${el.attrs.fill}`, "a fill only on a closed element");
    if ("stroke-width" in el.attrs) fail(failures, "construction", icon, `${el.at} stroke-width ${el.attrs["stroke-width"]}`, "the root's line on a filled element; only a contour sets a width");
  }
  for (const el of [...c.tones, ...c.shapes]) {
    if (el.tag !== "path") continue;
    let sides = 0;
    try { sides = straightSides(el.attrs.d ?? ""); } catch {}
    if (sides > SIDES) fail(failures, "contour", icon, `${el.at} ${sides} straight sides`, `at most ${SIDES}, or curves`);
  }
  return failures;
}

/** The icon as drawn, less any shadow: what the keyline and gravity are read from. */
export function objectOf(text) {
  const { attrs, elements } = parse(text);
  return compose(attrs, elements.filter((el) => !("transform" in el.attrs)));
}

/** The icon's lines alone: no fill, no tone, shade or dot, every stroke in the line tone. What weight is read from. */
export function linesOf(text) {
  const { attrs, elements } = parse(text);
  const { paint } = classify(elements);
  const lines = elements.filter((el) => !paint.has(el) && !("transform" in el.attrs) && !isNone(el.attrs.stroke ?? attrs.stroke))
    .map((el) => ({ ...el, attrs: { ...Object.fromEntries(Object.entries(el.attrs).filter(([k]) => k !== "fill" && k !== "fill-opacity")), stroke: PALETTE.line } }));
  return compose({ ...attrs, stroke: PALETTE.line }, lines);
}
