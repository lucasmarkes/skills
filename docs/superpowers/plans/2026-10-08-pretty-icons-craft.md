# pretty-icons craft Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give `skills/pretty-icons` the craft of the two references: a shapes kit that prints clean curves on the quarter grid, curve measures in the check, a contour heavier than the line at 48, modifiers with a geometric knockout, a proof sheet the agent looks at while drawing, and a craft read after the blind read.

**Architecture:** Three new ES modules in the skill folder. `curve.mjs` measures joins, inflections and pixel fit analytically from path commands, over `geometry.mjs`'s command reader. `shapes.mjs` prints nine primitives as paste-ready elements. `modifiers.mjs` writes a badge, slash, lock, arrow or dot into an icon and cuts the base's strokes out of its halo. Beside them, `proof.mjs` draws `pretty-icons-proof.png` for `sheet.mjs --proof`. `check.mjs`, `filled.mjs`, `measure.mjs` and `presets.mjs` gain the new rules (curve, hierarchy, modifier), and the four prose files teach them. The `.svg` file stays the source of truth: the kit prints text the agent pastes, and a hand-drawn icon that passes is as valid as a composed one.

**Tech Stack:** Node ≥ 22 (ES modules, built-in `node --test`, no runtime dependencies in the repo), `@resvg/resvg-js` from the user's cache folder (as today), SVG 1.1. Python 3 with Pillow only for Task 1's measuring script, outside the repo.

**Spec:** `docs/superpowers/specs/2026-10-08-pretty-icons-craft-design.md`

## Global Constraints

- Node ≥ 22; tests run with `rtk test node --test 'test/**/*.test.mjs'` (`npm test` is the same command); no `npm install` in the repo.
- Rule 01 is not relaxed: every number in a `d`, anchors and control points, is a multiple of 0.25.
- No `<mask>`, no `<defs>`, no `g`, no `transform`: the knockout is geometric and the file stays flat.
- No colour and no offset shadow. The five tones stay: line `#25262a`, fill `#ececea`, shade `#cfcfcb`, paper `#ffffff`, mark `#8b8c90`.
- Hierarchy only at the filled finish (48): contour 2, line 1.5, bar 3.5. Duotone (16, 20, 24) keeps one stroke.
- A modifier in duotone is `currentColor` at `stroke-opacity="0.6"`; `--solid` omits it; at 48 a modifier has no opacity.
- Joins: under 4° smooth, over 30° a corner, 4° to 30° a kink. Inflections: at most one per cubic, none in a segment whose chord is under 4. A join beside a segment shorter than 1 is not judged.
- Command caps: 8 per path in duotone, 12 at 48.
- Failures print in this order: grid, stroke, palette, construction, join, inflection, modifier, then the raster measures. Notes print after failures under a `notes` line and never change the exit code.
- Every failure and note line is `rule  icon  got → want`. Exit 1 on failure, 0 on `ok`, 2 when not measured.
- The blind sheet does not change; the reference row never reaches it.
- `emit.mjs` does not change: it already passes every attribute through.
- A value the reference study (Task 1) moves changes the constant and its test in the task that owns it: `SMOOTH`, `CORNER` in `curve.mjs` (Task 2); the contour width in `filled.mjs` (Task 5); `OPACITY` and `MODIFIER` in `modifiers.mjs` and `presets.mjs` (Task 7).
- Prose files are in English, in the skill's voice: short sentences, "Keep it" and "Rejected when".
- Shell commands go through `rtk` (`rtk git …`, `rtk test …`). A script whose output you must read as printed runs as `rtk proxy node …`.
- One commit per task, `type: subject` in lower case. Never push, open a PR, or copy icons into an app without the person's say-so.

## Review Focus

Inputs the spec implies but no task's tests exercised at planning time. Each line's test is in the task named.

1. `check.mjs` on a set that passes but has pixel notes: the notes print before `ok` under a `notes` line, and the exit code stays 0 (Task 3, `check.test.mjs`).
2. `shapes.mjs` on 20 and 24, the grids no example is drawn on: every primitive lands on the quarter grid with no kink and no wobble (Task 6, `shapes.test.mjs`).
3. `modifiers.mjs --add` on a body at 20 and 24: each kind passes check, the halo scaled to the grid (Task 7, `modifiers.test.mjs`).
4. `sheet.mjs --proof` on a folder with no `.svg`: it says so on stderr and exits 1, with no stack trace (Task 8, `proof.test.mjs`).
5. A path the reader cannot read inside a proof: it is left out of the construction view and the proof is still drawn (Task 8, `proof.test.mjs`).

## File Structure

| File | Status | Responsibility |
| --- | --- | --- |
| `skills/pretty-icons/curve.mjs` | new | joins, inflections, pixel notes and the `--print` columns, from path commands |
| `skills/pretty-icons/shapes.mjs` | new | the kit: nine primitives, `--from` repair, CLI and module |
| `skills/pretty-icons/modifiers.mjs` | new | placement, halo, cut, glyphs, `addModifier`, the `modifier` rule, CLI |
| `skills/pretty-icons/proof.mjs` | new | the proof sheet: construction, finish, silhouette, pixels, reference row |
| `skills/pretty-icons/geometry.mjs` | modified | exports its command reader, `commands(d)` |
| `skills/pretty-icons/check.mjs` | modified | curve rules in the text layer, notes, columns; later the modifier rule and counts |
| `skills/pretty-icons/filled.mjs` | modified | the hierarchy: contour at 2; later a cut contour finds its tone |
| `skills/pretty-icons/presets.mjs` | modified | bodies inset by the contour at 48, `REFERENCE_INK[48]`, `MODIFIER` |
| `skills/pretty-icons/measure.mjs` | modified | a modified icon is measured for live and gap only, out of the median |
| `skills/pretty-icons/sheet.mjs` | modified | `stroke-opacity` reaches the sheet; `--proof [--only]` |
| `skills/pretty-icons/examples/garage/*.svg` | modified | contours at 2 and bodies receded (Task 5), then redrawn with the kit (Task 10) |
| `skills/pretty-icons/examples/hairline/*.svg` | modified | redrawn as the duotone bar, three or more with a modifier (Task 11) |
| `skills/pretty-icons/rules.md`, `rules-filled.md`, `read.md`, `SKILL.md` | modified | the craft rules, the gesture catalogue, the craft read, the loop |
| `test/pretty-icons/curve.test.mjs`, `shapes.test.mjs`, `modifiers.test.mjs`, `proof.test.mjs`, `docs.test.mjs` | new | one per new module, and the docs' claims |
| `test/pretty-icons/check.test.mjs`, `filled.test.mjs` | modified | notes and exit code; the hierarchy |
| `test/pretty-icons/fixtures/tonal-green/*.svg` | modified | the tent's kink fixed (Task 3); contours at 2 (Task 5) |
| `docs/superpowers/baselines/2026-10-08-pretty-icons-craft-reference.md` | new | the reference study, the before, and every read's answers |
| `docs/superpowers/baselines/2026-10-08-craft-after/{car,bakery}/*.svg` | new | the twenty icons redrawn with the kit |

## Deviations from the spec

Prototyping every task before writing this plan settled these. Where the spec and this list disagree, follow this list.

1. **Pixel note on duotone only.** It runs at the grid at 1× and 2× (`DISPLAY = {16:[16,32], 20:[20,40], 24:[24,48]}`), one line per icon. The filled grid has none: CSS scales it to any size, so no size is "the" size.
2. **Curve failures come at the end of the text checks**, each `d` judged once: a contour that repeats its tone's path is not judged twice.
3. **The kit's handles are solved on a collinear lattice**: both handles of a smooth anchor lie on one quarter-grid line through it, searched within 2° (`alongHandle`).
4. **The pixel note is analytic** (edge rows from the stroke's span), not a raster count.
5. The contour message is `… no fill, at 2`.
6. **The grid names the finish**; `shapes.mjs` has no `--finish` flag.
7. **The module API** is `shape(name, o)` and `finishOf(name, o)`, plus one named export per primitive.
8. **The halo** is `r = size/2 + 1.5 × baseStroke`; the slash's band is `ownStroke/2 + 1.5 × baseStroke`.
9. **A duotone badge is the glyph alone**; at 48 it is a paper circle, `r = size/2 − 1`, contour at 2.
10. **Counting.** A split body counts as one element and the modifier is not counted. `modifiers.mjs` checks the base first and refuses a result that would fail the text rules, gap or live (a cut can leave a stub nearer a body than a stroke: a slash on `connectivity` does). The spec's "refuse an icon that already has three" is superseded by this.
11. **Gap** leaves the modifier out, and in duotone also stroke-`none` paint.
12. **`wedge` and `scoop`** come without an automatic shade; asking for one is refused with the way out.
13. **`--lean`** −1..1 slides the belly by up to 0.3 of the box.
14. **A modified icon** is judged for live and gap only and stays out of the set's median.
15. **A cut arc**'s part at the cut end becomes a cubic, split at on-grid axis crossings; kept parts stay arcs.
16. **A cut cubic that would wobble** loses the handle at its cut end.
17. **Crumbs.** A run shorter than 1 is dropped; a dot (`h0`) is kept or dropped whole.
18. **`data-cut`** is `"split"` (a body's contour split from its paint) or `""` (any other cut stroke).
19. **A body wholly under the halo** is refused: try another `--corner`.
20. **One element per line** in what `addModifier` writes, with no blank line.
21. **Proof views** are 192 px; the small renders sit in 96 px cells at an integer scale.
22. **The proof is drawn** whether or not the set passes check.
23. **`sheet.mjs`** imports `proof.mjs` dynamically, so the blind and author sheets never load it.
24. **`--only`** takes `--only name` and `--only=name`.
25. **Three panels to a row.** The reference rows are `car`, `traffic-light`, `wrench` (filled) and `data`, `devices`, `security` (duotone).
26. **Task order.** Modifiers come before the proof (the proof draws the halo), and docs before the redraws (the redraws follow the docs).
27. **`--from` output.** A `d` prints the body, with each changed join on stderr. A file prints `path@N <d>` per repaired path.
28. **`MODIFIER`** is `{16: {size: 5, dot: 1.5}, 20: {size: 6.5, dot: 1.75}, 24: {size: 8, dot: 2.25}, 48: {size: 14.5, dot: 4}}`, about 0.36 of the live area. The corner is a CLI flag, not a preset value.
29. **The tent fixture** (`fixtures/tonal-green/tent.svg`) had a 10° kink. Task 3 fixes its handles so the GREEN set stays green.
30. **The croissant** is a `blob` with explicit anchors, not a `crescent`. A crescent's horns point straight down and it reads as a bell.
31. **The duotone references move with Task 11.** A modified example leaves the median, so three modifiers move the 20 and 24 references to 115.4 and 183. The 16 reference stays at 83.5.

---

### Task 1: Reference study

Measure the two references so the defaults in this plan are confirmed or moved before any code ships. Nothing in the repo's code changes here.

**Files:**
- Create: `docs/superpowers/baselines/2026-10-08-pretty-icons-craft-reference.md`
- Read: `docs/superpowers/baselines/refs/filled-ref-1.png`, `docs/superpowers/baselines/refs/line-ref-2.png` … `line-ref-8.png` (local only, `*.png` is ignored by git)

**Interfaces:**
- Consumes: nothing.
- Produces: the baseline file, whose later sections Tasks 4, 10, 11, 12 and 13 fill; a verdict per default. A moved default is changed by the task that owns its constant (Global Constraints).

- [ ] **Step 1: Save the measuring script outside the repo**

Save as `/tmp/pretty-icons-runs.py` (it needs Pillow: `python3 -c "import PIL"` must print nothing):

```python
"""Measure a reference image in pixels.

  python3 runs.py <image.png> row|col <index> [--from N] [--to N] [--dark 0..255]
      the dark runs along one row or column: `start-end width`, a stroke's width where the line crosses
  python3 runs.py <image.png> box <x0> <y0> <x1> <y1>
      the darkest and the lightest grey in a box: a modifier's tone against its base's, as a fraction
      (light - modifier) / (light - base)
Both print the image's size last.
"""
import sys
from PIL import Image

def runs(im, axis, index, lo=None, hi=None, dark=110):
    W, H = im.size
    n = W if axis == "row" else H
    lo, hi = lo or 0, hi or n
    px = [im.getpixel((i, index)) if axis == "row" else im.getpixel((index, i)) for i in range(lo, hi)]
    out, start = [], None
    for i, v in enumerate(px + [255]):
        if v <= dark and start is None: start = i
        if v > dark and start is not None: out.append((lo + start, lo + i - 1, i - start)); start = None
    return out

def box(im, x0, y0, x1, y1):
    vals = [im.getpixel((x, y)) for x in range(x0, x1 + 1) for y in range(y0, y1 + 1)]
    return min(vals), max(vals)

if __name__ == "__main__":
    a = sys.argv[1:]
    if len(a) < 3 or a[1] not in ("row", "col", "box"): sys.exit(__doc__)
    im = Image.open(a[0]).convert("L")
    if a[1] == "box":
        lo, hi = box(im, *map(int, a[2:6]))
        print(f"darkest {lo} lightest {hi}")
    else:
        opt = lambda k, d=None: int(a[a.index(k) + 1]) if k in a else d
        for s, e, w in runs(im, a[1], int(a[2]), opt("--from"), opt("--to"), opt("--dark", 110)): print(f"{s}-{e} {w}")
    print(f"image {im.size[0]}x{im.size[1]}")
```

- [ ] **Step 2: Check it runs**

Run: `rtk proxy python3 /tmp/pretty-icons-runs.py docs/superpowers/baselines/refs/line-ref-2.png box 0 0 200 200`
Expected: `darkest 30 lightest 255` then `image 1131x664`.

- [ ] **Step 3: Create the baseline file**

```markdown
# pretty-icons craft: reference study and reads

Companion to `docs/superpowers/specs/2026-10-08-pretty-icons-craft-design.md`. The references are the person's images in `docs/superpowers/baselines/refs/` (ignored by git, kept locally): `filled-ref-1.png` (the filled finish's bar) and `line-ref-2.png` … `line-ref-8.png` (the duotone finish's bar). Measured with `runs.py` (Task 1 of the plan); a width is in the image's own pixels, so only ratios and fractions are compared.

## Reference study

| Measured | From | Default | Measured | How (image, row/col or box) | Verdict |
| --- | --- | --- | --- | --- | --- |
| contour / inner line ratio | filled reference | 2 / 1.5 = 1.33 | | | |
| cusps per silhouette | filled reference | blob caps 6 (duotone), 10 (filled) anchors | | | |
| elements per icon | filled reference | 8 at 48 | | | |
| where the gesture sits and what it is | filled reference | seam, dot pair, tuft, steam, paper sheen, lean | | | |
| modifier size / live area | line reference | 0.36 (`MODIFIER`) | | | |
| halo width / stroke | line reference | 1.5 strokes beyond the modifier's ink | | | |
| modifier corner | line reference | `br` | | | |
| strokes per icon, terminals | line reference | 3 elements, 8 commands | | | |
| curve-to-straight ratio | line reference | `--bulge 0.55` | | | |
| modifier tone / base tone | line reference | 0.6 | | | |

## The before

## The bar: examples/garage

## The bar: examples/hairline

## The after

## The trial
```

- [ ] **Step 4: Measure each row**

Open each image with the Read tool to find the icons, then measure:

- **Contour / inner line.** On `filled-ref-1.png`, pick five icons. For each, find a row or column that crosses both the outline and an inner line, and run `rtk proxy python3 /tmp/pretty-icons-runs.py docs/superpowers/baselines/refs/filled-ref-1.png row <y> --from <x0> --to <x1>`. The ratio is the outline's run width over the inner line's. Write the median of the five.
- **Cusps, elements, gesture.** Count them by eye on the same five icons. For the gesture, write what it is and where it sits, one per icon.
- **Modifier size, halo, corner.** On the line-reference images, pick five icons that carry a badge, slash or lock. The size is the modifier's ink width over the icon's ink width, measured with `row` across both. The halo is the clear run between the modifier and the base, in strokes. The corner is where it sits.
- **Strokes, terminals, curves.** On five plain line-reference icons, count strokes and open ends, and estimate the share of the outline that is curved.
- **Modifier tone.** Draw a `box` over the modifier and another over the base. The fraction is (lightest − modifier's darkest) / (lightest − base's darkest).

Fill the Measured and How columns.

- [ ] **Step 5: Give each row a verdict**

Write `stays` when the measure is within these bands, and `moves to <value>` otherwise:

| Row | Band where the default stays |
| --- | --- |
| contour / inner line | 1.2 to 1.45 |
| modifier size / live area | 0.30 to 0.42 |
| modifier tone / base tone | 0.5 to 0.7 |
| halo | 1 to 2 strokes |
| the rest | they inform the gesture catalogue and the caps; they stay unless the count is off by more than half |

A `moves to` row names the task that changes the constant (Global Constraints). That task then edits the constant and every test that pins it before its own step 1.

- [ ] **Step 6: Commit**

```bash
rtk git add docs/superpowers/baselines/2026-10-08-pretty-icons-craft-reference.md
rtk git commit -m "docs: reference study for pretty-icons craft"
```

### Task 2: `curve.mjs`: joins, inflections, pixel notes

**Files:**
- Create: `skills/pretty-icons/curve.mjs`
- Modify: `skills/pretty-icons/geometry.mjs` (export the command reader)
- Test: `test/pretty-icons/curve.test.mjs`

**Interfaces:**
- Consumes: `commands(d)` from `geometry.mjs`, a generator of `{ C, rel, a }` (the command upper-cased, whether it was relative, its numbers), made public here; `parse(text)` from `svg.mjs`.
- Produces: `SMOOTH = 4`, `CORNER = 30`, `MIN_SEGMENT = 1`, `MIN_CHORD = 4`; `DISPLAY = {16:[16,32], 20:[20,40], 24:[24,48]}`; `segments(d) → [{ segs, closed, start }]`, each seg `{ kind: "line"|"cubic"|"arc", p, t0, t1, chord }` (throws on a path it cannot read); `joinsOf(subs)` and `joins(d) → [{ at: [x,y], angle, kind: "smooth"|"corner"|"kink" }]`; `inflections(seg) → number`; `curveFailures(icon, el) → failure[]` (rules `join`, `inflection`); `curveColumns(elements) → { joins: "12 smooth · 2 corners[ · 1 kink]", infl }`; `greyRows`, `fewestGrey`, `straightStrokes`; `pixelNotes(icon, parsed, G) → note[]` (rule `pixel`, duotone only).

- [ ] **Step 1: Write the failing test**

Create `test/pretty-icons/curve.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { segments, joins, inflections, curveFailures, curveColumns, greyRows, fewestGrey, pixelNotes, SMOOTH, CORNER } from "../../skills/pretty-icons/curve.mjs";
import { parse } from "../../skills/pretty-icons/svg.mjs";

const el = (d, at = "path@1") => ({ tag: "path", attrs: { d }, at });
const infl = (d) => segments(d)[0].segs.map(inflections);
// a line along x, then a second line turned by `deg` at 24,24
const turn = (deg) => {
  const r = (deg * Math.PI) / 180;
  return `M4 24H24L${(24 + 10 * Math.cos(r)).toFixed(4)} ${(24 + 10 * Math.sin(r)).toFixed(4)}`;
};

test("the thresholds are the spec's: under 4° smooth, over 30° a corner", () => {
  assert.equal(SMOOTH, 4);
  assert.equal(CORNER, 30);
});

test("a join between 4° and 30° is a kink; 2° is smooth and 45° a corner", () => {
  assert.deepEqual(curveFailures("x", el(turn(2))), []);
  assert.deepEqual(curveFailures("x", el(turn(45))), []);
  const f = curveFailures("x", el(turn(10)));
  assert.equal(f.length, 1);
  assert.equal(f[0].rule, "join");
  assert.equal(f[0].got, "path@1 10.0° at 24, 24");
  assert.equal(f[0].want, "under 4° or over 30°: smooth, or a corner on purpose");
});

test("a closed path joins its last segment to its first", () => {
  const j = joins("M4 4H20V20H4Z");
  assert.equal(j.length, 4);
  assert.ok(j.every((x) => x.kind === "corner"));
  // a circle of four cubics whose last handle is pulled 10° off where the first one leaves
  const k = joins("M4 24C4 13 13 4 24 4C35 4 44 13 44 24C44 35 35 44 24 44C13 44 6 35 4 24Z");
  assert.deepEqual(k.map((x) => x.kind), ["smooth", "smooth", "smooth", "kink"]);
});

test("relative, S, Q and T commands join where their reflections say", () => {
  const j = joins("m4 4c4 0 8 4 8 8s4 8 8 8q4 0 4 4t4 4");
  assert.deepEqual(j.map((x) => x.kind), ["smooth", "smooth", "smooth"]);
  // S after L has no handle to reflect: its first control is the current point
  assert.equal(segments("M4 4L8 4S12 8 16 8")[0].segs[1].kind, "cubic");
});

test("drawing on after Z without a move starts a new subpath; a zero-length segment is no segment", () => {
  assert.equal(segments("M4 4H20V20ZL30 30").length, 2);
  assert.equal(segments("M4 4L4 4H20")[0].segs.length, 1);
  assert.deepEqual(curveFailures("x", el("M4 4L4 4H20")), []);
});

test("a join next to a segment shorter than 1 is a terminal, not judged", () => {
  assert.deepEqual(curveFailures("x", el("M4 24H24L24.5 24.1")), []);
});

test("a cubic that changes sides twice is a wobble; once over a long chord is an S", () => {
  assert.deepEqual(infl("M4 24C40 10 8 10 44 24"), [2]);
  assert.deepEqual(infl("M4 24C14 14 24 34 34 24"), [1]);
  assert.deepEqual(curveFailures("x", el("M4 24C14 14 24 34 34 24")), []);
  const f = curveFailures("x", el("M4 24C40 10 8 10 44 24"));
  assert.equal(f.length, 1);
  assert.equal(f[0].rule, "inflection");
  assert.equal(f[0].want, "at most 1, none under a chord of 4");
});

test("an inflection in a segment shorter than 4 fails", () => {
  const f = curveFailures("x", el("M4 24C5 23 6 25 7 24"));
  assert.deepEqual(f.map((x) => x.got), ["path@1 segment 1 1 inflection over a chord of 3"]);
});

test("a path the reader cannot read is the elements rule's, not curve's", () => {
  assert.deepEqual(curveFailures("x", el("M5 8h6B")), []);
});

test("rects, circles and lines have no joins to judge", () => {
  assert.deepEqual(curveFailures("x", { tag: "rect", attrs: { x: "4", y: "4", width: "8", height: "8" }, at: "rect@1" }), []);
});

test("curve columns count each path once and name kinks only when there are some", () => {
  const sq = "M4 4H20V20H4Z";
  assert.deepEqual(curveColumns([el(sq), el(sq)]), { joins: "0 smooth · 4 corners", infl: 0 });
  assert.deepEqual(curveColumns([el(sq), el(turn(10))]), { joins: "0 smooth · 4 corners · 1 kink", infl: 0 });
});

test("grey rows: a span on whole pixels leaves none, one straddling them leaves two", () => {
  assert.equal(greyRows(7, 9), 0);
  assert.equal(greyRows(7.5, 9.5), 2);
  assert.equal(fewestGrey(1.5), 1);
  assert.equal(fewestGrey(2), 0);
});

test("pixel notes: a 1.5 stroke centred on a whole number at 16 is off at 16 and 32, in one line; at .75 it is not", () => {
  const icon = (d) => parse(`<svg viewBox="0 0 16 16" stroke="currentColor" stroke-width="1.5"><path d="${d}" /></svg>`);
  assert.deepEqual(pixelNotes("x", icon("M8 2V14"), 16).map((n) => n.got), ["1 of 1 straight strokes off the pixel at 16 px, 1 at 32 px"]);
  assert.deepEqual(pixelNotes("x", icon("M7.75 2V14"), 16), []);
  assert.equal(pixelNotes("x", icon("M8 2V14"), 16)[0].want, "their edges on whole pixels");
});

test("pixel notes skip what has no stroke and curves", () => {
  const icon = parse(`<svg viewBox="0 0 16 16" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="10" height="10" rx="1.5" stroke="none" fill="currentColor" /><path d="M3 8C3 3 13 3 13 8" /></svg>`);
  assert.deepEqual(pixelNotes("x", icon, 16), []);
});

test("the filled grid has no pixel note: CSS scales it", () => {
  const icon = parse(`<svg viewBox="0 0 48 48" stroke="#25262a" stroke-width="1.5"><path d="M24 6V42" /></svg>`);
  assert.deepEqual(pixelNotes("x", icon, 48), []);
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `rtk test node --test test/pretty-icons/curve.test.mjs`
Expected: FAIL, `Cannot find module '.../skills/pretty-icons/curve.mjs'`.

- [ ] **Step 3: Export the command reader**

Save this diff as `/tmp/t2-geometry.patch` and apply it from the repo root with `rtk git apply /tmp/t2-geometry.patch`:

```diff
--- a/skills/pretty-icons/geometry.mjs
+++ b/skills/pretty-icons/geometry.mjs
@@ -67,7 +67,7 @@
  * A path's commands, one at a time, as `{ C, rel, a }`: the command upper-cased, whether it was
  * relative, and its numbers. Implicit repeats come out as commands of their own (after M, an L).
  */
-function* commands(d) {
+export function* commands(d) {
   const toks = d.match(TOKENS) ?? [];
   let i = 0, cmd = "";
   const next = () => Number(toks[i++]);
```

- [ ] **Step 4: Write `curve.mjs`**

Create `skills/pretty-icons/curve.mjs`:

```js
/**
 * Curve quality, read from a path's commands, no pixels:
 *   join        at every anchor, the angle between the tangent arriving and the tangent leaving,
 *               including L→C, C→A and the segment Z draws: under 4° smooth, over 30° a corner on
 *               purpose, between them a kink. A join is measured where both segments are at least 1
 *               long; a shorter one is a terminal, not a join.
 *   inflection  where a cubic changes the side it bends to: at most one per segment, none in a
 *               segment whose chord is under 4. Two is a wobble.
 *   pixel       a note, never a failure: straight H and V strokes whose edges land between pixels at
 *               the display size, so they show a grey row the same stroke placed elsewhere would not.
 * Rects and circles have no joins to judge: a rect's corners are corners, its arcs meet smoothly.
 */
import { commands } from "./geometry.mjs";
import { num } from "./svg.mjs";
import { preset } from "./presets.mjs";

export const SMOOTH = 4, CORNER = 30, MIN_SEGMENT = 1, MIN_CHORD = 4;
/**
 * The sizes a duotone grid is shown at: 1× and 2×. The filled grid has none: CSS scales it to 16–64 px,
 * and at 32 (two thirds) few edges can land on whole pixels, so a note there would name nearly every icon.
 */
export const DISPLAY = { 16: [16, 32], 20: [20, 40], 24: [24, 48] };

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const len = (v) => Math.hypot(v[0], v[1]);
const cross = (u, v) => u[0] * v[1] - u[1] * v[0];
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const fmt = (n) => String(+n.toFixed(2));
/** The angle between two directions, in degrees, 0 to 180. */
export const angle = (u, v) => Math.acos(Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / (len(u) * len(v) || 1)))) * 180 / Math.PI;

const line = (p0, p1) => ({ kind: "line", p: [p0, p1], t0: sub(p1, p0), t1: sub(p1, p0), chord: len(sub(p1, p0)) });
function cubic(p0, c1, c2, p3) {
  // a handle of zero length leaves the tangent to the next control point, then to the far end
  const t0 = [sub(c1, p0), sub(c2, p0), sub(p3, p0)].find((v) => len(v) > 1e-9);
  const t1 = [sub(p3, c2), sub(p3, c1), sub(p3, p0)].find((v) => len(v) > 1e-9);
  return t0 && t1 ? { kind: "cubic", p: [p0, c1, c2, p3], t0, t1, chord: len(sub(p3, p0)) } : null;
}
function arc(p0, p1, [rx0, ry0, deg, large, sweep]) {
  let rx = Math.abs(rx0), ry = Math.abs(ry0);
  if (rx < 1e-9 || ry < 1e-9) return line(p0, p1);
  const phi = deg * Math.PI / 180, cos = Math.cos(phi), sin = Math.sin(phi);
  const dx = (p0[0] - p1[0]) / 2, dy = (p0[1] - p1[1]) / 2, x1 = cos * dx + sin * dy, y1 = -sin * dx + cos * dy;
  const L = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry);
  if (L > 1) { rx *= Math.sqrt(L); ry *= Math.sqrt(L); }
  const n = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1, den = rx * rx * y1 * y1 + ry * ry * x1 * x1;
  const k = (large === sweep ? -1 : 1) * Math.sqrt(Math.max(0, n / den));
  const cx = (k * rx * y1) / ry, cy = (-k * ry * x1) / rx;
  const th0 = Math.atan2((y1 - cy) / ry, (x1 - cx) / rx), th1 = Math.atan2((-y1 - cy) / ry, (-x1 - cx) / rx);
  const dir = (th) => { const ex = -rx * Math.sin(th), ey = ry * Math.cos(th), v = [cos * ex - sin * ey, sin * ex + cos * ey]; return sweep ? v : [-v[0], -v[1]]; };
  let dth = th1 - th0;
  if (sweep && dth < 0) dth += 2 * Math.PI; else if (!sweep && dth > 0) dth -= 2 * Math.PI;
  const c = [cos * cx - sin * cy + (p0[0] + p1[0]) / 2, sin * cx + cos * cy + (p0[1] + p1[1]) / 2];
  // the ellipse itself, for cutting: centre, radii as drawn, start angle and the angle swept (signed)
  return { kind: "arc", p: [p0, p1], t0: dir(th0), t1: dir(th1), chord: len(sub(p1, p0)), arc: { rx, ry, deg, sweep, c, th0, dth } };
}

/**
 * A path's segments, one list per subpath, each `{ kind, p, t0, t1, chord }`: p the points (a cubic's
 * four; a line's or an arc's two), t0 and t1 the directions leaving and arriving. A quadratic is read as
 * its cubic. A segment of zero length is not a segment. `closed` when the subpath ends in Z.
 */
export function segments(d) {
  const subs = [];
  let cur = null, x = 0, y = 0, sx = 0, sy = 0, prev = "", ctrl = [0, 0];
  for (const { C, rel, a } of commands(d)) {
    const X = (v) => (rel ? x + v : v), Y = (v) => (rel ? y + v : v), p0 = [x, y];
    if (C === "M") { x = X(a[0]); y = Y(a[1]); sx = x; sy = y; subs.push((cur = { segs: [], closed: false, start: [x, y] })); prev = C; continue; }
    // after Z, drawing on without a move starts a new subpath where the last one began
    if (!cur) subs.push((cur = { segs: [], closed: false, start: [x, y] }));
    let seg = null, p1;
    if (C === "C" || C === "S") {
      const c1 = C === "C" ? [X(a[0]), Y(a[1])] : "CS".includes(prev) ? [2 * x - ctrl[0], 2 * y - ctrl[1]] : p0;
      const o = C === "C" ? 2 : 0, c2 = [X(a[o]), Y(a[o + 1])];
      p1 = [X(a[o + 2]), Y(a[o + 3])]; seg = cubic(p0, c1, c2, p1); ctrl = c2;
    } else if (C === "Q" || C === "T") {
      const q = C === "Q" ? [X(a[0]), Y(a[1])] : "QT".includes(prev) ? [2 * x - ctrl[0], 2 * y - ctrl[1]] : p0;
      p1 = C === "Q" ? [X(a[2]), Y(a[3])] : [X(a[0]), Y(a[1])];
      seg = cubic(p0, lerp(p0, q, 2 / 3), lerp(p1, q, 2 / 3), p1); ctrl = q;
    } else if (C === "A") {
      p1 = [X(a[5]), Y(a[6])];
      if (len(sub(p1, p0)) > 1e-9) seg = arc(p0, p1, a);
    } else {
      p1 = C === "H" ? [X(a[0]), y] : C === "V" ? [x, Y(a[0])] : C === "Z" ? [sx, sy] : [X(a[0]), Y(a[1])];
      if (len(sub(p1, p0)) > 1e-9) seg = line(p0, p1);
    }
    if (seg) cur.segs.push(seg);
    [x, y] = p1;
    if (C === "Z") { cur.closed = true; cur = null; }
    prev = C;
  }
  return subs;
}

/** Every join of a path read by `segments`: `{ at: [x, y], angle, kind: "smooth" | "corner" | "kink" }`. */
export function joinsOf(subs) {
  const out = [];
  for (const { segs, closed } of subs) {
    const pairs = segs.slice(1).map((s, i) => [segs[i], s]);
    if (closed && segs.length > 1) pairs.push([segs.at(-1), segs[0]]);
    for (const [u, v] of pairs) {
      if (u.chord < MIN_SEGMENT || v.chord < MIN_SEGMENT) continue;
      const a = angle(u.t1, v.t0);
      out.push({ at: u.p.at(-1), angle: a, kind: a < SMOOTH ? "smooth" : a > CORNER ? "corner" : "kink" });
    }
  }
  return out;
}
export const joins = (d) => joinsOf(segments(d));

/** How many times a cubic changes the side it bends to, strictly inside it; 0 for anything else. */
export function inflections(seg) {
  if (seg.kind !== "cubic") return 0;
  const [p0, p1, p2, p3] = seg.p, a = sub(p1, p0), b = sub(p2, p1), c = sub(p3, p2);
  // B'(t)/3 = A t² + B t + a and B''(t)/6 = A t + B/2; they are parallel where k2 t² + k1 t + k0 = 0
  const A = [a[0] - 2 * b[0] + c[0], a[1] - 2 * b[1] + c[1]], B = [2 * (b[0] - a[0]), 2 * (b[1] - a[1])];
  const k2 = -cross(A, B), k1 = 2 * cross(a, A), k0 = cross(a, B), eps = 1e-9;
  let roots = [];
  if (Math.abs(k2) < eps) { if (Math.abs(k1) > eps) roots = [-k0 / k1]; }
  else {
    const disc = k1 * k1 - 4 * k2 * k0;
    // a double root touches zero curvature without crossing it: not an inflection
    if (disc > eps) roots = [(-k1 - Math.sqrt(disc)) / (2 * k2), (-k1 + Math.sqrt(disc)) / (2 * k2)];
  }
  return roots.filter((t) => t > 1e-3 && t < 1 - 1e-3).length;
}

/** The join and inflection failures of one element; a path the reader cannot read is the elements rule's, not these. */
export function curveFailures(icon, el) {
  if (el.tag !== "path") return [];
  let subs;
  try { subs = segments(el.attrs.d ?? ""); } catch { return []; }
  const out = [];
  for (const j of joinsOf(subs)) if (j.kind === "kink")
    out.push({ rule: "join", icon, got: `${el.at} ${j.angle.toFixed(1)}° at ${fmt(j.at[0])}, ${fmt(j.at[1])}`, want: `under ${SMOOTH}° or over ${CORNER}°: smooth, or a corner on purpose` });
  subs.flatMap((s) => s.segs).forEach((s, i) => {
    const n = inflections(s);
    if (n >= 2 || (n >= 1 && s.chord < MIN_CHORD))
      out.push({ rule: "inflection", icon, got: `${el.at} segment ${i + 1} ${n} inflection${n > 1 ? "s" : ""} over a chord of ${fmt(s.chord)}`, want: `at most 1, none under a chord of ${MIN_CHORD}` });
  });
  return out;
}

/** An icon's curve columns for --print: its joins by kind and its inflections, each path drawn once (a contour repeats its tone). */
export function curveColumns(elements) {
  let smooth = 0, corner = 0, kink = 0, infl = 0;
  const seen = new Set();
  for (const el of elements) {
    const d = el.tag === "path" ? el.attrs.d ?? "" : null;
    if (d === null || seen.has(d)) continue;
    seen.add(d);
    let subs;
    try { subs = segments(d); } catch { continue; }
    for (const j of joinsOf(subs)) j.kind === "smooth" ? smooth++ : j.kind === "corner" ? corner++ : kink++;
    for (const s of subs) for (const g of s.segs) infl += inflections(g);
  }
  return { joins: `${smooth} smooth · ${corner} corners${kink ? ` · ${kink} kink${kink > 1 ? "s" : ""}` : ""}`, infl };
}

/** The rows of grey a span from e0 to e1 leaves: pixels it covers by more than 0.2 and less than 0.8. */
export function greyRows(e0, e1) {
  let n = 0;
  for (let r = Math.floor(e0); r < e1; r++) {
    const cover = Math.min(e1, r + 1) - Math.max(e0, r);
    if (cover > 0.2 + 1e-9 && cover < 0.8 - 1e-9) n++;
  }
  return n;
}
/** The fewest grey rows a span this wide can leave, wherever it lands. */
export const fewestGrey = (span) => Math.min(...Array.from({ length: 64 }, (_, i) => greyRows(i / 64, i / 64 + span)));

/** Every straight horizontal or vertical stroke at least 1 long that an icon draws: `{ c, w }`, its centre across it and its width. */
export function straightStrokes(parsed, G) {
  const rootW = num(parsed.attrs, "stroke-width", preset(G).stroke), out = [];
  for (const el of parsed.elements) {
    const a = el.attrs;
    if (String(a.stroke ?? parsed.attrs.stroke ?? "none").trim().toLowerCase() === "none") continue;
    const w = num(a, "stroke-width", rootW);
    if (el.tag === "rect") {
      const x = num(a, "x", 0), y = num(a, "y", 0), wd = num(a, "width"), ht = num(a, "height"), rx = num(a, "rx", 0);
      if (ht - 2 * rx >= MIN_SEGMENT) out.push({ c: x, w }, { c: x + wd, w });
      if (wd - 2 * rx >= MIN_SEGMENT) out.push({ c: y, w }, { c: y + ht, w });
    } else if (el.tag === "line") {
      const [x1, y1, x2, y2] = ["x1", "y1", "x2", "y2"].map((k) => num(a, k, 0));
      if (x1 === x2 && Math.abs(y2 - y1) >= MIN_SEGMENT) out.push({ c: x1, w });
      else if (y1 === y2 && Math.abs(x2 - x1) >= MIN_SEGMENT) out.push({ c: y1, w });
    } else if (el.tag === "path") {
      let subs = [];
      try { subs = segments(a.d ?? ""); } catch {}
      for (const s of subs) for (const g of s.segs) {
        if (g.kind !== "line" || g.chord < MIN_SEGMENT) continue;
        const [[x0, y0], [x1, y1]] = g.p;
        if (Math.abs(x0 - x1) < 1e-9) out.push({ c: x0, w }); else if (Math.abs(y0 - y1) < 1e-9) out.push({ c: y0, w });
      }
    }
  }
  return out;
}

/** An icon's pixel note, one line for every display size it is off at, or none. */
export function pixelNotes(icon, parsed, G) {
  const sizes = DISPLAY[G] ?? [];
  if (!sizes.length) return [];
  const strokes = straightStrokes(parsed, G), off = [];
  for (const S of sizes) {
    const k = S / G;
    const n = strokes.filter(({ c, w }) => greyRows((c - w / 2) * k, (c + w / 2) * k) > fewestGrey(w * k)).length;
    if (n) off.push(off.length ? `${n} at ${S} px` : `${n} of ${strokes.length} straight strokes off the pixel at ${S} px`);
  }
  return off.length ? [{ rule: "pixel", icon, got: off.join(", "), want: "their edges on whole pixels" }] : [];
}
```

- [ ] **Step 5: Run the test to see it pass, then the suite**

Run: `rtk test node --test test/pretty-icons/curve.test.mjs`
Expected: 15 pass, 0 fail.

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: all pass (158), 0 fail. `check.mjs` does not use `curve.mjs` yet.

- [ ] **Step 6: Commit**

```bash
rtk git add skills/pretty-icons/curve.mjs skills/pretty-icons/geometry.mjs test/pretty-icons/curve.test.mjs
rtk git commit -m "feat: curve.mjs measures joins, inflections and pixel fit"
```

### Task 3: The check judges curves and prints notes

**Files:**
- Modify: `skills/pretty-icons/check.mjs` (curve rules at the end of the text layer, notes, `--print` columns)
- Modify: `test/pretty-icons/fixtures/tonal-green/tent.svg` (its 10° kink)
- Test: `test/pretty-icons/check.test.mjs`

**Interfaces:**
- Consumes: `curveFailures`, `curveColumns`, `pixelNotes` from Task 2.
- Produces: `checkSet(folder, { grid, measure }) → { G, failures, measured, why, rows, notes }`, where `notes` is new and each row gains `joins` and `infl`; `formatFailure(f)`. The CLI prints failures, then `notes` and each note, then `ok` or exits 1. Notes never change the exit code.

- [ ] **Step 1: Write the failing tests**

These include Review Focus line 1, notes with exit code 0.

Save this diff as `/tmp/t3-test.patch` and apply it from the repo root with `rtk git apply /tmp/t3-test.patch`:

```diff
--- a/test/pretty-icons/check.test.mjs
+++ b/test/pretty-icons/check.test.mjs
@@ -168,3 +168,23 @@
   const r = await checkSet(dir);
   assert.deepEqual(r.failures.filter((f) => f.rule === "gap" && f.icon === "pair").map((f) => f.got), ["path#2@3 to path#3@3 0 apart"]);
 });
