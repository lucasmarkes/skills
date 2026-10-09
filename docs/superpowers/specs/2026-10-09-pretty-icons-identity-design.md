# pretty-icons: identity

Date: 2026-10-09 · Repo: `lucasmarkes/skills` · Skill: `skills/pretty-icons` · Branch: `pretty-icons` · Follows: `2026-10-08-pretty-icons-craft-design.md`

## Why

The craft pass (the previous spec) gave the filled finish a shapes kit, a curve check, a line hierarchy and a proof sheet. Its twenty icons have no kink and read 20 of 20. Put on one sheet, they still do not read as one set. The person's eye on the car set: banco, carro and chave share a pattern; cone has thick lines; roda has an enormous contrast; triangulo looks like it came from another library, a cartoon. Some icons read as filled, others as outlined. The filled reference's sheet is pleasing because every icon obeys the same pattern of line, size and contrast.

Measured, the eye is right. The share of each icon's painted pixels that are in the line tone:

- The filled reference's forty: 17% to 48%, median near 30%. The dark tone is the line and the odd small dot; every body is light with a contour.
- The after car set: roda 76, cone 63, semaforo 56, chave 50, marcha 48; banco 34 and carro 43, the ones that "have a pattern", sit in the filled reference's band.
- The after bakery set: 29 to 44, except trigo at 55.
- `examples/garage`: tyre 69, steering-wheel 52, gearshift 48.

Two rules of the filled finish cause it:

1. **"A solid small part: a shape filled with the line tone"** (`rules-filled.md` 04). Written for a hub or a lamp, it has no size, so it became a whole tyre, a cone's bands, a traffic light's lenses. Fourteen of the thirty filled icons fill something in the line tone. That is what makes one icon filled and the next outlined.
2. **The bar at 3.5 with a core** (the tube: a rim, a spoke, a frame). The filled reference has one line weight. Eight icons use the bar; the tube is the "other library" look.

No colour and no offset shadow are taken from the filled reference, as before: craft, not look. The five tones and the inner shade stay. What is taken now is his one law of line and contrast, and it is measured.

## What success is

1. `check.mjs` refuses, by name and with the move, every closed element filled in the line tone larger than a dot, and every stroke at 3.5; it measures the line tone's share of each icon's paint and refuses a share outside the band.
2. `examples/garage` and the twenty after icons pass the new `check.mjs`, and every one has a line-tone share inside the band.
3. The garage and each after set pass the blind read (10 of 10, no elimination), the craft read (the calibrated gate, at most 6 of 10), and the new set read: a fresh reader says "one set", or names at most one icon as from another set.
4. A fresh agent given the skill and six new names passes `check.mjs` on the first or second run, and its set passes the set read.
5. The duotone finish, `examples/hairline` and their tests are unchanged.

## Decisions

1. **The line tone is a line.** It fills only a dot: a circle of r 2.5 or less (the `dot` kind; `DOT` moves from 2 to 2.5). Every other closed element filled in the line tone is refused: `solid  roda  circle@3 r 16 filled in the line tone → a body (tone, shade, contour), or a dot of r ≤ 2.5`. The `shape` kind narrows to paper (glass, a hole) and the shade tone (a base); it never takes the line tone. The fill tone and the shade tone are never a stroke: `construction  tyre  circle@4 stroke #ececea → the fill tone only as a fill`.
2. **One line weight.** `stroke-width` is 2 on a contour and the root's 1.5 everywhere else. 3.5 is refused: `stroke  tyre  stroke-width 3.5 → 1.5, or 2 on a contour`. The `core` kind and the bar go: a rim, a spoke or a frame is a body. A ring is a circle with the fill tone, its hole a circle in paper, and a contour at 2 on each; the shade is the ring's lower part, drawn as the kit prints it. `shapes.mjs` gains `ring --r <outer> --hole <inner>` so the drawer need not construct it.
3. **Contrast, measured.** `contrast  roda  line tone on 76% of the paint → 20% to 45%`. The paint is every pixel with alpha ≥ 0.5 at the measuring scale; a pixel is in the line tone when its luminance is nearer the line tone's than the mark tone's (under 89 of 255). The band is `CONTRAST_BAND = [0.2, 0.45]` in `presets.mjs`, movable like the other tolerances; 20 catches an icon with too little line, 45 catches roda, cone, semaforo and tyre. A modified icon (a badge) is measured without its modifier, like weight.
4. **The set read.** `read.md` gains a third read after the craft read, by a third fresh reader on `pretty-icons-sheet.png`: "These N icons are from one app. Name every icon that looks like it comes from a different set than the others, and in five words or fewer say why. Say 'one set' if none does." It passes on "one set" or one icon named; two or more named go back to the drawing, each with the reader's words. "Floating" said of a modifier does not count, as in the craft read.
5. **The worked traffic light moves.** `rules-filled.md`'s worked example and `examples/garage/traffic-light.svg` have lenses filled in the line tone; both are redrawn under decision 1 (a lit lamp is a dot at r 2, or a lens in paper with its shade), and `filled.test.mjs`'s twenty assertions built from its text follow it. The freeze of the craft plan ends.
6. **Not changed.** The duotone finish and `hairline`: one width already, 20% fill, no solid parts. The blind and craft gates and the calibrated craft ruling (at most 6 of 10 per set). The craft acceptances of the previous pass are not re-litigated; the sets are redrawn only where the new rules refuse them, then read again whole.

## Architecture

