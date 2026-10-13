import { test } from "node:test";
import assert from "node:assert/strict";
import { textChecks, formatFailure } from "../../skills/pretty-icons/check.mjs";
import { classify, relate, relations, bulkChecks, isKnockout, uncut } from "../../skills/pretty-icons/bulk.mjs";
import { preset } from "../../skills/pretty-icons/presets.mjs";
import { parse } from "../../skills/pretty-icons/svg.mjs";

export const svg24b = (b) => `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">\n  ${b}\n</svg>`;
export const BODY24B = '<circle cx="12" cy="12" r="10" fill-opacity=".4" />';
export const SQ24B = '<path d="M 8 3 H 16 C 17 3 18 3 19.5 4.5 C 21 6 21 7 21 8 V 16 C 21 17 21 18 19.5 19.5 C 18 21 17 21 16 21 H 8 C 7 21 6 21 4.5 19.5 C 3 18 3 17 3 16 V 8 C 3 7 3 6 4.5 4.5 C 6 3 7 3 8 3 Z" fill-opacity=".4" />';
export const LINE = (d) => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />`;
const lines = (svg, icon = "edit") => textChecks(icon, svg, 24).failures.map(formatFailure);
const p = preset(24, "bulk");
const el = (b) => parse(svg24b(b)).elements[0];

// svg24b puts the first element on line 2, so a failure's `at` counts from @2.

test("classify: a body is closed at .4 with no stroke; a line declares its stroke; the rest is a filled accent", () => {
  const parsed = parse(svg24b(`${BODY24B}\n  <path d="M 9 9 H 15 V 15 H 9 Z" />\n  ${LINE("M 8 12 H 16")}`));
  const c = classify(parsed);
  assert.deepEqual(c.bodies.map((e) => e.at), ["circle@2"]);
  assert.deepEqual(c.accents.map((e) => e.at), ["path@3", "path@4"]);
  assert.deepEqual(c.lines.map((e) => e.at), ["path@4"]);
});

test("relate: a line over a body overprints; a filled accent inside a body overprints; apart or touching is nothing", () => {
  const body = el(SQ24B);
  assert.equal(relate(body, el(LINE("M 2 12 H 22"))), "overprint");
  assert.equal(relate(body, el('<path d="M 9 9 H 15 V 15 H 9 Z" />')), "overprint");
  assert.equal(relate(body, el('<path d="M 22 4 H 23 V 20 H 22 Z" />')), null);
  assert.equal(relate(body, el(LINE("M 22 4 V 20"))), null, "a stroke edge on the body's edge only touches");
});

test("relate: a later solid partly over an earlier filled element stacks", () => {
  const body = el(SQ24B);
  assert.equal(relate(body, el('<path d="M 15 15 H 23 V 23 H 15 Z" />')), "stack");
  assert.equal(relate(el('<path d="M 3 3 H 13 V 13 H 3 Z" />'), el('<path d="M 9 9 H 19 V 19 H 9 Z" fill-opacity=".4" />')), "stack");
});

test("relate refuses: a later filled element over an earlier line; a body inside an earlier element; black on black; a hidden element", () => {
  const line = el(LINE("M 2 12 H 22"));
  assert.deepEqual(relate(line, el('<path d="M 9 9 H 15 V 15 H 9 Z" />')), { got: "path@2 over the line path@2", want: "draw the line in front, or keep them apart" });
  assert.deepEqual(relate(el(SQ24B), el('<path d="M 9 9 H 15 V 15 H 9 Z" fill-opacity=".4" />')).want, "a gray detail vanishes: make it an accent, or a stack");
  assert.deepEqual(relate(el('<path d="M 3 3 H 21 V 21 H 3 Z" />'), el('<path d="M 9 9 H 15 V 15 H 9 Z" />')).want, "black on black: keep them apart, or a stack");
  assert.deepEqual(relate(el('<path d="M 9 9 H 15 V 15 H 9 Z" />'), el(SQ24B)).want, "draw it in front, or keep them apart");
});

test("relations: every overlapping pair in document order, judged on the uncut geometry", () => {
  const parsed = parse(svg24b(`${SQ24B}\n  <path d="M 15 15 H 23 V 23 H 15 Z" />\n  ${LINE("M 6 8 H 12")}`));
  const got = relations(parsed.elements).map((r) => `${r.behind.at} ${r.front.at} ${r.how}`);
  assert.deepEqual(got, ["path@2 path@3 stack", "path@2 path@4 overprint"]);
  const body = el(SQ24B);
  const cut = el(`<path d="M 3 3 H 21 V 21 H 3 Z" fill-opacity=".4" data-cut="knockout" data-body="${body.attrs.d}" />`);
  assert.equal(isKnockout(cut), true);
  assert.equal(uncut(cut).attrs.d, body.attrs.d);
  assert.equal(relate(cut, el('<path d="M 9 9 H 15 V 15 H 9 Z" />')), "overprint");
});

test("the root at bulk: fill currentColor, no stroke, no stroke-width; a line declares its own at 1.75", () => {
  assert.equal(p.stroke, 1.75);
  assert.deepEqual(lines(svg24b(`${BODY24B}\n  ${LINE("M 2 2 H 5")}`)), []);
  const bad = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke-width="1.75" aria-hidden="true">\n  ' + BODY24B + '\n  ' + LINE("M 2 2 H 5") + '\n</svg>';
  assert.deepEqual(textChecks("edit", bad, 24, "bulk").failures.map(formatFailure), ["stroke  edit  root stroke-width 1.75 → not set at bulk"]);
  for (const w of ["1.5", "2"]) {
    const off = svg24b(`${BODY24B}\n  <path d="M 2 2 H 5" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />`);
    assert.deepEqual(lines(off), [`stroke  edit  path@3 stroke-width ${w} → 1.75`]);
  }
  const caps = svg24b(`${BODY24B}\n  <path d="M 2 2 H 5" fill="none" stroke="currentColor" stroke-width="1.75" />`);
  assert.deepEqual(lines(caps), ["stroke  edit  path@3 stroke-linecap missing → round", "stroke  edit  path@3 stroke-linejoin missing → round"]);
  const painted = svg24b(`<circle cx="12" cy="12" r="10" fill="#333" fill-opacity=".4" />\n  ${LINE("M 2 2 H 5")}`);
  assert.deepEqual(lines(painted), ["stroke  edit  circle@2 fill #333 → currentColor, by the root"]);
});

test("root paint at bulk: opacity, style, transform, fill-opacity, a dash; fill-opacity on a line", () => {
  const root = (extra) => `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" ${extra} aria-hidden="true">\n  ${BODY24B}\n  ${LINE("M 2 2 H 5")}\n</svg>`;
  const got = (extra) => textChecks("edit", root(extra), 24).failures.map(formatFailure);
  assert.deepEqual(got('opacity=".5"'), ["stroke  edit  root opacity → not set"]);
  assert.deepEqual(got('fill-opacity=".5"'), ["stroke  edit  root fill-opacity → not set"]);
  assert.deepEqual(got('style="x:y"'), ["stroke  edit  root style → not set"]);
  assert.deepEqual(got('transform="scale(1)"'), ["stroke  edit  root transform → not set"]);
  assert.deepEqual(got('stroke-dasharray="2 2"'), ["stroke  edit  root stroke-dasharray → not set"]);
  const lined = svg24b(`${BODY24B}\n  <path d="M 2 2 H 5" fill="none" fill-opacity=".4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />`);
  assert.deepEqual(lines(lined), ["construction  edit  path@3 fill-opacity on a line → not set"]);
});

