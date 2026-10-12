# pretty-icons: the bulk finish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A third finish, **bulk**, on grid 24: two inks in `currentColor` (a body at `fill-opacity=".4"`, an accent full), no contour, a knockout band of 1.5 cut by `knockout.mjs` wherever an accent crosses a body, squircles for rects, share and the band measured by `check.mjs`, an `examples/bulk` set of ten, the rules, the trial, and `SKILL.md` offering it.

**Architecture:** The finish is read from the root (`fill="currentColor"`, no `stroke`) by `finishOf`, and `preset(G, finish)` returns `BULK_PRESETS[24]`. `bulk.mjs` is the pair of `filled.mjs`: it classifies elements as body, accent or line and holds the text rules; `measure.mjs` grows bulk branches for gap, air, share and the band; `knockout.mjs` cuts the band with paper.js (installed into the resvg cache by `raster.mjs`) and writes the body back with `data-cut="knockout"` and the uncut geometry in `data-body`. `shapes.mjs` gains `squircle`, `--finish bulk` and `--accent`; modifiers, sheet, proof and emit learn the finish. The duotone and filled paths are not touched.

**Tech Stack:** Node 20+ ESM, `node:test` + `node:assert/strict`, `@resvg/resvg-js@2.6.2` (cached), `paper@0.12.18` (cached, new), no app dependency.

**Spec:** `docs/superpowers/specs/2026-10-12-pretty-icons-bulk-design.md`

## Global Constraints

- Grid 24 only at bulk: pad 2, live 20, step 0.25; keylines as ink sizes: circle 20, square 18, portrait 16 × 20, landscape 20 × 16, ±0.5.
- Root at bulk: `viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"`, no `stroke`, no `stroke-width`. A line declares `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"` itself. A body declares `fill-opacity=".4"`. No other paint attribute anywhere.
- Knockout band 1.5, measured ±0.25 at pixel level. Gap at bulk 1.5 edge to edge, or touching (centrelines within 0.1). Crumb: no cut piece under 1 across.
- Squircle radius 5 when the smaller side is 12 or more, 3 below, or a pill; any `rect` is refused at bulk.
- Share (accent ink over whole ink) in [0.25, 0.6]. Weight: ±15% of the set's median, ±20% of the reference, the reference being the median of `examples/bulk`.
- Rule 04 sizes: a filled accent no side under 2, a line accent no shorter than 3. Rule 09: at most three elements, at most eight drawing commands across the accents.
- Modifiers at bulk: `badge:plus`, `badge:minus`, `badge:check`, `badge:x`, `dot` only, as full accents with a knockout. No shadow at bulk.
- `data-cut`/`data-body` are stripped on emit; `fill-opacity` becomes `fillOpacity` in React.
- `paper@0.12.18` is installed into the cache `raster.mjs` keeps, never into the app.
- Every check message keeps the existing shape `rule  icon  got → want`; the exact strings in this plan are quoted by `rules-bulk.md` and its docs test.
- The reference set that inspired this finish is named nowhere in the skill, tests, docs or commits: write "a reference set of forty icons".
- Commit messages: `type(scope): subject`, lower case, no attribution lines. All commits on `pretty-icons-polish`; no merge, no push, no PR.
- Never edit `docs/superpowers/baselines/2026-10-08-*` or the installed `~/.claude/skills/pretty-icons` (a link into this repo).
- The hook rejects `git` in Bash: use `/usr/bin/git`. `rtk grep` collapses output: use `/usr/bin/grep -n`.
- Tests run with `rtk test node --test 'test/**/*.test.mjs'` from the repo root; a single file with `rtk test node --test test/pretty-icons/<module>.test.mjs`.

## Review Focus

1. A folder mixing bulk and duotone files at 24 (one root says bulk, nine say duotone): `check.mjs` should pick the majority finish, report the odd file under `stroke`, and never crash. Pinned in Task 4.
2. An accent that touches a body (centrelines within 0.1) but does not cross it: not a crossing, no cut demanded, gap passes. Pinned in Task 4 (text) and Task 5 (knockout leaves the file byte for byte).
3. A line accent crossing a body clean through, leaving two pieces each ≥ 1 across: one element with two subpaths, not two elements, and the band is 1.5 on both sides. Pinned in Task 5.
4. `knockout.mjs` on a file that fails the text rules (a `rect`, a contour): refuses with the check line and writes nothing. Pinned in Task 5.
5. A badge whose halo would cover an accent line (not a body): `addModifier` refuses rather than cutting a full accent. Pinned in Task 7.

---

## File Structure

| File | Change | Responsibility |
| --- | --- | --- |
| `skills/pretty-icons/presets.mjs` | Modify | `BULK_PRESETS`, `KNOCKOUT_TOL`, `BULK_REFERENCE_INK`, `finishOf(root)`, `preset(G, finish)`, `inset/radiusFor/radiiFor/body/bodySvg/referenceInk` take a finish |
| `skills/pretty-icons/geometry.mjs` | Modify | `squircle(x, y, w, h, r)` → path d; `isSquircle` is not needed (the check refuses `rect`, not a wrong path) |
| `skills/pretty-icons/raster.mjs` | Modify | `PAPER_PKG`, `paper()`, `band(cutSvg, uncutSvg, accentSvg, G, want, tol)` |
| `skills/pretty-icons/shapes.mjs` | Modify | `squircle` primitive, `--finish bulk`, `--accent` |
| `skills/pretty-icons/bulk.mjs` | Create | `isKnockout`, `uncut`, `classify`, `crosses`, `bulkChecks` (the text rules at bulk) |
| `skills/pretty-icons/check.mjs` | Modify | finish from the root, `setFinish`, `--finish=`, bulk dispatch, `data-cut` exemptions |
| `skills/pretty-icons/knockout.mjs` | Create | `stadium`, `haloOf`, `cutBody`, `knockout(text)`, CLI |
| `skills/pretty-icons/measure.mjs` | Modify | bulk branches: gap, air, share, the band, weight reference |
| `skills/pretty-icons/modifiers.mjs` | Modify | the five kinds at bulk, placement with pad 2, knockout instead of stroke cuts, refusals |
| `skills/pretty-icons/sheet.mjs` | Modify | `place` honours the root fill; `ROWS.bulk`; finish from `setFinish` |
| `skills/pretty-icons/proof.mjs` | Modify | `REFERENCE.bulk`, `BG.bulk`, the band shown in the construction view |
| `skills/pretty-icons/emit.mjs` | Modify | strip `data-cut`/`data-body` |
| `skills/pretty-icons/rules-bulk.md` | Create | the rules where bulk differs |
| `skills/pretty-icons/read.md` | Modify | the studio read and its prompt |
| `skills/pretty-icons/examples/bulk/*.svg` | Create | ten icons |
| `skills/pretty-icons/SKILL.md` | Modify | step 1 offers bulk, step 3 gains knockout, What-goes-wrong rows |
| `docs/superpowers/pretty-icons/CONTEXT.md` | Modify | a bulk line |
| `docs/superpowers/baselines/2026-10-12-pretty-icons-bulk-reference.md` | Create | the example's rounds and the trial |
| `test/pretty-icons/{presets,geometry,raster,shapes,bulk,check,knockout,measure,modifiers,sheet,proof,emit,docs,examples}.test.mjs` | Create/Modify | one file per module, as the spec's Testing section lists |

## Deviations from the spec

