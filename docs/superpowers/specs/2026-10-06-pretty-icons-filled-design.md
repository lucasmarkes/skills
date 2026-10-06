# pretty-icons: the filled finish

Date: 2026-10-06 · Repo: `lucasmarkes/skills` · Skill: `skills/pretty-icons` · Branch: `pretty-icons`

## Why

The skill draws one finish: a `currentColor` stroke with a 20% fill, for a sidebar at 16–24 px. A second finish was asked for, from a reference set (a kitchen set of 40, 2026-10-06): a navy contour, a flat colour under it, a copy of the silhouette one step darker offset down and right, a white highlight on the top-left of a round body, and the object's own details (seeds, stripes, holes, veins) drawn in a tone of the fill, never in the contour's ink. The icons are shown at 32–64 px, in feature grids, category lists and empty states, where a sidebar glyph would be too thin.

Two agents drawing from the reference without the skill (`docs/superpowers/baselines/2026-10-06-pretty-icons-filled-baseline.md`) got the construction and lost the set: a palette per icon, three or four stroke widths, the shadow through `<use>` or off the grid, details in ink, no keyline. What they lacked is what the duotone finish already has: a preset, a bodies table, a check that measures and a reader. The filled finish adds a palette and a construction to that machinery.

## What success is

1. `check.mjs` rejects both baseline runs on `palette`, `stroke`, `elements` or `construction`, and accepts `examples/pantry`, eight icons drawn at the finish.
2. A fresh agent given the skill and six new names draws a set that `check.mjs` accepts, on the first or second run, and whose icons a blind reader names.
3. Nothing changes for the duotone finish: the existing tests pass unchanged.

## Decisions

1. **One grid for the finish, 48.** The grid names the finish: 16, 20 and 24 are duotone, 48 is filled. An icon at 48 is shown at 32, 48 or 64 by CSS; the proportions (stroke to live area, 2.5 to 44) match the reference at every size.
2. **A fixed palette, pairs of a fill and its shade.** The reference's colours were sampled and rounded; each colour is a pair, and the shadow and the details of a body take its shade. One ink, one paper. The agent picks a colour per body; it never writes a hex the palette does not hold.
3. **The shadow is a flat copy, not a `<use>`.** The same element as the body, translated by `transform="translate(3 3)"`, filled with the body's shade, with no stroke, first in the file. It is the one `transform` the file may carry. `check.mjs` compares its geometry with a body's.
4. **The object is measured without its shadow.** Keyline and gravity are read from a render with the shadow dropped: the object lands on the keyline, the shadow hangs off it. Live and gap include the shadow for nothing: live reads every pixel, gap ignores the shadow (it overlaps everything by design).
5. **Weight is the line, not the area.** A solid tomato and a hollow whisk differ in area and must not differ in evenness. For this finish ink is measured on a render with every fill removed and the shadow dropped: the length of line, within ±25% of the set's median and the reference.
6. **Details in the shade or in paper, never in ink.** Ink draws the silhouette and the separate parts (a stem, a lid, a handle). What is on the object (stripes, holes, seeds, veins, a label) is a detail in the body's shade; the highlight is one short open path in paper.

## The preset

| Grid | Finish | Stroke | Padding | Live | Step | Circle | Square | Portrait | Landscape | Radius ≥ 16 / < 16 | Min gap | Shadow |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 48 | filled | 2.5 | 2 | 44 | 0.25 | 41 | 37 | 33 × 41 | 41 × 33 | 3 / 1.5 | 2.5 ink · 1.25 detail | 3, 3 |

