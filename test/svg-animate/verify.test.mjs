import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, cpSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { animations } from "./fixtures/animations.mjs";

// The three scripts of VERIFY.md, written to a temporary folder the way the agent copies them to scratch.
const VERIFY = readFileSync(new URL("../../skills/svg-animate/VERIFY.md", import.meta.url), "utf8");
const blocks = Object.fromEntries([...VERIFY.matchAll(/^```js (\w+\.mjs)\n([\s\S]*?)^```$/gm)].map((m) => [m[1], m[2]]));
const tmp = mkdtempSync(join(tmpdir(), "svg-animate-"));
for (const [name, code] of Object.entries(blocks)) writeFileSync(join(tmp, name), code);
const FIX = new URL("./fixtures/", import.meta.url).pathname;
const run = (script, args, env = {}) => spawnSync(process.execPath, [join(tmp, script), ...args], { encoding: "utf8", env: { ...process.env, ...env } });
const has = (bin) => spawnSync(bin, ["--version"]).status === 0;
const skip = process.env.SVG_RASTER || has("rsvg-convert") || has("resvg") ? false : "no rasteriser: install rsvg-convert or resvg, or set SVG_RASTER=npx";

// normalize a fixture (or a variant written from its text) into tmp/<name>, and return its inventory
function normalize(name, text) {
  const src = text === undefined ? join(FIX, `${name}.svg`) : join(tmp, `${name}.svg`);
  if (text !== undefined) writeFileSync(src, text);
  const r = run("normalize.mjs", [src, join(tmp, name)]);
  assert.equal(r.status, 0, r.stderr);
  return { src, inv: JSON.parse(readFileSync(join(tmp, name, "inventory.json"), "utf8")), svg: readFileSync(join(tmp, name, "source.svg"), "utf8") };
}
// two copies of the normalised source, checked against the original: normalising changed no pixel
function roundTrip(name, src) {
  const dir = join(tmp, `${name}-rt`);
  mkdirSync(dir, { recursive: true });
  for (const f of ["frame-000.svg", "frame-001.svg"]) cpSync(join(tmp, name, "source.svg"), join(dir, f));
  return run("check.mjs", [dir, src]);
}
const fresh = (name) => { const dir = join(tmp, name); rmSync(dir, { recursive: true, force: true }); return dir; };
const frame = (dir, n) => join(dir, `frame-${String(n).padStart(3, "0")}.svg`);

test("VERIFY.md holds normalize, frames and check, each at most 120 lines", () => {
  assert.deepEqual(Object.keys(blocks).sort(), ["check.mjs", "frames.mjs", "normalize.mjs"]);
  for (const [name, code] of Object.entries(blocks)) assert.ok(code.split("\n").length - 1 <= 120, `${name}: ${code.split("\n").length - 1} lines`);
});

test("normalize: only absolute cubics, no transform, no shape but path", () => {
  for (const name of ["lobes", "bell", "scene"]) {
    const { svg } = normalize(name);
    assert.doesNotMatch(svg, /\stransform=/, name);
    assert.doesNotMatch(svg, /<(circle|ellipse|rect|line|polyline|polygon)\b/, name);
    for (const [, d] of svg.matchAll(/\sd="([^"]*)"/g)) assert.match(d, /^(M[-\d. ]+(C[-\d. ]+)+Z?)+$/, `${name}: ${d.slice(0, 40)}`);
  }
});

test("normalize: the inventory names bodies, necks, strokes and groups", () => {
  const lobes = normalize("lobes").inv;
  assert.equal(lobes.circles.length, 4);
  assert.deepEqual(lobes.circles.map((c) => c.r).sort(), [5, 8, 8, 8]);
  assert.equal(lobes.necks.length, 2);
  assert.ok(lobes.necks.every((n) => n.at.length === 2), "each neck has two sides");
  assert.deepEqual(normalize("bell").inv.strokes, [0, 1]);
  const scene = normalize("scene").inv;
  assert.deepEqual(scene.groups.map((g) => g.id), ["sun", "hill", "house", "tree"]);
  assert.equal(scene.paths.length, 8);
});

test("normalize round-trips every fixture to the same pixels", { skip }, () => {
  for (const name of ["lobes", "bell", "scene"]) {
    const r = roundTrip(name, normalize(name).src);
    assert.equal(r.status, 0, `${name}: ${r.stdout}`);
    assert.match(r.stdout, /^ok {2}2 frames$/m);
  }
});