+
+test("check prints notes after the failures, and notes never change the exit code", () => {
+  const cli = new URL("../../skills/pretty-icons/check.mjs", import.meta.url).pathname;
+  const r = spawnSync(process.execPath, [cli, fix("good-16")], { encoding: "utf8" });
+  assert.equal(r.status, 0, r.stdout + r.stderr);
+  const lines = r.stdout.trim().split("\n");
+  assert.equal(lines.at(-1), "ok");
+  assert.equal(lines[0], "notes");
+  assert.match(lines[1], /^pixel  tile  5 of 5 straight strokes off the pixel at 16 px, 5 at 32 px → their edges on whole pixels$/);
+});
+
+test("check judges a kinked curve once, even when a contour repeats its tone's path", async () => {
+  const dir = mkdtempSync(join(tmpdir(), "curve-"));
+  try {
+    const d = "M8 24H28L37.85 25.74";
+    writeFileSync(join(dir, "kinked.svg"), `<svg viewBox="0 0 48 48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">\n<path d="${d}" fill="#ececea" stroke="none" />\n<path d="${d}" />\n</svg>`);
+    const r = await checkSet(dir, { measure: false });
+    assert.deepEqual(r.failures.filter((f) => f.rule === "join").map((f) => f.got), ["path@2 10.0° at 28, 24"]);
+  } finally { rmSync(dir, { recursive: true, force: true }); }
+});
```

- [ ] **Step 2: Run them to see them fail**

Run: `rtk test node --test test/pretty-icons/check.test.mjs`
Expected: 2 fail: `check prints notes after the failures, and notes never change the exit code` (the first line is `ok`, not `notes`) and `check judges a kinked curve once…` (no `join` failure).

- [ ] **Step 3: Wire the curve rules into `check.mjs`**

Save this diff as `/tmp/t3-check.patch` and apply it from the repo root with `rtk git apply /tmp/t3-check.patch`:

```diff
--- a/skills/pretty-icons/check.mjs
+++ b/skills/pretty-icons/check.mjs
@@ -29,6 +29,7 @@
 import { parse, num, G as gridOf, ELEMENTS, pathNumbers, pathCommands, moves, isClosed } from "./svg.mjs";
 import { straightSides } from "./geometry.mjs";
 import { filledChecks } from "./filled.mjs";
+import { curveFailures, curveColumns, pixelNotes } from "./curve.mjs";
 
 export { pathCommands, isClosed };
 
@@ -115,6 +116,13 @@
 
   if (parsed.elements.length > p.elements) fail(failures, "count", icon, `${parsed.elements.length} elements`, `at most ${p.elements}`);
   if (parsed.elements.length === 0) fail(failures, "count", icon, "0 elements", "at least 1");
+  // curves, after every other text rule; each path once, since a contour repeats its tone's
+  const seen = new Set();
+  for (const el of parsed.elements) {
+    if (el.tag !== "path" || seen.has(el.attrs.d)) continue;
+    seen.add(el.attrs.d);
+    failures.push(...curveFailures(icon, el));
+  }
 
   return { G, failures, parsed };
 }
