import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { preset, PALETTE, PALETTE_DARK, toDark, PRESETS, GRIDS, body, radiusFor, radiiFor, REFERENCE_INK } from "../../skills/pretty-icons/presets.mjs";
import { textChecks, checkSet, readSet, formatFailure } from "../../skills/pretty-icons/check.mjs";
import { classify, objectOf, linesOf } from "../../skills/pretty-icons/filled.mjs";
import { composeSheet, composeBlind } from "../../skills/pretty-icons/sheet.mjs";
import { toReact, toSprite } from "../../skills/pretty-icons/emit.mjs";
import { parse } from "../../skills/pretty-icons/svg.mjs";

const fix = (n) => new URL(`./fixtures/${n}/`, import.meta.url).pathname;
const garage = new URL("../../skills/pretty-icons/examples/garage/", import.meta.url).pathname;
const rules = (r) => [...new Set(r.failures.map((f) => f.rule))].sort();
const lines = (r) => r.failures.map(formatFailure);
const read = (n) => readFileSync(join(garage, `${n}.svg`), "utf8");

// The worked example: brackets, tone, shade, contour, three lamps.
const LIGHT = read("traffic-light");
const TONE = '<rect x="13.75" y="4.75" width="20.5" height="38.5" rx="8" fill="#ececea" stroke="none" />';
const SHADE = '<path d="M26.25 4.75A8 8 0 0 1 34.25 12.75V35.25A8 8 0 0 1 26.25 43.25Z" fill="#cfcfcb" stroke="none" />';
const CONTOUR = '<rect x="13.75" y="4.75" width="20.5" height="38.5" rx="8" />';
const add = (el) => LIGHT.replace("</svg>", `  ${el}\n</svg>`);
const check = (svg) => textChecks("traffic-light", svg, 48);

test("48 is the filled preset; the duotone table is unchanged", () => {
  assert.deepEqual(Object.keys(PRESETS).map(Number), [16, 20, 24]);
  assert.deepEqual(Object.keys(GRIDS).map(Number), [16, 20, 24, 48]);
  const p = preset(48);
  assert.equal(p.finish, "filled");
  assert.equal(preset(16).finish, "duotone");
  assert.equal(p.stroke, 1.5);
  assert.deepEqual(p.weights, [2, 3.5]);
  assert.deepEqual(preset(16).weights, []);
  assert.equal(p.pad, 4);
  assert.equal(p.live, 40);
  assert.equal(p.shadow, undefined);
  assert.deepEqual(p.keylines, { circle: [40, 40], square: [36, 36], portrait: [32, 40], landscape: [40, 32] });
  assert.deepEqual(p.centre, [24, 24]);
  assert.deepEqual(preset(16).centre, [8, 8]);
  assert.equal(p.keylineTol, 1);
  assert.equal(p.gravityTol, 3);
  assert.equal(p.weightTol, 0.25);
  assert.equal(p.referenceTol, 0.25);
  assert.equal(p.elements, 8);
  assert.equal(p.commands, 12);
  assert.equal(preset(16).elements, 3);
  assert.equal(preset(16).commands, 8);
});

test("bodies at 48, and radii by character: cut, cased, moulded, pill", () => {
  assert.deepEqual(body(48, "circle"), { tag: "circle", cx: 24, cy: 24, r: 19.25 });
  assert.deepEqual(body(48, "square"), { tag: "rect", x: 6.75, y: 6.75, w: 34.5, h: 34.5, rx: 6 });
  assert.deepEqual(body(48, "portrait"), { tag: "rect", x: 8.75, y: 4.75, w: 30.5, h: 38.5, rx: 6 });
  assert.deepEqual(body(48, "landscape"), { tag: "rect", x: 4.75, y: 8.75, w: 38.5, h: 30.5, rx: 6 });
  assert.deepEqual(radiiFor(48, 20.5), [2, 6, 8, 10.25]);
  assert.deepEqual(radiiFor(48, 9), [1.5, 2.5, 4, 4.5]);
  assert.deepEqual(radiiFor(48, 6.5), [1, 1.5, 2.5, 3.25]);
  assert.equal(radiusFor(48, 16), 6, "cased is the default");
  assert.equal(radiusFor(48, 15.5), 2.5);
});

