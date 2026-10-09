/**
 * The grids pretty-icons draws on, and what each one fixes: finish, stroke,
 * padding, fill, radii, and the four keylines an icon's ink lands on. A body
 * for a keyline is derived here, so the agent copies geometry instead of
 * inventing it: a rect's edge sits half a stroke inside the keyline, a
 * circle's radius is half the keyline less half a stroke.
 *
 * The grid names the finish. 16, 20 and 24 are duotone: a currentColor stroke
 * over a 20% fill, for a sidebar. 48 is filled: a thin line over a light fill,
 * shaded inside on the side away from the light, in five neutral tones, shown at 16–64 px by CSS.
 */
export const PRESETS = {
  16: { stroke: 1.5, radius: [1.5, 1], keylines: { circle: [14, 14], square: [12.5, 12.5], portrait: [11, 14], landscape: [14, 11] } },
  20: { stroke: 1.5, radius: [2, 1], keylines: { circle: [18, 18], square: [16, 16], portrait: [14, 18], landscape: [18, 14] } },
  24: { stroke: 2, radius: [2, 1], keylines: { circle: [22, 22], square: [20, 20], portrait: [18, 22], landscape: [22, 18] } },
};
export const FILLED_PRESETS = {
  48: {
    // No shadow: the keylines sit in the live area as the duotone's do, centred at 24.
    // Three weights: the root's line, a mark (2), a bar (3.5). A rect's radius is chosen by what the object is: RADII.
    // The hierarchy: a body's contour at 2, the parts' line at 1.5 (the root's), a bar at 3.5.
    finish: "filled", stroke: 1.5, contour: 2, weights: [2, 3.5], pad: 4, elements: 8, commands: 12,
    keylineTol: 1, gravityTol: 3, weightTol: 0.25, referenceTol: 0.25,
    keylines: { circle: [40, 40], square: [36, 36], portrait: [32, 40], landscape: [40, 32] },
  },
};
export const GRIDS = { ...PRESETS, ...FILLED_PRESETS };

/**
 * The filled finish's five tones, light and dark. The file holds the light ones; a dark
 * page swaps each for its twin (`toDark`). line draws every contour and the dark parts,
 * fill is the object, shade the side away from the light, paper glass and lit lamps, mark
 * the scales and treads printed on the object.
 */
export const PALETTE = { line: "#25262a", fill: "#ececea", shade: "#cfcfcb", paper: "#ffffff", mark: "#8b8c90" };
export const PALETTE_DARK = { line: "#f1f1ee", fill: "#3d3e43", shade: "#2c2d31", paper: "#5a5b61", mark: "#9d9ea3" };
export const toDark = (text) => Object.keys(PALETTE).reduce((t, k) => t.replace(new RegExp(PALETTE[k], "gi"), PALETTE_DARK[k]), text);

/**
 * A rect's radius at the filled finish, by what the object is, then by its smaller side
 * (≥ 16, 8 to 16, < 8): cut (a sheet, a board, a card: real edges), cased (a box, a can,
 * a battery, a pump), moulded (a hood, a cap, a knob: cast or soft, held in the hand).
 * A pill takes half its smaller side.
 */
export const RADII = { cut: [2, 1.5, 1], cased: [6, 2.5, 1.5], moulded: [8, 4, 2.5] };

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
  const p = GRIDS[G];
  if (!p) throw new Error(`no preset for grid ${G}`);
  const pad = p.pad ?? PAD;
  return {
    G, finish: "duotone", pad, fill: FILL, live: G - 2 * pad, step: GRID_STEP, radiusAt: RADIUS_AT, elements: 3, commands: 8,
    keylineTol: KEYLINE_TOL, gravityTol: GRAVITY_TOL, weightTol: WEIGHT_TOL, referenceTol: REFERENCE_TOL, weights: [],
    centre: [G / 2, G / 2], ...p,
  };
}

/** The radius a shape of this size (its smaller side) takes on this grid; at the filled finish, a cased one's. */
export function radiusFor(G, size) {
  return radiiFor(G, size)[preset(G).finish === "filled" ? 1 : 0];
}

/** Every radius a shape of this size may take: the duotone's one; the filled finish's cut, cased, moulded and pill. */
export function radiiFor(G, size) {
  const p = preset(G);
  if (p.finish !== "filled") return [size >= p.radiusAt ? p.radius[0] : p.radius[1]];
  const step = size >= 16 ? 0 : size >= 8 ? 1 : 2;
  return [RADII.cut[step], RADII.cased[step], RADII.moulded[step], size / 2];
}

/** The element whose ink lands exactly on a keyline, drawn at the contour's width (the filled finish's 2) or the stroke's. */
export function body(G, format) {
  const { stroke: line, contour, keylines, centre: [cx, cy] } = preset(G);
  const stroke = contour ?? line;
  const kl = keylines[format];
  if (!kl) throw new Error(`no keyline "${format}"; one of ${FORMATS.join(", ")}`);
  const [kw, kh] = kl;
  if (format === "circle") return { tag: "circle", cx, cy, r: kw / 2 - stroke / 2 };
  const w = kw - stroke, h = kh - stroke;
  return { tag: "rect", x: cx - kw / 2 + stroke / 2, y: cy - kh / 2 + stroke / 2, w, h, rx: radiusFor(G, Math.min(w, h)) };
}

/** A body as SVG text, with the duotone fill under its stroke (the duotone finish's). */
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
 * On 48 it is the median line ink of examples/garage: the contours and marks, not the paint.
 */
export const REFERENCE_INK = { 16: 83.5, 20: 114.2, 24: 181.9, 48: 342.5 };
export const referenceInk = (G) => REFERENCE_INK[G];

/**
 * A modifier's box on each grid (its ink's larger side) and a dot's radius. Its halo, the clear space
 * the base gives it, is derived: half the box plus one and a half base strokes (`modifiers.mjs`).
 */
export const MODIFIER = { 16: { size: 5, dot: 1.5 }, 20: { size: 6.5, dot: 1.75 }, 24: { size: 8, dot: 2.25 }, 48: { size: 14.5, dot: 4 } };
