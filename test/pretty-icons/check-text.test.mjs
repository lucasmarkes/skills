import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { textChecks, readSet, formatFailure, pathCommands, checkSet } from "../../skills/pretty-icons/check.mjs";

const FIX = new URL("./fixtures/hairline-before/", import.meta.url);
const read = (n) => readFileSync(new URL(`${n}.svg`, FIX), "utf8");
const rules = (r) => [...new Set(r.failures.map((f) => f.rule))].sort();
// The before-fixture's machines, a hub and four ticks, is five detail subpaths: over the cap since
// refine 1. With one tick it is the clean icon the text tests start from.
const TICKS = 'd="M8 1.75v2M8 12.25v2M1.75 8h2M12.25 8h2"';
const cleanMachines = () => read("machines").replace(TICKS, 'd="M8 1.75v2"');

test("readSet lists the ten by name", () => {
  const set = readSet(FIX.pathname);
  assert.equal(set.length, 10);
  assert.deepEqual(set.map((s) => s.name).slice(0, 3), ["all", "coding", "connectivity"]);
});

test("a clean icon passes the text layer", () => {
  const r = textChecks("machines", cleanMachines(), 16);
  assert.equal(r.G, 16);
  assert.deepEqual(r.failures, []);
});

test("construction: a fill without a contour is rejected", () => {
  for (const n of ["interfaces", "coding", "empty"]) {
    const r = textChecks(n, read(n), 16);
    assert.ok(rules(r).includes("construction"), `${n}: ${rules(r)}`);
  }
});

test("radius: a 12.5-wide rect with rx 2.5 is not the preset's 1.5", () => {
  const r = textChecks("interfaces", read("interfaces"), 16);
  const f = r.failures.find((f) => f.rule === "radius");
  assert.ok(f);
  assert.ok(f.got.endsWith("rx 2.5"), f.got);
  assert.equal(f.want, "rx 1.5");
});

test("count: four elements is one too many", () => {
  const r = textChecks("all", read("all"), 16);
  assert.ok(rules(r).includes("count"));
});

test("stroke: a colour of its own", () => {
  const bad = read("machines").replace('stroke="currentColor"', 'stroke="#f00"');
  const r = textChecks("machines", bad, 16);
  assert.ok(rules(r).includes("stroke"));
});

test("canvas: the set's grid must match", () => {
  const r = textChecks("machines", read("machines"), 24);
  const f = r.failures.find((f) => f.rule === "canvas");
  assert.equal(f.got, "viewBox 0 0 16 16");
  assert.equal(f.want, "0 0 24 24");
});

test("canvas: an origin other than 0 0 is a canvas failure, not a crash", () => {
  const r = textChecks("x", read("machines").replace('viewBox="0 0 16 16"', 'viewBox="1 1 16 16"'), 16);
  assert.ok(rules(r).includes("canvas"));
});

test("construction: a ring with a contour and no fill is allowed", () => {
  const r = textChecks("machines", read("machines"), 16);
  assert.ok(!rules(r).includes("construction"));
});

test("grid: a number off the quarter grid", () => {
  const bad = read("machines").replace('cx="8" cy="8" r="1.25"', 'cx="8.1" cy="8" r="1.25"');
  const r = textChecks("machines", bad, 16);
  const f = r.failures.find((f) => f.rule === "grid");
  assert.ok(f.got.endsWith("cx 8.1"), f.got);
});

test("elements: a g or a text is rejected by name", () => {
  const r = textChecks("x", `<svg viewBox="0 0 16 16"><g><rect x="1" y="1" width="2" height="2"/></g></svg>`, 16);
  assert.ok(rules(r).includes("elements"));
});

test("formatFailure", () => {
  assert.equal(formatFailure({ rule: "radius", icon: "interfaces", got: "rx 2.5", want: "rx 1.5" }), "radius  interfaces  rx 2.5 → rx 1.5");
});

