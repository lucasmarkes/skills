import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { composeBlind, composeSheet, composeShowcase, composeShadowPair, parseArgs, writeSheets, writeShowcase, writeShadowPair } from "../../skills/pretty-icons/sheet.mjs";
import { shadowOn } from "../../skills/pretty-icons/shadow.mjs";
import { readSet, checkSet } from "../../skills/pretty-icons/check.mjs";

const fix = new URL("./fixtures/good-16/", import.meta.url).pathname;
const sheetJs = new URL("../../skills/pretty-icons/sheet.mjs", import.meta.url).pathname;
const tmp = (t) => { const dir = mkdtempSync(join(tmpdir(), "pi-")); t.after(() => rmSync(dir, { recursive: true, force: true })); return dir; };

test("the author's sheet has every label, both themes and both scales", async () => {
  const set = readSet(fix);
  const { rows } = await checkSet(fix);
  const svg = composeSheet(set, 16, rows);
  for (const s of set) assert.ok(svg.includes(`>${s.name}<`), s.name);
  assert.ok(svg.includes('data-theme="light"') && svg.includes('data-theme="dark"'));
  assert.ok(svg.includes('data-scale="1"') && svg.includes('data-scale="2"'));
  assert.ok(svg.includes("data-keyline"), "a keyline tile per icon");
});

test("the blind sheet has no names and a shuffled key", () => {
  const set = readSet(fix);
  const a = composeBlind(set, 16, 7), b = composeBlind(set, 16, 8);
  for (const s of set) assert.ok(!a.svg.includes(s.name), `${s.name} leaked`);
  assert.equal(a.key.length, 4);
  assert.deepEqual(a.key.map((k) => k.n), [1, 2, 3, 4]);
  assert.deepEqual([...a.key.map((k) => k.name)].sort(), set.map((s) => s.name));
  assert.notDeepEqual(a.key.map((k) => k.name), b.key.map((k) => k.name), "two seeds, two orders");
  assert.deepEqual(composeBlind(set, 16, 7).key, a.key, "one seed, one order");
});

test("writeSheets writes two pngs and refuses a failing set", async (t) => {
  const out = tmp(t);
  const r = await writeSheets(fix, { out, seed: 1 });
  assert.ok(existsSync(r.sheet) && statSync(r.sheet).size > 1000);
  assert.ok(existsSync(r.blind) && statSync(r.blind).size > 1000);
  assert.equal(r.key.length, 4);
  await assert.rejects(writeSheets(new URL("./fixtures/hairline-before/", import.meta.url).pathname, { out }), /check/);
});

test("the blind sheet carries only drawn markup: no comments, no data-name, no stray </svg>", async (t) => {
  const dir = tmp(t);
  cpSync(fix, dir, { recursive: true });
  const card = readFileSync(join(dir, "card.svg"), "utf8");
  rmSync(join(dir, "card.svg"));
  writeFileSync(join(dir, "zebra.svg"), "<!-- card -->\n" + card.replace("<path ", '<path data-name="card" ').trimEnd() + "\n<!-- end -->\n");
  const r = await checkSet(dir);
  assert.equal(r.failures.length, 0, JSON.stringify(r.failures));
  const set = readSet(dir);
  const { svg } = composeBlind(set, 16, 7);
  for (const leak of ["zebra", "card", "<!--", "data-name"]) assert.ok(!svg.includes(leak), `${leak} leaked`);
  assert.equal(svg.match(/<\/svg>/g).length, 1, "one closing </svg>");
  const w = await writeSheets(dir, { out: join(dir, "out", "deep"), seed: 7 });
  assert.ok(existsSync(w.sheet) && existsSync(w.blind), "--out is created");
});

test("the root's stroke-dasharray reaches the sheet", async (t) => {
  const dir = tmp(t);
  cpSync(fix, dir, { recursive: true });
  const p = join(dir, "disc.svg");
  writeFileSync(p, readFileSync(p, "utf8").replace('stroke-width="1"', 'stroke-width="1" stroke-dasharray="2 2"'));
  const set = readSet(dir);
  assert.ok(composeBlind(set, 16, 7).svg.includes('stroke-dasharray="2 2"'));
});

