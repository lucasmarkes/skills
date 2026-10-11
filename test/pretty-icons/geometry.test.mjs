import { test } from "node:test";
import assert from "node:assert/strict";
import { sample, sampleParts, bounds, minDistance, pathPoints, pathParts, midpoint, inside, interior, interiorParts, clearance } from "../../skills/pretty-icons/geometry.mjs";

const near = (a, b, eps = 0.02) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);
const el = (tag, attrs) => ({ tag, attrs: Object.fromEntries(Object.entries(attrs).map(([k, v]) => [k, String(v)])) });

test("rect bounds, with and without rx", () => {
  const b = bounds(sample(el("rect", { x: 2, y: 3, width: 5, height: 4 })));
  assert.deepEqual([b.x0, b.y0, b.x1, b.y1].map((n) => +n.toFixed(2)), [2, 3, 7, 7]);
  const r = bounds(sample(el("rect", { x: 2, y: 3, width: 5, height: 4, rx: 1.5 })));
  near(r.x0, 2); near(r.x1, 7); near(r.y0, 3); near(r.y1, 7);
});

test("circle bounds", () => {
  const b = bounds(sample(el("circle", { cx: 8, cy: 8, r: 4.25 })));
  near(b.x0, 3.75); near(b.x1, 12.25); near(b.y0, 3.75); near(b.y1, 12.25);
});

test("path: absolute and relative, H V, subpaths", () => {
  const pts = pathPoints("M8 1.75v2M8 12.25v2M1.75 8h2M12.25 8h2", 0.1);
  const b = bounds(pts);
  near(b.x0, 1.75); near(b.x1, 14.25); near(b.y0, 1.75); near(b.y1, 14.25);
});

test("path: cubic and quadratic curves are flattened", () => {
  const b = bounds(pathPoints("M0 0C0 4 4 4 4 0", 0.1));
  near(b.x0, 0); near(b.x1, 4); near(b.y1, 3, 0.1); // a cubic's peak is 3/4 of its handles
  const q = bounds(pathPoints("M0 0Q2 4 4 0", 0.1));
  near(q.y1, 2, 0.1);
});

test("path: an arc, as Lucide writes them, relative", () => {
  // a half circle of radius 2 from (2,4) to (6,4), bulging up
  const b = bounds(pathPoints("M2 4a2 2 0 0 1 4 0", 0.05));
  near(b.x0, 2); near(b.x1, 6); near(b.y0, 2, 0.05); near(b.y1, 4);
  // the same written absolute with the other sweep bulges down
  const d = bounds(pathPoints("M2 4A2 2 0 0 0 6 4", 0.05));
  near(d.y1, 6, 0.05);
});

test("path: Z closes back to the subpath start", () => {
  const pts = pathPoints("M0 0L4 0L4 4Z", 1);
  const last = pts.at(-1);
  near(last[0], 0); near(last[1], 0);
});

test("minDistance: parallel lines, touching, crossing", () => {
  const a = sample(el("line", { x1: 0, y1: 0, x2: 10, y2: 0 }));
  near(minDistance(a, sample(el("line", { x1: 0, y1: 3, x2: 10, y2: 3 }))), 3);
  near(minDistance(a, sample(el("line", { x1: 10, y1: 0, x2: 10, y2: 5 }))), 0);
  near(minDistance(a, sample(el("line", { x1: 5, y1: -2, x2: 5, y2: 2 }))), 0, 0.06);
});

test("minDistance: a tick ending on a circle's edge touches it", () => {
  const c = sample(el("circle", { cx: 8, cy: 8, r: 4.25 }), 0.05);
  const tick = pathPoints("M8 1.75v2", 0.05);
  near(minDistance(c, tick), 0, 0.06);
});