- **`filled.mjs`.** `DOT = 2.5`; `BAR` and the `bars` set are deleted, with the `cores` role and the core check (lines 109–111) and the core mask in `linesOf`. `classify` puts a closed element filled in the line tone that is not a dot in `solids`, a new role the construction check refuses with the dot move; a stroke in the fill or the shade tone is refused ("the fill tone only as a fill"). `stroke` refuses every width that is neither the root's nor `CONTOUR` (so 3.5 prints `stroke  tyre  stroke-width 3.5 → 1.5, or 2 on a contour`). `paint` is tones, shades and dots. The hierarchy check keeps "a closed line at 2 is a contour without a tone".
- **`raster.mjs`.** `measure()` turns every stroke and fill black before rendering, so it cannot tell the tones apart. A new `shares(svgText, G)` renders the icon as written (no recolouring, transparent background) and returns `{ paint, dark }`: `paint` the pixels with alpha ≥ 0.5, `dark` those whose luminance is under 89 of 255 (the midpoint between the line tone, 38, and the mark tone, 140).
- **`measure.mjs`.** After weight, at the filled finish only, `contrast`: `shares(base, G)` on the base (the modifier left out), the whole file, not `linesOf` or `objectOf`; the share is `dark / paint`, refused outside `CONTRAST_BAND` as `contrast  roda  line tone on 76% of the paint → 20% to 45%`. The row in `--print` gains a `line%` column.
- **`shapes.mjs`.** `ring`: `--r` outer radius, `--hole` inner radius, `--at`; prints tone (outer circle, fill), hole (inner circle, paper), the shade (the lower half of the ring, closed by the two circles' arcs, as a path), and the two contours at 2. Refused when `hole + 3 > r` (the ring would be thinner than a contour and its gap).
- **`presets.mjs`.** `CONTRAST_BAND = [0.2, 0.45]`.
- **`rules-filled.md`.** Every mention of the bar, the core, the tube and the solid part goes, and what replaces it is said in its place: the intro (line 5, "a part that is solid and small… is filled in the line tone" becomes "a dot of r ≤ 2.5 may be filled in the line tone; everything larger is a body"); the hierarchy table's "bar and core" row becomes "dot"; the preset table's widths column reads `2`; the widths table loses the 3.5 row; the tones table's "solid small parts" becomes "dots"; the bodies section's worked traffic light is redrawn (the lit lamp a dot, or a paper lens with its shade) and its prose follows; 02 loses "1.75 past a bar's" and the 18.25 ring; 03 loses 3.5 and the 2 "mark of weight" (`stroke-width` is set only to 2, on a contour); 04 loses "a tube" and "a solid small part", gains "a dot" and "a ring" (the kit's `ring`), and its rejected line for `stroke #ececea` reads "the fill tone only as a fill"; 05 loses "a bar and its core 2", "a slot as a tube", "thin it to a tube" and the gearshift's bars (the gate is drawn at 1.5 and re-measured); 06 loses "a bar at 3.5 rather than a line" (a handle given area is a body). A new "11 · contrast" states the band, what is counted, the moves (a dark part becomes a body; a part that must stay dark shrinks to a dot; an icon under 20% gains a line, a contour it lacks, or a printed detail) and the rejected lines. "How check.mjs measures" gains contrast.
- **`SKILL.md`.** Step 4 gains the set read; "What goes wrong" loses the "doubling a ring or a spoke" row and gains two: "filling a wheel, a lamp or a band in the line tone because it is 'solid'" → `rules-filled.md` 04: a body, or a dot; "drawing a rim or a frame as a thick bar" → `rules-filled.md` 04: a ring, from the kit.
- **`read.md`.** The set read, its prompt, its pass and fail, after the craft read.
- **`sheet.mjs`.** Unchanged; the set read uses `pretty-icons-sheet.png`.

## Redraws

Every icon the new rules refuse, then each set read whole:

- `examples/garage`: tyre, steering-wheel, gearshift, speedometer (the bar), traffic-light, battery, car, oil (fills in the line tone). Then the blind, craft and set reads on the ten; `REFERENCE_INK[48]` re-measured.
- After car: roda, cone, semaforo, chave, marcha, estrada, extintor, carro, triangulo (fills, or the contrast band). After bakery: trigo, farinha, forno, rosquinha, bolo. Then the three reads per set. The before sets are not touched.
- `rules-filled.md`'s worked traffic light.

## The trial

One fresh agent, the skill only, six new names in the filled finish, no icon already drawn. It passes when `check.mjs` prints `ok` on run 1 or 2 and its set read says "one set" or names one icon. One trial, recorded as it comes; a failure is recorded with the rule that held it, for the person to judge, and the loop does not reopen.

## Testing

- `filled.test.mjs`: a solid wheel is refused with the dot move; a dot at r 2.5 passes; a 3.5 bar is refused; the fill tone as a stroke is refused; the worked traffic light passes as redrawn; the twenty text-edit assertions follow the new text.
- `raster.test.mjs`: `shares` on a square in the fill tone with a contour reports the contour's pixels as `dark` and the whole as `paint`; on a square filled in the line tone, `dark === paint`.
- `check.test.mjs` with fixtures: a fixture at 60% dark is refused with its share; one at 30% passes; one at 10% is refused for too little line; a modified icon is measured without its modifier.
- `shapes.test.mjs`: `ring` prints five elements on the quarter grid, its shade passes the light check, `hole + 3 > r` is refused.
- `docs.test.mjs`: every rejected line quoted in `rules-filled.md` 03, 04 and 11 is `check.mjs`'s own output on the quoted input; the set-read prompt is in `read.md` word for word.
- The suite stays green for the duotone tests; `check.mjs examples/hairline` prints `ok` with no new line.

## Out of scope

Colour and the offset shadow. The duotone finish. Metaphors and the reads already accepted. A per-icon "beauty" judgement: the gates say every icon obeys one law and a reader sees one set, not that each is lovely.
