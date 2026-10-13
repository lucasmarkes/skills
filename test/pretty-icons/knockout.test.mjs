import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { knockout, haloOf, cutBody, KnockoutError } from "../../skills/pretty-icons/knockout.mjs";
import { paper, band } from "../../skills/pretty-icons/raster.mjs";
import { textChecks, formatFailure } from "../../skills/pretty-icons/check.mjs";
import { parse, compose } from "../../skills/pretty-icons/svg.mjs";
import { svg24b, SQ24B, LINE } from "./bulk.test.mjs";

const SCRIPT = new URL("../../skills/pretty-icons/knockout.mjs", import.meta.url).pathname;
const tmp = (t) => { const dir = mkdtempSync(join(tmpdir(), "pi-")); t.after(() => rmSync(dir, { recursive: true, force: true })); return dir; };
const el = (svg, i = 0) => parse(svg).elements[i];
const full = (root, els) => compose({ ...root, fill: "currentColor" }, els.map((e) => { const { "fill-opacity": _, "data-cut": __, "data-body": ___, ...a } = e.attrs; return { ...e, attrs: a }; }));
/** The three renders band() wants, from a cut file: the cut element, its uncut geometry, the solids in front of it. */
const renders = (svg, i = 0) => {
  const p = parse(svg), cut = p.elements[i], fronts = p.elements.slice(i + 1);
  return [full(p.attrs, [cut]), full(p.attrs, [{ ...cut, attrs: { ...cut.attrs, d: cut.attrs["data-body"] } }]), full(p.attrs, fronts)];
};
// a filled square over the squircle's lower right corner: partly over it, so it stacks
const FRONT = '<path d="M 14 14 H 22 V 22 H 14 Z" />';
const DIAMOND = '<path d="M 12 6 L 18 12 L 12 18 L 6 12 Z" />';

test("a stack: the squircle behind is cut by the square in front grown by 0.75, data-cut and data-body, check prints ok on the text rules", async () => {
  const src = svg24b(`${SQ24B}\n  ${FRONT}`);
  const r = knockout(src, { name: "edit" });
  assert.notEqual(r.text, src);
  assert.deepEqual(r.cut, [{ body: "path@2", under: ["path@3"] }]);
  const p = parse(r.text);
  assert.equal(p.elements.length, 2);
  assert.equal(p.elements[0].attrs["data-cut"], "knockout");
  assert.equal(p.elements[0].attrs["data-body"], el(src).attrs.d);
  assert.equal(p.elements[0].attrs["fill-opacity"], ".4");
  assert.equal(p.elements[1].attrs.d, el(src, 1).attrs.d);
  assert.deepEqual(await band(...renders(r.text), 24, 0.75, 0.25), []);
  assert.notDeepEqual(await band(...renders(r.text), 24, 1.5, 0.25), [], "the gap is 0.75, not the old 1.5");
  assert.deepEqual(textChecks("edit", r.text, 24).failures.map(formatFailure), []);
  // one element per line, two-space indent, as modifiers.mjs writes
  assert.match(r.text, /^<svg[^>]*>\n  <path [^\n]*\/>\n  <path [^\n]*\/>\n<\/svg>\n$/);
});

test("overprint is never cut: a line through a body, a filled accent inside it; the file comes back byte for byte", () => {
  for (const front of [LINE("M 2 12 H 22"), LINE("M 8 12 H 16 M 12 8 V 16"), DIAMOND]) {
    const src = svg24b(`${SQ24B}\n  ${front}`);
    const r = knockout(src, { name: "edit" });
    assert.equal(r.text, src, front);
    assert.deepEqual(r.cut, [], front);
  }
  const two = svg24b(`<path d="M 3 3 H 11 V 21 H 3 Z" fill-opacity=".4" />\n  <path d="M 13 3 H 21 V 21 H 13 Z" fill-opacity=".4" />\n  ${LINE("M 5 12 H 19")}`);
  assert.equal(knockout(two, { name: "edit" }).text, two);
});

test("a body in front stacks too, and one solid in front of two cuts both", () => {
  const bodies = svg24b(`<path d="M 3 3 H 13 V 13 H 3 Z" />\n  <path d="M 9 9 H 21 V 21 H 9 Z" fill-opacity=".4" />`);
  assert.deepEqual(knockout(bodies, { name: "edit" }).cut, [{ body: "path@2", under: ["path@3"] }]);
  const two = svg24b(`<path d="M 3 3 H 11 V 21 H 3 Z" fill-opacity=".4" />\n  <path d="M 13 3 H 21 V 21 H 13 Z" fill-opacity=".4" />\n  <path d="M 8 10 H 16 V 14 H 8 Z" />`);
  const r = knockout(two, { name: "edit" });
  assert.deepEqual(r.cut, [{ body: "path@2", under: ["path@4"] }, { body: "path@3", under: ["path@4"] }]);
  assert.ok(parse(r.text).elements.slice(0, 2).every((e) => e.attrs["data-cut"] === "knockout"));
});