@@ -167,31 +175,35 @@
 export async function checkSet(folder, { grid, measure = true, loadMeasure = () => import("./measure.mjs") } = {}) {
   const set = readSet(folder);
   // nothing to measure, so nothing was left unmeasured
-  if (set.length === 0) return { failures: [{ rule: "set", icon: folder, got: "no .svg files", want: "at least one" }], measured: true, why: "", G: null, rows: [] };
+  if (set.length === 0) return { failures: [{ rule: "set", icon: folder, got: "no .svg files", want: "at least one" }], measured: true, why: "", G: null, rows: [], notes: [] };
   const G = setGrid(set, grid);
   const failures = [];
   // An icon the text layer could not read (elements) or placed on another canvas is not measured:
   // its text line already says why, and a renderer would only throw on it or skew the median.
-  const unreadable = new Set();
+  const unreadable = new Set(), readable = [];
   for (const s of set) {
-    const f = textChecks(s.name, s.text, G).failures;
+    const { failures: f, parsed } = textChecks(s.name, s.text, G);
     if (f.some((x) => x.rule === "elements" || x.rule === "canvas")) unreadable.add(s.name);
+    else readable.push([s.name, parsed]);
     failures.push(...f);
   }
   // A grid with no preset has nothing to measure against; canvas has failed every icon.
-  if (!GRIDS[G]) return { G, failures, measured: true, why: "", rows: [] };
+  if (!GRIDS[G]) return { G, failures, measured: true, why: "", rows: [], notes: [] };
+  // notes never fail the set: they say what a person may want to look at
+  const notes = readable.flatMap(([name, parsed]) => pixelNotes(name, parsed, G));
+  const columns = new Map(readable.map(([name, parsed]) => [name, curveColumns(parsed.elements)]));
   let measured = false, rows = [], why = "";
   if (measure) {
     try {
       const { measuredChecks } = await loadMeasure();
       const r = await measuredChecks(set.filter((s) => !unreadable.has(s.name)), G);
-      failures.push(...r.failures); rows = r.rows; measured = true;
+      failures.push(...r.failures); rows = r.rows.map((row) => ({ ...row, ...columns.get(row.icon) })); measured = true;
     } catch (e) {
       if (!unmeasurable(e)) throw e;
       why = e.message;
     }
   }
-  return { G, failures, measured, why, rows };
+  return { G, failures, measured, why, rows, notes };
 }
 
 export async function main(argv) {
@@ -204,6 +216,7 @@
   const r = await checkSet(folder, { grid });
   if (argv.includes("--print")) { console.table(r.rows); }
   for (const f of r.failures) console.log(formatFailure(f));
+  if (r.notes.length) { console.log("notes"); for (const n of r.notes) console.log(formatFailure(n)); }
   if (!r.measured) { console.log(`not measured: ${r.why}`); process.exit(2); }
   if (r.failures.length) process.exit(1);
   console.log("ok");
```

- [ ] **Step 4: Run the suite and see the tent fail**

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: 1 fail, `the GREEN set: six travel icons a fresh agent drew with the skill pass every rule`: the tent's roof joins its walls at 10°, a kink.

- [ ] **Step 5: Fix the tent's handles**

Each handle is moved onto the line through its anchor, the same edit in all three paths:

Save this diff as `/tmp/t3-tent.patch` and apply it from the repo root with `rtk git apply /tmp/t3-tent.patch`:

```diff
--- a/test/pretty-icons/fixtures/tonal-green/tent.svg
+++ b/test/pretty-icons/fixtures/tonal-green/tent.svg
@@ -1,6 +1,6 @@
 <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
-  <path d="M24 8.75C36 10.5 43.25 24 43.25 39.25H4.75C4.75 24 12 10.5 24 8.75Z" fill="#ececea" stroke="none" />
-  <path d="M24 8.75C36 10.5 43.25 24 43.25 39.25H24Z" fill="#cfcfcb" stroke="none" />
-  <path d="M24 8.75C36 10.5 43.25 24 43.25 39.25H4.75C4.75 24 12 10.5 24 8.75Z" />
+  <path d="M24 8.75C35 12.5 43.25 24 43.25 39.25H4.75C4.75 24 13 12.5 24 8.75Z" fill="#ececea" stroke="none" />
+  <path d="M24 8.75C35 12.5 43.25 24 43.25 39.25H24Z" fill="#cfcfcb" stroke="none" />
+  <path d="M24 8.75C35 12.5 43.25 24 43.25 39.25H4.75C4.75 24 13 12.5 24 8.75Z" />
   <path d="M18.5 39.25L24 25.75L29.5 39.25Z" fill="#ffffff" />
 </svg>
```

- [ ] **Step 6: Run the suite**

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: all pass (160), 0 fail.

- [ ] **Step 7: Commit**

```bash
rtk git add skills/pretty-icons/check.mjs test/pretty-icons/check.test.mjs test/pretty-icons/fixtures/tonal-green/tent.svg
rtk git commit -m "feat: check judges joins and inflections and prints pixel notes"
```

### Task 4: Measure the before

The twenty icons drawn with the skill this week, ten for a car app and ten for a bakery, are in `docs/superpowers/baselines/2026-10-08-craft-before/car` and `docs/superpowers/baselines/2026-10-08-craft-before/bakery` (committed with this plan). Measure them with the new check, before anything else changes.

**Files:**
- Modify: `docs/superpowers/baselines/2026-10-08-pretty-icons-craft-reference.md` (section "The before")

**Interfaces:**
- Consumes: `check.mjs --print` from Task 3, with its `joins` and `infl` columns.
- Produces: the before's numbers, which Task 12 compares with the after.

- [ ] **Step 1: Run the check on both sets**

Run: `rtk proxy node skills/pretty-icons/check.mjs docs/superpowers/baselines/2026-10-08-craft-before/car --print`
Expected: a table with `joins` and `infl` columns, then the failures, exit 1.

Run: `rtk proxy node skills/pretty-icons/check.mjs docs/superpowers/baselines/2026-10-08-craft-before/bakery --print`
Expected: the same for the bakery.


The `join` lines must include at least these (weight lines also print, and do not matter here):

```text
join  banco  path@5 10.0° at 8.75, 15.5 → under 4° or over 30°: smooth, or a corner on purpose
join  cone  path@3 8.0° at 28.25, 6.75 → under 4° or over 30°: smooth, or a corner on purpose
join  cone  path@3 8.0° at 19.75, 6.75 → under 4° or over 30°: smooth, or a corner on purpose
join  cone  path@4 8.0° at 28.25, 6.75 → under 4° or over 30°: smooth, or a corner on purpose
join  marcha  path@5 7.2° at 37.25, 43.25 → under 4° or over 30°: smooth, or a corner on purpose
join  marcha  path@5 9.5° at 8.75, 41.25 → under 4° or over 30°: smooth, or a corner on purpose
join  triangulo  path@2 10.3° at 26.5, 6.25 → under 4° or over 30°: smooth, or a corner on purpose
…  (four more triangulo joins)
join  croissant  path@2 8.8° at 35.25, 36.25 → under 4° or over 30°: smooth, or a corner on purpose
join  croissant  path@2 8.8° at 12.75, 36.25 → under 4° or over 30°: smooth, or a corner on purpose
join  croissant  path@3 8.8° at 35.25, 36.25 → under 4° or over 30°: smooth, or a corner on purpose
```

If no `join` line prints, stop: the before must show at least one kink (spec, success 1), and a check that finds none is broken.

- [ ] **Step 2: Record the before**

Under "## The before" in the baseline file, write one table per set with these columns: icon, joins, infl. Copy them from the `--print` tables. Then add one line per set with the totals of smooth joins, corners, kinks and inflections. At planning time the totals were 12 kinks in car (banco 1, cone 3, marcha 2, triangulo 6) and 3 in bakery (croissant 3). If they differ, write the measured numbers and say why.

- [ ] **Step 3: Commit**

```bash
rtk git add docs/superpowers/baselines/2026-10-08-pretty-icons-craft-reference.md
rtk git commit -m "docs: the before, twenty icons measured for joins and inflections"
```

### Task 5: The hierarchy at 48

A body's contour is 2; the parts' line stays 1.5; a bar stays 3.5. The bodies table recedes by 0.25 per edge so a contour at 2 still lands its ink on the keyline. Duotone does not change.

**Files:**
- Modify: `skills/pretty-icons/filled.mjs`, `skills/pretty-icons/presets.mjs`, `skills/pretty-icons/rules-filled.md`
- Modify: `skills/pretty-icons/examples/garage/*.svg` (ten), `test/pretty-icons/fixtures/tonal-green/*.svg` (six): contours at 2, bodies receded
- Test: `test/pretty-icons/filled.test.mjs`

**Interfaces:**
- Consumes: `classify(elements)` in `filled.mjs`, which already tells a contour from a line by matching its geometry with a tone.
- Produces: `preset(48).contour === 2`; `body(48, format)` inset by the contour (circle `r 19`, square `x 7 y 7 w 34 h 34`, portrait `x 9 y 5 w 30 h 38`, landscape `x 5 y 9 w 38 h 30`); `REFERENCE_INK[48] = 328.7`; the failures `stroke  <icon>  <el> contour at <w> → 2` and `construction  <icon>  <el> … contour without a tone`.

- [ ] **Step 1: Write the failing tests**

Save this diff as `/tmp/t5-test.patch` and apply it from the repo root with `rtk git apply /tmp/t5-test.patch`:

```diff
--- a/test/pretty-icons/filled.test.mjs
+++ b/test/pretty-icons/filled.test.mjs
@@ -17,9 +17,9 @@
 
 // The worked example: brackets, tone, shade, contour, three lamps.
 const LIGHT = read("traffic-light");
-const TONE = '<rect x="13.75" y="4.75" width="20.5" height="38.5" rx="8" fill="#ececea" stroke="none" />';
-const SHADE = '<path d="M26.25 4.75A8 8 0 0 1 34.25 12.75V35.25A8 8 0 0 1 26.25 43.25Z" fill="#cfcfcb" stroke="none" />';
-const CONTOUR = '<rect x="13.75" y="4.75" width="20.5" height="38.5" rx="8" />';
+const TONE = '<rect x="13.75" y="5" width="20.5" height="38" rx="8" fill="#ececea" stroke="none" />';
+const SHADE = '<path d="M26.25 5A8 8 0 0 1 34.25 13V35A8 8 0 0 1 26.25 43Z" fill="#cfcfcb" stroke="none" />';
+const CONTOUR = '<rect x="13.75" y="5" width="20.5" height="38" rx="8" stroke-width="2" />';
 const add = (el) => LIGHT.replace("</svg>", `  ${el}\n</svg>`);
 const check = (svg) => textChecks("traffic-light", svg, 48);
 
@@ -30,6 +30,8 @@
   assert.equal(p.finish, "filled");
   assert.equal(preset(16).finish, "duotone");
   assert.equal(p.stroke, 1.5);
+  assert.equal(p.contour, 2);
+  assert.equal(preset(16).contour, undefined);
   assert.deepEqual(p.weights, [2, 3.5]);
   assert.deepEqual(preset(16).weights, []);
   assert.equal(p.pad, 4);
@@ -49,10 +51,12 @@
 });
 
 test("bodies at 48, and radii by character: cut, cased, moulded, pill", () => {
-  assert.deepEqual(body(48, "circle"), { tag: "circle", cx: 24, cy: 24, r: 19.25 });
-  assert.deepEqual(body(48, "square"), { tag: "rect", x: 6.75, y: 6.75, w: 34.5, h: 34.5, rx: 6 });
-  assert.deepEqual(body(48, "portrait"), { tag: "rect", x: 8.75, y: 4.75, w: 30.5, h: 38.5, rx: 6 });
-  assert.deepEqual(body(48, "landscape"), { tag: "rect", x: 4.75, y: 8.75, w: 38.5, h: 30.5, rx: 6 });
+  // drawn at the contour's 2, so the ink still lands on the keyline
+  assert.deepEqual(body(48, "circle"), { tag: "circle", cx: 24, cy: 24, r: 19 });
+  assert.deepEqual(body(48, "square"), { tag: "rect", x: 7, y: 7, w: 34, h: 34, rx: 6 });
+  assert.deepEqual(body(48, "portrait"), { tag: "rect", x: 9, y: 5, w: 30, h: 38, rx: 6 });
+  assert.deepEqual(body(48, "landscape"), { tag: "rect", x: 5, y: 9, w: 38, h: 30, rx: 6 });
+  assert.deepEqual(body(16, "circle"), { tag: "circle", cx: 8, cy: 8, r: 6.25 }, "the duotone bodies are unchanged");
   assert.deepEqual(radiiFor(48, 20.5), [2, 6, 8, 10.25]);
   assert.deepEqual(radiiFor(48, 9), [1.5, 2.5, 4, 4.5]);
   assert.deepEqual(radiiFor(48, 6.5), [1, 1.5, 2.5, 3.25]);
@@ -112,12 +116,19 @@
 
 test("construction: tone, shade, contour, in that order, the contour pasted", () => {
   const bare = check(LIGHT.replace(`  ${CONTOUR}\n`, ""));
-  assert.ok(lines(bare).includes("construction  traffic-light  rect@3 fill #ececea stroke none → its contour after it: the same geometry, no fill, the root's line"), lines(bare).join("\n"));
+  assert.ok(lines(bare).includes("construction  traffic-light  rect@3 fill #ececea stroke none → its contour after it: the same geometry, no fill, at 2"), lines(bare).join("\n"));
   const late = check(LIGHT.replace(`${SHADE}\n  ${CONTOUR}`, `${CONTOUR}\n  ${SHADE}`));
   assert.deepEqual(lines(late), ["construction  traffic-light  path@5 shade → between a body's tone and its contour, so the line covers its edge"]);
   const redrawn = check(LIGHT.replace(CONTOUR, CONTOUR.replace('rx="8"', 'rx="6"')));
   assert.ok(rules(redrawn).includes("construction"), "a contour of other geometry is not the tone's");
-  assert.deepEqual(lines(check(LIGHT.replace(CONTOUR, CONTOUR.replace(" />", ' stroke-width="2" />')))), ["construction  traffic-light  rect@5 stroke-width 2 → the root's line on a contour"]);
+});
+
+test("the hierarchy: a contour at 2, the parts' line at 1.5, a closed line at 2 is a contour without a tone", () => {
+  assert.deepEqual(lines(check(LIGHT.replace(CONTOUR, CONTOUR.replace(' stroke-width="2"', "")))), ["stroke  traffic-light  rect@5 contour at 1.5 → 2"]);
+  assert.deepEqual(lines(check(LIGHT.replace(CONTOUR, CONTOUR.replace('stroke-width="2"', 'stroke-width="3.5"')))), ["stroke  traffic-light  rect@5 contour at 3.5 → 2"]);
+  assert.deepEqual(lines(check(add('<circle cx="24" cy="24" r="2" stroke-width="2" />'))), ["construction  traffic-light  circle@9 contour without a tone → a tone before it with the same geometry, or the root's line"]);
+  assert.deepEqual(lines(check(add('<circle cx="24" cy="24" r="2" />'))), [], "a closed line at the root's width is a part");
+  assert.deepEqual(lines(check(add('<path d="M24 44V40" stroke-width="2" stroke="#8b8c90" />'))), [], "an open mark at 2 stays allowed");
   const none = check(LIGHT.replace(`  ${TONE}\n`, "").replace(`  ${SHADE}\n`, ""));
   assert.ok(lines(none).includes("construction  traffic-light  no body → a closed element in the fill tone, #ececea"), lines(none).join("\n"));
 });
@@ -130,7 +141,7 @@
 });
 
 test("light: the shade sits below or right of its body's centre", () => {
-  const left = SHADE.replace("M26.25 4.75A8 8 0 0 1 34.25 12.75V35.25A8 8 0 0 1 26.25 43.25Z", "M21.75 4.75A8 8 0 0 0 13.75 12.75V35.25A8 8 0 0 0 21.75 43.25Z");
+  const left = SHADE.replace("M26.25 5A8 8 0 0 1 34.25 13V35A8 8 0 0 1 26.25 43Z", "M21.75 5A8 8 0 0 0 13.75 13V35A8 8 0 0 0 21.75 43Z");
   assert.deepEqual(lines(check(LIGHT.replace(SHADE, left))), ["light  traffic-light  path@4 shade centred at 17.75, 24 → below or right of rect@3's centre 24, 24: the light comes from the top"]);
 });
 
```

- [ ] **Step 2: Run them to see them fail**

Run: `rtk test node --test test/pretty-icons/filled.test.mjs`
Expected: 7 fail, among them `the hierarchy: a contour at 2, the parts' line at 1.5, a closed line at 2 is a contour without a tone` and `bodies at 48, and radii by character: cut, cased, moulded, pill`.

- [ ] **Step 3: The hierarchy in `filled.mjs` and the receded bodies in `presets.mjs`**

Save this diff as `/tmp/t5-code.patch` and apply it from the repo root with `rtk git apply /tmp/t5-code.patch`:

```diff
--- a/skills/pretty-icons/filled.mjs
+++ b/skills/pretty-icons/filled.mjs
@@ -21,7 +21,7 @@
 import { parse, compose, isClosed, geometryKey, num } from "./svg.mjs";
 import { straightSides, sampleParts, bounds } from "./geometry.mjs";
 
-const SIDES = 5, DOT = 2, BAR = 3.5;
+const SIDES = 5, DOT = 2, BAR = 3.5, CONTOUR = 2;
 const TONES = new Map(Object.entries(PALETTE).map(([name, hex]) => [hex, name]));
 const hex = (v) => String(v ?? "").trim().toLowerCase();
 const isNone = (v) => v === undefined || hex(v) === "none";
@@ -77,9 +77,16 @@
   for (const t of c.tones) {
     const k = geometryKey(t), twin = c.contours.find((x) => at(x) > at(t) && geometryKey(x) === k);
     if (twin) contourOf.set(t, twin);
-    else fail(failures, "construction", icon, `${t.at} fill ${t.attrs.fill} stroke none`, "its contour after it: the same geometry, no fill, the root's line");
+    else fail(failures, "construction", icon, `${t.at} fill ${t.attrs.fill} stroke none`, "its contour after it: the same geometry, no fill, at 2");
   }
-  for (const el of c.contours) if ("stroke-width" in el.attrs) fail(failures, "construction", icon, `${el.at} stroke-width ${el.attrs["stroke-width"]}`, "the root's line on a contour");
+  // the hierarchy: a contour at 2, over the parts' line at the root's 1.5; a closed line at 2 is a contour that lost its tone
+  const rootW = num(root, "stroke-width");
+  for (const el of c.contours) {
+    const w = num(el.attrs, "stroke-width", rootW);
+    if (w !== CONTOUR) fail(failures, "stroke", icon, `${el.at} contour at ${w}`, `${CONTOUR}`);
+  }
+  for (const el of c.lines) if (isClosed(el) && num(el.attrs, "stroke-width", rootW) === CONTOUR)
+    fail(failures, "construction", icon, `${el.at} contour without a tone`, "a tone before it with the same geometry, or the root's line");
   // a shade sits inside a body: after its tone, before its contour, below or right of its centre
   for (const s of c.shades) {
     const t = [...contourOf.keys()].reverse().find((x) => at(x) < at(s) && at(contourOf.get(x)) > at(s));
--- a/skills/pretty-icons/presets.mjs
+++ b/skills/pretty-icons/presets.mjs
@@ -18,7 +18,8 @@
   48: {
     // No shadow: the keylines sit in the live area as the duotone's do, centred at 24.
     // Three weights: the root's line, a mark (2), a bar (3.5). A rect's radius is chosen by what the object is: RADII.
-    finish: "filled", stroke: 1.5, weights: [2, 3.5], pad: 4, elements: 8, commands: 12,
+    // The hierarchy: a body's contour at 2, the parts' line at 1.5 (the root's), a bar at 3.5.
+    finish: "filled", stroke: 1.5, contour: 2, weights: [2, 3.5], pad: 4, elements: 8, commands: 12,
     keylineTol: 1, gravityTol: 3, weightTol: 0.25, referenceTol: 0.25,
     keylines: { circle: [40, 40], square: [36, 36], portrait: [32, 40], landscape: [40, 32] },
   },
@@ -81,9 +82,10 @@
   return [RADII.cut[step], RADII.cased[step], RADII.moulded[step], size / 2];
 }
 
-/** The element whose ink lands exactly on a keyline. */
+/** The element whose ink lands exactly on a keyline, drawn at the contour's width (the filled finish's 2) or the stroke's. */
 export function body(G, format) {
-  const { stroke, keylines, centre: [cx, cy] } = preset(G);
+  const { stroke: line, contour, keylines, centre: [cx, cy] } = preset(G);
+  const stroke = contour ?? line;
   const kl = keylines[format];
   if (!kl) throw new Error(`no keyline "${format}"; one of ${FORMATS.join(", ")}`);
   const [kw, kh] = kl;
@@ -107,5 +109,6 @@
  * at the grid's own stroke: 20 keeps 16's 1.5, so ink does not grow with the area.
  * On 48 it is the median line ink of examples/garage: the contours and marks, not the paint.
  */
-export const REFERENCE_INK = { 16: 83.5, 20: 114.2, 24: 181.9, 48: 277.2 };
+export const REFERENCE_INK = { 16: 83.5, 20: 114.2, 24: 181.9, 48: 328.7 };
 export const referenceInk = (G) => REFERENCE_INK[G];
+
```

- [ ] **Step 4: Run the suite and see the old drawings fail**

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: 13 fail. Every icon drawn with its contour at 1.5 is now rejected: the garage, the worked traffic light, the GREEN set.

- [ ] **Step 5: Redraw the contours at 2 and recede the bodies**

Each body's contour gains `stroke-width="2"`; a body on a keyline moves in by 0.25 per edge, its tone and shade with it.

Save this diff as `/tmp/t5-svg.patch` and apply it from the repo root with `rtk git apply /tmp/t5-svg.patch`:

```diff
--- a/skills/pretty-icons/examples/garage/battery.svg
+++ b/skills/pretty-icons/examples/garage/battery.svg
@@ -1,8 +1,8 @@
 <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
   <rect x="10.75" y="8.75" width="6.5" height="7" rx="2.5" fill="#25262a" />
   <rect x="30.75" y="8.75" width="6.5" height="7" rx="2.5" fill="#25262a" />
-  <rect x="4.75" y="13.75" width="38.5" height="25.5" rx="6" fill="#ececea" stroke="none" />
-  <path d="M4.75 32.5H43.25V33.25A6 6 0 0 1 37.25 39.25H10.75A6 6 0 0 1 4.75 33.25Z" fill="#cfcfcb" stroke="none" />
-  <rect x="4.75" y="13.75" width="38.5" height="25.5" rx="6" />
+  <rect x="5" y="13.75" width="38" height="25.5" rx="6" fill="#ececea" stroke="none" />
+  <path d="M5 32.5H43V33.25A6 6 0 0 1 37.25 39.25H10.75A6 6 0 0 1 5 33.25Z" fill="#cfcfcb" stroke="none" />
+  <rect x="5" y="13.75" width="38" height="25.5" rx="6" stroke-width="2" />
   <path d="M11 24H17.5M14.25 20.75V27.25M30.5 24H37" stroke-width="2" />
 </svg>
--- a/skills/pretty-icons/examples/garage/car.svg
+++ b/skills/pretty-icons/examples/garage/car.svg
@@ -1,7 +1,7 @@
 <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
-  <path d="M4.75 31.5C4.75 23.5 9.5 22.5 13.5 21.75C15.5 13.5 17 8.75 24 8.75C31 8.75 32.5 13.5 34.5 21.75C38.5 22.5 43.25 23.5 43.25 31.5C43.25 33.5 42 34 40.5 34H7.5C6 34 4.75 33.5 4.75 31.5Z" fill="#ececea" stroke="none" />
-  <path d="M5 29H43C43.25 29.75 43.25 30.75 43.25 31.5C43.25 33.5 42 34 40.5 34H7.5C6 34 4.75 33.5 4.75 31.5C4.75 30.75 4.75 29.75 5 29Z" fill="#cfcfcb" stroke="none" />
-  <path d="M4.75 31.5C4.75 23.5 9.5 22.5 13.5 21.75C15.5 13.5 17 8.75 24 8.75C31 8.75 32.5 13.5 34.5 21.75C38.5 22.5 43.25 23.5 43.25 31.5C43.25 33.5 42 34 40.5 34H7.5C6 34 4.75 33.5 4.75 31.5Z" />
+  <path d="M5 31.5C5 23.5 9.5 22.5 13.5 21.75C15.5 13.5 17 8.75 24 8.75C31 8.75 32.5 13.5 34.5 21.75C38.5 22.5 43 23.5 43 31.5C43 33.5 42 34 40.5 34H7.5C6 34 5 33.5 5 31.5Z" fill="#ececea" stroke="none" />
+  <path d="M5 29H43C43 29.75 43 30.75 43 31.5C43 33.5 42 34 40.5 34H7.5C6 34 5 33.5 5 31.5C5 30.75 5 29.75 5 29Z" fill="#cfcfcb" stroke="none" />
+  <path d="M5 31.5C5 23.5 9.5 22.5 13.5 21.75C15.5 13.5 17 8.75 24 8.75C31 8.75 32.5 13.5 34.5 21.75C38.5 22.5 43 23.5 43 31.5C43 33.5 42 34 40.5 34H7.5C6 34 5 33.5 5 31.5Z" stroke-width="2" />
   <path d="M19.75 20.75C20.25 17 21.5 14.5 24 14.5C26.5 14.5 27.75 17 28.25 20.75Z" fill="#ffffff" />
   <circle cx="13.5" cy="34.75" r="4.5" fill="#25262a" />
   <circle cx="34.5" cy="34.75" r="4.5" fill="#25262a" />
--- a/skills/pretty-icons/examples/garage/fuel.svg
+++ b/skills/pretty-icons/examples/garage/fuel.svg
@@ -1,8 +1,8 @@
 <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
   <path d="M32.25 15C36.5 15 39.25 17 39.25 21.5V32.5C39.25 34.5 38.5 35.5 37.25 35.5" />
-  <rect x="9.75" y="4.75" width="22.5" height="38.5" rx="6" fill="#ececea" stroke="none" />
-  <path d="M9.75 35.5H32.25V37.25A6 6 0 0 1 26.25 43.25H15.75A6 6 0 0 1 9.75 37.25Z" fill="#cfcfcb" stroke="none" />
-  <rect x="9.75" y="4.75" width="22.5" height="38.5" rx="6" />
+  <rect x="9.75" y="5" width="22.5" height="38" rx="6" fill="#ececea" stroke="none" />
+  <path d="M9.75 35.5H32.25V37.25A6 6 0 0 1 26.25 43H15.75A6 6 0 0 1 9.75 37.25Z" fill="#cfcfcb" stroke="none" />
+  <rect x="9.75" y="5" width="22.5" height="38" rx="6" stroke-width="2" />
   <rect x="14.75" y="9.75" width="12.5" height="9" rx="2.5" fill="#ffffff" />
   <path d="M16 26H26" stroke="#8b8c90" stroke-width="2" />
 </svg>
--- a/skills/pretty-icons/examples/garage/gearshift.svg
+++ b/skills/pretty-icons/examples/garage/gearshift.svg
@@ -1,9 +1,9 @@
 <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
-  <path d="M24 26.25V34.75" stroke-width="3.5" />
-  <path d="M24 26.25V34.75" stroke="#ececea" />
-  <rect x="8.75" y="34.75" width="30.5" height="8.5" rx="4.25" fill="#cfcfcb" />
-  <circle cx="24" cy="15.5" r="10.75" fill="#ececea" stroke="none" />
-  <path d="M13.25 15.5A10.75 10.75 0 0 0 34.75 15.5Z" fill="#cfcfcb" stroke="none" />
-  <circle cx="24" cy="15.5" r="10.75" />
-  <path d="M19.5 12V19M24 12V19M28.5 12V19M19.5 15.5H28.5" />
+  <path d="M24 26.5V34.5" stroke-width="3.5" />
+  <path d="M24 26.5V34.5" stroke="#ececea" />
+  <rect x="8.75" y="34.5" width="30.5" height="8.5" rx="4.25" fill="#cfcfcb" />
+  <circle cx="24" cy="15.75" r="10.75" fill="#ececea" stroke="none" />
+  <path d="M13.25 15.75A10.75 10.75 0 0 0 34.75 15.75Z" fill="#cfcfcb" stroke="none" />
+  <circle cx="24" cy="15.75" r="10.75" stroke-width="2" />
+  <path d="M19.5 12.25V19.25M24 12.25V19.25M28.5 12.25V19.25M19.5 15.75H28.5" />
 </svg>
--- a/skills/pretty-icons/examples/garage/oil.svg
+++ b/skills/pretty-icons/examples/garage/oil.svg
@@ -1,8 +1,8 @@
 <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
-  <path d="M16 19.5L4.75 12V15L16 25.5Z" fill="#ececea" />
+  <path d="M16 19.5L5 12V15L16 25.5Z" fill="#ececea" />
   <rect x="24.75" y="8.75" width="9" height="6.5" rx="2.5" fill="#25262a" />
   <rect x="16" y="14.75" width="26.25" height="24.5" rx="6" fill="#ececea" stroke="none" />
   <path d="M16 33H42.25V33.25A6 6 0 0 1 36.25 39.25H22A6 6 0 0 1 16 33.25Z" fill="#cfcfcb" stroke="none" />
-  <rect x="16" y="14.75" width="26.25" height="24.5" rx="6" />
+  <rect x="16" y="14.75" width="26.25" height="24.5" rx="6" stroke-width="2" />
   <path d="M8 25C10 27.5 10.75 29 10.75 30.5C10.75 32.25 9.5 33.5 8 33.5C6.5 33.5 5.25 32.25 5.25 30.5C5.25 29 6 27.5 8 25Z" fill="#25262a" />
 </svg>
--- a/skills/pretty-icons/examples/garage/speedometer.svg
+++ b/skills/pretty-icons/examples/garage/speedometer.svg
@@ -1,7 +1,7 @@
 <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
-  <path d="M4.75 32C4.75 18.5 13.5 8.75 24 8.75C34.5 8.75 43.25 18.5 43.25 32C43.25 36 40.5 39.25 36.5 39.25H11.5C7.5 39.25 4.75 36 4.75 32Z" fill="#ececea" stroke="none" />
+  <path d="M5 32C5 18.5 13.5 8.75 24 8.75C34.5 8.75 43 18.5 43 32C43 36 40.5 39.25 36.5 39.25H11.5C7.5 39.25 5 36 5 32Z" fill="#ececea" stroke="none" />
   <path d="M5 34.5H43C42.25 37.25 39.75 39.25 36.5 39.25H11.5C8.25 39.25 5.75 37.25 5 34.5Z" fill="#cfcfcb" stroke="none" />
-  <path d="M4.75 32C4.75 18.5 13.5 8.75 24 8.75C34.5 8.75 43.25 18.5 43.25 32C43.25 36 40.5 39.25 36.5 39.25H11.5C7.5 39.25 4.75 36 4.75 32Z" />
+  <path d="M5 32C5 18.5 13.5 8.75 24 8.75C34.5 8.75 43 18.5 43 32C43 36 40.5 39.25 36.5 39.25H11.5C7.5 39.25 5 36 5 32Z" stroke-width="2" />
   <path d="M9.5 31H12M13.5 18.25 15.25 20M24 13.75V16.25M34.5 18.25 32.75 20M38.5 31H36" stroke="#8b8c90" stroke-width="2" />
   <path d="M24 31L30.25 23" stroke-width="2" />
   <circle cx="24" cy="31" r="2.75" fill="#25262a" />
--- a/skills/pretty-icons/examples/garage/steering-wheel.svg
+++ b/skills/pretty-icons/examples/garage/steering-wheel.svg
@@ -5,5 +5,5 @@
   <path d="M5.75 24H17.5M30.5 24H42.25M24 30.5V42.25" stroke="#ececea" />
   <circle cx="24" cy="24" r="6.5" fill="#ececea" stroke="none" />
   <path d="M17.5 24A6.5 6.5 0 0 0 30.5 24Z" fill="#cfcfcb" stroke="none" />
-  <circle cx="24" cy="24" r="6.5" />
+  <circle cx="24" cy="24" r="6.5" stroke-width="2" />
 </svg>
--- a/skills/pretty-icons/examples/garage/traffic-light.svg
+++ b/skills/pretty-icons/examples/garage/traffic-light.svg
@@ -1,8 +1,8 @@
 <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
   <path d="M8.75 18H13.75M8.75 30H13.75M34.25 18H39.25M34.25 30H39.25" />
-  <rect x="13.75" y="4.75" width="20.5" height="38.5" rx="8" fill="#ececea" stroke="none" />
-  <path d="M26.25 4.75A8 8 0 0 1 34.25 12.75V35.25A8 8 0 0 1 26.25 43.25Z" fill="#cfcfcb" stroke="none" />
-  <rect x="13.75" y="4.75" width="20.5" height="38.5" rx="8" />
+  <rect x="13.75" y="5" width="20.5" height="38" rx="8" fill="#ececea" stroke="none" />
+  <path d="M26.25 5A8 8 0 0 1 34.25 13V35A8 8 0 0 1 26.25 43Z" fill="#cfcfcb" stroke="none" />
+  <rect x="13.75" y="5" width="20.5" height="38" rx="8" stroke-width="2" />
   <circle cx="24" cy="13" r="4" fill="#25262a" />
   <circle cx="24" cy="24" r="4" fill="#ffffff" />
   <circle cx="24" cy="35" r="4" fill="#ffffff" />
--- a/skills/pretty-icons/examples/garage/tyre.svg
+++ b/skills/pretty-icons/examples/garage/tyre.svg
@@ -1,9 +1,9 @@
 <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
-  <circle cx="24" cy="24" r="19.25" fill="#25262a" />
+  <circle cx="24" cy="24" r="19" fill="#25262a" />
   <path d="M24 10V7.75M38 24H40.25M24 38V40.25M10 24H7.75" stroke="#8b8c90" />
   <path d="M34 14 35.5 12.5M34 34 35.5 35.5M14 34 12.5 35.5M14 14 12.5 12.5" stroke="#8b8c90" />
   <circle cx="24" cy="24" r="10.5" fill="#ececea" stroke="none" />
   <path d="M13.5 24A10.5 10.5 0 0 0 34.5 24Z" fill="#cfcfcb" stroke="none" />
-  <circle cx="24" cy="24" r="10.5" />
+  <circle cx="24" cy="24" r="10.5" stroke-width="2" />
   <path d="M24 19h0M28.75 22.5h0M27 28h0M21 28h0M19.25 22.5h0" stroke-width="2" />
 </svg>
--- a/skills/pretty-icons/examples/garage/wrench.svg
+++ b/skills/pretty-icons/examples/garage/wrench.svg
@@ -1,6 +1,6 @@
 <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
   <path d="M15 40L32 23C37.5 24.5 43.5 19 41.5 12.5L36.5 17.5C34 18 30.5 14.5 31 12L36 7C29.5 5 23.5 10.5 25 16L8 33C5.5 35.5 12.5 42.5 15 40Z" fill="#ececea" stroke="none" />
-  <path d="M15 40L32 23C37.5 24.5 43.5 19 41.5 12.5L36.5 17.5C34 18 30.5 14.5 31 12L36 7C29.5 5 23.5 10.5 25 16L8 33C5.5 35.5 12.5 42.5 15 40Z" />
+  <path d="M15 40L32 23C37.5 24.5 43.5 19 41.5 12.5L36.5 17.5C34 18 30.5 14.5 31 12L36 7C29.5 5 23.5 10.5 25 16L8 33C5.5 35.5 12.5 42.5 15 40Z" stroke-width="2" />
   <path d="M17.5 30.5L26 22" stroke-width="3.5" />
   <path d="M17.5 30.5L26 22" stroke="#cfcfcb" />
   <circle cx="13.5" cy="34.5" r="1.75" fill="#ffffff" />
--- a/test/pretty-icons/fixtures/tonal-green/camera.svg
+++ b/test/pretty-icons/fixtures/tonal-green/camera.svg
@@ -1,8 +1,8 @@
 <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
   <rect x="16" y="8.75" width="16" height="6" rx="2.5" fill="#25262a" />
-  <rect x="4.75" y="14.75" width="38.5" height="24.5" rx="6" fill="#ececea" stroke="none" />
-  <path d="M4.75 32.5H43.25V33.25A6 6 0 0 1 37.25 39.25H10.75A6 6 0 0 1 4.75 33.25Z" fill="#cfcfcb" stroke="none" />
-  <rect x="4.75" y="14.75" width="38.5" height="24.5" rx="6" />
+  <rect x="5" y="14.75" width="38" height="24.5" rx="6" fill="#ececea" stroke="none" />
+  <path d="M5 32.5H43V33.25A6 6 0 0 1 37.25 39.25H10.75A6 6 0 0 1 5 33.25Z" fill="#cfcfcb" stroke="none" />
+  <rect x="5" y="14.75" width="38" height="24.5" rx="6" stroke-width="2" />
   <circle cx="24" cy="27" r="8" fill="#ffffff" />
   <circle cx="24" cy="27" r="2.5" fill="#25262a" />
 </svg>
--- a/test/pretty-icons/fixtures/tonal-green/compass.svg
+++ b/test/pretty-icons/fixtures/tonal-green/compass.svg
@@ -1,7 +1,7 @@
 <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
-  <circle cx="24" cy="24" r="19.25" fill="#ececea" stroke="none" />
+  <circle cx="24" cy="24" r="19" fill="#ececea" stroke="none" />
   <path d="M6.5 30A19.25 19.25 0 0 0 41.5 30Z" fill="#cfcfcb" stroke="none" />
-  <circle cx="24" cy="24" r="19.25" />
+  <circle cx="24" cy="24" r="19" stroke-width="2" />
   <path d="M33.5 14.5L19.5 19.5L28.5 28.5Z" fill="#25262a" />
   <path d="M14.5 33.5L19.5 19.5L28.5 28.5Z" fill="#ffffff" />
 </svg>
--- a/test/pretty-icons/fixtures/tonal-green/map.svg
+++ b/test/pretty-icons/fixtures/tonal-green/map.svg
@@ -1,7 +1,7 @@
 <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
-  <rect x="4.75" y="8.75" width="38.5" height="30.5" rx="2" fill="#ececea" stroke="none" />
-  <path d="M31.5 8.75H41.25A2 2 0 0 1 43.25 10.75V37.25A2 2 0 0 1 41.25 39.25H35.5Z" fill="#cfcfcb" stroke="none" />
-  <rect x="4.75" y="8.75" width="38.5" height="30.5" rx="2" />
+  <rect x="5" y="8.75" width="38" height="30.5" rx="2" fill="#ececea" stroke="none" />
+  <path d="M31.5 8.75H41A2 2 0 0 1 43 10.75V37.25A2 2 0 0 1 41 39.25H35.5Z" fill="#cfcfcb" stroke="none" />
+  <rect x="5" y="8.75" width="38" height="30.5" rx="2" stroke-width="2" />
   <path d="M16.5 8.75L12.5 39.25M31.5 8.75L35.5 39.25" />
   <path d="M24 33C24 33 19.75 28.5 19.75 24.5A4.25 4.25 0 0 1 28.25 24.5C28.25 28.5 24 33 24 33Z" fill="#25262a" />
 </svg>
--- a/test/pretty-icons/fixtures/tonal-green/suitcase.svg
+++ b/test/pretty-icons/fixtures/tonal-green/suitcase.svg
@@ -1,7 +1,7 @@
 <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
-  <path d="M17.25 10.75V4.75H30.75V10.75" />
-  <rect x="8.75" y="10.75" width="30.5" height="32.5" rx="6" fill="#ececea" stroke="none" />
-  <path d="M32.5 10.75H33.25A6 6 0 0 1 39.25 16.75V37.25A6 6 0 0 1 33.25 43.25H32.5Z" fill="#cfcfcb" stroke="none" />
-  <rect x="8.75" y="10.75" width="30.5" height="32.5" rx="6" />
+  <path d="M17.25 10.75V5H30.75V10.75" />
+  <rect x="8.75" y="10.75" width="30.5" height="32.25" rx="6" fill="#ececea" stroke="none" />
+  <path d="M32.5 10.75H33.25A6 6 0 0 1 39.25 16.75V37.25A6 6 0 0 1 33.25 43H32.5Z" fill="#cfcfcb" stroke="none" />
+  <rect x="8.75" y="10.75" width="30.5" height="32.25" rx="6" stroke-width="2" />
   <path d="M17.25 16.75V37.25M30.75 16.75V37.25" />
 </svg>
--- a/test/pretty-icons/fixtures/tonal-green/tent.svg
+++ b/test/pretty-icons/fixtures/tonal-green/tent.svg
@@ -1,6 +1,6 @@
 <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
-  <path d="M24 8.75C35 12.5 43.25 24 43.25 39.25H4.75C4.75 24 13 12.5 24 8.75Z" fill="#ececea" stroke="none" />
-  <path d="M24 8.75C35 12.5 43.25 24 43.25 39.25H24Z" fill="#cfcfcb" stroke="none" />
-  <path d="M24 8.75C35 12.5 43.25 24 43.25 39.25H4.75C4.75 24 13 12.5 24 8.75Z" />
+  <path d="M24 8.75C35 12.5 43 24 43 39.25H5C5 24 13 12.5 24 8.75Z" fill="#ececea" stroke="none" />
+  <path d="M24 8.75C35 12.5 43 24 43 39.25H24Z" fill="#cfcfcb" stroke="none" />
+  <path d="M24 8.75C35 12.5 43 24 43 39.25H5C5 24 13 12.5 24 8.75Z" stroke-width="2" />
   <path d="M18.5 39.25L24 25.75L29.5 39.25Z" fill="#ffffff" />
 </svg>
--- a/test/pretty-icons/fixtures/tonal-green/ticket.svg
+++ b/test/pretty-icons/fixtures/tonal-green/ticket.svg
@@ -1,7 +1,7 @@
 <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
-  <path d="M4.75 15.25Q4.75 8.75 10.75 8.75H27.25C27.25 15 36.75 15 36.75 8.75Q43.25 8.75 43.25 15.25V32.75Q43.25 39.25 36.75 39.25C36.75 33 27.25 33 27.25 39.25H10.75Q4.75 39.25 4.75 32.75Z" fill="#ececea" stroke="none" />
-  <path d="M32 13.5A4.75 4.75 0 0 0 36.75 8.75Q43.25 8.75 43.25 15.25V32.75Q43.25 39.25 36.75 39.25A4.75 4.75 0 0 0 32 34.5Z" fill="#cfcfcb" stroke="none" />
-  <path d="M4.75 15.25Q4.75 8.75 10.75 8.75H27.25C27.25 15 36.75 15 36.75 8.75Q43.25 8.75 43.25 15.25V32.75Q43.25 39.25 36.75 39.25C36.75 33 27.25 33 27.25 39.25H10.75Q4.75 39.25 4.75 32.75Z" />
+  <path d="M5 15.25Q5 8.75 10.75 8.75H27.25C27.25 15 36.75 15 36.75 8.75Q43 8.75 43 15.25V32.75Q43 39.25 36.75 39.25C36.75 33 27.25 33 27.25 39.25H10.75Q5 39.25 5 32.75Z" fill="#ececea" stroke="none" />
+  <path d="M32 13.5A5 5 0 0 0 36.75 8.75Q43 8.75 43 15.25V32.75Q43 39.25 36.75 39.25A5 5 0 0 0 32 34.5Z" fill="#cfcfcb" stroke="none" />
+  <path d="M5 15.25Q5 8.75 10.75 8.75H27.25C27.25 15 36.75 15 36.75 8.75Q43 8.75 43 15.25V32.75Q43 39.25 36.75 39.25C36.75 33 27.25 33 27.25 39.25H10.75Q5 39.25 5 32.75Z" stroke-width="2" />
   <path d="M32 18.25V22M32 26V29.75" stroke="#8b8c90" />
   <path d="M10.75 20.25H21.25M10.75 27.75H17.25" />
 </svg>
```

- [ ] **Step 6: Run the suite and see the worked example fail**

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: 1 fail, `rules-filled.md: the worked example is examples/garage/traffic-light.svg…`: the doc still gives the old traffic light and tables.

- [ ] **Step 7: Teach the hierarchy in `rules-filled.md`**

Save this diff as `/tmp/t5-doc.patch` and apply it from the repo root with `rtk git apply /tmp/t5-doc.patch`:

````diff
--- a/skills/pretty-icons/rules-filled.md
+++ b/skills/pretty-icons/rules-filled.md
@@ -8,7 +8,7 @@
 | --- | --- | --- |
 | tone | a body's colour: a closed element | `fill` the fill tone (or paper), `stroke="none"` |
 | shade | the side away from the light: the lower or right part of the body | `fill` the shade tone, `stroke="none"`, after its tone and before its contour; or an open stroke in the shade |
-| contour | the tone's geometry pasted, nothing else on it | no `fill`, no `stroke` (the root's line) |
+| contour | the tone's geometry pasted, nothing else on it | no `fill`, no `stroke`, `stroke-width="2"` |
 | shape | a closed element filled and drawn in one: a wheel, a cap, a lamp, a base | `fill` a tone; no `stroke` |
 | line | a part (a hose, a needle, a sign) | no `fill`, no `stroke`; `stroke-width` 2 for a mark of weight |
 | mark | what is printed on the object: ticks, treads, a gauge's scale | `stroke` the mark tone |
@@ -17,10 +17,22 @@
 
 ## The preset
 
-| Grid | Stroke | Weights | Padding | Live | Step | Circle | Square | Portrait | Landscape | Gap line · mark |
-| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
-| 48 | 1.5 | 2, 3.5 | 4 | 40 | 0.25 | 40 | 36 | 32 × 40 | 40 × 32 | 1.5 · 0.75 |
+| Grid | Stroke | Contour | Weights | Padding | Live | Step | Circle | Square | Portrait | Landscape | Gap line · mark |
+| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
+| 48 | 1.5 | 2 | 2, 3.5 | 4 | 40 | 0.25 | 40 | 36 | 32 × 40 | 40 × 32 | 1.5 · 0.75 |
 
+## The hierarchy
+
+Three weights, one job each. The eye reads the object's outline first, then its parts, then what is heavy in it.
+
+| Weight | Draws | How |
+| --- | --- | --- |
+| 2 | a body's contour | `stroke-width="2"` on the contour, never on the tone |
+| 1.5 | the parts: a hose, a needle, a bracket, a mark | the root's line |
+| 3.5 | a bar: a spoke, a rim, a stick | `stroke-width="3.5"`, then its core |
+
+A closed element at 2 with no tone under it is a contour that lost its body: `check.mjs` rejects it. An open stroke at 2 (a sign, a lug, a mark of weight) is a part and passes.
+
 Keylines are sizes of the object's ink, centred at **24, 24**. Tolerances: keyline ±1, gravity ±3, weight ±25% of the set's median and of the reference.
 
 ## The tones
@@ -50,27 +62,27 @@
 
 ## The bodies
 
-Each body's ink lands on its keyline, centred at 24. A rect's edge sits half a stroke inside the keyline; a circle's radius is half the keyline less half a stroke. An outline of your own (a car, a wrench) fits its ink to the keyline's size.
+Each body's ink lands on its keyline, centred at 24. A rect's edge sits half a contour (1) inside the keyline; a circle's radius is half the keyline less half a contour. An outline of your own (a car, a wrench) fits its ink to the keyline's size.
 
 | Circle | Square | Portrait | Landscape |
 | --- | --- | --- | --- |
-| `cx 24 cy 24 r 19.25` | `x 6.75 y 6.75 w 34.5 h 34.5 rx 6` | `x 8.75 y 4.75 w 30.5 h 38.5 rx 6` | `x 4.75 y 8.75 w 38.5 h 30.5 rx 6` |
+| `cx 24 cy 24 r 19` | `x 7 y 7 w 34 h 34 rx 6` | `x 9 y 5 w 30 h 38 rx 6` | `x 5 y 9 w 38 h 30 rx 6` |
 
 Every icon starts from this root. `examples/garage/traffic-light.svg`, a moulded housing on the portrait keyline, is the whole construction in seven elements: the brackets, the tone, the shade, the contour, three lamps:
 
 ```svg
 <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
   <path d="M8.75 18H13.75M8.75 30H13.75M34.25 18H39.25M34.25 30H39.25" />
-  <rect x="13.75" y="4.75" width="20.5" height="38.5" rx="8" fill="#ececea" stroke="none" />
-  <path d="M26.25 4.75A8 8 0 0 1 34.25 12.75V35.25A8 8 0 0 1 26.25 43.25Z" fill="#cfcfcb" stroke="none" />
-  <rect x="13.75" y="4.75" width="20.5" height="38.5" rx="8" />
+  <rect x="13.75" y="5" width="20.5" height="38" rx="8" fill="#ececea" stroke="none" />
+  <path d="M26.25 5A8 8 0 0 1 34.25 13V35A8 8 0 0 1 26.25 43Z" fill="#cfcfcb" stroke="none" />
+  <rect x="13.75" y="5" width="20.5" height="38" rx="8" stroke-width="2" />
   <circle cx="24" cy="13" r="4" fill="#25262a" />
   <circle cx="24" cy="24" r="4" fill="#ffffff" />
   <circle cx="24" cy="35" r="4" fill="#ffffff" />
 </svg>
 ```
 
-The housing is 20.5 wide, moulded: `rx 8`. The tone is the rect with `stroke="none"`; the shade is the right third of it, its corners the same arcs, so the contour pasted after it covers the seam; the contour is the tone's rect again, bare. The brackets come first, so the body covers their ends. The lamp that is on is solid line; the two that are off are paper, drawn by the root's line.
+The housing is 20.5 wide, moulded: `rx 8`. The tone is the rect with `stroke="none"`; the shade is the right third of it, its corners the same arcs, so the contour pasted after it covers the seam; the contour is the tone's rect again, at 2. The brackets come first, so the body covers their ends. The lamp that is on is solid line; the two that are off are paper, drawn by the root's line.
 
 ## 01 · grid
 
@@ -86,7 +98,7 @@
 
 ## 03 · stroke, and the tones
 
-The root is `stroke="#25262a" stroke-width="1.5"`, round caps and joins, `fill="none"`. An element sets `stroke-width` only to 2 (a sign, a lug, a mark of weight) or 3.5 (a bar); never a cap, a join, an opacity or a dash. A contour and every filled element keep the root's width. Every `fill` and `stroke` is one of the five tones.
+The root is `stroke="#25262a" stroke-width="1.5"`, round caps and joins, `fill="none"`. An element sets `stroke-width` only to 2 (a sign, a lug, a mark of weight) or 3.5 (a bar); never a cap, a join, an opacity or a dash. A contour is at 2 (the hierarchy); every filled element keeps the root's width. Every `fill` and `stroke` is one of the five tones.
 
 - **Rejected when:** `stroke  traffic-light  stroke #2e3955 → #25262a, the line tone`; `stroke  traffic-light  stroke-width 2.5 → 1.5`; `palette  traffic-light  rect@3 fill #e8b4ab → one of the five tones: #25262a #ececea #cfcfcb #ffffff #8b8c90`.
 
@@ -97,11 +109,11 @@
 - **Keep it, for a tube** (a spoke, a rim, a gear stick): a bar at 3.5 in the line, then the same `d` with `stroke` the fill or the shade tone and no width. The core cuts the bar into two thin lines. A ring as a tube: `circle r 18.25 stroke-width 3.5`, then the circle again with `stroke="#cfcfcb"`.
 - **Keep it, for a solid small part:** a wheel, a terminal, a lamp that is on: a shape filled with the line tone. Glass and a hole: paper.
 - **Keep it, for what is printed:** ticks and treads in the mark tone, at the root's width.
-- **Rejected when:** `construction  traffic-light  rect@3 fill #ececea stroke none → its contour after it: the same geometry, no fill, the root's line`; `construction  traffic-light  path@5 shade → between a body's tone and its contour, so the line covers its edge`; `construction  traffic-light  path@9 stroke #ffffff → no highlight: paper only as a fill (glass, a lit lamp)`; `construction  traffic-light  circle@8 fill #8b8c90 → the mark tone only as a stroke`; `construction  traffic-light  path@9 stroke #ececea → the fill tone as a stroke only on a core: a 3.5 bar's path pasted after it, at the root's width`; `construction  traffic-light  rect@5 stroke-width 2 → the root's line on a contour`; `construction  traffic-light  no body → a closed element in the fill tone, #ececea`.
+- **Rejected when:** `construction  traffic-light  rect@3 fill #ececea stroke none → its contour after it: the same geometry, no fill, at 2`; `construction  traffic-light  path@5 shade → between a body's tone and its contour, so the line covers its edge`; `construction  traffic-light  path@9 stroke #ffffff → no highlight: paper only as a fill (glass, a lit lamp)`; `construction  traffic-light  circle@8 fill #8b8c90 → the mark tone only as a stroke`; `construction  traffic-light  path@9 stroke #ececea → the fill tone as a stroke only on a core: a 3.5 bar's path pasted after it, at the root's width`; `stroke  traffic-light  rect@5 contour at 1.5 → 2`; `construction  traffic-light  circle@9 contour without a tone → a tone before it with the same geometry, or the root's line`; `construction  traffic-light  no body → a closed element in the fill tone, #ececea`.
 
 ## 05 · weight
 
-Ink is the line alone: tones, shades, dots and cores dropped, every other stroke read in the line tone, a core cut out of its bar. A tyre filled solid weighs its outline, not its area. Within 25% of the set's median and of the reference, 277.2, the median of `examples/garage`.
+Ink is the line alone: tones, shades, dots and cores dropped, every other stroke read in the line tone, a core cut out of its bar. A tyre filled solid weighs its outline, not its area. Within 25% of the set's median and of the reference, 328.7, the median of `examples/garage`.
 
 - **Keep it, for a light icon:** give it what the object has: a slot as a tube, a hole, a tick. The wrench gained a slot as a tube and passed.
 - **Keep it, for a heavy icon:** a double ring, a third spoke, a fourth tread: thin it to a tube, or drop one.
````

- [ ] **Step 8: Run the suite**

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: all pass (161), 0 fail.

Run: `rtk proxy node skills/pretty-icons/check.mjs skills/pretty-icons/examples/hairline`
Expected: `ok`: duotone has no hierarchy failure (spec, success 4).

- [ ] **Step 9: Commit**

```bash
rtk git add skills/pretty-icons/filled.mjs skills/pretty-icons/presets.mjs skills/pretty-icons/rules-filled.md skills/pretty-icons/examples/garage test/pretty-icons/filled.test.mjs test/pretty-icons/fixtures/tonal-green
rtk git commit -m "feat: the 48 contour is 2 and the bodies recede to keep the keyline"
```

### Task 6: `shapes.mjs`: the kit

**Files:**
- Create: `skills/pretty-icons/shapes.mjs`
- Test: `test/pretty-icons/shapes.test.mjs`

**Interfaces:**
- Consumes: `segments`, `joins`, `curveFailures`, `SMOOTH`, `CORNER` (Task 2); `preset`, `PALETTE`, `FILL` (`presets.mjs`, with Task 5's `contour`); `pathParts`, `bounds` (`geometry.mjs`); `pathCommands`, `parse` (`svg.mjs`).
- Produces: `shape(name, o) → { d, P, segs }` for `drop | leaf | lens | bean | crescent | taper | wedge | scoop | blob`, with `o` taking `grid, w, h, at, rot, bulge, lean` and each primitive's own (`tip, skew, waist, thick, narrow, sharp, angle, depth, side, rx, anchors`); one named export per primitive; `finishOf(name, o) → string` (one path at the .2 fill in duotone; tone, shade, contour at 2 at 48, with `shade: "right"|"lower"|"none"`, `seam: "straight"|"curved"`); `shadeOf`; `parseAnchors("x,y[,t][,c] …")`; `collinear(u, lin, lout)`; `repair(d) → { d, changed }`, `reconcile(d)`, `repairFile(text)`; `ShapeError`; `parseArgs`, `main`, `USAGE`. The CLI is `node shapes.mjs <primitive> [flags]` or `node shapes.mjs --from "<d>"|<file.svg>`.

- [ ] **Step 1: Write the failing test**

The last test is Review Focus line 2, every primitive at 20 and 24.

Create `test/pretty-icons/shapes.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { shape, finishOf, collinear, reconcile, repair, repairFile, shadeOf, parseArgs, ShapeError, drop, wedge } from "../../skills/pretty-icons/shapes.mjs";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { curveFailures, joins } from "../../skills/pretty-icons/curve.mjs";
import { pathCommands } from "../../skills/pretty-icons/svg.mjs";

const SCRIPT = fileURLToPath(new URL("../../skills/pretty-icons/shapes.mjs", import.meta.url));
const ANCHORED = ["drop", "leaf", "lens", "bean", "crescent", "taper"];
const clean = (d) => curveFailures("x", { tag: "path", attrs: { d }, at: "path@1" });
const onGrid = (d) => (d.match(/-?\d*\.?\d+/g) ?? []).every((n) => Number.isInteger(Number(n) * 4));
const refused = (fn, text) => assert.throws(fn, (e) => e instanceof ShapeError && e.message.includes(text));

test("collinear puts both handles on one quarter-grid line through the anchor", () => {
  const { hin, hout } = collinear([0.6, 0.8], 5, 3);
  assert.ok([...hin, ...hout].every((n) => Number.isInteger(n * 4)));
  assert.equal(Math.abs(hin[0] * hout[1] - hin[1] * hout[0]), 0);
  assert.ok(hin[0] * hout[0] + hin[1] * hout[1] < 0);
});

test("every primitive, at 48 and at 16, is on the quarter grid with no kink and no wobble", () => {
  for (const grid of [48, 16]) for (const name of [...ANCHORED, "wedge", "scoop"]) {
    const { d } = shape(name, { grid });
    assert.ok(onGrid(d), `${name} at ${grid}: ${d}`);
    assert.deepEqual(clean(d), [], `${name} at ${grid}`);
  }
  assert.deepEqual(clean(shape("taper", { sharp: true }).d), []);
});

test("turned and leaned, the anchor primitives stay clean", () => {
  for (const name of ANCHORED) for (const rot of [15, 45, 90]) assert.deepEqual(clean(shape(name, { rot, w: 36, h: 24 }).d), [], `${name} at ${rot}°`);
  assert.deepEqual(clean(shape("leaf", { lean: 1 }).d), []);
  assert.deepEqual(clean(shape("leaf", { lean: -0.5 }).d), []);
});

test("at 48 a body is tone, shade, contour at 2, the contour the tone's geometry; at 16 one path at the .2 fill", () => {
  const [tone, shade, contour] = finishOf("drop");
  const d = (s) => s.match(/ d="([^"]+)"/)[1];
  assert.match(tone, /fill="#ececea" stroke="none"/);
  assert.match(shade, /fill="#cfcfcb" stroke="none"/);
  assert.match(contour, /stroke-width="2"/);
  assert.equal(d(contour), d(tone));
  assert.deepEqual(clean(d(shade)), []);
  assert.deepEqual(finishOf("drop", { grid: 16 }).length, 1);
  assert.match(finishOf("drop", { grid: 16 })[0], /fill="currentColor" fill-opacity="0.2"/);
  assert.equal(finishOf("drop", { shade: "none" }).length, 2);
});

test("the shade is the side away from the light: a crescent's right horn, a drop's lower part", () => {
  const s = shape("crescent");
  assert.equal(shadeOf(s, { side: "right" }), "M24 5C37.25 5 32 26 43 33.5Z");
  assert.match(shadeOf(shape("drop"), { side: "lower", seam: "curved" }), /^M43 31\.5C.*Z$/);
  refused(() => shadeOf(s, { side: "left" }), "--shade left: right, lower or none");
});

test("wedge and scoop come unshaded; asking them for a shade is refused with the way out", () => {
  assert.equal(finishOf("wedge").length, 2);
  refused(() => finishOf("scoop", { shade: "right" }), "draw the shade by hand, or --shade none");
});

test("a shape past the grid's command cap is refused with how many to remove", () => {
  const ring = Array.from({ length: 9 }, (_, i) => `${(8 + 6 * Math.cos(i * 0.7)).toFixed(2)},${(8 + 6 * Math.sin(i * 0.7)).toFixed(2)}`).join(" ");
  refused(() => shape("blob", { grid: 16, anchors: ring }), "blob: 9 anchors, the grid allows 6: remove 3 anchors");
  refused(() => shape("scoop", { grid: 16, rx: 3 }), "the grid allows 8: use --rx 0");
  assert.ok(pathCommands(shape("scoop", { grid: 48, rx: 6 }).d) <= 12);
});

test("bad flags are refused with the reason", () => {
  refused(() => shape("drop", { rot: 10 }), "--rot 10: a step of 15");
  refused(() => shape("drop", { lean: 1.5 }), "--lean 1.5: from -1 to 1");
  refused(() => shape("wedge", { angle: 150 }), "--angle 150: from 15 to 120");
  refused(() => shape("star"), 'no primitive "star"');
  refused(() => shape("bean", { lean: 1 }), "bean: overshoots its box by 0.79: lower --bulge");
  refused(() => shape("crescent", { bulge: 1.2 }), "2 inflections over a chord of 24.36");
  refused(() => shape("bean", { grid: 16, w: 11 }), "change --bulge or the box");
  refused(() => shape("blob", { anchors: "8,8 40,8" }), "at least three");
});

test("--from smooths a kink, keeps a corner, and reads relative, H and V", () => {
  const kinked = "M8 24C8 14 14 6 24 6C34 6 40 14 40 24C40 34 34 42 24 42C14 42 9 34 8 24Z";
  assert.ok(joins(kinked).some((j) => j.kind === "kink"));
  const d = reconcile(kinked);
  assert.ok(onGrid(d));
  assert.deepEqual(clean(d), []);
  const box = reconcile("m8 8h32v22c1 7 -10 10 -16 10c-6 0 -16 -3 -16 -10z");
  assert.deepEqual(clean(box), []);
  assert.equal(joins(box).filter((j) => j.kind === "corner").length, joins("M8 8H40V30C41 37 30 40 24 40C18 40 8 37 8 30Z").filter((j) => j.kind === "corner").length);
});

test("--from says which joins it changed, and a file repairs each kinked path by its place", () => {
  const kinked = "M8 24C8 14 14 6 24 6C34 6 40 14 40 24C40 34 34 42 24 42C14 42 9 34 8 24Z";
  const { d, changed } = repair(kinked);
  assert.equal(d, reconcile(kinked));
  assert.ok(changed.length >= 1);
  for (const c of changed) assert.match(c, /^\d+\.\d° at [\d.]+ [\d.]+, now \d\.\d°$/);
  assert.deepEqual(repair("M8 8H40V40H8Z").changed, []);
  const icon = `<svg viewBox="0 0 48 48">\n<path d="M8 8H40V40H8Z" />\n<path d="${kinked}" />\n</svg>`;
  assert.deepEqual(repairFile(icon).map((f) => [f.at, f.d]), [["path@3", d]]);
  refused(() => repairFile(`<svg viewBox="0 0 48 48">\n<path d="M4 24H24L33.85 25.74" />\n</svg>`), "path@2: --from: one closed subpath");
  const dir = mkdtempSync(join(tmpdir(), "shapes-")), file = join(dir, "kinked.svg");
  writeFileSync(file, icon);
  const r = spawnSync("node", [SCRIPT, "--from", file], { encoding: "utf8" });
  assert.equal(r.status, 0);
  assert.equal(r.stdout, `path@3 ${d}\n`);
  assert.match(r.stderr, /^path@3 changed /);
  const gone = spawnSync("node", [SCRIPT, "--from", join(dir, "nope.svg")], { encoding: "utf8" });
  assert.equal(gone.status, 1);
  assert.match(gone.stderr, /^shapes: --from .*nope\.svg: no such file/);
});

test("each primitive is a named export too", () => {
  assert.deepEqual(drop({ grid: 24 }), shape("drop", { grid: 24 }));
  assert.deepEqual(wedge({ angle: 90 }), shape("wedge", { angle: 90 }));
});

test("--from refuses an arc, an open path and two subpaths", () => {
  refused(() => reconcile("M8 24A16 16 0 0 1 40 24L24 40Z"), "an arc at 8 24");
  refused(() => reconcile("M8 8H40V40"), "one closed subpath");
  refused(() => reconcile("M8 8H20V20ZM28 28H40V40Z"), "one closed subpath");
});

test("the CLI reads flags, prints the finish and refuses on stderr", () => {
  assert.deepEqual(parseArgs(["drop", "--w", "30", "--at", "24,26"]), { name: "drop", o: { w: 30, at: [24, 26] } });
  assert.equal(parseArgs(["drop", "--colour", "red"]), null);
  assert.equal(parseArgs(["drop", "--from", "M0 0Z"]), null);
  assert.equal(parseArgs([]), null);
  const out = execFileSync("node", [SCRIPT, "lens", "--grid", "20"], { encoding: "utf8" });
  assert.equal(out.trim().split("\n").length, 1);
  assert.throws(() => execFileSync("node", [SCRIPT, "drop", "--rot", "10"], { stdio: "pipe" }), (e) => e.status === 1 && String(e.stderr).includes("shapes: --rot 10"));
});

test("every primitive is clean at 20 and 24 too, the grids no example is drawn on", () => {
  for (const grid of [20, 24]) for (const name of [...ANCHORED, "wedge", "scoop"]) {
    const { d } = shape(name, { grid });
    assert.ok(onGrid(d), `${name} at ${grid}: ${d}`);
    assert.deepEqual(clean(d), [], `${name} at ${grid}`);
  }
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `rtk test node --test test/pretty-icons/shapes.test.mjs`
Expected: FAIL, `Cannot find module '.../skills/pretty-icons/shapes.mjs'`.

- [ ] **Step 3: Write `shapes.mjs`**

Create `skills/pretty-icons/shapes.mjs`:

```js
#!/usr/bin/env node
/**
 * A shapes kit: `node shapes.mjs <primitive> [flags]` prints a body's elements, ready to paste into an icon,
 * already on the quarter grid and already clean for check.mjs's join and inflection rules.
 *
 *   drop      a cusp on top, round below           --tip 0..1 (how sharp the cusp)
 *   leaf      two cusps, two bellies               --skew -1..1 (the bellies slide)
 *   lens      two cusps, flat bellies
 *   bean      round, with a dent below            --waist 0..1
 *   crescent  two cusps, a bite out of the bottom  --thick 0..1
 *   taper     round at one end, narrow at the other  --narrow 0..1, --sharp (the narrow end cut flat)
 *   wedge     a slice: apex, two sides, a crust    --angle 15..120
 *   scoop     a box with one side dished in       --depth 0..1, --side top|right|bottom|left, --rx
 *   blob      your own anchors                     --anchors "x,y[,t][,c] …" (c a cusp, t the handle length)
 *
 * Every primitive takes --w --h (its box before rotation, default the live area), --at x,y (default the
 * centre), --rot (steps of 15), --bulge (handle length, default 0.55), --lean -1..1 (the belly slides to one side), --grid (default 48).
 * The finish follows the grid. Duotone: one path with the .2 fill. Filled: tone, shade, contour at 2,
 * with --shade right|lower|none and --seam straight|curved.
 * `--from "<d>"` takes a path you drew, turns its kinks into smooth joins, prints the body and, on stderr,
 * each join it changed. `--from <file.svg>` repairs every kinked path in the file and prints `path@N <d>`.
 * It refuses, with the reason, a shape past the grid's command cap or one check.mjs would reject.
 */
import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { preset, PALETTE, FILL } from "./presets.mjs";
import { pathParts, bounds } from "./geometry.mjs";
import { segments, joins, curveFailures, SMOOTH, CORNER } from "./curve.mjs";
import { pathCommands, parse } from "./svg.mjs";

// --lean takes -1..1; a full lean slides the belly by 0.3 of the box
const STEP = 0.25, SQ = Math.SQRT1_2, D = Math.PI / 180, BOX_TOL = 0.05, LEAN = 0.3;
const snap = (n) => Math.round(n / STEP) * STEP;
const add = (a, b) => [a[0] + b[0], a[1] + b[1]], sub = (a, b) => [a[0] - b[0], a[1] - b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
const len = (v) => Math.hypot(v[0], v[1]), unit = (v) => { const l = len(v) || 1; return [v[0] / l, v[1] / l]; };
const rot = (v, deg) => { const c = Math.cos(deg * D), s = Math.sin(deg * D); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };
const angle = (u, v) => Math.acos(Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / (len(u) * len(v) || 1)))) / D;
const fmt = (n) => String(+n.toFixed(2));
const pt = (p) => `${fmt(p[0])} ${fmt(p[1])}`;

export class ShapeError extends Error {}
const refuse = (msg) => { throw new ShapeError(msg); };

/**
 * The quarter-grid direction nearest u, and its whole multiples nearest each handle length: both handles of a
 * smooth anchor on one grid line through it, so the join is 0° after snapping, not a few degrees off.
 */
export function collinear(u, lin, lout) {
  let best = null;
  for (let p = -16; p <= 16; p++) for (let q = -16; q <= 16; q++) {
    if (!p && !q) continue;
    const v = [p * STEP, q * STEP], l = len(v);
    if (l > Math.min(lin, lout)) continue;
    const err = angle(u, v);
    if (err > 6) continue;
    const ki = Math.max(1, Math.round(lin / l)), ko = Math.max(1, Math.round(lout / l));
    const score = err + 2 * (Math.abs(ki * l - lin) + Math.abs(ko * l - lout));
    if (!best || score < best.score) best = { score, hin: mul(v, -ki), hout: mul(v, ko) };
  }
  return best ?? { hin: mul(u, -lin).map(snap), hout: mul(u, lout).map(snap) };
}

/**
 * Handles for a closed outline through anchors `{ p, cusp, t, turn, edge, line }`, in drawing order. A smooth
 * anchor's handles lie on the line through its neighbours, or along the box's edge when it sits on one (so the
 * curve never overshoots it); a cusp's run along each chord, turned outward by `turn` degrees.
 */
export function outline(anchors, { bulge = 0.55, turn = 22 } = {}) {
  const n = anchors.length;
  const area = anchors.reduce((s, a, i) => { const b = anchors[(i + 1) % n].p; return s + a.p[0] * b[1] - b[0] * a.p[1]; }, 0);
  const sgn = area >= 0 ? 1 : -1, xs = anchors.map((a) => a.p[0]), ys = anchors.map((a) => a.p[1]);
  const lo = [Math.min(...xs), Math.min(...ys)], hi = [Math.max(...xs), Math.max(...ys)];
  // a handle along an edge stops at the box's corner, so the curve it pulls never leaves the box
  const within = (p, h, ax) => { const room = h[ax] > 0 ? hi[ax] - p[ax] : p[ax] - lo[ax], k = Math.abs(h[ax]) > room ? room / Math.abs(h[ax]) : 1; return mul(h, k); };
  const hs = anchors.map((a, i) => {
    const prev = anchors[(i + n - 1) % n].p, next = anchors[(i + 1) % n].p, k = (bulge * SQ * (a.t ?? 0.5)) / 0.5;
    const lin = k * len(sub(a.p, prev)), lout = k * len(sub(next, a.p));
    if (!a.cusp) {
      let u = unit(sub(next, prev));
      if (a.edge === "x") u = [0, Math.sign(u[1]) || 1];
      else if (a.edge === "y") u = [Math.sign(u[0]) || 1, 0];
      if (!a.edge) return { hin: mul(u, -lin), hout: mul(u, lout) };
      const ax = a.edge === "x" ? 1 : 0;
      return { hin: within(a.p, mul(u, -lin), ax), hout: within(a.p, mul(u, lout), ax) };
    }
    const d = unit(sub(next, a.p)), e = unit(sub(prev, a.p));
    const ext = 180 - angle(d, e), tt = Math.max(0, Math.min(a.turn ?? turn, (ext - 34) / 2));
    return { hin: mul(rot(e, -sgn * tt), lin), hout: mul(rot(d, sgn * tt), lout) };
  });
  return { anchors, hs };
}

/** The outline snapped: anchors on the quarter grid, smooth handles re-solved on one grid line. Points and handles, then d. */
export function snapOutline({ anchors, hs }) {
  const P = anchors.map((a) => a.p.map(snap));
  const H = anchors.map((a, i) => (a.cusp || a.line ? { hin: hs[i].hin.map(snap), hout: hs[i].hout.map(snap) } : collinear(unit(sub(hs[i].hout, hs[i].hin)), len(hs[i].hin), len(hs[i].hout))));
  const segs = P.map((p, i) => {
    const j = (i + 1) % P.length;
    return anchors[i].line ? { line: true, to: P[j] } : { c1: add(p, H[i].hout), c2: add(P[j], H[j].hin), to: P[j] };
  });
  return { P, segs };
}
const segText = (s) => (s.line ? `L${pt(s.to)}` : `C${pt(s.c1)} ${pt(s.c2)} ${pt(s.to)}`);
export const pathOf = ({ P, segs }) => `M${pt(P[0])}${segs.map(segText).join("")}Z`;

// the primitives drawn from anchors, in a unit box: x and y from -1 to 1
const UNIT = {
  drop: (o) => [{ p: [0, -1], cusp: true, turn: 44 * (o.tip ?? 0.5) }, { p: [1, 0.4] }, { p: [0, 1] }, { p: [-1, 0.4] }],
  leaf: (o) => { const x = 0.1 + 0.5 * (o.skew ?? 0); return [{ p: [-1, 0], cusp: true }, { p: [x, -1] }, { p: [1, 0], cusp: true }, { p: [x, 1] }]; },
  lens: () => [{ p: [-1, 0], cusp: true, turn: 40 }, { p: [0, -1], t: 0.4 }, { p: [1, 0], cusp: true, turn: 40 }, { p: [0, 1], t: 0.4 }],
  bean: (o) => [{ p: [-1, 0] }, { p: [0, -1] }, { p: [1, 0] }, { p: [0.6, 1] }, { p: [0, 1 - 0.6 * (o.waist ?? 0.5)] }, { p: [-0.6, 1] }],
  crescent: (o) => [{ p: [-1, 0.5], cusp: true }, { p: [0, -1] }, { p: [1, 0.5], cusp: true }, { p: [0, -1 + 1.4 * (o.thick ?? 0.5)] }],
  taper: (o) => {
    const n = o.narrow ?? 0.3;
    return o.sharp
      ? [{ p: [-1, 0] }, { p: [-0.4, -1] }, { p: [1, -n], cusp: true, turn: 0, line: true }, { p: [1, n], cusp: true, turn: 0 }, { p: [-0.4, 1] }]
      : [{ p: [-1, 0] }, { p: [-0.4, -1] }, { p: [1, 0], t: n }, { p: [-0.4, 1] }];
  },
};

/** Unit anchors placed in a w × h box at `at`, an inset in from its edge, leaned and turned. */
function place(unitAnchors, { w, h, at, inset, rot: deg = 0, lean = 0 }) {
  const sx = (w / 2 - inset) / (1 + Math.abs(lean)), sy = h / 2 - inset;
  const swap = deg % 180 === 90 ? { x: "y", y: "x" } : { x: "x", y: "y" };
  return unitAnchors.map((a) => {
    const [x, y] = a.p, edge = deg % 90 || lean ? undefined : Math.abs(x) === 1 ? swap.x : Math.abs(y) === 1 ? swap.y : undefined;
    return { ...a, edge, p: add(at, rot([(x - lean * y) * sx, y * sy], deg)) };
  });
}

function wedgeOutline({ w, h, at, inset, angle: ang = 60 }) {
  if (ang < 15 || ang > 120) refuse(`--angle ${ang}: from 15 to 120`);
  // a step short of the box: the cubic arc, snapped, bulges past the true one by up to a tenth
  const R = Math.min(h - 2 * inset, (w / 2 - inset) / Math.sin((ang / 2) * D)) - STEP, apex = [at[0], at[1] + R / 2];
  const on = (deg) => [apex[0] + R * Math.cos(deg * D), apex[1] + R * Math.sin(deg * D)];
  const a0 = -90 - ang / 2, n = Math.ceil(ang / 90), step = ang / n, k = (4 / 3) * Math.tan((step / 4) * D) * R;
  const P = (p) => pt(p.map(snap));
  let d = `M${P(apex)}L${P(on(a0))}`;
  for (let i = 0; i < n; i++) {
    const s = a0 + i * step, e = s + step, p0 = on(s), p1 = on(e);
    d += `C${P([p0[0] - k * Math.sin(s * D), p0[1] + k * Math.cos(s * D)])} ${P([p1[0] + k * Math.sin(e * D), p1[1] - k * Math.cos(e * D)])} ${P(p1)}`;
  }
  return d + "Z";
}

function scoopOutline({ w, h, at, inset, depth = 0.5, side = "top", rx = 0 }) {
  const turns = { top: 0, right: 90, bottom: 180, left: 270 }[side];
  if (turns === undefined) refuse(`--side ${side}: top, right, bottom or left`);
  const [bw, bh] = turns % 180 ? [h - 2 * inset, w - 2 * inset] : [w - 2 * inset, h - 2 * inset];
  const x = -bw / 2, y = -bh / 2, K = 0.5523 * rx, m = 0, dy = y + depth * bh * 0.4, q = (bw / 2 - rx) * 0.5;
  const P = (...v) => { const out = []; for (let i = 0; i < v.length; i += 2) out.push(pt(add(at, rot([v[i], v[i + 1]], turns)).map(snap))); return out.join(" "); };
  let d = `M${P(x, y + rx)}`;
  if (rx) d += `C${P(x, y + rx - K, x + rx - K, y, x + rx, y)}`;
  d += `C${P(x + rx + q, y, m - q, dy, m, dy)}C${P(m + q, dy, x + bw - rx - q, y, x + bw - rx, y)}`;
  if (rx) d += `C${P(x + bw - rx + K, y, x + bw, y + rx - K, x + bw, y + rx)}`;
  d += `L${P(x + bw, y + bh - rx)}`;
  if (rx) d += `C${P(x + bw, y + bh - rx + K, x + bw - rx + K, y + bh, x + bw - rx, y + bh)}`;
  d += `L${P(x + rx, y + bh)}`;
  if (rx) d += `C${P(x + rx - K, y + bh, x, y + bh - rx + K, x, y + bh - rx)}`;
  return d + "Z";
}

/** "x,y[,t][,c] …": absolute anchors; c makes a cusp, a number after x,y is the handle length. */
export function parseAnchors(text = "") {
  const anchors = text.trim().split(/\s+/).filter(Boolean).map((tok) => {
    const parts = tok.split(","), [x, y] = parts.map(Number);
    if (!Number.isFinite(x) || !Number.isFinite(y)) refuse(`--anchors ${tok}: x,y[,t][,c]`);
    const a = { p: [x, y] };
    for (const f of parts.slice(2)) if (f === "c") a.cusp = true; else if (Number.isFinite(Number(f))) a.t = Number(f); else refuse(`--anchors ${tok}: x,y[,t][,c]`);
    return a;
  });
  if (anchors.length < 3) refuse("--anchors: at least three");
  const xs = anchors.map((a) => a.p[0]), ys = anchors.map((a) => a.p[1]);
  for (const a of anchors) if (!a.cusp) a.edge = [Math.min(...xs), Math.max(...xs)].includes(a.p[0]) ? "x" : [Math.min(...ys), Math.max(...ys)].includes(a.p[1]) ? "y" : undefined;
  return anchors;
}

/** One primitive's outline as `{ d, P, segs }`: P and segs for the shade, null for wedge and scoop. */
export function shape(name, o = {}) {
  const G = o.grid ?? 48, p = preset(G), inset = (p.contour ?? p.stroke) / 2;
  // the box on the grid: its sides in halves and its centre in quarters, so its edges fall on quarters
  const half = (n) => Math.floor(n * 2) / 2;
  const box = { w: half(o.w ?? p.live), h: half(o.h ?? p.live), at: (o.at ?? p.centre).map(snap), inset, rot: o.rot ?? 0, lean: (o.lean ?? 0) * LEAN };
  if (box.rot % 15) refuse(`--rot ${box.rot}: a step of 15`);
  if (Math.abs(o.lean ?? 0) > 1) refuse(`--lean ${o.lean}: from -1 to 1`);
  let d, P = null, segs = null;
  if (name === "wedge" || name === "scoop") {
    if (box.rot && name === "scoop") refuse("scoop: turn it with --side, not --rot");
    d = name === "wedge" ? wedgeOutline({ ...box, angle: o.angle }) : scoopOutline({ ...box, depth: o.depth, side: o.side, rx: o.rx });
    if (name === "scoop" && pathCommands(d) > p.commands) refuse(`scoop: ${pathCommands(d)} commands, the grid allows ${p.commands}: use --rx 0`);
    if (name === "wedge" && box.rot) refuse("wedge: draw it pointing down; --rot is for the anchor shapes");
  } else {
    const anchors = name === "blob" ? parseAnchors(o.anchors) : UNIT[name] ? place(UNIT[name](o), box) : refuse(`no primitive "${name}": ${[...Object.keys(UNIT), "wedge", "scoop", "blob"].join(", ")}`);
    if (anchors.length + 2 > p.commands) refuse(`${name}: ${anchors.length} anchors, the grid allows ${p.commands - 2}: remove ${anchors.length + 2 - p.commands} anchors`);
    ({ P, segs } = snapOutline(outline(anchors, { bulge: o.bulge ?? 0.55 })));
    d = pathOf({ P, segs });
  }
  const failures = curveFailures(name, { tag: "path", attrs: { d }, at: "path@1" });
  if (failures.length) refuse(`${name}: ${failures.map((f) => `${f.rule} ${f.got.replace("path@1 ", "")}`).join("; ")}: change --bulge or the box`);
  if (name !== "blob") {
    const b = bounds(pathParts(d).flat()), half = [box.w / 2 - inset, box.h / 2 - inset], [cx, cy] = box.at;
    const r = box.rot % 180 === 90 ? [half[1], half[0]] : half;
    const over = Math.max(cx - r[0] - b.x0, b.x1 - cx - r[0], cy - r[1] - b.y0, b.y1 - cy - r[1]);
    if (!(box.rot % 90) && over > BOX_TOL) refuse(`${name}: overshoots its box by ${fmt(over)}: lower --bulge`);
  }
  return { d, P, segs };
}

/** Each primitive by name: `drop(o)` is `shape("drop", o)`. */
export const drop = (o) => shape("drop", o), leaf = (o) => shape("leaf", o), lens = (o) => shape("lens", o);
export const bean = (o) => shape("bean", o), crescent = (o) => shape("crescent", o), taper = (o) => shape("taper", o);
export const wedge = (o) => shape("wedge", o), scoop = (o) => shape("scoop", o), blob = (o) => shape("blob", o);

/**
 * The shade of an anchor outline: the run of segments on the side away from the light, closed by a seam.
 * "right" runs from the top anchor to the bottom one through the right; "lower" from the leftmost to the
 * rightmost through the bottom. The seam is the chord back, or with "curved" a cubic bowed into the shade.
 */
export function shadeOf({ P, segs }, { side = "right", seam = "straight" } = {}) {
  if (side !== "right" && side !== "lower") refuse(`--shade ${side}: right, lower or none`);
  if (seam !== "straight" && seam !== "curved") refuse(`--seam ${seam}: straight or curved`);
  const n = P.length, along = side === "right" ? 1 : 0, out = 1 - along;
  // the extreme anchors along the light; of two level ones, the one further into the shade (a crescent's right cusp)
  const pick = (better) => P.reduce((b, p, i) => (better(p[along], P[b][along]) || (p[along] === P[b][along] && p[out] > P[b][out]) ? i : b), 0);
  const a = pick((x, y) => x < y), z = pick((x, y) => x > y);
  const runFrom = (s, e) => { const r = []; for (let i = s; i !== e; i = (i + 1) % n) r.push(i); return r; };
  const mean = (r) => r.reduce((s, i) => s + segs[i].to[out], 0) / r.length;
  const [r0, r1] = [runFrom(a, z), runFrom(z, a)], run = mean(r0) >= mean(r1) ? r0 : r1;
  const start = P[run[0]], end = segs[run.at(-1)].to;
  let d = `M${pt(start)}${run.map((i) => segText(segs[i])).join("")}`;
  if (seam === "curved") {
    const chord = sub(start, end), bow = side === "right" ? [0.15 * len(chord), 0] : [0, 0.15 * len(chord)];
    d += `C${pt(add(add(end, mul(chord, 1 / 3)), bow).map(snap))} ${pt(add(add(end, mul(chord, 2 / 3)), bow).map(snap))} ${pt(start)}`;
  }
  return d + "Z";
}

/** The elements a body takes at its grid's finish, as lines of SVG; `given` a body already drawn (--from), unshaded unless asked. */
export function finishOf(name, o = {}, given = null) {
  const G = o.grid ?? 48, p = preset(G), s = given ?? shape(name, o);
  if (p.finish !== "filled") return [`<path d="${s.d}" fill="currentColor" fill-opacity="${FILL}" />`];
  const out = [`<path d="${s.d}" fill="${PALETTE.fill}" stroke="none" />`];
  const side = o.shade ?? (s.P ? "right" : "none");
  if (side !== "none") {
    if (!s.P) refuse(`${name}: no --shade for wedge and scoop yet; draw the shade by hand, or --shade none`);
    const sh = shadeOf(s, { side, seam: o.seam ?? "straight" });
    const f = curveFailures(name, { tag: "path", attrs: { d: sh }, at: "path@1" });
    if (f.length) refuse(`${name}: the shade has a ${f[0].rule} (${f[0].got.replace("path@1 ", "")}): try --seam ${o.seam === "curved" ? "straight" : "curved"} or --shade ${side === "right" ? "lower" : "right"}`);
    out.push(`<path d="${sh}" fill="${PALETTE.shade}" stroke="none" />`);
  }
  out.push(`<path d="${s.d}" stroke-width="${p.contour}" />`);
  return out;
}

/**
 * A path you drew, its kinks made smooth: at every join between 4° and 30°, both handles turn to the
 * direction halfway between them (a line keeps its own, and the curve's handle takes it), then snap.
 * One closed subpath of lines and cubics; an arc is refused. `repair` also says which joins it changed.
 */
export const reconcile = (d) => repair(d).d;
export function repair(d) {
  const subs = segments(d);
  if (subs.length !== 1 || !subs[0].closed) refuse("--from: one closed subpath");
  const segs = subs[0].segs.map((s) => (s.kind === "arc" ? refuse(`--from: an arc at ${pt(s.p[0])}: draw that part with a primitive, or as a cubic`) : { ...s, p: s.p.map((q) => [...q]) }));
  const n = segs.length;
  for (let i = 0; i < n; i++) {
    const a = segs[i], b = segs[(i + 1) % n], ang = angle(a.t1, b.t0);
    if (ang < SMOOTH || ang > CORNER) continue;
    const P = a.p.at(-1);
    const u = a.kind === "line" ? unit(a.t1) : b.kind === "line" ? unit(b.t0) : unit(add(unit(a.t1), unit(b.t0)));
    let hin = a.kind === "cubic" ? mul(u, -len(sub(P, a.p[2]))) : null, hout = b.kind === "cubic" ? mul(u, len(sub(b.p[1], P))) : null;
    if (hin && hout) ({ hin, hout } = collinear(u, len(hin), len(hout)));
    else if (hin) hin = collinear(u, len(hin), len(hin)).hin; else if (hout) hout = collinear(u, len(hout), len(hout)).hout;
    if (hin) a.p[2] = add(P, hin);
    if (hout) b.p[1] = add(P, hout);
  }
  const out = `M${pt(segs[0].p[0])}${segs.map((s) => (s.kind === "line" ? `L${pt(s.p[1])}` : `C${pt(s.p[1])} ${pt(s.p[2])} ${pt(s.p[3])}`)).join("")}Z`;
  const f = curveFailures("from", { tag: "path", attrs: { d: out }, at: "path@1" });
  if (f.length) refuse(`--from: still ${f.map((x) => `${x.rule} ${x.got.replace("path@1 ", "")}`).join("; ")}: move that anchor`);
  // the anchors never move, so the joins before and after pair up one to one
  const before = joins(d), after = joins(out);
  const changed = before.flatMap((j, i) => (j.kind === "kink" ? [`${j.angle.toFixed(1)}° at ${pt(j.at)}, now ${after[i].angle.toFixed(1)}°`] : []));
  return { d: out, changed };
}

/** Every path in an icon whose joins have a kink, repaired: `{ at, d, changed }` each, in the file's order. */
export function repairFile(text) {
  const out = [];
  for (const el of parse(text).elements) {
    if (el.tag !== "path" || !joins(el.attrs.d ?? "").some((j) => j.kind === "kink")) continue;
    try { out.push({ at: el.at, ...repair(el.attrs.d) }); }
    catch (e) { if (e instanceof ShapeError) refuse(`${el.at}: ${e.message}`); throw e; }
  }
  return out;
}

const NUMERIC = ["w", "h", "rot", "bulge", "lean", "grid", "tip", "skew", "waist", "thick", "narrow", "angle", "depth", "rx"];
export const USAGE = "usage: node shapes.mjs <drop|leaf|lens|bean|crescent|taper|wedge|scoop|blob> [--w N --h N --at x,y --rot N --bulge N --lean N --grid 16|20|24|48 --shade right|lower|none --seam straight|curved ...] | node shapes.mjs --from \"<d>\"|<file.svg> [--grid N]";

export function parseArgs(argv) {
  const o = {}, rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) { rest.push(a); continue; }
    const k = a.slice(2);
    if (k === "sharp") { o.sharp = true; continue; }
    const v = argv[++i];
    if (v === undefined) return null;
    if (NUMERIC.includes(k)) { o[k] = Number(v); if (!Number.isFinite(o[k])) return null; }
    else if (k === "at") { o.at = v.split(",").map(Number); if (o.at.length !== 2 || !o.at.every(Number.isFinite)) return null; }
    else if (["shade", "seam", "side", "anchors", "from"].includes(k)) o[k] = v;
    else return null;
  }
  if (rest.length > 1 || (rest.length ? o.from !== undefined : o.from === undefined)) return null;
  return { name: rest[0], o };
}

