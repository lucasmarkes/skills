import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { checkSet } from "../../skills/pretty-icons/check.mjs";
import { REFERENCE_INK } from "../../skills/pretty-icons/presets.mjs";

const examples = new URL("../../skills/pretty-icons/examples/hairline/", import.meta.url).pathname;
const lucide = new URL("./fixtures/lucide/", import.meta.url).pathname;

test("examples/hairline: ten icons, every rule passes", async () => {
  assert.equal(readdirSync(examples).filter((f) => f.endsWith(".svg")).length, 10);
  const r = await checkSet(examples);
  assert.equal(r.measured, true);
  assert.deepEqual(r.failures.map((f) => `${f.rule} ${f.icon}`), []);
});

test("the reference ink is the median of the examples without a modifier, within 0.5", async () => {
  const plain = readdirSync(examples).filter((f) => f.endsWith(".svg") && !/data-modifier=/.test(readFileSync(examples + f, "utf8"))).map((f) => f.slice(0, -4));
  assert.ok(plain.length <= 7, `at least three examples carry a modifier; ${10 - plain.length} do`);
  const r = await checkSet(examples);
  const inks = r.rows.filter((x) => plain.includes(x.icon)).map((x) => x.ink).sort((a, b) => a - b), m = inks.length >> 1;
  const median = inks.length % 2 ? inks[m] : (inks[m - 1] + inks[m]) / 2;
  assert.ok(Math.abs(REFERENCE_INK[16] - median) <= 0.5, `stored ${REFERENCE_INK[16]}, measured ${median}`);
});

test("lucide at 24 passes live and gravity", async () => {
  assert.equal(readdirSync(lucide).filter((f) => f.endsWith(".svg")).length, 10);
  const r = await checkSet(lucide, { grid: 24 });
  assert.equal(r.measured, true);
  const own = r.failures.filter((f) => ["live", "gravity"].includes(f.rule));
  assert.deepEqual(own.map((f) => `${f.rule} ${f.icon} ${f.got}`), []);
});
