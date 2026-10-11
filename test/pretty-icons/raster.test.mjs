import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { air, cacheDir, elongation, measure, render, shares } from "../../skills/pretty-icons/raster.mjs";

const near = (a, b, eps = 0.05) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);
const ROOT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">`;
const ROOT48 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">`;

test("shares: a body in the fill tone is dark only on its contour; a square in the line tone is dark all over", async () => {
  const body = await shares(`${ROOT48}<rect x="8" y="8" width="32" height="32" rx="6" fill="#ececea" stroke="none" /><rect x="8" y="8" width="32" height="32" rx="6" stroke-width="2" /></svg>`, 48);
  assert.ok(body.paint > 0);
  near(body.dark / body.paint, 0.21, 0.03);
  const solid = await shares(`${ROOT48}<rect x="8" y="8" width="32" height="32" fill="#25262a" stroke="none" /></svg>`, 48);
  assert.ok(solid.paint > 0);
  assert.equal(solid.dark, solid.paint);
});

test("shares: a mark is paint, never dark; an empty icon is nothing", async () => {
  const mark = await shares(`${ROOT48}<path d="M8 24H40" stroke="#8b8c90" /></svg>`, 48);
  assert.ok(mark.paint > 0);
  assert.equal(mark.dark, 0);
  assert.deepEqual(await shares(`${ROOT48}</svg>`, 48), { paint: 0, dark: 0 });
});

test("cacheDir by platform, architecture and env", () => {
  assert.equal(cacheDir({}, "darwin", "/Users/x", "arm64"), "/Users/x/Library/Caches/pretty-icons/darwin-arm64");
  assert.equal(cacheDir({}, "darwin", "/Users/x", "x64"), "/Users/x/Library/Caches/pretty-icons/darwin-x64");
  assert.equal(cacheDir({ XDG_CACHE_HOME: "/xdg" }, "linux", "/home/x", "x64"), "/xdg/pretty-icons/linux-x64");
  assert.equal(cacheDir({}, "linux", "/home/x", "arm64"), "/home/x/.cache/pretty-icons/linux-arm64");
  assert.equal(cacheDir({ LOCALAPPDATA: "C:\\Users\\x\\AppData\\Local" }, "win32", "C:\\Users\\x", "x64").replace(/\\/g, "/"), "C:/Users/x/AppData/Local/pretty-icons/win32-x64");
  assert.equal(cacheDir({ PRETTY_ICONS_CACHE: "/else" }, "darwin", "/Users/x", "arm64"), "/else/darwin-arm64");
});

test("a centred stroked square measures its ink box", async () => {
  // rect 2.25..13.75 with stroke 1: ink 1.75..14.25, 12.5 wide, centred
  const m = await measure(`${ROOT}<rect x="2.25" y="2.25" width="11.5" height="11.5" rx="1.5" fill="currentColor" fill-opacity=".2" /></svg>`, 16);
  near(m.box.x0, 1.75); near(m.box.x1, 14.25); near(m.box.y0, 1.75); near(m.box.y1, 14.25); near(m.box.w, 12.5); near(m.box.h, 12.5);
  near(m.mass.dx, 0); near(m.mass.dy, 0);
  assert.ok(m.ink > 50 && m.ink < 100, `ink ${m.ink}`);
});

test("a square in the top-left has its mass off centre", async () => {
  const m = await measure(`${ROOT}<rect x="2" y="2" width="4" height="4" rx="1" /></svg>`, 16);
  assert.ok(m.mass.dx < -3 && m.mass.dy < -3, JSON.stringify(m.mass));
});

test("currentColor renders as ink", () => {
  const r = render(`${ROOT}<path d="M2 8h12" /></svg>`, 160);
  assert.equal(r.width, 160);
  let inked = 0;
  for (let i = 3; i < r.pixels.length; i += 4) if (r.pixels[i] > 12) inked++;
  assert.ok(inked > 100, `${inked} inked pixels`);
});

test("the cache dir can be moved for a test", () => {
  const dir = join(tmpdir(), "pi-cache");
  assert.equal(cacheDir({ PRETTY_ICONS_CACHE: dir }), join(dir, `${process.platform}-${process.arch}`));
});

test("currentcolor in any case is ink", async () => {
  const camel = await measure(`${ROOT}<path d="M2 8h12" /></svg>`, 16);
  const lower = await measure(`${ROOT.replace('stroke="currentColor"', 'stroke="currentcolor"')}<path d="M2 8h12" /></svg>`, 16);
  assert.ok(camel.ink > 10, `ink ${camel.ink}`);
  near(lower.ink, camel.ink);
});

