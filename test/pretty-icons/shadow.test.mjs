import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { shadowOn, shadowOff, shadowFailures, shadowFolder, ShadowError, USAGE } from "../../skills/pretty-icons/shadow.mjs";
import { checkSet, textChecks, formatFailure } from "../../skills/pretty-icons/check.mjs";
import { addModifier, ModifierError } from "../../skills/pretty-icons/modifiers.mjs";
import { emit } from "../../skills/pretty-icons/emit.mjs";
import { parse } from "../../skills/pretty-icons/svg.mjs";

const GARAGE = new URL("../../skills/pretty-icons/examples/garage/", import.meta.url).pathname;
const GOOD16 = new URL("./fixtures/good-16/", import.meta.url).pathname;
const CLI = new URL("../../skills/pretty-icons/shadow.mjs", import.meta.url).pathname;
const ex = (name) => readFileSync(join(GARAGE, `${name}.svg`), "utf8");
const NAMES = readdirSync(GARAGE).filter((f) => f.endsWith(".svg")).map((f) => f.slice(0, -4));
const tmp = (t) => { const dir = mkdtempSync(join(tmpdir(), "pi-shadow-")); t.after(() => rmSync(dir, { recursive: true, force: true })); return dir; };
const garage = (t) => { const dir = tmp(t); cpSync(GARAGE, dir, { recursive: true }); return dir; };
const lines = (r) => r.failures.map(formatFailure);
const ROOT = '<svg viewBox="0 0 48 48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">';
const ONE = `${ROOT}<circle cx="24" cy="24" r="19" fill="#ececea" stroke="none" /><circle cx="24" cy="24" r="19" stroke-width="2" /></svg>`;
const said = (text, G = 48) => shadowFailures("tyre", parse(text), G).map((f) => `${f.got} → ${f.want}`);

test("shadow: on writes a shade copy of each element first, one per line; off gives the file back byte for byte", () => {
  assert.equal(shadowOn(ONE), `${ROOT}\n<circle cx="24" cy="24" r="19" fill="#cfcfcb" stroke="none" data-shadow="" transform="translate(1.5 1.5)" />\n<circle cx="24" cy="24" r="19" stroke="#cfcfcb" stroke-width="2" data-shadow="" transform="translate(1.5 1.5)" /><circle cx="24" cy="24" r="19" fill="#ececea" stroke="none" /><circle cx="24" cy="24" r="19" stroke-width="2" /></svg>`);
  assert.equal(shadowOff(shadowOn(ONE)), ONE);
  assert.equal(shadowOn(ex("tyre")).split("\n")[1], '  <circle cx="24" cy="24" r="19" fill="#cfcfcb" stroke="none" data-shadow="" transform="translate(1.5 1.5)" />');
  for (const name of NAMES) {
    const t = ex(name), on = shadowOn(t);
    assert.equal(shadowOff(on), t, name);
    assert.equal(shadowOn(on), on, `${name}: on twice is on once`);
    assert.equal(shadowOff(t), t, `${name}: off without a shadow changes nothing`);
  }
});

test("shadow: refused at the duotone finish, and named there", () => {
  assert.throws(() => shadowOn(ONE.replace("0 0 48 48", "0 0 16 16")), (e) => e instanceof ShadowError && e.message === "a shadow at the filled finish only (48)");
  assert.deepEqual(said(shadowOn(ONE).replace("0 0 48 48", "0 0 16 16"), 16), ["a shadow at the duotone finish → none"]);
});

test("shadow: a copy missing, moved, extra or out of order is named", () => {
  const on = shadowOn(ONE);
  assert.deepEqual(said(on), []);
  assert.deepEqual(said(on.replace(/\n<circle[^>]*fill="#cfcfcb"[^>]*\/>/, "")), ["circle#2@2 not in the shadow → re-run shadow.mjs --on"]);
  assert.deepEqual(said(on.replace("translate(1.5 1.5)", "translate(2 2)")), ["circle@2 transform translate(2 2) → translate(1.5 1.5): re-run shadow.mjs --on"]);
  const stray = '<circle cx="5" cy="5" r="2" fill="#cfcfcb" stroke="none" data-shadow="" transform="translate(1.5 1.5)" />';
  assert.deepEqual(said(on.replace("</svg>", `\n${stray}</svg>`)), [
    "circle@4 after circle#3@3 → every shadow first, under the icon: re-run shadow.mjs --on",
    "circle@4 not a copy of the icon → re-run shadow.mjs --on",
  ]);
});

