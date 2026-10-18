#!/usr/bin/env node
// A contact sheet: one row per (piece, theme), dark then light, 256 px cells of raster frames, and
// with --pt one path traced cell (frame 0, 32 spp, denoised) closing each row. For checking a
// piece's fit and both themes before a full render.
//
//   node sheet.mjs <piece...> [--frames 0,60,120,180] [--pt] [--guide] [--out sheet.png]
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { contract, loadPiece } from "./piece.mjs";
import { requireChrome, session } from "./session.mjs";

const CELL = 256;
const png = (buf) => `data:image/png;base64,${buf.toString("base64")}`;

/** Renders the sheet to out; resolves to its path. */
export async function sheet({ pieces, frames = [0, 60, 120, 180], pt = false, guide = false, out = "sheet.png", log = console.log }) {
  const loaded = [];
  for (const file of pieces) {
    const p = await loadPiece(file);
    const broken = contract(p);
    if (broken.length) throw new Error(`${p.name}: ${broken.join("; ")}`);
    loaded.push(p);
  }
  const chrome = requireChrome();
  const query = guide ? { guide: "1" } : {};
  const rows = [];
  let last;
  for (const p of loaded) {
    const s = await session(p.file, { chrome });
    try {
      for (const theme of ["dark", "light"]) {
        log(`${p.name} · ${theme}`);
        const row = [];
        const rt = await s.open({ theme, mode: "rt", size: CELL * 2, query });
        try { for (const f of frames) row.push(png(await rt.frame(f % rt.info.frames, 1))); } finally { await rt.close(); }
        if (pt) {
          const st = await s.open({ theme, mode: "pt", size: CELL * 2, denoise: true, query });
          try { row.push(png(await st.frame(0, 32))); } finally { await st.close(); }
        }
        rows.push(row);
      }
    } finally { await s.close(); }
    last = p;
  }
  // the grid is drawn in a page, so Node never decodes a PNG
  const s = await session(last.file, { chrome });
  try {
    const page = await s.open({ theme: "dark", mode: "rt", size: 64 });
    try {
      const url = await page.page.evaluate(`__specimen.sheet(${JSON.stringify(rows)}, ${CELL})`);
      out = resolve(out);
      writeFileSync(out, Buffer.from(url.split(",")[1], "base64"));
    } finally { await page.close(); }
  } finally { await s.close(); }
  return out;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  const { values: o, positionals } = parseArgs({ allowPositionals: true, options: {
    frames: { type: "string" }, pt: { type: "boolean", default: false }, guide: { type: "boolean", default: false },
    out: { type: "string", default: "sheet.png" },
  } });
  if (!positionals.length) { console.error("usage: node sheet.mjs <name>.specimen.js... [--frames 0,60,120,180] [--pt] [--guide] [--out sheet.png]"); process.exit(1); }
  try {
    console.log(await sheet({ pieces: positionals, frames: o.frames?.split(",").map(Number), pt: o.pt, guide: o.guide, out: o.out }));
  } catch (e) { console.error(e.message); process.exit(1); }
}
