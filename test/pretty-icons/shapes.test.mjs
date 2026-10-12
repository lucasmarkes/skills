import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { shape, finishOf, collinear, reconcile, repair, repairFile, shadeOf, parseArgs, ShapeError, drop, wedge, ring, dome, sack, bubble, bell, bust, USAGE, FLAGS } from "../../skills/pretty-icons/shapes.mjs";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { preset } from "../../skills/pretty-icons/presets.mjs";
import { curveFailures, joins } from "../../skills/pretty-icons/curve.mjs";
import { pathCommands, parse } from "../../skills/pretty-icons/svg.mjs";
import { filledChecks } from "../../skills/pretty-icons/filled.mjs";

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
  refused(() => shape("bean", { lean: 1, w: 40, h: 30 }), "bean: overshoots its box by 0.56: lower --bulge");
  refused(() => shape("bean", { lean: 1 }), "bean: bend radius 1.19 at 27.35, 43.39");
  refused(() => shape("crescent", { bulge: 1.2 }), "2 inflections over a chord of 24.36");
  refused(() => shape("bean", { grid: 16, w: 11 }), "make the box larger, so every segment's chord is at least 4 (the shortest is 3.61)");
  refused(() => shape("blob", { anchors: "8,8 40,8" }), "at least three");
});

