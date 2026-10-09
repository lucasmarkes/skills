/**
 * The proof sheet, for the author while drawing: `node sheet.mjs <folder> --proof [--only <name>]`.
 * One panel per icon, four views side by side:
 *   construction  the icon over its keyline (dashed), anchors as dots, handles as hairlines, each join
 *                 coloured by its measure (smooth green, corner blue, kink red), a modifier's halo dashed
 *   finish        the icon clean, on the finish's own background
 *   silhouette    everything in the line tone at 16 and 24 px, scaled up without smoothing: the object
 *                 must be nameable from its mass alone
 *   pixels        the icon at its display sizes (16, 24, 32 filled; the grid at 1× and 2× duotone),
 *                 scaled up without smoothing, so the grey edge rows of the pixel note show
 * The first row is the reference row: three icons of the finish's example in the same four views.
 * It never reaches the blind sheet. The proof is drawn whether or not the set passes check.mjs:
 * a kink is what it is for.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readSet, setGrid } from "./check.mjs";
import { segments, joins, DISPLAY } from "./curve.mjs";
import { sampleParts } from "./geometry.mjs";
import { CORNERS, halo, isModifier, placement, slashEnds } from "./modifiers.mjs";
import { preset, PALETTE } from "./presets.mjs";
import { png } from "./raster.mjs";
import { parse } from "./svg.mjs";
import { place, defaultOut } from "./sheet.mjs";

const FONT = `font-family="system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"`;
/** Each view is VIEW px square; the small renders sit in CELL px squares, two to a column. */
export const VIEW = 192, CELL = 96, GAP = 16, LABEL = 28;
export const PANEL = { w: VIEW * 3 + CELL + GAP * 3, h: VIEW + LABEL };
export const JOIN_COLOUR = { smooth: "#16a34a", corner: "#2563eb", kink: "#dc2626" };
export const REFERENCE = { duotone: ["hairline", ["data", "devices", "security"]], filled: ["garage", ["car", "traffic-light", "wrench"]] };
const SKILL = dirname(fileURLToPath(import.meta.url));
const BG = { duotone: { bg: "#fafafa", ink: "#737373" }, filled: { bg: "#edeeee", ink: PALETTE.line } };

/** The sizes the pixels view shows: 16, 24 and 32 for the filled grid, the grid at 1× and 2× in duotone. */
export const pixelSizes = (G) => DISPLAY[G] ?? [16, 24, 32];

const b64 = (bytes) => `data:image/png;base64,${Buffer.from(bytes).toString("base64")}`;

/** The icon rendered at `size` px, then drawn `cell` px wide without smoothing, centred in a cell at x, y. */
function pixelated(s, G, size, x, y, cell, { bg, ink, solid = false }) {
  const k = Math.max(1, Math.floor(cell / size)), w = size * k, off = (cell - w) / 2;
  const icon = solid ? silhouette(s, G, size, ink) : place(s, G, 0, 0, size, ink);
  const small = png(`<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="${bg}" />${icon}</svg>`, size);
  return `<image x="${x + off}" y="${y + off}" width="${w}" height="${w}" image-rendering="optimizeSpeed" href="${b64(small)}" />`
    + `<text x="${x + 4}" y="${y + cell - 4}" ${FONT} font-size="10" fill="#737373">${size}</text>`;
}

/** Every fill and stroke in one tone, at full opacity: the icon's mass alone. */
export function silhouette(s, G, size, ink) {
  const flat = s.text
    .replace(/\s(fill|stroke)-opacity="[^"]*"/g, "")
    .replace(/\s(fill|stroke)="(?!none")[^"]*"/g, (m, k) => ` ${k}="${ink}"`);
  return place({ ...s, text: flat }, G, 0, 0, size, ink);
}

/** The construction overlay in canvas units: anchors, handles, joins coloured by kind, a modifier's halo. */
export function construction(s, G) {
  const parsed = parse(s.text), u = 1 / (VIEW / G), out = [];
  const dot = (p, r, fill) => `<circle cx="${p[0]}" cy="${p[1]}" r="${r * u}" fill="${fill}" stroke="none" />`;
  for (const el of parsed.elements) {
    if (el.tag !== "path" || !el.attrs.d) continue;
    let subs;
    try { subs = segments(el.attrs.d); } catch { continue; }
    for (const sub of subs) for (const seg of sub.segs) {
      if (seg.kind === "cubic") {
        const [p0, c1, c2, p3] = seg.p;
        out.push(`<path d="M${p0}L${c1}M${p3}L${c2}" stroke="#a3a3a3" stroke-width="${u}" fill="none" />`, dot(c1, 2, "#a3a3a3"), dot(c2, 2, "#a3a3a3"));
      }
      out.push(dot(seg.p[0], 2.5, "#525252"));
    }
    for (const sub of subs) if (!sub.closed && sub.segs.length) out.push(dot(sub.segs.at(-1).p.at(-1), 2.5, "#525252"));
    for (const j of joins(el.attrs.d)) out.push(dot(j.at, 4, JOIN_COLOUR[j.kind]));
  }
  const mods = parsed.elements.filter(isModifier);
  if (mods.length) {
    const kind = mods[0].attrs["data-modifier"];
    try {
      const pts = mods.flatMap((el) => sampleParts(el, 0.1).flat());
      const mid = [(Math.min(...pts.map((q) => q[0])) + Math.max(...pts.map((q) => q[0]))) / 2, (Math.min(...pts.map((q) => q[1])) + Math.max(...pts.map((q) => q[1]))) / 2];
      const corner = kind === "slash" ? "br" : CORNERS.reduce((a, b) => (Math.hypot(...placement(G, kind, a).c.map((v, i) => v - mid[i])) <= Math.hypot(...placement(G, kind, b).c.map((v, i) => v - mid[i])) ? a : b));
      const H = halo(G, kind, corner);
      if (kind === "slash") { const [a, b] = slashEnds(G); out.push(`<path d="M${a}L${b}" stroke="#9333ea" stroke-opacity=".15" stroke-width="${2 * H.r}" stroke-linecap="round" fill="none" />`); }
      else out.push(`<circle cx="${H.c[0]}" cy="${H.c[1]}" r="${H.r}" fill="none" stroke="#9333ea" stroke-width="${u}" stroke-dasharray="${4 * u} ${3 * u}" />`);
    } catch { /* an unknown kind: check.mjs names it */ }
  }
  return out.join("");
}