1. **No `simplify`.** paper.js's `simplify` refits a path from its points and loses the offset; the spike showed a 0.2 error. A curved accent is flattened at tolerance 0.05 (not 0.25) and its halo is stadiums per flattened segment, united; a circle accent's halo is an exact circle at r + 1.5. The spec's `knockout.mjs` row and its testing line are amended in this commit to say so. The test asserts the halo within 0.05 of the exact offset at 65 samples, which flattening at 0.05 meets.
2. **Per-path command cap at bulk is 14.** A squircle is 14 commands (M, four H/V, eight C, Z), over the duotone cap of 8. `BULK_PRESETS[24].commands = 14` for the per-path count; rule 09's "eight drawing commands across the accents" is its own count in `bulkChecks`. The spec names only the accents' eight; the per-path 14 is the plan's.
3. **Air at bulk is in grid units, without the crossing accents.** `air()` scales by the stroke; at bulk it is called with `p.gap / AIR` = 1 as the unit so a paper of 1.5 and a counter of 2 come out in grid units as the spec says, and the SVG it renders holds the cut bodies and the accents that do not cross them. A crossing accent's band is the knockout rule's, not air's.
4. **A cut body is exempt from the curve rules and from the per-path cap.** Its cubics come from paper.js, not a drawer; the join rules would flag the band's corners. The uncut `data-body` geometry is what the curve rules read instead.
5. **The knockout message's path** is `<folder>/<icon>.svg` relative to where `check.mjs` was run, so `node knockout.mjs pretty-icons/edit.svg` can be pasted.
6. **`BULK_REFERENCE_INK[24]` starts at 170** (a bulk body at 0.4 over 20 × 20 is ~160 alone; the estimate is replaced by the example's median in Task 11, as `REFERENCE_INK` was).
7. **Emit keeps `data-modifier`.** The spec says the marks are stripped "as `data-modifier` is today", but `emit.mjs` keeps every `data-*` today and a test pins it (`data-k="1"` reaches JSX). Task 9 strips `data-cut` and `data-body` only.
8. **`SKILL.md` before the trial.** The spec publishes SKILL.md last; the trial agents run "the skill as the plan leaves it" and are asked for the bulk finish, which SKILL.md must offer. Task 12 is SKILL.md, Task 13 the trial, the reference doc and CONTEXT.md.
9. **The proof's reference row may be empty.** `examples/bulk` is drawn with the proof (Task 11) after the proof learns bulk (Task 8), so `referenceSet(24, "bulk")` returns `[]` while the folder does not exist, and the row shows its label alone. Task 11's test asserts three once it exists.

---

### Task 1: the bulk preset, `finishOf`, and the squircle geometry

**Files:**
- Modify: `skills/pretty-icons/presets.mjs`
- Modify: `skills/pretty-icons/geometry.mjs`
- Test: `test/pretty-icons/presets.test.mjs`, `test/pretty-icons/geometry.test.mjs`

**Interfaces:**
- Consumes: the existing `PRESETS`, `FILLED_PRESETS`, `GRIDS`, `preset(G)`, `inset(G)`, `radiusFor(G, size)`, `radiiFor(G, size)`, `body(G, format)`, `bodySvg(G, format)`, `referenceInk(G)`, `REFERENCE_INK`, `GRID_STEP`.
- Produces:
  - `BULK_PRESETS = { 24: { finish: "bulk", stroke: 2, weights: [2], pad: 2, knockout: 1.5, gap: 1.5, share: [0.25, 0.6], radius: [5, 3], radiusAt: 12, commands: 14, keylines: {...} } }`
  - `KNOCKOUT_TOL = 0.25`; `BULK_REFERENCE_INK = { 24: 170 }`
  - `finishOf(root: Record<string,string>) → "bulk" | "duotone" | null`
  - `preset(G: number, finish?: string) → object` (finish defaults to `GRIDS[G].finish`, else `"duotone"`; throws `no bulk preset for grid ${G}: bulk is 24`)
  - `inset(G, finish?)`, `radiusFor(G, size, finish?)`, `radiiFor(G, size, finish?)`, `body(G, format, finish?)`, `bodySvg(G, format, finish?)`, `referenceInk(G, finish?)`
  - `squircle(x, y, w, h, r) → string` in `geometry.mjs` (absolute `M H C V C H C V C Z`, every number on the quarter grid, 2 decimals max)

- [ ] **Step 1: Write the failing preset tests**

Append to `test/pretty-icons/presets.test.mjs`:

```js
test("bulk: 24 only, pad 2, stroke 2, knockout 1.5, share band, squircle radii", async () => {
  const { BULK_PRESETS, KNOCKOUT_TOL } = await import("../../skills/pretty-icons/presets.mjs");
  assert.deepEqual(Object.keys(BULK_PRESETS).map(Number), [24]);
  const p = preset(24, "bulk");
  assert.equal(p.finish, "bulk");
  assert.equal(p.G, 24);
  assert.equal(p.pad, 2);
  assert.equal(p.live, 20);
  assert.equal(p.step, 0.25);
  assert.equal(p.stroke, 2);
  assert.deepEqual(p.weights, [2]);
  assert.equal(p.knockout, 1.5);
  assert.equal(p.gap, 1.5);
  assert.deepEqual(p.share, [0.25, 0.6]);
  assert.deepEqual(p.radius, [5, 3]);
  assert.equal(p.radiusAt, 12);
  assert.equal(p.elements, 3);
  assert.equal(p.commands, 14);
  assert.deepEqual(p.keylines, { circle: [20, 20], square: [18, 18], portrait: [16, 20], landscape: [20, 16] });
  assert.equal(KNOCKOUT_TOL, 0.25);
  assert.throws(() => preset(16, "bulk"), /no bulk preset for grid 16: bulk is 24/);
  assert.throws(() => preset(48, "bulk"), /no bulk preset for grid 48: bulk is 24/);
  assert.throws(() => preset(24, "filled"), /no filled preset for grid 24/);
});

test("finishOf reads the root; 24 without a hint is duotone", async () => {
  const { finishOf } = await import("../../skills/pretty-icons/presets.mjs");
  assert.equal(finishOf({ fill: "currentColor" }), "bulk");
  assert.equal(finishOf({ fill: "currentColor", "aria-hidden": "true", viewBox: "0 0 24 24" }), "bulk");
  assert.equal(finishOf({ fill: "none", stroke: "currentColor" }), "duotone");
  assert.equal(finishOf({ fill: "currentColor", stroke: "currentColor" }), null);
  assert.equal(finishOf({}), null);
  assert.equal(preset(24).finish, "duotone");
  assert.equal(preset(24, "duotone").stroke, 1.5);
  assert.equal(preset(48).finish, "filled");
});

test("bulk bodies: inset 1, a circle of 10, squircles for the rest, reference ink", async () => {
  const { BULK_REFERENCE_INK, squircle } = await import("../../skills/pretty-icons/presets.mjs");
  assert.equal(inset(24, "bulk"), 1);
  assert.equal(inset(24), 0.75);
  assert.equal(radiusFor(24, 12, "bulk"), 5);
  assert.equal(radiusFor(24, 11.75, "bulk"), 3);
  assert.equal(radiusFor(24, 8), 2);
  assert.deepEqual(body(24, "circle", "bulk"), { tag: "circle", cx: 12, cy: 12, r: 10 });
  const sq = body(24, "square", "bulk");
  assert.equal(sq.tag, "path");
  assert.equal(sq.d, squircle(3, 3, 18, 18, 5));
  assert.equal(body(24, "portrait", "bulk").d, squircle(4, 2, 16, 20, 5));
  assert.equal(body(24, "landscape", "bulk").d, squircle(2, 4, 20, 16, 5));
  assert.equal(bodySvg(24, "circle", "bulk"), '<circle cx="12" cy="12" r="10" fill-opacity=".4" />');
  assert.equal(bodySvg(24, "square", "bulk"), `<path d="${squircle(3, 3, 18, 18, 5)}" fill-opacity=".4" />`);
  assert.equal(BULK_REFERENCE_INK[24], 170);
  assert.equal(referenceInk(24, "bulk"), 170);
  assert.equal(referenceInk(24), 152.6);
});
```

Add `bodySvg` and `referenceInk` to the import line at the top of the file:

```js
import { PRESETS, preset, body, bodySvg, inset, radiusFor, referenceInk, KEYLINE_TOL, WEIGHT_TOL, GRAVITY_TOL } from "../../skills/pretty-icons/presets.mjs";
```

- [ ] **Step 2: Write the failing geometry test**

Append to `test/pretty-icons/geometry.test.mjs`:

```js
test("squircle: on the quarter grid, closed, two cubics per corner, pill when r is half the short side", async () => {
  const { squircle } = await import("../../skills/pretty-icons/geometry.mjs");
  const { pathNumbers } = await import("../../skills/pretty-icons/svg.mjs");
  const d = squircle(3, 3, 18, 18, 5);
  assert.equal(d, "M 8 3 H 16 C 17 3 18 3 19.5 4.5 C 21 6 21 7 21 8 V 16 C 21 17 21 18 19.5 19.5 C 18 21 17 21 16 21 H 8 C 7 21 6 21 4.5 19.5 C 3 18 3 17 3 16 V 8 C 3 7 3 6 4.5 4.5 C 6 3 7 3 8 3 Z");
  for (const n of pathNumbers(d)) assert.equal(Math.round(n * 4) / 4, n, `${n} off the quarter grid`);
  assert.equal(d.match(/[MHVCZ]/g).length, 14);
  assert.equal(squircle(4, 4, 8, 8, 3), "M 7 4 H 9 C 9.5 4 10 4 11 5 C 12 6 12 6.5 12 7 V 9 C 12 9.5 12 10 11 11 C 10 12 9.5 12 9 12 H 7 C 6.5 12 6 12 5 11 C 4 10 4 9.5 4 9 V 7 C 4 6.5 4 6 5 5 C 6 4 6.5 4 7 4 Z");
  assert.equal(squircle(2, 8, 20, 8, 4), "M 6 8 H 18 A 4 4 0 0 1 18 16 H 6 A 4 4 0 0 1 6 8 Z");
  assert.throws(() => squircle(3, 3, 18, 18, 10), /radius 10 over half the short side 18/);
});
```

The strings are what Step 4's function prints: at r = 5, m = 1.5 and a = 4; at r = 3, m = 1 and a = 2.5.

- [ ] **Step 3: Run the tests to verify they fail**

Run: `rtk test node --test test/pretty-icons/presets.test.mjs test/pretty-icons/geometry.test.mjs`
Expected: FAIL. `BULK_PRESETS`, `finishOf`, `squircle` are not exported; `preset(24, "bulk")` ignores the finish.

- [ ] **Step 4: Implement `squircle` in `geometry.mjs`**

Append to `skills/pretty-icons/geometry.mjs`:

```js
const snapQ = (v) => Math.round(v * 4) / 4;
const fmtQ = (v) => String(Math.round(v * 100) / 100);

// A continuous-curvature rounded rect: each corner is two cubics that leave and
// arrive along the tangent, their handles placed so curvature grows from zero at
// the straight side to its peak at the corner's middle. Radius r is the length
// of side the corner eats: m = snap(0.293 r) is the handle at the corner's
// middle, a = snap((r + 2m) / 2) the handle leaving the side.
export function squircle(x, y, w, h, r) {
  const short = Math.min(w, h);
  if (r > short / 2 + 1e-9) throw new Error(`radius ${r} over half the short side ${short}`);
  if (Math.abs(r - short / 2) < 1e-9) {
    // a pill: two arcs
    return w >= h
      ? `M ${fmtQ(x + r)} ${fmtQ(y)} H ${fmtQ(x + w - r)} A ${fmtQ(r)} ${fmtQ(r)} 0 0 1 ${fmtQ(x + w - r)} ${fmtQ(y + h)} H ${fmtQ(x + r)} A ${fmtQ(r)} ${fmtQ(r)} 0 0 1 ${fmtQ(x + r)} ${fmtQ(y)} Z`
      : `M ${fmtQ(x + w)} ${fmtQ(y + r)} V ${fmtQ(y + h - r)} A ${fmtQ(r)} ${fmtQ(r)} 0 0 1 ${fmtQ(x)} ${fmtQ(y + h - r)} V ${fmtQ(y + r)} A ${fmtQ(r)} ${fmtQ(r)} 0 0 1 ${fmtQ(x + w)} ${fmtQ(y + r)} Z`;
  }
  const m = snapQ(0.293 * r), a = snapQ((r + 2 * m) / 2);
  // corner C with in-direction u (along the side we arrive on) and out-direction v (along the side we leave on)
  const corner = ([cx, cy], [ux, uy], [vx, vy]) => {
    const P = (kx, ky) => `${fmtQ(cx + kx)} ${fmtQ(cy + ky)}`;
    const first = `C ${P(-a * ux, -a * uy)} ${P(-2 * m * ux, -2 * m * uy)} ${P(-m * ux + m * vx, -m * uy + m * vy)}`;
    const second = `C ${P(2 * m * vx, 2 * m * vy)} ${P(a * vx, a * vy)} ${P(r * vx, r * vy)}`;
    return `${first} ${second}`;
  };
  return [
    `M ${fmtQ(x + r)} ${fmtQ(y)}`,
    `H ${fmtQ(x + w - r)}`,
    corner([x + w, y], [1, 0], [0, 1]),
    `V ${fmtQ(y + h - r)}`,
    corner([x + w, y + h], [0, 1], [-1, 0]),
    `H ${fmtQ(x + r)}`,
    corner([x, y + h], [-1, 0], [0, -1]),
    `V ${fmtQ(y + r)}`,
    corner([x, y], [0, -1], [1, 0]),
    "Z",
  ].join(" ");
}
```

Check by hand for r = 5: m = snap(1.465) = 1.5, a = snap((5 + 3) / 2) = 4. TR corner C = (21, 3), u = (1, 0), v = (0, 1): first cubic `C 17 3 18 3 19.5 4.5`, second `C 21 6 21 7 21 8`. The incoming tangent at the meeting point (1.5, 1.5) equals the outgoing one, so the join is smooth; the first two handles lie on the straight side, so curvature is zero where the side ends.

- [ ] **Step 5: Implement the preset side**

In `skills/pretty-icons/presets.mjs`, after `FILLED_PRESETS`:

```js
export const BULK_PRESETS = {
  24: {
    finish: "bulk",
    stroke: 2,
    weights: [2],
    pad: 2,
    knockout: 1.5,
    gap: 1.5,
    share: [0.25, 0.6],
    radius: [5, 3],
    radiusAt: 12,
    commands: 14,
    keylines: { circle: [20, 20], square: [18, 18], portrait: [16, 20], landscape: [20, 16] },
  },
};
export const KNOCKOUT_TOL = 0.25;
export const BULK_REFERENCE_INK = { 24: 170 };

// the finish a root declares: bulk is fill="currentColor" with no stroke, duotone is fill="none" stroke="currentColor"
export function finishOf(root) {
  const fill = root.fill, stroke = root.stroke;
  if (fill === "currentColor" && stroke === undefined) return "bulk";
  if (fill === "none" && stroke === "currentColor") return "duotone";
  return null;
}
```

Change `preset` to take the finish:

```js
export function preset(G, finish) {
  const want = finish ?? GRIDS[G]?.finish ?? "duotone";
  if (want === "bulk") {
    const p = BULK_PRESETS[G];
    if (!p) throw new Error(`no bulk preset for grid ${G}: bulk is 24`);
    return { G, fill: FILL, live: G - 2 * p.pad, step: GRID_STEP, elements: 3, keylineTol: KEYLINE_TOL, gravityTol: GRAVITY_TOL, weightTol: WEIGHT_TOL, referenceTol: REFERENCE_TOL, centre: [G / 2, G / 2], ...p };
  }
  const p = GRIDS[G];
  if (!p) throw new Error(`no preset for grid ${G}`);
  if (want !== (p.finish ?? "duotone")) throw new Error(`no ${want} preset for grid ${G}`);
  // the existing return of preset(G) follows, unchanged
}
```

Keep the existing return for duotone/filled exactly as it is today (the `{ G, finish: "duotone", pad, fill, live, step, radiusAt, elements, commands, ...tolerances, weights: [], centre, ...p }` object); only the guard above is new.

Then thread the finish through the helpers. Import `squircle` at the top: `import { squircle } from "./geometry.mjs";` (geometry.mjs does not import presets, so there is no cycle; verify with `/usr/bin/grep -n "presets" skills/pretty-icons/geometry.mjs`, which must print nothing).

```js
export function radiusFor(G, size, finish) {
  const p = preset(G, finish);
  if (p.finish === "bulk") return size >= p.radiusAt ? p.radius[0] : p.radius[1];
  // existing duotone/filled body unchanged, using p
}
export function radiiFor(G, size, finish) { /* existing body, with preset(G, finish) and radiusFor(G, size, finish) */ }
export function inset(G, finish) {
  const p = preset(G, finish);
  return Math.ceil((p.contour ?? p.stroke) / 2 / GRID_STEP) * GRID_STEP;
}
export function body(G, format, finish) {
  const p = preset(G, finish), [kw, kh] = p.keylines[format];
  if (p.finish === "bulk") {
    if (format === "circle") return { tag: "circle", cx: G / 2, cy: G / 2, r: kw / 2 };
    const x = (G - kw) / 2, y = (G - kh) / 2;
    return { tag: "path", d: squircle(x, y, kw, kh, radiusFor(G, Math.min(kw, kh), finish)) };
  }
  // existing duotone/filled body unchanged (it uses inset(G, finish))
}
export function bodySvg(G, format, finish) {
  const b = body(G, format, finish);
  if (preset(G, finish).finish === "bulk") {
    return b.tag === "circle" ? `<circle cx="${b.cx}" cy="${b.cy}" r="${b.r}" fill-opacity=".4" />` : `<path d="${b.d}" fill-opacity=".4" />`;
  }
  // existing body unchanged
}
export function referenceInk(G, finish) {
  if (preset(G, finish).finish === "bulk") return BULK_REFERENCE_INK[G];
  return REFERENCE_INK[G];
}
```

The bulk keyline is the **ink** size and a filled body has no stroke, so the bulk body's geometry is the keyline itself: circle r = 10, square 18 at (3, 3). `inset(24, "bulk")` = 1 serves the badge glyphs in Task 7, not the body.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `rtk test node --test test/pretty-icons/presets.test.mjs test/pretty-icons/geometry.test.mjs`
Expected: PASS, all cases.

Run the whole suite: `rtk test node --test 'test/**/*.test.mjs'`
Expected: PASS. Every existing call site passes one or two arguments and gets the old behaviour.

- [ ] **Step 7: Commit**

```bash
/usr/bin/git add skills/pretty-icons/presets.mjs skills/pretty-icons/geometry.mjs test/pretty-icons/presets.test.mjs test/pretty-icons/geometry.test.mjs
/usr/bin/git commit -m "feat(pretty-icons): the bulk preset, finishOf and the squircle"
```

---

### Task 2: paper.js in the cache

**Files:**
- Modify: `skills/pretty-icons/raster.mjs`
- Test: `test/pretty-icons/raster.test.mjs`

**Interfaces:**
- Consumes: `cacheDir(env, platform, home, arch)`, the resvg install pattern in `resvg()` (`spawnSync(npm, ["install", PKG, "--prefix", dir, "--save-exact", "--no-audit", "--no-fund", "--loglevel=error"])`, loaded with `createRequire(join(dir, "raster.cjs"))`).
- Produces: `PAPER_PKG = "paper@0.12.18"`; `paper() → paper namespace` (installed on first call, loaded once, `paper.setup(new paper.Size(24, 24))` already done); throws the same `NO_RASTER`-style message when npm is missing.

- [ ] **Step 1: Write the failing test**

Append to `test/pretty-icons/raster.test.mjs`:

```js
test("paper(): 0.12.18 from the cache, set up on a 24 canvas, loaded once", async () => {
  const { paper, PAPER_PKG } = await import("../../skills/pretty-icons/raster.mjs");
  assert.equal(PAPER_PKG, "paper@0.12.18");
  const P = paper();
  assert.equal(P.version, "0.12.18");
  assert.equal(paper(), P);
  const a = new P.Path.Rectangle({ point: [0, 0], size: [10, 10], insert: false });
  const b = new P.Path.Circle({ center: [10, 5], radius: 3, insert: false });
  const cut = a.subtract(b, { insert: false });
  assert.ok(Math.abs(cut.area - (100 - Math.PI * 9 / 2)) < 0.5, String(cut.area));
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `rtk test node --test test/pretty-icons/raster.test.mjs`
Expected: FAIL, `paper` is not exported.

- [ ] **Step 3: Implement**

In `skills/pretty-icons/raster.mjs`, beside `PKG`:

```js
export const PAPER_PKG = "paper@0.12.18";

let paperNs = null;
export function paper() {
  if (paperNs) return paperNs;
  const dir = cacheDir(process.env, process.platform, homedir(), process.arch);
  const req = createRequire(join(dir, "raster.cjs"));
  let mod;
  try {
    mod = req("paper");
  } catch {
    const win = process.platform === "win32";
    const r = spawnSync(win ? "npm.cmd" : "npm", ["install", PAPER_PKG, "--prefix", dir, "--save-exact", "--no-audit", "--no-fund", "--loglevel=error"], { encoding: "utf8", shell: win });
    if (r.status !== 0) throw new Error(`${NO_RASTER}\n${r.stderr ?? ""}`.trim());
    mod = req("paper");
  }
  paperNs = mod;
  paperNs.setup(new paperNs.Size(24, 24));
  return paperNs;
}
```

Use the same `cacheDir(...)` arguments `resvg()` already uses (copy its call verbatim) and the same `mkdirSync` guard if `resvg()` creates the directory before installing. `paper` resolves to `paper/dist/paper-core.js` under Node (no canvas needed); if `req("paper")` throws about `canvas` after install, require `"paper/dist/paper-core.js"` instead in both places.

- [ ] **Step 4: Run the test to verify it passes**

Run: `rtk test node --test test/pretty-icons/raster.test.mjs`
Expected: PASS (the first run installs into the cache and takes a few seconds).

- [ ] **Step 5: Commit**

```bash
/usr/bin/git add skills/pretty-icons/raster.mjs test/pretty-icons/raster.test.mjs
/usr/bin/git commit -m "feat(pretty-icons): paper.js in the cache"
```

---
### Task 3: `squircle`, `--finish bulk` and `--accent` in shapes

**Files:**
- Modify: `skills/pretty-icons/shapes.mjs` (`shape` ~193, `finishOf` ~311, `NUMERIC`/`TEXT`/`FLAGS`/`USAGE` ~404–426, `parseArgs` ~428, `main` ~446)
- Test: `test/pretty-icons/shapes.test.mjs`

**Interfaces:**
- Consumes: `preset(G, finish)`, `radiusFor(G, size, finish)` (Task 1), `squircle(x, y, w, h, r)` from `geometry.mjs` (Task 1).
- Produces: a `squircle` primitive (`shape("squircle", { w, h, at, r?, grid, finish })` → `{ d, P: null, segs: null }`); `o.finish === "bulk"` on every primitive prints one `<path d="…" fill-opacity=".4" />`; `o.accent` prints `<path d="…" />`; the CLI flags `--finish bulk` (TEXT) and `--accent` (bare). `shapes.mjs`'s own `finishOf(name, o, given)` keeps its name; it does not import presets' `finishOf`.

- [ ] **Step 1: Write the failing tests**

Append to `test/pretty-icons/shapes.test.mjs`:

```js
test("squircle: a primitive on 24 at bulk, 5 or 3 by the short side, a pill at --r half the short side", () => {
  const s = shape("squircle", { w: 18, h: 18, at: [12, 12], grid: 24, finish: "bulk" });
  assert.equal(s.d, "M 8 3 H 16 C 17 3 18 3 19.5 4.5 C 21 6 21 7 21 8 V 16 C 21 17 21 18 19.5 19.5 C 18 21 17 21 16 21 H 8 C 7 21 6 21 4.5 19.5 C 3 18 3 17 3 16 V 8 C 3 7 3 6 4.5 4.5 C 6 3 7 3 8 3 Z");
  assert.equal(s.P, null);
  assert.ok(onGrid(s.d));
  assert.deepEqual(clean(s.d), []);
  assert.ok(shape("squircle", { w: 8, h: 8, at: [8, 8], grid: 24, finish: "bulk" }).d.includes("C 9.5 4 10 4 11 5"));
  assert.equal(shape("squircle", { w: 20, h: 8, at: [12, 12], r: 4, grid: 24, finish: "bulk" }).d, "M 6 8 H 18 A 4 4 0 0 1 18 16 H 6 A 4 4 0 0 1 6 8 Z");
  refused(() => shape("squircle", { w: 18, h: 18, at: [12, 12], r: 10, grid: 24, finish: "bulk" }), "--r 10: at most 9");
  refused(() => shape("squircle", { w: 18, h: 18, grid: 16 }), "squircle: the bulk finish, --finish bulk");
});

test("--finish bulk prints one body at .4, --accent prints it full; other grids refuse at bulk", () => {
  assert.deepEqual(finishOf("squircle", { w: 18, h: 18, at: [12, 12], grid: 24, finish: "bulk" }), [`<path d="${shape("squircle", { w: 18, h: 18, at: [12, 12], grid: 24, finish: "bulk" }).d}" fill-opacity=".4" />`]);
  assert.deepEqual(finishOf("lens", { grid: 24, finish: "bulk", accent: true }), [`<path d="${shape("lens", { grid: 24, finish: "bulk" }).d}" />`]);
  assert.deepEqual(finishOf("lens", { grid: 24, finish: "bulk" }), [`<path d="${shape("lens", { grid: 24, finish: "bulk" }).d}" fill-opacity=".4" />`]);
  refused(() => finishOf("lens", { grid: 16, finish: "bulk" }), "no bulk preset for grid 16: bulk is 24");
  refused(() => finishOf("ring", { grid: 24, finish: "bulk", r: 8, hole: 3 }), "ring: the filled finish only");
  const out = execFileSync("node", [SCRIPT, "squircle", "--w", "16", "--h", "20", "--at", "12,12", "--finish", "bulk"], { encoding: "utf8" });
  assert.equal(out.trim(), `<path d="${shape("squircle", { w: 16, h: 20, at: [12, 12], grid: 24, finish: "bulk" }).d}" fill-opacity=".4" />`);
  const acc = execFileSync("node", [SCRIPT, "drop", "--w", "8", "--h", "10", "--at", "12,12", "--finish", "bulk", "--accent"], { encoding: "utf8" });
  assert.ok(acc.trim().startsWith('<path d="') && acc.trim().endsWith('" />') && !acc.includes("fill-opacity"), acc);
  assert.deepEqual(parseArgs(["lens", "--finish", "bulk", "--accent"]), { name: "lens", o: { finish: "bulk", accent: true } });
});
```

In the existing usage test, the `value` map needs `finish: "bulk"`, and `own` gains `squircle: ["r"]`; add both:

```js
  const value = { at: "8,8", shade: "right", seam: "curved", side: "top", anchors: "8,8 12,8 10,12", from: "M0 0Z", finish: "bulk" };
```

and in `own`: `squircle: ["r"]`. The `--accent` flag is bare like `--sharp`, so extend the argv line's bare-flag test: `f === "sharp" || f === "accent" ? [] : …`.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `rtk test node --test test/pretty-icons/shapes.test.mjs`
Expected: FAIL: `no primitive "squircle"`, `--finish` is not a flag.

- [ ] **Step 3: Implement**

In `skills/pretty-icons/shapes.mjs`:

1. Import `squircle` and `radiusFor`: `import { preset, inset as insetOf, PALETTE, FILL, radiusFor } from "./presets.mjs";` and `import { pathParts, bounds, squircle } from "./geometry.mjs";`.

2. At the top of `shape(name, o)`, replace `const G = o.grid ?? 48, p = preset(G), inset = insetOf(G);` with:

```js
  const finish = o.finish;
  if (finish !== undefined && finish !== "bulk") refuse(`--finish ${finish}: bulk, or leave it out`);
  const G = o.grid ?? (finish === "bulk" ? 24 : 48), p = preset(G, finish), inset = insetOf(G, finish);
  if (name === "squircle") {
    if (finish !== "bulk") refuse("squircle: the bulk finish, --finish bulk");
    const half = (n) => Math.floor(n * 2) / 2;
    const w = half(o.w ?? p.live), h = half(o.h ?? p.live), [cx, cy] = (o.at ?? p.centre).map(snap);
    const short = Math.min(w, h), r = o.r ?? radiusFor(G, short, finish);
    if (r > short / 2) refuse(`--r ${r}: at most ${short / 2}`);
    return { d: squircle(cx - w / 2, cy - h / 2, w, h, r), P: null, segs: null };
  }
```

`preset(G, "bulk")` throws a plain `Error` for 16/20/48; wrap it so the CLI says it as a refusal: `let p; try { p = preset(G, finish); } catch (e) { refuse(e.message); }`. Use that form instead of the bare `preset(G, finish)` call above.

3. In `finishOf(name, o, given)`, replace the first two lines with:

```js
  const finish = o.finish;
  if (finish !== undefined && finish !== "bulk") refuse(`--finish ${finish}: bulk, or leave it out`);
  const G = o.grid ?? (finish === "bulk" ? 24 : 48);
  let p; try { p = preset(G, finish); } catch (e) { refuse(e.message); }
  if (name === "ring") { if (p.finish !== "filled") refuse("ring: the filled finish only"); return ring(o, G, p); }
  const s = given ?? shape(name, o);
  if (p.finish === "bulk") return [o.accent ? `<path d="${s.d}" />` : `<path d="${s.d}" fill-opacity=".4" />`];
  if (p.finish !== "filled") return [`<path d="${s.d}" fill="currentColor" fill-opacity="${FILL}" />`];
```

(If `ring` already refuses non-filled grids inside, keep its message and drop the guard here; the test expects the text `ring: the filled finish only`.)

4. Flags: add `"finish"` to `TEXT`, `"accent"` to `FLAGS` beside `"sharp"`, and in `parseArgs` treat it bare: `if (k === "sharp" || k === "accent") { o[k] = true; continue; }`. Add to `USAGE`, after the "every primitive" line:

```
  "  at 24 (bulk):    --finish bulk (a body at .4) --accent (full)",
  "  squircle  --w N --h N [--r N] (bulk only: 5 when the short side is 12 or more, 3 below, or a pill)",
```

5. In `main`, the grid guard stays; `--finish bulk` with no `--grid` defaults to 24 inside `shape`/`finishOf`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `rtk test node --test test/pretty-icons/shapes.test.mjs`
Expected: PASS, including the usage test (every flag named, `squircle`'s line names `--r`).

- [ ] **Step 5: Commit**

```bash
/usr/bin/git add skills/pretty-icons/shapes.mjs test/pretty-icons/shapes.test.mjs
/usr/bin/git commit -m "feat(pretty-icons): squircle, --finish bulk and --accent in shapes"
```

---

### Task 4: `bulk.mjs` text rules; `check.mjs` reads the finish

**Files:**
- Create: `skills/pretty-icons/bulk.mjs`
- Modify: `skills/pretty-icons/check.mjs` (`textChecks` 77–143, `setGrid` 185–190, `checkSet` 195–231, `main` 233–247)
- Test: `test/pretty-icons/bulk.test.mjs` (new), `test/pretty-icons/check.test.mjs`

**Interfaces:**
- Consumes: `preset(G, finish)`, `finishOf(root)` (Task 1); `parse`, `num`, `isClosed`, `pathCommands`, `pathNumbers` from `svg.mjs`; `sampleParts(el, step)`, `minDistance(A, B)`, `inside(pt, poly)`, `bounds` from `geometry.mjs`; `asPath(el)` and `isModifier` from `modifiers.mjs`; `curveFailures` from `curve.mjs`.
- Produces, in `bulk.mjs`:
  - `isKnockout(el) → boolean` (`data-cut === "knockout"`)
  - `uncut(el) → el` (the same element with `d` replaced by `data-body` when present)
  - `isLine(el) → boolean` (declares `stroke`, not `none`)
  - `isBody(el) → boolean` (closed, no stroke, `fill-opacity` present)
  - `classify(parsed) → { bodies, accents, lines }` (lines ⊂ accents; a modifier is an accent)
  - `crosses(accent, body, step = 0.25) → boolean` (uses the uncut body)
  - `accentLength(el) → number`, `accentBox(el) → { w, h }`
  - `bulkChecks(icon, parsed, p, { folder } = {}) → failure[]`
  - `knockoutPath(folder, icon)` → `${folder}/${icon}.svg` with `./` stripped
- Produces, in `check.mjs`: `textChecks(icon, text, expectG, finish?)`, `setFinish(set, forced?) → "bulk" | "duotone" | "filled" | null`, `checkSet(folder, { grid, finish, measure, loadMeasure })` whose result gains `finish`; `main` takes `--finish=bulk|duotone`.

- [ ] **Step 1: Write the failing bulk tests**

Create `test/pretty-icons/bulk.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { textChecks, formatFailure } from "../../skills/pretty-icons/check.mjs";
import { classify, crosses, bulkChecks, isKnockout, uncut } from "../../skills/pretty-icons/bulk.mjs";
import { preset } from "../../skills/pretty-icons/presets.mjs";
import { parse } from "../../skills/pretty-icons/svg.mjs";

export const svg24b = (b) => `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">\n  ${b}\n</svg>`;
export const BODY24B = '<circle cx="12" cy="12" r="10" fill-opacity=".4" />';
export const SQ24B = '<path d="M 8 3 H 16 C 17 3 18 3 19.5 4.5 C 21 6 21 7 21 8 V 16 C 21 17 21 18 19.5 19.5 C 18 21 17 21 16 21 H 8 C 7 21 6 21 4.5 19.5 C 3 18 3 17 3 16 V 8 C 3 7 3 6 4.5 4.5 C 6 3 7 3 8 3 Z" fill-opacity=".4" />';
export const LINE = (d) => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`;
const lines = (svg, icon = "edit") => textChecks(icon, svg, 24).failures.map(formatFailure);
const p = preset(24, "bulk");

test("classify: a body is closed at .4 with no stroke; a line declares its stroke; the rest is a filled accent", () => {
  const parsed = parse(svg24b(`${BODY24B}\n  <path d="M 9 9 H 15 V 15 H 9 Z" />\n  ${LINE("M 8 12 H 16")}`));
  const c = classify(parsed);
  assert.deepEqual(c.bodies.map((e) => e.at), ["circle@1"]);
  assert.deepEqual(c.accents.map((e) => e.at), ["path@2", "path@3"]);
  assert.deepEqual(c.lines.map((e) => e.at), ["path@3"]);
});

test("crosses: inside, through, or within half a line's width; touching within 0.1 is not a crossing", () => {
  const body = parse(svg24b(SQ24B)).elements[0];
  const inside = parse(svg24b('<path d="M 9 9 H 15 V 15 H 9 Z" />')).elements[0];
  const through = parse(svg24b(LINE("M 2 12 H 22"))).elements[0];
  const beside = parse(svg24b('<path d="M 22 4 H 23 V 20 H 22 Z" />')).elements[0];
  const touching = parse(svg24b(LINE("M 21 4 V 20"))).elements[0];
  assert.equal(crosses(inside, body), true);
  assert.equal(crosses(through, body), true);
  assert.equal(crosses(beside, body), false);
  assert.equal(crosses(touching, body), false);
  // the cut body is judged by its uncut geometry
  const cut = parse(svg24b(`<path d="M 3 3 H 21 V 21 H 3 Z" fill-opacity=".4" data-cut="knockout" data-body="${body.attrs.d}" />`)).elements[0];
  assert.equal(isKnockout(cut), true);
  assert.equal(uncut(cut).attrs.d, body.attrs.d);
  assert.equal(crosses(inside, cut), true);
});

test("the root at bulk: fill currentColor, no stroke, no stroke-width; a line declares its own", () => {
  assert.deepEqual(lines(svg24b(`${BODY24B}\n  ${LINE("M 2 2 H 5")}`)), []);
  const bad = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke-width="2" aria-hidden="true">\n  ' + BODY24B + '\n  ' + LINE("M 2 2 H 5") + '\n</svg>';
  assert.deepEqual(textChecks("edit", bad, 24, "bulk").failures.map(formatFailure), ["stroke  edit  root stroke-width 2 → not set at bulk"]);
  const thin = svg24b(`${BODY24B}\n  <path d="M 2 2 H 5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />`);
  assert.deepEqual(lines(thin), ["stroke  edit  path@2 stroke-width 1.5 → 2"]);
  const caps = svg24b(`${BODY24B}\n  <path d="M 2 2 H 5" fill="none" stroke="currentColor" stroke-width="2" />`);
  assert.deepEqual(lines(caps), ["stroke  edit  path@2 stroke-linecap missing → round", "stroke  edit  path@2 stroke-linejoin missing → round"]);
  const painted = svg24b(`<circle cx="12" cy="12" r="10" fill="#333" fill-opacity=".4" />\n  ${LINE("M 2 2 H 5")}`);
  assert.deepEqual(lines(painted), ["stroke  edit  circle@1 fill #333 → currentColor, by the root"]);
});