test("a later solid over a line, a body inside an element: refused with check's line", () => {
  const overLine = svg24b(`<circle cx="12" cy="12" r="10" fill-opacity=".4" />\n  ${LINE("M 4 12 H 20")}\n  <path d="M 10 10 H 14 V 14 H 10 Z" />`);
  assert.throws(() => knockout(overLine, { name: "edit" }), (e) => e instanceof KnockoutError && e.message === "stack  edit  path@4 over the line path@3 → draw the line in front, or keep them apart");
  const inner = svg24b(`${SQ24B}\n  <path d="M 9 9 H 15 V 15 H 9 Z" fill-opacity=".4" />\n  ${LINE("M 6 6 H 9")}`);
  assert.throws(() => knockout(inner, { name: "edit" }), (e) => e instanceof KnockoutError && e.message === "stack  edit  path@3 inside path@2 → a gray detail vanishes: make it an accent, or a stack");
});

test("a circle behind comes back a path: no cx, cy or r, its outline in data-body, the same file twice", async () => {
  const src = svg24b(`<circle cx="12" cy="12" r="10" fill-opacity=".4" />\n  <path d="M 16 16 H 23 V 23 H 16 Z" />`);
  const r = knockout(src, { name: "edit" });
  assert.deepEqual(r.cut, [{ body: "circle@2", under: ["path@3"] }]);
  const body = parse(r.text).elements[0];
  assert.equal(body.tag, "path");
  assert.deepEqual(["cx", "cy", "r"].filter((k) => k in body.attrs), []);
  assert.match(body.attrs["data-body"], /^M2 12A10 10/);
  assert.deepEqual(await band(...renders(r.text), 24, 0.75, 0.25), []);
  assert.deepEqual(textChecks("edit", r.text, 24).failures.map(formatFailure), []);
  assert.equal(knockout(r.text, { name: "edit" }).text, r.text);
});

test("nothing overlapping, or only a touch: the file comes back byte for byte", () => {
  const beside = svg24b(`${SQ24B}\n  <path d="M 1 1 H 3.5 V 3.5 H 1 Z" />`);
  assert.equal(knockout(beside, { name: "edit" }).text, beside);
  assert.deepEqual(knockout(beside, { name: "edit" }).cut, []);
  const touching = svg24b(`${SQ24B}\n  <path d="M 21 4 H 23 V 20 H 21 Z" />`);
  assert.equal(knockout(touching, { name: "edit" }).text, touching);
});

test("twice gives the same file; a stale cut is restored from data-body", () => {
  const src = svg24b(`${SQ24B}\n  ${FRONT}`);
  const once = knockout(src, { name: "edit" }).text;
  assert.equal(knockout(once, { name: "edit" }).text, once);
  // move the front away: the body goes back to its uncut geometry
  const moved = once.replace(FRONT, '<path d="M 1 1 H 3.5 V 3.5 H 1 Z" />');
  const back = parse(knockout(moved, { name: "edit" }).text).elements[0];
  assert.equal(back.attrs.d, el(src).attrs.d);
  assert.equal(back.attrs["data-cut"], undefined);
  assert.equal(back.attrs["data-body"], undefined);
});

test("a cut that leaves a crumb refuses, with the piece's size and the piece in front", () => {
  const crumb = svg24b(`<path d="M 3 3 H 21 V 21 H 3 Z" fill-opacity=".4" />\n  <path d="M 2 2 H 22 V 19.5 H 2 Z" />`);
  assert.throws(() => knockout(crumb, { name: "edit" }), (e) => e instanceof KnockoutError && e.message === "crumb  edit  path@2 a piece 0.75 across under path@3 → at least 1: move the piece in front");
});

test("a file failing the text rules is refused with check's line and never written", (t) => {
  const dir = tmp(t), file = join(dir, "edit.svg");
  const bad = svg24b(`<rect x="3" y="3" width="18" height="18" rx="5" fill-opacity=".4" />\n  ${DIAMOND}`);
  writeFileSync(file, bad);
  assert.throws(() => knockout(bad, { name: "edit" }), (e) => e instanceof KnockoutError && e.message === "radius  edit  rect@2 → shapes.mjs squircle");
  const r = spawnSync("node", [SCRIPT, file], { encoding: "utf8" });
  assert.equal(r.status, 1);
  assert.equal(r.stderr.trim(), "knockout: radius  edit  rect@2 → shapes.mjs squircle");
  assert.equal(readFileSync(file, "utf8"), bad);
});