test("the command line takes a folder, --seed=<int> and --out=<dir>, nothing else", () => {
  assert.deepEqual(parseArgs(["f", "--seed=12", "--out=o"]), { folder: "f", seed: 12, out: "o" });
  assert.deepEqual(parseArgs(["f"]), { folder: "f", seed: undefined, out: undefined });
  assert.deepEqual(parseArgs(["f", "--showcase", "--out=o"]), { folder: "f", seed: undefined, out: "o", showcase: true });
  assert.deepEqual(parseArgs(["f", "--shadow-pair", "--seed=3"]), { folder: "f", seed: 3, out: undefined, shadowPair: true });
  for (const bad of [["f", "--showcase", "--seed=1"], ["f", "--showcase", "--proof"], ["f", "--shadow-pair", "--showcase"], ["f", "--shadow-pair", "--proof"], ["f", "--showcase", "--showcase"], ["f", "--shadow-pair", "--only", "x"]])
    assert.equal(parseArgs(bad), null, bad.join(" "));
  for (const bad of [["f", "--seed=1.5"], ["f", "--seed=-1"], ["f", "--seed=x"], ["f", "--seed"], ["f", "--out"], ["f", "--out="], ["f", "--grid=16"], ["f", "--print"], []])
    assert.equal(parseArgs(bad), null, bad.join(" "));
  const r = spawnSync(process.execPath, [sheetJs, fix, "--seed=abc"], { encoding: "utf8" });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /^usage: /);
});

test("the command line prints the seed it used, so a blind order can be had again", (t) => {
  const out = tmp(t);
  const r = spawnSync(process.execPath, [sheetJs, fix, `--out=${out}`], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  const lines = r.stdout.trim().split("\n");
  assert.match(lines.at(-1), /^seed: \d+$/);
  const seed = Number(lines.at(-1).slice(6));
  assert.equal(lines.at(-2), "key: " + composeBlind(readSet(fix), 16, seed).key.map((k) => `${k.n} ${k.name}`).join(" · "));
});

test("the author's sheet draws each icon's ink box, solid, over the dashed keyline", async () => {
  const set = readSet(fix);
  const { rows } = await checkSet(fix);
  for (const r of rows) assert.ok(Number.isFinite(r.x0) && Number.isFinite(r.y0), JSON.stringify(r));
  const svg = composeSheet(set, 16, rows);
  const boxes = [...svg.matchAll(/<rect data-ink-box="([^"]+)" x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"[^>]*\/>/g)];
  assert.deepEqual(boxes.map((m) => m[1]).sort(), set.map((s) => s.name).sort());
  // each box comes after its tile's dashed keyline, and has no dash of its own
  for (const m of boxes) {
    assert.ok(!m[0].includes("dasharray"), m[0]);
    const row = rows.find((r) => r.icon === m[1]);
    assert.equal(Number(m[4]), row.w * 6);
    assert.equal(Number(m[5]), row.h * 6);
  }
  const card = rows.find((r) => r.icon === "card"), i = set.findIndex((s) => s.name === "card");
  const m = boxes.find((b) => b[1] === "card");
  const tx = 24 + (i % 5) * Math.max(16 * 6 + 24 + 12, 168);
  assert.equal(Number(m[2]), tx + card.x0 * 6);
  assert.ok(svg.lastIndexOf('stroke-dasharray="4 3"', m.index) > svg.lastIndexOf("data-ink-box", m.index - 1), "the box is drawn over the keyline");
});

