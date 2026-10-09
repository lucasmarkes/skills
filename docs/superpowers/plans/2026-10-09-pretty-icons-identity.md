# pretty-icons identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the filled finish one law of line and contrast: the line tone fills only a dot, every stroke is the root's 1.5 or a contour's 2, and the line tone's share of each icon's paint is measured and held to a band; then redraw what the law refuses and read every set as one.

**Architecture:** `filled.mjs` loses the bar, the core and the solid part, and gains two refusals (`solid`, a stroke in the fill or shade tone). `check.mjs`'s stroke rule takes one extra width at 48, the contour's. `raster.mjs` gains `shares()`, a render as written that counts dark pixels; `measure.mjs` turns it into the `contrast` rule against `CONTRAST_BAND` in `presets.mjs`. `shapes.mjs` gains `ring`, the body that replaces the tube. The prose files (`rules-filled.md`, `SKILL.md`, `read.md`) follow, with a third read, the set read. `examples/garage` and the twenty after icons are redrawn; a fresh agent runs one trial.

**Tech Stack:** Node ≥ 22 (ES modules, `node --test`, no runtime dependencies in the repo), `@resvg/resvg-js` 2.6.2 from the user's cache folder (as today), SVG 1.1.

**Spec:** `docs/superpowers/specs/2026-10-09-pretty-icons-identity-design.md`

## Global Constraints

- Node ≥ 22; the suite is `rtk test node --test 'test/**/*.test.mjs'`; no `npm install` in the repo.
- No colour and no offset shadow. The five tones stay: line `#25262a`, fill `#ececea`, shade `#cfcfcb`, paper `#ffffff`, mark `#8b8c90`. The inner shade stays.
- The line tone fills only a dot: a circle of r ≤ 2.5 (`DOT = 2.5`).
- One line weight at 48: `stroke-width` is 2 on a contour and the root's 1.5 everywhere else. 3.5 is refused.
- The contrast band is `CONTRAST_BAND = [0.2, 0.45]`. A pixel is paint when its alpha is ≥ 128 of 255; it is dark when its un-premultiplied mean of r, g, b is under 89 (`DARK_LUMA`).
- The duotone finish (16, 20, 24), `examples/hairline` and their tests do not change; `check.mjs examples/hairline` prints `ok`.
- The set read's prompt, word for word: "These N icons are from one app. Name every icon that looks like it comes from a different set than the others, and in five words or fewer say why. Say 'one set' if none does." It passes on "one set" or one icon named.
- Every failure line is `rule  icon  got → want`. Exit 1 on failure, 0 on `ok`, 2 when not measured.
- Rule 01 is not relaxed: every number on the quarter grid. No `<mask>`, `<defs>`, `g` or `transform` in an icon.
- Prose files are in English, in the skill's voice: short sentences, "Keep it" and "Rejected when".
- Shell commands go through `rtk` (`rtk git …`, `rtk test …`); a script whose output must be read as printed runs as `rtk proxy node …`; grep as `rtk proxy grep`.
- One commit per task, `type: subject` in lower case. Never push, open a PR, or copy icons into an app without the person's say-so. Do not touch `.claude/worktrees/` or the installed `~/.claude/skills/pretty-icons`.

## Review Focus

Inputs the spec implies but no task's tests exercised at planning time. Each line's test is in the task named.

1. A badged icon: its contrast is measured on its base, so the badge's line does not move its share (Task 5, `check.test.mjs`).
2. An icon that fails the text rules is still measured for contrast, so one run prints both lines (Task 5, `check.test.mjs`).
3. `ring` off-centre (`--at`) and with a hole of 0 or less: the first prints the ring at its centre, the second is refused by name (Task 3, `shapes.test.mjs`).
4. A duotone set gets no `line%` column and no `contrast` line (Task 5, `check.test.mjs`).
5. A circle of r 2.5 in the line tone with the root's stroke on it (a dot drawn with a line): it passes, as a shape (Task 4, `filled.test.mjs`).

## File Structure

| File | Status | Responsibility |
| --- | --- | --- |
| `skills/pretty-icons/presets.mjs` | modified | `weights: [2]` at 48; `DARK_LUMA`; `CONTRAST_BAND` and `contrast` on the 48 preset; `REFERENCE_INK[48]` |
| `skills/pretty-icons/check.mjs` | modified | the stroke rule's want at the filled finish |
| `skills/pretty-icons/filled.mjs` | modified | roles without bar or core; `solids`, `painted`; `DOT = 2.5`; `linesOf` without a mask |
| `skills/pretty-icons/raster.mjs` | modified | `shares(svgText, G)` |
| `skills/pretty-icons/measure.mjs` | modified | the `contrast` rule and the `line%` column |
| `skills/pretty-icons/shapes.mjs` | modified | `ring` |
| `skills/pretty-icons/examples/garage/*.svg` | modified | traffic-light (Task 4), the other nine (Task 6) |
| `skills/pretty-icons/rules-filled.md`, `SKILL.md`, `read.md` | modified | the worked light (Task 4); the rest (Task 7) |
| `test/pretty-icons/fixtures/contrast/{box,wheel,plate}.svg` | new | 28%, 65%, 1% |
| `test/pretty-icons/fixtures/tonal-green/{camera,compass,map}.svg` | modified | their line-tone fills become shade or paper |
| `test/pretty-icons/filled.test.mjs`, `raster.test.mjs`, `shapes.test.mjs`, `check.test.mjs`, `modifiers.test.mjs`, `docs.test.mjs` | modified | one per change |
| `docs/superpowers/baselines/2026-10-09-identity-after/{car,bakery}/*.svg` | new | the after sets, redrawn |
| `docs/superpowers/baselines/2026-10-09-pretty-icons-identity-reference.md` | new | the reads, the redraws, the trial, the final verification |

## Deviations from the spec

1. **The 3.5 line names its element.** The spec quotes `stroke  tyre  stroke-width 3.5 → 1.5, or 2 on a contour`; `check.mjs` prints the element, as every stroke line does: `stroke  traffic-light  path@9 stroke-width 3.5 → 1.5, or 2 on a contour`. A contour at 3.5 prints two lines, this one and `rect@5 contour at 3.5 → 2`, since the stroke loop runs before the finish's checks.
2. **Luminance is un-premultiplied.** resvg's pixels are premultiplied by alpha; `shares` divides by alpha before comparing with 89, so an anti-aliased contour edge is dark, not "paint of no tone".
3. **triangulo is not refused by the new rules.** It has no line-tone fill and its share is 43%. It is redrawn anyway, as the spec lists it, for the person's "cartoon": its inner triangle's second contour at 2 becomes a paper shape at the root's line.
4. **A line-tone circle of r ≤ 2.5 with the root's stroke is a shape, not a solid.** It is a dot drawn with a line; the spec's `dot` kind is stroke none. It passes.
5. **A stroke in the shade tone is refused**, like the fill tone's ("the shade tone only as a fill"). The spec names only the fill tone; the old "open stroke in the shade" existed for the core.
6. **The steering wheel is a disc.** Drawn as a ring (r 19, hole 12) it weighed 529; as a body with a paper face it weighs 401.
7. **The reference falls to 328.3**, the new garage's median.
8. **`DARK_LUMA` lands in Task 2, with `shares`; `CONTRAST_BAND` in Task 5, with the rule.**
9. **The rejected lines in `rules-filled.md` 03, 04 and 11 are drawn from the traffic light and the contrast fixtures** (`plate`, `wheel`), not from `roda` and `tyre`, so `docs.test.mjs` can produce each from a file in the repo.
10. **The redrawn after sets go to a new folder**, `2026-10-09-identity-after`; `2026-10-08-craft-after` stays as the previous pass left it.

---

### Task 1: One line weight at the filled finish

