import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sheet } from "../../skills/specimen/sheet.mjs";
import { CHROME, FIXTURES } from "./harness.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const EXAMPLES = join(here, "..", "..", "skills", "specimen", "examples");
// width and height from the PNG's IHDR chunk
const size = (png) => { const b = readFileSync(png); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };

test("sheet of two pieces has 4 rows", { skip: !CHROME && "Chrome not found" }, async () => {
  const dir = mkdtempSync(join(realpathSync(tmpdir()), "specimen-sheet-"));
  try {
    const out = await sheet({ pieces: [join(FIXTURES, "cube.specimen.js"), join(EXAMPLES, "bolt.specimen.js")], out: join(dir, "s.png"), log: () => {} });
    assert.equal(out, join(dir, "s.png"));
    assert.deepEqual(size(out), [4 * 256, 4 * 256]);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