test("path: compact arc flags parse like spaced ones, e+ exponents", () => {
  const a = bounds(pathPoints("M0 0a2 2 0 012 2", 0.1)), b = bounds(pathPoints("M0 0a2 2 0 0 1 2 2", 0.1));
  for (const k of ["x0", "y0", "x1", "y1"]) assert.ok(Math.abs(a[k] - b[k]) < 1e-9, `${k}: ${a[k]} vs ${b[k]}`);
  const c = bounds(pathPoints("M0 0a2 2 0 0 1 2 2a2 2 0 0 1 2 2", 0.1)), d = bounds(pathPoints("M0 0a2 2 0 012 2 2 2 0 012 2", 0.1));
  for (const k of ["x0", "y0", "x1", "y1"]) assert.ok(Math.abs(c[k] - d[k]) < 1e-9, `${k}: ${c[k]} vs ${d[k]}`);
  const e = bounds(pathPoints("M1e+1 0h1", 0.1));
  near(e.x0, 10); near(e.x1, 11);
});

test("path: numbers after Z are an implicit lineto from the subpath start; truncated paths terminate", () => {
  const abs = pathPoints("M0 0L1 1Z 5 5", 1).at(-1);
  near(abs[0], 5); near(abs[1], 5);
  const rel = pathPoints("M1 1L3 3z1 1", 1).at(-1);
  near(rel[0], 2); near(rel[1], 2);
  const cut = pathPoints("M0 0L1", 1);
  assert.ok(cut.every((p) => p.every(Number.isFinite)), "no NaN points");
});

test("pathParts: one point list per subpath, split at each M or m", () => {
  const parts = pathParts("M5.75 8h0M7.25 8h0m1.5 0h0", 0.1);
  assert.equal(parts.length, 3);
  near(parts[1][0][0], 7.25); near(parts[2][0][0], 8.75);
  assert.deepEqual(parts.flat(), pathPoints("M5.75 8h0M7.25 8h0m1.5 0h0", 0.1));
  // implicit repeats after M are lines in the same subpath; Z does not start a new one
  assert.equal(pathParts("M1 1 2 2 3 3", 0.1).length, 1);
  assert.equal(pathParts("M0 0L4 0L4 4Z", 0.1).length, 1);
  assert.equal(sampleParts(el("path", { d: "M8 2.75v10.5M2.75 8h10.5" })).length, 2);
  assert.equal(sampleParts(el("rect", { x: 2, y: 3, width: 5, height: 4 })).length, 1);
});

const E = (tag, attrs) => ({ tag, attrs, at: `${tag}@1` });
const CARD = E("rect", { x: "2", y: "2", width: "12", height: "12" });

test("interior: a line whose midpoint lies inside a filled body", () => {
  assert.equal(interior(E("path", { d: "M5 8H11" }), [CARD]), CARD);
  assert.equal(interior(E("path", { d: "M14 8H15.5" }), [CARD]), null);
  assert.deepEqual(midpoint(E("path", { d: "M2 8H6M10 8H14" })), [10, 8]);
  assert.equal(inside([8, 8], [[2, 2], [14, 2], [14, 14], [2, 14]]), true);
  assert.equal(inside([15, 8], [[2, 2], [14, 2], [14, 14], [2, 14]]), false);
});

test("clearance: edge to edge, each at its width", () => {
  assert.ok(Math.abs(clearance(E("path", { d: "M4 8H12" }), CARD, 1, 1) - 1) < 0.01);
});

test("midpoint: a tie goes to the later subpath, an unequal split is not a tie", () => {
  assert.deepEqual(midpoint(E("path", { d: "M2 8H5.7M9 8H12.7" })), [9, 8]);
  const s = midpoint(E("path", { d: "M8.25 5.25v6M5.25 8.25h6" }));
  assert.ok(Math.abs(s[0] - 5.25) < 0.01 && Math.abs(s[1] - 8.25) < 0.01);
  const m = midpoint(E("path", { d: "M2 8H4M8 8H14" }));
  assert.ok(Math.abs(m[0] - 10) < 0.01 && m[1] === 8);
});

test("interiorParts: each subpath judged on its own midpoint", () => {
  const parts = interiorParts(E("path", { d: "M5 8H8M14 8H20" }), [CARD]);
  assert.deepEqual(parts.map((x) => x.i), [0]);
  assert.equal(parts[0].body, CARD);
});
