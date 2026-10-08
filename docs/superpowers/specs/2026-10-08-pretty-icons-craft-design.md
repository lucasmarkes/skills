# pretty-icons: craft

Date: 2026-10-08 · Repo: `lucasmarkes/skills` · Skill: `skills/pretty-icons` · Branch: `pretty-icons`

## Why

The skill draws two finishes and measures them: keyline, gravity, weight, gap, construction, a blind read. Twenty icons drawn with it this week (ten for a car app, ten for a bakery) passed every measure and were read 20 of 20. They are even. They are not yet beautiful. Set beside two references the person brought, a filled set and a line set, they look constructed where the references look drawn: a rolling pin that is a square on a diagonal, wheat grains that read as leaves, curves that bend without flowing, every line the same weight, a part sitting on a body with nothing that says it sits on top.

The references differ in kind and the person wants both, in separate finishes: the **filled** finish (48) chases the filled reference's craft, the **duotone** finish (16, 20, 24) chases the line reference's. Craft, not look: no colour, no offset shadow, the five neutral tones and the inner shade stay. What is taken is construction: organic silhouettes with curves that are continuous or cornered on purpose, a contour heavier than the inner line (filled only), one small gesture per body, and modifiers (a plus, a slash, a lock) that sit on a base icon with a clear halo around them.

What the engine lacks, in six gaps:

1. **Shape vocabulary.** The bodies table has a rect and a circle; everything organic is a hand-written path, and hand-written cubics kink.
2. **Curve quality.** Nothing measures tangent continuity, cusps or wobble. A kinked curve passes every rule.
3. **Line hierarchy.** Every line is 1.5. The filled reference's contour is heavier than its inner line; the eye reads the silhouette first.
4. **Knockout.** A part over a body (a badge, a lock) needs a stroke of clear space around it, cut out of what is under it. The "Modo Hierárquico" experiment did it with `<mask>`, which rule 01 forbids in a source file.
5. **Gesture.** The rules say what not to add (no chimney, no shine, no steam). They do not say the one thing that gives a body life.
6. **The loop.** The agent sees the sheet once, at the end, as a result. It never sees anchors, handles, the silhouette alone, or the pixels at display size while drawing.

## What success is

1. `curve.mjs` measures the twenty car and bakery icons as they stand and reports their joins and inflections; at least one kink is found (the before).
2. The same twenty, redrawn with the kit, pass the new `check.mjs` with zero kinks and zero double inflections, are read blind 20 of 20 with no elimination by a fresh reader, and have no defect named for at least 18 of them in the craft read (the after).
3. `examples/garage` (filled) and `examples/hairline` (duotone) are redrawn as the new bar and pass the same three gates; at least three hairline icons carry a modifier.
4. The duotone tests pass with the hierarchy rules off; the hierarchy applies only to 48.
5. A fresh agent given the skill and six new names composes with the kit and passes `check.mjs` on the first or second run.

## Decisions

1. **The `.svg` file stays the source of truth.** The kit prints path text the agent pastes into the file. No intermediate format, no build. A hand-drawn icon that passes the check is as valid as a composed one.
2. **The kit is a CLI and a module.** `node shapes.mjs <primitive> …` prints SVG elements; `import { drop, leaf, … } from "./shapes.mjs"` gives the same as objects. The CLI keeps the skill's "write the file" flow.
3. **Rule 01 is not relaxed.** Every number in a `d`, anchors and control points, stays a multiple of 0.25. The kit snaps anchors first, then re-solves each pair of handles about its anchor so both stay collinear with it after snapping. Handles are 4 or longer; with that, angular error from snapping stays under 2°, inside the join tolerance.
4. **The knockout is geometric, not a `<mask>`.** `modifiers.mjs` splits a body into paint and stroke, cuts the stroke where it crosses the halo, and keeps the paint whole. Flat file, no `<defs>`.
5. **Hierarchy only at the filled finish.** Contour 2, everything else 1.5, bar 3.5. The line reference's stroke is constant, so duotone keeps one stroke. Mark at 1 was rejected: under 32 px it vanishes on a 1× screen, and the mark tone already ranks it.
6. **A modifier in duotone is `currentColor` at `stroke-opacity 0.6`.** One colour, one more opacity, as the 20% fill already is. Rule 03 gets one named exception. `--solid` drops it.
7. **Curve measures are analytic, from the path commands.** Only the pixel measure rasterises. Three curve rules reject; pixel fit is a note.
8. **A notes channel.** `check.mjs` prints notes after failures; notes never change the exit code.
9. **The proof is a third sheet.** `pretty-icons-proof.png` shows construction, finish, silhouette and pixels per icon, with a reference row. The blind sheet does not change.
10. **A craft read, after the blind read.** A second fresh reader names defects from a fixed list. Taste stays with a reader; no numeric craft score, no automatic comparison with the references.
11. **Reference study, not a reference library.** The references are measured (ratios, counts, sizes) to calibrate the kit and the check. No object is copied; rule 09 stands.

