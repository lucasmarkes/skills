import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

// The kit and the build scripts of RECIPES.md, beside the scripts of VERIFY.md, the way the agent copies them to scratch.
const read = (name) => readFileSync(new URL(`../../skills/svg-animate/${name}`, import.meta.url), "utf8");
const RECIPES = read("RECIPES.md");
const extract = (md) => Object.fromEntries([...md.matchAll(/^```js (\w+\.mjs)\n([\s\S]*?)^```$/gm)].map((m) => [m[1], m[2]]));
const blocks = extract(RECIPES);
const tmp = mkdtempSync(join(tmpdir(), "svg-animate-recipes-"));
for (const [name, code] of Object.entries({ ...extract(read("VERIFY.md")), ...blocks })) writeFileSync(join(tmp, name), code);
const FIX = new URL("./fixtures/", import.meta.url).pathname;
const run = (script, args) => spawnSync(process.execPath, [join(tmp, script), ...args], { encoding: "utf8" });
const has = (bin) => spawnSync(bin, ["--version"]).status === 0;
const skip = process.env.SVG_RASTER || has("rsvg-convert") || has("resvg") ? false : "no rasteriser: install rsvg-convert or resvg, or set SVG_RASTER=npx";
for (const name of ["lobes", "bell"]) assert.equal(run("normalize.mjs", [join(FIX, `${name}.svg`), join(tmp, name)]).status, 0);
const norm = (name) => readFileSync(join(tmp, name, "source.svg"), "utf8");
const ds = (svg) => [...svg.matchAll(/\sd="([^"]*)"/g)].map((m) => m[1]);

const ARCHETYPES = ["Parts to whole", "Origin", "Gather", "Goo", "Relink", "Drop", "Pulse", "Pendulum", "Camera", "Magnet", "Draw", "Rig", "Verb"];
const LABELS = ["When the drawing has", "The story", "The recipe", "The numbers", "What goes wrong"];
const WORKED = [["drop", "lobes"], ["pulse", "lobes", "--loop"], ["parts", "lobes"], ["ring", "bell"]];

test("RECIPES.md has the thirteen archetypes in order, each with its five parts", () => {
  const sections = RECIPES.split(/^## /m).slice(1).map((s) => [s.slice(0, s.indexOf("\n")), s]);
  const names = sections.map(([h]) => h);
  assert.deepEqual(names.slice(names.indexOf("The kit") + 1), ARCHETYPES);
  for (const [h, s] of sections.filter(([h]) => ARCHETYPES.includes(h))) for (const l of LABELS) assert.ok(s.includes(`**${l}:**`), `${h}: ${l}`);
});

test("the kit and the build scripts import nothing but node: and the kit", () => {
  assert.deepEqual(Object.keys(blocks).sort(), ["drop.mjs", "kit.mjs", "magnet.mjs", "parts.mjs", "probe.mjs", "pulse.mjs", "ring.mjs"]);
  for (const [name, code] of Object.entries(blocks))
    for (const [, from] of code.matchAll(/^import .* from "([^"]+)";$/gm)) assert.ok(from.startsWith("node:") || (name !== "kit.mjs" && from === "./kit.mjs"), `${name}: ${from}`);
});

test("every worked build writes frames that pass check", { skip }, () => {
  for (const [script, src, ...flags] of WORKED) {
    const out = join(tmp, script), b = run(`${script}.mjs`, [join(tmp, src), out]);
    assert.equal(b.status, 0, `${script}: ${b.stderr}`);
    const c = run("check.mjs", [out, join(FIX, `${src}.svg`), ...flags]);
    assert.equal(c.status, 0, `${script}: ${c.stdout}`);
  }
});

test("every worked build's SMIL waits for the page and comes to rest on the source", () => {
  for (const [script, src, loop] of WORKED) {
    const out = join(tmp, `smil-${script}`);
    assert.equal(run(`${script}.mjs`, [join(tmp, src), out]).status, 0, script);
    const svg = readFileSync(`${out}.svg`, "utf8"), anims = [...svg.matchAll(/<path\b[^>]*\sd="([^"]*)"[^>]*><animate ([^>]*)\/>/g)];
    assert.ok(anims.length > 0, script);
    for (const [, d, attrs] of anims) {
      assert.match(attrs, /begin="indefinite"/, script);
      assert.match(attrs, loop ? /repeatCount="indefinite"/ : /fill="freeze"/, script);
      const values = attrs.match(/values="([^"]*)"/)[1].split(";");
      assert.equal(values.at(-1), d, `${script}: the last value is the source`);
      if (loop) assert.equal(values[0], d, `${script}: a loop starts on the source`);
    }
  }
});

