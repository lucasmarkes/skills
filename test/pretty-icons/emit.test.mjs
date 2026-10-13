import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { banner, componentName, toReact, toSprite, toIndex, emit, withNs } from "../../skills/pretty-icons/emit.mjs";
import { readSet } from "../../skills/pretty-icons/check.mjs";
import { knockout } from "../../skills/pretty-icons/knockout.mjs";

const fix = new URL("./fixtures/good-16/", import.meta.url).pathname;
const cli = new URL("../../skills/pretty-icons/emit.mjs", import.meta.url).pathname;
const one = (root, body = '<path d="M1.75 6.25h12.5" />') => [{ name: "q", text: `<svg ${root}>${body}</svg>` }];

test("componentName", () => {
  assert.equal(componentName("all"), "AllIcon");
  assert.equal(componentName("my-icon"), "MyIconIcon");
  assert.equal(componentName("two_fa"), "TwoFaIcon");
  assert.throws(() => componentName("2fa"), /identifier/);
  assert.throws(() => componentName("a b"), /identifier/);
});

test("react: one component per icon, attributes camel-cased", () => {
  const tsx = toReact(readSet(fix), {});
  assert.ok(tsx.includes("export const CardIcon"));
  assert.ok(tsx.includes("fillOpacity={0.2}") || tsx.includes('fillOpacity=".2"'));
  assert.ok(tsx.includes("strokeWidth"));
  assert.ok(!tsx.includes("fill-opacity"), "no kebab attributes in JSX");
  assert.ok(tsx.includes("aria-hidden"));
  assert.ok(tsx.includes("SVGProps<SVGSVGElement>"));
});

test("react with a wrapper: the Hairline shape", () => {
  const tsx = toReact(readSet(fix), { wrapper: "svg" });
  assert.ok(tsx.includes("export const ICONS = {"));
  assert.ok(tsx.includes("card: svg("));
  assert.ok(!tsx.includes("export const CardIcon"));
});

test("sprite: one symbol per icon with the root's viewBox", () => {
  const svg = toSprite(readSet(fix));
  assert.equal((svg.match(/<symbol /g) ?? []).length, 4);
  assert.ok(svg.includes('id="card"') && svg.includes('viewBox="0 0 16 16"'));
});

test("index", () => {
  const ts = toIndex(readSet(fix));
  assert.ok(ts.includes('import card from "./card.svg";'));
  assert.ok(ts.includes("export const icons = { card, disc, phone, tile }"));
  const named = toIndex([{ name: "my-icon" }, { name: "two_fa" }]);
  assert.ok(named.includes('import myIcon from "./my-icon.svg";'));
  assert.ok(named.includes('import twoFa from "./two_fa.svg";'));
  assert.ok(named.includes("export const icons = { myIcon, twoFa }"));
  assert.throws(() => toIndex([{ name: "2fa" }]), /identifier/);
});

