import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { preset, PALETTE, PRESETS, GRIDS, body, radiusFor, REFERENCE_INK } from "../../skills/pretty-icons/presets.mjs";
import { textChecks, checkSet, readSet } from "../../skills/pretty-icons/check.mjs";
import { classify, objectOf, linesOf } from "../../skills/pretty-icons/filled.mjs";
import { composeSheet, composeBlind } from "../../skills/pretty-icons/sheet.mjs";
import { toReact, toSprite } from "../../skills/pretty-icons/emit.mjs";
import { parse } from "../../skills/pretty-icons/svg.mjs";

const fix = (n) => new URL(`./fixtures/${n}/`, import.meta.url).pathname;
const pantry = new URL("../../skills/pretty-icons/examples/pantry/", import.meta.url).pathname;
const rules = (r) => [...new Set(r.failures.map((f) => f.rule))].sort();
const of = (r, rule) => r.failures.filter((f) => f.rule === rule).map((f) => `${f.got} → ${f.want}`);

// A tomato at the finish: shadow, body, one highlight in paper, the stem in ink.
const BODY = "M24 13C13 13 5.5 19 5.5 28.5C5.5 38 14 43.5 24 43.5C34 43.5 42.5 38 42.5 28.5C42.5 19 35 13 24 13Z";
const tomato = ({ root = "", shadow = `<path d="${BODY}" fill="#ad4a43" stroke="none" transform="translate(3 3)" />`, body = `<path d="${BODY}" fill="#d26352" />`, rest = `<path d="M11.5 26.5C12 22.5 14.5 19.5 18 18" stroke="#ffffff" />\n  <path d="M24 13V6.5M24 13C20 13 16.5 11.5 14.5 9M24 13C28 13 31.5 11.5 33.5 9" />` } = {}) =>
  `<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#2e3955" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${root}>\n  ${shadow}\n  ${body}\n  ${rest}\n</svg>`;

test("48 is the filled preset; the duotone table is unchanged", () => {
  assert.deepEqual(Object.keys(PRESETS).map(Number), [16, 20, 24]);
  assert.deepEqual(Object.keys(GRIDS).map(Number), [16, 20, 24, 48]);
  const p = preset(48);
  assert.equal(p.finish, "filled");
  assert.equal(preset(16).finish, "duotone");
  assert.equal(p.stroke, 2.5);
  assert.equal(p.pad, 2);
  assert.equal(p.live, 44);
  assert.deepEqual(p.shadow, [3, 3]);
  assert.deepEqual(p.keylines, { circle: [41, 41], square: [37, 37], portrait: [33, 41], landscape: [41, 33] });
  assert.deepEqual(p.centre, [22.5, 22.5]);
  assert.deepEqual(preset(16).centre, [8, 8]);
  assert.equal(p.keylineTol, 1);
  assert.equal(p.gravityTol, 3);
  assert.equal(p.weightTol, 0.25);
  assert.equal(p.elements, 8);
  assert.equal(p.commands, 12);
  assert.equal(preset(16).elements, 3);
  assert.equal(preset(16).commands, 8);
});

test("bodies and radii at 48", () => {
  assert.deepEqual(body(48, "circle"), { tag: "circle", cx: 22.5, cy: 22.5, r: 19.25 });
  assert.deepEqual(body(48, "square"), { tag: "rect", x: 5.25, y: 5.25, w: 34.5, h: 34.5, rx: 3 });
  assert.deepEqual(body(48, "portrait"), { tag: "rect", x: 7.25, y: 3.25, w: 30.5, h: 38.5, rx: 3 });
  assert.deepEqual(body(48, "landscape"), { tag: "rect", x: 3.25, y: 7.25, w: 38.5, h: 30.5, rx: 3 });
  assert.equal(radiusFor(48, 16), 3);
  assert.equal(radiusFor(48, 15.5), 1.5);
});

