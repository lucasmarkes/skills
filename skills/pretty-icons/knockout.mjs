#!/usr/bin/env node
/**
 * The knockout at bulk: where an accent crosses a body, a band of paper `knockout`
 * wide (1.5) follows the accent's outline, cut out of the body. A drawer never cuts
 * it: this file does, with paper.js (raster.mjs installs it beside resvg).
 *   node knockout.mjs <icon.svg> [--print]
 * A body with no crossing is left as it was; a cut body carries data-cut="knockout"
 * and its uncut geometry in data-body, so a second run starts from the original.
 * Refuses a file that fails the text rules, and a cut that leaves a piece under 1 across.
 */
import { readFileSync, writeFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { basename, dirname } from "node:path";
import { paper } from "./raster.mjs";
import { preset } from "./presets.mjs";
import { compose, num, GEOMETRY_ATTRS } from "./svg.mjs";
import { textChecks, formatFailure } from "./check.mjs";
import { classify, crosses, isKnockout, isLine, uncut } from "./bulk.mjs";
import { asPath } from "./modifiers.mjs";

export class KnockoutError extends Error {}
const refuse = (m) => { throw new KnockoutError(m); };
// FLAT: how far a flattened halo may stray; THIN: the lattice and flattening a crumb is read on
const FLAT = 0.05, THIN = 0.05, CRUMB = 1, G = 24;
const f = (v) => String(Math.round(v * 100) / 100);

/** A stadium: the segment a→b grown by r, as a paper path with two arcs. */
export function stadium(a, b, r, P) {
  const A = new P.Point(a), B = new P.Point(b), v = B.subtract(A);
  if (v.length < 1e-9) return new P.Path.Circle({ center: A, radius: r, insert: false });
  const u = v.normalize(), n = new P.Point(-u.y, u.x).multiply(r);
  const path = new P.Path({ insert: false });
  path.moveTo(A.add(n));
  path.lineTo(B.add(n));
  path.arcTo(B.add(u.multiply(r)), B.subtract(n));
  path.lineTo(A.subtract(n));
  path.arcTo(A.subtract(u.multiply(r)), A.add(n));
  path.closePath();
  return path;
}

const unite = (items) => items.reduce((acc, it) => (acc ? acc.unite(it, { insert: false }) : it), null);

/** An accent's halo: its outline offset by k (a line: half its width, plus k). A circle's is exact. */
export function haloOf(accent, k, P) {
  if (accent.tag === "circle" && !isLine(accent)) return new P.Path.Circle({ center: [num(accent.attrs, "cx"), num(accent.attrs, "cy")], radius: num(accent.attrs, "r") + k, insert: false });
  // a CompoundPath keeps every subpath apart (a Path chains them into one polygon): a plus has two arms
  const outline = new P.CompoundPath(asPath(accent));
  outline.remove();
  const r = isLine(accent) ? num(accent.attrs, "stroke-width", 2) / 2 + k : k;
  const runs = [];
  for (const child of outline.children) {
    const flat = child.clone({ insert: false });
    flat.flatten(FLAT);
    const pts = flat.segments.map((s) => [s.point.x, s.point.y]);
    for (let i = 0; i + 1 < pts.length; i++) runs.push(stadium(pts[i], pts[i + 1], r, P));
    if (flat.closed && pts.length > 1) runs.push(stadium(pts[pts.length - 1], pts[0], r, P));
  }
  const grown = unite(runs);
  return isLine(accent) ? grown : unite([outline.clone({ insert: false }), grown]);
}

/** A paper item's geometry as absolute SVG commands, two decimals, every subpath closed. */
function pathD(path) {
  const S = path.segments;
  if (!S.length) return "";
  let d = `M ${f(S[0].point.x)} ${f(S[0].point.y)}`;
  const n = S.length;
  for (let i = 0; i < n; i++) {
    if (i === n - 1 && !path.closed) break;
    const a = S[i], b = S[(i + 1) % n];
    d += a.handleOut.isZero() && b.handleIn.isZero()
      ? ` L ${f(b.point.x)} ${f(b.point.y)}`
      : ` C ${f(a.point.x + a.handleOut.x)} ${f(a.point.y + a.handleOut.y)} ${f(b.point.x + b.handleIn.x)} ${f(b.point.y + b.handleIn.y)} ${f(b.point.x)} ${f(b.point.y)}`;
  }
  return d + (path.closed ? " Z" : "");
}
const toD = (item) => (item.children ? item.children : [item]).map(pathD).filter(Boolean).join(" ");
/** The cut's pieces: its outlines wound as the largest one is, so a hole is never a piece. */
function pieces(item) {
  const all = item.children ? item.children : [item];
  const outer = all.reduce((m, c) => (Math.abs(c.area) > Math.abs(m.area) ? c : m));
  return all.filter((c) => c.clockwise === outer.clockwise);
}

/** Every outline of a paper item as flat polygons, [[x, y]…] each. */
function polygons(item) {
  return (item.children ? item.children : [item]).map((c) => {
    const flat = c.clone({ insert: false });
    flat.flatten(THIN);
    return flat.segments.map((s) => [s.point.x, s.point.y]);
  });
}
const inPolygon = ([x, y], poly) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, ay] = poly[j], [bx, by] = poly[i];
    if ((ay > y) !== (by > y) && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) inside = !inside;
  }
  return inside;
};
function toEdges([x, y], polys) {
  let best = Infinity;
  for (const poly of polys) for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, ay] = poly[j], [bx, by] = poly[i], dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy;
    const t = len2 ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len2)) : 0;
    best = Math.min(best, Math.hypot(x - ax - t * dx, y - ay - t * dy));
  }
  return best;
}
/**
 * A piece's thickness: the widest circle that fits in it (holes and all), read on a THIN lattice
 * over its box. It stops at CRUMB, the only question being whether the piece is thinner.
 */
