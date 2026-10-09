import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { placement, halo, cut, glyph, addModifier, modifierFailures, parseArgs, ModifierError, KINDS } from "../../skills/pretty-icons/modifiers.mjs";
import { textChecks } from "../../skills/pretty-icons/check.mjs";
import { toReact } from "../../skills/pretty-icons/emit.mjs";
import { parse } from "../../skills/pretty-icons/svg.mjs";
import { MODIFIER, preset, bodySvg } from "../../skills/pretty-icons/presets.mjs";

const ex = (set, name) => readFileSync(new URL(`../../skills/pretty-icons/examples/${set}/${name}.svg`, import.meta.url), "utf8");
const cli = new URL("../../skills/pretty-icons/modifiers.mjs", import.meta.url).pathname;
const svg16 = (body) => `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const BODY16 = '<rect x="1.75" y="1.75" width="12.5" height="12.5" rx="1.5" fill="currentColor" fill-opacity=".2" />';

test("a modifier's box sits in a corner of the live area; its halo is half the box plus one and a half strokes", () => {
  assert.deepEqual(MODIFIER, { 16: { size: 5, dot: 1.5 }, 20: { size: 6.5, dot: 1.75 }, 24: { size: 8, dot: 2.25 }, 48: { size: 14.5, dot: 4 } });
  assert.deepEqual(placement(16, "badge:plus").c, [12.5, 12.5]);
  assert.deepEqual(placement(16, "badge:plus", "tl").c, [3.5, 3.5]);
  assert.deepEqual(placement(48, "badge:plus").c, [36.75, 36.75]);
  assert.deepEqual(placement(24, "dot").c, [20.75, 20.75]);
  assert.deepEqual([16, 20, 24, 48].map((G) => halo(G, "badge:plus").r), [4.75, 5.5, 7, 10.25]);
  assert.throws(() => placement(16, "badge:star"), /--add badge:star/);
  assert.throws(() => placement(16, "dot", "mid"), /--corner mid/);
});

test("cut: a stroke the halo crosses is cut where it enters, the ends snapped outward to the quarter grid", () => {
  const H = halo(24, "badge:plus");
  // a closed rect becomes one open run, from where it leaves the halo round to where it enters
  assert.equal(cut("M3 5H21V19H3Z", H), "M12 19L3 19L3 5L21 5L21 12.25");
  assert.equal(cut("M3 5H10", H), null);
  // an arc keeps its radii; the part at the cut end goes as a cubic, the kept parts as arcs
  assert.equal(cut("M1.75 8A6.25 6.25 0 1 1 14.25 8A6.25 6.25 0 1 1 1.75 8Z", halo(16, "badge:plus")), "M8 14.25A6.25 6.25 0 0 1 1.75 8A6.25 6.25 0 0 1 14.25 8");
  // every end is clear of the halo
  for (const d of [cut("M3 5H21V19H3Z", H), cut("M3 12C3 20 10 21 21 21", H)]) {
    const n = d.match(/-?\d*\.?\d+/g).map(Number), ends = [n.slice(0, 2), n.slice(-2)];
    for (const q of ends) assert.ok(H.inside(q) >= 0, `${q} is inside`);
  }
});

test("cut: a crumb (a run shorter than 1) goes, and a dot is kept or dropped whole", () => {
  const H = halo(48, "badge:plus");
  assert.equal(cut("M26 36.75H27.5", H), "");
  assert.equal(cut("M24 19h0M38 38h0", H), "M24 19h0");
});

test("glyphs: duotone at stroke-opacity 0.6 (--solid leaves it out), a badge at 48 on paper with a contour at 2", () => {
  assert.deepEqual(glyph(24, "badge:plus"), [{ tag: "path", attrs: { d: "M16 19H22M19 16V22", "data-modifier": "badge:plus", "stroke-opacity": "0.6" } }]);
  assert.deepEqual(glyph(24, "badge:plus", { solid: true })[0].attrs, { d: "M16 19H22M19 16V22", "data-modifier": "badge:plus" });
  assert.equal(glyph(24, "slash")[0].attrs.d, "M3 3L21 21");
  assert.deepEqual(glyph(24, "dot")[0].attrs, { cx: "20.75", cy: "20.75", r: "2.25", fill: "currentColor", stroke: "none", "data-modifier": "dot" });
  const x48 = glyph(48, "badge:x");
  assert.deepEqual(x48[0].attrs, { cx: "36.75", cy: "36.75", r: "6.25", fill: "#ffffff", "stroke-width": "2", "data-modifier": "badge:x" });
  assert.equal(x48[1].attrs["stroke-opacity"], undefined);
  for (const k of KINDS) for (const G of [16, 20, 24, 48]) assert.ok(glyph(G, k).length >= 1);
});

test("addModifier: a duotone body is split into its paint, whole, and its contour, cut; the modifier goes last", async () => {
  const out = await addModifier(svg16(BODY16), "badge:plus");
  const els = parse(out).elements;
  assert.deepEqual(els.map((el) => [el.tag, el.attrs.stroke, el.attrs["data-cut"], el.attrs["data-modifier"]]), [
    ["rect", "none", undefined, undefined],
    ["path", undefined, "split", undefined],
    ["path", undefined, undefined, "badge:plus"],
  ]);
  // the paint keeps its geometry and fill: the modifier never cuts a fill
  assert.equal(els[0].attrs.width, "12.5");
  assert.equal(els[0].attrs["fill-opacity"], ".2");
  assert.deepEqual(textChecks("x", out, 16).failures, []);
  assert.doesNotMatch(out, /\n\s*\n/, "one element per line, no blank line");
  await assert.rejects(addModifier(out, "dot"), /one per icon/);
});

test("addModifier: every example takes a badge, the cut arcs and curves pass check", async () => {
  for (const name of ["all", "coding", "connectivity", "data", "devices", "empty", "interfaces", "machines", "marks", "security"]) {
    const out = await addModifier(ex("hairline", name), "badge:plus", { name });
    assert.deepEqual(textChecks(name, out, 16).failures, [], name);
  }
  for (const name of ["battery", "fuel", "gearshift", "oil", "speedometer", "steering-wheel", "traffic-light", "tyre", "wrench"]) {
    const out = await addModifier(ex("garage", name), "badge:check", { name });
    assert.deepEqual(textChecks(name, out, 48).failures, [], name);
  }
});

test("addModifier refuses a body wholly under the halo, a slash in a corner, an icon that fails check already, and a cut that fails gap", async () => {
  await assert.rejects(addModifier(ex("garage", "car"), "badge:check"), (e) => e instanceof ModifierError && /circle@7 lies under the badge:check's halo: try another --corner/.test(e.message));
  await assert.rejects(addModifier(svg16(BODY16), "slash", { corner: "tl" }), /a slash crosses the whole icon/);
  await assert.rejects(addModifier(svg16('<path d="M1.8 6.25h12.5" />'), "dot"), /fails check before the modifier/);
  // a slash cuts connectivity's link to a stub inside its node, 0.97 from the node's cut contour (the example as drawn before Task 11)
  const NODES = '<circle cx="4.75" cy="11.25" r="3" fill="currentColor" fill-opacity=".2" /><circle cx="11.25" cy="4.75" r="3" fill="currentColor" fill-opacity=".2" /><path d="M4.75 11.25 11.25 4.75" />';
  await assert.rejects(addModifier(svg16(NODES), "slash", { name: "connectivity" }), /would fail check:\ngap  connectivity  path@\d to path@\d 0\.97 apart[^]*try another --corner or another kind/);
});

test("the modifier rule: opacity, size and corner, the halo, and data-cut without a modifier", async () => {
  const rule = (text, G = 16) => modifierFailures("x", parse(text), G).map((f) => f.got);
  const good = await addModifier(svg16(BODY16), "badge:plus");
  assert.deepEqual(rule(good), []);
  assert.deepEqual(rule(good.replace('stroke-opacity="0.6"', 'stroke-opacity="0.5"')), ["path@4 stroke-opacity 0.5"]);
  assert.match(rule(good.replace("M10.75 12.5H14.25M12.5 10.75V14.25", "M9.75 11.5H13.25M11.5 9.75V13.25"))[0], /^badge:plus 5 wide, centred at 11.5 11.5/);
  // a stroke left inside the halo: drawn by hand, not by the command
  assert.match(rule(svg16(`${BODY16}<path d="M10.75 12.5H14.25M12.5 10.75V14.25" stroke-opacity="0.6" data-modifier="badge:plus" />`))[0], /^rect#1@1 [\d.]+ inside badge:plus's halo/);
  assert.deepEqual(rule(svg16('<path d="M2 2H8" data-cut="" />')), ["path@1 data-cut"]);
  const two = good.replace("</svg>", '<circle cx="3.5" cy="3.5" r="1.5" fill="currentColor" stroke="none" data-modifier="dot" /></svg>');
  assert.deepEqual(rule(two), ["2 modifiers: badge:plus, dot"]);
  // at 48 a modifier has no opacity
  const car48 = await addModifier(ex("garage", "battery"), "arrow:up");
  assert.deepEqual(rule(car48.replace('data-modifier="arrow:up"', 'stroke-opacity="0.6" data-modifier="arrow:up"'), 48), ["path@8 stroke-opacity 0.6"]);
});

test("check counts a split body as one element and lets stroke-opacity through only on a modifier", async () => {
  const out = await addModifier(svg16(`${BODY16}<path d="M4.75 5.5H11.25" /><path d="M4.75 8.5H8.75" />`), "dot");
  assert.deepEqual(textChecks("x", out, 16).failures, []);
  const f = textChecks("x", svg16(`${BODY16}<path d="M4.75 5.5H11.25" stroke-opacity="0.6" />`), 16).failures;
  assert.deepEqual(f.map((x) => x.got), ["path#2@1 stroke-opacity"]);
});

test("emit passes a modifier's attributes through: stroke-opacity becomes strokeOpacity in React", async () => {
  const text = await addModifier(svg16(BODY16), "badge:plus");
  const tsx = toReact([{ name: "q", text }]);
  assert.match(tsx, /strokeOpacity="0.6"/);
  assert.match(tsx, /data-modifier="badge:plus"/);
  assert.match(tsx, /data-cut="split"/);
});

test("CLI: parseArgs, --print, and a refusal on stderr", () => {
  assert.deepEqual(parseArgs(["a.svg", "--add", "dot", "--corner", "tl", "--solid"]), { file: "a.svg", corner: "tl", solid: true, print: false, add: "dot" });
  assert.equal(parseArgs(["a.svg"]), null);
  assert.equal(parseArgs(["a.svg", "--add"]), null);
  assert.equal(parseArgs(["a.svg", "--add", "dot", "--bogus"]), null);
  const file = new URL("../../skills/pretty-icons/examples/hairline/data.svg", import.meta.url).pathname;
  const ok = spawnSync(process.execPath, [cli, file, "--add", "badge:check", "--print"], { encoding: "utf8" });
  assert.equal(ok.status, 0);
  assert.match(ok.stdout, /data-modifier="badge:check"/);
  const car = new URL("../../skills/pretty-icons/examples/garage/car.svg", import.meta.url).pathname;
  const no = spawnSync(process.execPath, [cli, car, "--add", "badge:check", "--print"], { encoding: "utf8" });
  assert.equal(no.status, 1);
  assert.match(no.stderr, /^modifiers: /);
});

test("a modifier on 20 and 24, the grids no example is drawn on, passes check", async () => {
  for (const G of [20, 24]) {
    const { stroke } = preset(G);
    const text = `<svg viewBox="0 0 ${G} ${G}" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${bodySvg(G, "square")}</svg>`;
    assert.deepEqual(textChecks("x", text, G).failures, [], `the base at ${G}`);
    for (const kind of ["badge:plus", "slash", "dot", "lock", "arrow:up"]) {
      const out = await addModifier(text, kind);
      assert.deepEqual(textChecks("x", out, G).failures, [], `${kind} at ${G}`);
    }
  }
});
