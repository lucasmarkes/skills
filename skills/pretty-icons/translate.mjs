#!/usr/bin/env node
/**
 * Another finish of a bulk set: translated, never redrawn. The bulk drawing is the source;
 * this file derives duotone (24) and filled (48) from it by fixed rules, so every finish
 * keeps the bulk composition (what overlaps what, the gaps, the silhouettes).
 *   node translate.mjs <bulk-folder> --to duotone|filled --out <folder>
 * The same source gives the same bytes: check.mjs --from=<bulk-folder> holds a translated
 * set to that, so a hand edit fails. Change the drawing at bulk, then translate again.
 *
 * Duotone, 24, stroke 1.5:
 *   body           the same outline as a contour with the .2 tint; with a solid in front of it
 *                  (a stack) the tint stops `air` short of the front, and the contour opens there.
 *                  A pill in front (a handle) leaves the body whole.
 *   line           the same path.
 *   dot            a two-arc circle of radius 2 or less: solid.
 *   handle         a pill that touches a body: a line from the body's outline to the pill's outer end.
 *   small solid    under `solidR` across its narrow side, halved: solid.
 *   other solid    its outline, pulled in half a stroke about its centre: the ink keeps the bulk silhouette;
 *                  with a solid in front of it, the outline opens there as a body's contour does.
 * Filled, 48: the bulk geometry scaled 1.85 about (12, 12) and moved to the 48 canvas.
 *   body           the fill tone, the shade where the body shifted toward the light leaves it, a contour of 2.
 *   line           the same path at the root's 1.5.
 *   dot            a circle of 2.5 in the line tone.
 *   other solid    the shade tone under the root's line.
 * Every point the translation computes lands on the quarter grid. A source reads either with
 * knockout.mjs's cuts (data-cut="knockout", the front being what cuts it) or with an svg mask
 * whose path is the front.
 */
