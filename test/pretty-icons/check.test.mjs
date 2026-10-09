import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, cpSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkSet } from "../../skills/pretty-icons/check.mjs";
import { nearestKeyline } from "../../skills/pretty-icons/measure.mjs";

const fix = (n) => new URL(`./fixtures/${n}/`, import.meta.url).pathname;
const rules = (r) => [...new Set(r.failures.map((f) => f.rule))].sort();
const of = (r, rule) => r.failures.filter((f) => f.rule === rule).map((f) => f.icon).sort();
/** A fresh temp dir, removed when the test ends. */
const tmp = (t) => { const dir = mkdtempSync(join(tmpdir(), "pi-")); t.after(() => rmSync(dir, { recursive: true, force: true })); return dir; };
const ROOT = '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';

test("nearestKeyline", () => {
  assert.equal(nearestKeyline(16, 14, 10.9).format, "landscape");
  assert.equal(nearestKeyline(16, 13.6, 13.4).format, "circle");
  assert.equal(nearestKeyline(16, 12.4, 12.6).format, "square");
  assert.equal(nearestKeyline(16, 8, 14).format, "portrait");
});

test("good-16 passes every rule", async () => {
  const r = await checkSet(fix("good-16"));
  assert.equal(r.measured, true);
  assert.deepEqual(r.failures, []);
  assert.equal(r.rows.length, 4);
  assert.deepEqual(r.rows.map((x) => x.keyline).sort(), ["circle", "landscape", "portrait", "square"]);
});

test("hairline-before fails on keyline, construction, weight and gap", async () => {
  const r = await checkSet(fix("hairline-before"));
  assert.equal(r.measured, true);
  for (const rule of ["keyline", "construction", "weight", "gap"]) assert.ok(rules(r).includes(rule), `${rule} in ${rules(r)}`);
  assert.ok(of(r, "keyline").includes("coding"), "coding is 12.5 × 10.5, no keyline");
  assert.ok(of(r, "keyline").includes("devices"), "devices is 8 × 14, no keyline");
  assert.ok(of(r, "weight").includes("all") && of(r, "weight").includes("interfaces"), "the heaviest and the lightest");
  assert.ok(of(r, "gap").includes("all"), "the four squares are 0.5 apart outer edge to outer edge");
});

test("gravity: an icon whose mass sits off centre", async (t) => {
  const dir = tmp(t);
  cpSync(fix("good-16"), dir, { recursive: true });
  writeFileSync(join(dir, "corner.svg"), `${ROOT}\n  <rect x="2.5" y="2.5" width="5" height="5" rx="1" fill="currentColor" fill-opacity=".2" />\n</svg>\n`);
  const r = await checkSet(dir);
  assert.ok(of(r, "gravity").includes("corner"));
});

test("gap: crossing counts as touching, almost does not", async (t) => {
  const dir = tmp(t);
  cpSync(fix("good-16"), dir, { recursive: true });
  const tile = readFileSync(join(fix("good-16"), "tile.svg"), "utf8");
  const disc = readFileSync(join(fix("good-16"), "disc.svg"), "utf8");
  writeFileSync(join(dir, "cross.svg"), tile.replace('<path d="M5.5 8h5" />', '<path d="M2 8h12" />'));
  writeFileSync(join(dir, "almost.svg"), disc.replace('<circle cx="8" cy="8" r="1.25" />', '<circle cx="8" cy="8" r="4.5" />'));
  const r = await checkSet(dir);
  assert.ok(!of(r, "gap").includes("cross"), "a line across the body's edges touches it");
  assert.ok(of(r, "gap").includes("almost"), "two rings 1.75 apart centre to centre are 0.25 apart outer edge to outer edge");
});

