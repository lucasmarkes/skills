import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { composeProof, construction, silhouette, pixelSizes, referenceSet, writeProof, JOIN_COLOUR, PANEL, VIEW } from "../../skills/pretty-icons/proof.mjs";
import { parseArgs } from "../../skills/pretty-icons/sheet.mjs";
import { readSet } from "../../skills/pretty-icons/check.mjs";
import { addModifier } from "../../skills/pretty-icons/modifiers.mjs";

const examples = (set) => new URL(`../../skills/pretty-icons/examples/${set}/`, import.meta.url).pathname;
const sheetJs = new URL("../../skills/pretty-icons/sheet.mjs", import.meta.url).pathname;
const tmp = (t) => { const dir = mkdtempSync(join(tmpdir(), "proof-")); t.after(() => rmSync(dir, { recursive: true, force: true })); return dir; };
const svg48 = (body) => `<svg viewBox="0 0 48 48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">\n${body}\n</svg>`;

test("the pixels view shows the display sizes: 16, 24, 32 filled; the grid at 1× and 2× duotone", () => {
  assert.deepEqual(pixelSizes(48), [16, 24, 32]);
  assert.deepEqual(pixelSizes(16), [16, 32]);
  assert.deepEqual(pixelSizes(24), [24, 48]);
});

test("construction colours each join by its measure: a kink shows red", () => {
  const kinked = { name: "k", text: svg48('<path d="M8 24H28L37.85 25.74" />') };
  const o = construction(kinked, 48);
  assert.ok(o.includes(`fill="${JOIN_COLOUR.kink}"`));
  const square = { name: "s", text: svg48('<path d="M8 8H40V40H8Z" />') };
  assert.equal(construction(square, 48).split(`fill="${JOIN_COLOUR.corner}"`).length - 1, 4);
  // handles as hairlines: a cubic draws its two
  assert.match(construction({ name: "c", text: svg48('<path d="M8 24C8 14 14 8 24 8" />') }, 48), /<path d="M8,24L8,14M24,8L14,8"/);
});

test("construction draws a modifier's halo: a dashed circle for a badge, a band for a slash", async () => {
  const text = await addModifier(readSet(examples("hairline")).find((s) => s.name === "data").text, "badge:plus");
  assert.match(construction({ name: "d", text }, 16), /<circle [^>]*stroke="#9333ea"[^>]*stroke-dasharray/);
  const slashed = await addModifier(readSet(examples("hairline")).find((s) => s.name === "security").text, "slash");
  assert.match(construction({ name: "s", text: slashed }, 16), /<path d="M[\d.]+,[\d.]+L[\d.]+,[\d.]+" stroke="#9333ea" stroke-opacity=".15"/);
});

test("the silhouette paints every fill and stroke in one tone at full opacity", () => {
  const s = { name: "x", text: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1"><rect x="2" y="2" width="12" height="12" fill="currentColor" fill-opacity=".2" stroke="none" /><path d="M4 8H12" stroke-opacity="0.6" /></svg>` };
  const g = silhouette(s, 16, 16, "#25262a");
  assert.ok(!/opacity/.test(g), "no opacity left");
  assert.match(g, /<rect [^>]*fill="#25262a"/);
  assert.match(g, /stroke="none"/, "a stroke of none stays none");
});

test("the reference row is three icons of the finish's example; --only keeps one panel", () => {
  assert.deepEqual(referenceSet(48).map((s) => s.name), ["car", "traffic-light", "wrench"]);
  assert.deepEqual(referenceSet(16).map((s) => s.name), ["data", "devices", "security"]);
  const set = readSet(examples("garage"));
  const all = composeProof(set, 48), one = composeProof(set, 48, { only: "fuel" });
  assert.ok(all.includes('data-reference="row"'));
  assert.ok(one.includes(">fuel<") && !one.includes(">oil<"));
  assert.ok(Number(/height="(\d+)"/.exec(one)[1]) < Number(/height="(\d+)"/.exec(all)[1]));
  assert.ok(Number(/width="(\d+)"/.exec(all)[1]) >= PANEL.w * 3);
  assert.throws(() => composeProof(set, 48, { only: "nope" }), /--only nope: no such icon; the set has battery, car/);
});

test("the reference row draws at its own grid (16), not the set's grid (20 or 24)", () => {
  const icon = readSet(examples("hairline")).slice(0, 1);
  for (const G of [20, 24]) {
    const svg = composeProof(icon, G);
    // a panel's scale is VIEW / grid, on three transforms (ghost, construction, finish): three reference panels at 16, one set panel at G
    assert.equal((svg.match(new RegExp(`scale\\(${VIEW / 16}\\)`, "g")) ?? []).length, 3 * 3, `grid ${G}`);
    assert.equal((svg.match(new RegExp(`scale\\(${VIEW / G}\\)`, "g")) ?? []).length, 3, `grid ${G}`);
  }
});

test("the proof is drawn for a set that fails check: a kink is what it is for", (t) => {
  const dir = tmp(t), set = join(dir, "pretty-icons");
  mkdirSync(set);
  writeFileSync(join(set, "kinked.svg"), svg48('<path d="M8 24H28L37.85 25.74" />'));
  const file = writeProof(set, { out: join(dir, "out") });
  assert.ok(existsSync(file) && file.endsWith("pretty-icons-proof.png"));
});

test("CLI: --proof writes the proof and prints its path; --only needs --proof; --seed is not the proof's", (t) => {
  assert.deepEqual(parseArgs(["f", "--proof", "--only", "car"]), { folder: "f", seed: undefined, out: undefined, proof: true, only: "car" });
  assert.deepEqual(parseArgs(["f", "--proof", "--only=car", "--out=o"]), { folder: "f", seed: undefined, out: "o", proof: true, only: "car" });
  assert.equal(parseArgs(["f", "--only", "car"]), null);
  assert.equal(parseArgs(["f", "--proof", "--seed=3"]), null);
  assert.equal(parseArgs(["f", "--proof", "--only"]), null);
  const out = tmp(t);
  const r = spawnSync(process.execPath, [sheetJs, examples("garage"), "--proof", "--only", "car", `--out=${out}`], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout.trim(), join(out, "pretty-icons-proof.png"));
  const no = spawnSync(process.execPath, [sheetJs, examples("garage"), "--proof", "--only", "nope", `--out=${out}`], { encoding: "utf8" });
  assert.equal(no.status, 1);
  assert.match(no.stderr, /--only nope: no such icon/);
});

test("--proof on a folder with no icons says so on stderr and exits 1, without a stack", (t) => {
  const dir = tmp(t);
  const r = spawnSync(process.execPath, [sheetJs, dir, "--proof", `--out=${dir}`], { encoding: "utf8" });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /no \.svg files/);
  assert.doesNotMatch(r.stderr, /at .*\.mjs:\d+/);
});

