#!/usr/bin/env node
// The measurable rules a piece has to pass before a render: the contract and the materials in Node, then
// the seam, the fit and the light outside the tile measured in the page (256 px raster, dark theme).
//
//   node validate.mjs <piece>      prints each failed rule with its reason and a number; exit 1 on any
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { contract, loadPiece } from "./piece.mjs";
import { requireChrome, session } from "./session.mjs";

const SIZE = 256;
export const LIMITS = { seam: 0.5, over: 0.03, edgeGap: 0.04, outside: 2 };

const pct = (v) => `${(v * 100).toFixed(1)}%`;

/** { ok, failures: [{ rule, message, value }] }. Browser rules run only once the Node rules pass. */
export async function validate(piece) {
  const failures = [];
  const fail = (rule, message, value) => failures.push({ rule, message, value });
  let p;
  try { p = await loadPiece(piece); } catch (e) {
    if (/^Expected a file named|not found$/.test(e.message)) throw e;
    fail("contract", e.message, "import");
    return { ok: false, failures };
  }
  for (const m of contract(p)) fail("contract", m, m.match(/\(got (.*)\)$/)?.[1] ?? "missing");
  const source = readFileSync(p.file, "utf8");
  const ctor = source.match(/\b\w*Material\s*\(/);
  if (ctor) fail("materials", `\`${ctor[0].replace(/\s+/g, "")}\` builds a material by hand: take every material from \`mat.*\` (body, chrome, glass, inlay, glow, light) so both themes get it right`, ctor[0].replace(/\s*\($/, ""));
  if (failures.length) return { ok: false, failures };

  const s = await session(p.file, { chrome: requireChrome() });
  try {
    let page;
    try { page = await s.open({ theme: "dark", mode: "rt", size: SIZE }); } catch (e) {
      const message = String(e.message);
      if (/ctx\.texture\(\) can be called once/.test(message)) fail("one-texture", message, 2);
      else if (e.code === "BOOT_TIMEOUT") throw e;
      else fail("contract", message, "runtime");
      return { ok: false, failures };
    }
    try {
      const m = await page.page.evaluate("__specimen.measure()");
      if (m.seam > LIMITS.seam) fail("seam", `the loop jumps: frame 0 and the frame after the last differ by ${m.seam.toFixed(2)} on average (limit ${LIMITS.seam}); use whole turns and integer harmonics of phase · TAU`, Number(m.seam.toFixed(2)));
      for (const f of m.fit) {
        if (f.over > LIMITS.over) fail("fit", `frame ${f.frame}: the object leaves the 58% safe area by ${pct(f.over)} of the tile (limit ${pct(LIMITS.over)}); lower scene.fit.scale or move it with fit.x / fit.y`, Number(f.over.toFixed(3)));
        if (f.edgeGap < LIMITS.edgeGap) fail("fit", `frame ${f.frame}: the object comes within ${pct(Math.max(0, f.edgeGap))} of the tile edge (at least ${pct(LIMITS.edgeGap)})`, Number(f.edgeGap.toFixed(3)));
      }
      if (m.outsideMax > LIMITS.outside) fail("light-in-tile", `something outside the tile is ${m.outsideMax.toFixed(1)}/255 brighter than the page (limit ${LIMITS.outside}); keep glow and light inside the tile`, Number(m.outsideMax.toFixed(1)));
    } finally { await page.close(); }
  } finally { await s.close(); }
  return { ok: failures.length === 0, failures };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  const { positionals } = parseArgs({ allowPositionals: true, options: {} });
  if (positionals.length !== 1) { console.error("usage: node validate.mjs <name>.specimen.js"); process.exit(2); }
  try {
    const r = await validate(positionals[0]);
    if (r.ok) console.log("ok: contract, materials, seam, fit, light in the tile, one texture");
    for (const f of r.failures) console.log(`✗ ${f.rule}: ${f.message} [${f.value}]`);
    process.exit(r.ok ? 0 : 1);
  } catch (e) { console.error(e.message); process.exit(1); }
}
