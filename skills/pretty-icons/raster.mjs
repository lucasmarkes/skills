/**
 * Pixels for check.mjs and sheet.mjs. The rasteriser is @resvg/resvg-js at a
 * pinned version, installed once into a cache folder of the user's, one per
 * platform and architecture (PRETTY_ICONS_CACHE moves it), never into the
 * skill or the working directory. `currentColor` is
 * turned to black before rendering, so ink is alpha.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { SCALE, INK_ALPHA } from "./presets.mjs";
import { withNs } from "./svg.mjs";

// Pinned: the bar set's margins are thin, and a renderer's anti-aliasing moves ink.
const NAME = "@resvg/resvg-js", VERSION = "2.6.2", PKG = `${NAME}@${VERSION}`;
/** The code on every error that means "no rasteriser": check.mjs then skips the measured rules (exit 2). */
export const NO_RASTER = "PRETTY_ICONS_NO_RASTER";
const noRaster = (message) => Object.assign(new Error(message), { code: NO_RASTER });

/** The cache folder, one per platform and architecture: a binary for one machine never loads on another. */
export function cacheDir(env = process.env, platform = process.platform, home = homedir(), arch = process.arch) {
  const machine = `${platform}-${arch}`;
  if (env.PRETTY_ICONS_CACHE) return join(resolve(env.PRETTY_ICONS_CACHE), machine);
  if (platform === "darwin") return join(home, "Library", "Caches", "pretty-icons", machine);
  if (platform === "win32") return join(env.LOCALAPPDATA || join(home, "AppData", "Local"), "pretty-icons", machine);
  return join(env.XDG_CACHE_HOME || join(home, ".cache"), "pretty-icons", machine);
}

let Resvg;
/** The Resvg class from the cache, installed there first when it is not. Throws a NO_RASTER error with a reason when it cannot be had. */
export function resvg() {
  if (Resvg) return Resvg;
  const dir = cacheDir();
  // The package is looked up in this folder only: a plain require would walk up into a parent's node_modules.
  const pkg = join(dir, "node_modules", ...NAME.split("/"));
  const has = () => existsSync(join(pkg, "package.json"));
  if (!has()) {
    console.error(`installing ${PKG} once, into ${dir}`);
    mkdirSync(dir, { recursive: true });
    const win = process.platform === "win32";
    const run = spawnSync(win ? "npm.cmd" : "npm", ["install", PKG, "--prefix", win ? `"${dir}"` : dir, "--save-exact", "--no-audit", "--no-fund", "--loglevel=error"], { encoding: "utf8", shell: win });
    const why = run.error?.code === "ENOENT" ? "npm is not on the PATH" : run.error?.message ?? /Error: (.*)$/m.exec(run.stderr ?? "")?.[1] ?? (run.stderr ?? "").trim().split("\n")[0];
    if (run.status !== 0 || !has()) throw noRaster(`could not install ${PKG} into ${dir}: ${why || "npm failed"}`);
    let version = "?";
    try { version = JSON.parse(readFileSync(join(pkg, "package.json"), "utf8")).version; } catch {}
    console.error(`installed ${NAME} ${version} into ${dir}`);
  }
  // A half-finished install, or a cache copied from another machine, resolves the package but not its binary.
  try { Resvg = createRequire(join(dir, "raster.cjs"))(pkg).Resvg; }
  catch (e) { throw noRaster(`could not load ${NAME} from ${dir}: ${String(e?.message ?? e).split("\n")[0]}; delete that folder to reinstall`); }
  return Resvg;
}

const black = (svg) => svg.replace(/currentColor/gi, "#000");

export function render(svgText, widthPx, { background } = {}) {
  const R = resvg();
  const r = new R(withNs(black(svgText)), { fitTo: { mode: "width", value: widthPx }, background, font: { loadSystemFonts: false } }).render();
  return { width: r.width, height: r.height, pixels: r.pixels };
}

export function png(svgText, widthPx, opts) {
  const R = resvg();
  return new R(withNs(black(svgText)), { fitTo: { mode: "width", value: widthPx }, background: opts?.background, font: { loadSystemFonts: true, defaultFontFamily: "Helvetica" } }).render().asPng();
}

/** Ink box, centre of mass and ink of one icon, in canvas units. Async so a later version can be. */
export async function measure(svgText, G) {
  const { width, height, pixels } = render(svgText, G * SCALE);
  const s = width / G;
  let x0 = width, y0 = height, x1 = -1, y1 = -1, sum = 0, sx = 0, sy = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const a = pixels[(y * width + x) * 4 + 3] / 255;
    if (a > INK_ALPHA) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    sum += a; sx += a * (x + 0.5); sy += a * (y + 0.5);
  }
  if (x1 < 0) return { box: { x0: 0, y0: 0, x1: 0, y1: 0, w: 0, h: 0 }, mass: { dx: 0, dy: 0 }, ink: 0 };
  const u = (v) => v / s;
  return {
    box: { x0: u(x0), y0: u(y0), x1: u(x1 + 1), y1: u(y1 + 1), w: u(x1 - x0 + 1), h: u(y1 - y0 + 1) },
    mass: { dx: u(sx / sum) - u(width) / 2, dy: u(sy / sum) - u(height) / 2 },
    ink: sum / s / s,
  };
}
