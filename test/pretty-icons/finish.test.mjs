// The Hairline finish (refine 1): no faceted bodies, one accent per body, and a set's weight
// held to the reference as well as to its own median.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { textChecks, checkSet, formatFailure } from "../../skills/pretty-icons/check.mjs";
import { REFERENCE_INK, REFERENCE_TOL, WEIGHT_TOL } from "../../skills/pretty-icons/presets.mjs";

const fix = (n) => new URL(`./fixtures/${n}/`, import.meta.url).pathname;
const read = (dir, n) => readFileSync(join(fix(dir), `${n}.svg`), "utf8");
const lines = (r) => r.failures.map(formatFailure);
const of = (r, rule) => [...new Set(r.failures.filter((f) => f.rule === rule).map((f) => f.icon))].sort();
const tmp = (t) => { const dir = mkdtempSync(join(tmpdir(), "pi-finish-")); t.after(() => rmSync(dir, { recursive: true, force: true })); return dir; };
const ROOT = '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
const icon = (...els) => `${ROOT}\n${els.map((e) => `  ${e}`).join("\n")}\n</svg>\n`;
const FILLED = 'fill="currentColor" fill-opacity=".2"';
const BOX = `<rect x="2.5" y="2.5" width="11" height="11" rx="1.5" ${FILLED} />`;

// ---- contour -----------------------------------------------------------

test("contour: a hexagon body is faceted", () => {
  const r = textChecks("node", read("finish", "node"), 16);
  assert.deepEqual(lines(r), ["contour  node  path@2 6 straight sides → at most 5, or curves"]);
});

test("contour: rects, circles, triangles and the hairline shield pass", () => {
  for (const n of ["marks", "security", "all", "machines"]) {
    const r = textChecks(n, readFileSync(new URL(`../../skills/pretty-icons/examples/hairline/${n}.svg`, import.meta.url), "utf8"), 16);
    assert.deepEqual(of(r, "contour"), [], n);
  }
  const square = textChecks("x", icon(`<path d="M2.5 2.5H13.5V13.5H2.5Z" ${FILLED} />`), 16);
  assert.deepEqual(of(square, "contour"), []);
});

test("contour: a Z that closes on the start adds no side; a Z that draws one does", () => {
  const closed = textChecks("x", icon(`<path d="M2.5 2.5H13.5V13.5H2.5V2.5Z" ${FILLED} />`), 16);
  assert.deepEqual(of(closed, "contour"), [], "four sides, and a zero-length close");
  const hexagon = textChecks("x", icon(`<path d="M2.5 2.5H13.5V13.5H10.5H5.5H2.5Z" ${FILLED} />`), 16);
  assert.deepEqual(lines(hexagon).filter((l) => l.startsWith("contour")), ["contour  x  path@2 6 straight sides → at most 5, or curves"]);
});

test("contour: five straight sides, a house's walls and roof, pass", () => {
  const pentagon = textChecks("x", icon(`<path d="M2.5 2.5H13.5V13.5H8H2.5Z" ${FILLED} />`), 16);
  assert.deepEqual(of(pentagon, "contour"), [], "the closing Z draws the fifth side");
  const house = textChecks("home", icon(`<path d="M2.5 6.5 8 1.75 13.5 6.5V12.25H2.5Z" ${FILLED} />`), 16);
  assert.deepEqual(of(house, "contour"), []);
});

test("contour: an unfilled path is a detail and is not checked", () => {
  const r = textChecks("x", icon(BOX, '<path d="M5 6h1.5v1.5H8V9h1.5v1.5" />'), 16);
  assert.deepEqual(of(r, "contour"), []);
});

// ---- count: the details cap --------------------------------------------

test("count: three wisps of steam and a handle are four subpaths", () => {
  const r = textChecks("java", read("finish", "java"), 16);
  assert.deepEqual(lines(r), ["count  java  details 4 subpaths → at most 2"]);
});

test("count: a glyph of eleven drawing commands, no path over eight", () => {
  const r = textChecks("php", read("finish", "php"), 16);
  assert.deepEqual(lines(r), ["count  php  details 11 drawing commands → at most 8"]);
});

test("count: a circle, rect or line detail is one subpath and one command", () => {
  const two = textChecks("x", icon(BOX, '<circle cx="8" cy="8" r="1.5" />', '<line x1="5" y1="11" x2="11" y2="11" />'), 16);
  assert.deepEqual(of(two, "count"), [], "two details, two subpaths");
  const three = textChecks("x", icon(BOX, '<circle cx="8" cy="8" r="1.5" />', '<path d="M5 11h0M11 11h0" />'), 16);
  assert.ok(lines(three).includes("count  x  details 3 subpaths → at most 2"), lines(three).join("\n"));
});

