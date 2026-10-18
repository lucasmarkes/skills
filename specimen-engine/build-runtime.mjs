// Bundles src/ into the skill's runtime. Maintainer only: run after `npm install` here, never during a render.
import { execFileSync } from "node:child_process";
import { statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "skills", "specimen", "runtime", "specimen.js");
execFileSync(join(here, "node_modules", ".bin", "esbuild"), [
  "src/index.js", "--bundle", "--format=esm", "--minify", "--target=es2022", "--legal-comments=none", `--outfile=${out}`,
], { cwd: here, stdio: "inherit" });
console.log(`runtime → ${out} (${(statSync(out).size / 1e6).toFixed(2)} MB)`);