test("magnet leans toward the pointer, then sleeps on the exact source", () => {
  const out = join(tmp, "magnet.js");
  assert.equal(run("magnet.mjs", [join(tmp, "lobes"), out, "Magnet"]).status, 0);
  // a page without a browser: paths that hold a d, a clock, and a frame queue pumped by hand
  const els = ds(norm("lobes")).map((d) => ({ d, getAttribute: function () { return this.d; }, setAttribute: function (_, v) { this.d = v; } }));
  const rest = els.map((e) => e.d), interactions = {}, queue = [];
  let now = 0;
  new Function("interactions", "requestAnimationFrame", "performance", readFileSync(out, "utf8"))(interactions, (f) => queue.push(f), { now: () => now });
  const live = interactions.Magnet({ querySelectorAll: () => els });
  const pump = (n) => { for (let i = 0; i < n && queue.length; i++) { now += 16; queue.shift()(now); } };
  live.point({ x: 70, y: 10 });
  pump(60);
  assert.ok(els.some((e, i) => e.d !== rest[i]), "the drawing moved");
  live.point(null);
  pump(2000);
  assert.equal(queue.length, 0, "asleep");
  assert.deepEqual(els.map((e) => e.d), rest);
});

test("probe turns magnet into frames that pass check and end asleep", { skip }, () => {
  const factory = join(tmp, "probe-magnet.js"), out = join(tmp, "probe");
  assert.equal(run("magnet.mjs", [join(tmp, "lobes"), factory]).status, 0);
  const p = run("probe.mjs", [join(tmp, "lobes"), factory, out, "Magnet"]);
  assert.equal(p.status, 0, p.stderr);
  assert.match(p.stdout, /^\d+ frames asleep$/m);
  const c = run("check.mjs", [out, join(FIX, "lobes.svg")]);
  assert.equal(c.status, 0, c.stdout);
});

test("beads draw every body alone: each path's area is its circles'", async () => {
  const kit = await import(pathToFileURL(join(tmp, "kit.mjs")).href);
  const d = kit.load(join(tmp, "lobes")), bs = kit.bones(d), apart = kit.beads(d, bs, d.inv.necks.map((n) => n.between));
  const posed = apart(bs.map(() => kit.M.id()));
  for (const [i, pts] of posed.entries()) {
    // shoelace over each subpath, its cubics sampled 32 times and closed by a chord; a zero-width neck adds nothing
    let area = 0;
    const ends = [...d.paths[i].starts, pts.length], cross = (p, q) => (p[0] * q[1] - q[0] * p[1]) / 2;
    for (let n = 0; n + 1 < ends.length; n++) {
      for (let j = ends[n]; j + 3 < ends[n + 1]; j += 3) {
        const [a, b, c, e] = pts.slice(j, j + 4), at = (t) => [0, 1].map((k) => (1 - t) ** 3 * a[k] + 3 * (1 - t) ** 2 * t * b[k] + 3 * (1 - t) * t * t * c[k] + t ** 3 * e[k]);
        for (let s = 0; s < 32; s++) area += cross(at(s / 32), at((s + 1) / 32));
      }
      area += cross(pts[ends[n + 1] - 1], pts[ends[n]]);
    }
    const want = bs.filter((b) => b.paths[0] === i).reduce((x, b) => x + Math.PI * b.r * b.r, 0);
    assert.ok(Math.abs(Math.abs(area) - want) < 0.01 * want, `path ${i}: ${Math.abs(area).toFixed(1)} vs ${want.toFixed(1)}`);
  }
});

test("rig and beads leave a path no bone owns where it is", async () => {
  assert.equal(run("normalize.mjs", [join(FIX, "scene.svg"), join(tmp, "scene")]).status, 0);
  const kit = await import(pathToFileURL(join(tmp, "kit.mjs")).href);
  const d = kit.load(join(tmp, "scene")), sun = d.inv.paths.filter((p) => p.group === "sun").map((p) => p.i);
  const bs = [{ c: d.inv.circles[0].c, r: d.inv.circles[0].r, paths: sun }], id = [kit.M.id()];
  const posed = kit.rig(d, bs)(id), apart = kit.beads(d, bs, [])(id);
  for (const [i, p] of d.paths.entries()) if (!sun.includes(i)) {
    assert.deepEqual(posed[i], p.pts, `rig: path ${i}`);
    assert.deepEqual(apart[i], p.pts, `beads: path ${i}`);
  }
});