test("count: moves are not drawing commands; implicit repeats are", () => {
  // 5 + 4 drawing commands: two moves left out, the implicit lines counted
  const r = textChecks("x", icon(BOX, '<path d="M4 5 5 6 6 5 7 6 8 5 9 6" />', '<path d="M4 10 5 11 6 10 7 11 8 10" />'), 16);
  assert.ok(lines(r).includes("count  x  details 9 drawing commands → at most 8"), lines(r).join("\n"));
  const ok = textChecks("x", icon(BOX, '<path d="M4 5 5 6 6 5 7 6 8 5" />', '<path d="M4 10 5 11 6 10 7 11 8 10" />'), 16);
  assert.deepEqual(of(ok, "count"), [], "eight drawing commands is the cap");
});

test("count: the examples' details fit the cap (coding: two braces, eight commands)", () => {
  const r = textChecks("coding", readFileSync(new URL("../../skills/pretty-icons/examples/hairline/coding.svg", import.meta.url), "utf8"), 16);
  assert.deepEqual(r.failures, []);
});

// ---- weight: the reference ---------------------------------------------

test("weight: the tolerances", () => {
  assert.equal(WEIGHT_TOL, 0.15);
  assert.equal(REFERENCE_TOL, 0.2);
  assert.deepEqual(REFERENCE_INK, { 16: 83.5, 20: 114.2, 24: 181.9 });
});

test("weight: a set uniformly over the reference fails it, though even with itself", async (t) => {
  const dir = tmp(t);
  const badge = read("finish", "javascript");
  for (const n of ["javascript", "badge", "box"]) writeFileSync(join(dir, `${n}.svg`), badge);
  const r = await checkSet(dir);
  assert.equal(r.measured, true);
  assert.deepEqual(lines(r).filter((l) => l.startsWith("weight  javascript")), ["weight  javascript  ink 226.95 (+24.8%) → within ±20% of the reference 181.9"]);
  assert.deepEqual(of(r, "weight"), ["badge", "box", "javascript"]);
  assert.ok(!r.failures.some((f) => /median/.test(f.want)), "each is the median");
});

// ---- the baseline sets -------------------------------------------------

test("languages fails weight on the badges and contour on the faceted bodies", async () => {
  const r = await checkSet(fix("languages"));
  assert.equal(r.measured, true);
  const l = lines(r);
  assert.ok(l.includes("weight  javascript  ink 226.95 (+24.8%) → within ±20% of the reference 181.9"), l.join("\n"));
  assert.ok(l.includes("contour  node  path@2 6 straight sides → at most 5, or curves"), l.join("\n"));
  for (const n of ["go", "javascript", "php", "typescript"]) assert.ok(of(r, "weight").includes(n), `${n} in ${of(r, "weight")}`);
  // ruby's gem has five straight sides and now passes contour; it is left to the reader (rule 04).
  assert.deepEqual(of(r, "contour"), ["node", "python"]);
  assert.ok(of(r, "count").includes("java"), "three wisps of steam");
});

test("workspace: its five-sided house passes contour, and the set passes check", async () => {
  // The track through each knob and the chimney are left to the reader: rules 08 and 09, not measured.
  const r = await checkSet(fix("workspace"));
  assert.equal(r.measured, true);
  assert.deepEqual(of(r, "contour"), []);
  assert.deepEqual(lines(r), []);
});

test("the worked examples in rules.md (house, sliders) pass in a set", async () => {
  const dir = fix("worked-16");
  const r = await checkSet(dir);
  assert.equal(r.measured, true);
  assert.deepEqual(lines(r), []);
  const rules = readFileSync(new URL("../../skills/pretty-icons/rules.md", import.meta.url), "utf8");
  for (const [name, d] of [["home", 'M2.5 6.5 8 1.75l5.5 4.75v4.75a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1z'], ["home", "M6.5 12.25v-3.5h3v3.5"], ["settings", "M7.25 4.5h7M1.75 11.5h7"]]) {
    assert.ok(read("worked-16", name).includes(`d="${d}"`), `${name} holds ${d}`);
    assert.ok(rules.includes(d), `rules.md gives ${d}`);
  }
  const knobs = [...read("worked-16", "settings").matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/g)].map((m) => `cx ${m[1]} cy ${m[2]} r ${m[3]}`);
  assert.deepEqual(knobs, ["cx 4.5 cy 4.5 r 2.75", "cx 11.5 cy 11.5 r 2.75"]);
  for (const k of knobs) assert.ok(rules.includes(k), `rules.md gives ${k}`);
});

test("examples/hairline is still ok", async () => {
  const r = await checkSet(new URL("../../skills/pretty-icons/examples/hairline/", import.meta.url).pathname);
  assert.equal(r.measured, true);
  assert.deepEqual(lines(r), []);
});
