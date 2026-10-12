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
/** The three renders band() wants, from a cut file: the cut body, its uncut geometry, the accents that cross it. */
const renders = (svg) => {
  const p = parse(svg), body = p.elements.find((e) => e.attrs["data-cut"]), accents = p.elements.filter((e) => e !== body);
  return [full(p.attrs, [body]), full(p.attrs, [{ ...body, attrs: { ...body.attrs, d: body.attrs["data-body"] } }]), full(p.attrs, accents)];
};
const DIAMOND = '<path d="M 12 6 L 18 12 L 12 18 L 6 12 Z" />';

test("a squircle less a rotated square: one body, data-cut and data-body, a band of 1.5 everywhere, check prints ok on the text rules", async () => {
  const src = svg24b(`${SQ24B}\n  ${DIAMOND}`);
  const r = knockout(src, { name: "edit" });
  assert.notEqual(r.text, src);
  assert.deepEqual(r.cut, [{ body: "path@2", under: ["path@3"] }]);
  const p = parse(r.text);
  assert.equal(p.elements.length, 2);
  assert.equal(p.elements[0].attrs["data-cut"], "knockout");
  assert.equal(p.elements[0].attrs["data-body"], el(src).attrs.d);
  assert.equal(p.elements[0].attrs["fill-opacity"], ".4");
  assert.equal(p.elements[1].attrs.d, el(src, 1).attrs.d);
  assert.deepEqual(await band(...renders(r.text), 24, 1.5, 0.25), []);
  assert.deepEqual(textChecks("edit", r.text, 24).failures.map(formatFailure), []);
  // one element per line, two-space indent, as modifiers.mjs writes
  assert.match(r.text, /^<svg[^>]*>\n  <path [^\n]*\/>\n  <path [^\n]*\/>\n<\/svg>\n$/);
});

test("a line through a body leaves one element with two subpaths; a line crossing two bodies cuts both", async () => {
  const through = svg24b(`${SQ24B}\n  ${LINE("M 2 12 H 22")}`);
  const r = knockout(through, { name: "edit" });
  const body = parse(r.text).elements[0];
  assert.equal(parse(r.text).elements.length, 2);
  assert.equal((body.attrs.d.match(/M /g) ?? []).length, 2);
  assert.deepEqual(await band(...renders(r.text), 24, 1.5, 0.25), []);
  const two = svg24b(`<path d="M 3 3 H 11 V 21 H 3 Z" fill-opacity=".4" />\n  <path d="M 13 3 H 21 V 21 H 13 Z" fill-opacity=".4" />\n  ${LINE("M 5 12 H 19")}`);
  const r2 = knockout(two, { name: "edit" });
  assert.deepEqual(r2.cut, [{ body: "path@2", under: ["path@4"] }, { body: "path@3", under: ["path@4"] }]);
  assert.ok(parse(r2.text).elements.slice(0, 2).every((e) => e.attrs["data-cut"] === "knockout"));
});

test("a circle body under a line comes back a path: no cx, cy or r, its outline in data-body, the same file twice", async () => {
  const src = svg24b(`<circle cx="12" cy="12" r="10" fill-opacity=".4" />\n  ${LINE("M 4 12 H 20")}`);
  const r = knockout(src, { name: "edit" });
  assert.deepEqual(r.cut, [{ body: "circle@2", under: ["path@3"] }]);
  const body = parse(r.text).elements[0];
  assert.equal(body.tag, "path");
  assert.deepEqual(["cx", "cy", "r"].filter((k) => k in body.attrs), []);
  assert.match(body.attrs["data-body"], /^M2 12A10 10/);
  assert.deepEqual(await band(...renders(r.text), 24, 1.5, 0.25), []);
  assert.deepEqual(textChecks("edit", r.text, 24).failures.map(formatFailure), []);
  assert.equal(knockout(r.text, { name: "edit" }).text, r.text);
});

test("no crossing, or only a touch: the file comes back byte for byte", () => {
  const beside = svg24b(`${SQ24B}\n  <path d="M 1 1 H 3.5 V 3.5 H 1 Z" />`);
  assert.equal(knockout(beside, { name: "edit" }).text, beside);
  assert.deepEqual(knockout(beside, { name: "edit" }).cut, []);
  const touching = svg24b(`${SQ24B}\n  ${LINE("M 22 4 V 20")}`);
  assert.equal(knockout(touching, { name: "edit" }).text, touching);
});

test("twice gives the same file; a stale cut is restored from data-body", () => {
  const src = svg24b(`${SQ24B}\n  ${DIAMOND}`);
  const once = knockout(src, { name: "edit" }).text;
  assert.equal(knockout(once, { name: "edit" }).text, once);
  // move the accent away: the body goes back to its uncut geometry
  const moved = once.replace(DIAMOND, '<path d="M 1 1 H 3.5 V 3.5 H 1 Z" />');
  const back = parse(knockout(moved, { name: "edit" }).text).elements[0];
  assert.equal(back.attrs.d, el(src).attrs.d);
  assert.equal(back.attrs["data-cut"], undefined);
  assert.equal(back.attrs["data-body"], undefined);
});