export function main(argv) {
  const args = parseArgs(argv);
  if (!args) { console.error(USAGE); process.exit(1); }
  try {
    const from = args.o.from;
    if (from !== undefined && from.endsWith(".svg")) {
      const fixed = repairFile(readFileSync(from, "utf8"));
      if (!fixed.length) console.error("no kinks: nothing to repair");
      for (const f of fixed) {
        console.log(`${f.at} ${f.d}`);
        for (const c of f.changed) console.error(`${f.at} changed ${c}`);
      }
      return;
    }
    if (from !== undefined) {
      const { d, changed } = repair(from);
      for (const l of finishOf("from", args.o, { d, P: null, segs: null })) console.log(l);
      for (const c of changed) console.error(`changed ${c}`);
      return;
    }
    for (const l of finishOf(args.name, args.o)) console.log(l);
  } catch (e) {
    if (e.code === "ENOENT") { console.error(`shapes: --from ${e.path}: no such file`); process.exit(1); }
    if (!(e instanceof ShapeError)) throw e;
    console.error(`shapes: ${e.message}`);
    process.exit(1);
  }
}

const entry = process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (entry) main(process.argv.slice(2));
```

- [ ] **Step 4: Run the test, then the suite**

Run: `rtk test node --test test/pretty-icons/shapes.test.mjs`
Expected: 14 pass, 0 fail.

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: all pass (175), 0 fail.

- [ ] **Step 5: Try the CLI by hand**

Run: `rtk proxy node skills/pretty-icons/shapes.mjs blob --anchors "12,39,c 5,25.5 24,8.5 43,25.5 36,39,c 24,30"`
Expected: three `path` lines (tone `#ececea`, shade `#cfcfcb`, contour `stroke-width="2"`), the first `<path d="M12 39C11.5 33 5 31.5 5 25.5C5 15.5 14 8.5 24 8.5C34 8.5 43 15.5 43 25.5C43 31.5 36.5 33 36 39C33 34 29.75 30 24 30C18.25 30 15 34 12 39Z" …`.

- [ ] **Step 6: Commit**

```bash
rtk git add skills/pretty-icons/shapes.mjs test/pretty-icons/shapes.test.mjs
rtk git commit -m "feat: shapes.mjs, nine primitives on the quarter grid with clean joins"
```

### Task 7: `modifiers.mjs`: a state on a base icon, with its knockout

**Files:**
- Create: `skills/pretty-icons/modifiers.mjs`
- Modify: `skills/pretty-icons/presets.mjs` (`MODIFIER`), `skills/pretty-icons/check.mjs` (the `modifier` rule, the counts), `skills/pretty-icons/filled.mjs` (a cut contour finds its tone), `skills/pretty-icons/measure.mjs` (a modified icon: live and gap only), `skills/pretty-icons/sheet.mjs` (`stroke-opacity` reaches the sheet)
- Test: `test/pretty-icons/modifiers.test.mjs`

