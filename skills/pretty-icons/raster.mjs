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
import { SCALE, INK_ALPHA, DARK_LUMA, AIR, COUNTER, AIR_AREA, AIR_TOL } from "./presets.mjs";
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

export const PAPER_PKG = "paper@0.12.18";

let paperNs = null;
/** The paper.js namespace from the cache (installed there first when it is not), set up once on a 24 × 24 canvas. Throws a NO_RASTER error when it cannot be had. */
export function paper() {
  if (paperNs) return paperNs;
  const dir = cacheDir();
  const pkg = join(dir, "node_modules", "paper");
  const has = () => existsSync(join(pkg, "package.json"));
  if (!has()) {
    console.error(`installing ${PAPER_PKG} once, into ${dir}`);
    mkdirSync(dir, { recursive: true });
    const win = process.platform === "win32";
    const run = spawnSync(win ? "npm.cmd" : "npm", ["install", PAPER_PKG, "--prefix", win ? `"${dir}"` : dir, "--save-exact", "--no-audit", "--no-fund", "--loglevel=error"], { encoding: "utf8", shell: win });
    const why = run.error?.code === "ENOENT" ? "npm is not on the PATH" : run.error?.message ?? /Error: (.*)$/m.exec(run.stderr ?? "")?.[1] ?? (run.stderr ?? "").trim().split("\n")[0];
    if (run.status !== 0 || !has()) throw noRaster(`could not install ${PAPER_PKG} into ${dir}: ${why || "npm failed"}`);
  }
  let ns;
  try { ns = createRequire(join(dir, "raster.cjs"))(pkg); }
  catch (e) { throw noRaster(`could not load paper from ${dir}: ${String(e?.message ?? e).split("\n")[0]}; delete that folder to reinstall`); }
  ns.setup(new ns.Size(24, 24));
  paperNs = ns;
  return paperNs;
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

/**
 * The icon as written, its tones kept: `paint` the pixels at alpha ≥ 128, `dark` those of them in the line tone.
 * resvg's pixels are premultiplied, so each is divided by its alpha before it is compared.
 */
export async function shares(svgText, G) {
  const { pixels } = render(svgText, G * SCALE);
  let paint = 0, dark = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const a = pixels[i + 3];
    if (a < 128) continue;
    paint++;
    if (((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3) * 255 / a < DARK_LUMA) dark++;
  }
  return { paint, dark };
}

// Air is read at 8 px a stroke; a pixel darker than 0.6 is ink (the line and mark tones; fill, shade and paper are paper).
export const PX = 8, INK_LUMA = 0.6;

// Felzenszwalb and Huttenlocher's exact squared distance transform, one dimension.
function edt1d(f, n, d, v, z) {
  let k = 0;
  v[0] = 0; z[0] = -Infinity; z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
    k++; v[k] = q; z[k] = s; z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) ** 2 + f[v[k]]; }
}

/** Each pixel's Euclidean distance, in pixels, to the nearest set pixel of `mask`. */
export function edt(mask, W, H) {
  const BIG = 1e12, out = new Float64Array(W * H), n = Math.max(W, H);
  const f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
  for (let x = 0; x < W; x++) { for (let y = 0; y < H; y++) f[y] = mask[y * W + x] ? 0 : BIG; edt1d(f, H, d, v, z); for (let y = 0; y < H; y++) out[y * W + x] = d[y]; }
  for (let y = 0; y < H; y++) { for (let x = 0; x < W; x++) f[x] = out[y * W + x]; edt1d(f, W, d, v, z); for (let x = 0; x < W; x++) out[y * W + x] = Math.sqrt(d[x]); }
  return out;
}

// 4-connected regions of a mask, each with whether it reaches the image's border.
function components(mask, W, H) {
  const seen = new Uint8Array(W * H), out = [];
  for (let i = 0; i < W * H; i++) {
    if (!mask[i] || seen[i]) continue;
    const stack = [i], px = [];
    let border = false;
    seen[i] = 1;
    while (stack.length) {
      const j = stack.pop(), x = j % W, y = (j - x) / W;
      px.push(j);
      if (x === 0 || y === 0 || x === W - 1 || y === H - 1) border = true;
      for (const k of [x > 0 ? j - 1 : -1, x < W - 1 ? j + 1 : -1, y > 0 ? j - W : -1, y < H - 1 ? j + W : -1])
        if (k >= 0 && mask[k] && !seen[k]) { seen[k] = 1; stack.push(k); }
    }
    out.push({ px, border });
  }
  return out;
}

/**
 * The paper an icon squeezes: rendered at 8 px a stroke on white, the paper is opened at radius
 * AIR/2 strokes, and what the opening cannot reach is narrow. An enclosed paper region under
 * COUNTER (less AIR_TOL) strokes across is a counter, reported whole; anything under AIR_AREA
 * square strokes is left out. Sizes in strokes, places in grid units.
 */
