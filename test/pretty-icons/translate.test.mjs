import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, cpSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { translate, translateSet, pieces, TranslateError } from "../../skills/pretty-icons/translate.mjs";
import { checkSet, formatFailure } from "../../skills/pretty-icons/check.mjs";
import { parse } from "../../skills/pretty-icons/svg.mjs";

const fix = (name) => new URL(`./fixtures/${name}`, import.meta.url).pathname;
const SKILL = new URL("../../skills/pretty-icons/", import.meta.url).pathname;
const tmp = (t) => { const dir = mkdtempSync(join(tmpdir(), "pi-")); t.after(() => rmSync(dir, { recursive: true, force: true })); return dir; };
const SRC = fix("translate-bulk");

for (const to of ["duotone", "filled"]) {
  test(`${to}: the bulk fixtures translate to the approved files, byte for byte, every run`, () => {
    const golden = fix(`translate-${to}`);
    const once = translateSet(SRC, to), twice = translateSet(SRC, to);
    assert.deepEqual(once.map((s) => s.name), readdirSync(golden).map((f) => f.replace(/\.svg$/, "")).sort());
    for (const s of once) assert.equal(s.text, readFileSync(join(golden, `${s.name}.svg`), "utf8"), s.name);
    assert.deepEqual(twice, once);
  });

  test(`${to}: check --from passes the untouched translation, with what the drawing carries as one note`, async () => {
    const r = await checkSet(fix(`translate-${to}`), { from: SRC });
    assert.deepEqual(r.failures.map(formatFailure), []);
    assert.equal(r.measured, true);
    assert.equal(r.notes.length, 1);
    assert.match(formatFailure(r.notes[0]), /^inherited  set  .* → the drawing's, judged at bulk: node check\.mjs /);
  });
}

test("check --from fails an icon edited by hand, and names the command that remakes it", async (t) => {
  const dir = tmp(t);
  cpSync(fix("translate-duotone"), dir, { recursive: true });
  const file = join(dir, "doc.svg");
  writeFileSync(file, readFileSync(file, "utf8").replace('fill-opacity=".2"', 'fill-opacity=".25"'));
  const r = await checkSet(dir, { from: SRC });
  assert.deepEqual(r.failures.map(formatFailure), [`translate  doc  not its bulk source's translation → node translate.mjs ${SRC} --to duotone --out ${dir}: change the drawing at bulk, never here`]);
});

test("check --from fails an icon with no bulk namesake, and still holds the stroke rules", async (t) => {
  const dir = tmp(t);
  cpSync(fix("translate-duotone"), dir, { recursive: true });
  writeFileSync(join(dir, "extra.svg"), readFileSync(join(dir, "doc.svg"), "utf8").replace('stroke-width="1.5"', 'stroke-width="2"'));
  const lines = (await checkSet(dir, { from: SRC })).failures.map(formatFailure);
  assert.ok(lines.includes(`translate  extra  no bulk source → extra.svg in ${SRC}`), lines.join("\n"));
  assert.ok(lines.some((l) => l.startsWith("stroke  extra  stroke-width 2")), lines.join("\n"));
});

test("the CLI: translate writes the folder; check --from prints ok, and refuses a --from that is not a folder", (t) => {
  const dir = tmp(t), out = join(dir, "duo");
  const tr = spawnSync(process.execPath, [join(SKILL, "translate.mjs"), SRC, "--to", "duotone", "--out", out], { encoding: "utf8" });
  assert.equal(tr.status, 0, tr.stderr);
  assert.match(tr.stdout, /^4 icons → /);
  const ok = spawnSync(process.execPath, [join(SKILL, "check.mjs"), out, `--from=${SRC}`], { encoding: "utf8" });
  assert.equal(ok.status, 0, ok.stdout);
  assert.match(ok.stdout, /\nok\n$/);
  const bad = spawnSync(process.execPath, [join(SKILL, "check.mjs"), out, `--from=${join(dir, "nowhere")}`], { encoding: "utf8" });
  assert.equal(bad.status, 1);
  assert.match(bad.stdout, /^set  .*nowhere  not a folder/);
  const usage = spawnSync(process.execPath, [join(SKILL, "translate.mjs"), SRC, "--to", "flat", "--out", out], { encoding: "utf8" });
  assert.equal(usage.status, 1);
  assert.match(usage.stderr, /--to flat: one of duotone, filled/);
});

test("a source in knockout.mjs's cuts reads the same way: the front is what cut it, and the contour opens there", () => {
  const text = readFileSync(join(SKILL, "examples/bulk/devices.svg"), "utf8");
  const [body, phone] = pieces(text, "devices");
  assert.equal(body.kind, "body");
  assert.match(body.d, /^M 6 4 H 18/, "the uncut geometry, from data-body");
  assert.equal(body.front, phone.d);
  const els = parse(translate(text, "duotone")).elements;
  assert.equal(els[0].attrs.stroke, "none", "the tint stops short of the front");
  assert.doesNotMatch(els[1].attrs.d, /Z$/, "the contour is open where the front lies");
});

test("a file that is not bulk is refused", () => {
  const duo = readFileSync(join(fix("translate-duotone"), "doc.svg"), "utf8");
  assert.throws(() => translate(duo, "filled", { name: "doc" }), (e) => e instanceof TranslateError && /doc: not a bulk icon/.test(e.message));
  assert.throws(() => translate(readFileSync(join(SRC, "doc.svg"), "utf8"), "bulk"), TranslateError);
});
