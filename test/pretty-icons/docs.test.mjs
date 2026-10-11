import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, writeFileSync, rmSync, readdirSync, statSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkSet, textChecks } from "../../skills/pretty-icons/check.mjs";
import { shape } from "../../skills/pretty-icons/shapes.mjs";
import { addModifier } from "../../skills/pretty-icons/modifiers.mjs";
import { measuredChecks } from "../../skills/pretty-icons/measure.mjs";
import { curveFailures } from "../../skills/pretty-icons/curve.mjs";
import { shadowOn } from "../../skills/pretty-icons/shadow.mjs";

const doc = (f) => readFileSync(new URL(`../../skills/pretty-icons/${f}`, import.meta.url), "utf8");
const svgBlocks = (text) => text.split("```svg\n").slice(1).map((s) => s.split("\n```")[0]);
const line = (f) => `${f.rule}  ${f.icon}  ${f.got} → ${f.want}`;
const svg16 = (b) => `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">${b}</svg>`;
const BODY16 = '<rect x="2.25" y="2.25" width="11.5" height="11.5" rx="1.5" fill="currentColor" fill-opacity=".2" />';

test("rules-filled.md: the croissant is the kit's blob pasted, and passes check on its own", async (t) => {
  const { d } = shape("blob", { anchors: "12,39,c 5,25.5 24,8.5 43,25.5 36,39,c 24,30" });
  const croissant = svgBlocks(doc("rules-filled.md")).find((s) => s.includes(d));
  assert.ok(croissant, "rules-filled.md gives the blob's d in an svg block");
  const dir = mkdtempSync(join(tmpdir(), "croissant-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  writeFileSync(join(dir, "croissant.svg"), croissant + "\n");
  const r = await checkSet(dir);
  assert.equal(r.measured, true);
  assert.deepEqual(r.failures.map(line), []);
  assert.equal(r.rows[0].ink.toFixed(1), "274.9");
});

test("rules.md quotes the messages check.mjs prints for the new rules", async () => {
  const rules = doc("rules.md");
  const stray = textChecks("data", svg16(`${BODY16}<path d="M4.75 5.5H11.25" stroke-opacity="0.6" />`), 16).failures.map(line);
  const good = await addModifier(svg16(BODY16), "badge:plus");
  const wrong = textChecks("data", good.replace('stroke-opacity="0.6"', 'stroke-opacity="0.5"'), 16).failures.map(line);
  const halo = textChecks("data", svg16(`${BODY16}<path d="M10.5 12.5H14.5M12.5 10.5V14.5" stroke-opacity="0.6" data-modifier="badge:plus" />`), 16).failures.map(line);
  for (const l of [...stray, ...wrong, ...halo]) assert.ok(rules.includes(`\`${l}\``), `rules.md quotes ${l}`);
  assert.ok(rules.includes("→ under 4° or over 30°: smooth, or a corner on purpose`"));
  assert.ok(rules.includes("→ at most 1, none under a chord of 4`"));
});

test("rules.md 09: the gesture catalogue and the modifiers", () => {
  const rules = doc("rules.md");
  for (const g of ["seam", "dot pair", "tuft", "steam", "paper sheen", "lean"]) assert.match(rules, new RegExp(`\\| \\*\\*${g}\\*\\* \\|`), g);
  for (const k of ["badge:plus", "badge:minus", "badge:check", "badge:x", "slash", "lock", "dot", "arrow:up", "arrow:right", "arrow:down", "arrow:left"]) assert.ok(rules.includes(`\`${k}\``), k);
});

test("read.md: the craft read, its prompt, and the words for no reader", () => {
  const read = doc("read.md");
  assert.ok(read.includes("## The craft read"));
  assert.ok(read.includes("> These N icons are from one app. For each number, in five words or fewer, name one drawing defect if you see one: a kink in a curve, a wobbly curve, uneven weight, a part floating off the body, a confused silhouette, a detail too small to read. Say \"none\" when you see no defect. Then name the three weakest and why."));
  assert.ok(read.includes("**not read for craft**"));
});

test("SKILL.md: the loop composes with the kit, checks, and looks at the proof", () => {
  const skill = doc("SKILL.md");
  for (const s of ["shapes.mjs <primitive>", "shapes.mjs --from", "--proof --only <name>", "modifiers.mjs", "Do the craft read", "**not read for craft**", "Do the set read", "**not read as a set**"]) assert.ok(skill.includes(s), s);
  assert.ok(!skill.includes("a bar at 3.5"), "the bar is gone from What goes wrong");
});

const LIGHT = readFileSync(new URL("../../skills/pretty-icons/examples/garage/traffic-light.svg", import.meta.url), "utf8");
const light = (el) => textChecks("traffic-light", LIGHT.replace("</svg>", `  ${el}\n</svg>`), 48).failures.map(line);

test("rules-filled.md quotes what check.mjs prints for one weight, the solid, the painted stroke and contrast", async () => {
  const filled = doc("rules-filled.md");
  const quoted = [
    ...light('<path d="M24 44V40" stroke-width="3.5" />'),
    ...light('<circle cx="24" cy="13" r="3" fill="#25262a" stroke="none" />'),
    ...light('<path d="M24 44V40" stroke="#ececea" />'),
    ...light('<path d="M17 10V16" stroke="#ffffff" />'),
  ];
  assert.equal(quoted.length, 4);
  const r = await checkSet(new URL("./fixtures/contrast/", import.meta.url).pathname);
  quoted.push(...r.failures.filter((f) => f.rule === "contrast").map(line));
  assert.equal(quoted.length, 6);
  for (const l of quoted) assert.ok(filled.includes(`\`${l}\``), `rules-filled.md quotes ${l}`);
  const live = filled.replace("`stroke  traffic-light  path@9 stroke-width 3.5 → not set: the root's 1.5, or 2 on a contour`", "");
  for (const gone of [/\bcores?\b/, /\btubes?\b/, /solid small part/, /mark of weight/, /stroke-width="3\.5"/, /a bar at 3\.5/, /\b341\b/]) assert.ok(!gone.test(live), `rules-filled.md still says ${gone}`);
  assert.ok(filled.includes("## 11 · contrast"));
});

test("read.md: the set read, its prompt word for word, and the words for no reader", () => {
  const read = doc("read.md");
  assert.ok(read.includes("## The set read"));
  assert.ok(read.includes("> These N icons are from one app. Name every icon that looks like it comes from a different set than the others, and in five words or fewer say why. Say 'one set' if none does."));
  assert.ok(read.includes("**not read as a set**"));
});

import { createHash } from "node:crypto";

// The reference set's name, as the SHA-256 of its lowercased form: the test never writes it.
const NAME = "6a6a1aefb5dce285444475fd85d5450171e0986e7c6df0f117a7678503d87294";
test("the reference set's name is in no file of the skill", () => {
  const root = new URL("../../skills/pretty-icons/", import.meta.url).pathname;
  const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
  const named = (p) => (readFileSync(p, "utf8").toLowerCase().match(/[a-z]+/g) ?? []).some((w) => createHash("sha256").update(w).digest("hex") === NAME);
  assert.deepEqual(walk(root).filter((p) => /\.(md|mjs|svg)$/.test(p) && named(p)), []);
});

const ruled = async (rule, G, ...icons) => (await measuredChecks(icons.map(([name, text]) => ({ name, text })), G)).failures.filter((f) => f.rule === rule).map(line);
const svg48 = (b) => `<svg viewBox="0 0 48 48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${b}</svg>`;
const CARD16 = '<rect x="2" y="2" width="12" height="12" rx="1.5" fill="currentColor" fill-opacity=".2" />';
const BOX48 = '<rect x="5" y="9" width="38" height="30" rx="6" fill="#ececea" stroke="none" /><rect x="5" y="9" width="38" height="30" rx="6" stroke-width="2" />';
const GARAGE = new URL("../../skills/pretty-icons/examples/garage/", import.meta.url).pathname;

test("rules.md quotes what check.mjs prints for air, loose, bend, diagonal and a duotone shadow", async () => {
  const rules = doc("rules.md");
  const rising = svg16('<path d="M3 13L13 3" />'), round = svg16('<circle cx="8" cy="8" r="6.5" />');
  const copy = BODY16.replace('fill="currentColor" fill-opacity=".2"', 'fill="#cfcfcb" stroke="#cfcfcb" data-shadow="" transform="translate(1.5 1.5)"');
  const quoted = [
    ...await ruled("air", 16, ["oil", svg16('<path d="M3 7H13" /><path d="M3 9H13" />')]),
    ...await ruled("air", 16, ["eye", svg16('<circle cx="8" cy="8" r="1.25" />')]),
    ...await ruled("loose", 16, ["billing", svg16(`${CARD16}<path d="M2 8H14" />`)]),
    ...await ruled("loose", 16, ["billing", svg16(`${CARD16}<path d="M3.5 8H12.5" />`)]),
    ...curveFailures("pao", { tag: "path", attrs: { d: "M8 7.5C8.276 7.5 8.5 7.724 8.5 8" }, at: "path@1" }, 1).filter((f) => f.rule === "bend").map(line),
    ...await ruled("diagonal", 16, ...["brush", "key", "pen", "wrench"].map((n) => [n, rising]), ...["clock", "coin", "disc", "lens", "plate", "ring"].map((n) => [n, round])),
    ...await ruled("diagonal", 16, ["key", svg16('<path d="M3 3L13 13" />')]),
    ...textChecks("billing", svg16(`${copy}${BODY16}`), 16).failures.filter((f) => f.rule === "shadow").map(line),
  ];
  assert.equal(quoted.length, 8, quoted.join("\n"));
  for (const l of quoted) assert.ok(rules.includes(`\`${l}\``), `rules.md quotes ${l}`);
  for (const h of ["# The twelve rules", "## 11 · air", "## 12 · diagonal"]) assert.ok(rules.includes(h), h);
  for (const p of ["dome", "sack", "bubble", "bell", "bust"]) assert.ok(rules.includes(`\`${p}\``), p);
  assert.ok(!/a title bar or a card stripe ending on its edges/.test(rules), "08 no longer lets an accent run edge to edge");
});

test("rules-filled.md quotes what check.mjs prints for air, loose and the shadow", async (t) => {
  const filled = doc("rules-filled.md");
  const dir = mkdtempSync(join(tmpdir(), "shadow-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  cpSync(GARAGE, dir, { recursive: true });
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".svg")).sort().slice(0, 6)) writeFileSync(join(dir, f), shadowOn(readFileSync(join(dir, f), "utf8")));
  const tyre = shadowOn(readFileSync(join(GARAGE, "tyre.svg"), "utf8"));
  const shadowLines = (text) => textChecks("tyre", text, 48).failures.filter((f) => f.rule === "shadow").map(line);
  const quoted = [
    ...await ruled("air", 48, ["oil", svg48('<path d="M9 21H39" /><path d="M9 24H39" />')]),
    ...await ruled("loose", 48, ["toolbox", svg48(`${BOX48}<path d="M5 24H43" />`)]),
    ...(await checkSet(dir)).failures.filter((f) => f.rule === "shadow").map(line),
    ...shadowLines(tyre.replace(/\n[ \t]*<[^>]*data-shadow=""[^>]*\/>/, "")),
    ...shadowLines(tyre.replace("translate(1.5 1.5)", "translate(2 2)")),
  ];
  assert.equal(quoted.length, 5, quoted.join("\n"));
  for (const l of quoted) assert.ok(filled.includes(`\`${l}\``), `rules-filled.md quotes ${l}`);
  for (const h of ["## 12 · air, loose and diagonal", "## 13 · shadow", "shadow.mjs --on", "--shadow-pair"]) assert.ok(filled.includes(h), h);
  assert.ok(!/neither an offset shadow/i.test(filled), "04 no longer forbids the shadow");
  assert.ok(/no white shine/i.test(filled), "04 still forbids a white shine");
});

test("read.md: the shadow read, its prompt word for word, and whose pick stands", () => {
  const read = doc("read.md");
  assert.ok(read.includes("## The shadow read"));
  assert.ok(read.includes("> These are two versions of one set of N icons, A and B. Which set looks better as a set, A or B? Answer with the letter and, in five words or fewer, why."));
  for (const s of ["--shadow-pair", "shadow.mjs --on", "shadow.mjs --off", "**not read for the shadow**"]) assert.ok(read.includes(s), s);
});

test("SKILL.md: the soft bodies, the showcase and the shadow in the loop", () => {
  const skill = doc("SKILL.md");
  for (const s of ["`dome`", "`sack`", "`bubble`", "`bell`", "`bust`", "--showcase", "--shadow-pair", "Do the shadow read", "drawing a shadow by hand or adding a white shine", "**not read for the shadow**"]) assert.ok(skill.includes(s), s);
  assert.ok(!skill.includes("adding an offset shadow or a white shine"));
});

// The numbers rules.md gives by hand (live, gap, weight, the house, the sliders), checked against what check.mjs prints.
const rows16 = (b) => `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">\n  ${b.join("\n  ")}\n</svg>\n`;
const rows24 = (b) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">\n  ${b.join("\n  ")}\n</svg>\n`;
const BODY24 = '<rect x="2.75" y="2.75" width="18.5" height="18.5" rx="2" fill="currentColor" fill-opacity=".2" />';
const TINT = 'fill="currentColor" fill-opacity=".2"';
const HOUSE = (walls, door) => [`<path d="M2.25 6.5 8 1.5l5.75 5v${walls}a1 1 0 0 1-1 1h-9.5a1 1 0 0 1-1-1z" ${TINT} />`, `<path d="${door}" />`];
const SLIDERS = (r, tracks) => [`<circle cx="4.5" cy="4.5" r="${r}" ${TINT} />`, `<circle cx="11.5" cy="11.5" r="${r}" ${TINT} />`, `<path d="${tracks}" />`];
const rowOf = async (name, text) => {
  const dir = mkdtempSync(join(tmpdir(), "row-"));
  try { writeFileSync(join(dir, `${name}.svg`), text); const r = await checkSet(dir); return { row: r.rows[0], lines: r.failures.map(line) }; } finally { rmSync(dir, { recursive: true, force: true }); }
};

test("rules.md: the live, gap and weight lines and the numbers it works from, as check.mjs prints them", async () => {
  const rules = doc("rules.md");
  const tool = (rule, G, ...icons) => ruled(rule, G, ...icons);
  const quoted = [
    ...await tool("live", 16, ["machines", rows16([`<rect x="0.5" y="3.25" width="15" height="9.5" rx="1.5" ${TINT} />`])]),
    ...await tool("gap", 16, ["marks", rows16(['<path d="M2 8H5" />', '<circle cx="7.8" cy="8" r="1.5" />'])]),
    ...await tool("gap", 16, ["overlap", rows16(['<rect x="2" y="2" width="8" height="8" rx="1.5" />', '<path d="M2.75 5V8" />'])]),
    ...await tool("gap", 16, ["dots", rows16(['<rect x="1.75" y="1.75" width="12.5" height="12.5" rx="1.5" />', '<path d="M5 8h0M6 8h0" />'])]),
    ...await tool("weight", 16, ["machines", rows16(['<circle cx="8" cy="8" r="5" />'])]),
    ...(await tool("weight", 24, ...["rack", "shelf", "cabinet"].map((n) => [n, rows24([BODY24, ...[8, 12, 16].map((y) => `<path d="M6 ${y}h4" />`)])]))).filter((l) => l.includes("rack")),
    ...(await tool("weight", 24, ...["cup", "pot"].map((n) => [n, rows24([BODY24, '<path d="M6 8h8" />'])]), ["java", rows24(['<rect x="4" y="4" width="16" height="16" rx="2" ' + TINT + ' />', '<path d="M7 12h8" />'])])).filter((l) => l.includes("java")),
  ];
  assert.equal(quoted.length, 7, quoted.join("\n"));
  assert.deepEqual(quoted.filter((l) => !rules.includes(`\`${l}\``)), [], "rules.md quotes these lines");
  const house = await rowOf("house", rows16(HOUSE(5, "M6.5 10.5V8.5h3v2")));
  assert.deepEqual(house.lines, []);
  assert.deepEqual([house.row.w, house.row.h, house.row.dy], [12.5, 12, 0.24]);
  const tall = await rowOf("house", rows16(HOUSE(5.5, "M6.5 11V9h3v2")));
  assert.equal(tall.row.dy, 0.51, tall.lines.join("\n"));
  assert.ok(tall.lines.some((l) => l.startsWith("gravity")), "taller walls fail gravity");
  assert.ok(rules.includes("its mass 0.24 low") && rules.includes("walls 0.5 taller, the door moved down with them, sink it to 0.51, past rule 06"));
  const across = (h) => rowOf("x", rows16([`<rect x="2.25" y="2.25" width="11.5" height="11.5" rx="1.5" ${TINT} />`, `<path d="M5 8h${h}" />`]));
  const perUnit = ((await across(6)).row.ink - (await across(2)).row.ink) / 4;
  assert.ok(rules.includes(`A line across a filled body adds about ${perUnit.toFixed(1)} per unit on 16`), `${perUnit}`);
  const floor = await rowOf("house", rows16(HOUSE(5, "M6.5 12.5V8.5h3v4")));
  assert.ok(floor.lines.some((l) => l.startsWith("loose")), "a door run down to the floor is loose");
  const three = await rowOf("settings", rows16(SLIDERS(3, "M7.5 4.5h7M1.5 11.5h7")));
  const small = await rowOf("settings", rows16(SLIDERS(2.5, "M7 4.5h7M1.5 11.5h7.5")));
  assert.deepEqual([three.row.keyline, three.lines], ["circle", []]);
  assert.ok(rules.includes(`Knobs of r 2.5 come out light (${small.row.ink.toFixed(1)}, against 63.1)`), `${small.row.ink}`);
  assert.ok(small.lines.some((l) => l.startsWith("weight")), "knobs of r 2.5 fail weight");
});

test("rules-filled.md: the weights it works from are the garage's own", async (t) => {
  const filled = doc("rules-filled.md");
  const edited = async (name, edit) => {
    const dir = mkdtempSync(join(tmpdir(), "garage-"));
    t.after(() => rmSync(dir, { recursive: true, force: true }));
    cpSync(GARAGE, dir, { recursive: true });
    writeFileSync(join(dir, `${name}.svg`), edit(readFileSync(join(GARAGE, `${name}.svg`), "utf8")));
    const r = await checkSet(dir);
    return { ink: r.rows.find((x) => x.icon === name).ink, lines: r.failures.map(line) };
  };
  const whole = await edited("tyre", (s) => s);
  const oneRow = await edited("tyre", (s) => s.replace(/\n  <path d="M9\.75 20\.25[^\n]*\/>/, ""));
  assert.ok(filled.includes(`\`examples/garage/tyre.svg\` weighs ${Math.round(whole.ink)} with its two rows of treads, and ${Math.round(oneRow.ink)} with one row dropped`), `${whole.ink} ${oneRow.ink}`);
  const gear = await edited("gearshift", (s) => s), noMiddle = await edited("gearshift", (s) => s.replace("M24 11.5V22.5", ""));
  assert.ok(filled.includes(`\`gearshift.svg\` weighs ${Math.round(gear.ink)} with its gate at the root's line, and ${Math.round(noMiddle.ink)} with its middle stroke dropped`), `${gear.ink} ${noMiddle.ink}`);
  const thin = await edited("wrench", (s) => s.replace(/\n  <circle[^\n]*\/>/, "").replaceAll("C29.25 23.75 24.25 18.75 27.5 15.5L35.25 7.75", "L35.25 7.75"));
  const weights = thin.lines.filter((l) => l.startsWith("weight"));
  assert.equal(weights.length, 2, thin.lines.join("\n"));
  for (const l of weights) assert.ok(filled.includes(`\`${l}\``), `rules-filled.md quotes ${l}`);
  assert.ok(filled.includes("examples/garage` with the wrench's hole taken out and its jaw's notch filled in (a straight edge from 32.5 20.5 to 35.25 7.75)"));
});