**Interfaces:**
- Consumes: `textChecks` (`check.mjs`); `classify` (`filled.mjs`); `segments`, `inflections` (Task 2); `pathParts`, `sampleParts` (`geometry.mjs`); `preset`, `PALETTE` (`presets.mjs`); `parse`, `compose` (`svg.mjs`).
- Produces:
  - `MODIFIER = {16:{size:5,dot:1.5}, 20:{size:6.5,dot:1.75}, 24:{size:8,dot:2.25}, 48:{size:14.5,dot:4}}` in `presets.mjs`;
  - `KINDS`, `CORNERS = ["br","tr","bl","tl"]`, `OPACITY = 0.6`, `CRUMB = 1`, `ModifierError`;
  - `isModifier(el)`, `isCut(el)`, `isSplit(el)`;
  - `placement(G, kind, corner) → { c, size }`, `halo(G, kind, corner) → { c, r, inside(q) }`, `slashEnds(G)`, `asPath(el)`, `cut(d, halo) → d | null | ""`;
  - `glyph(G, kind, { corner, solid }) → [{ tag, attrs }]`;
  - `addModifier(text, kind, { corner, solid, name }) → Promise<string>`, which refuses with `ModifierError`;
  - `modifierFailures(icon, parsed, G)`, the rule `modifier`;
  - `parseArgs`, `main`, `USAGE`. The CLI is `node modifiers.mjs <icon.svg> --add <kind> [--corner br|tr|bl|tl] [--solid] [--print]`.

- [ ] **Step 1: Write the failing test**

The last test is Review Focus line 3, every kind on a body at 20 and 24.

Create `test/pretty-icons/modifiers.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { placement, halo, cut, glyph, addModifier, modifierFailures, parseArgs, ModifierError, KINDS } from "../../skills/pretty-icons/modifiers.mjs";
import { textChecks } from "../../skills/pretty-icons/check.mjs";
import { toReact } from "../../skills/pretty-icons/emit.mjs";
import { parse } from "../../skills/pretty-icons/svg.mjs";
import { MODIFIER, preset, bodySvg } from "../../skills/pretty-icons/presets.mjs";

const ex = (set, name) => readFileSync(new URL(`../../skills/pretty-icons/examples/${set}/${name}.svg`, import.meta.url), "utf8");
const cli = new URL("../../skills/pretty-icons/modifiers.mjs", import.meta.url).pathname;
const svg16 = (body) => `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const BODY16 = '<rect x="1.75" y="1.75" width="12.5" height="12.5" rx="1.5" fill="currentColor" fill-opacity=".2" />';

test("a modifier's box sits in a corner of the live area; its halo is half the box plus one and a half strokes", () => {
  assert.deepEqual(MODIFIER, { 16: { size: 5, dot: 1.5 }, 20: { size: 6.5, dot: 1.75 }, 24: { size: 8, dot: 2.25 }, 48: { size: 14.5, dot: 4 } });
  assert.deepEqual(placement(16, "badge:plus").c, [12.5, 12.5]);
  assert.deepEqual(placement(16, "badge:plus", "tl").c, [3.5, 3.5]);
  assert.deepEqual(placement(48, "badge:plus").c, [36.75, 36.75]);
  assert.deepEqual(placement(24, "dot").c, [20.75, 20.75]);
  assert.deepEqual([16, 20, 24, 48].map((G) => halo(G, "badge:plus").r), [4.75, 5.5, 7, 10.25]);
  assert.throws(() => placement(16, "badge:star"), /--add badge:star/);
  assert.throws(() => placement(16, "dot", "mid"), /--corner mid/);
});

test("cut: a stroke the halo crosses is cut where it enters, the ends snapped outward to the quarter grid", () => {
  const H = halo(24, "badge:plus");
  // a closed rect becomes one open run, from where it leaves the halo round to where it enters
  assert.equal(cut("M3 5H21V19H3Z", H), "M12 19L3 19L3 5L21 5L21 12.25");
  assert.equal(cut("M3 5H10", H), null);
  // an arc keeps its radii; the part at the cut end goes as a cubic, the kept parts as arcs
  assert.equal(cut("M1.75 8A6.25 6.25 0 1 1 14.25 8A6.25 6.25 0 1 1 1.75 8Z", halo(16, "badge:plus")), "M8 14.25A6.25 6.25 0 0 1 1.75 8A6.25 6.25 0 0 1 14.25 8");
  // every end is clear of the halo
  for (const d of [cut("M3 5H21V19H3Z", H), cut("M3 12C3 20 10 21 21 21", H)]) {
    const n = d.match(/-?\d*\.?\d+/g).map(Number), ends = [n.slice(0, 2), n.slice(-2)];
    for (const q of ends) assert.ok(H.inside(q) >= 0, `${q} is inside`);
  }
});

test("cut: a crumb (a run shorter than 1) goes, and a dot is kept or dropped whole", () => {
  const H = halo(48, "badge:plus");
  assert.equal(cut("M26 36.75H27.5", H), "");
  assert.equal(cut("M24 19h0M38 38h0", H), "M24 19h0");
});

test("glyphs: duotone at stroke-opacity 0.6 (--solid leaves it out), a badge at 48 on paper with a contour at 2", () => {
  assert.deepEqual(glyph(24, "badge:plus"), [{ tag: "path", attrs: { d: "M16 19H22M19 16V22", "data-modifier": "badge:plus", "stroke-opacity": "0.6" } }]);
  assert.deepEqual(glyph(24, "badge:plus", { solid: true })[0].attrs, { d: "M16 19H22M19 16V22", "data-modifier": "badge:plus" });
  assert.equal(glyph(24, "slash")[0].attrs.d, "M3 3L21 21");
  assert.deepEqual(glyph(24, "dot")[0].attrs, { cx: "20.75", cy: "20.75", r: "2.25", fill: "currentColor", stroke: "none", "data-modifier": "dot" });
  const x48 = glyph(48, "badge:x");
  assert.deepEqual(x48[0].attrs, { cx: "36.75", cy: "36.75", r: "6.25", fill: "#ffffff", "stroke-width": "2", "data-modifier": "badge:x" });
  assert.equal(x48[1].attrs["stroke-opacity"], undefined);
  for (const k of KINDS) for (const G of [16, 20, 24, 48]) assert.ok(glyph(G, k).length >= 1);
});

test("addModifier: a duotone body is split into its paint, whole, and its contour, cut; the modifier goes last", async () => {
  const out = await addModifier(svg16(BODY16), "badge:plus");
  const els = parse(out).elements;
  assert.deepEqual(els.map((el) => [el.tag, el.attrs.stroke, el.attrs["data-cut"], el.attrs["data-modifier"]]), [
    ["rect", "none", undefined, undefined],
    ["path", undefined, "split", undefined],
    ["path", undefined, undefined, "badge:plus"],
  ]);
  // the paint keeps its geometry and fill: the modifier never cuts a fill
  assert.equal(els[0].attrs.width, "12.5");
  assert.equal(els[0].attrs["fill-opacity"], ".2");
  assert.deepEqual(textChecks("x", out, 16).failures, []);
  assert.doesNotMatch(out, /\n\s*\n/, "one element per line, no blank line");
  await assert.rejects(addModifier(out, "dot"), /one per icon/);
});

test("addModifier: every example takes a badge, the cut arcs and curves pass check", async () => {
  for (const name of ["all", "coding", "connectivity", "data", "devices", "empty", "interfaces", "machines", "marks", "security"]) {
    const out = await addModifier(ex("hairline", name), "badge:plus", { name });
    assert.deepEqual(textChecks(name, out, 16).failures, [], name);
  }
  for (const name of ["battery", "fuel", "gearshift", "oil", "speedometer", "steering-wheel", "traffic-light", "tyre", "wrench"]) {
    const out = await addModifier(ex("garage", name), "badge:check", { name });
    assert.deepEqual(textChecks(name, out, 48).failures, [], name);
  }
});

test("addModifier refuses a body wholly under the halo, a slash in a corner, an icon that fails check already, and a cut that fails gap", async () => {
  await assert.rejects(addModifier(ex("garage", "car"), "badge:check"), (e) => e instanceof ModifierError && /circle@7 lies under the badge:check's halo: try another --corner/.test(e.message));
  await assert.rejects(addModifier(svg16(BODY16), "slash", { corner: "tl" }), /a slash crosses the whole icon/);
  await assert.rejects(addModifier(svg16('<path d="M1.8 6.25h12.5" />'), "dot"), /fails check before the modifier/);
  // a slash cuts connectivity's link to a stub inside its node, 0.97 from the node's cut contour (the example as drawn before Task 11)
  const NODES = '<circle cx="4.75" cy="11.25" r="3" fill="currentColor" fill-opacity=".2" /><circle cx="11.25" cy="4.75" r="3" fill="currentColor" fill-opacity=".2" /><path d="M4.75 11.25 11.25 4.75" />';
  await assert.rejects(addModifier(svg16(NODES), "slash", { name: "connectivity" }), /would fail check:\ngap  connectivity  path@\d to path@\d 0\.97 apart[^]*try another --corner or another kind/);
});

test("the modifier rule: opacity, size and corner, the halo, and data-cut without a modifier", async () => {
  const rule = (text, G = 16) => modifierFailures("x", parse(text), G).map((f) => f.got);
  const good = await addModifier(svg16(BODY16), "badge:plus");
  assert.deepEqual(rule(good), []);
  assert.deepEqual(rule(good.replace('stroke-opacity="0.6"', 'stroke-opacity="0.5"')), ["path@4 stroke-opacity 0.5"]);
  assert.match(rule(good.replace("M10.75 12.5H14.25M12.5 10.75V14.25", "M9.75 11.5H13.25M11.5 9.75V13.25"))[0], /^badge:plus 5 wide, centred at 11.5 11.5/);
  // a stroke left inside the halo: drawn by hand, not by the command
  assert.match(rule(svg16(`${BODY16}<path d="M10.75 12.5H14.25M12.5 10.75V14.25" stroke-opacity="0.6" data-modifier="badge:plus" />`))[0], /^rect#1@1 [\d.]+ inside badge:plus's halo/);
  assert.deepEqual(rule(svg16('<path d="M2 2H8" data-cut="" />')), ["path@1 data-cut"]);
  const two = good.replace("</svg>", '<circle cx="3.5" cy="3.5" r="1.5" fill="currentColor" stroke="none" data-modifier="dot" /></svg>');
  assert.deepEqual(rule(two), ["2 modifiers: badge:plus, dot"]);
  // at 48 a modifier has no opacity
  const car48 = await addModifier(ex("garage", "battery"), "arrow:up");
  assert.deepEqual(rule(car48.replace('data-modifier="arrow:up"', 'stroke-opacity="0.6" data-modifier="arrow:up"'), 48), ["path@8 stroke-opacity 0.6"]);
});

test("check counts a split body as one element and lets stroke-opacity through only on a modifier", async () => {
  const out = await addModifier(svg16(`${BODY16}<path d="M4.75 5.5H11.25" /><path d="M4.75 8.5H8.75" />`), "dot");
  assert.deepEqual(textChecks("x", out, 16).failures, []);
  const f = textChecks("x", svg16(`${BODY16}<path d="M4.75 5.5H11.25" stroke-opacity="0.6" />`), 16).failures;
  assert.deepEqual(f.map((x) => x.got), ["path#2@1 stroke-opacity"]);
});

test("emit passes a modifier's attributes through: stroke-opacity becomes strokeOpacity in React", async () => {
  const text = await addModifier(svg16(BODY16), "badge:plus");
  const tsx = toReact([{ name: "q", text }]);
  assert.match(tsx, /strokeOpacity="0.6"/);
  assert.match(tsx, /data-modifier="badge:plus"/);
  assert.match(tsx, /data-cut="split"/);
});

test("CLI: parseArgs, --print, and a refusal on stderr", () => {
  assert.deepEqual(parseArgs(["a.svg", "--add", "dot", "--corner", "tl", "--solid"]), { file: "a.svg", corner: "tl", solid: true, print: false, add: "dot" });
  assert.equal(parseArgs(["a.svg"]), null);
  assert.equal(parseArgs(["a.svg", "--add"]), null);
  assert.equal(parseArgs(["a.svg", "--add", "dot", "--bogus"]), null);
  const file = new URL("../../skills/pretty-icons/examples/hairline/data.svg", import.meta.url).pathname;
  const ok = spawnSync(process.execPath, [cli, file, "--add", "badge:check", "--print"], { encoding: "utf8" });
  assert.equal(ok.status, 0);
  assert.match(ok.stdout, /data-modifier="badge:check"/);
  const car = new URL("../../skills/pretty-icons/examples/garage/car.svg", import.meta.url).pathname;
  const no = spawnSync(process.execPath, [cli, car, "--add", "badge:check", "--print"], { encoding: "utf8" });
  assert.equal(no.status, 1);
  assert.match(no.stderr, /^modifiers: /);
});

test("a modifier on 20 and 24, the grids no example is drawn on, passes check", async () => {
  for (const G of [20, 24]) {
    const { stroke } = preset(G);
    const text = `<svg viewBox="0 0 ${G} ${G}" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${bodySvg(G, "square")}</svg>`;
    assert.deepEqual(textChecks("x", text, G).failures, [], `the base at ${G}`);
    for (const kind of ["badge:plus", "slash", "dot", "lock", "arrow:up"]) {
      const out = await addModifier(text, kind);
      assert.deepEqual(textChecks("x", out, G).failures, [], `${kind} at ${G}`);
    }
  }
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `rtk test node --test test/pretty-icons/modifiers.test.mjs`
Expected: FAIL, `Cannot find module '.../skills/pretty-icons/modifiers.mjs'`.

- [ ] **Step 3: Add `MODIFIER` to `presets.mjs`**

Save this diff as `/tmp/t7-presets.patch` and apply it from the repo root with `rtk git apply /tmp/t7-presets.patch`:

```diff
--- a/skills/pretty-icons/presets.mjs
+++ b/skills/pretty-icons/presets.mjs
@@ -112,3 +112,8 @@
 export const REFERENCE_INK = { 16: 83.5, 20: 114.2, 24: 181.9, 48: 328.7 };
 export const referenceInk = (G) => REFERENCE_INK[G];
 
+/**
+ * A modifier's box on each grid (its ink's larger side) and a dot's radius. Its halo, the clear space
+ * the base gives it, is derived: half the box plus one and a half base strokes (`modifiers.mjs`).
+ */
+export const MODIFIER = { 16: { size: 5, dot: 1.5 }, 20: { size: 6.5, dot: 1.75 }, 24: { size: 8, dot: 2.25 }, 48: { size: 14.5, dot: 4 } };
```

- [ ] **Step 4: Write `modifiers.mjs`**

Create `skills/pretty-icons/modifiers.mjs`:

```js
#!/usr/bin/env node
/**
 * Modifiers: a small sign on a base icon that says add, remove, done, off, locked, new.
 * `node modifiers.mjs <icon.svg> --add <kind> [--corner br|tr|bl|tl] [--solid] [--print]`
 *
 *   badge:plus  badge:minus  badge:check  badge:x   a glyph in the corner (in a paper circle at 48)
 *   arrow:up  arrow:right  arrow:down  arrow:left  a chevron with a tail
 *   lock                                          a cased body and its shackle
 *   dot                                           a filled dot
 *   slash                                         one diagonal, upper left to lower right, across the base
 *
 * It does three things, and writes the file back (or prints it):
 *   1. a body the halo crosses is split into its paint (stroke none) and its contour, a path marked data-cut;
 *   2. every stroke the halo crosses is cut where it enters, the inside dropped, the ends snapped outward
 *      to the quarter grid; a piece shorter than 1 (a crumb) goes too. Paint is never cut;
 *   3. the modifier is drawn last, its elements marked data-modifier="<kind>": duotone in currentColor at
 *      stroke-opacity 0.6 (--solid leaves it out), filled in the line tone at 2, a badge on paper.
 * The halo is the modifier's ink plus one stroke of clear space and half the base's stroke (its round cap).
 * The result goes through check.mjs's text rules; the command refuses, with them, anything they reject.
 */
import { readFileSync, writeFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { preset, MODIFIER, PALETTE } from "./presets.mjs";
import { parse, compose, num, G as gridOf, isClosed } from "./svg.mjs";
import { sampleParts } from "./geometry.mjs";
import { segments, inflections } from "./curve.mjs";

export const KINDS = ["badge:plus", "badge:minus", "badge:check", "badge:x", "arrow:up", "arrow:right", "arrow:down", "arrow:left", "lock", "dot", "slash"];
export const CORNERS = ["br", "tr", "bl", "tl"];
export const OPACITY = 0.6;
export const CRUMB = 1;
const STEP = 0.25, SAMPLES = 96;

export class ModifierError extends Error {}
const refuse = (m) => { throw new ModifierError(m); };
const snap = (n) => Math.round(n / STEP) * STEP;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], add = (a, b) => [a[0] + b[0], a[1] + b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
const len = (v) => Math.hypot(v[0], v[1]), lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const onGrid = (q) => q.every((n) => Math.abs(n / STEP - Math.round(n / STEP)) < 1e-6);
const fmt = (n) => String(+(+n).toFixed(2));
const pt = (p) => `${fmt(p[0])} ${fmt(p[1])}`;
const isNone = (v) => v !== undefined && String(v).trim().toLowerCase() === "none";
export const isModifier = (el) => "data-modifier" in el.attrs;
export const isCut = (el) => "data-cut" in el.attrs;
/** A cut contour split from its own paint, which sits just before it: data-cut="split". */
export const isSplit = (el) => !!el && el.attrs["data-cut"] === "split";

/** The base's widest stroke: the filled finish's contour, or the duotone stroke. */
const baseStroke = (G) => { const p = preset(G); return p.contour ?? p.stroke; };
/** The modifier's own stroke: 2 at the filled finish (a contour), the root's in duotone. */
const ownStroke = (G) => { const p = preset(G); return p.finish === "filled" ? p.contour : p.stroke; };

/** Where a modifier sits: the centre of its box in a corner of the live area, and its ink's half-width. */
export function placement(G, kind, corner = "br") {
  if (!KINDS.includes(kind)) refuse(`--add ${kind}: one of ${KINDS.join(", ")}`);
  if (!CORNERS.includes(corner)) refuse(`--corner ${corner}: br, tr, bl or tl`);
  const p = preset(G), m = MODIFIER[G], half = kind === "dot" ? m.dot : m.size / 2;
  const lo = p.pad + half, hi = G - p.pad - half;
  return { c: [corner.endsWith("l") ? lo : hi, corner.startsWith("t") ? lo : hi], half };
}

/**
 * The halo, as a distance function: how far a point is from the modifier, less the clear space it needs.
 * Negative inside. A badge, an arrow, a lock and a dot clear a circle; a slash clears a band along itself.
 */
export function halo(G, kind, corner = "br") {
  const clear = 1.5 * baseStroke(G);
  if (kind === "slash") {
    const [a, b] = slashEnds(G), r = ownStroke(G) / 2 + clear, ab = sub(b, a), L2 = ab[0] ** 2 + ab[1] ** 2;
    return { r, inside: (q) => { const t = Math.max(0, Math.min(1, ((q[0] - a[0]) * ab[0] + (q[1] - a[1]) * ab[1]) / L2)); return len(sub(q, lerp(a, b, t))) - r; } };
  }
  const { c, half } = placement(G, kind, corner), r = half + clear;
  return { r, c, inside: (q) => len(sub(q, c)) - r };
}
/** Where a slash starts and ends: a stroke in from the live area's corners. */
export const slashEnds = (G) => { const p = preset(G), e = p.pad + ownStroke(G); return [[e, e], [G - e, G - e]]; };

/** A rect, circle or line as a path's d; a path as it is. */
export function asPath(el) {
  const a = el.attrs, n = (k, f = 0) => num(a, k, f);
  if (el.tag === "path") return a.d ?? "";
  if (el.tag === "line") return `M${pt([n("x1"), n("y1")])}L${pt([n("x2"), n("y2")])}`;
  if (el.tag === "circle") { const [cx, cy, r] = [n("cx"), n("cy"), n("r")]; return `M${pt([cx - r, cy])}A${fmt(r)} ${fmt(r)} 0 1 1 ${pt([cx + r, cy])}A${fmt(r)} ${fmt(r)} 0 1 1 ${pt([cx - r, cy])}Z`; }
  const [x, y, w, h] = [n("x"), n("y"), n("width"), n("height")], r = Math.min(n("rx", n("ry", 0)), w / 2, h / 2);
  if (!r) return `M${pt([x, y])}H${fmt(x + w)}V${fmt(y + h)}H${fmt(x)}Z`;
  const A = (to) => `A${fmt(r)} ${fmt(r)} 0 0 1 ${pt(to)}`;
  return `M${pt([x + r, y])}H${fmt(x + w - r)}${A([x + w, y + r])}V${fmt(y + h - r)}${A([x + w - r, y + h])}H${fmt(x + r)}${A([x, y + h - r])}V${fmt(y + r)}${A([x + r, y])}Z`;
}

// a segment's point at t, and the same segment cut to [t0, t1], as path text from its start
function at(s, t) {
  if (s.kind === "line") return lerp(s.p[0], s.p[1], t);
  if (s.kind === "cubic") { const [a, b, c, d] = s.p, u = 1 - t; return [0, 1].map((k) => u * u * u * a[k] + 3 * u * u * t * b[k] + 3 * u * t * t * c[k] + t * t * t * d[k]); }
  const { rx, ry, deg, c, th0, dth } = s.arc, th = th0 + dth * t, f = (deg * Math.PI) / 180;
  return [c[0] + rx * Math.cos(f) * Math.cos(th) - ry * Math.sin(f) * Math.sin(th), c[1] + rx * Math.sin(f) * Math.cos(th) + ry * Math.cos(f) * Math.sin(th)];
}
/**
 * A control point next to a kept anchor, at frac of its handle's length, moved to a quarter-grid point whose
 * direction from the anchor is within TURN of the handle's: the anchor's join stays smooth (under 4° with the
 * other side untouched). The nearest such length wins; with none, the anchor itself (no handle).
 */
const TURN = 2;
function alongHandle(anchor, control, frac) {
  const v = sub(control, anchor), L = len(v) * frac;
  if (L < 1e-9) return anchor;
  const u = mul(v, 1 / len(v)), n = Math.ceil((1.5 * L) / STEP) + 1;
  let best = null, score = Infinity;
  for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) {
    const w = [i * STEP, j * STEP], l = len(w);
    if (l < 0.5 * L || l > 1.5 * L || !l) continue;
    const turn = (Math.acos(Math.max(-1, Math.min(1, (w[0] * u[0] + w[1] * u[1]) / l))) * 180) / Math.PI;
    if (turn > TURN) continue;
    const sc = Math.abs(l - L) + turn * 0.1;
    if (sc < score) { score = sc; best = w; }
  }
  return best ? add(anchor, best) : anchor;
}
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
/** The quarter-grid point nearest q that the halo leaves clear. */
function outward(q, inside) {
  const base = q.map((n) => Math.floor(n / STEP) * STEP), cands = [];
  for (let i = -1; i <= 2; i++) for (let j = -1; j <= 2; j++) cands.push([base[0] + i * STEP, base[1] + j * STEP]);
  return cands.filter((c) => inside(c) >= -1e-9).sort((a, b) => len(sub(a, q)) - len(sub(b, q)))[0];
}
/** A cubic's text; one whose snapped handles make it wobble (two inflections, or one under a chord of 4) loses its handle at a cut end. */
function cubicText(P0, c1, c2, P1, cutStart, cutEnd) {
  const n = inflections(segments(`M${pt(P0)}C${pt(c1)} ${pt(c2)} ${pt(P1)}`)[0].segs[0] ?? { kind: "line" });
  if (n > 1 || (n && len(sub(P1, P0)) < 4)) { if (cutStart) c1 = P0; if (cutEnd) c2 = P1; }
  return `C${pt(c1)} ${pt(c2)} ${pt(P1)}`;
}
function piece(s, t0, t1, ends) {
  // ends: [start, end], snapped; a kept original anchor stays where it was
  const [P0, P1] = ends;
  if (s.kind === "line") return `L${pt(P1)}`;
  if (s.kind === "cubic") {
    // de Casteljau: the cubic between t0 and t1; a control beside an original anchor keeps its direction
    const split = (p, t) => { const [a, b, c, d] = p, ab = lerp(a, b, t), bc = lerp(b, c, t), cd = lerp(c, d, t), abc = lerp(ab, bc, t), bcd = lerp(bc, cd, t), m = lerp(abc, bcd, t); return [[a, ab, abc, m], [m, bcd, cd, d]]; };
    let q = s.p;
    if (t1 < 1) q = split(q, t1)[0];
    if (t0 > 0) q = split(q, t0 / t1)[1];
    if (t0 === 0 && t1 === 1 && onGrid(s.p[1]) && onGrid(s.p[2])) return `C${pt(s.p[1])} ${pt(s.p[2])} ${pt(P1)}`;
    const c1 = t0 === 0 ? alongHandle(s.p[0], s.p[1], len(sub(q[1], q[0])) / (len(sub(s.p[1], s.p[0])) || 1)) : q[1].map(snap);
    const c2 = t1 === 1 ? alongHandle(s.p[3], s.p[2], len(sub(q[2], q[3])) / (len(sub(s.p[2], s.p[3])) || 1)) : q[2].map(snap);
    return cubicText(P0, c1, c2, P1, t0 > 0, t1 < 1);
  }
  const { rx, ry, deg, sweep, dth } = s.arc;
  if (t0 === 0 && t1 === 1) return `A${fmt(rx)} ${fmt(ry)} ${fmt(deg)} ${Math.abs(dth) > Math.PI ? 1 : 0} ${sweep} ${pt(P1)}`;
  // a cut arc: its snapped end is off the ellipse. It is split where it crosses an axis (a point on the grid when
  // the ellipse is), each part with both ends on it stays an arc, and the part at the cut end goes as one cubic,
  // its handle at the other end along the arc's tangent there, so the join does not turn
  const ts = [t0];
  for (let j = Math.ceil((s.arc.th0 + dth * Math.min(t0, t1)) / (Math.PI / 2)); ; j++) {
    // the axis crossings between t0 and t1, in the direction drawn
    const t = ((j * Math.PI) / 2 - s.arc.th0) / dth;
    if (!(t > t0 + 1e-9 && t < t1 - 1e-9)) { if (dth > 0 ? t >= t1 : t <= t0) break; if (j > 100) break; continue; }
    if (onGrid(at(s, t))) ts.push(t);
  }
  ts.push(t1);
  ts.sort((x, y) => x - y);
  const tangent = (t) => { const e = 1e-6; return mul(sub(at(s, t + e), at(s, t - e)), 1 / (2 * e * dth)); };
  let d = "";
  for (let i = 0; i + 1 < ts.length; i++) {
    const a = ts[i], b = ts[i + 1], cutA = i === 0 && a > 0, cutB = i + 2 === ts.length && b < 1;
    const A = i === 0 ? P0 : at(s, a).map(snap), B = i + 2 === ts.length ? P1 : at(s, b).map(snap);
    if (len(sub(A, B)) < 1e-9) continue;
    if (!cutA && !cutB) { d += `A${fmt(rx)} ${fmt(ry)} ${fmt(deg)} 0 ${sweep} ${pt(B)}`; continue; }
    const k = (4 / 3) * Math.tan((dth * (b - a)) / 4);
    const c1 = add(at(s, a), mul(tangent(a), k)), c2 = sub(at(s, b), mul(tangent(b), k));
    d += cubicText(A, cutA ? c1.map(snap) : alongHandle(A, c1, 1), cutB ? c2.map(snap) : alongHandle(B, c2, 1), B, cutA, cutB);
  }
  return d;
}
const arcLength = (s, t0, t1) => { let L = 0, prev = at(s, t0); for (let i = 1; i <= 16; i++) { const q = at(s, t0 + ((t1 - t0) * i) / 16); L += len(sub(q, prev)); prev = q; } return L; };

/**
 * A path's d cut by a halo: what lies outside it, as a d of open runs, or "" when nothing is left, or null
 * when the halo does not touch it. A closed subpath cut once becomes one run, from where it leaves the halo
 * round to where it enters. Runs shorter than CRUMB are dropped.
 */
export function cut(d, { inside }) {
  const subs = segments(d);
  let touched = false;
  const runs = [];
  for (const { segs, closed, start } of subs) {
    // a dot (a subpath of no length, drawn by its round cap): kept whole or dropped whole
    if (!segs.length) { if (inside(start) < 0) touched = true; else runs.push({ dot: start }); continue; }
    // each segment's stretches outside the halo, as [t0, t1]
    const outs = segs.map((s) => {
      const ts = [];
      let prev = inside(at(s, 0)) >= 0;
      if (!prev) touched = true;
      let start = prev ? 0 : null;
      for (let i = 1; i <= SAMPLES; i++) {
        const t = i / SAMPLES, now = inside(at(s, t)) >= 0;
        if (now !== prev) {
          touched = true;
          let lo = (i - 1) / SAMPLES, hi = t;
          for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; ((inside(at(s, m)) >= 0) === prev ? (lo = m) : (hi = m)); }
          const x = (lo + hi) / 2;
          if (now) start = x; else { ts.push([start, x]); start = null; }
          prev = now;
        }
      }
      if (prev) ts.push([start, 1]);
      return ts;
    });
    // the pieces in drawing order; a closed subpath begins where it first leaves the halo
    let pieces = segs.flatMap((s, i) => outs[i].map(([t0, t1]) => ({ s, i, t0, t1 })));
    if (closed && pieces.length) {
      const k = pieces.findIndex((p) => p.t0 > 0);
      if (k > 0) pieces = [...pieces.slice(k), ...pieces.slice(0, k)];
    }
    let run = null;
    for (const p of pieces) {
      const joined = run && run.last.t1 === 1 && p.t0 === 0 && (p.i === (run.last.i + 1) % segs.length);
      if (!joined) { run = { list: [], last: null }; runs.push(run); }
      run.list.push(p); run.last = p;
    }
  }
  if (!touched) return null;
  const out = [];
  for (const { list, dot } of runs) {
    if (dot) { out.push(`M${pt(dot)}h0`); continue; }
    // a sliver at either end of a run, where it leaves the halo, goes: its handles would loop on the grid
    while (list.length > 1 && arcLength(list[0].s, list[0].t0, list[0].t1) < CRUMB && list[0].t0 > 0) list.shift();
    while (list.length > 1 && arcLength(list.at(-1).s, list.at(-1).t0, list.at(-1).t1) < CRUMB && list.at(-1).t1 < 1) list.pop();
    if (list.reduce((L, p) => L + arcLength(p.s, p.t0, p.t1), 0) < CRUMB) continue;
    const endOf = (p, t) => (t === 0 ? p.s.p[0] : t === 1 ? p.s.p.at(-1) : outward(at(p.s, t), inside));
    let d0 = `M${pt(endOf(list[0], list[0].t0))}`;
    for (const p of list) d0 += piece(p.s, p.t0, p.t1, [endOf(p, p.t0), endOf(p, p.t1)]);
    out.push(d0);
  }
  return out.join("");
}

/** The modifier's elements, as { tag, attrs } with data-modifier set. */
export function glyph(G, kind, { corner = "br", solid = false } = {}) {
  const p = preset(G), filled = p.finish === "filled", s = ownStroke(G);
  const { c, half } = placement(G, kind, corner), [cx, cy] = c;
  const mark = { "data-modifier": kind, ...(filled ? {} : solid ? {} : { "stroke-opacity": String(OPACITY) }) };
  const P = (...xy) => { const o = []; for (let i = 0; i < xy.length; i += 2) o.push(pt([snap(xy[i]), snap(xy[i + 1])])); return o; };
  if (kind === "dot") return [{ tag: "circle", attrs: { cx: fmt(cx), cy: fmt(cy), r: fmt(half), fill: filled ? PALETTE.line : "currentColor", stroke: "none", "data-modifier": kind } }];
  if (kind === "slash") { const [a, b] = slashEnds(G); return [{ tag: "path", attrs: { d: `M${pt(a)}L${pt(b)}`, ...(filled ? { "stroke-width": String(s) } : {}), ...mark } }]; }
  const out = [];
  // the glyph's half-extent: the box less half a stroke; at 48 inside a paper circle, half that circle's
  let h = half - s / 2;
  if (filled && kind.startsWith("badge")) {
    out.push({ tag: "circle", attrs: { cx: fmt(cx), cy: fmt(cy), r: fmt(h), fill: PALETTE.paper, "stroke-width": String(s), ...mark } });
    h = snap(h / 2);
  }
  const k = snap((h * 2) / 3);
  let d;
  if (kind === "badge:plus") { const [a, b, e, f] = P(cx - h, cy, cx + h, cy, cx, cy - h, cx, cy + h); d = `M${a}H${b.split(" ")[0]}M${e}V${f.split(" ")[1]}`; }
  else if (kind === "badge:minus") { const [a, b] = P(cx - h, cy, cx + h, cy); d = `M${a}H${b.split(" ")[0]}`; }
  else if (kind === "badge:x") { const [a, b, e, f] = P(cx - h, cy - h, cx + h, cy + h, cx + h, cy - h, cx - h, cy + h); d = `M${a}L${b}M${e}L${f}`; }
  else if (kind === "badge:check") { const [a, b, e] = P(cx - h, cy, cx - h / 3, cy + k, cx + h, cy - k); d = `M${a}L${b}L${e}`; }
  else if (kind.startsWith("arrow")) {
    const turn = { up: 0, right: 90, down: 180, left: 270 }[kind.split(":")[1]], r = (turn * Math.PI) / 180;
    const T = (x, y) => [cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)];
    const [a, b, e, f, g] = P(...T(0, h), ...T(0, -h), ...T(-k, -h + k), ...T(0, -h), ...T(k, -h + k));
    d = `M${a}L${b}M${e}L${f}L${g}`;
  } else {
    // lock: a cased body over the lower part of the box, a shackle above it
    const bw = 2 * h, bh = snap(h * 1.2), top = cy + h - bh, sr = snap(h * 0.55);
    out.push({ tag: "rect", attrs: { x: fmt(snap(cx - h)), y: fmt(snap(top)), width: fmt(bw), height: fmt(bh), rx: fmt(G === 48 ? 2.5 : 1), ...(filled ? { fill: PALETTE.paper, "stroke-width": String(s) } : {}), ...mark } });
    const [a, b] = P(cx - sr, top, cx + sr, top);
    d = `M${a}V${fmt(snap(cy - h + sr))}A${fmt(sr)} ${fmt(sr)} 0 0 1 ${b.split(" ")[0]} ${fmt(snap(cy - h + sr))}V${b.split(" ")[1]}`;
  }
  out.push({ tag: "path", attrs: { d, ...mark } });
  return out;
}

/**
 * The icon with the modifier added, as text. Bodies the halo crosses are split, strokes it crosses are cut,
 * the modifier is appended. Refuses an icon that already has one, and anything check.mjs's text rules, gap or
 * live reject.
 */
export async function addModifier(text, kind, { corner = "br", solid = false, name = "icon" } = {}) {
  const parsed = parse(text), G = gridOf(parsed.attrs);
  if (G === null) refuse("no viewBox of a grid");
  const p = preset(G);
  const { textChecks } = await import("./check.mjs");
  const before = textChecks(name, text, G).failures;
  if (before.length) refuse(`it fails check before the modifier; fix it first:\n${before.map((f) => `${f.rule}  ${f.icon}  ${f.got} → ${f.want}`).join("\n")}`);
  if (parsed.elements.some(isModifier)) refuse("it has a modifier already: one per icon");
  if (kind === "slash" && corner !== "br") refuse("--corner: a slash crosses the whole icon");
  const H = halo(G, kind, corner), rootStroke = parsed.attrs.stroke;
  const strokes = (el) => !isNone(el.attrs.stroke ?? rootStroke);
  const paints = (el) => el.attrs.fill !== undefined && !isNone(el.attrs.fill);
  const out = [];
  for (const el of parsed.elements) {
    if (!strokes(el)) { out.push(el); continue; }
    const rest = Object.fromEntries(Object.entries(el.attrs).filter(([k]) => !["x", "y", "width", "height", "rx", "ry", "cx", "cy", "r", "x1", "y1", "x2", "y2", "d", "fill", "fill-opacity"].includes(k)));
    const d = cut(asPath(el), H);
    if (d === null) { out.push(el); continue; }
    if (d === "" && paints(el)) refuse(`${el.at} lies under the ${kind}'s halo: try another --corner, or move the body`);
    if (paints(el)) {
      // a body: its paint whole, then its contour cut (the filled finish draws them apart already)
      if (!isClosed(el)) refuse(`${el.at} is filled and open: close it before a modifier`);
      out.push({ tag: el.tag, attrs: { ...el.attrs, stroke: "none" } });
    }
    // every stroke the halo cut is marked: "split" when its paint is just before it, empty otherwise
    if (d) out.push({ tag: "path", attrs: { d, ...rest, "data-cut": paints(el) ? "split" : "" } });
  }
  out.push(...glyph(G, kind, { corner, solid }));
  // one element a line, as the icons are written
  const result = compose(parsed.attrs, out).replace(/ \/><(?!\/svg>)/g, " />\n  <").replace(/^(<svg[^>]*>)/, "$1\n  ").replace(/<\/svg>$/, "\n</svg>");
  const failures = textChecks(name, result, G).failures;
  // gap and live are measured: a cut can leave a stub nearer a body than a stroke. Without the
  // rasteriser they wait for check.mjs, which says "not measured".
  const { measuredChecks } = await import("./measure.mjs"), { NO_RASTER } = await import("./raster.mjs");
  if (!failures.length) {
    try {
      failures.push(...(await measuredChecks([{ name, text: result }], G)).failures.filter((f) => f.rule === "gap" || f.rule === "live"));
    } catch (e) { if (e?.code !== NO_RASTER) throw e; }
  }
  if (failures.length) refuse(`the result would fail check:\n${failures.map((f) => `${f.rule}  ${f.icon}  ${f.got} → ${f.want}`).join("\n")}\ntry another --corner or another kind`);
  return result;
}

/**
 * The modifier rule, for check.mjs: one modifier per icon, of a known kind, its size and corner from the
 * preset, stroke-opacity 0.6 or none in duotone and none at 48, and no other stroke inside its halo.
 */
export function modifierFailures(icon, parsed, G) {
  const out = [], mods = parsed.elements.filter(isModifier), p = preset(G), filled = p.finish === "filled";
  const f = (got, want) => out.push({ rule: "modifier", icon, got, want });
  for (const el of parsed.elements) if (isCut(el) && !mods.length) f(`${el.at} data-cut`, "only in an icon with a modifier");
  if (!mods.length) return out;
  const kinds = [...new Set(mods.map((el) => el.attrs["data-modifier"]))];
  if (kinds.length > 1) { f(`${kinds.length} modifiers: ${kinds.join(", ")}`, "one"); return out; }
  const kind = kinds[0];
  if (!KINDS.includes(kind)) { f(`${mods[0].at} data-modifier ${kind}`, KINDS.join(", ")); return out; }
  for (const el of mods) {
    const o = el.attrs["stroke-opacity"];
    if (o !== undefined && (filled || Number(o) !== OPACITY)) f(`${el.at} stroke-opacity ${o}`, filled ? "not set at the filled finish" : `${OPACITY}, or not set (--solid)`);
  }
  // where it sits: the corner whose box its ink centres on, and its ink's size
  let pts;
  try { pts = mods.flatMap((el) => sampleParts(el, 0.05).flat()); } catch { return out; }
  const s = kind === "dot" ? 0 : ownStroke(G);
  const x0 = Math.min(...pts.map((q) => q[0])) - s / 2, x1 = Math.max(...pts.map((q) => q[0])) + s / 2;
  const y0 = Math.min(...pts.map((q) => q[1])) - s / 2, y1 = Math.max(...pts.map((q) => q[1])) + s / 2;
  const box = Math.max(x1 - x0, y1 - y0), mid = [(x0 + x1) / 2, (y0 + y1) / 2];
  let corner = null;
  if (kind === "slash") {
    const [a, b] = slashEnds(G);
    if (mods.length !== 1 || mods[0].tag !== "path" || Math.abs(x0 + s / 2 - a[0]) > 0.3 || Math.abs(x1 - s / 2 - b[0]) > 0.3 || Math.abs(y0 + s / 2 - a[1]) > 0.3 || Math.abs(y1 - s / 2 - b[1]) > 0.3)
      f(`slash ${fmt(x0 + s / 2)}, ${fmt(y0 + s / 2)} to ${fmt(x1 - s / 2)}, ${fmt(y1 - s / 2)}`, `one line from ${pt(a)} to ${pt(b)}`);
    corner = "br";
  } else {
    const want = kind === "dot" ? 2 * MODIFIER[G].dot : MODIFIER[G].size;
    corner = CORNERS.find((k) => len(sub(placement(G, kind, k).c, mid)) <= 0.3);
    if (!corner || Math.abs(box - want) > 0.3) f(`${kind} ${fmt(box)} wide, centred at ${pt(mid)}`, `${fmt(want)} wide, in a corner of the live area: ${CORNERS.map((k) => pt(placement(G, kind, k).c)).join(" / ")}`);
  }
  if (!corner) return out;
  // the halo: every other stroke's centreline clear of it (a tenth for the snap)
  const H = halo(G, kind, corner), rootStroke = parsed.attrs.stroke;
  for (const el of parsed.elements) {
    if (isModifier(el) || isNone(el.attrs.stroke ?? rootStroke)) continue;
    let q;
    try { q = sampleParts(el, 0.05).flat(); } catch { continue; }
    const worst = Math.min(...q.map(H.inside));
    if (worst < -0.1) f(`${el.at} ${fmt(-worst)} inside ${kind}'s halo`, "clear of it: add the modifier with modifiers.mjs, which cuts the stroke");
  }
  return out;
}

export const USAGE = "usage: node modifiers.mjs <icon.svg> --add <kind> [--corner br|tr|bl|tl] [--solid] [--print]";

export function parseArgs(argv) {
  const o = { corner: "br", solid: false, print: false }, files = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--solid") o.solid = true;
    else if (a === "--print") o.print = true;
    else if (a === "--add" || a === "--corner") { const v = argv[++i]; if (v === undefined || v.startsWith("--")) return null; o[a.slice(2)] = v; }
    else if (a.startsWith("--")) return null;
    else files.push(a);
  }
  return files.length === 1 && o.add ? { file: files[0], ...o } : null;
}

export async function main(argv) {
  const args = parseArgs(argv);
  if (!args) { console.error(USAGE); process.exit(1); }
  try {
    const text = readFileSync(args.file, "utf8");
    const out = await addModifier(text, args.add, { ...args, name: args.file.replace(/^.*\/|\.svg$/g, "") });
    if (args.print) process.stdout.write(out + "\n"); else { writeFileSync(args.file, out + "\n"); console.log(`${args.file}: ${args.add}`); }
  } catch (e) {
    if (!(e instanceof ModifierError)) throw e;
    console.error(`modifiers: ${e.message}`);
    process.exit(1);
  }
}

const entry = process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (entry) main(process.argv.slice(2));
```

- [ ] **Step 5: Run the test and see the integration fail**

Run: `rtk test node --test test/pretty-icons/modifiers.test.mjs`
Expected: 8 fail. The geometry passes (placement, cut, glyphs), but `check.mjs` does not know a modifier yet: it rejects the `stroke-opacity`, counts the split body twice, and `addModifier`'s own check of its result fails, so even the gap refusal never reaches gap.

- [ ] **Step 6: Teach `check.mjs`, `filled.mjs`, `measure.mjs` and `sheet.mjs` the modifier**

Save this diff as `/tmp/t7-integration.patch` and apply it from the repo root with `rtk git apply /tmp/t7-integration.patch`:

```diff
--- a/skills/pretty-icons/check.mjs
+++ b/skills/pretty-icons/check.mjs
@@ -15,7 +15,9 @@
  *   grid          every number a multiple of 0.25
  *   contour       a filled path has at most five straight sides; a rect, a circle or a curve passes
  *   radius        rx by the shape's size (at 48, by what the object is: cut, cased, moulded or a pill)
- *   count         at most three elements, at most eight commands in a path (implicit repeats count);
+ *   modifier      one per icon, of a known kind, its size and corner from the preset, at stroke-opacity 0.6
+ *                 or none in duotone, none at 48; no other stroke inside its halo (modifiers.mjs)
+ *   count         at most three elements (a modifier and, in duotone, a cut contour left out), at most eight commands in a path (implicit repeats count);
  *                 the details (every element without a fill) at most two subpaths and eight
  *                 drawing commands between them (moves left out)
  * Measured rules, from pixels: live, keyline, weight, gravity, gap. An icon that
@@ -30,6 +32,7 @@
 import { straightSides } from "./geometry.mjs";
 import { filledChecks } from "./filled.mjs";
 import { curveFailures, curveColumns, pixelNotes } from "./curve.mjs";
+import { modifierFailures, isModifier, isCut, isSplit } from "./modifiers.mjs";
 
 export { pathCommands, isClosed };
 
@@ -90,7 +93,7 @@
   if ("stroke-dasharray" in root) checkDash(failures, icon, "root", root["stroke-dasharray"], p.stroke);
   for (const el of parsed.elements) {
     const a = el.attrs, where = el.at;
-    for (const k of FORBIDDEN_ATTRS) if (k in a) fail(failures, "stroke", icon, `${where} ${k}`, "not set");
+    for (const k of FORBIDDEN_ATTRS) if (k in a && !(k === "stroke-opacity" && isModifier(el))) fail(failures, "stroke", icon, `${where} ${k}`, "not set");
     if ("stroke-width" in a && !p.weights.includes(num(a, "stroke-width"))) fail(failures, "stroke", icon, `${where} stroke-width ${a["stroke-width"]}`, p.weights.length ? `the root's, or ${p.weights.join(" or ")}` : "the root's");
     for (const k of ROUND_ATTRS) if (k in a && a[k] !== "round") fail(failures, "stroke", icon, `${where} ${k} ${a[k]}`, "round");
     if ("stroke-dasharray" in a) checkDash(failures, icon, where, a["stroke-dasharray"], p.stroke);
@@ -111,10 +114,14 @@
       if (n > p.commands) fail(failures, "count", icon, `${where} ${n} commands`, `at most ${p.commands}`);
     }
   }
