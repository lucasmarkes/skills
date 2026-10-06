/**
 * The grids pretty-icons draws on, and what each one fixes: finish, stroke,
 * padding, fill, radii, and the four keylines an icon's ink lands on. A body
 * for a keyline is derived here, so the agent copies geometry instead of
 * inventing it: a rect's edge sits half a stroke inside the keyline, a
 * circle's radius is half the keyline less half a stroke.
 *
 * The grid names the finish. 16, 20 and 24 are duotone: a currentColor stroke
 * over a 20% fill, for a sidebar. 48 is filled: an ink contour over a flat
 * palette colour, a shade copy of the body behind it, for 32–64 px.
 */
export const PRESETS = {
  16: { stroke: 1.5, radius: [1.5, 1], keylines: { circle: [14, 14], square: [12.5, 12.5], portrait: [11, 14], landscape: [14, 11] } },
  20: { stroke: 1.5, radius: [2, 1], keylines: { circle: [18, 18], square: [16, 16], portrait: [14, 18], landscape: [18, 14] } },
  24: { stroke: 2, radius: [2, 1], keylines: { circle: [22, 22], square: [20, 20], portrait: [18, 22], landscape: [22, 18] } },
};
export const FILLED_PRESETS = {
  48: {
    // The object's keylines are the live area less the shadow's offset: object and shadow together fill 44.
    finish: "filled", stroke: 2.5, pad: 2, radius: [3, 1.5], radiusAt: 16, shadow: [3, 3], elements: 8, commands: 12,
    keylineTol: 1, gravityTol: 3, weightTol: 0.25, referenceTol: 0.25,
    keylines: { circle: [41, 41], square: [37, 37], portrait: [33, 41], landscape: [41, 33] },
  },
};
export const GRIDS = { ...PRESETS, ...FILLED_PRESETS };

/**
 * The filled finish's colours: ink for contours, paper for the highlight, and pairs
 * of a fill and its shade. A body takes a fill; its shadow and its details take the shade.
 */
export const PALETTE = {
  ink: "#2e3955",
  paper: "#ffffff",
  red: ["#d26352", "#ad4a43"],
  orange: ["#df8f51", "#b56a3b"],
  yellow: ["#f3d35e", "#d4ad3c"],
  tan: ["#d5ae73", "#ad8b55"],
  brown: ["#9b6d49", "#6b4a30"],
  cocoa: ["#714b33", "#4b301e"],
  green: ["#8aa968", "#5f7d47"],
  leaf: ["#c7dd9e", "#93ad74"],
  blue: ["#9db5db", "#7288b0"],
  mist: ["#f4f4f2", "#bcc6d6"],
  cream: ["#efe0b4", "#d1b67a"],
  pink: ["#e8b4ab", "#c98a80"],
  plum: ["#a63d5b", "#7e2f47"],
  grey: ["#c3c0b8", "#9b9b9b"],
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
  const p = GRIDS[G];
  if (!p) throw new Error(`no preset for grid ${G}`);
  const pad = p.pad ?? PAD, [sx, sy] = p.shadow ?? [0, 0];
  return {
    G, finish: "duotone", pad, fill: FILL, live: G - 2 * pad, step: GRID_STEP, radiusAt: RADIUS_AT, elements: 3, commands: 8,
    keylineTol: KEYLINE_TOL, gravityTol: GRAVITY_TOL, weightTol: WEIGHT_TOL, referenceTol: REFERENCE_TOL, shadow: [0, 0],
    // where the object's keyline is centred: the canvas centre, less half the shadow's offset
    centre: [(G - sx) / 2, (G - sy) / 2], ...p,
  };
}

/** The radius a shape of this size (its smaller side) takes on this grid. */
export function radiusFor(G, size) {
  const { radius: [big, small], radiusAt } = preset(G);
  return size >= radiusAt ? big : small;
}

/** The element whose ink lands exactly on a keyline. */
export function body(G, format) {
  const { stroke, keylines, centre: [cx, cy] } = preset(G);
  const kl = keylines[format];
  if (!kl) throw new Error(`no keyline "${format}"; one of ${FORMATS.join(", ")}`);
  const [kw, kh] = kl;
  if (format === "circle") return { tag: "circle", cx, cy, r: kw / 2 - stroke / 2 };
  const w = kw - stroke, h = kh - stroke;
  return { tag: "rect", x: cx - kw / 2 + stroke / 2, y: cy - kh / 2 + stroke / 2, w, h, rx: radiusFor(G, Math.min(w, h)) };
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
export const REFERENCE_INK = { 16: 83.5, 20: 114.2, 24: 181.9, 48: 459.6 };
export const referenceInk = (G) => REFERENCE_INK[G];