test("count: an icon with no elements fails count, not construction", () => {
  const r = textChecks("x", `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"></svg>`, 16);
  assert.ok(rules(r).includes("count"), `${rules(r)}`);
  assert.ok(!rules(r).includes("construction"), `${rules(r)}`);
});

// ---- fix round 1 -------------------------------------------------------

const CHECK = fileURLToPath(new URL("../../skills/pretty-icons/check.mjs", import.meta.url));
const ROOT = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">`;
const icon = (...els) => `${ROOT}\n${els.map((e) => `  ${e}`).join("\n")}\n</svg>\n`;
const BODY = `<circle cx="8" cy="8" r="4.25" fill="currentColor" fill-opacity=".2" />`;
const machines = cleanMachines;

test("count: the before-fixture's hub and four ticks are over the details cap", () => {
  const r = textChecks("machines", read("machines"), 16);
  assert.deepEqual(r.failures.map(formatFailure), ["count  machines  details 5 subpaths → at most 2"]);
});

test("stroke: a root fill other than none", () => {
  const r = textChecks("machines", machines().replace('fill="none"', 'fill="#f00"'), 16);
  const f = r.failures.find((f) => f.rule === "stroke");
  assert.ok(f, `${rules(r)}`);
  assert.equal(f.got, "fill #f00");
  assert.equal(f.want, "none");
});

test("stroke: root color and stop-color take the colour check", () => {
  for (const k of ["color", "stop-color"]) {
    const r = textChecks("machines", machines().replace('fill="none"', `fill="none" ${k}="#f00"`), 16);
    assert.ok(r.failures.some((f) => f.rule === "stroke" && f.got === `root ${k} #f00`), `${k}: ${JSON.stringify(r.failures)}`);
  }
});

test("stroke: root fill-opacity is forbidden", () => {
  const r = textChecks("machines", machines().replace('fill="none"', 'fill="none" fill-opacity=".2"'), 16);
  assert.ok(r.failures.some((f) => f.rule === "stroke" && f.got === "root fill-opacity"), JSON.stringify(r.failures));
});

test("stroke: a root dash shorter than the stroke", () => {
  const r = textChecks("machines", machines().replace('stroke-width="1"', 'stroke-width="1" stroke-dasharray="0.5 0.5"'), 16);
  assert.ok(r.failures.some((f) => f.rule === "stroke" && f.got === "root stroke-dasharray 0.5 0.5"), JSON.stringify(r.failures));
});

test("stroke: an element cap or join other than round", () => {
  const r = textChecks("machines", machines().replace('<path d="M8', '<path stroke-linecap="butt" d="M8'), 16);
  const f = r.failures.find((f) => f.rule === "stroke");
  assert.ok(f, `${rules(r)}`);
  assert.equal(f.got, "path@4 stroke-linecap butt");
  assert.equal(f.want, "round");
  const ok = textChecks("machines", machines().replace('<path d="M8', '<path stroke-linejoin="round" d="M8'), 16);
  assert.deepEqual(ok.failures, []);
});

test("stroke: mask, clip-path, dashoffset, vector-effect, paint-order on an element", () => {
  for (const k of ["mask", "clip-path", "stroke-dashoffset", "vector-effect", "paint-order"]) {
    const r = textChecks("machines", machines().replace('<path d="M8', `<path ${k}="x" d="M8`), 16);
    assert.ok(r.failures.some((f) => f.rule === "stroke" && f.got === `path@4 ${k}`), `${k}: ${JSON.stringify(r.failures)}`);
  }
});

test("stroke: currentColor in any case", () => {
  const r = textChecks("machines", machines().replaceAll("currentColor", "currentcolor"), 16);
  assert.deepEqual(r.failures, []);
});