-  if (p.finish === "filled") failures.push(...filledChecks(icon, parsed, expectG));
-  else duotoneChecks(failures, icon, parsed, p);
+  // the base, without its modifier: what the finish's rules and the count judge
+  const base = { ...parsed, elements: parsed.elements.filter((el) => !isModifier(el)) };
+  if (p.finish === "filled") failures.push(...filledChecks(icon, base, expectG));
+  else duotoneChecks(failures, icon, base, p);
 
-  if (parsed.elements.length > p.elements) fail(failures, "count", icon, `${parsed.elements.length} elements`, `at most ${p.elements}`);
+  // a split body's contour is one element with its paint; any other cut stroke counts as the one it was
+  const counted = base.elements.filter((el) => !isSplit(el)).length;
+  if (counted > p.elements) fail(failures, "count", icon, `${counted} elements`, `at most ${p.elements}`);
   if (parsed.elements.length === 0) fail(failures, "count", icon, "0 elements", "at least 1");
   // curves, after every other text rule; each path once, since a contour repeats its tone's
   const seen = new Set();
@@ -123,6 +130,7 @@
     seen.add(el.attrs.d);
     failures.push(...curveFailures(icon, el));
   }
+  failures.push(...modifierFailures(icon, parsed, expectG));
 
   return { G, failures, parsed };
 }
@@ -133,15 +141,19 @@
   if (!isCurrent(root.stroke)) fail(failures, "stroke", icon, `stroke ${root.stroke ?? "missing"}`, "currentColor");
   for (const k of ["color", "stop-color"]) if (k in root && !isCurrent(root[k]) && !isNone(root[k])) fail(failures, "stroke", icon, `root ${k} ${root[k]}`, "currentColor or none");
   let bodies = 0, subpaths = 0, drawing = 0;