test("the tones: five, neutral, each with a dark twin", () => {
  assert.deepEqual(PALETTE, { line: "#25262a", fill: "#ececea", shade: "#cfcfcb", paper: "#ffffff", mark: "#8b8c90" });
  assert.deepEqual(PALETTE_DARK, { line: "#f1f1ee", fill: "#3d3e43", shade: "#2c2d31", paper: "#5a5b61", mark: "#9d9ea3" });
  for (const hex of Object.values(PALETTE)) {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    assert.ok(Math.max(r, g, b) - Math.min(r, g, b) <= 5, `${hex} is grey`);
  }
  const dark = toDark(LIGHT);
  for (const [k, hex] of Object.entries(PALETTE)) if (LIGHT.includes(hex)) assert.ok(dark.includes(PALETTE_DARK[k]) && !dark.includes(hex), k);
});

test("classify: tone, shade, contour, shape, line; bar and core; mark", () => {
  const at = (els) => els.map((e) => e.at);
  const t = classify(parse(LIGHT).elements);
  assert.deepEqual(at(t.lines), ["path@2"]);
  assert.deepEqual(at(t.tones), ["rect@3"]);
  assert.deepEqual(at(t.shades), ["path@4"]);
  assert.deepEqual(at(t.contours), ["rect@5"]);
  assert.deepEqual(at(t.shapes), ["circle@6", "circle@7", "circle@8"]);
  const w = classify(parse(read("steering-wheel")).elements);
  assert.deepEqual(at(w.cores), ["circle@3", "path@5"]);
  assert.deepEqual(at(w.lines), ["circle@2", "path@4"], "the bars");
  const y = classify(parse(read("tyre")).elements);
  assert.deepEqual(at(y.marks), ["path@3", "path@4"]);
  assert.deepEqual([...y.paint].map((e) => e.at).sort(), ["circle@5", "path@6"]);
});

test("the worked traffic light passes the text layer", () => {
  assert.deepEqual(lines(check(LIGHT)), []);
});

test("stroke: the root draws in the line tone at 1.5; an element may take 2 or 3.5", () => {
  assert.deepEqual(lines(check(LIGHT.replace('stroke="#25262a" stroke-width="1.5"', 'stroke="#2e3955" stroke-width="1.5"'))), ["stroke  traffic-light  stroke #2e3955 → #25262a, the line tone"]);
  assert.deepEqual(lines(check(LIGHT.replace('stroke-width="1.5" stroke-linecap', 'stroke-width="2.5" stroke-linecap'))), ["stroke  traffic-light  stroke-width 2.5 → 1.5"]);
  assert.deepEqual(rules(check(add('<path d="M24 44V40" stroke-width="2" />'))), []);
  assert.deepEqual(rules(check(add('<path d="M24 44V40" stroke-width="2.5" />'))), ["stroke"]);
});

test("palette: every fill and stroke is one of the five tones", () => {
  const r = check(LIGHT.replace(TONE, TONE.replace("#ececea", "#e8b4ab")));
  assert.ok(lines(r).includes("palette  traffic-light  rect@3 fill #e8b4ab → one of the five tones: #25262a #ececea #cfcfcb #ffffff #8b8c90"), lines(r).join("\n"));
  assert.deepEqual(rules(check(add('<path d="M24 44V40" stroke="#d26352" />'))), ["palette"]);
});

test("construction: no offset shadow, no highlight", () => {
  const shadow = check(LIGHT.replace(TONE, `${TONE.replace("#ececea", "#cfcfcb").replace(" />", ' transform="translate(3 3)" />')}\n  ${TONE}`));
  assert.ok(lines(shadow).includes("construction  traffic-light  rect@3 transform → no offset shadow: the shade sits inside the body"), lines(shadow).join("\n"));
  assert.deepEqual(lines(check(add('<path d="M17 10V16" stroke="#ffffff" />'))), ["construction  traffic-light  path@9 stroke #ffffff → no highlight: paper only as a fill (glass, a lit lamp)"]);
});