test("a path the reader cannot read is left out of construction, and the proof is still drawn", (t) => {
  const bad = { name: "bad", text: svg48('<path d="M8 24H28B" /><path d="M8 8H40V40H8Z" />') };
  assert.equal(construction(bad, 48).split(`fill="${JOIN_COLOUR.corner}"`).length - 1, 4);
  const dir = tmp(t), set = join(dir, "pretty-icons");
  mkdirSync(set);
  writeFileSync(join(set, "bad.svg"), bad.text);
  assert.ok(existsSync(writeProof(set, { out: join(dir, "out") })));
});

import { knockout } from "../../skills/pretty-icons/knockout.mjs";

test("at bulk the proof draws the uncut body under the cut in amber, uses the bulk keylines, and its reference row is examples/bulk or empty until it is drawn", (t) => {
  const root = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">';
  const SQ = '<path d="M 8 3 H 16 C 17 3 18 3 19.5 4.5 C 21 6 21 7 21 8 V 16 C 21 17 21 18 19.5 19.5 C 18 21 17 21 16 21 H 8 C 7 21 6 21 4.5 19.5 C 3 18 3 17 3 16 V 8 C 3 7 3 6 4.5 4.5 C 6 3 7 3 8 3 Z" fill-opacity=".4" />';
  const cut = knockout(`${root}\n  ${SQ}\n  <path d="M 12 6 L 18 12 L 12 18 L 6 12 Z" />\n</svg>`, { name: "a" }).text;
  const s = { name: "a", text: cut };
  const svg = composeProof([s], 24, { finish: "bulk" });
  assert.ok(svg.includes('fill="#fde68a"'), "the uncut body shows under the cut");
  assert.ok(svg.includes("reference: examples/bulk"));
  assert.equal(referenceSet(24, "bulk").length, existsSync(examples("bulk")) ? 3 : 0);
  // the 20 circle keyline, dashed, at the construction view's scale
  assert.ok(svg.includes('width="20" height="20"'), "the bulk circle keyline");
  const dir = tmp(t); writeFileSync(join(dir, "a.svg"), cut);
  const file = writeProof(dir, { out: dir });
  assert.ok(existsSync(file));
});

test("the silhouette is a mass at bulk: the group fills in the ink; the duotone silhouette still strokes", () => {
  const body = '<path d="M 3 3 H 21 V 21 H 3 Z" fill-opacity=".4" />';
  const bulk = silhouette({ name: "m", text: `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">\n  ${body}\n</svg>` }, 24, 24, "#262626");
  assert.match(bulk, /^<g [^>]*fill="#262626" stroke="none"/);
  assert.ok(!bulk.includes("fill-opacity"));
  const duo = silhouette({ name: "d", text: svg48('<path d="M8 8H40V40H8Z" />') }, 48, 24, "#262626");
  assert.match(duo, /^<g [^>]*fill="none" stroke="#262626"/);
});
