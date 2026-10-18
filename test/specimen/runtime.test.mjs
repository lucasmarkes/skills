import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { CHROME, FIXTURES, open, pixel } from "./harness.mjs";

const skip = !CHROME && "Chrome not found";
const fx = (name) => join(FIXTURES, `${name}.specimen.js`);

/** Runs fn(page) with `name` open, then closes it. */
async function withPiece(name, opts, fn) {
  const s = await open(fx(name), opts);
  try { return await fn(s.page); } finally { await s.close(); }
}

test("a minimal piece renders in both themes", { skip }, async () => {
  const shots = {};
  for (const theme of ["dark", "light"]) await withPiece("cube", { theme }, async (page) => {
    assert.deepEqual(await page.evaluate("__specimen.ready"), { name: "cube", duration: 4, frames: 120 });
    shots[theme] = await page.evaluate("__specimen.frame(0, 1)");
    assert.match(shots[theme], /^data:image\/png;base64,/);
  });
  assert.notEqual(shots.dark, shots.light);
});

test("the page colour is exact outside the tile", { skip }, async () => {
  for (const [theme, rgb] of [["dark", [0, 0, 0, 255]], ["light", [255, 255, 255, 255]]])
    await withPiece("cube", { theme }, async (page) => assert.deepEqual(await page.evaluate(pixel(0, 2, 2)), rgb, theme));
});

test("every material role exists in both themes", { skip }, async () => {
  const roles = {};
  for (const theme of ["dark", "light"]) await withPiece("roles", { theme }, async (page) => {
    await page.evaluate("__specimen.ready");
    roles[theme] = await page.evaluate("__roles");
  });
  for (const theme of ["dark", "light"])
    assert.deepEqual(Object.keys(roles[theme]).sort(), ["body", "chrome", "glass", "glow", "inlay", "light"]);
  assert.equal(roles.dark.body, "0b0b0c");
  assert.equal(roles.light.body, "f2f1ef");
  assert.equal(roles.dark.chrome, "b8b8b8");
  assert.equal(roles.light.chrome, "c8c8c8");
});

test("a second dynamic texture throws", { skip }, async () => {
  await withPiece("two-textures", {}, (page) => assert.rejects(page.evaluate("__specimen.ready"),
    /ctx\.texture\(\) can be called once per object: the path tracer holds one dynamic texture per object/));
});

test("a throwing piece fails fast with its own message", { skip }, async () => {
  const t0 = Date.now();
  await withPiece("throws", {}, (page) => assert.rejects(page.evaluate("__specimen.ready"), /bad fin \(throws\.specimen\.js:5\)/));
  assert.ok(Date.now() - t0 < 5000);
});

test("a piece with a syntax error fails fast", { skip }, async () => {
  const t0 = Date.now();
  await withPiece("syntax", {}, (page) => assert.rejects(page.evaluate("__specimen.ready"), /syntax\.specimen\.js/));
  assert.ok(Date.now() - t0 < 5000);
});

test("no WebGPU is named", { skip }, async () => {
  await withPiece("cube", { inject: "delete Navigator.prototype.gpu" }, (page) =>
    assert.rejects(page.evaluate("__specimen.ready"), /WebGPU is not available in this Chrome \(navigator\.gpu missing\)/));
});
