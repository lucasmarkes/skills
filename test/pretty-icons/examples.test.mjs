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

import { BULK_REFERENCE_INK } from "../../skills/pretty-icons/presets.mjs";
import { knockout } from "../../skills/pretty-icons/knockout.mjs";
import { referenceSet } from "../../skills/pretty-icons/proof.mjs";

const bulk = new URL("../../skills/pretty-icons/examples/bulk/", import.meta.url).pathname;
const names = ["all", "coding", "connectivity", "data", "devices", "empty", "interfaces", "machines", "marks", "security"];

test("examples/bulk: the ten names of hairline, every rule passes, the finish read from the files", async () => {
  assert.deepEqual(readdirSync(bulk).filter((f) => f.endsWith(".svg")).map((f) => f.slice(0, -4)).sort(), names);
  const r = await checkSet(bulk);
  assert.equal(r.finish, "bulk");
  assert.equal(r.measured, true);
  assert.deepEqual(r.failures.map((f) => `${f.rule} ${f.icon} ${f.got}`), []);
  assert.equal(referenceSet(24, "bulk").length, 3);
});

test("examples/bulk: every cut was written by knockout.mjs: a re-run changes no file", () => {
  for (const n of names) {
    const text = readFileSync(`${bulk}${n}.svg`, "utf8");
    assert.equal(knockout(text, { name: n }).text, text, `${n} is as knockout.mjs leaves it`);
  }
});

test("examples/bulk: the reference ink is the median of the examples without a modifier, within 0.5; every share sits in the band", async () => {
  const plain = names.filter((n) => !/data-modifier=/.test(readFileSync(`${bulk}${n}.svg`, "utf8")));
  assert.ok(plain.length >= 7, "at most three carry a modifier");
  const r = await checkSet(bulk);
  const inks = r.rows.filter((x) => plain.includes(x.icon)).map((x) => x.ink).sort((a, b) => a - b), m = inks.length >> 1;
  const median = inks.length % 2 ? inks[m] : (inks[m - 1] + inks[m]) / 2;
  assert.ok(Math.abs(BULK_REFERENCE_INK[24] - median) <= 0.5, `stored ${BULK_REFERENCE_INK[24]}, measured ${median}`);
  for (const x of r.rows) assert.ok(x["share%"] >= 25 && x["share%"] <= 60, `${x.icon} share ${x["share%"]}`);
});

test("examples/hairline and examples/garage still pass: the duotone and filled paths are untouched", async () => {
  for (const f of ["hairline", "garage"]) {
    const r = await checkSet(new URL(`../../skills/pretty-icons/examples/${f}/`, import.meta.url).pathname);
    assert.deepEqual(r.failures.map((x) => `${x.rule} ${x.icon}`), [], f);
  }
});

test("examples/bulk: every file ends with exactly one newline", () => {
  const dir = new URL("../../skills/pretty-icons/examples/bulk/", import.meta.url).pathname;
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".svg"))) {
    const t = readFileSync(dir + f, "utf8");
    assert.ok(t.endsWith("</svg>\n"), `${f} ends </svg> and a newline`);
  }
});