test("construction: a contour, a wrong opacity, an open unstroked path, no body, no accent, a rect", () => {
  assert.deepEqual(lines(svg24b(`<circle cx="12" cy="12" r="10" fill-opacity=".4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />\n  <path d="M 9 9 H 15 V 15 H 9 Z" />`)), ["construction  edit  circle@1 fill and stroke → a body at .4 or an accent, no contour"]);
  assert.deepEqual(lines(svg24b(`<circle cx="12" cy="12" r="10" fill-opacity=".3" />\n  <path d="M 9 9 H 15 V 15 H 9 Z" />`)), ["construction  edit  circle@1 fill-opacity .3 → .4"]);
  assert.deepEqual(lines(svg24b(`${BODY24B}\n  <path d="M 2 2 H 6" />`)), ["construction  edit  path@2 open and unstroked → a line declares stroke"]);
  assert.deepEqual(lines(svg24b('<path d="M 9 9 H 15 V 15 H 9 Z" />')), ["construction  edit  no body → at least one body at .4"]);
  assert.deepEqual(lines(svg24b(BODY24B)), ["construction  edit  no accent → at least one accent, full"]);
  assert.deepEqual(lines(svg24b(`<rect x="3" y="3" width="18" height="18" rx="5" fill-opacity=".4" />\n  <path d="M 9 9 H 15 V 15 H 9 Z" />`)), ["radius  edit  rect@1 → shapes.mjs squircle"]);
});

test("an accent's size: a filled accent no side under 2, a line no shorter than 3; eight commands across the accents", () => {
  assert.deepEqual(lines(svg24b(`${BODY24B}\n  <path d="M 1 1 H 7 V 2.5 H 1 Z" />`)), ["construction  edit  path@2 1.5 wide → a filled accent no side under 2"]);
  assert.deepEqual(lines(svg24b(`${BODY24B}\n  ${LINE("M 1 1 H 3.5")}`)), ["construction  edit  path@2 2.5 long → a line accent no shorter than 3"]);
  const busy = svg24b(`${BODY24B}\n  ${LINE("M 6 8 H 10 V 12 H 14 V 16")}\n  ${LINE("M 14 6 H 18 V 10 H 20 V 14")}`);
  assert.deepEqual(lines(busy).filter((l) => l.startsWith("count")), ["count  edit  accents 10 drawing commands → at most 8"]);
});

test("a crossing without a cut names the file to cut; data-cut only on a body; a cut with no crossing is stale", () => {
  assert.deepEqual(lines(svg24b(`${SQ24B}\n  ${LINE("M 2 12 H 22")}`)), ["knockout  edit  path@2 crosses path@1 without a cut → node knockout.mjs pretty-icons/edit.svg"]);
  const r = bulkChecks("edit", parse(svg24b(`${SQ24B}\n  ${LINE("M 2 12 H 22")}`)), p, { folder: "./icons" });
  assert.equal(formatFailure(r[0]), "knockout  edit  path@2 crosses path@1 without a cut → node knockout.mjs icons/edit.svg");
  assert.deepEqual(lines(svg24b(`${BODY24B}\n  <path d="M 9 9 H 15 V 15 H 9 Z" data-cut="knockout" data-body="M 9 9 H 15 V 15 H 9 Z" />`)), ["knockout  edit  path@2 data-cut → only on a body"]);
  const stale = svg24b(`<path d="M 3 3 H 21 V 21 H 3 Z" fill-opacity=".4" data-cut="knockout" data-body="M 3 3 H 21 V 21 H 3 Z" />\n  <path d="M 22 4 H 23 V 20 H 22 Z" />`);
  assert.deepEqual(lines(stale).filter((l) => l.startsWith("knockout")), ["knockout  edit  path@1 cut with no crossing → re-run knockout.mjs"]);
});

test("a cut body is exempt from grid, the per-path cap and the curve rules; an accent is not", () => {
  const cutD = "M 3 3 H 21 V 21 H 3 Z M 9.123 9 H 15 V 15 H 9.123 Z";
  const ok = svg24b(`<path d="${cutD}" fill-opacity=".4" data-cut="knockout" data-body="M 3 3 H 21 V 21 H 3 Z" />\n  <path d="M 10 10 H 14 V 14 H 10 Z" />`);
  assert.deepEqual(lines(ok).filter((l) => /^(grid|count|join|bend)/.test(l)), []);
  const off = svg24b(`${BODY24B}\n  <path d="M 9.1 9 H 15 V 15 H 9.1 Z" />`);
  assert.ok(lines(off).some((l) => l.startsWith("grid  edit  path@2 d[1] 9.1")));
});

