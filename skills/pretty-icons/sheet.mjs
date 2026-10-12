#!/usr/bin/env node
/**
 * Two sheets for a set that passes check.mjs: `node sheet.mjs <folder>`. With `--proof [--only <name>]`,
 * the proof sheet instead, pass or fail (proof.mjs): construction, finish, silhouette and pixels per icon.
 *   pretty-icons-sheet.png   for the author: the set in rows at 1× and 2×, light and dark (and on grey at the filled finish),
 *                            then a tile per icon with its ink box (solid) over the keyline it matched (dashed)
 *   pretty-icons-blind.png   for the reader: icons only, 2×, shuffled and numbered
 * With `--showcase`, pretty-icons-showcase.png instead: the set as one grid at twice its grid, no names, for the
 * eye to read as a whole. With `--shadow-pair` (the filled finish), pretty-icons-shadow-A.png and -B.png instead: the
 * blind sheet with and without the shadow (shadow.mjs), under shuffled letters, for the shadow read in read.md.
 * The key (number → name, letter → on or off) is printed, for the author alone. `--seed=<n>`
 * fixes the shuffle; `--out=<dir>` moves the files (default: a folder of the set's own
 * under pretty-icons/ in the system's temp folder, never the app). The paths are printed.
 */
import { createHash } from "node:crypto";
import { mkdirSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkSet, readSet, formatFailure } from "./check.mjs";
import { preset, toDark } from "./presets.mjs";
import { png } from "./raster.mjs";
import { parse } from "./svg.mjs";
import { shadowOn, shadowOff } from "./shadow.mjs";

const FONT = `font-family="system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"`;
const THEMES = { light: { bg: "#fafafa", ink: "#737373", text: "#171717" }, dark: { bg: "#0a0a0a", ink: "#8a8a8a", text: "#ededed" }, grey: { bg: "#edeeee", ink: "#2e3955", text: "#171717" } };
// The rows each finish is shown in: a sidebar glyph in light and dark at 1× and 2×; a filled icon
// in light, on grey and in dark at 1× (each tone swapped for its dark twin), then on grey at 2×.
const ROWS = { duotone: [["light", 1], ["dark", 1], ["light", 2], ["dark", 2]], filled: [["light", 1], ["grey", 1], ["dark", 1], ["grey", 2]] };
ROWS.bulk = ROWS.duotone;
const rowWidth = (G) => Math.max(180, G + 140);
const tileScale = (G) => (G > 24 ? 3 : 6);
const isCurrent = (v) => String(v ?? "").trim().toLowerCase() === "currentcolor";

