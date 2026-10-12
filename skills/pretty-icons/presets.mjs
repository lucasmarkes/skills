import { squircle } from "./geometry.mjs";
export { squircle };

/**
 * The grids pretty-icons draws on, and what each one fixes: finish, stroke,
 * padding, fill, radii, and the four keylines an icon's ink lands on. A body
 * for a keyline is derived here, so the agent copies geometry instead of
 * inventing it: a rect's edge sits an inset inside the keyline (half the stroke, on the
 * quarter grid), a circle's radius is half the keyline less the inset.
 *
 * The grid names the finish. 16, 20 and 24 are duotone: a currentColor stroke
 * over a 20% fill, for a sidebar. 48 is filled: a thin line over a light fill,
 * shaded inside on the side away from the light, in five neutral tones, shown at 16–64 px by CSS.
 */
export const PRESETS = {
  16: { stroke: 1, radius: [1.5, 1], keylines: { circle: [14, 14], square: [12.5, 12.5], portrait: [11, 14], landscape: [14, 11] } },
  20: { stroke: 1.25, radius: [2, 1], keylines: { circle: [18, 18], square: [16, 16], portrait: [14, 18], landscape: [18, 14] } },
  24: { stroke: 1.5, radius: [2, 1], keylines: { circle: [22, 22], square: [20, 20], portrait: [18, 22], landscape: [22, 18] } },
};
/**
 * The line tone's share of an icon's painted pixels, at the filled finish. A reference set of forty icons runs 17% to 48%,
 * median near 30: the dark tone is the line and the odd dot, every body light with a contour. Below 20 an icon
 * has too little line; above 45 something large is filled in the line tone, or the lines crowd a small body.
 */
export const CONTRAST_BAND = [0.2, 0.45];
export const FILLED_PRESETS = {
  48: {
    // The keylines sit in the live area as the duotone's do, centred at 24.
    // Two weights: the root's line and a contour at 2. A bar at 3.5 is refused (rules-filled.md 03).
    // A rect's radius is chosen by what the object is: RADII.
    // The hierarchy: a body's contour at 2, everything else at 1.5 (the root's).
    finish: "filled", stroke: 1.5, contour: 2, weights: [2], contrast: CONTRAST_BAND, pad: 4, elements: 8, commands: 12,
    keylineTol: 1, gravityTol: 3, weightTol: 0.25, referenceTol: 0.25,
    keylines: { circle: [40, 40], square: [36, 36], portrait: [32, 40], landscape: [40, 32] },
  },
};
export const GRIDS = { ...PRESETS, ...FILLED_PRESETS };

/**
 * The bulk finish, on grid 24 only: a filled line-and-body set. Keylines are ink sizes
 * (a filled body has no stroke), bodies are squircles at 40% opacity, accents are knocked
 * out of them by `knockout`. Share is accent ink over whole ink.
 */
export const BULK_PRESETS = {
  24: {
    finish: "bulk",
    stroke: 2,
    weights: [2],
    pad: 2,
    knockout: 1.5,
    gap: 1.5,
    share: [0.25, 0.6],
    radius: [5, 3],
    radiusAt: 12,
    commands: 14,
    keylines: { circle: [20, 20], square: [18, 18], portrait: [16, 20], landscape: [20, 16] },
  },
};
/** How far a measured knockout band may sit from `knockout`, in grid units. */
export const KNOCKOUT_TOL = 0.25;
export const BULK_REFERENCE_INK = { 24: 114 };

/** The finish a root declares: bulk is fill="currentColor" with no stroke, duotone is fill="none" stroke="currentColor". */
export function finishOf(root) {
  const fill = root.fill, stroke = root.stroke;
  if (fill === "currentColor" && stroke === undefined) return "bulk";
  if (fill === "none" && stroke === "currentColor") return "duotone";
  return null;
}

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
/** Air, in strokes: two inks that do not touch sit this far apart, edge to edge (a mark, half). */
export const AIR = 1.5;

/** A detail inside a body ends at least this many strokes inside its contour, edge to edge. */
export const LOOSE = 1;
export const GRID_STEP = 0.25;
export const TOUCH = 0.1;
export const SCALE = 32;
export const INK_ALPHA = 0.05;
/** A pixel is in the line tone when its mean of r, g and b is under this: the midpoint of the line tone (38) and the mark tone (140). */
export const DARK_LUMA = 89;
export const RADIUS_AT = 8;
export const FORMATS = ["circle", "square", "portrait", "landscape"];

export function preset(G, finish) {
  const want = finish ?? GRIDS[G]?.finish ?? "duotone";
  if (want === "bulk") {
    const b = BULK_PRESETS[G];
    if (!b) throw new Error(`no bulk preset for grid ${G}: bulk is 24`);
    return {
      G, fill: FILL, live: G - 2 * b.pad, step: GRID_STEP, elements: 3, keylineTol: KEYLINE_TOL, gravityTol: GRAVITY_TOL,
      weightTol: WEIGHT_TOL, referenceTol: REFERENCE_TOL, centre: [G / 2, G / 2], ...b,
    };
  }
  const p = GRIDS[G];
  if (!p) throw new Error(`no preset for grid ${G}`);
  if (want !== (p.finish ?? "duotone")) throw new Error(`no ${want} preset for grid ${G}`);
  const pad = p.pad ?? PAD;
  return {
    G, finish: "duotone", pad, fill: FILL, live: G - 2 * pad, step: GRID_STEP, radiusAt: RADIUS_AT, elements: 3, commands: 8,
    keylineTol: KEYLINE_TOL, gravityTol: GRAVITY_TOL, weightTol: WEIGHT_TOL, referenceTol: REFERENCE_TOL, weights: [],
    centre: [G / 2, G / 2], ...p,
  };
}