test("shadow: the copies never count toward the elements, the paint or the construction", () => {
  for (const name of NAMES) assert.deepEqual(textChecks(name, shadowOn(ex(name)), 48).failures.map(formatFailure), [], name);
});

test("shadow: a shadowed set passes, its ink and contrast as without", async (t) => {
  const dir = garage(t), plain = await checkSet(dir);
  shadowFolder(dir, true);
  const shadowed = await checkSet(dir);
  assert.deepEqual(lines(shadowed), []);
  assert.deepEqual(shadowed.rows.map((r) => [r.icon, r.ink, r["line%"]]), plain.rows.map((r) => [r.icon, r.ink, r["line%"]]));
});

test("shadow: an icon at the live edge may cast its shadow past it", async (t) => {
  const dir = tmp(t);
  writeFileSync(join(dir, "tyre.svg"), shadowOn(ex("tyre")));
  assert.deepEqual(lines(await checkSet(dir)).filter((l) => l.startsWith("live")), []);
});

test("shadow: the set is shadowed whole or not at all", async (t) => {
  const dir = garage(t);
  shadowFolder(dir, true);
  for (const name of NAMES.slice(0, 4)) writeFileSync(join(dir, `${name}.svg`), ex(name));
  assert.deepEqual(lines(await checkSet(dir)), ["shadow  set  6 of 10 shadowed → all or none (shadow.mjs --on|--off)"]);
});

test("shadow: a modifier goes on first; a shadowed icon refuses one", async () => {
  const marked = shadowOn(await addModifier(ex("wrench"), "badge:plus"));
  assert.deepEqual(textChecks("wrench", marked, 48).failures.map(formatFailure), []);
  await assert.rejects(addModifier(shadowOn(ex("wrench")), "badge:plus"), (e) => e instanceof ModifierError && e.message === "it has a shadow: take it off with shadow.mjs --off, add the modifier, put it back with --on");
});

test("shadow: emit keeps the copies, data-shadow and all", async (t) => {
  const dir = garage(t), out = tmp(t);
  shadowFolder(dir, true);
  await emit(dir, { as: "svg", to: join(out, "svg") });
  assert.match(readFileSync(join(out, "svg", "tyre.svg"), "utf8"), /<circle cx="24" cy="24" r="19" fill="#cfcfcb" stroke="none" data-shadow="" transform="translate\(1.5 1.5\)" \/>/);
  await emit(dir, { as: "react", to: join(out, "icons.tsx") });
  assert.match(readFileSync(join(out, "icons.tsx"), "utf8"), /data-shadow="" transform="translate\(1.5 1.5\)"/);
});

test("shadow: the CLI turns a folder on and off, and writes nothing when one file refuses", (t) => {
  const dir = garage(t), run = (...a) => spawnSync("node", [CLI, ...a], { encoding: "utf8" });
  const on = run(dir, "--on");
  assert.equal(on.status, 0, on.stderr);
  assert.equal(on.stdout.trim(), "shadow on: 10 icons");
  assert.equal(readFileSync(join(dir, "tyre.svg"), "utf8"), shadowOn(ex("tyre")));
  assert.equal(run(dir, "--off").status, 0);
  for (const name of NAMES) assert.equal(readFileSync(join(dir, `${name}.svg`), "utf8"), ex(name), name);
  writeFileSync(join(dir, "zz.svg"), readFileSync(join(GOOD16, readdirSync(GOOD16).find((f) => f.endsWith(".svg"))), "utf8"));
  const mixed = run(dir, "--on");
  assert.equal(mixed.status, 1);
  assert.equal(mixed.stderr.trim(), "shadow: zz.svg: a shadow at the filled finish only (48)");
  assert.equal(readFileSync(join(dir, "tyre.svg"), "utf8"), ex("tyre"));
  for (const bad of [[dir], [dir, "--on", "--off"], [dir, "--up"], [join(dir, "nope"), "--on"]]) {
    const r = run(...bad);
    assert.equal(r.status, 1, bad.join(" "));
    assert.equal(r.stderr.trim(), USAGE);
  }
});