test("the finish is read from the root; --finish overrides; a mixed folder votes", async () => {
  const { setFinish, readSet } = await import("../../skills/pretty-icons/check.mjs");
  const bulk = { name: "a", text: svg24b(BODY24B) };
  const duo = { name: "b", text: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"></svg>' };
  assert.equal(setFinish([bulk, bulk, duo]), "bulk");
  assert.equal(setFinish([bulk, duo, duo]), "duotone");
  assert.equal(setFinish([bulk, duo, duo], "bulk"), "bulk");
  assert.equal(setFinish([]), null);
  // a bulk file checked as duotone fails stroke, not crashes
  const asDuo = textChecks("a", svg24b(`${BODY24B}\n  ${LINE("M 2 2 H 5")}`), 24, "duotone").failures.map((f) => f.rule);
  assert.ok(asDuo.includes("stroke"));
});
```

- [ ] **Step 2: Write the failing check tests**

Append to `test/pretty-icons/check.test.mjs`:

```js
test("a bulk folder: the finish from the root, --finish=bulk on the CLI, the odd duotone file reported under stroke", async (t) => {
  const dir = tmp(t);
  const B = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">\n  <circle cx="12" cy="12" r="10" fill-opacity=".4" />\n  <path d="M 2 2 H 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />\n</svg>';
  const D = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">\n  <circle cx="12" cy="12" r="10" />\n</svg>';
  for (const n of ["a", "b", "c"]) writeFileSync(join(dir, `${n}.svg`), B);
  writeFileSync(join(dir, "d.svg"), D);
  const r = await checkSet(dir, { measure: false });
  assert.equal(r.G, 24);
  assert.equal(r.finish, "bulk");
  assert.deepEqual(of(r, "stroke"), ["d"]);
  assert.deepEqual(r.failures.filter((f) => f.icon !== "d"), []);
  const cli = spawnSync("node", [new URL("../../skills/pretty-icons/check.mjs", import.meta.url).pathname, dir, "--finish=duotone"], { encoding: "utf8" });
  assert.ok(/stroke  a  /.test(cli.stdout), cli.stdout);
  assert.ok(!/stroke  d  /.test(cli.stdout), cli.stdout);
  const bad = spawnSync("node", [new URL("../../skills/pretty-icons/check.mjs", import.meta.url).pathname, dir, "--finish=flat"], { encoding: "utf8" });
  assert.equal(bad.status, 1);
  assert.ok(bad.stderr.includes("--finish=bulk|duotone"), bad.stderr);
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `rtk test node --test test/pretty-icons/bulk.test.mjs test/pretty-icons/check.test.mjs`
Expected: FAIL: `bulk.mjs` missing; `textChecks` ignores the finish; `setFinish` not exported.

- [ ] **Step 4: Create `bulk.mjs`**

```js
/**
 * The bulk finish: what check.mjs reads from an icon on the 24 grid beyond the
 * rules every grid shares. Two inks in currentColor: a body at fill-opacity .4,
 * an accent full. No contour. An element is a closed shape with a fill, or a
 * line at stroke 2 with round caps and joins declared on the element.
 *   body     closed, no stroke, fill-opacity .4
 *   accent   closed with no stroke and no fill-opacity (filled), or a line
 *   line     declares stroke="currentColor" stroke-width="2", fill="none"
 * Where an accent crosses a body the body carries data-cut="knockout" and its
 * uncut geometry in data-body (knockout.mjs writes both); crossings are judged
 * on the uncut geometry. A modifier is an accent for the crossing rule only.
 */
import { parse, num, isClosed, pathCommands, pathNumbers } from "./svg.mjs";
import { sampleParts, minDistance, inside, bounds } from "./geometry.mjs";
import { asPath, isModifier } from "./modifiers.mjs";

const fail = (list, rule, icon, got, want) => list.push({ rule, icon, got, want });
const isNone = (v) => v === undefined || String(v).trim().toLowerCase() === "none";
const ACCENT_COMMANDS = 8, MIN_SIDE = 2, MIN_LENGTH = 3, TOUCH = 0.1, STEP = 0.25;
const PAINT = ["fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "fill-opacity", "data-cut", "data-body", "data-modifier", "stroke-opacity", "d", "cx", "cy", "r", "x", "y", "width", "height", "rx", "ry", "x1", "y1", "x2", "y2", "points"];

export const isKnockout = (el) => el.attrs["data-cut"] === "knockout";
export const isLine = (el) => !isNone(el.attrs.stroke);
export const isBody = (el) => !isLine(el) && "fill-opacity" in el.attrs && isClosed(el);
export function uncut(el) {
  if (!isKnockout(el) || !el.attrs["data-body"]) return el;
  const { "data-body": body, "data-cut": _, ...rest } = el.attrs;
  return { ...el, attrs: { ...rest, d: body } };
}
export function classify(parsed) {
  const els = parsed.elements;
  const bodies = els.filter(isBody);
  const accents = els.filter((el) => !isBody(el));
  return { bodies, accents, lines: accents.filter(isLine) };
}

/** The centreline points of an element, as polylines: a closed shape's outline or a line's path. */
const parts = (el) => sampleParts(el.tag === "path" ? el : asPath(el), STEP);
const polygon = (el) => parts(uncut(el)).flat();
export function crosses(accent, body, step = STEP) {
  const B = polygon(body), A = parts(accent);
  const wA = isLine(accent) ? num(accent.attrs, "stroke-width", 2) : 0;
  for (const run of A) {
    for (const q of run) if (inside(q, B)) return true;
    const d = minDistance(run, B);
    if (wA && d < wA / 2 - TOUCH) return true;
  }
  if (!isLine(accent)) for (const q of B) if (inside(q, A.flat())) return true;
  return false;
}

export const accentLength = (el) => parts(el).reduce((t, run) => t + run.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - run[i][0], q[1] - run[i][1]), 0), 0);
export function accentBox(el) {
  const b = bounds(parts(el).flat());
  return { w: Math.round((b.x1 - b.x0) * 100) / 100, h: Math.round((b.y1 - b.y0) * 100) / 100 };
}
export const knockoutPath = (folder, icon) => `${String(folder ?? "pretty-icons").replace(/^\.\//, "").replace(/\/$/, "")}/${icon}.svg`;

/** The text rules at bulk, on the icon's own elements (modifiers included, shadows never). */
export function bulkChecks(icon, parsed, p, { folder } = {}) {
  const failures = [], root = parsed.attrs;
  if (root.fill !== "currentColor") fail(failures, "stroke", icon, `root fill ${root.fill ?? "missing"}`, "currentColor");
  for (const k of ["stroke", "stroke-width", "stroke-linecap", "stroke-linejoin"]) if (k in root) fail(failures, "stroke", icon, `root ${k} ${root[k]}`, "not set at bulk");
  const els = parsed.elements;
  for (const el of els) {
    const a = el.attrs, at = el.at;
    if (el.tag === "rect") { fail(failures, "radius", icon, at, "shapes.mjs squircle"); continue; }
    if ("fill" in a && a.fill !== "none") fail(failures, "stroke", icon, `${at} fill ${a.fill}`, "currentColor, by the root");
    if (isLine(el)) {
      if (a.stroke !== "currentColor") fail(failures, "stroke", icon, `${at} stroke ${a.stroke}`, "currentColor");
      if (a.fill !== "none") fail(failures, "stroke", icon, `${at} fill ${a.fill ?? "missing"}`, "none on a line");
      if (num(a, "stroke-width") !== p.stroke) fail(failures, "stroke", icon, `${at} stroke-width ${a["stroke-width"] ?? "missing"}`, `${p.stroke}`);
      for (const k of ["stroke-linecap", "stroke-linejoin"]) if (a[k] !== "round") fail(failures, "stroke", icon, `${at} ${k} ${a[k] ?? "missing"}`, "round");
      if (isClosed(el) && !isModifier(el)) fail(failures, "construction", icon, `${at} fill and stroke`, "a body at .4 or an accent, no contour");
      else if ("fill-opacity" in a) fail(failures, "construction", icon, `${at} fill-opacity on a line`, "not set");
    } else {
      if (!isClosed(el) && !isModifier(el)) fail(failures, "construction", icon, `${at} open and unstroked`, "a line declares stroke");
      if ("fill-opacity" in a && Number(a["fill-opacity"]) !== 0.4) fail(failures, "construction", icon, `${at} fill-opacity ${a["fill-opacity"]}`, ".4");
    }
    if (isKnockout(el) && !isBody(el)) fail(failures, "knockout", icon, `${at} data-cut`, "only on a body");
    for (const k of Object.keys(a)) if (!PAINT.includes(k) && !/^(data|aria)-/.test(k)) fail(failures, "stroke", icon, `${at} ${k}`, "not set");
  }
  // a contour is a closed element with both a fill and a stroke: caught above as a line that is closed
  const { bodies, accents } = classify(parsed);
  const base = accents.filter((el) => !isModifier(el));
  const contours = els.filter((el) => isLine(el) && isClosed(el) && !isModifier(el));
  if (!bodies.length && !contours.length) fail(failures, "construction", icon, "no body", "at least one body at .4");
  if (!base.length) fail(failures, "construction", icon, "no accent", "at least one accent, full");
  for (const el of base) {
    if (el.tag === "rect" || (!isLine(el) && !isClosed(el))) continue;
    if (isLine(el)) {
      const L = accentLength(el);
      if (L < MIN_LENGTH - 1e-9) fail(failures, "construction", icon, `${el.at} ${+L.toFixed(2)} long`, `a line accent no shorter than ${MIN_LENGTH}`);
    } else {
      const { w, h } = accentBox(el), side = Math.min(w, h);
      if (side < MIN_SIDE - 1e-9) fail(failures, "construction", icon, `${el.at} ${side} ${w <= h ? "wide" : "tall"}`, `a filled accent no side under ${MIN_SIDE}`);
    }
  }
  const drawn = base.reduce((t, el) => t + (el.tag === "path" ? pathCommands(el.attrs.d ?? "") : 1), 0);
  if (drawn > ACCENT_COMMANDS) fail(failures, "count", icon, `accents ${drawn} drawing commands`, `at most ${ACCENT_COMMANDS}`);
  // crossings: every accent (a modifier too) against every body's uncut geometry
  for (const body of bodies) {
    if (body.tag === "rect") continue;
    const crossing = accents.filter((a) => a.tag !== "rect" && crosses(a, body));
    if (crossing.length && !isKnockout(body)) for (const a of crossing) fail(failures, "knockout", icon, `${a.at} crosses ${body.at} without a cut`, `node knockout.mjs ${knockoutPath(folder, icon)}`);
    if (!crossing.length && isKnockout(body)) fail(failures, "knockout", icon, `${body.at} cut with no crossing`, "re-run knockout.mjs");
  }
  return failures;
}
```

`asPath(el)` in `modifiers.mjs` turns a circle/rect/line into a path element; check its export with `/usr/bin/grep -n "export function asPath" skills/pretty-icons/modifiers.mjs` and export it if it is not. `modifiers.mjs` must not import `bulk.mjs` at module top level yet (Task 7 adds a dynamic import inside `addModifier`) so there is no cycle.

`inside([x, y], poly)` and `minDistance(A, B)` take arrays of `[x, y]`; confirm their shapes with `/usr/bin/grep -n "export function inside\|export function minDistance\|export function sampleParts\|export function bounds" skills/pretty-icons/geometry.mjs` and adapt the two call sites if `bounds` returns `{x0, y0, x1, y1}` under other names.

- [ ] **Step 5: Wire `check.mjs`**

1. Imports: add `finishOf` to the presets import, and `import { bulkChecks, isKnockout, uncut } from "./bulk.mjs";`.

2. `textChecks(icon, text, expectG, finish)`: after the `GRIDS[expectG]` guard, replace `const p = preset(expectG);` with:

```js
  const want = finish ?? finishOf(root) ?? GRIDS[expectG].finish ?? "duotone";
  let p;
  try { p = preset(expectG, want); } catch (e) { fail(failures, "canvas", icon, `finish ${want}`, e.message); return { G, failures, parsed }; }
  const bulk = p.finish === "bulk";
```

3. Wrap the root stroke block (the `sw`, caps, joins, `ROOT_FORBIDDEN`, root fill, dash lines) in `if (!bulk) { … }`. At bulk, `ROOT_FORBIDDEN` still applies except `fill-opacity` is already not on the root; keep the loop inside the `if`, since `bulkChecks` checks the root itself.

4. In the per-element loop, at bulk skip the `FORBIDDEN_ATTRS`, `stroke-width`, `ROUND_ATTRS` and dash lines (`bulkChecks` judges paint): `for (const el of own) { if (bulk) break; … }`.

5. In the grid/radius/commands loop: skip grid and the per-path cap for a knockout body, and the rect radius at bulk:

```js
  for (const el of own) {
    const a = el.attrs, where = el.at;
    if (bulk && isKnockout(el)) continue;
    … (grid as today)
    if (el.tag === "rect" && !bulk) { … radius as today … }
    if (el.tag === "path") { … per-path count as today, using p.commands … }
  }
```

6. Dispatch: `if (p.finish === "filled") failures.push(...filledChecks(icon, base, expectG)); else if (bulk) failures.push(...bulkChecks(icon, { ...parsed, elements: own }, p, { folder: textChecks.folder })); else duotoneChecks(failures, icon, base, p);` where `textChecks.folder` is set by `checkSet` (step 8) so the knockout message names the folder; default `pretty-icons`.

7. Curves: `failures.push(...curveFailures(icon, bulk ? uncut(el) : el, p?.stroke));` and keep the `seen` set keyed on the uncut `d`.

8. `setFinish`:

```js
/** The finish a set declares, by majority of roots; `forced` wins. */
export function setFinish(set, forced) {
  if (forced) return forced;
  const votes = new Map();
  for (const s of set) {
    const f = finishOf(parse(s.text).attrs);
    if (f) votes.set(f, (votes.get(f) ?? 0) + 1);
  }
  return [...votes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}
```

In `checkSet(folder, { grid, finish, measure = true, loadMeasure })`: after `const G = setGrid(set, grid)`, compute `const F = GRIDS[G]?.finish === "filled" ? "filled" : setFinish(set, finish) ?? GRIDS[G]?.finish ?? "duotone";` set `textChecks.folder = folder;` before the per-file loop, call `textChecks(s.name, s.text, G, F)`, pass `F` to `measuredChecks(…, G, F)` (Task 6 adds the parameter; until then it ignores it), and return `{ G, finish: F, failures, measured, why, rows, notes }`.

9. `main(argv)`: parse `--finish=`; refuse anything but `bulk`/`duotone` with the usage on stderr and exit 1. Usage line: `node check.mjs <folder> [--grid=16|20|24|48] [--finish=bulk|duotone] [--print]`.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `rtk test node --test test/pretty-icons/bulk.test.mjs test/pretty-icons/check.test.mjs`
Expected: PASS.

Then the whole suite: `rtk test node --test 'test/**/*.test.mjs'`
Expected: PASS. `examples/hairline` and `examples/garage` are untouched: their roots say duotone and filled, and nothing in the bulk branch runs for them.

- [ ] **Step 7: Commit**

```bash
/usr/bin/git add skills/pretty-icons/bulk.mjs skills/pretty-icons/check.mjs test/pretty-icons/bulk.test.mjs test/pretty-icons/check.test.mjs
/usr/bin/git commit -m "feat(pretty-icons): bulk.mjs text rules, check reads the finish"
```

---
### Task 5: `knockout.mjs`, and `band()` in raster

**Files:**
- Create: `skills/pretty-icons/knockout.mjs`
- Modify: `skills/pretty-icons/raster.mjs` (after `air`)
- Test: `test/pretty-icons/knockout.test.mjs` (new), `test/pretty-icons/raster.test.mjs`

**Interfaces:**
- Consumes: `paper()` (Task 2); `classify`, `crosses`, `isKnockout`, `uncut`, `isLine` (Task 4); `textChecks`, `formatFailure` (Task 4); `asPath` from `modifiers.mjs`; `parse`, `compose`, `num` from `svg.mjs`; `render`, `edt`, `PX`, `INK_LUMA` from `raster.mjs` (export `PX` and `INK_LUMA` if they are not).
- Produces, in `raster.mjs`: `band(cutSvg, uncutSvg, accentSvg, G, want, tol) → Promise<[{ width, at: [x, y] }]>` (empty when every band-edge pixel is within `want ± tol` of the accent's ink; otherwise the worst offenders, widest deviation first, at most 3). All three SVGs are rendered with bodies full (no `fill-opacity`).
- Produces, in `knockout.mjs`: `KnockoutError`; `stadium(a, b, r, P) → P.Path`; `haloOf(accent, k, P) → P.PathItem` (closed); `cutBody(body, accents, k, P) → { d, crossed: accent[] }` (throws `KnockoutError` on a crumb); `knockout(text, { name, folder }) → { text, cut: [{ body, under: [at…] }] }` (`text` identical to the input when nothing changed); CLI `node knockout.mjs <icon.svg> [--print]`.

- [ ] **Step 1: Write the failing `band` test**

Append to `test/pretty-icons/raster.test.mjs`:

```js
test("band: the paper between a cut body and its accent, measured at the band's edge", async () => {
  const { band } = await import("../../skills/pretty-icons/raster.mjs");
  const root = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">';
  const uncut = `${root}<path d="M 3 3 H 21 V 21 H 3 Z" /></svg>`;
  const accent = `${root}<path d="M 10 10 H 14 V 14 H 10 Z" /></svg>`;
  // a band of 1.5 around the accent: the hole runs from 8.5 to 15.5
  const good = `${root}<path d="M 3 3 H 21 V 21 H 3 Z M 8.5 8.5 V 15.5 H 15.5 V 8.5 Z" /></svg>`;
  assert.deepEqual(await band(good, uncut, accent, 24, 1.5, 0.25), []);
  // a band of 1 on the right side
  const tight = `${root}<path d="M 3 3 H 21 V 21 H 3 Z M 8.5 8.5 V 15.5 H 15 V 8.5 Z" /></svg>`;
  const r = await band(tight, uncut, accent, 24, 1.5, 0.25);
  assert.ok(r.length >= 1);
  assert.ok(Math.abs(r[0].width - 1) <= 0.15, String(r[0].width));
  assert.ok(Math.abs(r[0].at[0] - 15) <= 0.5 && r[0].at[1] > 8 && r[0].at[1] < 16, JSON.stringify(r[0].at));
});
```

- [ ] **Step 2: Write the failing knockout tests**

Create `test/pretty-icons/knockout.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { knockout, haloOf, cutBody, KnockoutError } from "../../skills/pretty-icons/knockout.mjs";
import { paper, band } from "../../skills/pretty-icons/raster.mjs";
import { textChecks, formatFailure } from "../../skills/pretty-icons/check.mjs";
import { parse, compose } from "../../skills/pretty-icons/svg.mjs";
import { svg24b, SQ24B, LINE } from "./bulk.test.mjs";

const SCRIPT = new URL("../../skills/pretty-icons/knockout.mjs", import.meta.url).pathname;
const tmp = (t) => { const dir = mkdtempSync(join(tmpdir(), "pi-")); t.after(() => rmSync(dir, { recursive: true, force: true })); return dir; };
const el = (svg, i = 0) => parse(svg).elements[i];
const full = (root, els) => compose({ ...root, fill: "currentColor" }, els.map((e) => { const { "fill-opacity": _, "data-cut": __, "data-body": ___, ...a } = e.attrs; return { ...e, attrs: a }; }));
/** The three renders band() wants, from a cut file: the cut body, its uncut geometry, the accents that cross it. */
const renders = (svg) => {
  const p = parse(svg), body = p.elements.find((e) => e.attrs["data-cut"]), accents = p.elements.filter((e) => e !== body);
  return [full(p.attrs, [body]), full(p.attrs, [{ ...body, attrs: { ...body.attrs, d: body.attrs["data-body"] } }]), full(p.attrs, accents)];
};
const DIAMOND = '<path d="M 12 6 L 18 12 L 12 18 L 6 12 Z" />';

test("a squircle less a rotated square: one body, data-cut and data-body, a band of 1.5 everywhere, check prints ok on the text rules", async () => {
  const src = svg24b(`${SQ24B}\n  ${DIAMOND}`);
  const r = knockout(src, { name: "edit" });
  assert.notEqual(r.text, src);
  assert.deepEqual(r.cut, [{ body: "path@1", under: ["path@2"] }]);
  const p = parse(r.text);
  assert.equal(p.elements.length, 2);
  assert.equal(p.elements[0].attrs["data-cut"], "knockout");
  assert.equal(p.elements[0].attrs["data-body"], el(src).attrs.d);
  assert.equal(p.elements[0].attrs["fill-opacity"], ".4");
  assert.equal(p.elements[1].attrs.d, el(src, 1).attrs.d);
  assert.deepEqual(await band(...renders(r.text), 24, 1.5, 0.25), []);
  assert.deepEqual(textChecks("edit", r.text, 24).failures.map(formatFailure), []);
  // one element per line, two-space indent, as modifiers.mjs writes
  assert.match(r.text, /^<svg[^>]*>\n  <path [^\n]*\/>\n  <path [^\n]*\/>\n<\/svg>$/);
});

test("a line through a body leaves one element with two subpaths; a line crossing two bodies cuts both", async () => {
  const through = svg24b(`${SQ24B}\n  ${LINE("M 2 12 H 22")}`);
  const r = knockout(through, { name: "edit" });
  const body = parse(r.text).elements[0];
  assert.equal(parse(r.text).elements.length, 2);
  assert.equal((body.attrs.d.match(/M /g) ?? []).length, 2);
  assert.deepEqual(await band(...renders(r.text), 24, 1.5, 0.25), []);
  const two = svg24b(`<path d="M 3 3 H 11 V 21 H 3 Z" fill-opacity=".4" />\n  <path d="M 13 3 H 21 V 21 H 13 Z" fill-opacity=".4" />\n  ${LINE("M 5 12 H 19")}`);
  const r2 = knockout(two, { name: "edit" });
  assert.deepEqual(r2.cut, [{ body: "path@1", under: ["path@3"] }, { body: "path@2", under: ["path@3"] }]);
  assert.ok(parse(r2.text).elements.slice(0, 2).every((e) => e.attrs["data-cut"] === "knockout"));
});

test("no crossing, or only a touch: the file comes back byte for byte", () => {
  const beside = svg24b(`${SQ24B}\n  <path d="M 22 4 H 23 V 20 H 22 Z" />`);
  assert.equal(knockout(beside, { name: "edit" }).text, beside);
  assert.deepEqual(knockout(beside, { name: "edit" }).cut, []);
  const touching = svg24b(`${SQ24B}\n  ${LINE("M 22 4 V 20")}`);
  assert.equal(knockout(touching, { name: "edit" }).text, touching);
});

test("twice gives the same file; a stale cut is restored from data-body", () => {
  const src = svg24b(`${SQ24B}\n  ${DIAMOND}`);
  const once = knockout(src, { name: "edit" }).text;
  assert.equal(knockout(once, { name: "edit" }).text, once);
  // move the accent away: the body goes back to its uncut geometry
  const moved = once.replace(DIAMOND, '<path d="M 22 4 H 23 V 20 H 22 Z" />');
  const back = parse(knockout(moved, { name: "edit" }).text).elements[0];
  assert.equal(back.attrs.d, el(src).attrs.d);
  assert.equal(back.attrs["data-cut"], undefined);
  assert.equal(back.attrs["data-body"], undefined);
});

test("a cut that leaves a crumb refuses, with the piece's size and the accent", () => {
  const crumb = svg24b(`<path d="M 3 3 H 21 V 21 H 3 Z" fill-opacity=".4" />\n  ${LINE("M 2 18 H 22")}`);
  assert.throws(() => knockout(crumb, { name: "edit" }), (e) => e instanceof KnockoutError && e.message === "crumb  edit  path@1 a piece 0.5 across under path@2 → at least 1: move the accent, or make it a body");
});

test("a file failing the text rules is refused with check's line and never written", (t) => {
  const dir = tmp(t), file = join(dir, "edit.svg");
  const bad = svg24b(`<rect x="3" y="3" width="18" height="18" rx="5" fill-opacity=".4" />\n  ${DIAMOND}`);
  writeFileSync(file, bad);
  assert.throws(() => knockout(bad, { name: "edit" }), (e) => e instanceof KnockoutError && e.message === "radius  edit  rect@1 → shapes.mjs squircle");
  const r = spawnSync("node", [SCRIPT, file], { encoding: "utf8" });
  assert.equal(r.status, 1);
  assert.equal(r.stderr.trim(), "knockout: radius  edit  rect@1 → shapes.mjs squircle");
  assert.equal(readFileSync(file, "utf8"), bad);
});

test("the CLI writes the file and says what it cut; --print prints without writing", (t) => {
  const dir = tmp(t), file = join(dir, "edit.svg");
  const src = svg24b(`${SQ24B}\n  ${DIAMOND}`);
  writeFileSync(file, src);
  const p = spawnSync("node", [SCRIPT, file, "--print"], { encoding: "utf8" });
  assert.equal(p.status, 0);
  assert.equal(p.stdout, knockout(src, { name: "edit" }).text + "\n");
  assert.equal(readFileSync(file, "utf8"), src);
  const w = spawnSync("node", [SCRIPT, file], { encoding: "utf8" });
  assert.equal(w.status, 0);
  assert.equal(w.stdout.trim(), "edit  cut path@1 under path@2");
  assert.equal(readFileSync(file, "utf8"), knockout(src, { name: "edit" }).text);
  const again = spawnSync("node", [SCRIPT, file], { encoding: "utf8" });
  assert.equal(again.stdout.trim(), "edit  nothing to cut");
  const u = spawnSync("node", [SCRIPT], { encoding: "utf8" });
  assert.equal(u.status, 1);
  assert.equal(u.stderr.trim(), "usage: node knockout.mjs <icon.svg> [--print]");
});

test("a curved line's halo is within 0.05 of the exact offset at 65 samples; a circle accent's halo is a circle", () => {
  const P = paper();
  const arc = el(svg24b(LINE("M 6 12 A 6 6 0 0 1 18 12")));
  const halo = haloOf(arc, 1.5, P);
  // the exact offset: 2.5 (half the line, plus the band) outside and inside the arc's centreline, over the top half
  for (let i = 0; i <= 64; i++) {
    const a = Math.PI + (Math.PI * i) / 64;
    for (const rr of [8.5, 3.5]) {
      const q = new P.Point(12 + rr * Math.cos(a), 12 + rr * Math.sin(a));
      assert.ok(halo.getNearestPoint(q).getDistance(q) <= 0.05, `sample ${i} at r ${rr}: ${halo.getNearestPoint(q).getDistance(q)}`);
    }
  }
  const circle = el(svg24b('<circle cx="12" cy="12" r="3" />'));
  const h = haloOf(circle, 1.5, P);
  assert.ok(Math.abs(h.area - Math.PI * 4.5 * 4.5) < 0.05, String(h.area));
});

test("cutBody: a circle body, a filled accent inside: the hole is the accent grown by 1.5", () => {
  const P = paper();
  const body = el(svg24b('<circle cx="12" cy="12" r="10" fill-opacity=".4" />'));
  const acc = el(svg24b('<path d="M 10 10 H 14 V 14 H 10 Z" />'));
  const { d, crossed } = cutBody(body, [acc], 1.5, P);
  assert.deepEqual(crossed.map((e) => e.at), ["path@1"]);
  const cut = new P.Path(d);
  assert.ok(cut.children || cut.segments.length > 4);
  const item = new P.CompoundPath(d);
  const hole = 16 + 4 * 1.5 * 4 + Math.PI * 1.5 * 1.5; // the square, four 4 × 1.5 sides, four quarter circles
  assert.ok(Math.abs(Math.abs(item.area) - (Math.PI * 100 - hole)) < 0.5, String(item.area));
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `rtk test node --test test/pretty-icons/raster.test.mjs test/pretty-icons/knockout.test.mjs`
Expected: FAIL: `band` not exported; `knockout.mjs` missing.

- [ ] **Step 4: Implement `band` in `raster.mjs`**

Export `PX` and `INK_LUMA` (`export const PX = 8, INK_LUMA = 0.6;`), then append after `air`:

```js
/** A mask of an SVG's ink at PX pixels a grid unit: a pixel darker than INK_LUMA on white. */
function inkMask(svgText, G) {
  const size = G * PX, { width, height, pixels } = render(svgText, size, { background: "#ffffff" });
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) if ((pixels[i * 4] + pixels[i * 4 + 1] + pixels[i * 4 + 2]) / 3 / 255 < INK_LUMA) mask[i] = 1;
  return { mask, W: width, H: height };
}

/**
 * The knockout band: the paper the cut removed from the body, measured where it meets the cut
 * body's ink. Every such edge pixel should sit `want` from the accent's ink, ± `tol`. The three
 * SVGs render with every body full (no fill-opacity), so the .4 body reads as ink.
 */
export async function band(cutSvg, uncutSvg, accentSvg, G, want, tol) {
  const { mask: C, W, H } = inkMask(cutSvg, G), { mask: U } = inkMask(uncutSvg, G), { mask: A } = inkMask(accentSvg, G);
  const dt = edt(A, W, H), out = [];
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x;
    if (!U[i] || C[i] || A[i]) continue; // removed paper only
    if (!(C[i - 1] || C[i + 1] || C[i - W] || C[i + W])) continue; // at the band's outer edge
    const width = (dt[i] + 0.5) / PX;
    if (Math.abs(width - want) <= tol) continue;
    out.push({ width: +width.toFixed(2), at: [+((x + 0.5) / PX).toFixed(2), +((y + 0.5) / PX).toFixed(2)] });
  }
  out.sort((a, b) => Math.abs(b.width - want) - Math.abs(a.width - want));
  return out.slice(0, 3);
}
```

`render(svgText, widthPx, { background })` is the existing renderer; `edt` the existing transform. A band narrower than `want − tol` is an over-cut body or an under-grown halo; wider is a halo grown past the band (both say "re-run knockout.mjs" in Task 6).

- [ ] **Step 5: Create `knockout.mjs`**

```js
#!/usr/bin/env node
/**
 * The knockout at bulk: where an accent crosses a body, a band of paper `knockout`
 * wide (1.5) follows the accent's outline, cut out of the body. A drawer never cuts
 * it: this file does, with paper.js (raster.mjs installs it beside resvg).
 *   node knockout.mjs <icon.svg> [--print]
 * A body with no crossing is left as it was; a cut body carries data-cut="knockout"
 * and its uncut geometry in data-body, so a second run starts from the original.
 * Refuses a file that fails the text rules, and a cut that leaves a piece under 1 across.
 */
import { readFileSync, writeFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { basename, dirname } from "node:path";
import { paper } from "./raster.mjs";
import { preset } from "./presets.mjs";
import { parse, compose, num } from "./svg.mjs";
import { textChecks, formatFailure } from "./check.mjs";
import { classify, crosses, isKnockout, isLine, uncut } from "./bulk.mjs";
import { asPath } from "./modifiers.mjs";

export class KnockoutError extends Error {}
const refuse = (m) => { throw new KnockoutError(m); };
const FLAT = 0.05, CRUMB = 1, G = 24;
const f = (v) => String(Math.round(v * 100) / 100);

/** A stadium: the segment a→b grown by r, as a paper path with two arcs. */
export function stadium(a, b, r, P) {
  const A = new P.Point(a), B = new P.Point(b), v = B.subtract(A);
  if (v.length < 1e-9) return new P.Path.Circle({ center: A, radius: r, insert: false });
  const u = v.normalize(), n = new P.Point(-u.y, u.x).multiply(r);
  const path = new P.Path({ insert: false });
  path.moveTo(A.add(n));
  path.lineTo(B.add(n));
  path.arcTo(B.add(u.multiply(r)), B.subtract(n));
  path.lineTo(A.subtract(n));
  path.arcTo(A.subtract(u.multiply(r)), A.add(n));
  path.closePath();
  return path;
}

const unite = (items) => items.reduce((acc, it) => (acc ? acc.unite(it, { insert: false }) : it), null);

/** An accent's halo: its outline offset by k (a line: half its width, plus k). A circle's is exact. */
export function haloOf(accent, k, P) {
  if (accent.tag === "circle" && !isLine(accent)) return new P.Path.Circle({ center: [num(accent.attrs, "cx"), num(accent.attrs, "cy")], radius: num(accent.attrs, "r") + k, insert: false });
  const d = accent.tag === "path" ? accent.attrs.d : asPath(accent).attrs.d;
  const outline = new P.Path(d);
  outline.remove();
  const r = isLine(accent) ? num(accent.attrs, "stroke-width", 2) / 2 + k : k;
  const flat = outline.clone({ insert: false });
  flat.flatten(FLAT);
  const pts = flat.segments.map((s) => [s.point.x, s.point.y]);
  const runs = [];
  for (let i = 0; i + 1 < pts.length; i++) runs.push(stadium(pts[i], pts[i + 1], r, P));
  if (flat.closed && pts.length > 1) runs.push(stadium(pts[pts.length - 1], pts[0], r, P));
  const grown = unite(runs);
  return isLine(accent) ? grown : unite([outline.clone({ insert: false }), grown]);
}

/** A paper item's geometry as absolute SVG commands, two decimals, every subpath closed. */
function pathD(path) {
  const S = path.segments;
  if (!S.length) return "";
  let d = `M ${f(S[0].point.x)} ${f(S[0].point.y)}`;
  const n = S.length;
  for (let i = 0; i < n; i++) {
    if (i === n - 1 && !path.closed) break;
    const a = S[i], b = S[(i + 1) % n];
    d += a.handleOut.isZero() && b.handleIn.isZero()
      ? ` L ${f(b.point.x)} ${f(b.point.y)}`
      : ` C ${f(a.point.x + a.handleOut.x)} ${f(a.point.y + a.handleOut.y)} ${f(b.point.x + b.handleIn.x)} ${f(b.point.y + b.handleIn.y)} ${f(b.point.x)} ${f(b.point.y)}`;
  }
  return d + (path.closed ? " Z" : "");
}
const toD = (item) => (item.children ? item.children : [item]).map(pathD).filter(Boolean).join(" ");
const pieces = (item) => (item.children ? item.children : [item]);

/** A body less the halos of the accents that cross it. `crossed` is empty when nothing crosses. */
export function cutBody(body, accents, k, P, icon = "icon") {
  const src = uncut(body);
  const crossed = accents.filter((a) => a.tag !== "rect" && crosses(a, src));
  if (!crossed.length) return { d: null, crossed };
  let item = src.tag === "circle"
    ? new P.Path.Circle({ center: [num(src.attrs, "cx"), num(src.attrs, "cy")], radius: num(src.attrs, "r"), insert: false })
    : new P.Path(src.tag === "path" ? src.attrs.d : asPath(src).attrs.d);
  item.remove();
  for (const a of crossed) {
    item = item.subtract(haloOf(a, k, P), { insert: false });
    for (const piece of pieces(item)) {
      const across = Math.min(piece.bounds.width, piece.bounds.height), area = Math.abs(piece.area);
      if (across < CRUMB || area < CRUMB) refuse(`crumb  ${icon}  ${body.at} a piece ${f(Math.min(across, area))} across under ${a.at} → at least ${CRUMB}: move the accent, or make it a body`);
    }
  }
  return { d: toD(item), crossed };
}

/** The file with every crossed body cut. Unchanged text when nothing crosses; refuses on a text failure. */
export function knockout(text, { name = "icon", folder } = {}) {
  const { failures, parsed } = textChecks(name, text, G, "bulk");
  const other = failures.filter((x) => x.rule !== "knockout");
  if (other.length) refuse(formatFailure(other[0]));
  const p = preset(G, "bulk"), P = paper();
  const { bodies, accents } = classify(parsed);
  const cut = [];
  let changed = false;
  const out = parsed.elements.map((el) => {
    if (!bodies.includes(el)) return el;
    const { d, crossed } = cutBody(el, accents, p.knockout, P, name);
    if (!crossed.length) {
      if (!isKnockout(el)) return el;
      changed = true;
      return uncut(el);
    }
    const src = uncut(el), { d: _d, "data-cut": _c, "data-body": _b, ...rest } = src.attrs;
    const attrs = { d, ...rest, "data-cut": "knockout", "data-body": src.attrs.d };
    const next = { ...el, tag: "path", attrs };
    if (el.attrs.d !== d || el.attrs["data-body"] !== src.attrs.d) changed = true;
    cut.push({ body: el.at, under: crossed.map((a) => a.at) });
    return next;
  });
  if (!changed) return { text, cut };
  const svg = compose(parsed.attrs, out)
    .replace(/ \/><(?!\/svg>)/g, " />\n  <")
    .replace(/^(<svg[^>]*>)/, "$1\n  ")
    .replace(/<\/svg>$/, "\n</svg>");
  return { text: svg, cut };
}

export const USAGE = "usage: node knockout.mjs <icon.svg> [--print]";

export function main(argv) {
  const print = argv.includes("--print"), files = argv.filter((a) => !a.startsWith("--"));
  if (files.length !== 1) { console.error(USAGE); process.exit(1); }
  const file = files[0], name = basename(file, ".svg");
  let text;
  try { text = readFileSync(file, "utf8"); } catch (e) { console.error(`knockout: ${file}: ${e.code === "ENOENT" ? "no such file" : e.message}`); process.exit(1); }
  try {
    const r = knockout(text, { name, folder: dirname(file) });
    if (print) { process.stdout.write(r.text + "\n"); return; }
    if (r.text !== text) writeFileSync(file, r.text);
    if (!r.cut.length) console.log(`${name}  nothing to cut`);
    for (const c of r.cut) console.log(`${name}  cut ${c.body} under ${c.under.join(", ")}`);
  } catch (e) {
    if (!(e instanceof KnockoutError)) throw e;
    console.error(`knockout: ${e.message}`);
    process.exit(1);
  }
}

const entry = process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (entry) main(process.argv.slice(2));
```

Notes for the implementer:
- `new P.Path(d)` inserts into the project; `.remove()` keeps the project empty between runs so `paper()` stays reusable. `clone({ insert: false })` and `{ insert: false }` on booleans do the same.
- `check.mjs` imports `bulk.mjs`, and `knockout.mjs` imports both: no cycle, because neither `check.mjs` nor `bulk.mjs` imports `knockout.mjs`. Task 7 has `modifiers.mjs` import `cutBody` dynamically inside `addModifier`, since `bulk.mjs` imports `modifiers.mjs` at top level.
- The "twice gives the same file" test holds because the second run rebuilds the cut from `data-body` and gets the same `d` string; `changed` stays false and the input text is returned.
- The crumb fixture: body 3..21, line at y 18, stroke 2 (ink 17..19), halo to 20.5, leaving 20.5..21 = 0.5 under the line. The message's number is that 0.5.
- If `arcTo(through, to)` on the stadium produces a degenerate arc for r below 0.01, `stadium` is not called with such r (the smallest is 1.5).

- [ ] **Step 6: Run the tests to verify they pass**

Run: `rtk test node --test test/pretty-icons/raster.test.mjs test/pretty-icons/knockout.test.mjs`
Expected: PASS. If the 65-sample test fails only at the arc's two ends (the caps), the samples there sit on the round cap, which the stadium gives exactly; a failure means `flatten` kept too few points: lower `FLAT` to 0.02 and re-run.

Then: `rtk test node --test 'test/**/*.test.mjs'`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
/usr/bin/git add skills/pretty-icons/knockout.mjs skills/pretty-icons/raster.mjs test/pretty-icons/knockout.test.mjs test/pretty-icons/raster.test.mjs
/usr/bin/git commit -m "feat(pretty-icons): knockout.mjs and the band measure"
```

---
### Task 6: the measured rules at bulk: gap, air, share, the band, weight

**Files:**
- Modify: `skills/pretty-icons/measure.mjs` (`measuredChecks` 63–192; `interiorDetails` 48–61)
- Modify: `skills/pretty-icons/check.mjs` (`checkSet` passes the finish; done in Task 4 step 8, confirm)
- Test: `test/pretty-icons/check.test.mjs`

**Interfaces:**
- Consumes: `preset(G, finish)`, `referenceInk(G, finish)`, `KNOCKOUT_TOL` (Task 1); `classify as bulkClassify`, `crosses`, `isKnockout`, `uncut`, `isLine` (Task 4); `band` (Task 5); the existing `measure`, `air`, `elongation`, `compose`, `sampleParts`, `minDistance`.
- Produces: `measuredChecks(set, G, finish) → { failures, rows }`; at bulk a row carries `share%`; failures `share`, `knockout` (the band), and `gap`/`air`/`live`/`keyline`/`gravity`/`weight`/`diagonal` as today with the bulk numbers.

- [ ] **Step 1: Write the failing tests**

Append to `test/pretty-icons/check.test.mjs`. The fixtures come from `knockout()` so the cut is right by construction:

```js
test("bulk, measured: a cut icon passes gap, air, live and the band; share, the band and gap report with the bulk numbers", async (t) => {
  const { knockout } = await import("../../skills/pretty-icons/knockout.mjs");
  const dir = tmp(t);
  const root = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">';
  const B = (inner) => `${root}\n  ${inner}\n</svg>`;
  const SQ = '<path d="M 8 3 H 16 C 17 3 18 3 19.5 4.5 C 21 6 21 7 21 8 V 16 C 21 17 21 18 19.5 19.5 C 18 21 17 21 16 21 H 8 C 7 21 6 21 4.5 19.5 C 3 18 3 17 3 16 V 8 C 3 7 3 6 4.5 4.5 C 6 3 7 3 8 3 Z" fill-opacity=".4" />';
  const L = (d) => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`;
  // three good icons: a diamond in a squircle, a line through a circle, a bar beside a circle
  writeFileSync(join(dir, "a.svg"), knockout(B(`${SQ}\n  <path d="M 12 6 L 18 12 L 12 18 L 6 12 Z" />`), { name: "a" }).text);
  writeFileSync(join(dir, "b.svg"), knockout(B(`<circle cx="12" cy="12" r="10" fill-opacity=".4" />\n  ${L("M 4 12 H 20")}`), { name: "b" }).text);
  writeFileSync(join(dir, "c.svg"), knockout(B(`<circle cx="12" cy="12" r="10" fill-opacity=".4" />\n  ${L("M 7 9 H 17 M 7 15 H 17")}`), { name: "c" }).text);
  const r = await checkSet(dir);
  assert.equal(r.finish, "bulk");
  assert.equal(r.measured, true);
  assert.deepEqual(r.failures.filter((f) => f.rule !== "weight").map((f) => `${f.rule} ${f.icon} ${f.got}`), []);
  assert.ok(r.rows.every((x) => typeof x["share%"] === "number" && x["share%"] > 25 && x["share%"] < 60), JSON.stringify(r.rows));
  // share: a body with a sliver of accent
  writeFileSync(join(dir, "d.svg"), B(`${SQ}\n  <path d="M 1 1 H 3 V 3 H 1 Z" />`));
  // the band: a hand-cut hole 1 wide on the right of the accent
  writeFileSync(join(dir, "e.svg"), B(`<path d="M 3 3 H 21 V 21 H 3 Z M 8.5 8.5 V 15.5 H 15 V 8.5 Z" fill-opacity=".4" data-cut="knockout" data-body="M 3 3 H 21 V 21 H 3 Z" />\n  <path d="M 10 10 H 14 V 14 H 10 Z" />`));
  // gap: two line accents 1 apart, edge to edge (centrelines 3 apart, 2 wide); the body sits clear of them
  writeFileSync(join(dir, "f.svg"), B(`<circle cx="12" cy="14" r="8" fill-opacity=".4" />\n  ${L("M 1 1 H 4")}\n  ${L("M 1 4 H 4")}`));
  const r2 = await checkSet(dir);
  const got = (icon, rule) => r2.failures.filter((f) => f.icon === icon && f.rule === rule).map((f) => `${f.got} → ${f.want}`);
  assert.deepEqual(got("d", "share"), ["accent 0.03 of the ink → 0.25 to 0.6"]);
  assert.match(got("e", "knockout")[0], /^paper 1(\.\d+)? wide at 14(\.\d+)?, 1\d(\.\d+)? → 1\.5: re-run knockout\.mjs$/);
  assert.deepEqual(got("f", "gap"), ["path@2 to path@3 1 apart → ≥ 1.5 apart, or crossing"]);
  assert.deepEqual(got("f", "air"), ["paper 1.0 wide at 2.5, 2.5 → ≥ 1.5 apart, or touching"]);
  assert.deepEqual(got("a", "air"), []);
});
```

The air message at bulk is in grid units: `paper 1.0 wide` (the unit is 1), where duotone says `strokes wide`. The `at` of `f`'s paper is the centroid of the 1-wide strip between the two lines' edges, y 2 to 3, x 0 to 5: 2.5, 2.5. The `at` of `e`'s paper is the centroid of the 1-wide strip between the accent's right edge at x 14 and the hole's at x 15, y 8.5 to 15.5: 14.5, 12. `f` also fails `live` (the lines sit in the pad), which the test does not assert; `checkSet` measures every readable icon, text failures or not (`check.mjs` filters only `unreadable`).

- [ ] **Step 2: Run the test to verify it fails**

Run: `rtk test node --test test/pretty-icons/check.test.mjs`
Expected: FAIL: `measuredChecks` reads `preset(24)` as duotone and reports `stroke`-era failures (`rootW` missing, loose on the body), no `share%`.

- [ ] **Step 3: Implement**

In `skills/pretty-icons/measure.mjs`:

1. Imports: `preset, TOUCH, FORMATS, referenceInk, AIR, LOOSE, COUNTER, DIAGONAL, SHADOW, KNOCKOUT_TOL` from presets; `band` from raster; `import { classify as bulkClassify, crosses, isKnockout, uncut, isLine } from "./bulk.mjs";`.

2. Signature and head of `measuredChecks`:

```js
export async function measuredChecks(set, G, finish) {
  const p = preset(G, finish), bulk = p.finish === "bulk", failures = [], rows = [];
```

3. In the per-icon `try`, after `const els = …` and `base`:

```js
      const c = filled ? classify(els) : bulk ? bulkClassify({ ...parsed, elements: els }) : null;
      const details = new Set(filled ? c.details.map((el) => el.at) : []);
      const paint = new Set(filled ? [...c.paint].map((el) => el.at) : bulk ? [] : els.filter((el) => String(el.attrs.stroke).trim().toLowerCase() === "none").map((el) => el.at));
      const rootW = bulk ? 0 : num(parsed.attrs, "stroke-width", p.stroke);
```

Keep `parts`, `whole`, `m` (the duotone branch: `{ ...(await measure(base, G)), live: whole.box }` serves bulk too, since `measure` weighs alpha and a body at .4 counts 0.4), `e` as they are. Then:

```js
      const share = filled ? await shares(base, G) : null;
      const accentInk = bulk ? (await measure(compose(parsed.attrs, c.accents), G)).ink : null;
      const inner = bulk ? [] : interiorDetails(parsed, els, p, c, rootW);
```

4. The crossing pairs and the air render at bulk, replacing the `outside`/`narrow` lines with:

```js
      // at bulk a crossing accent and its cut body are the band's, not gap's or air's; air sees every body full
      const crossing = new Set();
      if (bulk) for (const b of c.bodies) for (const a of c.accents) if (crosses(a, b)) crossing.add(`${a.at}|${b.at}`);
      const full = (list) => list.map((el) => { const { "fill-opacity": _, "data-cut": __, "data-body": ___, ...a } = el.attrs; return { ...el, attrs: a }; });
      const outside = bulk
        ? full(els.filter((el) => !c.accents.includes(el) || ![...crossing].some((k) => k.startsWith(`${el.at}|`))))
        : els.flatMap(/* the existing drop/keep body, unchanged */);
      const narrow = await air(compose(parsed.attrs, outside), G, bulk ? p.gap / AIR : p.stroke);
      const skip = new Set();
      if (bulk) for (const k of crossing) { const [a, b] = k.split("|"); skip.add(`${a}|${b}`); skip.add(`${b}|${a}`); }
      else for (const { el, i, body } of inner) for (const x of els) if (geometryKey(x) === geometryKey(body)) skip.add(`${el.at}#${i}|${x.at}`);
      // the band, on every cut body: the cut, its uncut geometry, and the accents that cross it, each rendered full
      const bands = [];
      if (bulk) for (const b of c.bodies.filter(isKnockout)) {
        const under = c.accents.filter((a) => crossing.has(`${a.at}|${b.at}`));
        if (!under.length) continue; // bulkChecks reports a stale cut
        bands.push(...(await band(compose(parsed.attrs, full([b])), compose(parsed.attrs, full([uncut(b)])), compose(parsed.attrs, full(under)), G, p.knockout, KNOCKOUT_TOL)));
      }
      measures.push({ ...s, els, parts, details, paint, m, modified, share, accentInk, rootW, inner, skip, narrow, e, shadowed, bands });
```

5. In the rules loop, destructure `accentInk` and `bands` too. Gap at bulk: the width map reads each element's own `stroke-width` with fallback `rootW` (0 at bulk, so a filled accent's edge is its outline), and the minimum is `p.gap`:

```js
    const width = new Map(els.map((el) => [el.at, num(el.attrs, "stroke-width", rootW)]));
    const gap = (A, B, a, b) => {
      const ka = a.replace(/\[\d+\]$/, ""), kb = b.replace(/\[\d+\]$/, "");
      if (bulk && skip.has(`${ka}|${kb}`)) return;
      const min = bulk ? p.gap : (details.has(ka) || details.has(kb) ? AIR / 2 : AIR) * p.stroke;
      … (the rest unchanged)
    };
```

`side(i, j)` stays; at bulk `skip` holds whole-element pairs, which `gap` checks before measuring, so `side` returns the whole parts (its `skip.has(\`${at}#${k}|…\`)` keys never match at bulk).

6. Air messages at bulk in grid units:

```js
    for (const a of narrow) {
      const unit = bulk ? "" : " strokes";
      if (a.kind === "paper") fail(failures, "air", name, `paper ${a.across.toFixed(1)}${unit} wide at ${a.at[0]}, ${a.at[1]}`, `≥ ${AIR} apart, or touching`);
      else fail(failures, "air", name, `counter ${a.across.toFixed(1)}${unit} across at ${a.at[0]}, ${a.at[1]}`, `≥ ${COUNTER} across`);
    }
```

7. Share and the band, before the `rows.push`:

```js
    if (bulk && ink > 0) {
      const sh = accentInk / ink;
      if (sh < p.share[0] || sh > p.share[1]) fail(failures, "share", name, `accent ${sh.toFixed(2)} of the ink`, `${p.share[0]} to ${p.share[1]}`);
    }
    for (const b of bands) fail(failures, "knockout", name, `paper ${b.width} wide at ${b.at[0]}, ${b.at[1]}`, `${p.knockout}: re-run knockout.mjs`);
    rows.push({ …as today…, ...(share ? { "line%": … } : {}), ...(bulk && ink > 0 ? { "share%": Math.round((1000 * accentInk) / ink) / 10 } : {}) });
```

8. Weight: `const ref = referenceInk(G, finish);`.

9. `check.mjs` `checkSet` already calls `measuredChecks(set.filter(…), G, F)` from Task 4; confirm with `/usr/bin/grep -n "measuredChecks(" skills/pretty-icons/check.mjs`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `rtk test node --test test/pretty-icons/check.test.mjs`
Expected: PASS. If `a`'s air reports a counter inside the diamond's band, the crossing accent was not excluded from `outside`: check the `crossing` keys. If `e`'s band `at` x is not near 15, `band` is reading the hole's left edge too: that edge is 1.5 and passes; only the right edge at 15 is 1.

Then: `rtk test node --test 'test/**/*.test.mjs'`
Expected: PASS (hairline and garage unchanged: `bulk` is false on their path).

- [ ] **Step 5: Commit**

```bash
/usr/bin/git add skills/pretty-icons/measure.mjs skills/pretty-icons/check.mjs test/pretty-icons/check.test.mjs
/usr/bin/git commit -m "feat(pretty-icons): the measured rules at bulk: gap, air, share, the band"
```

---

### Task 7: badges and the dot at bulk

**Files:**
- Modify: `skills/pretty-icons/modifiers.mjs` (`baseStroke`/`ownStroke`, `placement` ~56–62, `halo` ~68–76, `reach` ~78–92, `glyph` ~289–323, `addModifier` ~330–371, `modifierFailures` ~377–419)
- Test: `test/pretty-icons/modifiers.test.mjs`

**Interfaces:**
- Consumes: `preset(G, finish)`, `inset(G, finish)`, `finishOf(root)` (Task 1); `cutBody`, `KnockoutError` (Task 5, imported dynamically inside `addModifier`); `classify as bulkClassify`, `isKnockout` (Task 4, dynamic too).
- Produces: `KINDS_BULK = ["badge:plus", "badge:minus", "badge:check", "badge:x", "dot"]`; `placement(G, kind, corner, finish)`, `halo(G, kind, corner, finish)`, `glyph(G, kind, { corner, solid, finish })`; `addModifier(text, kind, opts)` and `modifierFailures(icon, parsed, G)` read the finish from the root. At bulk a badge glyph is `<path d="…" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-modifier="badge:plus" />`; a dot is `<circle cx cy r data-modifier="dot" />` (no paint: the root fills it); bodies the glyph crosses are cut with `cutBody` at `p.knockout`.

- [ ] **Step 1: Write the failing tests**

Append to `test/pretty-icons/modifiers.test.mjs`:

```js
const svg24b = (b) => `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">\n  ${b}\n</svg>`;
const CIRCLE24B = '<circle cx="12" cy="12" r="10" fill-opacity=".4" />';
const LINE24B = (d) => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`;

test("at bulk: placement with pad 2, a halo of the box plus the knockout, the five kinds, the glyph as a full accent", async () => {
  const { KINDS_BULK } = await import("../../skills/pretty-icons/modifiers.mjs");
  assert.deepEqual(KINDS_BULK, ["badge:plus", "badge:minus", "badge:check", "badge:x", "dot"]);
  assert.deepEqual(placement(24, "badge:plus", "br", "bulk"), { c: [18, 18], half: 4 });
  assert.deepEqual(placement(24, "dot", "tl", "bulk"), { c: [4.25, 4.25], half: 2.25 });
  assert.equal(halo(24, "dot", "br", "bulk").r, 2.25 + 1.5);
  assert.equal(halo(24, "badge:plus", "br", "bulk").r, 4 + 1.5);
  const [plus] = glyph(24, "badge:plus", { finish: "bulk" });
  assert.deepEqual(plus, { tag: "path", attrs: { d: "M15 18H21M18 15V21", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", "data-modifier": "badge:plus" } });
  assert.deepEqual(glyph(24, "dot", { finish: "bulk" }), [{ tag: "circle", attrs: { cx: "19.75", cy: "19.75", r: "2.25", "data-modifier": "dot" } }]);
  assert.deepEqual(glyph(24, "badge:check", { finish: "bulk" })[0].attrs.d, "M15 18L17 20L21 16");
});

test("addModifier at bulk cuts the body the badge crosses and writes a full accent; check passes on the result", async () => {
  const src = svg24b(`${CIRCLE24B}\n  ${LINE24B("M 8 9 H 16")}`);
  const out = await addModifier(src, "badge:plus", { name: "edit" });
  const p = parse(out);
  assert.equal(p.elements.length, 3);
  assert.equal(p.elements[0].attrs["data-cut"], "knockout");
  assert.equal(p.elements[0].attrs["data-body"], "M12 2A10 10 0 1 1 11.99 2Z".replace(/.*/, p.elements[0].attrs["data-body"])); // a path of the circle; its exact arcs are asPath's
  assert.equal(p.elements[0].attrs["fill-opacity"], ".4");
  assert.equal(p.elements[1].attrs.d, "M 8 9 H 16");
  assert.deepEqual(p.elements[2].attrs["data-modifier"], "badge:plus");
  assert.equal(p.elements[2].attrs["stroke-opacity"], undefined);
  assert.deepEqual(textChecks("edit", out, 24).failures, []);
  const dot = await addModifier(src, "dot", { name: "edit", corner: "tr" });
  assert.equal(parse(dot).elements[2].tag, "circle");
  assert.deepEqual(textChecks("edit", dot, 24).failures, []);
});

test("at bulk, slash, lock and arrow refuse in one line; a badge whose halo covers an accent refuses", async () => {
  const src = svg24b(`${CIRCLE24B}\n  ${LINE24B("M 8 9 H 16")}`);
  for (const kind of ["slash", "lock", "arrow:up"]) await assert.rejects(() => addModifier(src, kind, { name: "edit" }), (e) => e instanceof ModifierError && e.message === `${kind} is not drawn at bulk: badge:plus, badge:minus, badge:check, badge:x or dot`);
  const near = svg24b(`${CIRCLE24B}\n  ${LINE24B("M 8 17 H 16")}`);
  await assert.rejects(() => addModifier(near, "badge:plus", { name: "edit" }), (e) => e instanceof ModifierError && e.message === "path@2 lies under the badge:plus's halo: try another --corner, or move the accent");
});

test("modifierFailures at bulk: an accent inside the halo is flagged, the cut body is not, a dot without paint is right", async () => {
  const src = svg24b(`${CIRCLE24B}\n  ${LINE24B("M 8 9 H 16")}`);
  const out = await addModifier(src, "badge:plus", { name: "edit" });
  assert.deepEqual(modifierFailures("edit", parse(out), 24), []);
  const moved = out.replace('d="M 8 9 H 16"', 'd="M 8 17 H 16"');
  const f = modifierFailures("edit", parse(moved), 24);
  assert.equal(f.length, 1);
  assert.match(f[0].got, /^path@2 [\d.]+ inside badge:plus's halo$/);
});
```

Replace the odd `data-body` assertion in the second test with the plain form: `assert.ok(p.elements[0].attrs["data-body"].startsWith("M"), "data-body holds the uncut circle as a path");`.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `rtk test node --test test/pretty-icons/modifiers.test.mjs`
Expected: FAIL: `KINDS_BULK` not exported; `placement` ignores the finish (pad 1 → `[19, 19]`); `addModifier` refuses the bulk root for failing duotone's stroke rules.

- [ ] **Step 3: Implement**

In `skills/pretty-icons/modifiers.mjs`:

1. Import `finishOf` from presets. Add `export const KINDS_BULK = ["badge:plus", "badge:minus", "badge:check", "badge:x", "dot"];`.

2. Thread a `finish` through the small helpers: `baseStroke(G, finish)` and `ownStroke(G, finish)` call `preset(G, finish)`; `placement(G, kind, corner = "br", finish)` uses `preset(G, finish)` (pad 2 at bulk); `reach(G, kind, corner, finish)` calls `placement(…, finish)`, `ownStroke(G, finish)`, `glyph(G, kind, { corner, finish })`; `halo(G, kind, corner = "br", finish)`:

```js
export function halo(G, kind, corner = "br", finish) {
  const p = preset(G, finish), clear = p.finish === "bulk" ? p.knockout : 1.5 * baseStroke(G, finish);
  … (slash as today; the circle: placement(G, kind, corner, finish), reach(G, kind, corner, finish))
}
```

3. `glyph(G, kind, { corner = "br", solid = false, finish } = {})`:

```js
  const p = preset(G, finish), filled = p.finish === "filled", bulk = p.finish === "bulk", s = ownStroke(G, finish);
  if (bulk && !KINDS_BULK.includes(kind)) refuse(`${kind} is not drawn at bulk: badge:plus, badge:minus, badge:check, badge:x or dot`);
  const { c, half } = placement(G, kind, corner, finish), [cx, cy] = c;
  const mark = bulk
    ? { fill: "none", stroke: "currentColor", "stroke-width": String(p.stroke), "stroke-linecap": "round", "stroke-linejoin": "round", "data-modifier": kind }
    : { "data-modifier": kind, ...(filled ? {} : solid ? {} : { "stroke-opacity": String(OPACITY) }) };
  if (kind === "dot") return [{ tag: "circle", attrs: bulk ? { cx: fmt(cx), cy: fmt(cy), r: fmt(half), "data-modifier": kind } : { … as today … } }];
  …
  let h = half - inset(G, finish);
```

The badge branches are unchanged; with `h = 3` and `k = 2` at bulk they print `M15 18H21M18 15V21` for plus. The glyph's path element is `{ tag: "path", attrs: { d, ...mark } }` as today, so at bulk `mark` carries the line's paint.

4. `addModifier(text, kind, { corner, solid, name })`: after `G`, read the finish and branch:

```js
  const finish = finishOf(parsed.attrs) ?? undefined, p = preset(G, finish), bulk = p.finish === "bulk";
  if (bulk && !KINDS_BULK.includes(kind)) refuse(`${kind} is not drawn at bulk: badge:plus, badge:minus, badge:check, badge:x or dot`);
  const { textChecks } = await import("./check.mjs");
  const before = textChecks(name, text, G, finish).failures;
  … (the existing refusals: fails check, has a modifier, has a shadow, slash corner)
  if (bulk) {
    const { cutBody, KnockoutError } = await import("./knockout.mjs");
    const { classify, isKnockout } = await import("./bulk.mjs");
    const { paper } = await import("./raster.mjs");
    const [g] = glyph(G, kind, { corner, finish });
    const H = halo(G, kind, corner, finish), P = paper();
    const { bodies } = classify(parsed), out = [];
    for (const el of parsed.elements) {
      if (!bodies.includes(el)) {
        // an accent: clear of the halo, or the badge would cover it
        const q = sampleParts(el.tag === "path" ? el : asPath(el), 0.05).flat();
        if (Math.min(...q.map(H.inside)) < -0.1) refuse(`${el.at} lies under the ${kind}'s halo: try another --corner, or move the accent`);
        out.push(el);
        continue;
      }
      let d, crossed;
      try { ({ d, crossed } = cutBody(el, [g, ...parsed.elements.filter((x) => !bodies.includes(x))], p.knockout, P, name)); }
      catch (e) { if (e instanceof KnockoutError) refuse(e.message); throw e; }
      if (!crossed.length) { out.push(el); continue; }
      const src = isKnockout(el) ? { ...el, attrs: { ...el.attrs, d: el.attrs["data-body"] } } : el;
      const { d: _d, "data-cut": _c, "data-body": _b, cx, cy, r, ...rest } = src.attrs;
      const body = src.tag === "circle" ? asPath(src).attrs.d : src.attrs.d;
      out.push({ tag: "path", attrs: { d, ...rest, "data-cut": "knockout", "data-body": body } });
    }
    out.push(g);
    const result = compose(parsed.attrs, out).replace(/ \/><(?!\/svg>)/g, " />\n  <").replace(/^(<svg[^>]*>)/, "$1\n  ").replace(/<\/svg>$/, "\n</svg>");
    const failures = textChecks(name, result, G, finish).failures;
    const { measuredChecks } = await import("./measure.mjs"), { NO_RASTER } = await import("./raster.mjs");
    if (!failures.length) {
      try { failures.push(...(await measuredChecks([{ name, text: result }], G, finish)).failures.filter((f) => ["gap", "live", "knockout"].includes(f.rule))); }
      catch (e) { if (e?.code !== NO_RASTER) throw e; }
    }
    if (failures.length) refuse(`the result would fail check:\n${failures.map((f) => `${f.rule}  ${f.icon}  ${f.got} → ${f.want}`).join("\n")}\ntry another --corner or another kind`);
    return result;
  }
  … (the duotone/filled body as today)
```

`cutBody` is given the glyph and the other accents so a body already cut for its own accent is re-cut for both: `data-body` keeps the original. When `cutBody` finds the glyph does not cross a body (a dot in the corner outside a small body), the body is left as it was.

5. `modifierFailures(icon, parsed, G)`: `const finish = finishOf(parsed.attrs) ?? undefined, p = preset(G, finish), bulk = p.finish === "bulk";` then:
   - `const allowed = bulk ? KINDS_BULK : KINDS; if (!allowed.includes(kind)) { f(…, allowed.join(", ")); return out; }`
   - the `stroke-opacity` loop: at bulk `o !== undefined` is a failure with want `not set at bulk`.
   - `ownStroke(G, finish)`, `placement(G, kind, k, finish)`, `halo(G, kind, corner, finish)`.
   - the halo loop: at bulk skip `isModifier`, `isShadow` and `el.attrs["data-cut"] === "knockout"`, and judge every other element (a filled accent has no stroke, so the `isNone(stroke)` skip applies only off bulk):

```js
  for (const el of parsed.elements) {
    if (isModifier(el) || isShadow(el)) continue;
    if (bulk ? el.attrs["data-cut"] === "knockout" : isNone(el.attrs.stroke ?? rootStroke)) continue;
    …
  }
```

The message's want at bulk: `clear of it: add the modifier with modifiers.mjs, which cuts the body`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `rtk test node --test test/pretty-icons/modifiers.test.mjs`
Expected: PASS. If the "near" fixture does not refuse, its line at y 17 from x 8 to 16 ends at (16, 17), 2.83 from the badge's centre (18, 18), inside the halo of 5.5; check `H.inside` is the signed distance less `r`.

Then: `rtk test node --test 'test/**/*.test.mjs'`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
/usr/bin/git add skills/pretty-icons/modifiers.mjs test/pretty-icons/modifiers.test.mjs
/usr/bin/git commit -m "feat(pretty-icons): badges and the dot at bulk"
```

---
### Task 8: sheet and proof at bulk

**Files:**
- Modify: `skills/pretty-icons/sheet.mjs` (`ROWS` 30, `place` 56–63, `keylineTiles` 77–97, `composeSheet` 99–108, `composeBlind` 119, `composeShowcase` 133, `writeSheets`/`writeShowcase` 173–192)
- Modify: `skills/pretty-icons/proof.mjs` (`REFERENCE`/`BG` 32–34, `construction` 59–89, `panel` 92–114, `referenceSet` 117–120, `composeProof` 126–142, `writeProof` 145–154)
- Test: `test/pretty-icons/sheet.test.mjs`, `test/pretty-icons/proof.test.mjs`

**Interfaces:**
- Consumes: `checkSet(dir)` returning `{ …, finish }` and `setFinish(set, forced)` (Task 4); `preset(G, finish)`, `finishOf(root)` (Task 1); `placement`/`halo` with a finish (Task 7); `knockout()` (Task 5, tests only).
- Produces: `composeSheet(set, G, rows, finish)`, `composeBlind(set, G, seed, finish)`, `composeShowcase(set, G, finish)`, `composeShadowPair` unchanged; `place(s, G, x, y, size, colour)` paints a root `fill="currentColor"` and prints no `stroke-width` when the root has none; `REFERENCE.bulk = ["bulk", ["data", "devices", "security"]]`; `referenceSet(G, finish)` returns `[]` while `examples/bulk` does not exist yet (Task 11 draws it); `panel(s, G, x, y, finish)`, `composeProof(set, G, { only, finish })`, `writeProof(folder, { out, only, grid })` reads the finish with `setFinish`.

- [ ] **Step 1: Write the failing tests**

Append to `test/pretty-icons/sheet.test.mjs`:

```js
import { knockout } from "../../skills/pretty-icons/knockout.mjs";
import { place } from "../../skills/pretty-icons/sheet.mjs";

const bulkFolder = (t) => {
  const dir = tmp(t);
  const root = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">';
  const L = (d) => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`;
  const SQ = '<path d="M 8 3 H 16 C 17 3 18 3 19.5 4.5 C 21 6 21 7 21 8 V 16 C 21 17 21 18 19.5 19.5 C 18 21 17 21 16 21 H 8 C 7 21 6 21 4.5 19.5 C 3 18 3 17 3 16 V 8 C 3 7 3 6 4.5 4.5 C 6 3 7 3 8 3 Z" fill-opacity=".4" />';
  writeFileSync(join(dir, "a.svg"), knockout(`${root}\n  ${SQ}\n  <path d="M 12 6 L 18 12 L 12 18 L 6 12 Z" />\n</svg>`, { name: "a" }).text);
  writeFileSync(join(dir, "b.svg"), knockout(`${root}\n  <circle cx="12" cy="12" r="10" fill-opacity=".4" />\n  ${L("M 4 12 H 20")}\n</svg>`, { name: "b" }).text);
  writeFileSync(join(dir, "c.svg"), knockout(`${root}\n  <circle cx="12" cy="12" r="10" fill-opacity=".4" />\n  ${L("M 7 9 H 17 M 7 15 H 17")}\n</svg>`, { name: "c" }).text);
  return dir;
};

test("at bulk, place paints the root's fill, no stroke and no stroke-width on the group; the sheet has duotone's four blocks", async (t) => {
  const dir = bulkFolder(t), set = readSet(dir), r = await checkSet(dir);
  assert.equal(r.finish, "bulk");
  assert.deepEqual(r.failures.filter((f) => f.rule !== "weight"), []);
  const g = place(set[0], 24, 0, 0, 24, "#123456");
  assert.match(g, /^<g transform="[^"]+" fill="#123456" stroke="none" stroke-linecap="round" stroke-linejoin="round">/);
  assert.ok(!g.includes("undefined"), g);
  assert.ok(g.includes('fill-opacity=".4"') && g.includes('stroke="#123456"'), "the body keeps its opacity, the line its own stroke");
  assert.ok(!g.includes("data-cut") && !g.includes("data-body"), "no mark reaches the sheet");
  const svg = composeSheet(set, 24, r.rows, "bulk");
  assert.equal((svg.match(/<g data-theme=/g) ?? []).length, 4);
  assert.ok(svg.includes('data-theme="dark" data-scale="2"'));
  // the keyline tiles use the bulk keylines: a circle of 20, not duotone's 24-grid circle
  assert.ok(svg.includes('width="' + 20 * 6 + '"') || svg.includes("width=\"120\""), "a 20 keyline at the tile scale");
  const out = tmp(t), w = await writeSheets(dir, { out, seed: 1 });
  assert.ok(statSync(w.sheet).size > 1000 && statSync(w.blind).size > 1000);
  const show = composeShowcase(set, 24, "bulk");
  assert.ok(show.includes('fill="#fafafa"'), "bulk shows on duotone's page");
});
```

The duotone sheet fixture at 16 keeps passing: `place` prints `stroke="<colour>"` and the root's `stroke-width` as today when the root declares them. Check the tile scale with `/usr/bin/grep -n "tileScale" skills/pretty-icons/sheet.mjs` and replace the `20 * 6` guess with `20 * tileScale(24)` by importing `tileScale` if it is exported, else by the literal the function gives for 24.

Append to `test/pretty-icons/proof.test.mjs`:

```js
import { knockout } from "../../skills/pretty-icons/knockout.mjs";
import { existsSync as exists } from "node:fs";

test("at bulk the proof draws the uncut body under the cut in amber, uses the bulk keylines, and its reference row is examples/bulk or empty until it is drawn", (t) => {
  const root = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">';
  const SQ = '<path d="M 8 3 H 16 C 17 3 18 3 19.5 4.5 C 21 6 21 7 21 8 V 16 C 21 17 21 18 19.5 19.5 C 18 21 17 21 16 21 H 8 C 7 21 6 21 4.5 19.5 C 3 18 3 17 3 16 V 8 C 3 7 3 6 4.5 4.5 C 6 3 7 3 8 3 Z" fill-opacity=".4" />';
  const cut = knockout(`${root}\n  ${SQ}\n  <path d="M 12 6 L 18 12 L 12 18 L 6 12 Z" />\n</svg>`, { name: "a" }).text;
  const s = { name: "a", text: cut };
  const svg = composeProof([s], 24, { finish: "bulk" });
  assert.ok(svg.includes('fill="#fde68a"'), "the uncut body shows under the cut");
  assert.ok(svg.includes("reference: examples/bulk"));
  const bulk = examples("bulk");
  assert.equal(referenceSet(24, "bulk").length, exists(bulk) ? 3 : 0);
  // the 20 circle keyline, dashed, at the construction view's scale
  assert.ok(svg.includes('width="20" height="20"'), "the bulk circle keyline");
  const dir = tmp(t); writeFileSync(join(dir, "a.svg"), cut);
  const file = writeProof(dir, { out: dir });
  assert.ok(existsSync(file));
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `rtk test node --test test/pretty-icons/sheet.test.mjs test/pretty-icons/proof.test.mjs`
Expected: FAIL: `place` prints `fill="none" stroke="#123456" stroke-width="undefined"`; `ROWS.bulk` undefined so `composeSheet` throws on `blocks.map`; `REFERENCE.bulk` undefined.

- [ ] **Step 3: Implement**

`skills/pretty-icons/sheet.mjs`:

```js
const ROWS = { duotone: [["light", 1], ["dark", 1], ["light", 2], ["dark", 2]], filled: [["light", 1], ["grey", 1], ["dark", 1], ["grey", 2]] };
ROWS.bulk = ROWS.duotone;
```

`place`: the group's paint follows the root. A root that fills in `currentColor` (bulk) fills the group and strokes nothing; each line carries its own stroke, which `paint` colours.

```js
export function place(s, G, x, y, size, colour) {
  const { attrs: root, elements } = parse(s.text);
  const paint = (v) => escAttr(String(v).replace(/currentColor/gi, colour));
  const inner = elements.map((el) => `<${el.tag}${Object.entries(el.attrs).filter(([k]) => DRAW_ATTRS.has(k)).map(([k, v]) => ` ${k}="${paint(v)}"`).join("")} />`).join("");
  const inherited = ROOT_INHERITED.filter((k) => k in root).map((k) => ` ${k}="${paint(root[k])}"`).join("");
  const fill = isCurrent(root.fill) ? colour : "none";
  const stroke = root.stroke ? (isCurrent(root.stroke) ? colour : escAttr(root.stroke)) : isCurrent(root.fill) ? "none" : colour;
  const width = root["stroke-width"] !== undefined ? ` stroke-width="${escAttr(root["stroke-width"])}"` : "";
  return `<g transform="translate(${x} ${y}) scale(${size / G})" fill="${fill}" stroke="${stroke}"${width} stroke-linecap="round" stroke-linejoin="round"${inherited}>${inner}</g>`;
}
```

`keylineTiles(set, G, rows, x, y, finish)` reads `preset(G, finish)`; `composeSheet(set, G, rows, finish)` uses `ROWS[preset(G, finish).finish]` and passes `finish` to `keylineTiles`; `composeBlind(set, G, seed = Date.now(), finish)` and `composeShowcase(set, G, finish)` read `preset(G, finish).finish === "filled"` for the page. `writeSheets`, `writeShowcase` pass `r.finish` from `passed(dir)` (which returns `checkSet`'s result, carrying `finish` since Task 4). `writeShadowPair` keeps `preset(r.G, r.finish).finish !== "filled"`.

`skills/pretty-icons/proof.mjs`:

```js
export const REFERENCE = { duotone: ["hairline", ["data", "devices", "security"]], filled: ["garage", ["car", "traffic-light", "wrench"]], bulk: ["bulk", ["data", "devices", "security"]] };
const BG = { duotone: { bg: "#fafafa", ink: "#737373" }, filled: { bg: "#edeeee", ink: PALETTE.line } };
BG.bulk = BG.duotone;
```

`construction(s, G)`: the modifier's placement and halo take the file's finish: `const finish = finishOf(parsed.attrs) ?? undefined;` then `placement(G, kind, a, finish)` in the corner reduce and `halo(G, kind, corner, finish)`. Import `finishOf` from presets.

`panel(s, G, x, y, finish)`: `const fin = preset(G, finish).finish, { bg, ink } = BG[fin]`, `const { keylines, centre: [cx, cy] } = preset(G, finish);`. Before the pale icon in the construction view, the uncut geometry of every cut body, so the drawer sees what the knockout took:

```js
  const cuts = parse(s.text).elements.filter((el) => el.attrs["data-body"]);
  if (cuts.length) out += `<g transform="translate(${x} ${top}) scale(${scale})">${cuts.map((el) => `<path d="${escAttr(el.attrs["data-body"])}" fill="#fde68a" stroke="none" />`).join("")}</g>`;
  out += `<g opacity=".45">${place(s, G, x, top, VIEW, ink)}</g>`;
```

`escAttr` is imported from svg.mjs in sheet.mjs; import it here the same way (`/usr/bin/grep -n "escAttr" skills/pretty-icons/sheet.mjs` shows the import line).

```js
export function referenceSet(G, finish) {
  const [folder, names] = REFERENCE[preset(G, finish).finish], dir = join(SKILL, "examples", folder);
  if (!existsSync(dir)) return []; // examples/bulk is drawn after the motor; the proof must draw before it exists
  return readSet(dir).filter((s) => names.includes(s.name));
}

export function composeProof(set, G, { only, finish } = {}) {
  … const refs = referenceSet(G, finish) …
  out += `<text …>reference: examples/${REFERENCE[preset(G, finish).finish][0]}</text>`;
  const RG = refs.length ? setGrid(refs) : G;
  refs.forEach((s, i) => { out += panel(s, RG, left + i * pitchX, 44, finish); });
  … icons.forEach((s, i) => { out += panel(s, G, …, finish); });
}

export function writeProof(folder, { out, only, grid } = {}) {
  … const G = setGrid(set, grid), finish = setFinish(set);
  const svg = composeProof(set, G, { only, finish });
```

Import `existsSync` from `node:fs` and `setFinish` from `./check.mjs` (proof.mjs already imports `readSet` from there).

- [ ] **Step 4: Run the tests to verify they pass**

Run: `rtk test node --test test/pretty-icons/sheet.test.mjs test/pretty-icons/proof.test.mjs`
Expected: PASS. Then `rtk test node --test 'test/**/*.test.mjs'`: PASS, the hairline and garage sheet tests unchanged (their roots declare `stroke` and `stroke-width`, so `place` prints what it printed).

- [ ] **Step 5: Commit**

```bash
/usr/bin/git add skills/pretty-icons/sheet.mjs skills/pretty-icons/proof.mjs test/pretty-icons/sheet.test.mjs test/pretty-icons/proof.test.mjs
/usr/bin/git commit -m "feat(pretty-icons): sheet and proof at bulk"
```

---

### Task 9: emit strips the knockout marks

**Files:**
- Modify: `skills/pretty-icons/emit.mjs` (`inner` 63, `toSprite` 94–97, `emit` 111–114)
- Test: `test/pretty-icons/emit.test.mjs`

**Interfaces:**
- Consumes: `knockout()` (Task 5, tests only); `checkSet` reading the finish (Task 4).
- Produces: `stripMarks(attrs)` (module private): an element's attributes without `data-cut` and `data-body`; `emit` writes `.svg` files, React and the sprite without them. `data-modifier` stays, as every other `data-*` does today (Deviation 7).

- [ ] **Step 1: Write the failing test**

Append to `test/pretty-icons/emit.test.mjs`:

```js
import { knockout } from "../../skills/pretty-icons/knockout.mjs";

test("a bulk icon emits with fillOpacity and without data-cut or data-body, in react, the sprite and the svg file", async (t) => {
  const root = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">';
  const SQ = '<path d="M 8 3 H 16 C 17 3 18 3 19.5 4.5 C 21 6 21 7 21 8 V 16 C 21 17 21 18 19.5 19.5 C 18 21 17 21 16 21 H 8 C 7 21 6 21 4.5 19.5 C 3 18 3 17 3 16 V 8 C 3 7 3 6 4.5 4.5 C 6 3 7 3 8 3 Z" fill-opacity=".4" />';
  const cut = knockout(`${root}\n  ${SQ}\n  <path d="M 12 6 L 18 12 L 12 18 L 6 12 Z" />\n</svg>`, { name: "edit" }).text;
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
  // the set is one icon of one body and one accent, so weight has no median to fail against
  const written = await emit(join(dir, "src"), { as: "svg", to: join(dir, "out") });
  const file = readFileSync(join(dir, "out", "edit.svg"), "utf8");
  assert.ok(!/data-(cut|body)/.test(file) && file.includes('fill-opacity=".4"') && file.includes("xmlns="), file);
  assert.ok(written.some((p) => p.endsWith("index.ts")));
});
```

Add `mkdirSync` to the `node:fs` import at the top of the test file.

- [ ] **Step 2: Run the test to verify it fails**

Run: `rtk test node --test test/pretty-icons/emit.test.mjs`
Expected: FAIL at "no knockout mark in JSX" (the attributes are copied as written).

- [ ] **Step 3: Implement**

In `skills/pretty-icons/emit.mjs`:

```js
// The knockout's marks are the drawer's and check.mjs's: data-cut names the cut, data-body keeps the uncut geometry.
// Neither belongs in an app. Every other data-* stays, as it does today.
const MARKS = ["data-cut", "data-body"];
const stripMarks = (attrs) => Object.fromEntries(Object.entries(attrs).filter(([k]) => !MARKS.includes(k)));
const inner = (s) => parse(s.text).elements.map((el) => `<${el.tag} ${jsxAttrs(stripMarks(el.attrs))} />`);
```

In `toSprite`: `attrText(stripMarks(el.attrs))`. In `emit`, for `as === "svg"`:

```js
    const written = set.map((s) => { const p = join(dest, `${s.name}.svg`); writeFileSync(p, withNs(stripText(s.text))); return p; });
```

with

```js
// The file as written, less the two marks; the regex matches an attribute written by knockout.mjs or modifiers.mjs (compose quotes with ").
const stripText = (text) => text.replace(/\s+data-(cut|body)="[^"]*"/g, "");
```

If `emit` reports a `weight` failure on the one-icon test set, the median of one icon is itself and passes; a `share` failure would mean the diamond is outside the band, and the accent in this fixture is 27% of the ink, inside it.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `rtk test node --test test/pretty-icons/emit.test.mjs`
Expected: PASS, the existing `data-k="1"` case included.

- [ ] **Step 5: Commit**

```bash
/usr/bin/git add skills/pretty-icons/emit.mjs test/pretty-icons/emit.test.mjs
/usr/bin/git commit -m "feat(pretty-icons): emit strips the knockout marks"
```

---

### Task 10: rules-bulk.md and the studio read

**Files:**
- Create: `skills/pretty-icons/rules-bulk.md`
- Modify: `skills/pretty-icons/read.md` (after "## The shadow read", before "## Without a second agent")
- Test: `test/pretty-icons/docs.test.mjs`

**Interfaces:**
- Consumes: the messages `bulkChecks` (Task 4), `measuredChecks` at bulk (Task 6), `knockout` (Task 5) and `addModifier` (Task 7) print; `shapes.mjs squircle --finish bulk` (Task 3).
- Produces: `rules-bulk.md`, whose quoted messages the docs test generates and compares; `read.md` "## The studio read" with its prompt, word for word, which Task 11 and the reference doc use.

- [ ] **Step 1: Write the failing test**

Append to `test/pretty-icons/docs.test.mjs`:

```js
test("rules-bulk.md quotes what check.mjs prints at bulk: stroke, construction, radius, knockout, share, gap, count", async () => {
  const bulk = doc("rules-bulk.md");
  const { knockout } = await import("../../skills/pretty-icons/knockout.mjs");
  const root = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">';
  const B = (inner, r = root) => `${r}\n  ${inner}\n</svg>`;
  const SQ = '<path d="M 8 3 H 16 C 17 3 18 3 19.5 4.5 C 21 6 21 7 21 8 V 16 C 21 17 21 18 19.5 19.5 C 18 21 17 21 16 21 H 8 C 7 21 6 21 4.5 19.5 C 3 18 3 17 3 16 V 8 C 3 7 3 6 4.5 4.5 C 6 3 7 3 8 3 Z" fill-opacity=".4" />';
  const CIRCLE = '<circle cx="12" cy="12" r="10" fill-opacity=".4" />';
  const L = (d) => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`;
  const text = (icon, svg) => textChecks(icon, svg, 24).failures.map(line);
  const quoted = [
    ...text("edit", B(`${CIRCLE}\n  ${L("M 2 2 H 5")}`, root.replace(' aria-hidden', ' stroke="currentColor" aria-hidden'))),
    ...text("edit", B(`<circle cx="12" cy="12" r="10" fill-opacity=".4" stroke="currentColor" stroke-width="2" />\n  ${L("M 2 2 H 5")}`)),
    ...text("edit", B(`<rect x="3" y="3" width="18" height="18" rx="5" fill-opacity=".4" />\n  ${L("M 2 2 H 5")}`)),
    ...text("edit", B(`${CIRCLE}\n  <path d="M 1 1 H 7 V 2.5 H 1 Z" />`)),
    ...text("edit", B(`${SQ}\n  <path d="M 12 6 L 18 12 L 12 18 L 6 12 Z" />`)),
    ...(await ruled("share", 24, ["empty", B(`${SQ}\n  <path d="M 1 1 H 3 V 3 H 1 Z" />`)])),
    ...(await ruled("gap", 24, ["edit", B(`${CIRCLE}\n  <path d="M 1 1 H 4 V 4 H 1 Z" />\n  <path d="M 5 1 H 8 V 4 H 5 Z" />`)])),
  ];
  assert.ok(quoted.length >= 7, quoted.join("\n"));
  for (const l of quoted) assert.ok(bulk.includes(`\`${l}\``), `rules-bulk.md quotes ${l}`);
  // the squircle's d, as the kit prints it, is pasted in the doc
  const { shape } = await import("../../skills/pretty-icons/shapes.mjs");
  const d = /d="([^"]+)"/.exec(shape("squircle", { grid: 24, w: 18, h: 18, at: [12, 12], finish: "bulk" }))[1];
  assert.ok(bulk.includes(d), "the 18 squircle's d is in rules-bulk.md");
  const read = doc("read.md");
  assert.ok(read.includes("## The studio read"));
  assert.ok(read.includes("> These are two sets of icons, A and B, from two apps. Which set looks drawn by an icon studio: A, B, or both? Answer with the letter or \"both\" and, in five words or fewer, why."));
});
```

`line` and `ruled` are the helpers already in docs.test.mjs (`ruled` takes the finish from the root since Task 6 passes `measuredChecks(…, G, finish)`; give it one: change its body to `measuredChecks(icons.map(…), G, finish)` with a third parameter `finish` defaulting to `undefined`, and call `ruled("share", 24, …)` as `ruled("share", 24, …)` after moving `finish` to the end: `const ruled = async (rule, G, ...icons) =>` stays, and inside: `measuredChecks(icons.map(…), G, G === 24 && /fill="currentColor"/.test(icons[0][1]) ? "bulk" : undefined)`).

- [ ] **Step 2: Run the test to verify it fails**

Run: `rtk test node --test test/pretty-icons/docs.test.mjs`
Expected: FAIL: `rules-bulk.md` does not exist (`doc` throws ENOENT).

- [ ] **Step 3: Write rules-bulk.md**

Create `skills/pretty-icons/rules-bulk.md`. The quoted messages must match what the test generates: after writing, run the test and paste any message it names, exactly. The numbers in the examples (0.03, the share; 1 apart; the crumb) come from Tasks 4–6's fixtures.

````markdown
# The rules at the bulk finish

The root names the finish: `fill="currentColor"` and no `stroke` is bulk, on 24 only, shown at 16 to 32 px by CSS. Duotone on 24 declares `stroke="currentColor" fill="none"`; `check.mjs --finish=bulk|duotone` overrides a folder's vote. The rules keep their names and numbers; this file says where each reads differently at bulk, and the rest is `rules.md`'s text. `examples/bulk`, ten icons with `examples/hairline`'s names, is the finish; its metaphors are not the bar (rule 09).

What the finish is: one colour, two inks. A **body** is a closed shape filled at `fill-opacity=".4"`. An **accent** is full: a closed shape filled by the root, or a line at stroke 2 with round caps and joins. Nothing has a contour; there is no second width; there is no shadow. Where an accent crosses a body, a band of paper 1.5 wide follows the accent, cut out of the body by `knockout.mjs`, never by hand. On a dark page `currentColor` turns light and 0.4 of it is still the body: the file does not change.

| Element | What it is | Paint |
| --- | --- | --- |
| body | the object's mass: a squircle, a circle, a pill, a closed path from the kit | `fill-opacity=".4"`, nothing else |
| accent, filled | the gesture, as a shape | nothing: the root fills it |
| accent, line | the gesture, as a line | `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"` |
| cut body | a body with the knockout written | as a body, plus `data-cut="knockout" data-body="<the uncut d>"`, written by `knockout.mjs` |

## The preset

Grid 24, padding 2, live 20 (2 to 22), step 0.25. Keylines as sizes of ink: circle 20, square 18, portrait 16 × 20, landscape 20 × 16. A line's ink runs 1 past its geometry, so a line accent from 3 to 21 fills the 20 keyline. Stroke 2, knockout 1.5, gap 1.5, share 0.25 to 0.6. Corner radius 5 when the body's short side is 12 or more, 3 below; or a pill.

## 01 · grid

- As `rules.md`. A cut body's numbers are exempt: `knockout.mjs` writes them. The uncut geometry in `data-body` is judged.

## 02 · keyline

- The 24 keylines above, ±0.5. A body alone rarely fills a keyline: the accent is part of the ink. A line accent reaches a keyline side at its end plus 1.

## 03 · stroke

- The root: `viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"`, no `stroke`, no `stroke-width`. A line declares its five paint attributes itself; a body `fill-opacity=".4"`; a filled accent nothing.
- **Rejected when:** `stroke  edit  root stroke currentColor → not set at bulk`; `stroke  edit  path@2 stroke-width 1.5 → 2`; `stroke  edit  path@2 stroke-linecap missing → round`.

## 04 · construction

- A body is a closed shape at 0.4; an accent is a closed shape or a line, full. Every icon has at least one body and at least one accent. A closed element with a fill and a stroke is a contour, and is refused. The accent is rule 09's gesture; it is sized to read at 16 px: a filled accent no side under 2, a line accent no shorter than 3.
- **Keep it, for a body:** `node <skill-dir>/shapes.mjs squircle --w 18 --h 18 --at 12,12 --finish bulk` prints the square body: `<path d="M 8 3 H 16 C 17 3 18 3 19.5 4.5 C 21 6 21 7 21 8 V 16 C 21 17 21 18 19.5 19.5 C 18 21 17 21 16 21 H 8 C 7 21 6 21 4.5 19.5 C 3 18 3 17 3 16 V 8 C 3 7 3 6 4.5 4.5 C 6 3 7 3 8 3 Z" fill-opacity=".4" />`. Every primitive takes `--finish bulk` and prints the body alone; `--accent` prints it full.
- **Keep it, for the accent:** one gesture, drawn after the body. Inside the body, let it cross: `knockout.mjs` cuts the band. Outside, 1.5 from the body edge to edge, or touching.
- **Rejected when:** `construction  edit  circle@1 fill and stroke → a body at .4 or an accent, no contour`; `construction  edit  no body → at least one body at .4`; `construction  edit  no accent → at least one accent, full`; `construction  edit  path@2 1.5 wide → a filled accent no side under 2`; `construction  edit  path@2 2.5 long → a line accent no shorter than 3`; `construction  edit  path@2 open and unstroked → a line declares stroke`.

## 05 · weight

- ±15% of the set's median, ±20% of the reference, the median of `examples/bulk`. The ink is rendered alpha: a body counts at 0.4, an accent at 1, so a body 18 square weighs about as much as a line accent 20 long. Move weight with the body's size first, then the accent's.

## 06 · gravity

- ±0.5, as `rules.md`. The body sets the mass; an accent in a corner pulls it. Centre the body on the keyline and let the accent's pull stay under 0.5, or move the body the other way by a quarter.

## 07 · radius

- A squircle from the kit, radius 5 or 3 by the short side at 12, or a pill. No `rect`.
- **Rejected when:** `radius  edit  rect@1 → shapes.mjs squircle`.

## 08 · gap, and the knockout

- Accent to body: crossing, with a knockout of 1.5; touching (centrelines within 0.1); or 1.5 apart, edge to edge. Accent to accent: touching or 1.5 apart.
- **Add the cut:** `node <skill-dir>/knockout.mjs pretty-icons/<name>.svg` cuts every crossing and writes the file; `--print` prints it instead. It prints `edit  cut path@1 under path@2`, or `edit  nothing to cut`. Run it again after any edit: it starts from `data-body`, so a second run gives the same file. A cut that would leave a piece under 1 across refuses: `crumb  edit  path@1 a piece 0.5 across under path@2 → at least 1: move the accent, or make it a body`.
- **Rejected when:** `knockout  edit  path@2 crosses path@1 without a cut → node knockout.mjs pretty-icons/edit.svg`; `knockout  edit  paper 1.1 wide at 12, 14 → 1.5: re-run knockout.mjs`, a band cut by hand; `knockout  edit  path@1 cut with no crossing → re-run knockout.mjs`, an accent moved after the cut; `gap  edit  path@2 to path@3 1 apart → ≥ 1.5 apart, or crossing`.

## 09 · metaphor

- As `rules.md`: one object, at most three elements, eight drawing commands across the accents. The accent is the gesture; a body takes no second accent. Do not copy `examples/bulk`'s metaphors.
- **Rejected when:** `count  edit  accents 10 drawing commands → at most 8`.

## 10 · set

- As `rules.md`.

## 11 · share

- The accent's ink over the whole ink, 0.25 to 0.6. Under it the icon is a pale blob; over it, a glyph on a sliver.
- **Keep it, for a pale icon:** a larger accent, or a second line in the same path (two bars, not one). **For a dark one:** a larger body, or a thinner gesture.
- **Rejected when:** `share  empty  accent 0.03 of the ink → 0.25 to 0.6`.

## 12 · air, loose and diagonal

- Air: paper 1.5 wide and a counter of 2, in grid units, between parts that do not cross; a crossing accent is the band's, not air's. Loose is the knockout: an accent inside a body stops 1.5 from the body's edge, which the cut provides. Diagonal as `rules.md`.
- **Rejected when:** `air  edit  paper 1.0 wide at 4.5, 2.5 → ≥ 1.5 apart, or touching`.

## 13 · modifiers

- `badge:plus`, `badge:minus`, `badge:check`, `badge:x` and `dot` only, as full accents: `node <skill-dir>/modifiers.mjs pretty-icons/<name>.svg badge:plus` places the glyph, cuts the body it crosses and writes the file. No shadow at bulk.
- **Rejected when:** `slash is not drawn at bulk: badge:plus, badge:minus, badge:check, badge:x or dot`; `path@2 lies under the badge:plus's halo: try another --corner, or move the accent`.
````

Then `read.md`, before "## Without a second agent":

```markdown
## The studio read

Once a bulk set passes the blind, craft and set reads: `sheet.mjs --showcase` for the set, and the person's reference image of the bar it is measured against, placed side by side in one image, lettered A and B at random (a coin, recorded). A new reader, the image alone:

> These are two sets of icons, A and B, from two apps. Which set looks drawn by an icon studio: A, B, or both? Answer with the letter or "both" and, in five words or fewer, why.

Pass: "both". A set singled out goes back to step 3 (Draw) with the reader's words, then all of step 4.
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `rtk test node --test test/pretty-icons/docs.test.mjs`
Expected: PASS, including "the reference set's name is in no file of the skill" (the doc says "the bar", never the name). A message the test names and the doc lacks: paste it from the assertion text, exactly.

- [ ] **Step 5: Commit**

```bash
/usr/bin/git add skills/pretty-icons/rules-bulk.md skills/pretty-icons/read.md test/pretty-icons/docs.test.mjs
/usr/bin/git commit -m "docs(pretty-icons): rules-bulk.md and the studio read"
```

---
### Task 11: examples/bulk, in rounds, and the calibration

**Files:**
- Create: `skills/pretty-icons/examples/bulk/{all,coding,connectivity,data,devices,empty,interfaces,machines,marks,security}.svg`
- Modify: `skills/pretty-icons/presets.mjs` (`BULK_REFERENCE_INK`, `BULK_PRESETS[24].share`)
- Test: `test/pretty-icons/examples.test.mjs`

**Interfaces:**
- Consumes: the whole motor: `shapes.mjs … --finish bulk`, `knockout.mjs`, `modifiers.mjs`, `check.mjs`, `sheet.mjs` (sheet, showcase, proof), `read.md` (blind, craft, set, studio reads).
- Produces: ten passing files; `BULK_REFERENCE_INK[24]` = the median ink of the examples without a modifier, within 0.5; `BULK_PRESETS[24].share` kept at `[0.25, 0.6]` unless an example that reads well sits outside it, in which case the band widens to hold it by 0.05 and the reference doc says which icon; `referenceSet(24, "bulk")` returns data, devices, security.

- [ ] **Step 1: Write the failing tests**

Append to `test/pretty-icons/examples.test.mjs`:

```js
import { BULK_REFERENCE_INK } from "../../skills/pretty-icons/presets.mjs";
import { knockout } from "../../skills/pretty-icons/knockout.mjs";
import { referenceSet } from "../../skills/pretty-icons/proof.mjs";

const bulk = new URL("../../skills/pretty-icons/examples/bulk/", import.meta.url).pathname;
const names = ["all", "coding", "connectivity", "data", "devices", "empty", "interfaces", "machines", "marks", "security"];

test("examples/bulk: the ten names of hairline, every rule passes, the finish read from the files", async () => {
  assert.deepEqual(readdirSync(bulk).filter((f) => f.endsWith(".svg")).map((f) => f.slice(0, -4)).sort(), names);
  const r = await checkSet(bulk);
  assert.equal(r.finish, "bulk");
  assert.equal(r.measured, true);
  assert.deepEqual(r.failures.map((f) => `${f.rule} ${f.icon} ${f.got}`), []);
  assert.equal(referenceSet(24, "bulk").length, 3);
});

test("examples/bulk: every cut was written by knockout.mjs: a re-run changes no file", () => {
  for (const n of names) {
    const text = readFileSync(`${bulk}${n}.svg`, "utf8");
    assert.equal(knockout(text, { name: n }).text, text, `${n} is as knockout.mjs leaves it`);
  }
});

test("examples/bulk: the reference ink is the median of the examples without a modifier, within 0.5; every share sits in the band", async () => {
  const plain = names.filter((n) => !/data-modifier=/.test(readFileSync(`${bulk}${n}.svg`, "utf8")));
  assert.ok(plain.length >= 7, "at most three carry a modifier");
  const r = await checkSet(bulk);
  const inks = r.rows.filter((x) => plain.includes(x.icon)).map((x) => x.ink).sort((a, b) => a - b), m = inks.length >> 1;
  const median = inks.length % 2 ? inks[m] : (inks[m - 1] + inks[m]) / 2;
  assert.ok(Math.abs(BULK_REFERENCE_INK[24] - median) <= 0.5, `stored ${BULK_REFERENCE_INK[24]}, measured ${median}`);
  for (const x of r.rows) assert.ok(x["share%"] >= 25 && x["share%"] <= 60, `${x.icon} share ${x["share%"]}`);
});

test("examples/hairline and examples/garage still pass: the duotone and filled paths are untouched", async () => {
  for (const f of ["hairline", "garage"]) {
    const r = await checkSet(new URL(`../../skills/pretty-icons/examples/${f}/`, import.meta.url).pathname);
    assert.deepEqual(r.failures.map((x) => `${x.rule} ${x.icon}`), [], f);
  }
});
```

If the share band is widened in Step 3, the `25`/`60` literals in the third test follow `BULK_PRESETS[24].share`: import it and use `share[0] * 100` and `share[1] * 100`.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `rtk test node --test test/pretty-icons/examples.test.mjs`
Expected: FAIL: `examples/bulk` does not exist (ENOENT from `readdirSync`).

- [ ] **Step 3: Draw the ten, in rounds**

Work in `skills/pretty-icons/examples/bulk/`. Each icon is one body from the kit and one accent, the gesture, following `rules-bulk.md`. The concepts to start from (the drawer may change a metaphor that fails a read, and records the change in Task 13's reference doc):

| name | body | accent (the gesture) |
| --- | --- | --- |
| all | four squircles 8 × 8 at radius 3, in one path (`squircle --w 8 --h 8 --at 7,7`, `17,7`, `7,17`, `17,17`, the four `d`s joined) | none needed as a separate element: the top-left cell is the accent, printed with `--accent` as its own path; three cells at .4 in one path |
| coding | landscape squircle 20 × 16 at 12,12 | a line chevron and slash: `M 8 9 L 5 12 L 8 15 M 16 9 L 19 12 L 16 15` is two chevrons; use `M 7 9 L 4 12 L 7 15 M 17 9 L 20 12 L 17 15` if the first fails keyline |
| connectivity | circle r 10 at 12,12 | a line: three arcs is too many commands; a dot pair `M 8 12 H 16` with a dot `circle r 2.25` at 12,12 (two accents, ≤ 8 commands) |
| data | square squircle 18 at 12,12 | three bars in one line path: `M 8 9 H 16 M 8 12 H 16 M 8 15 H 12` |
| devices | portrait squircle 16 × 20 at 12,12 | a line screen bar `M 9 18 H 15` and a dot at 12,7? Prefer one accent: `M 8 7 H 16 V 15 H 8 Z` as a filled screen (knockout cuts the band) |
| empty | square squircle 18 at 12,12 | a line dash `M 8 12 H 16` |
| interfaces | landscape squircle 20 × 16 at 12,12 | a filled sidebar `M 5 7 H 9 V 17 H 5 Z` (knockout) |
| machines | circle r 10 at 12,12 | a filled hub `circle r 3.5 at 12,12` and a line tooth pair `M 12 2.5 V 5 M 12 19 V 21.5` |
| marks | portrait squircle 16 × 20 at 12,12 | a line check `M 8 12 L 11 15 L 16 9` |
| security | portrait squircle 16 × 20 at 12,12, or `shapes.mjs shield` if the kit has one | a filled keyhole: `circle r 2.25 at 12,11` plus `M 11 12 H 13 V 16 H 11 Z` as one path |

The loop per icon, from the repo root (`SK=skills/pretty-icons`):

```bash
node $SK/shapes.mjs squircle --w 18 --h 18 --at 12,12 --finish bulk     # paste into the file under the root
node $SK/shapes.mjs --from $SK/examples/bulk/<name>.svg                  # repair a hand-written path, if any
node $SK/knockout.mjs $SK/examples/bulk/<name>.svg                       # the cut, after every edit of body or accent
node $SK/check.mjs $SK/examples/bulk --print                             # fix each line by its rule
node $SK/sheet.mjs $SK/examples/bulk --proof --only <name>                # look at the cut (amber) and the joins
```

The root of every file:

```
<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
```

Rounds: when `check.mjs` prints `ok`, `node $SK/sheet.mjs $SK/examples/bulk --seed=<n>` and `--showcase`, then the reads from `read.md`, each by a new agent with the image alone: blind (N = 10, the names alphabetical), craft, set, and the studio read (the showcase beside the person's reference image, lettered by a coin). A failed read goes back to the drawing for the icons named, then `check.mjs` and the reads again, a new seed each round. Record every round's `check.mjs --print` table, seed, and each reader's answer verbatim; Task 13 writes them into the reference doc.

Calibrate, once the reads pass: run `node $SK/check.mjs $SK/examples/bulk --print`, take the `ink` column of the icons without `data-modifier`, and set `BULK_REFERENCE_INK = { 24: <median> }` in `presets.mjs`, one decimal. The `share%` column: if every icon is inside `[0.25, 0.6]`, keep it; otherwise widen the nearer bound by 0.05 steps until the set is inside, and note the icon and the new band for Task 13.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `rtk test node --test test/pretty-icons/examples.test.mjs`
Expected: PASS. Then `rtk test node --test 'test/**/*.test.mjs'`: PASS (the presets test from Task 1 asserts `BULK_REFERENCE_INK[24]` is a number, not its value).

- [ ] **Step 5: Commit, per round**

Each round that reaches `ok` is its own commit, so the reference doc can cite it:

```bash
/usr/bin/git add skills/pretty-icons/examples/bulk skills/pretty-icons/presets.mjs test/pretty-icons/examples.test.mjs
/usr/bin/git commit -m "feat(pretty-icons): examples/bulk, round N"
```

The last round's message: `feat(pretty-icons): examples/bulk`.

---

### Task 12: SKILL.md offers the bulk finish

**Files:**
- Modify: `skills/pretty-icons/SKILL.md` (the head 7–9, step 1 bullets 18–19, step 3 lines 30–40, step 4 line 46–54, step 5 line 60–64, the What-goes-wrong table 72–103)
- Test: `test/pretty-icons/docs.test.mjs`

**Interfaces:**
- Consumes: `rules-bulk.md` and the studio read (Task 10); `knockout.mjs` (Task 5); `examples/bulk` (Task 11).
- Produces: a SKILL.md the trial agents (Task 13) run from. The spec's publishing order puts SKILL.md after the trial; the trial runs "the skill as the plan leaves it" and names the bulk finish, so SKILL.md comes first (Deviation 8).

- [ ] **Step 1: Write the failing test**

Append to `test/pretty-icons/docs.test.mjs`:

```js
test("SKILL.md offers three finishes, recommends bulk for a sidebar with presence, runs knockout.mjs in the loop, and sends a bulk set to the studio read", () => {
  const skill = doc("SKILL.md");
  for (const s of [
    "one of three finishes",
    "**Bulk**, on 24",
    "fill-opacity=\".4\"",
    "bulk in a sidebar, a nav or tabs when the app wants presence",
    "duotone when the app is thin",
    "`rules-bulk.md`",
    "examples/bulk",
    "knockout.mjs pretty-icons/<name>.svg",
    "never cut a body by hand",
    "Do the studio read",
    "**not read by the studio**",
    "| cutting a knockout by hand, or moving an accent after the cut |",
    "| a `rect` at bulk |",
    "| a `share` out of the band |",
  ]) assert.ok(skill.includes(s), s);
  assert.ok(/node <skill-dir>\/knockout\.mjs[^\n]*\n[^\n]*check\.mjs/.test(skill) || skill.indexOf("knockout.mjs pretty-icons/<name>.svg") < skill.indexOf("3. `node <skill-dir>/check.mjs pretty-icons/`"), "knockout before check in the loop");
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `rtk test node --test test/pretty-icons/docs.test.mjs`
Expected: FAIL at "one of three finishes".

- [ ] **Step 3: Edit SKILL.md**

The head (line 9), replacing "in one of two finishes" through the finishes' description:

```markdown
You are drawing a set of icons for one app in one of three finishes. **Duotone**, on 16, 20 or 24: a stroke in `currentColor` with a `currentColor` fill at 20% under every body, for a sidebar that wants to stay thin. **Bulk**, on 24 and shown at 16–32 px by CSS: one colour, two inks, a body in `currentColor` at `fill-opacity=".4"` and one full accent, no contour, the accent cut out of the body by a band of paper, for a sidebar, a nav or tabs that want presence. **Filled**, on 48: a thin line over a light body in five neutral tones, the side away from the light shaded inside the body, an offset shadow only when a read picks it, no colour, for icons shown at 16–64 px by CSS. The person chooses the finish; the grid follows from it. What makes them a set is measurement: `check.mjs` measures every icon against the others and the keylines, and a reader who has seen none of your work names each from the picture alone. `examples/hairline` (ten sidebar icons, duotone), `examples/bulk` (the same ten names, bulk) and `examples/garage` (ten car icons, filled) are the finishes; their metaphors are not the bar (rule 09).
```

Step 1's finish bullet (line 18): "the finish, which the person chooses: duotone (one colour, the text's, that follows hover and active states, thin), bulk (the same colour at two inks, with presence) or filled (neutral tones, light and shade, the same in every state). Ask, and recommend from where the icon is shown: bulk in a sidebar, a nav or tabs when the app wants presence, duotone when the app is thin, beside text in a table row; filled in a feature grid, a category list, a card header or an empty state. With nobody to ask, take the recommendation and say so;". The grid bullet (line 19) gains: "Bulk is drawn on 24 and shown at 16 to 32 px by CSS; never draw bulk on 16 or 20."

Step 3 (line 30): "`<skill-dir>/examples/hairline` (duotone), `<skill-dir>/examples/bulk` (bulk) or `<skill-dir>/examples/garage` (filled)". Line 32: "Read `rules.md` first; for the bulk finish, then `rules-bulk.md`, which gives the preset, the two inks, the squircle and the knockout; for the filled finish, then `rules-filled.md` …". Line 36, the compose step, adds: "at bulk, `--finish bulk` prints the body alone and `--accent` the accent full". The loop gains a step between repair and check, so the numbers become 1 to 6:

```markdown
3. At bulk, after every edit of a body or an accent: `node <skill-dir>/knockout.mjs pretty-icons/<name>.svg`. It cuts the band where an accent crosses a body and writes the file; never cut a body by hand. `nothing to cut` is fine.
4. `node <skill-dir>/check.mjs pretty-icons/`. Fix each line by its rule.
5. `node <skill-dir>/sheet.mjs pretty-icons/ --proof --only <name>` … (as today; add: "at bulk the cut shows in amber under the body")
6. Adjust and go back to 2, until …
```

Step 4 gains, after the shadow read (line 52): "8. Do the studio read in `read.md`, at the bulk finish, with a new reader, once the other reads pass: the showcase beside the person's reference image, lettered by a coin. A set singled out goes back to step 3 (Draw), then all of step 4." Line 54's exit-2 sentence adds "and, at the bulk finish, **not read by the studio**". Step 5 (hand over, line 64) adds the bullet "at the bulk finish, the studio read: the reader's answer, or **not read by the studio**".

The What-goes-wrong table gains three rows:

```markdown
| cutting a knockout by hand, or moving an accent after the cut | `rules-bulk.md` 08: `knockout.mjs` writes every cut; run it again after any edit |
| a `rect` at bulk | `rules-bulk.md` 07: `shapes.mjs squircle --finish bulk`, radius 5 or 3, or a pill |
| a `share` out of the band | `rules-bulk.md` 11: a larger accent for a pale icon, a larger body for a dark one |
```

Every mention of "the two finishes" or "either finish" in SKILL.md: `/usr/bin/grep -n "two finishes\|either finish\|both finishes" skills/pretty-icons/SKILL.md` and reword each to three.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `rtk test node --test test/pretty-icons/docs.test.mjs`
Expected: PASS, including the older SKILL.md tests (their strings are kept: "shapes.mjs <primitive>", "--proof --only <name>", "Do the craft read", "**not read as a set**").

- [ ] **Step 5: Commit**

```bash
/usr/bin/git add skills/pretty-icons/SKILL.md test/pretty-icons/docs.test.mjs
/usr/bin/git commit -m "docs(pretty-icons): SKILL.md offers the bulk finish"
```

---

### Task 13: the trial, the reference doc and CONTEXT.md

**Files:**
- Create: `docs/superpowers/baselines/2026-10-12-pretty-icons-bulk-reference.md`
- Modify: `docs/superpowers/pretty-icons/CONTEXT.md` (the "O que é" paragraph, the "Onde vive" table, the "Linha do tempo" list, the "Pontos em aberto" list)
- No module changes. No new test: the trial's verdict is recorded, not asserted.

**Interfaces:**
- Consumes: the skill as Task 12 leaves it; the rounds and reads recorded in Task 11; `sheet.mjs --seed=12` for the controller's blind read.
- Produces: the reference doc in the polish reference's form (sections `## examples/bulk`, `## Reads`, `## Findings for the person`, `## The trial` with `### notes, bulk 24`, `### kitchen, bulk 24`, `### What the trial says`); CONTEXT.md names the bulk finish.

- [ ] **Step 1: Run the trial**

Two scratch folders, empty, outside the repo (`mkdtemp` under `/Users/lucasmarques/.claude/jobs/93ba473d/tmp` or the system temp). Two fresh agents (opus, `Agent` with `subagent_type: "general-purpose"`, `model: "opus"`), launched in one message so they run at the same time, each with this prompt (the polish trial's, with "bulk" where the finish is named, and the kitchen shop's categories now at bulk too, as the spec says):

> Your working directory for this whole task is `<scratch>`. It is empty, and there is no app in it. Run every command from there (cd into it first in each shell command), and write nothing outside it.
>
> Use the skill in `<repo>/skills/pretty-icons/SKILL.md` to draw six icons for the sidebar of a notes app; the sidebar text is 14px, in the bulk finish: inbox, calendar, chat, profile, search, upload. Nobody is available to answer questions, so where the skill says to ask, take its recommendation and say so. Follow every step, the reads included. Before each `check.mjs` run, say "check run N". Stop at the hand-over and report what `check.mjs` printed each time, each icon's concept line, and each reader's answer.

and, for the second, "six icons for the categories of a kitchen shop, in the bulk finish: kettle, whisk, rolling-pin, pot, cup, toaster" in place of the notes sentence. `<repo>` is the worktree root, `/Users/lucasmarques/estudos/skills/.claude/worktrees/pretty-icons-polish`.

When both report: on each final folder, `node $SK/check.mjs <scratch>/pretty-icons --print` (exit code and table) and `node $SK/sheet.mjs <scratch>/pretty-icons --seed=12`; then a fresh reader (sonnet) per sheet with the blind prompt from `read.md` (N = 6, the six names alphabetical). A trial passes when the drawer reported `ok` on check run 1 or 2 and the controller's blind read is 6 of 6, none by elimination.

- [ ] **Step 2: Write the reference doc**

`docs/superpowers/baselines/2026-10-12-pretty-icons-bulk-reference.md`, in the polish reference's form:

```markdown
# pretty-icons bulk: reference

Spec: `docs/superpowers/specs/2026-10-12-pretty-icons-bulk-design.md` · Plan: `docs/superpowers/plans/2026-10-12-pretty-icons-bulk.md`

## examples/bulk

The final drawing is <sha>. <names> carry a modifier, so they are out of the median. `BULK_REFERENCE_INK[24]` is <value>; the share band is <band>.

<the final `check.mjs --print` table, verbatim, and `ok`>

What changed, per icon (round 1 in <sha>, …): <one bullet per icon: body, accent, what a read changed, its ink and share>

## Reads

<every round: the seed, each reader's answer verbatim, and the count: blind N of 10, craft defects named, set "one set" or the names, studio A/B/both with the coin>

## Findings for the person

<what the rounds showed about the rules: a number that was too tight or too loose, a message a drawer misread, with the evidence>

## The trial

<the paragraph from the polish reference, with the dates and models of this run>

### notes, bulk 24
<the prompt as sent; each check run as the agent reported it; the controller's `--print` table; the controller's blind read verbatim; pass or fail>

### kitchen, bulk 24
<the same>

### What the trial says
<pass/fail per trial against the spec's success 3, and what a failure points at>
```

Everything in angle brackets is filled from the runs; nothing is left in brackets.

- [ ] **Step 3: CONTEXT.md**

In `docs/superpowers/pretty-icons/CONTEXT.md`: "em dois acabamentos: **duotone** (16, 20, 24...) e **filled** (48)" → "em três acabamentos: **duotone** (16, 20, 24), **bulk** (24, duas tintas de `currentColor`, com knockout) e **filled** (48)". The table's first row lists `rules-bulk.md`, `knockout.mjs`, `bulk.mjs`. The timeline gains "- **12/out:** o acabamento **bulk** (spec `docs/superpowers/specs/2026-10-12-pretty-icons-bulk-design.md`, plano `docs/superpowers/plans/2026-10-12-pretty-icons-bulk.md`, referência `docs/superpowers/baselines/2026-10-12-pretty-icons-bulk-reference.md`): `knockout.mjs`, `bulk.mjs`, `examples/bulk`, e a prova com dois agentes novos." The open points gain one line if the trial failed, saying which and why; "Teste da cozinha" is updated with the kitchen trial's result.

- [ ] **Step 4: Verify**

Run: `rtk test node --test 'test/**/*.test.mjs'`
Expected: PASS. `/usr/bin/grep -rn "<sha>\|<value>\|<band>\|<names>\|<scratch>" docs/superpowers/baselines/2026-10-12-pretty-icons-bulk-reference.md` prints nothing.

- [ ] **Step 5: Commit**

```bash
/usr/bin/git add docs/superpowers/baselines/2026-10-12-pretty-icons-bulk-reference.md docs/superpowers/pretty-icons/CONTEXT.md
/usr/bin/git commit -m "docs(pretty-icons): the bulk trial and reference; CONTEXT.md"
```

The branch stays `pretty-icons-polish`: no merge, no push, no PR.
