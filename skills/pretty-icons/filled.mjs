/**
 * The filled finish: what check.mjs reads from an icon on the 48 grid beyond
 * the rules every grid shares. Five tones (presets.mjs PALETTE), no colour, no
 * offset shadow, no highlight: the light comes from the top, and the side away
 * from it is shaded inside the body. An icon's elements are told apart by paint:
 *   tone     a body's colour: closed, filled with the fill or paper tone, stroke none.
 *            Its contour follows it.
 *   shade    the side away from the light: filled with the shade tone and stroke none, or an open
 *            stroke in the shade. It sits between a tone and that tone's contour, so the line covers its edge.
 *   contour  a tone's geometry pasted, no fill: the root's line draws it, over the tone and the shade.
 *   shape    a closed element filled and drawn in one: a wheel or a cap in the line tone, a window
 *            in paper, a base in the shade.
 *   dot      a circle of r 2 or less, filled, stroke none: a hub.
 *   line     an open stroke in the line tone: a part (a hose, an arm) or a mark of weight (a needle).
 *   mark     a stroke in the mark tone: ticks, treads, a label. A detail: half a stroke from anything.
 *   core     a bar's path pasted after it, stroked in the fill or the shade tone at the root's width:
 *            the bar becomes a tube (a spoke, a rim, a stick).
 * Tone, shade, dot and core are paint: they are left out of gap and weight.
 */
import { PALETTE, preset } from "./presets.mjs";
import { parse, compose, isClosed, geometryKey, num } from "./svg.mjs";
import { straightSides, sampleParts, bounds } from "./geometry.mjs";

const SIDES = 5, DOT = 2, BAR = 3.5, CONTOUR = 2;
const TONES = new Map(Object.entries(PALETTE).map(([name, hex]) => [hex, name]));
const hex = (v) => String(v ?? "").trim().toLowerCase();
const isNone = (v) => v === undefined || hex(v) === "none";
const tone = (v) => TONES.get(hex(v));
const fail = (list, rule, icon, got, want) => list.push({ rule, icon, got, want });
const isDot = (el) => el.tag === "circle" && num(el.attrs, "r") <= DOT;

/** Each element's role, by its paint and its place. An element with a transform is a shadow, which this finish has none of. */
export function classify(elements) {
  const out = { shadows: [], tones: [], shades: [], contours: [], shapes: [], dots: [], lines: [], marks: [], cores: [], highlights: [], role: new Map() };
  const put = (el, role) => { out[role].push(el); out.role.set(el, role); };
  const open = new Map(), bars = new Set();
  for (const el of elements) {
    const a = el.attrs, fill = isNone(a.fill) ? null : tone(a.fill) ?? "other", stroke = a.stroke === undefined ? "line" : isNone(a.stroke) ? null : tone(a.stroke) ?? "other";
    if ("transform" in a) put(el, "shadows");
    else if (fill && !stroke) put(el, fill === "shade" ? "shades" : isDot(el) ? "dots" : "tones");
    else if (fill) put(el, "shapes");
    else if (stroke === "fill" || (stroke === "shade" && bars.has(geometryKey(el)))) put(el, "cores");
    else if (stroke === "shade") put(el, "shades");
    else if (stroke === "mark") put(el, "marks");
    else if (stroke === "paper") put(el, "highlights");
    else if (open.has(geometryKey(el))) { put(el, "contours"); open.delete(geometryKey(el)); }
    else put(el, "lines");
    if (out.role.get(el) === "tones") open.set(geometryKey(el), el);
    if (num(a, "stroke-width") === BAR) bars.add(geometryKey(el));
  }
  out.paint = new Set([...out.tones, ...out.shades, ...out.dots, ...out.cores]);
  out.details = out.marks;
  return out;
}

const centre = (el) => { const b = bounds(sampleParts(el, 0.25).flat()); return [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2]; };

