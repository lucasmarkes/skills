/**
 * The three grids pretty-icons draws on, and what each one fixes: stroke,
 * padding, fill, radii, and the four keylines an icon's ink lands on. A body
 * for a keyline is derived here, so the agent copies geometry instead of
 * inventing it: a rect's edge sits half a stroke inside the keyline, a
 * circle's radius is half the keyline less half a stroke.
 */
export const PRESETS = {
  16: { stroke: 1.5, radius: [1.5, 1], keylines: { circle: [14, 14], square: [12.5, 12.5], portrait: [11, 14], landscape: [14, 11] } },
  20: { stroke: 1.5, radius: [2, 1], keylines: { circle: [18, 18], square: [16, 16], portrait: [14, 18], landscape: [18, 14] } },
  24: { stroke: 2, radius: [2, 1], keylines: { circle: [22, 22], square: [20, 20], portrait: [18, 22], landscape: [22, 18] } },
};

export const PAD = 1;
export const FILL = 0.2;
export const KEYLINE_TOL = 0.5;
export const WEIGHT_TOL = 0.15;
// How far a set's ink may sit from the reference, however even it is with itself.
export const REFERENCE_TOL = 0.2;
export const GRAVITY_TOL = 0.5;
export const GRID_STEP = 0.25;
export const TOUCH = 0.1;
export const SCALE = 32;
export const INK_ALPHA = 0.05;
export const RADIUS_AT = 8;
export const FORMATS = ["circle", "square", "portrait", "landscape"];

export function preset(G) {
  const p = PRESETS[G];
  if (!p) throw new Error(`no preset for grid ${G}`);
  return { G, pad: PAD, fill: FILL, live: G - 2 * PAD, ...p };
}

/** The radius a shape of this size (its smaller side) takes on this grid. */
export function radiusFor(G, size) {
  const [big, small] = preset(G).radius;
  return size >= RADIUS_AT ? big : small;
}

/** The element whose ink lands exactly on a keyline. */
export function body(G, format) {
  const { stroke, keylines } = preset(G);
  const kl = keylines[format];
  if (!kl) throw new Error(`no keyline "${format}"; one of ${FORMATS.join(", ")}`);
  const [kw, kh] = kl;
  if (format === "circle") return { tag: "circle", cx: G / 2, cy: G / 2, r: kw / 2 - stroke / 2 };
  const w = kw - stroke, h = kh - stroke;
  return { tag: "rect", x: (G - kw) / 2 + stroke / 2, y: (G - kh) / 2 + stroke / 2, w, h, rx: radiusFor(G, Math.min(w, h)) };
}

/** A body as SVG text, with the duotone fill under its stroke. */
export function bodySvg(G, format) {
  const b = body(G, format);
  const fill = `fill="currentColor" fill-opacity="${FILL}"`;
  return b.tag === "circle"
    ? `<circle cx="${b.cx}" cy="${b.cy}" r="${b.r}" ${fill} />`
    : `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${b.rx}" ${fill} />`;
}

/**
 * Median ink of examples/hairline per grid, for a set too small to have a median of its own.
 * On 20 and 24 it is measured from the set scaled from the 16 live area to the grid's, drawn
 * at the grid's own stroke: 20 keeps 16's 1.5, so ink does not grow with the area.
 */
export const REFERENCE_INK = { 16: 83.5, 20: 114.2, 24: 181.9 };
export const referenceInk = (G) => REFERENCE_INK[G];