**Files:**
- Modify: `skills/pretty-icons/presets.mjs:19-22` (the 48 preset's comment and `weights`)
- Modify: `skills/pretty-icons/check.mjs:97` (the stroke rule's want)
- Test: `test/pretty-icons/filled.test.mjs`, `test/pretty-icons/modifiers.test.mjs`

**Interfaces:**
- Consumes: nothing new.
- Produces: `preset(48).weights` is `[2]`. At the filled finish `check.mjs` prints `stroke  <icon>  <el> stroke-width <w> → 1.5, or 2 on a contour` for any element width that is not 1.5 or 2. Tasks 4 and 7 quote this line.

- [ ] **Step 1: Write the failing tests**

In `test/pretty-icons/filled.test.mjs`:

The preset test: replace `assert.deepEqual(p.weights, [2, 3.5]);` with

```js
  assert.deepEqual(p.weights, [2]);
```

Replace the whole stroke test (`test("stroke: the root draws in the line tone at 1.5; an element may take 2 or 3.5", …)`) with

```js
test("stroke: the root draws in the line tone at 1.5; an element takes 2 on a contour, never 3.5", () => {
  assert.deepEqual(lines(check(LIGHT.replace('stroke="#25262a" stroke-width="1.5"', 'stroke="#2e3955" stroke-width="1.5"'))), ["stroke  traffic-light  stroke #2e3955 → #25262a, the line tone"]);
  assert.deepEqual(lines(check(LIGHT.replace('stroke-width="1.5" stroke-linecap', 'stroke-width="2.5" stroke-linecap'))), ["stroke  traffic-light  stroke-width 2.5 → 1.5"]);
  assert.deepEqual(lines(check(add('<path d="M24 44V40" stroke-width="3.5" />'))), ["stroke  traffic-light  path@9 stroke-width 3.5 → 1.5, or 2 on a contour"]);
  assert.deepEqual(lines(check(add('<path d="M24 44V40" stroke-width="2.5" />'))), ["stroke  traffic-light  path@9 stroke-width 2.5 → 1.5, or 2 on a contour"]);
  assert.deepEqual(rules(check(add('<path d="M24 44V40" stroke-width="2" />'))), []);
});
```

In the hierarchy test, replace the line that sets the contour to 3.5 with

```js
  assert.deepEqual(lines(check(LIGHT.replace(CONTOUR, CONTOUR.replace('stroke-width="2"', 'stroke-width="3.5"')))), ["stroke  traffic-light  rect@5 stroke-width 3.5 → 1.5, or 2 on a contour", "stroke  traffic-light  rect@5 contour at 3.5 → 2"]);
```

In the test `"construction: the mark tone only as a stroke; a core only on a bar"`, delete the last two statements (the `const tube = …` line and the `assert.deepEqual(rules(check(tube)), []);` after it): a tube is a 3.5 bar.

The garage test: add a todo, since the garage has bars until Task 6:

```js
test("examples/garage: ten icons, every rule passes, and the reference is their median", { todo: "Task 6 redraws examples/garage" }, async () => {
```

In `test/pretty-icons/modifiers.test.mjs`, split the test `"addModifier: every example takes a badge, the cut arcs and curves pass check"` in two. The first keeps the hairline loop under its name. The garage loop moves to its own test:

```js
test("addModifier: every garage icon takes a badge:check, and the cut passes check", { todo: "Task 6 redraws examples/garage" }, async () => {
  for (const name of ["battery", "fuel", "gearshift", "oil", "speedometer", "steering-wheel", "traffic-light", "tyre", "wrench"]) {
    const out = await addModifier(ex("garage", name), "badge:check", { name });
    assert.deepEqual(textChecks(name, out, 48).failures, [], name);
  }
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `rtk test node --test test/pretty-icons/filled.test.mjs`
Expected: FAIL in the preset test (`[2, 3.5]` against `[2]`), the stroke test (no line for 3.5) and the hierarchy test (one line, not two).

- [ ] **Step 3: Implement**

`skills/pretty-icons/presets.mjs`, the 48 preset. Replace the two comment lines that begin "Three weights" and "The hierarchy" with

```js
  // Two weights: the root's line and a contour at 2. A bar at 3.5 is refused (rules-filled.md 03).
  // A rect's radius is chosen by what the object is: RADII.
  // The hierarchy: a body's contour at 2, everything else at 1.5 (the root's).
```

and in the object, `weights: [2, 3.5]` becomes `weights: [2]`. Keep every other field as it is.

`skills/pretty-icons/check.mjs:97`, the want of the stroke rule:

```js
    if ("stroke-width" in a && !p.weights.includes(num(a, "stroke-width"))) fail(failures, "stroke", icon, `${where} stroke-width ${a["stroke-width"]}`, p.finish === "filled" ? `${p.stroke}, or ${p.contour} on a contour` : p.weights.length ? `the root's, or ${p.weights.join(" or ")}` : "the root's");
```

- [ ] **Step 4: Run the suite**

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: PASS, with two todos (the garage test and the garage badge loop). `rtk proxy node skills/pretty-icons/check.mjs skills/pretty-icons/examples/hairline` prints `ok`.

- [ ] **Step 5: Commit**

```bash
rtk git add skills/pretty-icons/presets.mjs skills/pretty-icons/check.mjs test/pretty-icons/filled.test.mjs test/pretty-icons/modifiers.test.mjs
rtk git commit -m "feat: one line weight at the filled finish"
```

---

### Task 2: shares, the line tone's pixels

**Files:**
- Modify: `skills/pretty-icons/presets.mjs` (add `DARK_LUMA`)
- Modify: `skills/pretty-icons/raster.mjs` (add `shares`)
- Test: `test/pretty-icons/raster.test.mjs`

**Interfaces:**
- Consumes: `render(svgText, widthPx)` → `{ width, height, pixels }` (premultiplied RGBA), `SCALE` (32).
- Produces: `export const DARK_LUMA = 89` in `presets.mjs`; `export async function shares(svgText, G)` in `raster.mjs` → `{ paint, dark }`, two pixel counts at `G * SCALE` wide. Task 5 calls it.

- [ ] **Step 1: Write the failing tests**

In `test/pretty-icons/raster.test.mjs`, import `shares` beside the others:

```js
import { cacheDir, measure, render, shares } from "../../skills/pretty-icons/raster.mjs";
```

and add after the `ROOT` constant:

```js
const ROOT48 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">`;

test("shares: a body in the fill tone is dark only on its contour; a square in the line tone is dark all over", async () => {
  const body = await shares(`${ROOT48}<rect x="8" y="8" width="32" height="32" rx="6" fill="#ececea" stroke="none" /><rect x="8" y="8" width="32" height="32" rx="6" stroke-width="2" /></svg>`, 48);
  assert.ok(body.paint > 0);
  near(body.dark / body.paint, 0.21, 0.03);
  const solid = await shares(`${ROOT48}<rect x="8" y="8" width="32" height="32" fill="#25262a" stroke="none" /></svg>`, 48);
  assert.ok(solid.paint > 0);
  assert.equal(solid.dark, solid.paint);
});

test("shares: a mark is paint, never dark; an empty icon is nothing", async () => {
  const mark = await shares(`${ROOT48}<path d="M8 24H40" stroke="#8b8c90" /></svg>`, 48);
  assert.ok(mark.paint > 0);
  assert.equal(mark.dark, 0);
  assert.deepEqual(await shares(`${ROOT48}</svg>`, 48), { paint: 0, dark: 0 });
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `rtk test node --test test/pretty-icons/raster.test.mjs`
Expected: FAIL, `shares` is not exported.

- [ ] **Step 3: Implement**

`skills/pretty-icons/presets.mjs`, beside `INK_ALPHA`:

```js
/** A pixel is in the line tone when its mean of r, g and b is under this: the midpoint of the line tone (38) and the mark tone (140). */
export const DARK_LUMA = 89;
```

`skills/pretty-icons/raster.mjs`: the import becomes `import { SCALE, INK_ALPHA, DARK_LUMA } from "./presets.mjs";`, and after `measure`:

```js
/**
 * The icon as written, its tones kept: `paint` the pixels at alpha ≥ 128, `dark` those of them in the line tone.
 * resvg's pixels are premultiplied, so each is divided by its alpha before it is compared.
 */
export async function shares(svgText, G) {
  const { pixels } = render(svgText, G * SCALE);
  let paint = 0, dark = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const a = pixels[i + 3];
    if (a < 128) continue;
    paint++;
    if (((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3) * 255 / a < DARK_LUMA) dark++;
  }
  return { paint, dark };
}
```

- [ ] **Step 4: Run them to see them pass**

Run: `rtk test node --test test/pretty-icons/raster.test.mjs`
Expected: PASS. If the body's share is outside 0.18–0.24, print it (`rtk proxy node -e` with the same SVG) and say so in the report before changing anything: 0.21 was measured with this exact SVG while planning.

- [ ] **Step 5: Commit**

```bash
rtk git add skills/pretty-icons/presets.mjs skills/pretty-icons/raster.mjs test/pretty-icons/raster.test.mjs
rtk git commit -m "feat: shares, the line tone's pixels"
```

---

### Task 3: ring, from the kit

**Files:**
- Modify: `skills/pretty-icons/shapes.mjs` (the header comment, `finishOf`, a new `ring`, `NUMERIC`, `USAGE`)
- Test: `test/pretty-icons/shapes.test.mjs`

**Interfaces:**
- Consumes: `snap`, `fmt`, `refuse`, `shadeLine`, `PALETTE`, `preset` (all already in `shapes.mjs`).
- Produces: `export function ring(o = {}, G = 48, p = preset(G))` → five lines of SVG; `finishOf("ring", o)` returns the same; the CLI `node shapes.mjs ring [--r N] [--hole N] [--at x,y]`. Tasks 6, 7 and 8 use it.

- [ ] **Step 1: Write the failing tests**

In `test/pretty-icons/shapes.test.mjs`, add `ring` to the import from `shapes.mjs`, and add:

```js
test("ring: five elements, tone, shade, contour, hole, hole's contour; it passes the finish's checks", () => {
  assert.deepEqual(ring(), [
    '<circle cx="24" cy="24" r="19" fill="#ececea" stroke="none" />',
    '<path d="M5 24A19 19 0 0 0 43 24L37 24A13 13 0 0 1 11 24Z" fill="#cfcfcb" stroke="none" />',
    '<circle cx="24" cy="24" r="19" stroke-width="2" />',
    '<circle cx="24" cy="24" r="13" fill="#ffffff" stroke="none" />',
    '<circle cx="24" cy="24" r="13" stroke-width="2" />',
  ]);
  assert.deepEqual(finishOf("ring", {}), ring());
  const svg = `<svg viewBox="0 0 48 48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">\n${ring().join("\n")}\n</svg>`;
  assert.deepEqual(filledChecks("ring", parse(svg), 48), []);
});

test("ring: off-centre with --at, refused when the hole leaves less than a contour and its gap, or is no hole", () => {
  const r = ring({ r: 10, hole: 7, at: [12, 30] });
  assert.equal(r[1], '<path d="M2 30A10 10 0 0 0 22 30L19 30A7 7 0 0 1 5 30Z" fill="#cfcfcb" stroke="none" />');
  assert.equal(r[3], '<circle cx="12" cy="30" r="7" fill="#ffffff" stroke="none" />');
  refused(() => ring({ r: 10, hole: 7.25 }), "ring: hole 7.25 + 3 > r 10");
  refused(() => ring({ r: 10, hole: 0 }), "ring: hole 0: a ring needs a hole; for a disc, draw a circle body");
  refused(() => finishOf("ring", { grid: 16 }), "ring: the filled finish only (--grid 48)");
});
```

In the USAGE test, the `own` map gains `ring: ["r", "hole"]`:

```js
  const own = { drop: ["tip"], leaf: ["skew"], bean: ["waist"], crescent: ["thick"], taper: ["narrow", "sharp"], wedge: ["angle"], scoop: ["depth", "side", "rx"], blob: ["anchors"], ring: ["r", "hole"] };
```

- [ ] **Step 2: Run them to see them fail**

Run: `rtk test node --test test/pretty-icons/shapes.test.mjs`
Expected: FAIL, `ring` is not exported.

- [ ] **Step 3: Implement**

`skills/pretty-icons/shapes.mjs`.

In the header comment, after the `blob` line:

```js
 *   ring      a body with a hole: a rim, a tyre       --r <outer> --hole <inner> (the filled finish only)
```

`finishOf` begins:

```js
export function finishOf(name, o = {}, given = null) {
  const G = o.grid ?? 48, p = preset(G);
  if (name === "ring") return ring(o, G, p);
  const s = given ?? shape(name, o);
```

and the rest of `finishOf` is unchanged. After `finishOf`:

```js
/**
 * A ring at the filled finish: the outer circle's tone, the shade (the ring's lower half, closed by the two
 * circles' arcs), its contour, the hole in paper and the hole's contour. What a rim or a tyre is drawn as,
 * in place of a bar: two contours at 2, the body between them. `--r` defaults to the circle body (19 at 48),
 * `--hole` to 6 less.
 */
export function ring(o = {}, G = 48, p = preset(G)) {
  if (p.finish !== "filled") refuse("ring: the filled finish only (--grid 48)");
  const [cx, cy] = (o.at ?? [G / 2, G / 2]).map(snap), R = snap(o.r ?? p.live / 2 - p.contour / 2), H = snap(o.hole ?? R - 6);
  if (H <= 0) refuse(`ring: hole ${fmt(H)}: a ring needs a hole; for a disc, draw a circle body`);
  if (H + 3 > R) refuse(`ring: hole ${fmt(H)} + 3 > r ${fmt(R)}: the ring would be thinner than a contour and its gap`);
  const c = (r, paint) => `<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="${fmt(r)}" ${paint} />`;
  const shade = `M${fmt(cx - R)} ${fmt(cy)}A${fmt(R)} ${fmt(R)} 0 0 0 ${fmt(cx + R)} ${fmt(cy)}L${fmt(cx + H)} ${fmt(cy)}A${fmt(H)} ${fmt(H)} 0 0 1 ${fmt(cx - H)} ${fmt(cy)}Z`;
  return [
    c(R, `fill="${PALETTE.fill}" stroke="none"`),
    shadeLine(shade),
    c(R, `stroke-width="${p.contour}"`),
    c(H, `fill="${PALETTE.paper}" stroke="none"`),
    c(H, `stroke-width="${p.contour}"`),
  ];
}
```

`NUMERIC` gains `"r"` and `"hole"`:

```js
const NUMERIC = ["w", "h", "rot", "bulge", "lean", "grid", "tip", "skew", "waist", "thick", "narrow", "angle", "depth", "rx", "r", "hole"];
```

`USAGE` gains a line after `blob`'s:

```js
  "  ring      --r N --hole N (the filled finish only: a body with a hole, five elements)",
```

- [ ] **Step 4: Run them to see them pass, and the CLI**

Run: `rtk test node --test test/pretty-icons/shapes.test.mjs`
Expected: PASS.

Run: `rtk proxy node skills/pretty-icons/shapes.mjs ring --r 10 --hole 7.25`
Expected: stderr `shapes: ring: hole 7.25 + 3 > r 10: the ring would be thinner than a contour and its gap`, exit 1, no stack trace.

- [ ] **Step 5: Commit**

```bash
rtk git add skills/pretty-icons/shapes.mjs test/pretty-icons/shapes.test.mjs
rtk git commit -m "feat: ring, from the kit"
```

---

### Task 4: The line tone is a line

**Files:**
- Modify: `skills/pretty-icons/filled.mjs` (the whole file below the imports changes; listed in full)
- Modify: `skills/pretty-icons/measure.mjs:4-5` (the header)
- Modify: `skills/pretty-icons/examples/garage/traffic-light.svg`
- Modify: `skills/pretty-icons/rules-filled.md:71-85` (the worked example, its sentence and its prose)
- Modify: `test/pretty-icons/fixtures/tonal-green/{camera,compass,map}.svg`
- Test: `test/pretty-icons/filled.test.mjs`, `test/pretty-icons/modifiers.test.mjs`

**Interfaces:**
- Consumes: Task 1's stroke line.
- Produces: `classify(elements)` → `{ shadows, tones, shades, contours, shapes, dots, solids, lines, marks, painted, highlights, role, paint, details }` (no `cores`). `filledChecks` prints `solid  <icon>  <el>[ r N] filled in the line tone → a body (tone, shade, contour), or a dot of r ≤ 2.5`, `construction  <icon>  <el> stroke <hex> → the fill tone only as a fill` (or `the shade tone`), and `stroke  <icon>  <el> stroke-width 2 → 1.5, or 2 on a contour` for an open line or mark at 2. `linesOf` returns plain SVG, never a mask. Task 7 quotes these lines.

- [ ] **Step 1: Redraw the worked traffic light**

Write `skills/pretty-icons/examples/garage/traffic-light.svg`:

```svg
<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M8.75 18H13.75M8.75 30H13.75M34.25 18H39.25M34.25 30H39.25" />
  <rect x="13.75" y="5" width="20.5" height="38" rx="8" fill="#ececea" stroke="none" />
  <path d="M26.25 5A8 8 0 0 1 34.25 13V35A8 8 0 0 1 26.25 43Z" fill="#cfcfcb" stroke="none" />
  <rect x="13.75" y="5" width="20.5" height="38" rx="8" stroke-width="2" />
  <circle cx="24" cy="13" r="4" fill="#ffffff" />
  <circle cx="24" cy="24" r="4" fill="#ffffff" />
  <circle cx="24" cy="35" r="4" fill="#ffffff" />
  <circle cx="24" cy="13" r="2" fill="#25262a" stroke="none" />
</svg>
```

In `skills/pretty-icons/rules-filled.md`:
- Line 71: "is the whole construction in seven elements: the brackets, the tone, the shade, the contour, three lamps:" becomes "is the whole construction in eight elements: the brackets, the tone, the shade, the contour, three lenses and the lit lamp's dot:".
- Lines 73–83: the svg block becomes the file above, line for line.
- Line 85: "The lamp that is on is solid line; the two that are off are paper, drawn by the root's line." becomes "The three lenses are paper, drawn by the root's line; the lamp that is on is a dot in the line tone inside the top lens."

- [ ] **Step 2: Write the failing tests**

In `test/pretty-icons/filled.test.mjs`:

The header comment and `add` change. `add` now replaces the lit lamp's dot, so an added element is still `@9`:

```js
// The worked example: brackets, tone, shade, contour, three lenses, the lit lamp's dot.
const LIGHT = read("traffic-light");
const TONE = '<rect x="13.75" y="5" width="20.5" height="38" rx="8" fill="#ececea" stroke="none" />';
const SHADE = '<path d="M26.25 5A8 8 0 0 1 34.25 13V35A8 8 0 0 1 26.25 43Z" fill="#cfcfcb" stroke="none" />';
const CONTOUR = '<rect x="13.75" y="5" width="20.5" height="38" rx="8" stroke-width="2" />';
const LIT = '<circle cx="24" cy="13" r="2" fill="#25262a" stroke="none" />';
const add = (el) => LIGHT.replace(LIT, el);
const check = (svg) => textChecks("traffic-light", svg, 48);
```

The classify test becomes:

```js
test("classify: tone, shade, contour, shape, dot, line; mark", () => {
  const at = (els) => els.map((e) => e.at);
  const t = classify(parse(LIGHT).elements);
  assert.deepEqual(at(t.lines), ["path@2"]);
  assert.deepEqual(at(t.tones), ["rect@3"]);
  assert.deepEqual(at(t.shades), ["path@4"]);
  assert.deepEqual(at(t.contours), ["rect@5"]);
  assert.deepEqual(at(t.shapes), ["circle@6", "circle@7", "circle@8"]);
  assert.deepEqual(at(t.dots), ["circle@9"]);
  assert.deepEqual([...t.paint].map((e) => e.at).sort(), ["circle@9", "path@4", "rect@3"]);
  assert.equal(t.cores, undefined, "no core: the bar is gone");
  assert.deepEqual(at(classify(parse(add('<path d="M17 10V16" stroke="#8b8c90" />')).elements).marks), ["path@9"]);
});
```

The construction test for the highlight: its want reads "a lamp that is off":

```js
  assert.deepEqual(lines(check(add('<path d="M17 10V16" stroke="#ffffff" />'))), ["construction  traffic-light  path@9 stroke #ffffff → no highlight: paper only as a fill (glass, a lamp that is off)"]);
```

The test `"construction: the mark tone only as a stroke; a core only on a bar"` becomes:

```js
test("construction: the mark tone only as a stroke; the fill and shade tones only as a fill", () => {
  assert.deepEqual(lines(check(LIGHT.replace('cy="35" r="4" fill="#ffffff"', 'cy="35" r="4" fill="#8b8c90"'))), ["construction  traffic-light  circle@8 fill #8b8c90 → the mark tone only as a stroke"]);
  assert.deepEqual(lines(check(add('<path d="M24 44V40" stroke="#ececea" />'))), ["construction  traffic-light  path@9 stroke #ececea → the fill tone only as a fill"]);
  assert.deepEqual(lines(check(add('<path d="M24 44V40" stroke="#cfcfcb" />'))), ["construction  traffic-light  path@9 stroke #cfcfcb → the shade tone only as a fill"]);
});

test("solid: the line tone fills only a dot of r ≤ 2.5", () => {
  assert.deepEqual(lines(check(add('<circle cx="24" cy="13" r="3" fill="#25262a" stroke="none" />'))), ["solid  traffic-light  circle@9 r 3 filled in the line tone → a body (tone, shade, contour), or a dot of r ≤ 2.5"]);
  assert.deepEqual(lines(check(LIGHT.replace('<circle cx="24" cy="13" r="4" fill="#ffffff" />', '<circle cx="24" cy="13" r="4" fill="#25262a" />'))), ["solid  traffic-light  circle@6 r 4 filled in the line tone → a body (tone, shade, contour), or a dot of r ≤ 2.5"]);
  assert.deepEqual(lines(check(add('<rect x="22" y="11" width="4" height="4" rx="1" fill="#25262a" />'))), ["solid  traffic-light  rect@9 filled in the line tone → a body (tone, shade, contour), or a dot of r ≤ 2.5"]);
  assert.deepEqual(lines(check(add('<circle cx="24" cy="13" r="2.5" fill="#25262a" stroke="none" />'))), [], "a dot of r 2.5");
  assert.deepEqual(lines(check(add('<circle cx="24" cy="13" r="2.5" fill="#25262a" />'))), [], "a dot drawn with the root's line is a shape, and passes");
});

test("one line weight: an open line or a mark at 2 is refused like 3.5; a root-width part passes", () => {
  for (const w of ["2", "3.5", "2.5"]) assert.deepEqual(lines(check(add(`<path d="M24 44V40" stroke-width="${w}" />`))), [`stroke  traffic-light  path@9 stroke-width ${w} → 1.5, or 2 on a contour`], w);
  assert.deepEqual(lines(check(add('<path d="M24 44V40" stroke-width="2" stroke="#8b8c90" />'))), ["stroke  traffic-light  path@9 stroke-width 2 → 1.5, or 2 on a contour"]);
  assert.deepEqual(lines(check(add('<path d="M24 44V40" />'))), []);
});
```

In the stroke test from Task 1, the last line (an added open path at 2 passes) is now wrong; delete it: the one-weight test above owns it.

In the hierarchy test, the two lines about `circle cx="24" cy="24" r="2"` stay as they are (a closed line at 2 is a contour without a tone, at `circle@9`; at the root's width it is a part), and the line `"an open mark at 2 stays allowed"` is deleted: the one-weight test above refuses it.

The count test stays as written: `add('<path d="M24 44V40" />\n  <path d="M20 44V40" />')` puts two paths in the dot's place, nine elements.

The variants test becomes:

```js
test("the variants for measuring: the object as drawn, and its lines alone", () => {
  assert.equal(parse(objectOf(LIGHT)).elements.length, 8);
  const l = linesOf(LIGHT);
  assert.ok(!/#ececea|#cfcfcb|#ffffff/.test(l), l);
  assert.doesNotMatch(l, /<mask/);
  assert.equal(parse(l).elements.length, 5, "brackets, contour, three lenses: the tone, the shade and the dot are paint");
});
```

The garage, sheets and emit tests stay as they are; the garage test keeps its todo.

In `test/pretty-icons/modifiers.test.mjs`, the two garage assertions that need a garage drawn under the new rules move to tests of their own, with a todo. From `"addModifier refuses a body wholly under the halo, …"`, take out the car line (`await assert.rejects(addModifier(ex("garage", "car"), …circle@7…`) and put it in:

```js
test("addModifier refuses a body wholly under the halo at 48", { todo: "Task 6 redraws examples/garage" }, async () => {
  await assert.rejects(addModifier(ex("garage", "car"), "badge:check"), (e) => e instanceof ModifierError && /circle@7 lies under the badge:check's halo: try another --corner/.test(e.message));
});
```

From `"the modifier rule: opacity, size and corner, …"`, take out the last three lines (the comment `// at 48 a modifier has no opacity`, `const car48 = …` and its assertion) and put them in:

```js
test("the modifier rule at 48: a modifier has no opacity", { todo: "Task 6 redraws examples/garage" }, async () => {
  const rule = (text, G = 16) => modifierFailures("x", parse(text), G).map((f) => f.got);
  const car48 = await addModifier(ex("garage", "battery"), "arrow:up");
  assert.deepEqual(rule(car48.replace('data-modifier="arrow:up"', 'stroke-opacity="0.6" data-modifier="arrow:up"'), 48), ["path@8 stroke-opacity 0.6"]);
});
```

- [ ] **Step 3: Run them to see them fail**

Run: `rtk test node --test test/pretty-icons/filled.test.mjs`
Expected: FAIL in classify (`dots` empty is wrong: `circle@9` is a dot already, but `t.cores` is defined), solid (no `solid` rule), one line weight (an open 2 passes), the construction tone test (the old core message) and variants (no `<mask` is already true, but the highlight want differs).

- [ ] **Step 4: Implement `filled.mjs`**

Replace the header comment (lines 1–19) with:

```js
/**
 * The filled finish: what check.mjs reads from an icon on the 48 grid beyond
 * the rules every grid shares. Five tones (presets.mjs PALETTE), no colour, no
 * offset shadow, no highlight: the light comes from the top, and the side away
 * from it is shaded inside the body. One line weight: the root's 1.5, and 2 on a contour.
 * An icon's elements are told apart by paint:
 *   tone     a body's colour: closed, filled with the fill or paper tone, stroke none.
 *            Its contour follows it.
 *   shade    the side away from the light: filled with the shade tone, stroke none. It sits between a
 *            tone and that tone's contour, so the line covers its edge.
 *   contour  a tone's geometry pasted, no fill, at 2: the line draws it, over the tone and the shade.
 *   shape    a closed element filled and drawn in one: glass or a hole in paper, a base in the shade.
 *   dot      a circle of r 2.5 or less, filled, stroke none: a hub, a lit lamp. The one place the line tone fills.
 *   line     an open stroke in the line tone, at the root's width: a part (a hose, a needle, a sign).
 *   mark     a stroke in the mark tone: ticks, treads, a label. A detail: half a stroke from anything.
 *   solid    refused: anything else filled in the line tone. It is a body, or a dot.
 *   painted  refused: a stroke in the fill or the shade tone.
 * Tone, shade and dot are paint: they are left out of gap and weight.
 */
```

Replace lines 24–60 (the constants through `classify`) with:

```js
const SIDES = 5, DOT = 2.5, CONTOUR = 2;
const TONES = new Map(Object.entries(PALETTE).map(([name, hex]) => [hex, name]));
const hex = (v) => String(v ?? "").trim().toLowerCase();
const isNone = (v) => v === undefined || hex(v) === "none";
const tone = (v) => TONES.get(hex(v));
const fail = (list, rule, icon, got, want) => list.push({ rule, icon, got, want });
const isDot = (el) => el.tag === "circle" && num(el.attrs, "r") <= DOT;

/** Each element's role, by its paint and its place. An element with a transform is a shadow, which this finish has none of. */
export function classify(elements) {
  const out = { shadows: [], tones: [], shades: [], contours: [], shapes: [], dots: [], solids: [], lines: [], marks: [], painted: [], highlights: [], role: new Map() };
  const put = (el, role) => { out[role].push(el); out.role.set(el, role); };
  const open = new Map();
  // a modifier's cut marks every stroke it cut data-cut. "split" is a shape's line (fill and line on one element,
  // split in two), and the paint just before it is that shape; any other cut stroke at 2 is a tone's contour
  const cutLine = (el) => el && el.attrs["data-cut"] === "split";
  for (const [i, el] of elements.entries()) {
    const a = el.attrs, fill = isNone(a.fill) ? null : tone(a.fill) ?? "other", stroke = a.stroke === undefined ? "line" : isNone(a.stroke) ? null : tone(a.stroke) ?? "other";
    if ("transform" in a) put(el, "shadows");
    else if (fill && !stroke && cutLine(elements[i + 1])) put(el, "shapes");
    else if (cutLine(el)) put(el, "lines");
    else if (fill === "line" && !isDot(el)) put(el, "solids");
    else if (fill && !stroke) put(el, fill === "shade" ? "shades" : isDot(el) ? "dots" : "tones");
    else if (fill) put(el, "shapes");
    else if (stroke === "fill" || stroke === "shade") put(el, "painted");
    else if (stroke === "mark") put(el, "marks");
    else if (stroke === "paper") put(el, "highlights");
    else if ("data-cut" in a && num(a, "stroke-width") === CONTOUR) put(el, "contours");
    else if (open.has(geometryKey(el))) { put(el, "contours"); open.delete(geometryKey(el)); }
    else put(el, "lines");
    if (out.role.get(el) === "tones") open.set(geometryKey(el), el);
  }
  out.paint = new Set([...out.tones, ...out.shades, ...out.dots]);
  out.details = out.marks;
  return out;
}
```

In `filledChecks`:
- `preset(G);` becomes `const p = preset(G);`.
- The highlight want becomes `"no highlight: paper only as a fill (glass, a lamp that is off)"`.
- After the mark-tone fill line (`for (const el of els) if (tone(el.attrs.fill) === "mark") …`), add:

```js
  for (const el of els) {
    const s = tone(el.attrs.stroke);
    if (s === "fill" || s === "shade") fail(failures, "construction", icon, `${el.at} stroke ${el.attrs.stroke}`, `the ${s} tone only as a fill`);
  }
  for (const el of c.solids) fail(failures, "solid", icon, `${el.at}${el.tag === "circle" ? ` r ${el.attrs.r}` : ""} filled in the line tone`, `a body (tone, shade, contour), or a dot of r ≤ ${DOT}`);
```

- After the "closed line at 2" loop (old lines 97–98), add the one-weight rule for open strokes:

```js
  // one line weight: an open line or mark at 2 is a part drawn as a contour
  for (const el of [...c.lines, ...c.marks]) if (!isClosed(el) && num(el.attrs, "stroke-width", rootW) === CONTOUR)
    fail(failures, "stroke", icon, `${el.at} stroke-width ${el.attrs["stroke-width"]}`, `${p.stroke}, or ${CONTOUR} on a contour`);
```

- Delete the core check (old lines 108–112, the comment `// a core is a bar's path pasted…` and its loop).
- The fill loop's list and want become:

```js
  for (const el of [...c.tones, ...c.shapes, ...c.dots, ...c.solids, ...c.shades]) {
    if (!isClosed(el)) fail(failures, "construction", icon, `${el.at} fill ${el.attrs.fill}`, "a fill only on a closed element");
    if ("stroke-width" in el.attrs) fail(failures, "construction", icon, `${el.at} stroke-width ${el.attrs["stroke-width"]}`, "the root's line on a filled element; only a contour sets a width");
  }
```

`linesOf` becomes:

```js
/** The icon's lines alone: no fill, no tone, shade or dot, every stroke in the line tone. What weight is read from. */
export function linesOf(text) {
  const { attrs, elements } = parse(text);
  const { paint } = classify(elements);
  const lines = elements.filter((el) => !paint.has(el) && !("transform" in el.attrs) && !isNone(el.attrs.stroke ?? attrs.stroke))
    .map((el) => ({ ...el, attrs: { ...Object.fromEntries(Object.entries(el.attrs).filter(([k]) => k !== "fill" && k !== "fill-opacity")), stroke: PALETTE.line } }));
  return compose({ ...attrs, stroke: PALETTE.line }, lines);
}
```

`skills/pretty-icons/measure.mjs` lines 4–5: "(a tone, a shade, a dot, a core: filled.mjs)" becomes "(a tone, a shade, a dot: filled.mjs)".

- [ ] **Step 5: Mend the tonal-green fixtures**

Three line-tone fills that the new rule refuses, each to the tone the object takes:
- `test/pretty-icons/fixtures/tonal-green/camera.svg` line 2: `<rect x="16" y="8.75" width="16" height="6" rx="2.5" fill="#25262a" />` → `fill="#cfcfcb"` (the top plate, a base in the shade).
- `test/pretty-icons/fixtures/tonal-green/compass.svg` line 5: `<path d="M33.5 14.5L19.5 19.5L28.5 28.5Z" fill="#25262a" />` → `fill="#cfcfcb"` (the needle's dark half).
- `test/pretty-icons/fixtures/tonal-green/map.svg` line 6: the pin `fill="#25262a"` → `fill="#ffffff"`.

Their weight does not move: a shape's fill is not in `linesOf`.

- [ ] **Step 6: Run the suite**

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: PASS, with four todos (the garage test, the garage badge loop, the car halo, the battery at 48). The tonal-green test passes. `rtk proxy node skills/pretty-icons/check.mjs skills/pretty-icons/examples/hairline` prints `ok`.

- [ ] **Step 7: Commit**

```bash
rtk git add skills/pretty-icons/filled.mjs skills/pretty-icons/measure.mjs skills/pretty-icons/examples/garage/traffic-light.svg skills/pretty-icons/rules-filled.md test/pretty-icons/fixtures/tonal-green test/pretty-icons/filled.test.mjs test/pretty-icons/modifiers.test.mjs
rtk git commit -m "feat: the line tone is a line"
```

---

### Task 5: Contrast, measured

**Files:**
- Modify: `skills/pretty-icons/presets.mjs` (add `CONTRAST_BAND`; `contrast` on the 48 preset)
- Modify: `skills/pretty-icons/measure.mjs` (import `shares`; the share per icon; the `line%` column; the rule)
- Create: `test/pretty-icons/fixtures/contrast/{box,wheel,plate}.svg`
- Test: `test/pretty-icons/check.test.mjs`, `test/pretty-icons/filled.test.mjs` (the preset)

**Interfaces:**
- Consumes: Task 2's `shares(svgText, G)` → `{ paint, dark }`.
- Produces: `export const CONTRAST_BAND = [0.2, 0.45]`; `preset(48).contrast` is that band, `preset(16).contrast` is `undefined`. `checkSet` prints `contrast  <icon>  line tone on N% of the paint → 20% to 45%`; at 48 each row gains `"line%"`, an integer. Task 7 quotes the line; Tasks 6, 8 and 9 read the column.

- [ ] **Step 1: Write the fixtures**

Each is the 48 root:

`test/pretty-icons/fixtures/contrast/box.svg` (a body with three lines, 28%):

```svg
<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <rect x="7" y="7" width="34" height="34" rx="6" fill="#ececea" stroke="none" />
  <path d="M24 7A17 17 0 0 1 41 24V35A6 6 0 0 1 35 41H24Z" fill="#cfcfcb" stroke="none" />
  <rect x="7" y="7" width="34" height="34" rx="6" stroke-width="2" />
  <path d="M14 18H34M14 24H34M14 30H34" />
</svg>
```

`test/pretty-icons/fixtures/contrast/wheel.svg` (a small ring and a cross, 65%):

```svg
<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="24" cy="24" r="10" fill="#ececea" stroke="none" />
  <path d="M14 24A10 10 0 0 0 34 24L31 24A7 7 0 0 1 17 24Z" fill="#cfcfcb" stroke="none" />
  <circle cx="24" cy="24" r="10" stroke-width="2" />
  <circle cx="24" cy="24" r="7" fill="#ffffff" stroke="none" />
  <circle cx="24" cy="24" r="7" stroke-width="2" />
  <path d="M17 24H31M24 17V31" />
</svg>
```

`test/pretty-icons/fixtures/contrast/plate.svg` (a tone with no contour and one short line, 1%):

```svg
<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <rect x="5" y="5" width="38" height="38" rx="6" fill="#ececea" stroke="none" />
  <path d="M20 24H28" />
</svg>
```

- [ ] **Step 2: Write the failing tests**

In `test/pretty-icons/filled.test.mjs`, the preset test gains:

```js
  assert.deepEqual(p.contrast, [0.2, 0.45]);
  assert.equal(preset(16).contrast, undefined);
```

In `test/pretty-icons/check.test.mjs`, add `import { addModifier } from "../../skills/pretty-icons/modifiers.mjs";` and:

```js
test("contrast: the line tone's share of the paint, 20% to 45%, too much and too little", async () => {
  const r = await checkSet(fix("contrast"));
  const c = r.failures.filter((f) => f.rule === "contrast").map((f) => `${f.rule}  ${f.icon}  ${f.got} → ${f.want}`);
  assert.deepEqual(c.sort(), ["contrast  plate  line tone on 1% of the paint → 20% to 45%", "contrast  wheel  line tone on 65% of the paint → 20% to 45%"]);
  assert.equal(r.rows.find((x) => x.icon === "box")["line%"], 28);
  // plate fails the text rules too (a tone with no contour), and is still measured
  assert.ok(r.failures.some((f) => f.icon === "plate" && f.rule === "construction"));
});

test("contrast: a badged icon is measured without its badge", async (t) => {
  const dir = tmp(t);
  const box = readFileSync(join(fix("contrast"), "box.svg"), "utf8");
  writeFileSync(join(dir, "box.svg"), box);
  writeFileSync(join(dir, "box-new.svg"), await addModifier(box, "badge:plus", { name: "box-new" }));
  const r = await checkSet(dir);
  assert.ok(!r.failures.some((f) => f.rule === "contrast"), r.failures.map((f) => f.got).join("\n"));
  const row = (n) => r.rows.find((x) => x.icon === n)["line%"];
  assert.ok(Math.abs(row("box") - row("box-new")) <= 2, `${row("box")} and ${row("box-new")}`);
});

test("contrast: duotone has no line% and no contrast", async () => {
  const r = await checkSet(fix("good-16"));
  assert.ok(r.rows.length > 0);
  assert.ok(r.rows.every((x) => !("line%" in x)));
  assert.ok(!r.failures.some((f) => f.rule === "contrast"));
});
```

(`tmp(t)` is the file's helper that makes a temp folder and removes it after the test; `readFileSync`, `writeFileSync` and `join` are already imported.)

- [ ] **Step 3: Run them to see them fail**

Run: `rtk test node --test test/pretty-icons/check.test.mjs test/pretty-icons/filled.test.mjs`
Expected: FAIL: no `contrast` lines, no `line%`, no `p.contrast`.

- [ ] **Step 4: Implement**

`skills/pretty-icons/presets.mjs`, beside the tolerances:

```js
/**
 * The line tone's share of an icon's painted pixels, at the filled finish. The filled reference's forty run 17% to 48%,
 * median near 30: the dark tone is the line and the odd dot, every body light with a contour. Below 20 an icon
 * has too little line; above 45 something large is filled in the line tone, or the lines crowd a small body.
 */
export const CONTRAST_BAND = [0.2, 0.45];
```

and in the 48 preset object, `contrast: CONTRAST_BAND,` beside `weights`.

`skills/pretty-icons/measure.mjs`:
- The import from `./raster.mjs` becomes `import { measure, shares, resvg, NO_RASTER } from "./raster.mjs";`.
- Inside the `try`, after `const m = …;`: `const share = filled ? await shares(base, G) : null;`, and the push becomes `measures.push({ ...s, els, parts, details, paint, m, modified, share });`.
- The loop header becomes `for (const { name, els, parts, details, paint, m, modified, share } of measures) {`.
- The row push becomes:

```js
    rows.push({ icon: name, x0: r2(box.x0), y0: r2(box.y0), w: r2(box.w), h: r2(box.h), keyline: fits ? k.format : "—", ink: r2(ink), dx: r2(dx), dy: r2(dy), ...(share ? { "line%": share.paint ? Math.round((100 * share.dark) / share.paint) : 0 } : {}) });
```

- After the weight loop, before `return { failures, rows };`:

```js
  // contrast: the line tone's share of the paint, the base as written (a modifier left out, like weight)
  if (p.contrast) for (const { name, share } of measures) {
    const s = share.paint ? share.dark / share.paint : 0;
    if (s < p.contrast[0] || s > p.contrast[1]) fail(failures, "contrast", name, `line tone on ${Math.round(s * 100)}% of the paint`, `${pct(p.contrast[0])}% to ${pct(p.contrast[1])}%`);
  }
```

- The header comment gains, after the sentence on weight: "At the filled finish contrast reads the base as written, every tone kept: the line tone's share of its painted pixels (`shares` in raster.mjs)."

- [ ] **Step 5: Run the suite**

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: PASS, the same four todos. If `box`'s `line%` prints 27 or 29, or a fixture's share one point off, the renderer moved: put the printed number in the test and say so in the report. The tonal-green test passes (its shares are 25 to 34). `rtk proxy node skills/pretty-icons/check.mjs skills/pretty-icons/examples/hairline` prints `ok`.

- [ ] **Step 6: Commit**

```bash
rtk git add skills/pretty-icons/presets.mjs skills/pretty-icons/measure.mjs test/pretty-icons/fixtures/contrast test/pretty-icons/check.test.mjs test/pretty-icons/filled.test.mjs
rtk git commit -m "feat: contrast, measured"
```

---

### Task 6: examples/garage at one weight

**Files:**
- Modify: `skills/pretty-icons/examples/garage/{battery,car,fuel,gearshift,oil,speedometer,steering-wheel,tyre,wrench}.svg`
- Modify: `skills/pretty-icons/presets.mjs` (`REFERENCE_INK[48]`)
- Modify: `skills/pretty-icons/rules-filled.md:132` ("the reference, 341.3,")
- Test: `test/pretty-icons/filled.test.mjs`, `test/pretty-icons/modifiers.test.mjs` (todos out, sheet and emit widths)
- Create: `docs/superpowers/baselines/2026-10-09-pretty-icons-identity-reference.md`

**Interfaces:**
- Consumes: Tasks 1–5 (`check.mjs` with stroke, solid, contrast).
- Produces: a garage that passes; `REFERENCE_INK[48] = 328.3`. Task 7 quotes the new numbers.

- [ ] **Step 1: Write the nine icons**

Each file is exactly this. traffic-light is Task 4's.

`battery.svg`:

```svg
<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <rect x="10.75" y="8.75" width="6.5" height="7" rx="2.5" fill="#cfcfcb" />
  <rect x="30.75" y="8.75" width="6.5" height="7" rx="2.5" fill="#cfcfcb" />
  <rect x="5" y="13.75" width="38" height="25.5" rx="6" fill="#ececea" stroke="none" />
  <path d="M5 32.5H43V33.25A6 6 0 0 1 37.25 39.25H10.75A6 6 0 0 1 5 33.25Z" fill="#cfcfcb" stroke="none" />
  <rect x="5" y="13.75" width="38" height="25.5" rx="6" stroke-width="2" />
  <path d="M11 24H17.5M14.25 20.75V27.25M30.5 24H37" />
</svg>
```

`car.svg`:

```svg
<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M5 28.5C5 24.5 8 23 12 22.25C14 13 18 10 24 10C30 10 34 13 36 22.25C40 23 43 24.5 43 28.5C43 31.5 42 35 39 35H9C6 35 5 31.5 5 28.5Z" fill="#ececea" stroke="none" />
  <path d="M43 28.5C43 31.5 42 35 39 35H9C6 35 5 31.5 5 28.5Z" fill="#cfcfcb" stroke="none" />
  <path d="M5 28.5C5 24.5 8 23 12 22.25C14 13 18 10 24 10C30 10 34 13 36 22.25C40 23 43 24.5 43 28.5C43 31.5 42 35 39 35H9C6 35 5 31.5 5 28.5Z" stroke-width="2" />
  <path d="M16 21.5C17.25 15.5 20.25 13.25 24 13.25C27.75 13.25 30.75 15.5 32 21.5Z" fill="#ffffff" />
  <circle cx="13.5" cy="35.5" r="4" fill="#cfcfcb" />
  <circle cx="34.5" cy="35.5" r="4" fill="#cfcfcb" />
  <circle cx="13.5" cy="35.5" r="1.5" fill="#25262a" stroke="none" />
  <circle cx="34.5" cy="35.5" r="1.5" fill="#25262a" stroke="none" />
</svg>
```

`fuel.svg`:

```svg
<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M30.75 11H34.75C37.5 11 39.25 12.75 39.25 15.25V36.75C39.25 38.5 38.25 39.5 36.5 39.5H30.75" />
  <rect x="9.75" y="5" width="21" height="38" rx="6" fill="#ececea" stroke="none" />
  <path d="M9.75 35.5H30.75V37A6 6 0 0 1 24.75 43H15.75A6 6 0 0 1 9.75 37Z" fill="#cfcfcb" stroke="none" />
  <rect x="9.75" y="5" width="21" height="38" rx="6" stroke-width="2" />
  <rect x="14.25" y="9.75" width="12" height="9" rx="2.5" fill="#ffffff" />
  <path d="M15.25 26H25.25" stroke="#8b8c90" />
</svg>
```

`gearshift.svg`:

```svg
<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="24" cy="17" r="12" fill="#ececea" stroke="none" />
  <path d="M12 17A12 12 0 0 0 36 17Z" fill="#cfcfcb" stroke="none" />
  <circle cx="24" cy="17" r="12" stroke-width="2" />
  <path d="M18 13.25V20.75M24 12.5V21.5M30 13.25V20.75M18 17H30" />
  <path d="M24 29V35" />
  <rect x="8.75" y="35" width="30.5" height="8" rx="4" fill="#cfcfcb" />
</svg>
```

`oil.svg`:

```svg
<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <rect x="18" y="5" width="12" height="10" rx="2.5" fill="#cfcfcb" />
  <path d="M15 14H33A6 6 0 0 1 39 20V37A6 6 0 0 1 33 43H15A6 6 0 0 1 9 37V20A6 6 0 0 1 15 14Z" fill="#ececea" stroke="none" />
  <path d="M9 36H39V37A6 6 0 0 1 33 43H15A6 6 0 0 1 9 37Z" fill="#cfcfcb" stroke="none" />
  <path d="M15 14H33A6 6 0 0 1 39 20V37A6 6 0 0 1 33 43H15A6 6 0 0 1 9 37V20A6 6 0 0 1 15 14Z" stroke-width="2" />
  <path d="M24 19.5C26.75 23 28 25.25 28 27.5C28 29.75 26.25 31.5 24 31.5C21.75 31.5 20 29.75 20 27.5C20 25.25 21.25 23 24 19.5Z" fill="#cfcfcb" />
</svg>
```

`speedometer.svg`:

```svg
<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M5 31C5 19.75 12.75 9 24 9C35.25 9 43 19.75 43 31C43 35 41 39 37 39C27 39 21 39 11 39C7 39 5 35 5 31Z" fill="#ececea" stroke="none" />
  <path d="M43 31C43 35 41 39 37 39C27 39 21 39 11 39C7 39 5 35 5 31Z" fill="#cfcfcb" stroke="none" />
  <path d="M5 31C5 19.75 12.75 9 24 9C35.25 9 43 19.75 43 31C43 35 41 39 37 39C27 39 21 39 11 39C7 39 5 35 5 31Z" stroke-width="2" />
  <path d="M13.25 19.25 17 23M24 12.75V18M34.75 19.25 31 23" stroke="#8b8c90" />
  <path d="M24 30L27.75 21.5" />
  <circle cx="24" cy="30" r="2" fill="#25262a" stroke="none" />
</svg>
```

`steering-wheel.svg`:

```svg
<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="24" cy="24" r="19" fill="#ececea" stroke="none" />
  <path d="M5 24A19 19 0 0 0 43 24Z" fill="#cfcfcb" stroke="none" />
  <circle cx="24" cy="24" r="19" stroke-width="2" />
  <circle cx="24" cy="24" r="12" fill="#ffffff" />
  <path d="M12 24H24M36 24H24M24 24V36" />
  <circle cx="24" cy="24" r="2" fill="#25262a" stroke="none" />
</svg>
```

`tyre.svg` (the ring is `node skills/pretty-icons/shapes.mjs ring --hole 10` with its shade as printed):

```svg
<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="24" cy="24" r="19" fill="#ececea" stroke="none" />
  <path d="M5 24A19 19 0 0 0 43 24L34 24A10 10 0 0 1 14 24Z" fill="#cfcfcb" stroke="none" />
  <circle cx="24" cy="24" r="19" stroke-width="2" />
  <circle cx="24" cy="24" r="10" fill="#ffffff" stroke="none" />
  <circle cx="24" cy="24" r="10" stroke-width="2" />
  <path d="M8.25 21.25A16 16 0 0 1 16 10M18.75 8.5A16 16 0 0 1 21.75 8.25" stroke="#8b8c90" />
  <path d="M24 18.25h0M29.5 22.25h0M27.5 28.75h0M20.5 28.75h0M18.5 22.25h0" />
  <circle cx="24" cy="24" r="2" fill="#25262a" stroke="none" />
</svg>
```

`wrench.svg`:

```svg
<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#25262a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M16 40L33.5 23.5C38.5 24.5 44 19 42 12.5L37 17.5C34.5 18 30 13.5 30.5 11L35.5 6C29 4 23.5 9.5 24.5 14.5L8 32C5.5 34.5 13.5 42.5 16 40Z" fill="#ececea" stroke="none" />
  <path d="M29.25 19.25L33.5 23.5L16 40C14.75 41.25 12.25 40 10.25 38Z" fill="#cfcfcb" stroke="none" />
  <path d="M16 40L33.5 23.5C38.5 24.5 44 19 42 12.5L37 17.5C34.5 18 30 13.5 30.5 11L35.5 6C29 4 23.5 9.5 24.5 14.5L8 32C5.5 34.5 13.5 42.5 16 40Z" stroke-width="2" />
  <circle cx="14.25" cy="33.75" r="2.5" fill="#ffffff" />
</svg>
```

- [ ] **Step 2: Check the garage**

Run: `rtk proxy node skills/pretty-icons/check.mjs skills/pretty-icons/examples/garage --print`
Expected: `ok`, and the table's `ink` and `line%`:

| icon | ink | line% |
| --- | --- | --- |
| battery | 321.1 | 27 |
| car | 335.5 | 38 |
| fuel | 350.4 | 35 |
| gearshift | 317.1 | 39 |
| oil | 307.6 | 28 |
| speedometer | 270.4 | 24 |
| steering-wheel | 401.3 | 32 |
| traffic-light | 347.0 | 42 |
| tyre | 402.4 | 31 |
| wrench | 260.1 | 44 |

The median ink is (321.1 + 335.5) / 2 = 328.3. If a printed value differs by more than 0.5, use the printed one in Step 3 and say so in the report.

- [ ] **Step 3: The reference, and the tests that read the garage**

`skills/pretty-icons/presets.mjs:112`: `48: 341.3` → `48: 328.3`.
`skills/pretty-icons/rules-filled.md:132`: "the reference, 341.3," → "the reference, 328.3,".

In `test/pretty-icons/filled.test.mjs`: remove `{ todo: "Task 6 redraws examples/garage" }` from the garage test. In the sheets test, both `'stroke-width="3.5"'` become `'stroke-width="2"'`, and the message "a bar keeps its width on the sheet" becomes "a contour keeps its width on the sheet". In the emit test, `'strokeWidth="3.5"'` → `'strokeWidth="2"'` and `'stroke-width="3.5"'` → `'stroke-width="2"'`.

In `test/pretty-icons/modifiers.test.mjs`: remove the three todos added in Tasks 1 and 4.

- [ ] **Step 4: Run the suite**

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: PASS, no todo. If the car halo test names an element other than `circle@7`, or the battery at 48 a path other than `path@8`, put the printed element in the regex or the list (the car's right wheel is `circle@7`; the battery's arrow is its eighth element) and say so in the report. If a garage icon fails the badge loop, report the line; do not change the icon to suit the test.

- [ ] **Step 5: The three reads**

Run: `rtk proxy node skills/pretty-icons/sheet.mjs skills/pretty-icons/examples/garage --out=<scratch>/garage-sheet` and note the two paths and the key it prints.

Then three fresh agents, each with no access to this conversation or the others' answers, each given only its image:

1. The blind read: `pretty-icons-blind.png` and the prompt in `read.md` "## How", word for word, with N = 10 and the names in alphabetical order (battery, car, fuel, gearshift, oil, speedometer, steering-wheel, traffic-light, tyre, wrench).
2. The craft read: `pretty-icons-sheet.png` and the prompt in `read.md` "## The craft read", word for word, with N = 10 and the icons numbered in the sheet's order.
3. The set read: `pretty-icons-sheet.png` and this prompt, with N = 10: "These N icons are from one app. Name every icon that looks like it comes from a different set than the others, and in five words or fewer say why. Say 'one set' if none does."

Pass: the blind read 10 of 10 with no elimination; the craft read at most 6 of 10 named with a defect; the set read "one set" or one icon named. A failure goes back to Step 1 for that icon only, then Steps 2–5 again with new readers. Record each reader's words.

- [ ] **Step 6: Record**

Create `docs/superpowers/baselines/2026-10-09-pretty-icons-identity-reference.md`:

```markdown
# pretty-icons identity: reference

Spec: `docs/superpowers/specs/2026-10-09-pretty-icons-identity-design.md` · Plan: `docs/superpowers/plans/2026-10-09-pretty-icons-identity.md`

## examples/garage

<the check table from Step 2, as printed>

What changed, per icon: tyre (a ring from the kit, hole 10; was a bar at 3.5 with a core), steering-wheel (a disc with a paper face; a ring weighed 529), gearshift (the gate at 1.5; was 3.5), speedometer (the needle's hub a dot r 2; was r 3.25 in the line tone), traffic-light (paper lenses and a dot), battery, car, oil (their line-tone parts in the shade tone). `REFERENCE_INK[48]` 341.3 → 328.3.

### Reads

<each read: the prompt as sent, the reader's answer verbatim, the verdict>
```

- [ ] **Step 7: Commit**

```bash
rtk git add skills/pretty-icons/examples/garage skills/pretty-icons/presets.mjs skills/pretty-icons/rules-filled.md test/pretty-icons/filled.test.mjs test/pretty-icons/modifiers.test.mjs docs/superpowers/baselines/2026-10-09-pretty-icons-identity-reference.md
rtk git commit -m "feat: examples/garage at one weight"
```

---

### Task 7: The prose follows

**Files:**
- Modify: `skills/pretty-icons/rules-filled.md` (lines named below, and a new "## 11 · contrast")
- Modify: `skills/pretty-icons/SKILL.md` (step 4, the exit-2 line, the hand-over, "What goes wrong")
- Modify: `skills/pretty-icons/read.md` (the set read; "Without a second agent")
- Test: `test/pretty-icons/docs.test.mjs`

**Interfaces:**
- Consumes: the lines printed by Tasks 1, 4 and 5; Task 6's numbers.
- Produces: the docs the trial agent (Task 9) reads.

- [ ] **Step 1: Write the failing tests**

In `test/pretty-icons/docs.test.mjs`, add:

```js
const LIGHT = readFileSync(new URL("../../skills/pretty-icons/examples/garage/traffic-light.svg", import.meta.url), "utf8");
const LIT = '<circle cx="24" cy="13" r="2" fill="#25262a" stroke="none" />';
const light = (el) => textChecks("traffic-light", LIGHT.replace(LIT, el), 48).failures.map(line);

test("rules-filled.md quotes what check.mjs prints for one weight, the solid, the painted stroke and contrast", async () => {
  const filled = doc("rules-filled.md");
  const quoted = [
    ...light('<path d="M24 44V40" stroke-width="3.5" />'),
    ...light('<circle cx="24" cy="13" r="3" fill="#25262a" stroke="none" />'),
    ...light('<path d="M24 44V40" stroke="#ececea" />'),
    ...light('<path d="M17 10V16" stroke="#ffffff" />'),
  ];
  assert.equal(quoted.length, 4);
  const r = await checkSet(new URL("./fixtures/contrast/", import.meta.url).pathname);
  quoted.push(...r.failures.filter((f) => f.rule === "contrast").map(line));
  assert.equal(quoted.length, 6);
  for (const l of quoted) assert.ok(filled.includes(`\`${l}\``), `rules-filled.md quotes ${l}`);
  for (const gone of ["3.5", "core", "tube", "solid small part", "mark of weight"]) assert.ok(!filled.includes(gone), `rules-filled.md still says "${gone}"`);
  assert.ok(filled.includes("## 11 · contrast"));
});

test("read.md: the set read, its prompt word for word, and the words for no reader", () => {
  const read = doc("read.md");
  assert.ok(read.includes("## The set read"));
  assert.ok(read.includes("> These N icons are from one app. Name every icon that looks like it comes from a different set than the others, and in five words or fewer say why. Say 'one set' if none does."));
  assert.ok(read.includes("**not read as a set**"));
});
```

In the SKILL.md test, the strings list gains `"Do the set read"` and `"**not read as a set**"`, and a second assertion: `assert.ok(!skill.includes("a bar at 3.5"), "the bar is gone from What goes wrong");`.

- [ ] **Step 2: Run them to see them fail**

Run: `rtk test node --test test/pretty-icons/docs.test.mjs`
Expected: FAIL: the new lines are not quoted, "3.5" is still in `rules-filled.md`, no set read.

- [ ] **Step 3: rules-filled.md**

Each edit names the line as it reads now.

- Line 5: "A part that is solid and small (a wheel, a terminal, a lamp that is on) is filled in the line tone; glass and a lamp that is off are paper." → "The line tone is the line: it fills only a dot of r 2.5 or less (a hub, a lamp that is on); everything larger is a body, or paper (glass, a lamp that is off, a hole)."
- Line 10, the shade row: drop "; or an open stroke in the shade".
- Line 12, the shape row: "a closed element filled and drawn in one: a wheel, a cap, a lamp, a base | `fill` a tone; no `stroke`" → "a closed element filled and drawn in one: glass, a hole, a base | `fill` paper or the shade tone, never the line; no `stroke`".
- Line 13, the line row: "no `fill`, no `stroke`; `stroke-width` 2 for a mark of weight" → "no `fill`, no `stroke`, no `stroke-width`: the root's line".
- Line 15, the "bar and core" row, is deleted. Line 16, the dot row: "a circle of r 2 or less: a hub, a rivet | `fill` a tone, `stroke="none"`" → "a circle of r 2.5 or less: a hub, a rivet, a lamp that is on | `fill` a tone, `stroke="none"`; the one place the line tone fills".
- Line 22, the preset table: the Weights cell `2, 3.5` → `2`.
- Line 26: "Three weights, one job each. The eye reads the object's outline first, then its parts, then what is heavy in it." → "Two weights, one job each. The eye reads the object's outline first, then its parts."
- Lines 28–32: the 3.5 row of the table is deleted.
- Line 34: "An open stroke at 2 (a sign, a lug, a mark of weight) is a part and passes." → "An open stroke at 2 is refused: a part is drawn at the root's line."
- Line 44, the line tone's "Takes": "every contour, parts, solid small parts" → "every contour, parts, dots".
- Line 46, the shade's "Takes": "the side away from the light, a base, a core" → "the side away from the light, a base".
- Line 95: "Ink runs to each stroke's outer edge: 1 past a contour's geometry, 0.75 past a line's, 1.75 past a bar's." → "Ink runs to each stroke's outer edge: 1 past a contour's geometry, 0.75 past a line's." Delete the sentence "A ring at 3.5 reaches out a bar's half: its radius is 18.25 for the circle, not 19.25."
- Line 104: "An element sets `stroke-width` only to 2 (a sign, a lug, a mark of weight) or 3.5 (a bar); never a cap, a join, an opacity or a dash. A contour is at 2 (the hierarchy); every filled element keeps the root's width." → "An element sets `stroke-width` only to 2, and only on a contour; never a cap, a join, an opacity or a dash. Every other line and every filled element keeps the root's width. The fill and the shade tones are never a stroke."
- Line 106: after the `stroke-width 2.5 → 1.5` line, add `; \`stroke  traffic-light  path@9 stroke-width 3.5 → 1.5, or 2 on a contour\``.
- Line 125, the tube bullet, becomes: "- **Keep it, for a ring** (a rim, a tyre, a hoop): a body with a hole. `node <skill-dir>/shapes.mjs ring --r 19 --hole 10` prints five elements: the tone, the shade (the ring's lower half), the contour, the hole in paper and its contour, both contours at 2. Refused when the hole leaves less than a contour and its gap: `--hole` at most `--r` less 3."
- Line 126, the solid small part bullet, becomes: "- **Keep it, for a small dark part:** a hub, a rivet, a lamp that is on: a dot, a circle of r 2.5 or less in the line tone, `stroke=\"none\"`. A wheel, a lens, a band or a cap larger than that is a body (tone, shade, contour), or paper. Glass and a hole: paper."
- Line 128, the rejected list: the highlight line's want reads "(glass, a lamp that is off)"; the core line becomes `construction  traffic-light  path@9 stroke #ececea → the fill tone only as a fill`; add `solid  traffic-light  circle@9 r 3 filled in the line tone → a body (tone, shade, contour), or a dot of r ≤ 2.5`.
- Line 132: "tones, shades, dots and cores dropped, every other stroke read in the line tone, a core cut out of its bar." → "tones, shades and dots dropped, every other stroke read in the line tone." and "a line at 2 weighs 2, a bar and its core 2 (its two edges), a shape its outline at 1.5" → "a shape its outline at 1.5".
- Line 134: "The details carry the other 90 or so: a line 60 long, or a bar 45 long." → "The details carry the other 80 or so: a line 55 long." and "A bulky one with bars or a second body" → "A bulky one with a second body".
- Line 136: "`-30%` of 341 leaves the icon about 100 short, so add about 100, a third of the reference, which is about 42% of the icon's own ink" → "`-30%` of 328 leaves the icon about 100 short, so add about 100, a third of the reference, which is about 43% of the icon's own ink".
- Line 137: "a slot as a tube, a hole, a tick. The wrench gained a slot as a tube and passed." → "a hole, a slot, a tick. The wrench gained a hole and passed."
- Line 138: "or a bar across it: a ferrule, a band." → "or a band across it, as a second body: a ferrule."
- Line 139: "a double ring, a third spoke, a fourth tread: thin it to a tube, or drop one. For a bulky object: fewer bars, a line at 1.5 rather than 2 (a quarter less), a smaller second body or detail. `examples/garage/gearshift.svg` weighs 408 with its gate drawn as bars at 3.5; with the middle bar dropped it weighs 379, and with the gate at 2, 351." → "a double ring, a third spoke, a fourth tread: drop one, or shrink the hole. For a bulky object: a smaller second body or detail. `examples/garage/tyre.svg` weighed 440 (+34%) with a hole of 13 and 402 with a hole of 10; `gearshift.svg` weighs 317 with its gate at the root's line."
- Line 140: the wrench lines become `weight  wrench  ink 236.62 (-27.9%) → within ±25% of the set's median 328.29` and `weight  wrench  ink 236.62 (-27.9%) → within ±25% of the reference 328.3`. Produce them before writing: copy `examples/garage` to a temp folder, delete the wrench's `<circle cx="14.25" …>`, run `rtk proxy node skills/pretty-icons/check.mjs <tmp>`, and quote the two wrench lines as printed. The brush line stays.
- Line 147: "a handle as a body or a bar at 3.5 rather than a line" → "a handle as a body rather than a line".
- Line 159: "Tones, shades, dots and cores are paint" → "Tones, shades and dots are paint".
- Line 161: "the steering wheel's spokes start on the ring's centreline" → "the steering wheel's spokes start on the face's centreline".

After "## 10 · set" and its line, before "## How check.mjs measures", add:

```markdown
## 11 · contrast

The line tone is 20% to 45% of the icon's paint, `CONTRAST_BAND` in `presets.mjs`. The paint is every pixel of the icon as written at half alpha or more; a pixel is in the line tone when it is darker than the midpoint of the line and the mark tones. A modified icon is measured without its modifier. `check.mjs --print` gives the share as `line%`. The filled reference's forty run 17% to 48%, median near 30; `examples/garage` runs 24 to 44.

- **Keep it, for a dark icon:** a part filled in the line tone becomes a body (tone, shade, contour) or paper; a part that must stay dark shrinks to a dot. A small body crowded with line takes fewer lines or grows to its keyline.
- **Keep it, for a pale icon:** give it a line: the contour it lacks, a printed detail, a part.
- **Rejected when:** `contrast  wheel  line tone on 65% of the paint → 20% to 45%`, a ring of r 10 and a cross; `contrast  plate  line tone on 1% of the paint → 20% to 45%`, a tone with no contour and one short line.
```

(If Task 5 printed other percentages for `wheel` or `plate`, quote those.)

"## How check.mjs measures": after "weight from a render of its lines alone (`linesOf` in `filled.mjs`);" add "contrast from a render of the base as written, its tones kept (`shares` in `raster.mjs`);", and the last sentence becomes "`--print` shows the object's box, its line ink and its `line%`."

Then: `rtk proxy grep -n "3\.5\|core\|tube\|solid small\|mark of weight\|341" skills/pretty-icons/rules-filled.md` prints nothing.

- [ ] **Step 4: read.md**

After "## The craft read" and its paragraphs, before "## Without a second agent", add:

```markdown
## The set read

The craft read judges each icon. It cannot say one belongs to another set. After the craft read passes, open a third fresh agent, one that has seen neither your work nor the other readers' answers. Give it `pretty-icons-sheet.png`, numbered in the sheet's order as for the craft read, and this prompt, with N filled in:

> These N icons are from one app. Name every icon that looks like it comes from a different set than the others, and in five words or fewer say why. Say 'one set' if none does.

The set passes when the reader says "one set" or names one icon; say that icon in the hand-over with the reader's words. Two or more named go back to the drawing (`SKILL.md` step 3), each with the reader's words: "thick lines" is the line weight (`rules-filled.md` 03), "too dark" or "solid" is contrast (11), "cartoon" or "another library" is usually a second contour or a part filled in the line tone (04). Then the whole set runs `check.mjs`, `sheet.mjs` and the three reads again, each with a **new** reader. "Floating" said of a modifier does not count, as in the craft read.
```

"## Without a second agent": "in these words: **not read blind** and **not read for craft**." → "in these words: **not read blind**, **not read for craft** and **not read as a set**."

- [ ] **Step 5: SKILL.md**

- Step 4, after item 4, add: "5. Do the set read in `read.md`, with a third new reader, once the craft read passes. Two or more icons named go back to step 3, then all of step 4."
- The exit-2 line: "say `not measured`, **not read blind** and **not read for craft**." → "say `not measured`, **not read blind**, **not read for craft** and **not read as a set**."
- The hand-over, after the craft reader's line, add "- the set reader's result: \"one set\", or the icon named and why; or **not read as a set**;", and the last line becomes "- anything not measured, not read blind, not read for craft or not read as a set."
- "What goes wrong": the row "| doubling a ring or a spoke to make it read thicker | `rules-filled.md` 04: a bar at 3.5 and its core, a tube |" is replaced by two rows:

```markdown
| filling a wheel, a lamp or a band in the line tone because it is "solid" | `rules-filled.md` 04: a body, or a dot of r 2.5 or less |
| drawing a rim or a frame as a thick bar | `rules-filled.md` 04: a ring, from the kit (`shapes.mjs ring`) |
```

- The row "moving an icon's ink the wrong way…": "the percentage of 341 is how much" → "the percentage of 328 is how much".

- [ ] **Step 6: Run the suite**

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
rtk git add skills/pretty-icons/rules-filled.md skills/pretty-icons/SKILL.md skills/pretty-icons/read.md test/pretty-icons/docs.test.mjs
rtk git commit -m "docs: one weight, the dot, the ring, contrast and the set read"
```

---

### Task 8: The after sets, redrawn

**Files:**
- Create: `docs/superpowers/baselines/2026-10-09-identity-after/car/*.svg`, `…/bakery/*.svg`
- Modify: `docs/superpowers/baselines/2026-10-09-pretty-icons-identity-reference.md`

**Interfaces:**
- Consumes: the whole skill as Tasks 1–7 left it (`check.mjs`, `shapes.mjs ring`, `sheet.mjs`, `read.md`).
- Produces: two sets that pass, read three ways.

- [ ] **Step 1: Copy**

```bash
mkdir -p docs/superpowers/baselines/2026-10-09-identity-after
cp -R docs/superpowers/baselines/2026-10-08-craft-after/car docs/superpowers/baselines/2026-10-09-identity-after/car
cp -R docs/superpowers/baselines/2026-10-08-craft-after/bakery docs/superpowers/baselines/2026-10-09-identity-after/bakery
```

Run: `rtk proxy node skills/pretty-icons/check.mjs docs/superpowers/baselines/2026-10-09-identity-after/car` and the same for `bakery`. Expected: exit 1, with `solid`, `stroke` and `contrast` lines; these are the work list. `2026-10-08-craft-after` is never edited.

- [ ] **Step 2: Redraw the car set**

Read `skills/pretty-icons/rules-filled.md` first. Edit only the copies. Keep each icon's metaphor, keyline and gesture; change what the new rules refuse:

- `roda` (76%): the black tyre (`circle r 19 fill #25262a`) becomes a ring from the kit, `node skills/pretty-icons/shapes.mjs ring --r 19 --hole 11.5` pasted; the inner hub `circle r 11.5` and its shade go, and the hub `circle r 3.5 fill #25262a` becomes a dot `r="2.5" stroke="none"`. A ring and a dot alone may come in light: add treads in the mark tone (one path) if `weight` says so.
- `cone` (64%): the band (`M18.5 15.5H29.5L31 22H17Z`, line tone) becomes paper, `fill="#ffffff"`; the base `rect … fill #25262a` becomes `fill="#cfcfcb"`.
- `semaforo` (57%): the base `rect … fill #25262a` becomes `fill="#cfcfcb"`; the three lenses `r 3.75 fill #25262a` become paper `fill="#ffffff"` at the root's line, and the top lens gains a dot `<circle cx="24" cy="12.25" r="2" fill="#25262a" stroke="none" />` after them (as the worked traffic light).
- `chave` (51%): the bit (`M25 30L32.5 37.5L29.5 40.5L22 33Z`, line tone) becomes `fill="#cfcfcb"`.
- `marcha` (49%): the stick `rect … fill #25262a` becomes `fill="#cfcfcb"`.
- `estrada`: the three dashes in the line tone become one path of three open strokes at the root's line, on the road's centreline: `<path d="M24 11V14M24 19.5V25M24 30.5V36" />`, or the dashes in paper; keep whichever `check.mjs` passes and reads as a road.
- `extintor`: the hose at `stroke-width="3.5"` loses its width (the root's line); the nozzle (`M20.5 9.25L8.5 10V15L20.5 11.25Z`, line tone) and the cap `rect … fill #25262a` become `fill="#cfcfcb"`.
- `carro`: the two wheels `rect … fill #25262a` become `fill="#cfcfcb"`.
- `triangulo`: the inner triangle keeps its paper fill and loses its second contour: one element, `<path d="M24 14L32.75 31.5H15.25Z" fill="#ffffff" />` (a shape at the root's line), in place of the two.
- `banco`: unchanged unless `check.mjs` names it.

After each icon, run `rtk proxy node skills/pretty-icons/check.mjs docs/superpowers/baselines/2026-10-09-identity-after/car` and fix by the line until the set prints `ok`. Then `rtk proxy node skills/pretty-icons/check.mjs <dir> --print` and note every `line%`.

- [ ] **Step 3: Redraw the bakery set**

- `trigo` (56%): the stem `M5.5 42.5L28.25 19.75` at `stroke-width="2"` loses its width.
- `farinha`: the tie `M16.5 16.5H31.5` at 3.5 loses its width.
- `forno`: the two knobs `M12 15.5h0M18 15.5h0` at 3.5 become two dots, `<circle cx="12" cy="15.5" r="1.75" fill="#25262a" stroke="none" />` and the same at cx 18 (one more element; at most eight).
- `rosquinha`: the sprinkles at 3.5 lose their width; if the icon reads empty, draw them in the mark tone at the root's line.
- `bolo`: the cherry `circle r 3.5 fill #25262a` becomes a dot `r="2.5" stroke="none"`.
- `batedor`: the wires' path at `stroke-width="2"` (line 4) loses its width.
- `pao`: the scores at `stroke-width="2"` (line 5) lose their width.
- `croissant`, `pao-de-forma`, `rolo`: unchanged unless `check.mjs` names them.

Run `check.mjs` on the bakery set until `ok`, then `--print` and note every `line%`.

- [ ] **Step 4: The three reads, per set**

For each set: `rtk proxy node skills/pretty-icons/sheet.mjs <dir> --out=<scratch>/<set>-sheet`, then the blind, craft and set reads exactly as Task 6 Step 5, with three new readers per set and the names of that set (car: banco, carro, chave, cone, estrada, extintor, marcha, roda, semaforo, triangulo; bakery: batedor, bolo, croissant, farinha, forno, pao, pao-de-forma, rolo, rosquinha, trigo). Pass as Task 6 Step 5. A failed icon goes back to Step 2 or 3, then `check.mjs` and all three reads again with new readers. Stop after three rounds per set and record what is left for the person.

- [ ] **Step 5: Record**

Append to `docs/superpowers/baselines/2026-10-09-pretty-icons-identity-reference.md`:

```markdown
## The after sets

### car

<check --print table> · <what changed, per icon, one line each> · <the three reads: prompt, answer verbatim, verdict>

### bakery

<the same>
```

- [ ] **Step 6: Commit**

```bash
rtk git add docs/superpowers/baselines/2026-10-09-identity-after docs/superpowers/baselines/2026-10-09-pretty-icons-identity-reference.md
rtk git commit -m "docs: the after sets at one weight, read as sets"
```

---

### Task 9: The trial

**Files:**
- Modify: `docs/superpowers/baselines/2026-10-09-pretty-icons-identity-reference.md`

**Interfaces:**
- Consumes: the skill as Tasks 1–7 left it.
- Produces: one recorded trial.

- [ ] **Step 1: Run the trial**

Make an empty folder: `mktemp -d` (under the scratch directory). Open one fresh agent with no access to this conversation, working in that folder, and give it this prompt, the repo path filled in:

> Use the skill in `<repo>/skills/pretty-icons/SKILL.md` to draw six icons for a music shop app, in the filled finish: guitar, drum, microphone, headphones, record, metronome. Follow every step. Before each `check.mjs` run, say "check run N". Stop at the hand-over and report what `check.mjs` printed each time.

- [ ] **Step 2: Score it**

Read its report and its `pretty-icons/` folder. Run `rtk proxy node skills/pretty-icons/check.mjs <folder>/pretty-icons --print` yourself. It passes when `check.mjs` printed `ok` on run 1 or 2, and its set read (run by the agent, or, if it did not run one, by a new fresh reader on its sheet with the prompt from Task 6 Step 5) says "one set" or names one icon. One trial, recorded as it comes: a failure is recorded with the rule that held it, for the person to judge. The loop does not reopen.

- [ ] **Step 3: Record and commit**

Append to the reference file:

```markdown
## The trial

<the prompt as sent> · <each check run's output, verbatim> · <the --print table> · <the set read: prompt, answer verbatim> · <verdict: passed, or held by which rule>
```

```bash
rtk git add docs/superpowers/baselines/2026-10-09-pretty-icons-identity-reference.md
rtk git commit -m "docs: the trial, six music icons by a fresh agent"
```

---

### Task 10: Final verification

**Files:**
- Modify: `docs/superpowers/baselines/2026-10-09-pretty-icons-identity-reference.md`

- [ ] **Step 1: The suite and every set**

Run, each as printed:
- `rtk test node --test 'test/**/*.test.mjs'`: every test passes, no todo.
- `rtk proxy node skills/pretty-icons/check.mjs skills/pretty-icons/examples/garage`: `ok`.
- `rtk proxy node skills/pretty-icons/check.mjs skills/pretty-icons/examples/hairline`: `ok`, and `git diff 81ea306 -- skills/pretty-icons/examples/hairline` is empty.
- `rtk proxy node skills/pretty-icons/check.mjs test/pretty-icons/fixtures/tonal-green`: `ok`.
- `rtk proxy node skills/pretty-icons/check.mjs docs/superpowers/baselines/2026-10-09-identity-after/car` and `…/bakery`: `ok`.

- [ ] **Step 2: The spec's success list, line by line**

For each of the spec's five "What success is" lines, write one line: met or not, and the evidence (a test name, a command and its output, a read's verdict). Line 5 is met when the duotone tests did not change: `git diff 81ea306 -- test/pretty-icons/fixtures/good-16 test/pretty-icons/fixtures/hairline-before` is empty and the hairline check is `ok`.

- [ ] **Step 3: Record and commit**

Append "## Final verification" with Steps 1 and 2 to the reference file.

```bash
rtk git add docs/superpowers/baselines/2026-10-09-pretty-icons-identity-reference.md
rtk git commit -m "docs: final verification of pretty-icons identity"
```

Then stop. Pushing, a PR, or copying icons into an app waits for the person.
