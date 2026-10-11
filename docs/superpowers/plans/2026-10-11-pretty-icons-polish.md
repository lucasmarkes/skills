# pretty-icons polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move pretty-icons toward a drawn hand: a lighter duotone line, air between inks, loose interior detail, smooth bends, a capped share of diagonals, five soft body primitives, and an offset shadow at the filled finish chosen per set by a blind read.

**Architecture:** Each new rule is a measured check that prints `rule  icon  got → want` like the rest: `air` and `elongation` in `raster.mjs` (pixels), `interior`/`clearance` in `geometry.mjs` and `bend` in `curve.mjs` (geometry), wired in `measure.mjs` and `check.mjs`. The shadow is a new `shadow.mjs` that writes and checks per-element copies marked `data-shadow=""`; every other rule reads the icon without them. The examples are redrawn under the new rules and become the skill's bar.

**Tech Stack:** Node ≥ 18 ES modules, `node:test`, `@resvg/resvg-js` 2.6.2 (via `raster.mjs`), no new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-11-pretty-icons-polish-design.md`

## Global Constraints

- Duotone strokes: 16 → 1, 20 → 1.25, 24 → 1.5. Filled unchanged: line 1.5, contour 2.
- `AIR = 1.5`, `COUNTER = 2`, `LOOSE = 1`, `BEND = 1`, `DIAGONAL = { share: 0.3, ratio: 2, tol: 10 }`, `SHADOW = 1.5`, all in `presets.mjs`, in strokes except `SHADOW` (grid units).
- Every new failure prints in `rule  icon  got → want` form, and every one quoted in `rules.md` or `rules-filled.md` is `check.mjs`'s own output.
- Details stay at the line weight; there is no second, finer weight.
- The five tones, the inner shade and the contour hierarchy are unchanged. No colour.
- No shadow at the duotone finish. The drawer never draws a shadow; `shadow.mjs` writes it.
- The reference set's name appears in no file under `skills/pretty-icons/`, and in no plan, spec, test or commit message written by this plan. Where it must be named, write "a reference set of forty icons".
- Do not edit `docs/superpowers/baselines/2026-10-08-*`, `.claude/worktrees/`, or the installed `~/.claude/skills/pretty-icons`.
- Never push, open a PR, merge, or copy icons into an app. Commit locally only, with no attribution lines.
- The spike's comparison images stay in the session scratchpad; never commit them.
- Shell commands are prefixed with `rtk` (`rtk proxy <cmd>` for raw output).
- Run every test: `rtk test node --test 'test/**/*.test.mjs'` from the repo root (about a minute; 227 pass before Task 1). One file: `rtk test node --test test/pretty-icons/<file>.test.mjs`.
- One commit per task, message `type: subject` in lower case (`feat:`, `fix:`, `docs:`, `test:`).
- Every task ends green: the whole suite passes before its commit.

## Review Focus

1. A set of one or two icons, one of them on the diagonal, passes `diagonal`: the cap is `max(1, round(0.3 × N))`, never 0. Pinned in Task 6.
2. A shadowed icon whose own ink reaches the live edge passes `live`: the shadow may run `SHADOW` past it. Pinned in Task 7.
3. Shadow copies never count toward the element cap, the paint rules or the finish's construction rules. Pinned in Task 7.
4. A pinhole counter and a speck are told apart: a ring hole of 1 stroke is too small to report (under `AIR_AREA`), a hole of 1.5 is a counter, 2 and over passes. Pinned in Task 4.
5. A cubic with a zero-length handle or a cusp inside it is not refused by `bend`. Pinned in Task 5.

## File Structure

| File | Change | Responsibility |
| --- | --- | --- |
| `skills/pretty-icons/presets.mjs` | modify | duotone strokes, `inset(G)`, the new constants, the name scrub, `REFERENCE_INK` |
| `skills/pretty-icons/raster.mjs` | modify | `edt`, `air`, `elongation` |
| `skills/pretty-icons/geometry.mjs` | modify | `midpoint`, `inside`, `interior`, `clearance` |
| `skills/pretty-icons/curve.mjs` | modify | `tightest`, the `bend` line in `curveFailures(icon, el, stroke)` |
| `skills/pretty-icons/measure.mjs` | modify | gap at `AIR` with per-element widths, `loose`, `air`, `diagonal`, shadows left out |
| `skills/pretty-icons/check.mjs` | modify | shadows left out of the base, `shadowFailures`, the set's shadow line, `bend`'s stroke |
| `skills/pretty-icons/shadow.mjs` | create | `isShadow`, `shadowOn`, `shadowOff`, `shadowFailures`, CLI `--on|--off` |
| `skills/pretty-icons/filled.mjs` | modify | the stray-transform message |
| `skills/pretty-icons/modifiers.mjs` | modify | glyph inset on the quarter grid; halo skips shadows |
| `skills/pretty-icons/shapes.mjs` | modify | `inset(G)`, `outline` negative turn, `dome` `sack` `bubble` `bell` `bust`, bend's stroke |
| `skills/pretty-icons/sheet.mjs` | modify | `--showcase`, `--shadow-pair` |
| `skills/pretty-icons/rules.md`, `rules-filled.md`, `read.md`, `SKILL.md` | modify | the new rules, quoted from `check.mjs` |
| `skills/pretty-icons/examples/hairline/*.svg`, `examples/garage/*.svg` | modify | migrated in Task 1, kept green, redrawn in Task 11 |
| `test/pretty-icons/*.test.mjs`, `test/pretty-icons/fixtures/**` | modify | migrated in Task 1; new tests per task |
| `test/pretty-icons/shadow.test.mjs` | create | shadow round trip, failures, CLI |
| `docs/superpowers/baselines/2026-10-11-pretty-icons-polish-reference.md` | create | Task 11 and 12 records: the reads, the trial, the redrawn sets beside the old (as the 2026-10-09 reference did) |

## Deviations from the spec

The spec is the authority; these rulings settle what it leaves open, and the spec has been amended to match.

1. **Inset on the quarter grid.** Half a stroke of 1.25 is 0.625, off the grid. A body's edge sits `inset(G) = ceil(stroke / 2 / 0.25) × 0.25` inside its keyline, where stroke is the contour at 48: 0.5 on 16, 0.75 on 20 and 24, 1 on 48. `body()`, `shape()` and the modifier glyph all use it. At 20 a body's ink then falls 0.25 short of the keyline, inside `KEYLINE_TOL`.
2. **Air's sizes.** A narrow region is reported when its area is at least `AIR_AREA = 1` stroke² (the spec's 0.25 reported every anti-aliased corner in the spike). An enclosed paper region is a counter when it is under `COUNTER − AIR_TOL` strokes across, `AIR_TOL = 0.25`, across being `(2 × its largest distance to ink + 1 px) / px per stroke`. A counter under `AIR_AREA` is a speck and is not reported.
3. **Air reads the base without interior details.** A loose detail inside a body is `loose`'s, at one stroke; air would refuse it at 1.5. So air renders the base without modifiers, shadows and interior details, and `loose` comes before `air`.
4. **Gap and air may both report one pair of parallel lines.** Accepted: each names its own move.
5. **Gap reads each element's own width.** Edge to edge is `centre − (wa + wb) / 2`, `w` the element's `stroke-width` or the root's, so a contour at 2 is taken at 2 (spec decision 2). The minimum is `AIR × stroke`, half that for a mark.
6. **Loose skips gap for its own pair.** A detail and its body (and the body's contour, same geometry) are `loose`'s, not gap's.
7. **The diagonal cap is `max(1, round(0.3 × N))`.** One diagonal is always allowed; `round(0.3)` would be 0 for a set of one.
8. **Bend skips slow samples.** A cubic is sampled at 65 points; a sample whose speed is under half the cubic's mean, or whose cross product is under 1e-12, is skipped. That is what keeps a zero-length handle and a cusp inside a cubic from being refused. Bend is measured only when the caller passes a stroke: `--from` repair, which has no grid, does not measure it.
9. **The shadow is per element, not a group.** The spec's `<g data-shadow transform>` would put a `<g>` in files whose elements are only `rect`, `circle`, `line` and `path`. Instead each copy is one element marked `data-shadow=""` with `transform="translate(1.5 1.5)"`, all of them first after the root tag, one per line, each inserted as a newline, the file's indent and the copy. Its attributes, in order: the element's geometry, then `fill`, `stroke`, `stroke-width`, `data-shadow=""`, `transform`. Only geometry is copied; paint becomes the shade tone (a fill to `#cfcfcb`, a stroke to `#cfcfcb` keeping its own `stroke-width`, an unstroked element `stroke="none"`). `--off` removes every line matching `/\n[ \t]*<[^>]*\sdata-shadow=""[^>]*\/>/g`, so `--on` then `--off` is byte for byte the file before, and `--on` on a shadowed file writes the shadow fresh, never twice.
10. **A shadowed icon's live area runs `SHADOW` further** to the bottom and right; its own box is still judged by keyline and gravity without the shadow.
11. **Modifiers before the shadow.** `shadow.mjs --on` copies every element, a modifier's included. `modifiers.mjs --add` refuses a shadowed icon: `it has a shadow: take it off with shadow.mjs --off, add the modifier, put it back with --on`. The halo check skips shadow copies.
12. **`outline` takes a negative turn.** A cusp's `turn` below 0 rotates both handles outward (a flare); 0 and above is as before, so every existing primitive is byte-identical. The new `sack` and `bust` need it. Side effect: `drop --tip` below 0, outside its documented 0..1, now flares.
13. **Name scrub now.** The spec's success item 6 says the name has already gone from `presets.mjs` and `rules-filled.md`; it has not. Task 1 replaces it and adds the test.
14. **Headings.** The spec does not number the new sections. `rules.md` gains `## 11 · air` and `## 12 · diagonal`, its title becomes `# The twelve rules` and `measures nine` becomes `measures eleven`; `bend` and `loose` are measured under 04 and 08, which they refine. `rules-filled.md` gains `## 12 · air, loose and diagonal` and `## 13 · shadow`.
15. **What holds a redraw.** The spec's success items 3 and 4 (the blind read and the ranking reads) gate each redrawn example. The craft and set reads in `read.md` are run and recorded every round and steer the next round's redraw, but do not hold a set alone: the identity pass showed the set read swinging round to round on one outlier.

---

### Task 1: The lighter line

Moves the duotone strokes, puts every body's inset on the quarter grid, migrates every file drawn at the old strokes, re-measures the reference ink, scrubs the name.

**Files:**
- Modify: `skills/pretty-icons/presets.mjs:12-34, 94-121` (strokes, comments, `inset`, `body`, `REFERENCE_INK`)
- Modify: `skills/pretty-icons/shapes.mjs:183` (inset)
- Modify: `skills/pretty-icons/modifiers.mjs:24, 262` (glyph inset)
- Modify: `skills/pretty-icons/rules.md` (presets, bodies, dash, quotes, reference ink, sliders), `skills/pretty-icons/rules-filled.md:178` (name)
- Modify: every `.svg`, `.mjs` and `.md` under `skills/pretty-icons/` and `test/pretty-icons/` whose root tag is drawn at an old duotone stroke (by script), except `test/pretty-icons/svg.test.mjs` and `test/pretty-icons/fixtures/lucide/`
- Test: `test/pretty-icons/presets.test.mjs`, `test/pretty-icons/docs.test.mjs`

**Interfaces:**
- Produces: `inset(G) → number` exported from `presets.mjs` (0.5 / 0.75 / 0.75 / 1 on 16 / 20 / 24 / 48); `preset(G).stroke` 1 / 1.25 / 1.5 on 16 / 20 / 24; `body(G, format)` with the new geometry.

- [ ] **Step 1: Write the failing tests**

Append to `test/pretty-icons/presets.test.mjs` (add `inset` to its import from `presets.mjs`):

```js
test("the duotone line: 1 on 16, 1.25 on 20, 1.5 on 24; the filled line and contour unchanged", () => {
  assert.deepEqual([16, 20, 24].map((G) => preset(G).stroke), [1, 1.25, 1.5]);
  assert.equal(preset(48).stroke, 1.5);
  assert.equal(preset(48).contour, 2);
});

test("inset: half the drawn stroke, rounded up to the quarter grid", () => {
  assert.deepEqual([16, 20, 24, 48].map(inset), [0.5, 0.75, 0.75, 1]);
});

test("a body sits an inset inside its keyline", () => {
  assert.deepEqual(body(16, "circle"), { tag: "circle", cx: 8, cy: 8, r: 6.5 });
  assert.deepEqual(body(16, "square"), { tag: "rect", x: 2.25, y: 2.25, w: 11.5, h: 11.5, rx: 1.5 });
  assert.deepEqual(body(16, "portrait"), { tag: "rect", x: 3, y: 1.5, w: 10, h: 13, rx: 1.5 });
  assert.deepEqual(body(16, "landscape"), { tag: "rect", x: 1.5, y: 3, w: 13, h: 10, rx: 1.5 });
  assert.deepEqual(body(20, "circle"), { tag: "circle", cx: 10, cy: 10, r: 8.25 });
  assert.deepEqual(body(24, "circle"), { tag: "circle", cx: 12, cy: 12, r: 10.25 });
  assert.deepEqual(body(24, "portrait"), { tag: "rect", x: 3.75, y: 1.75, w: 16.5, h: 20.5, rx: 2 });
  assert.deepEqual(body(48, "circle"), { tag: "circle", cx: 24, cy: 24, r: 19 });
});
```

Append to `test/pretty-icons/docs.test.mjs` (extend its `node:fs` import with `readdirSync, statSync`):

```js
import { createHash } from "node:crypto";

// The reference set's name, as the SHA-256 of its lowercased form: the test never writes it.
const NAME = "6a6a1aefb5dce285444475fd85d5450171e0986e7c6df0f117a7678503d87294";
test("the reference set's name is in no file of the skill", () => {
  const root = new URL("../../skills/pretty-icons/", import.meta.url).pathname;
  const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
  const named = (p) => (readFileSync(p, "utf8").toLowerCase().match(/[a-z]+/g) ?? []).some((w) => createHash("sha256").update(w).digest("hex") === NAME);
  assert.deepEqual(walk(root).filter((p) => /\.(md|mjs|svg)$/.test(p) && named(p)), []);
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `rtk test node --test test/pretty-icons/presets.test.mjs test/pretty-icons/docs.test.mjs`
Expected: FAIL: `inset` is not exported; strokes `[1.5, 1.5, 2]`; the name test lists `presets.mjs` and `rules-filled.md`.

- [ ] **Step 3: Change the presets**

In `skills/pretty-icons/presets.mjs`:

```js
export const PRESETS = {
  16: { stroke: 1, radius: [1.5, 1], keylines: { circle: [14, 14], square: [12.5, 12.5], portrait: [11, 14], landscape: [14, 11] } },
  20: { stroke: 1.25, radius: [2, 1], keylines: { circle: [18, 18], square: [16, 16], portrait: [14, 18], landscape: [18, 14] } },
  24: { stroke: 1.5, radius: [2, 1], keylines: { circle: [22, 22], square: [20, 20], portrait: [18, 22], landscape: [22, 18] } },
};
```

Line 18: replace the possessive and the words `forty run 17% to 48%,` after `at the filled finish.` (the reference set's name, which this plan does not write) with `A reference set of forty icons runs 17% to 48%,` (keep the rest of the comment).

Line 25: replace `// No shadow: the keylines sit in the live area as the duotone's do, centred at 24.` with `// The keylines sit in the live area as the duotone's do, centred at 24.`

Replace the header comment's first paragraph sentence `a rect's edge sits half a stroke inside the keyline, a circle's radius is half the keyline less half a stroke.` with `a rect's edge sits an inset inside the keyline (half the stroke, on the quarter grid), a circle's radius is half the keyline less the inset.`

Replace `body()` and add `inset` above it:

```js
/** How far a body's edge sits inside its keyline: half the drawn stroke (the contour at 48), rounded up to the quarter grid. */
export const inset = (G) => { const p = preset(G); return Math.ceil((p.contour ?? p.stroke) / 2 / GRID_STEP - 1e-9) * GRID_STEP; };

/** The element whose ink lands on a keyline, its edge an inset inside it. */
export function body(G, format) {
  const { keylines, centre: [cx, cy] } = preset(G), i = inset(G);
  const kl = keylines[format];
  if (!kl) throw new Error(`no keyline "${format}"; one of ${FORMATS.join(", ")}`);
  const [kw, kh] = kl;
  if (format === "circle") return { tag: "circle", cx, cy, r: kw / 2 - i };
  const w = kw - 2 * i, h = kh - 2 * i;
  return { tag: "rect", x: cx - kw / 2 + i, y: cy - kh / 2 + i, w, h, rx: radiusFor(G, Math.min(w, h)) };
}
```

Replace the `REFERENCE_INK` comment's second sentence with: `On 20 and 24 it is measured from the set scaled from the 16 live area to the grid's, drawn at the grid's own stroke.` (the old "20 keeps 16's 1.5" is no longer true). The values change in Step 8.

In `skills/pretty-icons/shapes.mjs`, import `inset as insetOf` from `./presets.mjs` and change line 183:

```js
  const G = o.grid ?? 48, p = preset(G), inset = insetOf(G);
```

In `skills/pretty-icons/modifiers.mjs`, import `inset` from `./presets.mjs` (line 24) and change line 262:

```js
  let h = half - inset(G);
