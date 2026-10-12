import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, cpSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkSet } from "../../skills/pretty-icons/check.mjs";
import { nearestKeyline, measuredChecks } from "../../skills/pretty-icons/measure.mjs";
import { addModifier } from "../../skills/pretty-icons/modifiers.mjs";
import { shares } from "../../skills/pretty-icons/raster.mjs";

const fix = (n) => new URL(`./fixtures/${n}/`, import.meta.url).pathname;
const rules = (r) => [...new Set(r.failures.map((f) => f.rule))].sort();
const of = (r, rule) => r.failures.filter((f) => f.rule === rule).map((f) => f.icon).sort();
/** A fresh temp dir, removed when the test ends. */
const tmp = (t) => { const dir = mkdtempSync(join(tmpdir(), "pi-")); t.after(() => rmSync(dir, { recursive: true, force: true })); return dir; };
const ROOT = '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';

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
  assert.ok(of(r, "loose").includes("almost"), "a ring 1.75 from its body's contour, centre to centre, is 0.75 apart edge to edge: loose's pair now");
  assert.ok(!of(r, "gap").includes("almost"), "and no longer gap's");
});

test("gap: strokes that overlap without their centrelines meeting say so", async (t) => {
  const dir = tmp(t);
  cpSync(fix("good-16"), dir, { recursive: true });
  // the line's ends sit 0.75 from the tile's sides: the strokes overlap, the centrelines do not meet
  writeFileSync(join(dir, "overlap.svg"), readFileSync(join(fix("good-16"), "tile.svg"), "utf8").replace('d="M5.5 8h5"', 'd="M3 8h10"'));
  const r = await checkSet(dir);
  // the line is a detail inside the tile's body, so the pair is loose's, which says it touches
  const g = r.failures.filter((f) => f.rule === "loose" && f.icon === "overlap");
  assert.ok(g.length > 0, "loose fires");
  for (const f of g) assert.match(f.got, /touches/);
  assert.ok(!r.failures.some((f) => f.rule === "gap" && f.icon === "overlap"));
});