function thickness(piece, polys) {
  const own = polygons(piece)[0], b = piece.bounds;
  const filled = (q) => inPolygon(q, own) && polys.reduce((n, poly) => n !== inPolygon(q, poly), false);
  const depth = (q) => (filled(q) ? 2 * toEdges(q, polys) : 0);
  let widest = 0, best = null;
  for (let y = b.y; y <= b.y + b.height; y += THIN) for (let x = b.x; x <= b.x + b.width; x += THIN) {
    const w = depth([x, y]);
    if (w > widest) { widest = w; best = [x, y]; }
    if (widest >= CRUMB) return widest;
  }
  // the lattice can miss a slanted piece's midline by THIN/√2: climb from the best point in finer steps
  for (let s = THIN / 2; best && s > 0.001; s /= 2) {
    for (let moved = true; moved;) {
      moved = false;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const q = [best[0] + dx * s, best[1] + dy * s], w = depth(q);
        if (w > widest + 1e-9) { widest = w; best = q; moved = true; }
      }
    }
    if (widest >= CRUMB) return widest;
  }
  return widest;
}

/** A body less the halos of the accents that cross it. `crossed` is empty when nothing crosses. */
export function cutBody(body, accents, k, P, icon = "icon") {
  const src = uncut(body);
  const crossed = accents.filter((a) => a.tag !== "rect" && crosses(a, src));
  if (!crossed.length) return { d: null, crossed };
  let item = src.tag === "circle"
    ? new P.Path.Circle({ center: [num(src.attrs, "cx"), num(src.attrs, "cy")], radius: num(src.attrs, "r"), insert: false })
    : new P.CompoundPath(asPath(src));
  item.remove();
  for (const a of crossed) {
    item = item.subtract(haloOf(a, k, P), { insert: false });
    const polys = polygons(item);
    for (const piece of pieces(item)) {
      const across = thickness(piece, polys);
      if (Number(f(across)) < CRUMB) refuse(`crumb  ${icon}  ${body.at} a piece ${f(across)} across under ${a.at} → at least ${CRUMB}: move the accent, or make it a body`);
    }
  }
  return { d: toD(item), crossed };
}

/** The file with every crossed body cut. Unchanged text when nothing crosses; refuses on a text failure. */
export function knockout(text, { name = "icon", folder } = {}) {
  const { failures, parsed } = textChecks(name, text, G, "bulk");
  const other = failures.filter((x) => x.rule !== "knockout");
  if (other.length) refuse(formatFailure(other[0]));
  const p = preset(G, "bulk"), P = paper();
  const { bodies, accents } = classify(parsed);
  const cut = [];
  let changed = false;
  const out = parsed.elements.map((el) => {
    if (!bodies.includes(el)) return el;
    const { d, crossed } = cutBody(el, accents, p.knockout, P, name);
    if (!crossed.length) {
      if (!isKnockout(el)) return el;
      changed = true;
      return uncut(el);
    }
    // a circle body comes back a path: its geometry attributes go, its outline goes in data-body
    const src = uncut(el), whole = asPath(src);
    const rest = Object.fromEntries(Object.entries(src.attrs).filter(([k]) => !GEOMETRY_ATTRS.includes(k) && k !== "data-cut" && k !== "data-body"));
    const attrs = { d, ...rest, "data-cut": "knockout", "data-body": whole };
    const next = { ...el, tag: "path", attrs };
    if (el.attrs.d !== d || el.attrs["data-body"] !== whole) changed = true;
    cut.push({ body: el.at, under: crossed.map((a) => a.at) });
    return next;
  });
  if (!changed) return { text, cut };
  const svg = compose(parsed.attrs, out)
    .replace(/ \/><(?!\/svg>)/g, " />\n  <")
    .replace(/^(<svg[^>]*>)/, "$1\n  ")
    .replace(/<\/svg>$/, "\n</svg>");
  return { text: svg, cut };
}

export const USAGE = "usage: node knockout.mjs <icon.svg> [--print]";

export function main(argv) {
  const print = argv.includes("--print"), files = argv.filter((a) => !a.startsWith("--"));
  if (files.length !== 1) { console.error(USAGE); process.exit(1); }
  const file = files[0], name = basename(file, ".svg");
  let text;
  try { text = readFileSync(file, "utf8"); } catch (e) { console.error(`knockout: ${file}: ${e.code === "ENOENT" ? "no such file" : e.message}`); process.exit(1); }
  try {
    const r = knockout(text, { name, folder: dirname(file) });
    if (print) { process.stdout.write(r.text + "\n"); return; }
    if (r.text !== text) writeFileSync(file, r.text);
    // an unchanged file has nothing to cut, even when its cuts are already there
    if (r.text === text || !r.cut.length) console.log(`${name}  nothing to cut`);
    else for (const c of r.cut) console.log(`${name}  cut ${c.body} under ${c.under.join(", ")}`);
  } catch (e) {
    if (!(e instanceof KnockoutError)) throw e;
    console.error(`knockout: ${e.message}`);
    process.exit(1);
  }
}

const entry = process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (entry) main(process.argv.slice(2));
