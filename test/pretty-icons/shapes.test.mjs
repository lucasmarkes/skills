import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { shape, finishOf, collinear, reconcile, repair, repairFile, shadeOf, parseArgs, ShapeError, drop, wedge } from "../../skills/pretty-icons/shapes.mjs";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { curveFailures, joins } from "../../skills/pretty-icons/curve.mjs";
import { pathCommands } from "../../skills/pretty-icons/svg.mjs";

const SCRIPT = fileURLToPath(new URL("../../skills/pretty-icons/shapes.mjs", import.meta.url));
const ANCHORED = ["drop", "leaf", "lens", "bean", "crescent", "taper"];
const clean = (d) => curveFailures("x", { tag: "path", attrs: { d }, at: "path@1" });
const onGrid = (d) => (d.match(/-?\d*\.?\d+/g) ?? []).every((n) => Number.isInteger(Number(n) * 4));
const refused = (fn, text) => assert.throws(fn, (e) => e instanceof ShapeError && e.message.includes(text));

test("collinear puts both handles on one quarter-grid line through the anchor", () => {
  const { hin, hout } = collinear([0.6, 0.8], 5, 3);
  assert.ok([...hin, ...hout].every((n) => Number.isInteger(n * 4)));
  assert.equal(Math.abs(hin[0] * hout[1] - hin[1] * hout[0]), 0);
  assert.ok(hin[0] * hout[0] + hin[1] * hout[1] < 0);
});

test("every primitive, at 48 and at 16, is on the quarter grid with no kink and no wobble", () => {
  for (const grid of [48, 16]) for (const name of [...ANCHORED, "wedge", "scoop"]) {
    const { d } = shape(name, { grid });
    assert.ok(onGrid(d), `${name} at ${grid}: ${d}`);
    assert.deepEqual(clean(d), [], `${name} at ${grid}`);
  }
  assert.deepEqual(clean(shape("taper", { sharp: true }).d), []);
});

test("turned and leaned, the anchor primitives stay clean", () => {
  for (const name of ANCHORED) for (const rot of [15, 45, 90]) assert.deepEqual(clean(shape(name, { rot, w: 36, h: 24 }).d), [], `${name} at ${rot}°`);
  assert.deepEqual(clean(shape("leaf", { lean: 1 }).d), []);
  assert.deepEqual(clean(shape("leaf", { lean: -0.5 }).d), []);
});

test("at 48 a body is tone, shade, contour at 2, the contour the tone's geometry; at 16 one path at the .2 fill", () => {
  const [tone, shade, contour] = finishOf("drop");
  const d = (s) => s.match(/ d="([^"]+)"/)[1];
  assert.match(tone, /fill="#ececea" stroke="none"/);
  assert.match(shade, /fill="#cfcfcb" stroke="none"/);
  assert.match(contour, /stroke-width="2"/);
  assert.equal(d(contour), d(tone));
  assert.deepEqual(clean(d(shade)), []);
  assert.deepEqual(finishOf("drop", { grid: 16 }).length, 1);
  assert.match(finishOf("drop", { grid: 16 })[0], /fill="currentColor" fill-opacity="0.2"/);
  assert.equal(finishOf("drop", { shade: "none" }).length, 2);
});

test("the shade is the side away from the light: a crescent's right horn, a drop's lower part", () => {
  const s = shape("crescent");
  assert.equal(shadeOf(s, { side: "right" }), "M24 5C37.25 5 32 26 43 33.5Z");
  assert.match(shadeOf(shape("drop"), { side: "lower", seam: "curved" }), /^M43 31\.5C.*Z$/);
  refused(() => shadeOf(s, { side: "left" }), "--shade left: right, lower or none");
});

test("wedge and scoop come unshaded; asking them for a shade is refused with the way out", () => {
  assert.equal(finishOf("wedge").length, 2);
  refused(() => finishOf("scoop", { shade: "right" }), "draw the shade by hand, or --shade none");
});

test("a shape past the grid's command cap is refused with how many to remove", () => {
  const ring = Array.from({ length: 9 }, (_, i) => `${(8 + 6 * Math.cos(i * 0.7)).toFixed(2)},${(8 + 6 * Math.sin(i * 0.7)).toFixed(2)}`).join(" ");
  refused(() => shape("blob", { grid: 16, anchors: ring }), "blob: 9 anchors, the grid allows 6: remove 3 anchors");
  refused(() => shape("scoop", { grid: 16, rx: 3 }), "the grid allows 8: use --rx 0");
  assert.ok(pathCommands(shape("scoop", { grid: 48, rx: 6 }).d) <= 12);
});

