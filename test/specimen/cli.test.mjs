import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, realpathSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CHROME, FIXTURES } from "./harness.mjs";
import { FFMPEG } from "./psnr.mjs";

const SKILL = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "skills", "specimen");
const CUBE = join(FIXTURES, "cube.specimen.js");
const tmp = (p) => mkdtempSync(join(realpathSync(tmpdir()), p));
const run = (file, args, env = process.env) => new Promise((ok) => {
  const t0 = Date.now();
  execFile(process.execPath, [file, ...args], { env }, (err, stdout, stderr) => ok({ code: err?.code ?? 0, stdout, stderr, ms: Date.now() - t0 }));
});

test("the scripts run through a symlinked folder with a space in its path", async () => {
  const root = tmp("cli-link-"), link = join(root, "my skills", "specimen");
  try {
    await import("node:fs").then((fs) => fs.mkdirSync(dirname(link)));
    symlinkSync(SKILL, link);
    for (const [script, code] of [["validate.mjs", 2], ["sheet.mjs", 1], ["render.mjs", 1]]) {
      const r = await run(join(link, script), []);
      assert.equal(r.code, code, script);
      assert.match(r.stderr, /^usage: /, script);
    }
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("sheet exits as soon as its work is done", { skip: !CHROME && "Chrome not found" }, async () => {
  const out = tmp("cli-sheet-");
  try {
    const r = await run(join(SKILL, "sheet.mjs"), [CUBE, "--frames", "0", "--out", join(out, "s.png")]);
    assert.equal(r.code, 0, r.stderr);
    assert.ok(existsSync(join(out, "s.png")));
    assert.ok(r.ms < 25000, `exited after ${r.ms} ms`);
  } finally { rmSync(out, { recursive: true, force: true }); }
});

test("Ctrl-C mid-render leaves no Chrome profile or frames behind", { skip: (!CHROME && "Chrome not found") || (!FFMPEG && "ffmpeg not found") }, async () => {
  const TMP = tmp("cli-int-"), out = tmp("cli-int-out-");
  const leftovers = () => readdirSync(TMP).filter((f) => f.startsWith("specimen-"));
  try {
    const child = spawn(process.execPath, [join(SKILL, "render.mjs"), CUBE, "--themes", "dark", "--size", "128", "--samples", "1", "--out", out], { env: { ...process.env, TMPDIR: TMP } });
    let stderr = "";
    child.stderr.on("data", (d) => { stderr += d; });
    const exited = new Promise((ok) => child.on("exit", (code, signal) => ok({ code, signal })));
    const end = Date.now() + 30000;
    while (Date.now() < end && !leftovers().some((d) => d.startsWith("specimen-frames-") && readdirSync(join(TMP, d)).length > 0)) await new Promise((ok) => setTimeout(ok, 50));
    assert.ok(leftovers().length > 0, "the render started");
    child.kill("SIGINT");
    const { code } = await exited;
    assert.equal(code, 130, stderr);
    assert.deepEqual(leftovers(), []);
  } finally { rmSync(TMP, { recursive: true, force: true }); rmSync(out, { recursive: true, force: true }); }
});