## Architecture

```
rules.md / rules-filled.md / read.md / SKILL.md        the rules, with craft added
        │
shapes.mjs      NEW   nine closed primitives → quarter-grid paths, tangent-continuous joins
modifiers.mjs   NEW   badge, slash, lock, arrow, dot; geometric knockout of the base icon
        │
pretty-icons/*.svg    the agent composes from the kit, pastes, then edits by hand
        │
check.mjs · measure.mjs · filled.mjs      today's measures, the hierarchy, the modifier rule
curve.mjs       NEW   join, inflection, pixel; analytic over geometry.mjs's command reader
        │
sheet.mjs       gains the proof sheet (--proof, --only); blind sheet unchanged
read.md         gains the craft read
        │
emit.mjs        unchanged, except it carries stroke-opacity through
```

What stays out, on purpose: no new colour, no offset shadow, no new grids, no library of ready objects, no automatic craft score, no change to `emit.mjs` beyond the attribute.

## `shapes.mjs`

### Primitives

Nine, all closed, all emitted as one `path` of `M`, `C` and `Z`. `L` appears only in `wedge` and `scoop`, where a straight side is the point.

| Primitive | For | Cusps by design | Own parameters |
| --- | --- | --- | --- |
| `drop` | a drop, a flame, a pendant, a pear | 1, at the top | `--tip 0..1` roundness of the point |
| `leaf` | a leaf, a wheat grain, a petal, a feather | 2, at the ends | `--skew -1..1` how far the belly sits toward one end |
| `lens` | an eye, an almond, a coffee bean | 2 | — |
| `bean` | a loaf, a potato, a low cloud, a bean | 0 | `--waist 0..1` how deep the dent is |
| `crescent` | a croissant, a moon, a banana, half a ring | 2 | `--thick 0..1` thickness at the middle |
| `taper` | a cone, a horn, a beak, a carrot: wide one end, narrow the other | 0 or 2 | `--narrow 0..1` the narrow end as a fraction of the wide; `--sharp` makes two cusps |
| `wedge` | a slice, a piece of cake | 3 | `--angle 15..120` |
| `scoop` | a rect with a concave cut: a loaf tin, a mug, a cradle | 0 | `--depth 0..1`, `--side top|right|bottom|left`, `--rx` from RADII |
| `blob` | a free silhouette by anchors: a car, a shoe, a duck | as declared | `--anchors "x,y[,t][,c] …"` with tension `t` 0..1 and `c` for cusp |

### Common parameters