test("emit svg writes files and refuses a failing set", async (t) => {
  const to = mkdtempSync(join(tmpdir(), "pi-"));
  t.after(() => rmSync(to, { recursive: true, force: true }));
  const written = await emit(fix, { as: "svg", to });
  assert.equal(written.length, 5);
  assert.ok(existsSync(join(to, "card.svg")) && existsSync(join(to, "index.ts")));
  assert.ok(readFileSync(join(to, "card.svg"), "utf8").startsWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"'), "a standalone .svg carries the namespace");
  const refused = join(to, "x");
  await assert.rejects(emit(new URL("./fixtures/hairline-before/", import.meta.url).pathname, { as: "svg", to: refused }), /check/);
  assert.equal(existsSync(refused), false, "a refused set writes nothing");
});

test("emit react and sprite write one file each", async (t) => {
  const to = mkdtempSync(join(tmpdir(), "pi-"));
  t.after(() => rmSync(to, { recursive: true, force: true }));
  assert.deepEqual(await emit(fix, { as: "react", to: join(to, "icons.tsx") }), [join(to, "icons.tsx")]);
  assert.deepEqual(await emit(fix, { as: "sprite", to: join(to, "icons.svg") }), [join(to, "icons.svg")]);
  assert.ok(readFileSync(join(to, "icons.tsx"), "utf8").includes("CardIcon"));
});

test("root attributes survive, except xmlns and, on a symbol, size and aria-hidden", () => {
  const set = one('xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 16 16" width="16" height="16" stroke-dasharray="2 2" fill-rule="evenodd" aria-hidden="true"');
  const tsx = toReact(set), sprite = toSprite(set);
  assert.ok(tsx.includes('strokeDasharray="2 2"') && tsx.includes('fillRule="evenodd"'));
  assert.ok(!tsx.includes("xmlns"));
  const symbol = sprite.split("\n")[1];
  assert.ok(symbol.includes('stroke-dasharray="2 2"') && symbol.includes('fill-rule="evenodd"'));
  assert.ok(!/xmlns|width=|height=|aria-hidden/.test(symbol), symbol);
});

test("withNs adds the namespace once, to the root only", () => {
  assert.equal(withNs('<svg viewBox="0 0 16 16"><path d="M1 1h2" /></svg>'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M1 1h2" /></svg>');
  const has = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" />';
  assert.equal(withNs(has), has);
});

test("attribute values are escaped: a quote and an ampersand from a single-quoted source", () => {
  const set = one(`viewBox="0 0 16 16" aria-label='say "hi" & go'`);
  assert.ok(toReact(set).includes('aria-label="say &quot;hi&quot; &amp; go"'));
  assert.ok(toSprite(set).includes('aria-label="say &quot;hi&quot; &amp; go"'));
  assert.ok(toReact(one(`viewBox="0 0 16 16" aria-label="a &amp; b"`)).includes('aria-label="a &amp; b"'), "an entity already written is kept");
});

test("wrapper with a module imports it; a bare wrapper says it must be in scope", () => {
  const set = readSet(fix);
  const imported = toReact(set, { wrapper: "svg@./icon-kit" });
  assert.ok(imported.startsWith('import { svg } from "./icon-kit";\n'));
  assert.ok(imported.includes("card: svg("));
  assert.ok(toReact(set, { wrapper: "Kit.svg@@scope/kit" }).startsWith('import { Kit } from "@scope/kit";'));
  const bare = toReact(set, { wrapper: "svg" });
  assert.ok(!bare.includes("import {"));
  assert.ok(/svg must be in scope/.test(bare));
  assert.throws(() => toReact(set, { wrapper: "1svg" }), /function name/);
  assert.throws(() => toReact(set, { wrapper: "s v g" }), /function name/);
  assert.throws(() => toReact(set, { wrapper: "svg@" }), /module/);
});

test("identifier collisions throw", () => {
  assert.throws(() => toIndex([{ name: "my-icon" }, { name: "my_icon" }]), /identifier myIcon/);
  assert.throws(() => toReact([{ name: "my-icon", text: "" }, { name: "my_icon", text: "" }]), /identifier MyIconIcon/);
  assert.throws(() => toIndex([{ name: "icons" }]), /cannot become an identifier/);
  assert.throws(() => toIndex([{ name: "Icons" }]), /cannot become an identifier/);
  assert.throws(() => toIndex([{ name: "delete" }]), /cannot become an identifier/);
});

test("--as is checked before the set is, and a flag value cannot be another flag", async () => {
  await assert.rejects(emit("/no/such/folder", { as: "png", to: "/no/such/out" }), /--as must be svg, react, sprite/);
  const r = spawnSync(process.execPath, [cli, fix, "--as", "--to", "x"], { encoding: "utf8" });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /--as needs a value, not "--to"/);
});

test("the banner names the sources relative to the emitted file and the exact command", () => {
  const b = banner({ folder: "pretty-icons/", as: "react", to: "components/shelf-icons.tsx", wrapper: "svg@./shelf-icon-svg", cwd: "/app" });
  assert.equal(b, [
    "/**",
    " * Drawn by pretty-icons from the .svg files in ../pretty-icons/ (relative to this file):",
    " * edit those, never this file, then emit it again, from `..`:",
    " * node <skill-dir>/emit.mjs pretty-icons/ --as react --to components/shelf-icons.tsx --wrapper svg@./shelf-icon-svg",
    " */",
  ].join("\n"));
  const svg = banner({ folder: "icons src", as: "svg", to: "public/icons", cwd: "/app" });
  assert.ok(svg.includes("in ../../icons src/ (relative to this file)"), svg);
  assert.ok(svg.includes("from `../..`:"), svg);
  assert.ok(svg.includes("node <skill-dir>/emit.mjs 'icons src' --as svg --to public/icons\n"), svg);
  assert.ok(!banner({ folder: "a*/b", as: "react", to: "x.tsx", cwd: "/app" }).slice(3, -3).includes("*/"), "nothing in it closes the comment early");
});

test("emit react writes the banner above the icons", async (t) => {
  const to = mkdtempSync(join(tmpdir(), "pi-"));
  t.after(() => rmSync(to, { recursive: true, force: true }));
  await emit(fix, { as: "react", to: join(to, "icons.tsx"), wrapper: "svg@./kit" });
  const tsx = readFileSync(join(to, "icons.tsx"), "utf8");
  assert.ok(tsx.startsWith('import { svg } from "./kit";\n\n/**\n * Drawn by pretty-icons from the .svg files in '), tsx.slice(0, 200));
  assert.ok(tsx.includes(` --as react --to ${join(to, "icons.tsx")} --wrapper svg@./kit\n */\nexport const ICONS = {`), tsx.slice(0, 400));
});

test("emit svg says when it replaced an index.ts", (t) => {
  const to = mkdtempSync(join(tmpdir(), "pi-"));
  t.after(() => rmSync(to, { recursive: true, force: true }));
  const first = spawnSync(process.execPath, [cli, fix, "--as", "svg", "--to", to], { encoding: "utf8" });
  assert.equal(first.status, 0, first.stderr);
  assert.ok(!first.stdout.includes("replaced"), first.stdout);
  const again = spawnSync(process.execPath, [cli, fix, "--as", "svg", "--to", to], { encoding: "utf8" });
  assert.equal(again.status, 0, again.stderr);
  assert.ok(again.stdout.split("\n").includes("replaced index.ts"), again.stdout);
});

test("jsx: every kebab attribute is camel-cased except data-* and aria-*; namespaced root attributes stay out", () => {
  const set = one('viewBox="0 0 16 16" xml:space="preserve" xmlns:xlink="http://www.w3.org/1999/xlink" stroke-miterlimit="4" aria-hidden="true" data-set="x"', '<path d="M1.75 6.25h12.5" shape-rendering="geometricPrecision" stroke-miterlimit="10" data-k="1" aria-label="bar" />');
  const tsx = toReact(set);
  for (const want of ['strokeMiterlimit="4"', 'shapeRendering="geometricPrecision"', 'strokeMiterlimit="10"', 'data-k="1"', 'aria-label="bar"', 'aria-hidden="true"', 'data-set="x"']) assert.ok(tsx.includes(want), `${want} in ${tsx}`);
  assert.ok(!/stroke-miterlimit|shape-rendering|xml:space|xmlSpace|xmlns/.test(tsx), tsx);
  const wrapped = toReact(set, { wrapper: "svg" });
  assert.ok(wrapped.includes('shapeRendering="geometricPrecision"') && !wrapped.includes("shape-rendering"), wrapped);
});

test("a bulk icon emits with fillOpacity and without data-cut or data-body, in react, the sprite and the svg file", async (t) => {
  const root = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">';
  // examples/bulk/devices uncut: a monitor body, a phone stacked in front of it
  const SQ = '<path d="M 6 4 H 18 C 18.75 4 19.5 4 20.75 5.25 C 22 6.5 22 7.25 22 8 V 12 C 22 12.75 22 13.5 20.75 14.75 C 19.5 16 18.75 16 18 16 H 6 C 5.25 16 4.5 16 3.25 14.75 C 2 13.5 2 12.75 2 12 V 8 C 2 7.25 2 6.5 3.25 5.25 C 4.5 4 5.25 4 6 4 Z" fill-opacity=".4" />';
  const PHONE = '<path d="M 11.25 11 H 12.75 C 13.25 11 14 11 14.75 11.75 C 15.5 12.5 15.5 13.25 15.5 13.75 V 17.25 C 15.5 17.75 15.5 18.5 14.75 19.25 C 14 20 13.25 20 12.75 20 H 11.25 C 10.75 20 10 20 9.25 19.25 C 8.5 18.5 8.5 17.75 8.5 17.25 V 13.75 C 8.5 13.25 8.5 12.5 9.25 11.75 C 10 11 10.75 11 11.25 11 Z" />';
  const cut = knockout(`${root}\n  ${SQ}\n  ${PHONE}\n</svg>`, { name: "edit" }).text;
  assert.ok(cut.includes('data-cut="knockout"') && cut.includes("data-body="));
  const set = [{ name: "edit", text: cut }];
  const tsx = toReact(set, {});
  assert.ok(tsx.includes('fillOpacity=".4"'), tsx);
  assert.ok(!/data-(cut|body)/.test(tsx), "no knockout mark in JSX");
  assert.ok(tsx.includes('fill="currentColor"') && !tsx.includes("strokeWidth"), "the bulk root, no stroke");
  const sprite = toSprite(set);
  assert.ok(!/data-(cut|body)/.test(sprite) && sprite.includes('fill-opacity=".4"'));
  const dir = mkdtempSync(join(tmpdir(), "pi-emit-")); t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, "src"), { recursive: true });
  writeFileSync(join(dir, "src", "edit.svg"), cut);
  // one icon: weight is judged against the reference ink alone, so the fixture sits near examples/bulk's median
  const written = await emit(join(dir, "src"), { as: "svg", to: join(dir, "out") });
  const file = readFileSync(join(dir, "out", "edit.svg"), "utf8");
  assert.ok(!/data-(cut|body)/.test(file) && file.includes('fill-opacity=".4"') && file.includes("xmlns="), file);
  assert.ok(written.some((p) => p.endsWith("index.ts")));
});