test("the palette: ink, paper and fourteen pairs", () => {
  assert.equal(PALETTE.ink, "#2e3955");
  assert.equal(PALETTE.paper, "#ffffff");
  const pairs = Object.entries(PALETTE).filter(([, v]) => Array.isArray(v));
  assert.equal(pairs.length, 14);
  for (const [, [fill, shade]] of pairs) assert.match(fill + shade, /^#[0-9a-f]{6}#[0-9a-f]{6}$/);
});

test("classify: shadow, bodies, details, parts", () => {
  const c = classify(parse(tomato()).elements);
  assert.equal(c.shadow.at, "path@2");
  assert.deepEqual(c.bodies.map((e) => e.at), ["path@3"]);
  assert.deepEqual(c.details.map((e) => e.at), ["path@4"]);
  assert.deepEqual(c.parts.map((e) => e.at), ["path@5"]);
});

test("a clean filled icon passes the text layer", () => {
  const r = textChecks("tomato", tomato(), 48);
  assert.deepEqual(r.failures, []);
});

test("stroke: the root carries ink at 2.5; no element sets a width", () => {
  assert.deepEqual(rules(textChecks("t", tomato().replace('stroke-width="2.5"', 'stroke-width="3"'), 48)), ["stroke"]);
  assert.deepEqual(rules(textChecks("t", tomato().replace('stroke="#2e3955"', 'stroke="currentColor"'), 48)), ["stroke"]);
  assert.deepEqual(rules(textChecks("t", tomato({ body: `<path d="${BODY}" fill="#d26352" stroke-width="2" />` }), 48)), ["stroke"]);
});

test("palette: every fill and stroke is a palette value or none", () => {
  const r = textChecks("t", tomato({ body: `<path d="${BODY}" fill="#d2493f" />` }), 48);
  assert.ok(rules(r).includes("palette"), rules(r).join());
  assert.match(of(r, "palette")[0], /fill #d2493f → a palette fill/);
  const d = textChecks("t", tomato({ rest: `<path d="M11.5 26.5C12 22.5 14.5 19.5 18 18" stroke="#fbe0d8" />` }), 48);
  assert.deepEqual(rules(d), ["palette"]);
});

test("construction: the shadow is the first element, a body's geometry, its shade, offset 3 3", () => {
  const none = textChecks("t", tomato({ shadow: "" }), 48);
  assert.deepEqual(rules(none), ["construction"]);
  assert.match(of(none, "construction")[0], /no shadow/);
  const late = textChecks("t", tomato({ shadow: "", rest: `<path d="${BODY}" fill="#ad4a43" stroke="none" transform="translate(3 3)" />` }), 48);
  assert.match(of(late, "construction").join("\n"), /first/);
  const off = textChecks("t", tomato({ shadow: `<path d="${BODY}" fill="#ad4a43" stroke="none" transform="translate(2 2)" />` }), 48);
  assert.match(of(off, "construction").join("\n"), /translate\(3 3\)/);
  const wrongShade = textChecks("t", tomato({ shadow: `<path d="${BODY}" fill="#b56a3b" stroke="none" transform="translate(3 3)" />` }), 48);
  assert.match(of(wrongShade, "construction").join("\n"), /#ad4a43/);
  const other = textChecks("t", tomato({ shadow: `<circle cx="24" cy="28" r="15" fill="#ad4a43" stroke="none" transform="translate(3 3)" />` }), 48);
  assert.match(of(other, "construction").join("\n"), /a body's geometry/);
  const stroked = textChecks("t", tomato({ shadow: `<path d="${BODY}" fill="#ad4a43" transform="translate(3 3)" />` }), 48);
  assert.match(of(stroked, "construction").join("\n"), /stroke none/);
});

test("construction: a body is closed and contoured in ink; a detail has no fill; one highlight", () => {
  const open = textChecks("t", tomato({ body: `<path d="M5.5 28.5C5.5 38 14 43.5 24 43.5" fill="#d26352" />` }), 48);
  assert.ok(of(open, "construction").some((x) => /closed/.test(x)), of(open, "construction").join());
  const noContour = textChecks("t", tomato({ body: `<path d="${BODY}" fill="#d26352" stroke="none" />` }), 48);
  assert.ok(of(noContour, "construction").some((x) => /contour/.test(x)));
  const filledDetail = textChecks("t", tomato({ rest: `<path d="M11.5 26.5C12 22.5 14.5 19.5 18 18Z" stroke="#ad4a43" fill="#ad4a43" />` }), 48);
  assert.ok(of(filledDetail, "construction").some((x) => /detail/.test(x)), of(filledDetail, "construction").join());
  const twoHighlights = textChecks("t", tomato({ rest: `<path d="M11.5 26.5C12 22.5 14.5 19.5 18 18" stroke="#ffffff" />\n<path d="M30 20C31 19 32 18 33 18" stroke="#ffffff" />` }), 48);
  assert.ok(of(twoHighlights, "construction").some((x) => /highlight/.test(x)));
  const noBody = textChecks("t", tomato({ shadow: "", body: "" }), 48);
  assert.ok(of(noBody, "construction").some((x) => /body/.test(x)));
  // a dot in the shade with no stroke is a detail, not a body
  const dot = textChecks("t", tomato({ rest: `<circle cx="20" cy="30" r="2" fill="#ad4a43" stroke="none" />` }), 48);
  assert.deepEqual(rules(dot), []);
});

test("grid at 48 is quarters; a transform anywhere but the shadow is rejected", () => {
  assert.deepEqual(rules(textChecks("t", tomato({ rest: `<path d="M11.5 26.4C12 22.5 14.5 19.5 18 18" stroke="#ffffff" />` }), 48)), ["grid"]);
  const t = textChecks("t", tomato({ rest: `<path d="M11.5 26.5C12 22.5 14.5 19.5 18 18" stroke="#ffffff" transform="translate(3 3)" />` }), 48);
  assert.ok(rules(t).includes("construction"), rules(t).join());
});

test("count: eight elements, twelve commands", () => {
  const nine = tomato({ rest: Array.from({ length: 7 }, (_, i) => `<circle cx="${10 + i * 4}" cy="30" r="1" stroke="#ad4a43" />`).join("\n") });
  assert.ok(of(textChecks("t", nine, 48), "count").some((x) => /9 elements → at most 8/.test(x)));
  const twelve = tomato({ rest: `<path d="M5 5h2h2h2h2h2h2h2h2h2h2h2h2" />` });
  assert.ok(of(textChecks("t", twelve, 48), "count").some((x) => /13 commands → at most 12/.test(x)));
  assert.deepEqual(rules(textChecks("t", tomato({ rest: `<path d="M5 5h2h2h2h2h2h2h2h2h2h2h2" />` }), 48)), []);
});

test("the variants for measuring: the object without its shadow, and its lines alone", () => {
  const o = objectOf(tomato());
  assert.ok(!o.includes("transform"), "shadow dropped");
  assert.ok(o.includes('fill="#d26352"'), "the body keeps its fill");
  const l = linesOf(tomato());
  assert.ok(!l.includes("transform") && !l.includes("#d26352") && !l.includes("#ffffff"), l);
  assert.equal(parse(l).elements.length, 3);
});

test("both baseline runs are rejected", async () => {
  for (const n of ["filled-baseline-a", "filled-baseline-b"]) {
    const r = await checkSet(fix(n), { grid: 48 });
    const got = rules(r);
    assert.ok(got.some((x) => ["palette", "stroke", "elements", "construction"].includes(x)), `${n}: ${got.join()}`);
    for (const s of readSet(fix(n))) assert.ok(r.failures.some((f) => f.icon === s.name), `${n}/${s.name} slipped through`);
  }
});

test("examples/pantry: eight icons, every rule passes, and the reference is their median", async () => {
  assert.equal(readdirSync(pantry).filter((f) => f.endsWith(".svg")).length, 8);
  const r = await checkSet(pantry);
  assert.equal(r.G, 48);
  assert.equal(r.measured, true);
  assert.deepEqual(r.failures.map((f) => `${f.rule} ${f.icon} ${f.got}`), []);
  const inks = r.rows.map((x) => x.ink).sort((a, b) => a - b);
  assert.ok(Math.abs(REFERENCE_INK[48] - (inks[3] + inks[4]) / 2) <= 1, `stored ${REFERENCE_INK[48]}, measured ${(inks[3] + inks[4]) / 2}`);
});

test("the sheets keep the file's colours and the shadow; the rows sit on grey too", async () => {
  const set = readSet(pantry);
  const { rows } = await checkSet(pantry);
  const svg = composeSheet(set, 48, rows);
  assert.ok(svg.includes('transform="translate(3 3)"'), "shadow on the sheet");
  assert.ok(svg.includes('data-theme="grey"'));
  assert.ok(svg.includes('stroke="#2e3955"'), "ink stays ink");
  const b = composeBlind(set, 48, 1);
  assert.ok(b.svg.includes('transform="translate(3 3)"'));
  for (const s of set) assert.ok(!b.svg.includes(s.name));
});

test("emit passes the shadow's transform through", () => {
  const set = readSet(pantry);
  assert.ok(toReact(set).includes('transform="translate(3 3)"'));
  assert.ok(toSprite(set).includes('transform="translate(3 3)"'));
});

test("rules-filled.md: the worked body is examples/pantry/egg.svg, and its tables match the preset", () => {
  const doc = readFileSync(new URL("../../skills/pretty-icons/rules-filled.md", import.meta.url), "utf8");
  const egg = readFileSync(join(pantry, "egg.svg"), "utf8");
  for (const line of egg.trim().split("\n")) assert.ok(doc.includes(line.trim()), `rules-filled.md gives ${line.trim().slice(0, 60)}`);
  for (const f of ["circle", "square", "portrait", "landscape"]) {
    const b = body(48, f);
    const text = b.tag === "circle" ? `cx ${b.cx} cy ${b.cy} r ${b.r}` : `x ${b.x} y ${b.y} w ${b.w} h ${b.h} rx ${b.rx}`;
    assert.ok(doc.includes(`\`${text}\``), `rules-filled.md gives ${text}`);
  }
  for (const [name, v] of Object.entries(PALETTE)) for (const hex of [v].flat()) assert.ok(doc.includes(`\`${hex}\``), `${name} ${hex}`);
  assert.ok(doc.includes(`the reference, ${REFERENCE_INK[48]},`), "the reference is quoted");
  assert.ok(doc.includes("22.5, 22.5"), "the centre is quoted");
});

test("the GREEN set: six icons a fresh agent drew with the skill pass every rule", async () => {
  const r = await checkSet(fix("filled-green"));
  assert.equal(r.G, 48);
  assert.equal(r.measured, true);
  assert.deepEqual(r.failures.map((f) => `${f.rule} ${f.icon} ${f.got}`), []);
  assert.deepEqual(r.rows.map((x) => x.icon).sort(), ["apple", "avocado", "bread", "mug", "mushroom", "whisk"]);
});

test("the automotive set: ten icons outside the kitchen pass every rule", async () => {
  const r = await checkSet(fix("filled-automotive"));
  assert.equal(r.G, 48);
  assert.equal(r.measured, true);
  assert.deepEqual(r.failures.map((f) => `${f.rule} ${f.icon} ${f.got}`), []);
  assert.deepEqual(r.rows.map((x) => x.icon).sort(), ["bateria", "cambio", "carro", "combustivel", "ferramenta", "oleo", "pneu", "semaforo", "velocimetro", "volante"]);
});