test("count: implicit repeats are commands", () => {
  assert.equal(pathCommands("M1 1 2 2 3 3 4 4 5 5 6 6 7 7 8 8 9 9 10 10 11 11"), 11);
  assert.equal(pathCommands("M8 1.75v2M8 12.25v2M1.75 8h2M12.25 8h2"), 8);
  assert.equal(pathCommands("M1 1h2Z"), 3);
  assert.equal(pathCommands("M1 1c1 2 3 4 5 6 1 2 3 4 5 6"), 3);
  assert.equal(pathCommands("M1 1L2e1 1"), 2, "an exponent does not start a command");
  const r = textChecks("x", icon(BODY, `<path d="M1 1 2 2 3 3 4 4 5 5 6 6 7 7 8 8 9 9 10 10 11 11" />`), 16);
  const f = r.failures.find((f) => f.rule === "count");
  assert.ok(f, `${rules(r)}`);
  assert.equal(f.got, "path@3 11 commands");
  assert.ok(!rules(textChecks("machines", machines(), 16)).includes("count"));
});

test("construction: a filled open path is a line with a fill", () => {
  const r = textChecks("x", icon(`<path d="M2 8h12" fill="currentColor" fill-opacity=".2" />`), 16);
  const f = r.failures.find((f) => f.rule === "construction");
  assert.ok(f, `${rules(r)}`);
  assert.equal(f.want, "none on a line");
});

test("construction: a body at another opacity", () => {
  const r = textChecks("x", icon(`<rect x="2" y="2" width="12" height="12" rx="1.5" fill="currentColor" fill-opacity=".5" />`), 16);
  const f = r.failures.find((f) => f.rule === "construction");
  assert.ok(f, `${rules(r)}`);
  assert.equal(f.got, "rect@2 fill-opacity .5");
});

test("construction: an icon of lines only has no body", () => {
  const r = textChecks("x", icon(`<path d="M2 8h12" />`), 16);
  const f = r.failures.find((f) => f.rule === "construction");
  assert.ok(f, `${rules(r)}`);
  assert.equal(f.got, "no filled element");
});

test("set: an empty folder is a set failure, measured, nothing to say why", async () => {
  const dir = mkdtempSync(join(tmpdir(), "pretty-icons-"));
  try {
    const r = await checkSet(dir);
    assert.deepEqual(rules(r), ["set"]);
    assert.equal(r.measured, true);
    assert.equal(r.why, "");
    const run = spawnSync(process.execPath, [CHECK, dir], { encoding: "utf8" });
    assert.equal(run.status, 1, run.stdout + run.stderr);
    assert.ok(!run.stdout.includes("not measured"), run.stdout);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("set: a folder that does not exist is one line, exit 1, no stack", () => {
  const missing = join(tmpdir(), "pretty-icons-does-not-exist-" + process.pid);
  const run = spawnSync(process.execPath, [CHECK, missing], { encoding: "utf8" });
  assert.equal(run.status, 1, run.stdout + run.stderr);
  assert.equal(run.stdout, `set  ${missing}  not a folder → an existing folder\n`);
  assert.equal(run.stderr, "");
});

test("measure: only a missing module or rasteriser is `not measured`", async () => {
  const missing = Object.assign(new Error("Cannot find module './measure.mjs'"), { code: "ERR_MODULE_NOT_FOUND" });
  let r = await checkSet(FIX.pathname, { loadMeasure: async () => { throw missing; } });
  assert.equal(r.measured, false);
  assert.match(r.why, /Cannot find module/);
  const offline = Object.assign(new Error("could not install @resvg/resvg-js@2.6.2: offline"), { code: "PRETTY_ICONS_NO_RASTER" });
  r = await checkSet(FIX.pathname, { loadMeasure: async () => ({ measuredChecks: async () => { throw offline; } }) });
  assert.equal(r.measured, false);
  assert.match(r.why, /could not install/);
  // the code decides, not the words: an error that mentions npm is still an error
  await assert.rejects(
    checkSet(FIX.pathname, { loadMeasure: async () => ({ measuredChecks: async () => { throw new Error("npm-shaped bug"); } }) }),
    /npm-shaped bug/,
  );
  await assert.rejects(
    checkSet(FIX.pathname, { loadMeasure: async () => ({ measuredChecks: async () => { throw new TypeError("rows is not iterable"); } }) }),
    /rows is not iterable/,
  );
});
