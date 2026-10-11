# pretty-icons: polish

Date: 2026-10-11 · Repo: `lucasmarkes/skills` · Skill: `skills/pretty-icons` · Branch: `pretty-icons-polish` (from `pretty-icons`) · Follows: `2026-10-09-pretty-icons-identity-design.md`

## Why

The identity pass gave both finishes one law of line and contrast, and their sets read as one. Next to the best hand-drawn sets they still look built rather than drawn: rect and circle bodies where the object is soft, details that run edge to edge, paper squeezed between parallel lines, every long object upright, a line heavier than it needs to be. The polish pass moves the skill toward a drawn hand:

1. a light, constant line;
2. organic silhouettes where the object is soft;
3. short, loose interior detail;
4. generous air;
5. 45° diagonals for elongated objects;
6. equal optical mass across the set.

At the filled finish only, it adds an optional offset shadow, chosen per set.

The numbers below were calibrated in a throwaway spike: four sets redrawn under these rules (sidebar at 16 and 24, garage and bakery at 48), with variants of line, detail weight and shadow, ranked by 24 blind readers. What the spike found:

- The new drawing beats the current one on the same grid: bakery 3 of 3 reads, sidebar 2 of 3, garage tied.
- At 16, a line of 1 beats the current 1.5 in 2 of 3 reads.
- At 24, a line of 1.5 reads the same as 1.75 and 2.
- Details finer than the contour always lose, so details stay at the line weight.
- The filled line at 1.25 and at 1.5 read the same in 6 of 6.
- The shadow lifts one set (garage, 3 of 3) and muddies another (bakery, 0 of 3), so it is chosen per set, by a read.
- An offset of 1.5 reads the same as 2.5, or better.

## What success is

1. `check.mjs` measures, and refuses by name with the move, each of these:
   - paper narrower than 1.5 strokes between inks that do not touch, or a closed counter under 2 strokes;
   - an interior detail that touches its body, or ends less than one stroke from it;
   - a curve bent tighter than one stroke's radius;
   - more than three in ten icons on the diagonal, or a diagonal the wrong way;
   - a shadow on some icons of a set and not the others, a shadow that is not an exact copy of the icon, and any shadow at the duotone finish.
2. `examples/hairline` and `examples/garage`, both redrawn, pass `check.mjs` with no exception line.
3. Each redrawn example passes the blind read: 10 of 10, none by elimination.
4. Each redrawn example beats the current one in at least 2 of 3 blind ranking reads, on the same grid.
5. A fresh agent given the skill and six new names, in each finish, passes `check.mjs` on run 1 or 2 and the blind read.
6. The reference set's name appears nowhere in the skill. It has gone from `presets.mjs` and `rules-filled.md` already; the docs drop it at publish (see Publishing).

The redrawn examples become the skill's own bar. No comparison with any outside set lives in the skill, its tests or its examples.

## Decisions

1. **Line.** The duotone presets become:

   | Grid | Stroke | Before |
   | --- | --- | --- |
   | 16 | 1 | 1.5 |
   | 20 | 1.25 | 1.5 |
   | 24 | 1.5 | 2 |

   That is 6.25% of the grid; the value for 20 is interpolated, not read. The filled preset is unchanged: line 1.5, contour 2. Details are drawn at the line weight; no second, finer weight. The duotone reference ink is re-measured from the redrawn `hairline`.
2. **Air.** Two inks that do not touch sit at least 1.5 strokes apart, edge to edge. Between two lines of one weight, that is 2.5 strokes on centrelines. At the filled finish the stroke is the line, 1.5, so the gap is 2.25 edge to edge; a contour's edge is taken at its own width, 2. Rule 08's minimum rises from one stroke to this, and its other exceptions stay as they are. A closed counter (a hole, the inside of a ring, an eye) is at least 2 strokes across. A new raster check, `air`, catches what the centreline check cannot see: a band of paper inside one element, between curves, or in a counter. It opens the paper at radius 0.75 stroke and reports every remaining narrow region of 0.25 stroke² or more, with its place.
3. **Loose detail.** A detail inside a body (a seam, a slit, a vein, a score, a line of text) does not touch the body's contour: its nearest point is at least one stroke from the contour, edge to edge. This one case is looser than the 1.5 of decision 2. A part that meets a body from outside (a handle, a stem, a nozzle) still touches it, by rule 08. Inside versus outside is read from geometry: a detail whose midpoint lies inside a filled body is interior. The duotone accents that ran edge to edge, such as a card's stripe or a window's title bar, now stop short.
4. **Organic bodies.** A soft, natural, rounded or hand-held object takes its body from the curve kit. A rect or circle stays only for what truly is a box, a card, a screen or a disc. The kit gains five primitives for the objects the spike drew most often by hand:
   - `dome`: a loaf or bun, a flat base and a round top;
   - `sack`: a bag with a gathered neck;
   - `bubble`: a speech bubble with a tail;
   - `bell`: a bell with a flared lip;
   - `bust`: a person, head and shoulders.

   Beyond the kit, `blob` and free curves are allowed under the existing join and inflection rules, plus a new one: `bend`. A smooth curve's tightest radius is at least one stroke, or it reads as a kink at display size; a cusp is a corner on purpose and is not measured.