The keylines are the object's, without its shadow, and are the live area less the shadow's offset, centred at (22.5, 22.5): object and shadow together fill 44. Tolerances: keyline ±1, gravity ±3 about that centre (a pear or a grater sits low by nature), grid 0.25 (a 2.5 stroke needs quarters: a rect's edge at 5.25). Weight ±25% of the median and of the reference, 459.6, the median of `examples/pantry`, on line ink.

Revised while drawing `examples/pantry` (the first draft said step 0.5, keylines 44/40/36 × 44, gravity ±1, one gap of 2.5): the object on 44 pushed its shadow past the padding; ±1 gravity is unreachable for a solid bottom-heavy silhouette; details could not sit inside a body a whole stroke from its contour, so any pair that includes a detail is held to half a stroke; and a seed or a hole is also allowed as a shade-filled dot with no stroke, which weighs nothing.

### The palette

| Name | Fill | Shade |
| --- | --- | --- |
| ink | `#2e3955` | — |
| paper | `#ffffff` | — |
| red | `#d26352` | `#ad4a43` |
| orange | `#df8f51` | `#b56a3b` |
| yellow | `#f3d35e` | `#d4ad3c` |
| tan | `#d5ae73` | `#ad8b55` |
| brown | `#9b6d49` | `#6b4a30` |
| cocoa | `#714b33` | `#4b301e` |
| green | `#8aa968` | `#5f7d47` |
| leaf | `#c7dd9e` | `#93ad74` |
| blue | `#9db5db` | `#7288b0` |
| mist | `#f4f4f2` | `#bcc6d6` |
| cream | `#efe0b4` | `#d1b67a` |
| pink | `#e8b4ab` | `#c98a80` |
| plum | `#a63d5b` | `#7e2f47` |
| grey | `#c3c0b8` | `#9b9b9b` |

## The rules, at this finish

The ten rules keep their names and numbers. Where a rule reads differently at 48, `rules-filled.md` says so; the rest is the duotone text.

1. **grid** — `viewBox="0 0 48 48"`, step 0.25, every pixel inside 2–46, shadow included. Elements flat; `transform` only on the shadow, only `translate(3 3)`.
2. **keyline** — the object's ink box, without its shadow, within ±1 of circle 41, square 37, portrait 33 × 41 or landscape 41 × 33, centred at 22.5.
3. **stroke** — root `stroke="#2e3955" stroke-width="2.5"`, round caps and joins, `fill="none"`; no element sets a width, a cap, a join or an opacity. **palette** — every `fill` and `stroke` is a palette value or `none`.
4. **construction** — one shadow: the first element, a body's geometry translated by the offset, `fill` the body's shade, `stroke="none"`. A body: a closed element, `fill` a palette fill, no `stroke` (the root's ink). A detail: `stroke` a shade or paper, no fill, or a shade-filled dot with `stroke="none"`. A part: no fill, no stroke (ink). A body's contour is a rect, a circle, a path of at most five straight sides or a path shaped by curves.
5. **weight** — line ink within ±25% of the set's median and of the reference.
6. **gravity** — the object's mass, without its shadow, within ±3 of (22.5, 22.5).
7. **radius** — 3 for a rect whose smaller side is 16 or more, 1.5 below.
8. **gap** — between every two elements but the shadow: touch, or at least 2.5 apart; 1.25 when either is a detail.
9. **metaphor** — one object; at most eight elements; a path at most twelve commands; one highlight; details that the object has, two or three. No letters, no logos.
10. **set** — one grid, one palette, measured together.

## The scripts

- `presets.mjs` gains the 48 preset with `finish: "filled"`, `shadow`, `step`, and `PALETTE`.
- `filled.mjs` (new): classifies a parsed icon's elements into shadow, body, detail and part; the text rules for the finish; the variants of an icon's text for measuring (without the shadow, lines only).
- `check.mjs` dispatches by the preset's finish: the duotone text rules or the filled ones. `canvas`, `elements`, `grid` and `radius` are shared.
- `measure.mjs` takes the finish into account: keyline and gravity from the no-shadow variant, weight from the lines variant, gap over the non-shadow elements.
- `sheet.mjs` keeps the file's colours (it recolours only `currentColor`), carries `transform` onto the sheet, and draws the rows on the reference's grey as well as light and dark.
- `emit.mjs` passes `transform` through as it passes everything else.
- `examples/pantry/`: eight icons at the finish, with metaphors of their own (not the reference's).
- `rules-filled.md`: the rules at this finish, with the bodies table and a worked body. `SKILL.md`: step 1 chooses the finish by where the icons are shown; step 3 points at the finish's rules and example.

## Out of scope

- A second filled grid (32, 64). One grid, scaled by CSS.
- Hand-drawn wobble as a measure. The prose asks for curves and one asymmetry; the reader judges.
- Dark-mode variants of the palette.
