import { test } from "node:test";
import assert from "node:assert/strict";
import { segments, joins, inflections, curveFailures, curveColumns, greyRows, fewestGrey, pixelNotes, SMOOTH, CORNER } from "../../skills/pretty-icons/curve.mjs";
import { parse } from "../../skills/pretty-icons/svg.mjs";

const el = (d, at = "path@1") => ({ tag: "path", attrs: { d }, at });
const infl = (d) => segments(d)[0].segs.map(inflections);
// a line along x, then a second line turned by `deg` at 24,24
const turn = (deg) => {
  const r = (deg * Math.PI) / 180;
  return `M4 24H24L${(24 + 10 * Math.cos(r)).toFixed(4)} ${(24 + 10 * Math.sin(r)).toFixed(4)}`;
};

test("the thresholds are the spec's: under 4° smooth, over 30° a corner", () => {
  assert.equal(SMOOTH, 4);
  assert.equal(CORNER, 30);
});

test("a join between 4° and 30° is a kink; 2° is smooth and 45° a corner", () => {
  assert.deepEqual(curveFailures("x", el(turn(2))), []);
  assert.deepEqual(curveFailures("x", el(turn(45))), []);
  const f = curveFailures("x", el(turn(10)));
  assert.equal(f.length, 1);
  assert.equal(f[0].rule, "join");
  assert.equal(f[0].got, "path@1 10.0° at 24, 24");
  assert.equal(f[0].want, "under 4° or over 30°: smooth, or a corner on purpose");
});

test("a closed path joins its last segment to its first", () => {
  const j = joins("M4 4H20V20H4Z");
  assert.equal(j.length, 4);
  assert.ok(j.every((x) => x.kind === "corner"));
  // a circle of four cubics whose last handle is pulled 10° off where the first one leaves
  const k = joins("M4 24C4 13 13 4 24 4C35 4 44 13 44 24C44 35 35 44 24 44C13 44 6 35 4 24Z");
  assert.deepEqual(k.map((x) => x.kind), ["smooth", "smooth", "smooth", "kink"]);
});

test("relative, S, Q and T commands join where their reflections say", () => {
  const j = joins("m4 4c4 0 8 4 8 8s4 8 8 8q4 0 4 4t4 4");
  assert.deepEqual(j.map((x) => x.kind), ["smooth", "smooth", "smooth"]);
  // S after L has no handle to reflect: its first control is the current point
  assert.equal(segments("M4 4L8 4S12 8 16 8")[0].segs[1].kind, "cubic");
});

test("drawing on after Z without a move starts a new subpath; a zero-length segment is no segment", () => {
  assert.equal(segments("M4 4H20V20ZL30 30").length, 2);
  assert.equal(segments("M4 4L4 4H20")[0].segs.length, 1);
  assert.deepEqual(curveFailures("x", el("M4 4L4 4H20")), []);
});

test("a join next to a segment shorter than 1 is a terminal, not judged", () => {
  assert.deepEqual(curveFailures("x", el("M4 24H24L24.5 24.1")), []);
});

test("a cubic that changes sides twice is a wobble; once over a long chord is an S", () => {
  assert.deepEqual(infl("M4 24C40 10 8 10 44 24"), [2]);
  assert.deepEqual(infl("M4 24C14 14 24 34 34 24"), [1]);
  assert.deepEqual(curveFailures("x", el("M4 24C14 14 24 34 34 24")), []);
  const f = curveFailures("x", el("M4 24C40 10 8 10 44 24"));
  assert.equal(f.length, 1);
  assert.equal(f[0].rule, "inflection");
  assert.equal(f[0].want, "at most 1, none under a chord of 4");
});

test("an inflection in a segment shorter than 4 fails", () => {
  const f = curveFailures("x", el("M4 24C5 23 6 25 7 24"));
  assert.deepEqual(f.map((x) => x.got), ["path@1 segment 1 1 inflection over a chord of 3"]);
});

test("a path the reader cannot read is the elements rule's, not curve's", () => {
  assert.deepEqual(curveFailures("x", el("M5 8h6B")), []);
});

test("rects, circles and lines have no joins to judge", () => {
  assert.deepEqual(curveFailures("x", { tag: "rect", attrs: { x: "4", y: "4", width: "8", height: "8" }, at: "rect@1" }), []);
});

test("curve columns count each path once and name kinks only when there are some", () => {
  const sq = "M4 4H20V20H4Z";
  assert.deepEqual(curveColumns([el(sq), el(sq)]), { joins: "0 smooth · 4 corners", infl: 0 });
  assert.deepEqual(curveColumns([el(sq), el(turn(10))]), { joins: "0 smooth · 4 corners · 1 kink", infl: 0 });
});

test("grey rows: a span on whole pixels leaves none, one straddling them leaves two", () => {
  assert.equal(greyRows(7, 9), 0);
  assert.equal(greyRows(7.5, 9.5), 2);
  assert.equal(fewestGrey(1.5), 1);
  assert.equal(fewestGrey(2), 0);
});

test("pixel notes: a 1 stroke centred on a quarter at 16 is off at 16 and 32, in one line; at .5 it is not", () => {
  const icon = (d) => parse(`<svg viewBox="0 0 16 16" stroke="currentColor" stroke-width="1"><path d="${d}" /></svg>`);
  assert.deepEqual(pixelNotes("x", icon("M8.25 2V14"), 16).map((n) => n.got), ["1 of 1 straight strokes off the pixel at 16 px, 1 at 32 px"]);
  assert.deepEqual(pixelNotes("x", icon("M7.5 2V14"), 16), []);
  assert.equal(pixelNotes("x", icon("M8.25 2V14"), 16)[0].want, "their edges on whole pixels");
});

test("pixel notes skip what has no stroke and curves", () => {
  const icon = parse(`<svg viewBox="0 0 16 16" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="10" height="10" rx="1.5" stroke="none" fill="currentColor" /><path d="M3 8C3 3 13 3 13 8" /></svg>`);
  assert.deepEqual(pixelNotes("x", icon, 16), []);
});

test("the filled grid has no pixel note: CSS scales it", () => {
  const icon = parse(`<svg viewBox="0 0 48 48" stroke="#25262a" stroke-width="1.5"><path d="M24 6V42" /></svg>`);
  assert.deepEqual(pixelNotes("x", icon, 48), []);
});
