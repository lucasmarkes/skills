import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, writeFileSync, rmSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkSet, textChecks } from "../../skills/pretty-icons/check.mjs";
import { shape } from "../../skills/pretty-icons/shapes.mjs";
import { addModifier } from "../../skills/pretty-icons/modifiers.mjs";

const doc = (f) => readFileSync(new URL(`../../skills/pretty-icons/${f}`, import.meta.url), "utf8");
const svgBlocks = (text) => text.split("```svg\n").slice(1).map((s) => s.split("\n```")[0]);
const line = (f) => `${f.rule}  ${f.icon}  ${f.got} → ${f.want}`;
const svg16 = (b) => `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">${b}</svg>`;
const BODY16 = '<rect x="2.25" y="2.25" width="11.5" height="11.5" rx="1.5" fill="currentColor" fill-opacity=".2" />';

test("rules-filled.md: the croissant is the kit's blob pasted, and passes check on its own", async (t) => {
  const { d } = shape("blob", { anchors: "12,39,c 5,25.5 24,8.5 43,25.5 36,39,c 24,30" });
  const croissant = svgBlocks(doc("rules-filled.md")).find((s) => s.includes(d));
  assert.ok(croissant, "rules-filled.md gives the blob's d in an svg block");
  const dir = mkdtempSync(join(tmpdir(), "croissant-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  writeFileSync(join(dir, "croissant.svg"), croissant + "\n");
  const r = await checkSet(dir);
  assert.equal(r.measured, true);
  assert.deepEqual(r.failures.map(line), []);
  assert.equal(r.rows[0].ink.toFixed(1), "279.6");
});

test("rules.md quotes the messages check.mjs prints for the new rules", async () => {
  const rules = doc("rules.md");
  const stray = textChecks("data", svg16(`${BODY16}<path d="M4.75 5.5H11.25" stroke-opacity="0.6" />`), 16).failures.map(line);
  const good = await addModifier(svg16(BODY16), "badge:plus");
  const wrong = textChecks("data", good.replace('stroke-opacity="0.6"', 'stroke-opacity="0.5"'), 16).failures.map(line);
  const halo = textChecks("data", svg16(`${BODY16}<path d="M10.5 12.5H14.5M12.5 10.5V14.5" stroke-opacity="0.6" data-modifier="badge:plus" />`), 16).failures.map(line);
  for (const l of [...stray, ...wrong, ...halo]) assert.ok(rules.includes(`\`${l}\``), `rules.md quotes ${l}`);
  assert.ok(rules.includes("→ under 4° or over 30°: smooth, or a corner on purpose`"));
  assert.ok(rules.includes("→ at most 1, none under a chord of 4`"));
});

test("rules.md 09: the gesture catalogue and the modifiers", () => {
  const rules = doc("rules.md");
  for (const g of ["seam", "dot pair", "tuft", "steam", "paper sheen", "lean"]) assert.match(rules, new RegExp(`\\| \\*\\*${g}\\*\\* \\|`), g);
  for (const k of ["badge:plus", "badge:minus", "badge:check", "badge:x", "slash", "lock", "dot", "arrow:up", "arrow:right", "arrow:down", "arrow:left"]) assert.ok(rules.includes(`\`${k}\``), k);
});

test("read.md: the craft read, its prompt, and the words for no reader", () => {
  const read = doc("read.md");
  assert.ok(read.includes("## The craft read"));
  assert.ok(read.includes("> These N icons are from one app. For each number, in five words or fewer, name one drawing defect if you see one: a kink in a curve, a wobbly curve, uneven weight, a part floating off the body, a confused silhouette, a detail too small to read. Say \"none\" when you see no defect. Then name the three weakest and why."));
  assert.ok(read.includes("**not read for craft**"));
});

test("SKILL.md: the loop composes with the kit, checks, and looks at the proof", () => {
  const skill = doc("SKILL.md");
  for (const s of ["shapes.mjs <primitive>", "shapes.mjs --from", "--proof --only <name>", "modifiers.mjs", "Do the craft read", "**not read for craft**", "Do the set read", "**not read as a set**"]) assert.ok(skill.includes(s), s);
  assert.ok(!skill.includes("a bar at 3.5"), "the bar is gone from What goes wrong");
});

const LIGHT = readFileSync(new URL("../../skills/pretty-icons/examples/garage/traffic-light.svg", import.meta.url), "utf8");
const LIT = '<circle cx="24" cy="13" r="2" fill="#25262a" stroke="none" />';
const light = (el) => textChecks("traffic-light", LIGHT.replace(LIT, el), 48).failures.map(line);

test("rules-filled.md quotes what check.mjs prints for one weight, the solid, the painted stroke and contrast", async () => {
  const filled = doc("rules-filled.md");
  const quoted = [
    ...light('<path d="M24 44V40" stroke-width="3.5" />'),
    ...light('<circle cx="24" cy="13" r="3" fill="#25262a" stroke="none" />'),
    ...light('<path d="M24 44V40" stroke="#ececea" />'),
    ...light('<path d="M17 10V16" stroke="#ffffff" />'),
  ];
  assert.equal(quoted.length, 4);
  const r = await checkSet(new URL("./fixtures/contrast/", import.meta.url).pathname);
  quoted.push(...r.failures.filter((f) => f.rule === "contrast").map(line));
  assert.equal(quoted.length, 6);
  for (const l of quoted) assert.ok(filled.includes(`\`${l}\``), `rules-filled.md quotes ${l}`);
  const live = filled.replace("`stroke  traffic-light  path@9 stroke-width 3.5 → not set: the root's 1.5, or 2 on a contour`", "");
  for (const gone of [/\bcores?\b/, /\btubes?\b/, /solid small part/, /mark of weight/, /stroke-width="3\.5"/, /a bar at 3\.5/, /\b341\b/]) assert.ok(!gone.test(live), `rules-filled.md still says ${gone}`);
  assert.ok(filled.includes("## 11 · contrast"));
});

test("read.md: the set read, its prompt word for word, and the words for no reader", () => {
  const read = doc("read.md");
  assert.ok(read.includes("## The set read"));
  assert.ok(read.includes("> These N icons are from one app. Name every icon that looks like it comes from a different set than the others, and in five words or fewer say why. Say 'one set' if none does."));
  assert.ok(read.includes("**not read as a set**"));
});

import { createHash } from "node:crypto";

// The reference set's name, as the SHA-256 of its lowercased form: the test never writes it.
const NAME = "6a6a1aefb5dce285444475fd85d5450171e0986e7c6df0f117a7678503d87294";
test("the reference set's name is in no file of the skill", () => {
  const root = new URL("../../skills/pretty-icons/", import.meta.url).pathname;
  const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
  const named = (p) => (readFileSync(p, "utf8").toLowerCase().match(/[a-z]+/g) ?? []).some((w) => createHash("sha256").update(w).digest("hex") === NAME);
  assert.deepEqual(walk(root).filter((p) => /\.(md|mjs|svg)$/.test(p) && named(p)), []);
});