/** The radius a shape of this size (its smaller side) takes on this grid; at the filled finish, a cased one's. */
export function radiusFor(G, size, finish) {
  const p = preset(G, finish);
  if (p.finish === "bulk") return size >= p.radiusAt ? p.radius[0] : p.radius[1];
  return radiiFor(G, size, finish)[p.finish === "filled" ? 1 : 0];
}

/** Every radius a shape of this size may take: the duotone's one; the filled finish's cut, cased, moulded and pill. */
export function radiiFor(G, size, finish) {
  const p = preset(G, finish);
  if (p.finish === "bulk") return [radiusFor(G, size, finish), size / 2];
  if (p.finish !== "filled") return [size >= p.radiusAt ? p.radius[0] : p.radius[1]];
  const step = size >= 16 ? 0 : size >= 8 ? 1 : 2;
  return [RADII.cut[step], RADII.cased[step], RADII.moulded[step], size / 2];
}

/** How far a body's edge sits inside its keyline: half the drawn stroke (the contour at 48), rounded up to the quarter grid. */
export const inset = (G, finish) => { const p = preset(G, finish); return Math.ceil((p.contour ?? p.stroke) / 2 / GRID_STEP - 1e-9) * GRID_STEP; };

/** The element whose ink lands on a keyline, its edge an inset inside it. */
export function body(G, format, finish) {
  const p = preset(G, finish), { keylines, centre: [cx, cy] } = p, i = inset(G, finish);
  const kl = keylines[format];
  if (!kl) throw new Error(`no keyline "${format}"; one of ${FORMATS.join(", ")}`);
  const [kw, kh] = kl;
  if (p.finish === "bulk") {
    // the keyline is the ink size and a filled body has no stroke: the body is the keyline itself
    if (format === "circle") return { tag: "circle", cx, cy, r: kw / 2 };
    return { tag: "path", d: squircle(cx - kw / 2, cy - kh / 2, kw, kh, radiusFor(G, Math.min(kw, kh), finish)) };
  }
  if (format === "circle") return { tag: "circle", cx, cy, r: kw / 2 - i };
  const w = kw - 2 * i, h = kh - 2 * i;
  return { tag: "rect", x: cx - kw / 2 + i, y: cy - kh / 2 + i, w, h, rx: radiusFor(G, Math.min(w, h), finish) };
}

/** A body as SVG text, with the duotone fill under its stroke (the duotone finish's). */
export function bodySvg(G, format, finish) {
  const b = body(G, format, finish);
  if (preset(G, finish).finish === "bulk") {
    return b.tag === "circle" ? `<circle cx="${b.cx}" cy="${b.cy}" r="${b.r}" fill-opacity=".4" />` : `<path d="${b.d}" fill-opacity=".4" />`;
  }
  const fill = `fill="currentColor" fill-opacity="${FILL}"`;
  return b.tag === "circle"
    ? `<circle cx="${b.cx}" cy="${b.cy}" r="${b.r}" ${fill} />`
    : `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${b.rx}" ${fill} />`;
}

/**
 * Median ink of examples/hairline per grid, for a set too small to have a median of its own.
 * On 20 and 24 it is measured from the set scaled from the 16 live area to the grid's, drawn
 * at the grid's own stroke.
 * On 48 it is the median line ink of examples/garage: the contours and marks, not the paint.
 */
export const REFERENCE_INK = { 16: 64.1, 20: 103.5, 24: 152.6, 48: 347 };
export const referenceInk = (G, finish) => (preset(G, finish).finish === "bulk" ? BULK_REFERENCE_INK[G] : REFERENCE_INK[G]);

/**
 * A modifier's box on each grid (its ink's larger side) and a dot's radius. Its halo, the clear space
 * the base gives it, is derived: half the box plus one and a half base strokes (`modifiers.mjs`).
 */
export const MODIFIER = { 16: { size: 5, dot: 1.5 }, 20: { size: 6.5, dot: 1.75 }, 24: { size: 8, dot: 2.25 }, 48: { size: 14.5, dot: 4 } };

/** A closed counter (a hole, an eye, a ring's inside) is at least this many strokes across. */
export const COUNTER = 2;
/** Air reports a narrow region of at least this many square strokes; smaller is anti-aliasing. */
export const AIR_AREA = 1;
/** A counter within this many strokes of COUNTER passes: the raster reads a hole a little small. */
export const AIR_TOL = 0.25;
/** A smooth curve's tightest radius, in strokes: tighter reads as a kink at display size. */
export const BEND = 1;
/** An elongated icon (principal axes at `ratio` or more) within `tol`° of 45 lies on the diagonal; a set holds at most `share` of them, and at least one is allowed. */
export const DIAGONAL = { share: 0.3, ratio: 2, tol: 10 };
/** How far the offset shadow sits from the icon, down and right, in grid units (the filled finish only). */
export const SHADOW = 1.5;