test("construction: a contour, a wrong opacity, an open unstroked path, no body, no accent, a rect", () => {
  assert.deepEqual(lines(svg24b(`<circle cx="12" cy="12" r="10" fill-opacity=".4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />\n  <path d="M 9 9 H 15 V 15 H 9 Z" />`)), ["construction  edit  circle@2 fill and stroke → a body at .4 or an accent, no contour"]);
  assert.deepEqual(lines(svg24b(`<circle cx="12" cy="12" r="10" fill-opacity=".3" />\n  <path d="M 1 1 H 3.5 V 3.5 H 1 Z" />`)), ["construction  edit  circle@2 fill-opacity .3 → .4"]);
  assert.deepEqual(lines(svg24b(`${BODY24B}\n  <path d="M 2 2 H 6" />`)), ["construction  edit  path@3 open and unstroked → a line declares stroke"]);
  assert.deepEqual(lines(svg24b('<path d="M 9 9 H 15 V 15 H 9 Z" />')), ["construction  edit  no body → at least one body at .4"]);
  assert.deepEqual(lines(svg24b(BODY24B)), ["construction  edit  no accent → at least one accent, full"]);
  assert.deepEqual(lines(svg24b(`<rect x="3" y="3" width="18" height="18" rx="5" fill-opacity=".4" />\n  <path d="M 9 9 H 15 V 15 H 9 Z" />`)), ["radius  edit  rect@2 → shapes.mjs squircle"]);
});