test("gap: strokes that overlap without their centrelines meeting say so", async (t) => {
  const dir = tmp(t);
  cpSync(fix("good-16"), dir, { recursive: true });
  // the line's ends sit 1 from the tile's sides: the strokes overlap, the centrelines do not meet
  writeFileSync(join(dir, "overlap.svg"), readFileSync(join(fix("good-16"), "tile.svg"), "utf8").replace('d="M5.5 8h5"', 'd="M3.5 8h9"'));
  const r = await checkSet(dir);
  const g = r.failures.filter((f) => f.rule === "gap" && f.icon === "overlap");
  assert.ok(g.length > 0, "gap fires");
  for (const f of g) assert.match(f.got, /overlapping/);
});

test("live: ink past the padding", async (t) => {
  const dir = tmp(t);
  cpSync(fix("good-16"), dir, { recursive: true });
  writeFileSync(join(dir, "wide.svg"), readFileSync(join(fix("good-16"), "card.svg"), "utf8").replace('d="M1.75 6.25h12.5"', 'd="M1 6.25h14"'));
  const r = await checkSet(dir);
  assert.ok(of(r, "live").includes("wide"));
});

test("weight with one icon falls back to the reference and says so", async (t) => {
  const dir = tmp(t);
  // a lone small ring, ink ≈ 20: far under any plausible reference
  writeFileSync(join(dir, "ring.svg"), `${ROOT}\n  <circle cx="8" cy="8" r="2" fill="currentColor" fill-opacity=".2" />\n</svg>\n`);
  const r = await checkSet(dir);
  assert.equal(r.measured, true);
  const w = r.failures.filter((f) => f.rule === "weight");
  assert.ok(w.length > 0, "the ring is far lighter than the reference");
  for (const f of w) assert.match(f.want, /reference/);
});

test("a set with no svg files fails on set", async (t) => {
  const r = await checkSet(tmp(t));
  assert.deepEqual(rules(r), ["set"]);
});

const CHECK = new URL("../../skills/pretty-icons/check.mjs", import.meta.url).pathname;
/** check.mjs on a folder: its exit, its lines, and whether a stack reached the output. */
const run = (args) => {
  const r = spawnSync(process.execPath, [CHECK, ...args], { encoding: "utf8" });
  return { status: r.status, lines: r.stdout.trim().split("\n"), out: r.stdout + r.stderr, stack: /\n\s+at |^\s*\^\s*$/m.test(r.stdout + r.stderr) };
};
const BODY = '<rect x="2.5" y="2.5" width="11" height="11" rx="1.5" fill="currentColor" fill-opacity=".2"';

test("measure cannot crash check: a rect that is not self-closing is one elements line", (t) => {
  const dir = tmp(t);
  writeFileSync(join(dir, "open.svg"), `${ROOT}\n  ${BODY}>\n</svg>\n`);
  const r = run([dir]);
  assert.equal(r.status, 1, r.out);
  assert.equal(r.stack, false, r.out);
  assert.ok(r.lines.includes("elements  open  line 2: <rect> is not self-closing → only rect, circle, line, path, flat"), r.out);
});

test("measure cannot crash check: an unknown path command is one elements line", (t) => {
  const dir = tmp(t);
  writeFileSync(join(dir, "bad.svg"), `${ROOT}\n  ${BODY} />\n  <path d="M5 8h6B" />\n</svg>\n`);
  const r = run([dir]);
  assert.equal(r.status, 1, r.out);
  assert.equal(r.stack, false, r.out);
  const lines = r.lines.filter((l) => l.startsWith("elements  bad  "));
  assert.equal(lines.length, 1, r.out);
  assert.match(lines[0], /unknown command "B"/);
});

test("measure cannot crash check: an unclosed quote is a formatted line", (t) => {
  const dir = tmp(t);
  writeFileSync(join(dir, "quote.svg"), `${ROOT}\n  ${BODY.replace('y="2.5"', 'y="2.5')} />\n</svg>\n`);
  const r = run([dir]);
  assert.equal(r.status, 1, r.out);
  assert.equal(r.stack, false, r.out);
  assert.ok(r.lines.some((l) => /^\w+  quote  /.test(l)), r.out);
});