test("one inflection over a short chord asks for a larger box, not --bulge; a wobble still names --bulge", () => {
  // no --bulge cures it: the small leaf is refused for the same reason at every one
  for (const bulge of [0.3, 0.55, 0.8]) refused(() => shape("leaf", { grid: 16, w: 8, h: 5, bulge }), "make the box larger");
  const msg = (fn) => { try { fn(); } catch (e) { return e.message; } return ""; };
  const small = msg(() => shape("leaf", { grid: 16, w: 8, h: 5 }));
  assert.match(small, /1 inflection over a chord of 3\.82.*: make the box larger, so every segment's chord is at least 4 \(the shortest is 3\.82\)$/);
  assert.ok(!small.includes("--bulge"), small);
  assert.match(msg(() => shape("blob", { grid: 16, anchors: "4,8,c 6,6.5 8,8,c 6,9.5" })), /: spread the anchors, so every segment's chord is at least 4/);
  const wobble = msg(() => shape("crescent", { bulge: 1.2 }));
  assert.ok(wobble.endsWith("change --bulge or the box"), wobble);
  assert.doesNotThrow(() => shape("leaf", { grid: 16, w: 10, h: 6 }));
});

test("the usage names every flag the parser takes, each per-primitive flag on its primitive's line", () => {
  const value = { at: "8,8", shade: "right", seam: "curved", side: "top", anchors: "8,8 12,8 10,12", from: "M0 0Z", finish: "bulk" };
  for (const f of FLAGS) {
    assert.ok(USAGE.includes(`--${f}`), `USAGE names --${f}`);
    const argv = f === "from" ? ["--from", "M0 0Z"] : ["drop", `--${f}`, ...(f === "sharp" || f === "accent" ? [] : [value[f] ?? "1"])];
    assert.notEqual(parseArgs(argv), null, `parseArgs takes --${f}`);
  }
  assert.equal(parseArgs(["drop", "--colour", "red"]), null);
  const own = { drop: ["tip"], leaf: ["skew"], bean: ["waist"], crescent: ["thick"], taper: ["narrow", "sharp"], wedge: ["angle"], scoop: ["depth", "side", "rx"], dome: ["shoulder"], sack: ["neck"], bubble: ["tail"], bust: ["neck"], blob: ["anchors"], ring: ["r", "hole"], squircle: ["r"] };
  const lines = USAGE.split("\n");
  for (const [name, flags] of Object.entries(own)) {
    const l = lines.find((x) => x.trim().startsWith(`${name} `));
    assert.ok(l, `a line for ${name}`);
    for (const f of flags) assert.ok(l.includes(`--${f}`), `${name}'s line names --${f}`);
  }
  assert.ok(USAGE.includes('--anchors "x,y[,t][,c] …"'));
  const r = spawnSync("node", [SCRIPT], { encoding: "utf8" });
  assert.equal(r.status, 1);
  assert.equal(r.stderr.trim(), USAGE);
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

test("--from snaps off-grid numbers to the quarter grid before it measures joins", () => {
  const off = "M8.1 24C8 14.3 14 6 24 6C34 6 40 14 40 24C40 34 34 42 24 42C14 42 9 34 8 24Z";
  const d = repair(off).d;
  assert.ok(onGrid(d), d);
  assert.deepEqual(clean(d), []);
});

test("an unknown grid is refused on stderr with the grids that exist, no stack trace", () => {
  const r = spawnSync("node", [SCRIPT, "drop", "--grid", "30"], { encoding: "utf8" });
  assert.equal(r.status, 1);
  assert.equal(r.stderr, "shapes: no preset for grid 30: use 16, 20, 24 or 48\n");
});

test("a scoop's rx is bounded by half its shorter side, and the refusal says the most", () => {
  refused(() => shape("scoop", { grid: 48, rx: 30 }), "--rx 30: at most 19");
});

test("the kit's shade passes the light check at every turn: a leaf and a lens from -90° to 90°", () => {
  const icon = (lines) => parse(`<svg viewBox="0 0 48 48" fill="none" stroke="#25262a" stroke-width="1.5">\n${lines.join("\n")}\n</svg>`);
  const dark = [];
  for (const name of ["leaf", "lens"]) for (const box of [{}, { w: 36, h: 16 }, { w: 36, h: 24 }, { w: 16, h: 8, at: [16, 12] }])
    for (const shade of ["right", "lower"]) for (let rot = -90; rot <= 90; rot += 15) {
      const o = { ...box, rot, shade };
      let lines;
      try { lines = finishOf(name, o); } catch (e) { dark.push(`${name} ${JSON.stringify(o)} refused: ${e.message}`); continue; }
      const sh = lines[1].match(/ d="([^"]+)"/)[1];
      assert.match(lines[1], /fill="#cfcfcb"/, `${name} ${JSON.stringify(o)}`);
      assert.ok(onGrid(sh), `${name} ${JSON.stringify(o)}: ${sh}`);
      assert.deepEqual(clean(sh), [], `${name} ${JSON.stringify(o)}`);
      const f = filledChecks(name, icon(lines), 48).filter((x) => x.rule === "light");
      if (f.length) dark.push(`${name} ${JSON.stringify(o)}`);
    }
  assert.deepEqual(dark, []);
  // rules-filled.md 04's hand shade is the kit's own: the lower belly to the tip on the right
  assert.match(finishOf("leaf", { w: 16, h: 8, at: [16, 12], rot: -45 })[1], / d="M21 7C19.25 9 20.5 11.75 18.5 13.75Z"/);
});

test("where the shade already passed, the kit prints it as before", () => {
  assert.equal(finishOf("leaf", { w: 36, h: 16, rot: 15 })[1], '<path d="M27.5 17.75C35 19.75 34.25 26.5 40.5 28.5C34 27 31.25 33.25 23.75 31.25Z" fill="#cfcfcb" stroke="none" />');
  assert.equal(finishOf("lens", { w: 36, h: 16 })[1], '<path d="M24 17C29.75 17 34.25 26.25 41 24C34.25 21.75 29.75 31 24 31Z" fill="#cfcfcb" stroke="none" />');
});

test("ring: five elements, tone, shade, contour, hole, hole's contour; it passes the finish's checks", () => {
  assert.deepEqual(ring(), [
    '<circle cx="24" cy="24" r="19" fill="#ececea" stroke="none" />',
    '<path d="M5 24A19 19 0 0 0 43 24L37 24A13 13 0 0 1 11 24Z" fill="#cfcfcb" stroke="none" />',
    '<circle cx="24" cy="24" r="19" stroke-width="2" />',
    '<circle cx="24" cy="24" r="13" fill="#ffffff" stroke="none" />',
    '<circle cx="24" cy="24" r="13" stroke-width="2" />',
  ]);
  assert.deepEqual(finishOf("ring", {}), ring());
  const svg = `<svg viewBox="0 0 48 48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">\n${ring().join("\n")}\n</svg>`;
  assert.deepEqual(filledChecks("ring", parse(svg), 48), []);
});

test("ring: off-centre with --at, refused when the hole leaves less than a contour and its gap, or is no hole", () => {
  const r = ring({ r: 10, hole: 7, at: [12, 30] });
  assert.equal(r[1], '<path d="M2 30A10 10 0 0 0 22 30L19 30A7 7 0 0 1 5 30Z" fill="#cfcfcb" stroke="none" />');
  assert.equal(r[3], '<circle cx="12" cy="30" r="7" fill="#ffffff" stroke="none" />');
  refused(() => ring({ r: 10, hole: 7.25 }), "ring: hole 7.25 + 3 > r 10");
  refused(() => ring({ r: 10, hole: 0 }), "ring: hole 0: a ring needs a hole; for a disc, draw a circle body");
  refused(() => finishOf("ring", { grid: 16 }), "ring: the filled finish only (--grid 48)");
});

test("bend: every primitive is clean at every grid, at the grid's stroke", () => {
  for (const grid of [16, 20, 24, 48]) for (const name of [...ANCHORED, "wedge", "scoop"]) {
    const { d } = shape(name, { grid });
    assert.deepEqual(curveFailures(name, { tag: "path", attrs: { d }, at: "path@1" }, preset(grid).stroke), [], `${name} at ${grid}: ${d}`);
  }
});

const SOFT = ["dome", "sack", "bubble", "bell", "bust"];
const bent = (d, grid) => curveFailures("x", { tag: "path", attrs: { d }, at: "path@1" }, preset(grid).stroke);

test("the soft bodies, at every grid, are on the quarter grid with no kink, wobble or tight bend", () => {
  for (const grid of [16, 20, 24, 48]) for (const name of SOFT) {
    const { d } = shape(name, { grid });
    assert.ok(onGrid(d), `${name} at ${grid}: ${d}`);
    assert.deepEqual(bent(d, grid), [], `${name} at ${grid}`);
  }
  for (const [name, o] of [["dome", { shoulder: 0.6 }], ["sack", { neck: 0.35 }], ["bubble", { tail: 0.5 }], ["bust", { neck: 0.3 }]]) assert.deepEqual(bent(shape(name, o).d, 48), [], `${name} ${JSON.stringify(o)}`);
});

test("the soft bodies at 16, as drawn", () => {
  assert.equal(dome({ grid: 16 }).d, "M1.5 14.5L14.5 14.5C14.5 12.75 14.5 11.75 14.5 10C14.5 5.75 12.25 1.5 8 1.5C3.75 1.5 1.5 5.75 1.5 10C1.5 11.75 1.5 12.75 1.5 14.5Z");
  assert.equal(sack({ grid: 16 }).d, "M8 14.5C11.5 14.5 14.5 13 14.5 10C14.5 7.5 12.5 4.75 9.5 5.75C10.75 4.25 11.5 1.5 8 1.5C4.5 1.5 5.25 4.25 6.5 5.75C3.5 4.75 1.5 7.5 1.5 10C1.5 13 4.5 14.5 8 14.5Z");
  assert.equal(bubble({ grid: 16 }).d, "M1.5 7C1.5 3.75 4.75 1.5 8 1.5C11.25 1.5 14.5 3.75 14.5 7C14.5 9.75 13.5 10.75 10 12.75C8.25 13.75 7.25 12.5 5.5 12.25L2.75 14.5C3.75 11.75 1.5 10 1.5 7Z");
  assert.equal(bell({ grid: 16 }).d, "M8 1.5C10.5 1.5 10.75 4.25 12 6.75C13.5 9.75 13.5 11.5 14.5 14.5L1.5 14.5C2.5 11.5 2.5 9.75 4 6.75C5.25 4.25 5.5 1.5 8 1.5Z");
  assert.equal(bust({ grid: 16 }).d, "M11 3.5C12.75 5.5 10.75 7.25 9.25 8.75C12.25 9.75 14.5 9 14.5 14.5L1.5 14.5C1.5 9 3.75 9.75 6.75 8.75C5.25 7.25 3.25 5.5 5 3.5C6.75 1.5 9.25 1.5 11 3.5Z");
});

test("the soft bodies at the filled finish: tone, shade and contour, passing its rules", () => {
  for (const name of SOFT) {
    const els = finishOf(name, { grid: 48 });
    assert.equal(els.length, 3, name);
    const svg = `<svg viewBox="0 0 48 48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${els.join("")}</svg>`;
    assert.deepEqual(filledChecks(name, parse(svg), 48), [], name);
  }
});

test("squircle: a primitive on 24 at bulk, 5 or 3 by the short side, a pill at --r half the short side", () => {
  const s = shape("squircle", { w: 18, h: 18, at: [12, 12], grid: 24, finish: "bulk" });
  assert.equal(s.d, "M 8 3 H 16 C 17 3 18 3 19.5 4.5 C 21 6 21 7 21 8 V 16 C 21 17 21 18 19.5 19.5 C 18 21 17 21 16 21 H 8 C 7 21 6 21 4.5 19.5 C 3 18 3 17 3 16 V 8 C 3 7 3 6 4.5 4.5 C 6 3 7 3 8 3 Z");
  assert.equal(s.P, null);
  assert.ok(onGrid(s.d));
  assert.deepEqual(clean(s.d), []);
  assert.ok(shape("squircle", { w: 8, h: 8, at: [8, 8], grid: 24, finish: "bulk" }).d.includes("C 9.5 4 10 4 11 5"));
  assert.equal(shape("squircle", { w: 20, h: 8, at: [12, 12], r: 4, grid: 24, finish: "bulk" }).d, "M 6 8 H 18 A 4 4 0 0 1 18 16 H 6 A 4 4 0 0 1 6 8 Z");
  refused(() => shape("squircle", { w: 18, h: 18, at: [12, 12], r: 10, grid: 24, finish: "bulk" }), "--r 10: at most 9");
  refused(() => shape("squircle", { w: 18, h: 18, grid: 16 }), "squircle: the bulk finish, --finish bulk");
});

test("--finish bulk prints one body at .4, --accent prints it full; other grids refuse at bulk", () => {
  assert.deepEqual(finishOf("squircle", { w: 18, h: 18, at: [12, 12], grid: 24, finish: "bulk" }), [`<path d="${shape("squircle", { w: 18, h: 18, at: [12, 12], grid: 24, finish: "bulk" }).d}" fill-opacity=".4" />`]);
  assert.deepEqual(finishOf("lens", { grid: 24, finish: "bulk", accent: true }), [`<path d="${shape("lens", { grid: 24, finish: "bulk" }).d}" />`]);
  assert.deepEqual(finishOf("lens", { grid: 24, finish: "bulk" }), [`<path d="${shape("lens", { grid: 24, finish: "bulk" }).d}" fill-opacity=".4" />`]);
  refused(() => finishOf("lens", { grid: 16, finish: "bulk" }), "no bulk preset for grid 16: bulk is 24");
  refused(() => finishOf("ring", { grid: 24, finish: "bulk", r: 8, hole: 3 }), "ring: the filled finish only");
  const out = execFileSync("node", [SCRIPT, "squircle", "--w", "16", "--h", "20", "--at", "12,12", "--finish", "bulk"], { encoding: "utf8" });
  assert.equal(out.trim(), `<path d="${shape("squircle", { w: 16, h: 20, at: [12, 12], grid: 24, finish: "bulk" }).d}" fill-opacity=".4" />`);
  const acc = execFileSync("node", [SCRIPT, "drop", "--w", "8", "--h", "10", "--at", "12,12", "--finish", "bulk", "--accent"], { encoding: "utf8" });
  assert.ok(acc.trim().startsWith('<path d="') && acc.trim().endsWith('" />') && !acc.includes("fill-opacity"), acc);
  assert.deepEqual(parseArgs(["lens", "--finish", "bulk", "--accent"]), { name: "lens", o: { finish: "bulk", accent: true } });
});