test("bad flags are refused with the reason", () => {
  refused(() => shape("drop", { rot: 10 }), "--rot 10: a step of 15");
  refused(() => shape("drop", { lean: 1.5 }), "--lean 1.5: from -1 to 1");
  refused(() => shape("wedge", { angle: 150 }), "--angle 150: from 15 to 120");
  refused(() => shape("star"), 'no primitive "star"');
  refused(() => shape("bean", { lean: 1 }), "bean: overshoots its box by 0.79: lower --bulge");
  refused(() => shape("crescent", { bulge: 1.2 }), "2 inflections over a chord of 24.36");
  refused(() => shape("bean", { grid: 16, w: 11 }), "change --bulge or the box");
  refused(() => shape("blob", { anchors: "8,8 40,8" }), "at least three");
});

test("--from smooths a kink, keeps a corner, and reads relative, H and V", () => {
  const kinked = "M8 24C8 14 14 6 24 6C34 6 40 14 40 24C40 34 34 42 24 42C14 42 9 34 8 24Z";
  assert.ok(joins(kinked).some((j) => j.kind === "kink"));
  const d = reconcile(kinked);
  assert.ok(onGrid(d));
  assert.deepEqual(clean(d), []);
  const box = reconcile("m8 8h32v22c1 7 -10 10 -16 10c-6 0 -16 -3 -16 -10z");
  assert.deepEqual(clean(box), []);
  assert.equal(joins(box).filter((j) => j.kind === "corner").length, joins("M8 8H40V30C41 37 30 40 24 40C18 40 8 37 8 30Z").filter((j) => j.kind === "corner").length);
});

test("--from says which joins it changed, and a file repairs each kinked path by its place", () => {
  const kinked = "M8 24C8 14 14 6 24 6C34 6 40 14 40 24C40 34 34 42 24 42C14 42 9 34 8 24Z";
  const { d, changed } = repair(kinked);
  assert.equal(d, reconcile(kinked));
  assert.ok(changed.length >= 1);
  for (const c of changed) assert.match(c, /^\d+\.\d° at [\d.]+ [\d.]+, now \d\.\d°$/);
  assert.deepEqual(repair("M8 8H40V40H8Z").changed, []);
  const icon = `<svg viewBox="0 0 48 48">\n<path d="M8 8H40V40H8Z" />\n<path d="${kinked}" />\n</svg>`;
  assert.deepEqual(repairFile(icon).map((f) => [f.at, f.d]), [["path@3", d]]);
  refused(() => repairFile(`<svg viewBox="0 0 48 48">\n<path d="M4 24H24L33.85 25.74" />\n</svg>`), "path@2: --from: one closed subpath");
  const dir = mkdtempSync(join(tmpdir(), "shapes-")), file = join(dir, "kinked.svg");
  writeFileSync(file, icon);
  const r = spawnSync("node", [SCRIPT, "--from", file], { encoding: "utf8" });
  assert.equal(r.status, 0);
  assert.equal(r.stdout, `path@3 ${d}\n`);
  assert.match(r.stderr, /^path@3 changed /);
  const gone = spawnSync("node", [SCRIPT, "--from", join(dir, "nope.svg")], { encoding: "utf8" });
  assert.equal(gone.status, 1);
  assert.match(gone.stderr, /^shapes: --from .*nope\.svg: no such file/);
});

test("each primitive is a named export too", () => {
  assert.deepEqual(drop({ grid: 24 }), shape("drop", { grid: 24 }));
  assert.deepEqual(wedge({ angle: 90 }), shape("wedge", { angle: 90 }));
});

test("--from refuses an arc, an open path and two subpaths", () => {
  refused(() => reconcile("M8 24A16 16 0 0 1 40 24L24 40Z"), "an arc at 8 24");
  refused(() => reconcile("M8 8H40V40"), "one closed subpath");
  refused(() => reconcile("M8 8H20V20ZM28 28H40V40Z"), "one closed subpath");
});

test("the CLI reads flags, prints the finish and refuses on stderr", () => {
  assert.deepEqual(parseArgs(["drop", "--w", "30", "--at", "24,26"]), { name: "drop", o: { w: 30, at: [24, 26] } });
  assert.equal(parseArgs(["drop", "--colour", "red"]), null);
  assert.equal(parseArgs(["drop", "--from", "M0 0Z"]), null);
  assert.equal(parseArgs([]), null);
  const out = execFileSync("node", [SCRIPT, "lens", "--grid", "20"], { encoding: "utf8" });
  assert.equal(out.trim().split("\n").length, 1);
  assert.throws(() => execFileSync("node", [SCRIPT, "drop", "--rot", "10"], { stdio: "pipe" }), (e) => e.status === 1 && String(e.stderr).includes("shapes: --rot 10"));
});

test("every primitive is clean at 20 and 24 too, the grids no example is drawn on", () => {
  for (const grid of [20, 24]) for (const name of [...ANCHORED, "wedge", "scoop"]) {
    const { d } = shape(name, { grid });
    assert.ok(onGrid(d), `${name} at ${grid}: ${d}`);
    assert.deepEqual(clean(d), [], `${name} at ${grid}`);
  }
});
