import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SKILL = join("skills", "specimen");
const read = (f) => (existsSync(f) ? readFileSync(f, "utf8") : "");
const md = read(join(SKILL, "SKILL.md"));
const EXAMPLES = readdirSync(join(SKILL, "examples")).filter((f) => f.endsWith(".specimen.js"));

test("SKILL.md is /specimen", () => {
  assert.match(md, /^---\nname: specimen\ndescription: Use when someone asks for a Specimen icon, runs \/specimen, or wants a 3D product icon/);
});

test("SKILL.md names every script and runtime file that exists in the folder, and every file it names exists", () => {
  const tree = /```\nspecimen\/\n([\s\S]*?)```/.exec(md);
  assert.ok(tree, "the folder tree block");
  const named = tree[1].split("\n").map((l) => l.trim().split(/\s+/)[0]).filter((f) => f && !f.endsWith("/"));
  const present = [
    ...readdirSync(SKILL).filter((f) => /\.(mjs|md|json)$/.test(f)),
    ...readdirSync(join(SKILL, "runtime")),
  ];
  for (const f of present) assert.ok(named.includes(f), `the tree names ${f}`);
  for (const f of named) assert.ok(existsSync(join(SKILL, f)) || existsSync(join(SKILL, "runtime", f)), `${f} exists`);
});

test("SKILL.md names every example, and concepts.md keeps what the lab taught", () => {
  for (const f of EXAMPLES) assert.ok(md.includes(`examples/${f}`), `SKILL.md names examples/${f}`);
  const c = read(join(SKILL, "concepts.md"));
  for (const h of ["## Objects that read well", "## Metaphors by product area", "## What failed"]) assert.ok(c.includes(h), h);
  for (const t of [/touch(ed|es) the top/, /all yellow/, /outside the tile/]) assert.match(c, t);
});

test("SKILL.md asks for the delivery first and says live is raster", () => {
  const s0 = /## 0\. Delivery[\s\S]*?## 1\./.exec(md)?.[0] ?? "";
  for (const t of ["video", "live", "both"]) assert.ok(s0.includes(t), t);
  assert.match(s0, /raster/);
  assert.match(md, /\[data-theme\]/);
  assert.match(md, /never (edit|touch) `runtime\/`/i);
});

test("README lists specimen", () => {
  assert.match(read("README.md"), /^\| `specimen` \| A glossy 3D icon on a soft tile, lit like a display piece and looping, in dark and light, shipped as video or live with nothing to install\. \|$/m);
});

test("SKILL.md tells the agent to run the full render in the background", () => {
  assert.match(md, /run it in the background/i);
});
