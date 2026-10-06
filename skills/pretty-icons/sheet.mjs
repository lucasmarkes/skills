#!/usr/bin/env node
/**
 * Two sheets for a set that passes check.mjs: `node sheet.mjs <folder>`.
 *   pretty-icons-sheet.png   for the author: the set in sidebar rows at 1× and 2×, light and dark,
 *                            then a tile per icon with its ink box (solid) over the keyline it matched (dashed)
 *   pretty-icons-blind.png   for the reader: icons only, 2×, shuffled and numbered
 * The key (number → name) is printed, for the author alone. `--seed=<n>`
 * fixes the shuffle; `--out=<dir>` moves the files (default: a folder of the set's own
 * under pretty-icons/ in the system's temp folder, never the app). The paths are printed.
 */
import { createHash } from "node:crypto";
import { mkdirSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkSet, readSet, formatFailure } from "./check.mjs";
import { preset } from "./presets.mjs";
import { png } from "./raster.mjs";
import { parse } from "./svg.mjs";

const FONT = `font-family="system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"`;
const THEMES = { light: { bg: "#fafafa", ink: "#737373", text: "#171717" }, dark: { bg: "#0a0a0a", ink: "#8a8a8a", text: "#ededed" } };

/** A name made safe for <text>: a file name may hold &, < or >. */
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** An attribute value made safe inside double quotes. An entity already in the value is kept as it is. */
const escAttr = (v) => String(v).replace(/&(?!(?:#\d+|#x[0-9a-f]+|[a-z]\w*);)/gi, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

// What an element may carry onto a sheet: geometry and paint. Anything else
// (data-*, aria-*, ids) is dropped, so no name reaches the blind sheet that way.
const DRAW_ATTRS = new Set(["x", "y", "width", "height", "rx", "ry", "cx", "cy", "r", "x1", "y1", "x2", "y2", "d", "pathLength",
  "fill", "fill-opacity", "fill-rule", "stroke", "stroke-dasharray", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "display", "visibility"]);
// Inherited paint the root may set beyond stroke-width, caps and joins.
const ROOT_INHERITED = ["stroke-dasharray", "fill-rule", "stroke-miterlimit"];

/**
 * An icon placed at (x, y), scaled to `size` px and coloured. Its markup is
 * rebuilt from the parsed elements, the ones check.mjs validated, so comments
 * and stray text in the file never reach the sheet. Every currentColor
 * becomes the colour itself, so nothing rests on the rasteriser resolving
 * `color` (and png() would otherwise turn it black).
 */
function place(s, G, x, y, size, colour) {
  const { attrs: root, elements } = parse(s.text);
  const paint = (v) => escAttr(String(v).replace(/currentColor/gi, colour));
  const inner = elements.map((el) => `<${el.tag}${Object.entries(el.attrs).filter(([k]) => DRAW_ATTRS.has(k)).map(([k, v]) => ` ${k}="${paint(v)}"`).join("")} />`).join("");
  const inherited = ROOT_INHERITED.filter((k) => k in root).map((k) => ` ${k}="${paint(root[k])}"`).join("");
  return `<g transform="translate(${x} ${y}) scale(${size / G})" fill="none" stroke="${colour}" stroke-width="${escAttr(root["stroke-width"])}" stroke-linecap="round" stroke-linejoin="round"${inherited}>${inner}</g>`;
}

function rowsBlock(set, G, scale, theme, x, y) {
  const t = THEMES[theme], icon = G * scale, rowH = 28 * scale, w = 180 * scale, pad = 10 * scale;
  let out = `<g data-theme="${theme}" data-scale="${scale}"><rect x="${x}" y="${y}" width="${w}" height="${set.length * rowH + pad * 2}" rx="${8 * scale}" fill="${t.bg}" />`;
  set.forEach((s, i) => {
    const cy = y + pad + i * rowH + rowH / 2;
    out += place(s, G, x + pad, cy - icon / 2, icon, t.ink);
    out += `<text x="${x + pad + icon + 10 * scale}" y="${cy + 4.5 * scale}" ${FONT} font-size="${13 * scale}" fill="${t.text}">${esc(s.name)}</text>`;
  });
  return out + "</g>";
}

function keylineTiles(set, G, rows, x, y) {
  const S = 6, tile = G * S + 24, pitch = Math.max(tile + 12, 168), perRow = 5;
  let out = `<g data-keyline="tiles">`;
  set.forEach((s, i) => {
    const row = rows.find((r) => r.icon === s.name) ?? {};
    const tx = x + (i % perRow) * pitch, ty = y + Math.floor(i / perRow) * (tile + 36);
    out += `<rect x="${tx}" y="${ty}" width="${G * S}" height="${G * S}" fill="#fff" stroke="#e5e5e5" />`;
    for (let g = 1; g < G; g++) out += `<path d="M${tx + g * S} ${ty}v${G * S}M${tx} ${ty + g * S}h${G * S}" stroke="#f0f0f0" />`;
    out += place(s, G, tx, ty, G * S, "#262626");
    if (row.keyline && row.keyline !== "—") {
      const [kw, kh] = preset(G).keylines[row.keyline];
      out += `<rect x="${tx + (G - kw) / 2 * S}" y="${ty + (G - kh) / 2 * S}" width="${kw * S}" height="${kh * S}" fill="none" stroke="#3b82f6" stroke-opacity=".9" stroke-dasharray="4 3" />`;
    }
    // the ink box, thin and solid, over the keyline: an off-centre body shows as the gap between them
    if (row.w > 0) out += `<rect data-ink-box="${escAttr(s.name)}" x="${tx + row.x0 * S}" y="${ty + row.y0 * S}" width="${row.w * S}" height="${row.h * S}" fill="none" stroke="#f97316" stroke-width=".75" />`;
    const sign = (v) => `${v >= 0 ? "+" : ""}${v}`;
    const lines = [esc(s.name), `${row.w} × ${row.h} · ${row.keyline ?? "—"}`, `ink ${row.ink} · mass ${sign(row.dx)}, ${sign(row.dy)}`];
    lines.forEach((l, k) => { out += `<text x="${tx}" y="${ty + G * S + 16 + k * 14}" ${FONT} font-size="11" fill="${k ? "#737373" : "#262626"}">${l}</text>`; });
  });
  return out + "</g>";
}

export function composeSheet(set, G, rows) {
  const left = 24, top = 24, gapX = 24;
  const h1 = set.length * 28 + 20, h2 = set.length * 56 + 40;
  const tilesY = top + Math.max(h1, h2) + 48, tilesH = Math.ceil(set.length / 5) * (G * 6 + 60);
  const W = 24 + 180 + gapX + 180 + gapX + 360 + gapX + 360 + 24, H = tilesY + tilesH + 24;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#fff" />`
    + rowsBlock(set, G, 1, "light", left, top) + rowsBlock(set, G, 1, "dark", left + 180 + gapX, top)
    + rowsBlock(set, G, 2, "light", left + 2 * (180 + gapX), top) + rowsBlock(set, G, 2, "dark", left + 2 * (180 + gapX) + 360 + gapX, top)
    + keylineTiles(set, G, rows, left, tilesY) + "</svg>";
}

/** mulberry32: a small seeded shuffle so a test can pin the order. */
function shuffled(items, seed) {
  let a = seed >>> 0;
  const rnd = () => { a = (a + 0x6d2b79f5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}

export function composeBlind(set, G, seed = Date.now()) {
  const order = shuffled(set, seed), icon = G * 2, cell = icon + 48, perRow = 5;
  const W = 24 * 2 + perRow * cell, H = 24 * 2 + Math.ceil(order.length / perRow) * cell;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#fafafa" />`;
  const key = order.map((s, i) => {
    const x = 24 + (i % perRow) * cell + 24, y = 24 + Math.floor(i / perRow) * cell + 8;
    svg += place(s, G, x, y, icon, "#737373");
    svg += `<text x="${x + icon / 2}" y="${y + icon + 18}" text-anchor="middle" ${FONT} font-size="12" fill="#171717">${i + 1}</text>`;
    return { n: i + 1, name: s.name };
  });
  return { svg: svg + "</svg>", key };
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
  const r = await checkSet(dir);
  if (!r.measured) throw new Error(`check: not measured: ${r.why}`);
  if (r.failures.length) throw new Error(`check failed:\n${r.failures.map(formatFailure).join("\n")}`);
  const set = readSet(dir);
  mkdirSync(dest, { recursive: true });
  const sheet = join(dest, "pretty-icons-sheet.png"), blind = join(dest, "pretty-icons-blind.png");
  const sheetSvg = composeSheet(set, r.G, r.rows);
  writeFileSync(sheet, png(sheetSvg, Number(/width="(\d+)"/.exec(sheetSvg)[1])));
  const b = composeBlind(set, r.G, seed);
  writeFileSync(blind, png(b.svg, Number(/width="(\d+)"/.exec(b.svg)[1])));
  return { sheet, blind, key: b.key, seed };
}

const USAGE = "usage: node sheet.mjs <folder> [--seed=<n>] [--out=<dir>]";

/** The folder, seed and out from argv, or null when anything in it is not one of those. */
export function parseArgs(argv) {
  const r = { folder: undefined, seed: undefined, out: undefined };
  for (const a of argv) {
    if (!a.startsWith("--")) { if (r.folder !== undefined) return null; r.folder = a; continue; }
    const m = /^--(seed|out)=(.+)$/.exec(a);
    if (!m || r[m[1]] !== undefined) return null;
    if (m[1] === "seed" && !/^\d+$/.test(m[2])) return null;
    r[m[1]] = m[1] === "seed" ? Number(m[2]) : m[2];
  }
  return r.folder === undefined ? null : r;
}

export async function main(argv) {
  const args = parseArgs(argv);
  if (!args) { console.error(USAGE); process.exit(1); }
  try {
    const r = await writeSheets(args.folder, { out: args.out, seed: args.seed });
    console.log(r.sheet); console.log(r.blind);
    console.log("key: " + r.key.map((k) => `${k.n} ${k.name}`).join(" · "));
    console.log(`seed: ${r.seed}`);
  } catch (e) { console.error(e.message); process.exit(1); }
}

const entry = process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (entry) main(process.argv.slice(2));