test("an accent's size: a filled accent no side under 2, a line no shorter than 3; eight commands across the accents", () => {
  assert.deepEqual(lines(svg24b(`${BODY24B}\n  <path d="M 1 1 H 7 V 2.5 H 1 Z" />`)), ["construction  edit  path@3 1.5 wide → a filled accent no side under 2"]);
  assert.deepEqual(lines(svg24b(`${BODY24B}\n  ${LINE("M 1 1 H 3.5")}`)), ["construction  edit  path@3 2.5 long → a line accent no shorter than 3"]);
  const busy = svg24b(`${BODY24B}\n  ${LINE("M 6 8 H 10 V 12 H 14 V 16")}\n  ${LINE("M 14 6 H 18 V 10 H 20 V 14 H 21")}`);
  assert.deepEqual(lines(busy).filter((l) => l.startsWith("count")), ["count  edit  accents 9 drawing commands → at most 8"]);
});

test("overprint is not cut: a line through a body, a filled accent inside it, no stack failure", () => {
  assert.deepEqual(lines(svg24b(`${SQ24B}\n  ${LINE("M 2 12 H 22")}`)).filter((l) => l.startsWith("stack")), []);
  assert.deepEqual(lines(svg24b(`${BODY24B}\n  ${LINE("M 2 12 H 22")}`)).filter((l) => l.startsWith("stack")), []);
  assert.deepEqual(lines(svg24b(`${SQ24B}\n  <path d="M 9 9 H 15 V 15 H 9 Z" />`)).filter((l) => l.startsWith("stack")), []);
});

test("a stack without a cut names the file to cut; data-cut never on a line; a cut with no overlap is stale", () => {
  const stacked = svg24b(`${SQ24B}\n  <path d="M 15 15 H 23 V 23 H 15 Z" />`);
  assert.deepEqual(lines(stacked).filter((l) => l.startsWith("stack")), ["stack  edit  path@3 overlaps path@2 without a cut → node knockout.mjs pretty-icons/edit.svg"]);
  const r = bulkChecks("edit", parse(stacked), p, { folder: "./icons" }).filter((f) => f.rule === "stack");
  assert.equal(formatFailure(r[0]), "stack  edit  path@3 overlaps path@2 without a cut → node knockout.mjs icons/edit.svg");
  const cutLine = svg24b(`${BODY24B}\n  <path d="M 1 1 H 4 V 4" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" data-cut="knockout" data-body="M 1 1 H 4 V 4" />`);
  assert.deepEqual(lines(cutLine).filter((l) => l.startsWith("stack")), ["stack  edit  path@3 data-cut → only on a body or a filled accent"]);
  const stale = svg24b(`<path d="M 3 3 H 21 V 21 H 3 Z" fill-opacity=".4" data-cut="knockout" data-body="M 3 3 H 21 V 21 H 3 Z" />\n  <path d="M 22 4 H 23 V 20 H 22 Z" />`);
  assert.deepEqual(lines(stale).filter((l) => l.startsWith("stack")), ["stack  edit  path@2 cut with no overlap → re-run knockout.mjs"]);
});