/** A name made safe for <text>: a file name may hold &, < or >. */
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** An attribute value made safe inside double quotes. An entity already in the value is kept as it is. */
export const escAttr = (v) => String(v).replace(/&(?!(?:#\d+|#x[0-9a-f]+|[a-z]\w*);)/gi, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

// What an element may carry onto a sheet: geometry and paint. Anything else
// (data-*, aria-*, ids) is dropped, so no name reaches the blind sheet that way.
const DRAW_ATTRS = new Set(["x", "y", "width", "height", "rx", "ry", "cx", "cy", "r", "x1", "y1", "x2", "y2", "d", "pathLength", "transform",
  "fill", "fill-opacity", "fill-rule", "stroke", "stroke-width", "stroke-opacity", "stroke-dasharray", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "display", "visibility"]);
// Inherited paint the root may set beyond stroke-width, caps and joins.
const ROOT_INHERITED = ["stroke-dasharray", "fill-rule", "stroke-miterlimit"];

/**
 * An icon placed at (x, y), scaled to `size` px and coloured. Its markup is
 * rebuilt from the parsed elements, the ones check.mjs validated, so comments
 * and stray text in the file never reach the sheet. Every currentColor
 * becomes the colour itself, so nothing rests on the rasteriser resolving
 * `color` (and png() would otherwise turn it black). A colour written in
 * the file (the filled finish's ink and palette) stays as written.
 */
export function place(s, G, x, y, size, colour) {
  const { attrs: root, elements } = parse(s.text);
  const paint = (v) => escAttr(String(v).replace(/currentColor/gi, colour));
  const inner = elements.map((el) => `<${el.tag}${Object.entries(el.attrs).filter(([k]) => DRAW_ATTRS.has(k)).map(([k, v]) => ` ${k}="${paint(v)}"`).join("")} />`).join("");
  const inherited = ROOT_INHERITED.filter((k) => k in root).map((k) => ` ${k}="${paint(root[k])}"`).join("");
  // a root that fills in currentColor (bulk) fills the group and strokes nothing: each line carries its own stroke
  const fill = isCurrent(root.fill) ? colour : "none";
  const stroke = root.stroke ? (isCurrent(root.stroke) ? colour : escAttr(root.stroke)) : isCurrent(root.fill) ? "none" : colour;
  const width = root["stroke-width"] !== undefined ? ` stroke-width="${escAttr(root["stroke-width"])}"` : "";
  return `<g transform="translate(${x} ${y}) scale(${size / G})" fill="${fill}" stroke="${stroke}"${width} stroke-linecap="round" stroke-linejoin="round"${inherited}>${inner}</g>`;
}

function rowsBlock(set, G, scale, theme, x, y) {
  const t = THEMES[theme], icon = G * scale, rowH = (G + 12) * scale, w = rowWidth(G) * scale, pad = 10 * scale;
  let out = `<g data-theme="${theme}" data-scale="${scale}"><rect x="${x}" y="${y}" width="${w}" height="${set.length * rowH + pad * 2}" rx="${8 * scale}" fill="${t.bg}" />`;
  set.forEach((s, i) => {
    const cy = y + pad + i * rowH + rowH / 2;
    const glyph = place(s, G, x + pad, cy - icon / 2, icon, t.ink);
    out += theme === "dark" ? toDark(glyph) : glyph;
    out += `<text x="${x + pad + icon + 10 * scale}" y="${cy + 4.5 * scale}" ${FONT} font-size="${13 * scale}" fill="${t.text}">${esc(s.name)}</text>`;
  });
  return out + "</g>";
}

function keylineTiles(set, G, rows, x, y, finish) {
  const S = tileScale(G), tile = G * S + 24, pitch = Math.max(tile + 12, 168), perRow = 5;
  let out = `<g data-keyline="tiles">`;
  set.forEach((s, i) => {
    const row = rows.find((r) => r.icon === s.name) ?? {};
    const tx = x + (i % perRow) * pitch, ty = y + Math.floor(i / perRow) * (tile + 36);
    out += `<rect x="${tx}" y="${ty}" width="${G * S}" height="${G * S}" fill="#fff" stroke="#e5e5e5" />`;
    for (let g = 1; g < G; g++) out += `<path d="M${tx + g * S} ${ty}v${G * S}M${tx} ${ty + g * S}h${G * S}" stroke="#f0f0f0" />`;
    out += place(s, G, tx, ty, G * S, "#262626");
    if (row.keyline && row.keyline !== "—") {
      const { keylines, centre: [cx, cy] } = preset(G, finish), [kw, kh] = keylines[row.keyline];
      out += `<rect x="${tx + (cx - kw / 2) * S}" y="${ty + (cy - kh / 2) * S}" width="${kw * S}" height="${kh * S}" fill="none" stroke="#3b82f6" stroke-opacity=".9" stroke-dasharray="4 3" />`;
    }
    // the ink box, thin and solid, over the keyline: an off-centre body shows as the gap between them
    if (row.w > 0) out += `<rect data-ink-box="${escAttr(s.name)}" x="${tx + row.x0 * S}" y="${ty + row.y0 * S}" width="${row.w * S}" height="${row.h * S}" fill="none" stroke="#f97316" stroke-width=".75" />`;
    const sign = (v) => `${v >= 0 ? "+" : ""}${v}`;
    const lines = [esc(s.name), `${row.w} × ${row.h} · ${row.keyline ?? "—"}`, `ink ${row.ink} · mass ${sign(row.dx)}, ${sign(row.dy)}`];
    lines.forEach((l, k) => { out += `<text x="${tx}" y="${ty + G * S + 16 + k * 14}" ${FONT} font-size="11" fill="${k ? "#737373" : "#262626"}">${l}</text>`; });
  });
  return out + "</g>";
}

export function composeSheet(set, G, rows, finish) {
  const left = 24, top = 24, gapX = 24, blocks = ROWS[preset(G, finish).finish], rw = rowWidth(G), S = tileScale(G);
  const rowsH = Math.max(...blocks.map(([, scale]) => set.length * (G + 12) * scale + 20 * scale));
  const tilesY = top + rowsH + 48, tilesH = Math.ceil(set.length / 5) * (G * S + 60);
  const W = 24 + blocks.reduce((w, [, scale]) => w + rw * scale + gapX, 0) - gapX + 24, H = tilesY + tilesH + 24;
  let x = left, out = "";
  for (const [theme, scale] of blocks) { out += rowsBlock(set, G, scale, theme, x, top); x += rw * scale + gapX; }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#fff" />`
    + out + keylineTiles(set, G, rows, left, tilesY, finish) + "</svg>";
}

/** mulberry32: a small seeded shuffle so a test can pin the order. */
function shuffled(items, seed) {
  let a = seed >>> 0;
  const rnd = () => { a = (a + 0x6d2b79f5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}

export function composeBlind(set, G, seed = Date.now(), finish) {
  const order = shuffled(set, seed), icon = G * 2, cell = icon + 48, perRow = 5, bg = THEMES[preset(G, finish).finish === "filled" ? "grey" : "light"].bg;
  const W = 24 * 2 + perRow * cell, H = 24 * 2 + Math.ceil(order.length / perRow) * cell;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${bg}" />`;
  const key = order.map((s, i) => {
    const x = 24 + (i % perRow) * cell + 24, y = 24 + Math.floor(i / perRow) * cell + 8;
    svg += place(s, G, x, y, icon, "#737373");
    svg += `<text x="${x + icon / 2}" y="${y + icon + 18}" text-anchor="middle" ${FONT} font-size="12" fill="#171717">${i + 1}</text>`;
    return { n: i + 1, name: s.name };
  });
  return { svg: svg + "</svg>", key };
}

/** The set as one grid on its finish's page, at twice its grid, five to a row: no names, no tiles. */
export function composeShowcase(set, G, finish) {
  const t = THEMES[preset(G, finish).finish === "filled" ? "grey" : "light"], icon = G * 2, gap = Math.max(16, G), perRow = 5;
  const cols = Math.min(perRow, set.length), rows = Math.ceil(set.length / perRow);
  const W = gap * 2 + cols * icon + (cols - 1) * gap, H = gap * 2 + rows * icon + (rows - 1) * gap;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${t.bg}" />`;
  set.forEach((s, i) => { svg += place(s, G, gap + (i % perRow) * (icon + gap), gap + Math.floor(i / perRow) * (icon + gap), icon, t.ink); });
  return svg + "</svg>";
}

/**
 * The set with its shadow and without, as two blind sheets in one order, under letters the seed shuffles:
 * { A, B } the two sheets' markup, key { A, B } each "on" or "off".
 */
export function composeShadowPair(set, G, seed = Date.now()) {
  const sides = shuffled([["on", shadowOn], ["off", shadowOff]], seed);
  const [A, B] = sides.map(([, fn]) => composeBlind(set.map((s) => ({ ...s, text: fn(s.text) })), G, seed).svg);
  return { A, B, key: { A: sides[0][0], B: sides[1][0] } };
}

const widthOf = (svg) => Number(/width="(\d+)"/.exec(svg)[1]);

/** The set as check.mjs judged it; a set it refuses or cannot measure gets no sheet. */
async function passed(dir) {
  const r = await checkSet(dir);
  if (!r.measured) throw new Error(`check: not measured: ${r.why}`);
  if (r.failures.length) throw new Error(`check failed:\n${r.failures.map(formatFailure).join("\n")}`);
  return r;
}

/**
 * Where the sheets go without --out: <tmp>/pretty-icons/<parent>-<hash>, the parent
 * folder's name and the first 8 hex of the sha1 of the folder's absolute path. Two
 * folders never share it, so two agents drawing at once never overwrite each other;
 * one folder always gets the same one.
 */
export function defaultOut(folder) {
  const dir = resolve(folder);
  return join(tmpdir(), "pretty-icons", `${basename(dirname(dir))}-${createHash("sha1").update(dir).digest("hex").slice(0, 8)}`);
}

export async function writeSheets(folder, { out, seed = Date.now() % 2 ** 32 } = {}) {
  const dir = resolve(folder), dest = out ? resolve(out) : defaultOut(dir);
  const r = await passed(dir), set = readSet(dir);
  mkdirSync(dest, { recursive: true });
  const sheet = join(dest, "pretty-icons-sheet.png"), blind = join(dest, "pretty-icons-blind.png");
  const sheetSvg = composeSheet(set, r.G, r.rows, r.finish);
  writeFileSync(sheet, png(sheetSvg, widthOf(sheetSvg)));
  const b = composeBlind(set, r.G, seed, r.finish);
  writeFileSync(blind, png(b.svg, widthOf(b.svg)));
  return { sheet, blind, key: b.key, seed };
}

export async function writeShowcase(folder, { out } = {}) {
  const dir = resolve(folder), dest = out ? resolve(out) : defaultOut(dir);
  const r = await passed(dir), svg = composeShowcase(readSet(dir), r.G, r.finish);
  mkdirSync(dest, { recursive: true });
  const showcase = join(dest, "pretty-icons-showcase.png");
  writeFileSync(showcase, png(svg, widthOf(svg)));
  return { showcase };
}

export async function writeShadowPair(folder, { out, seed = Date.now() % 2 ** 32 } = {}) {
  const dir = resolve(folder), dest = out ? resolve(out) : defaultOut(dir);
  const r = await passed(dir);
  if (preset(r.G, r.finish).finish !== "filled") throw new Error("--shadow-pair: a shadow at the filled finish only (48)");
  const pair = composeShadowPair(readSet(dir), r.G, seed);
  mkdirSync(dest, { recursive: true });
  const A = join(dest, "pretty-icons-shadow-A.png"), B = join(dest, "pretty-icons-shadow-B.png");
  writeFileSync(A, png(pair.A, widthOf(pair.A)));
  writeFileSync(B, png(pair.B, widthOf(pair.B)));
  return { A, B, key: pair.key, seed };
}

const USAGE = "usage: node sheet.mjs <folder> [--seed=<n>] [--out=<dir>] | node sheet.mjs <folder> --showcase [--out=<dir>] | node sheet.mjs <folder> --shadow-pair [--seed=<n>] [--out=<dir>] | node sheet.mjs <folder> --proof [--only <name>] [--out=<dir>]";

/** The folder, seed and out from argv, and one of --showcase, --shadow-pair or --proof (with its --only); null when anything in it is not one of those. */
export function parseArgs(argv) {
  const r = { folder: undefined, seed: undefined, out: undefined };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) { if (r.folder !== undefined) return null; r.folder = a; continue; }
    const mode = { "--proof": "proof", "--showcase": "showcase", "--shadow-pair": "shadowPair" }[a];
    if (mode) { if (r[mode]) return null; r[mode] = true; continue; }
    if (a === "--only") { const v = argv[++i]; if (v === undefined || v.startsWith("--") || r.only !== undefined) return null; r.only = v; continue; }
    const m = /^--(seed|out|only)=(.+)$/.exec(a);
    if (!m || r[m[1]] !== undefined) return null;
    if (m[1] === "seed" && !/^\d+$/.test(m[2])) return null;
    r[m[1]] = m[1] === "seed" ? Number(m[2]) : m[2];
  }
  // one mode at most; --only is for the proof; --seed shuffles a blind sheet, which the proof and the showcase do not draw
  if ([r.proof, r.showcase, r.shadowPair].filter(Boolean).length > 1) return null;
  if (r.folder === undefined || (r.only !== undefined && !r.proof) || ((r.proof || r.showcase) && r.seed !== undefined)) return null;
  return r;
}

export async function main(argv) {
  const args = parseArgs(argv);
  if (!args) { console.error(USAGE); process.exit(1); }
  try {
    if (args.proof) {
      const { writeProof } = await import("./proof.mjs");
      console.log(writeProof(args.folder, { out: args.out, only: args.only }));
      return;
    }
    if (args.showcase) { console.log((await writeShowcase(args.folder, { out: args.out })).showcase); return; }
    if (args.shadowPair) {
      const p = await writeShadowPair(args.folder, { out: args.out, seed: args.seed });
      console.log(p.A); console.log(p.B);
      console.log(`key: A ${p.key.A} · B ${p.key.B}`);
      console.log(`seed: ${p.seed}`);
      return;
    }
    const r = await writeSheets(args.folder, { out: args.out, seed: args.seed });
    console.log(r.sheet); console.log(r.blind);
    console.log("key: " + r.key.map((k) => `${k.n} ${k.name}`).join(" · "));
    console.log(`seed: ${r.seed}`);
  } catch (e) { console.error(e.message); process.exit(1); }
}

const entry = process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (entry) main(process.argv.slice(2));