test("normalize reads fill and stroke from a style attribute", { skip }, () => {
  const bell = readFileSync(join(FIX, "bell.svg"), "utf8").replace(/fill="none"\s+stroke="currentColor"/, 'style="fill:none;stroke:currentColor"');
  assert.match(bell, /style="fill:none;stroke:currentColor"/);
  const { src, inv } = normalize("bell-style", bell);
  assert.deepEqual(inv.strokes, [0, 1]);
  assert.equal(roundTrip("bell-style", src).status, 0);
});

test("normalize takes the canvas from width and height when there is no viewBox", { skip }, () => {
  const bell = readFileSync(join(FIX, "bell.svg"), "utf8").replace(/\sviewBox="[^"]*"/, "");
  const { src, inv, svg } = normalize("bell-bare", bell);
  assert.deepEqual(inv.viewBox, [0, 0, 24, 24]);
  assert.match(svg, /<svg\b[^>]*\sviewBox="0 0 24 24"/);
  assert.equal(roundTrip("bell-bare", src).status, 0);
});

test("normalize keeps gradients and clip paths working", { skip }, () => {
  const defs = '<defs><linearGradient id="glow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6d365" /><stop offset="1" stop-color="#f2b33d" /></linearGradient>' +
    '<clipPath id="card"><rect width="96" height="60" rx="6" /></clipPath></defs>';
  const scene = readFileSync(join(FIX, "scene.svg"), "utf8").replace(/(<svg[^>]*>)/, `$1${defs}`).replace('fill="#f2b33d">', 'fill="url(#glow)">').replace('<g id="hill"', '<g id="hill" clip-path="url(#card)"');
  const { src, svg } = normalize("scene-defs", scene);
  assert.match(svg, /url\(#glow\)/);
  assert.match(svg, /<clipPath id="card"><path /);
  assert.equal(roundTrip("scene-defs", src).status, 0);
});

test("normalize finds bodies and necks drawn as cubics", () => {
  normalize("lobes");
  const r = run("normalize.mjs", [join(tmp, "lobes", "source.svg"), join(tmp, "lobes-cubic")]);
  assert.equal(r.status, 0, r.stderr);
  const inv = JSON.parse(readFileSync(join(tmp, "lobes-cubic", "inventory.json"), "utf8"));
  assert.deepEqual(inv.circles.map((c) => +c.r.toFixed(1)).sort(), [5, 8, 8, 8]);
  assert.equal(inv.necks.length, 2);
});

test("normalize scales the stroke width with the transform it bakes", { skip }, () => {
  const bell = readFileSync(join(FIX, "bell.svg"), "utf8").replace(/(<svg[^>]*>)([\s\S]*)<\/svg>/, '$1<g transform="translate(6 6) scale(0.5)" stroke-width="3">$2</g></svg>');
  const { src } = normalize("bell-scaled", bell);
  const r = roundTrip("bell-scaled", src);
  assert.equal(r.status, 0, r.stdout);
});

test("normalize exits 2 on what a baked transform would move", () => {
  const scene = readFileSync(join(FIX, "scene.svg"), "utf8"), bell = readFileSync(join(FIX, "bell.svg"), "utf8");
  const defs = (s) => scene.replace(/(<svg[^>]*>)/, `$1<defs>${s}</defs>`);
  const cases = {
    clip: [defs('<clipPath id="card"><rect width="96" height="60" /></clipPath>').replace('<g id="hill"', '<g id="hill" transform="translate(0 2)" clip-path="url(#card)"'), /url\(#card\)/],
    paint: [defs('<linearGradient id="glow" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="60"><stop offset="0" stop-color="#fff" /><stop offset="1" stop-color="#000" /></linearGradient>')
      .replace("</svg>", '<rect transform="translate(4 0)" width="10" height="10" fill="url(#glow)" /></svg>'), /url\(#glow\)/],
    stretch: [bell.replace(/(<svg[^>]*>)([\s\S]*)<\/svg>/, '$1<g transform="scale(1 0.5)">$2</g></svg>'), /stroke/],
    text: [scene.replace("</svg>", '<g transform="translate(2 0)"><text x="4" y="10">Hi</text></g></svg>'), /<text>/],
  };
  for (const [name, [text, why]] of Object.entries(cases)) {
    writeFileSync(join(tmp, `refuse-${name}.svg`), text);
    const r = run("normalize.mjs", [join(tmp, `refuse-${name}.svg`), join(tmp, `refuse-${name}`)]);
    assert.equal(r.status, 2, name);
    assert.match(r.stderr, why, name);
  }
});

test("check accepts the three worked animations", { skip }, () => {
  for (const name of ["lobes", "bell", "scene"]) normalize(name);
  animations.drop(join(tmp, "lobes"), fresh("drop"));
  animations.ring(join(tmp, "bell"), fresh("ring"));
  animations.breathe(join(tmp, "scene"), fresh("breathe"));
  for (const [dir, src, ...flags] of [["drop", "lobes"], ["ring", "bell"], ["breathe", "scene", "--loop"]]) {
    const r = run("check.mjs", [join(tmp, dir), join(FIX, `${src}.svg`), ...flags]);
    assert.equal(r.status, 0, `${dir}: ${r.stdout}`);
  }
});

test("check rejects a flick, a last frame off by one unit, and a sliver", { skip }, () => {
  for (const name of ["lobes", "bell", "scene"]) normalize(name);
  animations.drop(join(tmp, "lobes"), fresh("flick"), { flick: true });
  animations.ring(join(tmp, "bell"), fresh("off"), { off: true });
  animations.breathe(join(tmp, "scene"), fresh("sliver"), { sliver: true });
  const flick = run("check.mjs", [join(tmp, "flick"), join(FIX, "lobes.svg")]);
  assert.equal(flick.status, 1);
  assert.match(flick.stdout, /^flick {2}frame-083 → frame-084 {2}moves /m);
  const off = run("check.mjs", [join(tmp, "off"), join(FIX, "bell.svg")]);
  assert.equal(off.status, 1);
  assert.match(off.stdout, /^last {2}frame-090 {2}\d+ px differ from the source → 0$/m);
  const sliver = run("check.mjs", [join(tmp, "sliver"), join(FIX, "scene.svg"), "--loop"]);
  assert.equal(sliver.status, 1);
  assert.match(sliver.stdout, /^sliver {2}frame-0\d\d {2}shapes 3\/7 /m);
});

test("check rejects a transform left in a frame, a change of structure, and a loop that does not close", { skip }, () => {
  normalize("lobes");
  normalize("scene");
  const drop = fresh("planted-flat");
  animations.drop(join(tmp, "lobes"), drop);
  writeFileSync(frame(drop, 40), readFileSync(frame(drop, 40), "utf8").replace("<path ", '<path transform="translate(0 1)" '));
  writeFileSync(frame(drop, 20), readFileSync(join(FIX, "lobes.svg"), "utf8"));
  const r = run("check.mjs", [drop, join(FIX, "lobes.svg")]);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /^flat {2}frame-040 {2}transform="translate\(0 1\)"/m);
  assert.match(r.stdout, /^swap {2}frame-01\d → frame-0[12]\d/m);
  const loop = fresh("planted-loop");
  animations.breathe(join(tmp, "scene"), loop);
  writeFileSync(frame(loop, 0), readFileSync(frame(loop, 24), "utf8"));
  const l = run("check.mjs", [loop, join(FIX, "scene.svg"), "--loop"]);
  assert.equal(l.status, 1);
  assert.match(l.stdout, /^loop {2}frame-000 {2}\d+ px differ from the last frame → 0$/m);
});

test("check finds a sliver between shapes painted by class", { skip }, () => {
  const svg = (x) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 12" width="22" height="12"><style>.a{fill:#c33}.b{fill:#36c}</style>` +
    `<path class="a" d="M1 1H11V11H1Z"/><path class="b" d="M${x} 1H${x + 10}V11H${x}Z"/></svg>`;
  const dir = fresh("classes");
  mkdirSync(dir);
  writeFileSync(join(tmp, "classes.svg"), svg(11));
  writeFileSync(frame(dir, 0), svg(11.3));
  writeFileSync(frame(dir, 1), svg(11));
  const r = run("check.mjs", [dir, join(tmp, "classes.svg")]);
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stdout, /^sliver {2}frame-000 /m);
});

test("check measures a drawing that covers its whole canvas", { skip }, () => {
  const full = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 10" width="20" height="10"><path fill="#c33" d="M0 0H20V10H0Z"/></svg>';
  const dir = fresh("full-bleed");
  mkdirSync(dir);
  writeFileSync(join(tmp, "full-bleed.svg"), full);
  for (const n of [0, 1]) writeFileSync(frame(dir, n), full);
  const r = run("check.mjs", [dir, join(tmp, "full-bleed.svg")]);
  assert.equal(r.status, 0, r.stdout);
});

test("check weighs an edge pixel's colour by how much of it shows", { skip }, () => {
  // coordinates at five decimals, as design tools export them: normalize rounds them to three, which moves no visible pixel
  const fine = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20"><path fill="#0c8c5e" d="M4.9434 9.50941C4.95221 7.76347 5.64849 6.08807 6.87361 4.83594L2.14058 9.57113C0.933084 10.7615 0.23681 12.2959 0.122231 13.9183C0.0164654 15.435 0.413078 16.934 1.2592 18.1862L4.58202 15.338C5.48985 14.4298 5.7719 13.0806 5.34002 11.8726C5.06679 11.1231 4.93459 10.3207 4.9434 9.50941Z"/><path fill="#18e299" d="M18.4725 9.60528V3.91396C18.4725 3.30323 17.977 2.81641 17.3754 2.81641H11.6867C10.7931 2.81641 9.90842 2.99342 9.08564 3.32977C8.26285 3.67497 7.51085 4.17064 6.88271 4.80793C9.71378 8.12713 13.7392 14.8629 13.3942 16.1817C15.5883 15.2878 18.4636 10.4993 18.4636 9.60528H18.4725Z"/></svg>';
  const dir = fresh("fine");
  writeFileSync(join(tmp, "fine.svg"), fine);
  assert.equal(run("normalize.mjs", [join(tmp, "fine.svg"), join(tmp, "fine-norm")]).status, 0);
  mkdirSync(dir);
  for (const n of [0, 1]) cpSync(join(tmp, "fine-norm", "source.svg"), frame(dir, n));
  const r = run("check.mjs", [dir, join(tmp, "fine.svg")]);
  assert.equal(r.status, 0, r.stdout);
});

test("check accepts a transform the source has itself", { skip }, () => {
  const text = readFileSync(join(FIX, "bell.svg"), "utf8").replace("</svg>", '<text transform="matrix(1 0 0 1 2 22)" font-size="4">Hi</text></svg>');
  const dir = fresh("own-transform");
  mkdirSync(dir);
  writeFileSync(join(tmp, "own-transform.svg"), text);
  for (const n of [0, 1]) writeFileSync(frame(dir, n), text);
  const r = run("check.mjs", [dir, join(tmp, "own-transform.svg")]);
  assert.equal(r.status, 0, r.stdout);
});

test("check exits 2 with a reason when it cannot measure", () => {
  const one = fresh("one");
  mkdirSync(one);
  writeFileSync(frame(one, 0), readFileSync(join(FIX, "bell.svg"), "utf8"));
  const r = run("check.mjs", [one, join(FIX, "bell.svg")]);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /needs frame-000\.svg and at least one more frame/);
  writeFileSync(frame(one, 1), readFileSync(join(FIX, "bell.svg"), "utf8"));
  const none = run("check.mjs", [one, join(FIX, "bell.svg")], { SVG_RASTER: "nothing" });
  assert.equal(none.status, 2);
  assert.match(none.stdout, /^not measured {2}nothing {2}SVG_RASTER is nothing/m);
  assert.equal(run("check.mjs", []).status, 2);
});

test("frames writes a contact sheet and a zoom of the critical frames", { skip }, () => {
  normalize("lobes");
  const drop = fresh("sheet");
  animations.drop(join(tmp, "lobes"), drop);
  const r = run("frames.mjs", [drop]);
  assert.equal(r.status, 0, r.stderr);
  for (const png of ["sheet.png", "zoom.png"]) assert.deepEqual([...readFileSync(join(drop, png)).subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], png);
  const sheet = readFileSync(join(drop, "sheet.svg"), "utf8"), zoom = readFileSync(join(drop, "zoom.svg"), "utf8");
  assert.equal(sheet.match(/<svg x=/g).length, 32);
  assert.equal(zoom.match(/<svg x=/g).length, 6);
  assert.match(zoom, /viewBox="4 6 66 38"/);
  assert.match(zoom, />017</);
});

test("frames keeps the paint the root svg carries in its style", { skip }, () => {
  const bell = readFileSync(join(FIX, "bell.svg"), "utf8").replace(/fill="none"\s+stroke="currentColor"/, 'style="fill:none;stroke:#000"');
  const dir = fresh("root-style");
  mkdirSync(dir);
  for (const n of [0, 1]) writeFileSync(frame(dir, n), bell);
  const r = run("frames.mjs", [dir]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(readFileSync(join(dir, "sheet.svg"), "utf8"), /<svg x=[^>]*\sstyle="fill:none;stroke:#000"/);
});
