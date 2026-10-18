// Reads a piece in Node before Chrome starts: the name, the syntax (with its line) and the contract.
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const SUFFIX = ".specimen.js";

/** True when the script at meta (import.meta.url) is the one node was asked to run, also through a symlink or a path with spaces. */
export function isMain(meta) {
  if (!process.argv[1]) return false;
  try { return realpathSync(process.argv[1]) === fileURLToPath(meta); } catch { return false; }
}

/** "rocket" from ".../rocket.specimen.js"; throws for any other file name. */
export function pieceName(file) {
  const base = basename(file);
  if (!base.endsWith(SUFFIX)) throw new Error(`Expected a file named ${base.replace(/\.[^.]*$/, "")}${SUFFIX}`);
  return base.slice(0, -SUFFIX.length);
}

/** Imports the piece in Node and returns { name, file, scene, object }; errors name the piece's own line. */
export async function loadPiece(file) {
  file = resolve(file);
  const name = pieceName(file);
  if (!existsSync(file)) throw new Error(`${file} not found`);
  // a copy as .mjs: the person's package.json may say commonjs, a piece is always a module
  const dir = mkdtempSync(join(tmpdir(), "specimen-piece-"));
  const copy = join(dir, `${name}.mjs`);
  copyFileSync(file, copy);
  try {
    const mod = await import(pathToFileURL(copy).href);
    return { name, file, scene: mod.scene, object: mod.object };
  } catch (e) {
    // Node keeps a module's syntax error line out of the stack; `node --check` prints it
    const where = e instanceof SyntaxError ? checkOutput(copy) : String(e.stack);
    const at = where.match(new RegExp(`${name}\\.mjs:(\\d+)`));
    throw new Error(`${e.name}: ${e.message} (${basename(file)}${at ? ":" + at[1] : ""})`);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

function checkOutput(file) {
  try { execFileSync(process.execPath, ["--check", file], { stdio: "pipe" }); return ""; } catch (e) { return String(e.stderr); }
}

/** The contract's broken terms, as messages; empty when the piece is well formed. */
export function contract({ scene, object }) {
  const out = [];
  if (!scene || typeof scene !== "object") out.push("export `scene`: { accent, duration, fit }");
  if (typeof object !== "function") out.push("export `object(ctx)` returning { mesh, update(phase) }");
  if (scene && typeof scene === "object") {
    if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(scene.accent ?? "")) out.push(`scene.accent is a hex colour like "#38bdf8" (got ${JSON.stringify(scene.accent)})`);
    if (scene.glow !== undefined && !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(scene.glow)) out.push(`scene.glow is a hex colour (got ${JSON.stringify(scene.glow)})`);
    const d = scene.duration;
    if (typeof d !== "number" || d < 4 || d > 12) out.push(`scene.duration is 4–12 seconds (got ${JSON.stringify(d)})`);
  }
  return out;
}