```

`ownStroke(G)` is the contour at 48 and the line elsewhere, so this is `s / 2` on 16, 24 and 48, and 0.75 instead of 0.625 on 20.

In `skills/pretty-icons/rules-filled.md:178`, replace the name and its possessive with "a reference set of forty icons".

- [ ] **Step 4: Run the new tests**

Run: `rtk test node --test test/pretty-icons/presets.test.mjs test/pretty-icons/docs.test.mjs`
Expected: the three new tests and the name test PASS. Older tests in these files may fail; Step 6 fixes them.

- [ ] **Step 5: Migrate every file drawn at an old stroke**

Write this script to the session scratchpad as `migrate-strokes.mjs` (not in the repo) and run it from the repo root: `rtk proxy node <scratchpad>/migrate-strokes.mjs skills/pretty-icons test/pretty-icons`.

```js
// Moves every duotone root stroke-width to the new presets: 16 1.5→1, 20 1.5→1.25, 24 2→1.5.
// Only an <svg …> opening tag carrying viewBox="0 0 G G" is touched, in .svg, .mjs and .md files.
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const MOVE = { 16: ["1.5", "1"], 20: ["1.5", "1.25"], 24: ["2", "1.5"] };
// svg.test parses roots for their own sake; lucide is a foreign set kept at its own stroke
const SKIP = [/svg\.test\.mjs$/, /fixtures\/lucide\//];
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const fixTag = (tag) => {
  const g = /viewBox="0 0 (16|20|24) \1"/.exec(tag)?.[1];
  if (!g) return tag;
  const [from, to] = MOVE[g];
  return tag.replace(new RegExp(`stroke-width="${from.replace(".", "\\.")}"`), `stroke-width="${to}"`);
};
let n = 0;
for (const root of process.argv.slice(2)) for (const p of walk(root)) {
  if (!/\.(svg|mjs|md)$/.test(p) || SKIP.some((r) => r.test(p))) continue;
  const t = readFileSync(p, "utf8"), u = t.replace(/<svg\b[^>]*>/g, fixTag);
  if (u !== t) { writeFileSync(p, u); n++; console.log(p); }
}
console.error(`${n} files`);
```

Then `rtk git diff --stat` and read the list: only root tags moved.

- [ ] **Step 6: Run the suite and fix what the move broke**

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: about 33 failures, in five groups. Fix each so the test still tests what its name says, at the new stroke. Never loosen an assertion to make it pass.

| Group | Tests | Fix |
| --- | --- | --- |
| A. presets | `presets.test` (stroke, keylines and bodies tables), `filled.test` bodies at 48, `finish.test` weight tolerances | Update the expected tables to the new strokes and bodies (Step 1's values; 48 is unchanged, so a 48 failure means a test that reads a 16 body: re-take it). If `svg.test` fails, the script touched it: `rtk git checkout test/pretty-icons/svg.test.mjs`. |
| B. inputs written in strokes | `check-text.test` root dash; `check.test` hairline-before, gap overlap, merged dots, two elements on one line, notes; `curve.test` pixel notes; `raster.test` centred square, non-square viewBox; `sheet.test` root dasharray; `finish.test` weight over reference, languages | Re-space each input for the new stroke. A gap test keeps its gap on the same side of the minimum (a stroke apart at 16 is now 1). A dash keeps dash and gap at a stroke or more (`2 3` at 16). A pixel note keeps its edges between pixels: a 1-wide H line at y 8 has edges on halves (grey rows), at y 8.5 on whole pixels. A centred square keeps its ink box centred: move its edge 0.25 out with the new inset. A weight or ink expectation is re-read from the new render, and the commit says so. |
| C. keyline | `finish.test` workspace, rules.md house and sliders, hairline; `examples.test` hairline | The ink box of a body drawn at the old inset is now 0.5 short (16) or 0.25 short (20, 24). Re-take each body from the new table: its edges move out 0.25 on 16 (`billing`, `home`, `profile`, `data` in `fixtures/workspace`; `examples/hairline`'s bodies; `rules.md`'s house). `interfaces` in `workspace` then reads light (about −21.5%): lengthen one of its details by 0.5 until weight passes. |
| D. modifiers | `modifiers.test` (six), `proof.test`, `docs.test` modifier quotes | `docs.test`'s `svg16` now carries stroke-width 1; set `BODY16` to the new square body, `<rect x="2.25" y="2.25" width="11.5" height="11.5" rx="1.5" fill="currentColor" fill-opacity=".2" />`. Expected glyph coordinates follow `inset`; the connectivity gap message now reads `≥ 1 apart`, so a regex expecting `0.97` takes the new number from the printed line. Re-quote any changed line in `rules.md`. |
| E. shapes | `shapes.test` box overshoot, leaf chord (3.47 → 3.82), the 20/24 grid loop, finishOf at 16 | Expected values follow the new inset; re-read them from `shape()`'s output, and keep the quarter-grid and clean-curve assertions as they are. |

Run the suite after each group. Expected at the end: all PASS.

- [ ] **Step 7: Check the examples by hand**

Run: `rtk proxy node skills/pretty-icons/check.mjs skills/pretty-icons/examples/hairline` and the same for `examples/garage`.
Expected: `ok` for both.

- [ ] **Step 8: Re-measure the reference ink**

Write this to the scratchpad as `refink.mjs` and run `rtk proxy node <scratchpad>/refink.mjs $PWD/skills/pretty-icons`:

```js
// Prints the duotone reference inks from examples/hairline: on 16 as drawn, on 20 and 24 scaled to the grid's live area at its own stroke.
const SK = process.argv[2];
const { readSet } = await import(`${SK}/check.mjs`);
const { measure } = await import(`${SK}/raster.mjs`);
const { parse } = await import(`${SK}/svg.mjs`);
const { preset } = await import(`${SK}/presets.mjs`);
const set = readSet(`${SK}/examples/hairline`).filter((x) => !/data-modifier=/.test(x.text));
const med = (a) => { a.sort((x, y) => x - y); const m = a.length >> 1; return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; };
const out = {};
for (const G of [16, 20, 24]) {
  const k = preset(G).live / preset(16).live, sw = preset(G).stroke, inks = [];
  for (const s of set) {
    if (G === 16) { inks.push((await measure(s.text, 16)).ink); continue; }
    const inner = parse(s.text).elements.map((el) => `<${el.tag} ${Object.entries(el.attrs).map(([a, v]) => `${a}="${v}"`).join(" ")} />`).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${G} ${G}" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(${G / 2} ${G / 2}) scale(${k}) translate(-8 -8)" stroke-width="${sw / k}">${inner}</g></svg>`;
    inks.push((await measure(svg, G)).ink);
  }
  out[G] = Math.round(med(inks) * 10) / 10;
}
console.log(JSON.stringify(out));
```

Expected: near `{"16":63.1,"20":102.4,"24":151}`. Paste the printed values into `REFERENCE_INK` (48 stays 340.4) and into any test that pins them. Task 11 re-measures after the redraw.

- [ ] **Step 9: Bring `rules.md` to the new line**

In `skills/pretty-icons/rules.md`:
- lines 11–13: the presets table reads stroke 1 / 1.25 / 1.5;
- lines 21–33: the bodies table takes Step 1's values (20 is unchanged), and the root example's rect becomes the landscape body, `x="1.5" y="3" width="13" height="10"`; say a body's edge sits an inset inside its keyline, half the stroke rounded up to the quarter grid;
- line 60: dashes are "2 on 16, 2.5 on 20, 3 on 24; `2 3` on 16 shows gaps of 2";
- line 62: the quoted lines become what `check.mjs` now prints: `stroke-width 1.5 → 1`, and for a dasharray of `0.5 0.5`, `dash and gap ≥ 1` (run `textChecks` on the quoted input and paste its output);
- line 84: the reference inks are Step 8's, and "a unit of free line weighs about 1 on 16";
- line 139: the sliders example at the new stroke (re-take its body; it must still pass `finish.test`).

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: all PASS.

- [ ] **Step 10: Commit**

```bash
rtk git add skills/pretty-icons test/pretty-icons
rtk git commit -m "feat: a lighter duotone line, bodies on the quarter grid, the name scrubbed"
```

The commit body lists every test whose input moved (group B) and every fixture or example edited beyond the stroke (group C).

---

### Task 2: Gap at 1.5 strokes, each element at its own width

**Files:**
- Modify: `skills/pretty-icons/presets.mjs` (add `AIR`)
- Modify: `skills/pretty-icons/measure.mjs:13-17, 44-57, 80-84`
- Test: `test/pretty-icons/check.test.mjs`

**Interfaces:**
- Consumes: `preset(G).stroke` (Task 1).
- Produces: `AIR = 1.5` from `presets.mjs`; `measuredChecks` gap lines `X to Y n apart → ≥ m apart, or crossing` with `m = AIR × stroke` (half for a mark); each measured entry carries `rootW`.

- [ ] **Step 1: Write the failing tests**

Append to `test/pretty-icons/check.test.mjs` (import `measuredChecks` from `../../skills/pretty-icons/measure.mjs` if the file does not yet):

```js
const s16 = (b) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">${b}</svg>`;
const s48 = (b) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${b}</svg>`;
const BODY = '<rect x="1.5" y="3" width="13" height="10" rx="1.5" fill="currentColor" fill-opacity=".2" />';
const gaps = async (text, G) => (await measuredChecks([{ name: "x", text }], G)).failures.filter((f) => f.rule === "gap").map((f) => `${f.got} → ${f.want}`);

test("gap: two lines sit 1.5 strokes apart, edge to edge", async () => {
  assert.deepEqual(await gaps(s16(`${BODY}<path d="M4 6.5H12" /><path d="M4 8.75H12" />`), 16), ["path@2 to path@3 1.25 apart → ≥ 1.5 apart, or crossing"]);
  assert.deepEqual(await gaps(s16(`${BODY}<path d="M4 6.5H12" /><path d="M4 9H12" />`), 16), []);
});

test("gap: a contour is taken at its own width, 2", async () => {
  const body = '<rect x="5" y="9" width="38" height="30" rx="6" fill="#ececea" stroke="none" /><rect x="5" y="9" width="38" height="30" rx="6" stroke-width="2" />';
  assert.deepEqual(await gaps(s48(`${body}<path d="M10 43H38" />`), 48), []);
  assert.deepEqual(await gaps(s48(`${body}<path d="M10 42.75H38" />`), 48), ["rect@2 to path@3 2 apart → ≥ 2.25 apart, or crossing"]);
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `rtk test node --test test/pretty-icons/check.test.mjs`
Expected: FAIL: at 16 the 1.25 pair passes (the minimum is still 1); at 48 the 42.75 line passes (outer is taken at 1.5 on both sides).

- [ ] **Step 3: Implement**

In `presets.mjs`, after `GRAVITY_TOL`:

```js
/** Air, in strokes: two inks that do not touch sit this far apart, edge to edge (a mark, half). */
export const AIR = 1.5;
```

In `measure.mjs`, import `AIR` from `./presets.mjs` and `num` from `./svg.mjs`. In the per-icon `try`, after `parsed`:

```js
      const rootW = num(parsed.attrs, "stroke-width", p.stroke);
```

and push it: `measures.push({ ...s, els, parts, details, paint, m, modified, share, rootW });`. In the second loop destructure `rootW` and replace the `gap` closure:

```js
    // each element at its own width: a contour's edge is at 2, the parts' at the root's
    const width = new Map(els.map((el) => [el.at, num(el.attrs, "stroke-width", rootW)]));
    const gap = (A, B, a, b) => {
      const ka = a.replace(/\[\d+\]$/, ""), kb = b.replace(/\[\d+\]$/, "");
      const min = (details.has(ka) || details.has(kb) ? AIR / 2 : AIR) * p.stroke;
      const centre = minDistance(A, B), outer = centre - (width.get(ka) + width.get(kb)) / 2;
      if (centre > TOUCH && outer < min - 1e-9) fail(failures, "gap", name, `${a} to ${b} ${outer < 0 ? `overlapping, centrelines ${r2(centre)} apart` : `${r2(outer)} apart`}`, `≥ ${+min.toFixed(3)} apart, or crossing`);
    };
```

Update the file's header comment: "line from line by a stroke, a mark from anything by half a stroke" becomes "line from line by 1.5 strokes edge to edge, each at its own width, a mark from anything by half that".

- [ ] **Step 4: Run the suite and keep it green**

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: the two new tests PASS. Where an example or a fixture a test requires to pass now fails `gap`, move the nearer element by 0.25 steps until it passes, keeping its keyline and weight; where a test asserts a gap message, re-read its numbers. If `fixtures/lucide` (a foreign set, stroke 2 at 24) now fails gap, narrow that test to the rules it was written for (live and gravity) and say so in the commit. Run `check.mjs` on both examples: `ok`.

- [ ] **Step 5: Commit**

```bash
rtk git add skills/pretty-icons test/pretty-icons
rtk git commit -m "feat: gap holds inks 1.5 strokes apart, each at its own width"
```

The body names every example or fixture moved and by how much.

---

### Task 3: Loose interior detail

**Files:**
- Modify: `skills/pretty-icons/geometry.mjs` (add `midpoint`, `inside`, `interior`, `clearance`)
- Modify: `skills/pretty-icons/presets.mjs` (add `LOOSE`)
- Modify: `skills/pretty-icons/measure.mjs` (interior details, the `loose` line, gap skips their pairs)
- Test: `test/pretty-icons/geometry.test.mjs`, `test/pretty-icons/check.test.mjs`

**Interfaces:**
- Consumes: `AIR`, the gap closure and `rootW` (Task 2).
- Produces: `midpoint(el) → [x, y]`, `inside([x, y], polygon) → boolean`, `interior(el, bodies) → body | null`, `clearance(el, body, wEl, wBody) → number` from `geometry.mjs`; `LOOSE = 1` from `presets.mjs`; in `measure.mjs` each measured entry carries `inner: Set<at>` (its interior details), which Task 4 uses.

- [ ] **Step 1: Write the failing tests**

Append to `test/pretty-icons/geometry.test.mjs` (add the four names to its import from `geometry.mjs`):

```js
const E = (tag, attrs) => ({ tag, attrs, at: `${tag}@1` });
const CARD = E("rect", { x: "2", y: "2", width: "12", height: "12" });

test("interior: a line whose midpoint lies inside a filled body", () => {
  assert.equal(interior(E("path", { d: "M5 8H11" }), [CARD]), CARD);
  assert.equal(interior(E("path", { d: "M14 8H15.5" }), [CARD]), null);
  assert.deepEqual(midpoint(E("path", { d: "M2 8H6M10 8H14" })), [10, 8]);
  assert.equal(inside([8, 8], [[2, 2], [14, 2], [14, 14], [2, 14]]), true);
  assert.equal(inside([15, 8], [[2, 2], [14, 2], [14, 14], [2, 14]]), false);
});

test("clearance: edge to edge, each at its width", () => {
  assert.ok(Math.abs(clearance(E("path", { d: "M4 8H12" }), CARD, 1, 1) - 1) < 0.01);
});
```

Append to `test/pretty-icons/check.test.mjs` (it has `s16`, `s48` and `gaps` from Task 2):

```js
const CARD = '<rect x="2" y="2" width="12" height="12" rx="1.5" fill="currentColor" fill-opacity=".2" />';
const looses = async (text, G) => (await measuredChecks([{ name: "billing", text }], G)).failures.filter((f) => f.rule === "loose").map((f) => `${f.got} → ${f.want}`);

test("loose: a detail inside a body ends a stroke inside its contour", async () => {
  assert.deepEqual(await looses(s16(`${CARD}<path d="M2 8H14" />`), 16), ["path@2 touches rect@1 → end it ≥ 1 stroke inside the contour"]);
  assert.deepEqual(await looses(s16(`${CARD}<path d="M3.5 8H12.5" />`), 16), ["path@2 0.5 strokes from rect@1 → ≥ 1 stroke inside the contour"]);
  assert.deepEqual(await looses(s16(`${CARD}<path d="M4 8H12" />`), 16), []);
});

test("loose: a part meeting the body from outside is not a detail", async () => {
  assert.deepEqual(await looses(s16(`${CARD}<path d="M14 8H15" />`), 16), []);
});

test("loose: a detail and its body are loose's, not gap's", async () => {
  assert.deepEqual(await gaps(s16(`${CARD}<path d="M4 8H12" />`), 16), []);
});

test("loose: at 48 the tone is the body, and its contour is not held apart by gap", async () => {
  const body = '<rect x="5" y="9" width="38" height="30" rx="6" fill="#ececea" stroke="none" /><rect x="5" y="9" width="38" height="30" rx="6" stroke-width="2" />';
  assert.deepEqual(await looses(s48(`${body}<path d="M5 24H43" />`), 48), ["path@3 touches rect@1 → end it ≥ 1 stroke inside the contour"]);
  assert.deepEqual(await looses(s48(`${body}<path d="M9 24H39" />`), 48), []);
  assert.deepEqual(await gaps(s48(`${body}<path d="M9 24H39" />`), 48), []);
});
```

At 48 `M9 24H39` is 4 from the contour's centreline: 4 − (2 + 1.5) / 2 = 2.25 ≥ 1.5, and gap would have passed it too; `M5 24H43` crosses it.

- [ ] **Step 2: Run them to see them fail**

Run: `rtk test node --test test/pretty-icons/geometry.test.mjs test/pretty-icons/check.test.mjs`
Expected: FAIL: `interior` is not exported; no `loose` lines; gap reports `rect@1 to path@2 1 apart` for the card's detail.

- [ ] **Step 3: Implement the geometry**

Append to `skills/pretty-icons/geometry.mjs`:

```js
/** The point halfway along an element's length, its parts in order (the jump between subpaths is not length). */
export function midpoint(el) {
  const segs = [];
  for (const part of sampleParts(el, 0.05)) for (let i = 1; i < part.length; i++) segs.push([part[i - 1], part[i], Math.hypot(part[i][0] - part[i - 1][0], part[i][1] - part[i - 1][1])]);
  if (!segs.length) return sampleParts(el, 0.05).flat()[0];
  let rest = segs.reduce((n, s) => n + s[2], 0) / 2;
  for (const [a, b, l] of segs) {
    if (rest <= l) { const t = l ? rest / l : 0; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
    rest -= l;
  }
  return segs.at(-1)[1];
}

/** Whether a point lies inside a closed polygon, even-odd. */
export function inside([x, y], poly) {
  let n = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) n = !n;
  }
  return n;
}

/** The filled body an element's midpoint lies inside (each subpath of the body even-odd), or null. */
export function interior(el, bodies) {
  const m = midpoint(el);
  return bodies.find((b) => sampleParts(b, 0.05).reduce((n, part) => n !== inside(m, part), false)) ?? null;
}

/** The least edge-to-edge distance from an element to a body's outline, each at its stroke width. */
export const clearance = (el, body, wEl, wBody) => minDistance(sampleParts(el, 0.05).flat(), sampleParts(body, 0.05).flat()) - (wEl + wBody) / 2;
```

(`sampleParts` and `minDistance` are in this file already.)

- [ ] **Step 4: Implement `loose` in `measure.mjs`**

In `presets.mjs`, after `AIR`:

```js
/** A detail inside a body ends at least this many strokes inside its contour, edge to edge. */
export const LOOSE = 1;
```

In `measure.mjs`, import `LOOSE` from `./presets.mjs`, `geometryKey` from `./svg.mjs` (with `num`, from Task 2), and `interior` from `./geometry.mjs`. Add above `measuredChecks` (the file already binds `details`, the per-icon set of marks, so this is `interiorDetails`):

```js
const isNone = (v) => v === undefined || String(v).trim().toLowerCase() === "none";

/**
 * An icon's interior details: an unfilled, uncut stroke whose midpoint lies inside a filled body.
 * The bodies: at the filled finish its tones (read at the contour's width) and shapes; in duotone
 * every currentColor-filled element. Each detail comes back with its body and the widths to read them at.
 */
function interiorDetails(parsed, els, p, c, rootW) {
  const filled = p.finish === "filled", own = (el) => num(el.attrs, "stroke-width", rootW);
  const bodies = filled ? [...c.tones, ...c.shapes] : els.filter((el) => String(el.attrs.fill ?? "").trim().toLowerCase() === "currentcolor");
  const widthOf = (b) => (filled && c.tones.includes(b) ? p.contour : own(b));
  const keys = new Set(bodies.map(geometryKey));
  const candidates = (filled ? [...c.lines, ...c.marks] : els.filter((el) => isNone(el.attrs.fill ?? parsed.attrs.fill)))
    .filter((el) => !("data-cut" in el.attrs) && !keys.has(geometryKey(el)));
  const out = [];
  for (const el of candidates) {
    const body = interior(el, bodies);
    if (body) out.push({ el, body, w: own(el), wb: widthOf(body) });
  }
  return out;
}
```

`classify` keeps a tone's contour in `c.contours`, so a contour is never a candidate; in duotone a body is its own contour and is left out by `keys`.

In the per-icon `try`, after `c` and `rootW`:

```js
      const inner = interiorDetails(parsed, els, p, c, rootW), innerAt = new Set(inner.map((x) => x.el.at));
      // a detail and its body (and the body's contour, the same geometry) are loose's, not gap's
      const skip = new Set();
      for (const { el, body } of inner) for (const x of els) if (geometryKey(x) === geometryKey(body)) skip.add(`${el.at}|${x.at}`).add(`${x.at}|${el.at}`);
```

Push them with the rest: `measures.push({ ...s, els, parts, details, paint, m, modified, share, rootW, inner, innerAt, skip });`, and destructure `inner` and `skip` in the second loop (`innerAt` is Task 4's). In the second loop, before the gap pairs:

```js
    // loose: a detail inside a body stops a stroke inside its contour
    for (const { el, body, w, wb } of inner) {
      const centre = minDistance(sampleParts(el, 0.05).flat(), sampleParts(body, 0.05).flat()), edge = centre - (w + wb) / 2;
      if (centre <= TOUCH || edge < 0) fail(failures, "loose", name, `${el.at} touches ${body.at}`, `end it ≥ ${LOOSE} stroke inside the contour`);
      else if (edge < LOOSE * p.stroke - 1e-9) fail(failures, "loose", name, `${el.at} ${(edge / p.stroke).toFixed(1)} strokes from ${body.at}`, `≥ ${LOOSE} stroke inside the contour`);
    }
```

and in the `gap` closure, right after `ka` and `kb`:

```js
      if (skip.has(`${ka}|${kb}`)) return;
```

Add to the file's header comment: "loose: an unfilled stroke whose midpoint lies inside a filled body is an interior detail; it stops one stroke inside the body's contour, edge to edge, and gap leaves that pair to it."

- [ ] **Step 5: Run the suite and keep it green**

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: the new tests PASS. An example or required fixture refused by `loose` gets its detail shortened by 0.25 steps until it passes (a duotone stripe or title bar that ran edge to edge now stops short); the commit names each. `check.mjs` on both examples: `ok`.

The croissant in `rules-filled.md` 04 counts as a fixture: `docs.test.mjs` pastes its svg block into a folder and checks it. If it is refused, fix the svg block in the doc the same way (its seams sit 3 from the contour's centreline; loose wants 3.25), then update its prose (`3 from its centreline`) and the line ink both the doc and `docs.test.mjs` quote (`279.6`) to what the test now prints.

- [ ] **Step 6: Commit**

```bash
rtk git add skills/pretty-icons test/pretty-icons
rtk git commit -m "feat: loose, a detail inside a body stops a stroke short of its contour"
```

---

### Task 4: Air

**Files:**
- Modify: `skills/pretty-icons/presets.mjs` (add `COUNTER`, `AIR_AREA`, `AIR_TOL`)
- Modify: `skills/pretty-icons/raster.mjs` (add `edt`, `air`)
- Modify: `skills/pretty-icons/measure.mjs` (the `air` lines)
- Test: `test/pretty-icons/raster.test.mjs`, `test/pretty-icons/check.test.mjs`

**Interfaces:**
- Consumes: `AIR` (Task 2); `innerAt` per measured entry (Task 3).
- Produces: `edt(mask, W, H) → Float64Array`, `air(svgText, G, stroke) → [{ kind: "paper"|"counter", across, area, at: [x, y] }]` from `raster.mjs`; `COUNTER = 2`, `AIR_AREA = 1`, `AIR_TOL = 0.25` from `presets.mjs`.

- [ ] **Step 1: Write the failing tests**

Append to `test/pretty-icons/raster.test.mjs` (import `air` from `raster.mjs`):

```js
const one = (b) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">${b}</svg>`;

test("air: paper under 1.5 strokes between two lines is one region, at its centre", async () => {
  const r = await air(one('<path d="M3 7H13" /><path d="M3 9H13" />'), 16, 1);
  assert.equal(r.length, 1);
  assert.equal(r[0].kind, "paper");
  assert.ok(r[0].across < 1.5, `across ${r[0].across}`);
  assert.deepEqual(r[0].at, [8, 8]);
  assert.deepEqual(await air(one('<path d="M3 6.5H13" /><path d="M3 9.5H13" />'), 16, 1), []);
});

test("air: a counter under 2 strokes is reported, a speck is not, 2 and over passes", async () => {
  const counter = await air(one('<circle cx="8" cy="8" r="1.25" />'), 16, 1);
  assert.deepEqual(counter.map((x) => x.kind), ["counter"]);
  assert.ok(counter[0].across < 2 - 0.25);
  assert.deepEqual(await air(one('<circle cx="8" cy="8" r="1" />'), 16, 1), []);
  assert.deepEqual(await air(one('<circle cx="8" cy="8" r="1.75" />'), 16, 1), []);
});

test("air: a filled body, a V and a T leave no narrow paper", async () => {
  assert.deepEqual(await air(one('<rect x="2" y="2" width="12" height="12" rx="1.5" fill="currentColor" />'), 16, 1), []);
  assert.deepEqual(await air(one('<path d="M3 3L8 13L13 3" />'), 16, 1), []);
  assert.deepEqual(await air(one('<path d="M3 3H13M8 3V13" />'), 16, 1), []);
});
```

A hole of `2r − stroke` is 1 (speck, under `AIR_AREA`), 1.5 (a counter) and 2.5 (passes) for r 1, 1.25 and 1.75.

Append to `test/pretty-icons/check.test.mjs`:

```js
const airs = async (text, G) => (await measuredChecks([{ name: "oil", text }], G)).failures.filter((f) => f.rule === "air").map((f) => `${f.got} → ${f.want}`);

test("air: check names the narrow paper and its move", async () => {
  assert.deepEqual(await airs(s16('<path d="M3 7H13" /><path d="M3 9H13" />'), 16), ["paper 1.1 strokes wide at 8, 8 → ≥ 1.5 apart, or touching"]);
  assert.deepEqual(await airs(s16('<circle cx="8" cy="8" r="1.25" />'), 16), ["counter 1.5 strokes across at 8, 8 → ≥ 2 across"]);
});

test("air: an interior detail is loose's, so air reads the body without it", async () => {
  assert.deepEqual(await airs(s16(`${CARD}<path d="M4 8H12" />`), 16), []);
});
```

If the printed `across` differs in its decimal from these (the rasteriser's anti-aliasing), run the check and set the expected line to what it prints, keeping `< 1.5` and `< 2` true; the raster tests above pin the bounds.

- [ ] **Step 2: Run them to see them fail**

Run: `rtk test node --test test/pretty-icons/raster.test.mjs test/pretty-icons/check.test.mjs`
Expected: FAIL: `air` is not exported; no `air` lines.

- [ ] **Step 3: Implement `air` in `raster.mjs`**

In `presets.mjs`, after `LOOSE`:

```js
/** A closed counter (a hole, an eye, a ring's inside) is at least this many strokes across. */
export const COUNTER = 2;
/** Air reports a narrow region of at least this many square strokes; smaller is anti-aliasing. */
export const AIR_AREA = 1;
/** A counter within this many strokes of COUNTER passes: the raster reads a hole a little small. */
export const AIR_TOL = 0.25;
```

In `raster.mjs`, add `AIR, COUNTER, AIR_AREA, AIR_TOL` to the import from `./presets.mjs`, then append:

```js
// Air is read at 8 px a stroke; a pixel darker than 0.6 is ink (the line and mark tones; fill, shade and paper are paper).
const PX = 8, INK_LUMA = 0.6;

// Felzenszwalb and Huttenlocher's exact squared distance transform, one dimension.
function edt1d(f, n, d, v, z) {
  let k = 0;
  v[0] = 0; z[0] = -Infinity; z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
    k++; v[k] = q; z[k] = s; z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) ** 2 + f[v[k]]; }
}