test("the CLI writes the file and says what it cut; --print prints without writing", (t) => {
  const dir = tmp(t), file = join(dir, "edit.svg");
  const src = svg24b(`${SQ24B}\n  ${FRONT}`);
  writeFileSync(file, src);
  const p = spawnSync("node", [SCRIPT, file, "--print"], { encoding: "utf8" });
  assert.equal(p.status, 0);
  assert.equal(p.stdout, knockout(src, { name: "edit" }).text);
  assert.ok(p.stdout.endsWith("</svg>\n") && !p.stdout.endsWith("\n\n"), "exactly one trailing newline");
  assert.equal(readFileSync(file, "utf8"), src);
  const w = spawnSync("node", [SCRIPT, file], { encoding: "utf8" });
  assert.equal(w.status, 0);
  assert.equal(w.stdout.trim(), "edit  cut path@2 under path@3");
  assert.equal(readFileSync(file, "utf8"), knockout(src, { name: "edit" }).text);
  const again = spawnSync("node", [SCRIPT, file], { encoding: "utf8" });
  assert.equal(again.stdout.trim(), "edit  nothing to cut");
  const u = spawnSync("node", [SCRIPT], { encoding: "utf8" });
  assert.equal(u.status, 1);
  assert.equal(u.stderr.trim(), "usage: node knockout.mjs <icon.svg> [--print]");
});

test("a curved line's halo is within 0.05 of the exact offset at 65 samples; a circle's halo is a circle", () => {
  const P = paper();
  const arc = el(svg24b(LINE("M 6 12 A 6 6 0 0 1 18 12")));
  const halo = haloOf(arc, 0.75, P);
  // the exact offset: 1.625 (half the line, plus the gap) outside and inside the arc's centreline, over the top half
  for (let i = 0; i <= 64; i++) {
    const a = Math.PI + (Math.PI * i) / 64;
    for (const rr of [7.625, 4.375]) {
      const q = new P.Point(12 + rr * Math.cos(a), 12 + rr * Math.sin(a));
      assert.ok(halo.getNearestPoint(q).getDistance(q) <= 0.05, `sample ${i} at r ${rr}: ${halo.getNearestPoint(q).getDistance(q)}`);
    }
  }
  const circle = el(svg24b('<circle cx="12" cy="12" r="3" />'));
  const h = haloOf(circle, 0.75, P);
  assert.ok(Math.abs(h.area - Math.PI * 3.75 * 3.75) < 0.05, String(h.area));
});

test("cutBody: a circle, a square in front of it: the hole is the square grown by 0.75", () => {
  const P = paper();
  const body = el(svg24b('<circle cx="12" cy="12" r="10" fill-opacity=".4" />'));
  const acc = el(svg24b('<path d="M 10 10 H 14 V 14 H 10 Z" />'));
  const { d, crossed } = cutBody(body, [acc], 0.75, P);
  assert.deepEqual(crossed.map((e) => e.at), ["path@2"]);
  const item = new P.CompoundPath(d);
  item.remove();
  assert.equal(item.children.length, 2); // the disc and its hole
  const hole = 16 + 4 * 4 * 0.75 + Math.PI * 0.75 * 0.75; // the square, four 4 × 0.75 sides, four quarter circles
  assert.ok(Math.abs(Math.abs(item.area) - (Math.PI * 100 - hole)) < 0.5, String(item.area));
});

test("a crumb is judged by its thickness, not its box: a slanted strip under 1 thick refuses", () => {
  // a slanted strip left t thick: the band x + y from 24 to 30, the front's halo edge at x + y = 30 − t√2
  const P = paper();
  const body = el(svg24b('<path d="M 3 21 L 21 3 L 21 9 L 9 21 Z" fill-opacity=".4" />'));
  const strip = (t) => { const e = 30 - t * Math.SQRT2 - 0.75 * Math.SQRT2; return cutBody(body, [el(svg24b(`<path d="M ${e - 3} 3 L 3 ${e - 3} L 3 3 Z" />`))], 0.75, P, "edit"); };
  assert.equal(strip(1).crossed.length, 1);
  assert.throws(() => strip(0.9), (e) => e instanceof KnockoutError && e.message === "crumb  edit  path@2 a piece 0.9 across under path@2 → at least 1: move the piece in front");
});

test("a contour is refused with check's line", () => {
  const contour = svg24b(`<path d="M 3 3 H 21 V 21 H 3 Z" fill-opacity=".4" stroke="currentColor" stroke-width="1.75" />\n  ${DIAMOND}`);
  assert.throws(() => knockout(contour, { name: "edit" }), (e) => e instanceof KnockoutError && e.message === "stroke  edit  path@2 stroke-linecap missing → round");
});

test("a curved front leaves no zero-length segment in the cut", () => {
  const src = svg24b(`<circle cx="12" cy="12" r="9" fill-opacity=".4" />\n  <circle cx="18.5" cy="17.5" r="4" />`);
  const d = parse(knockout(src, { name: "edit" }).text).elements[0].attrs.d;
  let cur = null;
  for (const seg of d.match(/[MLCZ][^MLCZ]*/g)) {
    const n = seg.slice(1).trim().split(/\s+/).filter(Boolean).map(Number);
    if (seg[0] === "Z") continue;
    if (seg[0] !== "M") assert.ok(!(cur && n.every((v, i) => v === cur[i % 2])), `zero-length ${seg.trim()} after ${cur}`);
    cur = n.slice(-2);
  }
});
