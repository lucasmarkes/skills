import { test } from "node:test";
import assert from "node:assert/strict";
import { PRESETS, preset, body, bodySvg, inset, radiusFor, referenceInk, KEYLINE_TOL, WEIGHT_TOL, GRAVITY_TOL } from "../../skills/pretty-icons/presets.mjs";

test("three grids, padding 1, fill .2", () => {
  assert.deepEqual(Object.keys(PRESETS).map(Number), [16, 20, 24]);
  for (const G of [16, 20, 24]) {
    const p = preset(G);
    assert.equal(p.pad, 1);
    assert.equal(p.fill, 0.2);
    assert.equal(p.live, G - 2);
  }
  assert.equal(preset(16).stroke, 1);
  assert.equal(preset(24).stroke, 1.5);
});

test("keylines are the spec's", () => {
  assert.deepEqual(preset(16).keylines, { circle: [14, 14], square: [12.5, 12.5], portrait: [11, 14], landscape: [14, 11] });
  assert.deepEqual(preset(20).keylines, { circle: [18, 18], square: [16, 16], portrait: [14, 18], landscape: [18, 14] });
  assert.deepEqual(preset(24).keylines, { circle: [22, 22], square: [20, 20], portrait: [18, 22], landscape: [22, 18] });
});

test("body geometry sits an inset inside its keyline", () => {
  assert.deepEqual(body(16, "portrait"), { tag: "rect", x: 3, y: 1.5, w: 10, h: 13, rx: 1.5 });
  assert.deepEqual(body(16, "circle"), { tag: "circle", cx: 8, cy: 8, r: 6.5 });
  assert.deepEqual(body(24, "square"), { tag: "rect", x: 2.75, y: 2.75, w: 18.5, h: 18.5, rx: 2 });
  assert.deepEqual(body(24, "landscape"), { tag: "rect", x: 1.75, y: 3.75, w: 20.5, h: 16.5, rx: 2 });
});

test("radius by size", () => {
  assert.equal(radiusFor(16, 9.5), 1.5);
  assert.equal(radiusFor(16, 4.5), 1);
  assert.equal(radiusFor(24, 8), 2);
  assert.equal(radiusFor(24, 7.75), 1);
});

test("unknown grid throws", () => {
  assert.throws(() => preset(18), /no preset for grid 18/);
});

test("tolerances", () => {
  assert.equal(KEYLINE_TOL, 0.5);
  assert.equal(WEIGHT_TOL, 0.15);
  assert.equal(GRAVITY_TOL, 0.5);
});

