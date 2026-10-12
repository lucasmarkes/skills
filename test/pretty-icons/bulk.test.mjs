import { test } from "node:test";
import assert from "node:assert/strict";
import { textChecks, formatFailure } from "../../skills/pretty-icons/check.mjs";
import { classify, crosses, bulkChecks, isKnockout, uncut } from "../../skills/pretty-icons/bulk.mjs";
import { preset } from "../../skills/pretty-icons/presets.mjs";
import { parse } from "../../skills/pretty-icons/svg.mjs";

export const svg24b = (b) => `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">\n  ${b}\n</svg>`;
export const BODY24B = '<circle cx="12" cy="12" r="10" fill-opacity=".4" />';
export const SQ24B = '<path d="M 8 3 H 16 C 17 3 18 3 19.5 4.5 C 21 6 21 7 21 8 V 16 C 21 17 21 18 19.5 19.5 C 18 21 17 21 16 21 H 8 C 7 21 6 21 4.5 19.5 C 3 18 3 17 3 16 V 8 C 3 7 3 6 4.5 4.5 C 6 3 7 3 8 3 Z" fill-opacity=".4" />';
export const LINE = (d) => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`;
const lines = (svg, icon = "edit") => textChecks(icon, svg, 24).failures.map(formatFailure);
const p = preset(24, "bulk");

// svg24b puts the first element on line 2, so a failure's `at` counts from @2.

test("classify: a body is closed at .4 with no stroke; a line declares its stroke; the rest is a filled accent", () => {
  const parsed = parse(svg24b(`${BODY24B}\n  <path d="M 9 9 H 15 V 15 H 9 Z" />\n  ${LINE("M 8 12 H 16")}`));
  const c = classify(parsed);
  assert.deepEqual(c.bodies.map((e) => e.at), ["circle@2"]);
  assert.deepEqual(c.accents.map((e) => e.at), ["path@3", "path@4"]);
  assert.deepEqual(c.lines.map((e) => e.at), ["path@4"]);
});

test("crosses: inside, through, or within half a line's width; touching within 0.1 is not a crossing", () => {
  const body = parse(svg24b(SQ24B)).elements[0];
  const inside = parse(svg24b('<path d="M 9 9 H 15 V 15 H 9 Z" />')).elements[0];
  const through = parse(svg24b(LINE("M 2 12 H 22"))).elements[0];
  const beside = parse(svg24b('<path d="M 22 4 H 23 V 20 H 22 Z" />')).elements[0];
  const touching = parse(svg24b(LINE("M 21 4 V 20"))).elements[0];
  assert.equal(crosses(inside, body), true);
  assert.equal(crosses(through, body), true);
  assert.equal(crosses(beside, body), false);
  assert.equal(crosses(touching, body), false);
  // the cut body is judged by its uncut geometry
  const cut = parse(svg24b(`<path d="M 3 3 H 21 V 21 H 3 Z" fill-opacity=".4" data-cut="knockout" data-body="${body.attrs.d}" />`)).elements[0];
  assert.equal(isKnockout(cut), true);
  assert.equal(uncut(cut).attrs.d, body.attrs.d);
  assert.equal(crosses(inside, cut), true);
});

test("the root at bulk: fill currentColor, no stroke, no stroke-width; a line declares its own", () => {
  assert.deepEqual(lines(svg24b(`${BODY24B}\n  ${LINE("M 2 2 H 5")}`)), []);
  const bad = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke-width="2" aria-hidden="true">\n  ' + BODY24B + '\n  ' + LINE("M 2 2 H 5") + '\n</svg>';
  assert.deepEqual(textChecks("edit", bad, 24, "bulk").failures.map(formatFailure), ["stroke  edit  root stroke-width 2 → not set at bulk"]);
  const thin = svg24b(`${BODY24B}\n  <path d="M 2 2 H 5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />`);
  assert.deepEqual(lines(thin), ["stroke  edit  path@3 stroke-width 1.5 → 2"]);
  const caps = svg24b(`${BODY24B}\n  <path d="M 2 2 H 5" fill="none" stroke="currentColor" stroke-width="2" />`);
  assert.deepEqual(lines(caps), ["stroke  edit  path@3 stroke-linecap missing → round", "stroke  edit  path@3 stroke-linejoin missing → round"]);
  const painted = svg24b(`<circle cx="12" cy="12" r="10" fill="#333" fill-opacity=".4" />\n  ${LINE("M 2 2 H 5")}`);
  assert.deepEqual(lines(painted), ["stroke  edit  circle@2 fill #333 → currentColor, by the root"]);
});