test("the svg file loses the knockout marks written with single quotes too", async (t) => {
  const root = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">';
  // examples/bulk/devices uncut: a monitor body, a phone stacked in front of it
  const SQ = '<path d="M 6 4 H 18 C 18.75 4 19.5 4 20.75 5.25 C 22 6.5 22 7.25 22 8 V 12 C 22 12.75 22 13.5 20.75 14.75 C 19.5 16 18.75 16 18 16 H 6 C 5.25 16 4.5 16 3.25 14.75 C 2 13.5 2 12.75 2 12 V 8 C 2 7.25 2 6.5 3.25 5.25 C 4.5 4 5.25 4 6 4 Z" fill-opacity=".4" />';
  const PHONE = '<path d="M 11.25 11 H 12.75 C 13.25 11 14 11 14.75 11.75 C 15.5 12.5 15.5 13.25 15.5 13.75 V 17.25 C 15.5 17.75 15.5 18.5 14.75 19.25 C 14 20 13.25 20 12.75 20 H 11.25 C 10.75 20 10 20 9.25 19.25 C 8.5 18.5 8.5 17.75 8.5 17.25 V 13.75 C 8.5 13.25 8.5 12.5 9.25 11.75 C 10 11 10.75 11 11.25 11 Z" />';
  const cut = knockout(`${root}\n  ${SQ}\n  ${PHONE}\n</svg>`, { name: "edit" }).text;
  const single = cut.replace(/data-(cut|body)="([^"]*)"/g, "data-$1='$2'");
  assert.ok(single.includes("data-cut='knockout'") && single.includes("data-body='"));
  const dir = mkdtempSync(join(tmpdir(), "pi-emit-")); t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, "src"), { recursive: true });
  writeFileSync(join(dir, "src", "edit.svg"), single);
  await emit(join(dir, "src"), { as: "svg", to: join(dir, "out") });
  const file = readFileSync(join(dir, "out", "edit.svg"), "utf8");
  assert.ok(!/data-(cut|body)/.test(file) && file.includes('fill-opacity=".4"'), file);
});