test("construction: tone, shade, contour, in that order, the contour pasted", () => {
  const bare = check(LIGHT.replace(`  ${CONTOUR}\n`, ""));
  assert.ok(lines(bare).includes("construction  traffic-light  rect@3 fill #ececea stroke none → its contour after it: the same geometry, no fill, the root's line"), lines(bare).join("\n"));
  const late = check(LIGHT.replace(`${SHADE}\n  ${CONTOUR}`, `${CONTOUR}\n  ${SHADE}`));
  assert.deepEqual(lines(late), ["construction  traffic-light  path@5 shade → between a body's tone and its contour, so the line covers its edge"]);
  const redrawn = check(LIGHT.replace(CONTOUR, CONTOUR.replace('rx="8"', 'rx="6"')));
  assert.ok(rules(redrawn).includes("construction"), "a contour of other geometry is not the tone's");
  assert.deepEqual(lines(check(LIGHT.replace(CONTOUR, CONTOUR.replace(" />", ' stroke-width="2" />')))), ["construction  traffic-light  rect@5 stroke-width 2 → the root's line on a contour"]);
  const none = check(LIGHT.replace(`  ${TONE}\n`, "").replace(`  ${SHADE}\n`, ""));
  assert.ok(lines(none).includes("construction  traffic-light  no body → a closed element in the fill tone, #ececea"), lines(none).join("\n"));
});