export async function air(svgText, G, stroke) {
  const unit = PX / stroke, size = Math.round(G * unit), pad = PX;
  const { width, height, pixels } = render(svgText, size, { background: "#ffffff" });
  const W = width + 2 * pad, H = height + 2 * pad, ink = new Uint8Array(W * H);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    if ((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3 / 255 < INK_LUMA) ink[(y + pad) * W + x + pad] = 1;
  }
  const dt = edt(ink, W, H);
  const at = (px) => {
    let sx = 0, sy = 0;
    for (const j of px) { sx += (j % W) + 0.5; sy += Math.floor(j / W) + 0.5; }
    return [+((sx / px.length - pad) / unit).toFixed(2), +((sy / px.length - pad) / unit).toFixed(2)];
  };
  const widest = (px) => { let m = 0; for (const j of px) if (dt[j] > m) m = dt[j]; return (2 * m + 1) / PX; };
  const out = [], counter = new Uint8Array(W * H), paper = Uint8Array.from(ink, (v) => 1 - v);
  for (const c of components(paper, W, H)) {
    if (c.border) continue;
    const across = widest(c.px), area = c.px.length / PX / PX;
    if (across >= COUNTER - AIR_TOL) continue;
    for (const j of c.px) counter[j] = 1;
    if (area >= AIR_AREA) out.push({ kind: "counter", across: +across.toFixed(2), area: +area.toFixed(2), at: at(c.px) });
  }
  const r = (AIR / 2) * PX, reach = edt(Uint8Array.from(dt, (v) => (v >= r ? 1 : 0)), W, H);
  const narrow = Uint8Array.from(ink, (v, i) => (!v && !counter[i] && reach[i] > r ? 1 : 0));
  for (const c of components(narrow, W, H)) {
    const area = c.px.length / PX / PX;
    if (area >= AIR_AREA) out.push({ kind: "paper", across: +widest(c.px).toFixed(2), area: +area.toFixed(2), at: at(c.px) });
  }
  return out;
}

/** A mask of an SVG's ink at PX pixels a grid unit: a pixel darker than INK_LUMA on white. */
function inkMask(svgText, G) {
  const size = G * PX, { width, height, pixels } = render(svgText, size, { background: "#ffffff" });
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) if ((pixels[i * 4] + pixels[i * 4 + 1] + pixels[i * 4 + 2]) / 3 / 255 < INK_LUMA) mask[i] = 1;
  return { mask, W: width, H: height };
}

/**
 * The knockout band: the paper the cut removed from the body, measured where it meets the cut
 * body's ink. Every such edge pixel should sit `want` from the accent's ink, ± `tol`. The three
 * SVGs render with every body full (no fill-opacity), so the .4 body reads as ink.
 */
export async function band(cutSvg, uncutSvg, accentSvg, G, want, tol) {
  const { mask: C, W, H } = inkMask(cutSvg, G), { mask: U } = inkMask(uncutSvg, G), { mask: A } = inkMask(accentSvg, G);
  const dt = edt(A, W, H), out = [];
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x;
    if (!U[i] || C[i] || A[i]) continue; // removed paper only
    if (!(U[i - 1] && U[i + 1] && U[i - W] && U[i + W])) continue; // on the body's own outline: antialiasing, not band
    if (!(C[i - 1] || C[i + 1] || C[i - W] || C[i + W])) continue; // at the band's outer edge
    const width = (dt[i] + 0.5) / PX;
    if (Math.abs(width - want) <= tol) continue;
    out.push({ width: +width.toFixed(2), at: [+((x + 0.5) / PX).toFixed(2), +((y + 0.5) / PX).toFixed(2)] });
  }
  out.sort((a, b) => Math.abs(b.width - want) - Math.abs(a.width - want));
  return out.slice(0, 3);
}

/**
 * The ink's principal axes, from its second moments at 8 px a unit: the ratio of the long axis to
 * the short, and the long axis's angle in degrees, 45 rising to the right, −45 falling. No ink is round.
 */
export async function elongation(svgText, G) {
  const S = 8, { width, height, pixels } = render(svgText, G * S);
  let m = 0, sx = 0, sy = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) { const a = pixels[(y * width + x) * 4 + 3] / 255; m += a; sx += a * x; sy += a * y; }
  if (!m) return { ratio: 1, angle: 0 };
  const cx = sx / m, cy = sy / m;
  let xx = 0, yy = 0, xy = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const a = pixels[(y * width + x) * 4 + 3] / 255;
    xx += a * (x - cx) ** 2; yy += a * (y - cy) ** 2; xy += a * (x - cx) * (y - cy);
  }
  xx /= m; yy /= m; xy /= m;
  const tr = (xx + yy) / 2, det = Math.sqrt(((xx - yy) / 2) ** 2 + xy * xy), l1 = tr + det, l2 = Math.max(tr - det, 1e-9);
  // y grows down the image, so the angle is negated to read as on paper
  let angle = (-0.5 * Math.atan2(2 * xy, xx - yy) * 180) / Math.PI;
  if (angle <= -90) angle += 180;
  if (angle > 90) angle -= 180;
  return { ratio: +Math.sqrt(l1 / l2).toFixed(2), angle: +angle.toFixed(1) };
}