test("a cut that leaves a crumb refuses, with the piece's size and the accent", () => {
  const crumb = svg24b(`<path d="M 3 3 H 21 V 21 H 3 Z" fill-opacity=".4" />\n  ${LINE("M 2 18 H 22")}`);
  assert.throws(() => knockout(crumb, { name: "edit" }), (e) => e instanceof KnockoutError && e.message === "crumb  edit  path@2 a piece 0.5 across under path@3 → at least 1: move the accent, or make it a body");
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
  const src = svg24b(`${SQ24B}\n  ${DIAMOND}`);
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

test("a curved line's halo is within 0.05 of the exact offset at 65 samples; a circle accent's halo is a circle", () => {
  const P = paper();
  const arc = el(svg24b(LINE("M 6 12 A 6 6 0 0 1 18 12")));
  const halo = haloOf(arc, 1.5, P);
  // the exact offset: 2.5 (half the line, plus the band) outside and inside the arc's centreline, over the top half
  for (let i = 0; i <= 64; i++) {
    const a = Math.PI + (Math.PI * i) / 64;
    for (const rr of [8.5, 3.5]) {
      const q = new P.Point(12 + rr * Math.cos(a), 12 + rr * Math.sin(a));
      assert.ok(halo.getNearestPoint(q).getDistance(q) <= 0.05, `sample ${i} at r ${rr}: ${halo.getNearestPoint(q).getDistance(q)}`);
    }
  }
  const circle = el(svg24b('<circle cx="12" cy="12" r="3" />'));
  const h = haloOf(circle, 1.5, P);
  assert.ok(Math.abs(h.area - Math.PI * 4.5 * 4.5) < 0.05, String(h.area));
});

test("cutBody: a circle body, a filled accent inside: the hole is the accent grown by 1.5", () => {
  const P = paper();
  const body = el(svg24b('<circle cx="12" cy="12" r="10" fill-opacity=".4" />'));
  const acc = el(svg24b('<path d="M 10 10 H 14 V 14 H 10 Z" />'));
  const { d, crossed } = cutBody(body, [acc], 1.5, P);
  assert.deepEqual(crossed.map((e) => e.at), ["path@2"]);
  const item = new P.CompoundPath(d);
  item.remove();
  assert.equal(item.children.length, 2); // the disc and its hole
  const hole = 16 + 4 * 1.5 * 4 + Math.PI * 1.5 * 1.5; // the square, four 4 × 1.5 sides, four quarter circles
  assert.ok(Math.abs(Math.abs(item.area) - (Math.PI * 100 - hole)) < 0.5, String(item.area));
});

test("a line of two subpaths, a plus or an x, is haloed on every arm: a band of 1.5 all round", async () => {
  for (const d of ["M 8 12 H 16 M 12 8 V 16", "M 9 9 L 15 15 M 15 9 L 9 15"]) {
    const r = knockout(svg24b(`${SQ24B}\n  ${LINE(d)}`), { name: "edit" });
    assert.deepEqual(r.cut, [{ body: "path@2", under: ["path@3"] }], d);
    assert.deepEqual(await band(...renders(r.text), 24, 1.5, 0.25), [], d);
  }
  const P = paper();
  const h = haloOf(el(svg24b(LINE("M 8 12 H 16 M 12 8 V 16"))), 1.5, P);
  assert.ok(h.contains(new P.Point(12, 6)) && h.contains(new P.Point(12, 18)) && !h.contains(new P.Point(9, 9)));
});

test("a crumb is judged by its thickness, not its box: a crescent 0.6 thick refuses", () => {
  const crescent = svg24b(`<circle cx="12" cy="12" r="10" fill-opacity=".4" />\n  ${LINE("M 20.5 13.25 L 13.25 20.5")}`);
  assert.throws(() => knockout(crescent, { name: "edit" }), (e) => e instanceof KnockoutError && /^crumb  edit  circle@2 a piece 0\.\d+ across under path@3 → at least 1: move the accent, or make it a body$/.test(e.message) && Number(/piece ([\d.]+)/.exec(e.message)[1]) < 1);
  // a slanted strip left t thick: the band x + y from 24 to 30, the accent's halo edge at x + y = 30 − t√2
  const P = paper();
  const body = el(svg24b('<path d="M 3 21 L 21 3 L 21 9 L 9 21 Z" fill-opacity=".4" />'));
  const strip = (t) => { const e = 30 - t * Math.SQRT2 - 1.5 * Math.SQRT2; return cutBody(body, [el(svg24b(`<path d="M ${e - 3} 3 L 3 ${e - 3} L 3 3 Z" />`))], 1.5, P, "edit"); };
  assert.equal(strip(1).crossed.length, 1);
  assert.throws(() => strip(0.9), (e) => e instanceof KnockoutError && e.message === "crumb  edit  path@2 a piece 0.9 across under path@2 → at least 1: move the accent, or make it a body");
});

test("a contour is refused with check's line", () => {
  const contour = svg24b(`<path d="M 3 3 H 21 V 21 H 3 Z" fill-opacity=".4" stroke="currentColor" stroke-width="2" />\n  ${DIAMOND}`);
  assert.throws(() => knockout(contour, { name: "edit" }), (e) => e instanceof KnockoutError && e.message === "stroke  edit  path@2 stroke-linecap missing → round");
});

test("a curved accent leaves no zero-length segment in the cut", () => {
  const src = svg24b(`<circle cx="12" cy="12" r="9" fill-opacity=".4" />\n  ${LINE("M7.5 21 Q12 15 20 4")}`);
  const d = parse(knockout(src, { name: "edit" }).text).elements[0].attrs.d;
  let cur = null;
  for (const seg of d.match(/[MLCZ][^MLCZ]*/g)) {
    const n = seg.slice(1).trim().split(/\s+/).filter(Boolean).map(Number);
    if (seg[0] === "Z") continue;
    if (seg[0] !== "M") assert.ok(!(cur && n.every((v, i) => v === cur[i % 2])), `zero-length ${seg.trim()} after ${cur}`);
    cur = n.slice(-2);
  }
});