test("construction: the mark tone only as a stroke; a core only on a bar", () => {
  assert.deepEqual(lines(check(LIGHT.replace('cy="35" r="4" fill="#ffffff"', 'cy="35" r="4" fill="#8b8c90"'))), ["construction  traffic-light  circle@8 fill #8b8c90 → the mark tone only as a stroke"]);
  assert.deepEqual(lines(check(add('<path d="M24 44V40" stroke="#ececea" />'))), ["construction  traffic-light  path@9 stroke #ececea → the fill tone as a stroke only on a core: a 3.5 bar's path pasted after it, at the root's width"]);
  const tube = LIGHT.replace(/  <path d="M8.75 18H13.75[^\n]*\n/, "").replace("</svg>", '  <path d="M24 44V40" stroke-width="3.5" />\n  <path d="M24 44V40" stroke="#ececea" />\n</svg>');
  assert.deepEqual(rules(check(tube)), []);
});

test("light: the shade sits below or right of its body's centre", () => {
  const left = SHADE.replace("M26.25 4.75A8 8 0 0 1 34.25 12.75V35.25A8 8 0 0 1 26.25 43.25Z", "M21.75 4.75A8 8 0 0 0 13.75 12.75V35.25A8 8 0 0 0 21.75 43.25Z");
  assert.deepEqual(lines(check(LIGHT.replace(SHADE, left))), ["light  traffic-light  path@4 shade centred at 17.75, 24 → below or right of rect@3's centre 24, 24: the light comes from the top"]);
});

test("radius: a rect's rx is cut, cased, moulded or a pill for its smaller side", () => {
  const r = check(LIGHT.replace(/rx="8"/g, 'rx="5"'));
  assert.deepEqual(lines(r), ["rect@3", "rect@5"].map((at) => `radius  traffic-light  ${at} rx 5 → rx 2, 6, 8 or 10.25: cut, cased, moulded or a pill`));
  for (const rx of ["2", "6", "10.25"]) assert.deepEqual(rules(check(LIGHT.replace(/rx="8"/g, `rx="${rx}"`).replace(`  ${SHADE}\n`, ""))), [], rx);
});

test("count: eight elements, twelve commands", () => {
  const nine = add('<path d="M24 44V40" />\n  <path d="M20 44V40" />');
  assert.ok(lines(check(nine)).some((x) => /9 elements → at most 8/.test(x)), lines(check(nine)).join("\n"));
  assert.deepEqual(lines(check(add('<path d="M5 5h1h1h1h1h1h1h1h1h1h1h1h1" />'))), ["count  traffic-light  path@9 13 commands → at most 12"]);
  assert.deepEqual(lines(check(add('<path d="M5 5h1h1h1h1h1h1h1h1h1h1h1" />'))), [], "the move counts: twelve is the cap");
});

test("the variants for measuring: the object as drawn, and its lines alone with each core cut out", () => {
  assert.equal(parse(objectOf(LIGHT)).elements.length, 7);
  const l = linesOf(LIGHT);
  assert.ok(!/#ececea|#cfcfcb|#ffffff/.test(l), l);
  assert.equal(parse(l).elements.length, 5, "brackets, contour, three lamps: the tone and the shade are paint");
  const w = linesOf(read("steering-wheel"));
  assert.match(w, /<mask id="cores"/);
  assert.match(w, /mask="url\(#cores\)"/);
});

test("every set in the old finish is rejected, and so is the first neutral drawing", async () => {
  for (const n of ["filled-baseline-a", "filled-baseline-b", "filled-green", "filled-automotive", "filled-pantry", "tonal-red"]) {
    const r = await checkSet(fix(n), { grid: 48 });
    for (const s of readSet(fix(n))) assert.ok(r.failures.some((f) => f.icon === s.name), `${n}/${s.name} slipped through`);
  }
  const pantry = await checkSet(fix("filled-pantry"));
  assert.ok(rules(pantry).includes("palette") && rules(pantry).includes("construction"), rules(pantry).join());
  const red = await checkSet(fix("tonal-red"));
  for (const rule of ["grid", "radius", "count", "weight"]) assert.ok(rules(red).includes(rule), `${rule} in ${rules(red)}`);
});

test("examples/garage: ten icons, every rule passes, and the reference is their median", async () => {
  assert.equal(readdirSync(garage).filter((f) => f.endsWith(".svg")).length, 10);
  const r = await checkSet(garage);
  assert.equal(r.G, 48);
  assert.equal(r.measured, true);
  assert.deepEqual(lines(r), []);
  const inks = r.rows.map((x) => x.ink).sort((a, b) => a - b);
  assert.ok(Math.abs(REFERENCE_INK[48] - (inks[4] + inks[5]) / 2) <= 0.5, `stored ${REFERENCE_INK[48]}, measured ${(inks[4] + inks[5]) / 2}`);
});

test("the sheets keep the tones and each element's width; the dark row takes the twins", async () => {
  const set = readSet(garage);
  const { rows } = await checkSet(garage);
  const svg = composeSheet(set, 48, rows);
  const row = (theme) => svg.split('<g data-theme="').find((x) => x.startsWith(`${theme}"`));
  assert.ok(svg.includes('stroke-width="3.5"'), "a bar keeps its width on the sheet");
  assert.ok(row("dark").includes(PALETTE_DARK.fill) && !row("dark").includes(PALETTE.fill), "the dark row in the twins");
  assert.ok(row("grey").includes(PALETTE.fill) && !row("grey").includes(PALETTE_DARK.fill), "the grey row in the file's tones");
  const b = composeBlind(set, 48, 1);
  assert.ok(b.svg.includes('stroke-width="3.5"'));
  for (const s of set) assert.ok(!b.svg.includes(s.name));
});

test("emit passes each element's width through", () => {
  const set = readSet(garage);
  assert.ok(toReact(set).includes('strokeWidth="3.5"'));
  assert.ok(toSprite(set).includes('stroke-width="3.5"'));
});

test("rules-filled.md: the worked example is examples/garage/traffic-light.svg, and its tables match the preset", () => {
  const doc = readFileSync(new URL("../../skills/pretty-icons/rules-filled.md", import.meta.url), "utf8");
  for (const line of LIGHT.trim().split("\n")) assert.ok(doc.includes(line.trim()), `rules-filled.md gives ${line.trim().slice(0, 60)}`);
  for (const f of ["circle", "square", "portrait", "landscape"]) {
    const b = body(48, f);
    const text = b.tag === "circle" ? `cx ${b.cx} cy ${b.cy} r ${b.r}` : `x ${b.x} y ${b.y} w ${b.w} h ${b.h} rx ${b.rx}`;
    assert.ok(doc.includes(`\`${text}\``), `rules-filled.md gives ${text}`);
  }
  for (const hex of [...Object.values(PALETTE), ...Object.values(PALETTE_DARK)]) assert.ok(doc.includes(`\`${hex}\``), hex);
  for (const [k, sizes] of Object.entries({ cut: [2, 1.5, 1], cased: [6, 2.5, 1.5], moulded: [8, 4, 2.5] })) {
    assert.deepEqual([20, 10, 6].map((s) => radiiFor(48, s)[["cut", "cased", "moulded"].indexOf(k)]), sizes, k);
    assert.match(doc, new RegExp(`\\| ${k} \\|[^\\n]*\\| ${sizes.join(" \\| ")} \\|`), `rules-filled.md gives ${k}`);
  }
  assert.ok(doc.includes(`the reference, ${REFERENCE_INK[48]},`), "the reference is quoted");
  assert.ok(doc.includes("24, 24"), "the centre is quoted");
});

test("the GREEN set: six travel icons a fresh agent drew with the skill pass every rule", async () => {
  const r = await checkSet(fix("tonal-green"));
  assert.equal(r.G, 48);
  assert.equal(r.measured, true);
  assert.deepEqual(lines(r), []);
  assert.deepEqual(r.rows.map((x) => x.icon).sort(), ["camera", "compass", "map", "suitcase", "tent", "ticket"]);
});