/** The finish's own text rules: stroke, palette, construction, contour, light. Grid, radius and count are check.mjs's. */
export function filledChecks(icon, parsed, G) {
  const failures = [], root = parsed.attrs, els = parsed.elements;
  preset(G);

  if (hex(root.stroke) !== PALETTE.line) fail(failures, "stroke", icon, `stroke ${root.stroke ?? "missing"}`, `${PALETTE.line}, the line tone`);
  for (const el of els) for (const k of ["fill", "stroke"]) {
    const v = el.attrs[k];
    if (v !== undefined && !isNone(v) && !tone(v)) fail(failures, "palette", icon, `${el.at} ${k} ${v}`, `one of the five tones: ${Object.values(PALETTE).join(" ")}`);
  }

  const c = classify(els), at = (el) => els.indexOf(el);
  for (const el of c.shadows) fail(failures, "construction", icon, `${el.at} transform`, "no offset shadow: the shade sits inside the body");
  for (const el of c.highlights) fail(failures, "construction", icon, `${el.at} stroke ${el.attrs.stroke}`, "no highlight: paper only as a fill (glass, a lit lamp)");
  for (const el of els) if (tone(el.attrs.fill) === "mark") fail(failures, "construction", icon, `${el.at} fill ${el.attrs.fill}`, "the mark tone only as a stroke");
  if (els.length && ![...c.tones, ...c.shapes].some((el) => tone(el.attrs.fill) === "fill")) fail(failures, "construction", icon, "no body", `a closed element in the fill tone, ${PALETTE.fill}`);

  // a tone and its contour: the tone's geometry pasted after it, no fill
  const contourOf = new Map();
  for (const t of c.tones) {
    const k = geometryKey(t), twin = c.contours.find((x) => at(x) > at(t) && geometryKey(x) === k);
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
  // a shade sits inside a body: after its tone, before its contour, below or right of its centre
  for (const s of c.shades) {
    const t = [...contourOf.keys()].reverse().find((x) => at(x) < at(s) && at(contourOf.get(x)) > at(s));
    if (!t) { fail(failures, "construction", icon, `${s.at} shade`, "between a body's tone and its contour, so the line covers its edge"); continue; }
    try {
      const [sx, sy] = centre(s), [tx, ty] = centre(t);
      if (sy <= ty && sx <= tx) fail(failures, "light", icon, `${s.at} shade centred at ${+sx.toFixed(2)}, ${+sy.toFixed(2)}`, `below or right of ${t.at}'s centre ${+tx.toFixed(2)}, ${+ty.toFixed(2)}: the light comes from the top`);
    } catch {}
  }
  // a core is a bar's path pasted, at the root's width
  for (const k of c.cores) {
    const bar = els.find((x) => at(x) < at(k) && num(x.attrs, "stroke-width") === BAR && geometryKey(x) === geometryKey(k));
    if (!bar || "stroke-width" in k.attrs) fail(failures, "construction", icon, `${k.at} stroke ${k.attrs.stroke}`, `the fill tone as a stroke only on a core: a ${BAR} bar's path pasted after it, at the root's width`);
  }
  for (const el of [...c.tones, ...c.shapes, ...c.dots, ...c.shades.filter((x) => !isNone(x.attrs.fill))]) {
    if (!isClosed(el)) fail(failures, "construction", icon, `${el.at} fill ${el.attrs.fill}`, "a fill only on a closed element");
    if ("stroke-width" in el.attrs) fail(failures, "construction", icon, `${el.at} stroke-width ${el.attrs["stroke-width"]}`, "the root's line on a filled element; a mark or a bar is an open stroke");
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

/**
 * The icon's lines alone: no fill, no tone, shade or dot, every stroke in the line tone. What weight
 * is read from. A core is cut out of its bar by a mask: a tube weighs its two edges, as it shows.
 */
export function linesOf(text) {
  const { attrs, elements } = parse(text);
  const { paint, cores } = classify(elements);
  const lines = elements.filter((el) => !paint.has(el) && !("transform" in el.attrs) && !isNone(el.attrs.stroke ?? attrs.stroke))
    .map((el) => ({ ...el, attrs: { ...Object.fromEntries(Object.entries(el.attrs).filter(([k]) => k !== "fill" && k !== "fill-opacity")), stroke: PALETTE.line } }));
  const svg = compose({ ...attrs, stroke: PALETTE.line }, lines);
  if (!cores.length) return svg;
  const G = String(attrs.viewBox ?? "0 0 48 48").trim().split(/[\s,]+/)[2];
  const cut = compose({}, cores.map((el) => ({ ...el, attrs: { ...el.attrs, stroke: "#000" } }))).replace(/^<svg[^>]*>|<\/svg>\s*$/g, "");
  return svg.replace(/(<svg[^>]*>)([\s\S]*)(<\/svg>)/, `$1<mask id="cores" maskUnits="userSpaceOnUse" x="0" y="0" width="${G}" height="${G}"><rect width="${G}" height="${G}" fill="#fff" stroke="none" />${cut}</mask><g mask="url(#cores)">$2</g>$3`);
}
