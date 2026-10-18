import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { validate } from "../../skills/specimen/validate.mjs";
import { CHROME, FIXTURES } from "./harness.mjs";

const EXAMPLES = join(FIXTURES, "..", "..", "..", "skills", "specimen", "examples");
const noChrome = !CHROME && "Chrome not found";
const rules = (r) => [...new Set(r.failures.map((f) => f.rule))];

for (const [fixture, rule, needsChrome] of [
  ["bad-contract", "contract", false],
  ["bad-duration", "contract", false],
  ["bad-material", "materials", false],
  ["bad-seam", "seam", true],
  ["bad-fit", "fit", true],
  ["bad-light", "light-in-tile", true],
  ["bad-textures", "one-texture", true],
]) {
  test(`${fixture} fails ${rule}, and only ${rule}`, { skip: needsChrome && noChrome }, async () => {
    const r = await validate(join(FIXTURES, `${fixture}.specimen.js`));
    assert.equal(r.ok, false);
    assert.deepEqual(rules(r), [rule]);
    for (const f of r.failures) assert.ok(f.message.length > 0 && f.value !== undefined, JSON.stringify(f));
  });
}

for (const name of ["rocket", "bolt", "bell", "lock", "chip"]) {
  test(`the ${name} example passes`, { skip: noChrome }, async () => {
    const r = await validate(join(EXAMPLES, `${name}.specimen.js`));
    assert.deepEqual(r.failures, []);
    assert.equal(r.ok, true);
  });
}
