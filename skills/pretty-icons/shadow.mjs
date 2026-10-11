#!/usr/bin/env node
/**
 * The offset shadow, at the filled finish, chosen per set: `node shadow.mjs <folder> --on|--off`.
 * --on puts a copy of every element first in each file, one per line, moved SHADOW down and right and
 * painted in the shade tone, each marked data-shadow=""; --off takes them out, and the file is byte for
 * byte as it was before --on. The drawer never draws a shadow: check.mjs names a copy that is missing,
 * extra, moved or out of order, and a set shadowed in part.
 */
import { readdirSync, readFileSync, writeFileSync, realpathSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { preset, GRIDS, PALETTE, SHADOW } from "./presets.mjs";
import { parse, G as gridOf, GEOMETRY_ATTRS, geometryKey } from "./svg.mjs";

export class ShadowError extends Error {}
const refuse = (m) => { throw new ShadowError(m); };
export const isShadow = (el) => !!el && "data-shadow" in el.attrs;
export const MOVE = `translate(${SHADOW} ${SHADOW})`;
// a copy is one element on a line of its own: --off takes the line out with its newline
const OFF = /\n[ \t]*<[^>]*\sdata-shadow=""[^>]*\/>/g;
const ROOT = /<svg\b[^>]*>/;
const isNone = (v) => v !== undefined && String(v).trim().toLowerCase() === "none";

/** An element's shadow: its geometry, the shade tone where it paints, a stroke kept at its own width. */
export function copyOf(el, root) {
  const attrs = {};
  for (const [k, v] of Object.entries(el.attrs)) if (GEOMETRY_ATTRS.includes(k)) attrs[k] = v;
  if (el.attrs.fill !== undefined && !isNone(el.attrs.fill)) attrs.fill = PALETTE.shade;
  if (isNone(el.attrs.stroke ?? root.stroke)) attrs.stroke = "none";
  else {
    attrs.stroke = PALETTE.shade;
    if ("stroke-width" in el.attrs) attrs["stroke-width"] = el.attrs["stroke-width"];
  }
  return { tag: el.tag, attrs: { ...attrs, "data-shadow": "", transform: MOVE } };
}
const text = (el) => `<${el.tag} ${Object.entries(el.attrs).map(([k, v]) => `${k}="${v}"`).join(" ")} />`;
// what a copy and an element's expected copy must share
const key = (el) => [geometryKey(el), el.attrs.fill ?? "", el.attrs.stroke ?? "", el.attrs["stroke-width"] ?? ""].join("|");

/** The icon without its shadow. */
export const shadowOff = (svg) => svg.replace(OFF, "");

/** The icon with its shadow, written fresh: on twice is on once. */
export function shadowOn(svg) {
  const clean = shadowOff(svg), parsed = parse(clean), G = gridOf(parsed.attrs);
  if (!GRIDS[G] || preset(G).finish !== "filled") refuse("a shadow at the filled finish only (48)");
  const m = ROOT.exec(clean);
  const end = m.index + m[0].length, indent = /^\n([ \t]*)/.exec(clean.slice(end))?.[1] ?? "";
  const copies = parsed.elements.map((el) => `\n${indent}${text(copyOf(el, parsed.attrs))}`).join("");
  return clean.slice(0, end) + copies + clean.slice(end);
}

/** check.mjs's shadow rule: every element copied once, nothing else, each moved MOVE, all of them first; none in duotone. */
export function shadowFailures(icon, parsed, G) {
  const out = [], f = (got, want) => out.push({ rule: "shadow", icon, got, want });
  const shadows = parsed.elements.filter(isShadow);
  if (!shadows.length) return out;
  if (!GRIDS[G] || preset(G).finish !== "filled") { f("a shadow at the duotone finish", "none"); return out; }
  const own = parsed.elements.filter((el) => !isShadow(el)), again = "re-run shadow.mjs --on";
  for (const s of shadows) if (s.attrs.transform !== MOVE) f(`${s.at} transform ${s.attrs.transform ?? "missing"}`, `${MOVE}: ${again}`);
  const late = own.length ? shadows.find((s) => s.index > own[0].index) : null;
  if (late) f(`${late.at} after ${own[0].at}`, `every shadow first, under the icon: ${again}`);
  // two ways: each element has its copy, and each copy an element
  const left = new Map();
  for (const s of shadows) left.set(key(s), [...(left.get(key(s)) ?? []), s]);
  for (const el of own) if (!left.get(key(copyOf(el, parsed.attrs)))?.shift()) f(`${el.at} not in the shadow`, again);
  for (const s of [...left.values()].flat()) f(`${s.at} not a copy of the icon`, again);
  return out;
}

export const USAGE = "usage: node shadow.mjs <folder> --on|--off";

/** Every icon in the folder read and judged before any is written: one refusal writes nothing. */
export function shadowFolder(folder, on) {
  const dir = resolve(folder), files = readdirSync(dir).filter((f) => f.endsWith(".svg")).sort();
  if (!files.length) refuse(`${folder}: no .svg files`);
  const out = files.map((f) => {
    const svg = readFileSync(join(dir, f), "utf8");
    try { return [join(dir, f), on ? shadowOn(svg) : shadowOff(svg)]; } catch (e) { if (e instanceof ShadowError) refuse(`${f}: ${e.message}`); throw e; }
  });
  for (const [p, svg] of out) writeFileSync(p, svg);
  return out.length;
}

export function main(argv) {
  const folder = argv.find((a) => !a.startsWith("--")), on = argv.includes("--on"), off = argv.includes("--off");
  let isDir = false;
  try { isDir = statSync(folder).isDirectory(); } catch {}
  if (!folder || on === off || !isDir || argv.some((a) => a.startsWith("--") && a !== "--on" && a !== "--off")) { console.error(USAGE); process.exit(1); }
  try {
    console.log(`shadow ${on ? "on" : "off"}: ${shadowFolder(folder, on)} icons`);
  } catch (e) {
    if (!(e instanceof ShadowError)) throw e;
    console.error(`shadow: ${e.message}`);
    process.exit(1);
  }
}

const entry = process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (entry) main(process.argv.slice(2));
