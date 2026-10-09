import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkSet, textChecks } from "../../skills/pretty-icons/check.mjs";
import { shape } from "../../skills/pretty-icons/shapes.mjs";
import { addModifier } from "../../skills/pretty-icons/modifiers.mjs";

const doc = (f) => readFileSync(new URL(`../../skills/pretty-icons/${f}`, import.meta.url), "utf8");
const svgBlocks = (text) => text.split("```svg\n").slice(1).map((s) => s.split("\n```")[0]);
const line = (f) => `${f.rule}  ${f.icon}  ${f.got} → ${f.want}`;
const svg16 = (b) => `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${b}</svg>`;
const BODY16 = '<rect x="1.75" y="1.75" width="12.5" height="12.5" rx="1.5" fill="currentColor" fill-opacity=".2" />';

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
  const halo = textChecks("data", svg16(`${BODY16}<path d="M10.75 12.5H14.25M12.5 10.75V14.25" stroke-opacity="0.6" data-modifier="badge:plus" />`), 16).failures.map(line);
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
  for (const s of ["shapes.mjs <primitive>", "shapes.mjs --from", "--proof --only <name>", "modifiers.mjs", "Do the craft read", "**not read for craft**"]) assert.ok(skill.includes(s), s);
});
