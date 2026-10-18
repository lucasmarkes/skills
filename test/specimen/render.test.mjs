import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, realpathSync, rmSync, statSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "../../skills/specimen/render.mjs";
import { CHROME, FIXTURES } from "./harness.mjs";
import { FFMPEG } from "./psnr.mjs";

// a private TMPDIR: test files run in parallel and their Chromes would show up as leftovers here
process.env.TMPDIR = mkdtempSync(join(realpathSync(tmpdir()), "render-tmp-"));
process.on("exit", () => rmSync(process.env.TMPDIR, { recursive: true, force: true }));

const here = dirname(fileURLToPath(import.meta.url));
const CLI = join(here, "..", "..", "skills", "specimen", "render.mjs");
const CUBE = join(FIXTURES, "cube.specimen.js");
const tmp = () => mkdtempSync(join(realpathSync(tmpdir()), "render-test-"));
const quiet = () => {};
const leftovers = () => readdirSync(tmpdir()).filter((f) => f.startsWith("specimen-frames-") || f.startsWith("specimen-chrome-"));

test("a wrong file name is refused before Chrome starts", async () => {
  await assert.rejects(render({ piece: "x.js", log: quiet }), /Expected a file named x\.specimen\.js/);
});

test("a piece with a syntax error names its line before Chrome starts", async () => {
  const t0 = Date.now();
  await assert.rejects(render({ piece: join(FIXTURES, "syntax.specimen.js"), log: quiet }), /syntax\.specimen\.js:4/);
  assert.ok(Date.now() - t0 < 2000);
});

test("ffmpeg missing is reported before rendering", async () => {
  const bin = tmp();
  symlinkSync(process.execPath, join(bin, "node"));
  const t0 = Date.now();
  const r = await new Promise((ok) => execFile(join(bin, "node"), [CLI, CUBE], { env: { PATH: bin } }, (err, stdout, stderr) => ok({ code: err?.code ?? 0, stderr })));
  rmSync(bin, { recursive: true, force: true });
  assert.equal(r.code, 1);
  assert.match(r.stderr, /ffmpeg not found/);
  assert.ok(Date.now() - t0 < 3000);
});

test("two frames, both themes, into a new folder with a space", { skip: !CHROME && "Chrome not found" }, async () => {
  const root = tmp(), out = join(root, "my icons");
  const before = leftovers();
  try {
    await render({ piece: CUBE, themes: ["dark", "light"], out, frames: [0, 1], size: 128, samples: 1, log: quiet });
    assert.deepEqual(readdirSync(out).sort(), ["cube-dark-f0000.png", "cube-dark-f0001.png", "cube-light-f0000.png", "cube-light-f0001.png"]);
    assert.deepEqual(leftovers(), before);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("a full run encodes three files per theme", { skip: (!CHROME && "Chrome not found") || (!FFMPEG && "ffmpeg not found") }, async () => {
  const out = tmp();
  const before = leftovers();
  try {
    const one = await render({ piece: CUBE, themes: ["dark"], out, size: 128, samples: 1, log: quiet });
    for (const f of ["cube-dark.webm", "cube-dark.mp4", "cube-dark-poster.jpg"]) assert.ok(statSync(join(out, f)).size > 0, f);
    assert.deepEqual(one.files.map((f) => f.path).sort(), ["cube-dark-poster.jpg", "cube-dark.mp4", "cube-dark.webm"].map((f) => join(out, f)));
    assert.doesNotMatch(one.snippet, /prefers-color-scheme/);
    assert.match(one.snippet, /cube-dark\.webm/);
    assert.deepEqual(leftovers(), before);
  } finally { rmSync(out, { recursive: true, force: true }); }
});

test("the snippet follows the OS theme when both themes were rendered", { skip: !CHROME && "Chrome not found" }, async () => {
  const { snippet } = await import("../../skills/specimen/render.mjs");
  const s = snippet({ name: "webhook", themes: ["dark", "light"], prefix: "/icons", video: true });
  assert.match(s, /<source src="\/icons\/webhook-light\.webm" type="video\/webm" media="\(prefers-color-scheme: light\)">/);
  assert.match(s, /poster="\/icons\/webhook-dark-poster\.jpg"/);
  assert.ok(s.indexOf("webhook-light.mp4") < s.indexOf("webhook-dark.webm"), "light sources come first");
});
