import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CHROME, open } from "./harness.mjs";
import { FFMPEG, psnr } from "./psnr.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const EXAMPLES = join(here, "..", "..", "skills", "specimen", "examples");
const skip = (!CHROME && "Chrome not found") || (!FFMPEG && "ffmpeg not found");

// The examples on the piece API, rendered dark in raster, against frames of ~/3d-icon-lab (v1).
// The proof the API lost nothing. Chip is checked by eye: its die was tinted black in the lab, glass here.
for (const name of ["rocket", "bolt", "bell", "lock"]) test(`${name} matches the lab in dark`, { skip }, async () => {
  const dir = mkdtempSync(join(realpathSync(tmpdir()), "specimen-parity-"));
  const s = await open(join(EXAMPLES, `${name}.specimen.js`), { size: 512 });
  try {
    for (const f of [0, 60, 120]) {
      const out = join(dir, `${f}.png`);
      writeFileSync(out, Buffer.from((await s.page.evaluate(`__specimen.frame(${f}, 1)`)).split(",")[1], "base64"));
      const db = await psnr(out, join(here, "baselines", `${name}-dark-${String(f).padStart(4, "0")}.png`));
      assert.ok(db >= 38, `${name} frame ${f}: ${db.toFixed(1)} dB`);
    }
  } finally { await s.close(); rmSync(dir, { recursive: true, force: true }); }
});