`--w`, `--h` (the ink box, so the kit insets by half the contour stroke of the finish), `--at cx,cy` (default the grid's centre), `--rot` in steps of 15° (anchors are rotated then snapped; handles re-solved), `--bulge 0..1` (how far the curve bows from the chord, default 0.55, the circular value), `--lean -1..1` (the asymmetric gesture: the belly moves toward one side), `--grid 16|20|24|48` (default 48), `--finish duotone|filled` (default from the grid).

### Output

`--finish duotone` prints the one body element: the path with `fill="currentColor" fill-opacity="0.2"`.

`--finish filled` prints the three elements of rule 04, ready to paste: the tone (`fill="#ececea" stroke="none"`), the shade, the contour (the same `d`, no fill, no stroke, and `stroke-width="2"` under the hierarchy). The shade is the outline's own stretch from one anchor to another, closed by a seam: `--shade right|lower|none` picks which stretch, `--seam straight|curved` closes it. Because the shade reuses the contour's exact segments, the contour covers the seam.

The kit refuses a path over the grid's command cap (8 duotone, 12 filled) and says how many anchors to remove. A blob fits 6 anchors on duotone and 10 on filled.

### Quarter grid and tangents

The kit works in floating point, snaps anchors to 0.25, then for each smooth anchor re-solves the two handles so that both lie on one line through the snapped anchor, at their original lengths rounded to 0.25. A handle under 4 is lengthened to 4 or the segment is merged into its neighbour. At a cusp the handles are independent. The emitted path is run through `curve.mjs` before printing; the kit never prints a path it would reject.

### Reconcile

`node shapes.mjs --from "<d>"` (or `--from <file.svg>`) reads an existing path, finds its anchors, and re-solves handles about every anchor whose join is a kink (4° to 30°), so a hand edit that moved an anchor can be repaired without redrawing. It prints the repaired `d` and the joins it changed.

## `modifiers.mjs`

### Modifiers

| Modifier | Glyph | Size (fraction of live area) |
| --- | --- | --- |
| `badge:plus` `badge:minus` `badge:check` `badge:x` | a circle with the glyph inside | 0.36 |
| `slash` | one diagonal from upper-left to lower-right across the base | the base's diagonal |
| `lock` | a body (rect, cased radius) with a shackle | 0.36 |
| `arrow:up` `arrow:right` `arrow:down` `arrow:left` | a chevron with a tail | 0.36 |
| `dot` | a filled circle | 0.2 |

Exact sizes are calibrated by the reference study (milestone 0) and then fixed per grid in `presets.mjs` as `MODIFIER = { size, halo, corner }`. `--corner br|tr|bl|tl`, default `br`. The modifier's box sits on the live area's corner.

### Command

```
node modifiers.mjs pretty-icons/user.svg --add badge:plus [--corner br] [--solid]
```

It writes the file back (or prints with `--print`) and does three things:

1. **Split paint from stroke.** Every element with both a fill and a stroke becomes a closed paint element (`stroke="none"`) followed by a stroke-only path with the same geometry. At the filled finish this is already how a body is drawn; nothing changes there.
2. **Cut the stroke.** The halo is a circle at the modifier's centre with radius half its size plus one stroke. Every stroke-only element's centreline is intersected with the halo; where it crosses, the curve is split at that parameter (de Casteljau for cubics, angle for arcs, point for lines), the inside part is dropped, and the remaining ends are snapped to 0.25. A `rect` or `circle` that is cut becomes a `path`. Paint is never cut: at the filled finish the body's tone shows in the halo; in duotone the 20% fill shows, and a closed paint element does not leak the way an open stroked-and-filled path would.
3. **Place the modifier.** Duotone: stroke `currentColor` with `stroke-opacity="0.6"` (`--solid` omits it). Filled: a badge is a paper-filled circle with a 2 contour and a 1.5 glyph in the line tone; a slash is a 2 line; a lock is a cased rect with its shackle, tone, shade and contour; a dot is a dot.

### Counts

Duotone lands on the cap exactly: paint, cut stroke, modifier, three elements. The command refuses an icon that already has three and names which to merge. At the filled finish elements are fewer than the cap, but a cut path's commands count, and 12 holds; the command refuses past it.

## `curve.mjs` and the check

### New rules

| Rule | Measures | Passes | Rejects |
| --- | --- | --- | --- |
| `join` | at every anchor, the angle between the incoming and outgoing tangents, including L→C, C→A and the Z closing segment | below 4° (smooth); above 30° (a corner on purpose) | 4° to 30°: a kink |
| `inflection` | inflection points of each cubic, solved analytically | at most one per segment, none in a segment whose chord is under 4 | two or more: a wobble |
| `modifier` | the halo and placement of a modifier | no other element's centreline within the halo; size and corner from the preset; `stroke-opacity` only on a modifier and only 0.6 | any stroke inside the halo; opacity elsewhere; a wrong size or corner |
| `pixel` (note) | on straight H and V strokes, rendered at the main display size, the count of edge pixels with alpha between 0.2 and 0.8 | always | — |

The main display size is 32 at the filled finish and the grid itself at 1× and 2× in duotone. `pixel` is a note because the quarter grid at 48 shown at 32 cannot always land on a pixel edge.

Tangents and inflections come from the path commands, through `geometry.mjs`'s command reader (exported). Arcs give analytic tangents. `rect` and `circle` have no joins to judge: a rect's corners are corners, a rounded rect's arc joins are smooth by construction.

Angles are measured where both adjacent segments are at least 1 long; a shorter segment's join is skipped (it is a terminal, not a join).

### Hierarchy, in `filled.mjs`

`classify` already tells a contour from a line by matching its geometry with a tone. It gains:

- a contour's `stroke-width` must be 2 (rejected: `stroke  <icon>  path@5 contour at 1.5 → 2`);
- a closed element with no paint at 2 that matches no tone is rejected as `construction … contour without a tone`;
- an open element at 2 stays allowed (rule 03's part of weight: a sign, a needle);
- a line, a mark and a core are 1.5; a bar is 3.5.

### Measures that move

- `body()` in `presets.mjs` insets by the contour stroke (2) at the filled finish, so the bodies table recedes 0.25 per edge: circle `r 19`, square `x 7 y 7 w 34 h 34`, portrait `x 9 y 5 w 30 h 38`, landscape `x 5 y 9 w 38 h 30`.
- `REFERENCE_INK[48]` is re-measured from the redrawn `examples/garage` (milestone 1).
- Gap for a modifier is measured from its halo, not its stroke: a modifier never touches.

### Output

Failures print in this order: grid, stroke, palette, construction, join, inflection, modifier, then the raster measures as today. A join failure prints before weight because fixing the curve moves the weight.

Notes print after failures under a `notes` line, in the same `rule  icon  got → want` shape.

`--print` gains two columns: `joins` (`12 smooth · 2 corners`) and `infl` (the total).

## The proof sheet and the craft read

### `sheet.mjs --proof [--only <name>]`

Writes `pretty-icons-proof.png` beside the other two: one panel per icon at 4× with four views side by side:

1. **Construction.** The icon with anchors as dots, handles as hairlines, each join coloured by its measure (smooth, corner, kink), a modifier's halo as a dashed circle, the keyline dashed as today.
2. **Finish.** The icon clean at 4× on the light background.
3. **Silhouette.** Everything painted in the line tone, at 16 and 24 px, scaled up by nearest neighbour. The object must be nameable from its mass alone.
4. **Pixels.** The icon at the display sizes (16, 24, 32 at the filled finish; the grid at 1× and 2× in duotone), scaled up without smoothing, so the grey edge pixels of the `pixel` note are visible.

The first row is the **reference row**: three icons of the finish's example (`garage` or `hairline`) in the same four views. The reference row never appears on the blind sheet.

`--only <name>` renders one icon's panel plus the reference row, under a second. The skill's step 3 becomes a loop per icon: compose, paste, `check`, `proof --only`, look, adjust. The full sheet and the blind sheet stay for the end of the set.

### The craft read, in `read.md`

After the blind read passes, a second fresh reader gets `pretty-icons-sheet.png` (names visible, no reference row) and this prompt:

> These N icons are from one app. For each number, in five words or fewer, name one drawing defect if you see one: a kink in a curve, a wobbly curve, uneven weight, a part floating off the body, a confused silhouette, a detail too small to read. Say "none" when you see no defect. Then name the three weakest and why.

An icon fails when the reader names a defect from that list for it. Being among the three weakest without a named defect does not fail but goes to the hand-over. Any change to the set needs a new reader. Without a second agent the hand-over says **not read for craft**.

## The rules

The ten rules keep their names and numbers.

`rules.md`:
- 03 gains the modifier exception: `stroke-opacity="0.6"` on a modifier's elements only.
- 04 gains "curves flow or corner, never kink": join, inflection and the handle rule in rule language, with rejection examples.
- 08 gains the halo: a modifier is a stroke clear of everything, cut out of what is under it.
- 09 gains the **gesture catalogue**: one per body, chosen from seam, dot pair, tuft, steam, paper sheen, lean. A gesture is what makes a body a thing and not a shape; two are noise. The "what goes wrong" table in `SKILL.md` keeps its prohibitions and points here for the one thing to add.
- 09 gains the modifiers as the way to say "add", "remove", "off", "locked", "new" on a base icon.

`rules-filled.md`:
- 03: the hierarchy table (contour 2, line 1.5, bar 3.5) and why.
- The bodies table recedes; the reference ink changes.
- 04: construction taught from the kit; the worked example becomes the croissant (organic, shade from the outline's own stretch) beside the traffic light.

`read.md`: the craft read.

`SKILL.md`: step 3 is the loop; step 4 adds the craft read; one line says the kit is the normal way and a hand-written path the exception; the hand-over adds "not read for craft".

## The reference study

Before redrawing the examples, one hour measuring the reference images the person brought, written as a table in this spec's companion `docs/superpowers/baselines/2026-10-08-pretty-icons-craft-reference.md`:

| Measured | From | Calibrates |
| --- | --- | --- |
| contour / inner line ratio | filled reference | the hierarchy (expected near 1.3; we fix 2 / 1.5 = 1.33) |
| cusps per silhouette, elements per icon | filled reference | blob anchor caps, the gesture rule |
| where the gesture sits and what it is | filled reference | the gesture catalogue |
| modifier size as a fraction of the live area, halo width, corner | line reference | `MODIFIER` in `presets.mjs` |
| strokes per icon, terminals, curve-to-straight ratio | line reference | duotone defaults for `--bulge`, the join thresholds |
| modifier tone relative to the base | line reference | the 0.6 |

Numbers in this spec marked as defaults (0.36, 0.2, 0.6, 4°, 30°) are confirmed or moved by the study before milestone 1 ships; a move is recorded in the baseline file and in `presets.mjs`, not here.

## Milestones

Each ends with `check.mjs` green on every example and test set, the tests passing, and a commit.

0. **Reference study.** The baseline table. Half a day.
1. **Measure the before.** `curve.mjs` with join, inflection and pixel; the notes channel; `--print` columns. Run on the twenty car and bakery icons and record the numbers in the baseline file.
2. **Shapes and hierarchy.** `shapes.mjs` with nine primitives, `--finish filled`, `--from`; hierarchy in `filled.mjs` and `presets.mjs`; bodies table receded; `examples/garage` redrawn with the kit; `REFERENCE_INK[48]` re-measured.
3. **Proof and craft.** `--proof` and `--only` in `sheet.mjs`; the craft read in `read.md`; the twenty icons redrawn with the kit, blind read and craft read with fresh readers; the after recorded. The artifact the person sees.
4. **Modifiers.** `modifiers.mjs` with the knockout; the `modifier` rule; `examples/hairline` redrawn with at least three modifiers; the duotone rules.
5. **Docs.** `rules.md`, `rules-filled.md`, `read.md`, `SKILL.md`, the gesture catalogue, the study table linked.

## Testing

- Unit tests per module in `test/pretty-icons/`, run by `npm test` (`node --test`): `shapes.mjs` (every primitive lands on the quarter grid, passes `curve.mjs`, respects the command cap, refuses past it; `--from` repairs a planted kink), `curve.mjs` (a planted kink of 10° fails, 2° and 45° pass; a planted double inflection fails; a rounded rect has no kinks), `modifiers.mjs` (the cut keeps paint whole, the halo is clear, the count cap is enforced, duotone opacity is 0.6).
- `check.mjs` on both examples and both test sets stays green at every milestone; the duotone examples pass with no hierarchy failure.
- The blind read and the craft read are run by fresh agents at milestones 2, 3 and 4 and their answers are kept in the baseline file.

## Out of scope

Colour; an offset shadow; new grids; a library of ready objects; a numeric craft score or automatic comparison with the references; `emit.mjs` changes beyond passing `stroke-opacity` through; animation.