test("the 20 and 24 references are examples/hairline scaled to each grid's live area, measured at its own stroke", async () => {
  const { readSet } = await import("../../skills/pretty-icons/check.mjs");
  const { measure } = await import("../../skills/pretty-icons/raster.mjs");
  const { parse } = await import("../../skills/pretty-icons/svg.mjs");
  const { REFERENCE_INK } = await import("../../skills/pretty-icons/presets.mjs");
  const set = readSet(new URL("../../skills/pretty-icons/examples/hairline/", import.meta.url).pathname);
  for (const G of [20, 24]) {
    const k = preset(G).live / preset(16).live, sw = preset(G).stroke, inks = [];
    for (const s of set.filter((x) => !/data-modifier=/.test(x.text))) {
      const inner = parse(s.text).elements.map((el) => `<${el.tag} ${Object.entries(el.attrs).map(([a, v]) => `${a}="${v}"`).join(" ")} />`).join("");
      // the geometry scaled about the centre; the stroke divided back, so it draws at the grid's own width
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${G} ${G}" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(${G / 2} ${G / 2}) scale(${k}) translate(-8 -8)" stroke-width="${sw / k}">${inner}</g></svg>`;
      inks.push((await measure(svg, G)).ink);
    }
    inks.sort((a, b) => a - b);
    const m = inks.length >> 1, median = inks.length % 2 ? inks[m] : (inks[m - 1] + inks[m]) / 2;
    assert.ok(Math.abs(REFERENCE_INK[G] - median) <= 1, `${G}: stored ${REFERENCE_INK[G]}, measured ${median.toFixed(2)}`);
  }
});

test("the duotone line: 1 on 16, 1.25 on 20, 1.5 on 24; the filled line and contour unchanged", () => {
  assert.deepEqual([16, 20, 24].map((G) => preset(G).stroke), [1, 1.25, 1.5]);
  assert.equal(preset(48).stroke, 1.5);
  assert.equal(preset(48).contour, 2);
});

test("inset: half the drawn stroke, rounded up to the quarter grid", () => {
  assert.deepEqual([16, 20, 24, 48].map((G) => inset(G)), [0.5, 0.75, 0.75, 1]);
});

test("a body sits an inset inside its keyline", () => {
  assert.deepEqual(body(16, "circle"), { tag: "circle", cx: 8, cy: 8, r: 6.5 });
  assert.deepEqual(body(16, "square"), { tag: "rect", x: 2.25, y: 2.25, w: 11.5, h: 11.5, rx: 1.5 });
  assert.deepEqual(body(16, "portrait"), { tag: "rect", x: 3, y: 1.5, w: 10, h: 13, rx: 1.5 });
  assert.deepEqual(body(16, "landscape"), { tag: "rect", x: 1.5, y: 3, w: 13, h: 10, rx: 1.5 });
  assert.deepEqual(body(20, "circle"), { tag: "circle", cx: 10, cy: 10, r: 8.25 });
  assert.deepEqual(body(24, "circle"), { tag: "circle", cx: 12, cy: 12, r: 10.25 });
  assert.deepEqual(body(24, "portrait"), { tag: "rect", x: 3.75, y: 1.75, w: 16.5, h: 20.5, rx: 2 });
  assert.deepEqual(body(48, "circle"), { tag: "circle", cx: 24, cy: 24, r: 19 });
});

test("bulk: 24 only, pad 2, stroke 1.75, stack 0.75, air 1.5, share band, squircle radii", async () => {
  const { BULK_PRESETS, STACK_TOL } = await import("../../skills/pretty-icons/presets.mjs");
  assert.deepEqual(Object.keys(BULK_PRESETS).map(Number), [24]);
  const p = preset(24, "bulk");
  assert.equal(p.finish, "bulk");
  assert.equal(p.G, 24);
  assert.equal(p.fill, 0.4);
  assert.equal(p.pad, 2);
  assert.equal(p.live, 20);
  assert.equal(p.step, 0.25);
  assert.equal(p.stroke, 1.75);
  assert.deepEqual(p.weights, [1.75]);
  assert.equal(p.stack, 0.75);
  assert.equal(p.knockout, undefined, "no paper halo at bulk");
  assert.equal(p.gap, 1.5);
  assert.deepEqual(p.share, [0.25, 0.6]);
  assert.deepEqual(p.radius, [4, 2.75]);
  assert.equal(p.radiusAt, 12);
  assert.equal(p.pillUnder, 6);
  assert.equal(p.elements, 3);
  assert.equal(p.commands, 14);
  assert.deepEqual(p.keylines, { circle: [20, 20], square: [18, 18], portrait: [16, 20], landscape: [20, 16] });
  assert.equal(STACK_TOL, 0.25);
  assert.throws(() => preset(16, "bulk"), /no bulk preset for grid 16: bulk is 24/);
  assert.throws(() => preset(48, "bulk"), /no bulk preset for grid 48: bulk is 24/);
  assert.throws(() => preset(24, "filled"), /no filled preset for grid 24/);
});

test("finishOf reads the root; 24 without a hint is duotone", async () => {
  const { finishOf } = await import("../../skills/pretty-icons/presets.mjs");
  assert.equal(finishOf({ fill: "currentColor" }), "bulk");
  assert.equal(finishOf({ fill: "currentColor", "aria-hidden": "true", viewBox: "0 0 24 24" }), "bulk");
  assert.equal(finishOf({ fill: "none", stroke: "currentColor" }), "duotone");
  assert.equal(finishOf({ fill: "currentColor", stroke: "currentColor" }), null);
  assert.equal(finishOf({}), null);
  assert.equal(preset(24).finish, "duotone");
  assert.equal(preset(24, "duotone").stroke, 1.5);
  assert.equal(preset(48).finish, "filled");
});

test("bulk bodies: inset 1, a circle of 10, squircles for the rest, reference ink", async () => {
  const { BULK_REFERENCE_INK, squircle } = await import("../../skills/pretty-icons/presets.mjs");
  assert.equal(inset(24, "bulk"), 1);
  assert.equal(inset(24), 0.75);
  assert.equal(radiusFor(24, 12, "bulk"), 4);
  assert.equal(radiusFor(24, 11.75, "bulk"), 2.75);
  assert.equal(radiusFor(24, 6, "bulk"), 2.75);
  assert.equal(radiusFor(24, 5.5, "bulk"), 2.75, "below 6, a pill: half the short side");
  assert.equal(radiusFor(24, 2, "bulk"), 1);
  assert.equal(radiusFor(24, 8), 2);
  assert.deepEqual(body(24, "circle", "bulk"), { tag: "circle", cx: 12, cy: 12, r: 10 });
  const sq = body(24, "square", "bulk");
  assert.equal(sq.tag, "path");
  assert.equal(sq.d, squircle(3, 3, 18, 18, 4));
  assert.equal(body(24, "portrait", "bulk").d, squircle(4, 2, 16, 20, 4));
  assert.equal(body(24, "landscape", "bulk").d, squircle(2, 4, 20, 16, 4));
  assert.equal(bodySvg(24, "circle", "bulk"), '<circle cx="12" cy="12" r="10" fill-opacity=".4" />');
  assert.equal(bodySvg(24, "square", "bulk"), `<path d="${squircle(3, 3, 18, 18, 4)}" fill-opacity=".4" />`);
  // the reference is the median ink of examples/bulk
  assert.equal(BULK_REFERENCE_INK[24], 125.9);
  assert.equal(referenceInk(24, "bulk"), BULK_REFERENCE_INK[24]);
  assert.equal(referenceInk(24), 152.6);
});