test("refusals reach check: a solid over a line, a body inside an element", () => {
  const overLine = svg24b(`${BODY24B}\n  ${LINE("M 4 12 H 20")}\n  <path d="M 10 10 H 14 V 14 H 10 Z" />`);
  assert.ok(lines(overLine).includes("stack  edit  path@4 over the line path@3 → draw the line in front, or keep them apart"), lines(overLine).join("\n"));
  const inner = svg24b(`${SQ24B}\n  <path d="M 9 9 H 15 V 15 H 9 Z" fill-opacity=".4" />\n  ${LINE("M 6 6 H 9")}`);
  assert.ok(lines(inner).includes("stack  edit  path@3 inside path@2 → a gray detail vanishes: make it an accent, or a stack"), lines(inner).join("\n"));
});

test("a cut body is exempt from grid, the per-path cap and the curve rules; an accent is not", () => {
  const cutD = "M 3 3 H 21 V 21 H 3 Z M 9.123 9 H 15 V 15 H 9.123 Z";
  const ok = svg24b(`<path d="${cutD}" fill-opacity=".4" data-cut="knockout" data-body="M 3 3 H 21 V 21 H 3 Z" />\n  <path d="M 10 10 H 14 V 14 H 10 Z" />`);
  assert.deepEqual(lines(ok).filter((l) => /^(grid|count|join|bend)/.test(l)), []);
  const off = svg24b(`${BODY24B}\n  <path d="M 9.1 9 H 15 V 15 H 9.1 Z" />`);
  assert.ok(lines(off).some((l) => l.startsWith("grid  edit  path@3 d[0] 9.1")));
});

test("the finish is read from the root; --finish overrides; a mixed folder votes", async () => {
  const { setFinish } = await import("../../skills/pretty-icons/check.mjs");
  const bulk = { name: "a", text: svg24b(BODY24B) };
  const duo = { name: "b", text: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"></svg>' };
  assert.equal(setFinish([bulk, bulk, duo]), "bulk");
  assert.equal(setFinish([bulk, duo, duo]), "duotone");
  assert.equal(setFinish([bulk, duo, duo], "bulk"), "bulk");
  assert.equal(setFinish([]), null);
  const asDuo = textChecks("a", svg24b(`${BODY24B}\n  ${LINE("M 2 2 H 5")}`), 24, "duotone").failures.map((f) => f.rule);
  assert.ok(asDuo.includes("stroke"));
});

test("count: moves are not drawing commands, so five short strokes in one accent are five, not ten", () => {
  const strokes = [9, 11, 13, 15, 17].map((x) => `M ${x} 9 L ${x} 15`).join(" ");
  const out = lines(svg24b(`${BODY24B}\n  ${LINE(strokes)}`));
  assert.ok(!out.some((l) => l.startsWith("count")), out.join("\n"));
  const nine = [8, 10, 12, 14, 16].map((x) => `M ${x} 9 L ${x} 15`).join(" ") + " L 8 9 L 8 15 L 9 9 L 9 15 L 10 9";
  assert.ok(lines(svg24b(`${BODY24B}\n  ${LINE(nine)}`)).some((l) => l.startsWith("count  edit  accents 10 drawing commands")));
});

test("a filled accent counts one a subpath: three dots are three", () => {
  const dots = [6, 12, 18].map((x) => `M ${x - 1.25} 12 A 1.25 1.25 0 1 0 ${x + 1.25} 12 A 1.25 1.25 0 1 0 ${x - 1.25} 12 Z`).join(" ");
  assert.ok(!lines(svg24b(`${BODY24B}\n  <path d="${dots}" />`)).some((l) => l.startsWith("count")));
});
