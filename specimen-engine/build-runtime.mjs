// Bundles src/ into the skill's runtime. Maintainer only: run after `npm install` here, never during a render.
// Also writes THIRD_PARTY_NOTICES.md beside it, from the packages esbuild actually bundled.
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const runtime = join(here, "..", "skills", "specimen", "runtime");
const out = join(runtime, "specimen.js");
const meta = join(tmpdir(), `specimen-meta-${process.pid}.json`);
execFileSync(join(here, "node_modules", ".bin", "esbuild"), [
  "src/index.js", "--bundle", "--format=esm", "--minify", "--target=es2022", "--legal-comments=none",
  `--outfile=${out}`, `--metafile=${meta}`,
], { cwd: here, stdio: "inherit" });

const bundled = new Set();
for (const input of Object.keys(JSON.parse(readFileSync(meta, "utf8")).inputs)) {
  const m = input.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
  if (m) bundled.add(m[1]);
}
rmSync(meta, { force: true });

const sections = [...bundled].sort().map((name) => {
  const dir = join(here, "node_modules", name);
  const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  const file = readdirSync(dir).find((f) => /^licen[cs]e/i.test(f));
  if (!file) throw new Error(`${name} ships no LICENSE file`);
  return `## ${name} ${pkg.version} (${pkg.license})\n\n\`\`\`\n${readFileSync(join(dir, file), "utf8").trim()}\n\`\`\``;
});
sections.push(`## Open Image Denoise weights: rt_hdr_alb_nrm (Apache-2.0)

\`weights.tza\` is the \`rt_hdr_alb_nrm\` model from Intel Open Image Denoise
(https://github.com/RenderKit/oidn-weights), Copyright 2018 Intel Corporation,
licensed under the Apache License, Version 2.0: https://www.apache.org/licenses/LICENSE-2.0`);

writeFileSync(join(runtime, "THIRD_PARTY_NOTICES.md"),
  `# Third-party notices\n\n\`specimen.js\` bundles the packages below, and \`weights.tza\` is a model file shipped as is.\n\n${sections.join("\n\n")}\n`);
console.log(`runtime → ${out} (${(statSync(out).size / 1e6).toFixed(2)} MB), notices for ${bundled.size} packages + weights`);