test("a non-square viewBox measures finite numbers", async () => {
  const m = await measure(`${ROOT.replace('viewBox="0 0 16 16"', 'viewBox="0 0 16 12"')}<path d="M2 6h12" /></svg>`, 16);
  for (const v of [...Object.values(m.box), m.mass.dx, m.mass.dy, m.ink]) assert.ok(Number.isFinite(v), JSON.stringify(m));
  near(m.box.x0, 1.5); near(m.box.x1, 14.5); near(m.box.h, 1);
  near(m.mass.dx, 0); near(m.mass.dy, 0);
});

test("a cache whose binary is missing is `not measured`, exit 2, with the folder to delete", (t) => {
  const root = mkdtempSync(join(tmpdir(), "pi-cache-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  // the package resolves, its platform binary does not: an interrupted install, or a cache from another machine
  const pkg = join(root, `${process.platform}-${process.arch}`, "node_modules", "@resvg", "resvg-js");
  mkdirSync(pkg, { recursive: true });
  writeFileSync(join(pkg, "package.json"), JSON.stringify({ name: "@resvg/resvg-js", version: "2.6.2", main: "index.js" }));
  writeFileSync(join(pkg, "index.js"), "throw new Error(\"Cannot find module '@resvg/resvg-js-binary'\\nRequire stack: x\");");
  const check = new URL("../../skills/pretty-icons/check.mjs", import.meta.url).pathname;
  const fix = new URL("./fixtures/good-16/", import.meta.url).pathname;
  const r = spawnSync(process.execPath, [check, fix], { encoding: "utf8", env: { ...process.env, PRETTY_ICONS_CACHE: root } });
  assert.equal(r.status, 2, r.stdout + r.stderr);
  const last = r.stdout.trim().split("\n").at(-1);
  assert.match(last, /^not measured: could not load @resvg\/resvg-js from .*: Cannot find module '@resvg\/resvg-js-binary'; delete that folder to reinstall$/);
  assert.doesNotMatch(r.stdout + r.stderr, /\n\s+at /, "no stack");
});

const one = (b) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">${b}</svg>`;

test("air: paper under 1.5 strokes between two lines is one region, at its centre", async () => {
  const r = await air(one('<path d="M3 7H13" /><path d="M3 9H13" />'), 16, 1);
  assert.equal(r.length, 1);
  assert.equal(r[0].kind, "paper");
  assert.ok(r[0].across < 1.5, `across ${r[0].across}`);
  assert.deepEqual(r[0].at, [8, 8]);
  assert.deepEqual(await air(one('<path d="M3 6.5H13" /><path d="M3 9.5H13" />'), 16, 1), []);
});

test("air: a counter under 2 strokes is reported, a speck is not, 2 and over passes", async () => {
  const counter = await air(one('<circle cx="8" cy="8" r="1.25" />'), 16, 1);
  assert.deepEqual(counter.map((x) => x.kind), ["counter"]);
  assert.ok(counter[0].across < 2 - 0.25);
  assert.deepEqual(await air(one('<circle cx="8" cy="8" r="1" />'), 16, 1), []);
  assert.deepEqual(await air(one('<circle cx="8" cy="8" r="1.75" />'), 16, 1), []);
});

test("air: a filled body, a V and a T leave no narrow paper", async () => {
  assert.deepEqual(await air(one('<rect x="2" y="2" width="12" height="12" rx="1.5" fill="currentColor" />'), 16, 1), []);
  assert.deepEqual(await air(one('<path d="M3 3L8 13L13 3" />'), 16, 1), []);
  assert.deepEqual(await air(one('<path d="M3 3H13M8 3V13" />'), 16, 1), []);
});

test("air: a speck of paper pinched where three strokes meet (a small triangle's inside) is not reported", async () => {
  const speck = await air(one('<path d="M6 6H9L7.5 8.5Z" />'), 16, 1);
  assert.deepEqual(speck, []);
  // a little larger, the same pocket is a counter of area >= 1: the speck test is the area, not the shape
  const pocket = await air(one('<path d="M6 6H9.5L7.75 9Z" />'), 16, 1);
  assert.deepEqual(pocket.map((x) => x.kind), ["counter"]);
  assert.ok(pocket[0].area >= 1);
});

test("elongation: a 45° line is long and at 45°; the other way is −45; a disc is round", async () => {
  const up = await elongation(one('<path d="M3 13L13 3" />'), 16);
  assert.ok(up.ratio > 2 && Math.abs(up.angle - 45) <= 1, JSON.stringify(up));
  const down = await elongation(one('<path d="M3 3L13 13" />'), 16);
  assert.ok(Math.abs(down.angle + 45) <= 1, JSON.stringify(down));
  assert.ok((await elongation(one('<circle cx="8" cy="8" r="6" />'), 16)).ratio < 1.1);
  assert.deepEqual(await elongation(one(""), 16), { ratio: 1, angle: 0 });
});
