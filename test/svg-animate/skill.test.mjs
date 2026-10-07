import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const SKILL_DIR = new URL("../../skills/svg-animate/", import.meta.url).pathname;
const read = (name) => readFileSync(join(SKILL_DIR, name), "utf8");
const SKILL = read("SKILL.md"), GALLERY = read("GALLERY.md");
const block = (md, lang, name) => md.match(new RegExp("^```" + lang + " " + name.replace(".", "\\.") + "\\n([\\s\\S]*?)^```$", "m"))?.[1];
const section = (md, heading) => md.split(/^## /m).find((s) => s.startsWith(`${heading}\n`)) ?? "";

test("the skill is four markdown files and nothing else", () => {
  assert.deepEqual(readdirSync(SKILL_DIR).sort(), ["GALLERY.md", "RECIPES.md", "SKILL.md", "VERIFY.md"]);
});

test("SKILL.md names itself, says when to use it, and takes an argument", () => {
  const front = SKILL.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? "";
  assert.match(front, /^name: svg-animate$/m);
  const description = front.match(/^description: (.+)$/m)?.[1] ?? "";
  assert.match(description, /^Use when /);
  assert.ok(description.length <= 1024, `${description.length} characters`);
  assert.match(front, /^argument-hint: /m);
});

test("SKILL.md has the skeleton: six phases, each with its completion, the variants, Never Ship, Tone", () => {
  const headings = [...SKILL.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  assert.deepEqual(headings, ["Initial Response", "Operating Posture", "Hard Rules", "1. Read", "2. Propose", "3. Build", "4. Verify", "5. Gallery", "6. Keep", "Invocation Variants", "Never Ship", "Tone"]);
  for (const phase of headings.filter((h) => /^\d\. /.test(h))) assert.match(section(SKILL, phase), /^\*\*Done when\*\* /m, phase);
  for (const v of ["riff <name>", "keep <name>", "x5"]) assert.ok(section(SKILL, "Invocation Variants").includes(v), v);
});

test("Never Ship has the thirteen rows of the spec", () => {
  const rows = section(SKILL, "Never Ship").split("\n").filter((l) => l.startsWith("| ") && !/^\| (Never|---) /.test(l));
  assert.equal(rows.length, 13);
  for (const never of ["A crossfade between two states", "`scale(0)` or appearing from nothing", "Missing `prefers-reduced-motion`", "Showing a proposal without having seen its frames"]) assert.ok(rows.some((r) => r.startsWith(`| ${never} |`)), never);
});

test("nothing in the skill or its tests names the mark the recipes were found in", () => {
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
  for (const file of [...walk(SKILL_DIR), ...walk(new URL(".", import.meta.url).pathname)]) assert.doesNotMatch(readFileSync(file, "utf8"), /m[a]stra/i, file);
});

test("the gallery page gates hover, honours reduced motion, and handles the three kinds", () => {
  const page = block(GALLERY, "html", "gallery.html");
  assert.ok(page, "GALLERY.md has an html gallery.html block");
  assert.ok(page.includes('matchMedia("(hover: hover) and (pointer: fine)")'));
  assert.ok(page.includes('matchMedia("(prefers-reduced-motion: reduce)")'));
  assert.match(page, /@media \(prefers-reduced-motion: reduce\)/);
  for (const kind of ["entrance", "loop", "interaction"]) assert.ok(page.includes(`kind === "${kind}"`), kind);
  assert.doesNotMatch(page, /overflow:\s*visible/, "a part that leaves the stage is clipped, as it is in place");
  const script = [...page.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).at(-1);
  assert.doesNotThrow(() => new Function(script));
});

test("the React template plays, pauses, honours reduced motion, and imports only React", () => {
  const tsx = block(SKILL, "tsx", "Name.tsx");
  assert.ok(tsx, "SKILL.md has a tsx Name.tsx block");
  assert.deepEqual([...tsx.matchAll(/^import .* from "([^"]+)";$/gm)].map((m) => m[1]), ["react"]);
  for (const s of ["forwardRef", "useImperativeHandle", "prefers-reduced-motion: reduce", "beginElement()", "endElement()", "getScreenCTM()", "live.point(null)"]) assert.ok(tsx.includes(s), s);
  assert.ok(!tsx.includes("pauseAnimations()"), "a paused loop rests on the source, not frozen mid-motion");
});

test("an interaction's factory is kept as a TypeScript module the component imports", () => {
  const keep = section(SKILL, "6. Keep"), tsx = block(SKILL, "tsx", "Name.tsx");
  assert.ok(keep.includes("`<Name>.motion.ts`"), "the file is .ts");
  assert.ok(keep.includes("`// @ts-nocheck`"), "its first line turns the checker off");
  assert.ok(tsx.includes('import motion from "./Name.motion";'), "the import has no extension");
});

test("an interaction is shown and kept on the normalised drawing, its factory named after the proposal", () => {
  for (const [where, text] of [["Gallery", section(SKILL, "5. Gallery")], ["Keep", section(SKILL, "6. Keep")], ["GALLERY.md", GALLERY]]) assert.ok(text.includes("`norm/source.svg`"), where);
  assert.match(section(SKILL, "5. Gallery"), /proposal's name as `magnet\.mjs`'s third argument/);
  assert.match(read("RECIPES.md"), /`node magnet\.mjs norm magnet\.js Magnet`/);
});

test("Read checks the normalised drawing against the source before any idea", () => {
  const read1 = section(SKILL, "1. Read");
  assert.match(read1, /normalize` exits 2/);
  assert.ok(read1.includes("`node check.mjs rt <source.svg>`"), "the round trip");
});

// wire.js against a stub page: matchMedia answers from a table, the svg records what was asked of it
const tmp = mkdtempSync(join(tmpdir(), "svg-animate-wire-"));
writeFileSync(join(tmp, "wire.mjs"), block(SKILL, "js", "wire.js") ?? "");
const { wire, follow } = await import(pathToFileURL(join(tmp, "wire.mjs")).href);
const media = (table) => { globalThis.matchMedia = (q) => ({ matches: Boolean(table[q]) }); };
const REDUCE = "(prefers-reduced-motion: reduce)", HOVER = "(hover: hover) and (pointer: fine)";
const stub = (waiting = []) => {
  const calls = [], on = {};
  return {
    calls, on,
    pauseAnimations: () => calls.push("pause"), unpauseAnimations: () => calls.push("unpause"),
    setCurrentTime: (t) => calls.push(`time ${t}`), animate: () => calls.push("fade"),
    querySelectorAll: () => waiting.map(() => ({ beginElement: () => calls.push("begin"), endElement: () => calls.push("end") })),
    addEventListener: (type, f) => { on[type] = f; }, getScreenCTM: () => null,
  };
};

test("wire: under reduced motion the drawing rests on the source and replay is a fade", () => {
  media({ [REDUCE]: true });
  const entrance = stub(), e = wire(entrance, { duration: 1400 });
  assert.deepEqual(entrance.calls, ["pause", "time 1.4"]);
  e.replay();
  e.pause(false);
  assert.deepEqual(entrance.calls.slice(2), ["fade"]);
  const loop = stub();
  wire(loop, { loop: true, duration: 2400 });
  assert.deepEqual(loop.calls, ["pause", "time 0"]);
});

test("wire: replay restarts the clock, pause ends a loop on the source, a verb plays on hover only with a mouse and only at rest", () => {
  media({});
  const svg = stub(), w = wire(svg, { duration: 1400 });
  w.replay();
  w.pause(true);
  assert.deepEqual(svg.calls, ["time 0"]);
  const looping = stub([1, 2]), l = wire(looping, { loop: true, duration: 2400 });
  l.pause(true);
  l.pause(false);
  assert.deepEqual(looping.calls, ["end", "end", "begin", "begin"]);
  const touch = stub([1]);
  wire(touch, { duration: 900, hover: true });
  touch.on.pointerenter();
  assert.deepEqual(touch.calls, []);
  media({ [HOVER]: true });
  const verb = stub([1, 2]);
  wire(verb, { duration: 900, hover: true });
  verb.on.pointerenter();
  verb.on.pointerenter();
  assert.deepEqual(verb.calls, ["begin", "begin"]);
});

test("follow: no pointer under reduced motion; the pointer leaving is null", () => {
  media({ [REDUCE]: true });
  let made = 0;
  follow(stub(), () => { made++; return { point() {} }; });
  assert.equal(made, 0);
  media({});
  const seen = [], svg = stub();
  follow(svg, () => ({ point: (p) => seen.push(p) }));
  svg.on.pointermove({ clientX: 10, clientY: 10 });
  svg.on.pointerleave();
  assert.deepEqual(seen, [null]);
});

test("README lists the skill", () => {
  const readme = readFileSync(new URL("../../README.md", import.meta.url), "utf8");
  assert.match(readme, /^\| `svg-animate` \| .+ \|$/m);
  assert.doesNotMatch(readme, /the scripts it runs/);
});