test("construction: a contour, a wrong opacity, an open unstroked path, no body, no accent, a rect", () => {
  assert.deepEqual(lines(svg24b(`<circle cx="12" cy="12" r="10" fill-opacity=".4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />\n  <path d="M 9 9 H 15 V 15 H 9 Z" />`)), ["construction  edit  circle@2 fill and stroke → a body at .4 or an accent, no contour"]);
  assert.deepEqual(lines(svg24b(`<circle cx="12" cy="12" r="10" fill-opacity=".3" />\n  <path d="M 1 1 H 3.5 V 3.5 H 1 Z" />`)), ["construction  edit  circle@2 fill-opacity .3 → .4"]);
  assert.deepEqual(lines(svg24b(`${BODY24B}\n  <path d="M 2 2 H 6" />`)), ["construction  edit  path@3 open and unstroked → a line declares stroke"]);
  assert.deepEqual(lines(svg24b('<path d="M 9 9 H 15 V 15 H 9 Z" />')), ["construction  edit  no body → at least one body at .4"]);
  assert.deepEqual(lines(svg24b(BODY24B)), ["construction  edit  no accent → at least one accent, full"]);
  assert.deepEqual(lines(svg24b(`<rect x="3" y="3" width="18" height="18" rx="5" fill-opacity=".4" />\n  <path d="M 9 9 H 15 V 15 H 9 Z" />`)), ["radius  edit  rect@2 → shapes.mjs squircle"]);
});

test("an accent's size: a filled accent no side under 2, a line no shorter than 3; eight commands across the accents", () => {
  assert.deepEqual(lines(svg24b(`${BODY24B}\n  <path d="M 1 1 H 7 V 2.5 H 1 Z" />`)), ["construction  edit  path@3 1.5 wide → a filled accent no side under 2"]);
  assert.deepEqual(lines(svg24b(`${BODY24B}\n  ${LINE("M 1 1 H 3.5")}`)), ["construction  edit  path@3 2.5 long → a line accent no shorter than 3"]);
  const busy = svg24b(`${BODY24B}\n  ${LINE("M 6 8 H 10 V 12 H 14 V 16")}\n  ${LINE("M 14 6 H 18 V 10 H 20 V 14")}`);
  assert.deepEqual(lines(busy).filter((l) => l.startsWith("count")), ["count  edit  accents 10 drawing commands → at most 8"]);
});

test("a crossing without a cut names the file to cut; data-cut only on a body; a cut with no crossing is stale", () => {
  assert.deepEqual(lines(svg24b(`${SQ24B}\n  ${LINE("M 2 12 H 22")}`)), ["knockout  edit  path@3 crosses path@2 without a cut → node knockout.mjs pretty-icons/edit.svg"]);
  const r = bulkChecks("edit", parse(svg24b(`${SQ24B}\n  ${LINE("M 2 12 H 22")}`)), p, { folder: "./icons" });
  assert.equal(formatFailure(r[0]), "knockout  edit  path@3 crosses path@2 without a cut → node knockout.mjs icons/edit.svg");
  assert.deepEqual(lines(svg24b(`${BODY24B}\n  <path d="M 1 1 H 3.5 V 3.5 H 1 Z" data-cut="knockout" data-body="M 1 1 H 3.5 V 3.5 H 1 Z" />`)), ["knockout  edit  path@3 data-cut → only on a body"]);
  const stale = svg24b(`<path d="M 3 3 H 21 V 21 H 3 Z" fill-opacity=".4" data-cut="knockout" data-body="M 3 3 H 21 V 21 H 3 Z" />\n  <path d="M 22 4 H 23 V 20 H 22 Z" />`);
  assert.deepEqual(lines(stale).filter((l) => l.startsWith("knockout")), ["knockout  edit  path@2 cut with no crossing → re-run knockout.mjs"]);
});

test("a cut body is exempt from grid, the per-path cap and the curve rules; an accent is not", () => {
  const cutD = "M 3 3 H 21 V 21 H 3 Z M 9.123 9 H 15 V 15 H 9.123 Z";
  const ok = svg24b(`<path d="${cutD}" fill-opacity=".4" data-cut="knockout" data-body="M 3 3 H 21 V 21 H 3 Z" />\n  <path d="M 10 10 H 14 V 14 H 10 Z" />`);
  assert.deepEqual(lines(ok).filter((l) => /^(grid|count|join|bend)/.test(l)), []);
  const off = svg24b(`${BODY24B}\n  <path d="M 9.1 9 H 15 V 15 H 9.1 Z" />`);
  assert.ok(lines(off).some((l) => l.startsWith("grid  edit  path@3 d[0] 9.1")));
});

test("a circle body with a line through it and no cut names the file to cut", () => {
  assert.deepEqual(lines(svg24b(`${BODY24B}\n  ${LINE("M 2 12 H 22")}`)), ["knockout  edit  path@3 crosses circle@2 without a cut → node knockout.mjs pretty-icons/edit.svg"]);
});

test("an accent touching a body without crossing is not a crossing", () => {
  assert.deepEqual(lines(svg24b(`${SQ24B}\n  ${LINE("M 21 4 V 20")}`)).filter((l) => l.startsWith("knockout")), []);
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