test("the sheets go to a folder of their own in the temp folder by default, never beside the set", async (t) => {
  const root = tmp(t), outs = new Set();
  t.after(() => { for (const d of outs) rmSync(d, { recursive: true, force: true }); });
  const one = join(root, "a", "app", "pretty-icons"), two = join(root, "b", "app", "pretty-icons");
  for (const d of [one, two]) cpSync(fix, d, { recursive: true });
  const r1 = await writeSheets(one, { seed: 1 }), r2 = await writeSheets(two, { seed: 1 });
  for (const [r, d] of [[r1, one], [r2, two]]) {
    const dest = join(tmpdir(), "pretty-icons", "app-" + createHash("sha1").update(d).digest("hex").slice(0, 8));
    outs.add(dest);
    assert.equal(r.sheet, join(dest, "pretty-icons-sheet.png"));
    assert.equal(r.blind, join(dest, "pretty-icons-blind.png"));
    assert.ok(existsSync(r.sheet) && existsSync(r.blind));
  }
  assert.notEqual(dirname(r1.sheet), dirname(r2.sheet), "two folders of one name, two outputs");
  assert.equal((await writeSheets(one, { seed: 2 })).sheet, r1.sheet, "one folder, one output");
  const cli = spawnSync(process.execPath, [sheetJs, two], { encoding: "utf8" });
  assert.equal(cli.status, 0, cli.stderr);
  assert.deepEqual(cli.stdout.split("\n").slice(0, 2), [r2.sheet, r2.blind], "the paths are printed");
});

const garage = new URL("../../skills/pretty-icons/examples/garage/", import.meta.url).pathname;