-  for (const el of parsed.elements) {
+  for (const [i, el] of parsed.elements.entries()) {
     const a = el.attrs, where = el.at;
+    // a stroke the modifier cut was judged before it was cut (modifiers.mjs checks the base first);
+    // a split body's paint, just before its cut contour, carries the body's rules
+    if (isCut(el)) continue;
+    const cutAfter = isSplit(parsed.elements[i + 1]);
     if ("transform" in a) fail(failures, "stroke", icon, `${where} transform`, "not set");
     for (const k of COLOUR_ATTRS) if (k in a && !isCurrent(a[k]) && !isNone(a[k])) fail(failures, "stroke", icon, `${where} ${k} ${a[k]}`, "currentColor or none");
     // construction: a filled element is a closed body with a contour and the .2 fill;
     // a closed element with a contour and no fill (a ring, a hub) is allowed
     if (isCurrent(a.fill)) {
       bodies++;
-      if (isNone(a.stroke)) fail(failures, "construction", icon, `${where} stroke none`, "a contour on every body");
+      if (isNone(a.stroke) && !cutAfter) fail(failures, "construction", icon, `${where} stroke none`, "a contour on every body");
       if (num(a, "fill-opacity") !== FILL) fail(failures, "construction", icon, `${where} fill-opacity ${a["fill-opacity"] ?? "1"}`, `${FILL}`);
       if (!isClosed(el)) fail(failures, "construction", icon, `${where} fill ${a.fill}`, "none on a line");
       // contour: a body is a rect, a circle, a path of up to five straight sides, or a path shaped by curves; more is faceted.
--- a/skills/pretty-icons/filled.mjs
+++ b/skills/pretty-icons/filled.mjs
@@ -34,15 +34,21 @@
   const out = { shadows: [], tones: [], shades: [], contours: [], shapes: [], dots: [], lines: [], marks: [], cores: [], highlights: [], role: new Map() };
   const put = (el, role) => { out[role].push(el); out.role.set(el, role); };
   const open = new Map(), bars = new Set();
-  for (const el of elements) {
+  // a modifier's cut marks every stroke it cut data-cut. "split" is a shape's line (fill and line on one element,
+  // split in two), and the paint just before it is that shape; any other cut stroke at 2 is a tone's contour
+  const cutLine = (el) => el && el.attrs["data-cut"] === "split";
+  for (const [i, el] of elements.entries()) {
     const a = el.attrs, fill = isNone(a.fill) ? null : tone(a.fill) ?? "other", stroke = a.stroke === undefined ? "line" : isNone(a.stroke) ? null : tone(a.stroke) ?? "other";
     if ("transform" in a) put(el, "shadows");
+    else if (fill && !stroke && cutLine(elements[i + 1])) put(el, "shapes");
+    else if (cutLine(el)) put(el, "lines");
     else if (fill && !stroke) put(el, fill === "shade" ? "shades" : isDot(el) ? "dots" : "tones");
     else if (fill) put(el, "shapes");
     else if (stroke === "fill" || (stroke === "shade" && bars.has(geometryKey(el)))) put(el, "cores");
     else if (stroke === "shade") put(el, "shades");
     else if (stroke === "mark") put(el, "marks");
     else if (stroke === "paper") put(el, "highlights");
+    else if ("data-cut" in a && num(a, "stroke-width") === CONTOUR) put(el, "contours");
     else if (open.has(geometryKey(el))) { put(el, "contours"); open.delete(geometryKey(el)); }
     else put(el, "lines");
     if (out.role.get(el) === "tones") open.set(geometryKey(el), el);
@@ -73,9 +79,12 @@
   if (els.length && ![...c.tones, ...c.shapes].some((el) => tone(el.attrs.fill) === "fill")) fail(failures, "construction", icon, "no body", `a closed element in the fill tone, ${PALETTE.fill}`);
 
   // a tone and its contour: the tone's geometry pasted after it, no fill
-  const contourOf = new Map();
+  // a contour a modifier cut (data-cut) is the first unclaimed one after its tone
+  const contourOf = new Map(), claimed = new Set();
   for (const t of c.tones) {
-    const k = geometryKey(t), twin = c.contours.find((x) => at(x) > at(t) && geometryKey(x) === k);
+    const k = geometryKey(t), twin = c.contours.find((x) => at(x) > at(t) && geometryKey(x) === k)
+      ?? c.contours.find((x) => at(x) > at(t) && "data-cut" in x.attrs && !claimed.has(x));
+    if (twin) claimed.add(twin);
     if (twin) contourOf.set(t, twin);
     else fail(failures, "construction", icon, `${t.at} fill ${t.attrs.fill} stroke none`, "its contour after it: the same geometry, no fill, at 2");
   }
--- a/skills/pretty-icons/measure.mjs
+++ b/skills/pretty-icons/measure.mjs
@@ -4,10 +4,15 @@
  * At the filled finish weight reads the lines alone (no paint, no fill), and gap holds
  * every element but the paint apart (a tone, a shade, a dot, a core: filled.mjs): line
  * from line by a stroke, a mark from anything by half a stroke.
+ * A modifier (modifiers.mjs) is the base's sign, not its object. Its cut moves the base's box, mass and ink,
+ * so a modified icon is judged for live (the whole) and gap (without the modifier, whose halo is the modifier
+ * rule's) only: not keyline, gravity or weight, and it stays out of the median. Its base is judged for those. In duotone the
+ * paint is a split body's fill (stroke none): its edge is its contour's, so it is left out of gap too.
  */
 import { preset, TOUCH, FORMATS, referenceInk } from "./presets.mjs";
 import { measure, resvg, NO_RASTER } from "./raster.mjs";
-import { parse } from "./svg.mjs";
+import { parse, compose } from "./svg.mjs";
+import { isModifier } from "./modifiers.mjs";
 import { sampleParts, minDistance } from "./geometry.mjs";
 import { objectOf, linesOf, classify } from "./filled.mjs";
 
@@ -36,21 +41,25 @@
     // (an unclosed quote, an unknown command): one elements line, and it stays out of the median.
     try {
       const filled = p.finish === "filled";
-      const els = parse(s.text).elements.filter((el) => !(filled && "transform" in el.attrs));
+      const parsed = parse(s.text);
+      const els = parsed.elements.filter((el) => !(filled && "transform" in el.attrs) && !isModifier(el));
+      const base = els.length === parsed.elements.length ? s.text : compose(parsed.attrs, parsed.elements.filter((el) => !isModifier(el)));
       const c = filled ? classify(els) : null;
       const details = new Set(filled ? c.details.map((el) => el.at) : []);
-      const paint = new Set(filled ? [...c.paint].map((el) => el.at) : []);
+      const paint = new Set(filled ? [...c.paint].map((el) => el.at) : els.filter((el) => String(el.attrs.stroke).trim().toLowerCase() === "none").map((el) => el.at));
       const parts = els.map((el) => { try { return sampleParts(el, 0.05); } catch (e) { throw new Error(`${el.at} ${e.message}`); } });
       const whole = await measure(s.text, G);
-      const m = filled ? { ...(await measure(objectOf(s.text), G)), live: whole.box, ink: (await measure(linesOf(s.text), G)).ink } : { ...whole, live: whole.box };
-      measures.push({ ...s, els, parts, details, paint, m });
+      const m = filled
+        ? { ...(await measure(objectOf(base), G)), live: whole.box, ink: (await measure(linesOf(base), G)).ink }
+        : { ...(await measure(base, G)), live: whole.box };
+      measures.push({ ...s, els, parts, details, paint, m, modified: base !== s.text });
     } catch (e) {
       if (e?.code === NO_RASTER) throw e;
       fail(failures, "elements", s.name, String(e?.message ?? e).split("\n")[0], "a file check can measure");
     }
   }
 
-  for (const { name, els, parts, details, paint, m } of measures) {
+  for (const { name, els, parts, details, paint, m, modified } of measures) {
     const { box, mass, ink, live } = m;
     // an empty icon has no box or mass to judge; count already reports it
     const inked = live.w > 0;
@@ -59,11 +68,11 @@
     if (inked && (live.x0 < lo || live.y0 < lo || live.x1 > hi || live.y1 > hi)) fail(failures, "live", name, `ink ${r2(live.x0)},${r2(live.y0)}–${r2(live.x1)},${r2(live.y1)}`, `inside ${p.pad}–${G - p.pad}`);
     // keyline
     const k = nearestKeyline(G, box.w, box.h);
-    const fits = inked && Math.abs(k.dw) <= p.keylineTol + 1e-9 && Math.abs(k.dh) <= p.keylineTol + 1e-9;
-    if (inked && !fits) fail(failures, "keyline", name, `${r2(box.w)} × ${r2(box.h)}`, `${k.format} ${p.keylines[k.format].join(" × ")} ±${p.keylineTol}`);
+    const fits = inked && modified ? true : inked && Math.abs(k.dw) <= p.keylineTol + 1e-9 && Math.abs(k.dh) <= p.keylineTol + 1e-9;
+    if (inked && !modified && !fits) fail(failures, "keyline", name, `${r2(box.w)} × ${r2(box.h)}`, `${k.format} ${p.keylines[k.format].join(" × ")} ±${p.keylineTol}`);
     // gravity: the object's mass about its keyline's centre
     const dx = mass.dx + G / 2 - p.centre[0], dy = mass.dy + G / 2 - p.centre[1];
-    if (inked && (Math.abs(dx) > p.gravityTol || Math.abs(dy) > p.gravityTol)) fail(failures, "gravity", name, `mass ${r2(dx) >= 0 ? "+" : ""}${r2(dx)}, ${r2(dy) >= 0 ? "+" : ""}${r2(dy)}`, `within ±${p.gravityTol}`);
+    if (inked && !modified && (Math.abs(dx) > p.gravityTol || Math.abs(dy) > p.gravityTol)) fail(failures, "gravity", name, `mass ${r2(dx) >= 0 ? "+" : ""}${r2(dx)}, ${r2(dy) >= 0 ? "+" : ""}${r2(dy)}`, `within ±${p.gravityTol}`);
     // gap, between every pair of elements, and between the subpaths of one path: merged dots
     // are as "almost" as separate ones. Touching (a shared end, a crossing) passes.
     const gap = (A, B, a, b) => {
@@ -83,7 +92,8 @@
 
   // weight: a set of three or more against its own median and, looser, the reference, so a set
   // uniformly heavier than the finish fails; a set of one or two against the reference alone
-  const inks = measures.map((x) => x.m.ink).sort((a, b) => a - b);
+  const weighed = measures.filter((x) => !x.modified);
+  const inks = weighed.map((x) => x.m.ink).sort((a, b) => a - b);
   const own = inks.length >= 3;
   const mid = inks.length >> 1;
   const ref = referenceInk(G);
@@ -93,7 +103,7 @@
     const off = (ink - against) / against;
     if (Math.abs(off) > tol) fail(failures, "weight", name, `ink ${r2(ink)} (${off > 0 ? "+" : ""}${(off * 100).toFixed(1)}%)`, `within ±${pct(tol)}% of ${what} ${r2(against)}`);
   };
-  for (const { name, m } of measures) {
+  for (const { name, m } of weighed) {
     weigh(name, m.ink, median, p.weightTol, own ? "the set's median" : "the reference");
     if (own) weigh(name, m.ink, ref, p.referenceTol, "the reference");
   }
--- a/skills/pretty-icons/sheet.mjs
+++ b/skills/pretty-icons/sheet.mjs
@@ -36,7 +36,7 @@
 // What an element may carry onto a sheet: geometry and paint. Anything else
 // (data-*, aria-*, ids) is dropped, so no name reaches the blind sheet that way.
 const DRAW_ATTRS = new Set(["x", "y", "width", "height", "rx", "ry", "cx", "cy", "r", "x1", "y1", "x2", "y2", "d", "pathLength", "transform",
-  "fill", "fill-opacity", "fill-rule", "stroke", "stroke-width", "stroke-dasharray", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "display", "visibility"]);
+  "fill", "fill-opacity", "fill-rule", "stroke", "stroke-width", "stroke-opacity", "stroke-dasharray", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "display", "visibility"]);
 // Inherited paint the root may set beyond stroke-width, caps and joins.
 const ROOT_INHERITED = ["stroke-dasharray", "fill-rule", "stroke-miterlimit"];
 
```

- [ ] **Step 7: Run the test, then the suite**

Run: `rtk test node --test test/pretty-icons/modifiers.test.mjs`
Expected: 12 pass, 0 fail.

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: all pass (187), 0 fail.

- [ ] **Step 8: Try the CLI by hand**

Run: `rtk proxy node skills/pretty-icons/modifiers.mjs skills/pretty-icons/examples/hairline/data.svg --add badge:plus --print`
Expected: the icon with its body split into paint and a `data-cut="split"` contour, then `<path d="M10.75 12.5H14.25M12.5 10.75V14.25" data-modifier="badge:plus" stroke-opacity="0.6" />`, one element per line, no blank line.

- [ ] **Step 9: Commit**

```bash
rtk git add skills/pretty-icons/modifiers.mjs skills/pretty-icons/presets.mjs skills/pretty-icons/check.mjs skills/pretty-icons/filled.mjs skills/pretty-icons/measure.mjs skills/pretty-icons/sheet.mjs test/pretty-icons/modifiers.test.mjs
rtk git commit -m "feat: modifiers.mjs adds a state with a geometric knockout"
```

### Task 8: The proof sheet

**Files:**
- Create: `skills/pretty-icons/proof.mjs`
- Modify: `skills/pretty-icons/sheet.mjs` (`--proof`, `--only`; exports `place` and `defaultOut`)
- Test: `test/pretty-icons/proof.test.mjs`

**Interfaces:**
- Consumes: `readSet`, `setGrid` (`check.mjs`); `segments`, `joins`, `DISPLAY` (Task 2); `sampleParts` (`geometry.mjs`); `CORNERS`, `halo`, `isModifier`, `placement`, `slashEnds` (Task 7); `preset`, `PALETTE`; `png` (`raster.mjs`); `parse`; `place(s, G, x, y, size, colour)`, `defaultOut(folder)` (`sheet.mjs`, exported here).
- Produces: `VIEW = 192`, `CELL = 96`, `GAP`, `LABEL`, `PANEL`; `JOIN_COLOUR = { smooth: "#16a34a", corner: "#2563eb", kink: "#dc2626" }`; `REFERENCE`; `pixelSizes(G)`; `silhouette(s, G, size, ink)`; `construction(s, G)`; `panel(s, G, x, y)`; `referenceSet(G)`; `composeProof(set, G, { only })`; `writeProof(folder, { out, only, grid }) → path`. `sheet.mjs`'s `parseArgs` returns `{ folder, seed, out, proof, only }`, and `null` for `--only` without `--proof` or `--seed` with it. `node sheet.mjs <folder> --proof [--only <name>] [--out=<dir>]` prints the proof's path.

- [ ] **Step 1: Write the failing test**

The last two tests are Review Focus lines 4 (a folder with no icons) and 5 (an unreadable path).

Create `test/pretty-icons/proof.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { composeProof, construction, silhouette, pixelSizes, referenceSet, writeProof, JOIN_COLOUR, PANEL } from "../../skills/pretty-icons/proof.mjs";
import { parseArgs } from "../../skills/pretty-icons/sheet.mjs";
import { readSet } from "../../skills/pretty-icons/check.mjs";
import { addModifier } from "../../skills/pretty-icons/modifiers.mjs";

const examples = (set) => new URL(`../../skills/pretty-icons/examples/${set}/`, import.meta.url).pathname;
const sheetJs = new URL("../../skills/pretty-icons/sheet.mjs", import.meta.url).pathname;
const tmp = (t) => { const dir = mkdtempSync(join(tmpdir(), "proof-")); t.after(() => rmSync(dir, { recursive: true, force: true })); return dir; };
const svg48 = (body) => `<svg viewBox="0 0 48 48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">\n${body}\n</svg>`;

test("the pixels view shows the display sizes: 16, 24, 32 filled; the grid at 1× and 2× duotone", () => {
  assert.deepEqual(pixelSizes(48), [16, 24, 32]);
  assert.deepEqual(pixelSizes(16), [16, 32]);
  assert.deepEqual(pixelSizes(24), [24, 48]);
});

test("construction colours each join by its measure: a kink shows red", () => {
  const kinked = { name: "k", text: svg48('<path d="M8 24H28L37.85 25.74" />') };
  const o = construction(kinked, 48);
  assert.ok(o.includes(`fill="${JOIN_COLOUR.kink}"`));
  const square = { name: "s", text: svg48('<path d="M8 8H40V40H8Z" />') };
  assert.equal(construction(square, 48).split(`fill="${JOIN_COLOUR.corner}"`).length - 1, 4);
  // handles as hairlines: a cubic draws its two
  assert.match(construction({ name: "c", text: svg48('<path d="M8 24C8 14 14 8 24 8" />') }, 48), /<path d="M8,24L8,14M24,8L14,8"/);
});

test("construction draws a modifier's halo: a dashed circle for a badge, a band for a slash", async () => {
  const text = await addModifier(readSet(examples("hairline")).find((s) => s.name === "data").text, "badge:plus");
  assert.match(construction({ name: "d", text }, 16), /<circle [^>]*stroke="#9333ea"[^>]*stroke-dasharray/);
  const slashed = await addModifier(readSet(examples("hairline")).find((s) => s.name === "security").text, "slash");
  assert.match(construction({ name: "s", text: slashed }, 16), /<path d="M[\d.]+,[\d.]+L[\d.]+,[\d.]+" stroke="#9333ea" stroke-opacity=".15"/);
});

test("the silhouette paints every fill and stroke in one tone at full opacity", () => {
  const s = { name: "x", text: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="12" height="12" fill="currentColor" fill-opacity=".2" stroke="none" /><path d="M4 8H12" stroke-opacity="0.6" /></svg>` };
  const g = silhouette(s, 16, 16, "#25262a");
  assert.ok(!/opacity/.test(g), "no opacity left");
  assert.match(g, /<rect [^>]*fill="#25262a"/);
  assert.match(g, /stroke="none"/, "a stroke of none stays none");
});

test("the reference row is three icons of the finish's example; --only keeps one panel", () => {
  assert.deepEqual(referenceSet(48).map((s) => s.name), ["car", "traffic-light", "wrench"]);
  assert.deepEqual(referenceSet(16).map((s) => s.name), ["data", "devices", "security"]);
  const set = readSet(examples("garage"));
  const all = composeProof(set, 48), one = composeProof(set, 48, { only: "fuel" });
  assert.ok(all.includes('data-reference="row"'));
  assert.ok(one.includes(">fuel<") && !one.includes(">oil<"));
  assert.ok(Number(/height="(\d+)"/.exec(one)[1]) < Number(/height="(\d+)"/.exec(all)[1]));
  assert.ok(Number(/width="(\d+)"/.exec(all)[1]) >= PANEL.w * 3);
  assert.throws(() => composeProof(set, 48, { only: "nope" }), /--only nope: no such icon; the set has battery, car/);
});

test("the proof is drawn for a set that fails check: a kink is what it is for", (t) => {
  const dir = tmp(t), set = join(dir, "pretty-icons");
  mkdirSync(set);
  writeFileSync(join(set, "kinked.svg"), svg48('<path d="M8 24H28L37.85 25.74" />'));
  const file = writeProof(set, { out: join(dir, "out") });
  assert.ok(existsSync(file) && file.endsWith("pretty-icons-proof.png"));
});

test("CLI: --proof writes the proof and prints its path; --only needs --proof; --seed is not the proof's", (t) => {
  assert.deepEqual(parseArgs(["f", "--proof", "--only", "car"]), { folder: "f", seed: undefined, out: undefined, proof: true, only: "car" });
  assert.deepEqual(parseArgs(["f", "--proof", "--only=car", "--out=o"]), { folder: "f", seed: undefined, out: "o", proof: true, only: "car" });
  assert.equal(parseArgs(["f", "--only", "car"]), null);
  assert.equal(parseArgs(["f", "--proof", "--seed=3"]), null);
  assert.equal(parseArgs(["f", "--proof", "--only"]), null);
  const out = tmp(t);
  const r = spawnSync(process.execPath, [sheetJs, examples("garage"), "--proof", "--only", "car", `--out=${out}`], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout.trim(), join(out, "pretty-icons-proof.png"));
  const no = spawnSync(process.execPath, [sheetJs, examples("garage"), "--proof", "--only", "nope", `--out=${out}`], { encoding: "utf8" });
  assert.equal(no.status, 1);
  assert.match(no.stderr, /--only nope: no such icon/);
});

test("--proof on a folder with no icons says so on stderr and exits 1, without a stack", (t) => {
  const dir = tmp(t);
  const r = spawnSync(process.execPath, [sheetJs, dir, "--proof", `--out=${dir}`], { encoding: "utf8" });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /no \.svg files/);
  assert.doesNotMatch(r.stderr, /at .*\.mjs:\d+/);
});

test("a path the reader cannot read is left out of construction, and the proof is still drawn", (t) => {
  const bad = { name: "bad", text: svg48('<path d="M8 24H28B" /><path d="M8 8H40V40H8Z" />') };
  assert.equal(construction(bad, 48).split(`fill="${JOIN_COLOUR.corner}"`).length - 1, 4);
  const dir = tmp(t), set = join(dir, "pretty-icons");
  mkdirSync(set);
  writeFileSync(join(set, "bad.svg"), bad.text);
  assert.ok(existsSync(writeProof(set, { out: join(dir, "out") })));
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `rtk test node --test test/pretty-icons/proof.test.mjs`
Expected: FAIL, `Cannot find module '.../skills/pretty-icons/proof.mjs'`.

- [ ] **Step 3: Give `sheet.mjs` the flags and the exports the proof needs**

Save this diff as `/tmp/t8-sheet.patch` and apply it from the repo root with `rtk git apply /tmp/t8-sheet.patch`:

```diff
--- a/skills/pretty-icons/sheet.mjs
+++ b/skills/pretty-icons/sheet.mjs
@@ -1,6 +1,7 @@
 #!/usr/bin/env node
 /**
- * Two sheets for a set that passes check.mjs: `node sheet.mjs <folder>`.
+ * Two sheets for a set that passes check.mjs: `node sheet.mjs <folder>`. With `--proof [--only <name>]`,
+ * the proof sheet instead, pass or fail (proof.mjs): construction, finish, silhouette and pixels per icon.
  *   pretty-icons-sheet.png   for the author: the set in rows at 1× and 2×, light and dark (and on grey at the filled finish),
  *                            then a tile per icon with its ink box (solid) over the keyline it matched (dashed)
  *   pretty-icons-blind.png   for the reader: icons only, 2×, shuffled and numbered
@@ -48,7 +49,7 @@
  * `color` (and png() would otherwise turn it black). A colour written in
  * the file (the filled finish's ink and palette) stays as written.
  */
-function place(s, G, x, y, size, colour) {
+export function place(s, G, x, y, size, colour) {
   const { attrs: root, elements } = parse(s.text);
   const paint = (v) => escAttr(String(v).replace(/currentColor/gi, colour));
   const inner = elements.map((el) => `<${el.tag}${Object.entries(el.attrs).filter(([k]) => DRAW_ATTRS.has(k)).map(([k, v]) => ` ${k}="${paint(v)}"`).join("")} />`).join("");
@@ -150,25 +151,35 @@
   return { sheet, blind, key: b.key, seed };
 }
 
-const USAGE = "usage: node sheet.mjs <folder> [--seed=<n>] [--out=<dir>]";
+const USAGE = "usage: node sheet.mjs <folder> [--seed=<n>] [--out=<dir>] | node sheet.mjs <folder> --proof [--only <name>] [--out=<dir>]";
 
-/** The folder, seed and out from argv, or null when anything in it is not one of those. */
+/** The folder, seed and out from argv, and --proof with its --only; null when anything in it is not one of those. */
 export function parseArgs(argv) {
   const r = { folder: undefined, seed: undefined, out: undefined };
-  for (const a of argv) {
+  for (let i = 0; i < argv.length; i++) {
+    const a = argv[i];
     if (!a.startsWith("--")) { if (r.folder !== undefined) return null; r.folder = a; continue; }
-    const m = /^--(seed|out)=(.+)$/.exec(a);
+    if (a === "--proof") { if (r.proof) return null; r.proof = true; continue; }
+    if (a === "--only") { const v = argv[++i]; if (v === undefined || v.startsWith("--") || r.only !== undefined) return null; r.only = v; continue; }
+    const m = /^--(seed|out|only)=(.+)$/.exec(a);
     if (!m || r[m[1]] !== undefined) return null;
     if (m[1] === "seed" && !/^\d+$/.test(m[2])) return null;
     r[m[1]] = m[1] === "seed" ? Number(m[2]) : m[2];
   }
-  return r.folder === undefined ? null : r;
+  // --only is for the proof; --seed shuffles the blind sheet, which the proof does not draw
+  if (r.folder === undefined || (r.only !== undefined && !r.proof) || (r.proof && r.seed !== undefined)) return null;
+  return r;
 }
 
 export async function main(argv) {
   const args = parseArgs(argv);
   if (!args) { console.error(USAGE); process.exit(1); }
   try {
+    if (args.proof) {
+      const { writeProof } = await import("./proof.mjs");
+      console.log(writeProof(args.folder, { out: args.out, only: args.only }));
+      return;
+    }
     const r = await writeSheets(args.folder, { out: args.out, seed: args.seed });
     console.log(r.sheet); console.log(r.blind);
     console.log("key: " + r.key.map((k) => `${k.n} ${k.name}`).join(" · "));
```

- [ ] **Step 4: Write `proof.mjs`**

Create `skills/pretty-icons/proof.mjs`:

```js
/**
 * The proof sheet, for the author while drawing: `node sheet.mjs <folder> --proof [--only <name>]`.
 * One panel per icon, four views side by side:
 *   construction  the icon over its keyline (dashed), anchors as dots, handles as hairlines, each join
 *                 coloured by its measure (smooth green, corner blue, kink red), a modifier's halo dashed
 *   finish        the icon clean, on the finish's own background
 *   silhouette    everything in the line tone at 16 and 24 px, scaled up without smoothing: the object
 *                 must be nameable from its mass alone
 *   pixels        the icon at its display sizes (16, 24, 32 filled; the grid at 1× and 2× duotone),
 *                 scaled up without smoothing, so the grey edge rows of the pixel note show
 * The first row is the reference row: three icons of the finish's example in the same four views.
 * It never reaches the blind sheet. The proof is drawn whether or not the set passes check.mjs:
 * a kink is what it is for.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readSet, setGrid } from "./check.mjs";
import { segments, joins, DISPLAY } from "./curve.mjs";
import { sampleParts } from "./geometry.mjs";
import { CORNERS, halo, isModifier, placement, slashEnds } from "./modifiers.mjs";
import { preset, PALETTE } from "./presets.mjs";
import { png } from "./raster.mjs";
import { parse } from "./svg.mjs";
import { place, defaultOut } from "./sheet.mjs";

const FONT = `font-family="system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"`;
/** Each view is VIEW px square; the small renders sit in CELL px squares, two to a column. */
export const VIEW = 192, CELL = 96, GAP = 16, LABEL = 28;
export const PANEL = { w: VIEW * 3 + CELL + GAP * 3, h: VIEW + LABEL };
export const JOIN_COLOUR = { smooth: "#16a34a", corner: "#2563eb", kink: "#dc2626" };
export const REFERENCE = { duotone: ["hairline", ["data", "devices", "security"]], filled: ["garage", ["car", "traffic-light", "wrench"]] };
const SKILL = dirname(fileURLToPath(import.meta.url));
const BG = { duotone: { bg: "#fafafa", ink: "#737373" }, filled: { bg: "#edeeee", ink: PALETTE.line } };

/** The sizes the pixels view shows: 16, 24 and 32 for the filled grid, the grid at 1× and 2× in duotone. */
export const pixelSizes = (G) => DISPLAY[G] ?? [16, 24, 32];

const b64 = (bytes) => `data:image/png;base64,${Buffer.from(bytes).toString("base64")}`;

/** The icon rendered at `size` px, then drawn `cell` px wide without smoothing, centred in a cell at x, y. */
function pixelated(s, G, size, x, y, cell, { bg, ink, solid = false }) {
  const k = Math.max(1, Math.floor(cell / size)), w = size * k, off = (cell - w) / 2;
  const icon = solid ? silhouette(s, G, size, ink) : place(s, G, 0, 0, size, ink);
  const small = png(`<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="${bg}" />${icon}</svg>`, size);
  return `<image x="${x + off}" y="${y + off}" width="${w}" height="${w}" image-rendering="optimizeSpeed" href="${b64(small)}" />`
    + `<text x="${x + 4}" y="${y + cell - 4}" ${FONT} font-size="10" fill="#737373">${size}</text>`;
}

/** Every fill and stroke in one tone, at full opacity: the icon's mass alone. */
export function silhouette(s, G, size, ink) {
  const flat = s.text
    .replace(/\s(fill|stroke)-opacity="[^"]*"/g, "")
    .replace(/\s(fill|stroke)="(?!none")[^"]*"/g, (m, k) => ` ${k}="${ink}"`);
  return place({ ...s, text: flat }, G, 0, 0, size, ink);
}

/** The construction overlay in canvas units: anchors, handles, joins coloured by kind, a modifier's halo. */
export function construction(s, G) {
  const parsed = parse(s.text), u = 1 / (VIEW / G), out = [];
  const dot = (p, r, fill) => `<circle cx="${p[0]}" cy="${p[1]}" r="${r * u}" fill="${fill}" stroke="none" />`;
  for (const el of parsed.elements) {
    if (el.tag !== "path" || !el.attrs.d) continue;
    let subs;
    try { subs = segments(el.attrs.d); } catch { continue; }
    for (const sub of subs) for (const seg of sub.segs) {
      if (seg.kind === "cubic") {
        const [p0, c1, c2, p3] = seg.p;
        out.push(`<path d="M${p0}L${c1}M${p3}L${c2}" stroke="#a3a3a3" stroke-width="${u}" fill="none" />`, dot(c1, 2, "#a3a3a3"), dot(c2, 2, "#a3a3a3"));
      }
      out.push(dot(seg.p[0], 2.5, "#525252"));
    }
    for (const sub of subs) if (!sub.closed && sub.segs.length) out.push(dot(sub.segs.at(-1).p.at(-1), 2.5, "#525252"));
    for (const j of joins(el.attrs.d)) out.push(dot(j.at, 4, JOIN_COLOUR[j.kind]));
  }
  const mods = parsed.elements.filter(isModifier);
  if (mods.length) {
    const kind = mods[0].attrs["data-modifier"];
    try {
      const pts = mods.flatMap((el) => sampleParts(el, 0.1).flat());
      const mid = [(Math.min(...pts.map((q) => q[0])) + Math.max(...pts.map((q) => q[0]))) / 2, (Math.min(...pts.map((q) => q[1])) + Math.max(...pts.map((q) => q[1]))) / 2];
      const corner = kind === "slash" ? "br" : CORNERS.reduce((a, b) => (Math.hypot(...placement(G, kind, a).c.map((v, i) => v - mid[i])) <= Math.hypot(...placement(G, kind, b).c.map((v, i) => v - mid[i])) ? a : b));
      const H = halo(G, kind, corner);
      if (kind === "slash") { const [a, b] = slashEnds(G); out.push(`<path d="M${a}L${b}" stroke="#9333ea" stroke-opacity=".15" stroke-width="${2 * H.r}" stroke-linecap="round" fill="none" />`); }
      else out.push(`<circle cx="${H.c[0]}" cy="${H.c[1]}" r="${H.r}" fill="none" stroke="#9333ea" stroke-width="${u}" stroke-dasharray="${4 * u} ${3 * u}" />`);
    } catch { /* an unknown kind: check.mjs names it */ }
  }
  return out.join("");
}

/** One icon's panel: its name, then construction, finish, silhouette and pixels, at x, y. */
export function panel(s, G, x, y) {
  const finish = preset(G).finish, { bg, ink } = BG[finish], scale = VIEW / G, top = y + LABEL;
  const { keylines, centre: [cx, cy] } = preset(G);
  let out = `<text x="${x}" y="${y + 18}" ${FONT} font-size="14" fill="#171717">${String(s.name).replace(/[&<>]/g, "")}</text>`;
  // construction: a pale icon under the overlay, the keylines dashed
  out += `<rect x="${x}" y="${top}" width="${VIEW}" height="${VIEW}" fill="#fff" stroke="#e5e5e5" />`;
  out += `<g opacity=".45">${place(s, G, x, top, VIEW, ink)}</g>`;
  out += `<g transform="translate(${x} ${top}) scale(${scale})">`;
  for (const [kw, kh] of Object.values(keylines)) out += `<rect x="${cx - kw / 2}" y="${cy - kh / 2}" width="${kw}" height="${kh}" fill="none" stroke="#93c5fd" stroke-width="${1 / scale}" stroke-dasharray="${3 / scale} ${3 / scale}" />`;
  out += construction(s, G) + "</g>";
  // finish
  const fx = x + VIEW + GAP;
  out += `<rect x="${fx}" y="${top}" width="${VIEW}" height="${VIEW}" fill="${bg}" />` + place(s, G, fx, top, VIEW, ink);
  // silhouette at 16 and 24
  const sx = fx + VIEW + GAP;
  out += pixelated(s, G, 16, sx, top, CELL, { bg: "#fff", ink: PALETTE.line, solid: true });
  out += pixelated(s, G, 24, sx, top + CELL, CELL, { bg: "#fff", ink: PALETTE.line, solid: true });
  // pixels: two to a column, a second column when there are three
  const px = sx + CELL + GAP;
  out += `<rect x="${px}" y="${top}" width="${VIEW}" height="${VIEW}" fill="${bg}" />`;
  pixelSizes(G).forEach((size, i) => { out += pixelated(s, G, size, px + Math.floor(i / 2) * CELL, top + (i % 2) * CELL, CELL, { bg, ink }); });
  return out;
}

/** The reference icons of a grid's finish, read from the skill's examples. */
export function referenceSet(G) {
  const [folder, names] = REFERENCE[preset(G).finish];
  return readSet(join(SKILL, "examples", folder)).filter((s) => names.includes(s.name));
}

/**
 * The proof as SVG: the reference row, a rule, then the set's panels, three to a row.
 * `only` keeps one icon, by name; an unknown name is an error that lists the names.
 */
export function composeProof(set, G, { only } = {}) {
  const icons = only === undefined ? set : set.filter((s) => s.name === only);
  if (!icons.length) throw new Error(`--only ${only}: no such icon; the set has ${set.map((s) => s.name).join(", ")}`);
  const refs = referenceSet(G), perRow = 3, pitchX = PANEL.w + 32, pitchY = PANEL.h + 24, left = 24;
  const rows = Math.ceil(icons.length / perRow), W = left * 2 + perRow * pitchX - 32, refH = 24 + pitchY;
  const H = 24 + refH + 24 + rows * pitchY + 24;
  let out = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#fff" />`;
  out += `<g data-reference="row"><rect x="${left - 12}" y="12" width="${W - 2 * left + 24}" height="${refH}" rx="8" fill="#f5f5f4" />`;
  out += `<text x="${left}" y="34" ${FONT} font-size="12" fill="#737373">reference: examples/${REFERENCE[preset(G).finish][0]}</text>`;
  refs.forEach((s, i) => { out += panel(s, G, left + i * pitchX, 44); });
  out += "</g>";
  const y0 = 24 + refH + 24;
  icons.forEach((s, i) => { out += panel(s, G, left + (i % perRow) * pitchX, y0 + Math.floor(i / perRow) * pitchY); });
  return out + "</svg>";
}

/** Writes pretty-icons-proof.png beside the other two sheets and returns its path. */
export function writeProof(folder, { out, only, grid } = {}) {
  const dir = resolve(folder), dest = out ? resolve(out) : defaultOut(dir), set = readSet(dir);
  if (!set.length) throw new Error(`${folder}: no .svg files`);
  const G = setGrid(set, grid);
  const svg = composeProof(set, G, { only });
  mkdirSync(dest, { recursive: true });
  const file = join(dest, "pretty-icons-proof.png");
  writeFileSync(file, png(svg, Number(/width="(\d+)"/.exec(svg)[1])));
  return file;
}
```

- [ ] **Step 5: Run the test, then the suite**

Run: `rtk test node --test test/pretty-icons/proof.test.mjs`
Expected: 9 pass, 0 fail.

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: all pass (196), 0 fail.

- [ ] **Step 6: Look at a proof**

Run: `rtk proxy node skills/pretty-icons/sheet.mjs skills/pretty-icons/examples/garage --proof --only car`
Expected: one line, the path of `pretty-icons-proof.png`.


Open it with the Read tool. Check four things: the reference row is on top; car's panel shows construction, finish, silhouette and pixels; its joins are green or blue; no red shows.

- [ ] **Step 7: Commit**

```bash
rtk git add skills/pretty-icons/proof.mjs skills/pretty-icons/sheet.mjs test/pretty-icons/proof.test.mjs
rtk git commit -m "feat: sheet.mjs --proof draws construction, silhouette and pixels per icon"
```

### Task 9: The docs teach the kit, the gesture, the modifiers and the craft read

**Files:**
- Modify: `skills/pretty-icons/rules.md` (03, 04, 08, 09), `skills/pretty-icons/rules-filled.md` (04: the croissant), `skills/pretty-icons/read.md` (the craft read), `skills/pretty-icons/SKILL.md` (step 3 the loop, step 4 the craft read, step 5, "What goes wrong")
- Test: `test/pretty-icons/docs.test.mjs`

**Interfaces:**
- Consumes: every message the code prints, through `textChecks` and `addModifier`, so the docs quote real lines; `shape("blob", …)` for the croissant.
- Produces: the prose Tasks 10 to 13 follow. The craft prompt in `read.md` is the one Task 12 and Task 13 give their readers, word for word.

- [ ] **Step 1: Write the failing test**

Create `test/pretty-icons/docs.test.mjs`:

````js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkSet, textChecks } from "../../skills/pretty-icons/check.mjs";
import { shape } from "../../skills/pretty-icons/shapes.mjs";
import { addModifier } from "../../skills/pretty-icons/modifiers.mjs";

const doc = (f) => readFileSync(new URL(`../../skills/pretty-icons/${f}`, import.meta.url), "utf8");
const svgBlocks = (text) => text.split("```svg\n").slice(1).map((s) => s.split("\n```")[0]);
const line = (f) => `${f.rule}  ${f.icon}  ${f.got} → ${f.want}`;
const svg16 = (b) => `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${b}</svg>`;
const BODY16 = '<rect x="1.75" y="1.75" width="12.5" height="12.5" rx="1.5" fill="currentColor" fill-opacity=".2" />';

test("rules-filled.md: the croissant is the kit's blob pasted, and passes check on its own", async (t) => {
  const { d } = shape("blob", { anchors: "12,39,c 5,25.5 24,8.5 43,25.5 36,39,c 24,30" });
  const croissant = svgBlocks(doc("rules-filled.md")).find((s) => s.includes(d));
  assert.ok(croissant, "rules-filled.md gives the blob's d in an svg block");
  const dir = mkdtempSync(join(tmpdir(), "croissant-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  writeFileSync(join(dir, "croissant.svg"), croissant + "\n");
  const r = await checkSet(dir);
  assert.equal(r.measured, true);
  assert.deepEqual(r.failures.map(line), []);
  assert.equal(r.rows[0].ink.toFixed(1), "279.6");
});

test("rules.md quotes the messages check.mjs prints for the new rules", async () => {
  const rules = doc("rules.md");
  const stray = textChecks("data", svg16(`${BODY16}<path d="M4.75 5.5H11.25" stroke-opacity="0.6" />`), 16).failures.map(line);
  const good = await addModifier(svg16(BODY16), "badge:plus");
  const wrong = textChecks("data", good.replace('stroke-opacity="0.6"', 'stroke-opacity="0.5"'), 16).failures.map(line);
  const halo = textChecks("data", svg16(`${BODY16}<path d="M10.75 12.5H14.25M12.5 10.75V14.25" stroke-opacity="0.6" data-modifier="badge:plus" />`), 16).failures.map(line);
  for (const l of [...stray, ...wrong, ...halo]) assert.ok(rules.includes(`\`${l}\``), `rules.md quotes ${l}`);
  assert.ok(rules.includes("→ under 4° or over 30°: smooth, or a corner on purpose`"));
  assert.ok(rules.includes("→ at most 1, none under a chord of 4`"));
});

test("rules.md 09: the gesture catalogue and the modifiers", () => {
  const rules = doc("rules.md");
  for (const g of ["seam", "dot pair", "tuft", "steam", "paper sheen", "lean"]) assert.match(rules, new RegExp(`\\| \\*\\*${g}\\*\\* \\|`), g);
  for (const k of ["badge:plus", "badge:minus", "badge:check", "badge:x", "slash", "lock", "dot", "arrow:up", "arrow:right", "arrow:down", "arrow:left"]) assert.ok(rules.includes(`\`${k}\``), k);
});

test("read.md: the craft read, its prompt, and the words for no reader", () => {
  const read = doc("read.md");
  assert.ok(read.includes("## The craft read"));
  assert.ok(read.includes("> These N icons are from one app. For each number, in five words or fewer, name one drawing defect if you see one: a kink in a curve, a wobbly curve, uneven weight, a part floating off the body, a confused silhouette, a detail too small to read. Say \"none\" when you see no defect. Then name the three weakest and why."));
  assert.ok(read.includes("**not read for craft**"));
});

test("SKILL.md: the loop composes with the kit, checks, and looks at the proof", () => {
  const skill = doc("SKILL.md");
  for (const s of ["shapes.mjs <primitive>", "shapes.mjs --from", "--proof --only <name>", "modifiers.mjs", "Do the craft read", "**not read for craft**"]) assert.ok(skill.includes(s), s);
});
````

- [ ] **Step 2: Run it to see it fail**

Run: `rtk test node --test test/pretty-icons/docs.test.mjs`
Expected: 5 fail: no croissant block in `rules-filled.md`, no quoted modifier lines in `rules.md`, no gesture table, no craft read, no loop in `SKILL.md`.

- [ ] **Step 3: Edit the four docs**

Save this diff as `/tmp/t9-docs.patch` and apply it from the repo root with `rtk git apply /tmp/t9-docs.patch`:

````diff
--- a/skills/pretty-icons/SKILL.md
+++ b/skills/pretty-icons/SKILL.md
@@ -29,15 +29,25 @@
 
 `node <skill-dir>/sheet.mjs <skill-dir>/examples/hairline` (duotone) or `<skill-dir>/examples/garage` (filled) and look at the sheet: that is the finish. Draw your own objects at that finish (rule 09).
 
-Read `rules.md` first; for the filled finish, then `rules-filled.md`, which says where each rule reads differently at 48 and gives the tones, the radii, the bodies and a worked traffic light. Write one file per icon, `pretty-icons/<name>.svg`, from its root. Start every body from the bodies table. Use only `rect`, `circle`, `line` and short `path`s. At the filled finish, draw each body as tone, shade, contour: the contour is the tone's geometry pasted, never redrawn.
+Read `rules.md` first; for the filled finish, then `rules-filled.md`, which says where each rule reads differently at 48 and gives the tones, the radii, the bodies and a worked traffic light. Write one file per icon, `pretty-icons/<name>.svg`, from its root. Start every body from the bodies table or the kit. Use only `rect`, `circle`, `line` and short `path`s. At the filled finish, draw each body as tone, shade, contour: the contour is the tone's geometry pasted, never redrawn.
 
+The kit is the normal way to draw a curved body; a hand-written path is the exception (rule 04). Draw each icon in a loop:
+
+1. Compose. `node <skill-dir>/shapes.mjs <primitive> --grid <grid> --w <w> --h <h> --at <x>,<y>` prints the body; paste it into the file, then add the details and the one gesture (rule 09) by hand.
+2. `node <skill-dir>/check.mjs pretty-icons/`. Fix each line by its rule. After a hand edit kinks a curve, `node <skill-dir>/shapes.mjs --from pretty-icons/<name>.svg` repairs it.
+3. `node <skill-dir>/sheet.mjs pretty-icons/ --proof --only <name>` writes `pretty-icons-proof.png` and prints its path. Look at it: the construction (anchors, handles, every join coloured, green smooth, blue a corner, red a kink), the finish, the silhouette at 16 and 24, the pixels at display size, under a reference row from the examples.
+4. Adjust and go back to 2, until no join is red, the silhouette alone names the object, and the icon sits with the reference row.
+
+A state (add, off, locked, new) is the base icon plus `node <skill-dir>/modifiers.mjs pretty-icons/<name>.svg --add <kind>`, run once the base passes (rule 09).
+
 ## 4. Check
 
 1. `node <skill-dir>/check.mjs pretty-icons/`. Fix each line by its rule until it prints `ok`. The first run installs `@resvg/resvg-js` into a cache (`PRETTY_ICONS_CACHE` moves it).
 2. `node <skill-dir>/sheet.mjs pretty-icons/`. It writes `pretty-icons-sheet.png` and `pretty-icons-blind.png` to a temp folder of this set's own (`--out=<dir>` moves them) and prints their paths and the key. Never put them in the app. Look at the sheet.
 3. Do the blind read in `read.md`. A failure goes back to step 3, then all of step 4, with a new reader.
+4. Do the craft read in `read.md`, with another new reader, once the blind read passes. A named defect goes back to step 3, then all of step 4.
 
-On exit 2, sheet and emit refuse; without Node, answer the text checks atop `check.mjs` by hand. Either way, deliver the `.svg` files; say `not measured` and **not read blind**.
+On exit 2, sheet and emit refuse; without Node, answer the text checks atop `check.mjs` by hand. Either way, deliver the `.svg` files; say `not measured`, **not read blind** and **not read for craft**.
 
 ## 5. Hand over
 
@@ -45,8 +55,9 @@
 
 - the finish and the preset;
 - the reader's result: which failed first, what changed, any you could not redraw;
+- the craft reader's result: the defects named, the three weakest and why; or **not read for craft**;
 - the names handed back: they need the brands' own marks (rule 09);
-- anything not measured or not read blind.
+- anything not measured, not read blind or not read for craft.
 
 ## 6. Adjust
 
@@ -62,7 +73,10 @@
 | placing a detail a little away from the body so they "don't merge" | rule 08: a stroke apart, or touching on the centreline; nothing between |
 | adding a fourth element to make the metaphor clearer | rule 09: three at most; if it needs a fourth, the metaphor is wrong |
 | drawing a badge, initials, a logo or a bare `</>` | rule 09: draw the thing the name means; braces only, in a body |
-| adding a chimney, a shine, steam or a fold | rule 09: one accent per body |
+| adding a chimney, a shine, steam or a fold | rule 09: one accent per body, drawn as one gesture from the catalogue |
+| writing a cubic by hand for a curved body | rule 04: take it from `shapes.mjs`; `--from` repairs a kink |
+| drawing a plus, a slash or a lock onto an icon | rule 09: `modifiers.mjs --add`, which cuts its halo out of the base |
+| looking at the icons only on the finished sheet | step 3: `sheet.mjs --proof --only <name>` after every check |
 | drawing a hexagon, cut gem or stepped body | rule 04: a rect, circle, triangle, house or curved outline |
 | reading the sheet yourself and calling it read | `read.md`: a second agent, or say "not read blind" |
 | drawing cells, nodes or rows as separate elements | rule 09: one path, eight commands at most |
--- a/skills/pretty-icons/read.md
+++ b/skills/pretty-icons/read.md
@@ -32,6 +32,14 @@
 
 An icon fails, whatever name the reader gave, when the reader says it got its name by elimination, or names an object that is neither the one you declared nor one that means the name: a credit card for interfaces, generic shapes for marks, a loading spinner for settings. Look for it in the five words the reader gives for the object. Redraw it. When you cannot, name it in the hand-over with what the reader saw.
 
+## The craft read
+
+The blind read proves each icon names its object. It cannot say one is drawn badly. After the blind read passes, open another fresh agent, one that has seen neither your work nor the first reader's answers. Give it `pretty-icons-sheet.png`, which numbers the icons and has no reference row, and this prompt, with N filled in:
+
+> These N icons are from one app. For each number, in five words or fewer, name one drawing defect if you see one: a kink in a curve, a wobbly curve, uneven weight, a part floating off the body, a confused silhouette, a detail too small to read. Say "none" when you see no defect. Then name the three weakest and why.
+
+An icon fails when the reader names a defect from that list for it. An icon among the three weakest with no defect named passes; say it in the hand-over with the reader's reason. A failed icon goes back to the drawing (`SKILL.md` step 3), then the whole set runs `check.mjs`, `sheet.mjs`, the blind read and the craft read again, each with a **new** reader.
+
 ## Without a second agent
 
-Say so in the hand-over, in these words: **not read blind**. Do not read the sheet yourself and call it read.
+Say so in the hand-over, in these words: **not read blind** and **not read for craft**. Do not read the sheet yourself and call it read.
--- a/skills/pretty-icons/rules-filled.md
+++ b/skills/pretty-icons/rules-filled.md
@@ -106,6 +106,18 @@
 
 Tone, shade, contour, in that order, for every body; at least one body in the fill tone. The contour is the tone's geometry pasted, not redrawn: `check.mjs` matches them. A shade is the lower or right part of its body, its edges on the body's outline, so the contour covers its seam. A body's contour is a rect, a circle, or a path of at most five straight sides; curves between them are free, so round a notched outline's corners with arcs rather than adding sides (`rules.md` 04).
 
+- **Keep it, for an organic body** (bread, a fruit, a leaf, a drop): take it from the kit. `node <skill-dir>/shapes.mjs <primitive> --w 40 --h 32` prints the three elements, tone, shade and contour, the contour at 2. The shade is the outline's own stretch from one anchor to another, closed by a seam (`--shade right|lower|none`, `--seam straight|curved`), so the contour covers it. Then add the one gesture (`rules.md` 09) by hand. The croissant, on the landscape keyline, is `node <skill-dir>/shapes.mjs blob --anchors "12,39,c 5,25.5 24,8.5 43,25.5 36,39,c 24,30"` pasted, and two seams for its folds:
+
+```svg
+<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
+  <path d="M12 39C11.5 33 5 31.5 5 25.5C5 15.5 14 8.5 24 8.5C34 8.5 43 15.5 43 25.5C43 31.5 36.5 33 36 39C33 34 29.75 30 24 30C18.25 30 15 34 12 39Z" fill="#ececea" stroke="none" />
+  <path d="M24 8.5C34 8.5 43 15.5 43 25.5C43 31.5 36.5 33 36 39Z" fill="#cfcfcb" stroke="none" />
+  <path d="M12 39C11.5 33 5 31.5 5 25.5C5 15.5 14 8.5 24 8.5C34 8.5 43 15.5 43 25.5C43 31.5 36.5 33 36 39C33 34 29.75 30 24 30C18.25 30 15 34 12 39Z" stroke-width="2" />
+  <path d="M16.5 14.5C18.75 19.5 19.25 23.5 18.5 27.5M31.5 14.5C29.25 19.5 28.75 23.5 29.5 27.5" />
+</svg>
+```
+
+Its horns are the two cusps (`c`), and they turn in: a crescent whose horns point straight down reads as a bell. The seams stop clear of the contour, 3 from its centreline, so they do not touch it by almost (08). Its ink is 40 × 32.5, its mass 1.5 high, its line ink 279.6.
 - **Keep it, for a tube** (a spoke, a rim, a gear stick): a bar at 3.5 in the line, then the same `d` with `stroke` the fill or the shade tone and no width. The core cuts the bar into two thin lines. A ring as a tube: `circle r 18.25 stroke-width 3.5`, then the circle again with `stroke="#cfcfcb"`.
 - **Keep it, for a solid small part:** a wheel, a terminal, a lamp that is on: a shape filled with the line tone. Glass and a hole: paper.
 - **Keep it, for what is printed:** ticks and treads in the mark tone, at the root's width.
--- a/skills/pretty-icons/rules.md
+++ b/skills/pretty-icons/rules.md
@@ -54,11 +54,12 @@
 
 ## 03 · stroke: one stroke, set once
 
-One width from the preset, round caps and joins, `currentColor`. The root sets them once. Nothing else in the file sets a colour, a width or an opacity, except a body's 0.2 fill.
+One width from the preset, round caps and joins, `currentColor`. The root sets them once. Nothing else in the file sets a colour, a width or an opacity, except a body's 0.2 fill and a modifier's 0.6.
 
-- **Keep it:** copy the root above, with your grid's stroke. An element carries only its geometry. A body adds `fill="currentColor" fill-opacity=".2"`. A dashed outline adds `stroke-dasharray="a b"`, with a and b each at least the stroke. Leave out `style`, `class`, `id`, `transform`, `opacity`, `stroke-opacity`, `filter`, `mask`, `clip-path`, `stroke-dashoffset`, `vector-effect` and `paint-order`.
+- **Keep it:** copy the root above, with your grid's stroke. An element carries only its geometry. A body adds `fill="currentColor" fill-opacity=".2"`. A dashed outline adds `stroke-dasharray="a b"`, with a and b each at least the stroke. Leave out `style`, `class`, `id`, `transform`, `opacity`, `stroke-opacity` (a modifier's excepted, below), `filter`, `mask`, `clip-path`, `stroke-dashoffset`, `vector-effect` and `paint-order`.
 - **Keep it, for a dash:** round caps eat the gap. The visible gap is the dasharray's gap less one stroke. `check.mjs` rejects only a dash or gap below one stroke; by eye, keep the visible gap at least one stroke, so the dasharray's gap is at least twice the stroke: 3 on 16 and 20, 4 on 24. `2 3` on 16 shows gaps of 1.5. `examples/hairline/empty.svg` is below this bar: its `3.5 2` leaves a visible gap of 0.5.
-- **Rejected when:** `check.mjs` prints `stroke`: `stroke  machines  stroke-width 2 → 1.5`, `stroke  machines  rect@2 stroke-dasharray 1 1 → dash and gap ≥ 1.5`.
+- **Keep it, for a modifier:** its elements, and only they, carry `stroke-opacity="0.6"`: one colour, one more opacity, as the 0.2 fill is. `modifiers.mjs` writes it (rule 09); `--solid` leaves it out. At 48 a modifier has none.
+- **Rejected when:** `check.mjs` prints `stroke`: `stroke  machines  stroke-width 2 → 1.5`, `stroke  machines  rect@2 stroke-dasharray 1 1 → dash and gap ≥ 1.5`, an opacity off a modifier `stroke  data  path#2@1 stroke-opacity → not set`. Or `modifier`, for a modifier's own: `modifier  data  path@4 stroke-opacity 0.5 → 0.6, or not set (--solid)`.
 
 ## 04 · construction: a body is a contour and a fill
 
@@ -66,12 +67,17 @@
 
 A body's contour is a rect, a circle, a path of at most five straight sides (a triangle, a house), or a path shaped by curves. A filled path with more than five straight sides is faceted: a hexagon, stepped blocks, a cut stone. Faceted bodies read as geometry, not as the object. Five is as many as one outline needs, a house's walls and its roof. A gem is still a triangle pointing down, not a cut stone: a 5-sided gem passes the check, but it reads as geometry. Every L, H and V counts as a side, implicit repeats included, and so does a `Z` that closes with a segment of its own. The shield in `examples/hairline/security.svg` has four straight sides and two curves, and passes. An unfilled path is a detail and is not counted.
 
+Curves flow or corner, never kink. Where two segments meet, the tangent arriving and the tangent leaving are under 4° apart (smooth) or over 30° (a corner on purpose); between them is a kink, a curve that bends where it should flow. A cubic bends one way, or changes side once; twice is a wobble, and a segment whose chord is under 4 bends one way only. A hand-written cubic kinks because its two handles are not on one line through the anchor.
+
 - **Keep it:** draw the object's outline as the body, then the details on it or inside it. A filled path is closed with `Z`.
+- **Keep it, for a curved body:** take it from the kit and paste it. `node <skill-dir>/shapes.mjs <primitive> --grid 16 --w 12 --h 12 --at 8,8` prints the body on the quarter grid with every join smooth or a corner: `drop`, `leaf`, `lens`, `bean`, `crescent`, `taper`, `wedge`, `scoop`, or `blob --anchors "x,y[,t][,c] …"` from anchors of your own (`c` a cusp). `node <skill-dir>/shapes.mjs` alone lists every flag. A hand-written path is the exception.
+- **Keep it, after a hand edit:** `node <skill-dir>/shapes.mjs --from pretty-icons/<name>.svg` re-solves the handles about every kinked anchor and prints each repaired path as `path@N <d>`. Paste them back.
+- **Keep it, for a corner:** make it one, over 30°: a cusp of the kit (`c`), or two straight sides.
 - **Keep it, for an outline with corners:** take a rect, a circle or a triangle, or turn the extra sides into curves.
 - **Keep it, for a house:** a house is one contour, walls and roof in one closed path, with its door as the accent. Not a rect with a roof on it: a roof narrower than the box reads as a lid (a shed, a tent, an envelope flap). On 16, the body is `M2.5 6.5 8 1.75l5.5 4.75v4.75a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1z` with the fill, and the door `M6.5 12.25v-3.5h3v3.5`, ending on the floor. Its five sides are the two slopes, the walls and the floor; arcs round the floor's corners, and the round join rounds the eaves and the ridge. It is square 12.5 × 12, its mass 0.27 low; walls 0.5 taller sink it to 0.55, past rule 06. A door 3 tall reads as a notch.
 - **Keep it, for a glyph:** braces are the one glyph (rule 09), and they need a body to sit in. `coding` is braces inside a landscape window, not a bare `</>`. Bare strokes have no body, and they also come out light (rule 05).
 - **Keep it, for a ring:** a closed shape with a contour and no fill is a detail, and is allowed. The hub in `examples/hairline/machines.svg` is one.
-- **Rejected when:** `check.mjs` prints `construction`: `construction  coding  no filled element → at least one body`, `construction  interfaces  rect@2 stroke none → a contour on every body`. Or `contour`, for a faceted body: `contour  node  path@2 6 straight sides → at most 5, or curves`.
+- **Rejected when:** `check.mjs` prints `construction`: `construction  coding  no filled element → at least one body`, `construction  interfaces  rect@2 stroke none → a contour on every body`. Or `contour`, for a faceted body: `contour  node  path@2 6 straight sides → at most 5, or curves`. Or `join`, for a kink: `join  leaf  path@2 10.0° at 8, 4.5 → under 4° or over 30°: smooth, or a corner on purpose`. Or `inflection`, for a wobble: `inflection  leaf  path@2 segment 2 2 inflections over a chord of 9 → at most 1, none under a chord of 4`. `check.mjs` also prints a `pixel` note, never a failure, for straight strokes whose edges fall between pixels at 1× and 2×: move them by 0.25 when the note names them.
 
 ## 05 · weight: the ink matches the set
 
@@ -107,7 +113,8 @@
 - **Keep it, to keep a detail clear:** put its centreline two strokes from the body's: 3 on 16 and 20, 4 on 24. In `examples/hairline/devices.svg` the home bar at y 11.25 sits 3 above the phone's edge at 14.25.
 - **Keep it, for a line that meets a body:** it ends on the body's edge, and never runs under the body and out the other side, because the 20% fill shows it through. An accent drawn inside a body is not this, and stays: a title bar or a card stripe ending on its edges, a check in a shield, braces. Nothing measures it; the reader sees it.
 - **Keep it, for a near miss:** a check in its shield, a home bar in its phone, cells, rows, dots or braces: move each to touch or to 3 apart. Cells that cannot sit 3 apart become one body with a cross that ends on its edges.
-- **Rejected when:** `check.mjs` prints `gap`: `gap  security  path@2 to path@3 1.24 apart → ≥ 1.5 apart, or crossing`. Overlapping outlines whose centrelines stay apart print `gap  devices  rect@2 to path@3 overlapping, centrelines 1 apart → ≥ 1.5 apart, or crossing`. Two subpaths of one path print their indexes from 0: `gap  empty  path@3[0] to path@3[1] 0 apart → ≥ 1.5 apart, or crossing`. Two elements on one line print their place among the elements: `path#2@3`.
+- **Keep it, for a modifier:** it sits in a halo, its ink plus one stroke of clear space and half the base's stroke. Nothing else crosses the halo. `modifiers.mjs` cuts every stroke the halo crosses where it enters, drops a piece shorter than 1, and keeps the paint whole, so the 20% fill shows in the halo. Never cut it or draw it by hand. Gap leaves the modifier out: the halo is its gap.
+- **Rejected when:** `check.mjs` prints `gap`: `gap  security  path@2 to path@3 1.24 apart → ≥ 1.5 apart, or crossing`. Overlapping outlines whose centrelines stay apart print `gap  devices  rect@2 to path@3 overlapping, centrelines 1 apart → ≥ 1.5 apart, or crossing`. Two subpaths of one path print their indexes from 0: `gap  empty  path@3[0] to path@3[1] 0 apart → ≥ 1.5 apart, or crossing`. Two elements on one line print their place among the elements: `path#2@3`. A stroke left in a modifier's halo prints `modifier`: `modifier  data  rect#1@1 3 inside badge:plus's halo → clear of it: add the modifier with modifiers.mjs, which cuts the stroke`.
 
 ## 09 · metaphor: one object, three elements
 
@@ -115,8 +122,19 @@
 
 No letters, digits, logos or initials, ever. A brand name is drawn as the thing the name means (ruby → a gem, java → a cup), never as its mark or its initials. A brand name that means no thing is handed back. Braces are the one glyph allowed, as an accent inside a body (`coding`). A box drawn to hold a glyph is a badge, not a body.
 
-A body carries one accent: the part that names the object, the home bar on a phone, the title bar on a window, the check in a shield. A second mark for realism (a chimney, a shine, steam, a fold, a shadow) is dropped. Measured across all the details, every element without a fill: at most two subpaths and eight drawing commands between them. A `circle`, `rect` or `line` detail is one of each; moves are not drawing commands, implicit repeats are. Two subpaths are for one symmetric thing: a cross, a pair of braces.
+A body carries one accent: the part that names the object, the home bar on a phone, the title bar on a window, the check in a shield. A second mark for realism (a chimney, a shine, a second wisp of steam, a fold, a shadow) is dropped. Measured across all the details, every element without a fill: at most two subpaths and eight drawing commands between them. A `circle`, `rect` or `line` detail is one of each; moves are not drawing commands, implicit repeats are. Two subpaths are for one symmetric thing: a cross, a pair of braces.
 
+The accent is drawn as a gesture: the one thing that makes a body a thing and not a shape. Pick one per body from the catalogue; two are noise. When the accent is a part (a door, a handle, a home bar), that part is the gesture, and the body takes no other but the lean.
+
+| Gesture | What it is | For |
+| --- | --- | --- |
+| **seam** | a line inside the body that follows its form | a croissant's folds, a loaf's score, a ball's stitch |
+| **dot pair** | two dots, a stroke apart | a button's holes, a plug's pins, seeds |
+| **tuft** | one short stroke or a small leaf off the top | a fruit's stem, a carrot's leaves, a bag's tie |
+| **steam** | one wisp over the body, never three | a thing named by its heat: an oven, a hot drink |
+| **paper sheen** | a small paper fill on glass, at 48 only | a bottle, a jar, a screen; never a white stroke |
+| **lean** | the body's belly slid to one side, `shapes.mjs --lean` | a drop, a pear, a sack; it costs no element |
+
 - **Keep it, for the count:** merge details into one path. `all` is a body and one path, `M8 2.75v10.5M2.75 8h10.5`, not four rects. A connection is two nodes and a link, not three nodes. A machine is one body and one detail, not a rack. A rounded box is a `rect` with `rx`; as a path it takes ten commands. When a merged path would pass eight, split it across the elements left. When the details together pass eight drawing commands, drop one.
 - **Keep it, for the object:** draw what the name means. A gear's teeth do not fit at 16 under the count and contour rules: draw settings as sliders, two knobs and two tracks, each track starting at its knob's edge and running one way (rule 08). On 16: knobs `cx 4.5 cy 4.5 r 2.75` and `cx 11.5 cy 11.5 r 2.75`, tracks `M7.25 4.5h7M1.75 11.5h7`, on the circle keyline. Knobs of r 2.5 come out light (68.5 on the square keyline, against 83.5). A dashed ring reads as loading. Do not draw:
   - interfaces as a layout window (it reads "layout" or "browser") or a card with a stripe ("payments");
@@ -128,6 +146,7 @@
 - **Keep it, for a family that is not a brand** (file types): its members share one object and differ by a single accent.
 - **Keep it, for the accent:** name the one part that makes the object itself and draw only that. A house is its door, not a door and a chimney. A cup is its handle, not three wisps of steam. A magnifier is its handle, not a shine on the lens.
 - **Keep it, for a familiar pick:** a 2 × 2 grid, a cylinder, a bookmark or a shield with a check is neither good nor bad. The test is whether the reader names the object you meant: a shield with a check, for security, passes.
+- **Keep it, for a state** (add, remove, done, cancel, off, locked, new, up, down): the base icon and one modifier, never a fourth element drawn by hand. `node <skill-dir>/modifiers.mjs pretty-icons/<name>.svg --add <kind>` writes it in, once the base passes `check.mjs`. The kinds are `badge:plus`, `badge:minus`, `badge:check`, `badge:x`, `slash`, `lock`, `dot` and `arrow:up`, `arrow:right`, `arrow:down`, `arrow:left`; `--corner br|tr|bl|tl` moves it (default `br`), `--print` prints instead of writing. One per icon. The modifier, and a contour it split from its paint, are not counted. A modified icon is measured for live and gap only, and stays out of the set's median. The command refuses a corner whose halo would cover a whole body, and a cut that `check.mjs` would reject, such as a stub left nearer a body than a stroke: try another `--corner` or another kind.
 - **Keep it, for the examples:** do not copy `examples/hairline`'s metaphors. Its devices is one phone and its interfaces a window, both on the list above.
 - **Rejected when:** `check.mjs` prints `count` (`count  all  4 elements → at most 3`, `count  empty  path@2 9 commands → at most 8`), or `count` on the details: three wisps and a handle print `count  java  details 4 subpaths → at most 2`, a glyph `count  php  details 11 drawing commands → at most 8`. Or read: the reader gives another name, puts two numbers on one name, does not know, reads a letter or a digit, gets the name only by elimination, or names an object that does not mean the name (`read.md`).
 
````

- [ ] **Step 4: Run the test, then the suite**

Run: `rtk test node --test test/pretty-icons/docs.test.mjs`
Expected: 5 pass, 0 fail.

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: all pass (201), 0 fail.

- [ ] **Step 5: Read the docs as the agent will**

Read `SKILL.md` top to bottom, then `rules.md` 04 and 09, as an agent drawing a set would. Each command named must exist, with the flags as written: `shapes.mjs <primitive> --grid --w --h --at`, `shapes.mjs --from`, `sheet.mjs --proof --only`, `modifiers.mjs --add --corner --print`. Run each once on `skills/pretty-icons/examples/garage/car.svg` or `skills/pretty-icons/examples/hairline/data.svg` to be sure.

- [ ] **Step 6: Commit**

```bash
rtk git add skills/pretty-icons/SKILL.md skills/pretty-icons/read.md skills/pretty-icons/rules-filled.md skills/pretty-icons/rules.md test/pretty-icons/docs.test.mjs
rtk git commit -m "docs: the kit, the gesture catalogue, modifiers and the craft read"
```

### Task 10: `examples/garage` as the new bar

The filled finish's examples are redrawn with the kit where a body is curved, and pass the three gates: `check.mjs` with no kink, the blind read 10 of 10, and the craft read with a defect named for at most one icon.

**Files:**
- Modify: `skills/pretty-icons/examples/garage/*.svg` (those the proof or the craft read faults; `traffic-light.svg` stays byte for byte)
- Modify: `skills/pretty-icons/presets.mjs` (`REFERENCE_INK[48]`), `skills/pretty-icons/rules-filled.md` (the reference it quotes), only if the median moves
- Modify: `test/pretty-icons/modifiers.test.mjs`, only if a redraw moves an element the refusals name
- Modify: `docs/superpowers/baselines/2026-10-08-pretty-icons-craft-reference.md` (section "The bar: examples/garage")

**Interfaces:**
- Consumes: `shapes.mjs` (Task 6), `check.mjs --print` (Task 3), `sheet.mjs --proof` (Task 8), the craft read in `read.md` (Task 9).
- Produces: the garage that Tasks 12 and 13 look at in the proof's reference row (`car`, `traffic-light`, `wrench`), and `REFERENCE_INK[48]`, the median of the redrawn ten.

`traffic-light.svg` is rects and circles, with nothing for the kit to do. `rules-filled.md` quotes it whole as the worked example, and `filled.test.mjs` builds twenty assertions by editing its text. Leave it as it is.

- [ ] **Step 1: Save the median script outside the repo**

Save as `/tmp/pretty-icons-median.mjs`:

```js
// The median ink of a set's icons without a modifier, as REFERENCE_INK stores it.
//   node /tmp/pretty-icons-median.mjs <folder>     (run from the repo root)
const { checkSet, readSet } = await import(`${process.cwd()}/skills/pretty-icons/check.mjs`);
const dir = process.argv[2];
const plain = new Set(readSet(dir).filter((s) => !/data-modifier=/.test(s.text)).map((s) => s.name));
const inks = (await checkSet(dir)).rows.filter((x) => plain.has(x.icon)).map((x) => x.ink).sort((a, b) => a - b);
const m = inks.length >> 1;
console.log(`median ${(inks.length % 2 ? inks[m] : (inks[m - 1] + inks[m]) / 2).toFixed(2)} of ${inks.length}`);
```

Run: `rtk proxy node /tmp/pretty-icons-median.mjs skills/pretty-icons/examples/garage`
Expected: `median 328.69 of 10`.

- [ ] **Step 2: Look at the bar as it stands**

Run: `rtk proxy node skills/pretty-icons/check.mjs skills/pretty-icons/examples/garage --print`
Expected: a table whose `joins` column has no kink, then `ok`.

Run: `rtk proxy node skills/pretty-icons/sheet.mjs skills/pretty-icons/examples/garage --proof`
Expected: one line, the proof's path.

Open the proof with the Read tool. Then open a fresh agent with `pretty-icons-sheet.png` from `rtk proxy node skills/pretty-icons/sheet.mjs skills/pretty-icons/examples/garage` and the craft prompt:

> These 10 icons are from one app. For each number, in five words or fewer, name one drawing defect if you see one: a kink in a curve, a wobbly curve, uneven weight, a part floating off the body, a confused silhouette, a detail too small to read. Say "none" when you see no defect. Then name the three weakest and why.

Write the `joins` column and the reader's answer, word for word, under "## The bar: examples/garage" in `docs/superpowers/baselines/2026-10-08-pretty-icons-craft-reference.md`, headed "Before the redraw".

- [ ] **Step 3: Redraw each icon the reader faulted, and each curved body drawn by hand**

For each such icon, in turn:

1. Print the body from the kit at its keyline, and paste its three elements (tone, shade, contour) in place of the old body. The car's body, for example, is a `bean` on the landscape keyline:

```bash
rtk proxy node skills/pretty-icons/shapes.mjs bean --grid 48 --w 40 --h 24 --at 24,28
```

2. Keep the icon's details and its one gesture (`skills/pretty-icons/rules.md` 09). A detail that sat on the old outline moves by 0.25 steps until it sits on the new one.
3. Run `rtk proxy node skills/pretty-icons/check.mjs skills/pretty-icons/examples/garage --print` and fix each line by its rule. If a hand edit leaves a kink, run `rtk proxy node skills/pretty-icons/shapes.mjs --from skills/pretty-icons/examples/garage/<name>.svg` and paste each `path@N` it prints.
4. Run `rtk proxy node skills/pretty-icons/sheet.mjs skills/pretty-icons/examples/garage --proof --only <name>` and look at the panel: every join green or blue, the silhouette one clear shape.

- [ ] **Step 4: The gates**

Run: `rtk proxy node skills/pretty-icons/check.mjs skills/pretty-icons/examples/garage --print`
Expected: `ok`; the `joins` column shows no kink and the `infl` column no value above 1.

Open two fresh agents, one after the other; neither has seen your work. Give the first `pretty-icons-blind.png` from `sheet.mjs skills/pretty-icons/examples/garage` with the blind prompt in `skills/pretty-icons/read.md`, word for word, and N = 10. Score its answers against the key `sheet.mjs` printed, as `read.md` says. Give the second `pretty-icons-sheet.png` and this prompt, with N = 10:

> These 10 icons are from one app. For each number, in five words or fewer, name one drawing defect if you see one: a kink in a curve, a wobbly curve, uneven weight, a part floating off the body, a confused silhouette, a detail too small to read. Say "none" when you see no defect. Then name the three weakest and why.

Write both answers, word for word, under "## The bar: examples/garage" in `docs/superpowers/baselines/2026-10-08-pretty-icons-craft-reference.md`.

The gates hold when the blind read names 10 of 10 with no elimination and the craft read names a defect for at most one icon. If not, go back to step 3 for the icons that failed, then run this step again with two new readers.

- [ ] **Step 5: Re-measure the reference**

Run: `rtk proxy node /tmp/pretty-icons-median.mjs skills/pretty-icons/examples/garage`

If it prints a value more than 0.5 from 328.7, write it, rounded to 0.1, in place of `48: 328.7` in `REFERENCE_INK` in `skills/pretty-icons/presets.mjs`, and in place of `the reference, 328.7,` in `skills/pretty-icons/rules-filled.md` 05.

- [ ] **Step 6: Run the suite and settle the tests the redraw moved**

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: all pass (201), 0 fail.


Only three kinds of failure come from a redraw, each fixed in its test:

- **The car refusal.** `modifiers.test.mjs` expects `circle@7 lies under the badge:check's halo`. If the car's elements moved, write the element the new message names.
- **The battery arrow.** `modifiers.test.mjs` expects `path@8`. If the battery's elements moved, write the element the new message names.
- **The croissant's weight.** `docs.test.mjs` checks the croissant alone against `REFERENCE_INK[48]`. If it now fails `weight`, the reference moved more than the croissant can follow: say so in the baseline file and stop.

Any other failure is the drawing's fault: go back to step 3.

- [ ] **Step 7: Commit**

```bash
rtk git add skills/pretty-icons/examples/garage skills/pretty-icons/presets.mjs skills/pretty-icons/rules-filled.md test/pretty-icons/modifiers.test.mjs docs/superpowers/baselines/2026-10-08-pretty-icons-craft-reference.md
rtk git commit -m "feat: examples/garage redrawn with the kit, the new bar for the filled finish"
```

### Task 11: `examples/hairline` as the new bar, three with a modifier

**Files:**
- Modify: `skills/pretty-icons/examples/hairline/*.svg` (three or more gain a modifier; those the craft read faults are redrawn)
- Modify: `skills/pretty-icons/presets.mjs` (`REFERENCE_INK` 20 and 24, and 16 if a redraw moves it), `skills/pretty-icons/rules.md` 05 (the references it quotes)
- Test: `test/pretty-icons/examples.test.mjs`, `test/pretty-icons/presets.test.mjs`, `test/pretty-icons/modifiers.test.mjs`, `test/pretty-icons/finish.test.mjs`
- Modify: `docs/superpowers/baselines/2026-10-08-pretty-icons-craft-reference.md` (section "The bar: examples/hairline")

**Interfaces:**
- Consumes: `modifiers.mjs --add` (Task 7), `shapes.mjs` (Task 6), the reads (Task 9), `/tmp/pretty-icons-median.mjs` (Task 10).
- Produces: the duotone bar the proof's reference row shows (`data`, `devices`, `security`), and three modified icons the agent sees as the model of a state.

`data`, `devices` and `security` are the proof's reference row. `finish.test.mjs` reads `coding` and the shield in `security` by name. Leave those four without a modifier.

- [ ] **Step 1: Make the tests hold with modified examples**

A modified icon stays out of the median (measure.mjs) and already has its one modifier. The tests that take the median over all ten, or add a badge to each, must skip it.

In `test/pretty-icons/examples.test.mjs`, replace

```js
import { readdirSync } from "node:fs";
```

with

```js
import { readdirSync, readFileSync } from "node:fs";
```

In `test/pretty-icons/examples.test.mjs`, replace

```js
test("the reference ink is the examples' median, within 0.5", async () => {
  const r = await checkSet(examples);
  const inks = r.rows.map((x) => x.ink).sort((a, b) => a - b);
  const median = (inks[4] + inks[5]) / 2;
  assert.ok(Math.abs(REFERENCE_INK[16] - median) <= 0.5, `stored ${REFERENCE_INK[16]}, measured ${median}`);
});
```

with

```js
test("the reference ink is the median of the examples without a modifier, within 0.5", async () => {
  const plain = readdirSync(examples).filter((f) => f.endsWith(".svg") && !/data-modifier=/.test(readFileSync(examples + f, "utf8"))).map((f) => f.slice(0, -4));
  assert.ok(plain.length <= 7, `at least three examples carry a modifier; ${10 - plain.length} do`);
  const r = await checkSet(examples);
  const inks = r.rows.filter((x) => plain.includes(x.icon)).map((x) => x.ink).sort((a, b) => a - b), m = inks.length >> 1;
  const median = inks.length % 2 ? inks[m] : (inks[m - 1] + inks[m]) / 2;
  assert.ok(Math.abs(REFERENCE_INK[16] - median) <= 0.5, `stored ${REFERENCE_INK[16]}, measured ${median}`);
});
```

In `test/pretty-icons/presets.test.mjs`, replace

```js
    for (const s of set) {
      const inner
```

with

```js
    for (const s of set.filter((x) => !/data-modifier=/.test(x.text))) {
      const inner
```

In `test/pretty-icons/presets.test.mjs`, replace

```js
    const median = (inks[4] + inks[5]) / 2;
```

with

```js
    const m = inks.length >> 1, median = inks.length % 2 ? inks[m] : (inks[m - 1] + inks[m]) / 2;
```

In `test/pretty-icons/modifiers.test.mjs`, replace

```js
  for (const name of ["all", "coding", "connectivity", "data", "devices", "empty", "interfaces", "machines", "marks", "security"]) {
```

with

```js
  for (const name of ["all", "coding", "connectivity", "data", "devices", "empty", "interfaces", "machines", "marks", "security"].filter((n) => !/data-modifier=/.test(ex("hairline", n)))) {
```

- [ ] **Step 2: Run them to see the new guard fail**

Run: `rtk test node --test test/pretty-icons/examples.test.mjs`
Expected: 1 fail, `the reference ink is the median of the examples without a modifier`: `at least three examples carry a modifier; 0 do`.

- [ ] **Step 3: Add the modifiers**

Three that pass check, and keep the 16 median where it is:

```bash
rtk proxy node skills/pretty-icons/modifiers.mjs skills/pretty-icons/examples/hairline/empty.svg --add badge:plus
rtk proxy node skills/pretty-icons/modifiers.mjs skills/pretty-icons/examples/hairline/connectivity.svg --add badge:check
rtk proxy node skills/pretty-icons/modifiers.mjs skills/pretty-icons/examples/hairline/machines.svg --add dot
```

Expected: one line each, `<path>: <kind>`. A slash on `connectivity` is refused: it cuts the link to a stub inside its node. Choose a different kind; never cut by hand.

- [ ] **Step 4: Look, read, and redraw what fails**

Run: `rtk proxy node skills/pretty-icons/check.mjs skills/pretty-icons/examples/hairline --print`
Expected: `ok`, after the `notes` lines; no kink in `joins`.

Run: `rtk proxy node skills/pretty-icons/sheet.mjs skills/pretty-icons/examples/hairline --proof`
Expected: the proof's path. Open it: each modifier sits in its halo, the cut ends clear of it.

Open two fresh agents, one after the other; neither has seen your work. Give the first `pretty-icons-blind.png` from `sheet.mjs skills/pretty-icons/examples/hairline` with the blind prompt in `skills/pretty-icons/read.md`, word for word, and N = 10. Score its answers against the key `sheet.mjs` printed, as `read.md` says. Give the second `pretty-icons-sheet.png` and this prompt, with N = 10:

> These 10 icons are from one app. For each number, in five words or fewer, name one drawing defect if you see one: a kink in a curve, a wobbly curve, uneven weight, a part floating off the body, a confused silhouette, a detail too small to read. Say "none" when you see no defect. Then name the three weakest and why.

Write both answers, word for word, under "## The bar: examples/hairline" in `docs/superpowers/baselines/2026-10-08-pretty-icons-craft-reference.md`.

The gates are those of Task 10: 10 of 10 blind with no elimination, and a defect named for at most one icon. A faulted icon is redrawn from the kit (`--grid 16`), and both reads run again with new readers. A modified icon is redrawn without its modifier, and the modifier is added again with step 3's command.

- [ ] **Step 5: Re-measure the reference**

Run: `rtk proxy node /tmp/pretty-icons-median.mjs skills/pretty-icons/examples/hairline`
Expected: `median 83.49 of 7` when only step 3 changed the set.

If it is more than 0.5 from 83.5, write it, rounded to 0.1, as `16:` in `REFERENCE_INK` in `skills/pretty-icons/presets.mjs`.

The 20 and 24 references are the plain icons scaled to each grid, and leaving three out moves them. Run `rtk test node --test test/pretty-icons/presets.test.mjs`. It prints `20: stored 114.2, measured 115.38` when only step 3 changed the set. Write the measured value, rounded to 0.1, as `20:`, and run it again. It then prints `24: stored 181.9, measured 182.98`; write `24: 183`. Run it a third time; it passes.

In `skills/pretty-icons/rules.md` 05, the sentence `83.5 on 16, 114.2 on 20, 181.9 on 24.` quotes them: write the new values there too.

- [ ] **Step 6: Settle the pinned references, then run the suite**

Before the run, `finish.test.mjs` pins the old references in two places. Write the new ones, which with step 3's set alone are:

- the `REFERENCE_INK` line: `{ 16: 83.5, 20: 114.2, 24: 181.9 }` becomes `{ 16: 83.5, 20: 115.4, 24: 183 }`;
- the two `weight  javascript` lines: `ink 226.95 (+24.8%) → within ±20% of the reference 181.9` becomes `ink 226.95 (+24.0%) → within ±20% of the reference 183`.

If a redraw moved the references further, the failures print the actual lines: copy those.

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: all pass (201), 0 fail.


- [ ] **Step 7: Commit**

```bash
rtk git add skills/pretty-icons/examples/hairline skills/pretty-icons/presets.mjs skills/pretty-icons/rules.md test/pretty-icons/examples.test.mjs test/pretty-icons/presets.test.mjs test/pretty-icons/modifiers.test.mjs test/pretty-icons/finish.test.mjs docs/superpowers/baselines/2026-10-08-pretty-icons-craft-reference.md
rtk git commit -m "feat: examples/hairline redrawn as the duotone bar, three with a modifier"
```

### Task 12: The after: the twenty, redrawn with the kit

**Files:**
- Create: `docs/superpowers/baselines/2026-10-08-craft-after/car/*.svg`, `docs/superpowers/baselines/2026-10-08-craft-after/bakery/*.svg` (ten each, the same names as the before)
- Modify: `docs/superpowers/baselines/2026-10-08-pretty-icons-craft-reference.md` (section "The after")

**Interfaces:**
- Consumes: everything above; `docs/superpowers/baselines/2026-10-08-craft-before` for the names, the objects and the finish.
- Produces: the spec's success 2, measured.

- [ ] **Step 1: Copy the names, not the drawings**

```bash
mkdir -p docs/superpowers/baselines/2026-10-08-craft-after/car docs/superpowers/baselines/2026-10-08-craft-after/bakery
ls docs/superpowers/baselines/2026-10-08-craft-before/car docs/superpowers/baselines/2026-10-08-craft-before/bakery
```

Each icon keeps its name, its object and its format. Its drawing starts again from `skills/pretty-icons/SKILL.md` step 3, the loop: compose with `shapes.mjs`, `check.mjs`, `sheet.mjs --proof --only <name>`, adjust.

- [ ] **Step 2: Redraw the car set**

For each of the ten, in `docs/superpowers/baselines/2026-10-08-craft-after/car/<name>.svg`: take the body from the kit or the bodies table, add the details and one gesture, run `rtk proxy node skills/pretty-icons/check.mjs docs/superpowers/baselines/2026-10-08-craft-after/car`, and look at its proof panel. The kinked four come first: `banco`, `cone`, `marcha`, `triangulo`.

- [ ] **Step 3: Redraw the bakery set**

The same, in `docs/superpowers/baselines/2026-10-08-craft-after/bakery`. The croissant is the one in `skills/pretty-icons/rules-filled.md` 04: the `blob` and its two seams.

- [ ] **Step 4: The check**

Run: `rtk proxy node skills/pretty-icons/check.mjs docs/superpowers/baselines/2026-10-08-craft-after/car --print`
Expected: `ok`; the `joins` column shows no kink and the `infl` column no value above 1.

Run: `rtk proxy node skills/pretty-icons/check.mjs docs/superpowers/baselines/2026-10-08-craft-after/bakery --print`
Expected: the same.


- [ ] **Step 5: The reads**

Open two fresh agents, one after the other; neither has seen your work. Give the first `pretty-icons-blind.png` from `sheet.mjs docs/superpowers/baselines/2026-10-08-craft-after/car` with the blind prompt in `skills/pretty-icons/read.md`, word for word, and N = 10. Score its answers against the key `sheet.mjs` printed, as `read.md` says. Give the second `pretty-icons-sheet.png` and this prompt, with N = 10:

> These 10 icons are from one app. For each number, in five words or fewer, name one drawing defect if you see one: a kink in a curve, a wobbly curve, uneven weight, a part floating off the body, a confused silhouette, a detail too small to read. Say "none" when you see no defect. Then name the three weakest and why.

Write both answers, word for word, under "## The after" in `docs/superpowers/baselines/2026-10-08-pretty-icons-craft-reference.md`.

Then the same for `docs/superpowers/baselines/2026-10-08-craft-after/bakery`, with two more new readers.

The spec's gates for the twenty: 20 of 20 blind with no elimination, and no defect named for at least 18. An icon that fails goes back to step 2 or 3; then both sets are checked and read again, with new readers.

- [ ] **Step 6: Record the after**

Under "## The after", write one table per set, with these columns: icon, joins, infl, blind answer, craft answer. Below it, write the totals beside the before's (Task 4): kinks, double inflections, blind score and craft score.

- [ ] **Step 7: Commit**

```bash
rtk git add docs/superpowers/baselines/2026-10-08-craft-after docs/superpowers/baselines/2026-10-08-pretty-icons-craft-reference.md
rtk git commit -m "docs: the after, twenty icons redrawn with the kit and read twice"
```

### Task 13: The trial: a fresh agent with six new names

**Files:**
- Modify: `docs/superpowers/baselines/2026-10-08-pretty-icons-craft-reference.md` (section "The trial")

**Interfaces:**
- Consumes: the skill as committed after Task 12.
- Produces: the spec's success 5.

- [ ] **Step 1: Hand the skill to a fresh agent**

Open a fresh agent in a temp folder (`mktemp -d`), with this prompt, `<repo>` being the repo's absolute path:

> Use the skill in `<repo>/skills/pretty-icons/SKILL.md` to draw six icons for a garden shop app, in the filled finish: watering can, seedling, glove, pot, rake, sun hat. Follow every step. Before each `check.mjs` run, say "check run N". Stop at the hand-over and report what `check.mjs` printed each time.

- [ ] **Step 2: Score it**

The trial passes when `check.mjs` printed `ok` on run 1 or run 2. Check it yourself:

```bash
rtk proxy node skills/pretty-icons/check.mjs <temp>/pretty-icons --print
```

Expected: `ok`, and no kink in `joins`.

- [ ] **Step 3: Record it**

Under "## The trial", write the six names, the number of runs to `ok`, each run's failures as printed, and whether the agent used `shapes.mjs`, `--proof` and the craft read. If it took three runs or more, name the rule that held it back. That is a defect in the docs: fix the doc that failed the agent, then run the trial again with a new agent and six new names.

- [ ] **Step 4: Commit**

```bash
rtk git add docs/superpowers/baselines/2026-10-08-pretty-icons-craft-reference.md
rtk git commit -m "docs: the trial, six new icons by a fresh agent"
```

### Task 14: Final verification

**Files:** none changed, unless a step fails.

- [ ] **Step 1: The suite**

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: all pass, 0 fail. The count is 201 plus any test Tasks 10 and 11 added.


- [ ] **Step 2: Every set the repo keeps**

```bash
rtk proxy node skills/pretty-icons/check.mjs skills/pretty-icons/examples/garage
rtk proxy node skills/pretty-icons/check.mjs skills/pretty-icons/examples/hairline
rtk proxy node skills/pretty-icons/check.mjs test/pretty-icons/fixtures/tonal-green
rtk proxy node skills/pretty-icons/check.mjs docs/superpowers/baselines/2026-10-08-craft-after/car
rtk proxy node skills/pretty-icons/check.mjs docs/superpowers/baselines/2026-10-08-craft-after/bakery
```

Expected: each ends with `ok`; the duotone sets may print `notes` before it.

- [ ] **Step 3: The spec's success list, line by line**

Open `docs/superpowers/specs/2026-10-08-pretty-icons-craft-design.md`, "What success is". For each line, write in `docs/superpowers/baselines/2026-10-08-pretty-icons-craft-reference.md` where it is shown, by section:

1. The before has at least one kink: "The before".
2. The after has 0 kinks, 0 double inflections, 20 of 20 blind, and no defect named for at least 18: "The after".
3. The garage and hairline pass the three gates, and hairline has three modifiers: "The bar" sections and Task 11's commit.
4. Duotone has no hierarchy failure: Task 5, step 8.
5. A fresh agent passes on run 1 or 2: "The trial".

A line with no evidence goes back to its task.

- [ ] **Step 4: The proof, once more**

```bash
rtk proxy node skills/pretty-icons/sheet.mjs docs/superpowers/baselines/2026-10-08-craft-after/bakery --proof
```

Open it with the Read tool. Check two things: the reference row is the garage's; no join is red.

- [ ] **Step 5: Commit, if anything changed**

```bash
rtk git add docs/superpowers/baselines/2026-10-08-pretty-icons-craft-reference.md
rtk git commit -m "docs: final verification of pretty-icons craft"
```


Then stop. Pushing, a PR, or copying icons into an app waits for the person.