test("live: ink past the padding", async (t) => {
  const dir = tmp(t);
  cpSync(fix("good-16"), dir, { recursive: true });
  writeFileSync(join(dir, "wide.svg"), readFileSync(join(fix("good-16"), "card.svg"), "utf8").replace('d="M3.75 6.25h8.5"', 'd="M1 6.25h14"'));
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

test("gap compares the subpaths of one path: merged dots 1 apart fail", async (t) => {
  const dir = tmp(t);
  cpSync(fix("good-16"), dir, { recursive: true });
  writeFileSync(join(dir, "dots.svg"), `${ROOT}\n  ${BODY} />\n  <path d="M6 8h0M7 8h0M8 8h0M9 8h0" />\n</svg>\n`);
  // the same dots 3 apart are clear of each other
  writeFileSync(join(dir, "spaced.svg"), `${ROOT}\n  ${BODY} />\n  <path d="M6.5 8h0M9.5 8h0" />\n</svg>\n`);
  const r = await checkSet(dir);
  const g = r.failures.filter((f) => f.rule === "gap");
  assert.deepEqual(g.filter((f) => f.icon === "dots").map((f) => f.got), ["path@3[0] to path@3[1] 0 apart", "path@3[0] to path@3[2] 1 apart", "path@3[1] to path@3[2] 0 apart", "path@3[1] to path@3[3] 1 apart", "path@3[2] to path@3[3] 0 apart"]);
  assert.ok(!g.some((f) => f.icon === "spaced"), JSON.stringify(g));
});

test("two elements on one line are told apart in a failure", async (t) => {
  const dir = tmp(t);
  cpSync(fix("good-16"), dir, { recursive: true });
  writeFileSync(join(dir, "pair.svg"), `${ROOT}\n  ${BODY} />\n  <path d="M6.5 8h0" /><path d="M7.5 8h0" />\n</svg>\n`);
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
  assert.match(lines[1], /^pixel  card  5 of 5 straight strokes off the pixel at 16 px, 5 at 32 px → their edges on whole pixels$/);
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

test("contrast: the line tone's share of the paint, 20% to 45%, too much and too little", async () => {
  const r = await checkSet(fix("contrast"));
  const c = r.failures.filter((f) => f.rule === "contrast").map((f) => `${f.rule}  ${f.icon}  ${f.got} → ${f.want}`);
  assert.deepEqual(c.sort(), ["contrast  plate  line tone on 1.0% of the paint → 20% to 45%", "contrast  wheel  line tone on 64.8% of the paint → 20% to 45%"]);
  assert.equal(r.rows.find((x) => x.icon === "box")["line%"], 27.6);
  // plate fails the text rules too (a tone with no contour), and is still measured
  assert.ok(r.failures.some((f) => f.icon === "plate" && f.rule === "construction"));
});

test("contrast: a badged icon is measured without its badge", async (t) => {
  const dir = tmp(t);
  const box = readFileSync(join(fix("contrast"), "box.svg"), "utf8");
  writeFileSync(join(dir, "box.svg"), box);
  const badged = await addModifier(box, "badge:plus", { name: "box-new" });
  writeFileSync(join(dir, "box-new.svg"), badged);
  const r = await checkSet(dir);
  assert.ok(!r.failures.some((f) => f.rule === "contrast"), r.failures.map((f) => f.got).join("\n"));
  const row = (n) => r.rows.find((x) => x.icon === n)["line%"];
  // the base is measured as cut (like weight): a cut only removes line, and the badge itself is left out
  const full = await shares(badged, 48);
  assert.ok(row("box-new") <= row("box"), `${row("box-new")} and ${row("box")}`);
  assert.ok(row("box-new") < Math.round((100 * full.dark) / full.paint), `${row("box-new")} and ${Math.round((100 * full.dark) / full.paint)}`);
});

test("contrast: an empty icon gets the ink failure only, not a second one", async (t) => {
  const dir = tmp(t);
  writeFileSync(join(dir, "empty.svg"), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></svg>');
  const r = await checkSet(dir);
  assert.ok(!r.failures.some((f) => f.rule === "contrast"), r.failures.map((f) => f.got).join("\n"));
});

test("contrast: duotone has no line% and no contrast", async () => {
  const r = await checkSet(fix("good-16"));
  assert.ok(r.rows.length > 0);
  assert.ok(r.rows.every((x) => !("line%" in x)));
  assert.ok(!r.failures.some((f) => f.rule === "contrast"));
});

const s16 = (b) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">${b}</svg>`;
const s48 = (b) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${b}</svg>`;
const GAPBODY = '<rect x="1.5" y="3" width="13" height="10" rx="1.5" fill="currentColor" fill-opacity=".2" />';
const gaps = async (text, G) => (await measuredChecks([{ name: "x", text }], G)).failures.filter((f) => f.rule === "gap").map((f) => `${f.got} → ${f.want}`);

test("gap: two lines sit 1.5 strokes apart, edge to edge", async () => {
  assert.deepEqual(await gaps(s16(`${GAPBODY}\n<path d="M4 6.5H12" />\n<path d="M4 8.75H12" />`), 16), ["path@2 to path@3 1.25 apart → ≥ 1.5 apart, or crossing"]);
  assert.deepEqual(await gaps(s16(`${GAPBODY}\n<path d="M4 6.5H12" />\n<path d="M4 9H12" />`), 16), []);
});

test("gap: a contour is taken at its own width, 2", async () => {
  const body = '<rect x="5" y="9" width="38" height="30" rx="6" fill="#ececea" stroke="none" />\n<rect x="5" y="9" width="38" height="30" rx="6" stroke-width="2" />';
  assert.deepEqual(await gaps(s48(`${body}\n<path d="M10 43H38" />`), 48), []);
  assert.deepEqual(await gaps(s48(`${body}\n<path d="M10 42.75H38" />`), 48), ["rect@2 to path@3 2 apart → ≥ 2.25 apart, or crossing"]);
});

const CARD = '<rect x="2" y="2" width="12" height="12" rx="1.5" fill="currentColor" fill-opacity=".2" />';
const looses = async (text, G) => (await measuredChecks([{ name: "billing", text }], G)).failures.filter((f) => f.rule === "loose").map((f) => `${f.got} → ${f.want}`);

test("loose: a detail inside a body ends a stroke inside its contour", async () => {
  assert.deepEqual(await looses(s16(`${CARD}\n<path d="M2 8H14" />`), 16), ["path@2 touches rect@1 → end it ≥ 1 stroke inside the contour"]);
  assert.deepEqual(await looses(s16(`${CARD}\n<path d="M3.5 8H12.5" />`), 16), ["path@2 0.5 strokes from rect@1 → ≥ 1 stroke inside the contour"]);
  assert.deepEqual(await looses(s16(`${CARD}\n<path d="M4 8H12" />`), 16), []);
});

test("loose: a part meeting the body from outside is not a detail", async () => {
  assert.deepEqual(await looses(s16(`${CARD}\n<path d="M14 8H15" />`), 16), []);
});

test("loose: a detail and its body are loose's, not gap's", async () => {
  assert.deepEqual(await gaps(s16(`${CARD}\n<path d="M4 8H12" />`), 16), []);
});

test("loose: at 48 the tone is the body, and its contour is not held apart by gap", async () => {
  const body = '<rect x="5" y="9" width="38" height="30" rx="6" fill="#ececea" stroke="none" />\n<rect x="5" y="9" width="38" height="30" rx="6" stroke-width="2" />';
  assert.deepEqual(await looses(s48(`${body}\n<path d="M5 24H43" />`), 48), ["path@3 touches rect@1 → end it ≥ 1 stroke inside the contour"]);
  assert.deepEqual(await looses(s48(`${body}\n<path d="M9 24H39" />`), 48), []);
  assert.deepEqual(await gaps(s48(`${body}\n<path d="M9 24H39" />`), 48), []);
});

test("loose: a door inside the body and a chimney meeting it from outside, in one path, is not refused", async () => {
  const house = '<path d="M8 1.5 13.75 6.5v6.25h-11.5V6.5Z" fill="currentColor" fill-opacity=".2" />';
  assert.deepEqual(await looses(s16(`${house}\n<path d="M6.75 10.75V8.75h2.5v2M11 2.5V5" />`), 16), []);
});

test("loose: each subpath is judged on its own and named by index", async () => {
  assert.deepEqual(await looses(s16(`${CARD}\n<path d="M2 8H5M14 8H20" />`), 16), ["path@2[0] touches rect@1 → end it ≥ 1 stroke inside the contour"]);
  assert.deepEqual(await looses(s16(`${CARD}\n<path d="M5 8H8M14 8H20" />`), 16), []);
});

test("gap: two lines outside any body, almost and overlapping", async () => {
  assert.deepEqual(await gaps(s16('<path d="M2 6H14" />\n<path d="M2 7.75H14" />'), 16), ["path@1 to path@2 0.75 apart → ≥ 1.5 apart, or crossing"]);
  assert.deepEqual(await gaps(s16('<path d="M2 6H14" />\n<path d="M2 6.5H14" />'), 16), ["path@1 to path@2 overlapping, centrelines 0.5 apart → ≥ 1.5 apart, or crossing"]);
});

const airs = async (text, G) => (await measuredChecks([{ name: "oil", text }], G)).failures.filter((f) => f.rule === "air").map((f) => `${f.got} → ${f.want}`);

test("air: check names the narrow paper and its move", async () => {
  assert.deepEqual(await airs(s16('<path d="M3 7H13" /><path d="M3 9H13" />'), 16), ["paper 1.1 strokes wide at 8, 8 → ≥ 1.5 apart, or touching"]);
  assert.deepEqual(await airs(s16('<circle cx="8" cy="8" r="1.25" />'), 16), ["counter 1.5 strokes across at 8, 8 → ≥ 2 across"]);
});

test("air: an interior detail is loose's, so air reads the body without it", async () => {
  assert.deepEqual(await airs(s16(`${CARD}<path d="M4 8H12" />`), 16), []);
});

test("gap and air: a merged path's outside part is still judged against the body, its inside part left to loose", async () => {
  const body = '<rect x="2.25" y="4.25" width="11.5" height="9.5" rx="1.5" fill="currentColor" fill-opacity=".2" />';
  // apart, the outside stroke fails gap and air against the body
  const apart = s16(`${body}\n<path d="M6 9h4" />\n<path d="M5 3h6" />`);
  assert.deepEqual(await gaps(apart, 16), ["rect@1 to path@3 0.25 apart → ≥ 1.5 apart, or crossing"]);
  assert.deepEqual(await airs(apart, 16), ["paper 0.6 strokes wide at 8, 3.61 → ≥ 1.5 apart, or touching"]);
  // merged with the inside stroke, it fails the same, named by its index
  const merged = s16(`${body}\n<path d="M6 9h4M5 3h6" />`);
  assert.deepEqual(await gaps(merged, 16), ["rect@1 to path@2[1] 0.25 apart → ≥ 1.5 apart, or crossing"]);
  assert.deepEqual(await airs(merged, 16), ["paper 0.6 strokes wide at 8, 3.61 → ≥ 1.5 apart, or touching"]);
  assert.deepEqual(await looses(merged, 16), []);
});

const LONG = s16('<path d="M3 13L13 3" />'), ROUND = s16('<circle cx="8" cy="8" r="6.5" />');
const diagonals = async (texts) => (await measuredChecks(texts.map((text, i) => ({ name: `i${i}`, text })), 16)).failures.filter((f) => f.rule === "diagonal").map((f) => `${f.icon}  ${f.got} → ${f.want}`);

test("diagonal: at most three in ten", async () => {
  assert.deepEqual(await diagonals([...Array(4).fill(LONG), ...Array(6).fill(ROUND)]), ["set  4 of 10 on the diagonal (i0, i1, i2, i3) → at most 3"]);
  assert.deepEqual(await diagonals([...Array(3).fill(LONG), ...Array(7).fill(ROUND)]), []);
});

test("diagonal: a set of one or two may hold one", async () => {
  assert.deepEqual(await diagonals([LONG]), []);
  assert.deepEqual(await diagonals([LONG, ROUND]), []);
  assert.deepEqual(await diagonals([LONG, LONG]), ["set  2 of 2 on the diagonal (i0, i1) → at most 1"]);
});

test("diagonal: never upper-left to lower-right", async () => {
  assert.deepEqual(await diagonals([s16('<path d="M3 3L13 13" />')]), ["i0  upper-left to lower-right → lower-left to upper-right"]);
});

test("a bulk folder: the finish from the root, --finish=bulk on the CLI, the odd duotone file reported under stroke", async (t) => {
  const dir = tmp(t);
  const B = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">\n  <circle cx="12" cy="12" r="10" fill-opacity=".4" />\n  <path d="M 2 2 H 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />\n</svg>';
  const D = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">\n  <circle cx="12" cy="12" r="10" />\n</svg>';
  for (const n of ["a", "b", "c"]) writeFileSync(join(dir, `${n}.svg`), B);
  writeFileSync(join(dir, "d.svg"), D);
  const r = await checkSet(dir, { measure: false });
  assert.equal(r.G, 24);
  assert.equal(r.finish, "bulk");
  assert.deepEqual(of(r, "stroke"), ["d"]);
  assert.deepEqual(r.failures.filter((f) => f.icon !== "d"), []);
  const cli = spawnSync("node", [new URL("../../skills/pretty-icons/check.mjs", import.meta.url).pathname, dir, "--finish=duotone"], { encoding: "utf8" });
  assert.ok(/stroke  a  /.test(cli.stdout), cli.stdout);
  assert.ok(!/stroke  d  /.test(cli.stdout), cli.stdout);
  const bad = spawnSync("node", [new URL("../../skills/pretty-icons/check.mjs", import.meta.url).pathname, dir, "--finish=flat"], { encoding: "utf8" });
  assert.equal(bad.status, 1);
  assert.ok(bad.stderr.includes("--finish=bulk|duotone"), bad.stderr);
});

test("a folder of one bulk root and nine duotone at 24: the majority finish, the odd file under stroke, no crash", async (t) => {
  const dir = tmp(t);
  const B = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">\n  <circle cx="12" cy="12" r="10" fill-opacity=".4" />\n  <path d="M 2 2 H 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />\n</svg>';
  const D = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">\n  <circle cx="12" cy="12" r="10" />\n</svg>';
  writeFileSync(join(dir, "odd.svg"), B);
  for (let i = 0; i < 9; i++) writeFileSync(join(dir, `d${i}.svg`), D);
  const r = await checkSet(dir, { measure: false });
  assert.equal(r.finish, "duotone");
  assert.deepEqual(of(r, "stroke"), ["odd"]);
});