test("measure cannot crash check: --grid=32 is a canvas line per icon", () => {
  const r = run([new URL("./fixtures/good-16/", import.meta.url).pathname, "--grid=32"]);
  assert.equal(r.status, 1, r.out);
  assert.equal(r.stack, false, r.out);
  assert.ok(r.lines.includes("canvas  card  grid 32 → one of 16, 20, 24, 48"), r.out);
  assert.ok(!r.out.includes("not measured"), r.out);
});

test("an icon that cannot be measured stays out of the median", async (t) => {
  const dir = tmp(t);
  cpSync(fix("good-16"), dir, { recursive: true });
  writeFileSync(join(dir, "open.svg"), `${ROOT}\n  ${BODY}>\n</svg>\n`);
  const r = await checkSet(dir);
  assert.equal(r.measured, true);
  assert.deepEqual(r.rows.map((x) => x.icon).sort(), ["card", "disc", "phone", "tile"]);
  assert.deepEqual(rules(r), ["elements"]);
});

test("gap compares the subpaths of one path: merged dots 1.5 apart fail", async (t) => {
  const dir = tmp(t);
  cpSync(fix("good-16"), dir, { recursive: true });
  writeFileSync(join(dir, "dots.svg"), `${ROOT}\n  ${BODY} />\n  <path d="M5.75 8h0M7.25 8h0M8.75 8h0M10.25 8h0" />\n</svg>\n`);
  // the same dots 3 apart are clear of each other
  writeFileSync(join(dir, "spaced.svg"), `${ROOT}\n  ${BODY} />\n  <path d="M6.5 8h0M9.5 8h0" />\n</svg>\n`);
  const r = await checkSet(dir);
  const g = r.failures.filter((f) => f.rule === "gap");
  assert.deepEqual(g.filter((f) => f.icon === "dots").map((f) => f.got), ["path@3[0] to path@3[1] 0 apart", "path@3[1] to path@3[2] 0 apart", "path@3[2] to path@3[3] 0 apart"]);
  assert.ok(!g.some((f) => f.icon === "spaced"), JSON.stringify(g));
});

test("two elements on one line are told apart in a failure", async (t) => {
  const dir = tmp(t);
  cpSync(fix("good-16"), dir, { recursive: true });
  writeFileSync(join(dir, "pair.svg"), `${ROOT}\n  ${BODY} />\n  <path d="M5.75 8h0" /><path d="M7.25 8h0" />\n</svg>\n`);
  const r = await checkSet(dir);
  assert.deepEqual(r.failures.filter((f) => f.rule === "gap" && f.icon === "pair").map((f) => f.got), ["path#2@3 to path#3@3 0 apart"]);
});

test("check prints notes after the failures, and notes never change the exit code", () => {
  const cli = new URL("../../skills/pretty-icons/check.mjs", import.meta.url).pathname;
  const r = spawnSync(process.execPath, [cli, fix("good-16")], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const lines = r.stdout.trim().split("\n");
  assert.equal(lines.at(-1), "ok");
  assert.equal(lines[0], "notes");
  assert.match(lines[1], /^pixel  tile  5 of 5 straight strokes off the pixel at 16 px, 5 at 32 px → their edges on whole pixels$/);
});

test("check judges a kinked curve once, even when a contour repeats its tone's path", async () => {
  const dir = mkdtempSync(join(tmpdir(), "curve-"));
  try {
    const d = "M8 24H28L37.85 25.74";
    writeFileSync(join(dir, "kinked.svg"), `<svg viewBox="0 0 48 48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">\n<path d="${d}" fill="#ececea" stroke="none" />\n<path d="${d}" />\n</svg>`);
    const r = await checkSet(dir, { measure: false });
    assert.deepEqual(r.failures.filter((f) => f.rule === "join").map((f) => f.got), ["path@2 10.0° at 28, 24"]);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