/** Each pixel's Euclidean distance, in pixels, to the nearest set pixel of `mask`. */
export function edt(mask, W, H) {
  const BIG = 1e12, out = new Float64Array(W * H), n = Math.max(W, H);
  const f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
  for (let x = 0; x < W; x++) { for (let y = 0; y < H; y++) f[y] = mask[y * W + x] ? 0 : BIG; edt1d(f, H, d, v, z); for (let y = 0; y < H; y++) out[y * W + x] = d[y]; }
  for (let y = 0; y < H; y++) { for (let x = 0; x < W; x++) f[x] = out[y * W + x]; edt1d(f, W, d, v, z); for (let x = 0; x < W; x++) out[y * W + x] = Math.sqrt(d[x]); }
  return out;
}

// 4-connected regions of a mask, each with whether it reaches the image's border.
function components(mask, W, H) {
  const seen = new Uint8Array(W * H), out = [];
  for (let i = 0; i < W * H; i++) {
    if (!mask[i] || seen[i]) continue;
    const stack = [i], px = [];
    let border = false;
    seen[i] = 1;
    while (stack.length) {
      const j = stack.pop(), x = j % W, y = (j - x) / W;
      px.push(j);
      if (x === 0 || y === 0 || x === W - 1 || y === H - 1) border = true;
      for (const k of [x > 0 ? j - 1 : -1, x < W - 1 ? j + 1 : -1, y > 0 ? j - W : -1, y < H - 1 ? j + W : -1])
        if (k >= 0 && mask[k] && !seen[k]) { seen[k] = 1; stack.push(k); }
    }
    out.push({ px, border });
  }
  return out;
}

/**
 * The paper an icon squeezes: rendered at 8 px a stroke on white, the paper is opened at radius
 * AIR/2 strokes, and what the opening cannot reach is narrow. An enclosed paper region under
 * COUNTER (less AIR_TOL) strokes across is a counter, reported whole; anything under AIR_AREA
 * square strokes is left out. Sizes in strokes, places in grid units.
 */
export async function air(svgText, G, stroke) {
  const unit = PX / stroke, size = Math.round(G * unit), pad = PX;
  const { width, height, pixels } = render(svgText, size, { background: "#ffffff" });
  const W = width + 2 * pad, H = height + 2 * pad, ink = new Uint8Array(W * H);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    if ((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3 / 255 < INK_LUMA) ink[(y + pad) * W + x + pad] = 1;
  }
  const dt = edt(ink, W, H);
  const at = (px) => {
    let sx = 0, sy = 0;
    for (const j of px) { sx += (j % W) + 0.5; sy += Math.floor(j / W) + 0.5; }
    return [+((sx / px.length - pad) / unit).toFixed(2), +((sy / px.length - pad) / unit).toFixed(2)];
  };
  const widest = (px) => { let m = 0; for (const j of px) if (dt[j] > m) m = dt[j]; return (2 * m + 1) / PX; };
  const out = [], counter = new Uint8Array(W * H), paper = Uint8Array.from(ink, (v) => 1 - v);
  for (const c of components(paper, W, H)) {
    if (c.border) continue;
    const across = widest(c.px), area = c.px.length / PX / PX;
    if (across >= COUNTER - AIR_TOL) continue;
    for (const j of c.px) counter[j] = 1;
    if (area >= AIR_AREA) out.push({ kind: "counter", across: +across.toFixed(2), area: +area.toFixed(2), at: at(c.px) });
  }
  const r = (AIR / 2) * PX, reach = edt(Uint8Array.from(dt, (v) => (v >= r ? 1 : 0)), W, H);
  const narrow = Uint8Array.from(ink, (v, i) => (!v && !counter[i] && reach[i] > r ? 1 : 0));
  for (const c of components(narrow, W, H)) {
    const area = c.px.length / PX / PX;
    if (area >= AIR_AREA) out.push({ kind: "paper", across: +widest(c.px).toFixed(2), area: +area.toFixed(2), at: at(c.px) });
  }
  return out;
}
```

- [ ] **Step 4: Wire it into `measure.mjs`**

Import `air` from `./raster.mjs` and `AIR, COUNTER` from `./presets.mjs` (AIR is there from Task 2). In the per-icon `try`, after `innerAt`:

```js
      // air reads the base without its interior details: those are loose's, a stroke from the contour
      const narrow = await air(compose(parsed.attrs, els.filter((el) => !innerAt.has(el.at))), G, p.stroke);
```

Add `narrow` to the `measures.push({ … })` object and destructure it in the second loop. There, after the gap pairs:

```js
    // air: paper narrower than AIR strokes between inks that do not touch, or a counter under COUNTER
    for (const a of narrow) {
      if (a.kind === "paper") fail(failures, "air", name, `paper ${a.across.toFixed(1)} strokes wide at ${a.at[0]}, ${a.at[1]}`, `≥ ${AIR} apart, or touching`);
      else fail(failures, "air", name, `counter ${a.across.toFixed(1)} strokes across at ${a.at[0]}, ${a.at[1]}`, `≥ ${COUNTER} across`);
    }
```

Add to the header comment: "air: the paper rendered at 8 px a stroke, opened at radius 0.75 stroke; what stays narrow, or a hole under 2 strokes, is named with its place. Gap and air may both name one pair of parallel lines."

- [ ] **Step 5: Run the suite and keep it green**

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: the new tests PASS. Where an example or required fixture is refused by `air`, open the paper: move a line 0.25 at a time, widen a counter, or drop the detail; the commit names each. `check.mjs` on both examples: `ok`.

The croissant in `rules-filled.md` 04 counts as a fixture: `docs.test.mjs` pastes its svg block into a folder and checks it. If it is refused, fix the svg block in the doc the same way (its seams sit 3 from the contour's centreline; loose wants 3.25), then update its prose (`3 from its centreline`) and the line ink both the doc and `docs.test.mjs` quote (`279.6`) to what the test now prints.

- [ ] **Step 6: Commit**

```bash
rtk git add skills/pretty-icons test/pretty-icons
rtk git commit -m "feat: air, narrow paper and tight counters named with their place"
```

---

### Task 5: Bend

**Files:**
- Modify: `skills/pretty-icons/presets.mjs` (add `BEND`)
- Modify: `skills/pretty-icons/curve.mjs` (header, `tightest`, `curveFailures(icon, el, stroke)`)
- Modify: `skills/pretty-icons/check.mjs:131`, `skills/pretty-icons/shapes.mjs:201, 306`
- Test: `test/pretty-icons/curve.test.mjs`, `test/pretty-icons/shapes.test.mjs`

**Interfaces:**
- Produces: `BEND = 1` from `presets.mjs`; `tightest(seg) → { r, t, at: [x, y] } | null` and `curveFailures(icon, el, stroke?)` from `curve.mjs` (bend measured only when `stroke` is given); the line `bend  icon  path@N radius R at x, y → ≥ S, or a cusp`.

- [ ] **Step 1: Write the failing tests**

Append to `test/pretty-icons/curve.test.mjs` (it has `el(d)`; import `curveFailures` if it does not):

```js
const bends = (d, stroke) => curveFailures("pao", el(d), stroke).filter((f) => f.rule === "bend");

