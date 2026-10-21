#!/usr/bin/env node
// A piece → media per theme. Video: <name>-<theme>.webm, .mp4 and -poster.jpg, path traced.
// Live: the runtime and the piece copied beside a poster per theme. Prints the files and the snippet.
//
//   node render.mjs <piece> [--themes dark,light] [--out <dir>] [--size 768] [--samples 32] [--live] [--video] [--frames 0,60]
import { execFile, execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { contract, isMain, loadPiece, pieceName } from "./piece.mjs";
import { tempDir } from "./cdp.mjs";
import { RUNTIME, requireChrome, session } from "./session.mjs";

export const FPS = 30;
const THEMES = ["dark", "light"];
// the 768 px render is supersampled down to 640 px, as in the approved lab encodes
const outSide = (size) => 2 * Math.round((size * 5) / 12);

function requireFfmpeg() {
  try { execFileSync("ffmpeg", ["-version"], { stdio: "ignore" }); } catch {
    throw new Error("ffmpeg not found: install it (brew install ffmpeg) or pass --live");
  }
}

const ffmpeg = (args) => new Promise((ok, fail) => execFile("ffmpeg", ["-v", "error", "-y", ...args], (err, _o, stderr) =>
  err ? fail(new Error(`ffmpeg: ${stderr.trim() || err.message}`)) : ok()));

const BT709 = "scale=out_color_matrix=bt709,format=yuv420p,setparams=colorspace=bt709:color_primaries=bt709:color_trc=bt709";

async function encode(frames, base, side) {
  const input = ["-framerate", String(FPS), "-i", join(frames, "f%04d.png"), "-vf", `scale=${side}:${side}:flags=lanczos,${BT709}`, "-an"];
  await ffmpeg([...input, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "34", "-row-mt", "1", `${base}.webm`]);
  await ffmpeg([...input, "-c:v", "libx264", "-crf", "22", "-preset", "slow", "-movflags", "+faststart", `${base}.mp4`]);
}

/** The HTML to paste. prefix is where the out folder is served from ("/icons"). */
export function snippet({ name, themes, prefix, video = true, live = false }) {
  const at = (f) => `${prefix}/${f}`;
  const first = themes.includes("dark") ? "dark" : themes[0];
  const parts = [];
  if (video) {
    const src = (t, media) => [`webm`, `mp4`].map((ext) =>
      `  <source src="${at(`${name}-${t}.${ext}`)}" type="video/${ext}"${media ? ` media="(prefers-color-scheme: ${t})"` : ""}>`);
    const lines = themes.length > 1
      ? [...src(themes.find((t) => t !== first), true), ...src(first, false)]
      : src(first, false);
    parts.push([`<video autoplay muted loop playsinline poster="${at(`${name}-${first}-poster.jpg`)}">`, ...lines, `</video>`].join("\n"));
  }
  if (live) parts.push([
    `<specimen-icon src="${at(`${name}.specimen.js`)}" poster="${at(`${name}-${first}-poster.jpg`)}"${themes.length === 1 ? ` theme="${first}"` : ` poster-light="${at(`${name}-light-poster.jpg`)}"`}></specimen-icon>`,
    `<script type="module" src="${at("specimen.js")}"></script>`,
  ].join("\n"));
  return parts.join("\n\n");
}

/** Renders the piece; resolves { files: [{ path, bytes }], snippet }. */
export async function render({ piece, themes = THEMES, out, size = 768, samples = 32, frames, live = false, video = !live, log = console.log }) {
  pieceName(piece); // the name first: nothing else runs for a wrong file
  const p = await loadPiece(piece);
  const broken = contract(p);
  if (broken.length) throw new Error(`${basename(p.file)}: ${broken.join("; ")}`);
  for (const t of themes) if (!THEMES.includes(t)) throw new Error(`unknown theme "${t}" (dark, light)`);
  if (video && !frames) requireFfmpeg();
  const chrome = requireChrome();

  out = resolve(out ?? dirname(p.file));
  mkdirSync(out, { recursive: true });
  const total = Math.round(p.scene.duration * FPS);
  const list = frames ?? (video ? [...Array(total).keys()] : [0]);
  const side = outSide(size);
  const files = [];
  const keep = (path) => files.push({ path, bytes: statSync(path).size });
  const s = await session(p.file, { chrome });
  const temp = tempDir("specimen-frames-"), work = temp.path;
  try {
    for (const theme of themes) {
      const stage = await s.open({ theme, mode: "pt", size, denoise: true });
      try {
        log(`${p.name} · ${theme} · ${list.length} frame${list.length > 1 ? "s" : ""} · ${samples} spp at ${size} px`);
        const t0 = Date.now();
        for (const [i, n] of list.entries()) {
          const png = await stage.frame(n, samples);
          if (frames) { writeFileSync(join(out, `${p.name}-${theme}-f${String(n).padStart(4, "0")}.png`), png); continue; }
          writeFileSync(join(work, `f${String(i).padStart(4, "0")}.png`), png);
          if (n === 0) {
            const jpg = await stage.page.evaluate(`__specimen.jpeg("data:image/png;base64,${png.toString("base64")}", ${side})`);
            const poster = join(out, `${p.name}-${theme}-poster.jpg`);
            writeFileSync(poster, Buffer.from(jpg.split(",")[1], "base64"));
            keep(poster);
          }
          if ((i + 1) % 30 === 0) log(`  ${i + 1}/${list.length} · ${Math.round(((Date.now() - t0) / (i + 1)) * (list.length - i - 1) / 1000)} s left`);
        }
      } finally { await stage.close(); }
      if (video && !frames) {
        const base = join(out, `${p.name}-${theme}`);
        await encode(work, base, side);
        keep(`${base}.webm`); keep(`${base}.mp4`);
      }
    }
    if (live && !frames) {
      for (const [from, to] of [[join(RUNTIME, "specimen.js"), "specimen.js"], [join(RUNTIME, "THIRD_PARTY_NOTICES.md"), "specimen.js.LICENSE.txt"], [p.file, `${p.name}.specimen.js`]]) {
        copyFileSync(from, join(out, to)); keep(join(out, to));
      }
    }
  } finally {
    await s.close();
    temp();
  }

  const html = snippet({ name: p.name, themes, prefix: `/${basename(out)}`, video, live });
  return { files, snippet: html };
}

if (isMain(import.meta.url)) {
  const { values: o, positionals } = parseArgs({ allowPositionals: true, options: {
    themes: { type: "string", default: THEMES.join(",") }, out: { type: "string" },
    size: { type: "string", default: "768" }, samples: { type: "string", default: "32" },
    frames: { type: "string" }, live: { type: "boolean", default: false }, video: { type: "boolean" },
  } });
  if (!positionals[0]) { console.error("usage: node render.mjs <name>.specimen.js [--themes dark,light] [--out dir] [--live] [--video]"); process.exit(1); }
  try {
    const r = await render({
      piece: positionals[0], themes: o.themes.split(","), out: o.out, size: Number(o.size), samples: Number(o.samples),
      frames: o.frames?.split(",").map(Number), live: o.live, video: o.video ?? !o.live,
    });
    for (const f of r.files) console.log(`${f.path}  ${(f.bytes / 1024).toFixed(0)} KB`);
    if (!o.frames) console.log(`\n${r.snippet}\n\n(paths assume the folder is served at /${basename(resolve(o.out ?? dirname(positionals[0])))}: adjust the prefix to where it is served)`);
  } catch (e) { console.error(e.message); process.exit(1); }
}