import { readFileSync, writeFileSync, mkdirSync, realpathSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { paper } from "./raster.mjs";
import { PALETTE } from "./presets.mjs";
import { parse, G as gridOf } from "./svg.mjs";
import { readSet } from "./check.mjs";
import { cutters, isKnockout, isLine, uncut } from "./bulk.mjs";
import { asPath, cut } from "./modifiers.mjs";

export class TranslateError extends Error {}
const refuse = (m) => { throw new TranslateError(m); };
export const FINISHES = ["duotone", "filled"];
export const TRANSLATE = {
  // air: from the front's ink to the end of the contour's centreline; solidR: a smaller solid stays solid
  duotone: { G: 24, stroke: 1.5, tint: ".2", air: 1.5, solidR: 3, dot: 2 },
  // shade: the body shifted toward the light and taken away; what is left is in shade
  filled: { G: 48, scale: 1.85, shade: [-2.5, -3.5], dot: 2.5, stroke: 1.5, contour: 2 },
  snap: 0.25,
};

/** The source's pieces in document order: { kind: body|line|solid, d, front } (front: the d of what stacks on it). */
export function pieces(text, name = "icon") {
  const masks = {};
  for (const m of text.matchAll(/<mask id="([^"]+)">[\s\S]*?<path d="([^"]+)"[^>]*\/><\/mask>/g)) masks[m[1]] = m[2];
  const parsed = parse(text.replace(/<defs>[\s\S]*?<\/defs>/g, ""));
  if (parsed.errors.length) refuse(`${name}: ${parsed.errors[0]}`);
  if (gridOf(parsed.attrs) !== 24 || String(parsed.attrs.fill).toLowerCase() !== "currentcolor") refuse(`${name}: not a bulk icon (viewBox 0 0 24 24, fill="currentColor" on the root)`);
  const els = parsed.elements.map(uncut);
  const by = parsed.elements.some(isKnockout) ? cutters(els.filter((el) => el.tag !== "rect")) : new Map();
  return els.map((el) => {
    const a = el.attrs, d = asPath(el);
    const kind = "fill-opacity" in a ? "body" : isLine(el) ? "line" : "solid";
    const masked = a.mask ? masks[/#([^)]+)/.exec(a.mask)?.[1]] : null;
    if (a.mask && !masked) refuse(`${name}: ${el.at} mask ${a.mask} has no path`);
    const fronts = by.get(el) ?? [];
    return { kind, d, front: masked ?? (fronts.length ? fronts.map(asPath).join(" ") : null) };
  });
}

// ---- geometry, on paper.js
let P;
const shape = (d) => new P.CompoundPath({ pathData: d, insert: false });
const r2 = (n) => String(+n.toFixed(2));
const sn = (n) => Math.round(n / TRANSLATE.snap) * TRANSLATE.snap;
const pt = (p) => `${r2(sn(p.x))} ${r2(sn(p.y))}`;
/** A paper item as absolute M/L/C/Z, on the quarter grid; a closing line is left to Z. */
function dOf(item) {
  let out = "";
  for (const path of item.children ?? [item]) {
    const s = path.segments;
    if (!s.length) continue;
    out += `M${pt(s[0].point)}`;
    const seg = (a, b) => (a.handleOut.isZero() && b.handleIn.isZero())
      ? `L${pt(b.point)}`
      : `C${pt(a.point.add(a.handleOut))} ${pt(b.point.add(b.handleIn))} ${pt(b.point)}`;
    for (let i = 1; i < s.length; i++) out += seg(s[i - 1], s[i]);
    if (path.closed) out += seg(s[s.length - 1], s[0]) + "Z";
  }
  return out.replace(/L(\S+) (\S+)Z$/, "Z");
}
/** A pill: M p0 L p1 A … p2 L p3 A … p0. Its axis runs between the arcs' centres. */
function pill(d) {
  const m = /^M([\d.-]+) ([\d.-]+) L([\d.-]+) ([\d.-]+) A([\d.]+) [\d.]+ 0 0 [01] ([\d.-]+) ([\d.-]+) L([\d.-]+) ([\d.-]+) A/.exec(d);
  if (!m) return null;
  const [x0, y0, x1, y1, , x2, y2, x3, y3] = m.slice(1).map(Number);
  return { a: [(x3 + x0) / 2, (y3 + y0) / 2], b: [(x1 + x2) / 2, (y1 + y2) / 2] };
}
const isDot = (d) => /^M[\d. ]+A([\d.]+) \1 0 1 [01] [\d. ]+A\1 \1 0 1 [01] [\d. ]+Z$/.test(d) && +/A([\d.]+)/.exec(d)[1] <= TRANSLATE.duotone.dot;
/** Signed distance from a shape's outline: negative inside. */
const sdf = (s) => (q) => { const p = new P.Point(q[0], q[1]), n = s.getNearestPoint(p), dist = n ? n.getDistance(p) : 99; return s.contains(p) ? -dist : dist; };
/** A shape grown by dist: its outline sampled every 0.1, each point pushed out along its normal, smoothed back to curves. */
function grow(s, dist) {
  const out = new P.CompoundPath({ insert: false });
  for (const path of s.children ?? [s]) {
    const pts = [], L = path.length, n = Math.max(48, Math.ceil(L / 0.1));
    for (let i = 0; i < n; i++) {
      const o = (L * i) / n, p = path.getPointAt(o);
      let v = path.getNormalAt(o);
      if (s.contains(p.add(v.multiply(0.05)))) v = v.multiply(-1);
      pts.push(p.add(v.multiply(dist)));
    }
    const g = new P.Path({ segments: pts, closed: true, insert: false });
    g.simplify(0.02);
    out.addChild(g);
  }
  return out;
}
/** Where a pill's axis, run from its outer end through its inner end, first meets a body's outline: [that point, the outer end]. */
function meet(body, { a, b }) {
  const sd = sdf(body), [inner, outer] = sd(a) < sd(b) ? [a, b] : [b, a];
  const O = new P.Point(...outer), I = new P.Point(...inner), far = I.add(I.subtract(O).normalize(30));
  const hits = body.getIntersections(new P.Path.Line({ from: O, to: far, insert: false }));
  const hit = hits.sort((h, k) => h.point.getDistance(O) - k.point.getDistance(O))[0];
  return [hit ? [hit.point.x, hit.point.y] : inner, outer];
}
const svg = (G, root, els) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${G} ${G}" width="${G}" height="${G}" ${root} aria-hidden="true">\n${els.map((e) => `  ${e}`).join("\n")}\n</svg>\n`;

function duotone(list) {
  const k = TRANSLATE.duotone, els = [], bodies = [];
  for (const p of list) {
    if (p.kind === "body") {
      bodies.push(shape(p.d));
      if (!p.front || pill(p.front)) { els.push(`<path d="${p.d}" fill="currentColor" fill-opacity="${k.tint}"/>`); continue; }
      const front = shape(p.front), sd = sdf(front);
      els.push(`<path d="${dOf(shape(p.d).subtract(grow(front, k.air), { insert: false }))}" fill="currentColor" fill-opacity="${k.tint}" stroke="none"/>`);
      const open = cut(p.d, { inside: (q) => sd(q) - k.air, minR: 0.5 });
      if (open) els.push(`<path d="${open}"/>`);
    } else if (p.kind === "line") {
      els.push(`<path d="${p.d}"/>`);
    } else if (isDot(p.d)) {
      els.push(`<path d="${p.d}" fill="currentColor" stroke="none"/>`);
    } else if (pill(p.d) && bodies.some((b) => b.getIntersections(shape(p.d)).length)) {
      const hit = bodies.find((b) => b.getIntersections(shape(p.d)).length), [a, b] = meet(hit, pill(p.d));
      els.push(`<path d="M${r2(a[0])} ${r2(a[1])} L${r2(b[0])} ${r2(b[1])}"/>`);
    } else if (Math.min(shape(p.d).bounds.width, shape(p.d).bounds.height) / 2 < k.solidR) {
      els.push(`<path d="${p.d}" fill="currentColor" stroke="none"/>`);
    } else {
      const s = shape(p.d), R = Math.min(s.bounds.width, s.bounds.height) / 2;
      s.scale((R - k.stroke / 2) / R, s.bounds.center);
      // a solid behind another opens where the front lies, as a body's contour does
      const sd = p.front ? sdf(shape(p.front)) : null, open = sd ? cut(dOf(s), { inside: (q) => sd(q) - k.air, minR: 0.5 }) : dOf(s);
      if (open) els.push(`<path d="${open}"/>`);
    }
  }
  return svg(k.G, `fill="none" stroke="currentColor" stroke-width="${k.stroke}" stroke-linecap="round" stroke-linejoin="round"`, els);
}

function filled(list) {
  const k = TRANSLATE.filled, els = [];
  const up = (d) => { const s = shape(d); s.scale(k.scale, new P.Point(12, 12)); s.translate(new P.Point(12, 12)); return s; };
  for (const p of list) {
    if (p.kind === "body") {
      const b = up(p.d), lit = b.clone({ insert: false });
      lit.translate(new P.Point(...k.shade));
      const shade = b.subtract(lit, { insert: false });
      els.push(`<path d="${dOf(b)}" fill="${PALETTE.fill}" stroke="none"/>`);
      if (!shade.isEmpty()) els.push(`<path d="${dOf(shade)}" fill="${PALETTE.shade}" stroke="none"/>`);
      els.push(`<path d="${dOf(b)}" stroke-width="${k.contour}"/>`);
    } else if (p.kind === "line") {
      els.push(`<path d="${dOf(up(p.d))}"/>`);
    } else if (isDot(p.d)) {
      const c = up(p.d).bounds.center;
      els.push(`<circle cx="${r2(c.x)}" cy="${r2(c.y)}" r="${k.dot}" fill="${PALETTE.line}" stroke="none"/>`);
    } else {
      els.push(`<path d="${dOf(up(p.d))}" fill="${PALETTE.shade}"/>`);
    }
  }
  return svg(k.G, `fill="none" stroke="${PALETTE.line}" stroke-width="${k.stroke}" stroke-linecap="round" stroke-linejoin="round"`, els);
}

/** One bulk icon's text in another finish. */
export function translate(text, to, { name = "icon" } = {}) {
  if (!FINISHES.includes(to)) refuse(`--to ${to}: one of ${FINISHES.join(", ")}`);
  const list = pieces(text, name);
  P = paper();
  return to === "duotone" ? duotone(list) : filled(list);
}

/** Every icon of a bulk folder in another finish: [{ name, text }]. */
export const translateSet = (folder, to) => readSet(folder).map((s) => ({ name: s.name, text: translate(s.text, to, { name: s.name }) }));

export const USAGE = "usage: node translate.mjs <bulk-folder> --to duotone|filled --out <folder>";

export function main(argv) {
  const opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
  const to = opt("--to"), out = opt("--out"), src = argv.find((a, i) => !a.startsWith("--") && !["--to", "--out"].includes(argv[i - 1]));
  if (!src || !to || !out) { console.error(USAGE); process.exit(1); }
  let isDir = false;
  try { isDir = statSync(src).isDirectory(); } catch {}
  if (!isDir) { console.error(`translate: ${src}: not a folder`); process.exit(1); }
  try {
    const set = translateSet(src, to);
    mkdirSync(out, { recursive: true });
    for (const s of set) writeFileSync(join(out, `${s.name}.svg`), s.text);
    console.log(`${set.length} icons → ${out} (${to})`);
  } catch (e) {
    if (!(e instanceof TranslateError)) throw e;
    console.error(`translate: ${e.message}`);
    process.exit(1);
  }
}

const entry = process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (entry) main(process.argv.slice(2));