5. **Diagonal.** An elongated object (a wrench, a pen, a key, a rolling pin, a whisk, a stalk) may lie at 45°, lower-left to upper-right. `diagonal` counts the icons whose ink is elongated: principal axes at a ratio of 2 or more, the long axis within 10° of 45°. It refuses the icons past `round(0.3 × N)`, which is 3 of 10 and 2 of 6. It also refuses a diagonal running upper-left to lower-right.
6. **Equal mass.** Unchanged in rule; measured as now by weight and gravity. The sheet's new showcase view lets the eye check it on the whole set.
7. **Offset shadow, filled only.**
   - What it is: a copy of every element of the icon in the shade tone, offset (1.5, 1.5), behind everything, as `<g data-shadow transform="translate(1.5 1.5)">` first in the file.
   - Who adds it: the drawer never draws it. `shadow.mjs` adds or removes it, and `emit` copies files as they are.
   - How it is chosen: per set. At step 4 the sheet renders the set with and without it, and a fresh blind reader picks the better of the unlabelled pair. The person may overrule the pick. With nobody to ask, the reader's pick stands.
   - How it is measured: weight, gravity and contrast measure the icon without its shadow.
8. **Not changed.** The five tones, the inner shade and the contour hierarchy. The reads already in `read.md` and their pass marks. Colour stays out.

## Architecture

- **`presets.mjs`.**
  - Duotone strokes 1, 1.25, 1.5.
  - `AIR = 1.5`, `COUNTER = 2`, `LOOSE = 1`, `BEND = 1`, `DIAGONAL = { share: 0.3, ratio: 2, tol: 10 }`, `SHADOW = 1.5`.
  - The name at line 18 is replaced by "a reference set of forty icons".
- **`raster.mjs`.** `air(svgText, G, stroke)` renders the icon at 8 px per stroke on white, without its shadow, and returns the narrow regions as `{ area, at: [x, y] }` in grid units. It uses an exact Euclidean distance transform: opening the paper at radius `AIR/2` strokes for gaps, and `COUNTER/2` for enclosed paper. `elongation(svgText, G)` returns the ink's principal-axis ratio and angle.
- **`geometry.mjs`.** `interior(el, bodies)`: whether an unfilled element's midpoint lies inside a filled body. `clearance(el, body)`: the least edge-to-edge distance from the element to the body's contour.
- **`curve.mjs`.** `bend`: the minimum radius of curvature over each smooth cubic, sampled. It is refused under `BEND` strokes, cusps excepted. Its line prints the radius in grid units, so one stroke reads 1.5 at 48.
- **`measure.mjs` and `check.mjs`.** New lines, each in `rule  icon  measured → expected` form:
  - `air  oil  paper 1.1 strokes wide at 30.5, 22 → ≥ 1.5 apart, or touching`
  - `air  tyre  counter 1.6 strokes across at 24, 24 → ≥ 2 across`
  - `loose  billing  path@3 touches rect@1 → end it ≥ 1 stroke inside the contour`
  - `loose  billing  path@3 0.6 strokes from rect@1 → ≥ 1 stroke inside the contour`
  - `bend  pao  path@2 radius 0.9 at 14, 30 → ≥ 1.5, or a cusp`
  - `diagonal  set  4 of 10 on the diagonal (wrench, rolo, batedor, pen) → at most 3`
  - `diagonal  key  upper-left to lower-right → lower-left to upper-right`
  - `shadow  set  6 of 10 shadowed → all or none (shadow.mjs --on|--off)`
  - `shadow  tyre  path@4 not in the shadow → re-run shadow.mjs --on`
  - `shadow  billing  a shadow at the duotone finish → none`

  Gap's minimum moves to `AIR`. A shadowed icon is measured without its `data-shadow` group.
- **`shadow.mjs`** (new). `node shadow.mjs <folder> --on|--off`. With `--on`, it removes any old shadow group, copies every element into the shade tone (fills and strokes alike), and inserts the group first. It refuses the duotone finish.
- **`shapes.mjs`.** `dome`, `sack`, `bubble`, `bell` and `bust`, each with `--w --h --at --rot` like the rest. Each is clean for join, inflection and bend at every grid, and shaded at 48 like the others.
- **`sheet.mjs`.**
  - `--showcase` writes the set as one grid at its display size, for reading as a whole.
  - At the filled finish, `--shadow-pair` writes two blind sheets, with and without the shadow, under shuffled letters, and prints the key for the author only.