test("the showcase is the set alone, five to a row at twice its grid, on its finish's page", async (t) => {
  const set = readSet(fix), svg = composeShowcase(set, 16);
  for (const s of set) assert.ok(!svg.includes(s.name), `${s.name} on the showcase`);
  assert.equal(svg.match(/<g transform="translate/g).length, set.length);
  assert.ok(svg.includes('scale(2)') && svg.includes('fill="#fafafa"'));
  // 4 icons at 32 px, 16 apart and 16 from the edge
  assert.match(svg, /^<svg [^>]*width="208" height="64"/);
  const ten = composeShowcase(readSet(garage), 48);
  assert.ok(ten.includes('fill="#edeeee"'), "the filled finish on grey");
  assert.match(ten, /^<svg [^>]*width="768" height="336"/);
  const out = tmp(t), r = await writeShowcase(fix, { out });
  assert.equal(r.showcase, join(out, "pretty-icons-showcase.png"));
  assert.ok(statSync(r.showcase).size > 1000);
  await assert.rejects(writeShowcase(new URL("./fixtures/hairline-before/", import.meta.url).pathname, { out }), /check/);
});

test("the shadow pair: one sheet shadowed, one not, in one order, the letters shuffled by the seed", async (t) => {
  const set = readSet(garage), keys = new Set();
  for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
    const p = composeShadowPair(set, 48, seed), on = p.key.A === "on" ? "A" : "B", off = on === "A" ? "B" : "A";
    assert.deepEqual([p.key.A, p.key.B].sort(), ["off", "on"]);
    assert.match(p[on], /transform="translate\(1\.5 1\.5\)"/);
    assert.doesNotMatch(p[off], /translate\(1\.5 1\.5\)/);
    assert.equal(p[off], composeBlind(set, 48, seed).svg, "the unshadowed sheet is the blind sheet");
    assert.deepEqual(composeShadowPair(set, 48, seed), p, "one seed, one pair");
    keys.add(p.key.A);
  }
  assert.deepEqual([...keys].sort(), ["off", "on"], "the seed decides which letter is shadowed");
  // a set already shadowed gives the same pair
  const shadowed = set.map((s) => ({ ...s, text: shadowOn(s.text) }));
  assert.deepEqual(composeShadowPair(shadowed, 48, 1), composeShadowPair(set, 48, 1));
  const out = tmp(t), r = await writeShadowPair(garage, { out, seed: 1 });
  assert.deepEqual([r.A, r.B], [join(out, "pretty-icons-shadow-A.png"), join(out, "pretty-icons-shadow-B.png")]);
  assert.ok(statSync(r.A).size > 1000 && statSync(r.B).size > 1000);
  assert.deepEqual(r.key, composeShadowPair(set, 48, 1).key);
  await assert.rejects(writeShadowPair(fix, { out }), /--shadow-pair: a shadow at the filled finish only \(48\)/);
  const cli = spawnSync(process.execPath, [sheetJs, garage, "--shadow-pair", "--seed=1", `--out=${out}`], { encoding: "utf8" });
  assert.equal(cli.status, 0, cli.stderr);
  assert.deepEqual(cli.stdout.trim().split("\n"), [r.A, r.B, `key: A ${r.key.A} · B ${r.key.B}`, "seed: 1"]);
  const show = spawnSync(process.execPath, [sheetJs, garage, "--showcase", `--out=${out}`], { encoding: "utf8" });
  assert.equal(show.status, 0, show.stderr);
  assert.equal(show.stdout.trim(), join(out, "pretty-icons-showcase.png"));
});

import { knockout } from "../../skills/pretty-icons/knockout.mjs";
import { place } from "../../skills/pretty-icons/sheet.mjs";

const bulkFolder = (t) => {
  const dir = tmp(t);
  const root = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">';
  const L = (d) => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`;
  const SQ = '<path d="M 8 3 H 16 C 17 3 18 3 19.5 4.5 C 21 6 21 7 21 8 V 16 C 21 17 21 18 19.5 19.5 C 18 21 17 21 16 21 H 8 C 7 21 6 21 4.5 19.5 C 3 18 3 17 3 16 V 8 C 3 7 3 6 4.5 4.5 C 6 3 7 3 8 3 Z" fill-opacity=".4" />';
  writeFileSync(join(dir, "a.svg"), knockout(`${root}\n  ${SQ}\n  <path d="M 12 7 L 17 12 L 12 17 L 7 12 Z" />\n</svg>`, { name: "a" }).text);
  writeFileSync(join(dir, "b.svg"), knockout(`${root}\n  ${SQ}\n  <path d="M 12 7.5 L 16.5 12 L 12 16.5 L 7.5 12 Z" />\n</svg>`, { name: "b" }).text);
  writeFileSync(join(dir, "c.svg"), knockout(`${root}\n  ${SQ}\n  <path d="M 12 7 L 17 12 L 12 17 L 7 12 Z" />\n  ${L("M 7 12 L 12 7")}\n</svg>`, { name: "c" }).text);
  return dir;
};

test("at bulk, place paints the root's fill, no stroke and no stroke-width on the group; the sheet has duotone's four blocks", async (t) => {
  const dir = bulkFolder(t), set = readSet(dir), r = await checkSet(dir);
  assert.equal(r.finish, "bulk");
  assert.deepEqual(r.failures, []);
  const g = place(set[2], 24, 0, 0, 24, "#123456");
  assert.match(g, /^<g transform="[^"]+" fill="#123456" stroke="none" stroke-linecap="round" stroke-linejoin="round">/);
  assert.ok(!g.includes("undefined"), g);
  assert.ok(g.includes('fill-opacity=".4"') && g.includes('stroke="#123456"'), "the body keeps its opacity, the line its own stroke");
  assert.ok(!g.includes("data-cut") && !g.includes("data-body"), "no mark reaches the sheet");
  const svg = composeSheet(set, 24, r.rows, "bulk");
  assert.equal((svg.match(/<g data-theme=/g) ?? []).length, 4);
  assert.ok(svg.includes('data-theme="dark" data-scale="2"'));
  // the keyline tiles use the bulk keylines: a square of 18 at the tile scale (6 at grid 24)
  assert.ok(svg.includes(`width="${18 * 6}" height="${18 * 6}" fill="none" stroke="#3b82f6"`), "the bulk square keyline of 18 at the tile scale, not duotone's 20");
  const out = tmp(t), w = await writeSheets(dir, { out, seed: 1 });
  assert.ok(statSync(w.sheet).size > 1000 && statSync(w.blind).size > 1000);
  const show = composeShowcase(set, 24, "bulk");
  assert.ok(show.includes('fill="#fafafa"'), "bulk shows on duotone's page");
});