test("bend: a curve tighter than a stroke's radius is refused, with its radius and place", () => {
  const f = bends("M8 7.5C8.276 7.5 8.5 7.724 8.5 8", 1);
  assert.equal(f.length, 1);
  assert.match(f[0].got, /^path@\d+ radius 0\.5 at [\d.]+, [\d.]+$/);
  assert.equal(f[0].want, "≥ 1, or a cusp");
});

test("bend: read only when the stroke is given", () => {
  assert.deepEqual(bends("M8 7.5C8.276 7.5 8.5 7.724 8.5 8"), []);
});

test("bend: a zero-length handle and a cusp inside a cubic are not refused", () => {
  assert.deepEqual(bends("M0 0C0 0 4 0 4 4", 1.5), []);
  assert.deepEqual(bends("M0 0C4 4 0 4 4 0", 1.5), []);
});
```

Append to `test/pretty-icons/shapes.test.mjs` (import `preset` from `presets.mjs`):

```js
test("bend: every primitive is clean at every grid, at the grid's stroke", () => {
  for (const grid of [16, 20, 24, 48]) for (const name of [...ANCHORED, "wedge", "scoop"]) {
    const { d } = shape(name, { grid });
    assert.deepEqual(curveFailures(name, { tag: "path", attrs: { d }, at: "path@1" }, preset(grid).stroke), [], `${name} at ${grid}: ${d}`);
  }
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `rtk test node --test test/pretty-icons/curve.test.mjs test/pretty-icons/shapes.test.mjs`
Expected: FAIL: the 0.5 radius is not refused. (The shapes test passes already; it guards Step 3.)

- [ ] **Step 3: Implement**

In `presets.mjs`, after `AIR_TOL`:

```js
/** A smooth curve's tightest radius, in strokes: tighter reads as a kink at display size. */
export const BEND = 1;
```

In `curve.mjs`, import `BEND` with `preset`, add a line to the header comment after `inflection`:

```
 *   bend        a cubic's tightest radius of curvature, sampled where the curve moves at speed: under one
 *               stroke it reads as a kink. A cusp is a corner on purpose, and a slow stretch (a short or
 *               zero handle) is not read.
```

and add before `curveFailures`:

```js
const SAMPLES = 64;
/** A cubic's tightest radius of curvature, read at 65 samples where it moves at half its mean speed or more; null for any other segment. */
export function tightest(seg) {
  if (seg.kind !== "cubic") return null;
  const [p0, p1, p2, p3] = seg.p;
  const d1 = (t) => { const u = 1 - t; return [0, 1].map((k) => 3 * u * u * (p1[k] - p0[k]) + 6 * u * t * (p2[k] - p1[k]) + 3 * t * t * (p3[k] - p2[k])); };
  const d2 = (t) => [0, 1].map((k) => 6 * (1 - t) * (p2[k] - 2 * p1[k] + p0[k]) + 6 * t * (p3[k] - 2 * p2[k] + p1[k]));
  const ts = Array.from({ length: SAMPLES + 1 }, (_, i) => i / SAMPLES), speeds = ts.map((t) => len(d1(t)));
  const mean = speeds.reduce((a, b) => a + b, 0) / speeds.length;
  let best = null;
  ts.forEach((t, i) => {
    if (speeds[i] < mean / 2) return;
    const c = Math.abs(cross(d1(t), d2(t)));
    if (c < 1e-12) return;
    const r = speeds[i] ** 3 / c;
    if (!best || r < best.r) { const u = 1 - t; best = { r, t, at: [0, 1].map((k) => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]) }; }
  });
  return best;
}
```

(`len` and `cross` are the file's helpers.) Change `curveFailures`:

```js
/** The join, inflection and (with the grid's stroke) bend failures of one element; a path the reader cannot read is the elements rule's. */
export function curveFailures(icon, el, stroke) {
```

and before `return out;`:

```js
  if (stroke) for (const s of subs.flatMap((x) => x.segs)) {
    const b = tightest(s);
    if (b && b.r < BEND * stroke - 1e-9) out.push({ rule: "bend", icon, got: `${el.at} radius ${fmt(b.r)} at ${fmt(b.at[0])}, ${fmt(b.at[1])}`, want: `≥ ${fmt(BEND * stroke)}, or a cusp` });
  }
```

Pass the stroke at the callers:
- `check.mjs:131`: `failures.push(...curveFailures(icon, el, p?.stroke));`
- `shapes.mjs:201`: `const failures = curveFailures(name, { tag: "path", attrs: { d }, at: "path@1" }, p.stroke);`
- `shapes.mjs:306` (`finishOf`'s `kinks`): `curveFailures(name, { tag: "path", attrs: { d }, at: "path@1" }, preset(G).stroke)`.
- `shapes.mjs:370` (`repair`, no grid) stays without a stroke.

- [ ] **Step 4: Run the suite and keep it green**

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: all PASS. A primitive refused by `shape()` for bend is a defect to fix in its anchors, not by loosening `BEND`. An example or required fixture refused gets its curve eased (a longer handle, or a cusp where the corner is meant); the commit names each. `check.mjs` on both examples: `ok`.

The croissant in `rules-filled.md` 04 counts as a fixture: `docs.test.mjs` pastes its svg block into a folder and checks it. If it is refused, fix the svg block in the doc the same way (its seams sit 3 from the contour's centreline; loose wants 3.25), then update its prose (`3 from its centreline`) and the line ink both the doc and `docs.test.mjs` quote (`279.6`) to what the test now prints.

- [ ] **Step 5: Commit**

```bash
rtk git add skills/pretty-icons test/pretty-icons
rtk git commit -m "feat: bend, a smooth curve no tighter than one stroke's radius"
```

---

### Task 6: Diagonal

**Files:**
- Modify: `skills/pretty-icons/presets.mjs` (add `DIAGONAL`)
- Modify: `skills/pretty-icons/raster.mjs` (add `elongation`)
- Modify: `skills/pretty-icons/measure.mjs` (the `diagonal` lines)
- Test: `test/pretty-icons/raster.test.mjs`, `test/pretty-icons/check.test.mjs`

**Interfaces:**
- Produces: `elongation(svgText, G) → { ratio, angle }` from `raster.mjs` (angle in degrees, 45 for lower-left to upper-right, −45 for upper-left to lower-right); `DIAGONAL = { share: 0.3, ratio: 2, tol: 10 }` from `presets.mjs`.

- [ ] **Step 1: Write the failing tests**

Append to `test/pretty-icons/raster.test.mjs` (import `elongation`; `one` is from Task 4):

```js
test("elongation: a 45° line is long and at 45°; the other way is −45; a disc is round", async () => {
  const up = await elongation(one('<path d="M3 13L13 3" />'), 16);
  assert.ok(up.ratio > 2 && Math.abs(up.angle - 45) <= 1, JSON.stringify(up));
  const down = await elongation(one('<path d="M3 3L13 13" />'), 16);
  assert.ok(Math.abs(down.angle + 45) <= 1, JSON.stringify(down));
  assert.ok((await elongation(one('<circle cx="8" cy="8" r="6" />'), 16)).ratio < 1.1);
  assert.deepEqual(await elongation(one(""), 16), { ratio: 1, angle: 0 });
});
```

Append to `test/pretty-icons/check.test.mjs`:

```js
const LONG = s16('<path d="M3 13L13 3" />'), ROUND = s16('<circle cx="8" cy="8" r="6.5" />');
const diagonals = async (texts) => (await measuredChecks(texts.map((text, i) => ({ name: `i${i}`, text })), 16)).failures.filter((f) => f.rule === "diagonal").map((f) => `${f.icon}  ${f.got} → ${f.want}`);

test("diagonal: at most three in ten", async () => {
  assert.deepEqual(await diagonals([...Array(4).fill(LONG), ...Array(6).fill(ROUND)]), ["set  4 of 10 on the diagonal (i0, i1, i2, i3) → at most 3"]);
  assert.deepEqual(await diagonals([...Array(3).fill(LONG), ...Array(7).fill(ROUND)]), []);
});

test("diagonal: a set of one or two may hold one", async () => {
  assert.deepEqual(await diagonals([LONG]), []);
  assert.deepEqual(await diagonals([LONG, ROUND]), []);
  assert.deepEqual(await diagonals([LONG, LONG]), ["set  2 of 2 on the diagonal (i0, i1) → at most 1"]);
});

test("diagonal: never upper-left to lower-right", async () => {
  assert.deepEqual(await diagonals([s16('<path d="M3 3L13 13" />')]), ["i0  upper-left to lower-right → lower-left to upper-right"]);
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `rtk test node --test test/pretty-icons/raster.test.mjs test/pretty-icons/check.test.mjs`
Expected: FAIL: `elongation` is not exported; no `diagonal` lines.

- [ ] **Step 3: Implement**

In `presets.mjs`, after `BEND`:

```js
/** An elongated icon (principal axes at `ratio` or more) within `tol`° of 45 lies on the diagonal; a set holds at most `share` of them, and at least one is allowed. */
export const DIAGONAL = { share: 0.3, ratio: 2, tol: 10 };
```

Append to `raster.mjs`:

```js
/**
 * The ink's principal axes, from its second moments at 8 px a unit: the ratio of the long axis to
 * the short, and the long axis's angle in degrees, 45 rising to the right, −45 falling. No ink is round.
 */
export async function elongation(svgText, G) {
  const S = 8, { width, height, pixels } = render(svgText, G * S);
  let m = 0, sx = 0, sy = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) { const a = pixels[(y * width + x) * 4 + 3] / 255; m += a; sx += a * x; sy += a * y; }
  if (!m) return { ratio: 1, angle: 0 };
  const cx = sx / m, cy = sy / m;
  let xx = 0, yy = 0, xy = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const a = pixels[(y * width + x) * 4 + 3] / 255;
    xx += a * (x - cx) ** 2; yy += a * (y - cy) ** 2; xy += a * (x - cx) * (y - cy);
  }
  xx /= m; yy /= m; xy /= m;
  const tr = (xx + yy) / 2, det = Math.sqrt(((xx - yy) / 2) ** 2 + xy * xy), l1 = tr + det, l2 = Math.max(tr - det, 1e-9);
  // y grows down the image, so the angle is negated to read as on paper
  let angle = (-0.5 * Math.atan2(2 * xy, xx - yy) * 180) / Math.PI;
  if (angle <= -90) angle += 180;
  if (angle > 90) angle -= 180;
  return { ratio: +Math.sqrt(l1 / l2).toFixed(2), angle: +angle.toFixed(1) };
}
```

In `measure.mjs`, import `elongation` from `./raster.mjs` and `DIAGONAL` from `./presets.mjs`. In the per-icon `try`, after `m`:

```js
      const e = await elongation(filled ? objectOf(base) : base, G);
```

and add `e` to the `measures.push({ … })` object. After the second loop, before weight:

```js
  // diagonal: an elongated icon may lie at 45°, lower-left to upper-right, in a share of the set; never the other way
  const long = measures.filter((x) => x.e.ratio >= DIAGONAL.ratio);
  for (const x of long) if (Math.abs(x.e.angle + 45) <= DIAGONAL.tol) fail(failures, "diagonal", x.name, "upper-left to lower-right", "lower-left to upper-right");
  const diag = long.filter((x) => Math.abs(x.e.angle - 45) <= DIAGONAL.tol), cap = Math.max(1, Math.round(DIAGONAL.share * measures.length));
  if (diag.length > cap) fail(failures, "diagonal", "set", `${diag.length} of ${measures.length} on the diagonal (${diag.map((x) => x.name).join(", ")})`, `at most ${cap}`);
```

Add to the header comment: "diagonal: the base's ink axes; an elongated icon at 45° rising to the right counts, a set holds at most max(1, round(0.3 × N)), and one falling to the right is refused."

- [ ] **Step 4: Run the suite and keep it green**

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: all PASS. An example or fixture refused for a falling diagonal is mirrored left to right; the commit names it. `check.mjs` on both examples: `ok`.

- [ ] **Step 5: Commit**

```bash
rtk git add skills/pretty-icons test/pretty-icons
rtk git commit -m "feat: diagonal, at most three in ten at 45 degrees and none falling"
```

---

### Task 7: The offset shadow

At the filled finish, a set may cast a shadow: a shade copy of every element, 1.5 down and right, under the icon. `shadow.mjs` writes it and takes it off; `check.mjs` reads every other rule without it, and names a copy that is missing, moved, extra or out of order, and a set shadowed in part.

**Files:**
- Create: `skills/pretty-icons/shadow.mjs`
- Modify: `skills/pretty-icons/presets.mjs` (add `SHADOW`)
- Modify: `skills/pretty-icons/check.mjs` (header, imports, `textChecks` reads `own`, `shadowFailures`, the set line, notes and columns without shadows)
- Modify: `skills/pretty-icons/measure.mjs` (shadows out of `els` and `base`, `shadowed`, live runs `SHADOW` further)
- Modify: `skills/pretty-icons/filled.mjs:75` (the stray-transform message)
- Modify: `skills/pretty-icons/modifiers.mjs` (import `isShadow`; `addModifier` refuses a shadowed icon; the halo loop skips shadows)
- Modify: `skills/pretty-icons/rules-filled.md:90` (the transform quote)
- Test: `test/pretty-icons/shadow.test.mjs` (create), `test/pretty-icons/filled.test.mjs:113-117`

**Interfaces:**
- Consumes: `PALETTE.shade` and `GRIDS`, `preset` from `presets.mjs`; `parse`, `G`, `GEOMETRY_ATTRS`, `geometryKey` from `svg.mjs`; the `measures` entries of Tasks 2–6 (`{ ...s, els, parts, details, paint, m, modified, share, rootW, inner, innerAt, skip, narrow, e }`).
- Produces, from `shadow.mjs`: `isShadow(el) → boolean`; `MOVE = "translate(1.5 1.5)"`; `copyOf(el, rootAttrs) → { tag, attrs }`; `shadowOn(svgText) → svgText` (throws `ShadowError` off the filled finish); `shadowOff(svgText) → svgText`; `shadowFailures(icon, parsed, G) → failure[]` (rule `shadow`); `shadowFolder(folder, on) → count` (reads and judges every file before writing any); `ShadowError`; `USAGE`. `SHADOW = 1.5` from `presets.mjs`. Each `measures` entry also carries `shadowed`. Task 9 uses `shadowOn`, `shadowOff`; Task 10 quotes the failure lines.
- `shadow.mjs` imports only `presets.mjs` and `svg.mjs`: never `check.mjs`, which imports it.

- [ ] **Step 1: Write the failing tests**

Create `test/pretty-icons/shadow.test.mjs`:

```js
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
```

In `test/pretty-icons/filled.test.mjs`, the test `construction: no offset shadow, no highlight` (line 113) becomes:

```js
test("construction: no hand-drawn shadow, no highlight", () => {
  const shadow = check(LIGHT.replace(TONE, `${TONE.replace("#ececea", "#cfcfcb").replace(" />", ' transform="translate(3 3)" />')}\n  ${TONE}`));
  assert.ok(lines(shadow).includes("construction  traffic-light  rect@3 transform → not set: shadow.mjs --on writes the shadow"), lines(shadow).join("\n"));
  assert.deepEqual(lines(check(add('<path d="M17 10V16" stroke="#ffffff" />'))), ["construction  traffic-light  path@9 stroke #ffffff → no highlight: paper only as a fill (glass, a lamp that is off)"]);
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `rtk test node --test test/pretty-icons/shadow.test.mjs test/pretty-icons/filled.test.mjs`
Expected: FAIL: `Cannot find module …/shadow.mjs`; filled's transform message is still `no offset shadow: the shade sits inside the body`.

- [ ] **Step 3: Write `shadow.mjs` and `SHADOW`**

Append to `skills/pretty-icons/presets.mjs`:

```js
/** How far the offset shadow sits from the icon, down and right, in grid units (the filled finish only). */
export const SHADOW = 1.5;
```

Create `skills/pretty-icons/shadow.mjs`:

```js
#!/usr/bin/env node
/**
 * The offset shadow, at the filled finish, chosen per set: `node shadow.mjs <folder> --on|--off`.
 * --on puts a copy of every element first in each file, one per line, moved SHADOW down and right and
 * painted in the shade tone, each marked data-shadow=""; --off takes them out, and the file is byte for
 * byte as it was before --on. The drawer never draws a shadow: check.mjs names a copy that is missing,
 * extra, moved or out of order, and a set shadowed in part.
 */
import { readdirSync, readFileSync, writeFileSync, realpathSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { preset, GRIDS, PALETTE, SHADOW } from "./presets.mjs";
import { parse, G as gridOf, GEOMETRY_ATTRS, geometryKey } from "./svg.mjs";

export class ShadowError extends Error {}
const refuse = (m) => { throw new ShadowError(m); };
export const isShadow = (el) => !!el && "data-shadow" in el.attrs;
export const MOVE = `translate(${SHADOW} ${SHADOW})`;
// a copy is one element on a line of its own: --off takes the line out with its newline
const OFF = /\n[ \t]*<[^>]*\sdata-shadow=""[^>]*\/>/g;
const ROOT = /<svg\b[^>]*>/;
const isNone = (v) => v !== undefined && String(v).trim().toLowerCase() === "none";

/** An element's shadow: its geometry, the shade tone where it paints, a stroke kept at its own width. */
export function copyOf(el, root) {
  const attrs = {};
  for (const [k, v] of Object.entries(el.attrs)) if (GEOMETRY_ATTRS.includes(k)) attrs[k] = v;
  if (el.attrs.fill !== undefined && !isNone(el.attrs.fill)) attrs.fill = PALETTE.shade;
  if (isNone(el.attrs.stroke ?? root.stroke)) attrs.stroke = "none";
  else {
    attrs.stroke = PALETTE.shade;
    if ("stroke-width" in el.attrs) attrs["stroke-width"] = el.attrs["stroke-width"];
  }
  return { tag: el.tag, attrs: { ...attrs, "data-shadow": "", transform: MOVE } };
}
const text = (el) => `<${el.tag} ${Object.entries(el.attrs).map(([k, v]) => `${k}="${v}"`).join(" ")} />`;
// what a copy and an element's expected copy must share
const key = (el) => [geometryKey(el), el.attrs.fill ?? "", el.attrs.stroke ?? "", el.attrs["stroke-width"] ?? ""].join("|");

/** The icon without its shadow. */
export const shadowOff = (svg) => svg.replace(OFF, "");

/** The icon with its shadow, written fresh: on twice is on once. */
export function shadowOn(svg) {
  const clean = shadowOff(svg), parsed = parse(clean), G = gridOf(parsed.attrs);
  if (!GRIDS[G] || preset(G).finish !== "filled") refuse("a shadow at the filled finish only (48)");
  const m = ROOT.exec(clean);
  const end = m.index + m[0].length, indent = /^\n([ \t]*)/.exec(clean.slice(end))?.[1] ?? "";
  const copies = parsed.elements.map((el) => `\n${indent}${text(copyOf(el, parsed.attrs))}`).join("");
  return clean.slice(0, end) + copies + clean.slice(end);
}

/** check.mjs's shadow rule: every element copied once, nothing else, each moved MOVE, all of them first; none in duotone. */
export function shadowFailures(icon, parsed, G) {
  const out = [], f = (got, want) => out.push({ rule: "shadow", icon, got, want });
  const shadows = parsed.elements.filter(isShadow);
  if (!shadows.length) return out;
  if (!GRIDS[G] || preset(G).finish !== "filled") { f("a shadow at the duotone finish", "none"); return out; }
  const own = parsed.elements.filter((el) => !isShadow(el)), again = "re-run shadow.mjs --on";
  for (const s of shadows) if (s.attrs.transform !== MOVE) f(`${s.at} transform ${s.attrs.transform ?? "missing"}`, `${MOVE}: ${again}`);
  const late = own.length ? shadows.find((s) => s.index > own[0].index) : null;
  if (late) f(`${late.at} after ${own[0].at}`, `every shadow first, under the icon: ${again}`);
  // two ways: each element has its copy, and each copy an element
  const left = new Map();
  for (const s of shadows) left.set(key(s), [...(left.get(key(s)) ?? []), s]);
  for (const el of own) if (!left.get(key(copyOf(el, parsed.attrs)))?.shift()) f(`${el.at} not in the shadow`, again);
  for (const s of [...left.values()].flat()) f(`${s.at} not a copy of the icon`, again);
  return out;
}

export const USAGE = "usage: node shadow.mjs <folder> --on|--off";

/** Every icon in the folder read and judged before any is written: one refusal writes nothing. */
export function shadowFolder(folder, on) {
  const dir = resolve(folder), files = readdirSync(dir).filter((f) => f.endsWith(".svg")).sort();
  if (!files.length) refuse(`${folder}: no .svg files`);
  const out = files.map((f) => {
    const svg = readFileSync(join(dir, f), "utf8");
    try { return [join(dir, f), on ? shadowOn(svg) : shadowOff(svg)]; } catch (e) { if (e instanceof ShadowError) refuse(`${f}: ${e.message}`); throw e; }
  });
  for (const [p, svg] of out) writeFileSync(p, svg);
  return out.length;
}

export function main(argv) {
  const folder = argv.find((a) => !a.startsWith("--")), on = argv.includes("--on"), off = argv.includes("--off");
  let isDir = false;
  try { isDir = statSync(folder).isDirectory(); } catch {}
  if (!folder || on === off || !isDir || argv.some((a) => a.startsWith("--") && a !== "--on" && a !== "--off")) { console.error(USAGE); process.exit(1); }
  try {
    console.log(`shadow ${on ? "on" : "off"}: ${shadowFolder(folder, on)} icons`);
  } catch (e) {
    if (!(e instanceof ShadowError)) throw e;
    console.error(`shadow: ${e.message}`);
    process.exit(1);
  }
}

const entry = process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (entry) main(process.argv.slice(2));
```

Notes for the implementer: `OFF` needs each copy on a line of its own, which `shadowOn` guarantees (it writes `"\n" + indent + copy` right after the root tag, the indent the next line's or none). The round trip is byte for byte on a multi-line file (the examples) and a one-line file (`ONE` in the test). A copy's key leaves `transform` out on purpose, so a moved copy is named once, as moved.

- [ ] **Step 4: Read the icon without its shadow in `check.mjs`**

Import it below the modifiers import:

```js
import { isShadow, shadowFailures } from "./shadow.mjs";
```

In `textChecks`, put this just before the element loop that starts `for (const el of parsed.elements) {` and checks `FORBIDDEN_ATTRS`, and make that loop read `own`:

```js
  // the icon's own elements: a shadow copy is shadow.mjs's, judged by shadowFailures alone
  const own = parsed.elements.filter((el) => !isShadow(el));
  for (const el of own) {
```

Then, in the same function:

| Where | Before | After |
| --- | --- | --- |
| grid, radius and the per-path count | `for (const el of parsed.elements) {` | `for (const el of own) {` |
| the base | `elements: parsed.elements.filter((el) => !isModifier(el))` | `elements: own.filter((el) => !isModifier(el))` |
| the zero count | `if (parsed.elements.length === 0) fail(` | `if (own.length === 0) fail(` |
| the curve loop | `const seen = new Set();\n  for (const el of parsed.elements) {` | `const seen = new Set();\n  for (const el of own) {` |

and after `failures.push(...modifierFailures(icon, parsed, expectG));`:

```js
  failures.push(...shadowFailures(icon, parsed, expectG));
```

In `checkSet`, after the line `if (!GRIDS[G]) return { G, failures, measured: true, why: "", rows: [], notes: [] };`:

```js
  // the shadow is the set's: every icon or none
  const shadowed = readable.filter(([, parsed]) => parsed.elements.some(isShadow)).length;
  if (preset(G).finish === "filled" && shadowed && shadowed < readable.length) fail(failures, "shadow", "set", `${shadowed} of ${readable.length} shadowed`, "all or none (shadow.mjs --on|--off)");
  const ownOf = (parsed) => ({ ...parsed, elements: parsed.elements.filter((el) => !isShadow(el)) });
```

and make the notes and columns read the icon without its shadow:

```js
  const notes = readable.flatMap(([name, parsed]) => pixelNotes(name, ownOf(parsed), G));
  const columns = new Map(readable.map(([name, parsed]) => [name, curveColumns(ownOf(parsed).elements)]));
```

Add to the header comment's text rules, after `count`:

```
 *   shadow        the filled finish only, the whole set or none: a copy of every element, first, in the
 *                 shade tone, translate(1.5 1.5), marked data-shadow (shadow.mjs writes it); every
 *                 other rule reads the icon without it
```

- [ ] **Step 5: Measure the icon without its shadow in `measure.mjs`**

Import `isShadow` from `./shadow.mjs` and add `SHADOW` to the `./presets.mjs` import. In the per-icon `try`:

```js
      const els = parsed.elements.filter((el) => !(filled && "transform" in el.attrs) && !isModifier(el) && !isShadow(el));
      const modified = parsed.elements.some(isModifier), shadowed = parsed.elements.some(isShadow);
      const base = !modified && !shadowed ? s.text : compose(parsed.attrs, parsed.elements.filter((el) => !isModifier(el) && !isShadow(el)));
```

(replacing the `els` line and the `modified … base` line; `whole = await measure(s.text, G)` stays the file as written, shadow included, for live). Add `shadowed` to the `measures.push({ … })` object and to the second loop's destructuring. Replace the live lines:

```js
    // live: every pixel of the file; a shadowed icon's shadow may run SHADOW past it, down and right
    const edge = G - p.pad + (shadowed ? SHADOW : 0), lo = p.pad - 0.05, hi = edge + 0.05;
    if (inked && (live.x0 < lo || live.y0 < lo || live.x1 > hi || live.y1 > hi)) fail(failures, "live", name, `ink ${r2(live.x0)},${r2(live.y0)}–${r2(live.x1)},${r2(live.y1)}`, `inside ${p.pad}–${edge}`);
```

- [ ] **Step 6: The stray transform, and modifiers**

`skills/pretty-icons/filled.mjs:75` becomes:

```js
  for (const el of c.shadows) fail(failures, "construction", icon, `${el.at} transform`, "not set: shadow.mjs --on writes the shadow");
```

and in its header comment (line 4) `offset shadow, no highlight` becomes `hand-drawn shadow (shadow.mjs writes one), no highlight`.

In `skills/pretty-icons/modifiers.mjs`, import `isShadow` from `./shadow.mjs`. In `addModifier`, after `if (parsed.elements.some(isModifier)) refuse("it has a modifier already: one per icon");`:

```js
  if (parsed.elements.some(isShadow)) refuse("it has a shadow: take it off with shadow.mjs --off, add the modifier, put it back with --on");
```

In `modifierFailures`'s halo loop:

```js
    if (isModifier(el) || isShadow(el) || isNone(el.attrs.stroke ?? rootStroke)) continue;
```

(Without that skip, the shadow of a stroke the modifier cut sits 1.5 inside the halo: the test `a modifier goes on first` fails with `circle@6 4 inside badge:plus's halo`.)

In `skills/pretty-icons/rules-filled.md:90`, the second quote becomes `` `construction  traffic-light  rect@3 transform → not set: shadow.mjs --on writes the shadow` ``. The rest of the shadow's prose is Task 10's.

- [ ] **Step 7: Run the suite**

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: all PASS, the ten shadow tests among them. `node skills/pretty-icons/check.mjs skills/pretty-icons/examples/garage`: `ok` (the examples stay unshadowed until Task 11 chooses).

- [ ] **Step 8: Commit**

```bash
rtk git add skills/pretty-icons test/pretty-icons
rtk git commit -m "feat: shadow.mjs, the offset shadow per set, written and checked"
```

---

### Task 8: Five soft bodies

`dome`, `sack`, `bubble`, `bell` and `bust` join the kit: the round-topped, gathered and flared bodies a set reached for a rect to draw. `sack` and `bust` pinch in at a neck, so `outline` learns a negative turn.

**Files:**
- Modify: `skills/pretty-icons/shapes.mjs` (header, `outline` line 89, `UNIT`, exports, `NUMERIC`, `USAGE`)
- Test: `test/pretty-icons/shapes.test.mjs`

**Interfaces:**
- Consumes: `insetOf(G)` in `shape()` (Task 1); `curveFailures(icon, el, stroke)` with bend (Task 5).
- Produces: `shape("dome" | "sack" | "bubble" | "bell" | "bust", o)` and the named exports `dome`, `sack`, `bubble`, `bell`, `bust`; flags `--shoulder` (dome), `--neck` (sack, bust), `--tail` (bubble), each 0..1. Task 10 names them in `rules.md` and `SKILL.md`.

- [ ] **Step 1: Record every existing primitive's path**

Before touching `shapes.mjs`, write each existing primitive's `d` to the scratchpad (never the repo):

```bash
rtk proxy node --input-type=module -e '
import { shape } from "./skills/pretty-icons/shapes.mjs";
const out = {};
for (const grid of [16, 20, 24, 48]) for (const n of ["drop", "leaf", "lens", "bean", "crescent", "taper", "wedge", "scoop"]) out[`${n}@${grid}`] = shape(n, { grid }).d;
for (const r of [15, 45, 90]) for (const n of ["drop", "leaf", "lens", "bean", "crescent", "taper"]) out[`${n}r${r}`] = shape(n, { rot: r, w: 36, h: 24 }).d;
out.sharp = shape("taper", { sharp: true }).d;
console.log(JSON.stringify(out));' > "$SCRATCH/shapes-before.json"
```

(`$SCRATCH` is the session scratchpad.)

- [ ] **Step 2: Write the failing tests**

In `test/pretty-icons/shapes.test.mjs`, add `dome, sack, bubble, bell, bust` to the import from `shapes.mjs`, add `import { preset } from "../../skills/pretty-icons/presets.mjs";`, and append:

```js
const SOFT = ["dome", "sack", "bubble", "bell", "bust"];
const bent = (d, grid) => curveFailures("x", { tag: "path", attrs: { d }, at: "path@1" }, preset(grid).stroke);

test("the soft bodies, at every grid, are on the quarter grid with no kink, wobble or tight bend", () => {
  for (const grid of [16, 20, 24, 48]) for (const name of SOFT) {
    const { d } = shape(name, { grid });
    assert.ok(onGrid(d), `${name} at ${grid}: ${d}`);
    assert.deepEqual(bent(d, grid), [], `${name} at ${grid}`);
  }
  for (const [name, o] of [["dome", { shoulder: 0.6 }], ["sack", { neck: 0.35 }], ["bubble", { tail: 0.5 }], ["bust", { neck: 0.3 }]]) assert.deepEqual(bent(shape(name, o).d, 48), [], `${name} ${JSON.stringify(o)}`);
});

test("the soft bodies at 16, as drawn", () => {
  assert.equal(dome({ grid: 16 }).d, "M1.5 14.5L14.5 14.5C14.5 12.75 14.5 11.75 14.5 10C14.5 5.75 12.25 1.5 8 1.5C3.75 1.5 1.5 5.75 1.5 10C1.5 11.75 1.5 12.75 1.5 14.5Z");
  assert.equal(sack({ grid: 16 }).d, "M8 14.5C11.5 14.5 14.5 13 14.5 10C14.5 7.5 12.5 4.75 9.5 5.75C10.75 4.25 11.5 1.5 8 1.5C4.5 1.5 5.25 4.25 6.5 5.75C3.5 4.75 1.5 7.5 1.5 10C1.5 13 4.5 14.5 8 14.5Z");
  assert.equal(bubble({ grid: 16 }).d, "M1.5 7C1.5 3.75 4.75 1.5 8 1.5C11.25 1.5 14.5 3.75 14.5 7C14.5 9.75 13.5 10.75 10 12.75C8.25 13.75 7.25 12.5 5.5 12.25L2.75 14.5C3.75 11.75 1.5 10 1.5 7Z");
  assert.equal(bell({ grid: 16 }).d, "M8 1.5C10.5 1.5 10.75 4.25 12 6.75C13.5 9.75 13.5 11.5 14.5 14.5L1.5 14.5C2.5 11.5 2.5 9.75 4 6.75C5.25 4.25 5.5 1.5 8 1.5Z");
  assert.equal(bust({ grid: 16 }).d, "M11 3.5C12.75 5.5 10.75 7.25 9.25 8.75C12.25 9.75 14.5 9 14.5 14.5L1.5 14.5C1.5 9 3.75 9.75 6.75 8.75C5.25 7.25 3.25 5.5 5 3.5C6.75 1.5 9.25 1.5 11 3.5Z");
});

test("the soft bodies at the filled finish: tone, shade and contour, passing its rules", () => {
  for (const name of SOFT) {
    const els = finishOf(name, { grid: 48 });
    assert.equal(els.length, 3, name);
    const svg = `<svg viewBox="0 0 48 48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${els.join("")}</svg>`;
    assert.deepEqual(filledChecks(name, parse(svg), 48), [], name);
  }
});
```

In the usage test (`the usage names every flag the parser takes…`), add to its `own` map: `dome: ["shoulder"], sack: ["neck"], bubble: ["tail"], bust: ["neck"]`.

- [ ] **Step 3: Run them to see them fail**

Run: `rtk test node --test test/pretty-icons/shapes.test.mjs`
Expected: FAIL: `dome` is not exported; `no primitive "dome"`; the usage has no line for `dome`.

- [ ] **Step 4: Let `outline` take a negative turn**

In `outline` (`shapes.mjs:89`), replace:

```js
    const ext = 180 - angle(d, e), tt = Math.max(0, Math.min(a.turn ?? turn, (ext - 34) / 2));
```

with:

```js
    // a turn below 0 flares both handles outward, unclamped: a neck pinched in (sack, bust)
    const ext = 180 - angle(d, e), tw = a.turn ?? turn, tt = tw < 0 ? tw : Math.max(0, Math.min(tw, (ext - 34) / 2));
```

Run the Step 1 script again to `$SCRATCH/shapes-after.json` and `cmp` the two files: they must be identical (no existing primitive uses a turn below 0).

- [ ] **Step 5: Add the five primitives**

Append to `UNIT`, after `taper`:

```js
  dome: (o) => { const s = o.shoulder ?? 0.3; return [{ p: [-1, 1], cusp: true, turn: 0, line: true }, { p: [1, 1], cusp: true, turn: 0 }, { p: [1, s] }, { p: [0, -1] }, { p: [-1, s] }]; },
  sack: (o) => { const n = o.neck ?? 0.22; return [{ p: [0, 1], t: 0.55 }, { p: [1, 0.3] }, { p: [n, -0.35], cusp: true, turn: -60, t: 0.6 }, { p: [0, -1], t: 1 }, { p: [-n, -0.35], cusp: true, turn: -60, t: 0.6 }, { p: [-1, 0.3] }]; },
  bubble: (o) => [{ p: [-1, -0.15] }, { p: [0, -1] }, { p: [1, -0.15] }, { p: [0.3, 0.72], t: 0.6 }, { p: [-0.4, 0.66], cusp: true, turn: 0, line: true }, { p: [-(o.tail ?? 0.8), 1], cusp: true, turn: 30 }],
  bell: () => [{ p: [0, -1] }, { p: [0.6, -0.2] }, { p: [1, 1], cusp: true, turn: 0, line: true }, { p: [-1, 1], cusp: true, turn: 0 }, { p: [-0.6, -0.2] }],
  bust: (o) => { const n = o.neck ?? 0.2; return [{ p: [0.48, -0.7], t: 0.65 }, { p: [n, 0.1], cusp: true, turn: -30 }, { p: [1, 1], line: true, t: 0.9 }, { p: [-1, 1], t: 0.9 }, { p: [-n, 0.1], cusp: true, turn: -30 }, { p: [-0.48, -0.7], t: 0.65 }]; },
```

If `bend` refuses `bust` at some grid, use this anchor set instead (no flare; its tightest bends are 1.36, 1.86, 2.25 and 4.11 at 48) and re-read the 16 path in the test from `bust({ grid: 16 }).d`:

```js
  bust: () => [{ p: [0.46, -0.72], t: 0.65 }, { p: [0.2, 0.05], cusp: true, turn: 0 }, { p: [1, 1], line: true, t: 0.9 }, { p: [-1, 1], t: 0.9 }, { p: [-0.2, 0.05], cusp: true, turn: 0 }, { p: [-0.46, -0.72], t: 0.65 }],
```

(then `--neck` is not bust's: drop it from bust's usage line and the test's `own` map.)

The named exports, after the line that exports `wedge, scoop, blob`:

```js
export const dome = (o) => shape("dome", o), sack = (o) => shape("sack", o), bubble = (o) => shape("bubble", o);
export const bell = (o) => shape("bell", o), bust = (o) => shape("bust", o);
```

`NUMERIC` gains `"shoulder", "neck", "tail"`. `USAGE` gains, after the `taper` line:

```js
  "  dome      --shoulder 0..1",
  "  sack      --neck 0..1",
  "  bubble    --tail 0..1",
  "  bell",
  "  bust      --neck 0..1",
```

The header comment gains, after `taper`:

```
 *   dome      a flat base, a round top: a loaf, a cloche   --shoulder 0..1 (where the sides turn in)
 *   sack      a bag gathered at a neck: a sack of flour   --neck 0..1
 *   bubble    a speech balloon, its tail low on the left  --tail 0..1 (how far left the tail reaches)
 *   bell      narrow on top, flaring to a flat base: a bell, a lampshade
 *   bust      a head on shoulders: a person, a profile    --neck 0..1
```

- [ ] **Step 6: Run the suite**

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: all PASS, the three new shapes tests among them.

- [ ] **Step 7: Commit**

```bash
rtk git add skills/pretty-icons/shapes.mjs test/pretty-icons/shapes.test.mjs
rtk git commit -m "feat: dome, sack, bubble, bell and bust in the shapes kit"
```

---

### Task 9: The showcase and the shadow pair

`sheet.mjs` gains two modes. `--showcase` writes the set as one grid at twice its grid, no names, so the eye reads mass and air across the whole set. `--shadow-pair`, at the filled finish, writes the blind sheet twice, shadowed and not, under letters the seed shuffles, for the shadow read (Task 10 writes it into `read.md`).

**Files:**
- Modify: `skills/pretty-icons/sheet.mjs` (header, import, `composeShowcase`, `composeShadowPair`, `passed`, `writeShowcase`, `writeShadowPair`, `USAGE`, `parseArgs`, `main`)
- Test: `test/pretty-icons/sheet.test.mjs`

**Interfaces:**
- Consumes: `shadowOn(svgText)`, `shadowOff(svgText)` from `shadow.mjs` (Task 7); `checkSet`, `readSet`, `formatFailure` from `check.mjs`; the file's own `place`, `composeBlind`, `shuffled`, `THEMES`, `defaultOut`.
- Produces: `composeShowcase(set, G) → svgText`; `composeShadowPair(set, G, seed) → { A, B, key: { A: "on"|"off", B: "on"|"off" } }`; `writeShowcase(folder, { out }) → { showcase }`; `writeShadowPair(folder, { out, seed }) → { A, B, key, seed }`; `parseArgs` returns `showcase: true` or `shadowPair: true` when given. CLI: `--showcase` prints the png's path; `--shadow-pair` prints the A path, the B path, `key: A on · B off` (or the reverse) and `seed: <n>`. Tasks 10 and 11 use both modes.

- [ ] **Step 1: Write the failing tests**

In `test/pretty-icons/sheet.test.mjs`, the import from `sheet.mjs` becomes:

```js
import { composeBlind, composeSheet, composeShowcase, composeShadowPair, parseArgs, writeSheets, writeShowcase, writeShadowPair } from "../../skills/pretty-icons/sheet.mjs";
import { shadowOn } from "../../skills/pretty-icons/shadow.mjs";
```

In the test `the command line takes a folder, --seed=<int> and --out=<dir>, nothing else`, before its `for (const bad of …)` loop:

```js
  assert.deepEqual(parseArgs(["f", "--showcase", "--out=o"]), { folder: "f", seed: undefined, out: "o", showcase: true });
  assert.deepEqual(parseArgs(["f", "--shadow-pair", "--seed=3"]), { folder: "f", seed: 3, out: undefined, shadowPair: true });
  for (const bad of [["f", "--showcase", "--seed=1"], ["f", "--showcase", "--proof"], ["f", "--shadow-pair", "--showcase"], ["f", "--shadow-pair", "--proof"], ["f", "--showcase", "--showcase"], ["f", "--shadow-pair", "--only", "x"]])
    assert.equal(parseArgs(bad), null, bad.join(" "));
```

Append:

```js
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
```

(Seeds 1 to 6 all put the shadow on A; 7 and 8 put it on B. Keep the eight.)

- [ ] **Step 2: Run them to see them fail**

Run: `rtk test node --test test/pretty-icons/sheet.test.mjs`
Expected: FAIL: `composeShowcase` is not exported.

- [ ] **Step 3: Write the two modes**

In `skills/pretty-icons/sheet.mjs`, the header line ` * The key (number → name) is printed, for the author alone. `--seed=<n>`` becomes:

```js
 * With `--showcase`, pretty-icons-showcase.png instead: the set as one grid at twice its grid, no names, for the
 * eye to read as a whole. With `--shadow-pair` (the filled finish), pretty-icons-shadow-A.png and -B.png instead: the
 * blind sheet with and without the shadow (shadow.mjs), under shuffled letters, for the shadow read in read.md.
 * The key (number → name, letter → on or off) is printed, for the author alone. `--seed=<n>`
```

Below `import { parse } from "./svg.mjs";`:

```js
import { shadowOn, shadowOff } from "./shadow.mjs";
```

Above the `/**` that opens `defaultOut`'s comment (`Where the sheets go without --out:`):

```js
/** The set as one grid on its finish's page, at twice its grid, five to a row: no names, no tiles. */
export function composeShowcase(set, G) {
  const t = THEMES[preset(G).finish === "filled" ? "grey" : "light"], icon = G * 2, gap = Math.max(16, G), perRow = 5;
  const cols = Math.min(perRow, set.length), rows = Math.ceil(set.length / perRow);
  const W = gap * 2 + cols * icon + (cols - 1) * gap, H = gap * 2 + rows * icon + (rows - 1) * gap;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${t.bg}" />`;
  set.forEach((s, i) => { svg += place(s, G, gap + (i % perRow) * (icon + gap), gap + Math.floor(i / perRow) * (icon + gap), icon, t.ink); });
  return svg + "</svg>";
}

/**
 * The set with its shadow and without, as two blind sheets in one order, under letters the seed shuffles:
 * { A, B } the two sheets' markup, key { A, B } each "on" or "off".
 */
export function composeShadowPair(set, G, seed = Date.now()) {
  const sides = shuffled([["on", shadowOn], ["off", shadowOff]], seed);
  const [A, B] = sides.map(([, fn]) => composeBlind(set.map((s) => ({ ...s, text: fn(s.text) })), G, seed).svg);
  return { A, B, key: { A: sides[0][0], B: sides[1][0] } };
}

const widthOf = (svg) => Number(/width="(\d+)"/.exec(svg)[1]);

/** The set as check.mjs judged it; a set it refuses or cannot measure gets no sheet. */
async function passed(dir) {
  const r = await checkSet(dir);
  if (!r.measured) throw new Error(`check: not measured: ${r.why}`);
  if (r.failures.length) throw new Error(`check failed:\n${r.failures.map(formatFailure).join("\n")}`);
  return r;
}
```

In `writeSheets`, the three check lines and `const set = readSet(dir);` become `const r = await passed(dir), set = readSet(dir);`, and both `png(…, Number(/width="(\d+)"/.exec(…)[1]))` become `png(…, widthOf(…))`. After `writeSheets`:

```js
export async function writeShowcase(folder, { out } = {}) {
  const dir = resolve(folder), dest = out ? resolve(out) : defaultOut(dir);
  const r = await passed(dir), svg = composeShowcase(readSet(dir), r.G);
  mkdirSync(dest, { recursive: true });
  const showcase = join(dest, "pretty-icons-showcase.png");
  writeFileSync(showcase, png(svg, widthOf(svg)));
  return { showcase };
}

export async function writeShadowPair(folder, { out, seed = Date.now() % 2 ** 32 } = {}) {
  const dir = resolve(folder), dest = out ? resolve(out) : defaultOut(dir);
  const r = await passed(dir);
  if (preset(r.G).finish !== "filled") throw new Error("--shadow-pair: a shadow at the filled finish only (48)");
  const pair = composeShadowPair(readSet(dir), r.G, seed);
  mkdirSync(dest, { recursive: true });
  const A = join(dest, "pretty-icons-shadow-A.png"), B = join(dest, "pretty-icons-shadow-B.png");
  writeFileSync(A, png(pair.A, widthOf(pair.A)));
  writeFileSync(B, png(pair.B, widthOf(pair.B)));
  return { A, B, key: pair.key, seed };
}
```

`USAGE` becomes:

```js
const USAGE = "usage: node sheet.mjs <folder> [--seed=<n>] [--out=<dir>] | node sheet.mjs <folder> --showcase [--out=<dir>] | node sheet.mjs <folder> --shadow-pair [--seed=<n>] [--out=<dir>] | node sheet.mjs <folder> --proof [--only <name>] [--out=<dir>]";
```

In `parseArgs`, its comment becomes `/** The folder, seed and out from argv, and one of --showcase, --shadow-pair or --proof (with its --only); null when anything in it is not one of those. */`; the `--proof` line becomes:

```js
    const mode = { "--proof": "proof", "--showcase": "showcase", "--shadow-pair": "shadowPair" }[a];
    if (mode) { if (r[mode]) return null; r[mode] = true; continue; }
```

and the closing guard:

```js
  // one mode at most; --only is for the proof; --seed shuffles a blind sheet, which the proof and the showcase do not draw
  if ([r.proof, r.showcase, r.shadowPair].filter(Boolean).length > 1) return null;
  if (r.folder === undefined || (r.only !== undefined && !r.proof) || ((r.proof || r.showcase) && r.seed !== undefined)) return null;
```

In `main`, before `const r = await writeSheets(…)`:

```js
    if (args.showcase) { console.log((await writeShowcase(args.folder, { out: args.out })).showcase); return; }
    if (args.shadowPair) {
      const p = await writeShadowPair(args.folder, { out: args.out, seed: args.seed });
      console.log(p.A); console.log(p.B);
      console.log(`key: A ${p.key.A} · B ${p.key.B}`);
      console.log(`seed: ${p.seed}`);
      return;
    }
```

- [ ] **Step 4: Run the suite**

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: all PASS. Then look at both modes once, into the scratchpad: `node skills/pretty-icons/sheet.mjs skills/pretty-icons/examples/garage --showcase --out="$SCRATCH/t9"` and `… --shadow-pair --seed=7 --out="$SCRATCH/t9"`. Open the three pngs: the showcase is ten icons on grey; one of A and B carries a shade copy down and right of every icon, the other none.

- [ ] **Step 5: Commit**

```bash
rtk git add skills/pretty-icons/sheet.mjs test/pretty-icons/sheet.test.mjs
rtk git commit -m "feat: sheet.mjs --showcase and --shadow-pair"
```

---

### Task 10: The rules, the reads and the loop, in the docs

The docs catch up with the code: two new duotone rules (`11 · air`, `12 · diagonal`), two new filled sections (`12 · air, loose and diagonal`, `13 · shadow`), the soft bodies, the shadow read, and the loop's new looks. Every rejected line quoted is `check.mjs`'s own output, pinned by `docs.test.mjs`.

**Files:**
- Modify: `skills/pretty-icons/rules.md` (title, intro, bodies, 03, 08, 09, new 11 and 12, How check.mjs measures)
- Modify: `skills/pretty-icons/rules-filled.md` (title line, 04, 05, 08, new 12 and 13, How check.mjs measures)
- Modify: `skills/pretty-icons/read.md` (new `## The shadow read`)
- Modify: `skills/pretty-icons/SKILL.md` (steps 3, 4, 5, What goes wrong)
- Test: `test/pretty-icons/docs.test.mjs`

**Interfaces:**
- Consumes: `measuredChecks(set, G)` from `measure.mjs` (Tasks 2–6: rules `gap`, `loose`, `air`, `diagonal`); `curveFailures(icon, el, stroke)` (Task 5: rule `bend`); `textChecks`, `checkSet` (Task 7: rule `shadow`); `shadowOn` (Task 7); `shape` names `dome sack bubble bell bust` (Task 8); `sheet.mjs --showcase`, `--shadow-pair` (Task 9). `svg16` and `BODY16` in `docs.test.mjs` as Task 1 left them (stroke 1, the square body `x 2.25 … w 11.5`).
- Produces: the headings `## 11 · air`, `## 12 · diagonal` (rules.md), `## 12 · air, loose and diagonal`, `## 13 · shadow` (rules-filled.md), `## The shadow read` (read.md), and the shadow-read prompt, which Task 11 gives its readers word for word.

- [ ] **Step 1: Write the failing tests**

In `test/pretty-icons/docs.test.mjs`, extend the imports:

```js
import { measuredChecks } from "../../skills/pretty-icons/measure.mjs";
import { curveFailures } from "../../skills/pretty-icons/curve.mjs";
import { shadowOn } from "../../skills/pretty-icons/shadow.mjs";
import { cpSync, readdirSync } from "node:fs"; // merge into the existing node:fs import
```

Append:

```js
const ruled = async (rule, G, ...icons) => (await measuredChecks(icons.map(([name, text]) => ({ name, text })), G)).failures.filter((f) => f.rule === rule).map(line);
const svg48 = (b) => `<svg viewBox="0 0 48 48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${b}</svg>`;
const CARD16 = '<rect x="2" y="2" width="12" height="12" rx="1.5" fill="currentColor" fill-opacity=".2" />';
const BOX48 = '<rect x="5" y="9" width="38" height="30" rx="6" fill="#ececea" stroke="none" /><rect x="5" y="9" width="38" height="30" rx="6" stroke-width="2" />';
const GARAGE = new URL("../../skills/pretty-icons/examples/garage/", import.meta.url).pathname;

test("rules.md quotes what check.mjs prints for air, loose, bend, diagonal and a duotone shadow", async () => {
  const rules = doc("rules.md");
  const rising = svg16('<path d="M3 13L13 3" />'), round = svg16('<circle cx="8" cy="8" r="6.5" />');
  const copy = BODY16.replace('fill="currentColor" fill-opacity=".2"', 'fill="#cfcfcb" stroke="#cfcfcb" data-shadow="" transform="translate(1.5 1.5)"');
  const quoted = [
    ...await ruled("air", 16, ["oil", svg16('<path d="M3 7H13" /><path d="M3 9H13" />')]),
    ...await ruled("air", 16, ["eye", svg16('<circle cx="8" cy="8" r="1.25" />')]),
    ...await ruled("loose", 16, ["billing", svg16(`${CARD16}<path d="M2 8H14" />`)]),
    ...await ruled("loose", 16, ["billing", svg16(`${CARD16}<path d="M3.5 8H12.5" />`)]),
    ...curveFailures("pao", { tag: "path", attrs: { d: "M8 7.5C8.276 7.5 8.5 7.724 8.5 8" }, at: "path@1" }, 1).filter((f) => f.rule === "bend").map(line),
    ...await ruled("diagonal", 16, ...["brush", "key", "pen", "wrench"].map((n) => [n, rising]), ...["clock", "coin", "disc", "lens", "plate", "ring"].map((n) => [n, round])),
    ...await ruled("diagonal", 16, ["key", svg16('<path d="M3 3L13 13" />')]),
    ...textChecks("billing", svg16(`${copy}${BODY16}`), 16).failures.filter((f) => f.rule === "shadow").map(line),
  ];
  assert.equal(quoted.length, 8, quoted.join("\n"));
  for (const l of quoted) assert.ok(rules.includes(`\`${l}\``), `rules.md quotes ${l}`);
  for (const h of ["# The twelve rules", "## 11 · air", "## 12 · diagonal"]) assert.ok(rules.includes(h), h);
  for (const p of ["dome", "sack", "bubble", "bell", "bust"]) assert.ok(rules.includes(`\`${p}\``), p);
  assert.ok(!/a title bar or a card stripe ending on its edges/.test(rules), "08 no longer lets an accent run edge to edge");
});

test("rules-filled.md quotes what check.mjs prints for air, loose and the shadow", async (t) => {
  const filled = doc("rules-filled.md");
  const dir = mkdtempSync(join(tmpdir(), "shadow-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  cpSync(GARAGE, dir, { recursive: true });
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".svg")).sort().slice(0, 6)) writeFileSync(join(dir, f), shadowOn(readFileSync(join(dir, f), "utf8")));
  const tyre = shadowOn(readFileSync(join(GARAGE, "tyre.svg"), "utf8"));
  const shadowLines = (text) => textChecks("tyre", text, 48).failures.filter((f) => f.rule === "shadow").map(line);
  const quoted = [
    ...await ruled("air", 48, ["oil", svg48('<path d="M9 21H39" /><path d="M9 24H39" />')]),
    ...await ruled("loose", 48, ["toolbox", svg48(`${BOX48}<path d="M5 24H43" />`)]),
    ...(await checkSet(dir)).failures.filter((f) => f.rule === "shadow").map(line),
    ...shadowLines(tyre.replace(/\n[ \t]*<[^>]*data-shadow=""[^>]*\/>/, "")),
    ...shadowLines(tyre.replace("translate(1.5 1.5)", "translate(2 2)")),
  ];
  assert.equal(quoted.length, 5, quoted.join("\n"));
  for (const l of quoted) assert.ok(filled.includes(`\`${l}\``), `rules-filled.md quotes ${l}`);
  for (const h of ["## 12 · air, loose and diagonal", "## 13 · shadow", "shadow.mjs --on", "--shadow-pair"]) assert.ok(filled.includes(h), h);
  assert.ok(!/neither an offset shadow/i.test(filled), "04 no longer forbids the shadow");
  assert.ok(/no white shine/i.test(filled), "04 still forbids a white shine");
});

test("read.md: the shadow read, its prompt word for word, and whose pick stands", () => {
  const read = doc("read.md");
  assert.ok(read.includes("## The shadow read"));
  assert.ok(read.includes("> These are two versions of one set of N icons, A and B. Which set looks better as a set, A or B? Answer with the letter and, in five words or fewer, why."));
  for (const s of ["--shadow-pair", "shadow.mjs --on", "shadow.mjs --off", "**not read for the shadow**"]) assert.ok(read.includes(s), s);
});

test("SKILL.md: the soft bodies, the showcase and the shadow in the loop", () => {
  const skill = doc("SKILL.md");
  for (const s of ["`dome`", "`sack`", "`bubble`", "`bell`", "`bust`", "--showcase", "--shadow-pair", "Do the shadow read", "drawing a shadow by hand or adding a white shine", "**not read for the shadow**"]) assert.ok(skill.includes(s), s);
  assert.ok(!skill.includes("adding an offset shadow or a white shine"));
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `rtk test node --test test/pretty-icons/docs.test.mjs`
Expected: FAIL. Each `quotes` failure names the line `check.mjs` printed (`rules.md quotes air  oil  paper 1.1 strokes wide at 8, 8 → ≥ 1.5 apart, or touching`, and so on): those are the lines to paste in Steps 3 and 4, exactly as printed. If a `quoted.length` assertion fails instead, an input above no longer trips its rule after Tasks 2–7; print `quoted` and move the input's lines 0.25 closer until it does (the 48 `air` pair, for one, needs its paper under 1.5 strokes, 2.25, edge to edge).

- [ ] **Step 3: `rules.md`**

Each `` `…` `` quote in the text below marked ⟨printed⟩ is replaced with the line Step 2 printed for it; the others are as written.

The title becomes `# The twelve rules`. In the intro, `` `check.mjs` measures nine. `` becomes `` `check.mjs` measures eleven. ``.

In `## The bodies`, after the table's paragraph that begins `Every icon on 16 starts from this root.` and its svg block, add:

```markdown
A body that is soft, natural, rounded or held in the hand comes from the kit, not from a rect: `node <skill-dir>/shapes.mjs <primitive> --grid <grid> --w <w> --h <h> --at <x>,<y>`. Beside `drop`, `leaf`, `lens`, `bean`, `crescent`, `taper`, `wedge`, `scoop` and `blob`, the kit has five bodies for what is drawn most often by hand: `dome` (a loaf, a bun, a cloche: a flat base, a round top), `sack` (a bag gathered at a neck), `bubble` (a speech bubble with its tail), `bell` (narrow on top, flaring to a flat base: a bell, a lampshade) and `bust` (a person, head and shoulders). A rect or a circle stays for what truly is a box, a card, a screen or a disc.
```

In `## 03 · stroke`, after its first paragraph, add:

```markdown
The line is light: 6.25% of the grid, 1 on 16, 1.25 on 20, 1.5 on 24. Every detail is drawn at it too; there is no second, finer weight. A detail that cannot be seen at the line's weight is a detail to drop, not to thin.
```

`## 08 · gap: touch, or a stroke apart` becomes `## 08 · gap: touch, or air between`, and its first paragraph:

```markdown
Two elements either touch or sit at least one and a half strokes apart, outer edge to outer edge: two and a half strokes on their centrelines, 2.5 on 16, 3.25 on 20, 3.75 on 24. A mark (rule 09's tick, a dot) needs half that. They touch when their centrelines come within 0.1 of each other: one ends on the other, or crosses it. Anything between is "almost", and is rejected. Two outlines that meet edge to edge, `0 apart`, are almost too. The subpaths of one path are held to the same rule: dots merged into one path are as close as separate ones. A detail inside a body is the one exception: it is held one stroke from the body's contour, not one and a half (`loose`, below).
```

In its bullets: the clear-detail bullet's `two strokes from the body's: 3 on 16 and 20, 4 on 24` becomes `two and a half strokes from the body's: 2.5 on 16, 3.25 on 20, 3.75 on 24`, and its example is whatever `examples/hairline/devices.svg` now draws (Task 11 re-reads it); the near-miss bullet's `to 3 apart` and `cannot sit 3 apart` become `to 2.5 apart` and `cannot sit 2.5 apart`. The bullet `**Keep it, for a line that meets a body:**` becomes:

```markdown
- **Keep it, for a line that meets a body:** a part that meets a body from outside (a handle, a stem, a nozzle) ends on the body's edge, and never runs under the body and out the other side, because the 20% fill shows it through.
- **Keep it, for a detail inside a body** (a seam, a slit, a score, a stripe, a title bar, a line of text): it stops short of the contour, its nearest ink at least one stroke from the contour's, edge to edge: its centreline 2 strokes inside the contour's, 2 on 16. A detail is inside when its midpoint lies inside a filled body. A stripe or a title bar that ran from edge to edge now floats in its body, a stroke clear at each end.
```

and the `**Rejected when:**` bullet gains, after the gap lines, `` A detail inside a body prints `loose`: ⟨printed: `loose  billing  path@2 touches rect@1 → end it ≥ 1 stroke inside the contour`⟩ for one that runs to the contour, ⟨printed: `loose  billing  path@2 0.5 strokes from rect@1 → ≥ 1 stroke inside the contour`⟩ for one that stops too near. `` Re-quote the gap lines already in it from a run on their own inputs (Task 2 changed the minimum to `≥ 1.5 apart` at stroke 1); a quote `docs.test.mjs` does not pin is checked by hand against `check.mjs`'s output.

In `## 09 · metaphor`, the sentence `A body carries one accent: the part that names the object, the home bar on a phone, the title bar on a window, the check in a shield.` gains `` An accent inside the body is loose (08): it stops a stroke short of the contour. ``

After `## 10 · set`, before `## How check.mjs measures`, add:

```markdown
## 11 · air: paper you can see

Paper between inks is part of the drawing. Where two inks do not touch, the paper between them is at least one and a half strokes wide, and a closed counter (a hole, an eye, the inside of a ring) is at least two strokes across. Rule 08 measures centrelines; air measures the pixels, so it also sees a band of paper inside one element, between two curves, or in a counter.

- **Keep it:** drop a detail rather than squeeze it in. Two parallel lines sit 2.5 apart on 16, or become one. A counter opens to two strokes across, or closes: a hole of 1.5 is a speck, not a hole.
- **Keep it, for a detail inside a body:** it is `loose`'s, held at one stroke (08); air reads the icon without it.
- **Rejected when:** `check.mjs` prints `air`, with the paper's width in strokes and its place: ⟨printed: `air  oil  paper 1.1 strokes wide at 8, 8 → ≥ 1.5 apart, or touching`⟩, two lines 2 apart on 16; ⟨printed: `air  eye  counter 1.5 strokes across at 8, 8 → ≥ 2 across`⟩, a ring of r 1.25. A region under one square stroke is anti-aliasing and is not reported.

## 12 · diagonal: some lie at 45°

An elongated object (a wrench, a pen, a key, a rolling pin, a whisk, a stalk) may lie on the diagonal, lower left to upper right, so a set is not a row of upright things. At most three in ten do, so the set stays calm: `check.mjs` counts the icons whose ink is twice as long as it is wide, its long axis within 10° of 45°, and refuses those past `round(0.3 × N)`, never fewer than one.

- **Keep it:** stand the fourth one upright, or lay it flat. A diagonal object runs from the lower left to the upper right, its heavier end low.
- **Rejected when:** `check.mjs` prints `diagonal`: ⟨printed: `diagonal  set  4 of 10 on the diagonal (brush, key, pen, wrench) → at most 3`⟩; and for one that falls the wrong way, ⟨printed: `diagonal  key  upper-left to lower-right → lower-left to upper-right`⟩: mirror it.
```

In `## 03 · stroke`'s **Rejected when**, add `` A shadow is the filled finish's alone: ⟨printed: `shadow  billing  a shadow at the duotone finish → none`⟩. ``

In `## 04 · construction` (or wherever `rules.md` first lists the curve lines `join` and `inflection`), add the bend line after them: `` A smooth curve bent tighter than one stroke's radius reads as a kink at display size: ⟨printed: `bend  pao  path@1 radius 0.5 at …`, the whole line as printed⟩. Ease it with longer handles, or make the corner a cusp on purpose. ``

`## How check.mjs measures` gains, after its first paragraph:

```markdown
Air renders the icon at 8 px per stroke, without its modifiers and its interior details, and opens the paper with an exact distance transform: paper narrower than 1.5 strokes, or a closed counter under 2, that is left over is reported with its width and its centre. Loose finds an unfilled element whose midpoint lies inside a filled body and measures its least distance to the body's contour, edge to edge. Bend samples every smooth cubic at 65 points and reports the tightest radius under one stroke; a cusp and a stalled sample are skipped. Diagonal takes each icon's ink's principal axes: a ratio of 2 or more, the long axis within 10° of 45°.
```

- [ ] **Step 4: `rules-filled.md`**

The title `# The ten rules at the filled finish` becomes `# The rules at the filled finish`.

In `## 04 · construction`, wherever it says the icon has neither an offset shadow nor a white shine, the sentence becomes `` Depth is the shade inside the body, and, for a set chosen to have one, the offset shadow (13), which `shadow.mjs` writes, never the drawer. No white shine. `` The croissant paragraph's `3 from its centreline` and `its line ink 279.6` follow the drawing as Tasks 3 and 4 left it (the docs test reads its ink).

In `## 05 · weight`, `Ink is the line alone: tones, shades and dots dropped,` becomes `Ink is the line alone: tones, shades, dots and the shadow dropped,`.

In `## 08 · gap`, the minimum becomes one and a half strokes, 2.25 edge to edge: two lines at the root's width 3.75 apart on their centrelines, a line and a contour 4. Keep its exceptions as they are.

After `## 11 · contrast`, before `## How check.mjs measures`, add:

```markdown
## 12 · air, loose and diagonal

As `rules.md` 08, 11 and 12, at 48. The stroke is the line, 1.5: paper between inks is at least 2.25 wide, edge to edge, a counter at least 3 across. A contour's edge is taken at its own width, 2. A detail inside a body (a seam, a score, a label) stops 1.5 short of the contour, edge to edge: its centreline 3.25 inside the contour's.

- **Rejected when:** ⟨printed: `air  oil  …`, the whole line⟩, two lines 3 apart; ⟨printed: `loose  toolbox  path@3 touches rect@1 → end it ≥ 1 stroke inside the contour`⟩, a seam run across a box from edge to edge.

## 13 · shadow: chosen per set

A set may cast a shadow: a copy of every element in the shade tone, 1.5 down and right, under the icon. It lifts some sets and muddies others, so it is chosen per set, by a read, never per icon.

- **Add it:** never by hand. `node <skill-dir>/shadow.mjs pretty-icons/ --on` writes it into every icon of the folder: each element's copy, first in the file, one per line, marked `data-shadow=""`. `--off` takes it out, and the file is byte for byte as before. Run `--on` again after any edit; it writes the shadow fresh. A modifier goes on before the shadow: take the shadow off, add the modifier, put it back.
- **Choose it:** `node <skill-dir>/sheet.mjs pretty-icons/ --shadow-pair` writes the blind sheet twice, shadowed and not, under shuffled letters, and prints which is which. Give both to a fresh reader (`read.md`, the shadow read). Its pick stands unless the person overrules it.
- **What is measured:** every other rule reads the icon without its shadow: weight, gravity, contrast, keyline, the element cap. The live area runs 1.5 further, down and right, for the shadow alone.
- **Rejected when:** `check.mjs` prints `shadow`: ⟨printed: `shadow  set  6 of 10 shadowed → all or none (shadow.mjs --on|--off)`⟩; a copy taken out, ⟨printed: `shadow  tyre  … not in the shadow → re-run shadow.mjs --on`⟩; a copy moved, ⟨printed: `shadow  tyre  … transform translate(2 2) → translate(1.5 1.5): re-run shadow.mjs --on`⟩. A shadow drawn by hand, a shade copy with a `transform` and no mark, prints `construction  traffic-light  rect@3 transform → not set: shadow.mjs --on writes the shadow`.
```

`## How check.mjs measures` gains: `` A shadowed icon is measured without its `data-shadow` copies; `shadow` alone reads them. ``

- [ ] **Step 5: `read.md`**

Before `## Without a second agent`, add:

```markdown
## The shadow read

At the filled finish only, once the set passes the blind, craft and set reads, and again whenever an icon changes. Run `node <skill-dir>/sheet.mjs pretty-icons/ --shadow-pair`: it writes `pretty-icons-shadow-A.png` and `pretty-icons-shadow-B.png`, the same blind sheet with and without the shadow, and prints the key (`key: A on · B off`), for you alone. Open a fresh agent, one that has seen none of your work and none of the other readers' answers, and give it both images and this prompt, with N filled in:

> These are two versions of one set of N icons, A and B. Which set looks better as a set, A or B? Answer with the letter and, in five words or fewer, why.

The reader's pick stands unless the person overrules it: `node <skill-dir>/shadow.mjs pretty-icons/ --on` for the shadowed one, `node <skill-dir>/shadow.mjs pretty-icons/ --off` for the other. Then `check.mjs` once more. Say in the hand-over which was picked and the reader's words. Without a reader, leave the set unshadowed and say **not read for the shadow**.
```

In `## Without a second agent`, the words become: **not read blind**, **not read for craft**, **not read as a set** and, at the filled finish, **not read for the shadow**.

- [ ] **Step 6: `SKILL.md`**

Step 3 (`## 3. Draw`), the sentence `Start every body from the bodies table or the kit.` becomes `` Start every body from the bodies table or the kit; a soft body (a loaf, a bag, a speech bubble, a bell, a person) from `dome`, `sack`, `bubble`, `bell` or `bust`, never a rect. ``

Step 4 (`## 4. Check`), after item 2, insert (and renumber the rest):

```markdown
3. `node <skill-dir>/sheet.mjs pretty-icons/ --showcase` writes `pretty-icons-showcase.png`: the set alone, five to a row. Look at it whole: an icon heavier, darker or more crowded than its neighbours goes back to step 3.
```

and after the set read's item:

```markdown
7. At the filled finish, do the shadow read in `read.md` with a fourth new reader, once the other reads pass: `sheet.mjs --shadow-pair`, the reader picks, `shadow.mjs --on` or `--off` follows the pick, and `check.mjs` once more.
```

The no-Node paragraph's list of words gains `` and, at the filled finish, **not read for the shadow** ``.

Step 5 (`## 5. Hand over`), the list gains, after the set reader's line: `- at the filled finish, the shadow: on or off, the reader's pick and words, or **not read for the shadow**;`.

`What goes wrong`: the row `| adding an offset shadow or a white shine | … |` becomes:

```markdown
| drawing a shadow by hand or adding a white shine | `rules-filled.md` 13: `shadow.mjs --on`, for the whole set, chosen by the shadow read; never a shine. The one sheen allowed is a paper fill on glass, a gesture from rule 09 |
```

and three rows are added after the gap row (`placing a detail a little away…`):

```markdown
| squeezing a detail into a gap under 1.5 strokes | rule 11: drop it; air between inks is part of the drawing |
| running a detail edge to edge inside a body | rule 08: stop it a stroke short of the contour |
| drawing a rect where the object is soft | the kit: `dome`, `sack`, `bubble`, `bell`, `bust`, or a primitive from `shapes.mjs` |
```

The gap row itself (`rule 08: a stroke apart, or touching…`) becomes `rule 08: one and a half strokes apart, or touching on the centreline; nothing between`.

- [ ] **Step 7: Run the suite**

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: all PASS. Then search the four docs for a stale number: `rtk proxy grep -n "stroke-width=\"1.5\"\|3 apart\|one stroke apart\|nine\b\|ten rules" skills/pretty-icons/rules.md skills/pretty-icons/SKILL.md` prints no line about the duotone finish (the filled root keeps its 1.5).

- [ ] **Step 8: Commit**

```bash
rtk git add skills/pretty-icons test/pretty-icons/docs.test.mjs
rtk git commit -m "docs: air, loose, bend, diagonal, the soft bodies and the shadow read"
```

---

### Task 11: Redraw the examples, and read them

`examples/hairline` (16, stroke 1) and `examples/garage` (48) are redrawn under every new rule, so they are the bar the skill sends its drawers to. Each passes `check.mjs` with no exception line, the blind read 10 of 10 with none by elimination, and beats the drawing before this plan in at least 2 of 3 blind ranking reads (spec, success items 2–4). Then the shadow read chooses garage's shadow.

**Who does what.** Drawing, checking, sheets and records are the implementer's. Every read is a fresh agent that has seen none of the icons, none of this plan and no other reader's answer, so the reads are the controller's: at each **Reads** step the implementer stops, reports the image paths, the keys and the prompts, and the controller opens the readers and hands back each answer verbatim. A controller running the plan alone (no subagents) opens them itself, in the same way.

**Files:**
- Modify: `skills/pretty-icons/examples/hairline/*.svg`, `skills/pretty-icons/examples/garage/*.svg` (same ten names in each, same formats unless a read asks otherwise)
- Modify: `skills/pretty-icons/presets.mjs` (`REFERENCE_INK`), `test/pretty-icons/finish.test.mjs:93` (the pinned duotone inks)
- Modify: `skills/pretty-icons/rules.md` 08 (the `all.svg` and `devices.svg` citations), `skills/pretty-icons/rules-filled.md` 05 (the reference, the tyre, gearshift and wrench weights and their rejected lines)
- Modify, only if a redraw moves what they read: `test/pretty-icons/check.test.mjs`, `proof.test.mjs:50`, `modifiers.test.mjs:75`, `docs.test.mjs` (the traffic light's `LIT` element)
- Create: `docs/superpowers/baselines/2026-10-11-pretty-icons-polish-reference.md`, `docs/superpowers/baselines/2026-10-11-polish-after/{hairline,garage}-sheet.png`

**Interfaces:**
- Consumes: every rule of Tasks 1–7 through `check.mjs`; the kit's `dome sack bubble bell bust` (Task 8); `sheet.mjs --showcase`, `--proof`, `--shadow-pair`, `--seed`, `--out` (Task 9); `shadow.mjs --on|--off` (Task 7); `read.md`'s blind, craft, set and shadow reads (Task 10). The drawing before this plan is commit `8d41531`.
- Produces: the redrawn examples and `REFERENCE_INK`, which Task 12's drawers are measured against; the record file, which Task 12 appends to.

- [ ] **Step 1: Render the old sets**

`SCRATCH` is any empty folder outside the repo (the session scratchpad, or `$(mktemp -d)`). Nothing from it is committed except the two sheets named in Step 11.

```bash
SCRATCH=<your scratch folder>; mkdir -p $SCRATCH/old
rtk proxy sh -c "git archive 8d41531 skills/pretty-icons | tar -x -C $SCRATCH/old"
for s in hairline garage; do rtk proxy node $SCRATCH/old/skills/pretty-icons/sheet.mjs $SCRATCH/old/skills/pretty-icons/examples/$s --seed=11 --out=$SCRATCH/t11/old-$s; done
```

Expected: each prints the paths of `pretty-icons-sheet.png` and `pretty-icons-blind.png` and a key. The old code measures the old drawing, so both pass their own check. These two blind sheets are the "before" of every ranking read.

- [ ] **Step 2: Look at the sets as they are, and write the redraw list**

```bash
for s in hairline garage; do rtk proxy node skills/pretty-icons/sheet.mjs skills/pretty-icons/examples/$s --showcase --out=$SCRATCH/t11/now-$s; rtk proxy node skills/pretty-icons/sheet.mjs skills/pretty-icons/examples/$s --proof --out=$SCRATCH/t11/now-$s; done
```

Open the showcases and the proofs. Read `SKILL.md`, `rules.md` and `rules-filled.md` as Task 10 left them. Write `$SCRATCH/t11/redraw.md`, one line per icon, twenty lines, in this form:

```
garage/wrench — body: kit (taper + ring), was rect; details: hole at 2 strokes, drop the jaw notch; diagonal: yes, lower left to upper right
```

The questions for each line, from the spec's six aims:
1. **Body.** Is the object soft, natural, rounded or held in the hand? Then its body comes from the kit (`shapes.mjs`: `dome`, `sack`, `bubble`, `bell`, `bust`, `blob` or a primitive), not from a rect. A box, a card, a screen or a disc keeps its rect or circle.
2. **Details.** Every detail inside a body stops a stroke short of its contour. Every gap is 1.5 strokes edge to edge, or the two touch; drop the detail that cannot have that much room.
3. **Diagonal.** Is it long and thin (a wrench, a pen, a key, a stalk)? Mark at most 3 of the 10 for the diagonal, lower left to upper right; the rest stand upright or lie flat.
4. **Mass.** On the showcase, which icons look heavier, darker or more crowded than their neighbours? Note what comes off them.

- [ ] **Step 3: Redraw `examples/hairline`**

One file at a time, from `redraw.md`, at stroke 1 on 16, from the bodies table and the kit (`node skills/pretty-icons/shapes.mjs <primitive> --grid 16 --w <w> --h <h> --at <x>,<y>`). Keep each file's name and, unless its line says otherwise, its format. After each file:

```bash
rtk proxy node skills/pretty-icons/check.mjs skills/pretty-icons/examples/hairline
```

Fix each line it prints by its rule before the next file. A rule is never loosened to let a drawing pass; a drawing that cannot pass is a metaphor to change, and the change goes in `redraw.md`. At the end: `ok`, then `--showcase` again, and fix what the eye finds uneven.

- [ ] **Step 4: Redraw `examples/garage`**

As Step 3, on 48, with `rules-filled.md`: tone, shade, contour for every body, the contour the tone's geometry pasted. Keep the shadow off while drawing: if a file has `data-shadow` copies, `rtk proxy node skills/pretty-icons/shadow.mjs skills/pretty-icons/examples/garage --off` first. At the end `check.mjs` prints `ok`.

- [ ] **Step 5: Re-measure the reference ink**

Write this to `$SCRATCH/refink.mjs` and run `rtk proxy node $SCRATCH/refink.mjs $PWD/skills/pretty-icons`:

```js
// Prints the reference inks: on 16 from examples/hairline as drawn, on 20 and 24 scaled to the grid's live area at its own stroke, on 48 the median of examples/garage.
const SK = process.argv[2];
const { readSet, checkSet } = await import(`${SK}/check.mjs`);
const { measure } = await import(`${SK}/raster.mjs`);
const { parse } = await import(`${SK}/svg.mjs`);
const { preset } = await import(`${SK}/presets.mjs`);
const set = readSet(`${SK}/examples/hairline`).filter((x) => !/data-modifier=/.test(x.text));
const med = (a) => { a.sort((x, y) => x - y); const m = a.length >> 1; return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; };
const out = {};
for (const G of [16, 20, 24]) {
  const k = preset(G).live / preset(16).live, sw = preset(G).stroke, inks = [];
  for (const s of set) {
    if (G === 16) { inks.push((await measure(s.text, 16)).ink); continue; }
    const inner = parse(s.text).elements.map((el) => `<${el.tag} ${Object.entries(el.attrs).map(([a, v]) => `${a}="${v}"`).join(" ")} />`).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${G} ${G}" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(${G / 2} ${G / 2}) scale(${k}) translate(-8 -8)" stroke-width="${sw / k}">${inner}</g></svg>`;
    inks.push((await measure(svg, G)).ink);
  }
  out[G] = Math.round(med(inks) * 10) / 10;
}
out[48] = Math.round(med((await checkSet(`${SK}/examples/garage`)).rows.map((r) => r.ink)) * 10) / 10;
console.log(JSON.stringify(out));
```

Paste the printed values into `REFERENCE_INK` in `presets.mjs`, the 16, 20 and 24 values into the pin at `test/pretty-icons/finish.test.mjs:93`, and the 48 value into `rules-filled.md` 05 (`the reference, <value>,`, which `filled.test.mjs` reads). Run `rtk test node --test 'test/**/*.test.mjs'`. Expected: all PASS. A test that fails because it reads an example's geometry (a name list, a keyline, the traffic light's lit lens) follows the new drawing; the commit names it.

- [ ] **Step 6: Bring the docs' citations up to the drawing**

Each citation below is re-read from the redrawn files, never kept from the old ones:
- `rules.md` 08, **Keep it, to make a detail touch a body:** cite a redrawn hairline icon where a part from outside ends on a body's centreline, with its coordinates. If none does, give the coordinates without a file.
- `rules.md` 08, **Keep it, to keep a detail clear:** cite a redrawn hairline icon with a detail inside a body, its centreline and the body's (2.5 apart on 16).
- `rules-filled.md` 05, **Keep it, for a heavy icon:** for the tyre and the gearshift (or two redrawn icons with a detail to drop), copy `examples/garage` to `$SCRATCH/t11/heavy`, drop the detail, and quote both inks from `rtk proxy node skills/pretty-icons/check.mjs $SCRATCH/t11/heavy --print`.
- `rules-filled.md` 05, **Rejected when:** make the same kind of edit (an icon's hole taken out and a notch filled, so it reads light) on a copy of the redrawn garage, run `check.mjs` on it, and quote the two `weight` lines it prints, naming the edit as the old text did.

Run the suite. Expected: all PASS.

- [ ] **Step 7: Commit the drawing (round 1)**

```bash
rtk git add skills/pretty-icons test/pretty-icons
rtk git commit -m "feat: hairline and garage redrawn under the polish rules"
```

- [ ] **Step 8: Write the read sheets**

`R` is the round, from 1. Each round takes a new seed and new letters, so no reader can carry anything from a round before.

```bash
R=1; SEED=$((R * 7919))
for s in hairline garage; do rtk proxy node skills/pretty-icons/sheet.mjs skills/pretty-icons/examples/$s --seed=$SEED --out=$SCRATCH/t11/r$R-$s; done
for s in hairline garage; do for i in 1 2 3; do
  if [ $(( (SEED / i + i) % 2 )) -eq 0 ]; then A=new; B=old; else A=old; B=new; fi
  cp $SCRATCH/t11/r$R-$s/pretty-icons-blind.png $SCRATCH/t11/r$R-rank-$s-$i-$( [ $A = new ] && echo A || echo B ).png
  cp $SCRATCH/t11/old-$s/pretty-icons-blind.png $SCRATCH/t11/r$R-rank-$s-$i-$( [ $A = old ] && echo A || echo B ).png
  echo "round $R $s read $i: A=$A B=$B" >> $SCRATCH/t11/keys.txt
done; done
```

Then, once the blind, craft, set and ranking reads have passed (Step 9), and only for garage:

```bash
rtk proxy node skills/pretty-icons/sheet.mjs skills/pretty-icons/examples/garage --shadow-pair --seed=$SEED --out=$SCRATCH/t11/r$R-shadow
```

It prints the A and B paths and `key: A … · B …`; add the key to `keys.txt`. `keys.txt` and the sheet keys are for the implementer and the controller alone; no reader sees them.

- [ ] **Step 9: Reads** (the controller's)

Per set and per round, each reader a new agent with nothing but its images and its prompt:

| read | image | prompt, word for word | passes when |
| --- | --- | --- | --- |
| blind | `r$R-<set>/pretty-icons-blind.png` | `read.md` "## How", N = 10, the ten names in alphabetical order | 10 of 10 named, none by elimination (`read.md`, Pass and fail) |
| craft | `r$R-<set>/pretty-icons-sheet.png` | `read.md` "## The craft read", N = 10, numbered in the sheet's alphabetical order | as `read.md` says |
| set | `r$R-<set>/pretty-icons-sheet.png` | `read.md` "## The set read", N = 10 | as `read.md` says |
| ranking ×3 | `r$R-rank-<set>-<i>-A.png`, `-B.png`, one pair per reader | "These are two sets of 10 icons, A and B, drawn for the same app. Which set is better drawn, as a set, A or B? Answer with the letter and, in five words or fewer, why." | the new set is picked by at least 2 of the 3 |
| shadow (garage) | `r$R-shadow/pretty-icons-shadow-A.png`, `-B.png` | `read.md` "## The shadow read", N = 10 | it has no fail: the pick decides |

The gate for a set is blind and ranking (spec, success items 3 and 4); craft and set are read and recorded every round, and what they name is redrawn in the next round if there is one, but they do not hold the set alone. After the shadow read, follow the pick on garage (`shadow.mjs … --on` for the shadowed letter, `--off` for the other), run `check.mjs` (`ok`) and the suite, and commit `feat: garage's shadow, chosen by the shadow read` if the files changed.

- [ ] **Step 10: A round that fails**

For a set that fails blind or ranking: redraw only what the readers named (an icon named wrongly or by elimination, the ranking readers' reasons, the craft and set readers' names), each change in `redraw.md` with the reader's words; then Steps 3 or 4 for that set, Steps 5 and 6, Step 7 with the message `fix: <set> round <R>, <what changed in a few words>`, and Step 8 and 9 with `R` one higher. A set that passes is not redrawn again.

After round 3, a set that still fails goes back to the person: stop, finish Step 11 with what failed and every reader's words, and report. (A controller following the subagent loop treats this as a stop: the person decides.)

- [ ] **Step 11: Record**

Create `docs/superpowers/baselines/2026-10-11-pretty-icons-polish-reference.md`, in the form of `2026-10-09-pretty-icons-identity-reference.md`:

```markdown
# pretty-icons polish: reference

Spec: `docs/superpowers/specs/2026-10-11-pretty-icons-polish-design.md` · Plan: `docs/superpowers/plans/2026-10-11-pretty-icons-polish.md`

## examples/hairline

(the `check.mjs --print` table and `ok`, from the final drawing)

What changed, per icon: (one line each, from `redraw.md`)

## examples/garage

(as hairline, and the shadow: on or off)

## Reads

(the prompts as sent; then a table: round · set · drawing commit · blind · craft · set · ranking (new picked k of 3) · shadow; then, per round and set, the seed, the sheet key, the ranking letters from keys.txt, and every answer verbatim with its verdict)

`REFERENCE_INK`: (old values) → (new values).
```

Copy each set's final `pretty-icons-sheet.png` to `docs/superpowers/baselines/2026-10-11-polish-after/hairline-sheet.png` and `garage-sheet.png`. Nothing else from `$SCRATCH` is committed. The reference set of forty icons is not named anywhere in the record.

- [ ] **Step 12: Commit**

```bash
rtk test node --test 'test/**/*.test.mjs'
rtk git add docs/superpowers/baselines/2026-10-11-pretty-icons-polish-reference.md docs/superpowers/baselines/2026-10-11-polish-after
rtk git commit -m "docs: the polish reference, the redrawn sets and their reads"
```

---

### Task 12: The trial

Two fresh agents, the skill only, six new names each: one duotone at 16, one filled at 48 (spec, success item 5 and The trial). This measures whether the rules, the docs and the examples are enough for a drawer who has seen none of this work. Nothing in the skill changes in this task; a trial that fails is recorded with the rule that held it, for the person to judge.

**Who does what.** As Task 11: the drawers and the readers are fresh agents the controller opens; the implementer (or the controller alone) writes the prompts, runs the final checks and the record.

**Files:**
- Modify: `docs/superpowers/baselines/2026-10-11-pretty-icons-polish-reference.md` (append `## The trial`)

**Interfaces:**
- Consumes: the skill as Task 11 left it, at `skills/pretty-icons/SKILL.md` in this repo; the record file of Task 11.
- Produces: the trial section of the record; the plan's last commit.

- [ ] **Step 1: Two empty folders**

```bash
T16=$(mktemp -d -t trial16); T48=$(mktemp -d -t trial48); echo "$T16 $T48"
```

- [ ] **Step 2: The two drawers** (the controller's)

Open one fresh agent per folder, at the same time, each with this prompt, word for word, `<folder>` and the names filled in:

> Your working directory for this whole task is `<folder>`. It is empty, and there is no app in it. Run every command from there (cd into it first in each shell command), and write nothing outside it.
>
> Use the skill in `<repo>/skills/pretty-icons/SKILL.md` to draw six icons for <app>, in the <finish> finish: <names>. Nobody is available to answer questions, so where the skill says to ask, take its recommendation and say so. Follow every step, the reads included. Before each `check.mjs` run, say "check run N". Stop at the hand-over and report what `check.mjs` printed each time, each icon's concept line, and each reader's answer.

| folder | app | finish | names |
| --- | --- | --- | --- |
| `T16` | the sidebar of a notes app; the sidebar text is 14px | duotone | inbox, calendar, chat, profile, search, upload |
| `T48` | a kitchen shop's category grid | filled | kettle, whisk, rolling-pin, pot, cup, toaster |

The names are chosen to need the new rules: soft bodies (chat, profile, kettle, cup), long objects for the diagonal (whisk, rolling-pin), details inside a body (calendar, toaster).

- [ ] **Step 3: The controller's own checks**

When both report:

```bash
for d in $T16 $T48; do rtk proxy node skills/pretty-icons/check.mjs $d/pretty-icons --print; rtk proxy node skills/pretty-icons/sheet.mjs $d/pretty-icons --seed=12 --out=$d/sheets; done
```

Then one more fresh reader per folder, the blind read (`read.md` "## How", N = 6, the six names in alphabetical order, on `$d/sheets/pretty-icons-blind.png`), so the verdict does not rest on the drawer's own readers.

A trial **passes** when its drawer reported `ok` on check run 1 or 2 (a scratch run on variants does not count) and the controller's blind read is 6 of 6, none by elimination. Otherwise it is **held**, with the first rule that held it.

- [ ] **Step 4: Record**

Append to the record, in the form of the 2026-10-09 record's `## The trial`:

```markdown
## The trial

(one paragraph: two fresh agents, the skill only, the folders empty)

### notes, duotone 16

(the prompt as sent; each check run as the agent reported it; the controller's `check.mjs --print` table; the agent's concept lines and reads; the controller's blind read, verbatim; Verdict: **passed** or **held**, and why, naming the rule)

### kitchen, filled 48

(the same)
```

The trial's folders are not committed.

- [ ] **Step 5: Commit**

```bash
rtk git add docs/superpowers/baselines/2026-10-11-pretty-icons-polish-reference.md
rtk git commit -m "docs: the polish trial, notes at 16 and kitchen at 48"
```