/** One icon's panel: its name, then construction, finish, silhouette and pixels, at x, y. */
export function panel(s, G, x, y) {
  const finish = preset(G).finish, { bg, ink } = BG[finish], scale = VIEW / G, top = y + LABEL;
  const { keylines, centre: [cx, cy] } = preset(G);
  let out = `<text x="${x}" y="${y + 18}" ${FONT} font-size="14" fill="#171717">${String(s.name).replace(/[&<>]/g, "")}</text>`;
  // construction: a pale icon under the overlay, the keylines dashed
  out += `<rect x="${x}" y="${top}" width="${VIEW}" height="${VIEW}" fill="#fff" stroke="#e5e5e5" />`;
  out += `<g opacity=".45">${place(s, G, x, top, VIEW, ink)}</g>`;
  out += `<g transform="translate(${x} ${top}) scale(${scale})">`;
  for (const [kw, kh] of Object.values(keylines)) out += `<rect x="${cx - kw / 2}" y="${cy - kh / 2}" width="${kw}" height="${kh}" fill="none" stroke="#93c5fd" stroke-width="${1 / scale}" stroke-dasharray="${3 / scale} ${3 / scale}" />`;
  out += construction(s, G) + "</g>";
  // finish
  const fx = x + VIEW + GAP;
  out += `<rect x="${fx}" y="${top}" width="${VIEW}" height="${VIEW}" fill="${bg}" />` + place(s, G, fx, top, VIEW, ink);
  // silhouette at 16 and 24
  const sx = fx + VIEW + GAP;
  out += pixelated(s, G, 16, sx, top, CELL, { bg: "#fff", ink: PALETTE.line, solid: true });
  out += pixelated(s, G, 24, sx, top + CELL, CELL, { bg: "#fff", ink: PALETTE.line, solid: true });
  // pixels: two to a column, a second column when there are three
  const px = sx + CELL + GAP;
  out += `<rect x="${px}" y="${top}" width="${VIEW}" height="${VIEW}" fill="${bg}" />`;
  pixelSizes(G).forEach((size, i) => { out += pixelated(s, G, size, px + Math.floor(i / 2) * CELL, top + (i % 2) * CELL, CELL, { bg, ink }); });
  return out;
}

/** The reference icons of a grid's finish, read from the skill's examples. */
export function referenceSet(G) {
  const [folder, names] = REFERENCE[preset(G).finish];
  return readSet(join(SKILL, "examples", folder)).filter((s) => names.includes(s.name));
}

/**
 * The proof as SVG: the reference row, a rule, then the set's panels, three to a row.
 * `only` keeps one icon, by name; an unknown name is an error that lists the names.
 */
export function composeProof(set, G, { only } = {}) {
  const icons = only === undefined ? set : set.filter((s) => s.name === only);
  if (!icons.length) throw new Error(`--only ${only}: no such icon; the set has ${set.map((s) => s.name).join(", ")}`);
  const refs = referenceSet(G), perRow = 3, pitchX = PANEL.w + 32, pitchY = PANEL.h + 24, left = 24;
  const rows = Math.ceil(icons.length / perRow), W = left * 2 + perRow * pitchX - 32, refH = 24 + pitchY;
  const H = 24 + refH + 24 + rows * pitchY + 24;
  let out = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#fff" />`;
  out += `<g data-reference="row"><rect x="${left - 12}" y="12" width="${W - 2 * left + 24}" height="${refH}" rx="8" fill="#f5f5f4" />`;
  out += `<text x="${left}" y="34" ${FONT} font-size="12" fill="#737373">reference: examples/${REFERENCE[preset(G).finish][0]}</text>`;
  // the reference icons draw at their own grid, not the set's: a 20 or 24 set still shows the 16 reference at 16
  const RG = setGrid(refs);
  refs.forEach((s, i) => { out += panel(s, RG, left + i * pitchX, 44); });
  out += "</g>";
  const y0 = 24 + refH + 24;
  icons.forEach((s, i) => { out += panel(s, G, left + (i % perRow) * pitchX, y0 + Math.floor(i / perRow) * pitchY); });
  return out + "</svg>";
}

/** Writes pretty-icons-proof.png beside the other two sheets and returns its path. */
export function writeProof(folder, { out, only, grid } = {}) {
  const dir = resolve(folder), dest = out ? resolve(out) : defaultOut(dir), set = readSet(dir);
  if (!set.length) throw new Error(`${folder}: no .svg files`);
  const G = setGrid(set, grid);
  const svg = composeProof(set, G, { only });
  mkdirSync(dest, { recursive: true });
  const file = join(dest, "pretty-icons-proof.png");
  writeFileSync(file, png(svg, Number(/width="(\d+)"/.exec(svg)[1])));
  return file;
}