- **`read.md`.** The shadow read: when, its prompt, and that the pick stands unless the person overrules it.
- **`rules.md`.** Sections 03, 08 and 09 follow decisions 1 to 3. A new "11 · air" covers decision 2, the counter and the moves (drop a detail rather than squeeze it; open a counter). A new "12 · diagonal" covers decision 5. The bodies section names the five new primitives and when a rect or circle stays. "How check.mjs measures" gains air, loose, bend and diagonal. Every rejected line quoted is `check.mjs`'s own output.
- **`rules-filled.md`.** The same, as each reads at 48. 04 replaces "neither an offset shadow nor a white shine" with the per-set shadow and keeps "no white shine". A new "13 · shadow" says what it is, how it is added and how it is chosen. The name at line 178 is replaced by "a reference set of forty icons".
- **`SKILL.md`.**
  - Step 3 names the kit's soft bodies.
  - Step 4 gains the showcase look and, at the filled finish, the shadow read.
  - Step 5 says whether the set is shadowed.
  - "What goes wrong": the shadow row becomes "drawing a shadow by hand or adding a white shine" → `shadow.mjs`, never by hand; no shine. It gains three rows: squeezing a detail into a gap under 1.5 strokes (drop it instead); running a detail edge to edge inside a body (stop it a stroke short); drawing a rect where the object is soft (the kit).

## Redraws

- `examples/hairline`: the ten, on 16, at stroke 1, under every new rule. The reference ink is re-measured.
- `examples/garage`: the ten, on 48, under every new rule. Then the shadow read decides its shadow; the spike's reads favour it.
- `rules.md`'s worked house and `rules-filled.md`'s worked traffic light are redrawn where a new rule refuses them, and the tests built from their text follow.
- The `docs/superpowers/baselines/` sets are not touched.

Each example passes success items 2, 3 and 4. An example that fails after three rounds goes back to the person with what failed and the readers' words.

## The trial

Two fresh agents, the skill only, six new names each: one duotone at 16, one filled at 48. Each passes when `check.mjs` prints `ok` on run 1 or 2 and the blind read is 6 of 6, none by elimination. A failure is recorded with the rule that held it, for the person to judge.

## Testing

- `raster.test.mjs`:
  - `air` on two parallel lines 1 stroke apart reports one region between them; at 2 strokes apart, none.
  - A ring with a 1.5-stroke hole reports a counter; at 2.5, none.
  - `elongation` of a 45° line has a ratio over 2 and an angle of 45 ± 1.
- `geometry.test.mjs`: `interior` is true for a line inside a filled rect and false for a handle outside it. `clearance` gives the edge-to-edge distance.
- `curve.test.mjs`: a cubic with a 0.5 radius is refused by `bend`; a cusp is not measured; every kit primitive at every grid passes.
- `check.test.mjs` with fixtures:
  - an `oil` with a narrow band is refused by `air`;
  - a card with an edge-to-edge stripe is refused by `loose`;
  - a set of ten with four diagonals is refused, with three it passes;
  - a set with six of ten shadowed is refused;
  - a duotone icon with a shadow is refused;
  - a shadowed icon's weight equals its unshadowed weight.
- `shadow.test.mjs`: `--on` then `--off` restores the file byte for byte; `--on` twice is one group; the duotone finish is refused.
- `shapes.test.mjs`: the five new primitives print on the quarter grid at 16, 20, 24 and 48, and pass `check.mjs`'s curve lines.
- `sheet.test.mjs`: `--showcase` writes one image; `--shadow-pair` writes two and a key.
- `docs.test.mjs`: every rejected line quoted in `rules.md` and `rules-filled.md` is `check.mjs`'s output on the quoted input. The shadow-read prompt is in `read.md` word for word. The reference set's name appears in no file under `skills/pretty-icons/`; the test holds the name only as the SHA-256 of its lowercased form and compares every word against it, so the name is not written in the test either.
- `examples.test.mjs`: both examples print `ok`; `hairline` is at stroke 1.

## Publishing

Nothing is merged or pushed without the person's word. When the person decides to publish:

1. The reference set's name is replaced with "the external reference" in every doc under `docs/superpowers/`, including the 2026-10-08 baselines (an exception the person has allowed, for this one edit).
2. The work reaches `main` as one squash commit.
3. Neither `pretty-icons` nor `pretty-icons-polish` is pushed with its history.

The spike's comparison images stay in the session's scratchpad. They are never committed, published or shown in a shared page.

## Out of scope

- Colour.
- A shadow at the duotone finish.
- Any comparison with an outside set inside the skill.
- Redrawing the baseline sets.
- A per-icon beauty judgement beyond the reads.
